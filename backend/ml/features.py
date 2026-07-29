"""Encode trek preparation inputs into numeric feature vectors for ML models."""

from __future__ import annotations

EXPERIENCE_MAP = {"Beginner": 0, "Intermediate": 1, "Advanced": 2}
DIFFICULTY_MAP = {"Easy": 0, "Moderate": 1, "Hard": 2}
SEASON_MAP = {"Spring": 0, "Summer": 1, "Autumn": 2, "Winter": 3}

FEATURE_NAMES = [
    "altitude",
    "experience",
    "trek_type",
    "season",
    "duration",
]


def encode_features(
    altitude: int | float,
    experience: str,
    trek_type: str,
    season: str,
    duration: int | float,
) -> list[float]:
    """
    Convert human-readable trek inputs into numbers a model can learn from.

    Why: ML models need numbers, not strings like "Beginner" or "Winter".
    """
    return [
        float(altitude),
        float(EXPERIENCE_MAP.get(experience, 0)),
        float(DIFFICULTY_MAP.get(trek_type, 0)),
        float(SEASON_MAP.get(season, 0)),
        float(duration),
    ]


def encode_difficulty_features(
    altitude: int | float,
    duration: int | float,
    season: str,
) -> list[float]:
    """Features used by the difficulty classifier (no experience / trek_type)."""
    return [
        float(altitude),
        float(duration),
        float(SEASON_MAP.get(season, 0)),
    ]
