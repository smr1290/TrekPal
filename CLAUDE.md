# TrekPal — Full Project Context (for Claude / AI)

> **Purpose:** Paste or attach this entire file into Claude when you want refining tips, architecture review, or feature advice.  
> **Owner:** Beginner full-stack learner building TrekPal as a real product. Prefer incremental advice + teaching, not rewrite-everything plans.  
> **Last updated:** August 2026 (M1–M10 done; High Lodge UI + Framer Motion; httpOnly JWT cookies).

---

## How to use this with Claude

1. Attach this file (or paste it).  
2. Ask something specific, e.g.:
   - “Top 10 refining tips ranked by impact vs effort (UX / security / architecture / AI).”
   - “Critique the Plan trip funnel; propose cleaner IA without a full rewrite.”
   - “Auth cookie checklist for Vercel frontend + Railway/Render API deploy.”
   - “Propose M11–M15 milestones for demo/investor readiness.”
3. Constraints for Claude: preserve alpine High Lodge brand; no purple/glow clichés; safety/maps honesty; beginner-friendly explanations; small shippable slices.

---

## 1. Product summary

**TrekPal** is a Nepal-focused trekking preparation “destination buddy.”

Users can:

1. Sign up / log in  
2. Browse Nepal treks and gear  
3. Plan a trek (packing checklist + risk + budget heuristics)  
4. Generate day-by-day itineraries  
5. See destination weather watch-outs (Open-Meteo)  
6. Read knowledge guides with source trust UX  
7. Orient on curated maps (not live rescue)  
8. Ask grounded AI chat (Groq + knowledge articles)  
9. Save / delete plans and edit experience level  

**Vision:** Calm, premium Himalayan prep — not a generic packing-list toy.

**Success path:**

```text
Home → Signup → Dashboard → Treks → Plan this trek → Planner
  (checklist / itinerary + weather) → My plans → optional Knowledge / Maps / Chat
```

---

## 2. Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js **16.1.6** (App Router), React **19.2.3**, TypeScript, Tailwind **v4** |
| Motion / maps | Framer Motion, Leaflet + react-leaflet |
| Backend | FastAPI, Uvicorn, SQLAlchemy 2, Pydantic, Alembic |
| DB | PostgreSQL 16 (Docker Compose) |
| Auth | JWT in **httpOnly cookie** `trekpal_access`; profile cache in `localStorage` |
| AI | Groq (`GROQ_API_KEY`, default model `llama-3.3-70b-versatile`) |
| Weather | Open-Meteo (no key) |
| Tests | pytest: smoke, product rules, weather units |

**URLs (local):**

- Frontend: `http://localhost:3000`  
- API: `http://localhost:8000` (docs `/docs`)  
- Frontend env: `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`)

---

## 3. How to run

```powershell
# From repo root — API + Postgres
docker compose up -d --build

# Migrations
docker compose exec -T api alembic upgrade head

# Frontend
cd frontend
npm install
npm run dev
```

**Backend `.env`** (from `backend/.env.example`):

```text
DATABASE_URL=postgresql://postgres:root@localhost:5432/TrekPal
APP_ENV=development
JWT_SECRET=replace-with-a-long-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=http://localhost:3000
GROQ_API_KEY=...
GROQ_MODEL=llama-3.3-70b-versatile
# AUTH_COOKIE_NAME=trekpal_access
# AUTH_COOKIE_SECURE=false   # local HTTP
# ENABLE_INTERNAL_ML=false   # /ml off in production unless true
```

Docker Compose overrides `DATABASE_URL` to host `db` and loads `backend/.env`.

---

## 4. Repository structure

```text
trekpal/
├── CLAUDE.md / this full context
├── README.md
├── MILESTONES_PRODUCT.md      # Phase 1–3 product roadmap status
├── MILESTONES.md              # long aspirational AI-dev rules
├── docker-compose.yml
├── frontend/
│   ├── app/                   # Next.js pages + globals.css + layout
│   ├── components/            # UI, planner panel, map, weather, motion
│   ├── context/AuthContext.tsx
│   ├── lib/                   # api.ts, types.ts, badgeHelpers, knowledgeTrust
│   └── public/                # hero.jpg, catalog SVG placeholders
└── backend/
    ├── main.py, config.py, db.py, security.py, models.py
    ├── schemas/               # Pydantic package
    ├── routes/                # FastAPI routers
    ├── services/              # weather, trip_planner, maps, rate_limit…
    ├── ml/                    # heuristic risk/gear/budget estimates
    ├── alembic/versions/      # 001–012
    └── tests/
```

**Note:** Auth lives in `backend/security.py` (not `auth_deps.py`). Schemas are a package under `backend/schemas/`.

---

## 5. Auth model (important)

