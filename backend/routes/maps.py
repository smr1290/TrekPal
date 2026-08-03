from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from db import get_db
from schemas import MapLocationItem, MapRegionSummary
from services.map_visibility import is_visible_on_map, trust_label
import models

router = APIRouter()


def _to_item(row: models.MapLocation) -> MapLocationItem:
    verified = bool(getattr(row, "is_verified", False))
    return MapLocationItem(
        id=row.id,
        name=row.name,
        category=row.category,
        latitude=float(row.latitude),
        longitude=float(row.longitude),
        elevation_m=row.elevation_m,
        region=row.region,
        description=row.description,
        trek_id=row.trek_id,
        is_verified=verified,
        source_note=getattr(row, "source_note", None),
        trust_label=trust_label(category=row.category, is_verified=verified),
    )


@router.get("/locations", response_model=list[MapLocationItem])
def list_map_locations(
    category: str | None = Query(default=None),
    region: str | None = Query(default=None),
    show_unverified_safety: bool = Query(
        default=False,
        description="If false, hide unverified hospital/emergency pins (safer default).",
    ),
    verified_only: bool = Query(
        default=False,
        description="If true, only return verified landmarks.",
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
            verified_only=verified_only,
        ):
            continue
        items.append(_to_item(r))

    # Verified landmarks first within the filtered set (stable secondary sort by name).
    items.sort(key=lambda item: (not item.is_verified, item.name.lower()))
    return items


@router.get("/regions", response_model=list[MapRegionSummary])
def list_map_regions(
    show_unverified_safety: bool = Query(default=False),
    verified_only: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.MapLocation)
        .filter(models.MapLocation.is_published.is_(True), models.MapLocation.region.isnot(None))
        .all()
    )
    counts: dict[str, list[int]] = {}
    for r in rows:
        verified = bool(getattr(r, "is_verified", False))
        if not is_visible_on_map(
            category=r.category,
            is_verified=verified,
            show_unverified_safety=show_unverified_safety,
            verified_only=verified_only,
        ):
            continue
        if not r.region:
            continue
        bucket = counts.setdefault(r.region, [0, 0])
        bucket[0] += 1
        if verified:
            bucket[1] += 1

    return [
        MapRegionSummary(region=name, location_count=total, verified_count=verified)
        for name, (total, verified) in sorted(counts.items())
    ]
