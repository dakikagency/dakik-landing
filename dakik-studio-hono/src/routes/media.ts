import { Hono } from "hono";
import type { CloudflareEnv } from "../types/cloudflare";

/**
 * Serve objects from the MEDIA R2 bucket at /media/:key
 *
 * Worker-mediated so we can layer access control, image transforms, and
 * cache-busting on the same URL. Keys are everything after `/media/`,
 * including slashes for sub-folders.
 *
 * Cache strategy: 1 year, immutable. Objects in R2 are immutable once
 * uploaded (we generate unique keys per upload), so a stale cache is never
 * wrong; only stale-while-deleted is theoretically possible but harmless.
 * The old 1-hour browser TTL made Lighthouse charge every cover image as
 * re-downloadable waste on repeat views.
 */
export const mediaRoute = new Hono<{ Bindings: CloudflareEnv }>();

mediaRoute.get("/media/*", async (c) => {
	const path = c.req.path;
	const key = path.replace(/^\/media\//, "");

	if (!key) {
		return c.notFound();
	}

	const object = await c.env.MEDIA.get(key);

	if (!object) {
		return c.notFound();
	}

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set("etag", object.httpEtag);
	headers.set("Cache-Control", "public, max-age=31536000, immutable");

	return new Response(object.body, { headers });
});
