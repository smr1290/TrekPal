from __future__ import annotations

import os
from typing import Any

import httpx
import sqlalchemy as sa
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from db import get_db
from config import GROQ_API_KEY, GROQ_MODEL
import models
from schemas import ChatRequest, ChatResponse, ChatSource
from security import get_current_user
from services.rate_limit import CHAT_RATE_LIMIT_PER_HOUR, allow_chat


router = APIRouter()


def _truncate(text: str, max_chars: int) -> str:
    if len(text) <= max_chars:
        return text
    return text[: max_chars - 1] + "…"


def _retrieve_relevant_articles(db: Session, query: str, limit: int = 4) -> list[models.KnowledgeArticle]:
    """
    Phase 3 MVP retrieval: Postgres full-text search over knowledge_articles.

    Later we can upgrade this to true embeddings/vector search for better semantic matching.
    """
    # If the query is empty/too short, skip ranking and just return a few published articles.
    if not query or len(query.strip()) < 3:
        return (
            db.query(models.KnowledgeArticle)
            .filter(models.KnowledgeArticle.is_published.is_(True))
            .order_by(models.KnowledgeArticle.title)
            .limit(limit)
            .all()
        )

    # Use Postgres FTS. This keeps Phase 3 working without adding embeddings infrastructure yet.
    sql = sa.text(
        """
        SELECT
            ka.*
        FROM knowledge_articles ka
        WHERE ka.is_published = true
        ORDER BY
            ts_rank_cd(
                to_tsvector('english', coalesce(ka.title,'') || ' ' || coalesce(ka.summary,'') || ' ' || coalesce(ka.content,'')),
                plainto_tsquery('english', :q)
            ) DESC
        LIMIT :limit
        """
    )
    rows = db.execute(sql, {"q": query, "limit": limit}).mappings().all()
    if rows:
        # Map SQL rows back into ORM instances.
        # (We don't use `from_statement` to keep dependencies minimal.)
        article_ids = [r["id"] for r in rows if "id" in r]
        return (
            db.query(models.KnowledgeArticle)
            .filter(models.KnowledgeArticle.id.in_(article_ids))
            .order_by(sa.case({aid: i for i, aid in enumerate(article_ids)}, value=models.KnowledgeArticle.id))
            .all()
        )

    return (
        db.query(models.KnowledgeArticle)
        .filter(models.KnowledgeArticle.is_published.is_(True))
        .order_by(models.KnowledgeArticle.title)
        .limit(limit)
        .all()
    )


def _build_prompt(message: str, articles: list[models.KnowledgeArticle]) -> list[dict[str, Any]]:
    context_blocks: list[str] = []
    for idx, a in enumerate(articles, start=1):
        context_blocks.append(
            "\n".join(
                [
                    f"[{idx}] {a.title} (category: {a.category})",
                    f"Summary: {a.summary}",
                    "",
                    "Content:",
                    _truncate(a.content or "", 2500),
                ]
            )
        )

    context = "\n\n".join(context_blocks).strip()

    system = (
        "You are TrekPal, a trekking assistant. Answer using ONLY the provided CONTEXT articles. "
        "If the answer isn't clearly supported by the context, say: "
        "\"I don't have enough information in the TrekPal knowledge base to answer that.\" "
        "Keep answers practical, safe, and easy to follow."
    )

    user = (
        f"User question:\n{message}\n\n"
        f"CONTEXT articles:\n{context}\n\n"
        "Answer:"
    )

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]


async def _call_groq_chat(messages: list[dict[str, Any]]) -> str:
    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not configured. Add it to backend/.env (or set env var in Docker).",
        )

    url = "https://api.groq.com/openai/v1/chat/completions"
    payload: dict[str, Any] = {
        "model": GROQ_MODEL,
        "messages": messages,
        "temperature": 0.2,
        "max_tokens": 800,
    }

    headers = {"Authorization": f"Bearer {GROQ_API_KEY}"}

    from services.ext_logging import log_external_call

    with log_external_call("groq", "chat", user_id=None, route="/chat/ask"):
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, headers=headers, json=payload)

        if resp.status_code >= 400:
            detail = "Groq API error. Check model name and API key."
            try:
                err = resp.json()
                msg = err.get("error", {}).get("message") if isinstance(err, dict) else None
                if msg:
                    detail = f"Groq API error: {msg}"
            except Exception:
                pass
            raise HTTPException(status_code=502, detail=detail)

        data = resp.json()
        try:
            return data["choices"][0]["message"]["content"]
        except Exception:
            raise HTTPException(status_code=502, detail="Groq response format unexpected.")


@router.post("/ask", response_model=ChatResponse)
async def ask_chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    message = (payload.message or "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="message is required")

    if not allow_chat(db, current_user.id):
        raise HTTPException(
            status_code=429,
            detail=(
                f"Chat rate limit exceeded ({CHAT_RATE_LIMIT_PER_HOUR} questions per hour). "
                "Try again later."
            ),
        )

    articles = _retrieve_relevant_articles(db, message, limit=4)
    prompt_messages = _build_prompt(message, articles)
    answer = await _call_groq_chat(prompt_messages)

    sources = [ChatSource(slug=a.slug, title=a.title) for a in articles]
    return ChatResponse(result={"answer": answer, "sources": sources})

