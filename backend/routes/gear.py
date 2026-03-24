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


# ---------------- List All Gear ----------------
@router.get("/")
def list_gear(db: Session = Depends(get_db)):

    gear_items = db.query(models.Gear).all()

    return [
        {
            "id": g.id,
            "gear_name": g.gear_name,
            "category": g.category,
            "photo_url": g.photo_url,
            "description": g.description
        }
        for g in gear_items
    ]