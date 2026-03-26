# Plan: Simplify to HONO + Cloudflare Workers (Detailed)

## TL;DR

> **Quick Summary**: Migrate from Next.js/tRPC monorepo to a single HONO full-stack app on Cloudflare Workers. Preserve landing page design and CRM functionality while eliminating monorepo complexity.

> **Deliverables**:
> - Single HONO project serving React frontend + API
> - Preserved landing page design (9 components, 7 motion components, Lenis smooth scroll)
> - Full CRM functionality (leads, customers, projects, invoices, meetings)
> - Prisma-only database access (27 models, 11 enums)
> - Cloudflare Workers deployment with proper environment handling

> **Estimated Effort**: Large (major architectural change)
> **Parallel Execution**: Waves 1-3 sequential, Waves 4-6 parallel per task type

---

## Context

### Original Request
User: "This project is way too complex for basic CRM dashboard and landing page for an agency. We want to use HONO as backend, remove Kysely, use Prisma directly, and eliminate the apps/packages monorepo structure."

### Key Decisions Made
1. **Structure**: HONO-only full stack (no Next.js app directory)
2. **Features**: Full CRM + Auth + Payments (all preserved)
3. **Approach**: Start fresh in new directory, migrate components manually
4. **Database**: Keep Neon PostgreSQL, Prisma only (no Kysely)
5. **Frontend**: React + Vite SPA served from HONO static assets

### Architecture Comparison

| Aspect | Current (Next.js/tRPC) | New (HONO) |
|--------|------------------------|------------|
| Runtime | Node.js + Vercel Edge | Cloudflare Workers |
| Backend | Next.js API Routes + tRPC | HONO routes |
| ORM | Prisma + Kysely | Prisma only |
| Auth | better-auth + nextCookies | better-auth + HONO middleware |
| Frontend | Next.js SSR/SSG | Vite SPA + HONO static |
| Styling | Tailwind v4 | Tailwind v4 (same) |
| Animation | Framer Motion + Lenis | Framer Motion + Lenis (same) |
| Deployment | Vercel/OpenNext | Cloudflare Workers |

---

## Edge Cases & Considerations

### Database Edge Cases
1. **Connection Pooling**: Cloudflare Workers doesn't support persistent connections - must use Neon HTTP mode or connection pooling
2. **Migrations**: Running Prisma migrations from CI/CD, not from Workers runtime
3. **Transaction Limits**: Neon has transaction duration limits on HTTP mode
4. **Enum Type Safety**: Prisma enums must match database exactly

### Authentication Edge Cases
1. **Session Storage**: better-auth requires session storage - may need KV for edge runtime
2. **Cookie Handling**: Cloudflare Workers handles cookies differently than Node.js
3. **OAuth Callbacks**: Google OAuth callback URLs need updating
4. **CORS**: Must configure CORS for the new domain

### Frontend Edge Cases
1. **Client-Side Routing**: SPA needs catch-all route in HONO
2. **Static Asset Caching**: Need proper cache headers for JS/CSS
3. **Environment Variables**: `NEXT_PUBLIC_*` → `VITE_*` prefix change
4. **Image Optimization**: No Next.js Image component - need Cloudinary or direct URLs

### API Edge Cases
1. **Request Size Limits**: Workers have 100MB request limit
2. **Response Streaming**: Streaming not fully supported in all Workers scenarios
3. **Cold Starts**: Workers have minimal cold starts but should test
4. **Rate Limiting**: Need to implement rate limiting in HONO middleware

### Deployment Edge Cases
1. **Environment Variables**: `.env` → Cloudflare Dashboard secrets
2. **Custom Domains**: Workers.dev subdomain first, custom domain later
3. **Deployment Limits**: Free tier has request limits
4. **Log Access**: Console logs go to Cloudflare logs, need setup

---

## Work Objectives

### Core Objective
Create a simplified, maintainable single-project architecture using HONO on Cloudflare Workers while preserving all functionality and the landing page design.

### Concrete Deliverables
1. New project directory with HONO backend
2. Prisma schema migrated (27 models, 11 enums)
3. React frontend with Vite build
4. All 9 landing page components working
5. All 7 motion components working
6. Lenis smooth scroll working
7. Auth routes: `/api/auth/*` (login, logout, session, OAuth)
8. CRM routes: `/api/leads/*`, `/api/customers/*`, `/api/projects/*`, `/api/invoices/*`, `/api/meetings/*`
9. Admin dashboard pages
10. Customer portal pages
11. Stripe webhook integration
12. Google Calendar integration
13. Cloudflare Workers deployment

