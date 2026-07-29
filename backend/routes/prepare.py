from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from schemas import PrepareTrekRequest, PrepareTrekResponse, RecommendedGearItem
from security import get_current_user
from ml.predict import estimate_budget, predict_risk, recommend_treks
from ml.rules import recommend_gear
import models

router = APIRouter()


@router.post("/prepare-trek", response_model=PrepareTrekResponse)
def prepare_trek(
    payload: PrepareTrekRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trek_type = payload.trek_type
    experience_level = payload.experience_level
    altitude = payload.altitude
    season = payload.season
    duration = payload.duration

    valid_trek_types = ["Easy", "Moderate", "Hard"]
    valid_experience = ["Beginner", "Intermediate", "Advanced"]
    valid_seasons = ["Spring", "Summer", "Autumn", "Winter"]

    if trek_type not in valid_trek_types:
        raise HTTPException(status_code=400, detail="Invalid trek type")

    if experience_level not in valid_experience:
        raise HTTPException(status_code=400, detail="Invalid experience level")

    if season not in valid_seasons:
        raise HTTPException(status_code=400, detail="Invalid season")

    risk, risk_source = predict_risk(
        altitude, experience_level, trek_type, season, duration
    )
    budget, budget_source = estimate_budget(
        altitude, experience_level, trek_type, season, duration
    )
    trek_recs, recommend_source = recommend_treks(
        altitude,
        experience_level,
        trek_type,
        season,
        duration,
        db.query(models.Trek).all(),
        limit=3,
    )

    history = models.UserTrekHistory(
        user_id=current_user.id,
        trek_type=trek_type,
        experience_level=experience_level,
        input_altitude=altitude,
        season=season,
        planned_duration=duration,
        risk_level=risk,
    )

    db.add(history)
    db.commit()
    db.refresh(history)

    gears = recommend_gear(
        db=db,
        altitude=altitude,
        experience=experience_level,
        trek_type=trek_type,
        season=season,
        duration=duration,
        risk=risk,
    )

    for g in gears:
        mapping = models.TrekGearRecommendation(
            history_id=history.id,
            gear_id=g.id,
        )
        db.add(mapping)

    db.commit()

    return PrepareTrekResponse(
        risk_level=risk,
        risk_source=risk_source,
        budget_estimate=budget,
        budget_source=budget_source,
        recommended_treks=trek_recs,
        recommend_source=recommend_source,
        recommended_gear=[
            RecommendedGearItem(
                gear_name=g.gear_name,
                photo_url=g.photo_url,
                category=g.category,
                description=g.description,
            )
            for g in gears
        ],
    )
