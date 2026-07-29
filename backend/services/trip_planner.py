"""Phase 5 — AI Trip Planner service.

Builds a structured trek plan using:
1. ML risk + budget estimates
2. Knowledge-base retrieval (same approach as chat)
3. Groq LLM for itinerary / permits / packing / etc.
4. Deterministic fallback template if Groq fails
"""

from __future__ import annotations

import json
import re
from typing import Any

import httpx
import sqlalchemy as sa
from sqlalchemy.orm import Session

from config import GROQ_API_KEY, GROQ_MODEL
from ml.predict import estimate_budget, predict_risk
import models


def _truncate(text: str, max_chars: int) -> str:
    if len(text) <= max_chars:
        return text
    return text[: max_chars - 1] + "…"


def retrieve_knowledge(db: Session, query: str, limit: int = 5) -> list[models.KnowledgeArticle]:
    if not query or len(query.strip()) < 3:
        return (
            db.query(models.KnowledgeArticle)
            .filter(models.KnowledgeArticle.is_published.is_(True))
            .order_by(models.KnowledgeArticle.title)
            .limit(limit)
            .all()
        )

    sql = sa.text(
        """
        SELECT ka.id
        FROM knowledge_articles ka
        WHERE ka.is_published = true
        ORDER BY ts_rank_cd(
            to_tsvector(
                'english',
                coalesce(ka.title,'') || ' ' || coalesce(ka.summary,'') || ' ' || coalesce(ka.content,'')
            ),
            plainto_tsquery('english', :q)
        ) DESC
        LIMIT :limit
        """
    )
    rows = db.execute(sql, {"q": query, "limit": limit}).mappings().all()
    ids = [r["id"] for r in rows]
    if not ids:
        return (
            db.query(models.KnowledgeArticle)
            .filter(models.KnowledgeArticle.is_published.is_(True))
            .order_by(models.KnowledgeArticle.title)
            .limit(limit)
            .all()
        )
    articles = (
        db.query(models.KnowledgeArticle)
        .filter(models.KnowledgeArticle.id.in_(ids))
        .all()
    )
    order = {aid: i for i, aid in enumerate(ids)}
    articles.sort(key=lambda a: order.get(a.id, 999))
    return articles


def fallback_plan(
    destination: str,
    duration_days: int,
    season: str,
    experience_level: str,
    difficulty: str,
    budget: dict[str, float],
    risk_level: str,
) -> dict[str, Any]:
    """Rule-based plan so the feature still works if Groq is down."""
    days = max(1, int(duration_days))
    itinerary = []
    for day in range(1, days + 1):
        if day == 1:
            title = "Arrive and acclimatize"
            desc = f"Travel toward the {destination} trailhead, check permits, and rest."
        elif day == days:
            title = "Return and buffer day"
            desc = "Descend or return to town. Keep this day flexible for weather delays."
        elif day == 2 and days > 4:
            title = "Acclimatization hike"
            desc = "Short hike above sleeping altitude, then return to lodge (climb high, sleep low)."
        else:
            title = f"Trek day {day}"
            desc = f"Continue on the {destination} route. Steady pace, hydrate, watch for altitude symptoms."
        itinerary.append({"day": day, "title": title, "description": desc})

    return {
        "title": f"{destination} trip plan",
        "summary": (
            f"A {days}-day {difficulty.lower()} plan for a {experience_level.lower()} trekker "
            f"in {season}. Estimated risk: {risk_level}."
        ),
        "itinerary": itinerary,
        "budget": {
            **budget,
            "notes": "Estimate includes lodging, food, permits, and local transport. Flights extra.",
        },
        "permits": [
            "TIMS card (Trekkers' Information Management System)",
            "Relevant national park / conservation area permit",
            "Carry passport copies and passport-size photos",
        ],
        "packing_list": [
            "Broken-in waterproof boots",
            "Layered clothing + rain shell",
            "Sleeping bag rated for expected night temps",
            "Water purification / bottles",
            "Headlamp + power bank",
            "First-aid kit and personal meds",
            "Sun protection (hat, SPF, sunglasses)",
        ],
        "transport": [
            "International or domestic flight into Kathmandu / Pokhara as needed",
            "Local jeep / bus to trailhead",
            "Optional domestic flight (e.g. Lukla) depending on route",
        ],
        "accommodations": [
            "Kathmandu/Pokhara hotel for arrival and buffer nights",
            "Teahouse lodges along the trail (shared rooms common)",
            "Book arrival hotel in advance in peak season",
        ],
        "preparation_schedule": [
            {
                "when": "4–6 weeks before",
                "tasks": [
                    "Book flights and arrival hotel",
                    "Start cardio + hiking fitness",
                    "Check passport validity",
                ],
            },
            {
                "when": "2 weeks before",
                "tasks": [
                    "Confirm permits / agency booking",
                    "Buy or rent remaining gear",
                    "Discuss altitude medication with a doctor if needed",
                ],
            },
            {
                "when": "3 days before",
                "tasks": [
                    "Pack and weigh bags",
                    "Download offline maps / save emergency contacts",
                    "Share itinerary with someone at home",
                ],
            },
        ],
        "knowledge_sources": [],
    }


