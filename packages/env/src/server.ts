import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createEnv } from "@t3-oss/env-core";
import { config } from "dotenv";
import { z } from "zod";

// Get the directory of this file (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Find and load .env from the monorepo root
function findMonorepoRoot(): string {
	// First, try walking up from this file's location (most reliable)
	// packages/env/src/server.ts -> packages/env/src -> packages/env -> packages -> root
	const fromFileLocation = resolve(__dirname, "../../..");
	if (existsSync(join(fromFileLocation, "turbo.json"))) {
		return fromFileLocation;
	}

	// Second, try walking up from cwd
	let currentDir = process.cwd();
	const maxDepth = 10;
	let depth = 0;

	while (depth < maxDepth) {
		const turboPath = join(currentDir, "turbo.json");

		// Check if we found the monorepo root (has turbo.json)
		if (existsSync(turboPath)) {
			return currentDir;
		}

		// Move up one directory
		const parentDir = resolve(currentDir, "..");
		if (parentDir === currentDir) {
			// Reached filesystem root
			break;
		}
		currentDir = parentDir;
		depth++;
	}

	// Fallback to current working directory
	return process.cwd();
}

const monorepoRoot = findMonorepoRoot();
const envPath = join(monorepoRoot, ".env");

// Load .env file if it exists (won't exist on Vercel - they inject env vars directly)
if (existsSync(envPath)) {
	config({ path: envPath });
}

if (process.env.NODE_ENV === "development") {
	console.log(`[ENV] Monorepo root: ${monorepoRoot}`);
	console.log(`[ENV] Loading from: ${envPath}`);
	console.log(`[ENV] DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
}

// Skip validation during build time on Vercel/CI
// Vercel injects env vars into process.env, but validation during static generation
// can cause issues. The app will validate at runtime when it actually needs the vars.
const skipValidation = !!process.env.VERCEL || !!process.env.CI;

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		CORS_ORIGIN: z.url(),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		// Cloudinary configuration (optional)
		CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
		CLOUDINARY_API_KEY: z.string().optional().default(""),
		CLOUDINARY_API_SECRET: z.string().optional().default(""),
		// Blog integration API key (optional)
		BLOG_INTEGRATION_API_KEY: z.string().optional(),
		// Google Auth configuration
		GOOGLE_CLIENT_ID: z.string().optional().default(""),
		GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
		// Google Calendar configuration (optional)
		GOOGLE_CALENDAR_CLIENT_ID: z.string().optional().default(""),
		GOOGLE_CALENDAR_CLIENT_SECRET: z.string().optional().default(""),
		GOOGLE_CALENDAR_REFRESH_TOKEN: z.string().optional().default(""),
		GOOGLE_CALENDAR_ID: z.string().optional().default(""),
		// SMTP configuration (optional)
		SMTP_HOST: z.string().optional().default(""),
		SMTP_PORT: z.coerce.number().optional().default(587),
		SMTP_SECURE: z.coerce.boolean().optional().default(false),
		SMTP_USER: z.string().optional().default(""),
		SMTP_PASS: z.string().optional().default(""),
		MAIL_FROM: z.string().optional().default(""),

		// Stripe configuration
		STRIPE_SECRET_KEY: z.string().optional().default(""),
		STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: false,
	skipValidation,
});
