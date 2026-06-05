interface PageHeadOptions {
	title: string;
	description: string;
	/** Absolute per-host canonical URL, e.g. `https://icons.dakik.co.uk/`. */
	canonical: string;
	image?: string | null;
	type?: "website" | "article";
}

/**
 * Build a complete, correct `useHead()` input: title + description + canonical +
 * Open Graph + Twitter. Centralised so every SSR'd page emits a consistent head
 * and a correct PER-HOST canonical (fixing the old subdomain→apex canonical bug,
 * where every subdomain claimed `https://dakik.co.uk/`). unhead renders these on
 * the server (renderSSRHead) and reconciles them on the client after hydration.
 *
 * JSON-LD is intentionally NOT here — it's injected as a standalone <script> by
 * the worker for article pages, so unhead never manages it (no client dup).
 */
export function pageHead({
	title,
	description,
	canonical,
	image,
	type = "website",
}: PageHeadOptions) {
	return {
		title,
		link: [{ rel: "canonical", href: canonical }],
		meta: [
			{ name: "description", content: description },
			{ property: "og:type", content: type },
			{ property: "og:title", content: title },
			{ property: "og:description", content: description },
			{ property: "og:url", content: canonical },
			{ property: "og:site_name", content: "Dakik Studio" },
			...(image ? [{ property: "og:image", content: image }] : []),
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: title },
			{ name: "twitter:description", content: description },
			...(image ? [{ name: "twitter:image", content: image }] : []),
		],
	};
}
