import { Hono } from "hono";
import type { EnvVars } from "../../lib/env";
import { createAuthHandler } from "./auth";

export function createApiRouter(env: EnvVars) {
	const api = new Hono();

	const { handler: authHandler } = createAuthHandler(env);

	api.on(["POST", "GET"], "/auth/*", (c) => {
		return authHandler(c);
	});

	api.get("/", (c) => {
		return c.json({
			message: "API base route",
		});
	});

	return api;
}
