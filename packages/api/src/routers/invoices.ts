import { db } from "@collab/db";
import { TRPCError } from "@trpc/server";
import { sql } from "kysely";
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

			let query = db
				.selectFrom("invoice as i")
				.innerJoin("customer as cu", "i.customerId", "cu.id")
				.innerJoin("user as u", "cu.userId", "u.id")
				.leftJoin("project as p", "i.projectId", "p.id")
				.select([
					"i.id",
					"i.invoiceDate",
					"i.dueDate",
					"i.amount",
					"i.description",
					"i.status",
					"i.fileUrl",
					"i.createdAt",
					"cu.id as customer_id",
					"cu.companyName as customer_companyName",
					"u.id as user_id",
					"u.name as user_name",
					"u.email as user_email",
					"p.id as project_id",
					"p.title as project_title",
				]);

			if (search) {
				query = query.where(
					sql<boolean>`("u"."name" ILIKE ${`%${search}%`} OR "cu"."companyName" ILIKE ${`%${search}%`} OR "p"."title" ILIKE ${`%${search}%`} OR "i"."description" ILIKE ${`%${search}%`})`
				);
			}

			if (status) {
				query = query.where("i.status", "=", status);
			}

			if (customerId) {
				query = query.where("i.customerId", "=", customerId);
			}

			if (projectId) {
				query = query.where("i.projectId", "=", projectId);
			}

			if (dateFrom) {
				query = query.where("i.invoiceDate", ">=", new Date(dateFrom));
			}

			if (dateTo) {
				query = query.where("i.invoiceDate", "<=", new Date(dateTo));
			}

			if (cursor) {
				const cursorRow = await db
					.selectFrom("invoice")
					.select(["invoiceDate"])
					.where("id", "=", cursor)
					.executeTakeFirst();

				if (cursorRow?.invoiceDate) {
					query = query.where((eb) =>
						eb.or([
							eb("i.invoiceDate", "<", cursorRow.invoiceDate),
							eb.and([
								eb("i.invoiceDate", "=", cursorRow.invoiceDate),
								eb("i.id", "<", cursor),
							]),
						])
					);
				}
			}

			const rows = await query
				.orderBy("i.invoiceDate", "desc")
				.orderBy("i.id", "desc")
				.limit(limit)
				.execute();

			return rows.map((row) => ({
				id: row.id,
				invoiceDate: row.invoiceDate,
				dueDate: row.dueDate,
				amount: row.amount,
				description: row.description,
				status: row.status,
				fileUrl: row.fileUrl,
				createdAt: row.createdAt,
				customer: {
					id: row.customer_id,
					companyName: row.customer_companyName,
					user: {
						id: row.user_id,
						name: row.user_name,
						email: row.user_email,
					},
				},
				project: row.project_id
					? {
							id: row.project_id,
							title: row.project_title,
						}
					: null,
			}));
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

			if (projectId) {
				const project = await db
					.selectFrom("project")
					.select(["id"])
					.where("id", "=", projectId)
					.where("customerId", "=", customerId)
					.executeTakeFirst();

				if (!project) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Project not found or does not belong to this customer",
					});
				}
			}

			const invoice = await db
				.insertInto("invoice")
				.values({
					id: crypto.randomUUID(),
					customerId,
					projectId,
					invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
					dueDate: dueDate ? new Date(dueDate) : null,
					amount,
					description,
					fileUrl,
					status,
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

			const projectRow = projectId
				? await db
						.selectFrom("project")
						.select(["id", "title"])
						.where("id", "=", projectId)
						.executeTakeFirst()
				: null;

			return {
				id: invoice.id,
				invoiceDate: invoice.invoiceDate,
				dueDate: invoice.dueDate,
				amount: invoice.amount,
				description: invoice.description,
				status: invoice.status,
				fileUrl: invoice.fileUrl,
				createdAt: invoice.createdAt,
				customer: {
					id: customerRow.customer_id,
					companyName: customerRow.customer_companyName,
					user: {
						id: customerRow.user_id,
						name: customerRow.user_name,
						email: customerRow.user_email,
					},
				},
				project: projectRow
					? { id: projectRow.id, title: projectRow.title }
					: null,
			};
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

			const existingInvoice = await db
				.selectFrom("invoice")
				.selectAll()
				.where("id", "=", id)
				.executeTakeFirst();

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
				const project = await db
					.selectFrom("project")
					.select(["id"])
					.where("id", "=", data.projectId)
					.where("customerId", "=", existingInvoice.customerId)
					.executeTakeFirst();

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

			const invoice = await db
				.updateTable("invoice")
				.set(updateData)
				.where("id", "=", id)
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
				.where("cu.id", "=", invoice.customerId)
				.executeTakeFirstOrThrow();

			const projectRow = invoice.projectId
				? await db
						.selectFrom("project")
						.select(["id", "title"])
						.where("id", "=", invoice.projectId)
						.executeTakeFirst()
				: null;

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
				updatedAt: invoice.updatedAt,
				customer: {
					id: customerRow.customer_id,
					companyName: customerRow.customer_companyName,
					user: {
						id: customerRow.user_id,
						name: customerRow.user_name,
						email: customerRow.user_email,
					},
				},
				project: projectRow
					? { id: projectRow.id, title: projectRow.title }
					: null,
			};
		}),

	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const { id } = input;

			const existingInvoice = await db
				.selectFrom("invoice")
				.select(["id"])
				.where("id", "=", id)
				.executeTakeFirst();

			if (!existingInvoice) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invoice not found",
				});
			}

			await db.deleteFrom("invoice").where("id", "=", id).execute();

			return { success: true };
		}),

	getById: adminProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const { id } = input;

			const invoice = await db
				.selectFrom("invoice as i")
				.innerJoin("customer as cu", "i.customerId", "cu.id")
				.innerJoin("user as u", "cu.userId", "u.id")
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
					"i.updatedAt",
					"cu.id as customer_id",
					"cu.companyName as customer_companyName",
					"u.id as user_id",
					"u.name as user_name",
					"u.email as user_email",
					"p.id as project_id",
					"p.title as project_title",
				])
				.where("i.id", "=", id)
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
				updatedAt: invoice.updatedAt,
				customer: {
					id: invoice.customer_id,
					companyName: invoice.customer_companyName,
					user: {
						id: invoice.user_id,
						name: invoice.user_name,
						email: invoice.user_email,
					},
				},
				project: invoice.project_id
					? { id: invoice.project_id, title: invoice.project_title }
					: null,
			};
		}),

	getProjectsByCustomer: adminProcedure
		.input(z.object({ customerId: z.string() }))
		.query(async ({ input }) => {
			const { customerId } = input;

			return await db
				.selectFrom("project")
				.select(["id", "title"])
				.where("customerId", "=", customerId)
				.orderBy("createdAt", "desc")
				.execute();
		}),
});

export type InvoicesRouter = typeof invoicesRouter;
