import { Hono } from "hono";
import { sanitizeSvg } from "../../../lib/sanitize-svg";

/**
 * Admin CRUD for Icon. Mounted at /api/admin/icons.
 *
 * SVG content is stored inline (svgContent column) so daicons can be
 * served without an extra round-trip. Keywords are a string array for
 * search.
 */
export function createAdminIconsRouter() {
	const icons = new Hono();

	icons.get("/", async (c) => {
		const db = c.get("db");
		const { search, category, limit = "200" } = c.req.query();

		const where: Record<string, unknown> = {};
		if (category) {
			where.category = category;
		}
		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ slug: { contains: search, mode: "insensitive" } },
				{ keywords: { has: search.toLowerCase() } },
			];
		}

		const rows = await db.icon.findMany({
			where,
			take: Number.parseInt(limit, 10),
			orderBy: { updatedAt: "desc" },
		});

		return c.json({ icons: rows });
	});

	icons.post("/", async (c) => {
		const db = c.get("db");
		const body = await c.req.json();

		if (!body.name || !body.slug || !body.category || !body.svgContent) {
			return c.json(
				{ error: "name, slug, category and svgContent are required" },
				400,
			);
		}

		const icon = await db.icon.create({
			data: {
				name: body.name,
				slug: body.slug,
				category: body.category,
				svgContent: sanitizeSvg(body.svgContent),
				keywords: Array.isArray(body.keywords) ? body.keywords : [],
				isCustom: body.isCustom ?? true,
			},
		});

		return c.json({ icon }, 201);
	});

	icons.put("/:id", async (c) => {
		const db = c.get("db");
		const id = c.req.param("id");
		const body = await c.req.json();

		const existing = await db.icon.findUnique({ where: { id } });
		if (!existing) {
			return c.json({ error: "Icon not found" }, 404);
		}

		const icon = await db.icon.update({
			where: { id },
			data: {
				name: body.name ?? existing.name,
				slug: body.slug ?? existing.slug,
				category: body.category ?? existing.category,
				svgContent: body.svgContent
					? sanitizeSvg(body.svgContent)
					: existing.svgContent,
				keywords: Array.isArray(body.keywords)
					? body.keywords
					: existing.keywords,
				isCustom: body.isCustom ?? existing.isCustom,
			},
		});

		return c.json({ icon });
	});

	icons.delete("/:id", async (c) => {
		const db = c.get("db");
		await db.icon.delete({ where: { id: c.req.param("id") } });
		return c.json({ success: true });
	});

	return icons;
}
