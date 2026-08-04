from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db import get_db
from schemas import TrekListItem
import models

router = APIRouter()


@router.get("/list", response_model=list[TrekListItem])
def list_treks(db: Session = Depends(get_db)):
    treks = (
        db.query(models.Trek)
        .order_by(models.Trek.region.asc().nulls_last(), models.Trek.trek_name.asc())
        .all()
    )

    return [
        TrekListItem(
            id=t.id,
            trek_name=t.trek_name,
            max_altitude=t.max_altitude,
            duration_days=t.typical_duration,
            difficulty=t.difficulty,
            image_url=getattr(t, "image_url", None),
            image_credit=getattr(t, "image_credit", None),
            region=getattr(t, "region", None),
            summary=getattr(t, "summary", None),
            best_seasons=getattr(t, "best_seasons", None),
            highlights=getattr(t, "highlights", None),
        )
        for t in treks
    ]
