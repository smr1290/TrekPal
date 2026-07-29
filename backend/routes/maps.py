from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from db import get_db
from schemas import MapLocationItem, MapRegionSummary
import models

router = APIRouter()


@router.get("/locations", response_model=list[MapLocationItem])
def list_map_locations(
    category: str | None = Query(default=None),
    region: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(models.MapLocation).filter(models.MapLocation.is_published.is_(True))
    if category:
        query = query.filter(models.MapLocation.category == category)
    if region:
        query = query.filter(models.MapLocation.region.ilike(f"%{region}%"))

    rows = query.order_by(models.MapLocation.region, models.MapLocation.name).all()
    return [
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
        )
        for r in rows
    ]


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
