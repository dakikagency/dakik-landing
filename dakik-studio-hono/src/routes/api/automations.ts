import { Hono } from "hono";

export function createAutomationsRouter() {
	const automations = new Hono();

	automations.get("/", async (c) => {
		const db = c.get("db");
		const { tag, limit = "50" } = c.req.query();

		const where: Record<string, unknown> = {
			published: true,
			publishedAt: { not: null },
		};
		if (tag) {
			where.tags = { some: { slug: tag } };
		}

		const items = await db.automation.findMany({
			where,
			take: Number.parseInt(limit, 10),
			orderBy: { publishedAt: "desc" },
			include: { tags: true },
		});

		return c.json({ automations: items });
	});

	automations.get("/:slug", async (c) => {
		const db = c.get("db");
		const slug = c.req.param("slug");

		const automation = await db.automation.findUnique({
			where: { slug },
			include: { tags: true },
		});

		if (!automation || !automation.published) {
			return c.json({ error: "Automation not found" }, 404);
		}

		const tagIds = automation.tags.map((t: { id: string }) => t.id);
		const related = tagIds.length
			? await db.automation.findMany({
					where: {
						published: true,
						id: { not: automation.id },
						tags: { some: { id: { in: tagIds } } },
					},
					take: 3,
					orderBy: { publishedAt: "desc" },
					include: { tags: true },
				})
			: [];

		return c.json({ automation, related });
	});

	return automations;
}
