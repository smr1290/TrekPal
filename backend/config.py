"""TrekPal API configuration.

Loads from process env first, then backend/.env (empty Docker env_file
entries do not block file values — see `_env`).

Production (`APP_ENV=production`) refuses to start with weak secrets,
wildcard CORS, or internal ML enabled without an explicit override.
"""

from __future__ import annotations

import os

from dotenv import dotenv_values, load_dotenv

load_dotenv()

_DEV_ENVS = frozenset({"development", "dev", "test", "local"})

_WEAK_JWT_SECRETS = frozenset(
    {
        "dev-only-change-me-in-production",
        "replace-with-a-long-random-secret",
        "secret",
        "changeme",
        "jwt-secret",
        "your-secret-key",
    }
)


def _env(name: str, default: str | None = None) -> str | None:
    """
    Read config from environment, treating empty strings as missing.

    Why: Docker env_file can inject GROQ_API_KEY="" which would otherwise
    block values from backend/.env (load_dotenv does not override by default).
    """
    value = os.getenv(name)
    if value is not None and value.strip():
        return value.strip()

    file_value = dotenv_values().get(name)
    if file_value is not None and str(file_value).strip():
        return str(file_value).strip()

    return default


def is_production_env(app_env: str) -> bool:
    return app_env.lower() not in _DEV_ENVS


def validate_production_config(
    *,
    app_env: str,
    jwt_secret: str | None,
    cors_origins: list[str],
    enable_internal_ml: str | None,
    allow_internal_ml_override: str | None = None,
    database_url: str | None = None,
    auth_cookie_secure: bool | None = None,
) -> None:
    """
    Raise RuntimeError if production settings are unsafe.

    Called at import when APP_ENV is production-like. Kept pure for unit tests.
    """
    if not is_production_env(app_env):
        return

    errors: list[str] = []

    secret = (jwt_secret or "").strip()
    if not secret or secret in _WEAK_JWT_SECRETS or len(secret) < 32:
        errors.append(
            "JWT_SECRET must be a strong random value (32+ characters); "
            "defaults like 'replace-with-a-long-random-secret' are forbidden."
        )

    origins = [o.strip() for o in cors_origins if o and o.strip()]
    if not origins:
        errors.append("CORS_ORIGINS must list at least one explicit frontend origin.")
    if any(o == "*" for o in origins):
        errors.append(
            "CORS_ORIGINS must not be '*' in production (credentials + wildcard is unsafe)."
        )

    ml_flag = (enable_internal_ml or "false").lower()
    ml_on = ml_flag in {"1", "true", "yes"}
    override = (allow_internal_ml_override or "false").lower() in {"1", "true", "yes"}
    if ml_on and not override:
        errors.append(
            "ENABLE_INTERNAL_ML=true is blocked in production. "
            "Set ALLOW_INTERNAL_ML_IN_PRODUCTION=true only if you intentionally need /ml."
        )

    db = (database_url or "").strip().lower()
    if db and ("localhost" in db or "127.0.0.1" in db):
        errors.append(
            "DATABASE_URL points at localhost — production must use the hosted Postgres URL."
        )

    if auth_cookie_secure is False:
        errors.append(
            "AUTH_COOKIE_SECURE must be true (or unset) in production so session cookies "
            "are HTTPS-only."
        )

    if errors:
        bullet = "\n".join(f"  - {e}" for e in errors)
        raise RuntimeError(
            f"Refusing to start: APP_ENV='{app_env}' failed production safety checks:\n"
            f"{bullet}\n"
            "See docs/PRODUCTION_ENV.md"
        )


def internal_ml_routes_enabled(
    app_env: str | None = None,
    enable_flag: str | None = None,
    allow_override: str | None = None,
) -> bool:
    """
    Internal /ml estimate endpoints are for local debugging only.

    In development they stay on. In production they stay off unless
    ENABLE_INTERNAL_ML=true AND ALLOW_INTERNAL_ML_IN_PRODUCTION=true.
    """
    env = (app_env if app_env is not None else APP_ENV).lower()
    if env in _DEV_ENVS:
        return True
    flag = enable_flag if enable_flag is not None else _env("ENABLE_INTERNAL_ML", "false")
    enabled = (flag or "false").lower() in {"1", "true", "yes"}
    if not enabled:
        return False
    override = (
        allow_override
        if allow_override is not None
        else _env("ALLOW_INTERNAL_ML_IN_PRODUCTION", "false")
    )
    return (override or "false").lower() in {"1", "true", "yes"}


DATABASE_URL = _env(
    "DATABASE_URL",
    "postgresql://postgres:root@localhost:5432/TrekPal",
)

APP_ENV = (_env("APP_ENV", "development") or "development").lower()
JWT_SECRET = _env("JWT_SECRET", "dev-only-change-me-in-production")
JWT_ALGORITHM = _env("JWT_ALGORITHM", "HS256") or "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(_env("ACCESS_TOKEN_EXPIRE_MINUTES", "1440") or "1440")

_cors = _env("CORS_ORIGINS", "http://localhost:3000") or "http://localhost:3000"
CORS_ORIGINS = [origin.strip() for origin in _cors.split(",") if origin.strip()]

# httpOnly session cookie (M7). Browser sends it automatically with credentials: 'include'.
AUTH_COOKIE_NAME = _env("AUTH_COOKIE_NAME", "trekpal_access") or "trekpal_access"
_cookie_secure_override = _env("AUTH_COOKIE_SECURE")
if _cookie_secure_override is not None:
    AUTH_COOKIE_SECURE = _cookie_secure_override.lower() in {"1", "true", "yes"}
else:
    # Secure cookies require HTTPS. Local Docker/dev is HTTP, so keep Secure off there.
    AUTH_COOKIE_SECURE = is_production_env(APP_ENV)

# Chat rate limit (R10)
CHAT_RATE_LIMIT_PER_HOUR = int(_env("CHAT_RATE_LIMIT_PER_HOUR", "20") or "20")

# ---------- Groq AI ----------
GROQ_API_KEY = _env("GROQ_API_KEY")
GROQ_MODEL = _env("GROQ_MODEL", "llama-3.3-70b-versatile") or "llama-3.3-70b-versatile"

validate_production_config(
    app_env=APP_ENV,
    jwt_secret=JWT_SECRET,
    cors_origins=CORS_ORIGINS,
    enable_internal_ml=_env("ENABLE_INTERNAL_ML", "false"),
    allow_internal_ml_override=_env("ALLOW_INTERNAL_ML_IN_PRODUCTION", "false"),
    database_url=DATABASE_URL,
    auth_cookie_secure=AUTH_COOKIE_SECURE,
)

ENABLE_INTERNAL_ML_ROUTES = internal_ml_routes_enabled()
