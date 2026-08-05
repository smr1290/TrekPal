# TrekPal production deploy (Phase 3 / S3)

Goal: a stranger on another network can open the **public frontend URL**,
sign up or log in, and browse the trek catalog — without SSH-ing into your PC.

Recommended topology (already assumed by S1–S2 cookie/CORS docs):

| Piece | Host | Why |
|-------|------|-----|
| Frontend | [Vercel](https://vercel.com) (free Hobby) | Native Next.js |
| API | [Railway](https://railway.app) (trial / Hobby) | Docker + easy Postgres |
| Database | Railway Postgres plugin | Same project as API |

Alternative API host: [Render](https://render.com) Web Service + Postgres — same env vars; see §7.

Secrets checklist: [`PRODUCTION_ENV.md`](./PRODUCTION_ENV.md).

---

## 0. Before you start

1. Push latest `main` to GitHub (this repo).
2. Accounts: GitHub + Railway + Vercel (free tiers are enough to smoke).
3. Generate a JWT secret locally:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Keep it in a password manager — paste into Railway only, never into git.

---

## 1. Deploy API + Postgres (Railway)

### 1.1 Create project

1. Open [railway.app/new](https://railway.app/new) → **Deploy from GitHub repo** → select **TrekPal**.
2. When asked for a service root, set **Root Directory** to `backend`  
   (or add a service later and set Root Directory / Watch Paths to `backend`).
3. Railway should detect `backend/Dockerfile` + `backend/railway.toml`.

### 1.2 Add Postgres

1. In the same project: **New** → **Database** → **PostgreSQL**.
2. Open the **API** service → **Variables** → **Add reference** / connect Postgres  
   so `DATABASE_URL` is injected (Railway may name it `DATABASE_URL` automatically).
3. TrekPal normalizes `postgres://…` → `postgresql://…` for SQLAlchemy.

### 1.3 Set API environment variables

On the **API** service → **Variables**, set:

| Variable | Value |
|----------|--------|
| `APP_ENV` | `production` |
| `DATABASE_URL` | *(from Postgres plugin — do not type localhost)* |
| `JWT_SECRET` | the 48+ char secret you generated |
| `JWT_ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` |
| `CORS_ORIGINS` | *(leave temporary placeholder — update after Vercel URL exists)* e.g. `https://placeholder.vercel.app` |
| `AUTH_COOKIE_SECURE` | omit (defaults true in production) |
| `AUTH_COOKIE_SAMESITE` | omit (defaults `none` for split host) |
| `ENABLE_INTERNAL_ML` | `false` or omit |
| `GROQ_API_KEY` | your Groq key (recommended) |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` (or omit) |

**Release migrate:** the Dockerfile `CMD` runs `alembic upgrade head` before Uvicorn on every deploy. You do **not** need a separate migrate job for S3.

### 1.4 Generate a public domain

1. API service → **Settings** → **Networking** → **Generate domain**.
2. Copy the HTTPS URL, e.g. `https://trekpal-api-production-xxxx.up.railway.app`  
   → call this **`API_URL`** (no trailing slash).

### 1.5 Smoke the API alone

```powershell
curl https://YOUR_API_URL/
```

Expect JSON mentioning TrekPal. If the process crashed on boot, open **Deployments → Logs** — production validation errors name the bad env var (see S1).

---

## 2. Deploy frontend (Vercel)

### 2.1 Import project

1. [vercel.com/new](https://vercel.com/new) → import the same GitHub **TrekPal** repo.
2. **Root Directory:** `frontend` (Edit → select `frontend`).
3. Framework: Next.js (auto).
4. **Environment Variables:**

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | your **`API_URL`** from Railway (HTTPS, no trailing slash) |

5. Deploy.

### 2.2 Copy the frontend URL

e.g. `https://trekpal-xxx.vercel.app` → call this **`FRONTEND_URL`**.

---

## 3. Wire CORS (required for login cookies)

Back on Railway API → **Variables**:

| Variable | Value |
|----------|--------|
| `CORS_ORIGINS` | exact `FRONTEND_URL` with **no** trailing slash |

Redeploy the API (Railway usually redeploys on variable change).

If you add a custom domain later, put **both** origins comma-separated:

```text
https://trekpal.vercel.app,https://www.yourdomain.com
```

---

## 4. End-to-end smoke (acceptance)

From a phone or another network (not only your laptop Docker):

| Step | Check |
|------|--------|
| 1 | Open `FRONTEND_URL` — home loads (High Lodge UI) |
| 2 | Open `API_URL/` — health JSON |
| 3 | Sign up (or log in) on the frontend |
| 4 | Open `/treks` — catalog lists treks |
| 5 | Open Plan trip / checklist once (save or generate) |
| 6 | DevTools → Application: `trekpal_access` cookie on **API** host is HttpOnly; **no** JWT in Local Storage |

If login “works” then `/auth/me` is 401: re-check §3 CORS exact match, HTTPS on both hosts, and S2 cookie matrix (`SameSite=None` + `Secure`).

---

## 5. Recreate from a clean machine

1. Clone the repo; ensure `main` includes S3 files (`backend/Dockerfile`, `backend/railway.toml`, this doc).
2. Follow §1 → §2 → §3 → §4.
3. Secrets live only in Railway / Vercel dashboards (and your password manager).

No Terraform/IaC is required for S3; dashboard + GitHub connect is enough and reversible (delete the two projects).

---

## 6. Local vs production (quick reminder)

| | Local | Production |
|--|-------|------------|
| Frontend | `npm run dev` → `:3000` | Vercel |
| API | Docker Compose / uvicorn → `:8000` | Railway Docker |
| DB | Compose `db` | Railway Postgres |
| `APP_ENV` | `development` | `production` |
| Cookies | `Secure=false`, `SameSite=lax` | `Secure=true`, `SameSite=none` |
| CORS | `http://localhost:3000` | exact Vercel HTTPS origin |

---

## 7. Optional: Render instead of Railway

1. **PostgreSQL** instance on Render → copy Internal (or External) Database URL.
2. **Web Service** from GitHub:
   - Root Directory: `backend`
   - Dockerfile path: `./Dockerfile`
   - Health check path: `/`
3. Same env vars as §1.3; set `PORT` is provided by Render automatically.
4. Continue with Vercel §2–§4.

---

## 8. Record your URLs (fill after deploy)

| Role | URL |
|------|-----|
| Frontend | |
| API | |
| Deployed on (date) | |

Paste these into a private note; optionally add a one-line status under S3 in `MILESTONES_PRODUCT.md` **without** putting secrets in git.
