import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

export function useActiveSection(ids: string[]): string {
	const [activeId, setActiveId] = useState(ids[0] ?? "");

	useEffect(() => {
		if (!ids.length) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const intersecting = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (intersecting.length > 0) {
					setActiveId(intersecting[0].target.id);
				}
			},
			{ rootMargin: "0px 0px -65% 0px", threshold: 0 },
		);

		for (const id of ids) {
			const el = document.getElementById(id);
			if (el) observer.observe(el);
		}

		return () => observer.disconnect();
	}, [ids]);

	return activeId;
}

interface TocProps {
	headings: Array<{ id: string; text: string; level: number }>;
	activeId: string;
}

export function TableOfContents({ headings, activeId }: TocProps) {
	if (!headings.length) return null;

	return (
		<nav aria-label="Table of contents">
			<p className="font-mono text-[10px] text-black/45 uppercase tracking-[0.35em]">
				Contents
			</p>
			<ul className="mt-4 space-y-px">
				{headings.map((h) => {
					const isActive = activeId === h.id;
					return (
						<li key={h.id}>
							<a
								className={cn(
									"block border-l-2 py-1 text-sm leading-[1.4] transition-all duration-150",
									h.level >= 3 ? "pl-5" : "pl-3",
									isActive
										? "border-black font-medium text-black"
										: "border-transparent text-black/40 hover:border-black/25 hover:text-black/70",
								)}
								href={`#${h.id}`}
								onClick={(e) => {
									e.preventDefault();
									document
										.getElementById(h.id)
										?.scrollIntoView({ behavior: "smooth", block: "start" });
								}}
							>
								{h.text}
							</a>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
