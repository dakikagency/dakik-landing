"use client";

import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface Item {
	name: string;
	title?: string;
	quote: string;
}

type CssVars = CSSProperties & Record<string, string>;

interface Props {
	items: Item[];
	className?: string;
	speed?: "slow" | "normal" | "fast";
	direction?: "left" | "right";
	pauseOnHover?: boolean;
	renderCard?: (item: Item) => ReactNode;
}

export function InfiniteMovingCards({
	items,
	className,
	speed = "normal",
	direction = "left",
	pauseOnHover = true,
	renderCard,
}: Props) {
	let duration = "40s";
	if (speed === "slow") {
		duration = "60s";
	}
	if (speed === "fast") {
		duration = "25s";
	}

	const dir = direction === "left" ? "forwards" : "reverse";
	const loopItems = useMemo(() => [...items, ...items], [items]);

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
						"--animation-duration": duration,
						"--animation-direction": dir,
					} as CssVars
				}
			>
				{loopItems.map((item, i) => {
					const key = `${item.name}-${item.title ?? ""}-${i}`;
					return (
						<div key={key}>
							{renderCard ? (
								renderCard(item)
							) : (
								<div className="w-[280px] shrink-0 border border-black/10 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
									<p className="text-balance text-black/80 text-sm">
										“{item.quote}”
									</p>
									<div className="mt-4">
										<div className="font-medium text-black">{item.name}</div>
										{item.title ? (
											<div className="text-black/50 text-xs">{item.title}</div>
										) : null}
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
