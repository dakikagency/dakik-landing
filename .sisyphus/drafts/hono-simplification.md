# Draft: HONO Simplification Project

## Requirements (confirmed)
- **Structure**: HONO-only full stack on Cloudflare Workers
- **Features**: Full CRM + Auth + Payments
- **Approach**: Start fresh, preserve landing page homepage design
- **Database**: Keep Neon PostgreSQL, use Prisma only (no Kysely)

## Key Decisions
- Remove Turborepo monorepo structure
- Single project with flat structure
- HONO as the only backend framework
- Prisma for all database operations
- Cloudflare Workers deployment

## Components to Preserve
- [x] Landing page homepage design (9 components, motion system, design tokens)
- [x] Database schema (27 models, 11 enums)
- [x] Authentication (better-auth or JWT)
- [x] CRM features: Leads, Customers, Projects, Invoices, Meetings
- [x] Stripe integration
- [x] Google Calendar integration

## Components to Remove
- [x] Turborepo (no more monorepo)
- [x] tRPC (replaced with HONO routes)
- [x] Kysely (use Prisma directly)
- [x] packages/ folder structure
- [x] apps/ folder structure

## Research Complete
- [x] HONO + Cloudflare Workers setup: Use `npm create hono@latest` with cloudflare-workers template
- [x] Prisma adapter: Use `driverAdapters` preview feature with Neon adapter
- [x] Authentication: better-auth works on Workers, or simple JWT with hono/jwt
- [x] Frontend: Static SPA served from `assets` directory with `run_worker_first` for API

## Plan Saved
See `.sisyphus/plans/hono-simplification.md` for detailed implementation plan.