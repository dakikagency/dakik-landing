import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

export function useActiveSection(ids: string[]): string {
	const [activeId, setActiveId] = useState(ids[0] ?? "");

	useEffect(() => {
		if (!ids.length) return;

		// Scroll-spy with a "reading line" one third of the way down the
		// viewport. The active section is the last heading whose top has
		// scrolled above that line. Computed directly on scroll — cheap for a
		// short TOC, and (unlike a rAF throttle) keeps working when the page
		// reports hidden, e.g. headless/preview environments.
		const compute = () => {
			const line = window.innerHeight / 3;
			let current = ids[0];
			for (const id of ids) {
				const el = document.getElementById(id);
				if (!el) continue;
				if (el.getBoundingClientRect().top <= line) {
					current = id;
				} else {
					break;
				}
			}
			setActiveId((prev) => (prev === current ? prev : current));
		};

		compute();
		window.addEventListener("scroll", compute, { passive: true });
		window.addEventListener("resize", compute, { passive: true });
		return () => {
			window.removeEventListener("scroll", compute);
			window.removeEventListener("resize", compute);
		};
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
			<p className="font-mono text-[10px] text-black/60 uppercase tracking-[0.35em]">
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
