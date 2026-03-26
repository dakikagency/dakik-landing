import { Hono } from "hono";
import { cors } from "./middleware/cors";
import { errorHandler } from "./middleware/error-handler";
import { logger } from "./middleware/logger";
import { router } from "./routes";

const app = new Hono();

app.use("*", cors);
app.use("*", logger);
app.onError(errorHandler);

app.route("/", router);

app.get("/", (c) => {
	return c.json({
		message: "Dakik Studio API",
		version: "0.0.1",
	});
});

export default app;
