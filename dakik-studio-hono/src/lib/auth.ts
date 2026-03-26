import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { Pool } from "pg";
import type { EnvVars } from "./env";

const ADMIN_EMAILS = ["erdeniz@dakik.co.uk"];

export function createAuth(env: EnvVars) {
	const pool = new Pool({
		connectionString: env.DATABASE_URL,
		max: 1,
	});
	const adapter = new PrismaPg(pool);

	return betterAuth({
		database: {
			db: adapter,
			type: "postgres",
		},
		baseURL: env.BETTER_AUTH_URL,
		trustedOrigins: [env.CORS_ORIGIN],
		advanced: {
			cookiePrefix: "dakik-auth",
			useSecureCookies: env.ENVIRONMENT === "production",
		},
		emailAndPassword: {
			enabled: true,
		},
		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			},
		},
		user: {
			additionalFields: {
				role: {
					type: "string",
					required: false,
					defaultValue: "CUSTOMER",
					input: false,
				},
			},
		},
		databaseHooks: {
			user: {
				create: {
					before: async (user) => {
						if (ADMIN_EMAILS.includes(user.email.toLowerCase())) {
							return { data: { ...user, role: "ADMIN" } };
						}
						return { data: user };
					},
				},
			},
		},
	});
}

export type Auth = ReturnType<typeof createAuth>;
