"""Tiny in-memory rate limiter for expensive endpoints (e.g. Groq chat).

Good enough for a single API container. For multi-instance production, use Redis.
"""

from __future__ import annotations

import time
from collections import defaultdict, deque
from threading import Lock


class RateLimiter:
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


# 20 chat calls per user per hour — protects Groq spend from abuse.
chat_limiter = RateLimiter(max_calls=20, window_seconds=3600)
