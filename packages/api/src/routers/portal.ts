import { createHash } from "node:crypto";

import { db } from "@collab/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../index";
import { stripe } from "../stripe";

// Activity item type for recent activity feed
export interface ActivityItem {
	id: string;
	type: "project" | "meeting" | "contract";
	title: string;
	description: string;
	date: Date;
}

// Generate a hash of signature data for verification purposes
function generateSignatureHash(signatureData: string): string {
	const hash = createHash("sha256");
	hash.update(signatureData);
	return hash.digest("hex");
}

// Customer-only procedure that ensures the user has a customer record
const customerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
	const customer = await db
		.selectFrom("customer")
		.selectAll()
		.where("userId", "=", ctx.session.user.id)
		.executeTakeFirst();

	if (!customer) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Customer record not found. Please contact support.",
		});
	}

	return next({
		ctx: {
			...ctx,
			customer,
		},
	});
});

export const portalRouter = router({
	// Dashboard overview data
	getDashboardOverview: customerProcedure.query(async ({ ctx }) => {
		const now = new Date();
		const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

		const [
			activeProjectsCount,
			upcomingMeetingsCount,
			pendingContractsCount,
			recentProjects,
			recentMeetings,
			recentContracts,
		] = await Promise.all([
			// Active projects count
			db
				.selectFrom("project")
				.select((eb) => eb.fn.count("id").as("count"))
				.where("customerId", "=", ctx.customer.id)
				.where("status", "in", ["PENDING", "IN_PROGRESS"])
				.executeTakeFirst(),

			// Upcoming meetings count (within next week)
			db
				.selectFrom("meeting")
				.select((eb) => eb.fn.count("id").as("count"))
				.where("customerId", "=", ctx.customer.id)
				.where("status", "=", "SCHEDULED")
				.where("scheduledAt", ">=", now)
				.where("scheduledAt", "<=", oneWeekFromNow)
				.executeTakeFirst(),

			// Pending contracts count
			db
				.selectFrom("contract")
				.select((eb) => eb.fn.count("id").as("count"))
				.where("customerId", "=", ctx.customer.id)
				.where("status", "in", ["SENT", "VIEWED"])
				.executeTakeFirst(),

			// Recent projects (for activity feed)
			db
				.selectFrom("project")
				.select(["id", "title", "status", "progress", "updatedAt"])
				.where("customerId", "=", ctx.customer.id)
				.orderBy("updatedAt", "desc")
				.limit(5)
				.execute(),

			// Recent meetings
			db
				.selectFrom("meeting")
				.select(["id", "title", "scheduledAt", "status"])
				.where("customerId", "=", ctx.customer.id)
				.where("scheduledAt", ">=", now)
				.orderBy("scheduledAt", "asc")
				.limit(5)
				.execute(),

			// Recent contracts
			db
				.selectFrom("contract")
				.select(["id", "title", "status", "createdAt"])
				.where("customerId", "=", ctx.customer.id)
				.orderBy("createdAt", "desc")
				.limit(5)
				.execute(),
		]);

		const recentProjectIds = recentProjects.map((p) => p.id);
		const updates = recentProjectIds.length
			? await db
					.selectFrom("project_update")
					.select(["projectId", "title", "createdAt"])
					.where("projectId", "in", recentProjectIds)
					.orderBy("createdAt", "desc")
					.execute()
			: [];

		const latestUpdateByProject = new Map<
			string,
			{ title: string; createdAt: Date }
		>();
		for (const update of updates) {
			if (!latestUpdateByProject.has(update.projectId)) {
				latestUpdateByProject.set(update.projectId, {
					title: update.title,
					createdAt: update.createdAt,
				});
			}
		}

		// Build recent activity
		const recentActivity: ActivityItem[] = [];

		for (const project of recentProjects) {
			const latestUpdate = latestUpdateByProject.get(project.id);
			recentActivity.push({
				id: `project-${project.id}`,
				type: "project",
				title: project.title,
				description: latestUpdate
					? latestUpdate.title
					: `Status: ${project.status.replace(/_/g, " ")} (${project.progress}% complete)`,
				date: latestUpdate ? latestUpdate.createdAt : project.updatedAt,
			});
		}

		for (const meeting of recentMeetings) {
			recentActivity.push({
				id: `meeting-${meeting.id}`,
				type: "meeting",
				title: meeting.title,
				description: `Scheduled for ${meeting.scheduledAt.toLocaleDateString()}`,
				date: meeting.scheduledAt,
			});
		}

		for (const contract of recentContracts) {
			const statusText =
				contract.status === "SENT" || contract.status === "VIEWED"
					? "Awaiting your signature"
					: `Status: ${contract.status}`;
			recentActivity.push({
				id: `contract-${contract.id}`,
				type: "contract",
				title: contract.title,
				description: statusText,
				date: contract.createdAt,
			});
		}

		// Sort by date descending and take top 10
		recentActivity.sort((a, b) => b.date.getTime() - a.date.getTime());
		const topActivity = recentActivity.slice(0, 10);

		return {
			activeProjects: Number(activeProjectsCount?.count ?? 0),
			upcomingMeetings: Number(upcomingMeetingsCount?.count ?? 0),
			pendingContracts: Number(pendingContractsCount?.count ?? 0),
			recentActivity: topActivity,
		};
	}),

	// Get all projects for the customer
	getProjects: customerProcedure.query(async ({ ctx }) => {
		return await db
			.selectFrom("project")
			.select([
				"id",
				"title",
				"description",
				"status",
				"progress",
				"startDate",
				"endDate",
				"createdAt",
				"updatedAt",
			])
			.where("customerId", "=", ctx.customer.id)
			.orderBy("createdAt", "desc")
			.execute();
	}),

	// Get project updates for a specific project
	getProjectUpdates: customerProcedure
		.input(z.object({ projectId: z.string() }))
		.query(async ({ ctx, input }) => {
			// Verify the project belongs to this customer
			const project = await db
				.selectFrom("project")
				.select(["id"])
				.where("id", "=", input.projectId)
				.where("customerId", "=", ctx.customer.id)
				.executeTakeFirst();

			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			return db
				.selectFrom("project_update")
				.select(["id", "title", "content", "progress", "createdAt"])
				.where("projectId", "=", input.projectId)
				.orderBy("createdAt", "desc")
				.execute();
		}),

	// Get all contracts for the customer
	getContracts: customerProcedure.query(async ({ ctx }) => {
		return await db
			.selectFrom("contract")
			.select([
				"id",
				"title",
				"fileUrl",
				"status",
				"signedAt",
				"signerName",
				"createdAt",
				"updatedAt",
			])
			.where("customerId", "=", ctx.customer.id)
			.orderBy("createdAt", "desc")
			.execute();
	}),

	// Mark a contract as viewed
	markContractViewed: customerProcedure
		.input(z.object({ contractId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Verify the contract belongs to this customer
			const contract = await db
				.selectFrom("contract")
				.selectAll()
				.where("id", "=", input.contractId)
				.where("customerId", "=", ctx.customer.id)
				.executeTakeFirst();

			if (!contract) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Contract not found",
				});
			}

			// Only update if currently in SENT status
			if (contract.status === "SENT") {
				await db
					.updateTable("contract")
					.set({ status: "VIEWED" })
					.where("id", "=", input.contractId)
					.execute();
			}

			return { success: true };
		}),

	// Get a single contract by ID
	getContractById: customerProcedure
		.input(z.object({ contractId: z.string() }))
		.query(async ({ ctx, input }) => {
			const contract = await db
				.selectFrom("contract")
				.select([
					"id",
					"title",
					"fileUrl",
					"status",
					"signedAt",
					"signerName",
					"createdAt",
					"updatedAt",
				])
				.where("id", "=", input.contractId)
				.where("customerId", "=", ctx.customer.id)
				.executeTakeFirst();

			if (!contract) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Contract not found",
				});
			}

			return contract;
		}),

	// Sign a contract with e-signature
	signContract: customerProcedure
		.input(
			z.object({
				contractId: z.string(),
				signatureData: z
					.string()
					.min(1, "Signature is required")
					.refine(
						(data) => data.startsWith("data:image/png;base64,"),
						"Invalid signature format"
					),
				signerName: z
					.string()
					.min(2, "Please enter your full name")
					.max(100, "Name is too long"),
				agreedToTerms: z
					.boolean()
					.refine((val) => val === true, "You must agree to the terms"),
			})
		)
		.mutation(async ({ ctx, input }) => {
			// Verify the contract belongs to this customer
			const contract = await db
				.selectFrom("contract")
				.selectAll()
				.where("id", "=", input.contractId)
				.where("customerId", "=", ctx.customer.id)
				.executeTakeFirst();

			if (!contract) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Contract not found",
				});
			}

			// Check if contract can be signed (must be SENT or VIEWED)
			if (contract.status !== "SENT" && contract.status !== "VIEWED") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message:
						contract.status === "SIGNED"
							? "This contract has already been signed"
							: "This contract cannot be signed at this time",
				});
			}

			// Generate a simple hash of the signature data for verification
			const signatureHash = await generateSignatureHash(input.signatureData);

			// Get current timestamp for signing
			const signedAt = new Date();

			// Update contract with signature data
			const updatedContract = await db
				.updateTable("contract")
				.set({
					status: "SIGNED",
					signedAt,
					signatureData: input.signatureData,
					signerName: input.signerName,
					signatureHash,
				})
				.where("id", "=", input.contractId)
				.returning(["id", "title", "status", "signedAt", "signerName"])
				.executeTakeFirstOrThrow();

			return {
				success: true,
				contract: updatedContract,
				message: `Contract "${updatedContract.title}" has been successfully signed.`,
			};
		}),

	// Get all meetings for the customer
	getMeetings: customerProcedure.query(async ({ ctx }) => {
		return await db
			.selectFrom("meeting")
			.select([
				"id",
				"title",
				"description",
				"status",
				"scheduledAt",
				"duration",
				"meetUrl",
				"createdAt",
			])
			.where("customerId", "=", ctx.customer.id)
			.orderBy("scheduledAt", "desc")
			.execute();
	}),

	// Get Q&A for all customer's projects
	getQandA: customerProcedure.query(async ({ ctx }) => {
		const rows = await db
			.selectFrom("q_and_a as qa")
			.innerJoin("project as p", "qa.projectId", "p.id")
			.select([
				"qa.id",
				"qa.question",
				"qa.answer",
				"qa.askedAt",
				"qa.answeredAt",
				"p.id as project_id",
				"p.title as project_title",
			])
			.where("p.customerId", "=", ctx.customer.id)
			.orderBy("qa.askedAt", "desc")
			.execute();

		return rows.map((row) => ({
			id: row.id,
			question: row.question,
			answer: row.answer,
			askedAt: row.askedAt,
			answeredAt: row.answeredAt,
			project: {
				id: row.project_id,
				title: row.project_title,
			},
		}));
	}),

	// Submit a new question
	submitQuestion: customerProcedure
		.input(
			z.object({
				projectId: z.string(),
				question: z.string().min(10, "Question must be at least 10 characters"),
			})
		)
		.mutation(async ({ ctx, input }) => {
			// Verify the project belongs to this customer
			const project = await db
				.selectFrom("project")
				.select(["id", "title"])
				.where("id", "=", input.projectId)
				.where("customerId", "=", ctx.customer.id)
				.executeTakeFirst();

			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			const qAndA = await db
				.insertInto("q_and_a")
				.values({
					id: crypto.randomUUID(),
					projectId: input.projectId,
					question: input.question,
					askedAt: new Date(),
				})
				.returning(["id", "question", "askedAt", "projectId"])
				.executeTakeFirstOrThrow();

			return {
				id: qAndA.id,
				question: qAndA.question,
				askedAt: qAndA.askedAt,
				project: {
					id: project.id,
					title: project.title,
				},
			};
		}),

	getInvoices: customerProcedure.query(async ({ ctx }) => {
		const rows = await db
			.selectFrom("invoice as i")
			.leftJoin("project as p", "i.projectId", "p.id")
			.select([
				"i.id",
				"i.invoiceDate",
				"i.dueDate",
				"i.amount",
				"i.description",
				"i.status",
				"i.fileUrl",
				"i.paidAt",
				"i.createdAt",
				"p.id as project_id",
				"p.title as project_title",
			])
			.where("i.customerId", "=", ctx.customer.id)
			.orderBy("i.invoiceDate", "desc")
			.execute();

		return rows.map((row) => ({
			id: row.id,
			invoiceDate: row.invoiceDate,
			dueDate: row.dueDate,
			amount: row.amount,
			description: row.description,
			status: row.status,
			fileUrl: row.fileUrl,
			paidAt: row.paidAt,
			createdAt: row.createdAt,
			project: row.project_id
				? { id: row.project_id, title: row.project_title }
				: null,
		}));
	}),

	getInvoiceById: customerProcedure
		.input(z.object({ invoiceId: z.string() }))
		.query(async ({ ctx, input }) => {
			const invoice = await db
				.selectFrom("invoice as i")
				.leftJoin("project as p", "i.projectId", "p.id")
				.select([
					"i.id",
					"i.invoiceDate",
					"i.dueDate",
					"i.amount",
					"i.description",
					"i.status",
					"i.fileUrl",
					"i.paidAt",
					"i.createdAt",
					"p.id as project_id",
					"p.title as project_title",
				])
				.where("i.id", "=", input.invoiceId)
				.where("i.customerId", "=", ctx.customer.id)
				.executeTakeFirst();

			if (!invoice) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invoice not found",
				});
			}

			return {
				id: invoice.id,
				invoiceDate: invoice.invoiceDate,
				dueDate: invoice.dueDate,
				amount: invoice.amount,
				description: invoice.description,
				status: invoice.status,
				fileUrl: invoice.fileUrl,
				paidAt: invoice.paidAt,
				createdAt: invoice.createdAt,
				project: invoice.project_id
					? { id: invoice.project_id, title: invoice.project_title }
					: null,
			};
		}),

	createPaymentIntent: customerProcedure
		.input(z.object({ invoiceId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const invoice = await db
				.selectFrom("invoice")
				.selectAll()
				.where("id", "=", input.invoiceId)
				.where("customerId", "=", ctx.customer.id)
				.executeTakeFirst();

			if (!invoice) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invoice not found",
				});
			}

			if (invoice.status === "PAID") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invoice is already paid",
				});
			}

			if (invoice.stripePaymentIntentId) {
				const existingIntent = await stripe.paymentIntents.retrieve(
					invoice.stripePaymentIntentId
				);
				if (
					existingIntent.status !== "succeeded" &&
					existingIntent.status !== "canceled"
				) {
					return {
						clientSecret: existingIntent.client_secret,
						paymentIntentId: existingIntent.id,
					};
				}
			}

			const paymentIntent = await stripe.paymentIntents.create({
				amount: Math.round(Number(invoice.amount) * 100),
				currency: "usd",
				automatic_payment_methods: {
					enabled: true,
				},
				metadata: {
					invoiceId: invoice.id,
					customerId: ctx.customer.id,
				},
			});

			await db
				.updateTable("invoice")
				.set({ stripePaymentIntentId: paymentIntent.id })
				.where("id", "=", invoice.id)
				.execute();

			return {
				clientSecret: paymentIntent.client_secret,
				paymentIntentId: paymentIntent.id,
			};
		}),
});

export type PortalRouter = typeof portalRouter;
