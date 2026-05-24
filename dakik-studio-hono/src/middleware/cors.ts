import type { MiddlewareHandler } from "hono";

/**
 * Echo the request's Origin back as the allowed origin (instead of `*`)
 * and allow credentials. `*` with credentials is rejected by browsers,
 * which can quietly break cookie-based auth flows (state cookies on
 * OAuth callback, session cookies on cross-tab requests).
 *
 * Same-origin requests don't hit CORS at all, but the response headers
 * are still sent — keep them clean.
 */
export const cors: MiddlewareHandler = async (c, next) => {
	await next();

	const origin = c.req.header("Origin");
	if (origin) {
		c.res.headers.set("Access-Control-Allow-Origin", origin);
		c.res.headers.set("Vary", "Origin");
		c.res.headers.set("Access-Control-Allow-Credentials", "true");
	}
	c.res.headers.set(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, DELETE, OPTIONS",
	);
	c.res.headers.set(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization",
	);
};
