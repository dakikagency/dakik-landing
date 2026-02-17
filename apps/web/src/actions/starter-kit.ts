"use server";

import { db } from "@collab/db";
import { z } from "zod";

const subscribeSchema = z.string().email();

export async function subscribeToStarterKit(email: string) {
	try {
		const validEmail = subscribeSchema.parse(email);

		// 1. Create/Update Lead using Kysely upsert (insert on conflict)
		await db
			.insertInto("lead")
			.values({
				id: crypto.randomUUID(),
				email: validEmail,
				source: "starter-kit",
				status: "NEW",
				currentStep: 1,
				updatedAt: new Date(),
			})
			.onConflict((oc) =>
				oc.column("email").doUpdateSet({
					updatedAt: new Date(),
				})
			)
			.execute();

		// 2. Get the Lead Magnet Asset URL
		const leadMagnet = await db
			.selectFrom("lead_magnet")
			.innerJoin("asset", "asset.id", "lead_magnet.assetId")
			.where("lead_magnet.slug", "=", "starter-kit")
			.select(["lead_magnet.isActive", "asset.secureUrl"])
			.executeTakeFirst();

		if (!leadMagnet?.isActive) {
			// Graceful fallback or error
			return {
				success: false,
				error: "The starter kit is currently unavailable.",
			};
		}

		// 3. Send Email (TODO: Implement actual email sending)
		// For now we just log it.
		console.log(`[Email] Sending Starter Kit to ${validEmail}`);

		return {
			success: true,
			downloadUrl: leadMagnet.secureUrl,
		};
	} catch (error) {
		console.error("Subscription error:", error);
		if (error instanceof z.ZodError) {
			return { success: false, error: "Invalid email address." };
		}
		return { success: false, error: "Failed to process request." };
	}
}
