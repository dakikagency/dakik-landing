import prisma from "@collab/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../index";

// Admin-only procedure that checks for ADMIN role
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
	if (ctx.session.user.role !== "ADMIN") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Admin access required",
		});
	}
	return next({ ctx });
});

export const contractsRouter = router({
	list: adminProcedure
		.input(
			z.object({
				search: z.string().optional(),
				status: z.string().optional(),
				customerId: z.string().optional(),
				limit: z.number().min(1).max(100).optional().default(50),
				cursor: z.string().optional(),
			})
		)
		.query(async ({ input }) => {
			const { search, status, customerId, limit, cursor } = input;

			const contracts = await prisma.contract.findMany({
				where: {
					AND: [
						search
							? {
									OR: [
										{ title: { contains: search, mode: "insensitive" } },
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
									],
								}
							: {},
						status
							? {
									status: status as
										| "DRAFT"
										| "SENT"
										| "VIEWED"
										| "SIGNED"
										| "EXPIRED",
								}
							: {},
						customerId ? { customerId } : {},
					],
				},
				take: limit,
				skip: cursor ? 1 : 0,
				cursor: cursor ? { id: cursor } : undefined,
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					title: true,
					fileUrl: true,
					status: true,
					signedAt: true,
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
				},
			});

			return contracts;
		}),

	create: adminProcedure
		.input(
			z.object({
				title: z.string().min(1, "Title is required"),
				customerId: z.string().min(1, "Customer is required"),
				fileUrl: z.string().url("Invalid file URL"),
			})
		)
		.mutation(async ({ input }) => {
			const { title, customerId, fileUrl } = input;

			// Verify customer exists
			const customer = await prisma.customer.findUnique({
				where: { id: customerId },
			});

			if (!customer) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Customer not found",
				});
			}

			const contract = await prisma.contract.create({
				data: {
					title,
					customerId,
					fileUrl,
					status: "DRAFT",
				},
				select: {
					id: true,
					title: true,
					fileUrl: true,
					status: true,
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
				},
			});

			return contract;
		}),

	update: adminProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().min(1).optional(),
				fileUrl: z.string().url().optional(),
				status: z
					.enum(["DRAFT", "SENT", "VIEWED", "SIGNED", "EXPIRED"])
					.optional(),
			})
		)
		.mutation(async ({ input }) => {
			const { id, ...data } = input;

			const existingContract = await prisma.contract.findUnique({
				where: { id },
			});

			if (!existingContract) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Contract not found",
				});
			}

			// If updating to SIGNED status, set signedAt
			const updateData: Record<string, unknown> = { ...data };
			if (data.status === "SIGNED" && !existingContract.signedAt) {
				updateData.signedAt = new Date();
			}

			const contract = await prisma.contract.update({
				where: { id },
				data: updateData,
			});

			return contract;
		}),

	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const { id } = input;

			const existingContract = await prisma.contract.findUnique({
				where: { id },
			});

			if (!existingContract) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Contract not found",
				});
			}

			await prisma.contract.delete({
				where: { id },
			});

			return { success: true };
		}),

	send: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const { id } = input;

			const existingContract = await prisma.contract.findUnique({
				where: { id },
				include: {
					customer: {
						include: {
							user: true,
						},
					},
				},
			});

			if (!existingContract) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Contract not found",
				});
			}

			if (existingContract.status !== "DRAFT") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Only draft contracts can be sent",
				});
			}

			// Update status to SENT
			// In a real implementation, you would also send an email notification here
			const contract = await prisma.contract.update({
				where: { id },
				data: { status: "SENT" },
				select: {
					id: true,
					title: true,
					status: true,
					customer: {
						select: {
							user: {
								select: {
									name: true,
									email: true,
								},
							},
						},
					},
				},
			});

			return contract;
		}),

	getById: adminProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const { id } = input;

			const contract = await prisma.contract.findUnique({
				where: { id },
				select: {
					id: true,
					title: true,
					fileUrl: true,
					status: true,
					signedAt: true,
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
});

export type ContractsRouter = typeof contractsRouter;
