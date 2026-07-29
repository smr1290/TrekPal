"""Rule-engine fallbacks for TrekPal ML (Phase 4).

These heuristics are the safety net when model files are missing or prediction fails.
They also generate synthetic training labels in train.py.
"""

from __future__ import annotations

from typing import Any


def calculate_risk_score(
    altitude: int | float,
    experience: str,
    trek_type: str,
    season: str,
    duration: int | float,
) -> int:
    score = 0

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

    if experience == "Beginner":
        score += 3
    elif experience == "Intermediate":
        score += 1

    if trek_type == "Hard":
        score += 3
    elif trek_type == "Moderate":
        score += 2

    if season == "Winter":
        score += 3
    elif season in ("Autumn", "Spring"):
        score += 1

    if duration >= 15:
        score += 3
    elif duration >= 10:
        score += 2
    elif duration >= 5:
        score += 1

    return score


def calculate_risk(
    altitude: int | float,
    experience: str,
    trek_type: str,
    season: str,
    duration: int | float,
) -> str:
    score = calculate_risk_score(altitude, experience, trek_type, season, duration)
    if score >= 10:
        return "High"
    if score >= 5:
        return "Moderate"
    return "Low"


def predict_difficulty_rules(
    altitude: int | float,
    duration: int | float,
    season: str,
) -> str:
    """Rule fallback for trek difficulty prediction."""
    score = 0
    if altitude >= 5000:
        score += 3
    elif altitude >= 4000:
        score += 2
    elif altitude >= 3000:
        score += 1

    if duration >= 12:
        score += 2
    elif duration >= 7:
        score += 1

    if season == "Winter":
        score += 2
    elif season in ("Autumn", "Spring"):
        score += 1

    if score >= 5:
        return "Hard"
    if score >= 3:
        return "Moderate"
    return "Easy"


def estimate_budget_rules(
    altitude: int | float,
    experience: str,
    trek_type: str,
    season: str,
    duration: int | float,
) -> dict[str, float]:
    """
    Transparent budget estimate in USD.

    Formula: base_per_day * days * difficulty * altitude * season * experience.
    """
    base_per_day = 45.0

    difficulty_mult = {"Easy": 1.0, "Moderate": 1.25, "Hard": 1.55}.get(trek_type, 1.2)
    season_mult = {"Spring": 1.1, "Summer": 1.0, "Autumn": 1.15, "Winter": 1.35}.get(season, 1.1)
    experience_mult = {"Beginner": 1.15, "Intermediate": 1.0, "Advanced": 0.95}.get(experience, 1.0)
    altitude_mult = 1.0 + max(0.0, (float(altitude) - 2500) / 10000)

    mid = base_per_day * float(duration) * difficulty_mult * season_mult * experience_mult * altitude_mult
    low = round(mid * 0.85, 2)
    high = round(mid * 1.2, 2)
    return {"low_usd": low, "mid_usd": round(mid, 2), "high_usd": high}


def score_trek_match(
    user_altitude: int | float,
    user_duration: int | float,
    user_experience: str,
    user_trek_type: str,
    trek_altitude: int | float | None,
    trek_duration: int | float | None,
    trek_difficulty: str | None,
) -> float:
    """Higher score = better trek recommendation for this user profile."""
    score = 0.0
    t_alt = float(trek_altitude or 0)
    t_dur = float(trek_duration or 0)
    t_diff = trek_difficulty or "Moderate"

    # Prefer treks near the user's target altitude / duration
    score += max(0.0, 50.0 - abs(t_alt - float(user_altitude)) / 80.0)
    score += max(0.0, 30.0 - abs(t_dur - float(user_duration)) * 2.0)

    if t_diff == user_trek_type:
        score += 25.0
    elif {t_diff, user_trek_type} == {"Easy", "Moderate"} or {t_diff, user_trek_type} == {
        "Moderate",
        "Hard",
    }:
        score += 10.0

    # Soft experience gates
    if user_experience == "Beginner" and t_diff == "Hard":
        score -= 20.0
    if user_experience == "Advanced" and t_diff == "Easy":
        score -= 5.0

    return score


def recommend_gear(
    db: Any,
    altitude: int | float,
    experience: str,
    trek_type: str,
    season: str,
    duration: int | float,
    risk: str,
) -> list[Any]:
    import models

    gear_items = db.query(models.Gear).all()
    if not gear_items:
        return []

    scored_gears: list[tuple[Any, int]] = []

    for g in gear_items:
        name = (g.gear_name or "").lower()
        score = 0

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
    seen_ids: set[int] = set()
    for gear, _score in scored_gears:
        if gear.id not in seen_ids:
            unique_gears.append(gear)
            seen_ids.add(gear.id)

    if risk == "Low":
        limit = 7
    elif risk == "Moderate":
        limit = 10
    else:
        limit = 13

    return unique_gears[:limit]
