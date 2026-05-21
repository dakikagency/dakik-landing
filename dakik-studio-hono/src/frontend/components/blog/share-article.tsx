import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";

interface ShareArticleProps {
	url: string;
	title: string;
	className?: string;
}

export function ShareArticle({ url, title, className }: ShareArticleProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			setCopied(false);
		}
	};

	const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
	const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<span className="text-gray-400 text-xs uppercase tracking-widest">Share</span>
			<a
				className="flex h-9 items-center justify-center rounded-full border border-gray-200 px-3 font-medium text-gray-600 text-xs transition hover:bg-gray-50"
				href={twitterUrl}
				rel="noreferrer"
				target="_blank"
				aria-label="Share on X"
			>
				X
			</a>
			<a
				className="flex h-9 items-center justify-center rounded-full border border-gray-200 px-3 font-medium text-gray-600 text-xs transition hover:bg-gray-50"
				href={linkedInUrl}
				rel="noreferrer"
				target="_blank"
				aria-label="Share on LinkedIn"
			>
				in
			</a>
			<button
				className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:bg-gray-50"
				onClick={handleCopy}
				type="button"
				aria-label="Copy link"
			>
				{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
			</button>
		</div>
	);
}
