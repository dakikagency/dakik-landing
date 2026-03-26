# Plan: HONO Integration - Complete the Migration

## TL;DR

> **Quick Summary**: Fix critical integration issues and complete the HONO migration. The backend API routes and frontend components are already created but not connected. This plan integrates everything and adds the remaining features.
> 
> **Deliverables**:
> - Fully working API backend with all routes mounted
> - Complete landing page with all sections rendered
> - Frontend API client for data fetching
> - SPA routing with React Router
> - Admin dashboard and customer portal pages
> - Stripe webhook handler
> - Deployable Cloudflare Workers application

> **Estimated Effort**: Medium (12 tasks)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: API Integration → App Integration → Router → Dashboards → Deploy

---

## Context

### What's Already Done (Verified - NOT Placeholders)

**Backend API Routes** (Created, NOT integrated):
- `src/routes/api/leads.ts` - Full CRUD+ `/:id/convert` endpoint ✅
- `src/routes/api/customers.ts` - Full CRUD with relations ✅
- `src/routes/api/projects.ts` - Full CRUD + `/:id/qanda` endpoints ✅
- `src/routes/api/invoices.ts` - Full CRUD + `/:id/pay` with Stripe ✅
- `src/routes/api/meetings.ts` - Full CRUD + Google Calendar integration ✅
- `src/routes/api/availability.ts` - Time slot calculation ✅
- `src/routes/api/auth.ts` - better-auth handler ✅

**Frontend Components** (Created, NOT integrated):
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
- `src/frontend/components/motion/Reveal.tsx` ✅
- `src/frontend/components/motion/FadeIn.tsx` ✅
- `src/frontend/components/motion/StaggerContainer.tsx` ✅
- `src/frontend/components/motion/StaggerItem.tsx` ✅
- `src/frontend/components/Noise.tsx` ✅
- `src/frontend/index.css` - Has marquee animations ✅

**Infrastructure**:
- `src/lib/db.ts` - Prisma client factory ✅
- `src/middleware/db.ts` - DB middleware ✅
- `src/lib/auth.ts` - better-auth configuration ✅
- `src/lib/env.ts` - Environment validation ✅
- `prisma/schema.prisma` - Full schema (11 enums, 27 models) ✅

### Critical Issues to Fix

**Issue 1: Main App Not Using API Router**
- `src/index.ts` only mounts `/api/auth/*` and `/health`
- Missing: `dbMiddleware` for database connections
- Missing: API routes for `/api/leads`, `/api/customers`, `/api/projects`, `/api/invoices`, `/api/meetings`

**Issue 2: Frontend App Not Using All Components**
- `src/frontend/App.tsx` only imports Hero and Navbar
- Missing: Services, Work, Testimonials, FAQ, Footer, Marquee, LogoCarousel

**Issue 3: Missing Frontend API Client**
- No typed API client for data fetching
- No `src/frontend/lib/api.ts`

**Issue 4: No SPA Routing**
- No routing for `/admin/*`, `/portal/*`, `/survey`, `/login`

### Architecture After Completion

```
dakik-studio-hono/
├── src/
│   ├── index.ts                    # Main HONO app (_with dbMiddleware + API router_)
│   ├── lib/
│   │   ├── auth.ts                 # better-auth config
│   │   ├── db.ts                   # Prisma client
│   │   └── env.ts                  # Zod validation
│   ├── middleware/
│   │   ├── db.ts                   # DB middleware (_to be mounted_)
│   │   ├── cors.ts
│   │   ├── error-handler.ts
│   │   └── logger.ts
│   ├── routes/
│   │   ├── health.ts
│   │   └── api/
│   │       ├── index.ts            # API router aggregator (_to be connected_)
│   │       ├── auth.ts
│   │       ├── leads.ts
│   │       ├── customers.ts
│   │       ├── projects.ts
│   │       ├── invoices.ts
│   │       ├── meetings.ts
│   │       ├── availability.ts
│   │       └── webhooks/           # _to be created_
│   │           └── stripe.ts
│   └── frontend/
│       ├── App.tsx                 # _All landing components integrated_
│       ├── main.tsx
│       ├── router.tsx              # _New: React Router config_
│       ├── lib/
│       │   ├── api.ts              # _New: Typed API client_
│       │   └── utils.ts
│       ├── components/
│       │   ├── landing/            # All 9components ✅
│       │   ├── motion/             # All 4 components ✅
│       │   ├── ui/                 # All 3 components ✅
│       │   ├── admin/              # _New: Admin dashboard_
│       │   ├── portal/             # _New: Customer portal_
│       │   └── shared/             # _New: Shared UI_
│       └── pages/
│           ├── admin/              # _New: Admin pages_
│           ├── portal/             # _New: Portal pages_
│           ├── Survey.tsx          # _New: Lead capture_
│           └── Login.tsx           # _New: Auth page_
└── prisma/
    └── schema.prisma               # Complete ✅
```

