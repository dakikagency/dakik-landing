import { Hono } from "hono";

/**
 * Admin CRUD for Automation. Mounted at /api/admin/automations.
 * Mirrors the blog admin router with the addition of fileUrl for
 * automation downloads.
 */
export function createAdminAutomationsRouter() {
	const automations = new Hono();

	automations.get("/", async (c) => {
		const db = c.get("db");
		const { search, published, limit = "100" } = c.req.query();

		const where: Record<string, unknown> = {};
		if (published === "true") {
			where.published = true;
		} else if (published === "false") {
			where.published = false;
		}
		if (search) {
			where.OR = [
				{ title: { contains: search, mode: "insensitive" } },
				{ slug: { contains: search, mode: "insensitive" } },
			];
		}

		const rows = await db.automation.findMany({
			where,
			take: Number.parseInt(limit, 10),
			orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
			include: { tags: true },
		});

		return c.json({ automations: rows });
	});

	automations.get("/:id", async (c) => {
		const db = c.get("db");
		const automation = await db.automation.findUnique({
			where: { id: c.req.param("id") },
			include: { tags: true },
		});
		if (!automation) {
			return c.json({ error: "Automation not found" }, 404);
		}
		return c.json({ automation });
	});

	automations.post("/", async (c) => {
		const db = c.get("db");
		const body = await c.req.json();

		if (!body.title || !body.slug || !body.content) {
			return c.json({ error: "title, slug and content are required" }, 400);
		}

		const tagSlugs: string[] = Array.isArray(body.tags) ? body.tags : [];

		const automation = await db.automation.create({
			data: {
				title: body.title,
				slug: body.slug,
				excerpt: body.excerpt ?? null,
				content: body.content,
				coverImage: body.coverImage ?? null,
				fileUrl: body.fileUrl ?? null,
				published: Boolean(body.published),
				publishedAt: body.published ? new Date() : null,
				tags: tagSlugs.length
					? {
							connectOrCreate: tagSlugs.map((slug) => ({
								where: { slug },
								create: { slug, name: slug },
							})),
						}
					: undefined,
			},
			include: { tags: true },
		});

		return c.json({ automation }, 201);
	});

	automations.put("/:id", async (c) => {
		const db = c.get("db");
		const id = c.req.param("id");
		const body = await c.req.json();

		const existing = await db.automation.findUnique({ where: { id } });
		if (!existing) {
			return c.json({ error: "Automation not found" }, 404);
		}

		const tagSlugs: string[] | undefined = Array.isArray(body.tags)
			? body.tags
			: undefined;

		const newlyPublished = body.published && !existing.published;

		const automation = await db.automation.update({
			where: { id },
			data: {
				title: body.title ?? existing.title,
				slug: body.slug ?? existing.slug,
				excerpt: body.excerpt ?? existing.excerpt,
				content: body.content ?? existing.content,
				coverImage: body.coverImage ?? existing.coverImage,
				fileUrl: body.fileUrl ?? existing.fileUrl,
				published: body.published ?? existing.published,
				publishedAt: newlyPublished
					? new Date()
					: body.published === false
						? null
						: existing.publishedAt,
				tags: tagSlugs
					? {
							set: [],
							connectOrCreate: tagSlugs.map((slug) => ({
								where: { slug },
								create: { slug, name: slug },
							})),
						}
					: undefined,
			},
			include: { tags: true },
		});

		return c.json({ automation });
	});

	automations.delete("/:id", async (c) => {
		const db = c.get("db");
		await db.automation.delete({ where: { id: c.req.param("id") } });
		return c.json({ success: true });
	});

	return automations;
}
