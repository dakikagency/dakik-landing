"use client";

import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props<T extends ElementType> = {
	as?: T;
	className?: string;
	children: ReactNode;
} & HTMLAttributes<HTMLElement>;

/**
 * MagicUI-ish shimmer button but square/industrial.
 * Use `as={Link}` if needed.
 */
export function ShimmerButton<T extends ElementType = "button">({
	as,
	className,
	children,
	...props
}: Props<T>) {
	const Comp = (as ?? "button") as ElementType;

	return (
		<Comp
			className={cn(
				"group relative inline-flex items-center justify-center overflow-hidden",
				"border border-black/10 bg-black px-5 py-3 text-white",
				"shadow-[0_12px_35px_rgba(0,0,0,0.25)]",
				"transition-transform duration-200 active:scale-[0.99]",
				className
			)}
			{...props}
		>
			<span className="relative z-10">{children}</span>
			<span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
				<span className="absolute inset-0 translate-x-[-60%] animate-shimmer-slide bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.25),transparent)]" />
			</span>
		</Comp>
	);
}
