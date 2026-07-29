"""
Train TrekPal ML models from synthetic data derived from the rule engine.

Run from the backend directory:
  python -m ml.train
"""

from __future__ import annotations

import random
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.neighbors import NearestNeighbors

from ml.features import (
    DIFFICULTY_MAP,
    EXPERIENCE_MAP,
    SEASON_MAP,
    encode_difficulty_features,
    encode_features,
)
from ml.rules import (
    calculate_risk,
    estimate_budget_rules,
    predict_difficulty_rules,
)

ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"

EXPERIENCES = list(EXPERIENCE_MAP.keys())
DIFFICULTIES = list(DIFFICULTY_MAP.keys())
SEASONS = list(SEASON_MAP.keys())


def _maybe_flip_label(label: str, options: list[str], noise_rate: float = 0.05) -> str:
    if random.random() >= noise_rate:
        return label
    others = [o for o in options if o != label]
    return random.choice(others) if others else label


def generate_samples(n: int = 2500, seed: int = 42) -> list[dict]:
    random.seed(seed)
    np.random.seed(seed)
    samples: list[dict] = []

    for _ in range(n):
        altitude = int(np.clip(np.random.normal(4200, 900), 1500, 6000))
        duration = int(np.clip(np.random.normal(8, 4), 2, 21))
        experience = random.choice(EXPERIENCES)
        trek_type = random.choice(DIFFICULTIES)
        season = random.choice(SEASONS)

        risk = calculate_risk(altitude, experience, trek_type, season, duration)
        risk = _maybe_flip_label(risk, ["Low", "Moderate", "High"])

        difficulty = predict_difficulty_rules(altitude, duration, season)
        difficulty = _maybe_flip_label(difficulty, DIFFICULTIES)

        budget = estimate_budget_rules(altitude, experience, trek_type, season, duration)
        # Light noise on budget mid so the regressor isn't a perfect copy of the formula
        mid = budget["mid_usd"] * (1.0 + random.uniform(-0.08, 0.08))

        samples.append(
            {
                "altitude": altitude,
                "experience": experience,
                "trek_type": trek_type,
                "season": season,
                "duration": duration,
                "risk": risk,
                "difficulty": difficulty,
                "budget_mid": mid,
            }
        )
    return samples


def train_and_save(n_samples: int = 2500) -> dict[str, float]:
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    samples = generate_samples(n_samples)

    X_risk = np.array(
        [
            encode_features(s["altitude"], s["experience"], s["trek_type"], s["season"], s["duration"])
            for s in samples
        ]
    )
    y_risk = np.array([s["risk"] for s in samples])

    X_diff = np.array(
        [encode_difficulty_features(s["altitude"], s["duration"], s["season"]) for s in samples]
    )
    y_diff = np.array([s["difficulty"] for s in samples])

    X_budget = X_risk
    y_budget = np.array([s["budget_mid"] for s in samples])

    # --- Risk classifier ---
    Xtr, Xte, ytr, yte = train_test_split(X_risk, y_risk, test_size=0.2, random_state=42, stratify=y_risk)
    risk_model = RandomForestClassifier(
        n_estimators=40,
        max_depth=8,
        random_state=42,
        class_weight="balanced",
    )
    risk_model.fit(Xtr, ytr)
    risk_acc = float(risk_model.score(Xte, yte))
    joblib.dump(risk_model, ARTIFACTS_DIR / "risk_model.joblib")

    # --- Difficulty classifier ---
    Xtr, Xte, ytr, yte = train_test_split(X_diff, y_diff, test_size=0.2, random_state=42, stratify=y_diff)
    difficulty_model = RandomForestClassifier(
        n_estimators=40,
        max_depth=8,
        random_state=42,
        class_weight="balanced",
    )
    difficulty_model.fit(Xtr, ytr)
    difficulty_acc = float(difficulty_model.score(Xte, yte))
    joblib.dump(difficulty_model, ARTIFACTS_DIR / "difficulty_model.joblib")

    # --- Budget regressor ---
    Xtr, Xte, ytr, yte = train_test_split(X_budget, y_budget, test_size=0.2, random_state=42)
    budget_model = RandomForestRegressor(n_estimators=40, max_depth=8, random_state=42)
    budget_model.fit(Xtr, ytr)
    budget_r2 = float(budget_model.score(Xte, yte))
    joblib.dump(budget_model, ARTIFACTS_DIR / "budget_model.joblib")

    # --- Trek recommender: nearest neighbors over feature space ---
    # Store only difficulty labels for neighbor profiles (keeps artifact small).
    nn_model = NearestNeighbors(n_neighbors=5, metric="euclidean")
    nn_model.fit(X_risk)
    profile_labels = [s["trek_type"] for s in samples]
    joblib.dump(
        {"nn": nn_model, "profile_labels": profile_labels, "X": X_risk},
        ARTIFACTS_DIR / "recommend_model.joblib",
    )

    metrics = {
        "risk_accuracy": round(risk_acc, 4),
        "difficulty_accuracy": round(difficulty_acc, 4),
        "budget_r2": round(budget_r2, 4),
        "n_samples": float(n_samples),
    }
    joblib.dump(metrics, ARTIFACTS_DIR / "metrics.joblib")
    return metrics


if __name__ == "__main__":
    result = train_and_save()
    print("Training complete. Metrics:")
    for k, v in result.items():
        print(f"  {k}: {v}")
    print(f"Artifacts written to: {ARTIFACTS_DIR}")
