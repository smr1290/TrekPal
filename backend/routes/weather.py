from fastapi import APIRouter, HTTPException, Query
import httpx

from schemas import WeatherDay, WeatherForecastResponse
from services.weather import fetch_forecast, resolve_destination, summarize_forecast

router = APIRouter()


@router.get("/forecast", response_model=WeatherForecastResponse)
async def get_forecast(
    destination: str = Query(..., min_length=2, description="Trek destination name"),
    days: int = Query(default=7, ge=1, le=14),
):
    """
    Public trek weather forecast (Open-Meteo).

    Matches known Nepal trek areas to approximate coordinates, then returns
    a short daily forecast with cold/snow/wind/rain warnings.
    """
    place = resolve_destination(destination)
    if not place:
        raise HTTPException(
            status_code=404,
            detail=(
                "No coordinates mapped for that destination yet. "
                "Try Everest Base Camp, Annapurna Circuit, Poon Hill, Langtang, Manaslu, "
                "Pokhara, or Kathmandu."
            ),
        )

    try:
        raw = await fetch_forecast(
            latitude=place.latitude,
            longitude=place.longitude,
            days=days,
        )
    except httpx.HTTPError:
        raise HTTPException(
            status_code=502,
            detail=(
                "Open-Meteo weather service is temporarily unavailable. "
                "Try again in a moment, or use Plan trip checklist and Knowledge guides meanwhile."
            ),
        )

    summary = summarize_forecast(raw, place)
    return WeatherForecastResponse(
        destination_label=summary["destination_label"],
        latitude=summary["latitude"],
        longitude=summary["longitude"],
        elevation_m=summary["elevation_m"],
        timezone=summary["timezone"],
        source=summary["source"],
        explanation=summary["explanation"],
        warnings=summary["warnings"],
        days=[WeatherDay(**d) for d in summary["days"]],
        matched_query=destination.strip(),
    )
