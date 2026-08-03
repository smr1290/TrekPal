# TrekPal — Project Brief for Claude (Refining Tips)

> **How to use this file:** Paste or attach this document into Claude and ask for refining tips (architecture, UX, security, AI features, performance, deployment).  
> **Audience:** Claude / AI assistants — not end users.  
> **Owner:** Beginner developer learning full-stack while building TrekPal. Prefer clear explanations and incremental advice over rewrite-everything plans.

**Last updated:** August 2026 (product milestones M1–M10 done; premium UI + Framer Motion effects in place).

---

## One-sentence product

**TrekPal** is a Nepal-focused trekking preparation “destination buddy”: pack lists, risk bands, weather watch-outs, knowledge guides, maps, itineraries, and grounded AI chat — Next.js frontend + FastAPI/PostgreSQL backend.

---

## What I want from Claude

Please give **practical refining tips**, prioritized by impact. Focus areas (pick what matters most):

1. **Product / UX** — funnel clarity, trust, premium feel without clutter  
2. **Architecture** — frontend/backend structure, coupling, scalability  
3. **Security** — auth cookies, IDOR, deploy hardening  
4. **AI features** — Groq chat grounding, trip planner quality, rate limits  
5. **Data / ML** — risk engine, gear heuristics vs real models  
6. **Performance & DX** — Next.js, Docker, tests, CI  
7. **What to build next** — after M1–M10, what is the highest-leverage milestone?

Constraints when advising:

- Do **not** suggest rewriting the whole app unless clearly justified.  
- Prefer incremental, shippable slices.  
- Preserve alpine green “High Lodge” brand (Fraunces + Manrope). Avoid purple/glow clichés, Inter/Roboto defaults, cream-terracotta newspaper looks.  
- Safety-critical map/medical content must stay honest (no fake “live rescue”).  
- Builder is a **beginner** — explain *why*, not only *what*.

---

## Product vision

Become a trusted Himalayan trek prep companion (not a generic packing list app):

- Choose a Nepal route → understand risk/weather → pack with local rent tips → save plans → ask grounded questions.  
- Tone: calm, premium, trail-buddy.  
- Markets: beginners planning Nepal teahouse treks (EBC, Annapurna, Langtang, etc.).

### Core user journey (success path)

1. Land on Home → Sign up  
2. Dashboard hub  
3. Browse **Treks** → **Plan this trek** (URL prefill)  
4. **Plan trip**: checklist and/or full itinerary + weather panel  
5. Save → **My plans**  
6. Optional: Knowledge, Maps, Chat  

---

## Tech stack (current)

| Layer | Choice |
|-------|--------|
| Frontend | Next.js **16.1.6** App Router, React **19**, TypeScript, Tailwind **v4** |
| Motion / UI | Framer Motion, custom CSS tokens, Leaflet maps |
| Backend | FastAPI, Uvicorn, SQLAlchemy 2, Pydantic, Alembic |
| DB | PostgreSQL 16 (Docker Compose) |
| Auth | JWT in **httpOnly cookie** (`credentials: 'include'`); profile cache in `localStorage` |
| AI | Groq (`GROQ_API_KEY`) for chat / trip planning |
| Weather | Open-Meteo (no API key) via `backend/services/weather.py` |
| Tests | `pytest` under `backend/tests/` |

### Run locally

```powershell
# API + DB
docker compose up -d --build

# Frontend
cd frontend
npm install
npm run dev
```

- App: `http://localhost:3000`  
- API docs: `http://localhost:8000/docs`  
- Env: `backend/.env` from `.env.example` (needs `JWT_SECRET`, optional `GROQ_API_KEY`)  
- Frontend env: `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`)  
- Migrations: `docker compose exec -T api alembic upgrade head`

---

## Repository map

