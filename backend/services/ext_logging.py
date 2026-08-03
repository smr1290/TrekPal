"""Structured logging for external dependencies (Phase 2 / R11)."""

from __future__ import annotations

import json
import logging
import time
from contextlib import contextmanager
from typing import Any, Iterator

logger = logging.getLogger("trekpal.external")


def _emit(event: str, **fields: Any) -> None:
    payload = {"event": event, **{k: v for k, v in fields.items() if v is not None}}
    logger.info(json.dumps(payload, default=str))


@contextmanager
def log_external_call(
    service: str,
    operation: str,
    *,
    user_id: int | None = None,
    route: str | None = None,
    extra: dict[str, Any] | None = None,
) -> Iterator[dict[str, Any]]:
    """
    Time an external call and log success/failure as one JSON line.

    Usage:
        with log_external_call("groq", "chat", user_id=1, route="/chat/ask") as ctx:
            ...
            ctx["fallback"] = True  # optional
    """
    ctx: dict[str, Any] = {"fallback": False}
    started = time.perf_counter()
    try:
        yield ctx
        latency_ms = int((time.perf_counter() - started) * 1000)
        _emit(
            "external_call",
            service=service,
            operation=operation,
            status="ok",
            latency_ms=latency_ms,
            user_id=user_id,
            route=route,
            fallback=bool(ctx.get("fallback")),
            **(extra or {}),
            **{k: v for k, v in ctx.items() if k not in {"fallback"}},
        )
    except Exception as exc:
        latency_ms = int((time.perf_counter() - started) * 1000)
        _emit(
            "external_call",
            service=service,
            operation=operation,
            status="error",
            latency_ms=latency_ms,
            user_id=user_id,
            route=route,
            error_type=type(exc).__name__,
            error=str(exc)[:240],
            fallback=bool(ctx.get("fallback")),
            **(extra or {}),
        )
        raise
