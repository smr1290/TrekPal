from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from ml.predict import estimate_budget, predict_difficulty, predict_risk, recommend_treks
from schemas import (
    BudgetEstimateResponse,
    DifficultyPredictionResponse,
    DifficultyRequest,
    MLFeatureRequest,
    MLInsightsResponse,
    RiskPredictionResponse,
    TrekRecommendationItem,
    TrekRecommendationResponse,
)
from security import get_current_user
import models

router = APIRouter()

VALID_TREK_TYPES = {"Easy", "Moderate", "Hard"}
VALID_EXPERIENCE = {"Beginner", "Intermediate", "Advanced"}
VALID_SEASONS = {"Spring", "Summer", "Autumn", "Winter"}


def _validate_features(payload: MLFeatureRequest) -> None:
    if payload.trek_type not in VALID_TREK_TYPES:
        raise HTTPException(status_code=400, detail="Invalid trek type")
    if payload.experience_level not in VALID_EXPERIENCE:
        raise HTTPException(status_code=400, detail="Invalid experience level")
    if payload.season not in VALID_SEASONS:
        raise HTTPException(status_code=400, detail="Invalid season")


@router.post("/risk", response_model=RiskPredictionResponse)
def ml_risk(
    payload: MLFeatureRequest,
    _current_user: models.User = Depends(get_current_user),
):
    """Internal estimate helper — requires auth; not mounted in production by default."""
    _validate_features(payload)
    risk, source = predict_risk(
        payload.altitude,
        payload.experience_level,
        payload.trek_type,
        payload.season,
        payload.duration,
    )
    return RiskPredictionResponse(risk_level=risk, source=source)


@router.post("/difficulty", response_model=DifficultyPredictionResponse)
def ml_difficulty(
    payload: DifficultyRequest,
    _current_user: models.User = Depends(get_current_user),
):
    if payload.season not in VALID_SEASONS:
        raise HTTPException(status_code=400, detail="Invalid season")
    difficulty, source = predict_difficulty(payload.altitude, payload.duration, payload.season)
    return DifficultyPredictionResponse(difficulty=difficulty, source=source)


@router.post("/budget", response_model=BudgetEstimateResponse)
def ml_budget(
    payload: MLFeatureRequest,
    _current_user: models.User = Depends(get_current_user),
):
    _validate_features(payload)
    budget, source = estimate_budget(
        payload.altitude,
        payload.experience_level,
        payload.trek_type,
        payload.season,
        payload.duration,
    )
    return BudgetEstimateResponse(
        low_usd=budget["low_usd"],
        mid_usd=budget["mid_usd"],
        high_usd=budget["high_usd"],
        source=source,
    )


@router.post("/recommend-treks", response_model=TrekRecommendationResponse)
def ml_recommend_treks(
    payload: MLFeatureRequest,
    db: Session = Depends(get_db),
    _current_user: models.User = Depends(get_current_user),
):
    _validate_features(payload)
    treks = db.query(models.Trek).all()
    recommendations, source = recommend_treks(
        payload.altitude,
        payload.experience_level,
        payload.trek_type,
        payload.season,
        payload.duration,
        treks,
        limit=3,
    )
    return TrekRecommendationResponse(
        recommendations=[TrekRecommendationItem(**r) for r in recommendations],
        source=source,
    )


@router.post("/insights", response_model=MLInsightsResponse)
def ml_insights(
    payload: MLFeatureRequest,
    db: Session = Depends(get_db),
    _current_user: models.User = Depends(get_current_user),
):
    """One call for prepare-page insights: risk, difficulty, budget, trek matches."""
    _validate_features(payload)

    risk, risk_source = predict_risk(
        payload.altitude,
        payload.experience_level,
        payload.trek_type,
        payload.season,
        payload.duration,
    )
    difficulty, difficulty_source = predict_difficulty(
        payload.altitude, payload.duration, payload.season
    )
    budget, budget_source = estimate_budget(
        payload.altitude,
        payload.experience_level,
        payload.trek_type,
        payload.season,
        payload.duration,
    )
    treks = db.query(models.Trek).all()
    recommendations, recommend_source = recommend_treks(
        payload.altitude,
        payload.experience_level,
        payload.trek_type,
        payload.season,
        payload.duration,
        treks,
        limit=3,
    )

    return MLInsightsResponse(
        risk_level=risk,
        risk_source=risk_source,
        difficulty=difficulty,
        difficulty_source=difficulty_source,
        budget=BudgetEstimateResponse(
            low_usd=budget["low_usd"],
            mid_usd=budget["mid_usd"],
            high_usd=budget["high_usd"],
            source=budget_source,
        ),
        recommended_treks=[TrekRecommendationItem(**r) for r in recommendations],
        recommend_source=recommend_source,
    )
