import { Hono } from "hono";

export function createLeadRouter() {
	const leads = new Hono();

	leads.get("/", async (c) => {
		const db = c.get("db");
		const { search, status, limit = "50" } = c.req.query();

		const where: Record<string, unknown> = {};
		if (status) {
			where.status = status;
		}
		if (search) {
			where.OR = [
				{ email: { contains: search, mode: "insensitive" } },
				{ name: { contains: search, mode: "insensitive" } },
			];
		}

		const leadsList = await db.lead.findMany({
			where,
			take: Number.parseInt(limit, 10),
			orderBy: { createdAt: "desc" },
			include: { meetings: true },
		});

		return c.json({ leads: leadsList });
	});

	leads.get("/:id", async (c) => {
		const db = c.get("db");
		const id = c.req.param("id");

		const lead = await db.lead.findUnique({
			where: { id },
			include: { meetings: true, customer: true },
		});

		if (!lead) {
			return c.json({ error: "Lead not found" }, 404);
		}

		return c.json({ lead });
	});

	leads.post("/", async (c) => {
		const db = c.get("db");
		const body = await c.req.json();

		if (!body.email) {
			return c.json({ error: "Email is required" }, 400);
		}

		// Upsert by email so re-submissions update the existing lead instead of
		// crashing on the @unique constraint. Returns the lead either way so the
		// caller can use leadId to book a meeting in the next step.
		const lead = await db.lead.upsert({
			where: { email: body.email },
			create: {
				email: body.email,
				name: body.name,
				projectType: body.projectType,
				budget: body.budget,
				details: body.details,
				source: body.source,
			},
			update: {
				...(body.name && { name: body.name }),
				...(body.projectType && { projectType: body.projectType }),
				...(body.budget && { budget: body.budget }),
				...(body.details && { details: body.details }),
				...(body.source && { source: body.source }),
			},
		});

		return c.json({ lead }, 200);
	});

	leads.put("/:id", async (c) => {
		const db = c.get("db");
		const id = c.req.param("id");
		const body = await c.req.json();

		const lead = await db.lead.update({
			where: { id },
			data: {
				name: body.name,
				projectType: body.projectType,
				budget: body.budget,
				details: body.details,
				status: body.status,
				currentStep: body.currentStep,
				surveyProgress: body.surveyProgress,
			},
		});

		return c.json({ lead });
	});

	leads.delete("/:id", async (c) => {
		const db = c.get("db");
		const id = c.req.param("id");

		await db.lead.delete({ where: { id } });

		return c.json({ success: true });
	});

	leads.post("/:id/convert", async (c) => {
		const db = c.get("db");
		const id = c.req.param("id");
		const body = await c.req.json();

		const lead = await db.lead.findUnique({ where: { id } });
		if (!lead) {
			return c.json({ error: "Lead not found" }, 404);
		}

		const user = await db.user.create({
			data: {
				id: crypto.randomUUID(),
				email: lead.email,
				name: lead.name || "",
				emailVerified: false,
			},
		});

		const customer = await db.customer.create({
			data: {
				userId: user.id,
				leadId: lead.id,
				companyName: body.companyName,
				phone: body.phone,
			},
		});

		await db.lead.update({
			where: { id },
			data: { status: "CONVERTED" },
		});

		return c.json({ customer, lead });
	});

	return leads;
}
