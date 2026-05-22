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

	const buttonClass =
		"flex h-9 items-center justify-center border border-black/15 px-3 font-mono text-[10px] text-black uppercase tracking-[0.25em] transition-colors hover:bg-black hover:text-white";

	return (
		<div className={cn("flex flex-col gap-3", className)}>
			<span className="font-mono text-[10px] text-black/55 uppercase tracking-[0.35em]">
				Share
			</span>
			<div className="flex flex-wrap items-center gap-2">
				<a
					aria-label="Share on X"
					className={buttonClass}
					href={twitterUrl}
					rel="noreferrer"
					target="_blank"
				>
					X
				</a>
				<a
					aria-label="Share on LinkedIn"
					className={buttonClass}
					href={linkedInUrl}
					rel="noreferrer"
					target="_blank"
				>
					IN
				</a>
				<button
					aria-label="Copy link"
					className={cn(buttonClass, "h-9 w-9 px-0")}
					onClick={handleCopy}
					type="button"
				>
					{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
				</button>
			</div>
		</div>
	);
}
