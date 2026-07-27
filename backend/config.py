import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:root@localhost:5432/TrekPal",
)

JWT_SECRET = os.getenv("JWT_SECRET", "dev-only-change-me-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 days

_cors = os.getenv("CORS_ORIGINS", "http://localhost:3000")
CORS_ORIGINS = [origin.strip() for origin in _cors.split(",") if origin.strip()]


# ---------- Groq AI (Phase 3) ----------

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
# Default model can be overridden in env.
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama3-70b-8192")
