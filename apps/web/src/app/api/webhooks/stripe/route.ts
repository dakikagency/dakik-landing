import { stripe } from "@collab/api/stripe";
import prisma from "@collab/db";
import { env } from "@collab/env/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export async function POST(req: Request) {
	const body = await req.text();
	const signature = (await headers()).get("Stripe-Signature") as string;

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(
			body,
			signature,
			env.STRIPE_WEBHOOK_SECRET || ""
		);
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
	}

	const session = event.data.object as Stripe.PaymentIntent;

	if (event.type === "payment_intent.succeeded") {
		const invoiceId = session.metadata?.invoiceId;

		if (invoiceId) {
			const _invoice = await prisma.invoice.update({
				where: { id: invoiceId },
				data: {
					status: "PAID",
					paidAt: new Date(),
				},
			});
			console.log(`Invoice ${invoiceId} marked as paid.`);

			// TODO: Implement webhook service for notifying other systems
			// await webhookService.dispatch("invoice.paid", {
			// 	invoiceId: invoice.id,
			// 	amount: invoice.amount,
			// 	customerId: invoice.customerId,
			// 	paidAt: new Date(),
			// });
		} else {
			// Try to find by paymentIntentId if metadata is missing
			// We use updateMany because stripePaymentIntentId is not unique in prisma schema yet (although it should be)
			// and findUnique requires unique field.
			// Actually, updateMany is fine.
			await prisma.invoice.updateMany({
				where: { stripePaymentIntentId: session.id },
				data: {
					status: "PAID",
					paidAt: new Date(),
				},
			});
		}
	}

	return new NextResponse(null, { status: 200 });
}
