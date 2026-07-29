"""Phase 5 — AI Trip Planner service.

Builds a structured trek plan using:
1. ML risk + budget estimates
2. Knowledge-base retrieval (same approach as chat)
3. Groq LLM for itinerary / permits / packing / etc.
4. Deterministic fallback template if Groq fails

Safety rules:
- Known high routes enforce minimum realistic durations (e.g. EBC is not 1 day).
- Permit advice depends on traveler type (Nepali citizen vs foreign visitor).
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

# Conservative minimums for well-known Nepal routes (round-trip style plans).
ROUTE_MIN_DAYS: list[tuple[tuple[str, ...], int, str]] = [
    (("everest base camp", "ebc", "kala patthar"), 12, "Everest Base Camp is typically 12–14 days with acclimatization."),
    (("annapurna circuit",), 12, "Annapurna Circuit is typically 12–18 days."),
    (("manaslu",), 14, "Manaslu Circuit is typically 14+ days."),
    (("upper mustang", "mustang"), 10, "Upper Mustang is typically 10+ days."),
    (("annapurna base camp", "abc", "annapurna sanctuary"), 7, "Annapurna Base Camp is typically 7–10 days."),
    (("langtang",), 7, "Langtang treks are typically 7–10 days."),
    (("gokyo",), 12, "Gokyo / high Khumbu routes usually need 12+ days."),
]


def _truncate(text: str, max_chars: int) -> str:
    if len(text) <= max_chars:
        return text
    return text[: max_chars - 1] + "…"


def normalize_traveler_type(traveler_type: str) -> str:
    value = (traveler_type or "").strip().lower()
    if value in {"nepali", "nepal", "local", "citizen", "nepalese"}:
        return "nepali"
    return "foreign"


def recommended_min_days(destination: str, altitude: int) -> tuple[int, str | None]:
    """Return (min_days, reason) for a destination / altitude."""
    dest = destination.lower()
    for keywords, minimum, reason in ROUTE_MIN_DAYS:
        if any(k in dest for k in keywords):
            return minimum, reason

    # Generic altitude safety floor when destination is unknown.
    if altitude >= 5000:
        return 10, "Treks above 5,000 m usually need 10+ days for safe ascent and descent."
    if altitude >= 4000:
        return 7, "Treks above 4,000 m usually need at least a week including acclimatization."
    if altitude >= 3000:
        return 4, "Multi-day high hills usually need several days; 1-day plans are rarely realistic."
    return 2, None


def resolve_duration(destination: str, altitude: int, requested_days: int) -> tuple[int, list[str]]:
    """Bump unrealistic short durations and collect user-facing warnings."""
    warnings: list[str] = []
    days = max(1, int(requested_days))
    minimum, reason = recommended_min_days(destination, altitude)

    if days < minimum:
        warnings.append(
            f"Requested {days} day(s) is too short for {destination}. "
            f"Adjusted to {minimum} days. {reason or ''}".strip()
        )
        days = minimum

    return days, warnings


def permits_for_traveler(traveler_type: str, destination: str) -> list[str]:
    """Nepal permit guidance differs for citizens vs foreign visitors."""
    if traveler_type == "nepali":
        return [
            "Nepali citizens generally do not need a TIMS card (that requirement is for foreign trekkers).",
            "You may still need a local national park / conservation area entry ticket depending on the route — "
            "confirm current citizen rates for the area you will enter "
            f"(e.g. Sagarmatha / Annapurna for {destination}).",
            "Carry a citizenship card / national ID; some checkpoints ask for it.",
            "Rules can change — verify with the park office or a local information center before you go.",
        ]

    return [
        "TIMS card (Trekkers' Information Management System) is usually required for foreign trekkers.",
        "Buy the relevant national park / conservation area permit "
        f"(for example Sagarmatha NP for EBC-area routes, ACAP for Annapurna).",
        "Apply through a registered agency or official counter; carry passport copies and photos.",
        "Permit fees and rules change — confirm current requirements before travel.",
    ]


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


def _build_itinerary(destination: str, days: int, traveler_type: str) -> list[dict[str, Any]]:
    itinerary: list[dict[str, Any]] = []
    permit_note = (
        "Confirm local park entry requirements if any."
        if traveler_type == "nepali"
        else "Confirm TIMS/park permits before the trail."
    )

    for day in range(1, days + 1):
        if day == 1:
            title = "Travel to trailhead / gateway"
            desc = (
                f"Reach the gateway for {destination} (e.g. Lukla, Nayapul, or roadhead). "
                f"Rest, hydrate, and prepare for the trek. {permit_note}"
            )
        elif day == 2 and days >= 8:
            title = "Begin trek + easy first stage"
            desc = "Short-to-moderate walking day. Keep pace easy; start altitude awareness early."
        elif day == 3 and days >= 10:
            title = "Acclimatization day"
            desc = "Climb high / sleep low if possible. Do not rush higher if you feel unwell."
        elif day == days - 1 and days >= 5:
            title = "High point / turnaround"
            desc = (
                f"Reach the highlight of {destination} if conditions and health allow, "
                "then begin a safe descent plan."
            )
        elif day == days:
            title = "Return + buffer"
            desc = "Descend to gateway / fly or drive out. Keep buffer time for weather delays."
        else:
            progress = day / max(days, 1)
            if progress < 0.45:
                title = f"Ascent stage (day {day})"
                desc = f"Continue toward higher lodges on the {destination} route. Steady pace, drink water."
            elif progress < 0.7:
                title = f"High trail stage (day {day})"
                desc = "Shorter walking hours preferred at altitude. Watch for AMS symptoms."
            else:
                title = f"Descent stage (day {day})"
                desc = "Descend carefully; knees and weather matter as much as ascent."
        itinerary.append({"day": day, "title": title, "description": desc})

    return itinerary


def fallback_plan(
    destination: str,
    duration_days: int,
    season: str,
    experience_level: str,
    difficulty: str,
    budget: dict[str, float],
    risk_level: str,
    traveler_type: str = "foreign",
    warnings: list[str] | None = None,
) -> dict[str, Any]:
    """Rule-based plan so the feature still works if Groq is down."""
    days = max(2, int(duration_days))
    traveler = normalize_traveler_type(traveler_type)
    who = "Nepali trekker" if traveler == "nepali" else "foreign trekker"

    budget_notes = (
        "Estimate focuses on lodging, food, local transport, and local entry fees where needed. "
        "Domestic flights (e.g. Lukla) are extra."
        if traveler == "nepali"
        else "Estimate includes lodging, food, foreigner permits, and local transport. International/domestic flights extra."
    )

    return {
        "title": f"{destination} trip plan",
        "summary": (
            f"A {days}-day {difficulty.lower()} plan for a {experience_level.lower()} {who} "
            f"in {season}. Estimated risk: {risk_level}."
        ),
        "itinerary": _build_itinerary(destination, days, traveler),
        "budget": {**budget, "notes": budget_notes},
        "permits": permits_for_traveler(traveler, destination),
        "packing_list": [
            "Broken-in waterproof boots",
            "Layered clothing + rain shell",
            "Sleeping bag rated for expected night temps",
            "Water purification / bottles",
            "Headlamp + power bank",
            "First-aid kit and personal meds",
            "Sun protection (hat, SPF, sunglasses)",
        ],
        "transport": (
            [
                "Bus / jeep from your city to the trail gateway",
                "Optional domestic flight only if needed for the route (e.g. Lukla)",
                "Local trailhead transport as required",
            ]
            if traveler == "nepali"
            else [
                "International arrival into Kathmandu (or Pokhara for Annapurna-area treks)",
                "Domestic flight or road transfer to trailhead",
                "Local jeep / bus as needed",
            ]
        ),
        "accommodations": [
            "Gateway-town hotel for arrival/buffer nights",
            "Teahouse lodges along the trail",
            "Book gateway lodging in peak season when possible",
        ],
        "preparation_schedule": [
            {
                "when": "4–6 weeks before",
                "tasks": [
                    "Build hiking fitness (cardio + long walks)",
                    "Plan time off around a realistic multi-day itinerary",
                    "Research current trail conditions for the season",
                ],
            },
            {
                "when": "2 weeks before",
                "tasks": [
                    "Confirm transport and lodging plans",
                    "Buy/rent remaining gear",
                    "Review altitude sickness signs and emergency options",
                ],
            },
            {
                "when": "3 days before",
                "tasks": [
                    "Pack and weigh bags",
                    "Save offline maps / emergency contacts",
                    "Share your itinerary with family/friends",
                ],
            },
        ],
        "warnings": warnings or [],
        "traveler_type": traveler,
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
                "temperature": 0.25,
                "max_tokens": 3500,
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


def _normalize_plan(
    plan: dict[str, Any],
    *,
    destination: str,
    duration_days: int,
    season: str,
    experience_level: str,
    difficulty: str,
    budget: dict[str, float],
    risk_level: str,
    traveler_type: str,
    warnings: list[str],
) -> dict[str, Any]:
    """Force safety invariants after AI output."""
    base = fallback_plan(
        destination,
        duration_days,
        season,
        experience_level,
        difficulty,
        budget,
        risk_level,
        traveler_type=traveler_type,
        warnings=warnings,
    )

    for key in base:
        if key not in plan or plan[key] in (None, "", []):
            plan[key] = base[key]

    # Always use traveler-aware permits (do not trust AI stereotypes).
    plan["permits"] = permits_for_traveler(traveler_type, destination)
    plan["traveler_type"] = traveler_type
    existing_warnings = plan.get("warnings") if isinstance(plan.get("warnings"), list) else []
    plan["warnings"] = list(dict.fromkeys([*(warnings or []), *existing_warnings]))

    itinerary = plan.get("itinerary")
    if not isinstance(itinerary, list) or len(itinerary) != duration_days:
        plan["itinerary"] = base["itinerary"]
        plan["warnings"] = list(
            dict.fromkeys(
                [
                    *plan["warnings"],
                    f"Itinerary was normalized to exactly {duration_days} realistic days.",
                ]
            )
        )
    else:
        # Ensure day numbers are sequential 1..N
        fixed = []
        for i, day in enumerate(itinerary, start=1):
            if not isinstance(day, dict):
                fixed = base["itinerary"]
                break
            fixed.append(
                {
                    "day": i,
                    "title": str(day.get("title") or f"Day {i}"),
                    "description": str(day.get("description") or ""),
                }
            )
        else:
            plan["itinerary"] = fixed

    if not isinstance(plan.get("budget"), dict):
        plan["budget"] = base["budget"]
    else:
        for k in ("low_usd", "mid_usd", "high_usd"):
            if k not in plan["budget"]:
                plan["budget"][k] = budget[k]
        if traveler_type == "nepali" and not plan["budget"].get("notes"):
            plan["budget"]["notes"] = base["budget"]["notes"]

    return plan


async def generate_trip_plan(
    db: Session,
    *,
    destination: str,
    duration_days: int,
    season: str,
    experience_level: str,
    difficulty: str,
    altitude: int,
    traveler_type: str = "foreign",
) -> tuple[dict[str, Any], str, str, int]:
    """
    Returns (plan_dict, risk_level, source, final_duration_days).
    """
    traveler = normalize_traveler_type(traveler_type)
    final_days, warnings = resolve_duration(destination, altitude, duration_days)

    risk_level, _risk_source = predict_risk(
        altitude, experience_level, difficulty, season, final_days
    )
    budget, _budget_source = estimate_budget(
        altitude, experience_level, difficulty, season, final_days
    )

    query = f"{destination} trek {season} packing safety altitude"
    articles = retrieve_knowledge(db, query, limit=5)
    context = "\n\n".join(
        [
            f"[{i}] {a.title} ({a.category})\n{a.summary}\n{_truncate(a.content, 1200)}"
            for i, a in enumerate(articles, start=1)
        ]
    )
    sources = [a.slug for a in articles]

    permit_rule = (
        "Traveler is a NEPALI CITIZEN. Do NOT recommend TIMS as required. "
        "Explain that TIMS is generally for foreign trekkers. Mention possible local park entry tickets "
        "and carrying citizenship/national ID. Never invent foreigner-only permit fees as mandatory."
        if traveler == "nepali"
        else "Traveler is a FOREIGN visitor. Include TIMS and relevant park/conservation permits."
    )

    system = (
        "You are TrekPal's trip planner for Himalayan treks in Nepal. "
        "Return ONLY valid JSON with this shape:\n"
        "{"
        '"title": string, '
        '"summary": string, '
        '"itinerary": [{"day": number, "title": string, "description": string}], '
        '"budget": {"low_usd": number, "mid_usd": number, "high_usd": number, "notes": string}, '
        '"permits": [string], '
        '"packing_list": [string], '
        '"transport": [string], '
        '"accommodations": [string], '
        '"preparation_schedule": [{"when": string, "tasks": [string]}], '
        '"warnings": [string]'
        "}. "
        "CRITICAL SAFETY RULES:\n"
        f"1) itinerary MUST contain EXACTLY {final_days} days (day 1..{final_days}). "
        "Never output a 1-day Everest Base Camp (or similar) plan.\n"
        "2) Include acclimatization logic for high altitude routes.\n"
        f"3) {permit_rule}\n"
        "4) Be practical for Nepal teahouse trekking.\n"
        f"5) Budget mid should be near {budget['mid_usd']} USD unless context clearly differs."
    )
    user = (
        f"Destination: {destination}\n"
        f"Final duration days (mandatory): {final_days}\n"
        f"Requested duration days: {duration_days}\n"
        f"Traveler type: {traveler}\n"
        f"Season: {season}\n"
        f"Experience: {experience_level}\n"
        f"Difficulty: {difficulty}\n"
        f"Target altitude (m): {altitude}\n"
        f"ML risk level: {risk_level}\n"
        f"ML budget estimate USD: {budget}\n"
        f"Duration warnings: {warnings or ['none']}\n\n"
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
        plan = _normalize_plan(
            plan,
            destination=destination,
            duration_days=final_days,
            season=season,
            experience_level=experience_level,
            difficulty=difficulty,
            budget=budget,
            risk_level=risk_level,
            traveler_type=traveler,
            warnings=warnings,
        )
        plan["knowledge_sources"] = sources
        return plan, risk_level, "ai", final_days
    except Exception as exc:
        print(f"[trip_planner] Falling back to template plan: {exc}")
        plan = fallback_plan(
            destination,
            final_days,
            season,
            experience_level,
            difficulty,
            budget,
            risk_level,
            traveler_type=traveler,
            warnings=warnings,
        )
        plan["knowledge_sources"] = sources
        return plan, risk_level, "fallback", final_days
