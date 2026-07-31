from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from db import get_db
from schemas import MapLocationItem, MapRegionSummary
from services.map_visibility import is_visible_on_map
import models

router = APIRouter()


@router.get("/locations", response_model=list[MapLocationItem])
def list_map_locations(
    category: str | None = Query(default=None),
    region: str | None = Query(default=None),
    show_unverified_safety: bool = Query(
        default=False,
        description="If false, hide unverified hospital/emergency pins (safer default).",
    ),
    db: Session = Depends(get_db),
):
    query = db.query(models.MapLocation).filter(models.MapLocation.is_published.is_(True))
    if category:
        query = query.filter(models.MapLocation.category == category)
    if region:
        query = query.filter(models.MapLocation.region.ilike(f"%{region}%"))

    rows = query.order_by(models.MapLocation.region, models.MapLocation.name).all()
    items: list[MapLocationItem] = []
    for r in rows:
        verified = bool(getattr(r, "is_verified", False))
        if not is_visible_on_map(
            category=r.category,
            is_verified=verified,
            show_unverified_safety=show_unverified_safety,
        ):
            continue
        items.append(
            MapLocationItem(
                id=r.id,
                name=r.name,
                category=r.category,
                latitude=float(r.latitude),
                longitude=float(r.longitude),
                elevation_m=r.elevation_m,
                region=r.region,
                description=r.description,
                trek_id=r.trek_id,
                is_verified=verified,
                source_note=getattr(r, "source_note", None),
            )
        )
    return items


@router.get("/regions", response_model=list[MapRegionSummary])
def list_map_regions(db: Session = Depends(get_db)):
    rows = (
        db.query(models.MapLocation)
        .filter(models.MapLocation.is_published.is_(True), models.MapLocation.region.isnot(None))
        .all()
    )
    counts: dict[str, int] = {}
    for r in rows:
        if r.region:
            counts[r.region] = counts.get(r.region, 0) + 1
    return [
        MapRegionSummary(region=name, location_count=count)
        for name, count in sorted(counts.items())
    ]
