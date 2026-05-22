import { Hono } from "hono";

/**
 * Admin CRUD for BlogPost. Mounted at /api/admin/blog.
 * All routes require admin auth (enforced by the parent admin router).
 *
 * Returns posts regardless of published status (unlike the public /api/blog
 * which only returns published rows).
 */
export function createAdminBlogRouter() {
	const blog = new Hono();

	// GET /api/admin/blog?search=&published=&limit=
	blog.get("/", async (c) => {
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

		const posts = await db.blogPost.findMany({
			where,
			take: Number.parseInt(limit, 10),
			orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
			include: { tags: true },
		});

		return c.json({ posts });
	});

	blog.get("/:id", async (c) => {
		const db = c.get("db");
		const post = await db.blogPost.findUnique({
			where: { id: c.req.param("id") },
			include: { tags: true },
		});
		if (!post) {
			return c.json({ error: "Post not found" }, 404);
		}
		return c.json({ post });
	});

	blog.post("/", async (c) => {
		const db = c.get("db");
		const body = await c.req.json();

		if (!body.title || !body.slug || !body.content) {
			return c.json({ error: "title, slug and content are required" }, 400);
		}

		const tagSlugs: string[] = Array.isArray(body.tags) ? body.tags : [];

		const post = await db.blogPost.create({
			data: {
				title: body.title,
				slug: body.slug,
				excerpt: body.excerpt ?? null,
				content: body.content,
				coverImage: body.coverImage ?? null,
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

		return c.json({ post }, 201);
	});

	blog.put("/:id", async (c) => {
		const db = c.get("db");
		const id = c.req.param("id");
		const body = await c.req.json();

		const existing = await db.blogPost.findUnique({ where: { id } });
		if (!existing) {
			return c.json({ error: "Post not found" }, 404);
		}

		const tagSlugs: string[] | undefined = Array.isArray(body.tags)
			? body.tags
			: undefined;

		// Compute publishedAt: set on first publish, leave alone otherwise.
		const newlyPublished = body.published && !existing.published;

		const post = await db.blogPost.update({
			where: { id },
			data: {
				title: body.title ?? existing.title,
				slug: body.slug ?? existing.slug,
				excerpt: body.excerpt ?? existing.excerpt,
				content: body.content ?? existing.content,
				coverImage: body.coverImage ?? existing.coverImage,
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

		return c.json({ post });
	});

	blog.delete("/:id", async (c) => {
		const db = c.get("db");
		await db.blogPost.delete({ where: { id: c.req.param("id") } });
		return c.json({ success: true });
	});

	return blog;
}
