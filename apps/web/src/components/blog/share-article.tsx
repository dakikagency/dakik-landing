"use client";

import { Check, Link2, Linkedin } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface ShareArticleProps {
	url: string;
	title: string;
}

function XIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			fill="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
		</svg>
	);
}

export function ShareArticle({ url, title }: ShareArticleProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(url);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, [url]);

	const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
	const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

	const iconButtonClass =
		"flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-black";

	return (
		<div>
			<p className="mb-3 font-semibold text-gray-400 text-sm uppercase tracking-wider">
				Share Article
			</p>
			<div className="flex gap-2">
				<a
					aria-label="Share on X"
					className={iconButtonClass}
					href={twitterUrl}
					rel="noopener noreferrer"
					target="_blank"
				>
					<XIcon className="h-4 w-4" />
				</a>
				<a
					aria-label="Share on LinkedIn"
					className={iconButtonClass}
					href={linkedinUrl}
					rel="noopener noreferrer"
					target="_blank"
				>
					<Linkedin className="h-4 w-4" />
				</a>
				<button
					aria-label="Copy link"
					className={cn(
						iconButtonClass,
						copied && "bg-green-100 text-green-600"
					)}
					onClick={handleCopy}
					type="button"
				>
					{copied ? (
						<Check className="h-4 w-4" />
					) : (
						<Link2 className="h-4 w-4" />
					)}
				</button>
			</div>
		</div>
	);
}