---

## Execution Strategy

### Dependency Graph

```
Wave 1 (Critical - Sequential):
├── Task 1: Fix API router mounting (blocks all)
├── Task 2: Integrate landing components → Task 1 (can run parallel)
└── Task 3: Create API client → Task 1 (can run parallel)

Wave 2 (Features - Parallel after Wave 1):
├── Task 4: React Router setup
├── Task 5: Admin dashboard
├── Task 6: Customer portal
└── Task 7: Stripe webhook

Wave 3 (Polish - Sequential):
├── Task 8: Error boundaries
├── Task 9: Survey form
├── Task 10: Testing
└── Task 11: Deployment

Final Wave (Verification):
├── F1: Landing page visual check
├── F2: Auth flow testing
├── F3: API testing
└── F4: Deployment verification
```

---

## TODOs

---

## Wave 1: Critical Integrations

- [x] 1. Fix API Router and DB Middleware Integration

  **What to do**:Update `src/index.ts` to properly mount all API routes and database middleware.

  **Current Code** (`dakik-studio-hono/src/index.ts`):
  ```typescript
  import { Hono } from "hono";
  import { cors } from "./middleware/cors";
  import { errorHandler } from "./middleware/error-handler";
  import { logger } from "./middleware/logger";
  import { createAuthHandler } from "./routes/api/auth";
  import { healthRoute } from "./routes/health";
  import type { CloudflareEnv } from "./types/cloudflare";

  const app = new Hono();

  app.use("*", cors);
  app.use("*", logger);
  app.onError(errorHandler);

  app.route("/health", healthRoute);

  app.on(["POST", "GET"], "/api/auth/*", (c) => {
    const env = c.env as CloudflareEnv;
    const { handler } = createAuthHandler(env);
    return handler(c);
  });

  app.get("/", (c) => {
    return c.json({
      message: "Dakik Studio API",
      version: "0.0.1",
    });
  });

  export default app;
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

  // Global middleware
  app.use("*", cors);
  app.use("*", logger);
  app.onError(errorHandler);

  // Health check (no DB needed)
  app.route("/health", healthRoute);

  // All API routes with DB middleware
  app.use("/api/*", dbMiddleware);
  app.route("/api", createApiRouter());

  // Root endpoint
  app.get("/", (c) => {
    return c.json({
      message: "Dakik Studio API",
      version: "0.0.1",
    });
  });

  export default app;
  ```

  **Must NOT do**:
  - Do NOT create newroute files - they already exist
  - Do NOT modify the route handlers - just mount them
  - Do NOT change the middleware order

  **References**:
  - `dakik-studio-hono/src/routes/api/index.ts` - Contains all route imports
  - `dakik-studio-hono/src/middleware/db.ts` - DB middleware implementation
  - `dakik-studio-hono/src/lib/db.ts` - Prisma client factory

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None
  - **Reason**: Simple file edit, just mounting existing routes

  **Parallelization**:
  - **Can Run In Parallel**: NO - blocks Tasks 2 and 3
  - **Blocks**: Tasks 2, 3(click for details)
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `bun run dev` starts without errors
  - [ ] `curl localhost:8787/api/leads` returns `{"leads": []}`
  - [ ] `curl localhost:8787/api/customers` returns `{"customers": []}`
  - [ ] `curl localhost:8787/api/projects` returns `{"projects": []}`
  - [ ] `curl localhost:8787/api/invoices` returns `{"invoices": []}`
  - [ ] `curl localhost:8787/api/meetings` returns `{"meetings": []}`
  - [ ] TypeScript compiles: `bun run check-types`

  **QA Scenarios**:
  ```
  Scenario: API routes return valid JSON
    Tool: Bash (curl)
    Steps:
      1. bun run dev &
      2. sleep 3
      3. curl -s localhost:8787/api/leads
      4. curl -s localhost:8787/api/customers
      5. curl -s localhost:8787/api/projects
    Expected Result: All return JSON with empty arrays
    Evidence: .sisyphus/evidence/task-01-api-routes.txt

  Scenario: Health endpoint works
    Tool: Bash (curl)
    Steps:
      1. curl -s localhost:8787/health
    Expected Result: {"status":"healthy","timestamp":"..."}
    Evidence: .sisyphus/evidence/task-01-health.txt
  ```

  **Commit**: YES
  - Message: `feat: mount all API routes with db middleware`
  - Files: `dakik-studio-hono/src/index.ts`

