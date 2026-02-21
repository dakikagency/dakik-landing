# AGENTS.md

This file provides essential context for AI coding agents working with the Dakik Studio codebase.

## Project Overview

Dakik Studio is a digital agency website built as a Turborepo monorepo. It features a public marketing site with sophisticated animations, a customer portal, and an admin panel. The platform supports lead generation, project management, contract signing, invoicing, and meeting scheduling.

## Technology Stack

| Category | Technology |
|----------|------------|
| Package Manager | Bun 1.3.5 |
| Monorepo Tool | Turborepo 2.6.3 |
| Frontend | Next.js 16.1.1 (App Router) |
| Language | TypeScript 5.x (strict mode) |
| Styling | Tailwind CSS 4.x |
| UI Components | shadcn/ui, Base UI, Phosphor Icons |
| Animation | Framer Motion, GSAP, Lenis (smooth scroll) |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Prisma 7.x with Prisma Client |
| Query Builder | Kysely 0.28.x |
| API | tRPC 11.x |
| Auth | better-auth 1.4.x with Google OAuth |
| Forms | React Hook Form, Tanstack Form |
| State Management | Tanstack Query (React Query) |
| Email | Nodemailer |
| Media | Cloudinary |
| Payments | Stripe |
| Linting/Formatting | Biome 2.3.x (via Ultracite) |

## Project Structure

```
├── apps/
│   └── web/                    # Next.js 15 app (port 3001)
│       ├── src/
│       │   ├── app/           # Next.js App Router
│       │   │   ├── (app)/     # Marketing pages (home, about, etc.)
│       │   │   ├── admin/     # Admin dashboard
│       │   │   ├── portal/    # Customer portal
│       │   │   ├── survey/    # Lead generation funnel
│       │   │   ├── blog/      # Blog content
│       │   │   ├── api/       # API routes (tRPC, auth, webhooks)
│       │   │   └── ...
│       │   ├── components/    # React components
│       │   │   ├── ui/        # shadcn/ui components
│       │   │   ├── landing/   # Landing page sections
│       │   │   ├── admin/     # Admin-specific components
│       │   │   ├── portal/    # Portal-specific components
│       │   │   └── ...
│       │   ├── lib/           # Utility libraries
│       │   ├── hooks/         # Custom React hooks
│       │   ├── actions/       # Server actions
│       │   ├── middleware.ts  # Next.js middleware (auth/roles)
│       │   └── index.css      # Global styles (Tailwind)
│       ├── tests/             # Playwright E2E tests (empty)
│       ├── public/            # Static assets
│       └── playwright.config.ts  # Playwright configuration
│
├── packages/
│   ├── api/                   # tRPC API routers
│   │   └── src/
│   │       ├── routers/       # tRPC procedure definitions
│   │       ├── services/      # Business logic services
│   │       ├── context.ts     # tRPC context (auth session)
│   │       ├── index.ts       # tRPC initialization
│   │       ├── google-calendar.ts  # Google Calendar integration
│   │       └── stripe.ts      # Stripe integration
│   │
│   ├── auth/                  # Authentication (better-auth)
│   │   └── src/
│   │       └── index.ts       # Auth configuration with role-based access
│   │
│   ├── db/                    # Database (Prisma + Kysely)
│   │   ├── prisma/
│   │   │   └── schema/        # Prisma schema files (modular)
│   │   │       ├── schema.prisma     # Generator & datasource
│   │   │       ├── models.prisma     # Domain models
│   │   │       ├── auth.prisma       # Auth tables (better-auth)
│   │   │       └── ...
│   │   └── src/
│   │       ├── index.ts       # Prisma client initialization
│   │       ├── kysely.ts      # Kysely query builder setup
│   │       └── db.types.ts    # Kysely generated types
│   │
│   ├── env/                   # Environment validation
│   │   └── src/
│   │       ├── server.ts      # Server-side env vars (t3-oss/env)
│   │       ├── web.ts         # Client-side env vars
│   │       └── native.ts      # Mobile/native env vars
│   │
│   └── config/                # Shared TypeScript configuration
│       └── tsconfig.base.json # Base TS config for all packages
│
├── package.json               # Root workspace configuration
├── turbo.json                 # Turborepo pipeline configuration
├── biome.json                 # Biome linting/formatting rules
└── .env                       # Environment variables (root level)
```

