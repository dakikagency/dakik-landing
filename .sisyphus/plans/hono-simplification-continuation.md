# Plan: HONO Simplification Continuation

## TL;DR

> **Quick Summary**: Complete the HONO migration by integrating all created components, fixing missing integrations, and implementing the remaining dashboard/polish tasks.
> 
> **Deliverables**:
> - Fully integrated HONO backend with all API routes mounted
> - Complete landing page with all components integrated
> - Frontend API client for data fetching
> - Admin dashboard pages
> - Customer portal pages
> - Stripe webhook handler
> - Deployment to Cloudflare Workers

> **Estimated Effort**: Medium (integration + remaining features)
> **Parallel Execution**: YES - 2-3 waves

---

## What's Already Done

### Backend (Created but NOT integrated)
- `src/lib/db.ts` - Prisma client factory ✅
- `src/middleware/db.ts` - DB middleware ✅ (not mounted in main app)
- `src/lib/auth.ts` - better-auth configuration ✅
- `src/routes/api/auth.ts` - Auth handler ✅
- `src/routes/api/leads.ts` - Lead CRUD ✅
- `src/routes/api/customers.ts` - Customer CRUD ✅
- `src/routes/api/projects.ts` - Project CRUD ✅
- `src/routes/api/invoices.ts` - Invoice CRUD + Stripe ✅
- `src/routes/api/meetings.ts` - Meeting CRUD + Calendar ✅
- `src/routes/api/availability.ts` - Time slots ✅

### Frontend Components (Created but NOT integrated)
- `src/frontend/components/landing/Hero.tsx` ✅
- `src/frontend/components/landing/Navbar.tsx` ✅
- `src/frontend/components/landing/Services.tsx` ✅
- `src/frontend/components/landing/Work.tsx` ✅
- `src/frontend/components/landing/Testimonials.tsx` ✅
- `src/frontend/components/landing/FAQ.tsx` ✅
- `src/frontend/components/landing/Footer.tsx` ✅
- `src/frontend/components/landing/Marquee.tsx` ✅
- `src/frontend/components/landing/LogoCarousel.tsx` ✅
- `src/frontend/components/ui/GridBackdrop.tsx` ✅
- `src/frontend/components/ui/HoverReveal.tsx` ✅
- `src/frontend/components/ui/InfiniteMovingCards.tsx` ✅
- `src/frontend/components/motion/*.tsx` ✅
- `src/frontend/components/Noise.tsx` ✅
- `src/frontend/index.css` - Has marquee animations ✅

---

## Critical Issues to Fix

### Issue 1: Main App Not Using API Router
**Current** (`src/index.ts`):
```typescript
// Only has auth and health - missing all CRM routes!
app.on(["POST", "GET"], "/api/auth/*", (c) => {...});
```

**Fix**: Mount the full API router and dbMiddleware.

### Issue 2: Frontend App Not Using All Components
**Current** (`src/frontend/App.tsx`):
```typescript
// Only imports Hero and Navbar!
return (
  <div><Navbar /><Hero /></div>
);
```

**Fix**: Import and render all landing page components.

### Issue 3: Missing Frontend API Client
**Status**: `src/frontend/lib/api.ts` was supposed to be created but doesn't exist.

**Fix**: Create typed API client for frontend data fetching.

---

## TODOs

---

## Wave 1: Critical Integrations (Must Do First)

