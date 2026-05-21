# Page Implementation Plan - Post Next.js → Hono Migration

## TL;DR

> **Quick Summary**: Implement 7 missing pages after Next.js to Hono migration, including full auth system, dynamic survey with Google Calendar integration, admin CRUD for questions, and supporting pages.
>
> **Deliverables**:
> - `/survey` - Dynamic survey with database-backed questions + Google Calendar meeting scheduler
> - `/login` - Full authentication (Google OAuth + email/password)
> - `/daicons` - Icon library showcase
> - `/dacomps` - Component library showcase
> - `/automations` - Automation workflows page
> - `/blog` - Blog listing page
> - `/privacy-policy` - Privacy policy page
> - Database schema for questions + meetings
> - Admin CRUD for survey questions
> - All Next.js imports replaced with React Router
>
> **Estimated Effort**: XL (2-3 weeks)
> **Parallel Execution**: YES - 4 waves with 5-7 tasks each
> **Critical Path**: Import fixes → Auth → Database → Admin CRUD → Survey → Calendar Sync

---

## Context

### Original Request
User migrated from Next.js to Hono, causing several pages to go missing. Critical page is "start a project" which degraded from dynamic funnel to static form. User wants all pages implemented with full functionality.

### Interview Summary
**Key Discussions**:
- **Funnel choice**: Survey (dynamic questions) over Estimator (pricing calculator)
- **Meeting scheduler**: Google Calendar Sync (full integration)
- **Questions storage**: Database with Admin CRUD
- **Auth**: Backend needs implementation (UI exists but not wired)
- **Priority**: All pages together
- **Depth**: Full implementation
- **Testing**: No automated tests, agent-verified QA only

**Research Findings**:
- Original Next.js app had `/survey` (dynamic questions + meeting picker) and `/tools/estimator` (pricing calculator)
- Current Hono `/survey` is a simplified static 3-step form
- Hono project uses React Router v7, Tailwind CSS v4, Framer Motion
- Existing API pattern similar to tRPC

### Metis Review
**Identified Gaps** (addressed):
- Google Calendar sync scope → Locked to Google only, no Cal.com fallback
- Auth backend implementation → Included in plan
- Question management → Admin CRUD included
- Data sources → Database schema included
- Missing acceptance criteria → Added for all pages

---

## Work Objectives

### Core Objective
Restore all missing pages with full functionality after Next.js → Hono migration, including:
1. Dynamic survey with database-backed questions and Google Calendar meeting scheduler
2. Full authentication system with Google OAuth + email/password
3. Admin interface for managing survey questions
4. Supporting marketing pages (daIcons, daComps, Blog, Automations, Privacy)

### Concrete Deliverables
- Working `/survey` with dynamic questions from database
- Working `/login` with Google OAuth + email/password auth
- Working `/daicons`, `/dacomps`, `/automations`, `/blog`, `/privacy-policy` pages
- Database schema for survey_questions, meeting_slots
- Admin CRUD for survey question management
- All routes registered in React Router

### Definition of Done
- [ ] All 7 pages render correctly with proper data
- [ ] Survey loads questions from database, not hardcoded
- [ ] Meeting scheduler shows real Google Calendar availability
- [ ] Login successfully authenticates users
- [ ] Admin can create/edit/delete survey questions
- [ ] All internal links use React Router (no Next.js imports)
- [ ] Mobile responsive across all pages
- [ ] No console errors in browser
- [ ] Routes registered in `router.tsx`

### Must Have
- Survey must load questions from database
- Meeting scheduler must sync with Google Calendar
- Login must authenticate via Google OAuth AND email/password
- Admin CRUD must work for survey questions
- All pages must have proper routing

### Must NOT Have (Guardrails)
- NO password reset flow (out of scope)
- NO email verification (out of scope)
- NO 2FA (out of scope)
- NO user profile/settings pages (out of scope)
- NO blog post detail pages (only listing)
- NO blog search functionality
- NO daIcons/daComps detail pages (just showcase)
- NO calendar sync beyond Google (no Outlook, Apple)
- NO survey analytics dashboard
- NO offline/save-and-resume for survey

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (not checking)
- **Automated tests**: None (per user request)
- **Agent-Executed QA**: ALWAYS (mandatory for all tasks)

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) — Navigate, interact, assert DOM, screenshot
- **TUI/CLI**: Use interactive_bash (tmux) — Run command, validate output
- **API/Backend**: Use Bash (curl) — Send requests, assert status + response
- **Database**: Use Bash (sqlite/psql) — Query, assert row counts and values

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — 5 tasks, run in parallel):
├── Task 1: Fix Next.js imports (next/link, next/navigation) [quick]
├── Task 2: Create database schema (survey_questions, meeting_slots, users) [quick]
├── Task 3: Setup auth client library if missing (better-auth or similar) [quick]
├── Task 4: Create shared UI components (Card, Input, Button variants) [quick]
└── Task 5: Setup Google Calendar API client configuration [quick]

