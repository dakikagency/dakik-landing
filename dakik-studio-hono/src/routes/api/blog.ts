import { Hono } from "hono";

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

		const posts = await db.blogPost.findMany({
			where,
			take: Number.parseInt(limit, 10),
			orderBy: { publishedAt: "desc" },
			include: { tags: true },
		});

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
		const related = tagIds.length
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

		return c.json({ post, related });
	});

	return blog;
}
