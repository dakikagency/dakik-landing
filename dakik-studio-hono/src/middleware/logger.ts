import type { MiddlewareHandler } from "hono";

// Cap attacker-controlled UA length so a giant header can't bloat a log line.
const MAX_UA_LENGTH = 256;

/**
 * Access log. Beyond the request line we emit the edge metadata Cloudflare
 * attaches to every request — client IP (cf-connecting-ip), country, ASN and
 * colo — as a structured tail. Those fields are what a security review needs to
 * attribute traffic, correlate a scan to one source, and rate-by-IP; the raw
 * request line alone can't answer "who". `request.cf` is undefined under
 * `wrangler dev`, so every field is optional.
 */
export const logger: MiddlewareHandler = async (c, next) => {
	const start = Date.now();
	const method = c.req.method;
	const path = c.req.path;

	await next();

	const duration = Date.now() - start;
	const status = c.res.status;

	const cf = (c.req.raw as unknown as { cf?: IncomingRequestCfProperties }).cf;
	const ua = c.req.header("user-agent")?.slice(0, MAX_UA_LENGTH) ?? null;

	console.log(`${method} ${path} ${status} - ${duration}ms`, {
		ip: c.req.header("cf-connecting-ip") ?? null,
		country: cf?.country ?? null,
		asn: cf?.asn ?? null,
		colo: cf?.colo ?? null,
		host: c.req.header("host") ?? null,
		referer: c.req.header("referer") ?? null,
		ua,
	});
};
