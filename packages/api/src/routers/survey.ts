import { db } from "@collab/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../index";

const projectTypeSchema = z.enum([
	"AI_AUTOMATION",
	"BRAND_IDENTITY",
	"WEB_MOBILE",
	"FULL_PRODUCT",
]);

const budgetSchema = z.enum([
	"RANGE_5K_10K",
	"RANGE_10K_25K",
	"RANGE_25K_50K",
	"RANGE_50K_PLUS",
]);

const submitInputSchema = z.object({
	questionAnswers: z.record(
		z.string(),
		z.union([z.string(), z.array(z.string())])
	), // Dynamic answers
	projectType: projectTypeSchema.optional(), // Keep for backward compatibility
	budget: budgetSchema.optional(), // Keep for backward compatibility
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	details: z.string().optional(),
});

const checkEmailInputSchema = z.object({
	email: z.string().email("Invalid email address"),
});

const updateProgressInputSchema = z.object({
	leadId: z.string(),
	currentStep: z.number(),
	surveyData: z
		.object({
			projectType: z
				.enum(["AI_AUTOMATION", "BRAND_IDENTITY", "WEB_MOBILE", "FULL_PRODUCT"])
				.optional(),
			budget: z
				.enum([
					"RANGE_5K_10K",
					"RANGE_10K_25K",
					"RANGE_25K_50K",
					"RANGE_50K_PLUS",
				])
				.optional(),
		})
		.optional(),
});

export const surveyRouter = router({
	submit: publicProcedure
		.input(submitInputSchema)
		.mutation(async ({ input }) => {
			const existingLead = await db
				.selectFrom("lead")
				.select(["id"])
				.where("email", "=", input.email)
				.executeTakeFirst();

			if (existingLead) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "A lead with this email already exists",
					cause: "EMAIL_EXISTS",
				});
			}

			// Use questionAnswers or fall back to legacy projectType/budget
			const surveyData = {
				questionAnswers: input.questionAnswers,
				// Legacy fields for backward compatibility
				projectType: input.projectType,
				budget: input.budget,
			};

			const lead = await db
				.insertInto("lead")
				.values({
					id: crypto.randomUUID(),
					email: input.email,
					name: input.name,
					projectType: input.projectType ?? undefined,
					budget: input.budget ?? undefined,
					details: input.details,
					surveyProgress: surveyData,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning(["id"])
				.executeTakeFirstOrThrow();

			// TODO: Implement webhook service
			// webhookService.dispatch("lead.created", {
			// 	leadId: lead.id,
			// 	email: lead.email,
			// 	name: lead.name,
			// 	projectType: lead.projectType,
			// 	budget: lead.budget,
			// 	createdAt: lead.createdAt,
			// });

			return {
				success: true as const,
				leadId: lead.id,
			};
		}),

	checkEmail: publicProcedure
		.input(checkEmailInputSchema)
		.query(async ({ input }) => {
			const existingLead = await db
				.selectFrom("lead")
				.select(["id"])
				.where("email", "=", input.email)
				.executeTakeFirst();

			return {
				exists: existingLead !== null,
			};
		}),

	updateProgress: publicProcedure
		.input(updateProgressInputSchema)
		.mutation(async ({ input }) => {
			const lead = await db
				.updateTable("lead")
				.set({
					currentStep: input.currentStep,
					surveyProgress: input.surveyData,
				})
				.where("id", "=", input.leadId)
				.returning(["id"])
				.executeTakeFirstOrThrow();

			return {
				success: true as const,
				leadId: lead.id,
			};
		}),
});
