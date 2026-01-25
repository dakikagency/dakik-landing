"use client";

import * as React from "react";
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
				"inline-block bg-[linear-gradient(90deg,var(--color-cta),#ff6b6b,#ffb703,var(--color-cta))] bg-[length:200%_100%] bg-clip-text text-transparent animate-gradient",
				className
			)}
		>
			{children}
		</span>
	);
}