## Development Commands

```bash
# Install dependencies
bun install

# Development servers
bun run dev              # Start all packages in dev mode
bun run dev:web          # Start web app only (port 3001)

# Building
bun run build            # Build all packages/apps via Turbo
bun run check-types      # TypeScript validation across all packages

# Code quality
bun x ultracite fix      # Auto-fix formatting/linting issues
bun x ultracite check    # Check without fixing
bunx biome check .       # Direct Biome check

# Database (Prisma via packages/db)
bun run db:push          # Sync schema to database
bun run db:studio        # Open Prisma Studio GUI
bun run db:migrate       # Create and apply migrations
bun run db:generate      # Regenerate Prisma client
bun run db:seed-admin    # Seed admin user
```

## Code Style Guidelines

### Formatting & Linting
- **Tool**: Biome via Ultracite preset
- **Indent**: Tabs (not spaces)
- **Quotes**: Double quotes for JavaScript/TypeScript
- **Imports**: Organized automatically on format
- **Semicolons**: Required

### TypeScript Conventions
- ESM modules only (`"type": "module"`)
- Strict mode enabled
- Prefer `unknown` over `any`
- Use `as const` for literal types
- Explicit return types on exported functions
- Path aliases: `@/*` maps to `./src/*` in web app

### React Conventions
- React 19: Use `ref` as prop (no `forwardRef` needed)
- Server Components by default for data fetching
- Client Components marked with `"use client"`
- Use Next.js `<Image>` component for images

### Styling
- Tailwind CSS 4.x with CSS variables for theming
- Monochrome color scheme with red accent
- Use `cn()` utility for conditional classes
- Component variants via `class-variance-authority`

## Architecture Patterns

### Full-Stack Type Safety
1. **tRPC** connects frontend and backend with end-to-end types
2. **Prisma** ensures database schema matches TypeScript types
3. **Zod** validates environment variables at runtime
4. Import from packages using `@collab/api`, `@collab/db`, etc.

### Authentication & Authorization
- **better-auth** handles OAuth (Google) and email/password
- **Roles**: `ADMIN` and `CUSTOMER` via user.additionalFields
- **Middleware** (`apps/web/src/middleware.ts`):
  - `/admin/*` - Requires `ADMIN` role
  - `/portal/*` - Requires `CUSTOMER` role + lead verification
  - Auto-redirects based on role mismatches

### Database Access
- **Prisma Client** for complex queries and transactions
- **Kysely** for type-safe raw SQL queries
- **Neon Adapter** for serverless PostgreSQL
- Database URL from `@collab/env/server`

### API Structure (tRPC)
```typescript
// Public procedure (no auth)
publicProcedure.query(() => { ... })

// Protected procedure (requires session)
protectedProcedure.query(({ ctx }) => {
  const { session } = ctx;  // Guaranteed non-null
  ...
})
```

Routers: `admin`, `portal`, `survey`, `meetings`, `contracts`, `invoices`, `blog`, `uploads`, `email`, `availability`, `audit`, `automation`, `components`, `icons`, `lead-magnets`, `survey-options`, `webhooks`

## Environment Variables

**Important**: All env vars go in the **root `.env`** file, not in app/package directories.

