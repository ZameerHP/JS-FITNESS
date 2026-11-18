# JS FITNESS INC — Official Web Platform (`jsfitness.ca`)

**MORE THAN JUST A GYM MEMBERSHIP.**  
*TRAIN. EAT. SLEEP. REPEAT.*

Full-stack web application built for **JS FITNESS INC** (Calgary, AB) with a React + TypeScript + Tailwind + GSAP + Lenis + Three.js client (`/client`), an Express + TypeScript + Prisma + Sharp API (`/server` + `/api`), and **Supabase** (PostgreSQL, Auth, Row-Level Security, Storage), ready to deploy on **Vercel**.

---

## Business Ownership & Compliance Notice
- **Domain (`jsfitness.ca`), Supabase project, Vercel project, DNS, SMTP, and Calendly accounts must all be registered under the client's business ownership (JS FITNESS INC).**
- Gym membership dollar prices are **never** shown anywhere on the public website. Only the three membership phases (`Tier 1 Founders Membership`, `Tier 2 Second Release`, `Tier 3 Final Release`) are displayed, and the only public price is the **Strategy Assessment: $99.99 CAD**.
- Two conversion paths only:
  1. `BOOK YOUR FREE GYM TOUR` (`CALENDLY_TOUR_URL`)
  2. `BOOK YOUR STRATEGY ASSESSMENT — $99.99` (`CALENDLY_ASSESSMENT_URL`)

---

## Supabase Setup & Migration

1. **Create a Supabase project** under the JS FITNESS INC organization.
2. **Apply Schema, RLS Policies & Storage Bucket (`media`):**
   - Open **Supabase Dashboard → SQL Editor** and run [`supabase/migrations/0001_initial_supabase_schema.sql`](supabase/migrations/0001_initial_supabase_schema.sql).
   - This creates all 8 tables (`admin_users`, `site_settings`, `transformations`, `testimonials`, `gallery_items`, `video_items`, `certifications`, `contact_submissions`), enables Row-Level Security (RLS) on every table, sets strict `app_metadata.role = 'admin'` & least-privilege policies, and creates the public `media` Storage bucket.
3. **Configure Environment Variables:**
   - Copy `.env.example` values into `server/.env` (for local runs) and **Vercel Project → Settings → Environment Variables** (for production):
     - `DATABASE_URL` — Supabase **Transaction Pooler** URI (`:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require`)
     - `DIRECT_URL` — Supabase **Session Pooler / Direct** URI (`:5432/postgres?sslmode=require`)
     - `SUPABASE_URL` — Project URL (`https://<ref>.supabase.co`)
     - `SUPABASE_ANON_KEY` — Project `anon` / publishable key
     - `SUPABASE_SERVICE_ROLE_KEY` — Project `service_role` / secret key (**server-side only, never `VITE_`**)
     - `SUPABASE_STORAGE_BUCKET` — `media`
     - `NODE_ENV` — `production` (on Vercel)
     - `COOKIE_SECURE` — `true` (on Vercel)
     - `CLIENT_URL` — `https://jsfitness.ca,https://www.jsfitness.ca`
     - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — Owner credentials (`admin@jsfitness.ca`)
     - `JWT_SECRET` — 64-char random secret
     - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_RECIPIENT_EMAIL`
4. **Push Existing Data & Provision Supabase Auth Admin:**
   ```bash
   # After filling server/.env with your Supabase URL/keys:
   cd server
   npm run prisma:generate
   npm run prisma:push
   npm run supabase:migrate   # Migrates preserved SQLite records, uploads & syncs Supabase Auth admin
   npm run supabase:verify    # Verifies DB, RLS, Auth, and Storage end-to-end
   ```
   *(Or run `server/prisma/backups/supabase-data-import.sql` in SQL Editor; logging into `/admin` will auto-sync the admin into Supabase Auth on first sign-in.)*

---

## Local Development Setup

```bash
# Terminal 1 — API Server (http://localhost:4000)
cd server
npm install
npm run prisma:generate
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd client
npm install
npm run dev
```

Open `http://localhost:5173` (public site) or `http://localhost:5173/admin` (owner admin panel).

---

## Vercel Production Deployment (`jsfitness.ca`)

This repository is pre-configured for **Vercel** via [`vercel.json`](vercel.json) and [`api/index.js`](api/index.js):
- **Static SPA:** Built into `client/dist` (`npm run vercel-build`).
- **Serverless API:** All `/api/*` routes execute Express + Prisma + Sharp + Supabase Storage/Auth via `/api/index.js`.
- **Steps to Deploy:**
  1. Import the Git repository into Vercel (Root Directory: `./`, Framework Preset: `Other` / auto from `vercel.json`).
  2. Add all Environment Variables listed above in **Vercel → Settings → Environment Variables**.
  3. Deploy and verify `https://your-domain.vercel.app/api/health?deep=1`.
  4. Attach custom domain `jsfitness.ca` and `www.jsfitness.ca` in Vercel / Cloudflare DNS.
