import { Hono } from "hono";
import type { EnvVars } from "../../lib/env";
import { createAuthHandler } from "./auth";
import { createCustomerRouter } from "./customers";
import { createInvoiceRouter } from "./invoices";
import { createLeadRouter } from "./leads";
import { createProjectRouter } from "./projects";

export function createApiRouter(env: EnvVars) {
	const api = new Hono();

	const { handler: authHandler } = createAuthHandler(env);

	api.on(["POST", "GET"], "/auth/*", (c) => {
		return authHandler(c);
	});

	api.route("/customers", createCustomerRouter());
	api.route("/invoices", createInvoiceRouter());
	api.route("/leads", createLeadRouter());
	api.route("/projects", createProjectRouter());

	api.get("/", (c) => {
		return c.json({
			message: "API base route",
		});
	});

	return api;
}