- [ ] 1. Integrate dbMiddleware and API router in main app

  **What to do**:
  - Update `src/index.ts` to use `dbMiddleware` before all API routes
  - Import and mount `createApiRouter` from `src/routes/api/index.ts`
  - Ensure all routes work: `/api/leads`, `/api/customers`, `/api/projects`, `/api/invoices`, `/api/meetings`

  **File to Edit**: `dakik-studio-hono/src/index.ts`
  
  **Current Code**:
  ```typescript
  import { Hono } from "hono";
  import { cors } from "./middleware/cors";
  import { errorHandler } from "./middleware/error-handler";
  import { logger } from "./middleware/logger";
  import { createAuthHandler } from "./routes/api/auth";
  import { healthRoute } from "./routes/health";
  import type { CloudflareEnv } from "./types/cloudflare";

  const app = new Hono();
  // ... only auth and health mounted
  ```
  
  **Target Code**:
  ```typescript
  import { Hono } from "hono";
  import { cors } from "./middleware/cors";
  import { dbMiddleware } from "./middleware/db";
  import { errorHandler } from "./middleware/error-handler";
  import { logger } from "./middleware/logger";
  import { createApiRouter } from "./routes/api";
  import { healthRoute } from "./routes/health";
  import type { CloudflareEnv } from "./types/cloudflare";

  const app = new Hono();

  app.use("*", cors);
  app.use("*", logger);
  app.use("/api/*", dbMiddleware); // DB middleware for all API routes
  app.onError(errorHandler);

  app.route("/health", healthRoute);
  app.route("/api", createApiRouter()); // Mount full API router

  app.get("/", (c) => c.json({ message: "Dakik Studio API", version: "0.0.1" }));
  
  export default app;
  ```

  **Verification**: `curl localhost:8787/api/leads` returns empty array `{"leads": []}`

- [ ] 2. Integrate all landing page components in App.tsx

  **What to do**:
  - Import all landing page components
  - Render them in the correct order
  - Match the original landing page structure

  **File to Edit**: `dakik-studio-hono/src/frontend/App.tsx`
  
  **Target Code**:
  ```typescript
  import {
    FAQ,
    Footer,
    Hero,
    LogoCarousel,
    Marquee,
    Navbar,
    ServicesSection,
    Testimonials,
    Work,
  } from "./components/landing";

  export default function App() {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main>
          <Hero />
          <Marquee />
          <LogoCarousel />
          <ServicesSection />
          <Work />
          <Testimonials />
          <FAQ />
        </main>
        <Footer />
      </div>
    );
  }
  ```

  **Verification**: Run `bun run dev:frontend` and see all sections rendered.

