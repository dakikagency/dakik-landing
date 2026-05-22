import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugifyHeading } from "../../lib/blog";
import { cn } from "../../lib/utils";

interface BlogContentProps {
	content: string;
	className?: string;
}

/**
 * Render markdown with explicit per-element styling.
 *
 * We deliberately do NOT use Tailwind's `prose` class — `@tailwindcss/typography`
 * is not installed, so `prose` would be a no-op and leave the article as
 * unstyled HTML. Defining each element's classes here also lets us match the
 * site's brutalist headline treatment (uppercase, font-black, tight tracking)
 * which the typography plugin defaults don't produce.
 */
export function BlogContent({ content, className }: BlogContentProps) {
	return (
		<div className={cn("text-black", className)}>
			<ReactMarkdown
				components={{
					h1: ({ children }) => {
						const text = String(children);
						return (
							<h1
								className="mt-16 mb-8 font-black text-3xl uppercase leading-[0.95] tracking-[-0.03em] sm:text-4xl lg:text-5xl"
								id={slugifyHeading(text)}
							>
								{children}
							</h1>
						);
					},
					h2: ({ children }) => {
						const text = String(children);
						return (
							<h2
								className="mt-16 mb-6 font-black text-2xl uppercase leading-[0.95] tracking-[-0.03em] sm:text-3xl lg:text-4xl"
								id={slugifyHeading(text)}
							>
								{children}
							</h2>
						);
					},
					h3: ({ children }) => {
						const text = String(children);
						return (
							<h3
								className="mt-12 mb-4 font-bold text-xl uppercase tracking-[-0.02em] sm:text-2xl"
								id={slugifyHeading(text)}
							>
								{children}
							</h3>
						);
					},
					h4: ({ children }) => (
						<h4 className="mt-10 mb-3 font-bold text-lg tracking-tight">
							{children}
						</h4>
					),
					p: ({ children }) => (
						<p className="mb-6 text-base text-black/75 leading-[1.75] lg:text-lg">
							{children}
						</p>
					),
					a: ({ children, href }: ComponentPropsWithoutRef<"a">) => (
						<a
							className="font-medium text-black underline decoration-black/30 underline-offset-4 transition-colors hover:decoration-black"
							href={href}
							rel={
								href?.startsWith("http") ? "noopener noreferrer" : undefined
							}
							target={href?.startsWith("http") ? "_blank" : undefined}
						>
							{children}
						</a>
					),
					ul: ({ children }) => (
						<ul className="mb-6 ml-6 list-disc space-y-2 text-base text-black/75 leading-[1.75] lg:text-lg marker:text-black/40">
							{children}
						</ul>
					),
					ol: ({ children }) => (
						<ol className="mb-6 ml-6 list-decimal space-y-2 text-base text-black/75 leading-[1.75] lg:text-lg marker:text-black/40">
							{children}
						</ol>
					),
					li: ({ children }) => <li className="pl-2">{children}</li>,
					blockquote: ({ children }) => (
						<blockquote className="my-10 border-black border-l-2 pl-6 text-black/85 text-xl italic leading-relaxed lg:text-2xl">
							{children}
						</blockquote>
					),
					code: ({
						children,
						className: codeClass,
					}: ComponentPropsWithoutRef<"code">) => {
						// Block code is wrapped in <pre><code> — react-markdown gives the
						// fenced language as className "language-xxx". We let <pre> handle
						// the block treatment and only style inline code here.
						const isBlock = codeClass?.startsWith("language-");
						if (isBlock) {
							return <code className={codeClass}>{children}</code>;
						}
						return (
							<code className="rounded bg-black/[0.06] px-1.5 py-0.5 font-mono text-[0.875em] text-black">
								{children}
							</code>
						);
					},
					pre: ({ children }) => (
						<pre className="my-8 overflow-x-auto rounded-lg bg-black p-6 font-mono text-sm text-white leading-relaxed">
							{children}
						</pre>
					),
					img: ({ src, alt }: ComponentPropsWithoutRef<"img">) => (
						<img
							alt={alt ?? ""}
							className="my-10 w-full rounded-lg"
							src={src}
						/>
					),
					hr: () => <hr className="my-16 border-black/10 border-t" />,
					strong: ({ children }) => (
						<strong className="font-semibold text-black">{children}</strong>
					),
					em: ({ children }) => <em className="italic">{children}</em>,
					table: ({ children }) => (
						<div className="my-8 overflow-x-auto">
							<table className="w-full text-base">{children}</table>
						</div>
					),
					thead: ({ children }) => (
						<thead className="border-black/20 border-b">{children}</thead>
					),
					th: ({ children }) => (
						<th className="pb-3 pr-6 text-left font-semibold">{children}</th>
					),
					td: ({ children }) => (
						<td className="border-black/10 border-b py-3 pr-6 text-black/75">
							{children}
						</td>
					),
				}}
				remarkPlugins={[remarkGfm]}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
