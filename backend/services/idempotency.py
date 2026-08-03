"""Idempotency helpers for prepare/generate (Phase 2 / R5)."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

import models

DEFAULT_WINDOW_SECONDS = 30


def find_recent_history(
    db: Session,
    *,
    user_id: int,
    destination: str | None,
    trek_type: str,
    altitude: int,
    season: str,
    duration: int,
    window_seconds: int = DEFAULT_WINDOW_SECONDS,
) -> models.UserTrekHistory | None:
    """Return a matching history row created within the dedupe window."""
    since = datetime.now(timezone.utc) - timedelta(seconds=window_seconds)
    dest = (destination or "").strip() or None
    q = (
        db.query(models.UserTrekHistory)
        .filter(
            models.UserTrekHistory.user_id == user_id,
            models.UserTrekHistory.trek_type == trek_type,
            models.UserTrekHistory.input_altitude == altitude,
            models.UserTrekHistory.season == season,
            models.UserTrekHistory.planned_duration == duration,
            models.UserTrekHistory.created_at >= since,
        )
        .order_by(models.UserTrekHistory.created_at.desc())
    )
    for row in q.limit(5).all():
        row_dest = (getattr(row, "destination", None) or "").strip() or None
        if row_dest == dest:
            return row
    return None


def find_recent_trip_plan(
    db: Session,
    *,
    user_id: int,
    destination: str,
    duration_days: int,
    season: str,
    difficulty: str,
    experience_level: str,
    window_seconds: int = DEFAULT_WINDOW_SECONDS,
) -> models.TripPlan | None:
    since = datetime.now(timezone.utc) - timedelta(seconds=window_seconds)
    dest = destination.strip()
    return (
        db.query(models.TripPlan)
        .filter(
            models.TripPlan.user_id == user_id,
            models.TripPlan.destination == dest,
            models.TripPlan.duration_days == duration_days,
            models.TripPlan.season == season,
            models.TripPlan.difficulty == difficulty,
            models.TripPlan.experience_level == experience_level,
            models.TripPlan.created_at >= since,
        )
        .order_by(models.TripPlan.created_at.desc())
        .first()
    )
