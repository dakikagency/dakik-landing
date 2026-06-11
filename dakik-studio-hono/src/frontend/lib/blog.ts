export const BLOG_AUTHOR = {
	name: "Erdeniz Korkmaz",
	initials: "EK",
};

const WHITESPACE_RE = /\s+/;

export function calculateReadTime(content: string | null | undefined): number {
	if (!content) return 1;
	const words = content.trim().split(WHITESPACE_RE).length;
	return Math.max(1, Math.round(words / 200));
}

export interface BlogTag {
	id: string;
	name: string;
	slug: string;
}

export interface BlogPostSummary {
	id: string;
	slug: string;
	title: string;
	excerpt?: string | null;
	coverImage?: string | null;
	publishedAt: string | null;
	tags: BlogTag[];
	/** Precomputed on the server so summary cards can show "N min read". */
	readingTime?: number;
}

export interface BlogPostFull extends BlogPostSummary {
	content: string;
	updatedAt: string;
}

const CLOUDINARY_UPLOAD_RE =
	/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;

/**
 * Rewrite a Cloudinary delivery URL to request an optimized variant: f_auto
 * (WebP/AVIF per browser), q_auto (content-aware compression) and a width cap.
 * Covers are uploaded as ~1MB 1024px PNGs; this serves double-digit-KB
 * variants without touching the originals. Non-Cloudinary URLs (e.g. /media/*
 * from R2) are returned unchanged.
 */
export function optimizedCover(url: string, width: number): string {
	const m = CLOUDINARY_UPLOAD_RE.exec(url);
	if (!m) return url;
	return `${m[1]}f_auto,q_auto,c_limit,w_${width}/${m[2]}`;
}

/** Width-described srcset for the browser to pick from; Cloudinary only. */
export function coverSrcSet(url: string): string | undefined {
	if (!CLOUDINARY_UPLOAD_RE.test(url)) return undefined;
	return [480, 768, 1024, 1536]
		.map((w) => `${optimizedCover(url, w)} ${w}w`)
		.join(", ");
}

export function formatDate(date: string | Date | null | undefined): string {
	if (!date) return "";
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(date));
}

export function slugifyHeading(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-");
}

export function extractHeadings(
	markdown: string,
): Array<{ id: string; text: string; level: number }> {
	const lines = markdown.split("\n");
	const headings: Array<{ id: string; text: string; level: number }> = [];
	for (const line of lines) {
		const match = /^(#{1,3})\s+(.+)$/.exec(line.trim());
		if (!match) continue;
		const level = match[1].length;
		const text = match[2].replace(/[#*`_]/g, "").trim();
		headings.push({ id: slugifyHeading(text), text, level });
	}
	return headings;
}