```text
trekpal/
├── CLAUDE.md                 ← this brief
├── README.md                 ← human quickstart (keep in sync)
├── MILESTONES_PRODUCT.md     ← product slices M1–M10
├── MILESTONES.md             ← long AI-dev rules / vision (aspirational)
├── docker-compose.yml        ← Postgres + API
├── frontend/
│   ├── app/                  ← pages (App Router)
│   ├── components/           ← UI + Reveal/PageTransition/WeatherPanel/…
│   ├── context/AuthContext.tsx
│   ├── lib/api.ts, types.ts, badgeHelpers, knowledgeTrust
│   └── public/               ← hero.jpg, catalog media
└── backend/
    ├── main.py, db.py, models.py, schemas.py, config.py, auth_deps.py
    ├── routes/               ← auth, prepare, treks, history, gear, knowledge,
    │                           chat, trip_plans, maps, weather, ml (gated)
    ├── services/             ← weather, trip_planner, knowledge_trust, maps, rate_limit…
    ├── alembic/versions/     ← 001–012
    └── tests/
```

---

## Frontend routes

| Path | Access | Role |
|------|--------|------|
| `/` | Public | Brand-first hero, destination buddy story |
| `/login`, `/signup` | Public | Auth → `/dashboard` |
| `/dashboard` | Auth | Hub: quick links, recent checklists/itineraries |
| `/treks` | Public | Catalog + region/difficulty filters → Plan trip |
| `/gear` | Public | Kit catalog + rent tips |
| `/planner` | Auth | Checklist + itinerary tabs, weather, prefill from treks |
| `/prepare` | Auth | Legacy prepare entry (funnel leans on `/planner`) |
| `/history`, `/history/[id]` | Auth | Saved plans; delete supported |
| `/knowledge`, `/knowledge/[slug]` | Public | Guides with source trust UX |
| `/maps` | Public | Leaflet + curated landmarks (verified defaults) |
| `/chat` | Auth | Groq RAG-style answers + knowledge sources (rate limited) |
| `/profile` | Auth | Edit name / experience level |

Protection is **client-side** via `ProtectedRoute` (no Next.js middleware yet). APIs enforce JWT via cookie.

### Design system (“High Lodge”)

- Tokens in `frontend/app/globals.css`: alpine mist greens, Fraunces display + Manrope body  
- Shared: `Button` (motion hover/tap), `Card` (spotlight), `Input`, `Select`, `Badge`, `PageHeader`, chips  
- Effects: `Reveal` / `Stagger`, `PageTransition`, ambient orbs, button shine, ken-burns hero  
- Respect `prefers-reduced-motion`  
- Nav: logo | center links | account links; glass + scroll elevation  

---

## Backend API surface (high level)

Routers registered in `backend/routes/__init__.py`:

| Prefix | Purpose |
|--------|---------|
| `/auth` | Signup, login, logout, me, profile update; sets httpOnly JWT cookie |
| `/trek` | Catalog, prepare checklist/risk/gear, history CRUD-ish |
| `/gear` | Gear catalog |
| `/knowledge` | Articles list/detail |
| `/chat` | Authenticated Q&A (Groq + knowledge grounding, rate limit) |
| `/trip-plans` | Full itineraries CRUD/generate |
| `/maps` | Locations with visibility/verification filters |
| `/weather` | Forecast + alerts by destination |
| `/ml` | Internal estimates — **off in production** unless `ENABLE_INTERNAL_ML=true` |

Auth pattern: browser sends cookie automatically; do not put JWT in `localStorage` (M7).

---

## Data model (SQLAlchemy)

| Model | Role |
|-------|------|
| `User` | Profile + bcrypt password + experience_level |
| `Trek` | Catalog: region, summary, seasons, highlights, image |
| `Gear` | Catalog: category, quantity/rent hints, photos |
| `UserTrekHistory` | Saved checklist prep + risk; optional destination |
| `TrekGearRecommendation` | History ↔ gear links |
| `KnowledgeArticle` | Guides + source fields for trust |
| `TripPlan` | Day-by-day itineraries |
| `MapLocation` | Landmarks with verified / category flags |

Migrations: Alembic `001`–`012` (latest includes trek catalog content + media).

---

## Product milestones status

See `MILESTONES_PRODUCT.md`. Summary:

| ID | Focus | Status |
|----|--------|--------|
| M1 | Trust & clarity copy/errors | Done |
| M2 | Treks → Plan trip funnel | Done |
| M3 | Profile edit experience | Done |
| M4 | Delete saved plans | Done |
| M5 | Knowledge sources UX | Done |
| M6 | Maps curation | Done |
| M7 | httpOnly JWT cookies | Done |
| M8 | API tests + lock `/ml` | Done |
| M9 | Catalog media | Done |
| M10 | Open-Meteo weather on Plan trip | Done |

