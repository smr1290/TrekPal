from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from config import CORS_ORIGINS
from db import engine, get_db
import models
from routes import routers
from schemas import DependencyStatus, HealthDepsResponse, HealthResponse
from services.health_deps import (
    check_db,
    check_groq,
    check_open_meteo,
    overall_status,
)
from services.observability import (
    RequestLoggingMiddleware,
    configure_logging,
    init_sentry,
    observability_test_routes_enabled,
)

configure_logging()
init_sentry()

app = FastAPI(title="TrekPal API")

app.add_middleware(RequestLoggingMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dev convenience: create missing tables if migrations were not run yet.
# Prefer: `alembic upgrade head` for schema changes going forward.
models.Base.metadata.create_all(bind=engine)

for router, prefix, tags in routers:
    app.include_router(router, prefix=prefix, tags=tags)


@app.get("/", response_model=HealthResponse)
def root():
    return HealthResponse(message="TrekPal API Running")


@app.get("/health/deps", response_model=HealthDepsResponse)
async def health_deps(db: Session = Depends(get_db)):
    """DB + Groq + Open-Meteo reachability — no secrets exposed."""
    db_status, db_detail = check_db(db)
    groq_status, groq_detail = await check_groq()
    meteo_status, meteo_detail = await check_open_meteo()
    return HealthDepsResponse(
        status=overall_status(db_status, groq_status, meteo_status),
        db=DependencyStatus(status=db_status, detail=db_detail),
        groq=DependencyStatus(status=groq_status, detail=groq_detail),
        open_meteo=DependencyStatus(status=meteo_status, detail=meteo_detail),
    )


@app.get("/health/test-error", include_in_schema=False)
def health_test_error():
    """
    S6: Intentional 500 for Sentry/uptime verification.

    Disabled unless ENABLE_OBSERVABILITY_TEST_ROUTES=true on the API host.
    """
    if not observability_test_routes_enabled():
        raise HTTPException(status_code=404, detail="Not found")
    raise RuntimeError("TrekPal observability test error (intentional — safe to ignore)")