---

- [x] 2. Integrate All Landing Page Components

  **What to do**: Update `App.tsx` to render all landing page components in the correct order.

  **Current Code** (`dakik-studio-hono/src/frontend/App.tsx`):
  ```typescript
  import { Hero, Navbar } from "./components/landing";

  export default function App() {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <Hero />
      </div>
    );
  }
  ```

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

  **Must NOT do**:
  - Do NOT modify any component files - just import them
  - Do NOT change the order of components
  - Do NOT add additional wrappers or styling

  **References**:
  - `dakik-studio-hono/src/frontend/components/landing/index.ts` - Exports all components
  - `apps/web/src/app/(app)/page.tsx` - Original landing page structure (reference)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None
  - **Reason**: Simple import and render, no complex logic

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 3)
  - **Blocks**: None
  - **Blocked By**: Task 1 (must wait for API to work)

  **Acceptance Criteria**:
  - [ ] All 9 components rendered in correct order
  - [ ] TypeScript compiles: `bun run check-types`
  - [ ] Dev server starts: `bun run dev:frontend`
  - [ ] No console errors in browser

  **QA Scenarios**:
  ```
  Scenario: Landing page renders all sections
    Tool: Playwright
    Steps:
      1. Navigate to localhost:5173
      2. Wait for page load
      3. Scroll to bottom
      4. Check each section exists
    Expected Result: Navbar, Hero, Marquee, LogoCarousel, Services, Work, Testimonials, FAQ, Footer all visible
    Evidence: .sisyphus/evidence/task-02-landing-render.png

  Scenario: No console errors on page load
    Tool: Playwright
    Steps:
      1. Navigate to localhost:5173
      2. Check browser console
    Expected Result:Zero errors
    Evidence: .sisyphus/evidence/task-02-console.txt
  ```

  **Commit**: YES
  - Message: `feat: integrate all landing page components`
  - Files: `dakik-studio-hono/src/frontend/App.tsx`

---

