"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Heading {
	id: string;
	text: string;
	level: 2 | 3;
}

interface TableOfContentsProps {
	headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
	const [activeId, setActiveId] = useState<string>("");

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				}
			},
			{ rootMargin: "-80px 0px -70% 0px", threshold: 0 }
		);

		for (const heading of headings) {
			const el = document.getElementById(heading.id);
			if (el) {
				observer.observe(el);
			}
		}

		return () => observer.disconnect();
	}, [headings]);

	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
			e.preventDefault();
			const el = document.getElementById(id);
			if (el) {
				el.scrollIntoView({ behavior: "smooth" });
			}
		},
		[]
	);

	if (headings.length === 0) {
		return null;
	}

	return (
		<nav aria-label="Table of contents">
			<p className="mb-4 font-semibold text-gray-400 text-sm uppercase tracking-wider">
				On this page
			</p>
			<ul className="space-y-1">
				{headings.map((heading) => (
					<li key={heading.id}>
						<a
							className={cn(
								"block border-l-[3px] py-1.5 text-sm transition-colors",
								heading.level === 3 ? "pl-6" : "pl-4",
								activeId === heading.id
									? "border-black font-medium text-black"
									: "border-transparent text-gray-500 hover:text-gray-800"
							)}
							href={`#${heading.id}`}
							onClick={(e) => handleClick(e, heading.id)}
						>
							{heading.text}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