### Current (M7)

1. `POST /auth/signup` or `/auth/login` validates credentials, creates JWT (`sub` = user id).  
2. API sets **httpOnly** cookie `trekpal_access` (`SameSite=lax`, `Secure` in non-local envs, `path=/`).  
3. JSON may also return token for compatibility; **frontend must not store JWT in localStorage**.  
4. All authenticated `fetch` calls use `credentials: 'include'`.  
5. `AuthContext` caches `{ id, full_name, experience_level, email? }` in `localStorage` key `trek_pal_user` for UI only.  
6. On mount: `GET /auth/me` hydrates session; failure clears cache.  
7. `POST /auth/logout` clears cookie.  
8. On API `401`: clear cache + dispatch `trekpal:auth-expired`.  
9. `get_current_user`: prefers `Authorization: Bearer`, else cookie.

### Protection

- **Pages:** client `ProtectedRoute` → `/login?next=…` (no Next.js middleware yet).  
- **APIs:** JWT required on mutating / private routes; history & trip-plans check ownership.

### Gaps for refining tips

- No SSR/middleware session gate  
- Deploy checklist: `Secure`, CORS, HTTPS, cookie domain  
- Confirm every private route has ownership checks  

---

## 6. Frontend routes

Shell: `layout.tsx` → `AuthProvider` → `Navbar` → `PageTransition` → `main` → `Footer`.

| Path | Client? | Protected? | Purpose |
|------|---------|------------|---------|
| `/` | Server | No | Brand-first hero + buddy story |
| `/login` | Client | No | Login; supports `?next=` |
| `/signup` | Client | No | Signup + experience level → dashboard |
| `/dashboard` | Client | Yes | Hub: quick links, recent plans |
| `/treks` | Client | No | Catalog → Plan trip URL prefill |
| `/gear` | Client | No | Kit + rent tips |
| `/planner` | Client | Yes | Checklist + itinerary + weather |
| `/prepare` | Server | — | Redirect → `/planner?tab=checklist` |
| `/history` | Client | Yes | My plans (delete) |
| `/history/[id]` | Client | Yes | Checklist detail |
| `/knowledge` | Client | No | Article list |
| `/knowledge/[slug]` | Client | No | Article + sources/disclaimer |
| `/maps` | Client | No | Leaflet + trust filters |
| `/chat` | Client | Yes | Grounded AI Q&A |
| `/profile` | Client | Yes | Edit name / experience |

### Key components

| Component | Role |
|-----------|------|
| `Button` | Motion hover/tap + shine |
| `Card` | Spotlight + interactive lift |
| `PrepareTrekPanel` | Checklist form + prepare API + results |
| `WeatherPanel` | Forecast + warnings by destination |
| `TrekMap` | Leaflet markers (verified styling) |
| `Reveal` / `Stagger` | Scroll-in motion |
| `PageTransition` | Route fade |
| `ProtectedRoute` | Client auth gate |
| `CatalogImage` | Image + fallback |
| `ui.tsx` | PageHeader, EmptyState, skeletons |

### API client (`lib/api.ts`)

| Client | Methods |
|--------|---------|
| `authApi` | signup, login, logout, me, updateMe |
| `trekApi` | prepareTrek, listTreks, getHistory, getHistoryDetail, deleteHistory |
| `gearApi` | listGear |
| `knowledgeApi` | listArticles, getArticle |
| `chatApi` | ask |
| `tripPlanApi` | generate, list, get, delete |
| `mapsApi` | listLocations |
| `weatherApi` | forecast |

Types: `lib/types.ts` (`User`, `Trek`, `Gear`, history, knowledge, chat, trip plans, maps, weather…).

---

## 7. Design system — “High Lodge”

**Fonts:** Fraunces (display), Manrope (body).  

**Palette:** alpine mist greens — `--background #dfe8e2`, `--accent #146649`, `--accent-deep #0a3324`, paper surfaces, semantic success/warning/danger/info.

**Effects classes:** `.app-shell` grain/gradients, `.btn-shine`, `.card-spotlight`, `.ambient-orb`, `.aurora-band`, `.hero-kenburns`, `.skeleton-shimmer`, `.chip*`, `.eyebrow`, `.display-title`, `.nav-glass` / `.nav-elevated`.

**Rules:** brand-first hero; cards mainly for interaction; avoid purple/glow/Inter defaults; honor `prefers-reduced-motion`.

---

## 8. Backend API (complete)

Mounted from `routes/__init__.py`. Auth = `Depends(get_current_user)`.

