"""Trek weather forecasts via Open-Meteo (no API key).

Open-Meteo is a free weather API for non-commercial and open use.
We map trek destinations to approximate trail coordinates, fetch a short
daily forecast, then apply simple Himalaya-aware warning rules.
"""

from __future__ import annotations

from dataclasses import dataclass

import httpx

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

# Approximate public trail coordinates (not exact camps). Keys are lowercase.
DESTINATION_COORDS: dict[str, tuple[float, float, int | None, str]] = {
    # name_fragment -> lat, lng, elevation_m, label
    "everest base camp": (28.0026, 86.8528, 5364, "Everest Base Camp area"),
    "ebc": (28.0026, 86.8528, 5364, "Everest Base Camp area"),
    "gorak shep": (27.9808, 86.8284, 5164, "Gorak Shep"),
    "namche": (27.8069, 86.7140, 3440, "Namche Bazaar"),
    "tengboche": (27.8362, 86.7640, 3867, "Tengboche area"),
    "annapurna base camp": (28.5308, 83.8770, 4130, "Annapurna Base Camp"),
    "abc": (28.5308, 83.8770, 4130, "Annapurna Base Camp"),
    "annapurna circuit": (28.6667, 84.0167, 3540, "Manang / Annapurna Circuit area"),
    "manang": (28.6667, 84.0167, 3540, "Manang"),
    "poon hill": (28.4000, 83.6900, 3210, "Poon Hill"),
    "ghorepani": (28.4003, 83.6975, 2874, "Ghorepani"),
    "langtang": (28.2150, 85.5200, 3500, "Langtang region (approx.)"),
    "manaslu": (28.5500, 84.5600, 3800, "Manaslu region (approx.)"),
    "lukla": (27.6870, 86.7314, 2860, "Lukla"),
    "kathmandu": (27.7172, 85.3240, 1400, "Kathmandu"),
    "pokhara": (28.2096, 83.9556, 822, "Pokhara"),
}


# WMO weather interpretation codes (subset) — https://open-meteo.com/en/docs
WMO_LABELS: dict[int, str] = {
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Rain showers",
    81: "Rain showers",
    82: "Violent rain showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
}


@dataclass
class ResolvedPlace:
    latitude: float
    longitude: float
    elevation_m: int | None
    label: str
    matched_key: str


def resolve_destination(destination: str) -> ResolvedPlace | None:
    """Match a free-text destination to known trek coordinates."""
    text = (destination or "").strip().lower()
    if not text:
        return None

    # Prefer longer keys first so "annapurna base camp" beats "annapurna".
    for key in sorted(DESTINATION_COORDS.keys(), key=len, reverse=True):
        if key in text:
            lat, lng, elev, label = DESTINATION_COORDS[key]
            return ResolvedPlace(lat, lng, elev, label, key)
    return None


def weather_code_label(code: int | None) -> str:
    if code is None:
        return "Unknown"
    return WMO_LABELS.get(int(code), f"Code {code}")


def build_warnings(
    *,
    min_c: float | None,
    precip_mm: float | None,
    snow_cm: float | None,
    wind_kmh: float | None,
    elevation_m: int | None,
) -> list[str]:
    """Simple Himalaya-aware alerts — educational, not official advisories."""
    warnings: list[str] = []

    if min_c is not None and min_c <= -15:
        warnings.append("Severe cold overnight — prioritize insulated layers and a warm sleeping bag.")
    elif min_c is not None and min_c <= -5:
        warnings.append("Freezing nights likely — pack warm layers and protect water bottles from ice.")

    if snow_cm is not None and snow_cm >= 5:
        warnings.append("Significant snowfall possible — trails and flights can be delayed; carry traction.")
    elif snow_cm is not None and snow_cm > 0:
        warnings.append("Light snow possible — expect slippery sections at higher camps.")

    if precip_mm is not None and precip_mm >= 20:
        warnings.append("Heavy precipitation — landslide and slippery trail risk; keep buffer days.")
    elif precip_mm is not None and precip_mm >= 8:
        warnings.append("Wet conditions likely — waterproof shell and dry bags matter.")

    if wind_kmh is not None and wind_kmh >= 50:
        warnings.append("Strong wind — exposed ridges can be unsafe; start early and watch forecasts.")
    elif wind_kmh is not None and wind_kmh >= 35:
        warnings.append("Gusty wind possible — secure hats/gear and expect colder feel than the air temp.")

    if elevation_m is not None and elevation_m >= 4500:
        warnings.append(
            "High altitude area — weather shifts fast; acclimatize and do not push through AMS symptoms."
        )

    return warnings


async def fetch_forecast(
    *,
    latitude: float,
    longitude: float,
    days: int = 7,
) -> dict:
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "daily": ",".join(
            [
                "temperature_2m_max",
                "temperature_2m_min",
                "precipitation_sum",
                "snowfall_sum",
                "wind_speed_10m_max",
                "weather_code",
            ]
        ),
        "timezone": "Asia/Kathmandu",
        "forecast_days": max(1, min(days, 14)),
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        from services.ext_logging import log_external_call

        with log_external_call("open_meteo", "forecast"):
            resp = await client.get(OPEN_METEO_URL, params=params)
            resp.raise_for_status()
            return resp.json()


def summarize_forecast(raw: dict, place: ResolvedPlace) -> dict:
    daily = raw.get("daily") or {}
    times = daily.get("time") or []
    tmax = daily.get("temperature_2m_max") or []
    tmin = daily.get("temperature_2m_min") or []
    precip = daily.get("precipitation_sum") or []
    snow = daily.get("snowfall_sum") or []
    wind = daily.get("wind_speed_10m_max") or []
    codes = daily.get("weather_code") or []

    days_out: list[dict] = []
    all_warnings: list[str] = []

    for i, day in enumerate(times):
        max_c = tmax[i] if i < len(tmax) else None
        min_c = tmin[i] if i < len(tmin) else None
        precip_mm = precip[i] if i < len(precip) else None
        snow_cm = snow[i] if i < len(snow) else None
        wind_kmh = wind[i] if i < len(wind) else None
        code = codes[i] if i < len(codes) else None
        day_warnings = build_warnings(
            min_c=min_c,
            precip_mm=precip_mm,
            snow_cm=snow_cm,
            wind_kmh=wind_kmh,
            elevation_m=place.elevation_m if i == 0 else None,
        )
        for w in day_warnings:
            if w not in all_warnings:
                all_warnings.append(w)

        days_out.append(
            {
                "date": day,
                "temp_max_c": max_c,
                "temp_min_c": min_c,
                "precipitation_mm": precip_mm,
                "snowfall_cm": snow_cm,
                "wind_max_kmh": wind_kmh,
                "weather_code": code,
                "summary": weather_code_label(code),
                "warnings": day_warnings,
            }
        )

    explanation = (
        f"Forecast for {place.label} (approx. trail coordinates). "
        "Mountain weather changes quickly — treat this as orientation, not a go/no-go decision. "
        "Confirm locally with lodges and guides before high passes."
    )

    return {
        "destination_label": place.label,
        "latitude": place.latitude,
        "longitude": place.longitude,
        "elevation_m": place.elevation_m,
        "timezone": raw.get("timezone") or "Asia/Kathmandu",
        "source": "open-meteo",
        "explanation": explanation,
        "warnings": all_warnings,
        "days": days_out,
    }
