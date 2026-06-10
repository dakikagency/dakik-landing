import type { SubdomainKind } from "../frontend/router";
import type { CloudflareEnv } from "../types/cloudflare";

export const SITE_NAME = "Dakik Studio";
export const SITE_DESCRIPTION =
	"Dakik Studio designs and ships premium web experiences, automations, and product systems.";
export const DEFAULT_OG_IMAGE = "/og-default.png";

export function getBaseUrl(env: CloudflareEnv): string {
	const fromEnv = (env as unknown as { NEXT_PUBLIC_APP_URL?: string })
		.NEXT_PUBLIC_APP_URL;
	return fromEnv ?? "https://dakik.co.uk";
}

/** Canonical public origin of each subdomain experience. */
export const SUBDOMAIN_BASE: Record<Exclude<SubdomainKind, "main">, string> = {
	icons: "https://icons.dakik.co.uk",
	bits: "https://bits.dakik.co.uk",
	flow: "https://flow.dakik.co.uk",
};

/**
 * Worker-side twin of the client's `detectSubdomain` (frontend/router.tsx).
 * Duplicated rather than imported: pulling the function from the frontend
 * router would drag the entire page graph into the worker bundle.
 */
export function subdomainOf(hostname: string): SubdomainKind {
	// Host headers are case-insensitive; the client twin always sees lowercase.
	const host = hostname.toLowerCase();
	if (host.startsWith("icons.")) return "icons";
	if (host.startsWith("bits.")) return "bits";
	if (host.startsWith("flow.")) return "flow";
	return "main";
}

export interface SeoMeta {
	title: string;
	description: string;
	canonical: string;
	ogType?: "website" | "article";
	ogImage?: string;
	publishedTime?: string;
	modifiedTime?: string;
	jsonLd?: Record<string, unknown>;
}

function escapeHtml(input: string): string {
	return input
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function buildHeadTags(meta: SeoMeta): string {
	const title = escapeHtml(meta.title);
	const description = escapeHtml(meta.description);
	const canonical = escapeHtml(meta.canonical);
	const ogType = meta.ogType ?? "website";
	const ogImage = escapeHtml(meta.ogImage ?? DEFAULT_OG_IMAGE);

	const articleTags =
		ogType === "article"
			? [
					meta.publishedTime
						? `<meta property="article:published_time" content="${escapeHtml(meta.publishedTime)}" />`
						: "",
					meta.modifiedTime
						? `<meta property="article:modified_time" content="${escapeHtml(meta.modifiedTime)}" />`
						: "",
				].join("")
			: "";

	const jsonLd = meta.jsonLd
		? `<script type="application/ld+json">${JSON.stringify(meta.jsonLd).replace(/</g, "\\u003c")}</script>`
		: "";

	return [
		`<title>${title}</title>`,
		`<meta name="description" content="${description}" />`,
		`<link rel="canonical" href="${canonical}" />`,
		`<meta property="og:type" content="${ogType}" />`,
		`<meta property="og:title" content="${title}" />`,
		`<meta property="og:description" content="${description}" />`,
		`<meta property="og:url" content="${canonical}" />`,
		`<meta property="og:image" content="${ogImage}" />`,
		`<meta property="og:site_name" content="${SITE_NAME}" />`,
		`<meta name="twitter:card" content="summary_large_image" />`,
		`<meta name="twitter:title" content="${title}" />`,
		`<meta name="twitter:description" content="${description}" />`,
		`<meta name="twitter:image" content="${ogImage}" />`,
		articleTags,
		jsonLd,
	].join("");
}

/**
 * Remove the static SEO tags baked into the built index.html shell (title,
 * description, canonical, og:*, twitter:*) so they don't conflict with the
 * dynamic tags we inject — whether those come from unhead (SSR happy path) or
 * from `buildHeadTags` (fallback). Keeps charset/viewport/robots/googlebot and
 * the build's asset <script>/<link> tags.
 */
function stripStaticSeo(html: string): string {
	return html
		.replace(/[ \t]*<title>[\s\S]*?<\/title>\s*\n?/i, "")
		.replace(/[ \t]*<meta\s+name="description"[^>]*>\s*\n?/i, "")
		.replace(/[ \t]*<link\s+rel="canonical"[^>]*>\s*\n?/i, "")
		.replace(/[ \t]*<meta\s+property="og:[^"]*"[^>]*>\s*\n?/gi, "")
		.replace(/[ \t]*<meta\s+name="twitter:[^"]*"[^>]*>\s*\n?/gi, "");
}

function injectIntoHead(html: string, tags: string): string {
	if (html.includes("</head>")) {
		return html.replace("</head>", `${tags}</head>`);
	}
	return html.replace("<head>", `<head>${tags}`);
}

export function injectSeoIntoShell(shellHtml: string, meta: SeoMeta): string {
	return injectIntoHead(stripStaticSeo(shellHtml), buildHeadTags(meta));
}

/**
 * Assemble a full SSR response: strip the static SEO block, inject unhead's
 * rendered `headTags`, mount the server-rendered `appHtml` into #root, and embed
 * the dehydrated React Query cache for the client to hydrate. The state JSON
 * escapes `<` so a `</script>` inside (e.g.) blog markdown can't break out.
 */
export function renderSsrHtml(
	shellHtml: string,
	parts: { headTags: string; appHtml: string; dehydratedState: unknown },
): string {
	let html = injectIntoHead(stripStaticSeo(shellHtml), parts.headTags);
	html = html.replace(
		'<div id="root"></div>',
		`<div id="root">${parts.appHtml}</div>`,
	);
	const stateJson = JSON.stringify(parts.dehydratedState).replace(
		/</g,
		"\\u003c",
	);
	const script = `<script>window.__DAKIK_SSR__=${stateJson}</script>`;
	return html.includes("</body>")
		? html.replace("</body>", `${script}</body>`)
		: `${html}${script}`;
}

export async function readShellHtml(env: CloudflareEnv): Promise<string> {
	const res = await env.ASSETS.fetch(
		new Request("https://placeholder.local/index.html"),
	);
	if (!res.ok) {
		throw new Error(
			`SPA shell index.html not found in ASSETS bundle (status ${res.status}). Did the frontend build run?`,
		);
	}
	return await res.text();
}
