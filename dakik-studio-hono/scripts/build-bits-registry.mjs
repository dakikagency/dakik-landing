#!/usr/bin/env node
/**
 * build-bits-registry.mjs
 *
 * Mirrors the Shark UI shadcn registry (https://shark.vini.one) into Dakik Bits and
 * emits the canonical registry snapshot under `registry/` (NOT served directly —
 * the live registry is served from D1 by src/routes/registry.ts; these files are
 * the source for the D1 seed and a reviewable git snapshot):
 *
 *   registry/r/<name>.json   – installable registry items (with file `content`)
 *   registry/registry.json   – the flat registry index (items carry NO file `content`)
 *
 * The single required transform is re-pointing every cross-registry URL in
 * `registryDependencies` from shark.vini.one → bits.dakik.co.uk, so that
 * `npx shadcn add @dakik/<name>` resolves Dakik's own copies. Everything else
 * (component source, npm `dependencies`, `cssVars`, `css`) is preserved verbatim.
 *
 * Each item is enriched with `title` + `description` (from the Shark docs frontmatter)
 * and a curated `categories` entry that drives the bits index page filters. The Ark UI
 * reference link is stored under `meta.ark`.
 *
 * Run: `bun run build:registry` (or `node scripts/build-bits-registry.mjs`).
 * Output JSON is committed, so re-seeding needs no network access.
 */

import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY_DIR = resolve(__dirname, "../registry");
const OUT_R_DIR = resolve(REGISTRY_DIR, "r");

const SOURCE = "https://shark.vini.one";
const BASE_URL = "https://bits.dakik.co.uk";
const AUTHOR = "Dakik Studio <https://dakik.co.uk>";

/**
 * Curated slug → category map (85 components + 2 shared deps = 87 items).
 * Categories power the sidebar filters on the bits index page.
 */
const CATEGORY = {
  // Layout
  "aspect-ratio": "Layout", card: "Layout", separator: "Layout",
  "scroll-area": "Layout", resizable: "Layout", frame: "Layout",
  float: "Layout", "floating-panel": "Layout", item: "Layout",
  // Forms
  button: "Forms", "button-group": "Forms", input: "Forms",
  "input-group": "Forms", "input-otp": "Forms", textarea: "Forms",
  checkbox: "Forms", "radio-group": "Forms", select: "Forms",
  "native-select": "Forms", switch: "Forms", slider: "Forms",
  "circular-slider": "Forms", "number-input": "Forms", "password-input": "Forms",
  field: "Forms", autocomplete: "Forms", combobox: "Forms",
  "color-picker": "Forms", "date-picker": "Forms", calendar: "Forms",
  "file-upload": "Forms", "signature-pad": "Forms", editable: "Forms",
  "tags-input": "Forms", rating: "Forms", toggle: "Forms",
  "toggle-group": "Forms", listbox: "Forms",
  // Navigation
  breadcrumb: "Navigation", pagination: "Navigation", tabs: "Navigation",
  steps: "Navigation", command: "Navigation", menu: "Navigation",
  "context-menu": "Navigation", "segment-group": "Navigation", "tree-view": "Navigation",
  "link-overlay": "Navigation", "skip-nav": "Navigation", "action-bar": "Navigation",
  "bottom-navigation": "Navigation", sidebar: "Navigation",
  // Overlays
  dialog: "Overlays", "alert-dialog": "Overlays", popover: "Overlays",
  tooltip: "Overlays", "toggle-tooltip": "Overlays", "hover-card": "Overlays",
  drawer: "Overlays", sheet: "Overlays", hint: "Overlays", tour: "Overlays",
  // Feedback
  alert: "Feedback", toast: "Feedback", progress: "Feedback",
  "circular-progress": "Feedback", spinner: "Feedback", skeleton: "Feedback",
  status: "Feedback", announcement: "Feedback",
  // Data Display
  table: "Data Display", "data-list": "Data Display", chart: "Data Display",
  avatar: "Data Display", badge: "Data Display", kbd: "Data Display",
  marquee: "Data Display", carousel: "Data Display", "qr-code": "Data Display",
  clipboard: "Data Display", timer: "Data Display", "image-cropper": "Data Display",
  prose: "Data Display", accordion: "Data Display", collapsible: "Data Display",
  // Utilities (shared deps — installable, listed under Utilities)
  utils: "Utilities", "use-is-mobile": "Utilities",
};

/** Shared deps that have no docs page; enriched manually. */
const MANUAL_META = {
  utils: {
    title: "cn (utils)",
    description: "Tailwind class-merge helper (clsx + tailwind-merge).",
  },
  "use-is-mobile": {
    title: "useIsMobile",
    description: "Hook that tracks whether the viewport is below the mobile breakpoint.",
  },
};

