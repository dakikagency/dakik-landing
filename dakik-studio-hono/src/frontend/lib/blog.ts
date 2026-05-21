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
}

export interface BlogPostFull extends BlogPostSummary {
	content: string;
	updatedAt: string;
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
