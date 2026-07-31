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
    """Backward-compatible wrapper — returns Gear ORM rows only.

    Prefer ``recommend_gear_picks`` when you need priority + reason.
    """
    from ml.gear_recommend import recommend_gear_picks

    return [
        pick.gear
        for pick in recommend_gear_picks(
            db,
            altitude=altitude,
            experience=experience,
            trek_type=trek_type,
            season=season,
            duration=duration,
            risk=risk,
        )
    ]


def explain_risk_factors(
    altitude: int | float,
    experience: str,
    trek_type: str,
    season: str,
    duration: int | float,
) -> list[str]:
    """Human-readable reasons behind the risk estimate (not a medical diagnosis)."""
    factors: list[str] = []
    alt = float(altitude)
    days = float(duration)

    if alt >= 5000:
        factors.append(f"Target altitude {int(alt)} m is in a high AMS-risk range.")
    elif alt >= 3500:
        factors.append(f"Target altitude {int(alt)} m needs careful acclimatization.")
    elif alt >= 2500:
        factors.append(f"Altitude {int(alt)} m can still cause mild symptoms for some people.")

    if experience == "Beginner":
        factors.append("Beginner experience increases risk on longer or harder routes.")
    if trek_type == "Hard":
        factors.append("Hard difficulty usually means steeper terrain and longer days.")
    elif trek_type == "Moderate":
        factors.append("Moderate difficulty still demands fitness and pacing.")

    if season == "Winter":
        factors.append("Winter adds cold, ice, and shorter daylight.")
    elif season == "Summer":
        factors.append("Summer/monsoon brings rain, leeches, and slippery trails.")

    if days < 4 and alt >= 4000:
        factors.append("Short duration at high altitude leaves little room to acclimatize.")
    if days >= 12 and alt >= 4500:
        factors.append("Long high routes increase cumulative fatigue and exposure.")

    if not factors:
        factors.append("Profile looks comparatively manageable for a prepared trekking group.")

    factors.append(
        "This is a heuristic estimate for planning only — not a medical or rescue assessment."
    )
    return factors
