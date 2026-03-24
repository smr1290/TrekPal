from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db import SessionLocal
import models

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- List All Treks ----------------
@router.get("/list")
def list_treks(db: Session = Depends(get_db)):

    treks = db.query(models.Trek).all()

    return [
        {
            "id": t.id,
            "trek_name": t.trek_name,
            "max_altitude": t.max_altitude,
            "duration_days": t.typical_duration,
            "difficulty": t.difficulty
        }
        for t in treks
    ]