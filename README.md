# TrekPal — Project Context (for ChatGPT / AI assistants)

TrekPal is a full-stack trekking preparation app. Users sign up, browse treks and gear, submit trek parameters, get a rule-based risk level + gear recommendations, and save/view preparation history.

This README is a self-contained overview of architecture, routes, APIs, auth, data models, and known issues. Use it as context when asking an AI to help with this codebase.

---

## What the product does

1. User creates an account (name, email, password, experience level).
2. User logs in; session is stored in browser `localStorage` (not a real JWT/session yet).
3. User can browse public trek and gear catalogs.
4. Authenticated user fills a “Prepare Trek” form (trek type, altitude, season, duration).
5. Backend calculates a risk score (Low / Moderate / High) and recommends gear using name-based heuristics.
6. Preparation is saved to history; user can reopen past preparations and see recommended gear.

---

## Tech stack

### Frontend (`frontend/`)

| Piece | Choice |
|-------|--------|
| Framework | Next.js **16.1.6** (App Router) |
| UI | React **19.2.3** |
| Language | TypeScript **^5** (strict) |
| Styling | Tailwind CSS **v4** + `app/globals.css` |
| Auth state | React Context (`context/AuthContext.tsx`) |
| API calls | `fetch` wrapper in `lib/api.ts` |

Scripts: `npm run dev` | `npm run build` | `npm run start` | `npm run lint`

Default URL: `http://localhost:3000`

Env: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`)

### Backend (`backend/`)

| Piece | Choice |
|-------|--------|
| API | FastAPI **0.128** |
| Server | Uvicorn |
| ORM | SQLAlchemy **2.0** |
| DB | PostgreSQL (`psycopg2-binary`) |
| Passwords | passlib + bcrypt |
| Migrations | Alembic (`backend/alembic/`) — use `alembic upgrade head` |

Default URL: `http://localhost:8000`

CORS: allows `http://localhost:3000`

DB URL (hardcoded in `db.py`):

```text
postgresql://postgres:root@localhost:5432/TrekPal
```

---

## Repository structure

```text
trekpal/
├── README.md                 ← this file
├── frontend/
│   ├── app/                  # Next.js App Router pages
│   │   ├── layout.tsx        # Root shell: AuthProvider, Navbar, main, Footer
│   │   ├── globals.css       # Dark theme tokens + utility classes
│   │   ├── page.tsx          # Home / landing
│   │   ├── login/
│   │   ├── signup/
│   │   ├── dashboard/        # Protected
│   │   ├── prepare/          # Protected — trek preparation form
│   │   ├── history/          # Protected — list
│   │   ├── history/[id]/     # Protected — detail
│   │   ├── treks/            # Public catalog
│   │   └── gear/             # Public catalog
│   ├── components/           # Button, Card, Input, Select, Badge, Navbar, Footer, ProtectedRoute
│   ├── context/AuthContext.tsx
│   ├── lib/api.ts            # API client
│   └── lib/types.ts          # Shared TS interfaces
│
└── backend/
    ├── main.py               # FastAPI app entry + CORS + create_all
    ├── db.py                 # Engine, SessionLocal, get_db
    ├── models.py             # SQLAlchemy models
    ├── requirements.txt
    └── routes/
        ├── __init__.py       # Router registry
        ├── auth.py           # signup / login
        ├── prepare.py        # risk + gear recommendation (largest file)
        ├── treks.py          # list treks
        ├── history.py        # history list + detail
        └── gear.py           # list gear
```

---

## How the frontend starts

1. `cd frontend && npm run dev`
2. Root layout: `frontend/app/layout.tsx`
   - Wraps all pages with `AuthProvider`
   - Renders `Navbar`, `<main>{children}</main>`, `Footer`
3. Home page: `frontend/app/page.tsx` → `/`
4. Path alias: `@/*` → frontend root (e.g. `@/components/Button`)

---

## Frontend routes

| Path | File | Access |
|------|------|--------|
| `/` | `app/page.tsx` | Public |
| `/login` | `app/login/page.tsx` | Public |
| `/signup` | `app/signup/page.tsx` | Public |
| `/treks` | `app/treks/page.tsx` | Public |
| `/gear` | `app/gear/page.tsx` | Public |
| `/dashboard` | `app/dashboard/page.tsx` | Client-protected |
| `/prepare` | `app/prepare/page.tsx` | Client-protected |
| `/history` | `app/history/page.tsx` | Client-protected |
| `/history/[id]` | `app/history/[id]/page.tsx` | Client-protected |

