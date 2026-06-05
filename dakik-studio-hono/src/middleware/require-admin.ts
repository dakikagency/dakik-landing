import type { MiddlewareHandler } from "hono";
import { createAuth } from "../lib/auth";
import type { CloudflareEnv } from "../types/cloudflare";

/**
 * Augment Hono's context with the authenticated admin user.
 * Downstream handlers read this via c.get("user").
 */
declare module "hono" {
	interface ContextVariableMap {
		user: {
			id: string;
			email: string;
			name?: string | null;
			role: string;
		};
	}
}

/** Constant-time string compare so token validation can't be timed. */
function safeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) {
		diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return diff === 0;
}

/**
 * Require an authenticated admin. Two accepted credentials:
 *
 * 1. `Authorization: Bearer <BLOG_INGEST_TOKEN>` — a static machine token that
 *    acts as an admin service account for automated callers (the RSS cron
 *    hitting POST /api/admin/blog). Checked first so non-browser clients work.
 *    Only honoured when the secret is configured. The service user's id is
 *    "service:ingest" so handlers can special-case it.
 * 2. A better-auth cookie session whose user has role === "ADMIN" (the admin UI).
 *
 * - 401 if there's no valid credential
 * - 403 if the session is valid but the user is not an admin
 * - Otherwise sets c.set("user", ...) and continues
 *
 * This is the security source of truth. The frontend RequireAdmin wrapper
 * is only a UX guard — never rely on it for authorization.
 */
export const requireAdmin: MiddlewareHandler = async (c, next) => {
	const env = c.env as CloudflareEnv;

	// Machine token path (browsers never send Authorization: Bearer here, so
	// this can't collide with the admin UI's cookie auth).
	const authz = c.req.header("Authorization");
	if (authz?.startsWith("Bearer ")) {
		const token = authz.slice(7).trim();
		if (env.BLOG_INGEST_TOKEN && safeEqual(token, env.BLOG_INGEST_TOKEN)) {
			c.set("user", {
				id: "service:ingest",
				email: "ingest@dakik.co.uk",
				name: "Ingest Service",
				role: "ADMIN",
			});
			await next();
			return;
		}
		return c.json({ error: "Invalid token" }, 401);
	}

	// Cookie session path (admin UI).
	const auth = createAuth(env);

	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	if (!session?.user) {
		return c.json({ error: "Authentication required" }, 401);
	}

	const role = (session.user as { role?: string }).role;
	if (role !== "ADMIN") {
		return c.json({ error: "Admin access required" }, 403);
	}

	c.set("user", {
		id: session.user.id,
		email: session.user.email,
		name: session.user.name,
		role,
	});

	await next();
};
