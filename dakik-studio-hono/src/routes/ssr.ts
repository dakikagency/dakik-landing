import type { QueryKey } from "@tanstack/react-query";
import type { Context, Hono } from "hono";
import type { SubdomainKind } from "../frontend/router";
import { readShellHtml, renderSsrHtml, SITE_NAME, subdomainOf } from "../lib/seo";
import { renderApp } from "../ssr/render";
import type { CloudflareEnv } from "../types/cloudflare";

type App = Hono<{ Bindings: CloudflareEnv }>;
type Ctx = Context<{ Bindings: CloudflareEnv }>;

// First path segments on flow.dakik.co.uk that are NOT automation slugs.
const FLOW_RESERVED = new Set(["login", "auth", "admin", "api", "media", "health"]);

// First path segments on bits.dakik.co.uk that are NOT component slugs
// (registry.json + /r/* are the CLI-facing registry endpoints).
const BITS_RESERVED = new Set([
	"login",
	"auth",
	"admin",
	"api",
	"media",
	"health",
	"r",
	"registry.json",
]);

interface ArticleLike {
	title: string;
	excerpt?: string | null;
	coverImage?: string | null;
	publishedAt?: string | null;
	updatedAt?: string | null;
}

/**
 * Serve the static asset / SPA shell for this request. env.ASSETS.fetch returns
 * a response with IMMUTABLE headers, which the cors middleware would crash on
 * when it tries to add headers — so copy into a fresh, mutable Response.
 */
async function serveShell(c: Ctx): Promise<Response> {
	const res = await c.env.ASSETS.fetch(c.req.raw);
	return new Response(res.body, res);
}

/**
 * Fetch the exact JSON the browser would, by calling our own endpoint through
 * the Hono app. Guarantees the seeded React Query cache matches the client's
 * `queryFn` output byte-for-byte (no hydration drift). Returns null on any error
 * so the caller can fall back gracefully.
 */
