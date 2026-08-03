"""Destination string validation (Phase 2 / R2).

Decision: keep destinations freeform so users can plan non-catalog routes,
but reject empty garbage and oversized / control-character strings that
break weather/maps matching and DB hygiene.
"""

from __future__ import annotations

import re

DESTINATION_MAX_LEN = 150
DESTINATION_MIN_LEN = 2

# Letters, numbers, spaces, and common place punctuation (hyphen, apostrophe, comma, period, slash, parentheses).
_ALLOWED = re.compile(r"^[\w\s\-.',/()]+$", re.UNICODE)


def normalize_destination(value: str | None) -> str | None:
    """Strip whitespace; empty → None (optional field)."""
    if value is None:
        return None
    cleaned = " ".join(str(value).split())
    return cleaned or None


def validate_destination(value: str | None, *, required: bool = False) -> str | None:
    """
    Validate optional or required destination.

    Raises ValueError with a clear message for API 400 mapping.
    """
    cleaned = normalize_destination(value)
    if cleaned is None:
        if required:
            raise ValueError("Destination is required")
        return None

    if len(cleaned) < DESTINATION_MIN_LEN:
        raise ValueError(
            f"Destination must be at least {DESTINATION_MIN_LEN} characters"
        )
    if len(cleaned) > DESTINATION_MAX_LEN:
        raise ValueError(
            f"Destination must be at most {DESTINATION_MAX_LEN} characters"
        )
    if any(ord(ch) < 32 for ch in cleaned):
        raise ValueError("Destination contains invalid control characters")
    if not _ALLOWED.match(cleaned):
        raise ValueError(
            "Destination may only include letters, numbers, spaces, and - . ' , / ( )"
        )
    return cleaned
