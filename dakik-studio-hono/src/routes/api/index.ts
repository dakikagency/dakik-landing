import { Hono } from "hono";
import { createAuth } from "../../lib/auth";
import { dbMiddleware } from "../../middleware/db";
import type { CloudflareEnv } from "../../types/cloudflare";
import { createAdminRouter } from "./admin";
import { createAutomationsRouter } from "./automations";
import { createAvailabilityRouter } from "./availability";
import { createBlogRouter } from "./blog";
import { createComponentsRouter } from "./components";
import { createCustomerRouter } from "./customers";
import { createIconsRouter } from "./icons";
import { createInvoiceRouter } from "./invoices";
import { createLeadRouter } from "./leads";
import { createMeetingRouter } from "./meetings";
import { createProjectRouter } from "./projects";
import { createSurveyQuestionsRouter } from "./survey-questions";
import { createStripeWebhookRouter } from "./webhooks/stripe";

/**
 * API router for /api/*.
 *
 * Mounted via app.route("/api", ...). Env arrives per-request via c.env;
 * downstream handlers should construct env-dependent things (auth, db) at
 * call time, NOT cache them at module level — Cloudflare Workers binds
 * I/O objects to the request that opened them and refuses cross-request
 * reuse with "Cannot perform I/O on behalf of a different request."
 *
 * dbMiddleware is mounted INSIDE this router so c.get("db") is available to
 * every handler. (Mounting it outside on app would set it on the outer
 * context only.)
 */
export function createApiRouter() {
	const api = new Hono<{ Bindings: CloudflareEnv }>();

	api.use("*", dbMiddleware);

	// Build the better-auth instance per request. Caching it at module scope
	// would also cache the PrismaClient inside, whose underlying sockets are
	// bound to whichever request opened them — the next request would crash
	// with the cross-request I/O error.
	api.on(["POST", "GET"], "/auth/*", (c) => {
		const auth = createAuth(c.env);
		return auth.handler(c.req.raw);
	});

	api.route("/admin", createAdminRouter());

	api.route("/customers", createCustomerRouter());
	api.route("/invoices", createInvoiceRouter());
	api.route("/leads", createLeadRouter());
	api.route("/projects", createProjectRouter());
	api.route("/meetings", createMeetingRouter());
	api.route("/availability", createAvailabilityRouter());
	api.route("/survey-questions", createSurveyQuestionsRouter());
	api.route("/blog", createBlogRouter());
	api.route("/automations", createAutomationsRouter());
	api.route("/components", createComponentsRouter());
	api.route("/icons", createIconsRouter());
	api.route("/webhooks", createStripeWebhookRouter());

	api.get("/", (c) => {
		return c.json({
			message: "API base route",
		});
	});

	return api;
}
