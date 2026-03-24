from fastapi import APIRouter, Depends, HTTPException
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


# Helper: safely get trek object from a history row (handles trek_id / trekId / relationship)
def _get_trek_from_history(db: Session, history_obj):
    # 1) If you have a relationship like: trek = relationship("Trek")
    trek_rel = getattr(history_obj, "trek", None)
    if trek_rel is not None and hasattr(trek_rel, "id"):
        return trek_rel

    # 2) Otherwise try common FK field names
    possible_fk_fields = [
        "trek_id",
        "trekId",
        "trekID",
        "trek_plan_id",
        "trek_planId",
        "trek_fk",
        "trek_fk_id",
    ]

    trek_id = None
    for field in possible_fk_fields:
        if hasattr(history_obj, field):
            trek_id = getattr(history_obj, field)
            break

    if trek_id is None:
        return None

    return db.query(models.Trek).filter(models.Trek.id == trek_id).first()


# ---------------- User Trek History ----------------
@router.get("/history")
def get_user_history(user_id: int, db: Session = Depends(get_db)):
    histories = (
        db.query(models.UserTrekHistory)
        .filter(models.UserTrekHistory.user_id == user_id)
        .all()
    )

    result = []
    for h in histories:
        trek = _get_trek_from_history(db, h)

        result.append({
            "history_id": h.id,
            "trek_name": trek.trek_name if trek else "Unknown",
            "season": h.season,
            "duration": h.planned_duration,
            "risk_level": h.risk_level,
            "date": h.created_at
        })

    return result


# ---------------- Single History Detail ----------------
@router.get("/history/{history_id}")
def get_history_detail(history_id: int, db: Session = Depends(get_db)):
    history = (
        db.query(models.UserTrekHistory)
        .filter(models.UserTrekHistory.id == history_id)
        .first()
    )

    if not history:
        raise HTTPException(status_code=404, detail="History not found")

    trek = _get_trek_from_history(db, history)

    gear_maps = (
        db.query(models.TrekGearRecommendation)
        .filter(models.TrekGearRecommendation.history_id == history.id)
        .all()
    )

    gear_list = []
    for gm in gear_maps:
        gear = db.query(models.Gear).filter(models.Gear.id == gm.gear_id).first()
        if gear:
            gear_list.append({
                "gear_name": gear.gear_name,
                "photo_url": gear.photo_url,
                "category": gear.category
            })

    return {
        "trek": trek.trek_name if trek else "Unknown",
        "season": history.season,
        "duration": history.planned_duration,
        "risk_level": history.risk_level,
        "recommended_gear": gear_list
    }