async function prefetch(app: App, c: Ctx, path: string): Promise<unknown | null> {
	try {
		const res = await app.request(path, undefined, c.env);
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
}

function articleJsonLd(a: ArticleLike, url: string): Record<string, unknown> {
	return {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: a.title,
		description: a.excerpt ?? undefined,
		image: a.coverImage ? [a.coverImage] : undefined,
		datePublished: a.publishedAt ?? undefined,
		dateModified: a.updatedAt ?? undefined,
		mainEntityOfPage: { "@type": "WebPage", "@id": url },
		publisher: {
			"@type": "Organization",
			name: SITE_NAME,
			url: "https://dakik.co.uk",
		},
	};
}

/**
 * Render a route on the worker and return a full HTML response. On ANY failure,
 * degrade to the plain SPA shell (the client then renders + unhead populates the
 * head) — the live site never breaks because SSR threw.
 *
 * Successful renders are cached at the edge via the Cache API: Workers never
 * populate Cloudflare's cache for worker-generated responses on their own, so
 * without this every visit (and crawler hit) pays full SSR + D1 latency
 * (~1.5s TTFB measured). The URL key is host-aware (apex/bits/flow can't
 * collide) and SSR output is user-agnostic — sessions hydrate client-side —
 * so no cookie vary is needed. Edge TTL comes from s-maxage (5 min), which
 * bounds how stale a just-edited post can appear.
 */
async function ssrRespond(
	app: App,
	c: Ctx,
	subdomain: SubdomainKind,
	prefetched: Array<[QueryKey, unknown]>,
	jsonLd?: Record<string, unknown>,
): Promise<Response> {
	// The shared tsconfig uses the DOM's CacheStorage type, which lacks the
	// Workers-only `default` cache — present at runtime in workerd.
	const cache = (caches as unknown as { default: Cache }).default;
	const cacheKey = c.req.method === "GET" ? new Request(c.req.url) : null;
	if (cacheKey) {
		const hit = await cache.match(cacheKey);
		// Fresh copy: cached responses carry immutable headers, which the cors
		// middleware would crash on (same trap as serveShell / ASSETS.fetch).
		if (hit) return new Response(hit.body, hit);
	}
	try {
		const shell = await readShellHtml(c.env);
		const { appHtml, headTags, dehydratedState } = await renderApp({
			url: c.req.url,
			subdomain,
			prefetched,
		});
		const head = jsonLd
			? `${headTags}<script type="application/ld+json">${JSON.stringify(
					jsonLd,
				).replace(/</g, "\\u003c")}</script>`
			: headTags;
		const html = renderSsrHtml(shell, { headTags: head, appHtml, dehydratedState });
		const res = c.html(html, 200, {
			"Cache-Control": "public, max-age=60, s-maxage=300",
		});
		if (cacheKey) {
			c.executionCtx.waitUntil(cache.put(cacheKey, res.clone()));
		}
		return res;
	} catch (err) {
		console.error(
			"SSR_RENDER_FAILED",
			err instanceof Error ? `${err.message}\n${err.stack}` : String(err),
		);
		return serveShell(c);
	}
}

export function registerSsrRoutes(app: App): void {
	// Subdomain home pages (icons / bits / flow). Apex + www stay client-rendered.
	app.get("/", async (c) => {
		const subdomain = subdomainOf(c.req.header("host") ?? "");
		if (subdomain === "main") {
			return serveShell(c);
		}
		// icons: no prefetch — the font-kit catalog (~85 KB JSON) would double the
		// HTML if dehydrated into it; the browser grid loads it client-side while
		// the SSR'd hero/usage docs carry the SEO weight.
		const cfg = {
			icons: null,
			bits: { path: "/registry.json", key: ["registry"] },
			flow: { path: "/api/automations", key: ["automations", "list"] },
		}[subdomain];

		const data = cfg ? await prefetch(app, c, cfg.path) : null;
		const prefetched: Array<[QueryKey, unknown]> = cfg && data
			? [[cfg.key, data]]
			: [];
		return ssrRespond(app, c, subdomain, prefetched);
	});

	// Blog index (apex only). The blog doesn't exist on the subdomains' route
	// trees, so serving apex HTML there would hydrate into a mismatch (and get
	// edge-cached). Non-main hosts fall through to the catch-all instead.
	app.get("/blog", async (c, next) => {
		if (subdomainOf(c.req.header("host") ?? "") !== "main") return next();
		const data = await prefetch(app, c, "/api/blog");
		const prefetched: Array<[QueryKey, unknown]> = data
			? [[["blog", "list"], data]]
			: [];
		return ssrRespond(app, c, "main", prefetched);
	});

	// Blog post (apex only). JSON-LD Article injected for crawlers.
	app.get("/blog/:slug", async (c, next) => {
		if (subdomainOf(c.req.header("host") ?? "") !== "main") return next();
		const slug = c.req.param("slug");
		const data = await prefetch(app, c, `/api/blog/${encodeURIComponent(slug)}`);
		if (!data) {
			// Unknown/unpublished post → let the SPA render its 404 UI.
			return serveShell(c);
		}
		const post = (data as { post?: ArticleLike }).post;
		const jsonLd = post
			? articleJsonLd(post, `https://dakik.co.uk/blog/${slug}`)
			: undefined;
		return ssrRespond(app, c, "main", [[["blog", "post", slug], data]], jsonLd);
	});

	// Catch-all (LAST): flow automation detail SSR + asset/shell delegation for
	// every other navigation. Runs because `run_worker_first: ["/*", ...]` routes
	// all non-asset paths through the worker.
	app.all("*", async (c) => {
		const url = new URL(c.req.url);
		const subdomain = subdomainOf(c.req.header("host") ?? "");
		const segments = url.pathname.split("/").filter(Boolean);

		// Probes for dotfiles/dotdirs (/.env, /.env.local, /.git/*, /.DS_Store …)
		// get a real 404 — never the SPA shell (200) and never a stray asset such
		// as dist/.DS_Store served straight off the asset layer. /.well-known/*
		// stays allowed (ACME, security.txt, apple-app-site-association).
		if (
			segments.some((s) => s.startsWith(".")) &&
			!url.pathname.startsWith("/.well-known/")
		) {
			return c.notFound();
		}

		// flow.dakik.co.uk/<slug> → SSR the automation detail page.
		if (
			subdomain === "flow" &&
			segments.length === 1 &&
			!FLOW_RESERVED.has(segments[0])
		) {
			const slug = segments[0];
			const data = await prefetch(
				app,
				c,
				`/api/automations/${encodeURIComponent(slug)}`,
			);
			if (data) {
				const automation = (data as { automation?: ArticleLike }).automation;
				const jsonLd = automation
					? articleJsonLd(automation, `https://flow.dakik.co.uk/${slug}`)
					: undefined;
				return ssrRespond(
					app,
					c,
					"flow",
					[[["automations", "post", slug], data]],
					jsonLd,
				);
			}
		}

		// bits.dakik.co.uk/<slug> → SSR the component detail page. Both queries the
		// page mounts (the component + the registry index for the sidebar) are
		// prefetched so the served HTML is complete and hydration is drift-free.
		if (
			subdomain === "bits" &&
			segments.length === 1 &&
			!BITS_RESERVED.has(segments[0])
		) {
			const slug = segments[0];
			const data = await prefetch(
				app,
				c,
				`/api/components/${encodeURIComponent(slug)}`,
			);
			if (data) {
				const prefetched: Array<[QueryKey, unknown]> = [
					[["bits", "component", slug], data],
				];
				const registry = await prefetch(app, c, "/registry.json");
				if (registry) prefetched.push([["registry"], registry]);

				const component = (
					data as { component?: { name: string; description?: string | null } }
				).component;
				const url = `https://bits.dakik.co.uk/${slug}`;
				const jsonLd = component
					? {
							"@context": "https://schema.org",
							"@type": "SoftwareSourceCode",
							name: component.name,
							description: component.description ?? undefined,
							programmingLanguage: "TypeScript",
							runtimePlatform: "React",
							url,
							mainEntityOfPage: { "@type": "WebPage", "@id": url },
							publisher: {
								"@type": "Organization",
								name: SITE_NAME,
								url: "https://dakik.co.uk",
							},
						}
					: undefined;
				return ssrRespond(app, c, "bits", prefetched, jsonLd);
			}
		}

		// Worker-owned API/health/media paths shouldn't reach here; if they do
		// (no sub-route matched), don't mask them with the SPA shell.
		if (/^\/(api|health|media)(\/|$)/.test(url.pathname)) {
			return c.notFound();
		}

		// Everything else (apex CSR routes, unknown paths, any stray static file)
		// → the asset layer, which serves the file or the SPA shell fallback.
		return serveShell(c);
	});
}
