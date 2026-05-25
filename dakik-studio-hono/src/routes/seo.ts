import { Hono } from "hono";
import { getDb } from "../lib/db";
import {
	getBaseUrl,
	injectSeoIntoShell,
	readShellHtml,
	SITE_DESCRIPTION,
	SITE_NAME,
	type SeoMeta,
} from "../lib/seo";
import type { CloudflareEnv } from "../types/cloudflare";

export const seoRoute = new Hono<{ Bindings: CloudflareEnv }>();

const STATIC_SITEMAP_PATHS: Array<{
	path: string;
	priority: number;
	changefreq: "daily" | "weekly" | "monthly" | "yearly";
}> = [
	{ path: "/", priority: 1.0, changefreq: "weekly" },
	{ path: "/about", priority: 0.7, changefreq: "monthly" },
	{ path: "/automations", priority: 0.8, changefreq: "weekly" },
	{ path: "/blog", priority: 0.8, changefreq: "weekly" },
	{ path: "/contact", priority: 0.6, changefreq: "yearly" },
	{ path: "/dacomps", priority: 0.8, changefreq: "monthly" },
	{ path: "/survey", priority: 0.9, changefreq: "monthly" },
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
};

// Permanent redirects from legacy Next.js URLs to their canonical SPA routes.
for (const [from, to] of Object.entries(LEGACY_REDIRECTS)) {
	seoRoute.get(from, (c) => c.redirect(to, 301));
}

seoRoute.get("/robots.txt", (c) => {
	const base = getBaseUrl(c.env);
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

seoRoute.get("/sitemap.xml", async (c) => {
	const base = getBaseUrl(c.env);
	const db = getDb(c.env);
	const now = new Date().toISOString();

	const [posts, automations] = await Promise.all([
		db.blogPost.findMany({
			where: { published: true, publishedAt: { not: null } },
			select: { slug: true, updatedAt: true, publishedAt: true },
		}),
		db.automation.findMany({
			where: { published: true, publishedAt: { not: null } },
			select: { slug: true, updatedAt: true, publishedAt: true },
		}),
	]);

	const urls: string[] = [];

	for (const entry of STATIC_SITEMAP_PATHS) {
		urls.push(
			`<url><loc>${base}${entry.path}</loc><lastmod>${now}</lastmod><changefreq>${entry.changefreq}</changefreq><priority>${entry.priority.toFixed(1)}</priority></url>`,
		);
	}

	for (const post of posts) {
		const lastmod = (
			post.updatedAt ??
			post.publishedAt ??
			new Date()
		).toISOString();
		urls.push(
			`<url><loc>${base}/blog/${post.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
		);
	}

	for (const a of automations) {
		const lastmod = (
			a.updatedAt ??
			a.publishedAt ??
			new Date()
		).toISOString();
		urls.push(
			`<url><loc>${base}/automations/${a.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
		);
	}

	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join(
		"",
	)}</urlset>`;

	return c.body(xml, 200, {
		"Content-Type": "application/xml; charset=utf-8",
		"Cache-Control": "public, max-age=300, s-maxage=600",
	});
});

async function renderShell(c: { env: CloudflareEnv }, meta: SeoMeta) {
	const shell = await readShellHtml(c.env);
	const html = injectSeoIntoShell(shell, meta);
	return new Response(html, {
		status: 200,
		headers: {
			"Content-Type": "text/html; charset=utf-8",
			"Cache-Control": "public, max-age=60, s-maxage=300",
		},
	});
}

seoRoute.get("/blog", async (c) => {
	const base = getBaseUrl(c.env);
	return renderShell(c, {
		title: `Blog · ${SITE_NAME}`,
		description:
			"Articles on design systems, web performance, and product engineering from the Dakik Studio team.",
		canonical: `${base}/blog`,
		ogType: "website",
	});
});

seoRoute.get("/blog/:slug", async (c) => {
	const slug = c.req.param("slug");
	const base = getBaseUrl(c.env);
	const db = getDb(c.env);

	const post = await db.blogPost.findUnique({
		where: { slug },
		select: {
			slug: true,
			title: true,
			excerpt: true,
			coverImage: true,
			publishedAt: true,
			updatedAt: true,
			published: true,
		},
	});

	if (!post || !post.published) {
		return c.notFound();
	}

	const description = post.excerpt ?? SITE_DESCRIPTION;
	const canonical = `${base}/blog/${post.slug}`;
	const image = post.coverImage ?? undefined;

	return renderShell(c, {
		title: `${post.title} · ${SITE_NAME}`,
		description,
		canonical,
		ogType: "article",
		ogImage: image,
		publishedTime: post.publishedAt?.toISOString(),
		modifiedTime: post.updatedAt.toISOString(),
		jsonLd: {
			"@context": "https://schema.org",
			"@type": "Article",
			headline: post.title,
			description,
			image: image ? [image] : undefined,
			datePublished: post.publishedAt?.toISOString(),
			dateModified: post.updatedAt.toISOString(),
			mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
			publisher: {
				"@type": "Organization",
				name: SITE_NAME,
				url: base,
			},
		},
	});
});

seoRoute.get("/automations", async (c) => {
	const base = getBaseUrl(c.env);
	return renderShell(c, {
		title: `Automations · ${SITE_NAME}`,
		description:
			"Ready-to-use automation playbooks built and maintained by Dakik Studio.",
		canonical: `${base}/automations`,
		ogType: "website",
	});
});

seoRoute.get("/automations/:slug", async (c) => {
	const slug = c.req.param("slug");
	const base = getBaseUrl(c.env);
	const db = getDb(c.env);

	const automation = await db.automation.findUnique({
		where: { slug },
		select: {
			slug: true,
			title: true,
			excerpt: true,
			coverImage: true,
			publishedAt: true,
			updatedAt: true,
			published: true,
		},
	});

	if (!automation || !automation.published) {
		return c.notFound();
	}

	const description = automation.excerpt ?? SITE_DESCRIPTION;
	const canonical = `${base}/automations/${automation.slug}`;
	const image = automation.coverImage ?? undefined;

	return renderShell(c, {
		title: `${automation.title} · ${SITE_NAME}`,
		description,
		canonical,
		ogType: "article",
		ogImage: image,
		publishedTime: automation.publishedAt?.toISOString(),
		modifiedTime: automation.updatedAt.toISOString(),
		jsonLd: {
			"@context": "https://schema.org",
			"@type": "Article",
			headline: automation.title,
			description,
			image: image ? [image] : undefined,
			datePublished: automation.publishedAt?.toISOString(),
			dateModified: automation.updatedAt.toISOString(),
			mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
			publisher: {
				"@type": "Organization",
				name: SITE_NAME,
				url: base,
			},
		},
	});
});