- [x] 3. Create Frontend API Client

  **What to do**: Create a typed API client for frontend data fetching with authentication support.

  **File to Create**: `dakik-studio-hono/src/frontend/lib/api.ts`

  **Implementation**:
  ```typescript
  // Types
export interface Lead {
    id: string;
    email: string;
    name?: string;
    projectType?: string;
    budget?: string;
    details?: string;
    source?: string;
    status: string;
    currentStep?: string;
    surveyProgress?: number;
    createdAt: string;
    updatedAt: string;
  }

  export interface Customer {
    id: string;
    userId: string;
    leadId?: string;
    companyName?: string;
    phone?: string;
    createdAt: string;
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
    };
  }

  export interface Project {
    id: string;
    customerId: string;
    title: string;
    description?: string;
    status: string;
    progress?: number;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    customer?: Customer;
  }

  export interface Invoice {
    id: string;
    customerId: string;
    projectId?: string;
    amount: number;
    description?: string;
    status: string;
    invoiceDate: string;
    dueDate?: string;
    paidAt?: string;
    stripePaymentIntentId?: string;
  }

  export interface Meeting {
    id: string;
    leadId?: string;
    customerId?: string;
    title: string;
    description?: string;
    scheduledAt: string;
    duration: number;
    status: string;
    eventId?: string;
    meetUrl?: string;
  }

  // API Client
  const API_BASE = "/api";

  async function fetchApi<T>(
    path: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // Lead API
  export const leadApi = {
    list: (params?: { search?: string; status?: string }) => {
      const query = new URLSearchParams(
        Object.entries(params || {}).filter(([, v]) => v)
      ).toString();
      return fetchApi<{ leads: Lead[] }>(`/leads${query ? `?${query}` : ""}`);
    },

    get: (id: string) => fetchApi<{ lead: Lead }>(`/leads/${id}`),

    create: (data: Partial<Lead>) =>
      fetchApi<{ lead: Lead }>("/leads", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<Lead>) =>
      fetchApi<{ lead: Lead }>(`/leads/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchApi<{ success: boolean }>(`/leads/${id}`, {
        method: "DELETE",
      }),

    convert: (id: string, data: { companyName?: string; phone?: string }) =>
      fetchApi<{ customer: Customer; lead: Lead }>(`/leads/${id}/convert`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  };

  // Customer API
  export const customerApi = {
    list: (params?: { search?: string }) => {
      const query = new URLSearchParams(
        Object.entries(params || {}).filter(([, v]) => v)
      ).toString();
      return fetchApi<{ customers: Customer[] }>(
        `/customers${query ? `?${query}` : ""}`
      );
    },

    get: (id: string) => fetchApi<{ customer: Customer }>(`/customers/${id}`),

    update: (id: string, data: Partial<Customer>) =>
      fetchApi<{ customer: Customer }>(`/customers/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchApi<{ success: boolean }>(`/customers/${id}`, {
        method: "DELETE",
      }),
  };

  // Project API
  export const projectApi = {
    list: (params?: { status?: string; customerId?: string; search?: string }) => {
      const query = new URLSearchParams(
        Object.entries(params || {}).filter(([, v]) => v)
      ).toString();
      return fetchApi<{ projects: Project[] }>(
        `/projects${query ? `?${query}` : ""}`
      );
    },

    get: (id: string) => fetchApi<{ project: Project }>(`/projects/${id}`),

    create: (data: Partial<Project>) =>
      fetchApi<{ project: Project }>("/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<Project>) =>
      fetchApi<{ project: Project }>(`/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchApi<{ success: boolean }>(`/projects/${id}`, {
        method: "DELETE",
      }),

    updateProgress: (
      id: string,
      data: { progress: number; updateTitle?: string; updateContent?: string }
    ) =>
      fetchApi<{ project: Project }>(`/projects/${id}/progress`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  };

  // Invoice API
  export const invoiceApi = {
    list: (params?: { status?: string; customerId?: string }) => {
      const query = new URLSearchParams(
        Object.entries(params || {}).filter(([, v]) => v)
      ).toString();
      return fetchApi<{ invoices: Invoice[] }>(
        `/invoices${query ? `?${query}` : ""}`
      );
    },

    get: (id: string) => fetchApi<{ invoice: Invoice }>(`/invoices/${id}`),

    create: (data: Partial<Invoice>) =>
      fetchApi<{ invoice: Invoice }>("/invoices", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    pay: (id: string) =>
      fetchApi<{ clientSecret: string }>(`/invoices/${id}/pay`, {
        method: "POST",
      }),
  };

  // Meeting API
  export const meetingApi = {
    list: (params?: { status?: string; startDate?: string; endDate?: string }) => {
      const query = new URLSearchParams(
        Object.entries(params || {}).filter(([, v]) => v)
      ).toString();
      return fetchApi<{ meetings: Meeting[] }>(
        `/meetings${query ? `?${query}` : ""}`
      );
    },

    get: (id: string) => fetchApi<{ meeting: Meeting }>(`/meetings/${id}`),

    create: (data: {
      leadId?: string;
      customerId?: string;
      title: string;
      description?: string;
      date: string;
      startTime: string;
      duration?: number;
    }) =>
      fetchApi<{ meeting: Meeting }>("/meetings", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    cancel: (id: string) =>
      fetchApi<{ success: boolean }>(`/meetings/${id}`, {
        method: "DELETE",
      }),
  };

  // Availability API
  export const availabilityApi = {
    getSlots: (date: string) =>
      fetchApi<{ slots: { start: string; end: string; available: boolean }[] }>(
        `/availability?date=${date}`
      ),
  };
  ```

  **Must NOT do**:
  - Do NOT add authentication logic yet (that's for router setup)
  - Do NOT add React Query orSWR - plain fetch is fine
  - Do NOT modify any existing files

  **References**:
  - `dakik-studio-hono/src/routes/api/leads.ts` - Lead API endpoints
  - `dakik-studio-hono/src/routes/api/customers.ts` - Customer API endpoints
  - `dakik-studio-hono/src/routes/api/projects.ts` - Project API endpoints

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None
  - **Reason**: Creating a new file with typed fetch wrappers

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 2)
  - **Blocks**: None
  - **Blocked By**: Task 1 (must wait for API to work)

  **Acceptance Criteria**:
  - [ ] File created: `dakik-studio-hono/src/frontend/lib/api.ts`
  - [ ] All types exported: Lead, Customer, Project, Invoice, Meeting
  - [ ] All API methods exported: leadApi, customerApi, projectApi, invoiceApi, meetingApi, availabilityApi
  - [ ] TypeScript compiles: `bun run check-types`

  **QA Scenarios**:
  ```
  Scenario: API client types are correct
    Tool: Bash
    Steps:
      1. bun run check-types
    Expected Result: No TypeScript errors
    Evidence: .sisyphus/evidence/task-03-types.txt

  Scenario: API client can fetch data
    Tool: Bash
    Steps:
      1. Create test file that imports leadApi
      2. bun run check-types
    Expected Result: Types match API responses
    Evidence: .sisyphus/evidence/task-03-api-client.txt
  ```

  **Commit**: YES
  - Message: `feat: create frontend API client`
  - Files: `dakik-studio-hono/src/frontend/lib/api.ts`

---

## Wave 2: Features

- [x] 4. Add React Router for SPA Routing

  **What to do**: Set up React Router with routes for landing page, admin, portal, and auth.

  **Files to Create**:
  - `dakik-studio-hono/src/frontend/router.tsx` - Router configuration
  - `dakik-studio-hono/src/frontend/pages/Login.tsx` - Login page
  - `dakik-studio-hono/src/frontend/pages/Survey.tsx` - Lead capture form

  **Files to Modify**:
  - `dakik-studio-hono/src/frontend/App.tsx` - Use router
  - `dakik-studio-hono/src/frontend/main.tsx` - Wrap with Router provider
  - `dakik-studio-hono/package.json` - Add react-router-dom

  **Router Structure**:
  ```typescript
  // router.tsx
  import { createBrowserRouter } from "react-router-dom";
  import App from "./App";
  import { LandingPage } from "./pages/LandingPage";
  import { LoginPage } from "./pages/Login";
  import { SurveyPage } from "./pages/Survey";
  import { AdminLayout } from "./components/admin/AdminLayout";
  import { AdminDashboard } from "./pages/admin/Dashboard";
  import { AdminLeads } from "./pages/admin/Leads";
  import { AdminCustomers } from "./pages/admin/Customers";
  import { AdminProjects } from "./pages/admin/Projects";
  import { AdminInvoices } from "./pages/admin/Invoices";
  import { AdminMeetings } from "./pages/admin/Meetings";
  import { PortalLayout } from "./components/portal/PortalLayout";
  import { PortalDashboard } from "./pages/portal/Dashboard";
  import { PortalProjects } from "./pages/portal/Projects";
  import { PortalInvoices } from "./pages/portal/Invoices";
  import { PortalMeetings } from "./pages/portal/Meetings";

  export const router = createBrowserRouter([
    {
      path: "/",
      element: <App />,
      children: [
        { index: true, element: <LandingPage /> },
        { path: "login", element: <LoginPage /> },
        { path: "survey", element: <SurveyPage /> },
        {
          path: "admin",
          element: <AdminLayout />,
          children: [
            { index: true, element: <AdminDashboard /> },
            { path: "leads", element: <AdminLeads /> },
            { path: "customers", element: <AdminCustomers /> },
            { path: "projects", element: <AdminProjects /> },
            { path: "invoices", element: <AdminInvoices /> },
            { path: "meetings", element: <AdminMeetings /> },
          ],
        },
        {
          path: "portal",
          element: <PortalLayout />,
          children: [
            { index: true, element: <PortalDashboard /> },
            { path: "projects", element: <PortalProjects /> },
            { path: "invoices", element: <PortalInvoices /> },
            { path: "meetings", element: <PortalMeetings /> },
          ],
        },
      ],
    },
  ]);
  ```

  **Package to Install**:
  ```bash
  cd dakik-studio-hono && bun add react-router-dom
  ```

  **References**:
  - `apps/web/src/app/(app)/page.tsx` - Original landing page
  - `apps/web/src/app/admin/` - Original admin pages
  - `apps/web/src/app/portal/` - Original portal pages

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: None
  - **Reason**: Setting up routing with multiple files

  **Parallelization**:
  - **Can Run In Parallel**: NO - foundation for tasks 5-6
  - **Blocks**: Tasks 5, 6
  - **Blocked By**: Wave 1 complete

  **Acceptance Criteria**:
  - [ ] `react-router-dom` installed
  - [ ] Router configured with all routes
  - [ ] Landing page accessible at `/`
  - [ ] Login page accessible at `/login`
  - [ ] Admin routes configured (placeholder pages)
  - [ ] Portal routes configured (placeholder pages)
  - [ ] TypeScript compiles

  **Commit**: YES
  - Message: `feat: add react router with route configuration`
  - Files: Multiple files created/modified

---

- [x] 5. Create Admin Dashboard Pages

  **What to do**: Create admin dashboard layout and CRUD pages for leads, customers, projects, invoices, meetings.

  **Files to Create**:
  - `dakik-studio-hono/src/frontend/components/admin/AdminLayout.tsx`
  - `dakik-studio-hono/src/frontend/components/admin/Sidebar.tsx`
  - `dakik-studio-hono/src/frontend/pages/admin/Dashboard.tsx`
  - `dakik-studio-hono/src/frontend/pages/admin/Leads.tsx`
  - `dakik-studio-hono/src/frontend/pages/admin/Customers.tsx`
  - `dakik-studio-hono/src/frontend/pages/admin/Projects.tsx`
  - `dakik-studio-hono/src/frontend/pages/admin/Invoices.tsx`
  - `dakik-studio-hono/src/frontend/pages/admin/Meetings.tsx`

  **AdminLayout Structure**:
  - Sidebar with navigation links
  - Main content area with outlet
  - Header with user info and logout

  **Each Page Should**:
  - List items in a table
  - Have create/edit/delete actions
  - Use the API client from Task 3
  - Show loading and error states

  **References**:
  - `apps/web/src/app/admin/` - Original admin pages
  - `apps/web/src/components/admin/` - Original admin components
  - `dakik-studio-hono/src/frontend/lib/api.ts` - API client

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `ui-ux-pro-max`
  - **Reason**: Creating multiple UI pages with tables and forms

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 6)
  - **Blocks**: None
  - **Blocked By**: Tasks 3, 4

  **Acceptance Criteria**:
  - [ ] AdminLayout renders with sidebar
  - [ ] Dashboard page shows stats overview
  - [ ] Leads page lists leads with actions
  - [ ] Customers page lists customers with actions
  - [ ] Projects page lists projects with actions
  - [ ] Invoices page lists invoices with actions
  - [ ] Meetings page lists meetings with actions
  - [ ] TypeScript compiles

  **Commit**: YES
  - Message: `feat: create admin dashboard pages`
  - Files: Multiple files created

---

- [x] 6. Create Customer Portal Pages

  **What to do**: Create customer portal layout and pages for projects, invoices, meetings.

  **Files to Create**:
  - `dakik-studio-hono/src/frontend/components/portal/PortalLayout.tsx`
  - `dakik-studio-hono/src/frontend/pages/portal/Dashboard.tsx`
  - `dakik-studio-hono/src/frontend/pages/portal/Projects.tsx`
  - `dakik-studio-hono/src/frontend/pages/portal/Invoices.tsx`
  - `dakik-studio-hono/src/frontend/pages/portal/Meetings.tsx`

  **PortalLayout Structure**:
  - Clean navigation header
  - Main content area
  - User profile section

  **Each Page Should**:
  - Show only the customer's own data
  - Allow viewing details
  - Support actions (pay invoice, schedule meeting)

  **References**:
  - `apps/web/src/app/portal/` - Original portal pages
  - `apps/web/src/components/portal/` - Original portal components

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `ui-ux-pro-max`
  - **Reason**: Creating UI pages for customer portal

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 5)
  - **Blocks**: None
  - **Blocked By**: Tasks 3, 4

  **Acceptance Criteria**:
  - [ ] PortalLayout renders with navigation
  - [ ] Dashboard shows project overview
  - [ ] Projects page lists customer's projects
  - [ ] Invoices page lists customer's invoices with pay action
  - [ ] Meetings page lists customer's meetings
  - [ ] TypeScript compiles

  **Commit**: YES
  - Message: `feat: create customer portal pages`
  - Files: Multiple files created

---

- [x] 7. Create Stripe Webhook Handler

  **What to do**: Create webhook endpoint for Stripe payment events.

  **File to Create**: `dakik-studio-hono/src/routes/api/webhooks/stripe.ts`

  **Implementation**:
  ```typescript
  import { Hono } from "hono";
  import Stripe from "stripe";

  export function createStripeWebhookRouter() {
    const webhooks = new Hono();

    webhooks.post("/stripe", async (c) => {
      const env = c.env as {
        STRIPE_SECRET_KEY?: string;
        STRIPE_WEBHOOK_SECRET?: string;
      };

      if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
        return c.json({ error: "Stripe not configured" }, 500);
      }

      const stripe = new Stripe(env.STRIPE_SECRET_KEY);
      const sig = c.req.header("stripe-signature");
      const body = await c.req.text();

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(
          body,
          sig || "",
          env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return c.json({ error: "Invalid signature" }, 400);
      }

      const db = c.get("db");

      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const invoiceId = paymentIntent.metadata.invoiceId;

        if (invoiceId) {
          await db.invoice.update({
            where: { id: invoiceId },
            data: {
              status: "PAID",
              paidAt: new Date(),
              stripePaymentIntentId: paymentIntent.id,
            },
          });
        }
      }

      return c.json({ received: true });
    });

    return webhooks;
  }
  ```

  **Route Registration** (add to `src/routes/api/index.ts`):
  ```typescript
  import { createStripeWebhookRouter } from "./webhooks/stripe";
  // ...
  api.route("/webhooks", createStripeWebhookRouter());
  ```

  **Must NOT do**:
  - Do NOT add authentication middleware to webhooks
  - Do NOT add comprehensive event handling (just payment_intent.succeeded)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None
  - **Reason**: Single file with Stripe webhook handling

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 5, 6)
  - **Blocks**: None
  - **Blocked By**: Task 1

  **Acceptance Criteria**:
  - [ ] File created: `src/routes/api/webhooks/stripe.ts`
  - [ ] Route registered in API router
  - [ ] TypeScript compiles
  - [ ] Webhook responds to POST /api/webhooks/stripe

  **Commit**: YES
  - Message: `feat: add stripe webhook handler`
  - Files: `dakik-studio-hono/src/routes/api/webhooks/stripe.ts`, `dakik-studio-hono/src/routes/api/index.ts`

---

## Wave 3: Polish

- [x] 8. Add Error Boundaries and Loading States

  **What to do**: Create reusable error boundary and loading components.

  **Files to Create**:
  - `dakik-studio-hono/src/frontend/components/ErrorBoundary.tsx`
  - `dakik-studio-hono/src/frontend/components/Loading.tsx`
  - `dakik-studio-hono/src/frontend/components/shared/ErrorMessage.tsx`

  **ErrorBoundary.tsx**:
  ```typescript
  import { Component, ErrorInfo, ReactNode } from "react";

  interface Props {
    children: ReactNode;
    fallback?: ReactNode;
  }

  interface State {
    hasError: boolean;
    error?: Error;
  }

  export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(error: Error): State {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
      console.error("Error caught by boundary:", error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return (
          this.props.fallback || (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-8">
              <h2 className="font-bold text-xl">Something went wrong</h2>
              <p className="text-gray-500">{this.state.error?.message}</p>
              <button
                className="rounded bg-black px-4 py-2 text-white"
                onClick={() => this.setState({ hasError: false })}
              >
                Try again
              </button>
            </div>
          )
        );
      }

      return this.props.children;
    }
  }
  ```

  **Loading.tsx**:
  ```typescript
  export function Loading({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-8 w-8",
      lg: "h-12 w-12",
    };

    return (
      <div className="flex items-center justify-center p-8">
        <div
          className={`animate-spin rounded-full border-2 border-gray-300 border-t-black ${sizeClasses[size]}`}
        />
      </div>
    );
  }

  export function PageLoading() {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }
  ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None
  - **Reason**: Simple component creation

  **Parallelization**:
  - **Can Run In Parallel**: NO - polish task
  - **Blocks**: None
  - **Blocked By**: Tasks 4-7

  **Acceptance Criteria**:
  - [ ] ErrorBoundary catches and displays errors
  - [ ] Loading spinner renders correctly
  - [ ] TypeScript compiles

  **Commit**: YES
  - Message: `feat: add error boundary and loading components`
  - Files: Multiple files created

---

- [x] 9. Create Survey/Lead Capture Form

  **What to do**: Create multi-step survey form for lead capture.

  **File to Create**: `dakik-studio-hono/src/frontend/pages/Survey.tsx`

  **Form Fields** (based on original):
  - Step 1: Contact info (name, email, phone)
  - Step 2: Project details (type, budget, timeline)
  - Step 3: Additional info (description, how did you hear)

  **References**:
  - `apps/web/src/app/survey/` - Original survey form
  - `dakik-studio-hono/src/frontend/lib/api.ts` - API client (leadApi.create)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `ui-ux-pro-max`
  - **Reason**: Multi-step form with validation

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 8)
  - **Blocks**: None
  - **Blocked By**: Tasks 3, 4

  **Acceptance Criteria**:
  - [ ] Multi-step form with validation
  - [ ] Submits to `/api/leads`
  - [ ] Shows success message after submission
  - [ ] TypeScript compiles

  **Commit**: YES
  - Message: `feat: create survey lead capture form`
  - Files: `dakik-studio-hono/src/frontend/pages/Survey.tsx`

