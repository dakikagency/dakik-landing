# Page Implementation Learnings

## Database Schema (Wave 1 - 2026-03-26)

### ORM Identified
- **Prisma** with PostgreSQL
- Schema location: `dakik-studio-hono/prisma/schema.prisma`

### New Tables Added

#### 1. `survey_questions`
| Column | Type | Notes |
|--------|------|-------|
| id | cuid | Primary key |
| questionText | String | Question content |
| questionType | QuestionType | TEXT, SINGLE_CHOICE, MULTI_CHOICE |
| options | Json? | Optional JSON for choice options |
| orderIndex | Int | Display order |
| createdAt | DateTime | Default now() |
| updatedAt | DateTime | Auto-updated |

#### 2. `meeting_slots`
| Column | Type | Notes |
|--------|------|-------|
| id | cuid | Primary key |
| userId | String? | Nullable - calendar owner |
| calendarEventId | String? | External calendar reference |
| startTime | DateTime | Slot start |
| endTime | DateTime | Slot end |
| status | SlotStatus | AVAILABLE, BOOKED |
| createdAt | DateTime | Default now() |

#### 3. `survey_submissions`
| Column | Type | Notes |
|--------|------|-------|
| id | cuid | Primary key |
| userId | String? | Nullable - authenticated user |
| email | String | Submitter email |
| answers | Json | Survey answers |
| meetingSlotId | String? | Nullable - linked meeting |
| status | SubmissionStatus | DRAFT, SUBMITTED |
| createdAt | DateTime | Default now() |

### New Enums Added
- `QuestionType`: TEXT, SINGLE_CHOICE, MULTI_CHOICE
- `SlotStatus`: AVAILABLE, BOOKED
- `SubmissionStatus`: DRAFT, SUBMITTED

### Verification
- Schema validated: `npx prisma validate` ✅

### Migration Steps (Documented for Reference)
```bash
cd dakik-studio-hono
npx prisma migrate dev --name add_survey_questions_meeting_slots
```

---

## Codebase Structure Exploration (Wave 2 - 2026-03-26)

### Project Structure
```
dakik-studio-hono/
├── src/
│   ├── frontend/          # React SPA (Vite)
│   │   ├── components/
│   │   │   ├── ui/       # Reusable UI (GridBackdrop, HoverReveal)
│   │   │   ├── landing/  # Landing page components
│   │   │   ├── admin/    # Admin layout + sidebar
│   │   │   ├── portal/   # Portal layout
│   │   │   ├── motion/   # Framer Motion animations
│   │   │   └── shared/   # Error message
│   │   ├── pages/
│   │   │   ├── admin/    # dashboard, customers, invoices, leads, meetings, projects
│   │   │   ├── portal/   # dashboard, invoices, meetings, projects
│   │   │   ├── landing-page.tsx
│   │   │   ├── login.tsx
│   │   │   └── survey.tsx
│   │   ├── lib/          # utils, api client
│   │   ├── hooks/        # use-reduced-motion
│   │   ├── router.tsx    # React Router setup
│   │   └── app.tsx       # Root component with Outlet
│   ├── routes/api/       # Hono API routes
│   │   ├── auth.ts, customers.ts, invoices.ts, leads.ts, meetings.ts
│   │   ├── projects.ts, availability.ts
│   │   └── webhooks/stripe.ts
│   ├── lib/              # auth.ts, db.ts, prisma.ts, env.ts
│   ├── middleware/       # cors, db, error-handler, logger
│   └── index.ts          # Hono app entry
├── prisma/schema.prisma  # Database schema
└── package.json
```

### React Router Setup
- Uses `react-router-dom` v7 (v7.13.2)
- `createBrowserRouter` with nested routes
- Layouts: `AdminLayout`, `PortalLayout` use `<Outlet />`
- Navigation: Uses native `<a href>` tags for landing pages, `<Link>` from react-router for authenticated sections

