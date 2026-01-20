import crypto from "node:crypto";
import prisma from "@collab/db";

export type WebhookEvent = "lead.created" | "project.updated" | "invoice.paid";

interface WebhookPayload {
	event: WebhookEvent;
	timestamp: string;
	data: Record<string, unknown>;
}

export const webhookService = {
	/**
	 * Dispatch an event to all subscribed webhooks
	 */
	async dispatch(event: WebhookEvent, data: Record<string, unknown>) {
		const webhooks = await prisma.webhook.findMany({
			where: {
				isActive: true,
				events: {
					has: event,
				},
			},
		});

		if (webhooks.length === 0) {
			return;
		}

		const timestamp = new Date().toISOString();
		const payload: WebhookPayload = {
			event,
			timestamp,
			data,
		};

		const payloadString = JSON.stringify(payload);

		await Promise.all(
			webhooks.map(async (webhook) => {
				try {
					const headers: Record<string, string> = {
						"Content-Type": "application/json",
						"X-Collab-Event": event,
						"X-Collab-Timestamp": timestamp,
					};

					if (webhook.secret) {
						const signature = crypto
							.createHmac("sha256", webhook.secret)
							.update(payloadString)
							.digest("hex");
						headers["X-Collab-Signature"] = signature;
					}

					await fetch(webhook.url, {
						method: "POST",
						headers,
						body: payloadString,
					});
				} catch (error) {
					console.error(`Failed to dispatch webhook to ${webhook.url}`, error);
				}
			})
		);
	},
};
