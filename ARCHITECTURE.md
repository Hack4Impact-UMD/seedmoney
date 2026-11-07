# SeedMoney: Codebase Guide

A quick map of the repo for engineers new to it.

## What the app does

Community gardens **apply** for a SeedMoney fundraising challenge. **Admins review** the applications. Approved campaigns are **published to Givebutter**, where donations come in. Givebutter sends **webhooks** back so the app can show dashboards and a public leaderboard.

## Stack

- **Next.js 16** (App Router) + **React 19** + TypeScript
- **Supabase**: Postgres, Auth, and Storage (campaign images)
- **MUI 7** for components, **Tailwind 4** for utility CSS
- **TanStack Query** for data fetching/caching, **TanStack Form** for the application form, **TanStack Table** for admin tables
- **Givebutter API** for fundraising campaigns and donations
- **OpenAI** for the optional "AI polish" of garden story answers
- Deployed on **Vercel**. There is one daily cron job, set in `vercel.json`.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
npm run lint
```

Create a `.env.local` with:

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser and server Supabase clients |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin client (`src/lib/supabase-service.ts`); bypasses RLS |
| `GIVEBUTTER_API_KEY` | Givebutter API calls |
| `OPENAI_API_KEY` | AI polish route |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile captcha on auth forms |

To run a local Supabase instance, use `npx supabase start`. It uses `supabase/config.toml`, `supabase/migrations/`, and `supabase/seed.sql`. The README covers auth email setup.

## Folder structure

```
src/
  app/            Routes (Next.js App Router)
  components/     UI components, grouped by feature
  hooks/          TanStack Query hooks, one per operation, grouped by table
  actions/        Data-access functions called by the hooks
  lib/            Supabase clients, MUI theme, pure utilities
  types/          DB row types (types/db) and view models (types/frontend)
  context/        AuthProvider (current Supabase user)
  providers/      QueryProvider (TanStack Query client)
  givebutter/     Low-level Givebutter REST wrapper
  constants/      Static option lists and copy
supabase/         Migrations, seed data, local config, auth email template
scripts/          One-off Node maintenance scripts for Givebutter (see package.json)
.github/workflows PR lint check; deploy to Vercel on push to main
```

### `src/app`: routes

Folders in parentheses are route groups. They share a layout but don't add a URL segment.

| Path | Purpose |
| --- | --- |
| `(auth)/` | Login (`/`), `/signup`, and the Supabase email-confirmation `/callback` |
| `(static)/` | `/faq`, `/how-it-works`, `/privacy`, `/terms` |
| `apply/(steps)/*` | Multi-step application form: contact → garden → story → campaign → terms → review |
| `dashboard/` | Landing page after login |
| `dashboard/(users)/[campaignId]/` | A garden leader's view of their campaign and application |
| `dashboard/(admin)/*` | Admin-only pages: review applications, approved/previous campaigns, users. `(admin)/layout.tsx` gates access with `users.is_admin` |
| `dashboard/settings/` | Account settings (name, email, password) |
| `leaderboard/` | Public leaderboard |
| `api/ai-polish` | POST. Generates AI-polished story answers (campaign leaders only) |
| `api/webhooks/givebutter` | Givebutter events: `campaign.created/updated`, `transaction.succeeded` |
| `api/publish-campaigns` | GET. Daily Vercel cron that publishes `approved` campaigns to Givebutter |

There is no middleware. Auth checks happen client-side in layouts via `useAuth()` and in each API route.

### Data flow: component → hook → action → Supabase

```
components/…  →  hooks/<table>/useXxx.ts  →  actions/db/<table>.ts  →  Supabase
                 (useQuery / useMutation)     (queries via supabase-js)
```

- **`actions/db/`** has one file per table (`campaigns`, `answers`, `users`, `transactions`, …). These functions mostly use `createBrowserClient()`, so they run under the user's session and **Row Level Security applies**.
- **`actions/frontend/`** has `"use server"` functions that join and reshape data for specific screens, such as admin tables and the campaign edit page.
- **`actions/givebutter/`** creates and publishes Givebutter campaigns.
- **`hooks/`** wraps actions in TanStack Query. Query keys follow the pattern `[params, '<table>', 'read']`. To add a new read or write, add an action, then a hook next to its siblings.

### Supabase clients (`src/lib`)

| Function | When to use |
| --- | --- |
| `createBrowserClient()` | Client components and hooks. Uses the user session, so RLS applies |
| `createServerClient()` | Server components, server actions, and API routes. Reads the session from cookies |
| `createServiceRoleClient()` | Server only (webhooks, cron). **Bypasses RLS**, so never import it into client code |

## Domain model

Tables are defined in `supabase/migrations/`, with TypeScript types in `src/types/db/`:

- **competition_metadata**: a fundraising challenge/season (dates, settings). The "current" competition drives the apply flow.
- **campaigns**: one garden's application and campaign. Key field: `status`.
- **campaign_members**: links users to campaigns with a `campaign_leader` or `campaign_member` role.
- **users**: profile rows. A trigger creates them after email confirmation. `is_admin` controls admin access.
- **questions / answers**: application questions and responses. Story answers have original, AI, and final versions.
- **campaign_image_records**: uploaded campaign photos in Supabase Storage.
- **transactions**: donations, inserted by the Givebutter webhook.

**Campaign status lifecycle** (`src/types/db/enums.ts`):

```
in_progress → pending → approved → published
                     ↘ denied      ↘ publish_failed
(later) → archived
```

`in_progress` means the applicant is still drafting. `pending` means it has been submitted for review. An admin moves it to `approved` or `denied`. The cron job then publishes approved campaigns to Givebutter.

## Conventions

- Import with the `@/src/...` path alias.
- Schema changes go in a new migration in `supabase/migrations/`. Don't edit old migrations.
- Put shared UI primitives in `components/bases/` (`BaseModal`, `BaseAlert`).
- Files named `mock*.ts` or `sample*.ts` under `app/` hold placeholder data from early development. Check whether a page still uses real data before relying on them.

## Gotchas

- **Env var name mismatch:** the GitHub workflows set `NEXT_GIVEBUTTER_API_KEY`, but the code reads `GIVEBUTTER_API_KEY`. In production the value comes from Vercel's environment, so check that the Vercel variable uses the name the code expects.
- The PR workflow is named "Lint and Build" but only runs `npm run lint`. Run `npm run build` locally to catch type errors.
- `@upstash/redis` is listed in `package.json` but nothing uses it yet.
