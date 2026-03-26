import { Hono } from "hono";
import { cors } from "./middleware/cors";
import { errorHandler } from "./middleware/error-handler";
import { logger } from "./middleware/logger";
import { createAuthHandler } from "./routes/api/auth";
import { healthRoute } from "./routes/health";
import type { CloudflareEnv } from "./types/cloudflare";

const app = new Hono();

app.use("*", cors);
app.use("*", logger);
app.onError(errorHandler);

app.route("/health", healthRoute);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
	const env = c.env as CloudflareEnv;
	const { handler } = createAuthHandler(env);
	return handler(c);
});

app.get("/", (c) => {
	return c.json({
		message: "Dakik Studio API",
		version: "0.0.1",
	});
});

export default app;
