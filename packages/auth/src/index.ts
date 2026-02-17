import { db } from "@collab/db/kysely";
import { env } from "@collab/env/server";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

// Admin email addresses that should automatically receive ADMIN role
const ADMIN_EMAILS = ["erdeniz@dakik.co.uk"];

export const auth = betterAuth({
	database: {
		db,
		type: "postgres",
	},
	baseURL: env.BETTER_AUTH_URL,
	trustedOrigins: [env.CORS_ORIGIN],
	advanced: {
		cookiePrefix: "better-auth",
		useSecureCookies: false, // Set to true in production with HTTPS
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
				// biome-ignore lint/suspicious/useAwait: better-auth requires async hook even without await
				before: async (user, _context) => {
					// Auto-assign ADMIN role to specific email addresses
					if (ADMIN_EMAILS.includes(user.email.toLowerCase())) {
						return {
							data: {
								...user,
								role: "ADMIN",
							},
						};
					}
					return { data: user };
				},
			},
		},
	},
	plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
