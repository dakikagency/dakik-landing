import prisma from "@collab/db";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../index";

const surveyQuestionTypeSchema = z.enum(["PROJECT_TYPE", "BUDGET"]);
const surveyInputTypeSchema = z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE"]);

// Question schemas
const createSurveyQuestionSchema = z.object({
	key: z
		.string()
		.min(1, "Key is required")
		.regex(
			/^[A-Z0-9_]+$/,
			"Key must be uppercase alphanumeric with underscores"
		),
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	inputType: surveyInputTypeSchema.default("SINGLE_CHOICE"),
	order: z.number().int().min(0).default(0),
	isActive: z.boolean().default(true),
});

const updateSurveyQuestionSchema = z.object({
	id: z.string(),
	title: z.string().min(1, "Title is required").optional(),
	description: z.string().optional().nullable(),
	inputType: surveyInputTypeSchema.optional(),
	order: z.number().int().min(0).optional(),
	isActive: z.boolean().optional(),
});

const createSurveyOptionSchema = z
	.object({
		questionId: z.string().optional(), // New: reference to SurveyQuestion
		questionType: surveyQuestionTypeSchema.optional(), // Deprecated: kept for backward compatibility
		label: z.string().min(1, "Label is required"),
		value: z.string().min(1, "Value is required"),
		description: z.string().optional(),
		icon: z.string().optional(),
		order: z.number().int().min(0).default(0),
		isActive: z.boolean().default(true),
	})
	.refine(
		(data) => data.questionId || data.questionType,
		"Either questionId or questionType must be provided"
	);

const updateSurveyOptionSchema = z.object({
	id: z.string(),
	label: z.string().min(1, "Label is required").optional(),
	description: z.string().optional().nullable(),
	icon: z.string().optional().nullable(),
	order: z.number().int().min(0).optional(),
	isActive: z.boolean().optional(),
});

const reorderSurveyOptionsSchema = z
	.object({
		questionId: z.string().optional(),
		questionType: surveyQuestionTypeSchema.optional(),
		orderedIds: z.array(z.string()),
	})
	.refine(
		(data) => data.questionId || data.questionType,
		"Either questionId or questionType must be provided"
	);

