import { Hono } from "hono";

export const apiRouter = new Hono();

apiRouter.get("/", (c) => {
	return c.json({
		message: "API base route",
	});
});
