# Edunex — Full Deployment Guide

## Architecture

```
Browser → Vercel (frontend)
              ↓ HTTPS API calls
        Railway (backend / Express)
              ↓
        Supabase (Postgres database)
```

---

## Step 1 — Set up Supabase tables (5 minutes)

1. Go to **supabase.com** → your project → **SQL Editor**
2. Open `backend/supabase-schema.sql`
3. Paste the entire file and click **Run**
4. Copy your **service_role** key:
   - Project Settings → API → **service_role** (secret) → copy it
5. Paste it into `backend/.env` as `SUPABASE_SERVICE_KEY`

---

## Step 2 — Deploy Backend to Railway (10 minutes)

Railway is the easiest host for an Express + TypeScript server.

### One-time setup:
```
npm install -g @railway/cli
railway login
```

### Deploy:
```
cd C:\Users\admin\Downloads\edunex\backend
railway init          ← create new project, name it "edunex-api"
railway up            ← deploy
railway domain        ← get your public URL (e.g. https://edunex-api.up.railway.app)
```

### Set environment variables on Railway:
Go to **railway.app** → your project → **Variables** and add everything from `backend/.env`:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | `https://khigogvcmtngskffnotj.supabase.co` |
| `SUPABASE_SERVICE_KEY` | your service_role key from step 1 |
| `JWT_SECRET` | generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `SUPER_ADMIN_PASSWORD` | your chosen password |
| `TWILIO_SID` | from twilio.com |
| `TWILIO_TOKEN` | from twilio.com |
| `TWILIO_NUMBER` | your Twilio number |
| `GEMINI_KEY` | from aistudio.google.com |
| `DID_KEY` | from d-id.com |
| `DIALOG360_KEY` | from 360dialog.com |
| `FRONTEND_URL` | your Vercel URL from Step 3 (set after frontend deploy) |
| `PORT` | `4000` |

### Verify backend is live:
Visit `https://your-backend.up.railway.app/health` — you should see JSON with `"status": "ok"`

---

## Step 3 — Deploy Frontend to Vercel (5 minutes)

### Install Vercel CLI (if not installed):
```
npm install -g vercel
```

### Deploy:
```
cd C:\Users\admin\Downloads\edunex\frontend
vercel --prod
```

On first run Vercel asks:
- **Framework?** → Vite (auto-detected)
- **Build command?** → leave blank
- **Output directory?** → leave blank (auto: dist/)

### Set environment variables on Vercel:
Go to **vercel.com** → your project → **Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://khigogvcmtngskffnotj.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | your Supabase anon key |
| `VITE_API_URL` | your Railway backend URL (e.g. `https://edunex-api.up.railway.app`) |

Then **redeploy** to pick up env vars:
```
vercel --prod
```

---

## Step 4 — Connect frontend ↔ backend

1. Copy your Vercel frontend URL (e.g. `https://edunex.vercel.app`)
2. On Railway, update `FRONTEND_URL` to that URL
3. Railway auto-redeploys — done ✅

---

## Step 5 — Verify everything works

1. Open your Vercel URL
2. Click **Register** → create a school account
3. Login → check Dashboard loads data from Supabase
4. Visit `https://your-backend.up.railway.app/health` to confirm API keys are wired

---

## Production checklist for millions of users ✅

- [x] **All secret keys server-side** — Twilio, Gemini, D-ID live only in Railway env vars
- [x] **JWT authentication** — every API route is protected
- [x] **Rate limiting** — 100 req/15min globally, 20 calls/min on /api/calls
- [x] **Helmet** — security headers on every response
- [x] **CORS** — restricted to your Vercel domain only
- [x] **Supabase connection pooling** — PgBouncer built-in, handles thousands of connections
- [x] **Vercel CDN** — static assets served globally from 100+ edge nodes
- [x] **Railway auto-scaling** — scales backend replicas under load
- [x] **Code splitting** — all pages lazy-loaded (fast first load)
- [ ] **Supabase RLS** — add row-level security policies (run after launch)
- [ ] **Custom domain** — add in Vercel + Railway settings
- [ ] **JWT_SECRET** — replace placeholder with `openssl rand -hex 32`
- [ ] **SUPABASE_SERVICE_KEY** — fill in your real service_role key
