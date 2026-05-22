import { Hono } from "hono";
import type { CloudflareEnv } from "../types/cloudflare";

/**
 * Serve objects from the MEDIA R2 bucket at /media/:key
 *
 * Worker-mediated so we can layer access control, image transforms, and
 * cache-busting on the same URL. Keys are everything after `/media/`,
 * including slashes for sub-folders.
 *
 * Cache strategy: 1 hour at the browser, 24 hours at the edge. Objects in
 * R2 are immutable once uploaded (we generate unique keys per upload), so
 * a stale cache is never wrong; only stale-while-deleted is theoretically
 * possible but harmless.
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
	headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");

	return new Response(object.body, { headers });
});
