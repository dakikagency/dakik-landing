import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugifyHeading } from "../../lib/blog";
import { cn } from "../../lib/utils";

interface BlogContentProps {
	content: string;
	className?: string;
}

export function BlogContent({ content, className }: BlogContentProps) {
	return (
		<div className={cn("prose prose-lg max-w-none", className)}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					h1: ({ children }) => {
						const text = String(children);
						return <h1 id={slugifyHeading(text)}>{children}</h1>;
					},
					h2: ({ children }) => {
						const text = String(children);
						return <h2 id={slugifyHeading(text)}>{children}</h2>;
					},
					h3: ({ children }) => {
						const text = String(children);
						return <h3 id={slugifyHeading(text)}>{children}</h3>;
					},
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
