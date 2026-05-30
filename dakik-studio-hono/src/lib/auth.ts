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
		// Match the actual route mount: api router is mounted at /api in
		// src/index.ts, and the auth handler lives at /auth/* inside it,
		// so the full path is /api/auth/*. better-auth's default is
		// /api/auth — we set it explicitly here so URL construction
		// (especially OAuth redirect_uri) matches what Google sees.
		basePath: "/api/auth",
		trustedOrigins: [env.CORS_ORIGIN],
		logger: {
			level: "debug",
			log(level, message, ...args) {
				console.log(`[better-auth ${level}] ${message}`, ...args);
			},
		},
		advanced: {
			cookiePrefix: "dakik-auth",
			useSecureCookies: env.ENVIRONMENT === "production",
		},
		session: {
			/**
			 * Sign + serialize the session into a cookie so subsequent reads
			 * within maxAge don't hit Postgres. Every page navigation triggers
			 * a getSession() check, and on Neon's free tier each of those was
			 * costing compute time. With the cookie cache, only one in every
			 * maxAge-window's worth of checks reaches the DB.
			 *
			 * 5 minutes is the sweet spot: long enough to absorb most repeat
			 * checks during a single browsing session, short enough that if we
			 * revoke a session or change a user's role server-side, the
			 * client picks it up within ~5 minutes without a hard reload.
			 */
			cookieCache: {
				enabled: true,
				maxAge: 5 * 60,
			},
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
