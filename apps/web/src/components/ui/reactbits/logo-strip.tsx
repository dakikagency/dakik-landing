"use client";

import { cn } from "@/lib/utils";

const defaultLogos = [
	"Next.js",
	"React",
	"TypeScript",
	"Tailwind",
	"Framer",
	"Vercel",
	"Stripe",
	"Prisma",
	"tRPC",
];

export function LogoStrip({
	items = defaultLogos,
	className,
	label = "We ship with",
}: {
	items?: string[];
	className?: string;
	label?: string;
}) {
	return (
		<div className={cn("w-full", className)}>
			<p className="mb-3 font-mono text-[11px] text-black/50 uppercase tracking-widest">
				{label}
			</p>
			<div className="relative overflow-hidden border border-black/15 bg-white">
				<div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
				<div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />

				<div className="flex [--duration:28s]">
					<div className="flex animate-marquee items-center gap-4 px-4 py-3">
						{items.map((t) => (
							<div
								className="flex items-center gap-2 whitespace-nowrap border border-black/15 px-3 py-2 font-mono text-black/70 text-xs"
								key={t}
							>
								<span aria-hidden="true" className="h-2 w-2 bg-black" />
								{t}
							</div>
						))}
					</div>
					<div
						aria-hidden="true"
						className="flex animate-marquee items-center gap-4 px-4 py-3"
					>
						{items.map((t) => (
							<div
								className="flex items-center gap-2 whitespace-nowrap border border-black/15 px-3 py-2 font-mono text-black/70 text-xs"
								key={`dup-${t}`}
							>
								<span aria-hidden="true" className="h-2 w-2 bg-black" />
								{t}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
