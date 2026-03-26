import { db } from "@collab/db";
import { env } from "@collab/env/server";
import { TRPCError } from "@trpc/server";
import { Resend } from "resend";
import { z } from "zod";

import { protectedProcedure, router } from "../index";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
	if (ctx.session.user.role !== "ADMIN") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Admin access required",
		});
	}
	return next({ ctx });
});

function isEmailConfigured(): boolean {
	return Boolean(env.RESEND_API_KEY && env.MAIL_FROM);
}

async function sendEmail(params: {
	to: string[];
	subject: string;
	body: string;
	replyTo?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
	if (!(isEmailConfigured() && resend)) {
		if (env.NODE_ENV === "development") {
			console.log("[Email Mock] Would send email:", {
				to: params.to,
				subject: params.subject,
				bodyPreview: params.body.substring(0, 100),
			});
			return {
				success: true,
				messageId: `mock_${Date.now()}`,
			};
		}
		return {
			success: false,
			error:
				"Email is not configured. Set RESEND_API_KEY and MAIL_FROM environment variables.",
		};
	}

	try {
		const { data, error } = await resend.emails.send({
			from: env.MAIL_FROM,
			to: params.to,
			subject: params.subject,
			html: params.body,
			replyTo: params.replyTo,
		});

		if (error) {
			console.error("[Email] Failed to send email:", error.message);
			return {
				success: false,
				error: error.message,
			};
		}

		return {
			success: true,
			messageId: data?.id,
		};
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		console.error("[Email] Failed to send email:", errorMessage);
		return {
			success: false,
			error: errorMessage,
		};
	}
}

export const emailRouter = router({
	getConfig: adminProcedure.query(() => {
		return {
			configured: isEmailConfigured(),
			userEmail: isEmailConfigured() ? env.MAIL_FROM : null,
		};
	}),

	send: adminProcedure
		.input(
			z.object({
				to: z.array(z.string().email()).min(1),
				subject: z.string().min(1).max(200),
				body: z.string().min(1).max(50_000),
				replyTo: z.string().email().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { to, subject, body, replyTo } = input;
			const userId = ctx.session.user.id;

			const result = await sendEmail({ to, subject, body, replyTo });

			const emailLog = await db
				.insertInto("email_log")
				.values({
					id: crypto.randomUUID(),
					userId,
					to,
					subject,
					body,
					status: result.success ? "SENT" : "FAILED",
					sentAt: new Date(),
				})
				.returning(["id"])
				.executeTakeFirstOrThrow();

			if (!result.success) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: result.error ?? "Failed to send email",
				});
			}

			return {
				success: true,
				emailLogId: emailLog.id,
				messageId: result.messageId,
			};
		}),

	getHistory: adminProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).optional().default(50),
				cursor: z.string().optional(),
				status: z.enum(["SENT", "FAILED", "BOUNCED"]).optional(),
			})
		)
		.query(async ({ input }) => {
			const { limit, cursor, status } = input;

			let query = db
				.selectFrom("email_log as e")
				.leftJoin("user as u", "e.userId", "u.id")
				.select([
					"e.id",
					"e.to",
					"e.subject",
					"e.body",
					"e.status",
					"e.sentAt",
					"u.id as user_id",
					"u.name as user_name",
					"u.email as user_email",
				]);

			if (status) {
				query = query.where(
					"e.status",
					"=",
					status as "SENT" | "FAILED" | "BOUNCED"
				);
			}

			if (cursor) {
				const cursorRow = await db
					.selectFrom("email_log")
					.select(["sentAt"])
					.where("id", "=", cursor)
					.executeTakeFirst();

				if (cursorRow?.sentAt) {
					query = query.where((eb) =>
						eb.or([
							eb("e.sentAt", "<", cursorRow.sentAt),
							eb.and([
								eb("e.sentAt", "=", cursorRow.sentAt),
								eb("e.id", "<", cursor),
							]),
						])
					);
				}
			}

			const rows = await query
				.orderBy("e.sentAt", "desc")
				.orderBy("e.id", "desc")
				.limit(limit + 1)
				.execute();

			const emails = rows.map((row) => ({
				id: row.id,
				to: row.to,
				subject: row.subject,
				body: row.body,
				status: row.status,
				sentAt: row.sentAt,
				user: row.user_id
					? {
							id: row.user_id,
							name: row.user_name,
							email: row.user_email,
						}
					: null,
			}));

			let nextCursor: string | undefined;
			if (emails.length > limit) {
				const nextItem = emails.pop();
				nextCursor = nextItem?.id;
			}

			return {
				emails,
				nextCursor,
			};
		}),

	getById: adminProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const email = await db
				.selectFrom("email_log as e")
				.leftJoin("user as u", "e.userId", "u.id")
				.select([
					"e.id",
					"e.to",
					"e.subject",
					"e.body",
					"e.status",
					"e.sentAt",
					"u.id as user_id",
					"u.name as user_name",
					"u.email as user_email",
				])
				.where("e.id", "=", input.id)
				.executeTakeFirst();

			if (!email) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Email not found",
				});
			}

			return {
				id: email.id,
				to: email.to,
				subject: email.subject,
				body: email.body,
				status: email.status,
				sentAt: email.sentAt,
				user: email.user_id
					? {
							id: email.user_id,
							name: email.user_name,
							email: email.user_email,
						}
					: null,
			};
		}),
});

export type EmailRouter = typeof emailRouter;
