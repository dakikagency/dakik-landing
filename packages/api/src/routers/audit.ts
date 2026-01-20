import prisma, { Prisma } from "@collab/db";
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

			// Base query parts
			const conditions: Prisma.Sql[] = [];

			if (search) {
				conditions.push(
					Prisma.sql`("action" ILIKE ${`%${search}%`} OR "entity" ILIKE ${`%${search}%`} OR u.name ILIKE ${`%${search}%`} OR u.email ILIKE ${`%${search}%`})`
				);
			}

			if (action) {
				conditions.push(Prisma.sql`"action" = ${action}`);
			}

			if (entity) {
				conditions.push(Prisma.sql`"entity" = ${entity}`);
			}

			if (userId) {
				conditions.push(Prisma.sql`"userId" = ${userId}`);
			}

			if (dateFrom) {
				conditions.push(Prisma.sql`l."createdAt" >= ${dateFrom}`);
			}

			if (dateTo) {
				conditions.push(Prisma.sql`l."createdAt" <= ${dateTo}`);
			}

			if (cursor) {
				// Cursor-based pagination with raw SQL is tricky without a sequential ID or guaranteed unique sort.
				// For simple implementation, we'll assume we can filter by ID < cursor (if sorting by ID desc)
				// or createdAt < cursorTime.
				// Since we sort by createdAt desc, we'd need the createdAt of the cursor.
				// To keep it simple given the limitations, we might skip cursor for raw query or implement offset.
				// Let's rely on createdAt + ID for cursor if possible, but that requires fetching the cursor record first.
				// Fallback: Using offset (skip) is inefficient but safer here without full cursor implementation.
				// BUT `input` has `cursor` as string (ID).
				// We'll ignore cursor for raw query safety and just use limit/offset if we could, but inputs are designed for cursor.
				// Let's implement keyset pagination: WHERE (createdAt, id) < (cursorCreatedAt, cursorId)
				// requires fetching cursor row first.

				const cursorRow = await prisma.$queryRaw<
					[{ createdAt: Date }]
				>`SELECT "createdAt" FROM "audit_log" WHERE id = ${cursor} LIMIT 1`;
				if (cursorRow?.[0]) {
					const cursorDate = cursorRow[0].createdAt;
					conditions.push(
						Prisma.sql`(l."createdAt", l.id) < (${cursorDate}, ${cursor})`
					);
				}
			}

			const whereClause =
				conditions.length > 0
					? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
					: Prisma.empty;

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

			const rows = await prisma.$queryRaw<AuditLogRow[]>`
				SELECT 
					l.*,
					u.id as "user_id",
					u.name as "user_name",
					u.email as "user_email",
					u.image as "user_image"
				FROM "audit_log" l
				LEFT JOIN "user" u ON l."userId" = u.id
				${whereClause}
				ORDER BY l."createdAt" DESC, l.id DESC
				LIMIT ${take}
			`;

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
