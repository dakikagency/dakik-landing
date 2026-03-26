import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const isCloudflareWorker =
	typeof globalThis !== "undefined" &&
	typeof (globalThis as Record<string, unknown>).caches !== "undefined" &&
	typeof process === "undefined";

const isBuildTime =
	typeof process !== "undefined" && process.env.NEXT_BUILD === "true";

const skipValidation =
	!!process.env.VERCEL ||
	!!process.env.CI ||
	!!process.env.CLOUDFLARE_WORKERS ||
	isCloudflareWorker ||
	isBuildTime;

if (
	typeof process !== "undefined" &&
	!isCloudflareWorker &&
	!process.env.VERCEL &&
	!process.env.CI
) {
	const { existsSync } = require("node:fs");
	const { dirname, join, resolve } = require("node:path");
	const { fileURLToPath } = require("node:url");
	const { config } = require("dotenv");

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);

	const fromFileLocation = resolve(__dirname, "../../..");
	let monorepoRoot: string;
	if (existsSync(join(fromFileLocation, "turbo.json"))) {
		monorepoRoot = fromFileLocation;
	} else {
		let currentDir = process.cwd();
		const maxDepth = 10;
		let depth = 0;
		monorepoRoot = process.cwd();
		while (depth < maxDepth) {
			const turboPath = join(currentDir, "turbo.json");
			if (existsSync(turboPath)) {
				monorepoRoot = currentDir;
				break;
			}
			const parentDir = resolve(currentDir, "..");
			if (parentDir === currentDir) {
				break;
			}
			currentDir = parentDir;
			depth++;
		}
	}

	const envPath = join(monorepoRoot as string, ".env");
	if (existsSync(envPath)) {
		config({ path: envPath });
	}

	if (process.env.NODE_ENV === "development") {
		console.log(`[ENV] Monorepo root: ${monorepoRoot}`);
		console.log(`[ENV] Loading from: ${envPath}`);
		console.log(`[ENV] DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
	}
}

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		CORS_ORIGIN: z.url(),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
		CLOUDINARY_API_KEY: z.string().optional().default(""),
		CLOUDINARY_API_SECRET: z.string().optional().default(""),
		BLOG_INTEGRATION_API_KEY: z.string().optional(),
		GOOGLE_CLIENT_ID: z.string().optional().default(""),
		GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
		GOOGLE_CALENDAR_CLIENT_ID: z.string().optional().default(""),
		GOOGLE_CALENDAR_CLIENT_SECRET: z.string().optional().default(""),
		GOOGLE_CALENDAR_REFRESH_TOKEN: z.string().optional().default(""),
		GOOGLE_CALENDAR_ID: z.string().optional().default(""),
		SMTP_HOST: z.string().optional().default(""),
		SMTP_PORT: z.coerce.number().optional().default(587),
		SMTP_SECURE: z.coerce.boolean().optional().default(false),
		SMTP_USER: z.string().optional().default(""),
		SMTP_PASS: z.string().optional().default(""),
		MAIL_FROM: z.string().optional().default(""),
		STRIPE_SECRET_KEY: z.string().optional().default(""),
		STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
		RESEND_API_KEY: z.string().optional().default(""),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: false,
	skipValidation,
});
