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


# ---------------- Risk Logic ----------------
def calculate_risk(altitude, experience, trek_type, season):

    if altitude >= 5000 and experience == "Beginner":
        return "High"

    if altitude >= 4000 and experience == "Beginner":
        return "Moderate"

    if altitude >= 5000 and trek_type == "Hard":
        return "High"

    if season == "Winter" and altitude >= 4000:
        return "High"

    return "Low"


# ---------------- Gear Logic ----------------
def recommend_gear(db, altitude, experience, trek_type, season, risk):

    gear_items = db.query(models.Gear).all()
    recommended = []

    for g in gear_items:
        name = g.gear_name.lower()

        # Always needed
        if any(x in name for x in ["boots", "backpack", "water", "jacket"]):
            recommended.append(g)

        # High altitude
        if altitude >= 4000 and any(x in name for x in ["first aid", "sunscreen", "thermal"]):
            recommended.append(g)

        # Winter gear
        if season == "Winter" and any(x in name for x in ["gloves", "down", "thermal"]):
            recommended.append(g)

        # Beginner support
        if experience == "Beginner" and "pole" in name:
            recommended.append(g)

        # Hard trek safety
        if trek_type == "Hard" and any(x in name for x in ["rope", "extra"]):
            recommended.append(g)

    return list({g.id: g for g in recommended}.values())  # remove duplicates


# ---------------- Main Route ----------------
@router.post("/prepare-trek")
def prepare_trek(
    user_id: int,
    trek_type: str,
    experience_level: str,
    altitude: int,
    season: str,
    duration: int,
    db: Session = Depends(get_db)
):

    # ---------------- Risk ----------------
    risk = calculate_risk(altitude, experience_level, trek_type, season)

    # ---------------- Store History ----------------
    history = models.UserTrekHistory(
        user_id=user_id,
        trek_type=trek_type,
        experience_level=experience_level,
        input_altitude=altitude,
        season=season,
        planned_duration=duration,
        risk_level=risk
    )

    db.add(history)
    db.commit()
    db.refresh(history)

    # ---------------- Gear ----------------
    gears = recommend_gear(db, altitude, experience_level, trek_type, season, risk)

    for g in gears:
        mapping = models.TrekGearRecommendation(
            history_id=history.id,
            gear_id=g.id
        )
        db.add(mapping)

    db.commit()

    return {
        "risk_level": risk,
        "recommended_gear": [
            {
                "gear_name": g.gear_name,
                "photo_url": g.photo_url,
                "description": g.description
            }
            for g in gears
        ]
    }