### `/auth`
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/auth/signup` | No | Create user; set cookie |
| POST | `/auth/login` | No | Login; set cookie |
| POST | `/auth/logout` | No | Clear cookie |
| GET | `/auth/me` | Yes | Profile |
| PATCH | `/auth/me` | Yes | Update name / experience |

### `/trek`
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/trek/prepare-trek` | Yes | Risk, gear, budget, save history |
| GET | `/trek/list` | No | Trek catalog |
| GET | `/trek/history` | Yes | List saved checklists |
| GET | `/trek/history/{id}` | Yes | Detail + gear (owned) |
| DELETE | `/trek/history/{id}` | Yes | Delete (owned) |

### `/gear`
| GET | `/gear/` | No | Gear catalog |

### `/knowledge`
| GET | `/knowledge/` | No | Articles (filters) |
| GET | `/knowledge/{slug}` | No | Detail + disclaimer |

### `/chat`
| POST | `/chat/ask` | Yes | Groq + knowledge; **20 asks/user/hour** |

### `/trip-plans`
| POST | `/trip-plans/generate` | Yes | Generate + save itinerary |
| GET | `/trip-plans/` | Yes | List |
| GET | `/trip-plans/{id}` | Yes | Detail |
| DELETE | `/trip-plans/{id}` | Yes | Delete |

### `/maps`
| GET | `/maps/locations` | No | POIs (verified / hide unverified medical by default) |
| GET | `/maps/regions` | No | Region summaries |

### `/weather`
| GET | `/weather/forecast` | No | Open-Meteo by destination |

### `/ml` (only if `ENABLE_INTERNAL_ML_ROUTES`)
Internal estimates: risk, difficulty, budget, recommend-treks, insights — all auth-gated. Plan trip already exposes user-facing estimates via prepare/trip-plans.

### Health
| GET | `/` | Health message |

---

## 9. Database models

| Model | Table | Notes |
|-------|-------|-------|
| `User` | `users` | email unique, password_hash, experience_level |
| `Trek` | `treks` | region, summary, best_seasons, highlights, image_url |
| `Gear` | `gear` | category, slug, quantity_hint, rent_hint, photo_url |
| `UserTrekHistory` | `user_trek_history` | prep inputs, risk_level, destination; no hard FK to trek row |
| `TrekGearRecommendation` | `trek_gear_recommendations` | history ↔ gear |
| `KnowledgeArticle` | `knowledge_articles` | content, source_url/label, category, published |
| `TripPlan` | `trip_plans` | plan_json, destination, difficulty, risk, source |
| `MapLocation` | `map_locations` | lat/lng, category, is_verified, is_published |

### Alembic 001–012

| Rev | Change |
|-----|--------|
| 001 | Initial users/treks/gear/history/recommendations |
| 002 | Knowledge articles |
| 003 | Trip plans |
| 004 | Map locations |
| 005 | Expand gear catalog |
| 006 | Gear slug / quantity / rent realism |
| 007 | Map `is_verified` |
| 008 | History `destination` |
| 009 | Knowledge source fields |
| 010 | Map curation / safer pins |
| 011 | Catalog media URLs |
| 012 | Trek region/summary/seasons/highlights |

---

## 10. Services & ML

| Service | Role |
|---------|------|
| `weather.py` | Destination → coords; Open-Meteo; day summaries + cold/snow/wind/rain warnings |
| `trip_planner.py` | Itineraries: Groq + knowledge retrieve + rule fallback; packing/duration/permits helpers |
| `knowledge_trust.py` | Category disclaimers; has_source detection |
| `map_visibility.py` | Hide unverified hospital/emergency by default |
| `rate_limit.py` | In-memory chat limit 20/user/hour |
| `permits.py` | Nepal permit guidance by keywords / traveler type |
| `catalog_media.py` | Validate public SVG/media paths |

**`backend/ml/`:** heuristic feature builders and predictors used by prepare + optional `/ml` (risk, difficulty, budget, trek recommend) — **not** a trained production model pipeline yet.

**Prepare flow (conceptual):**

```text
User inputs (destination, altitude, season, duration, experience, difficulty)
  → score risk band (Low/Moderate/High)
  → recommend gear (name/category heuristics + catalog)
  → optional budget / trek suggestions
  → save UserTrekHistory + TrekGearRecommendation rows
```

---

## Product milestones

### Phase 1 (done) — see `MILESTONES_PRODUCT.md`

Trust, funnel, profile, deletes, knowledge/maps, httpOnly auth, API tests, catalog media, weather.

### Phase 2 (done) — R1–R12

Ownership, destinations, IA, heuristics, planner reliability, visual/mobile/motion, trust UX, Postgres rate limits, structured logging, onboarding.

### Phase 3 (active) — `.cursor/rules/milestones.mdc` Milestone 1–8 = **S1–S8**

Ship readiness: close laptop-MVP → public-internet gaps.

