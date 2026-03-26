# HONO Integration Notepad

## Project Info
- **Plan**: hono-integration
- **Location**: `/dakik-studio-hono`
- **Progress**: 0/71 tasks

## Current State

### Already Done (verified):
- ✅ API routes exist: leads, customers, projects, invoices, meetings, availability, auth
- ✅ Frontend components exist: all 9 landing components, motion, ui
- ✅ DB middleware exists: `src/middleware/db.ts`
- ✅ API client exists: `src/frontend/lib/api.ts`
- ✅ Auth handler exists: `src/routes/api/auth.ts`
- ✅ React Router set up with routes for landing, login, survey, admin, portal
- ✅ react-router-dom installed (v7.13.2)
- ✅ API router mounting fixed with lazy initialization

### Critical Issues:
1. `src/index.ts` - missing dbMiddleware and API router mounting
2. `src/frontend/App.tsx` - only renders Hero and Navbar, missing 7 components
3. No react-router-dom installed

## Key Files
- `src/index.ts` - Main HONO app (needs fixing)
- `src/routes/api/index.ts` - API router aggregator
- `src/middleware/db.ts` - DB middleware
- `src/frontend/App.tsx` - Frontend app (needs fixing)
- `src/frontend/components/landing/index.ts` - Exports all 9 components

## API Router Signature
```typescript
createApiRouter(env: EnvVars) // EnvVars from lib/env.ts
```

## Notes
- `createApiRouter` requires EnvVars but only uses it for auth handler
- Routes get db via `c.get("db")` from dbMiddleware
- CloudflareEnv extends EnvVars, so passing c.env should work

## Cloudflare Workers Env Pattern
- In CF Workers, `env` (bindings, vars) is only available per-request via `c.env`
- Module-level code cannot access env directly
- Original code created `createAuthHandler(env)` on every request (inefficient but works)
- Lazy initialization pattern: create router once on first request when env is available
```typescript
let apiRouter: ReturnType<typeof createApiRouter> | undefined;
app.all("/api/*", async (c) => {
    if (!apiRouter) {
        apiRouter = createApiRouter(c.env as CloudflareEnv);
    }
    return await apiRouter.fetch(c.req.raw, c.env, c.executionCtx);
});
```

## API Router Path Prefix Issue
- When using `apiRouter.fetch(req)` with a manually routed request, the full path `/api/leads` is passed
- The inner router expects `/leads`, not `/api/leads`
- Solution: Strip the `/api` prefix before passing to inner router:
```typescript
const url = new URL(c.req.url);
url.pathname = url.pathname.slice(4); // Remove '/api' prefix
const req = new Request(url, c.req.raw);
return apiRouter.fetch(req);
```

## Survey.tsx Implementation
- Multi-step form with 3 steps: Contact Info, Project Details, Additional Info
- Uses api.leads.create() for submission (Lead type doesn't include phone/timeline - these are optional extra fields)
- Dark theme (bg-black, text-white) with zinc-900 for form container
- Email validation regex must be defined outside component to avoid linter "not defined in top level" error
- SVG icons need both aria-label AND <title> child for accessibility compliance
- Buttons need explicit type="button" or type="submit" attribute
