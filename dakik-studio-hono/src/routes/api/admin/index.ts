import { Hono } from "hono";
import { requireAdmin } from "../../../middleware/require-admin";
import { createAdminAutomationsRouter } from "./automations";
import { createAdminBlogRouter } from "./blog";
import { createAdminComponentsRouter } from "./components";
import { createAdminIconsRouter } from "./icons";

/**
 * Admin-only API namespace.
 *
 * Every route under this router is guarded by requireAdmin, which returns
 * 401 / 403 before any handler runs. Handlers can safely read c.get("user")
 * to get the calling admin's id/email.
 *
 * Outside this namespace, the older /api/* routes (customers, leads, etc.)
 * are not yet guarded — that's a known follow-up. See recovery plan.
 */
export function createAdminRouter() {
	const admin = new Hono();

	admin.use("*", requireAdmin);

	admin.get("/me", (c) => {
		const user = c.get("user");
		return c.json({ user });
	});

	admin.route("/blog", createAdminBlogRouter());
	admin.route("/automations", createAdminAutomationsRouter());
	admin.route("/components", createAdminComponentsRouter());
	admin.route("/icons", createAdminIconsRouter());

	return admin;
}
