import type { MiddlewareHandler } from "hono";

export const cors: MiddlewareHandler = async (c, next) => {
	await next();

	c.res.headers.set("Access-Control-Allow-Origin", "*");
	c.res.headers.set(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, DELETE, OPTIONS"
	);
	c.res.headers.set(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization"
	);
};
