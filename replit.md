# NUASA National Body E-Library & Blog

The NUASA (National Union of Accountancy Students Association) platform gives Nigerian accounting students access to thousands of academic resources, blog posts, chapter info, events, and convention registration.

## Run & Operate

- `pnpm --filter @workspace/nuasa run dev` — run the NUASA frontend (port 21844 in Replit)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080 in Replit)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Frontend requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; the imported project keeps these in `artifacts/nuasa/.env`
- API requires `DATABASE_URL`; Replit provides this automatically for the development database
- The API's development database must have the NUASA tables before data-backed routes such as `/api/posts` can return content

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/nuasa/src/` — all frontend source (React + Vite)
- `artifacts/nuasa/src/pages/` — all page components (public + admin)
- `artifacts/nuasa/src/contexts/AuthContext.tsx` — Supabase auth context
- `artifacts/nuasa/src/integrations/supabase/` — Supabase client + types
- `artifacts/nuasa/src/index.css` — NUASA green theme (Tailwind v3 CSS vars)
- `artifacts/nuasa/tailwind.config.ts` — Tailwind theme config

## Architecture decisions

- **Supabase kept as-is**: The app has 15+ tables, full auth, and file storage in Supabase. Replacing with Replit primitives is a separate project — the app still connects to the user's Supabase project via `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` secrets.
- **Tailwind v3** (not v4): uses `postcss.config.js` + `tailwind.config.ts`, not `@tailwindcss/vite`.
- **react-router-dom** (not wouter): Lovable default; routing is standard BrowserRouter with no base path needed since the app runs at `/`.

## Product

- **E-Library**: Browse and download thousands of academic resources (PDFs, papers, study guides)
- **Blog**: Articles and posts for Nigerian accounting students
- **Chapters**: Directory of NUASA chapters by university
- **Events & Convention**: Event listings and convention registration with payment
- **Admin dashboard**: Full CMS for managing resources, posts, users, chapters, events, and settings
- **User dashboard**: Personal library, downloads, saved resources, and profile settings

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