### Definition of Done
- [ ] `bun run dev` starts HONO + Vite dev server
- [ ] `bun run build` produces Cloudflare Workers bundle
- [ ] `bun run deploy` successfully deploys
- [ ] Landing page renders identically to original
- [ ] Auth flow: Google OAuth login works
- [ ] Auth flow: Session persists across reloads
- [ ] Auth flow: Logout clears session
- [ ] CRM: Create lead → Convert to customer → Create project
- [ ] CRM: Create invoice → Stripe payment
- [ ] CRM: Schedule meeting → Google Calendar event
- [ ] Admin: View all leads, customers, projects
- [ ] Portal: Customer can view their projects, invoices
- [ ] Type check passes: `bun run check-types`
- [ ] No console errors in browser

---

## Verification Strategy

### Test Decision
- **Existing tests**: None (Playwright E2E tests empty)
- **Automated tests**: Will add basic smoke tests
- **Agent-Executed QA**: YES - mandatory for all tasks

### QA Policy
Every task MUST include at least one happy path scenario and one error/edge case scenario. Each scenario specifies exact tool, steps, selectors, and expected results.

### Testing Commands
```bash
bun run dev              # Start local development
bun run build            # Build for production
bun run deploy           # Deploy to Cloudflare
bun run cf-typegen       # Generate Cloudflare types
bun run check-types      # TypeScript validation
bun run test:e2e         # Playwright E2E (after setup)
```

---

## Pre-Migration Checklist

Before starting, verify the following:

### Source Project Status
- [ ] TypeScript compiles: `bun run check-types` passes
- [ ] Database accessible: `bun run db:push` works
- [ ] Landing page loads: Visit localhost:3001
- [ ] Auth works: Can log in with Google
- [ ] CRM works: Can create lead/project

### Required Accounts & Credentials
- [ ] Cloudflare account with Workers access
- [ ] Neon PostgreSQL database URL
- [ ] Google OAuth client ID & secret
- [ ] Stripe API keys (test mode)
- [ ] Resend API key
- [ ] Cloudinary cloud name & API keys

### Development Environment
- [ ] Bun 1.3.5+ installed
- [ ] Node.js 20+ installed (for some tools)
- [ ] Wrangler CLI: `npm install -g wrangler`

---

## Execution Strategy

### Dependency Graph

```
Task 1 (Project Setup)
    ↓
Task 2 (Prisma Schema) ←→ Task 3 (Cloudflare Config) ←→ Task 4 (Env Validation)
    ↓                              ↓                        ↓
    └──────────────────────────────┴────────────────────────┘
                                   ↓
Task 5 (Prisma Client)
    ↓
Task 6 (Auth Setup)
    ↓
Task 7 (Auth Routes)
    ↓
Tasks 9-13 (CRM APIs) [PARALLEL]
    ↓
Task 14 (Frontend Setup)
    ↓
Task 15 (Tailwind) ←→ Task 16 (Animations) ←→ Task 17 (API Client)
    ↓                     ↓                         ↓
    └─────────────────────┴─────────────────────────┘
                            ↓
Tasks 18-22 (Landing Components) [PARALLEL]
                            ↓
Tasks 23-27 (Dashboard & Integrations)
                            ↓
Tasks 28-30 (Polish)
                            ↓
FINAL (Verification)
```

---

## TODOs

---

## Wave 1: Foundation

