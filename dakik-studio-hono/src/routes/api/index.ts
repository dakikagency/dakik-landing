import { Hono } from "hono";
import type { EnvVars } from "../../lib/env";
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

export function createApiRouter(env: EnvVars) {
	const api = new Hono();

	const { handler: authHandler } = createAuthHandler(env);

	api.on(["POST", "GET"], "/auth/*", (c) => {
		return authHandler(c);
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
