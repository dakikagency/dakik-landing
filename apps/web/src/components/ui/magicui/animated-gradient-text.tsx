"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

export function AnimatedGradientText({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"inline-block animate-gradient bg-[length:200%_100%] bg-[linear-gradient(90deg,var(--color-cta),#ff6b6b,#ffb703,var(--color-cta))] bg-clip-text text-transparent",
				className
			)}
		>
			{children}
		</span>
	);
}
