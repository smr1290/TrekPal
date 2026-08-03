"""Smoke tests for safety-critical TrekPal rules (no DB required)."""

from ml.gear_recommend import build_needs
from ml.rules import explain_risk_factors
from services.permits import permits_for_route
from services.trip_planner import resolve_duration
from services.rate_limit import RateLimiter


def test_ebc_winter_includes_warmth_and_traction():
    needs = build_needs(
        altitude=5364,
        experience="Beginner",
        trek_type="Hard",
        season="Winter",
        duration=14,
        risk="High",
        destination="Everest Base Camp",
    )
    slugs = {n.slug for n in needs}
    assert "hiking-boots" in slugs
    assert "down-jacket" in slugs
    assert "sleeping-bag-10c" in slugs
    assert "microspikes" in slugs
    assert any(n.slug == "trekking-poles" and n.priority == "essential" for n in needs)


def test_mustang_emphasizes_dust_protection():
    needs = build_needs(
        altitude=3800,
        experience="Intermediate",
        trek_type="Moderate",
        season="Autumn",
        duration=10,
        risk="Moderate",
        destination="Upper Mustang",
    )
    buff = next(n for n in needs if n.slug == "buff")
    assert buff.priority == "essential"


def test_easy_low_skip_sleeping_bag():
    needs = build_needs(
        altitude=2200,
        experience="Intermediate",
        trek_type="Easy",
        season="Spring",
        duration=3,
        risk="Low",
        destination="Poon Hill",
    )
    slugs = {n.slug for n in needs}
    assert "sleeping-bag-10c" not in slugs
    assert "hiking-boots" in slugs


def test_ebc_duration_floor():
    days, warnings = resolve_duration("Everest Base Camp", 5364, 1)
    assert days >= 12
    assert warnings


def test_permits_ebc_foreign_vs_nepali():
    foreign = permits_for_route("foreign", "Everest Base Camp")
    nepali = permits_for_route("nepali", "Everest Base Camp")
    assert any("TIMS" in p for p in foreign)
    assert any("Sagarmatha" in p for p in foreign)
    assert any("do not need TIMS" in p or "generally do not need TIMS" in p for p in nepali)
    assert not any(p.startswith("TIMS card") for p in nepali)


def test_permits_mustang_mentions_restricted():
    lines = permits_for_route("foreign", "Upper Mustang")
    assert any("Restricted" in p or "RAP" in p for p in lines)


def test_risk_factors_include_disclaimer():
    factors = explain_risk_factors(5200, "Beginner", "Hard", "Winter", 14)
    assert any("medical" in f.lower() for f in factors)


def test_rate_limiter_blocks_after_max():
    limiter = RateLimiter(max_calls=2, window_seconds=60)
    assert limiter.allow("u1") is True
    assert limiter.allow("u1") is True
    assert limiter.allow("u1") is False
    assert limiter.allow("u2") is True


def test_unverified_emergency_hidden_by_default():
    from services.map_visibility import is_visible_on_map, trust_label

    assert (
        is_visible_on_map(
            category="emergency",
            is_verified=False,
            show_unverified_safety=False,
        )
        is False
    )
    assert (
        is_visible_on_map(
            category="emergency",
            is_verified=False,
            show_unverified_safety=True,
        )
        is True
    )
    assert (
        is_visible_on_map(
            category="trailhead",
            is_verified=True,
            show_unverified_safety=False,
        )
        is True
    )
    assert (
        is_visible_on_map(
            category="hospital",
            is_verified=True,
            show_unverified_safety=False,
        )
        is True
    )
    assert (
        is_visible_on_map(
            category="tea_house",
            is_verified=False,
            show_unverified_safety=False,
            verified_only=True,
        )
        is False
    )
    assert "Demo" in trust_label(category="hospital", is_verified=False)
    assert trust_label(category="trailhead", is_verified=True) == "Verified landmark"


def test_history_title_prefers_destination():
    class FakeHistory:
        destination = "Everest Base Camp"
        trek_type = "Hard"

    from routes.history import _history_title

    assert _history_title(FakeHistory()) == "Everest Base Camp"

    class NoDest:
        destination = None
        trek_type = "Easy"

    assert _history_title(NoDest()) == "Easy"


def test_update_profile_schema_accepts_experience():
    from schemas import UpdateProfileRequest

    payload = UpdateProfileRequest(full_name="Sam", experience_level="Advanced")
    assert payload.experience_level == "Advanced"
    assert payload.full_name == "Sam"


