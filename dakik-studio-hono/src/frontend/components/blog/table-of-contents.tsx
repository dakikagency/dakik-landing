import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

interface Heading {
	id: string;
	text: string;
	level: number;
}

interface TableOfContentsProps {
	headings: Heading[];
	className?: string;
}

export function TableOfContents({ headings, className }: TableOfContentsProps) {
	const [activeId, setActiveId] = useState<string | null>(null);

	useEffect(() => {
		if (headings.length === 0) return;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				}
			},
			{ rootMargin: "0px 0px -70% 0px", threshold: 0.1 },
		);
		for (const h of headings) {
			const el = document.getElementById(h.id);
			if (el) observer.observe(el);
		}
		return () => observer.disconnect();
	}, [headings]);

	if (headings.length === 0) return null;

	return (
		<nav className={cn("sticky top-24", className)}>
			<h4 className="mb-3 font-semibold text-gray-400 text-xs uppercase tracking-widest">
				On this page
			</h4>
			<ul className="space-y-2 text-sm">
				{headings.map((h) => (
					<li
						key={h.id}
						style={{ paddingLeft: `${(h.level - 1) * 12}px` }}
					>
						<a
							className={cn(
								"block transition-colors hover:text-black",
								activeId === h.id ? "text-black font-medium" : "text-gray-500",
							)}
							href={`#${h.id}`}
						>
							{h.text}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
