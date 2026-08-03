"""HTTP-level smoke tests for TrekPal API (M8).

These use FastAPI's TestClient against the live app wiring.
They expect a reachable database when the app starts (Docker Compose).
"""

from __future__ import annotations

import uuid

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

ML_FEATURES = {
    "altitude": 4200,
    "experience_level": "Beginner",
    "trek_type": "Moderate",
    "season": "Autumn",
    "duration": 10,
}


def test_health_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "TrekPal" in response.json().get("message", "")


def test_knowledge_list_is_public():
    response = client.get("/knowledge/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 1


def test_maps_hides_unverified_safety_by_default():
    response = client.get("/maps/locations")
    assert response.status_code == 200
    for item in response.json():
        if item["category"] in {"hospital", "emergency"}:
            assert item.get("is_verified") is True


def test_me_requires_auth():
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_ml_risk_requires_auth_when_mounted():
    from config import ENABLE_INTERNAL_ML_ROUTES

    response = client.post("/ml/risk", json=ML_FEATURES)
    if ENABLE_INTERNAL_ML_ROUTES:
        assert response.status_code == 401
    else:
        assert response.status_code == 404


def test_signup_login_cookie_and_me():
    email = f"m8_{uuid.uuid4().hex[:10]}@example.com"
    password = "TestPass123!"

    signup = client.post(
        "/auth/signup",
        json={
            "full_name": "M8 Tester",
            "email": email,
            "password": password,
            "experience_level": "Beginner",
        },
    )
    assert signup.status_code == 200, signup.text
    body = signup.json()
    assert body["user_id"]
    assert "trekpal_access" in signup.cookies

    me = client.get("/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == email

    logout = client.post("/auth/logout")
    assert logout.status_code == 200

    me_after = client.get("/auth/me")
    assert me_after.status_code == 401

    login = client.post("/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200
    assert "trekpal_access" in login.cookies

    me_again = client.get("/auth/me")
    assert me_again.status_code == 200


def test_authenticated_ml_risk_when_mounted():
    from config import ENABLE_INTERNAL_ML_ROUTES

    if not ENABLE_INTERNAL_ML_ROUTES:
        return

    email = f"m8ml_{uuid.uuid4().hex[:10]}@example.com"
    signup = client.post(
        "/auth/signup",
        json={
            "full_name": "ML Tester",
            "email": email,
            "password": "TestPass123!",
            "experience_level": "Intermediate",
        },
    )
    assert signup.status_code == 200

    response = client.post("/ml/risk", json=ML_FEATURES)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["risk_level"] in {"Low", "Moderate", "High"}
    assert data.get("source")


def test_trek_list_includes_image_fields():
    response = client.get("/trek/list")
    assert response.status_code == 200
    treks = response.json()
    assert treks
    assert any(t.get("image_url") for t in treks)


def test_gear_list_includes_photo_urls():
    response = client.get("/gear/")
    assert response.status_code == 200
    gear = response.json()
    assert gear
    assert any(g.get("photo_url") for g in gear)
