from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS
from db import engine
import models
from routes import routers
from schemas import HealthResponse

app = FastAPI(title="TrekPal API")

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