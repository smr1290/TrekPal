"""Load trained models and serve predictions with rule-engine fallback."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib
import numpy as np

from ml.features import encode_difficulty_features, encode_features
from ml.rules import (
    calculate_risk,
    estimate_budget_rules,
    predict_difficulty_rules,
    score_trek_match,
)

ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"

_risk_model = None
_difficulty_model = None
_budget_model = None
_recommend_bundle = None
_loaded = False


def _load_models() -> None:
    global _risk_model, _difficulty_model, _budget_model, _recommend_bundle, _loaded
    if _loaded:
        return
    try:
        risk_path = ARTIFACTS_DIR / "risk_model.joblib"
        if risk_path.exists():
            _risk_model = joblib.load(risk_path)
        diff_path = ARTIFACTS_DIR / "difficulty_model.joblib"
        if diff_path.exists():
            _difficulty_model = joblib.load(diff_path)
        budget_path = ARTIFACTS_DIR / "budget_model.joblib"
        if budget_path.exists():
            _budget_model = joblib.load(budget_path)
        recommend_path = ARTIFACTS_DIR / "recommend_model.joblib"
        if recommend_path.exists():
            _recommend_bundle = joblib.load(recommend_path)
    except Exception:
        _risk_model = None
        _difficulty_model = None
        _budget_model = None
        _recommend_bundle = None
    finally:
        _loaded = True


def reload_models() -> None:
    """Force reload (useful after re-training)."""
    global _loaded
    _loaded = False
    _load_models()


def predict_risk(
    altitude: int | float,
    experience: str,
    trek_type: str,
    season: str,
    duration: int | float,
) -> tuple[str, str]:
    """Return (risk_level, source).

    Source is ``estimate`` when using the sklearn model (trained on synthetic
    rule labels — not clinical data) or ``rules`` for the plain heuristic.
    """
    _load_models()
    if _risk_model is not None:
        try:
            features = np.array(
                [encode_features(altitude, experience, trek_type, season, duration)]
            )
            pred = str(_risk_model.predict(features)[0])
            if pred in ("Low", "Moderate", "High"):
                return pred, "estimate"
        except Exception:
            pass
    return calculate_risk(altitude, experience, trek_type, season, duration), "rules"


def predict_difficulty(
    altitude: int | float,
    duration: int | float,
    season: str,
) -> tuple[str, str]:
    _load_models()
    if _difficulty_model is not None:
        try:
            features = np.array([encode_difficulty_features(altitude, duration, season)])
            pred = str(_difficulty_model.predict(features)[0])
            if pred in ("Easy", "Moderate", "Hard"):
                return pred, "estimate"
        except Exception:
            pass
    return predict_difficulty_rules(altitude, duration, season), "rules"


def estimate_budget(
    altitude: int | float,
    experience: str,
    trek_type: str,
    season: str,
    duration: int | float,
) -> tuple[dict[str, float], str]:
    _load_models()
    if _budget_model is not None:
        try:
            features = np.array(
                [encode_features(altitude, experience, trek_type, season, duration)]
            )
            mid = float(_budget_model.predict(features)[0])
            if mid > 0:
                return {
                    "low_usd": round(mid * 0.85, 2),
                    "mid_usd": round(mid, 2),
                    "high_usd": round(mid * 1.2, 2),
                }, "estimate"
        except Exception:
            pass
    return estimate_budget_rules(altitude, experience, trek_type, season, duration), "rules"


def recommend_treks(
    altitude: int | float,
    experience: str,
    trek_type: str,
    season: str,
    duration: int | float,
    treks: list[Any],
    limit: int = 3,
) -> tuple[list[dict[str, Any]], str]:
    """
    Rank catalog treks for this user.

    Uses rule-based scoring against DB treks (always available).
    If the NN recommender artifact is loaded, boost treks whose difficulty
    matches nearest training profiles — source is ``estimate`` (synthetic training).
    """
    _load_models()
    if not treks:
        return [], "rules"

    preferred_difficulties: set[str] = {trek_type}
    source = "rules"

    if _recommend_bundle is not None:
        try:
            features = np.array(
                [encode_features(altitude, experience, trek_type, season, duration)]
            )
            nn = _recommend_bundle["nn"]
            labels = _recommend_bundle.get("profile_labels") or [
                p.get("trek_type") for p in _recommend_bundle.get("profiles", [])
            ]
            _distances, indices = nn.kneighbors(features, n_neighbors=min(5, len(labels)))
            for idx in indices[0]:
                preferred_difficulties.add(labels[idx])
            source = "estimate"
        except Exception:
            source = "rules"

    ranked: list[tuple[float, Any]] = []
    for trek in treks:
        score = score_trek_match(
            user_altitude=altitude,
            user_duration=duration,
            user_experience=experience,
            user_trek_type=trek_type,
            trek_altitude=getattr(trek, "max_altitude", None),
            trek_duration=getattr(trek, "typical_duration", None),
            trek_difficulty=getattr(trek, "difficulty", None),
        )
        if getattr(trek, "difficulty", None) in preferred_difficulties:
            score += 8.0
        ranked.append((score, trek))

    ranked.sort(key=lambda x: x[0], reverse=True)
    results = [
        {
            "id": t.id,
            "trek_name": t.trek_name,
            "max_altitude": t.max_altitude,
            "duration_days": t.typical_duration,
            "difficulty": t.difficulty,
            "match_score": round(score, 2),
        }
        for score, t in ranked[:limit]
    ]
    return results, source
