# TrekPal Observability (S6)

Errors and uptime you can see without opening Docker on your laptop.

Related: [`docs/CI.md`](./CI.md) · [`docs/PRODUCTION_ENV.md`](./PRODUCTION_ENV.md) · [`docs/DEPLOY.md`](./DEPLOY.md)

---

## What is wired

| Layer | Tool | When active |
|-------|------|-------------|
| **API errors** | [Sentry](https://sentry.io) (free tier) | `SENTRY_DSN` set on Railway |
| **Frontend errors** | Sentry (`@sentry/react`) | `NEXT_PUBLIC_SENTRY_DSN` on Vercel, production build |
| **API request logs** | JSON lines → Railway logs | Always (`trekpal.request` logger) |
| **External calls** | JSON lines (`trekpal.external`) | Groq / Open-Meteo (Phase 2 / R11) |
| **Uptime** | GitHub Actions cron | Every 15 min — `.github/workflows/uptime.yml` |
| **Dependency health** | `GET /health/deps` | Always public |

Logs include **method, path, status, latency** — never JWTs, cookies, or passwords.

---

## 1. Sentry setup (recommended, free tier)

### Backend (Railway)

1. Create a Sentry project → platform **FastAPI**.
2. Copy the DSN (looks like `https://…@….ingest.sentry.io/…`).
3. Railway → TrekPal API service → **Variables**:
   - `SENTRY_DSN` = your DSN
4. Redeploy the API.

### Frontend (Vercel)

1. Create a Sentry project → platform **React** (or reuse one project for both).
2. Vercel → Project → **Environment Variables**:
   - `NEXT_PUBLIC_SENTRY_DSN` = DSN (Production + Preview optional)
3. Redeploy frontend.

Sentry is **optional**. If DSN is unset, the app runs normally with no error tracking.

---

## 2. Prove Sentry catches errors

Enable the intentional test route **only when verifying**:

```text
ENABLE_OBSERVABILITY_TEST_ROUTES=true
```

On Railway, set temporarily, redeploy, then:

```powershell
curl -i https://YOUR-API.up.railway.app/health/test-error
```

Expect **HTTP 500**. Within ~1 minute, Sentry should show a new issue:
`TrekPal observability test error (intentional — safe to ignore)`.

**Turn the flag off** (`false` or remove) after testing — do not leave enabled in production.

---

## 3. Uptime check (GitHub Actions)

Workflow: [`.github/workflows/uptime.yml`](../.github/workflows/uptime.yml)

- Runs every **15 minutes** and on manual **workflow_dispatch**.
- `GET {API_URL}/health/deps` must not return `"status": "unhealthy"`.
- Default API URL: production Railway host (see `docs/DEPLOY.md`).
- Override: GitHub repo **Settings → Secrets and variables → Actions → Variables** → `TREKPAL_API_URL`.

**Answer “is TrekPal up?”**

- Green **Uptime** workflow in GitHub Actions, or
- Open `/health/deps` — `"status": "ok"` or `"degraded"` (DB up; Groq/weather optional).

---

## 4. Log format (Railway)

Each HTTP request:

```json
{"event": "http_request", "method": "GET", "path": "/trek/list", "status": 200, "latency_ms": 42}
```

Each external call (Groq / Open-Meteo):

```json
{"event": "external_call", "service": "groq", "operation": "chat", "status": "ok", "latency_ms": 890, "route": "/chat/ask"}
```

Railway → API service → **Logs** → filter `http_request` or `external_call`.

---

## 5. Run locally

Request logging works without Sentry:

```powershell
docker compose up -d --build
docker compose logs -f api
# In another terminal: curl http://localhost:8000/trek/list
```

Optional local Sentry:

```powershell
# backend/.env
SENTRY_DSN=https://…
ENABLE_OBSERVABILITY_TEST_ROUTES=true
```

```powershell
# frontend/.env.local
NEXT_PUBLIC_SENTRY_DSN=https://…
```

---

## 6. What we deliberately do not log

- `Authorization` headers or Bearer tokens
- `Set-Cookie` / session cookie values
- Passwords or `GROQ_API_KEY` / `JWT_SECRET`
- Full Groq error bodies (truncated in external_call logs)

---

## 7. Acceptance checklist (S6)

- [ ] `/health/deps` returns DB status from production URL
- [ ] Uptime workflow green (or manual dispatch succeeds)
- [ ] Railway logs show JSON `http_request` lines after traffic
- [ ] With `SENTRY_DSN` set, `/health/test-error` creates a Sentry issue
- [ ] Test route disabled again after verification
