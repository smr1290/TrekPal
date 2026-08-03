from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db import get_db
from schemas import TrekListItem
import models

router = APIRouter()


@router.get("/list", response_model=list[TrekListItem])
def list_treks(db: Session = Depends(get_db)):
    treks = db.query(models.Trek).all()

    return [
        TrekListItem(
            id=t.id,
            trek_name=t.trek_name,
            max_altitude=t.max_altitude,
            duration_days=t.typical_duration,
            difficulty=t.difficulty,
            image_url=getattr(t, "image_url", None),
            image_credit=getattr(t, "image_credit", None),
        )
        for t in treks
    ]
