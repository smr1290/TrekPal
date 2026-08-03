"""Chat rate limiting — Postgres-backed for multi-instance safety (R10).

Falls back to in-memory limiter only when DB ops fail (dev resilience).
"""

from __future__ import annotations

import os
import time
from collections import defaultdict, deque
from datetime import datetime, timezone
from threading import Lock

from sqlalchemy.orm import Session

import models

CHAT_RATE_LIMIT_PER_HOUR = int(os.getenv("CHAT_RATE_LIMIT_PER_HOUR", "20"))
WINDOW_SECONDS = 3600


class RateLimiter:
    """Legacy in-memory limiter (still used by unit tests)."""

    def __init__(self, max_calls: int, window_seconds: int) -> None:
        self.max_calls = max_calls
        self.window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        with self._lock:
            q = self._hits[key]
            while q and now - q[0] > self.window_seconds:
                q.popleft()
            if len(q) >= self.max_calls:
                return False
            q.append(now)
            return True


# Kept for tests / emergency fallback.
chat_limiter = RateLimiter(max_calls=CHAT_RATE_LIMIT_PER_HOUR, window_seconds=WINDOW_SECONDS)


def _hour_window_start(now: datetime | None = None) -> datetime:
    now = now or datetime.now(timezone.utc)
    return now.replace(minute=0, second=0, microsecond=0)


def allow_chat(db: Session, user_id: int) -> bool:
    """
    Upsert-and-check pattern on chat_rate_limits.

    Returns True if the call is allowed and increments the counter.
    """
    window_start = _hour_window_start()
    try:
        row = (
            db.query(models.ChatRateLimit)
            .filter(
                models.ChatRateLimit.user_id == user_id,
                models.ChatRateLimit.window_start == window_start,
            )
            .with_for_update()
            .first()
        )
        if row is None:
            row = models.ChatRateLimit(
                user_id=user_id,
                window_start=window_start,
                count=0,
            )
            db.add(row)
            db.flush()

        if row.count >= CHAT_RATE_LIMIT_PER_HOUR:
            db.rollback()
            return False

        row.count += 1
        db.commit()
        return True
    except Exception:
        db.rollback()
        # Dev/fallback if table missing (migration not applied yet).
        return chat_limiter.allow(f"user:{user_id}")
