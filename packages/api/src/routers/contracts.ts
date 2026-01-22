import { db } from "@collab/db";
import { TRPCError } from "@trpc/server";
import { sql } from "kysely";
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

			let query = db
				.selectFrom("contract as c")
				.innerJoin("customer as cu", "c.customerId", "cu.id")
				.innerJoin("user as u", "cu.userId", "u.id")
				.select([
					"c.id",
					"c.title",
					"c.fileUrl",
					"c.status",
					"c.signedAt",
					"c.createdAt",
					"c.updatedAt",
					"cu.id as customer_id",
					"cu.companyName as customer_companyName",
					"u.id as user_id",
					"u.name as user_name",
					"u.email as user_email",
				]);

			if (search) {
				query = query.where(
					sql<boolean>`("c"."title" ILIKE ${`%${search}%`} OR "u"."name" ILIKE ${`%${search}%`} OR "cu"."companyName" ILIKE ${`%${search}%`})`
				);
			}

			if (status) {
				query = query.where("c.status", "=", status);
			}

			if (customerId) {
				query = query.where("c.customerId", "=", customerId);
			}

			if (cursor) {
				const cursorRow = await db
					.selectFrom("contract")
					.select(["createdAt"])
					.where("id", "=", cursor)
					.executeTakeFirst();

				if (cursorRow?.createdAt) {
					query = query.where((eb) =>
						eb.or([
							eb("c.createdAt", "<", cursorRow.createdAt),
							eb.and([
								eb("c.createdAt", "=", cursorRow.createdAt),
								eb("c.id", "<", cursor),
							]),
						])
					);
				}
			}

			const rows = await query
				.orderBy("c.createdAt", "desc")
				.orderBy("c.id", "desc")
				.limit(limit)
				.execute();

			return rows.map((row) => ({
				id: row.id,
				title: row.title,
				fileUrl: row.fileUrl,
				status: row.status,
				signedAt: row.signedAt,
				createdAt: row.createdAt,
				updatedAt: row.updatedAt,
				customer: {
					id: row.customer_id,
					companyName: row.customer_companyName,
					user: {
						id: row.user_id,
						name: row.user_name,
						email: row.user_email,
					},
				},
			}));
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
			const customer = await db
				.selectFrom("customer")
				.select(["id"])
				.where("id", "=", customerId)
				.executeTakeFirst();

			if (!customer) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Customer not found",
				});
			}

			const contract = await db
				.insertInto("contract")
				.values({
					id: crypto.randomUUID(),
					title,
					customerId,
					fileUrl,
					status: "DRAFT",
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returningAll()
				.executeTakeFirstOrThrow();

			const customerRow = await db
				.selectFrom("customer as cu")
				.innerJoin("user as u", "cu.userId", "u.id")
				.select([
					"cu.id as customer_id",
					"cu.companyName as customer_companyName",
					"u.id as user_id",
					"u.name as user_name",
					"u.email as user_email",
				])
				.where("cu.id", "=", customerId)
				.executeTakeFirstOrThrow();

			return {
				id: contract.id,
				title: contract.title,
				fileUrl: contract.fileUrl,
				status: contract.status,
				createdAt: contract.createdAt,
				customer: {
					id: customerRow.customer_id,
					companyName: customerRow.customer_companyName,
					user: {
						id: customerRow.user_id,
						name: customerRow.user_name,
						email: customerRow.user_email,
					},
				},
			};
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

			const existingContract = await db
				.selectFrom("contract")
				.selectAll()
				.where("id", "=", id)
				.executeTakeFirst();

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

			const contract = await db
				.updateTable("contract")
				.set(updateData)
				.where("id", "=", id)
				.returningAll()
				.executeTakeFirstOrThrow();

			return contract;
		}),

	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const { id } = input;

			const existingContract = await db
				.selectFrom("contract")
				.select(["id"])
				.where("id", "=", id)
				.executeTakeFirst();

			if (!existingContract) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Contract not found",
				});
			}

			await db.deleteFrom("contract").where("id", "=", id).execute();

			return { success: true };
		}),

	send: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const { id } = input;

			const existingContract = await db
				.selectFrom("contract as c")
				.innerJoin("customer as cu", "c.customerId", "cu.id")
				.innerJoin("user as u", "cu.userId", "u.id")
				.select([
					"c.id",
					"c.status",
					"u.name as user_name",
					"u.email as user_email",
				])
				.where("c.id", "=", id)
				.executeTakeFirst();

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
			const contract = await db
				.updateTable("contract")
				.set({ status: "SENT" })
				.where("id", "=", id)
				.returning(["id", "title", "status", "customerId"])
				.executeTakeFirstOrThrow();

			return {
				id: contract.id,
				title: contract.title,
				status: contract.status,
				customer: {
					user: {
						name: existingContract.user_name,
						email: existingContract.user_email,
					},
				},
			};
		}),

	getById: adminProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const { id } = input;

			const contract = await db
				.selectFrom("contract as c")
				.innerJoin("customer as cu", "c.customerId", "cu.id")
				.innerJoin("user as u", "cu.userId", "u.id")
				.select([
					"c.id",
					"c.title",
					"c.fileUrl",
					"c.status",
					"c.signedAt",
					"c.createdAt",
					"c.updatedAt",
					"cu.id as customer_id",
					"cu.companyName as customer_companyName",
					"u.id as user_id",
					"u.name as user_name",
					"u.email as user_email",
				])
				.where("c.id", "=", id)
				.executeTakeFirst();

			if (!contract) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Contract not found",
				});
			}

			return {
				id: contract.id,
				title: contract.title,
				fileUrl: contract.fileUrl,
				status: contract.status,
				signedAt: contract.signedAt,
				createdAt: contract.createdAt,
				updatedAt: contract.updatedAt,
				customer: {
					id: contract.customer_id,
					companyName: contract.customer_companyName,
					user: {
						id: contract.user_id,
						name: contract.user_name,
						email: contract.user_email,
					},
				},
			};
		}),
});

export type ContractsRouter = typeof contractsRouter;
