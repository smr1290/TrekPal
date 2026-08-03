from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db import get_db
from ownership import owned_history
from schemas import HistoryDetailResponse, HistoryListItem, RecommendedGearItem
from security import get_current_user
from ml.gear_recommend import recommend_gear_picks
import models

router = APIRouter()


def _history_title(history: models.UserTrekHistory) -> str:
    destination = (getattr(history, "destination", None) or "").strip()
    if destination:
        return destination
    return history.trek_type or "Trek preparation"


def _enrich_saved_gear(
    db: Session,
    history: models.UserTrekHistory,
) -> list[RecommendedGearItem]:
    """Rebuild priority/reason for saved gear using the current recommender."""
    gear_maps = (
        db.query(models.TrekGearRecommendation)
        .filter(models.TrekGearRecommendation.history_id == history.id)
        .all()
    )
    if not gear_maps:
        return []

    picks = recommend_gear_picks(
        db,
        altitude=history.input_altitude or 3000,
        experience=history.experience_level or "Beginner",
        trek_type=history.trek_type or "Moderate",
        season=history.season or "Autumn",
        duration=history.planned_duration or 7,
        risk=history.risk_level or "Moderate",
        destination=getattr(history, "destination", None),
    )
    pick_by_id = {pick.gear.id: pick for pick in picks}

    items: list[RecommendedGearItem] = []
    for gm in gear_maps:
        gear = db.query(models.Gear).filter(models.Gear.id == gm.gear_id).first()
        if not gear:
            continue
        pick = pick_by_id.get(gear.id)
        items.append(
            RecommendedGearItem(
                gear_name=gear.gear_name,
                photo_url=gear.photo_url,
                category=gear.category,
                description=gear.description,
                priority=pick.priority if pick else None,
                reason=pick.reason if pick else None,
                quantity=pick.quantity if pick else getattr(gear, "quantity_hint", None),
                rent_hint=pick.rent_hint if pick else getattr(gear, "rent_hint", None),
                slug=getattr(gear, "slug", None),
            )
        )

    priority_rank = {"essential": 3, "recommended": 2, "optional": 1, None: 0}
    items.sort(key=lambda g: priority_rank.get(g.priority, 0), reverse=True)
    return items


@router.get("/history", response_model=list[HistoryListItem])
def get_user_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    histories = (
        db.query(models.UserTrekHistory)
        .filter(models.UserTrekHistory.user_id == current_user.id)
        .order_by(models.UserTrekHistory.created_at.desc())
        .all()
    )

    return [
        HistoryListItem(
            history_id=h.id,
            trek_name=_history_title(h),
            season=h.season,
            duration=h.planned_duration,
            risk_level=h.risk_level,
            date=h.created_at,
            input_altitude=h.input_altitude,
            destination=getattr(h, "destination", None),
            trek_type=h.trek_type,
        )
        for h in histories
    ]


@router.get("/history/{history_id}", response_model=HistoryDetailResponse)
def get_history_detail(
    history: models.UserTrekHistory = Depends(owned_history),
    db: Session = Depends(get_db),
):
    return HistoryDetailResponse(
        trek=_history_title(history),
        season=history.season,
        duration=history.planned_duration,
        risk_level=history.risk_level,
        input_altitude=history.input_altitude,
        date=history.created_at,
        destination=getattr(history, "destination", None),
        trek_type=history.trek_type,
        recommended_gear=_enrich_saved_gear(db, history),
    )


@router.delete("/history/{history_id}")
def delete_history(
    history: models.UserTrekHistory = Depends(owned_history),
    db: Session = Depends(get_db),
):
    """Remove a saved packing checklist owned by the current user."""
    history_id = history.id
    db.query(models.TrekGearRecommendation).filter(
        models.TrekGearRecommendation.history_id == history.id
    ).delete(synchronize_session=False)
    db.delete(history)
    db.commit()
    return {"ok": True, "deleted_id": history_id}
