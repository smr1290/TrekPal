from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from schemas import HistoryDetailResponse, HistoryListItem, RecommendedGearItem
from security import get_current_user
import models

router = APIRouter()


def _get_trek_from_history(db: Session, history_obj):
    trek_rel = getattr(history_obj, "trek", None)
    if trek_rel is not None and hasattr(trek_rel, "id"):
        return trek_rel

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


@router.get("/history", response_model=list[HistoryListItem])
def get_user_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    histories = (
        db.query(models.UserTrekHistory)
        .filter(models.UserTrekHistory.user_id == current_user.id)
        .all()
    )

    result: list[HistoryListItem] = []
    for h in histories:
        trek = _get_trek_from_history(db, h)
        result.append(
            HistoryListItem(
                history_id=h.id,
                trek_name=trek.trek_name if trek else h.trek_type,
                season=h.season,
                duration=h.planned_duration,
                risk_level=h.risk_level,
                date=h.created_at,
                input_altitude=h.input_altitude,
            )
        )

    return result


@router.get("/history/{history_id}", response_model=HistoryDetailResponse)
def get_history_detail(
    history_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    history = (
        db.query(models.UserTrekHistory)
        .filter(
            models.UserTrekHistory.id == history_id,
            models.UserTrekHistory.user_id == current_user.id,
        )
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

    gear_list: list[RecommendedGearItem] = []
    for gm in gear_maps:
        gear = db.query(models.Gear).filter(models.Gear.id == gm.gear_id).first()
        if gear:
            gear_list.append(
                RecommendedGearItem(
                    gear_name=gear.gear_name,
                    photo_url=gear.photo_url,
                    category=gear.category,
                    description=gear.description,
                )
            )

    return HistoryDetailResponse(
        trek=trek.trek_name if trek else history.trek_type,
        season=history.season,
        duration=history.planned_duration,
        risk_level=history.risk_level,
        input_altitude=history.input_altitude,
        date=history.created_at,
        recommended_gear=gear_list,
    )
