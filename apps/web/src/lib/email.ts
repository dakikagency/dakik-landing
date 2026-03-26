import { env } from "@collab/env/server";
import { Resend } from "resend";

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

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export function isEmailConfigured(): boolean {
	return Boolean(env.RESEND_API_KEY && env.MAIL_FROM);
}

export async function sendEmail(
	params: SendEmailParams
): Promise<SendEmailResult> {
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

export function getEmailConfig() {
	return {
		configured: isEmailConfigured(),
		userEmail: isEmailConfigured() ? env.MAIL_FROM : null,
	};
}
