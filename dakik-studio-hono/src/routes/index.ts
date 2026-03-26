import { Hono } from "hono";
import { healthRoute } from "./health";

export const router = new Hono();

router.route("/health", healthRoute);
