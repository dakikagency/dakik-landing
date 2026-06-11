import { Hono } from "hono";
import { getDb } from "../lib/db";
import { INDEXNOW_KEY } from "../lib/indexnow";
import {
	getBaseUrl,
	SITE_DESCRIPTION,
	SITE_NAME,
	SUBDOMAIN_BASE,
	subdomainOf,
} from "../lib/seo";
import type { CloudflareEnv } from "../types/cloudflare";

export const seoRoute = new Hono<{ Bindings: CloudflareEnv }>();

// /survey is intentionally absent: the page carries a noindex meta tag, and
// listing a noindex URL in the sitemap reads as a config error in Search
// Console ("Submitted URL marked noindex").
const STATIC_SITEMAP_PATHS: Array<{
	path: string;
	priority: number;
	changefreq: "daily" | "weekly" | "monthly" | "yearly";
}> = [
	{ path: "/", priority: 1.0, changefreq: "weekly" },
	{ path: "/about", priority: 0.7, changefreq: "monthly" },
	{ path: "/blog", priority: 0.8, changefreq: "weekly" },
	{ path: "/contact", priority: 0.6, changefreq: "yearly" },
	{ path: "/login", priority: 0.4, changefreq: "yearly" },
	{ path: "/cookies", priority: 0.3, changefreq: "yearly" },
	{ path: "/privacy-policy", priority: 0.3, changefreq: "yearly" },
	{ path: "/terms-of-service", priority: 0.3, changefreq: "yearly" },
];

// Legacy paths from the previous Next.js site. Permanent redirects so search
// engines consolidate signal to the canonical URLs.
const LEGACY_REDIRECTS: Record<string, string> = {
	"/privacy": "/privacy-policy",
	"/terms": "/terms-of-service",
	"/daicons": "https://icons.dakik.co.uk",
	"/dacomps": "https://bits.dakik.co.uk",
	"/automations": "https://flow.dakik.co.uk",
};

// Permanent redirects from legacy Next.js URLs to their canonical SPA routes.
for (const [from, to] of Object.entries(LEGACY_REDIRECTS)) {
	seoRoute.get(from, (c) => c.redirect(to, 301));
}

seoRoute.get("/robots.txt", (c) => {
	const sub = subdomainOf(c.req.header("host") ?? "");
	const base = sub === "main" ? getBaseUrl(c.env) : SUBDOMAIN_BASE[sub];
	const body = [
		"User-agent: *",
		"Allow: /",
		"Disallow: /admin",
		"Disallow: /admin/",
		"Disallow: /portal",
		"Disallow: /portal/",
		"Disallow: /api/",
		"",
		`Sitemap: ${base}/sitemap.xml`,
		"",
	].join("\n");
	return c.text(body, 200, { "Content-Type": "text/plain; charset=utf-8" });
});

// IndexNow ownership proof: engines GET /<key>.txt on the submitting host and
// expect the bare key back. Served on every host so each subdomain can submit.
seoRoute.get(`/${INDEXNOW_KEY}.txt`, (c) =>
	c.text(INDEXNOW_KEY, 200, { "Content-Type": "text/plain; charset=utf-8" }),
);

const escapeXml = (v: string) =>
	v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// `lastmod: null` omits the tag — a lastmod that changes on every fetch (the
// old behaviour for static paths) teaches crawlers to distrust the sitemap's
// dates, so only emit one when we have a real content timestamp.
function urlTag(
	loc: string,
	lastmod: string | null,
	changefreq: string,
	priority: string,
): string {
	const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
	return `<url><loc>${escapeXml(loc)}</loc>${lastmodTag}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

// Host-aware sitemap: every host lists ITS content under ITS origin. The apex
// lists the marketing pages + blog; each subdomain lists its home plus its own
// detail pages. Automations live in flow's sitemap only — the apex
// /automations path 301s to flow, so listing them on the apex would advertise
// duplicate content against the flow pages' canonicals.
seoRoute.get("/sitemap.xml", async (c) => {
	const sub = subdomainOf(c.req.header("host") ?? "");
	const db = getDb(c.env);
	const urls: string[] = [];

	if (sub === "icons") {
		urls.push(urlTag(`${SUBDOMAIN_BASE.icons}/`, null, "weekly", "1.0"));
	} else if (sub === "bits") {
		const base = SUBDOMAIN_BASE.bits;
		urls.push(urlTag(`${base}/`, null, "weekly", "1.0"));
		const components = await db.componentDoc.findMany({
			where: { published: true },
			orderBy: { slug: "asc" },
			select: { slug: true, updatedAt: true },
		});
		for (const comp of components) {
			urls.push(
				urlTag(
					`${base}/${comp.slug}`,
					(comp.updatedAt ?? new Date()).toISOString(),
					"monthly",
					"0.7",
				),
			);
		}
	} else if (sub === "flow") {
		const base = SUBDOMAIN_BASE.flow;
		urls.push(urlTag(`${base}/`, null, "weekly", "1.0"));
		const automations = await db.automation.findMany({
			where: { published: true, publishedAt: { not: null } },
			select: { slug: true, updatedAt: true, publishedAt: true },
		});
		for (const a of automations) {
			const lastmod = (a.updatedAt ?? a.publishedAt ?? new Date()).toISOString();
			urls.push(urlTag(`${base}/${a.slug}`, lastmod, "monthly", "0.7"));
		}
	} else {
		const base = getBaseUrl(c.env);
		for (const entry of STATIC_SITEMAP_PATHS) {
			urls.push(
				urlTag(
					`${base}${entry.path}`,
					null,
					entry.changefreq,
					entry.priority.toFixed(1),
				),
			);
		}
		const posts = await db.blogPost.findMany({
			where: { published: true, publishedAt: { not: null } },
			select: { slug: true, updatedAt: true, publishedAt: true },
		});
		for (const post of posts) {
			const lastmod = (
				post.updatedAt ??
				post.publishedAt ??
				new Date()
			).toISOString();
			urls.push(urlTag(`${base}/blog/${post.slug}`, lastmod, "monthly", "0.7"));
		}
	}

	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join(
		"",
	)}</urlset>`;

	return c.body(xml, 200, {
		"Content-Type": "application/xml; charset=utf-8",
		"Cache-Control": "public, max-age=300, s-maxage=600",
	});
});

