import { Hono } from "hono";

/** DDMMYYYY, e.g. 17092026 — used to disambiguate a duplicate slug. */
function dateSuffix(d: Date): string {
	const day = String(d.getUTCDate()).padStart(2, "0");
	const month = String(d.getUTCMonth() + 1).padStart(2, "0");
	return `${day}${month}${d.getUTCFullYear()}`;
}

/**
 * In-house slug uniqueness. Returns `base` if free; otherwise `base-DDMMYYYY`,
 * then `base-DDMMYYYY-2`, `-3`, … so a create never hits the unique-index error.
 */
async function ensureUniqueSlug(
	exists: (slug: string) => Promise<boolean>,
	base: string,
): Promise<string> {
	if (!(await exists(base))) return base;
	const dated = `${base}-${dateSuffix(new Date())}`;
	if (!(await exists(dated))) return dated;
	for (let n = 2; n < 50; n++) {
		const candidate = `${dated}-${n}`;
		if (!(await exists(candidate))) return candidate;
	}
	return `${dated}-${Date.now()}`;
}

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
				{ title: { contains: search } },
				{ slug: { contains: search } },
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
		const user = c.get("user");
		const body = await c.req.json();

		if (!body.title || !body.slug || !body.content) {
			return c.json({ error: "title, slug and content are required" }, 400);
		}

		const tagSlugs: string[] = Array.isArray(body.tags) ? body.tags : [];

		// In-house slug governance: guarantee a unique slug (append the date,
		// then a counter, if the requested one is already taken).
		const slug = await ensureUniqueSlug(
			async (s) =>
				Boolean(await db.blogPost.findUnique({ where: { slug: s } })),
			String(body.slug),
		);

		// Automated (token) callers always publish immediately; the admin UI
		// keeps its own draft/publish toggle.
		const published =
			user?.id === "service:ingest" ? true : Boolean(body.published);

		const post = await db.blogPost.create({
			data: {
				title: body.title,
				slug,
				excerpt: body.excerpt ?? null,
				content: body.content,
				coverImage: body.coverImage ?? null,
				published,
				publishedAt: published ? new Date() : null,
				tags: tagSlugs.length
					? {
							connectOrCreate: tagSlugs.map((s) => ({
								where: { slug: s },
								create: { slug: s, name: s },
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