const COMPONENT_SLUGS = [
  "accordion", "action-bar", "alert-dialog", "alert", "announcement",
  "aspect-ratio", "autocomplete", "avatar", "badge", "bottom-navigation",
  "breadcrumb", "button-group", "button", "calendar", "card", "carousel",
  "chart", "checkbox", "circular-progress", "circular-slider", "clipboard",
  "collapsible", "color-picker", "combobox", "command", "context-menu",
  "data-list", "date-picker", "dialog", "drawer", "editable", "field",
  "file-upload", "float", "floating-panel", "frame", "hint", "hover-card",
  "image-cropper", "input-group", "input-otp", "input", "item", "kbd",
  "link-overlay", "listbox", "marquee", "menu", "native-select", "number-input",
  "pagination", "password-input", "popover", "progress", "prose", "qr-code",
  "radio-group", "rating", "resizable", "scroll-area", "segment-group", "select",
  "separator", "sheet", "sidebar", "signature-pad", "skeleton", "skip-nav",
  "slider", "spinner", "status", "steps", "switch", "table", "tabs",
  "tags-input", "textarea", "timer", "toast", "toggle-group", "toggle-tooltip",
  "toggle", "tooltip", "tour", "tree-view",
];

// Shared deps referenced by components (`utils` is published for completeness;
// `use-is-mobile` is a real registryDependency of `sidebar`).
const SHARED_SLUGS = ["utils", "use-is-mobile"];
const ALL_SLUGS = [...COMPONENT_SLUGS, ...SHARED_SLUGS];

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.text();
}

/** Extract `title` + `description` from docs frontmatter (no upstream links). */
function parseFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const body = m[1];
  const out = {};
  const title = body.match(/^title:\s*(.+)$/m);
  const description = body.match(/^description:\s*(.+)$/m);
  if (title) out.title = title[1].trim().replace(/^["']|["']$/g, "");
  if (description) out.description = description[1].trim().replace(/^["']|["']$/g, "");
  return out;
}

const titleCase = (slug) =>
  slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

/** Re-point every shark.vini.one registry URL at the Dakik host. */
const repoint = (dep) =>
  typeof dep === "string"
    ? dep.replace(`${SOURCE}/r/`, `${BASE_URL}/r/`)
    : dep;

async function buildItem(slug) {
  const item = await fetchJson(`${SOURCE}/r/${slug}.json`);

  let meta = {};
  if (MANUAL_META[slug]) {
    meta = MANUAL_META[slug];
  } else {
    try {
      meta = parseFrontmatter(await fetchText(`${SOURCE}/docs/components/${slug}.md`));
    } catch {
      meta = {};
    }
  }

  const title = meta.title || titleCase(slug);
  const description = meta.description || "";
  const category = CATEGORY[slug] || "Components";

  // Faithful copy, ordered for readable diffs; only registryDependencies are rewritten.
  const out = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: item.name,
    type: item.type,
    title,
    description,
    author: AUTHOR,
    categories: [category],
  };
  if (item.dependencies?.length) out.dependencies = item.dependencies;
  if (item.devDependencies?.length) out.devDependencies = item.devDependencies;
  if (item.registryDependencies?.length)
    out.registryDependencies = item.registryDependencies.map(repoint);
  if (item.cssVars) out.cssVars = item.cssVars;
  if (item.css) out.css = item.css;
  out.files = item.files;

  return out;
}

/** Registry index item — same shape minus per-file `content` and the item `$schema`. */
function toIndexItem(item) {
  const { $schema, files, ...rest } = item;
  return {
    ...rest,
    files: files.map((f) => {
      const e = { path: f.path, type: f.type };
      if (f.target) e.target = f.target;
      return e;
    }),
  };
}

async function main() {
  console.log(`Mirroring ${ALL_SLUGS.length} items from ${SOURCE} → ${BASE_URL}\n`);

  // Fetch + transform with a small concurrency cap.
  const items = [];
  const queue = [...ALL_SLUGS];
  const CONCURRENCY = 8;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) {
        const slug = queue.shift();
        try {
          const built = await buildItem(slug);
          items.push({ slug, built });
          process.stdout.write(`  ✓ ${slug}\n`);
        } catch (err) {
          throw new Error(`Failed building "${slug}": ${err.message}`);
        }
      }
    }),
  );

  // Stable order by slug for deterministic, reviewable output.
  items.sort((a, b) => a.slug.localeCompare(b.slug));

  // Write per-item files (fresh dir).
  await rm(OUT_R_DIR, { recursive: true, force: true });
  await mkdir(OUT_R_DIR, { recursive: true });
  for (const { slug, built } of items) {
    await writeFile(resolve(OUT_R_DIR, `${slug}.json`), `${JSON.stringify(built, null, 2)}\n`);
  }

  // Write the flat registry index.
  const registry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "dakik",
    homepage: BASE_URL,
    items: items.map(({ built }) => toIndexItem(built)),
  };
  await writeFile(
    resolve(REGISTRY_DIR, "registry.json"),
    `${JSON.stringify(registry, null, 2)}\n`,
  );

  // Sanity: no shark URLs survived the transform.
  const leaked = items.filter(({ built }) =>
    JSON.stringify(built.registryDependencies ?? []).includes("shark.vini.one"),
  );
  if (leaked.length) {
    throw new Error(`shark.vini.one leaked in: ${leaked.map((i) => i.slug).join(", ")}`);
  }

  console.log(
    `\nDone. Wrote ${items.length} items to registry/r/ + registry/registry.json` +
      ` (${registry.items.length} indexed).`,
  );
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