Wave 2 (Auth System — 4 tasks, run in parallel after Wave 1):
├── Task 6: Implement auth session storage and middleware [unspecified-high]
├── Task 7: Build login page UI (Google OAuth + email/password) [visual-engineering]
├── Task 8: Wire login frontend to auth backend [unspecified-high]
└── Task 9: Implement role-based redirect after login [quick]

Wave 3 (Admin CRUD — 4 tasks, run in parallel after Wave 2):
├── Task 10: Create survey questions admin API endpoints [unspecified-high]
├── Task 11: Build admin questions list page [visual-engineering]
├── Task 12: Build admin question create/edit form [visual-engineering]
└── Task 13: Test question CRUD workflow end-to-end [quick]

Wave 4 (Survey Page — 5 tasks, can run parallel with Wave 5):
├── Task 14: Build survey state management context [quick]
├── Task 15: Build dynamic question renderer component [visual-engineering]
├── Task 16: Build contact info collection step [visual-engineering]
├── Task 17: Build meeting scheduler UI (date picker, time slots) [visual-engineering]
└── Task 18: Build survey success/confirmation page [visual-engineering]

Wave 5 (Marketing Pages — 5 tasks, run in parallel after Wave 1):
├── Task 19: Build daIcons page (icon showcase) [visual-engineering]
├── Task 20: Build daComps page (component showcase) [visual-engineering]
├── Task 21: Build Blog listing page [visual-engineering]
├── Task 22: Build Automations page [visual-engineering]
└── Task 23: Build Privacy Policy page [quick]

Wave 6 (Calendar Integration — 3 tasks):
├── Task 24: Implement Google Calendar OAuth flow [deep]
├── Task 25: Implement availability fetching from Google Calendar [deep]
└── Task 26: Implement meeting creation in Google Calendar [deep]

Wave FINAL (Integration & Verification — 4 tasks):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high + playwright)
└── Task F4: Scope fidelity check (deep)

Critical Path: T1 → T3 → T6 → T8 → T9 → T10 → T13 → T14 → T17 → T24 → T25 → T26 → F1-F4
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 7 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|------------|--------|
| 1-5 | None | All downstream |
| 6 | 3 | 8, 9 |
| 7 | 1, 4 | 8 |
| 8 | 6, 7 | 9 |
| 9 | 8 | None |
| 10 | 2 | 12, 13 |
| 11-13 | 10 | None |
| 14-18 | 10, 1, 4 | None |
| 19-23 | 1, 4 | None |
| 24-26 | 5 | None |

### Agent Dispatch Summary

- **Wave 1**: 5 agents (T1-T5 all quick)
- **Wave 2**: 4 agents (T6 unspecified-high, T7 visual-engineering, T8 unspecified-high, T9 quick)
- **Wave 3**: 4 agents (T10 unspecified-high, T11-T12 visual-engineering, T13 quick)
- **Wave 4**: 5 agents (T14 quick, T15-T18 visual-engineering)
- **Wave 5**: 5 agents (T19-T22 visual-engineering, T23 quick)
- **Wave 6**: 3 agents (T24-T26 deep)
- **FINAL**: 4 agents (F1 oracle, F2-F3 unspecified-high, F4 deep)

---

## TODOs

- [x] 1. Fix Next.js imports throughout codebase

  **What to do**:
  - Replace all `import ... from 'next/link'` with `import { Link } from 'react-router-dom'`
  - Replace all `import ... from 'next/navigation'` with React Router hooks (`useNavigate`, `useLocation`, `useParams`)
  - Replace Next.js `Image` component with standard `<img>` or custom optimized component
  - Update all `<Link href="...">` to `<Link to="...">` (React Router uses `to` not `href`)
  - Remove `useRouter` from `next/navigation` and use React Router's `useNavigate`

  **Must NOT do**:
  - Do NOT modify API route files (they use Hono, not Next.js)
  - Do NOT change any business logic
  - Do NOT add new dependencies beyond React Router

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward find-and-replace task
  - **Skills**: []
    - No specialized skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5)
  - **Blocks**: Tasks 7, 14-23 (all page implementations)
  - **Blocked By**: None

  **References**:
  - `dakik-studio-hono/src/frontend/router.tsx` - Existing React Router setup to follow
  - `dakik-studio-hono/src/frontend/pages/login.tsx` - Example of React Router usage
  - OLD `apps/web/src/app/login/page.tsx` - Original Next.js patterns to replace

  **QA Scenarios**:
  ```
  Scenario: All Next.js imports replaced
    Tool: Bash (grep)
    Steps:1. Run: grep -r "from 'next" src/frontend/ --include="*.tsx" --include="*.ts"
      2. Verify: No output (clean)
    Expected Result: Zero matches for Next.js imports
    Failure Indicators: Any files still showing next/link or next/navigation
    Evidence: .sisyphus/evidence/task-1-import-check.txt

  Scenario: React Router imports work
    Tool: Bash (tsc)
    Steps:
      1. Run: cd dakik-studio-hono && bun run typecheck (or tsc --noEmit)
      2. Verify: No import errors
    Expected Result: TypeScript compilation succeeds
    Evidence: .sisyphus/evidence/task-1-tsc-success.txt
  ```