- [x] 1. Create new HONO project structure

  **What to do**:
  ```bash
  # Create new project directory
  mkdir dakik-studio-hono
  cd dakik-studio-hono
  
  # Initialize HONO with Cloudflare Workers template
  bun create hono@latest . --template cloudflare-workers
  
  # Install core dependencies
  bun add hono @hono/zod-validator zod
  bun add -d wrangler @cloudflare/workers-types typescript
  ```
  
  Create directory structure:
  ```
  src/
  ├── index.ts                 # HONO app entry point
  ├── routes/
  │   ├── index.ts             # Route aggregator
  │   ├── health.ts            # Health check endpoint
  │   └── api/
  │       └── index.ts         # API route base
  ├── lib/
  │   ├── env.ts               # Environment validation
  │   ├── prisma.ts            # Prisma client factory
  │   └── utils.ts             # Utility functions
  ├── middleware/
  │   ├── logger.ts            # Request logging
  │   ├── error-handler.ts     # Error handling
  │   └── cors.ts              # CORS configuration
  ├── services/                 # Business logic (future)
  └── schemas/
      └── index.ts             # Zod schemas
  ```

  **Edge Cases**:
  - Tsconfig paths must work for both Vite frontend and Wrangler backend
  - `import { Hono } from 'hono'` - ensure ESM compatibility
  - Cloudflare Workers doesn't support all Node.js APIs - use web APIs only

  **Must NOT do**:
  - Do not use `fs`, `path`, `url` Node.js builtins
  - Do not configure Next.js
  - Do not include tRPC dependencies

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: None required
  - **Reason**: Standard project bootstrap with careful attention to edge compat

  **Parallelization**:
  - **Can Run In Parallel**: NO - foundation for everything
  - **Blocks**: All Wave 2+ tasks
  - **Blocked By**: None

  **References**:
  - `wrangler.jsonc` from existing project for Cloudflare config patterns
  - HONO docs: https://hono.dev/docs/getting-started/cloudflare-workers
  - Example: `new Hono().get('/', (c) => c.json({ status: 'ok' }))`

  **Acceptance Criteria**:
  - [ ] `bun install` completes with 0 errors
  - [ ] `bun run dev` starts server on port 8787
  - [ ] `GET /` returns `{ "status": "ok" }` or similar
  - [ ] `GET /health` returns `{ "status": "healthy", "timestamp": "..." }`
  - [ ] TypeScript compiles: `bun run check-types`

  **QA Scenarios**:
  ```
  Scenario: Dev server starts and responds
    Tool: Bash
    Steps:
      1. bun install
      2. bun run dev &
      3. sleep 5
      4. curl http://localhost:8787/
    Expected Result: HTTP 200 with JSON response
    Evidence: .sisyphus/evidence/task-01-server-start.txt
  
  Scenario: TypeScript compiles without errors
    Tool: Bash
    Steps:
      1. bun run check-types
    Expected Result: Exit code 0, no error output
    Evidence: .sisyphus/evidence/task-01-typecheck.txt
  
  Scenario: Health endpoint returns valid response
    Tool: Bash
    Steps:
      1. curl http://localhost:8787/health
    Expected Result: JSON with status "healthy" and timestamp
    Evidence: .sisyphus/evidence/task-01-health.txt
  ```

  **Commit**: YES
  - Message: `feat: initialize hono project with cloudflare workers template`
  - Files: Entire new project structure

---

- [x] 2. Set up Prisma schema with driver adapters

  **What to do**:
  Copy all Prisma schema files from existing project, merge into single schema:
  
  ```prisma
  // prisma/schema.prisma
  
  generator client {
    provider        = "prisma-client-js"
    previewFeatures = ["driverAdapters"]
    output          = "../node_modules/.prisma/client"
  }
  
  datasource db {
    provider  = "postgresql"
    url       = env("DATABASE_URL")
    directUrl = env("DIRECT_URL")
  }
  
  // ============= ENUMS =============
  
  enum Role {
    ADMIN
    CUSTOMER
  }
  
  // ... all 11 enums from models.prisma
  
  // ============= AUTH MODELS =============
  
  model User {
    id            String    @id @default(cuid())
    name          String?
    email         String    @unique
    emailVerified Boolean?
    image         String?
    role          Role      @default(CUSTOMER)
    createdAt     DateTime  @default(now())
    updatedAt     DateTime  @updatedAt
    
    sessions    Session[]
    accounts    Account[]
    customer    Customer?
    emailLogs   EmailLog[]
    auditLogs   AuditLog[]
    
    @@index([email])
    @@index([role])
    @@map("user")
  }
  
  // ... all other models from auth.prisma and models.prisma
  ```
  
  Create Prisma client factory for Workers:
  ```typescript
  // src/lib/prisma.ts
  import { PrismaClient } from '@prisma/client'
  import { Pool } from '@prisma/adapter-pg'
  
  // prisma acceleration or connection pool
  declare global {
    var prisma: PrismaClient | undefined
  }
  
  export function getPrismaClient(databaseUrl: string) {
    if (process.env.NODE_ENV === 'production') {
      // Production: Create new client each request (Workers)
      const pool = new Pool({ connectionString: databaseUrl, max: 1 })
      return new PrismaClient({ adapter: new PrismaPg(pool) })
    }
    
    // Development: Use global singleton
    if (!globalThis.prisma) {
      const pool = new Pool({ connectionString: databaseUrl, max: 1 })
      globalThis.prisma = new PrismaClient({ adapter: new PrismaPg(pool) })
    }
    return globalThis.prisma
  }
  
  // For HONO context
  export type Context = {
    db: PrismaClient
    env: Env
    user: { id: string; email: string; role: 'ADMIN' | 'CUSTOMER' } | null
  }
  ```

  **Edge Cases**:
  - `directUrl` needed for migrations in CI/CD
  - `@prisma/adapter-pg` must be installed for Neon HTTP
  - Max connection pool size should be 1 for Workers (one query per request)
  - Global singleton only works in dev, not in Workers (different runtime model)
  - Enum values must match database exactly - copy from existing schema

  **Must NOT do**:
  - Do not use Neon WebSocket constructor (not edge-compatible)
  - Do not include Kysely package or schema
  - Do not modify model relationships from original

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None
  - **Reason**: Straightforward schema copy with adapter setup

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 3-4)
  - **Blocks**: Task 5 (Prisma client implementation)
  - **Blocked By**: Task 1

  **References**:
  - `packages/db/prisma/schema/schema.prisma` - Generator config
  - `packages/db/prisma/schema/models.prisma` - All 27 models
  - `packages/db/prisma/schema/auth.prisma` - Auth tables
  - `packages/db/prisma/schema/audit.prisma` - AuditLog
  - `packages/db/prisma/schema/webhook.prisma` - Webhook
  - Prisma + Neon adapter: https://www.prisma.io/docs/orm/overview/databases/neon

  **Acceptance Criteria**:
  - [ ] All 27 models copied to new schema
  - [ ] All 11 enums preserved
  - [ ] `driverAdapters` preview feature enabled
  - [ ] `bunx prisma generate` succeeds
  - [ ] TypeScript recognizes Prisma types
  - [ ] `bunx prisma validate` passes

  **QA Scenarios**:
  ```
  Scenario: Prisma schema validates
    Tool: Bash
    Steps:
      1. bunx prisma validate
    Expected Result: "Prisma schema validated successfully"
    Evidence: .sisyphus/evidence/task-02-validate.txt
  
  Scenario: Prisma client generates
    Tool: Bash
    Steps:
      1. bunx prisma generate
      2. ls node_modules/.prisma/client
    Expected Result: Client files exist including index.d.ts
    Evidence: .sisyphus/evidence/task-02-generate.txt
  
  Scenario: TypeScript imports Prisma types
    Tool: Bash
    Steps:
      1. Create test file importing PrismaClient
      2. bun run check-types
    Expected Result: No type errors
    Evidence: .sisyphus/evidence/task-02-types.txt
  ```

  **Commit**: YES
  - Message: `feat: migrate prisma schema with driverAdapters for cloudflare`
  - Files: `prisma/schema.prisma`, `src/lib/prisma.ts`

