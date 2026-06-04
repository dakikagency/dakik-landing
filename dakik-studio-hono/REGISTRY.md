# Dakik Bits — shadcn registry

`bits.dakik.co.uk` is a [shadcn registry](https://ui.shadcn.com/docs/registry): ~85
production-ready React components (Tailwind-styled with `tailwind-variants`) plus
two shared deps (`utils` → the `cn` helper, `use-is-mobile`). Browse them at
https://bits.dakik.co.uk.

> **Implementation note (maintainers):** the components wrap `@ark-ui/react`
> headless primitives for accessibility/behaviour — it's a runtime dependency in
> every component, the same way shadcn/ui wraps Radix. This is intentionally not
> surfaced anywhere user-facing.

## Using it

The registry is live the moment it's deployed. Either install by full URL (works
immediately):

```bash
npx shadcn add https://bits.dakik.co.uk/r/button.json
```

…or register the `@dakik` namespace once in your `components.json` and use short names:

```jsonc
// components.json
{
  "registries": {
    "@dakik": "https://bits.dakik.co.uk/r/{name}.json"
  }
}
```

```bash
npx shadcn add @dakik/button @dakik/dialog @dakik/sidebar
```

Cross-component dependencies (e.g. `dialog` → `scroll-area`) and the `cn` helper
resolve automatically from this registry.

## How it works (architecture)

- **Served from D1, not static files.** `src/routes/registry.ts` answers
  `GET /registry.json` (the flat index) and `GET /r/:name.json` (one installable
  item) by reading the `component_doc` table. Those paths are in
  `wrangler.jsonc` → `assets.run_worker_first`, so the worker — not the static
  assets — owns them.
- **One row per component.** Each item is a single file: the `.tsx` source lives
  in `component_doc.code`, and the shadcn metadata (`type`, `dependencies`,
  `registryDependencies`, `cssVars`, `css`, file path/type) lives in the
  `component_doc.props` JSON column. No schema migration was needed.
- **Editable in the admin.** `bits.dakik.co.uk/admin` (the existing ComponentDoc
  CRUD) writes those same columns, so edits to a component's source or metadata
  go live in the registry immediately — no rebuild, no redeploy.

## Maintaining it

```bash
# 1. (Re)mirror the upstream components into registry/  — needs network
bun run build:registry      # → registry/r/*.json + registry/registry.json

# 2. Regenerate the D1 seed from that snapshot
bun run seed:registry       # → prisma/seed-registry.sql

# 3. Seed the database (idempotent: INSERT OR REPLACE on cmp_<slug>)
bunx wrangler d1 execute dakik-studio --local  --file=prisma/seed-registry.sql
bunx wrangler d1 execute dakik-studio --remote --file=prisma/seed-registry.sql

# 4. Deploy the worker (serves the registry from D1)
bun run deploy
```

Day-to-day edits don't need any of this — just use the admin panel. The scripts
are for re-mirroring upstream or rebuilding the seed from scratch.

`registry/r/*.json` and `registry/registry.json` are a committed, reviewable
snapshot and the source for the seed; they are **not** served directly.

## Submitting `@dakik` to the shadcn registry directory

Listing `@dakik` in the public [registry directory](https://ui.shadcn.com/docs/registry/directory)
lets anyone use `@dakik/<name>` without editing their `components.json`. The entry
is prepared in [`registry/directory-entry.json`](registry/directory-entry.json).

**Prerequisite:** `bits.dakik.co.uk` must be deployed and publicly reachable —
the validator fetches `https://bits.dakik.co.uk/r/{name}.json`.

1. Fork [`shadcn-ui/ui`](https://github.com/shadcn-ui/ui).
2. Add the object from `registry/directory-entry.json` to the `registries` array
   in `apps/v4/registry/directory.json`.
3. Validate: `pnpm validate:registries`.
4. Open a PR to `shadcn-ui/ui`. Once merged, `npx shadcn add @dakik/<name>` works
   for everyone with no setup.
