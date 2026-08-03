"""Reusable ownership checks for user-scoped resources (Phase 2 / R1)."""

from typing import Type, TypeVar

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from db import get_db
from security import get_current_user
import models

T = TypeVar("T")


def get_owned_resource(
    model: Type[T],
    resource_id: int,
    user: models.User,
    db: Session,
    *,
    id_attr: str = "id",
    owner_attr: str = "user_id",
    not_found_detail: str = "Resource not found",
) -> T:
    """
    Load a row by id and require it belongs to ``user``.

    Always returns 404 (not 403) when missing or not owned — avoids leaking
    whether another user's resource id exists.
    """
    column_id = getattr(model, id_attr)
    column_owner = getattr(model, owner_attr)
    row = (
        db.query(model)
        .filter(column_id == resource_id, column_owner == user.id)
        .first()
    )
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=not_found_detail,
        )
    return row


def owned_history(
    history_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> models.UserTrekHistory:
    """FastAPI dependency: owned UserTrekHistory or 404."""
    return get_owned_resource(
        models.UserTrekHistory,
        history_id,
        current_user,
        db,
        not_found_detail="History not found",
    )


def owned_trip_plan(
    plan_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> models.TripPlan:
    """FastAPI dependency: owned TripPlan or 404."""
    return get_owned_resource(
        models.TripPlan,
        plan_id,
        current_user,
        db,
        not_found_detail="Trip plan not found",
    )