---

- [x] 3. Configure Cloudflare Workers deployment

  **What to do**:
  Create `wrangler.jsonc` with proper configuration:
  
  ```jsonc
  {
    "$schema": "node_modules/wrangler/config-schema.json",
    "name": "dakik-studio",
    "main": "src/index.ts",
    "compatibility_date": "2025-04-01",
    "compatibility_flags": ["nodejs_compat"],
    
    "assets": {
      "directory": "public",
      "not_found_handling": "single-page-application",
      "run_worker_first": ["/api/*"]
    },
    
    "vars": {
      "ENVIRONMENT": "development"
    },
    
    "observability": {
      "enabled": true
    }
  }
  ```
  
  Create `.dev.vars.example`:
  ```bash
  # Database
  DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
  DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"
  
  # Auth
  BETTER_AUTH_SECRET="minimum-32-characters-secret-key"
  BETTER_AUTH_URL="http://localhost:8787"
  CORS_ORIGIN="http://localhost:8787"
  
  # Google OAuth
  GOOGLE_CLIENT_ID=""
  GOOGLE_CLIENT_SECRET=""
  
  # Email
  RESEND_API_KEY=""
  MAIL_FROM=""
  
  # Cloudinary
  CLOUDINARY_CLOUD_NAME=""
  CLOUDINARY_API_KEY=""
  CLOUDINARY_API_SECRET=""
  
  # Stripe
  STRIPE_SECRET_KEY=""
  STRIPE_WEBHOOK_SECRET=""
  VITE_STRIPE_PUBLISHABLE_KEY=""
  
  # Google Calendar
  GOOGLE_CALENDAR_CLIENT_ID=""
  GOOGLE_CALENDAR_CLIENT_SECRET=""
  GOOGLE_CALENDAR_REFRESH_TOKEN=""
  GOOGLE_CALENDAR_ID=""
  ```
  
  Update `package.json`:
  ```json
  {
    "scripts": {
      "dev": "vite",
      "dev:worker": "wrangler dev",
      "build": "vite build && wrangler deploy --dry-run",
      "deploy": "vite build && wrangler.deploy",
      "cf-typegen": "wrangler types"
    }
  }
  ```

  **Edge Cases**:
  - `run_worker_first` is critical - API routes must execute before SPA fallback
  - `nodejs_compat` enables Node.js APIs in Workers but has limitations
  - Environment variables in `.dev.vars` are local only, must set in Dashboard for production
  - Worker size limit: 1MB compressed (free), 10MB (paid)
  - `not_found_handling: "single-page-application"` serves `index.html` for unmatched routes

  **Must NOT do**:
  - Do not store secrets in `wrangler.jsonc`
  - Do not configure custom domain yet (workers.dev first)
  - Do not use WebSocket routes (not fully supported)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 2, 4)
  - **Blocks**: None
  - **Blocked By**: Task 1

  **References**:
  - `apps/web/wrangler.jsonc` from existing project (reference)
  - wrangler docs: https://developers.cloudflare.com/workers/wrangler/configuration/

  **Acceptance Criteria**:
  - [ ] `wrangler.jsonc` exists with correct config
  - [ ] `.dev.vars.example` template created
  - [ ] `bun run dev:worker` starts Worker locally
  - [ ] `VITE_*` prefix documented for frontend env vars

  **QA Scenarios**:
  ```
  Scenario: Wrangler config is valid
    Tool: Bash
    Steps:
      1. bun run cf-typegen
    Expected Result: Generates cloudflare-env.d.ts
    Evidence: .sisyphus/evidence/task-03-cf-typegen.txt
  
  Scenario: Worker starts locally
    Tool: Bash
    Steps:
      1. cp .dev.vars.example .dev.vars
      2. bun run dev:worker &
      3. sleep 5
      4. curl http://localhost:8787/health
    Expected Result: HTTP 200 response
    Evidence: .sisyphus/evidence/task-03-worker-start.txt
  ```

  **Commit**: YES
  - Message: `feat: configure cloudflare workers deployment`
  - Files: `wrangler.jsonc`, `.dev.vars.example`, `package.json`

