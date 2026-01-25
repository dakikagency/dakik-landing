"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function ShimmerButton({
	className,
	children,
	asChild,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
	asChild?: boolean;
}) {
	const Comp: any = asChild ? "span" : "button";
	return (
		<Comp
			className={cn(
				"group relative inline-flex items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-black px-5 py-3 text-white shadow-[0_12px_35px_rgba(0,0,0,0.25)]",
				"transition-transform duration-200 active:scale-[0.99]",
				className
			)}
			{...props}
		>
			<span className="relative z-10">{children}</span>
			<span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
				<span className="absolute inset-0 translate-x-[-60%] bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.25),transparent)] animate-shimmer-slide" />
			</span>
		</Comp>
	);
}
