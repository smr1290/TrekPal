"""S6 observability: Sentry (optional) + JSON request logging."""

from __future__ import annotations

import json
import logging
import os
import time
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from config import APP_ENV

logger = logging.getLogger("trekpal.request")

def configure_logging() -> None:
    """Railway/host logs: one JSON object per line for grep-friendly ops."""
    root = logging.getLogger()
    if root.handlers:
        return
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


def init_sentry() -> None:
    """No-op when SENTRY_DSN is unset — safe for local dev."""
    dsn = os.getenv("SENTRY_DSN", "").strip()
    if not dsn:
        return

    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.starlette import StarletteIntegration

    sentry_sdk.init(
        dsn=dsn,
        environment=APP_ENV,
        integrations=[
            StarletteIntegration(transaction_style="endpoint"),
            FastApiIntegration(transaction_style="endpoint"),
        ],
        traces_sample_rate=0.1,
        send_default_pii=False,
    )


def _safe_path(request: Request) -> str:
    return request.url.path


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Structured HTTP logs with route context — no JWT/cookie bodies."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        started = time.perf_counter()
        path = _safe_path(request)
        method = request.method

        try:
            response = await call_next(request)
            latency_ms = int((time.perf_counter() - started) * 1000)
            logger.info(
                json.dumps(
                    {
                        "event": "http_request",
                        "method": method,
                        "path": path,
                        "status": response.status_code,
                        "latency_ms": latency_ms,
                    },
                    default=str,
                )
            )
            return response
        except Exception as exc:
            latency_ms = int((time.perf_counter() - started) * 1000)
            logger.info(
                json.dumps(
                    {
                        "event": "http_request",
                        "method": method,
                        "path": path,
                        "status": 500,
                        "latency_ms": latency_ms,
                        "error_type": type(exc).__name__,
                    },
                    default=str,
                )
            )
            raise


def observability_test_routes_enabled() -> bool:
    flag = os.getenv("ENABLE_OBSERVABILITY_TEST_ROUTES", "false")
    return (flag or "false").lower() in {"1", "true", "yes"}
