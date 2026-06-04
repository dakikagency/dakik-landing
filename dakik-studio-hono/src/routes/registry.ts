import { Hono } from "hono";
import { getDb } from "../lib/db";
import type { CloudflareEnv } from "../types/cloudflare";

/**
 * Dakik Bits — shadcn registry served dynamically from D1.
 *
 * Mounted at "/" so it owns two public, CLI-facing endpoints (added to
 * `run_worker_first` in wrangler.jsonc so the worker handles them instead of
 * static assets):
 *
 *   GET /registry.json   → the flat registry index (items WITHOUT file content)
 *   GET /r/:name.json    → a single installable registry item (WITH file content)
 *
 * Each component is one `component_doc` row: the `.tsx` source lives in `code`
 * and all shadcn metadata lives in the `props` JSON column (see
 * scripts/seed-registry-sql.mjs). Because the admin panel's existing
 * ComponentDoc CRUD writes those same columns, edits go live here immediately —
 * `npx shadcn add @dakik/<name>` always reflects the current DB.
 */

const BASE_URL = "https://bits.dakik.co.uk";

/** Shape of the data we stash in `component_doc.props` for each registry item. */
interface RegistryProps {
	type?: string;
	author?: string;
	meta?: Record<string, unknown>;
	dependencies?: string[];
	registryDependencies?: string[];
	cssVars?: unknown;
	css?: unknown;
	file?: { path: string; type: string; target?: string };
}

interface DocRow {
	slug: string;
	name: string;
	category: string;
	description: string | null;
	props: unknown;
	code?: string;
}

/**
 * Assemble a shadcn registry item from a component_doc row.
 * `withContent` controls whether file bodies are inlined (item endpoint) or
 * omitted (index endpoint — the shadcn directory forbids `content` there).
 */
function buildItem(row: DocRow, withContent: boolean): Record<string, unknown> {
	const props = (row.props ?? {}) as RegistryProps;
	const file = props.file ?? {
		path: `registry/react/components/${row.slug}.tsx`,
		type: "registry:ui",
	};

	const item: Record<string, unknown> = {
		name: row.slug,
		type: props.type ?? "registry:ui",
		title: row.name,
	};
	if (row.description) item.description = row.description;
	if (props.author) item.author = props.author;
	item.categories = [row.category];
	if (props.meta) item.meta = props.meta;
	if (props.dependencies?.length) item.dependencies = props.dependencies;
	if (props.registryDependencies?.length) {
		item.registryDependencies = props.registryDependencies;
	}
	if (props.cssVars) item.cssVars = props.cssVars;
	if (props.css) item.css = props.css;

	const fileEntry: Record<string, unknown> = { path: file.path, type: file.type };
	if (file.target) fileEntry.target = file.target;
	if (withContent) fileEntry.content = row.code ?? "";
	item.files = [fileEntry];

	return item;
}

export function createRegistryRouter() {
	const registry = new Hono<{ Bindings: CloudflareEnv }>();

	// Flat registry index — directory-compliant (items carry no file content).
	registry.get("/registry.json", async (c) => {
		const db = getDb(c.env);
		const rows = (await db.componentDoc.findMany({
			where: { published: true },
			orderBy: { slug: "asc" },
			select: {
				slug: true,
				name: true,
				category: true,
				description: true,
				props: true,
			},
		})) as DocRow[];

		c.header("cache-control", "public, max-age=60");
		return c.json({
			$schema: "https://ui.shadcn.com/schema/registry.json",
			name: "dakik",
			homepage: BASE_URL,
			items: rows.map((row) => buildItem(row, false)),
		});
	});

	// Single installable item — `npx shadcn add @dakik/<name>` fetches this.
	registry.get("/r/:name", async (c) => {
		const slug = c.req.param("name").replace(/\.json$/, "");
		const db = getDb(c.env);
		const row = (await db.componentDoc.findUnique({
			where: { slug },
			select: {
				slug: true,
				name: true,
				category: true,
				description: true,
				props: true,
				code: true,
				published: true,
			},
		})) as (DocRow & { published: boolean }) | null;

		if (!row || !row.published) {
			return c.json({ error: `Unknown registry item: ${slug}` }, 404);
		}

		c.header("cache-control", "public, max-age=60");
		return c.json({
			$schema: "https://ui.shadcn.com/schema/registry-item.json",
			...buildItem(row, true),
		});
	});

	return registry;
}
