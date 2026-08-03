# TrekPal

Nepal trekking preparation app — packing lists, risk bands, weather, knowledge, maps, itineraries, and grounded AI chat.

## Full project context (for Claude / AI)

**Use this file when asking Claude for refining tips:**

→ **[`CLAUDE.md`](./CLAUDE.md)** — complete architecture, routes, APIs, models, auth, design system, milestones, gaps, and prompt starters.

Also useful: [`MILESTONES_PRODUCT.md`](./MILESTONES_PRODUCT.md) (M1–M10).

---

## Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Leaflet  
- **Backend:** FastAPI, SQLAlchemy, Alembic, PostgreSQL, JWT httpOnly cookies, Groq, Open-Meteo  

## Quick start

```powershell
docker compose up -d --build
docker compose exec -T api alembic upgrade head

cd frontend
npm install
npm run dev
```

- App: http://localhost:3000  
- API docs: http://localhost:8000/docs  
- Env: copy `backend/.env.example` → `backend/.env` (`JWT_SECRET`; optional `GROQ_API_KEY`)  

## Status

Product milestones **M1–M10** are done. Details in `MILESTONES_PRODUCT.md` and the full map in `CLAUDE.md`.
