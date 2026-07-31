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
