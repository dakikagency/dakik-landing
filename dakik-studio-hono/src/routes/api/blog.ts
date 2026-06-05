import { Hono } from "hono";

// Mirror of calculateReadTime in src/frontend/lib/blog.ts — kept inline so the
// worker bundle stays self-contained (no cross-boundary frontend import).
function readingTimeFor(content: string | null | undefined): number {
	if (!content) return 1;
	return Math.max(1, Math.round(content.trim().split(/\s+/).length / 200));
}

export function createBlogRouter() {
	const blog = new Hono();

	blog.get("/", async (c) => {
		const db = c.get("db");
		const { tag, limit = "50" } = c.req.query();

		const where: Record<string, unknown> = {
			published: true,
			publishedAt: { not: null },
		};
		if (tag) {
			where.tags = { some: { slug: tag } };
		}

		const rows = await db.blogPost.findMany({
			where,
			take: Number.parseInt(limit, 10),
			orderBy: { publishedAt: "desc" },
			include: { tags: true },
		});

		// Drop the full markdown body from the list payload and surface a
		// precomputed read-time so summary cards can render "N min read".
		const posts = rows.map(
			({ content, ...rest }: { content: string | null }) => ({
				...rest,
				readingTime: readingTimeFor(content),
			}),
		);

		return c.json({ posts });
	});

	blog.get("/:slug", async (c) => {
		const db = c.get("db");
		const slug = c.req.param("slug");

		const post = await db.blogPost.findUnique({
			where: { slug },
			include: { tags: true },
		});

		if (!post || !post.published) {
			return c.json({ error: "Post not found" }, 404);
		}

		const tagIds = post.tags.map((t: { id: string }) => t.id);
		const relatedRows = tagIds.length
			? await db.blogPost.findMany({
					where: {
						published: true,
						id: { not: post.id },
						tags: { some: { id: { in: tagIds } } },
					},
					take: 3,
					orderBy: { publishedAt: "desc" },
					include: { tags: true },
				})
			: [];

		const related = relatedRows.map(
			({ content, ...rest }: { content: string | null }) => ({
				...rest,
				readingTime: readingTimeFor(content),
			}),
		);

		return c.json({ post, related });
	});

	return blog;
}
