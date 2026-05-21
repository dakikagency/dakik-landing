import { Hono } from "hono";

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
				{ name: { contains: search, mode: "insensitive" } },
				{ description: { contains: search, mode: "insensitive" } },
			];
		}

		const [items, total] = await Promise.all([
			db.componentDoc.findMany({
				where,
				take,
				skip,
				orderBy: { name: "asc" },
				include: { files: true },
			}),
			db.componentDoc.count({ where }),
		]);

		return c.json({ components: items, total, page: pageNum, limit: take });
	});

	components.get("/:slug", async (c) => {
		const db = c.get("db");
		const slug = c.req.param("slug");
		const component = await db.componentDoc.findUnique({
			where: { slug },
			include: { files: true },
		});
		if (!component) return c.json({ error: "Not found" }, 404);
		return c.json({ component });
	});

	return components;
}
