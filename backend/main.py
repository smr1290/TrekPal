from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import engine
import models
from routes import routers

app = FastAPI(title="TrekPal API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Create tables
models.Base.metadata.create_all(bind=engine)

# Register all routers from routes/__init__.py
for router, prefix, tags in routers:
    app.include_router(router, prefix=prefix, tags=tags)


@app.get("/")
def root():
    return {"message": "TrekPal API Running"}