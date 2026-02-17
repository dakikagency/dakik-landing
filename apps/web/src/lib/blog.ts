export const BLOG_AUTHOR = {
	name: "Erdeniz Korkmaz",
	initials: "EK",
};

const WHITESPACE_RE = /\s+/;

export function calculateReadTime(content: string | null | undefined): number {
	if (!content) {
		return 1;
	}
	const words = content.trim().split(WHITESPACE_RE).length;
	return Math.max(1, Math.round(words / 200));
}
