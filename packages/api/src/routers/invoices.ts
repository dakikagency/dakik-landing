import prisma from "@collab/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../index";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
	if (ctx.session.user.role !== "ADMIN") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Admin access required",
		});
	}
	return next({ ctx });
});

export const invoicesRouter = router({
	list: adminProcedure
		.input(
			z.object({
				search: z.string().optional(),
				status: z.string().optional(),
				customerId: z.string().optional(),
				projectId: z.string().optional(),
				dateFrom: z.string().optional(),
				dateTo: z.string().optional(),
				limit: z.number().min(1).max(100).optional().default(50),
				cursor: z.string().optional(),
			})
		)
		.query(async ({ input }) => {
			const {
				search,
				status,
				customerId,
				projectId,
				dateFrom,
				dateTo,
				limit,
				cursor,
			} = input;

			const invoices = await prisma.invoice.findMany({
				where: {
					AND: [
						search
							? {
									OR: [
										{
											customer: {
												user: {
													name: { contains: search, mode: "insensitive" },
												},
											},
										},
										{
											customer: {
												companyName: { contains: search, mode: "insensitive" },
											},
										},
										{
											project: {
												title: { contains: search, mode: "insensitive" },
											},
										},
										{ description: { contains: search, mode: "insensitive" } },
									],
								}
							: {},
						status
							? {
									status: status as "UNPAID" | "PENDING" | "PAID" | "OVERDUE",
								}
							: {},
						customerId ? { customerId } : {},
						projectId ? { projectId } : {},
						dateFrom || dateTo
							? {
									invoiceDate: {
										gte: dateFrom ? new Date(dateFrom) : undefined,
										lte: dateTo ? new Date(dateTo) : undefined,
									},
								}
							: {},
					],
				},
				take: limit,
				skip: cursor ? 1 : 0,
				cursor: cursor ? { id: cursor } : undefined,
				orderBy: { invoiceDate: "desc" },
				select: {
					id: true,
					invoiceDate: true,
					dueDate: true,
					amount: true,
					description: true,
					status: true,
					fileUrl: true,
					createdAt: true,
					customer: {
						select: {
							id: true,
							companyName: true,
							user: {
								select: {
									id: true,
									name: true,
									email: true,
								},
							},
						},
					},
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

	create: adminProcedure
		.input(
			z.object({
				customerId: z.string().min(1, "Customer is required"),
				projectId: z.string().optional(),
				invoiceDate: z.string().optional(),
				dueDate: z.string().optional(),
				amount: z.number().positive("Amount must be positive"),
				description: z.string().optional(),
				fileUrl: z.string().url("Invalid file URL"),
				status: z
					.enum(["UNPAID", "PENDING", "PAID", "OVERDUE"])
					.optional()
					.default("UNPAID"),
			})
		)
		.mutation(async ({ input }) => {
			const {
				customerId,
				projectId,
				invoiceDate,
				dueDate,
				amount,
				description,
				fileUrl,
				status,
			} = input;

			const customer = await prisma.customer.findUnique({
				where: { id: customerId },
			});

			if (!customer) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Customer not found",
				});
			}

			if (projectId) {
				const project = await prisma.project.findFirst({
					where: { id: projectId, customerId },
				});

				if (!project) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Project not found or does not belong to this customer",
					});
				}
			}

			const invoice = await prisma.invoice.create({
				data: {
					customerId,
					projectId,
					invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
					dueDate: dueDate ? new Date(dueDate) : null,
					amount,
					description,
					fileUrl,
					status,
				},
				select: {
					id: true,
					invoiceDate: true,
					dueDate: true,
					amount: true,
					description: true,
					status: true,
					fileUrl: true,
					createdAt: true,
					customer: {
						select: {
							id: true,
							companyName: true,
							user: {
								select: {
									id: true,
									name: true,
									email: true,
								},
							},
						},
					},
					project: {
						select: {
							id: true,
							title: true,
						},
					},
				},
			});

			return invoice;
		}),

	update: adminProcedure
		.input(
			z.object({
				id: z.string(),
				projectId: z.string().optional(),
				invoiceDate: z.string().optional(),
				dueDate: z.string().optional(),
				amount: z.number().positive().optional(),
				description: z.string().optional(),
				fileUrl: z.string().url().optional(),
				status: z.enum(["UNPAID", "PENDING", "PAID", "OVERDUE"]).optional(),
			})
		)
		.mutation(async ({ input }) => {
			const { id, ...data } = input;

			const existingInvoice = await prisma.invoice.findUnique({
				where: { id },
			});

			if (!existingInvoice) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invoice not found",
				});
			}

			const updateData: Record<string, unknown> = { ...data };

			if (data.invoiceDate) {
				updateData.invoiceDate = new Date(data.invoiceDate);
			}

			if (data.dueDate) {
				updateData.dueDate = new Date(data.dueDate);
			}

			if (data.projectId) {
				const project = await prisma.project.findFirst({
					where: {
						id: data.projectId,
						customerId: existingInvoice.customerId,
					},
				});

				if (!project) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Project not found or does not belong to this customer",
					});
				}
			}

			if (data.status === "PAID" && !existingInvoice.paidAt) {
				updateData.paidAt = new Date();
			}

			if (data.status && data.status !== "PAID") {
				updateData.paidAt = null;
			}

			const invoice = await prisma.invoice.update({
				where: { id },
				data: updateData,
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
					updatedAt: true,
					customer: {
						select: {
							id: true,
							companyName: true,
							user: {
								select: {
									id: true,
									name: true,
									email: true,
								},
							},
						},
					},
					project: {
						select: {
							id: true,
							title: true,
						},
					},
				},
			});

			return invoice;
		}),

	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const { id } = input;

			const existingInvoice = await prisma.invoice.findUnique({
				where: { id },
			});

			if (!existingInvoice) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invoice not found",
				});
			}

			await prisma.invoice.delete({
				where: { id },
			});

			return { success: true };
		}),

	getById: adminProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const { id } = input;

			const invoice = await prisma.invoice.findUnique({
				where: { id },
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
					updatedAt: true,
					customer: {
						select: {
							id: true,
							companyName: true,
							user: {
								select: {
									id: true,
									name: true,
									email: true,
								},
							},
						},
					},
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

	getProjectsByCustomer: adminProcedure
		.input(z.object({ customerId: z.string() }))
		.query(async ({ input }) => {
			const { customerId } = input;

			const projects = await prisma.project.findMany({
				where: { customerId },
				select: {
					id: true,
					title: true,
				},
				orderBy: { createdAt: "desc" },
			});

			return projects;
		}),
});

export type InvoicesRouter = typeof invoicesRouter;
