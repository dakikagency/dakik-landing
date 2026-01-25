"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Tiny ReactBits-ish hover reveal.
 * Square borders only.
 */
export function HoverReveal({
	title,
	label,
	description,
	meta,
	className,
}: {
	title: string;
	label: string;
	description: string;
	meta?: string;
	className?: string;
}) {
	return (
		<motion.div
			className={cn(
				"group relative border border-black/15 bg-white p-6",
				"transition-colors",
				className
			)}
			initial={false}
			whileHover="hover"
		>
			<div className="flex items-baseline justify-between gap-6">
				<div>
					<div className="font-mono text-[12px] text-black/45 uppercase tracking-widest">
						{label}
					</div>
					<h3 className="mt-3 font-bold font-display text-3xl uppercase leading-[0.9] tracking-[-0.03em]">
						{title}
					</h3>
				</div>
				{meta ? (
					<div className="shrink-0 font-mono text-black/50 text-xs">{meta}</div>
				) : null}
			</div>

			<motion.p
				className="mt-4 max-w-[60ch] text-black/70"
				transition={{ duration: 0.2 }}
				variants={{
					hover: { y: -2, opacity: 1 },
				}}
			>
				{description}
			</motion.p>

			<motion.div
				className="pointer-events-none absolute inset-0 border-2 border-black/0"
				transition={{ duration: 0.2 }}
				variants={{ hover: { borderColor: "rgba(0,0,0,0.35)" } }}
			/>
		</motion.div>
	);
}
