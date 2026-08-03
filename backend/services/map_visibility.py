"""Map POI visibility and trust labeling helpers.

Unverified hospital/emergency pins must not appear as live rescue guidance.
"""

from __future__ import annotations

SENSITIVE_CATEGORIES = frozenset({"hospital", "emergency"})


def is_sensitive_category(category: str | None) -> bool:
    return (category or "").strip().lower() in SENSITIVE_CATEGORIES


def is_visible_on_map(
    *,
    category: str,
    is_verified: bool,
    show_unverified_safety: bool,
    verified_only: bool = False,
) -> bool:
    """Return whether a POI should appear given the user's filters."""
    if verified_only and not is_verified:
        return False
    if is_sensitive_category(category) and not is_verified and not show_unverified_safety:
        return False
    return True


def trust_label(*, category: str, is_verified: bool) -> str:
    """Short UI label for how much to trust a pin."""
    if is_sensitive_category(category) and not is_verified:
        return "Demo pin — not for emergencies"
    if is_verified:
        return "Verified landmark"
    return "Approximate / editorial"
