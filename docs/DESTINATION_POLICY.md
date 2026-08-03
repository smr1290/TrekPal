# Destination policy (Phase 2 / R2)

**Decision:** Destinations stay **freeform** (not a hard FK to `treks`) so users can plan routes outside the catalog. Weather/maps use fuzzy alias matching.

**Validation (API):** `services/destination.py` via Pydantic on `PrepareTrekRequest` and `TripPlanGenerateRequest`:

- Optional on prepare (null/empty OK)
- Required on trip-plan generate
- Length 2–150
- No control characters
- Allowed charset: letters, numbers, spaces, `- . ' , / ( )`

**DB:** Check constraints on `user_trek_history.destination` and `trip_plans.destination` (migration `013_destination_checks`).
