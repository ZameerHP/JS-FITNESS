# JS FITNESS INC — Official Web Platform (`jsfitness.ca`)

**MORE THAN JUST A GYM MEMBERSHIP.**  
*TRAIN. EAT. SLEEP. REPEAT.*

Full-stack web application built for **JS FITNESS INC** (Calgary, AB) with a React + TypeScript + Tailwind + GSAP + Lenis + Three.js client (`/client`), an Express + TypeScript + Prisma + Sharp API (`/server`), and a code-split `/admin` console.

---

## Business Ownership & Compliance Notice
- **Domain (`jsfitness.ca`), hosting, DNS, SMTP, and Calendly accounts must all be registered under the client's business ownership (JS FITNESS INC).**
- Gym membership dollar prices are **never** shown anywhere on the public website. Only the three membership phases (`Tier 1 Founders Membership`, `Tier 2 Second Release`, `Tier 3 Final Release`) are displayed, and the only public price is the **Strategy Assessment: $99.99 CAD**.
- Two conversion paths only:
  1. `BOOK YOUR FREE GYM TOUR` (`CALENDLY_TOUR_URL`)
  2. `BOOK YOUR STRATEGY ASSESSMENT — $99.99` (`CALENDLY_ASSESSMENT_URL`)
- Note on open items to confirm with client:
  - Postal code currently uses **T3J 2L3** from the brief (confirm vs. T3J 2C3 before launch).
  - Replace the two `DEMO`-tagged transformation placeholders in `/admin` with consented client photos before launch.
  - Review starter Privacy Policy and Terms & Conditions templates with legal counsel.

---

## Local Development Setup

### 1. Server (`/server`)
```bash
cd server
cp ../.env.example .env
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```
Default seeded owner admin login (override in `.env`):
- Email: `admin@jsfitness.ca`
- Password: `JSFitness2026!`

### 2. Client (`/client`)
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` (public site) or `http://localhost:5173/admin` (owner admin panel).

---

## Production Deployment (`jsfitness.ca`)

### Option A: Docker Compose on a VPS (Ubuntu 24.04)
1. Update `server/prisma/schema.prisma` datasource `provider = "postgresql"`.
2. Copy `.env.example` to `.env` at the project root and set strong values for `JWT_SECRET`, `ADMIN_PASSWORD`, `POSTGRES_PASSWORD`, and `SMTP_*`.
3. Build and start containers:
   ```bash
   docker compose up -d --build
   docker compose exec app npx tsx prisma/seed.ts
   ```
4. **Cloudflare DNS**:
   - Point `A` record for `@` and `www` of `jsfitness.ca` to your VPS IPv4 address (Cloudflare Proxy enabled).
   - Set SSL/TLS mode to **Full (strict)**.
5. **Nginx + Let's Encrypt SSL** on the VPS:
   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx
   sudo certbot --nginx -d jsfitness.ca -d www.jsfitness.ca
   ```
   Proxy port `80/443` traffic to `http://127.0.0.1:4000`.

### Option B: Render or Railway
1. Connect the repository under the client's Render/Railway organization.
2. Provision a managed PostgreSQL database and link `DATABASE_URL`.
3. Update `server/prisma/schema.prisma` to `provider = "postgresql"`.
4. Deploy using the root `Dockerfile` and configure environment variables from `.env.example`.
5. Point `jsfitness.ca` DNS CNAME/A records in Cloudflare to the platform's custom domain target with automatic TLS enabled.
