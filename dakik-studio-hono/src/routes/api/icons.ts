import { Hono } from "hono";

export function createIconsRouter() {
	const icons = new Hono();

	icons.get("/", async (c) => {
		const db = c.get("db");
		const { search, category, limit = "500" } = c.req.query();

		const where: Record<string, unknown> = {};
		if (category) where.category = category;
		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ keywords: { has: search } },
			];
		}

		const items = await db.icon.findMany({
			where,
			take: Math.min(2000, Number.parseInt(limit, 10) || 500),
			orderBy: { name: "asc" },
		});

		return c.json({ icons: items });
	});

	return icons;
}
