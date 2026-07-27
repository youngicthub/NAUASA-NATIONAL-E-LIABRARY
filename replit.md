# NUASA — National Body E-Library

A full-stack e-library platform for NUASA (National University Academic Staff Association), built with React + Vite on the frontend and an Express API server on the backend.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, TypeScript, shadcn-ui, Tailwind CSS, Framer Motion |
| Backend API | Express 5, TypeScript, Pino logging |
| Database | MySQL (via `mysql2`) |
| Auth/Data | Supabase (frontend) |
| Monorepo | pnpm workspace |

## How to run

Both services start automatically via their configured workflows:

- **Frontend** (`artifacts/nuasa: web`) — `pnpm --filter @workspace/nuasa run dev`
- **API Server** (`artifacts/api-server: API Server`) — `pnpm --filter @workspace/api-server run dev`

The frontend is served at `/` and the API at `/api`.

## Required secrets

Add these in the Secrets panel (padlock icon) when you're ready to connect to live data:

| Secret | Used by | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend | Supabase anon key |
| `DB_HOST` | API Server | MySQL host (default: `127.0.0.1`) |
| `DB_NAME` | API Server | Database name (default: `nuasa_database`) |
| `DB_USER` | API Server | Database user (default: `root`) |
| `DB_PASSWORD` | API Server | Database password |
| `JWT_SECRET` | API Server | Secret for signing JWTs |
| `SMTP_HOST` | API Server | SMTP server for email |
| `SMTP_USER` | API Server | SMTP username |
| `SMTP_PASSWORD` | API Server | SMTP password |
| `FLUTTERWAVE_PUBLIC_KEY` | API Server | Payment integration |

## Project structure

```
artifacts/
  nuasa/          # React frontend
  api-server/     # Express API server
lib/
  db/             # MySQL pool + query helper
  api-spec/       # OpenAPI spec
  api-zod/        # Zod schemas
  api-client-react/ # React hooks for API
.migration-backup/  # Original Lovable project (reference only)
```

## User preferences

- Keep the existing project structure and stack — do not restructure or migrate unless explicitly asked.
