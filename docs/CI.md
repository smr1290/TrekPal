# TrekPal CI (S4)

GitHub Actions runs on every **pull request** and every **push to `main`**.

Workflow file: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

## What runs

| Job | What it checks |
|-----|----------------|
| **Backend tests** | PostgreSQL 16 service → `alembic upgrade head` → `pytest tests/` |
| **Frontend lint & build** | `npm run lint` (ESLint) → `npm run build` (Next.js production build) |

Both jobs must pass. A failing test, lint error, or broken build turns the check **red**.

## Run the same checks locally

From the repo root (PowerShell examples):

### Backend

Requires PostgreSQL reachable at `DATABASE_URL` (Docker Compose is fine):

```powershell
docker compose up -d db
docker compose exec -T api alembic upgrade head

cd backend
$env:APP_ENV = "development"
$env:DATABASE_URL = "postgresql://postgres:root@localhost:5432/TrekPal"
$env:JWT_SECRET = "ci-test-secret-long-enough-for-pytest-0123456789"
$env:CORS_ORIGINS = "http://localhost:3000"
$env:ENABLE_INTERNAL_ML = "false"
python -m pytest tests/ -q
```

Or inside the API container (DB host is `db`):

```powershell
docker compose exec -T api pytest tests/ -q
```

### Frontend

```powershell
cd frontend
npm ci
npm run lint
$env:NEXT_PUBLIC_API_URL = "http://localhost:8000"
npm run build
```

## Groq / secrets in CI

CI does **not** need `GROQ_API_KEY`. Smoke tests use rule-based paths and public routes; chat/planner Groq calls are not exercised in pytest.

## Branch protection (recommended)

In GitHub → **Settings → Branches → Branch protection rules** for `main`:

1. Require status checks: **Backend tests** and **Frontend lint & build**
2. Require branches to be up to date before merging

That makes green CI a hard gate before merge.

## Verify CI itself

1. Push this workflow to `main` — the **CI** workflow should appear under **Actions**.
2. Open a test PR with a deliberate failure (e.g. `assert False` in a test) — checks should go red.
3. Revert the failure — checks should go green again.