---

- [x] 10. Create Login Page

  **What to do**: Create login page with Google OAuth and email/password options.

  **File to Create**: `dakik-studio-hono/src/frontend/pages/Login.tsx`

  **Login Page**:
  - Google OAuth button
  - Email/password form (optional)
  - Redirect to /admin for ADMIN role
  - Redirect to /portal for CUSTOMER role

  **References**:
  - `apps/web/src/app/(auth)/login/` - Original login page
  - `dakik-studio-hono/src/routes/api/auth.ts` - Auth handler

  **Commit**: YES
  - Message: `feat: create login page with google oauth`
  - Files: `dakik-studio-hono/src/frontend/pages/Login.tsx`

---

## Final Verification Wave

- [x] F1. Landing Page Visual Verification

  **What to do**: Use Playwright to verify landing page renders correctly.

  **QA Scenarios**:
  ```
  Scenario: All landing page sections render
    Tool: Playwright
    Steps:
      1. Navigate to localhost:5173
      2. Wait for page load
      3. Scroll through all sections
      4. Verify each section exists in DOM
    Expected Result: Navbar, Hero, Marquee, LogoCarousel, Services, Work, Testimonials, FAQ, Footer all visible
    Evidence: .sisyphus/evidence/final-f1-landing.png

  Scenario: Animations work correctly
    Tool: Playwright
    Steps:
      1. Navigate to localhost:5173
      2. Scroll down slowly
      3. Check for animate-infinite-scroll class application
      4. Check for reveal animations
    Expected Result: CSS animations apply correctly
    Evidence: .sisyphus/evidence/final-f1-animations.png
  ```

