import { Hono } from "hono";

/**
 * Admin CRUD for ComponentDoc + nested ComponentFile rows.
 * Mounted at /api/admin/components.
 *
 * The list endpoint returns components with their files; create/update accept
 * a `files` array and replace-all on update for simplicity.
 */
export function createAdminComponentsRouter() {
	const components = new Hono();

	components.get("/", async (c) => {
		const db = c.get("db");
		const { search, category, limit = "100" } = c.req.query();

		const where: Record<string, unknown> = {};
		if (category) {
			where.category = category;
		}
		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ slug: { contains: search, mode: "insensitive" } },
			];
		}

		const rows = await db.componentDoc.findMany({
			where,
			take: Number.parseInt(limit, 10),
			orderBy: { updatedAt: "desc" },
			include: { files: { orderBy: { order: "asc" } } },
		});

		return c.json({ components: rows });
	});

	components.get("/:id", async (c) => {
		const db = c.get("db");
		const doc = await db.componentDoc.findUnique({
			where: { id: c.req.param("id") },
			include: { files: { orderBy: { order: "asc" } } },
		});
		if (!doc) {
			return c.json({ error: "Component not found" }, 404);
		}
		return c.json({ component: doc });
	});

	components.post("/", async (c) => {
		const db = c.get("db");
		const body = await c.req.json();

		if (!body.name || !body.slug || !body.category || !body.code) {
			return c.json(
				{ error: "name, slug, category and code are required" },
				400,
			);
		}

		const files: Array<{
			filename: string;
			content: string;
			fileType?: string;
			isMainFile?: boolean;
			order?: number;
		}> = Array.isArray(body.files) ? body.files : [];

		const component = await db.componentDoc.create({
			data: {
				name: body.name,
				slug: body.slug,
				category: body.category,
				description: body.description ?? null,
				props: body.props ?? {},
				code: body.code,
				preview: body.preview ?? null,
				published: body.published ?? true,
				files: files.length
					? {
							create: files.map((f, idx) => ({
								filename: f.filename,
								content: f.content,
								fileType: (f.fileType as never) ?? "TYPESCRIPT",
								isMainFile: f.isMainFile ?? false,
								order: f.order ?? idx,
							})),
						}
					: undefined,
			},
			include: { files: { orderBy: { order: "asc" } } },
		});

		return c.json({ component }, 201);
	});

	components.put("/:id", async (c) => {
		const db = c.get("db");
		const id = c.req.param("id");
		const body = await c.req.json();

		const existing = await db.componentDoc.findUnique({ where: { id } });
		if (!existing) {
			return c.json({ error: "Component not found" }, 404);
		}

		// If files are provided, replace them all. Otherwise leave alone.
		const files: Array<{
			filename: string;
			content: string;
			fileType?: string;
			isMainFile?: boolean;
			order?: number;
		}> | null = Array.isArray(body.files) ? body.files : null;

		if (files) {
			await db.componentFile.deleteMany({ where: { componentId: id } });
		}

		const component = await db.componentDoc.update({
			where: { id },
			data: {
				name: body.name ?? existing.name,
				slug: body.slug ?? existing.slug,
				category: body.category ?? existing.category,
				description: body.description ?? existing.description,
				props: body.props ?? (existing.props as object),
				code: body.code ?? existing.code,
				preview: body.preview ?? existing.preview,
				published: body.published ?? existing.published,
				files: files
					? {
							create: files.map((f, idx) => ({
								filename: f.filename,
								content: f.content,
								fileType: (f.fileType as never) ?? "TYPESCRIPT",
								isMainFile: f.isMainFile ?? false,
								order: f.order ?? idx,
							})),
						}
					: undefined,
			},
			include: { files: { orderBy: { order: "asc" } } },
		});

		return c.json({ component });
	});

	components.delete("/:id", async (c) => {
		const db = c.get("db");
		await db.componentDoc.delete({ where: { id: c.req.param("id") } });
		return c.json({ success: true });
	});

	return components;
}
