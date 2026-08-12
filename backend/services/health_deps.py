"""Cheap dependency probes for /health/deps (S5). No secrets in responses."""

from __future__ import annotations

import httpx
import sqlalchemy as sa
from sqlalchemy.orm import Session

from config import GROQ_API_KEY

# Kathmandu — stable Open-Meteo probe coords (no user input).
_PROBE_LAT = 27.7172
_PROBE_LON = 85.3240
_PROBE_TIMEOUT = 5.0


def check_db(db: Session) -> tuple[str, str | None]:
    try:
        db.execute(sa.text("SELECT 1"))
        return "ok", None
    except Exception:
        return "error", "connection_failed"


async def check_groq() -> tuple[str, str | None]:
    if not GROQ_API_KEY:
        return "unconfigured", None
    try:
        async with httpx.AsyncClient(timeout=_PROBE_TIMEOUT) as client:
            resp = await client.get(
                "https://api.groq.com/openai/v1/models",
                headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
            )
        if resp.status_code == 200:
            return "ok", None
        return "error", f"http_{resp.status_code}"
    except httpx.HTTPError:
        return "error", "unreachable"


async def check_open_meteo() -> tuple[str, str | None]:
    try:
        async with httpx.AsyncClient(timeout=_PROBE_TIMEOUT) as client:
            resp = await client.get(
                "https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": _PROBE_LAT,
                    "longitude": _PROBE_LON,
                    "daily": "temperature_2m_max",
                    "forecast_days": 1,
                },
            )
        if resp.status_code == 200:
            return "ok", None
        return "error", f"http_{resp.status_code}"
    except httpx.HTTPError:
        return "error", "unreachable"


def overall_status(db_status: str, groq_status: str, meteo_status: str) -> str:
    if db_status != "ok":
        return "unhealthy"
    if groq_status != "ok" or meteo_status != "ok":
        return "degraded"
    return "ok"