Recent UI work (post-M10): dashboard hub, catalog content, High Lodge design system, Framer Motion effects layer.

---

## What works well today

- End-to-end prep funnel with weather context  
- Cookie auth better than early localStorage JWT  
- Knowledge + chat grounding + source links  
- Maps honesty about unverified medical pins  
- Cohesive premium visual language and motion primitives  
- Dockerized API + DB for beginners  

---

## Known gaps / risks (honest)

Use these as refining targets:

### Security & auth

- Client-only page guards; no Next middleware / SSR session gate  
- Confirm all mutating routes require auth + ownership (history/plans)  
- Cookie `Secure` / SameSite / production CORS must be correct for deploy  
- Weak `JWT_SECRET` blocked in production config — verify deploy checklist  

### Product / AI

- Risk + gear still largely **rule/heuristic**, not trained ML  
- Trip planner / chat quality depends on Groq key + prompts  
- Chat rate limit exists; abuse/cost controls may need more  
- `/prepare` vs `/planner` overlap may confuse  

### Engineering

- Root `README.md` was historically outdated (prefer this file + keep README short)  
- Some TS nullability mismatches (`destination: string | null`)  
- Unused / heavy deps historically in `requirements.txt` (Supabase etc.) — audit  
- Frontend tests minimal/absent; backend has smoke/product/weather tests  
- No CI/CD story documented in-repo for production  

### UX

- Effects are intentional; watch for motion fatigue / performance on low-end devices  
- Mobile polish for planner/maps/chat can always improve  
- Accessibility (focus traps, map keyboard, contrast) not fully audited  

---

## Architecture sketch

```text
Browser (Next.js)
  ├── AuthContext (user profile cache)
  ├── fetch + credentials: 'include'  →  FastAPI
  └── Pages / components (Reveal, WeatherPanel, TrekMap…)

FastAPI
  ├── JWT httpOnly cookie auth deps
  ├── Routes → Services (weather, trip_planner, knowledge_trust…)
  ├── SQLAlchemy → PostgreSQL
  └── External: Groq, Open-Meteo, OSM tiles (client Leaflet)
```

---

## Suggested prompt starters for Claude

Copy one of these after attaching this file:

1. “Given TrekPal’s current state, list the **top 10 refining tips** ranked by impact vs effort. Mark each as UX / security / architecture / AI.”  
2. “Critique the **Plan trip** funnel and propose a cleaner information architecture without a full rewrite.”  
3. “Review **auth + cookie** design for a Vercel + Railway/Render deploy. Checklist gaps?”  
4. “How should we evolve **risk/gear** from heuristics toward real ML without breaking the product?”  
5. “Audit the **premium UI** for beginner pitfalls: motion, a11y, performance, brand consistency.”  
6. “Propose **M11–M15** product milestones that make TrekPal investor/demo ready.”  

---

## Glossary

| Term | Meaning |
|------|---------|
| Plan trip / planner | Main prep UI: checklist + itinerary + weather |
| Checklist / history | Saved packing prep + risk band |
| Trip plan | Full day-by-day itinerary entity |
| High Lodge | Current alpine-green premium visual system |
| Grounded chat | Answers tied to knowledge articles + sources |
| Verified map pin | Curated landmark; not live emergency routing |

---

## One paragraph for Claude’s system context

TrekPal is a learning-driven startup product: Next.js 16 + Tailwind 4 + Framer Motion frontend and FastAPI + PostgreSQL backend for Nepal trek preparation. Users authenticate with JWT httpOnly cookies, browse treks/gear/knowledge/maps, plan checklists and itineraries with Open-Meteo weather, and ask Groq-powered chat grounded in knowledge articles. Product milestones M1–M10 are complete; UI aims for a premium alpine “trail buddy” feel. The builder wants incremental refining tips—not a greenfield rewrite—with teaching-friendly rationale, strong security/honesty for safety content, and clear next milestones.