- [x] 2. Create database schema for survey questions and meetings

  **What to do**:
  - Create `survey_questions` table: id, question_text, question_type (text, single_choice, multi_choice), options (JSON), order_index, created_at, updated_at
  - Create `meeting_slots` table: id, user_id, calendar_event_id, start_time, end_time, status (available, booked), created_at
  - Create `survey_submissions` table: id, user_id (nullable), email, answers (JSON), meeting_slot_id (nullable), status (draft, submitted), created_at
  - Add migration file if using migrations, or ensure schema is registered
  - Verify tables exist in database

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Schema definition with clear structure
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 10 (admin CRUD)
  - **Blocked By**: None

  **References**:
  - OLD `apps/web/src/app/survey/page.tsx` - Original question flow structure
  - OLD `apps/web/src/components/survey/` - Original survey components

  **QA Scenarios**:
  ```
  Scenario: Tables created successfully
    Tool: Bash (database query)
    Steps:
      1. Connect to database
      2. Query: SELECT * FROM survey_questions LIMIT 1
      3. Query: SELECT * FROM meeting_slots LIMIT 1
      4. Query: SELECT * FROM survey_submissions LIMIT 1
    Expected Result: All queries succeed (even if empty)
    Evidence: .sisyphus/evidence/task-2-schema-check.txt
  ```

- [x] 3. Setup auth client library

  **What to do**:
  - Verify if better-auth or similar auth library is installed
  - If not, install and configure auth client
  - Create `src/frontend/lib/auth-client.ts` with session management
  - Export `authClient` for login components
  - Configure Google OAuth provider credentials (use env vars)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Library setup and configuration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 6, Task 8
  - **Blocked By**: None

  **References**:
  - OLD `apps/web/src/lib/auth-client.ts` - Original auth client setup
  - `dakik-studio-hono/src/routes/api/` - Existing API routes

  **QA Scenarios**:
  ```
  Scenario: Auth client exports correctly
    Tool: Bash (tsc)
    Steps:
      1. Run: cd dakik-studio-hono && bun run typecheck
      2. Verify: No errors in auth-client.ts
    Expected Result: TypeScript compilation succeeds
    Evidence: .sisyphus/evidence/task-3-auth-client.txt
  ```

- [x] 4. Create shared UI components

  **What to do**:
  - Verify existing Button, Input, Card components in `src/frontend/components/ui/`
  - Create missing components needed for pages: DatePicker, TimeSlotPicker, QuestionCard, ProgressStepper
  - Ensure all components use Tailwind CSS v4 patterns
  - Add framer-motion animations where appropriate
  - Export from component index file

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component creation with styling
  - **Skills**: [`ui-ux-pro-max`]
    - For designing polished UI components

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 7, 11-12, 15-17
  - **Blocked By**: None

  **References**:
  - `dakik-studio-hono/src/frontend/components/ui/button.tsx` - Existing Button patterns
  - `dakik-studio-hono/src/frontend/components/motion/` - Existing motion components
  - OLD `apps/web/src/components/ui/` - Original UI components

  **QA Scenarios**:
  ```
  Scenario: Components render without errors
    Tool: Playwright
    Steps:
      1. Create test page with all new components
      2. Navigate to test page
      3. Take screenshots
    Expected Result: All components render
    Evidence: .sisyphus/evidence/task-4-components.png
  ```

