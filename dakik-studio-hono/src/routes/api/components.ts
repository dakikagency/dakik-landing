import { Hono } from "hono";

/**
 * Public read API for Dakik Bits components, backing the docs pages on
 * bits.dakik.co.uk. The shadcn CLI never touches this — it consumes
 * /registry.json and /r/:name.json (src/routes/registry.ts); this API serves
 * the human-facing detail pages.
 *
 * List responses are metadata-only (no source, no files) — the full TSX source
 * ships only per component from GET /:slug.
 */
export function createComponentsRouter() {
	const components = new Hono();

	components.get("/", async (c) => {
		const db = c.get("db");
		const {
			search,
			category,
			page = "1",
			limit = "50",
		} = c.req.query();

		const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
		const take = Math.max(1, Math.min(100, Number.parseInt(limit, 10) || 50));
		const skip = (pageNum - 1) * take;

		const where: Record<string, unknown> = { published: true };
		if (category) where.category = category;
		if (search) {
			where.OR = [
				{ name: { contains: search } },
				{ description: { contains: search } },
			];
		}

		const [items, total] = await Promise.all([
			db.componentDoc.findMany({
				where,
				take,
				skip,
				orderBy: { name: "asc" },
				select: {
					id: true,
					name: true,
					slug: true,
					category: true,
					description: true,
					props: true,
					preview: true,
					updatedAt: true,
				},
			}),
			db.componentDoc.count({ where }),
		]);

		c.header("cache-control", "public, max-age=60");
		return c.json({ components: items, total, page: pageNum, limit: take });
	});

	components.get("/:slug", async (c) => {
		const db = c.get("db");
		const slug = c.req.param("slug");
		const component = await db.componentDoc.findFirst({
			where: { slug, published: true },
			include: { files: { orderBy: { order: "asc" } } },
		});
		if (!component) return c.json({ error: "Not found" }, 404);

		c.header("cache-control", "public, max-age=60");
		return c.json({ component });
	});

	return components;
}