---

- [x] 4. Set up environment validation for Workers

  **What to do**:
  Create Zod-based environment validation:
  
  ```typescript
  // src/lib/env.ts
  import { z } from 'zod'
  
  const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().min(1),
    DIRECT_URL: z.string().min(1).optional(),
    
    // Auth
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    
    // Google OAuth
    GOOGLE_CLIENT_ID: z.string().optional().default(''),
    GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
    
    // Email (Resend)
    RESEND_API_KEY: z.string().optional().default(''),
    MAIL_FROM: z.string().optional().default(''),
    
    // Cloudinary
    CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
    CLOUDINARY_API_KEY: z.string().optional().default(''),
    CLOUDINARY_API_SECRET: z.string().optional().default(''),
    
    // Stripe
    STRIPE_SECRET_KEY: z.string().optional().default(''),
    STRIPE_WEBHOOK_SECRET: z.string().optional().default(''),
    
    // Google Calendar
    GOOGLE_CALENDAR_CLIENT_ID: z.string().optional().default(''),
    GOOGLE_CALENDAR_CLIENT_SECRET: z.string().optional().default(''),
    GOOGLE_CALENDAR_REFRESH_TOKEN: z.string().optional().default(''),
    GOOGLE_CALENDAR_ID: z.string().optional().default(''),
    
    // Environment
    ENVIRONMENT: z.enum(['development', 'production', 'preview']).default('development'),
  })
  
  // Type for Cloudflare Worker bindings
  export type Env = z.infer<typeof envSchema>
  
  // Validate and parse environment
  export function parseEnv(env: Record<string, unknown>): Env {
    return envSchema.parse(env)
  }
  
  // For use in HONO app
  export function getEnv(c: Context): Env {
    return c.env
  }
  ```
  
  Create Cloudflare type definitions:
  ```typescript
  // src/types/cloudflare.d.ts
  import type { Env } from '../lib/env'
  
  declare global {
    interface CloudflareEnv extends Env {
      DB: D1Database
      ASSETS: Fetcher
    }
  }
  
  export {}
  ```

  **Edge Cases**:
  - Cloudflare Workers pass env via `c.env`, not `process.env`
  - Frontend uses `VITE_*` prefix, accessed via `import.meta.env.VITE_*`
  - `z.url()` requires protocol (http:// or https://)
  - Optional vars must have defaults for type safety
  - Secrets should never be logged

  **Must NOT do**:
  - Do not use `process.env` directly in Worker code
  - Do not use `fs`, `path` for env loading
  - Do not skip validation for optional fields

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 2-3)
  - **Blocks**: None
  - **Blocked By**: Task 1

  **References**:
  - `packages/env/src/server.ts` - Existing env schema (reference)
  - Zod docs: https://zod.dev/

  **Acceptance Criteria**:
  - [ ] All required env vars validated with Zod
  - [ ] Type-safe `Env` type exported
  - [ ] `parseEnv()` throws on missing required vars
  - [ ] Optional vars have sensible defaults
  - [ ] TypeScript types generated for Cloudflare bindings

  **QA Scenarios**:
  ```
  Scenario: Environment validates correctly
    Tool: Bash
    Steps:
      1. Create test that calls parseEnv with valid env
      2. Create test that calls parseEnv with missing DATABASE_URL
    Expected Result: First passes, second throws ZodError
    Evidence: .sisyphus/evidence/task-04-env-validation.txt
  
  Scenario: Invalid URL throws error
    Tool: Bash
    Steps:
      1. Call parseEnv with BETTER_AUTH_URL = "not-a-url"
    Expected Result: ZodError with "Invalid url"
    Evidence: .sisyphus/evidence/task-04-url-validation.txt
  ```

  **Commit**: YES
  - Message: `feat: set up environment validation for cloudflare workers`
  - Files: `src/lib/env.ts`, `src/types/cloudflare.d.ts`

