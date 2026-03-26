import { z } from "zod";

const envSchema = z.object({
	// Database
	DATABASE_URL: z.string().min(1),
	DIRECT_URL: z.string().min(1).optional(),

	// Auth
	BETTER_AUTH_SECRET: z.string().min(32),
	BETTER_AUTH_URL: z.string().url(),
	CORS_ORIGIN: z.string().url(),

	// Google OAuth
	GOOGLE_CLIENT_ID: z.string().optional().default(""),
	GOOGLE_CLIENT_SECRET: z.string().optional().default(""),

	// Email (Resend)
	RESEND_API_KEY: z.string().optional().default(""),
	MAIL_FROM: z.string().optional().default(""),

	// Cloudinary
	CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
	CLOUDINARY_API_KEY: z.string().optional().default(""),
	CLOUDINARY_API_SECRET: z.string().optional().default(""),

	// Stripe
	STRIPE_SECRET_KEY: z.string().optional().default(""),
	STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),

	// Google Calendar
	GOOGLE_CALENDAR_CLIENT_ID: z.string().optional().default(""),
	GOOGLE_CALENDAR_CLIENT_SECRET: z.string().optional().default(""),
	GOOGLE_CALENDAR_REFRESH_TOKEN: z.string().optional().default(""),
	GOOGLE_CALENDAR_ID: z.string().optional().default(""),

	// Environment
	ENVIRONMENT: z
		.enum(["development", "production", "preview"])
		.default("development"),
});

// Type for validated env vars
export type EnvVars = z.infer<typeof envSchema>;

// Validate and parse environment
export function parseEnv(env: Record<string, unknown>): EnvVars {
	return envSchema.parse(env);
}
