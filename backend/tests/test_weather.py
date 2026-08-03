"""Unit tests for weather destination matching and warning rules (M10)."""

from services.weather import build_warnings, resolve_destination, weather_code_label


def test_resolve_destination_matches_ebc_aliases():
    place = resolve_destination("Everest Base Camp trek")
    assert place is not None
    assert place.matched_key == "everest base camp"
    assert place.elevation_m == 5364


def test_resolve_destination_unknown():
    assert resolve_destination("Atlantis Ridge") is None


def test_build_warnings_cold_and_snow():
    warnings = build_warnings(
        min_c=-18,
        precip_mm=2,
        snow_cm=6,
        wind_kmh=20,
        elevation_m=5200,
    )
    joined = " ".join(warnings).lower()
    assert "cold" in joined or "freezing" in joined or "severe" in joined
    assert "snow" in joined
    assert "altitude" in joined


def test_weather_code_label_known():
    assert weather_code_label(0) == "Clear"
    assert "Snow" in weather_code_label(85)