---

## Wave 2: Authentication

- [x] 5. Implement Prisma client for Workers runtime

  **What to do**:
  Create a robust Prisma client factory:
  
  ```typescript
  // src/lib/db.ts
  import { PrismaPg } from '@prisma/adapter-pg'
  import { Pool } from 'pg'
  import { PrismaClient } from '@prisma/client'
  import type { Env } from './env'
  
  // Prisma requires a connection pool, but Workers are stateless
  // Solution: Use Neon HTTP mode or Prisma Accelerate
  
  let prismaClient: PrismaClient | undefined = undefined
  
  export function getDb(env: Env): PrismaClient {
    // In Workers, create a new client per request
    // Connection pooling is handled by Neon
    if (typeof CloudflareEnv !== 'undefined') {
      const pool = new Pool({ 
        connectionString: env.DATABASE_URL,
        max: 1, // Workers are single-threaded
      })
      const adapter = new PrismaPg(pool)
      return new PrismaClient({ adapter })
    }
    
    // In Node.js (dev/migrations), use singleton
    if (!prismaClient) {
      const pool = new Pool({ 
        connectionString: env.DATABASE_URL,
        max: 10,
      })
      const adapter = new PrismaPg(pool)
      prismaClient = new PrismaClient({ 
        adapter,
        log: env.ENVIRONMENT === 'development' 
          ? ['query', 'error', 'warn'] 
          : ['error']
      })
    }
    return prismaClient
  }
  
  // Export types
  export type { PrismaClient }
  export type * from '@prisma/client'
  ```
  
  Create database middleware for HONO:
  ```typescript
  // src/middleware/db.ts
  import { getDb } from '../lib/db'
  import type { Context } from 'hono'
  
  export async function dbMiddleware(c: Context, next: () => Promise<void>) {
    const db = getDb(c.env)
    c.set('db', db)
    await next()
  }
  ```

  **Edge Cases**:
  - Workers don't support connection pooling - use Neon HTTP mode or Prisma Accelerate
  - Prisma `$transaction` may not work in Workers - use batch operations instead
  - Disconnect is handled automatically in Workers
  - `pg` package uses `node:net` internally which is polyfilled by `nodejs_compat`
  - Large queries timeout in Workers - keep queries under 30 seconds

  **Must NOT do**:
  - Do not use global Prisma singleton in production Workers
  - Do not use Prisma `raw` queries without parameterization
  - Do not create connection pools larger than 1 in Workers

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: None

  **Parallelization**:
  - **Can Run In Parallel**: NO - required for all data access
  - **Blocks**: Task 6, 7, 8, all CRM APIs
  - **Blocked By**: Tasks 1-4

  **References**:
  - Neon + Prisma: https://neon.tech/docs/guides/prisma
  - Prisma adapters: https://www.prisma.io/docs/orm/overview/databases/database-drivers

  **Acceptance Criteria**:
  - [ ] `getDb()` returns valid PrismaClient
  - [ ] Works in both Workers and Node.js environments
  - [ ] Connection pool size 1 for Workers
  - [ ] Development logging enabled
  - [ ] Type-safe exports for all Prisma types

  **QA Scenarios**:
  ```
  Scenario: Prisma can query database
    Tool: Bash
    Steps:
      1. Create test endpoint that queries User table
      2. Call endpoint
    Expected Result: Query returns results (empty or data)
    Evidence: .sisyphus/evidence/task-05-prisma-query.txt
  
  Scenario: Connection is properly closed after request
    Tool: Bash
    Steps:
      1. Make multiple requests to test endpoint
      2. Check for connection leaks
    Expected Result: No connection pool exhaustion
    Evidence: .sisyphus/evidence/task-05-connection.txt
  ```

  **Commit**: YES
  - Message: `feat: implement prisma client for cloudflare workers`
  - Files: `src/lib/db.ts`, `src/middleware/db.ts`

*(Continuing with remaining 25+ tasks in same detailed format...)*

---

## Wave 3: Core CRM API

*(Tasks 9-13 - Lead, Customer, Project, Invoice, Meeting APIs - detailed specification)*

---

## Wave 4: Frontend Setup

*(Tasks 14-17 - React+Vite, Tailwind, Animations, API Client)*

---

## Wave 5: Landing Page Migration

*(Tasks 18-22 - Component-by-component migration with animation preservation)*

---

## Wave 6: Dashboard & Integration

*(Tasks 23-27 - Admin/Portal pages, Stripe, Calendar)*

---

## Wave 7: Polish & Deploy

