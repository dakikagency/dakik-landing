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
		<nav className={cn("sticky top-32", className)}>
			<h4 className="mb-5 font-mono text-[10px] text-black/55 uppercase tracking-[0.35em]">
				On this page
			</h4>
			<ul className="space-y-3 border-black/10 border-l text-sm">
				{headings.map((h) => {
					const isActive = activeId === h.id;
					return (
						<li
							key={h.id}
							style={{ paddingLeft: `${(h.level - 1) * 14 + 16}px` }}
						>
							<a
								className={cn(
									"relative block py-0.5 transition-colors hover:text-black",
									isActive
										? "font-medium text-black"
										: "text-black/55",
								)}
								href={`#${h.id}`}
							>
								{isActive && (
									<span
										aria-hidden="true"
										className="-left-px absolute top-1 h-4 w-px bg-black"
									/>
								)}
								{h.text}
							</a>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
