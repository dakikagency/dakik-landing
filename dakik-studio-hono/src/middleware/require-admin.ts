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

/**
 * Require an authenticated user with role === "ADMIN".
 *
 * - 401 if there's no valid session
 * - 403 if the session is valid but the user is not an admin
 * - Otherwise sets c.set("user", ...) and continues
 *
 * This is the security source of truth. The frontend RequireAdmin wrapper
 * is only a UX guard — never rely on it for authorization.
 */
export const requireAdmin: MiddlewareHandler = async (c, next) => {
	const env = c.env as CloudflareEnv;
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
