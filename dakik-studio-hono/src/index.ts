import { Hono } from "hono";
import { cors } from "./middleware/cors";
import { dbMiddleware } from "./middleware/db";
import { errorHandler } from "./middleware/error-handler";
import { logger } from "./middleware/logger";
import { createApiRouter } from "./routes/api";
import { healthRoute } from "./routes/health";
import { mediaRoute } from "./routes/media";
import { seoRoute } from "./routes/seo";
import type { CloudflareEnv } from "./types/cloudflare";

const app = new Hono();

app.use("*", cors);
app.use("*", logger);
app.onError(errorHandler);

app.route("/health", healthRoute);

app.use("/api/*", dbMiddleware);

let apiRouter: ReturnType<typeof createApiRouter> | undefined;

app.all("/api/*", (c) => {
	if (!apiRouter) {
		apiRouter = createApiRouter(c.env as CloudflareEnv);
	}
	const url = new URL(c.req.url);
	url.pathname = url.pathname.slice(4);
	const req = new Request(url, c.req.raw);
	return apiRouter.fetch(req);
});

app.route("/", mediaRoute);
app.route("/", seoRoute);

export default app;
