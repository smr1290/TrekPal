# TrekPal

Nepal trekking preparation app — packing lists, risk bands, weather watch-outs, knowledge guides, maps, itineraries, and grounded AI chat.

**Full AI / Claude briefing (architecture, APIs, milestones, refining prompts):** see [`CLAUDE.md`](./CLAUDE.md).

---

## Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Leaflet  
- **Backend:** FastAPI, SQLAlchemy, Alembic, PostgreSQL, JWT httpOnly cookies, Groq, Open-Meteo  

## Quick start

```powershell
# API + Postgres
docker compose up -d --build

# Frontend
cd frontend
npm install
npm run dev
```

- App: http://localhost:3000  
- API docs: http://localhost:8000/docs  
- Copy `backend/.env.example` → `backend/.env` (set `JWT_SECRET`; add `GROQ_API_KEY` for chat/planner AI)  

Migrations:

```powershell
docker compose exec -T api alembic upgrade head
```

## Product status

Milestones **M1–M10** are done (trust, funnel, profile, deletes, knowledge sources, maps curation, httpOnly auth, API tests, catalog media, weather). Details: [`MILESTONES_PRODUCT.md`](./MILESTONES_PRODUCT.md).

## Using Claude for refining tips

1. Open [`CLAUDE.md`](./CLAUDE.md).  
2. Paste/attach it into Claude.  
3. Ask e.g. *“Top 10 refining tips ranked by impact vs effort.”*  

Prompt starters are listed at the bottom of `CLAUDE.md`.
