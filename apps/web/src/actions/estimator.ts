"use server";

import { db } from "@collab/db";
import { z } from "zod";

const estimatorSchema = z.object({
	email: z.string().email(),
	features: z.array(z.string()),
	platform: z.enum(["web", "mobile", "both"]),
	designStatus: z.enum(["ready", "needed"]),
});

type EstimatorData = z.infer<typeof estimatorSchema>;

const PRICING = {
	base: 5000,
	platform: {
		web: 15_000,
		mobile: 10_000,
		both: 22_000, // bundled discount logic implicit
	},
	features: {
		ai: 5000,
		payments: 2000,
		admin: 3000,
		cms: 2000,
		auth: 1000,
	} as Record<string, number>,
	design: {
		needed: 3000,
		ready: 0,
	},
};

export async function submitEstimatorLead(data: EstimatorData) {
	try {
		const validData = estimatorSchema.parse(data);

		// Calculate Estimate
		let minPrice = PRICING.base;
		minPrice += PRICING.platform[validData.platform];
		minPrice += PRICING.design[validData.designStatus];

		for (const feature of validData.features) {
			if (PRICING.features[feature]) {
				minPrice += PRICING.features[feature];
			}
		}

		// Create a range (+20% buffer)
		const maxPrice = Math.round(minPrice * 1.2);

		const details = JSON.stringify({
			platform: validData.platform,
			design: validData.designStatus,
			features: validData.features,
			estimatedBudget: `${minPrice}-${maxPrice}`,
		});

		// Create or update Lead using Kysely
		await db
			.insertInto("lead")
			.values({
				id: crypto.randomUUID(),
				email: validData.email,
				source: "estimator",
				status: "NEW",
				details,
				currentStep: 1,
				updatedAt: new Date(),
			})
			.onConflict((oc) =>
				oc.column("email").doUpdateSet({
					source: "estimator",
					details,
					updatedAt: new Date(),
				})
			)
			.execute();

		return {
			success: true,
			minPrice,
			maxPrice,
		};
	} catch (error) {
		console.error("Estimator error:", error);
		return { success: false, error: "Failed to process estimate." };
	}
}
