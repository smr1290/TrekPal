# Auth & ownership audit (Phase 2 / R1)

Private/mutating routes audited against `get_current_user` and centralized ownership via `ownership.py`.

| Method | Path | Auth required? | Ownership check |
|--------|------|----------------|-----------------|
| POST | `/auth/signup` | No | N/A (creates user) |
| POST | `/auth/login` | No | N/A |
| POST | `/auth/logout` | No | N/A (clears cookie) |
| GET | `/auth/me` | Yes | Self via JWT |
| PATCH | `/auth/me` | Yes | Self via JWT |
| POST | `/trek/prepare-trek` | Yes | Writes as `current_user.id` |
| GET | `/trek/list` | No | Public catalog |
| GET | `/trek/history` | Yes | Filtered by `current_user.id` |
| GET | `/trek/history/{id}` | Yes | `owned_history` dependency |
| DELETE | `/trek/history/{id}` | Yes | `owned_history` dependency |
| GET | `/gear/` | No | Public catalog |
| GET | `/knowledge/` | No | Public |
| GET | `/knowledge/{slug}` | No | Public |
| POST | `/chat/ask` | Yes | Rate-limited per user; no foreign resource id |
| POST | `/trip-plans/generate` | Yes | Writes as `current_user.id` |
| GET | `/trip-plans/` | Yes | Filtered by `current_user.id` |
| GET | `/trip-plans/{id}` | Yes | `owned_trip_plan` dependency |
| DELETE | `/trip-plans/{id}` | Yes | `owned_trip_plan` dependency |
| GET | `/maps/locations` | No | Public curated POIs |
| GET | `/maps/regions` | No | Public |
| GET | `/weather/forecast` | No | Public |
| POST | `/ml/*` | Yes when mounted | No user-scoped ids; **not mounted** when `ENABLE_INTERNAL_ML_ROUTES` is false → **404** |

## Ownership helper

- Module: `backend/ownership.py`
- `get_owned_resource(model, id, user, db)` — single implementation
- Dependencies: `owned_history`, `owned_trip_plan`

## `/ml` when disabled

Routers only append `/ml` if `ENABLE_INTERNAL_ML_ROUTES` is true (`config.py`). Otherwise FastAPI returns **404** for `/ml/...` (route does not exist — not 403).
