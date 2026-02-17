"use client";

import { cn } from "@/lib/utils";

interface BlogContentProps {
	content: string;
	className?: string;
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
}

export function extractHeadings(
	content: string
): { id: string; text: string; level: 2 | 3 }[] {
	const headings: { id: string; text: string; level: 2 | 3 }[] = [];
	const h2Regex = /^## (.+)$/gm;
	const h3Regex = /^### (.+)$/gm;

	let match: RegExpExecArray | null = null;

	match = h2Regex.exec(content);
	while (match !== null) {
		headings.push({ id: slugify(match[1]), text: match[1], level: 2 });
		match = h2Regex.exec(content);
	}

	match = h3Regex.exec(content);
	while (match !== null) {
		headings.push({ id: slugify(match[1]), text: match[1], level: 3 });
		match = h3Regex.exec(content);
	}

	// Sort by position in original content
	headings.sort((a, b) => {
		const aIndex = content.indexOf(`${"#".repeat(a.level)} ${a.text}`);
		const bIndex = content.indexOf(`${"#".repeat(b.level)} ${b.text}`);
		return aIndex - bIndex;
	});

	return headings;
}

function parseMarkdown(markdown: string): string {
	let html = markdown;

	// Headers (order matters: h3 before h2 before h1)
	html = html.replace(
		/^### (.*$)/gim,
		(_match, text) =>
			`<h3 id="${slugify(text)}" class="mt-8 mb-4 font-semibold text-xl">${text}</h3>`
	);
	html = html.replace(
		/^## (.*$)/gim,
		(_match, text) =>
			`<h2 id="${slugify(text)}" class="mt-10 mb-4 font-bold text-2xl">${text}</h2>`
	);
	html = html.replace(
		/^# (.*$)/gim,
		(_match, text) =>
			`<h1 id="${slugify(text)}" class="mt-12 mb-6 font-bold text-3xl">${text}</h1>`
	);

	// Bold and italic
	html = html.replace(/\*\*\*(.*?)\*\*\*/gim, "<strong><em>$1</em></strong>");
	html = html.replace(
		/\*\*(.*?)\*\*/gim,
		'<strong class="font-semibold">$1</strong>'
	);
	html = html.replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>');

	// Inline code
	html = html.replace(
		/`([^`]+)`/gim,
		'<code class="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm">$1</code>'
	);

	// Code blocks
	html = html.replace(
		/```(\w*)\n([\s\S]*?)```/gim,
		'<pre class="my-6 overflow-x-auto rounded-lg bg-gray-900 p-4"><code class="block font-mono text-sm text-gray-100">$2</code></pre>'
	);

	// Blockquotes
	html = html.replace(
		/^> (.*$)/gim,
		'<blockquote class="my-6 border-l-4 border-gray-200 pl-4 italic text-gray-600">$1</blockquote>'
	);

	// Unordered lists
	html = html.replace(/^- (.*$)/gim, '<li class="ml-6 list-disc">$1</li>');
	html = html.replace(
		/(<li[^>]*>.*<\/li>\n?)+/gim,
		'<ul class="my-4 space-y-2">$&</ul>'
	);

	// Ordered lists
	html = html.replace(
		/^\d+\. (.*$)/gim,
		'<li class="ml-6 list-decimal">$1</li>'
	);

	// Links
	html = html.replace(
		/\[([^\]]+)\]\(([^)]+)\)/gim,
		'<a href="$2" class="text-black underline underline-offset-4 transition-colors hover:text-gray-600" target="_blank" rel="noopener noreferrer">$1</a>'
	);

	// Images
	html = html.replace(
		/!\[([^\]]*)\]\(([^)]+)\)/gim,
		'<figure class="my-8"><img src="$2" alt="$1" class="w-full rounded-lg" /><figcaption class="mt-2 text-center text-sm text-gray-500">$1</figcaption></figure>'
	);

	// Horizontal rules
	html = html.replace(/^---$/gim, '<hr class="my-8 border-gray-200" />');

	// Paragraphs (wrap remaining text)
	html = html
		.split("\n\n")
		.map((block) => {
			const trimmed = block.trim();
			if (!trimmed) {
				return "";
			}
			if (
				trimmed.startsWith("<h") ||
				trimmed.startsWith("<ul") ||
				trimmed.startsWith("<ol") ||
				trimmed.startsWith("<blockquote") ||
				trimmed.startsWith("<pre") ||
				trimmed.startsWith("<figure") ||
				trimmed.startsWith("<hr")
			) {
				return trimmed;
			}
			return `<p class="my-4 leading-relaxed text-gray-700">${trimmed}</p>`;
		})
		.join("\n");

	return html;
}

export function BlogContent({ content, className }: BlogContentProps) {
	const htmlContent = parseMarkdown(content);

	return (
		<div
			className={cn("prose prose-lg max-w-none", className)}
			// biome-ignore lint: Content is from our database, not user input
			dangerouslySetInnerHTML={{ __html: htmlContent }}
		/>
	);
}