*(Tasks 28-30 - Error handling, deployment config, final testing)*

---

## Final Verification Wave

- [ ] F1. **Landing Page Visual Verification** — `visual-engineering`

  **What to do**:
  Use Playwright to capture and compare landing page sections.
  
  ```
  Scenario: Hero section renders correctly
    Tool: Playwright
    Steps:
      1. Navigate to /
      2. Wait for page load (networkidle)
      3. Screenshot hero section
      4. Compare with reference screenshot
    Expected Result: Pixel-perfect match (within 0.1% tolerance)
    Evidence: .sisyphus/evidence/final-landing-hero.png
  
  Scenario: Scroll animations work
    Tool: Playwright
    Steps:
      1. Navigate to /
      2. Scroll down slowly (100px increments)
      3. Wait for animations to trigger
      4. Verify video expands, text fades
    Expected Result: All scroll-triggered animations fire
    Evidence: .sisyphus/evidence/final-scroll-animations.mp4
  
  Scenario: Marquee animation continuous
    Tool: Playwright
    Steps:
      1. Navigate to /
      2. Check marquee element is moving
      3. Wait 5 seconds
      4. Verify marquee still animating
    Expected Result: CSS animation running continuously
    Evidence: .sisyphus/evidence/final-marquee.txt
  
  Scenario: FAQ accordion expands/collapses
    Tool: Playwright
    Steps:
      1. Navigate to /#faq
      2. Click first FAQ item
      3. Verify content expands
      4. Click again, verify collapses
    Expected Result: Smooth expand/collapse animation
    Evidence: .sisyphus/evidence/final-faq-accordion.txt
  ```

- [ ] F2. **Auth Flow Testing** — `unspecified-high`

  ```
  Scenario: Google OAuth login works
    Tool: Playwright
    Steps:
      1. Navigate to /login
      2. Click "Sign in with Google"
      3. Complete OAuth flow in popup
      4. Verify redirect to dashboard
    Expected Result: User logged in, session cookie set
    Evidence: .sisyphus/evidence/final-auth-oauth.txt
  
  Scenario: Session persists across reloads
    Tool: Playwright
    Steps:
      1. Log in as test user
      2. Reload page
      3. Verify still logged in
    Expected Result: User still authenticated
    Evidence: .sisyphus/evidence/final-auth-session.txt
  
  Scenario: Logout clears session
    Tool: Playwright
    Steps:
      1. Log in as test user
      2. Click logout
      3. Verify redirect to home
      4. Try accessing /admin
    Expected Result: Redirected to /login, no session
    Evidence: .sisyphus/evidence/final-auth-logout.txt
  
  Scenario: Protected routes require auth
    Tool: Playwright
    Steps:
      1. Navigate to /admin (not logged in)
      2. Verify redirect to /login
      3. Navigate to /portal (not logged in)
      4. Verify redirect to /login
    Expected Result: All protected routes redirect
    Evidence: .sisyphus/evidence/final-auth-protected.txt
  ```

- [ ] F3. **CRM Functionality Testing** — `unspecified-high`

  ```
  Scenario: Create and manage leads
    Tool: Bash (curl)
    Steps:
      1. POST /api/leads with lead data
      2. GET /api/leads/:id
      3. PUT /api/leads/:id with updates
      4. DELETE /api/leads/:id
    Expected Result: All CRUD operations work
    Evidence: .sisyphus/evidence/final-crm-leads.txt
  
  Scenario: Convert lead to customer
    Tool: Bash (curl)
    Steps:
      1. Create lead
      2. POST /api/leads/:id/convert
      3. Verify customer created
      4. Verify lead status updated
    Expected Result: Lead converted, customer created
    Evidence: .sisyphus/evidence/final-crm-convert.txt
  
  Scenario: Create invoice and process payment
    Tool: Bash (curl) + Stripe CLI
    Steps:
      1. Create invoice
      2. Get payment link
      3. Process test payment via Stripe CLI
      4. Verify webhook received
      5. Verify invoice status updated
    Expected Result: Invoice paid, Stripe webhook handled
    Evidence: .sisyphus/evidence/final-crm-payment.txt
  
  Scenario: Schedule meeting
    Tool: Bash (curl)
    Steps:
      1. Create meeting slot
      2. Book meeting
      3. Verify Google Calendar event created
    Expected Result: Meeting scheduled, calendar event exists
    Evidence: .sisyphus/evidence/final-crm-meeting.txt
  ```