- [ ] 3. Create frontend API client

  **What to do**:
  - Create typed fetch wrapper for API calls
  - Handle authentication state (session)
  - Provide methods for all CRUD operations

  **File to Create**: `dakik-studio-hono/src/frontend/lib/api.ts`
  
  **Implementation**:
  ```typescript
  const API_BASE = "/api";

  interface ApiResponse<T> {
    data?: T;
    error?: string;
  }

  async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      credentials: "include", // For cookies
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "API Error");
    }

    return response.json();
  }

  // Lead API
  export const leadApi = {
    list: (params?: { search?: string; status?: string }) =>
      fetchApi<{ leads: Lead[] }>(`/leads?${new URLSearchParams(params || {})}`),
    get: (id: string) => fetchApi<{ lead: Lead }>(`/leads/${id}`),
    create: (data: CreateLeadInput) =>
      fetchApi<{ lead: Lead }>("/leads", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: UpdateLeadInput) =>
      fetchApi<{ lead: Lead }>(`/leads/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => fetchApi<{ success: boolean }>(`/leads/${id}`, { method: "DELETE" }),
  };

  // Similar implementations for customer, project, invoice, meeting APIs...
  ```

  **Verification**: TypeScript compiles without errors.

---

## Wave 2: Remaining Features

- [ ] 4. Create Admin Dashboard Layout

  **What to do**:
  - Create admin layout with sidebar navigation
  - Create dashboard home page with stats overview
  - Create pages for: Leads, Customers, Projects, Invoices, Meetings

  **Files to Create**:
  - `src/frontend/components/admin/AdminLayout.tsx`
  - `src/frontend/components/admin/Sidebar.tsx`
  - `src/frontend/pages/admin/Dashboard.tsx`
  - `src/frontend/pages/admin/Leads.tsx`
  - `src/frontend/pages/admin/Customers.tsx`
  - `src/frontend/pages/admin/Projects.tsx`
  - `src/frontend/pages/admin/Invoices.tsx`
  - `src/frontend/pages/admin/Meetings.tsx`

  **Note**: This requires React Router setup for SPA routing.

- [ ] 5. Create Customer Portal Layout

  **What to do**:
  - Create customer portal layout with navigation
  - Create pages for: My Projects, Invoices, Meetings

  **Files to Create**:
  - `src/frontend/components/portal/PortalLayout.tsx`
  - `src/frontend/pages/portal/Dashboard.tsx`
  - `src/frontend/pages/portal/Projects.tsx`
  - `src/frontend/pages/portal/Invoices.tsx`
  - `src/frontend/pages/portal/Meetings.tsx`

- [ ] 6. Add React Router for SPA routing

  **What to do**:
  - Install `react-router-dom`
  - Configure routes for landing page, admin, portal, auth
  - Add protected route wrapper for authenticated pages

  **File to Create**: `src/frontend/router.tsx`
  
  **Routes Structure**:
  ```
  / - Landing page (public)
  /survey - Lead capture form (public)
  /login - Authentication page (public)
  /admin/* - Admin dashboard (protected, ADMIN role)
  /portal/* - Customer portal (protected, CUSTOMER role)
  ```

- [ ] 7. Create Stripe webhook handler

  **What to do**:
  - Create `/api/webhooks/stripe` endpoint
  - Handle `payment_intent.succeeded` event
  - Update invoice status to PAID

  **File to Create**: `src/routes/api/webhooks/stripe.ts`

- [ ] 8. Verify all frontend builds successfully

  **What to do**:
  - Run `bun run build:frontend`
  - Fix any build errors
  - Ensure static assets are generated

---

## Wave 3: Polish & Deploy

- [ ] 9. Add error boundaries and loading states

  **What to do**:
  - Create `ErrorBoundary` component for React error handling
  - Create loading spinners for async states
  - Add suspense boundaries for code splitting

  **Files to Create**:
  - `src/frontend/components/ErrorBoundary.tsx`
  - `src/frontend/components/Loading.tsx`

- [ ] 10. Create survey/lead capture form

  **What to do**:
  - Create multi-step survey form
  - Connect to `/api/leads` endpoint
  - Add validation with Zod

  **Files to Create**:
  - `src/frontend/pages/Survey.tsx`
  - `src/frontend/components/survey/SurveyForm.tsx`

- [ ] 11. Test authentication flow

  **What to do**:
  - Test Google OAuth login
  - Test session persistence
  - Test logout
  - Test protected route redirects

- [ ] 12. Deploy to Cloudflare Workers

  **What to do**:
  - Set environment variables in Cloudflare Dashboard
  - Run `bun run deploy`
  - Verify deployment URL works
  - Test production API endpoints

---

## Final Verification Wave

- [ ] F1. Landing Page Visual Verification
  - All sections render correctly
  - Animations work (scroll, hover, stagger)
  - Responsive design works
  - No console errors

- [ ] F2. Auth Flow Testing
  - Google OAuth login works
  - Session persists
  - Logout clears session
  - Protected routes redirect correctly

- [ ] F3. CRM Functionality Testing
  - CRUD operations work for all entities
  - Stripe payment flow works
  - Google Calendar integration works

- [ ] F4. Deployment Verification
  - All pages load
  - API endpoints respond
  - Database queries work
  - Static assets served

---

## Commit Strategy

- **Wave 1**: One commit per integration fix (3 commits)
- **Wave 2**: One commit for admin dashboard, one for portal, one for routing, one for webhooks (4 commits)
- **Wave 3**: One commit for polish, one for survey, deployment as final commit

---

## Success Criteria

- [ ] `bun run dev` starts both frontend and backend
- [ ] `bun run build` produces production bundle
- [ ] Landing page renders withall sections
- [ ] Admin dashboard is accessible after login
- [ ] Customer portal is accessible after login
- [ ] API routes respond to CRUD requests
- [ ] Stripe webhooks update invoice status
- [ ] Google Calendar creates events on meeting booking
- [ ] Cloudflare Workers deployment successful