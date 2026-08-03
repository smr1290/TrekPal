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
