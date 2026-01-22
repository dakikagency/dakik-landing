import { db } from "@collab/db";
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

export const auditRouter = router({
	getLogs: adminProcedure
		.input(
			z.object({
				search: z.string().optional(),
				action: z.string().optional(),
				entity: z.string().optional(),
				userId: z.string().optional(),
				dateFrom: z.date().optional(),
				dateTo: z.date().optional(),
				limit: z.number().min(1).max(100).optional().default(50),
				cursor: z.string().optional(),
			})
		)
		.query(async ({ input }) => {
			const {
				search,
				action,
				entity,
				userId,
				dateFrom,
				dateTo,
				limit,
				cursor,
			} = input;

			let query = db
				.selectFrom("audit_log as l")
				.leftJoin("user as u", "l.userId", "u.id")
				.selectAll("l")
				.select([
					"u.id as user_id",
					"u.name as user_name",
					"u.email as user_email",
					"u.image as user_image",
				]);

			if (search) {
				query = query.where((eb) =>
					eb.or([
						eb("l.action", "ilike", `%${search}%`),
						eb("l.entity", "ilike", `%${search}%`),
						eb("u.name", "ilike", `%${search}%`),
						eb("u.email", "ilike", `%${search}%`),
					])
				);
			}

			if (action) {
				query = query.where("l.action", "=", action);
			}

			if (entity) {
				query = query.where("l.entity", "=", entity);
			}

			if (userId) {
				query = query.where("l.userId", "=", userId);
			}

			if (dateFrom) {
				query = query.where("l.createdAt", ">=", dateFrom);
			}

			if (dateTo) {
				query = query.where("l.createdAt", "<=", dateTo);
			}

			if (cursor) {
				const cursorRow = await db
					.selectFrom("audit_log")
					.select(["createdAt"])
					.where("id", "=", cursor)
					.executeTakeFirst();

				if (cursorRow?.createdAt) {
					const cursorDate = cursorRow.createdAt;
					query = query.where((eb) =>
						eb.or([
							eb("l.createdAt", "<", cursorDate),
							eb.and([
								eb("l.createdAt", "=", cursorDate),
								eb("l.id", "<", cursor),
							]),
						])
					);
				}
			}

			const take = limit + 1;

			interface AuditLogRow {
				id: string;
				userId: string | null;
				action: string;
				entity: string;
				entityId: string | null;
				details: unknown;
				createdAt: Date;
				user_id: string | null;
				ipAddress: string | null;
				userAgent: string | null;

				user_name: string | null;
				user_email: string | null;
				user_image: string | null;
			}

			const rows = (await query
				.orderBy("l.createdAt", "desc")
				.orderBy("l.id", "desc")
				.limit(take)
				.execute()) as AuditLogRow[];

			const logs = rows.map((row) => ({
				id: row.id,
				action: row.action,
				entity: row.entity,
				entityId: row.entityId,
				details: row.details,
				ipAddress: row.ipAddress,
				userAgent: row.userAgent,
				createdAt: row.createdAt,
				userId: row.userId,
				user: row.userId
					? {
							id: row.user_id,
							name: row.user_name,
							email: row.user_email,
							image: row.user_image,
						}
					: null,
			}));

			let nextCursor: string | undefined;
			if (logs.length > limit) {
				const nextItem = logs.pop();
				nextCursor = nextItem?.id;
			}

			return {
				items: logs,
				nextCursor,
			};
		}),
});