### Database
- **Prisma** ORM with PostgreSQL
- Uses `@prisma/adapter-pg` for connection pooling (Neon/Cloudflare Workers)
- Auth: `better-auth` library with Prisma adapter

### UI Components
- **Only 2 exported from ui/**: `GridBackdrop`, `HoverReveal`
- No shadcn/ui components detected
- Uses Tailwind CSS v4

### API Routes (Backend)
- Hono framework
- Routes: `/api/auth/*`, `/api/customers`, `/api/invoices`, `/api/leads`, `/api/projects`, `/api/meetings`, `/api/availability`, `/api/webhooks/stripe`

### Auth Files Found
- `/dakik-studio-hono/src/lib/auth.ts` - better-auth configuration
- `/dakik-studio-hono/src/routes/api/auth.ts` - Auth API handler
- `/dakik-studio-hono/src/frontend/pages/login.tsx` - Login page

### Next.js Import Check
**NO Next.js imports found** - grep for `from 'next'` returned zero matches
The codebase has already been migrated from Next.js to React Router + Vite

---

## Auth Client Setup (Wave 2 - 2026-03-26)

### better-auth Already Installed
- Package: `better-auth` version `^1.5.6` in `dakik-studio-hono/package.json`
- No installation needed

### Backend Auth Configuration (`dakik-studio-hono/src/lib/auth.ts`)
- Uses `PrismaPg` adapter with PostgreSQL
- baseURL from `env.BETTER_AUTH_URL`
- trustedOrigins from `env.CORS_ORIGIN`
- emailAndPassword auth enabled
- Google OAuth configured via `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Custom `role` field on user (default: "CUSTOMER", admin emails get "ADMIN")

### Frontend Auth Client Created
- File: `dakik-studio-hono/src/frontend/lib/auth-client.ts`
- Uses `createAuthClient` from `better-auth/react`
- Environment variable: `VITE_BETTER_AUTH_URL`
- Exports:
  - `authClient` - main better-auth client instance
  - `Session` type - user + session interface
  - `getSession()` - fetch current session
  - `isAuthenticated()` - boolean check
  - `signInWithEmail(email, password)` - email/password login
  - `signUpWithEmail(email, password, name?)` - email/password signup
  - `signInWithGoogle()` - Google OAuth redirect
  - `signOut()` - sign out current user
  - `getUser()` - get current user object

### Google OAuth Credentials
- Configured server-side via env vars (not exposed to client)
- Client uses `signInWithGoogle()` which redirects to OAuth flow
- Callback URL: `/portal`

---

## Google Calendar API Client Setup (Wave 1 - 2026-03-26)

### Environment Variables Already Defined
Project already had Google Calendar env vars in `src/lib/env.ts`:
- `GOOGLE_CALENDAR_CLIENT_ID`
- `GOOGLE_CALENDAR_CLIENT_SECRET`
- `GOOGLE_CALENDAR_REFRESH_TOKEN`
- `GOOGLE_CALENDAR_ID` (defaults to "primary")

### Google APIs Library Already Installed
`googleapis@^171.4.0` was already in dependencies - no installation needed.

### OAuth Scopes Required
- `https://www.googleapis.com/auth/calendar.events` - Create/manage events
- `https://www.googleapis.com/auth/calendar.readonly` - Read calendar data

### File Created
`dakik-studio-hono/src/frontend/lib/google-calendar.ts` with:
- OAuth2 client configuration
- `getAvailability()` - fetch free/busy info for emails
- `createCalendarEvent()` - create calendar events with attendees/reminders
- `isSlotAvailable()` - quick conflict check
- `getUpcomingEvents()` - list upcoming events

### LSP Issues Resolved
- Used `??` instead of `!` for nullish coalescing
- Avoided non-null assertions where possible
- Simplified boolean checks to avoid complexity warnings
- Used type assertions where validation guaranteed non-null
