"use client";

import { cn } from "@/lib/utils";

/**
 * ReactBits-ish grid backdrop, but aligned to Dakik's monochrome tokens.
 * Square/industrial (no rounded). Reduced-motion safe (static).
 */
export function GridBackdrop({
	className,
	density = 32,
}: {
	className?: string;
	density?: number;
}) {
	return (
		<div
			aria-hidden="true"
			className={cn("pointer-events-none absolute inset-0", className)}
			style={{
				backgroundImage: [
					"linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px)",
					"linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)",
					"radial-gradient(circle at 50% 0%, rgba(0,0,0,0.08), transparent 55%)",
				].join(","),
				backgroundSize: `${density}px ${density}px, ${density}px ${density}px, 100% 100%`,
				backgroundPosition: "center",
			}}
		/>
	);
}