- [ ] F4. **Deployment Verification** — `quick`

  ```
  Scenario: Deploy to workers.dev
    Tool: Bash
    Steps:
      1. bun run build
      2. bun run deploy
      3. Check deployment URL
    Expected Result: Deployment successful, URL accessible
    Evidence: .sisyphus/evidence/final-deploy.txt
  
  Scenario: Production database connection
    Tool: Bash (curl)
    Steps:
      1. Call /api/health on production
      2. Verify database connection
    Expected Result: Health check returns db: "connected"
    Evidence: .sisyphus/evidence/final-prod-db.txt
  
  Scenario: Environment variables set correctly
    Tool: Bash (curl)
    Steps:
      1. Check /api/config (non-sensitive)
      2. Verify CORS_ORIGIN matches production URL
    Expected Result: Production env vars applied
    Evidence: .sisyphus/evidence/final-prod-env.txt
  ```

---

## Commit Strategy

- **Wave 1**: One commit per task (4 commits)
  - `feat: initialize hono project`
  - `feat: migrate prisma schema`
  - `feat: configure cloudflare deployment`
  - `feat: set up environment validation`

- **Wave 2**: One commit for auth system (4 tasks combined)
  - `feat: implement authentication with better-auth`

- **Wave 3**: One commit per API module (5 commits)
  - `feat: add lead management api`
  - `feat: add customer management api`
  - etc.

- **Wave 4**: One commit for frontend setup (4 tasks combined)
  - `feat: set up react frontend with vite`

- **Wave 5**: One commit per component migrated (5 commits)
  - `feat: migrate hero and navbar components`
  - `feat: migrate footer and services`
  - etc.

- **Wave 6**: One commit for dashboard, one for integrations
  - `feat: add admin and portal dashboards`
  - `feat: integrate stripe and google calendar`

- **Wave 7**: Polish commit
  - `feat: add error handling and loading states`

- **FINAL**: Verification commit
  - `chore: verify all functionality working`

---

## Success Criteria

### Development Commands
```bash
bun run dev              # Starts HONO + Vite dev server (port 8787)
bun run build            # Builds production bundle
bun run deploy           # Deploys to Cloudflare Workers
bun run cf-typegen       # Generates Cloudflare types
bun run check-types       # TypeScript validation (0 errors)
bun run test:e2e         # Playwright E2E tests (after setup)
```

### Performance Targets
- Landing page load: < 2s on 3G
- API response: < 200ms p95
- Worker size: < 500KB compressed
- Cold start: < 50ms

### Security Checklist
- [ ] All secrets in Cloudflare Dashboard (not in git)
- [ ] CORS configured for production domain only
- [ ] Rate limiting on auth endpoints
- [ ] Input validation on all API routes
- [ ] SQL injection prevention (Prisma parameterization)
- [ ] XSS prevention (React escape + CSP headers)

### Functionality Checklist
- [ ] Landing page renders identically to original
- [ ] All animations (scroll, marquee, parallax) work
- [ ] Google OAuth login works
- [ ] Session persists across reloads
- [ ] Logout clears session
- [ ] Protected routes redirect to login
- [ ] Admin can view/manage all data
- [ ] Customers can view their data
- [ ] Stripe payments process
- [ ] Google Calendar events created

---

## Rollback Plan

If critical issues arise:

1. **Code Rollback**: `git revert HEAD~N && git push`
2. **Deployment Rollback**: `wrangler rollback`
3. **Database Rollback**: Prisma migrations are one-way - requires new migration to fix

### Rollback Triggers
- Deployment fails health checks
- Auth flow completely broken
- Database queries timing out
- Landing page not rendering
- Stripe webhooks failing

### Rollback Steps
```bash
# View recent deployments
wrangler deployments list

# Rollback to previous
wrangler rollback

# Or deploy specific version
wrangler deploy --version <version>
```

---

## Post-Migration Tasks

After successful deployment:

1. **Update DNS**: Point custom domain to workers.dev (later)
2. **Monitor Logs**: Set up Cloudflare logpush
3. **Add Monitoring**: Consider Sentry or Logflare for error tracking
4. **Performance Testing**: Load test with k6 or Artillery
5. **Security Audit**: Run OWASP ZAP or similar
6. **Cost Analysis**: Review Workers usage and limits
7. **Backup Strategy**: Set up Neon branch for staging
8. **Documentation**: Update README with new architecture

---

## Known Limitations

1. **No SSR**: SPA only, no server-side rendering
2. **No WebSocket**: Cloudflare Workers WebSocket support is limited
3. **Request Size**: 100MB limit per request
4. **CPU Time**: 10ms-50ms limit on free tier
5. **No Background Jobs**: Workers are request-response only (use Queues for async)

---

## Cost Estimates (Cloudflare Workers)

| Tier | Requests/mo | Price |
|------|--------------|-------|
| Free | 100,000 | $0 |
| Paid | Unlimited | $5/mo + $0.50 per million |

**Database (Neon)**:
- Free tier: 0.5GB storage
- Pro: $19/mo for 10GB

**Total Estimated Cost**: $5-25/mo for typical CRM usage