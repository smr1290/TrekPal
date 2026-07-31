"""Map POI visibility helpers.

Unverified hospital/emergency pins must not appear as live rescue guidance.
"""

from __future__ import annotations

SENSITIVE_CATEGORIES = frozenset({"hospital", "emergency"})


def is_visible_on_map(
    *,
    category: str,
    is_verified: bool,
    show_unverified_safety: bool,
) -> bool:
    """Return whether a POI should appear given the user's safety filter."""
    if category in SENSITIVE_CATEGORIES and not is_verified and not show_unverified_safety:
        return False
    return True