async def _call_groq(messages: list[dict[str, Any]]) -> str:
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY missing")

    async with httpx.AsyncClient(timeout=90.0) as client:
        resp = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
            json={
                "model": GROQ_MODEL,
                "messages": messages,
                "temperature": 0.3,
                "max_tokens": 2500,
                "response_format": {"type": "json_object"},
            },
        )
    if resp.status_code >= 400:
        raise RuntimeError(f"Groq error {resp.status_code}: {resp.text[:300]}")
    return resp.json()["choices"][0]["message"]["content"]


def _extract_json(text: str) -> dict[str, Any]:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, flags=re.DOTALL)
        if not match:
            raise
        return json.loads(match.group(0))


async def generate_trip_plan(
    db: Session,
    *,
    destination: str,
    duration_days: int,
    season: str,
    experience_level: str,
    difficulty: str,
    altitude: int,
) -> tuple[dict[str, Any], str, str]:
    """
    Returns (plan_dict, risk_level, source) where source is 'ai' or 'fallback'.
    """
    risk_level, _risk_source = predict_risk(
        altitude, experience_level, difficulty, season, duration_days
    )
    budget, _budget_source = estimate_budget(
        altitude, experience_level, difficulty, season, duration_days
    )

    query = f"{destination} trek {season} permits packing safety"
    articles = retrieve_knowledge(db, query, limit=5)
    context = "\n\n".join(
        [
            f"[{i}] {a.title} ({a.category})\n{a.summary}\n{_truncate(a.content, 1200)}"
            for i, a in enumerate(articles, start=1)
        ]
    )
    sources = [a.slug for a in articles]

    system = (
        "You are TrekPal's trip planner for Himalayan treks. "
        "Return ONLY valid JSON (no markdown) with this exact shape:\n"
        "{"
        '"title": string, '
        '"summary": string, '
        '"itinerary": [{"day": number, "title": string, "description": string}], '
        '"budget": {"low_usd": number, "mid_usd": number, "high_usd": number, "notes": string}, '
        '"permits": [string], '
        '"packing_list": [string], '
        '"transport": [string], '
        '"accommodations": [string], '
        '"preparation_schedule": [{"when": string, "tasks": [string]}]'
        "}. "
        "Use CONTEXT when available. Keep advice safe and practical. "
        f"Use about {duration_days} itinerary days. "
        f"Budget mid should be near {budget['mid_usd']} USD unless context clearly differs."
    )
    user = (
        f"Destination: {destination}\n"
        f"Duration days: {duration_days}\n"
        f"Season: {season}\n"
        f"Experience: {experience_level}\n"
        f"Difficulty: {difficulty}\n"
        f"Target altitude (m): {altitude}\n"
        f"ML risk level: {risk_level}\n"
        f"ML budget estimate USD: {budget}\n\n"
        f"CONTEXT:\n{context or 'No articles found.'}"
    )

    try:
        raw = await _call_groq(
            [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ]
        )
        plan = _extract_json(raw)
        # Ensure required keys exist; fill gaps from fallback
        base = fallback_plan(
            destination, duration_days, season, experience_level, difficulty, budget, risk_level
        )
        for key in base:
            if key not in plan or plan[key] in (None, "", []):
                plan[key] = base[key]
        # Prefer ML budget numbers if model omitted them
        if not isinstance(plan.get("budget"), dict):
            plan["budget"] = base["budget"]
        else:
            for k in ("low_usd", "mid_usd", "high_usd"):
                if k not in plan["budget"]:
                    plan["budget"][k] = budget[k]
        plan["knowledge_sources"] = sources
        return plan, risk_level, "ai"
    except Exception as exc:
        print(f"[trip_planner] Falling back to template plan: {exc}")
        plan = fallback_plan(
            destination, duration_days, season, experience_level, difficulty, budget, risk_level
        )
        plan["knowledge_sources"] = sources
        return plan, risk_level, "fallback"
