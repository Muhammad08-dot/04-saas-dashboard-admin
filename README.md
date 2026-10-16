# SaaS Dashboard — Admin Panel

Full-stack admin panel with auth, role-based access, revenue charts, and CRUD
for Customers & Orders. This is the primary portfolio showcase.

> **The frontend is fully standalone** — it runs on a mock data layer (seed
> JSON + `localStorage`), so it deploys to Netlify/Vercel as a pure static
> build with no server. The Django API in [`backend/`](backend/) is kept in the
> repo as a code showcase but is **not required** to run the demo.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React 18 + Vite 5 + TypeScript |
| Data (demo) | Mock transport layer (`src/lib/api.ts` → `src/lib/mock.ts`) + localStorage |
| Styling | Tailwind CSS 3.4 (slate neutrals, indigo accent) |
| Charts | Recharts |
| Icons | Lucide React |
| Backend (showcase only) | Django 5 + DRF, JWT (SimpleJWT), drf-spectacular |

## Quick Start — frontend demo (port 3004)

```bash
cd frontend
npm install
npm run dev                       # mock data, no backend needed
```

Sign in with the buttons on the login screen ("Login as Admin" / "Login as
Viewer") or type the credentials below manually.

## Demo Credentials

| Role | Username | Password | Access |
|------|----------|----------|--------|
| Admin | `admin` | `Admin@2025!` | Full CRUD + view |
| Viewer | `viewer` | `Viewer@2025!` | Read-only (no add/edit/delete) |

All changes persist to `localStorage` per browser; clearing site data resets
the seed dataset.

## Features

- **Role-Based Access** — admin can create/edit/delete; viewer is read-only
- **Dashboard** — KPI cards + 30-day revenue area chart
- **Customers** — data table with search, sortable columns, pagination, full CRUD modal
- **Orders** — data table with search, sortable columns, filter by plan/status, full CRUD
- **Dark Mode** — toggle in sidebar

## Deploy the frontend as a static site (Netlify / Vercel)

`netlify.toml` (build settings + SPA fallback) and `frontend/vercel.json` are
included. From the repo root, three commands:

```bash
# Netlify (netlify.toml already sets base=frontend, publish=dist)
npm --prefix frontend install && npm --prefix frontend run build
npx netlify deploy --prod

# Vercel (run from frontend/)
cd frontend && npm install && npm run build
npx vercel deploy --prod
```

## Optional — run the Django showcase backend

Not needed for the demo. To explore the API code:

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate && python seed.py
python manage.py runserver 8001   # Swagger docs at /api/docs/
```

### API surface (implemented by the mock layer with identical shapes)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login/` | Sign in (mock validates demo users) |
| GET | `/auth/me/` | Current user profile |
| GET/POST/PATCH/DELETE | `/customers/` | Customer CRUD + search/sort/pagination |
| GET/POST/PATCH/DELETE | `/orders/` | Order CRUD + filters |
| GET | `/dashboard/stats/` | KPI cards + revenue series |

## Design Tokens

- Background: `#F4F6F8` (slate-50), panels: white, borders: `#DDE2E8`
- Accent: `#4F46E5` (indigo) — only for CTAs and active states
- Font: Inter
- Dark mode: bg `#0F172A`, panels `#1E293B`, borders `#334155`

## Environment Variables

None for the frontend demo — it is fully static. Backend: copy
`.env.example` → `.env` only if running the Django showcase.

## Screenshots

Responsive QA captures (375 / 768 / 1280 px, production build) live in
[`_screenshots/04-dashboard/`](../_screenshots/04-dashboard).