def test_delete_plan_routes_are_registered():
    """M4: users must be able to remove saved checklists and itineraries."""
    from fastapi.routing import APIRoute
    from main import app

    delete_paths = {
        (route.path, tuple(sorted(route.methods or [])))
        for route in app.routes
        if isinstance(route, APIRoute) and route.methods and "DELETE" in route.methods
    }
    assert ("/trek/history/{history_id}", ("DELETE",)) in delete_paths
    assert ("/trip-plans/{plan_id}", ("DELETE",)) in delete_paths


def test_knowledge_disclaimers_are_category_specific():
    from services.knowledge_trust import disclaimer_for_category, has_external_source

    medical = disclaimer_for_category("medical")
    assert "not a medical" in medical.lower() or "diagnosis" in medical.lower()

    permit = disclaimer_for_category("permit")
    assert "change" in permit.lower()

    assert has_external_source("https://wwwnc.cdc.gov/travel/page/travel-to-high-altitudes")
    assert not has_external_source(None)
    assert not has_external_source("ftp://example.com")


def test_chat_source_schema_includes_title():
    from schemas import ChatSource

    source = ChatSource(slug="altitude-sickness-basics", title="Altitude sickness: signs and what to do")
    assert source.slug == "altitude-sickness-basics"
    assert "Altitude" in source.title


def test_resolve_access_token_prefers_bearer_then_cookie():
    from security import resolve_access_token

    assert resolve_access_token(bearer="bearer-token", cookie="cookie-token") == "bearer-token"
    assert resolve_access_token(bearer=None, cookie="cookie-token") == "cookie-token"
    assert resolve_access_token(bearer="  ", cookie="cookie-token") == "cookie-token"
    assert resolve_access_token(bearer=None, cookie=None) is None


def test_logout_route_is_registered():
    from fastapi.routing import APIRoute
    from main import app

    logout_routes = [
        route
        for route in app.routes
        if isinstance(route, APIRoute)
        and route.path == "/auth/logout"
        and route.methods
        and "POST" in route.methods
    ]
    assert logout_routes


def test_internal_ml_gate_helpers():
    from config import internal_ml_routes_enabled

    assert internal_ml_routes_enabled("development", "false") is True
    assert internal_ml_routes_enabled("production", "false") is False
    assert internal_ml_routes_enabled("production", "true") is True


def test_ml_router_mount_matches_config():
    from fastapi.routing import APIRoute
    from config import ENABLE_INTERNAL_ML_ROUTES
    from main import app

    ml_paths = {
        route.path
        for route in app.routes
        if isinstance(route, APIRoute) and route.path.startswith("/ml")
    }
    if ENABLE_INTERNAL_ML_ROUTES:
        assert "/ml/risk" in ml_paths
    else:
        assert not ml_paths


def test_ownership_helper_is_single_source():
    """R1: user-scoped id lookups go through ownership.get_owned_resource."""
    import ownership
    from routes import history as history_routes
    from routes import trip_plans as trip_plan_routes

    assert callable(ownership.get_owned_resource)
    assert history_routes.owned_history is ownership.owned_history
    assert trip_plan_routes.owned_trip_plan is ownership.owned_trip_plan


def test_destination_validation_rejects_garbage():
    from services.destination import validate_destination
    import pytest

    assert validate_destination(None) is None
    assert validate_destination("  Poon Hill  ") == "Poon Hill"
    with pytest.raises(ValueError):
        validate_destination("x")
    with pytest.raises(ValueError):
        validate_destination("A" * 151)
    with pytest.raises(ValueError):
        validate_destination("Bad\x00Name")
    with pytest.raises(ValueError):
        validate_destination("Trek <script>")
    with pytest.raises(ValueError):
        validate_destination(None, required=True)


def test_prepare_schema_rejects_bad_destination():
    from pydantic import ValidationError
    from schemas import PrepareTrekRequest
    import pytest

    with pytest.raises(ValidationError):
        PrepareTrekRequest(
            trek_type="Easy",
            experience_level="Beginner",
            altitude=3000,
            season="Autumn",
            duration=5,
            destination="!!",
        )


def test_catalog_media_paths_are_public_svgs():
    """M9: seeded media URLs must point at frontend /public/catalog assets."""
    from services.catalog_media import CATEGORY_IMAGES, TREK_IMAGES, is_catalog_svg_path

    assert all(is_catalog_svg_path(url, folder="treks") for url in TREK_IMAGES.values())
    assert all(is_catalog_svg_path(url, folder="gear") for url in CATEGORY_IMAGES.values())
