import os
from dotenv import dotenv_values, load_dotenv

load_dotenv()


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


DATABASE_URL = _env(
    "DATABASE_URL",
    "postgresql://postgres:root@localhost:5432/TrekPal",
)

APP_ENV = (_env("APP_ENV", "development") or "development").lower()
JWT_SECRET = _env("JWT_SECRET", "dev-only-change-me-in-production")
JWT_ALGORITHM = _env("JWT_ALGORITHM", "HS256") or "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(_env("ACCESS_TOKEN_EXPIRE_MINUTES", "1440") or "1440")

_WEAK_JWT_SECRETS = {
    "dev-only-change-me-in-production",
    "replace-with-a-long-random-secret",
    "secret",
    "changeme",
}

if APP_ENV not in {"development", "dev", "test", "local"}:
    if not JWT_SECRET or JWT_SECRET in _WEAK_JWT_SECRETS or len(JWT_SECRET) < 32:
        raise RuntimeError(
            "Refusing to start: set a strong JWT_SECRET (32+ chars) when APP_ENV "
            f"is '{APP_ENV}'. Weak/default secrets are only allowed in development."
        )

_cors = _env("CORS_ORIGINS", "http://localhost:3000") or "http://localhost:3000"
CORS_ORIGINS = [origin.strip() for origin in _cors.split(",") if origin.strip()]


# ---------- Groq AI (Phase 3) ----------

GROQ_API_KEY = _env("GROQ_API_KEY")
GROQ_MODEL = _env("GROQ_MODEL", "llama-3.3-70b-versatile") or "llama-3.3-70b-versatile"