Protection is **client-only** via `components/ProtectedRoute.tsx`: if `!isAuthenticated`, redirect to `/login`. There is **no** Next.js middleware and **no** server-side session check.

Navbar shows auth-only links (Dashboard, Prepare Trek, History) only when logged in.

---

## Auth model (important)

### How it works today

1. `POST /auth/login` returns `{ user_id, full_name, experience_level }` (no token).
2. Frontend stores that object in `localStorage` key `trek_pal_user`.
3. `isAuthenticated === !!user` from Context.
4. Protected pages trust that flag.
5. API calls that need a user pass `user_id` as a **query parameter** — backend trusts it.

### What is NOT implemented

- No JWT / session cookie
- No `Authorization` header
- No backend ownership checks on history detail
- Passwords currently sent as **URL query params** on signup/login (not JSON body)

This is fine for a local prototype, **not** production-safe.

---

## Backend API

Base: `http://localhost:8000`

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| `GET` | `/` | Health message | None |
| `POST` | `/auth/signup?full_name&email&password&experience_level` | Create user | None |
| `POST` | `/auth/login?email&password` | Login | None |
| `GET` | `/trek/list` | Trek catalog | None |
| `POST` | `/trek/prepare-trek?user_id&trek_type&experience_level&altitude&season&duration` | Risk + gear + save history | Trusts `user_id` |
| `GET` | `/trek/history?user_id=` | User history list | Trusts `user_id` |
| `GET` | `/trek/history/{history_id}` | History detail + gear | **No ownership check** |
| `GET` | `/gear/` | Gear catalog | None |

All mutating auth/prepare params are currently query strings (including password). Prefer JSON bodies when hardening.

### Valid enums (prepare)

- `trek_type`: `Easy` | `Moderate` | `Hard`
- `experience_level`: `Beginner` | `Intermediate` | `Advanced` (signup may also offer `Expert` on the UI — verify consistency)
- `season`: `Spring` | `Summer` | `Autumn` | `Winter`

### Risk logic (summary)

In `backend/routes/prepare.py`:

- Score from altitude, experience, trek type, season, duration
- `score >= 10` → High  
- `score >= 5` → Moderate  
- else → Low  

Gear recommendation scores all gear rows by **name string heuristics** (e.g. “boots”, “thermal”), sorts by score, returns top N by risk (7 / 10 / 13).

---

## Database models (`backend/models.py`)

| Model | Table | Notes |
|-------|-------|-------|
| `User` | `users` | email unique, `password_hash`, `experience_level` |
| `Trek` | `treks` | catalog: name, max altitude, typical duration, difficulty |
| `Gear` | `gear` | name, category, photo_url, description |
| `UserTrekHistory` | `user_trek_history` | preparation inputs + `risk_level`; **no FK to treks** |
| `TrekGearRecommendation` | `trek_gear_recommendations` | links `history_id` → `gear_id` |

Schema is versioned with **Alembic** (`backend/alembic/`). Prefer:

```bash
cd backend
alembic upgrade head
```

If tables already exist from older `create_all` usage and you have data:

```bash
alembic stamp head
```

`main.py` still calls `create_all` as a local convenience for missing tables; new schema changes should go through Alembic migrations. See `backend/alembic/README`.

Because history has no `trek_id`, history “trek name” often falls back to `trek_type` (difficulty label), not a real trek from the catalog.

---

## Frontend ↔ API mapping (`lib/api.ts`)

```text
authApi.signup / login          →  /auth/signup | /auth/login
trekApi.listTreks               →  GET /trek/list
trekApi.prepareTrek             →  POST /trek/prepare-trek
trekApi.getHistory              →  GET /trek/history?user_id=
trekApi.getHistoryDetail        →  GET /trek/history/{id}
gearApi.listGear                →  GET /gear/
```

Shared TypeScript shapes also live in `lib/types.ts` (many pages still use `any` for state).

---

## Styling

- Dark theme (background `#111`, borders `#27272a`, accent blue `#3b82f6`)
- Tailwind utility classes in components/pages
- CSS variables + some global classes (`.btn`, `.input-box`, `.card-box`) in `globals.css` — some may be unused if pages rely on components
- Shared UI: `Button`, `Card`, `Input`, `Select`, `Badge`, `Navbar`, `Footer`

---

## How to run locally

### Prerequisites

- Node.js + npm
- Docker Desktop (recommended — runs Postgres + API)

### Option A — Backend with Docker (recommended)

From the project root:

```powershell
docker compose up -d --build
```

