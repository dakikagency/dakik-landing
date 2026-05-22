import { Hono } from "hono";
import { dbMiddleware } from "../../middleware/db";
import { createAdminRouter } from "./admin";
import { createAuthHandler } from "./auth";
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
import type { CloudflareEnv } from "../../types/cloudflare";
import type { Auth } from "../../lib/auth";

/**
 * API router for /api/*.
 *
 * Note: created once at module load and mounted via app.route("/api", ...).
 * Env arrives per-request via c.env (Workers pass it through fetch's second
 * arg), which is why the auth handler is built lazily on first request — it
 * needs env to construct, but env isn't available at module-load time.
 *
 * dbMiddleware is mounted INSIDE this router so c.get("db") is available to
 * every handler. (Mounting it outside on app would set it on the outer
 * context only.)
 */
export function createApiRouter() {
	const api = new Hono<{ Bindings: CloudflareEnv }>();

	api.use("*", dbMiddleware);

	let cachedAuth: Auth | undefined;
	api.on(["POST", "GET"], "/auth/*", (c) => {
		if (!cachedAuth) {
			cachedAuth = createAuthHandler(c.env).auth;
		}
		return cachedAuth.handler(c.req.raw);
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
