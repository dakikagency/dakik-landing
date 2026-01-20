import { env } from "@collab/env/server";
import nodemailer from "nodemailer";

interface SendEmailParams {
	to: string[];
	subject: string;
	body: string;
	replyTo?: string;
}

interface SendEmailResult {
	success: boolean;
	messageId?: string;
	error?: string;
}

/**
 * Check if Email is configured
 */
export function isEmailConfigured(): boolean {
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
export async function sendEmail(
	params: SendEmailParams
): Promise<SendEmailResult> {
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

/**
 * Get Email configuration status (public info only)
 */
export function getEmailConfig() {
	return {
		configured: isEmailConfigured(),
		userEmail: isEmailConfigured() ? env.MAIL_FROM : null,
	};
}
