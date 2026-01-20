# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dakik Studio is a digital agency website built as a Turborepo monorepo. It features a public marketing site with sophisticated animations, a customer portal, and an admin panel.

## Commands

```bash
# Development
bun run dev              # Start all packages in dev mode
bun run dev:web          # Start web app only (port 3001)
bun run build            # Build all packages
bun run check-types      # TypeScript validation across all packages

# Code Quality
bun x ultracite fix      # Auto-fix formatting/linting issues
bun x ultracite check    # Check without fixing

# Database (Prisma)
bun run db:push          # Sync schema to database
bun run db:studio        # Open Prisma Studio GUI
bun run db:migrate       # Create migration
bun run db:generate      # Generate Prisma client
bun run db:seed-admin    # Seed admin user
```

## Architecture

### Monorepo Structure

```
apps/
  web/                   # Next.js 15 App Router frontend
packages/
  @collab/api            # tRPC routers (admin, portal, survey, meetings, etc.)
  @collab/auth           # Better-auth with Google OAuth
  @collab/db             # Prisma ORM + Neon PostgreSQL
  @collab/env            # Environment validation (t3-oss/env)
  @collab/config         # Shared TypeScript config
```

### Full-Stack Type Safety

- **tRPC** connects frontend and backend with end-to-end types
- **Prisma** ensures database schema matches TypeScript types
- **Zod** validates environment variables at runtime
- Import from packages using `@collab/api`, `@collab/db`, etc.

### Web App Structure

The Next.js app uses App Router with these main areas:
- `/` - Public marketing pages with animations (Framer Motion + GSAP + Lenis smooth scroll)
- `/admin/*` - Admin panel (leads, projects, meetings, contracts, media, blog)
- `/portal/*` - Customer portal (contracts, projects, meetings, Q&A)
- `/survey` - Lead generation funnel
- `/login`, `/auth/callback` - Authentication flows

### Key Integrations

- **Google Calendar API** - Meeting scheduling and availability
- **Gmail API** - Transactional emails
- **Cloudinary** - Media storage and optimization

### Animation Stack

- **Framer Motion** - React component animations
- **GSAP** - Timeline-based animations
- **Lenis** - Smooth scrolling via `@studio-freight/react-lenis`

## Code Standards

This project uses **Ultracite** (BiomeJS-based) for linting and formatting. Run `bun x ultracite fix` before committing.

Key patterns:
- React 19: Use `ref` as prop (no `forwardRef`)
- Next.js: Use `<Image>` component, Server Components for data fetching
- TypeScript: Strict mode enabled, prefer `unknown` over `any`
- Styling: Tailwind CSS 4, CSS variables for theming (monochrome + red accent)
- Imports: Use path alias `@/*` for `./src/*` in web app

## Environment

- **Package Manager**: Bun 1.3.5
- **Database**: PostgreSQL via Neon (serverless)
- **Env Validation**: Import from `@collab/env/server` or `@collab/env/web`

### Environment Variables Setup

Environment variables should be defined in a `.env` file at the **root level** of the monorepo, not in individual apps/packages. This ensures all packages (especially `@collab/api`, `@collab/auth`, etc.) can access the same configuration.

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` - Authentication config
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` - Email via NodeMailer
- `GOOGLE_CALENDAR_*` - Calendar integration (optional)
- `CLOUDINARY_*` - Media storage (optional)

The `@collab/env` package validates all environment variables using Zod schemas defined in `packages/env/src/server.ts`.
