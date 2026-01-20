"use client";

import type * as React from "react";

import { cn } from "@/lib/utils";

// Generic Label component that wraps native label element
// Used with children elements or with htmlFor attribute pointing to input controls
function Label({ className, ...props }: React.ComponentProps<"label">) {
	return (
		<label
			className={cn(
				"flex select-none items-center gap-2 text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
				className
			)}
			data-slot="label"
			{...props}
		/>
	);
}

export { Label };
