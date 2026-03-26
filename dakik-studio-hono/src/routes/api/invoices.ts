import { Hono } from "hono";
import Stripe from "stripe";

export function createInvoiceRouter() {
	const invoices = new Hono();

	// GET /api/invoices - List all invoices
	invoices.get("/", async (c) => {
		const db = c.get("db");
		const { status, customerId, limit = "50" } = c.req.query();

		const where: any = {};
		if (status) where.status = status;
		if (customerId) where.customerId = customerId;

		const invoicesList = await db.invoice.findMany({
			where,
			take: Number.parseInt(limit),
			orderBy: { createdAt: "desc" },
			include: {
				customer: {
					include: { user: { select: { email: true, name: true } } },
				},
				project: { select: { id: true, title: true } },
			},
		});

		return c.json({ invoices: invoicesList });
	});

	// GET /api/invoices/:id - Get single invoice
	invoices.get("/:id", async (c) => {
		const db = c.get("db");
		const id = c.req.param("id");

		const invoice = await db.invoice.findUnique({
			where: { id },
			include: {
				customer: { include: { user: true } },
				project: true,
			},
		});

		if (!invoice) {
			return c.json({ error: "Invoice not found" }, 404);
		}

		return c.json({ invoice });
	});

	// POST /api/invoices - Create invoice
	invoices.post("/", async (c) => {
		const db = c.get("db");
		const env = c.env as any;
		const body = await c.req.json();

		// Create Stripe payment intent if Stripe is configured
		let stripePaymentIntentId = null;
		if (env.STRIPE_SECRET_KEY && body.amount > 0) {
			const stripe = new Stripe(env.STRIPE_SECRET_KEY);
			const paymentIntent = await stripe.paymentIntents.create({
				amount: Math.round(body.amount * 100), // Convert to cents
				currency: "gbp",
				metadata: {
					customerId: body.customerId,
					description: body.description,
				},
			});
			stripePaymentIntentId = paymentIntent.id;
		}

		const invoice = await db.invoice.create({
			data: {
				customerId: body.customerId,
				projectId: body.projectId,
				invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : new Date(),
				dueDate: body.dueDate ? new Date(body.dueDate) : null,
				amount: body.amount,
				description: body.description,
				fileUrl: body.fileUrl,
				status: stripePaymentIntentId ? "PENDING" : "UNPAID",
				stripePaymentIntentId,
			},
		});

		return c.json({ invoice }, 201);
	});

	// PUT /api/invoices/:id - Update invoice
	invoices.put("/:id", async (c) => {
		const db = c.get("db");
		const id = c.req.param("id");
		const body = await c.req.json();

		const invoice = await db.invoice.update({
			where: { id },
			data: {
				projectId: body.projectId,
				invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : undefined,
				dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
				amount: body.amount,
				description: body.description,
				fileUrl: body.fileUrl,
				status: body.status,
				paidAt: body.status === "PAID" ? new Date() : undefined,
			},
		});

		return c.json({ invoice });
	});

	// DELETE /api/invoices/:id - Delete invoice
	invoices.delete("/:id", async (c) => {
		const db = c.get("db");
		const id = c.req.param("id");

		await db.invoice.delete({ where: { id } });

		return c.json({ success: true });
	});

	// POST /api/invoices/:id/pay - Create payment intent for invoice
	invoices.post("/:id/pay", async (c) => {
		const db = c.get("db");
		const env = c.env as any;
		const id = c.req.param("id");

		const invoice = await db.invoice.findUnique({ where: { id } });
		if (!invoice) {
			return c.json({ error: "Invoice not found" }, 404);
		}

		if (!env.STRIPE_SECRET_KEY) {
			return c.json({ error: "Stripe not configured" }, 500);
		}

		const stripe = new Stripe(env.STRIPE_SECRET_KEY);
		const paymentIntent = await stripe.paymentIntents.create({
			amount: Math.round(Number(invoice.amount) * 100),
			currency: "gbp",
			metadata: { invoiceId: invoice.id, customerId: invoice.customerId },
		});

		// Update invoice with payment intent ID
		await db.invoice.update({
			where: { id },
			data: { stripePaymentIntentId: paymentIntent.id, status: "PENDING" },
		});

		return c.json({ clientSecret: paymentIntent.client_secret });
	});

	return invoices;
}