- [x] 5. Setup Google Calendar API client configuration

  **What to do**:
  - Install Google API client library if needed
  - Create `src/frontend/lib/google-calendar.ts` with OAuth configuration
  - Setup environment variables for Google Client ID and Secret
  - Create helper functions for calendar availability and event creation
  - Document required OAuth scopes (calendar.events, calendar.readonly)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Library configuration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 24-26
  - **Blocked By**: None

  **References**:
  - Google Calendar API documentation: https://developers.google.com/calendar/api

  **QA Scenarios**:
  ```
  Scenario: Google Calendar client configured
    Tool: Bash (tsc)
    Steps:
      1. Run: cd dakik-studio-hono && bun run typecheck
      2. Verify: No TypeScript errors
    Expected Result: Compiles successfully
    Evidence: .sisyphus/evidence/task-5-calendar-client.txt
  ```

- [x] 6. Implement auth session storage and middleware

  **What to do**:
  - Create session context for React app
  - Implement session storage (cookies or localStorage)
  - Create middleware for protected routes
  - Add session refresh logic
  - Handle session expiry gracefully

  **Must NOT do**:
  - Do NOT implement password reset
  - Do NOT implement email verification
  - Do NOT implement 2FA

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex auth logic requiring careful implementation
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 3)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 8
  - **Blocked By**: Task 3

  **References**:
  - OLD `apps/web/src/lib/auth-client.ts` - Original auth patterns
  - OLD `apps/web/src/app/login/page.tsx` - Original login flow

  **QA Scenarios**:
  ```
  Scenario: Session persists across reloads
    Tool: Playwright
    Steps:
      1. Login with test credentials
      2. Reload page
      3. Verify session still active
    Expected Result: User remains logged in
    Evidence: .sisyphus/evidence/task-6-session-persist.png

  Scenario: Session clears on logout
    Tool: Playwright
    Steps:
      1. Login with test credentials
      2. Click logout
      3. Verify session cleared
    Expected Result: User is logged out
    Evidence: .sisyphus/evidence/task-6-logout.png
  ```

- [x] 7. Build login page UI

  **What to do**:
  - Create `/login` page component at `src/frontend/pages/login.tsx`
  - Build Google OAuth button with proper styling
  - Build email/password form with validation
  - Add "Sign in" / "Sign up" toggle
  - Add form validation with error messages
  - Add loading states for buttons
  - Style to match landing page aesthetic (dark theme, Tailwind)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI/UX implementation with animations
  - **Skills**: [`ui-ux-pro-max`, `frontend-design`]
    - For polished login UI design

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Wave1)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 8
  - **Blocked By**: Task 1, Task 4

  **References**:
  - OLD `apps/web/src/app/login/page.tsx` - Original login UI
  - `dakik-studio-hono/src/frontend/components/landing/` - Existing landing components for styling reference

  **QA Scenarios**:
  ```
  Scenario: Login page renders correctly
    Tool: Playwright
    Steps:
      1. Navigate to /login
      2. Verify Google OAuth button visible
      3. Verify email input visible
      4. Verify password input visible
      5. Verify submit button visible
    Expected Result: All elements render
    Evidence: .sisyphus/evidence/task-7-login-page.png

  Scenario: Form validation works
    Tool: Playwright
    Steps:
      1. Navigate to /login
      2. Click submit without filling form
      3. Verify error messages appear
    Expected Result: Validation errors shown
    Evidence: .sisyphus/evidence/task-7-validation.png
  ```

- [x] 8. Wire login frontend to auth backend

  **What to do**:
  - Connect Google OAuth button to auth flow
  - Connect email/password form to auth API
  - Handle success: redirect based on role (admin → /admin, customer → /portal)
  - Handle errors: show friendly error messages
  - Add loading states during auth
  - Test both Google OAuth and email/password flows

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Integration work requiring auth knowledge
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO(needs Task 6 and Task 7)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 9
  - **Blocked By**: Task 6 (session), Task 7 (UI)

  **References**:
  - OLD `apps/web/src/app/login/page.tsx` - Original auth integration

  **QA Scenarios**:
  ```
  Scenario: Google OAuth login works
    Tool: Playwright
    Steps:
      1. Navigate to /login
      2. Click Google OAuth button
      3. Complete OAuth flow (mock or test account)
      4. Verify redirect to appropriate dashboard
    Expected Result: User logged in and redirected
    Evidence: .sisyphus/evidence/task-8-google-auth.png

  Scenario: Email/password login works
    Tool: Playwright
    Steps:
      1. Navigate to /login
      2. Enter test email and password
      3. Click submit
      4. Verify redirect to appropriate dashboard
    Expected Result: User logged in and redirected
    Evidence: .sisyphus/evidence/task-8-email-auth.png
  ```

