import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getDb } from "./db";
import type { EnvVars } from "./env";

const ADMIN_EMAILS = ["erdeniz@dakik.co.uk"];

/**
 * Wire better-auth to Prisma via better-auth's own prismaAdapter.
 *
 * Previously this passed a raw `@prisma/adapter-pg` (PrismaPg) directly to
 * better-auth's `database` option — which made better-auth fall back to its
 * Kysely-style query interface and crash on the first DB write with
 * `TypeError: db.insertInto is not a function`. The fix is to use
 * better-auth's prismaAdapter, which wraps a PrismaClient and translates
 * better-auth's internal calls to Prisma model methods (db.user.create,
 * db.session.findFirst, etc.).
 */
export function createAuth(env: EnvVars) {
	const db = getDb(env);

	return betterAuth({
		database: prismaAdapter(db, {
			provider: "postgresql",
		}),
		baseURL: env.BETTER_AUTH_URL,
		basePath: "/auth",
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
