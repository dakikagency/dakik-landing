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

export function injectSeoIntoShell(shellHtml: string, meta: SeoMeta): string {
	const tags = buildHeadTags(meta);

	let html = shellHtml;
	html = html.replace(/<title>[\s\S]*?<\/title>/i, "");

	if (html.includes("</head>")) {
		return html.replace("</head>", `${tags}</head>`);
	}
	return html.replace("<head>", `<head>${tags}`);
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
