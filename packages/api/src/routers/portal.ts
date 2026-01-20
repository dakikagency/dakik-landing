import { createHash } from "node:crypto";

import prisma from "@collab/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../index";
import { stripe } from "../stripe";

// Generate a hash of signature data for verification purposes
function generateSignatureHash(signatureData: string): string {
	const hash = createHash("sha256");
	hash.update(signatureData);
	return hash.digest("hex");
}

// Customer-only procedure that ensures the user has a customer record
const customerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
	const customer = await prisma.customer.findUnique({
		where: { userId: ctx.session.user.id },
	});

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
			prisma.project.count({
				where: {
					customerId: ctx.customer.id,
					status: { in: ["PENDING", "IN_PROGRESS"] },
				},
			}),

			// Upcoming meetings count (within next week)
			prisma.meeting.count({
				where: {
					customerId: ctx.customer.id,
					status: "SCHEDULED",
					scheduledAt: {
						gte: now,
						lte: oneWeekFromNow,
					},
				},
			}),

			// Pending contracts count
			prisma.contract.count({
				where: {
					customerId: ctx.customer.id,
					status: { in: ["SENT", "VIEWED"] },
				},
			}),

			// Recent projects (for activity feed)
			prisma.project.findMany({
				where: { customerId: ctx.customer.id },
				take: 5,
				orderBy: { updatedAt: "desc" },
				select: {
					id: true,
					title: true,
					status: true,
					progress: true,
					updatedAt: true,
					updates: {
						take: 1,
						orderBy: { createdAt: "desc" },
						select: {
							title: true,
							createdAt: true,
						},
					},
				},
			}),

			// Recent meetings
			prisma.meeting.findMany({
				where: {
					customerId: ctx.customer.id,
					scheduledAt: { gte: now },
				},
				take: 5,
				orderBy: { scheduledAt: "asc" },
				select: {
					id: true,
					title: true,
					scheduledAt: true,
					status: true,
				},
			}),

			// Recent contracts
			prisma.contract.findMany({
				where: { customerId: ctx.customer.id },
				take: 5,
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					title: true,
					status: true,
					createdAt: true,
				},
			}),
		]);

		// Build recent activity
		interface ActivityItem {
			id: string;
			type: "project" | "meeting" | "contract";
			title: string;
			description: string;
			date: Date;
		}

		const recentActivity: ActivityItem[] = [];

		for (const project of recentProjects) {
			const latestUpdate = project.updates[0];
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
			activeProjects: activeProjectsCount,
			upcomingMeetings: upcomingMeetingsCount,
			pendingContracts: pendingContractsCount,
			recentActivity: topActivity,
		};
	}),

	// Get all projects for the customer
	getProjects: customerProcedure.query(async ({ ctx }) => {
		const projects = await prisma.project.findMany({
			where: { customerId: ctx.customer.id },
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				title: true,
				description: true,
				status: true,
				progress: true,
				startDate: true,
				endDate: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return projects;
	}),

	// Get project updates for a specific project
	getProjectUpdates: customerProcedure
		.input(z.object({ projectId: z.string() }))
		.query(async ({ ctx, input }) => {
			// Verify the project belongs to this customer
			const project = await prisma.project.findFirst({
				where: {
					id: input.projectId,
					customerId: ctx.customer.id,
				},
			});

			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			const updates = await prisma.projectUpdate.findMany({
				where: { projectId: input.projectId },
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					title: true,
					content: true,
					progress: true,
					createdAt: true,
				},
			});

			return updates;
		}),

	// Get all contracts for the customer
	getContracts: customerProcedure.query(async ({ ctx }) => {
		const contracts = await prisma.contract.findMany({
			where: { customerId: ctx.customer.id },
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				title: true,
				fileUrl: true,
				status: true,
				signedAt: true,
				signerName: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return contracts;
	}),

	// Mark a contract as viewed
	markContractViewed: customerProcedure
		.input(z.object({ contractId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Verify the contract belongs to this customer
			const contract = await prisma.contract.findFirst({
				where: {
					id: input.contractId,
					customerId: ctx.customer.id,
				},
			});

			if (!contract) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Contract not found",
				});
			}

			// Only update if currently in SENT status
			if (contract.status === "SENT") {
				await prisma.contract.update({
					where: { id: input.contractId },
					data: { status: "VIEWED" },
				});
			}

			return { success: true };
		}),

	// Get a single contract by ID
	getContractById: customerProcedure
		.input(z.object({ contractId: z.string() }))
		.query(async ({ ctx, input }) => {
			const contract = await prisma.contract.findFirst({
				where: {
					id: input.contractId,
					customerId: ctx.customer.id,
				},
				select: {
					id: true,
					title: true,
					fileUrl: true,
					status: true,
					signedAt: true,
					signerName: true,
					createdAt: true,
					updatedAt: true,
				},
			});

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
			const contract = await prisma.contract.findFirst({
				where: {
					id: input.contractId,
					customerId: ctx.customer.id,
				},
			});

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
			const updatedContract = await prisma.contract.update({
				where: { id: input.contractId },
				data: {
					status: "SIGNED",
					signedAt,
					signatureData: input.signatureData,
					signerName: input.signerName,
					signatureHash,
					// Note: signerIp would typically be captured from request headers
					// For now, we'll leave it null as accessing headers in tRPC requires context setup
				},
				select: {
					id: true,
					title: true,
					status: true,
					signedAt: true,
					signerName: true,
				},
			});

			return {
				success: true,
				contract: updatedContract,
				message: `Contract "${updatedContract.title}" has been successfully signed.`,
			};
		}),

	// Get all meetings for the customer
	getMeetings: customerProcedure.query(async ({ ctx }) => {
		const meetings = await prisma.meeting.findMany({
			where: { customerId: ctx.customer.id },
			orderBy: { scheduledAt: "desc" },
			select: {
				id: true,
				title: true,
				description: true,
				status: true,
				scheduledAt: true,
				duration: true,
				meetUrl: true,
				createdAt: true,
			},
		});

		return meetings;
	}),

	// Get Q&A for all customer's projects
	getQandA: customerProcedure.query(async ({ ctx }) => {
		const qAndAs = await prisma.qAndA.findMany({
			where: {
				project: {
					customerId: ctx.customer.id,
				},
			},
			orderBy: { askedAt: "desc" },
			select: {
				id: true,
				question: true,
				answer: true,
				askedAt: true,
				answeredAt: true,
				project: {
					select: {
						id: true,
						title: true,
					},
				},
			},
		});

		return qAndAs;
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
			const project = await prisma.project.findFirst({
				where: {
					id: input.projectId,
					customerId: ctx.customer.id,
				},
			});

			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			const qAndA = await prisma.qAndA.create({
				data: {
					projectId: input.projectId,
					question: input.question,
				},
				select: {
					id: true,
					question: true,
					askedAt: true,
					project: {
						select: {
							id: true,
							title: true,
						},
					},
				},
			});

			return qAndA;
		}),

	getInvoices: customerProcedure.query(async ({ ctx }) => {
		const invoices = await prisma.invoice.findMany({
			where: { customerId: ctx.customer.id },
			orderBy: { invoiceDate: "desc" },
			select: {
				id: true,
				invoiceDate: true,
				dueDate: true,
				amount: true,
				description: true,
				status: true,
				fileUrl: true,
				paidAt: true,
				createdAt: true,
				project: {
					select: {
						id: true,
						title: true,
					},
				},
			},
		});

		return invoices;
	}),

	getInvoiceById: customerProcedure
		.input(z.object({ invoiceId: z.string() }))
		.query(async ({ ctx, input }) => {
			const invoice = await prisma.invoice.findFirst({
				where: {
					id: input.invoiceId,
					customerId: ctx.customer.id,
				},
				select: {
					id: true,
					invoiceDate: true,
					dueDate: true,
					amount: true,
					description: true,
					status: true,
					fileUrl: true,
					paidAt: true,
					createdAt: true,
					project: {
						select: {
							id: true,
							title: true,
						},
					},
				},
			});

			if (!invoice) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invoice not found",
				});
			}

			return invoice;
		}),

	createPaymentIntent: customerProcedure
		.input(z.object({ invoiceId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const invoice = await prisma.invoice.findFirst({
				where: {
					id: input.invoiceId,
					customerId: ctx.customer.id,
				},
			});

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

			await prisma.invoice.update({
				where: { id: invoice.id },
				data: { stripePaymentIntentId: paymentIntent.id },
			});

			return {
				clientSecret: paymentIntent.client_secret,
				paymentIntentId: paymentIntent.id,
			};
		}),
});

export type PortalRouter = typeof portalRouter;