- [x] 10. Create survey questions admin API endpoints

  **What to do**:
  - Create GET /api/survey-questions - list all questions with ordering
  - Create POST /api/survey-questions - create new question
  - Create PUT /api/survey-questions/:id - update question
  - Create DELETE /api/survey-questions/:id - delete question
  - Create PUT /api/survey-questions/reorder - reorder questions
  - Add authentication middleware for admin-only access
  - Return proper error responses

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: API endpoint creation with auth integration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Wave 1)
  - **Parallel Group**: Wave 3
  - **Blocks**: Tasks 11-13
  - **Blocked By**: Task 2 (schema)

  **References**:
  - `dakik-studio-hono/src/routes/api/` - Existing API pattern
  - OLD `apps/web/src/app/admin/` - Original admin patterns

  **QA Scenarios**:
  ```
  Scenario: CRUD endpoints work
    Tool: Bash (curl)
    Steps:
      1. POST /api/survey-questions with test data
      2. GET /api/survey-questions
      3. PUT /api/survey-questions/:id with updated data
      4. DELETE /api/survey-questions/:id
    Expected Result: All operations succeed with proper responses
    Evidence: .sisyphus/evidence/task-10-api-test.txt
  ```

- [ ] 11. Build admin questions list page

  **What to do**:
  - Create admin route at `/admin/questions` in router
  - Build questions list table with columns: order, question, type, actions
  - Add "Create Question" button
  - Add edit/delete buttons per row
  - Add drag-and-drop reordering
  - Style to match admin dashboard aesthetic

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Admin UI with table and interactions
  - **Skills**: [`ui-ux-pro-max`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: Task 10 (API)

  **References**:
  - `dakik-studio-hono/src/frontend/pages/admin/` - Existing admin pages
  - OLD `apps/web/src/app/admin/page.tsx` - Original admin UI

  **QA Scenarios**:
  ```
  Scenario: Questions list renders
    Tool: Playwright
    Steps:
      1. Login as admin
      2. Navigate to /admin/questions
      3. Verify questions table visible
      4. Verify create button visible
    Expected Result: Admin questions page loads
    Evidence: .sisyphus/evidence/task-11-questions-list.png
  ```

- [ ] 12. Build admin question create/edit form

  **What to do**:
  - Build question form with fields: question text, question type, options (for choice types)
  - Add validation for required fields
  - Add preview of how question looks in survey
  - Handle both create and edit modes
  - Add cancel and save buttons
  - Show success/error toasts

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Form UI with validation
  - **Skills**: [`ui-ux-pro-max`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: Task 10 (API)

  **References**:
  - OLD `apps/web/src/components/survey/` - Original survey components for reference

  **QA Scenarios**:
  ```
  Scenario: Create question flow works
    Tool: Playwright
    Steps:
      1. Navigate to /admin/questions
      2. Click "Create Question"
      3. Fill in question text and type
      4. Click Save
      5. Verify question appears in list
    Expected Result: Question created successfully
    Evidence: .sisyphus/evidence/task-12-create-question.png

  Scenario: Edit question flow works
    Tool: Playwright
    Steps:
      1. Navigate to /admin/questions
      2. Click edit on existing question
      3. Modify question text
      4. Click Save
      5. Verify changes reflected
    Expected Result: Question updated successfully
    Evidence: .sisyphus/evidence/task-12-edit-question.png
  ```

- [ ] 13. Test question CRUD workflow end-to-end

  **What to do**:
  - Test create → edit → delete flow
  - Test reordering questions
  - Test question type validation
  - Test admin-only access
  - Verify data persists correctly

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Integration testing
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 14 (survey needs questions)
  - **Blocked By**: Tasks 10, 11, 12

  **QA Scenarios**:
  ```
  Scenario: Full CRUD workflow works
    Tool: Playwright
    Steps:
      1. Create new question
      2. Edit question
      3. Reorder question
      4. Delete question
      5. Verify each step
    Expected Result: All operations succeed
    Evidence: .sisyphus/evidence/task-13-crud-workflow.png
  ```

- [ ] 14. Build survey state management context

  **What to do**:
  - Create SurveyContext with current step, answers, user info
  - Create useSurvey hook for accessing context
  - Implement step navigation (next, back)
  - Implement answer storage
  - Implement form validation state
  - Handle survey submission state

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: React context setup
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: Tasks 15-18
  - **Blocked By**: Task 10 (needs questions)

  **References**:
  - OLD `apps/web/src/components/survey/survey-context.tsx` - Original context pattern

  **QA Scenarios**:
  ```
  Scenario: Context provides correct state
    Tool: Bash (tsc)
    Steps:
      1. Run: cd dakik-studio-hono && bun run typecheck
      2. Verify: No TypeScript errors in survey context
    Expected Result: Compiles successfully
    Evidence: .sisyphus/evidence/task-14-context-check.txt
  ```

- [ ] 15. Build dynamic question renderer component

  **What to do**:
  - Create QuestionRenderer component
  - Support question types: text, single-choice, multi-choice
  - Render text input for text questions
  - Render radio buttons for single-choice
  - Render checkboxes for multi-choice
  - Add animations for question transitions
  - Handle answer storage in context

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex UI component with animations
  - **Skills**: [`ui-ux-pro-max`, `frontend-design`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: None
  - **Blocked By**: Task 14 (context)

  **References**:
  - OLD `apps/web/src/components/survey/steps/step-dynamic-question.tsx` - Original component

  **QA Scenarios**:
  ```
  Scenario: Question renderer shows correct UI for each type
    Tool: Playwright
    Steps:
      1. Navigate to survey with text question
      2. Verify text input visible
      3. Navigate to survey with single-choice
      4. Verify radio buttons visible
      5. Navigate to survey with multi-choice
      6. Verify checkboxes visible
    Expected Result: Correct UI for each question type
    Evidence: .sisyphus/evidence/task-15-question-types.png
  ```

- [ ] 16. Build contact info collection step

  **What to do**:
  - Create ContactStep component
  - Build form with: name, email, phone (optional), company (optional)
  - Add validation for required fields (name, email)
  - Add email format validation
  - Store contact info in survey context
  - Add progress indicator
  - Style to match landing page aesthetic

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Form UI with validation
  - **Skills**: [`ui-ux-pro-max`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: None
  - **Blocked By**: Task 14 (context)

  **References**:
  - OLD `apps/web/src/components/survey/steps/step-contact.tsx` - Original component

  **QA Scenarios**:
  ```
  Scenario: Contact form validates input
    Tool: Playwright
    Steps:
      1. Navigate to contact step
      2. Submit empty form
      3. Verify validation errors
      4. Fill valid data
      5. Submit
      6. Verify proceeds to next step
    Expected Result: Validation works correctly
    Evidence: .sisyphus/evidence/task-16-contact-validation.png
  ```

- [ ] 17. Build meeting scheduler UI

  **What to do**:
  - Create MeetingScheduler component
  - Add calendar for date selection
  - Add time slot selection grid
  - Fetch available slots from API
  - Handle timezone display
  - Add "No availability" state
  - Store selected slot in survey context
  - Style to match survey aesthetic

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex calendar UI
  - **Skills**: [`ui-ux-pro-max`, `frontend-design`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: Tasks 24-26 (Google Calendar integration)
  - **Blocked By**: Task 14 (context)

  **References**:
  - OLD `apps/web/src/components/survey/steps/step-meeting-picker.tsx` - Original component

  **QA Scenarios**:
  ```
  Scenario: Calendar renders and allows date selection
    Tool: Playwright
    Steps:
      1. Navigate to meeting scheduler step
      2. Verify calendar visible
      3. Click a date
      4. Verify time slots appear
      5. Select a time slot
    Expected Result: Date and time selection works
    Evidence: .sisyphus/evidence/task-17-meeting-scheduler.png
  ```

- [ ] 18. Build survey success/confirmation page

  **What to do**:
  - Create SuccessStep component
  - Show confirmation message
  - Display submitted information summary
  - Add "Book Another Meeting" option
  - Add social sharing links (optional)
  - Add navigation back to home
  - Trigger success analytics event

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Success UI with animations
  - **Skills**: [`ui-ux-pro-max`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: None
  - **Blocked By**: Task 14 (context)

  **References**:
  - OLD `apps/web/src/components/survey/steps/step-success.tsx` - Original component

  **QA Scenarios**:
  ```
  Scenario: Success page shows after submission
    Tool: Playwright
    Steps:
      1. Complete survey
      2. Submit
      3. Verify success message visible
      4. Verify summary information displayed
    Expected Result: Success page renders correctly
    Evidence: .sisyphus/evidence/task-18-success-page.png
  ```

- [ ] 19. Build daIcons page

  **What to do**:
  - Create `/daicons` route in router
  - Build icon grid component
  - Fetch icons from API or load statically
  - Add search/filter functionality
  - Add click-to-copy functionality
  - Add usage examples section
  - Style to match landing page

  **Must NOT do**:
  - Do NOT create icon detail pages
  - Do NOT add complex download functionality

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Grid UI with interactions
  - **Skills**: [`ui-ux-pro-max`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5
  - **Blocks**: None
  - **Blocked By**: Task 1 (imports)

  **References**:
  - OLD `apps/web/src/app/daicons/page.tsx` - Original page
  - OLD `apps/web/src/components/daicons/icon-grid.tsx` - Original icon grid

  **QA Scenarios**:
  ```
  Scenario: daIcons page renders with icons
    Tool: Playwright
    Steps:
      1. Navigate to /daicons
      2. Verify icon grid visible
      3. Click on an icon
      4. Verify copy functionality
    Expected Result: Icons display and copy works
    Evidence: .sisyphus/evidence/task-19-daicons.png
  ```

- [ ] 20. Build daComps page

  **What to do**:
  - Create `/dacomps` route in router
  - Build component library grid
  - Add category filtering
  - Add search functionality
  - Add component preview modal
  - Fetch components from API
  - Style to match landing page

  **Must NOT do**:
  - Do NOT create component detail pages
  - Do NOT add code playground

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex grid with filtering
  - **Skills**: [`ui-ux-pro-max`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5
  - **Blocks**: None
  - **Blocked By**: Task 1 (imports)

  **References**:
  - OLD `apps/web/src/app/dacomps/page.tsx` - Original page
  - OLD `apps/web/src/components/dacomps/component-viewer.tsx` - Original viewer

  **QA Scenarios**:
  ```
  Scenario: daComps page renders with components
    Tool: Playwright
    Steps:
      1. Navigate to /dacomps
      2. Verify component grid visible
      3. Use search
      4. Filter by category
      5. Click component preview
    Expected Result: Components display and filtering works
    Evidence: .sisyphus/evidence/task-20-dacomps.png
  ```

- [ ] 21. Build Blog listing page

  **What to do**:
  - Create `/blog` route in router
  - Build blog post grid
  - Fetch posts from API
  - Add tag filtering
  - Add post cards with title, excerpt, date
  - Style to match landing page

  **Must NOT do**:
  - Do NOT create blog post detail pages
  - Do NOT add search functionality

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Grid UI with cards
  - **Skills**: [`ui-ux-pro-max`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5
  - **Blocks**: None
  - **Blocked By**: Task 1 (imports)

  **References**:
  - OLD `apps/web/src/app/blog/page.tsx` - Original page

  **QA Scenarios**:
  ```
  Scenario: Blog page renders with posts
    Tool: Playwright
    Steps:
      1. Navigate to /blog
      2. Verify post grid visible
      3. Filter by tag
      4. Verify posts update
    Expected Result: Blog posts display correctly
    Evidence: .sisyphus/evidence/task-21-blog.png
  ```

- [ ] 22. Build Automations page

  **What to do**:
  - Create `/automations` route in router
  - Build automation workflow showcase
  - Display automation cards with icons
  - Add descriptions and benefits
  - Style to match landing page

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Marketing page UI
  - **Skills**: [`ui-ux-pro-max`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5
  - **Blocks**: None
  - **Blocked By**: Task 1 (imports)

  **References**:
  - OLD `apps/web/src/app/automations/page.tsx` - Original page
  - OLD `apps/web/src/components/automations/automation-list-content.tsx` - Original content

  **QA Scenarios**:
  ```
  Scenario: Automations page renders
    Tool: Playwright
    Steps:
      1. Navigate to /automations
      2. Verify automation cards visible
      3. Verify descriptions readable
    Expected Result: Page loads correctly
    Evidence: .sisyphus/evidence/task-22-automations.png
  ```

- [ ] 23. Build Privacy Policy page

  **What to do**:
  - Create `/privacy-policy` route in router
  - Build simple text content page
  - Add proper heading structure
  - Add last updated date
  - Style for readability
  - Add navigation back to home

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple static content page
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5
  - **Blocks**: None
  - **Blocked By**: Task 1 (imports)

  **References**:
  - OLD `apps/web/src/app/privacy/page.tsx` - Original page (placeholder)

  **QA Scenarios**:
  ```
  Scenario: Privacy page renders
    Tool: Playwright
    Steps:
      1. Navigate to /privacy-policy
      2. Verify content visible
      3. Verify proper heading structure
    Expected Result: Page loads correctly
    Evidence: .sisyphus/evidence/task-23-privacy.png
  ```

- [ ] 24. Implement Google Calendar OAuth flow

  **What to do**:
  - Create Google OAuth callback route
  - Handle OAuth authorization code
  - Exchange code for access token
  - Store token securely (encrypted in session)
  - Handle OAuth errors gracefully
  - Implement token refresh logic

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Complex OAuth integration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (needs schedulerUI)
  - **Parallel Group**: Wave 6
  - **Blocks**: Task 25
  - **Blocked By**: Task 17 (UI), Task 5 (client)

  **References**:
  - Google Calendar API documentation: https://developers.google.com/calendar/api

  **QA Scenarios**:
  ```
  Scenario: OAuth flow completes successfully
    Tool: Playwright
    Steps:
      1. Initiate Google OAuth from scheduler
      2. Complete authorization
      3. Verify redirect back to app
      4. Verify token stored
    Expected Result: OAuth completes without errors
    Evidence: .sisyphus/evidence/task-24-oauth-success.png
  ```

- [ ] 25. Implement availability fetching from Google Calendar

  **What to do**:
  - Create API endpoint: GET /api/calendar/availability
  - Fetch free/busy from Google Calendar
  - Calculate available slots based on settings
  - Handle timezone conversion
  - Return slots as JSON
  - Add error handling for API failures

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Complex calendar API integration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 6
  - **Blocks**: Task 26
  - **Blocked By**: Task 24 (OAuth)

  **QA Scenarios**:
  ```
  Scenario: Availability API returns slots
    Tool: Bash (curl)
    Steps:
      1. GET /api/calendar/availability?start=...&end=...
      2. Verify slots array returned
      3. Verify slots are in correct timezone
    Expected Result: Valid availability slots
    Evidence: .sisyphus/evidence/task-25-availability.txt
  ```

- [ ] 26. Implement meeting creation in Google Calendar

  **What to do**:
  - Create API endpoint: POST /api/calendar/events
  - Create calendar event with meeting details
  - Send calendar invite to user
  - Store meeting reference in database
  - Handle creation errors
  - Send confirmation email (if configured)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Calendar event creation
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 6
  - **Blocks**: None
  - **Blocked By**: Task 25 (availability)

  **QA Scenarios**:
  ```

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + linter + any existing tests. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if UI)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (features working together, not isolation). Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

**Wave 1 Commits** (Foundation - 5 commits):
- `fix(router): replace next/link with react-router Link throughout codebase`
- `feat(db): add survey_questions, meeting_slots, survey_submissions tables`
- `feat(auth): setup auth client library configuration`
- `feat(ui): add shared UI components (DatePicker, TimeSlotPicker, QuestionCard, ProgressStepper)`
- `feat(calendar): add Google Calendar API client configuration`

**Wave 2 Commits** (Auth - 4 commits):
- `feat(auth): implement session storage and middleware`
- `feat(ui): build login page with Google OAuth and email/password`
- `feat(auth): wire login frontend to auth backend`
- `feat(auth): add role-based redirect after login`

**Wave 3 Commits** (Admin CRUD - 4 commits):
- `feat(api): add survey questions CRUD endpoints`
- `feat(admin): build questions list page`
- `feat(admin): build question create/edit form`
- `test(api): verify question CRUD workflow end-to-end`

**Wave 4 Commits** (Survey - 5 commits):
- `feat(survey): add survey state management context`
- `feat(survey): build dynamic question renderer`
- `feat(survey): build contact info collection step`
- `feat(survey): build meeting scheduler UI`
- `feat(survey): build success/confirmation page`

**Wave 5 Commits** (Marketing Pages - 5 commits):
- `feat(daicons): implement icon library page`
- `feat(dacomps): implement component library page`
- `feat(blog): implement blog listing page`
- `feat(automations): implement automations workflow page`
- `feat(privacy): implement privacy policy page`

**Wave 6 Commits** (Calendar Integration - 3 commits):
- `feat(calendar): implement Google OAuth flow`
- `feat(calendar): implement availability fetching`
- `feat(calendar): implement meeting creation`

---

## Success Criteria

### Verification Commands
```bash
# Check all routes are registered
grep -r "path:" src/frontend/router.tsx | wc -l
# Expected:10+ routes

# Check no Next.js imports remain
grep -r "from 'next" src/frontend/ --include="*.tsx" --include="*.ts" || echo "PASS: No Next.js imports"
# Expected: No output (clean)

# Check database tables exist (adjust for your ORM)
# bun run db:check || echo "Check manually"
# Expected: Tables accessible

# Build and serve
bun run build:frontend && bun run dev
# Expected: Server starts on port 8787
```

### Final Checklist
- [ ] All 7 pages render without errors
- [ ] Survey has dynamic questions from database
- [ ] Survey questions load via API (not hardcoded)
- [ ] Meeting scheduler shows Google Calendar availability
- [ ] Login authenticates via Google OAuth
- [ ] Login authenticates via email/password
- [ ] Role-based redirect works (admin → /admin, customer → /portal)
- [ ] Admin can create/edit/delete survey questions
- [ ] Admin can reorder survey questions
- [ ] All Next.js imports replaced with React Router
- [ ] All routes registered in router.tsx
- [ ] No console errors in browser
- [ ] Mobile responsive on all pages
- [ ] daIcons page loads with icons
- [ ] daComps page loads with components
- [ ] Blog page loads with posts
- [ ] Automations page loads
- [ ] Privacy page loads