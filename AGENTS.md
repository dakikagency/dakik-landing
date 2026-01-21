# Repository Guidelines

## Project Structure & Module Organization
This is a Bun + Turborepo monorepo.
- `apps/web/` is the Next.js app (source in `apps/web/src/`, assets in `apps/web/public/`).
- Shared packages live in `packages/` (`api`, `auth`, `db`, `env`, `config`).
- Supporting material is in `docs/`, `specs/`, and `examples/` when present.

## Build, Test, and Development Commands
Use Bun for workspace commands:
- `bun install` installs dependencies.
- `bun run dev` runs all dev tasks via Turbo.
- `bun run dev:web` starts the Next.js app on port 3001.
- `bun run build` builds all packages/apps via Turbo.
- `bun run check-types` runs TypeScript checks across the workspace.

Database (Prisma via `packages/db`):
- `bun run db:push` syncs schema to the database.
- `bun run db:migrate` applies migrations.
- `bun run db:generate` regenerates the Prisma client.
- `bun run db:studio` opens Prisma Studio.
- `bun run db:seed-admin` seeds an admin user.

## Coding Style & Naming Conventions
- TypeScript with ESM modules; shared packages export from `src/index.ts`.
- Formatting/linting uses Biome (`biome.json`) with tabs and double quotes.
- Suggested local check: `bunx biome check .`

## Testing Guidelines
- Playwright is configured in `apps/web/apps/web/playwright.config.ts` with `testDir: ./tests`, so tests currently live under `apps/web/apps/web/tests` (update `testDir` if you want `apps/web/tests`).
- Add UI/E2E tests as `*.spec.ts` or `*.test.ts` in the configured tests directory.
- Example run: `bunx playwright test --config apps/web/apps/web/playwright.config.ts`

## Commit & Pull Request Guidelines
- Follow Conventional Commits with optional scopes (e.g., `feat(auth): add role checks`).
- PRs should include a concise summary, test notes (`bun run check-types`, Playwright, etc.), and screenshots for UI changes.
- Link relevant issues or specs when applicable.

## Configuration & Secrets
- Start from `.env.example` and keep secrets out of Git.
- There are per-app env files (e.g., `apps/web/.env`) validated via `packages/env`.
