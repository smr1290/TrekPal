from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from schemas import PrepareTrekRequest, PrepareTrekResponse, RecommendedGearItem
from security import get_current_user
import models

router = APIRouter()


# ---------------- Risk Logic ----------------
def calculate_risk_score(altitude, experience, trek_type, season, duration):
    score = 0

    # Altitude risk
    if altitude >= 5500:
        score += 5
    elif altitude >= 5000:
        score += 4
    elif altitude >= 4500:
        score += 3
    elif altitude >= 3500:
        score += 2
    elif altitude >= 2500:
        score += 1

    # Experience risk
    if experience == "Beginner":
        score += 3
    elif experience == "Intermediate":
        score += 1
    elif experience == "Advanced":
        score += 0

    # Trek difficulty risk
    if trek_type == "Hard":
        score += 3
    elif trek_type == "Moderate":
        score += 2
    elif trek_type == "Easy":
        score += 0

    # Season risk
    if season == "Winter":
        score += 3
    elif season == "Autumn":
        score += 1
    elif season == "Spring":
        score += 1
    elif season == "Summer":
        score += 0

    # Duration risk
    if duration >= 15:
        score += 3
    elif duration >= 10:
        score += 2
    elif duration >= 5:
        score += 1

    return score


def calculate_risk(altitude, experience, trek_type, season, duration):
    score = calculate_risk_score(altitude, experience, trek_type, season, duration)

    if score >= 10:
        return "High"
    elif score >= 5:
        return "Moderate"
    return "Low"


# ---------------- Gear Logic ----------------
def recommend_gear(db, altitude, experience, trek_type, season, duration, risk):
    gear_items = db.query(models.Gear).all()

    if not gear_items:
        return []

    scored_gears = []

    for g in gear_items:
        name = (g.gear_name or "").lower()
        score = 0

        # ---------------- Always essential ----------------
        if "trekking boots" in name:
            score += 10

        if "backpack" in name:
            score += 10

        if "water bottle" in name:
            score += 10

        if "first aid" in name:
            score += 9

        if "sunscreen" in name:
            score += 8

        if "torch" in name or "head lamp" in name:
            score += 7

        # ---------------- Altitude based ----------------
        if altitude >= 3000:
            if "sunglasses" in name:
                score += 5
            if "extra socks" in name:
                score += 3

        if altitude >= 4000:
            if "thermal" in name:
                score += 8
            if "gloves" in name:
                score += 7
            if "down jacket" in name:
                score += 9
            if "sunglasses" in name:
                score += 7
            if "antiseptic cream" in name:
                score += 4

        if altitude >= 5000:
            if "thermal" in name:
                score += 3
            if "gloves" in name:
                score += 3
            if "down jacket" in name:
                score += 3
            if "head lamp" in name:
                score += 2

        # ---------------- Season based ----------------
        if season == "Winter":
            if "gloves" in name:
                score += 9
            if "down jacket" in name:
                score += 10
            if "thermal" in name:
                score += 10
            if "extra socks" in name:
                score += 6
            if "gaiters" in name:
                score += 5
            if "crampons" in name:
                score += 5

        elif season == "Autumn":
            if "extra socks" in name:
                score += 3
            if "gloves" in name:
                score += 2

        elif season == "Spring":
            if "sunglasses" in name:
                score += 3
            if "gloves" in name and altitude >= 4000:
                score += 3

        elif season == "Summer":
            if "water bottle" in name:
                score += 2
            if "sunscreen" in name:
                score += 3
            if "sandals" in name and duration >= 5:
                score += 3

        # ---------------- Trek difficulty based ----------------
        if trek_type == "Easy":
            if "rope" in name:
                score -= 5
            if "crampons" in name:
                score -= 5
            if "gaiters" in name and altitude < 4000:
                score -= 2

        elif trek_type == "Moderate":
            if "head lamp" in name:
                score += 3
            if "power bank" in name:
                score += 3
            if "gaiters" in name and altitude >= 3500:
                score += 3
            if "rope" in name and altitude >= 4500:
                score += 2

        elif trek_type == "Hard":
            if "rope" in name:
                score += 8
            if "crampons" in name:
                score += 8
            if "gaiters" in name:
                score += 6
            if "head lamp" in name:
                score += 4
            if "power bank" in name:
                score += 4

        # ---------------- Experience based ----------------
        if experience == "Beginner":
            if "first aid" in name:
                score += 4
            if "head lamp" in name:
                score += 4
            if "power bank" in name:
                score += 3
            if "extra socks" in name:
                score += 3
            if "gloves" in name and altitude >= 3000:
                score += 2

        elif experience == "Intermediate":
            if "head lamp" in name:
                score += 2
            if "power bank" in name:
                score += 2

        elif experience == "Advanced":
            if "rope" in name and trek_type == "Hard":
                score += 2
            if "crampons" in name and altitude >= 4500:
                score += 2

        # ---------------- Duration based ----------------
        if duration >= 4:
            if "extra socks" in name:
                score += 4
            if "power bank" in name:
                score += 3
            if "antiseptic cream" in name:
                score += 3

        if duration >= 7:
            if "sandals" in name:
                score += 5
            if "power bank" in name:
                score += 2
            if "backpack" in name:
                score += 2

        if duration >= 10:
            if "extra socks" in name:
                score += 2
            if "antiseptic cream" in name:
                score += 2
            if "sandals" in name:
                score += 2

        # ---------------- Risk reinforcement ----------------
        if risk == "Moderate":
            if "head lamp" in name:
                score += 2
            if "power bank" in name:
                score += 2
            if "antiseptic cream" in name:
                score += 2

        elif risk == "High":
            if "head lamp" in name:
                score += 4
            if "power bank" in name:
                score += 4
            if "antiseptic cream" in name:
                score += 4
            if "rope" in name:
                score += 3
            if "crampons" in name:
                score += 3
            if "gaiters" in name:
                score += 3

        if score > 0:
            scored_gears.append((g, score))

    scored_gears.sort(key=lambda x: x[1], reverse=True)

    unique_gears = []
    seen_ids = set()

    for gear, score in scored_gears:
        if gear.id not in seen_ids:
            unique_gears.append(gear)
            seen_ids.add(gear.id)

    # Balanced recommendation count
    if risk == "Low":
        limit = 7
    elif risk == "Moderate":
        limit = 10
    else:
        limit = 13

    return unique_gears[:limit]


# ---------------- Main Route ----------------
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

    risk = calculate_risk(altitude, experience_level, trek_type, season, duration)

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