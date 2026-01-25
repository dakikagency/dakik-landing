"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Item = {
	name: string;
	title?: string;
	quote: string;
};

export function InfiniteMovingCards({
	items,
	className,
	speed = "normal",
	direction = "left",
	pauseOnHover = true,
}: {
	items: Item[];
	className?: string;
	speed?: "slow" | "normal" | "fast";
	direction?: "left" | "right";
	pauseOnHover?: boolean;
}) {
	const duration = speed === "slow" ? "60s" : speed === "fast" ? "25s" : "40s";
	const dir = direction === "left" ? "forwards" : "reverse";

	// Duplicate list for seamless loop
	const loopItems = React.useMemo(() => [...items, ...items], [items]);

	return (
		<div
			className={cn(
				"relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
				className
			)}
		>
			<div
				className={cn(
					"flex w-max gap-4 py-2",
					"animate-infinite-scroll",
					pauseOnHover && "hover:[animation-play-state:paused]"
				)}
				style={
					{
						["--animation-duration" as any]: duration,
						["--animation-direction" as any]: dir,
					} as React.CSSProperties
				}
			>
				{loopItems.map((item, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: deterministic duplicated list
						key={i}
						className="w-[280px] shrink-0 rounded-2xl border border-black/10 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
					>
						<p className="text-balance text-sm text-black/80">“{item.quote}”</p>
						<div className="mt-4">
							<div className="font-medium text-black">{item.name}</div>
							{item.title ? (
								<div className="text-xs text-black/50">{item.title}</div>
							) : null}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