/** Excerpts/descriptions may contain newlines; llms.txt list items can't. */
const oneLine = (v: string | null | undefined) =>
	v ? v.replace(/\s+/g, " ").trim() : "";

// llms.txt (llmstxt.org) — a curated markdown map of the site that AI crawlers
// and agents fetch directly. Host-aware like robots.txt and the sitemap: each
// host describes its own content.
seoRoute.get("/llms.txt", async (c) => {
	const sub = subdomainOf(c.req.header("host") ?? "");
	const db = getDb(c.env);
	const lines: string[] = [];

	if (sub === "icons") {
		lines.push(
			"# Dakik Icons",
			"",
			`> Icon font kits by ${SITE_NAME}, served from icons.dakik.co.uk.`,
			"",
			`- [Home](${SUBDOMAIN_BASE.icons}/)`,
		);
	} else if (sub === "bits") {
		const components = await db.componentDoc.findMany({
			where: { published: true },
			orderBy: { slug: "asc" },
			select: { slug: true, name: true, description: true },
		});
		lines.push(
			"# Dakik Bits",
			"",
			`> React/TypeScript UI components by ${SITE_NAME}, installable via the shadcn registry CLI.`,
			"",
			"## Components",
			"",
			...components.map(
				(comp: { slug: string; name: string; description: string | null }) => {
					const desc = oneLine(comp.description);
					return `- [${comp.name}](${SUBDOMAIN_BASE.bits}/${comp.slug})${desc ? `: ${desc}` : ""}`;
				},
			),
		);
	} else if (sub === "flow") {
		const automations = await db.automation.findMany({
			where: { published: true, publishedAt: { not: null } },
			orderBy: { publishedAt: "desc" },
			select: { slug: true, title: true, excerpt: true },
		});
		lines.push(
			"# Dakik Flow",
			"",
			`> Business automations by ${SITE_NAME}.`,
			"",
			"## Automations",
			"",
			...automations.map(
				(a: { slug: string; title: string; excerpt: string | null }) => {
					const desc = oneLine(a.excerpt);
					return `- [${a.title}](${SUBDOMAIN_BASE.flow}/${a.slug})${desc ? `: ${desc}` : ""}`;
				},
			),
		);
	} else {
		const base = getBaseUrl(c.env);
		const posts = await db.blogPost.findMany({
			where: { published: true, publishedAt: { not: null } },
			orderBy: { publishedAt: "desc" },
			select: { slug: true, title: true, excerpt: true },
		});
		lines.push(
			`# ${SITE_NAME}`,
			"",
			`> ${SITE_DESCRIPTION}`,
			"",
			"## Pages",
			"",
			`- [Home](${base}/)`,
			`- [About](${base}/about)`,
			`- [Blog](${base}/blog)`,
			`- [Contact](${base}/contact)`,
			"",
			"## Blog posts",
			"",
			...posts.map((p: { slug: string; title: string; excerpt: string | null }) => {
				const desc = oneLine(p.excerpt);
				return `- [${p.title}](${base}/blog/${p.slug})${desc ? `: ${desc}` : ""}`;
			}),
			"",
			"## Related sites",
			"",
			`- [Dakik Icons](${SUBDOMAIN_BASE.icons}/): icon font kits`,
			`- [Dakik Bits](${SUBDOMAIN_BASE.bits}/): React UI components`,
			`- [Dakik Flow](${SUBDOMAIN_BASE.flow}/): business automations`,
		);
	}

	return c.text(`${lines.join("\n")}\n`, 200, {
		"Content-Type": "text/plain; charset=utf-8",
		"Cache-Control": "public, max-age=300, s-maxage=600",
	});
});

// /blog and /blog/:slug are served with full SSR (server-rendered body + head +
// dehydrated React Query cache) by registerSsrRoutes in routes/ssr.ts.

// Automation detail pages live canonically on flow.dakik.co.uk/<slug> (SSR'd
// there with flow canonicals). The apex used to serve 200 shells with apex
// self-canonicals here — duplicate content the client router then rendered as
// a 404. Consolidate like the /automations legacy redirect above instead.
seoRoute.get("/automations/:slug", (c) => {
	const slug = c.req.param("slug");
	return c.redirect(
		`https://flow.dakik.co.uk/${encodeURIComponent(slug)}`,
		301,
	);
});
