import prisma from "@collab/db";
import { env } from "@collab/env/server";
import { TRPCError } from "@trpc/server";
import nodemailer from "nodemailer";
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

/**
 * Check if Email is configured
 */
function isEmailConfigured(): boolean {
	return Boolean(
		env.SMTP_HOST &&
			env.SMTP_PORT &&
			env.SMTP_USER &&
			env.SMTP_PASS &&
			env.MAIL_FROM
	);
}

/**
 * Send an email using nodemailer
 */
async function sendEmail(params: {
	to: string[];
	subject: string;
	body: string;
	replyTo?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
	// If Email is not configured, return mock success in development
	if (!isEmailConfigured()) {
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
			error: "Email is not configured",
		};
	}

	try {
		const transporter = nodemailer.createTransport({
			host: env.SMTP_HOST,
			port: env.SMTP_PORT,
			secure: env.SMTP_SECURE,
			auth: {
				user: env.SMTP_USER,
				pass: env.SMTP_PASS,
			},
		});

		const info = await transporter.sendMail({
			from: env.MAIL_FROM,
			to: params.to.join(", "),
			replyTo: params.replyTo,
			subject: params.subject,
			text: params.body.replace(/<[^>]+>/g, ""), // Plain text fallback
			html: params.body,
		});

		return {
			success: true,
			messageId: info.messageId,
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
	// Get Email configuration status
	getConfig: adminProcedure.query(() => {
		return {
			configured: isEmailConfigured(),
			userEmail: isEmailConfigured() ? env.MAIL_FROM : null,
		};
	}),

	// Send an email
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

			// Send the email
			const result = await sendEmail({ to, subject, body, replyTo });

			// Log the email attempt
			const emailLog = await prisma.emailLog.create({
				data: {
					userId,
					to,
					subject,
					body,
					status: result.success ? "SENT" : "FAILED",
				},
			});

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

	// Get email history
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

			const emails = await prisma.emailLog.findMany({
				where: status ? { status } : undefined,
				take: limit + 1,
				skip: cursor ? 1 : 0,
				cursor: cursor ? { id: cursor } : undefined,
				orderBy: { sentAt: "desc" },
				select: {
					id: true,
					to: true,
					subject: true,
					body: true,
					status: true,
					sentAt: true,
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
			});

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

	// Get a single email by ID
	getById: adminProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const email = await prisma.emailLog.findUnique({
				where: { id: input.id },
				select: {
					id: true,
					to: true,
					subject: true,
					body: true,
					status: true,
					sentAt: true,
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
			});

			if (!email) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Email not found",
				});
			}

			return email;
		}),
});

export type EmailRouter = typeof emailRouter;