- [x] F2. Auth Flow Testing

  **What to do**: Test authentication end-to-end.

  **QA Scenarios**:
  ```
  Scenario: Login page loads
    Tool: Playwright
    Steps:
      1. Navigate to localhost:5173/login
      2. Verify Google OAuth button exists
    Expected Result: Login page renders
    Evidence: .sisyphus/evidence/final-f2-login.png
  ```

- [x] F3. API Endpoints Testing

  **What to do**: Verify all API endpoints respond correctly.

  **QA Scenarios**:
  ```
  Scenario: All API endpoints return valid JSON
    Tool: Bash (curl)
    Steps:
      1. curl localhost:8787/api/leads
      2. curl localhost:8787/api/customers
      3. curl localhost:8787/api/projects
      4. curl localhost:8787/api/invoices
      5. curl localhost:8787/api/meetings
    Expected Result: All return valid JSON
    Evidence: .sisyphus/evidence/final-f3-api.txt
  ```

- [x] F4. Deployment Verification

  **What to do**: Deploy to Cloudflare Workers and verify.

  **QA Scenarios**:
  ```
  Scenario: Build and deploy
    Tool: Bash
    Steps:
      1. bun run build
      2. bun run deploy
      3. curl <deployment-url>/health
    Expected Result: Successful deployment
    Evidence: .sisyphus/evidence/final-f4-deploy.txt
  ```

---

## Commit Strategy

- **Wave 1**: 3 commits (API integration, landing integration, API client)
- **Wave 2**: 4 commits (router, admin pages, portal pages, webhooks)
- **Wave 3**: 3 commits (error boundaries, survey, login)
- **Final**: 1 commit (verification)

---

## Success Criteria

- [x] `bun run dev` starts both frontend and backend
- [x] `bun run build` produces production bundle
- [x] Landing page renders with all 9 sections
- [x] Admin dashboard accessible at /admin
- [x] Customer portal accessible at /portal
- [x] Login page accessible at /login
- [x] Survey form accessible at /survey
- [x] All API endpoints respond to requests
- [x] Stripe webhook handles payment events
- [x] Cloudflare Workers deployment successful