This starts:
- Postgres on `localhost:5432` (data in volume `trekpal-postgres-data`)
- FastAPI on `http://localhost:8000` (docs: `http://localhost:8000/docs`)

Useful commands:

```powershell
docker compose logs -f api    # watch API logs
docker compose ps             # status
docker compose down           # stop (data is kept)
```

Inside Docker, the API talks to Postgres at hostname `db` (the Compose service name). You do **not** need to run `uvicorn` or `pip install` on your machine for this path.

### Option B — Backend on your machine (optional)

Keep Postgres in Docker, run API locally:

```powershell
docker compose up -d db
cd backend
copy .env.example .env
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload --port 8000
```

### Frontend (always on your machine for now)

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

Optional: set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `frontend/.env.local`.

---

## Existing features (checklist)

- [x] Signup / login / logout (localStorage)
- [x] Client-side protected routes
- [x] Landing page
- [x] Trek catalog + search
- [x] Gear catalog + category filter
- [x] Prepare trek form
- [x] Rule-based risk assessment
- [x] Heuristic gear recommendations
- [x] Save preparation history
- [x] History list + detail
- [x] Dashboard with recent preparations
- [x] Responsive navbar (desktop + mobile menu)

Not implemented: real JWT/session auth, gear/trek CRUD admin UI, packing checklist persistence, tests, production config/env, working Alembic for current schema.

---

## Known issues / improvement priorities

### Security (highest)

1. Passwords and sensitive params in URL query strings → use JSON bodies.
2. No JWT/session; `user_id` trusted from client → IDOR on history and prepare.
3. History detail has no ownership check.
4. Login returns 404 for unknown email vs 401 for bad password → user enumeration.
5. Hardcoded DB credentials in `db.py`.
6. Client-only route guards; APIs are open.

### Backend / ops

7. Alembic broken / orphan migrations (old notes/follows schema); `alembic.ini` may be missing.
8. Unused deps (Supabase, PyJWT, etc.) in `requirements.txt`.
9. Duplicate `get_db()` in each router instead of shared `db.get_db`.
10. No Pydantic request/response models on many endpoints.
11. History not linked to real `Trek` rows.
12. Gear rules based on fragile string matching of gear names.

### Frontend

13. Widespread `any` despite `lib/types.ts`.
14. Signup may not auto-login (depending on current page logic) — verify redirect flow.
15. `AuthProvider` can blank the whole app while hydrating from localStorage.
16. Duplicated risk/difficulty badge helpers across pages.
17. Prefer `next/image` over raw `<img>` for gear photos.
18. No shared loading/error boundaries (`loading.tsx` / `error.tsx`).

---

## Design / UX notes (current direction)

- Prefer clean, minimal, professional UI (not flashy).
- Soft/dark neutral background, one accent color.
- Reuse shared components; avoid one-off decorative patterns.
- Navbar layout intent: LEFT logo | CENTER nav links | RIGHT user + logout.
- Do not change business/API logic when only polishing UI.

---

## Constraints for AI assistants working on this repo

When editing this project:

1. Do not break routing or auth flows unless explicitly asked.
2. Prefer small, focused changes.
3. Reuse existing components (`Button`, `Card`, `Input`, `Select`, `Badge`, `Navbar`).
4. Keep frontend/backend contracts in sync if changing APIs.
5. Do not commit secrets; move DB URL and CORS origins to env when hardening.
6. Only create git commits when the user asks.

---

## Quick glossary

| Term | Meaning |
|------|---------|
| Prepare Trek | Form + backend job that scores risk and picks gear |
| Risk level | Low / Moderate / High from weighted rules |
| History | Saved preparation records for a user |
| Experience level | User profile field used in risk + gear scoring |
| ProtectedRoute | Client component that redirects if not logged in |

---

## One-paragraph summary for ChatGPT

TrekPal is a Next.js 16 + React 19 + Tailwind 4 frontend and FastAPI + SQLAlchemy + PostgreSQL backend. Users authenticate via signup/login with bcrypt-hashed passwords, but the frontend only stores `{user_id, full_name, experience_level}` in localStorage with no JWT. Public pages list treks and gear; authenticated pages let users prepare a trek (type, altitude, season, duration), receive a rule-based risk score and name-heuristic gear list, and browse saved history. API params (including passwords) are currently query strings; APIs trust client-supplied `user_id`. Schema is created with `create_all` at startup. Highest-value next work: real auth tokens, JSON request bodies, ownership checks, env-based config, and typing cleanup on the frontend.
