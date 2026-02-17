"use client";

import { cn } from "@/lib/utils";

export function Spotlight({
	className,
	fill = "#ffffff",
}: {
	className?: string;
	fill?: string;
}) {
	return (
		<div
			aria-hidden="true"
			className={cn(
				"pointer-events-none absolute inset-0 overflow-hidden",
				className
			)}
		>
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_55%)]" />
			<div
				className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 animate-spotlight rounded-full opacity-0 blur-3xl"
				style={{ background: fill }}
			/>
		</div>
	);
}
