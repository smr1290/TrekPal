import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from schemas import TripPlanDetail, TripPlanGenerateRequest, TripPlanListItem
from security import get_current_user
from services.trip_planner import generate_trip_plan
import models

router = APIRouter()

VALID_DIFFICULTY = {"Easy", "Moderate", "Hard"}
VALID_EXPERIENCE = {"Beginner", "Intermediate", "Advanced"}
VALID_SEASONS = {"Spring", "Summer", "Autumn", "Winter"}
VALID_TRAVELER_TYPES = {"nepali", "foreign"}


@router.post("/generate", response_model=TripPlanDetail)
async def generate_plan(
    payload: TripPlanGenerateRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.difficulty not in VALID_DIFFICULTY:
        raise HTTPException(status_code=400, detail="Invalid difficulty")
    if payload.experience_level not in VALID_EXPERIENCE:
        raise HTTPException(status_code=400, detail="Invalid experience level")
    if payload.season not in VALID_SEASONS:
        raise HTTPException(status_code=400, detail="Invalid season")

    traveler_type = (payload.traveler_type or "foreign").strip().lower()
    if traveler_type in {"nepal", "local", "citizen", "nepalese"}:
        traveler_type = "nepali"
    if traveler_type not in VALID_TRAVELER_TYPES:
        raise HTTPException(status_code=400, detail="Invalid traveler_type (use nepali or foreign)")

    trek_id = payload.trek_id
    if trek_id is not None:
        trek = db.query(models.Trek).filter(models.Trek.id == trek_id).first()
        if not trek:
            raise HTTPException(status_code=404, detail="Trek not found")

    plan, risk_level, source, final_days = await generate_trip_plan(
        db,
        destination=payload.destination.strip(),
        duration_days=payload.duration_days,
        season=payload.season,
        experience_level=payload.experience_level,
        difficulty=payload.difficulty,
        altitude=payload.altitude,
        traveler_type=traveler_type,
    )

    title = str(plan.get("title") or f"{payload.destination} trip plan")[:200]

    row = models.TripPlan(
        user_id=current_user.id,
        trek_id=trek_id,
        title=title,
        destination=payload.destination.strip(),
        season=payload.season,
        duration_days=final_days,
        experience_level=payload.experience_level,
        difficulty=payload.difficulty,
        risk_level=risk_level,
        plan_json=json.dumps(plan),
        source=source,
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    return TripPlanDetail(
        id=row.id,
        title=row.title,
        destination=row.destination,
        season=row.season,
        duration_days=row.duration_days,
        experience_level=row.experience_level,
        difficulty=row.difficulty,
        risk_level=row.risk_level,
        source=row.source,
        plan=plan,
        created_at=row.created_at,
    )


@router.get("/", response_model=list[TripPlanListItem])
def list_plans(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.TripPlan)
        .filter(models.TripPlan.user_id == current_user.id)
        .order_by(models.TripPlan.created_at.desc())
        .all()
    )
    return [
        TripPlanListItem(
            id=r.id,
            title=r.title,
            destination=r.destination,
            season=r.season,
            duration_days=r.duration_days,
            experience_level=r.experience_level,
            difficulty=r.difficulty,
            risk_level=r.risk_level,
            source=r.source,
            created_at=r.created_at,
        )
        for r in rows
    ]


@router.get("/{plan_id}", response_model=TripPlanDetail)
def get_plan(
    plan_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = (
        db.query(models.TripPlan)
        .filter(models.TripPlan.id == plan_id, models.TripPlan.user_id == current_user.id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Trip plan not found")

    try:
        plan = json.loads(row.plan_json)
    except json.JSONDecodeError:
        plan = {"summary": row.plan_json}

    return TripPlanDetail(
        id=row.id,
        title=row.title,
        destination=row.destination,
        season=row.season,
        duration_days=row.duration_days,
        experience_level=row.experience_level,
        difficulty=row.difficulty,
        risk_level=row.risk_level,
        source=row.source,
        plan=plan,
        created_at=row.created_at,
    )
