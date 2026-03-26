import { Hono } from "hono";
import Stripe from "stripe";

export function createStripeWebhookRouter() {
	const webhooks = new Hono();

	webhooks.post("/stripe", async (c) => {
		const env = c.env as {
			STRIPE_SECRET_KEY?: string;
			STRIPE_WEBHOOK_SECRET?: string;
		};

		if (!(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET)) {
			return c.json({ error: "Stripe not configured" }, 500);
		}

		const stripe = new Stripe(env.STRIPE_SECRET_KEY);
		const sig = c.req.header("stripe-signature");
		const body = await c.req.text();

		let event: Stripe.Event;
		try {
			event = stripe.webhooks.constructEvent(
				body,
				sig || "",
				env.STRIPE_WEBHOOK_SECRET
			);
		} catch (err) {
			console.error("Webhook signature verification failed:", err);
			return c.json({ error: "Invalid signature" }, 400);
		}

		const db = c.get("db");

		if (event.type === "payment_intent.succeeded") {
			const paymentIntent = event.data.object as Stripe.PaymentIntent;
			const invoiceId = paymentIntent.metadata.invoiceId;

			if (invoiceId) {
				await db.invoice.update({
					where: { id: invoiceId },
					data: {
						status: "PAID",
						paidAt: new Date(),
						stripePaymentIntentId: paymentIntent.id,
					},
				});
			}
		}

		return c.json({ received: true });
	});

	return webhooks;
}