Required variables:
```bash
# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=min-32-characters-secret-key-here
BETTER_AUTH_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3001

# Google OAuth (optional but recommended)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Google Calendar (for meeting booking)
GOOGLE_CALENDAR_CLIENT_ID=...
GOOGLE_CALENDAR_CLIENT_SECRET=...
GOOGLE_CALENDAR_REFRESH_TOKEN=...

# Email via SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=...
SMTP_PASS=...
MAIL_FROM=...

# Cloudinary (media storage)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Stripe (payments)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

Validation happens in `packages/env/src/server.ts` using `@t3-oss/env-core`.

## Testing Strategy

- **Framework**: Playwright
- **Config**: `apps/web/playwright.config.ts`
- **Test Directory**: `apps/web/tests/` (currently empty)
- **Test Pattern**: `*.spec.ts` or `*.test.ts`

Run tests:
```bash
bunx playwright test
```

## Deployment

- **Platform**: Vercel
- **Config**: `apps/web/vercel.json`
- **Build**: Uses Turborepo filter: `turbo build --filter=web`
- **Install**: Custom install command from monorepo root

Key settings:
```json
{
  "framework": "nextjs",
  "installCommand": "cd ../.. && bun install",
  "buildCommand": "cd ../.. && turbo build --filter=web"
}
```

## Key Integrations

| Service | Purpose | Location |
|---------|---------|----------|
| Google Calendar API | Meeting scheduling | `packages/api/src/google-calendar.ts` |
| Gmail API / SMTP | Transactional emails | `packages/api/src/email.ts`, `apps/web/src/lib/email.ts` |
| Cloudinary | Media storage | `apps/web/src/lib/cloudinary.ts` |
| Stripe | Payments | `packages/api/src/stripe.ts`, `packages/api/src/routers/invoices.ts` |
| better-auth | Authentication | `packages/auth/src/index.ts` |

## Database Schema Overview

### Core Entities
- **User/Account/Session** - better-auth managed
- **Lead** - Survey submissions, potential customers
- **Customer** - Converted leads with portal access
- **Project** - Client projects with progress tracking
- **Contract** - E-signable contracts with signature data
- **Invoice** - Billing with Stripe integration
- **Meeting** - Scheduled calls with Google Calendar sync
- **BlogPost/Tag** - Content management
- **Automation** - Showcase automation workflows

### Enums
- `Role`: ADMIN, CUSTOMER
- `LeadStatus`: NEW, CONTACTED, MEETING_SCHEDULED, etc.
- `ProjectStatus`: PENDING, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED
- `ContractStatus`: DRAFT, SENT, VIEWED, SIGNED, EXPIRED
- `InvoiceStatus`: UNPAID, PENDING, PAID, OVERDUE

## Security Considerations

1. **Authentication**: Session-based via better-auth cookies
2. **Authorization**: Role-based middleware checks
3. **CSRF**: Protected by better-auth defaults
4. **CORS**: Configured via `CORS_ORIGIN` env var
5. **Secrets**: Never commit `.env` files
6. **SQL Injection**: Protected by Prisma ORM and Kysely parameterization
7. **XSS**: React's built-in escaping + Content Security Policy via Next.js

## Common Tasks

### Adding a new tRPC router
1. Create file in `packages/api/src/routers/my-feature.ts`
2. Export router using `router({ ... })`
3. Add to `packages/api/src/routers/index.ts` merge
4. Use `protectedProcedure` for authenticated endpoints

### Adding a database model
1. Add to `packages/db/prisma/schema/models.prisma`
2. Run `bun run db:push` to sync
3. Run `bun run db:generate` to update client
4. Use `prisma.myModel` or Kysely for queries

### Adding an environment variable
1. Add to root `.env` file
2. Add to `packages/env/src/server.ts` schema
3. Access via `import { env } from "@collab/env/server"`
4. Add to `turbo.json` `globalEnv` if needed for caching

### Creating a new page
1. Add to `apps/web/src/app/(app)/` for marketing
2. Add to `apps/web/src/app/admin/` for admin
3. Add to `apps/web/src/app/portal/` for customer portal
4. Use Server Components by default
5. Mark `"use client"` only when needed for interactivity

## Troubleshooting

### Database connection issues
- Check `DATABASE_URL` in root `.env`
- Must start with `postgresql://` or `postgres://`
- Verify Neon database is accessible
- Run `bun run db:generate` after schema changes

### Auth/session issues
- Ensure `BETTER_AUTH_SECRET` is at least 32 characters
- Check `BETTER_AUTH_URL` matches your dev/prod URL
- Verify `CORS_ORIGIN` is set correctly
- Check browser cookies are not blocked

### Type errors across packages
- Run `bun run check-types` to validate all packages
- Ensure dependencies use `workspace:*` for internal packages
- Check that `packages/config/tsconfig.base.json` is extended

## References

- [Next.js Docs](https://nextjs.org/docs)
- [tRPC Docs](https://trpc.io/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [better-auth Docs](https://www.better-auth.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Turborepo](https://turbo.build/repo/docs)
