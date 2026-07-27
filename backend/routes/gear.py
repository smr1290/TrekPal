from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db import get_db
from schemas import GearListItem
import models

router = APIRouter()


@router.get("/", response_model=list[GearListItem])
def list_gear(db: Session = Depends(get_db)):
    gear_items = db.query(models.Gear).all()

    return [
        GearListItem(
            id=g.id,
            gear_name=g.gear_name,
            category=g.category,
            photo_url=g.photo_url,
            description=g.description,
        )
        for g in gear_items
    ]
