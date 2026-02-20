import type * as React from "react";
import { cn } from "@/lib/utils";

type SeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
	orientation?: "horizontal" | "vertical";
	decorative?: boolean;
};

function Separator({
	className,
	orientation = "horizontal",
	decorative = true,
	...props
}: SeparatorProps) {
	return (
		<div
			aria-hidden={decorative}
			className={cn(
				"bg-border shrink-0",
				orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
				className
			)}
			data-orientation={orientation}
			role={decorative ? "none" : "separator"}
			{...props}
		/>
	);
}

export { Separator };