export const surveyOptionsRouter = router({
	// =============================================================================
	// Question Management (Admin)
	// =============================================================================

	// Admin: Get all questions (including inactive)
	getAllQuestions: protectedProcedure.query(async () => {
		const questions = await prisma.surveyQuestion.findMany({
			include: {
				options: {
					orderBy: { order: "asc" },
				},
			},
			orderBy: { order: "asc" },
		});

		return questions;
	}),

	// Public: Get all active questions with their active options
	getActiveQuestions: publicProcedure.query(async () => {
		const questions = await prisma.surveyQuestion.findMany({
			where: { isActive: true },
			include: {
				options: {
					where: { isActive: true },
					orderBy: { order: "asc" },
				},
			},
			orderBy: { order: "asc" },
		});

		return questions;
	}),

	// Admin: Create new question
	createQuestion: protectedProcedure
		.input(createSurveyQuestionSchema)
		.mutation(async ({ input }) => {
			// Get the highest order to auto-assign order
			const maxOrder = await prisma.surveyQuestion.findFirst({
				orderBy: { order: "desc" },
				select: { order: true },
			});

			const order = input.order ?? (maxOrder ? maxOrder.order + 1 : 0);

			const question = await prisma.surveyQuestion.create({
				data: {
					key: input.key,
					title: input.title,
					description: input.description,
					inputType: input.inputType,
					order,
					isActive: input.isActive,
				},
				include: {
					options: true,
				},
			});

			return question;
		}),

	// Admin: Update question
	updateQuestion: protectedProcedure
		.input(updateSurveyQuestionSchema)
		.mutation(async ({ input }) => {
			const { id, ...data } = input;

			const question = await prisma.surveyQuestion.update({
				where: { id },
				data,
				include: {
					options: true,
				},
			});

			return question;
		}),

	// Admin: Delete question
	deleteQuestion: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			await prisma.surveyQuestion.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),

	// Admin: Toggle question active status
	toggleQuestionActive: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const question = await prisma.surveyQuestion.findUnique({
				where: { id: input.id },
			});

			if (!question) {
				throw new Error("Question not found");
			}

			const updated = await prisma.surveyQuestion.update({
				where: { id: input.id },
				data: { isActive: !question.isActive },
			});

			return updated;
		}),

	// Admin: Reorder questions
	reorderQuestions: protectedProcedure
		.input(z.object({ orderedIds: z.array(z.string()) }))
		.mutation(async ({ input }) => {
			const { orderedIds } = input;

			// Update order for each question
			await Promise.all(
				orderedIds.map((id, index) =>
					prisma.surveyQuestion.update({
						where: { id },
						data: { order: index },
					})
				)
			);

			return { success: true };
		}),

	// =============================================================================
	// Option Management
	// =============================================================================

	// Public: Get active options for a question type (used by survey - backward compat)
	getByType: publicProcedure
		.input(z.object({ questionType: surveyQuestionTypeSchema }))
		.query(async ({ input }) => {
			const options = await prisma.surveyOption.findMany({
				where: {
					questionType: input.questionType,
					isActive: true,
				},
				orderBy: { order: "asc" },
			});

			return options;
		}),

	// Public: Get active options for a question by questionId
	getByQuestionId: publicProcedure
		.input(z.object({ questionId: z.string() }))
		.query(async ({ input }) => {
			const options = await prisma.surveyOption.findMany({
				where: {
					questionId: input.questionId,
					isActive: true,
				},
				orderBy: { order: "asc" },
			});

			return options;
		}),

	// Public: Get all active options grouped by question type
	getAllActive: publicProcedure.query(async () => {
		const options = await prisma.surveyOption.findMany({
			where: { isActive: true },
			orderBy: [{ questionType: "asc" }, { order: "asc" }],
		});

		const grouped = {
			PROJECT_TYPE: options.filter((o) => o.questionType === "PROJECT_TYPE"),
			BUDGET: options.filter((o) => o.questionType === "BUDGET"),
		};

		return grouped;
	}),

	// Admin: Get all options (including inactive)
	getAll: protectedProcedure.query(async () => {
		const options = await prisma.surveyOption.findMany({
			orderBy: [{ questionType: "asc" }, { order: "asc" }],
		});

		return options;
	}),

	// Admin: Get options by question type (including inactive)
	getByTypeAdmin: protectedProcedure
		.input(z.object({ questionType: surveyQuestionTypeSchema }))
		.query(async ({ input }) => {
			const options = await prisma.surveyOption.findMany({
				where: { questionType: input.questionType },
				orderBy: { order: "asc" },
			});

			return options;
		}),

	// Admin: Create new option
	create: protectedProcedure
		.input(createSurveyOptionSchema)
		.mutation(async ({ input }) => {
			// Get the highest order for this question to auto-assign order
			const whereClause = input.questionId
				? { questionId: input.questionId }
				: { questionType: input.questionType };

			const maxOrder = await prisma.surveyOption.findFirst({
				where: whereClause,
				orderBy: { order: "desc" },
				select: { order: true },
			});

			const order = input.order ?? (maxOrder ? maxOrder.order + 1 : 0);

			const option = await prisma.surveyOption.create({
				data: {
					questionId: input.questionId,
					questionType: input.questionType,
					label: input.label,
					value: input.value,
					description: input.description,
					icon: input.icon,
					order,
					isActive: input.isActive,
				},
			});

			return option;
		}),

	// Admin: Update option
	update: protectedProcedure
		.input(updateSurveyOptionSchema)
		.mutation(async ({ input }) => {
			const { id, ...data } = input;

			const option = await prisma.surveyOption.update({
				where: { id },
				data,
			});

			return option;
		}),

	// Admin: Delete option
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			await prisma.surveyOption.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),

	// Admin: Toggle active status
	toggleActive: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const option = await prisma.surveyOption.findUnique({
				where: { id: input.id },
			});

			if (!option) {
				throw new Error("Option not found");
			}

			const updated = await prisma.surveyOption.update({
				where: { id: input.id },
				data: { isActive: !option.isActive },
			});

			return updated;
		}),

	// Admin: Reorder options
	reorder: protectedProcedure
		.input(reorderSurveyOptionsSchema)
		.mutation(async ({ input }) => {
			const { orderedIds } = input;

			// Update order for each option
			await Promise.all(
				orderedIds.map((id, index) =>
					prisma.surveyOption.update({
						where: { id },
						data: { order: index },
					})
				)
			);

			return { success: true };
		}),

	// Admin: Seed default options (utility endpoint)
	seedDefaults: protectedProcedure.mutation(async () => {
		const projectTypeDefaults = [
			{
				value: "AI_AUTOMATION",
				label: "AI Automation",
				description:
					"Intelligent workflows, chatbots, and machine learning solutions",
				icon: "Bot",
				order: 0,
			},
			{
				value: "BRAND_IDENTITY",
				label: "Brand Identity",
				description: "Logo design, visual systems, and brand strategy",
				icon: "Palette",
				order: 1,
			},
			{
				value: "WEB_MOBILE",
				label: "Web/Mobile Development",
				description: "Responsive websites and native mobile applications",
				icon: "Smartphone",
				order: 2,
			},
			{
				value: "FULL_PRODUCT",
				label: "Full Product Build",
				description: "End-to-end product development from concept to launch",
				icon: "Layers",
				order: 3,
			},
		];

		const budgetDefaults = [
			{
				value: "RANGE_5K_10K",
				label: "$5k - $10k",
				description: "Small projects and MVPs",
				icon: "DollarSign",
				order: 0,
			},
			{
				value: "RANGE_10K_25K",
				label: "$10k - $25k",
				description: "Medium-sized applications",
				icon: "DollarSign",
				order: 1,
			},
			{
				value: "RANGE_25K_50K",
				label: "$25k - $50k",
				description: "Complex systems and platforms",
				icon: "DollarSign",
				order: 2,
			},
			{
				value: "RANGE_50K_PLUS",
				label: "$50k+",
				description: "Enterprise-grade solutions",
				icon: "DollarSign",
				order: 3,
			},
		];

		// Upsert project type options
		for (const option of projectTypeDefaults) {
			await prisma.surveyOption.upsert({
				where: {
					questionType_value: {
						questionType: "PROJECT_TYPE",
						value: option.value,
					},
				},
				create: {
					questionType: "PROJECT_TYPE",
					...option,
				},
				update: {
					label: option.label,
					description: option.description,
					icon: option.icon,
					order: option.order,
				},
			});
		}

		// Upsert budget options
		for (const option of budgetDefaults) {
			await prisma.surveyOption.upsert({
				where: {
					questionType_value: {
						questionType: "BUDGET",
						value: option.value,
					},
				},
				create: {
					questionType: "BUDGET",
					...option,
				},
				update: {
					label: option.label,
					description: option.description,
					icon: option.icon,
					order: option.order,
				},
			});
		}

		return { success: true, message: "Default options seeded successfully" };
	}),
});
