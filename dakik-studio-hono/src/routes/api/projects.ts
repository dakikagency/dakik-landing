import { Hono } from "hono";

export function createProjectRouter() {
	const projects = new Hono();

	projects.get("/", async (c) => {
		const db = c.get("db");
		const { status, customerId, search, limit = "50" } = c.req.query();

		const where: Record<string, unknown> = {};
		if (status) {
			where.status = status;
		}
		if (customerId) {
			where.customerId = customerId;
		}
		if (search) {
			where.OR = [
				{ title: { contains: search, mode: "insensitive" } },
				{ description: { contains: search, mode: "insensitive" } },
			];
		}

		const projectsList = await db.project.findMany({
			where,
			take: Number.parseInt(limit, 10),
			orderBy: { createdAt: "desc" },
			include: {
				customer: {
					include: { user: { select: { email: true, name: true } } },
				},
				_count: { select: { invoices: true, updates: true } },
			},
		});

		return c.json({ projects: projectsList });
	});

	projects.get("/:id", async (c) => {
		const db = c.get("db");
		const id = c.req.param("id");

		const project = await db.project.findUnique({
			where: { id },
			include: {
				customer: { include: { user: true } },
				updates: { orderBy: { createdAt: "desc" } },
				qAndAs: { orderBy: { askedAt: "desc" } },
				invoices: { orderBy: { createdAt: "desc" } },
			},
		});

		if (!project) {
			return c.json({ error: "Project not found" }, 404);
		}

		return c.json({ project });
	});

	projects.post("/", async (c) => {
		const db = c.get("db");
		const body = await c.req.json();

		const project = await db.project.create({
			data: {
				customerId: body.customerId,
				title: body.title,
				description: body.description,
				status: body.status || "PENDING",
				startDate: body.startDate ? new Date(body.startDate) : null,
				endDate: body.endDate ? new Date(body.endDate) : null,
			},
			include: { customer: true },
		});

		return c.json({ project }, 201);
	});

	projects.put("/:id", async (c) => {
		const db = c.get("db");
		const id = c.req.param("id");
		const body = await c.req.json();

		const project = await db.project.update({
			where: { id },
			data: {
				title: body.title,
				description: body.description,
				status: body.status,
				progress: body.progress,
				startDate: body.startDate ? new Date(body.startDate) : undefined,
				endDate: body.endDate ? new Date(body.endDate) : undefined,
			},
		});

		return c.json({ project });
	});

	projects.post("/:id/progress", async (c) => {
		const db = c.get("db");
		const id = c.req.param("id");
		const body = await c.req.json();

		const { progress, updateTitle, updateContent } = body;

		if (updateTitle || updateContent) {
			await db.projectUpdate.create({
				data: {
					projectId: id,
					title: updateTitle || "Progress Update",
					content: updateContent || "",
					progress,
				},
			});
		}

		let computedStatus: "COMPLETED" | "IN_PROGRESS" | undefined;
		if (progress === 100) {
			computedStatus = "COMPLETED";
		} else if (progress > 0) {
			computedStatus = "IN_PROGRESS";
		} else {
			computedStatus = undefined;
		}

		const project = await db.project.update({
			where: { id },
			data: {
				progress,
				status: computedStatus,
			},
		});

		return c.json({ project });
	});

	projects.delete("/:id", async (c) => {
		const db = c.get("db");
		const id = c.req.param("id");

		await db.project.delete({ where: { id } });

		return c.json({ success: true });
	});

	projects.get("/:id/qanda", async (c) => {
		const db = c.get("db");
		const id = c.req.param("id");

		const qAndAs = await db.qAndA.findMany({
			where: { projectId: id },
			orderBy: { askedAt: "desc" },
		});

		return c.json({ qAndAs });
	});

	projects.post("/:id/qanda", async (c) => {
		const db = c.get("db");
		const id = c.req.param("id");
		const body = await c.req.json();

		const qAndA = await db.qAndA.create({
			data: {
				projectId: id,
				question: body.question,
			},
		});

		return c.json({ qAndA }, 201);
	});

	projects.put("/:id/qanda/:qaid", async (c) => {
		const db = c.get("db");
		const { qaid } = c.req.param();
		const body = await c.req.json();

		const qAndA = await db.qAndA.update({
			where: { id: qaid },
			data: {
				answer: body.answer,
				answeredAt: new Date(),
			},
		});

		return c.json({ qAndA });
	});

	return projects;
}