| ID | Focus | Status |
|----|--------|--------|
| S1 | Production env & secrets hardening | Done |
| S2 | Production auth cookies (cross-origin) | Pending |
| S3 | Production deploy (API + DB + frontend) | Pending |
| S4 | CI pipeline (tests + build on PR) | Pending |
| S5 | External AI & weather resilience | Pending |
| S6 | Observability (errors + uptime) | Pending |
| S7 | Legal & trust pages | Pending |
| S8 | Launch QA gate (phone + smoke) | Pending |

Work **one at a time** from S1.

---

## 12. Tests

| File | Covers |
|------|--------|
| `test_api_smoke.py` | Health, public routes, cookie auth `/me`, gated `/ml`, media fields, weather |
| `test_product_rules.py` | Heuristics, permits, rate limit, map visibility, knowledge trust, route registration |
| `test_weather.py` | Alias resolve, warnings, weather code labels |

Frontend: no automated test suite yet.

---

## 13. What works well

- End-to-end prep funnel with weather  
- Cookie auth stronger than early localStorage JWT  
- Knowledge + chat grounding + source links  
- Maps honesty about unverified medical pins  
- Cohesive premium visual + motion system  
- Dockerized API + DB for beginners  
- Alembic-versioned schema through 012  

---

## 14. Known gaps (refining targets)

### Security / deploy
- Client-only page guards  
- Cookie Secure/SameSite/CORS for real domains  
- Ongoing ownership audit on all private resources  
- Secrets must never be committed  

### Product / AI
- Risk/gear still rule/heuristic-heavy  
- Trip planner / chat quality depends on Groq + prompts  
- `/prepare` redirect vs `/planner` naming leftover  
- Offline/mobile polish  

### Engineering
- Some TS nullability friction (`destination: string | null`)  
- Heavy/unused deps historically in requirements (audit Supabase etc.)  
- No CI/CD documented for production  
- Duplicate `WeatherDay`/`WeatherForecast` type blocks in `types.ts`  
- In-memory rate limit won’t work multi-instance  

### UX / a11y
- Motion performance on low-end devices  
- Map keyboard / screen-reader audit  
- Planner form complexity  

---

## 15. Architecture diagram

```text
┌─────────────────────────────────────────────┐
│  Next.js (localhost:3000)                   │
│  AuthContext + ProtectedRoute               │
│  Pages → components (Weather, Map, Reveal)  │
│  fetch(credentials: 'include')              │
└──────────────────┬──────────────────────────┘
                   │ httpOnly cookie JWT
                   ▼
┌─────────────────────────────────────────────┐
│  FastAPI (localhost:8000)                   │
│  security.get_current_user                  │
│  routes → services → ml heuristics          │
│  SQLAlchemy ORM                             │
└─────────┬───────────────────┬───────────────┘
          │                   │
          ▼                   ▼
   PostgreSQL            Groq / Open-Meteo
```

---

## 16. Glossary

| Term | Meaning |
|------|---------|
| Plan trip / planner | Main prep UI (checklist + itinerary + weather) |
| Checklist / history | Saved packing prep + risk |
| Trip plan | Full day-by-day itinerary entity |
| High Lodge | Alpine-green premium design system |
| Grounded chat | Answers tied to knowledge + sources |
| Verified pin | Curated landmark; not live emergency routing |
| Prepare-trek | Backend job that scores risk and recommends gear |

---

## 17. Prompt starters for Claude

1. “Using this full context, list **top 10 refining tips** (impact × effort). Tag UX / security / architecture / AI.”  
2. “Design **M11–M15** for a polished investor demo in 4 weeks.”  
3. “Review **auth + cookies** for production deploy; give a checklist.”  
4. “How do we evolve **risk/gear** from heuristics to real ML without breaking UX?”  
5. “Audit **frontend architecture**: what to extract next (hooks, server components, middleware)?”  
6. “Critique **premium UI/motion** for a11y and performance; keep High Lodge brand.”  
7. “Propose a minimal **CI** pipeline (lint, typecheck, pytest, build).”  

---

## 18. One-paragraph dump (shortest context)

TrekPal is a Next.js 16 + React 19 + Tailwind 4 + Framer Motion frontend and FastAPI + SQLAlchemy + PostgreSQL backend for Nepal trek preparation. Auth uses JWT httpOnly cookies (`trekpal_access`) with a localStorage profile cache; APIs use `credentials: 'include'`. Features include trek/gear catalogs, prepare-trek risk/gear heuristics, trip itineraries (Groq + fallback), Open-Meteo weather, knowledge articles with source trust, curated Leaflet maps, and rate-limited grounded chat. Product milestones M1–M10 are complete; UI is “High Lodge” alpine green. The builder wants incremental refining tips with teaching rationale—not a greenfield rewrite.
