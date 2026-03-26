import type { MiddlewareHandler } from "hono";
import { getDb } from "../lib/db";
import type { CloudflareEnv } from "../types/cloudflare";

export const dbMiddleware: MiddlewareHandler = async (c, next) => {
	const db = getDb(c.env as CloudflareEnv);
	c.set("db", db);
	await next();
};
