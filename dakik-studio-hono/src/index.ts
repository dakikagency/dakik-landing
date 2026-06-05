import { Hono } from "hono";
import { cors } from "./middleware/cors";
import { errorHandler } from "./middleware/error-handler";
import { logger } from "./middleware/logger";
import { createApiRouter } from "./routes/api";
import { healthRoute } from "./routes/health";
import { mediaRoute } from "./routes/media";
import { createRegistryRouter } from "./routes/registry";
import { seoRoute } from "./routes/seo";
import { registerSsrRoutes } from "./routes/ssr";
import type { CloudflareEnv } from "./types/cloudflare";

const app = new Hono<{ Bindings: CloudflareEnv }>();

// Canonicalise www → apex with a 301. Runs before any other middleware
// so the redirect short-circuits CORS, logging, DB middleware, etc.
// Avoids duplicate-canonical SEO and cookie-domain edge cases.
app.use("*", async (c, next) => {
	const url = new URL(c.req.url);
	if (url.hostname === "www.dakik.co.uk") {
		url.hostname = "dakik.co.uk";
		return c.redirect(url.toString(), 301);
	}
	return next();
});

app.use("*", cors);
app.use("*", logger);
app.onError(errorHandler);

app.route("/health", healthRoute);

// Native mount: Hono strips the /api prefix and propagates env + context.
// dbMiddleware and admin guards run inside the api router, not here.
app.route("/api", createApiRouter());

app.route("/", mediaRoute);
app.route("/", seoRoute);

// Dakik Bits shadcn registry — /registry.json + /r/:name.json, served from D1.
// These paths are in wrangler.jsonc `run_worker_first` so the worker (not the
// static assets) answers them.
app.route("/", createRegistryRouter());

// SSR routes + catch-all. Registered LAST so the catch-all is the final matcher
// and `app` is in scope for internal data prefetch (app.request). Activated by
// `run_worker_first: ["/*", ...]` in wrangler.jsonc.
registerSsrRoutes(app);

export default app;
