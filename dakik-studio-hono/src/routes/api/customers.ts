import { Hono } from "hono";

export function createCustomerRouter() {
	const customers = new Hono();

	// GET /api/customers - List all customers
	customers.get("/", async (c) => {
		const db = c.get("db");
		const { search, limit = "50" } = c.req.query();

		const where: Record<string, unknown> = {};
		if (search) {
			where.OR = [
				{ user: { email: { contains: search, mode: "insensitive" } } },
				{ user: { name: { contains: search, mode: "insensitive" } } },
				{ companyName: { contains: search, mode: "insensitive" } },
			];
		}

		const customersList = await db.customer.findMany({
			where,
			take: Number.parseInt(limit, 10),
			orderBy: { createdAt: "desc" },
			include: {
				user: { select: { id: true, email: true, name: true, image: true } },
				projects: { select: { id: true, title: true, status: true } },
				contracts: { select: { id: true, title: true, status: true } },
				invoices: { select: { id: true, amount: true, status: true } },
			},
		});

		return c.json({ customers: customersList });
	});

	// GET /api/customers/:id - Get single customer
	customers.get("/:id", async (c) => {
		const db = c.get("db");
		const id = c.req.param("id");

		const customer = await db.customer.findUnique({
			where: { id },
			include: {
				user: true,
				lead: true,
				projects: { orderBy: { createdAt: "desc" } },
				contracts: { orderBy: { createdAt: "desc" } },
				invoices: { orderBy: { createdAt: "desc" } },
				meetings: { orderBy: { scheduledAt: "desc" } },
			},
		});

		if (!customer) {
			return c.json({ error: "Customer not found" }, 404);
		}

		return c.json({ customer });
	});

	// PUT /api/customers/:id - Update customer
	customers.put("/:id", async (c) => {
		const db = c.get("db");
		const id = c.req.param("id");
		const body = await c.req.json();

		const customer = await db.customer.update({
			where: { id },
			data: {
				companyName: body.companyName,
				phone: body.phone,
			},
		});

		return c.json({ customer });
	});

	// DELETE /api/customers/:id - Delete customer (cascades to user)
	customers.delete("/:id", async (c) => {
		const db = c.get("db");
		const id = c.req.param("id");

		const customer = await db.customer.findUnique({ where: { id } });
		if (!customer) {
			return c.json({ error: "Customer not found" }, 404);
		}

		// Delete customer (user cascade should handle user deletion if no other relations)
		await db.customer.delete({ where: { id } });

		return c.json({ success: true });
	});

	return customers;
}
