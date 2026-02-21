"use client";

import React from "react"; // Added React import

export function Marquee() {
	const items = [
		{ id: "item-1", text: "BUILT FOR SCALE" },
		{ id: "item-2", text: "ZERO FLUFF" },
		{ id: "item-3", text: "MINIMAL BRUTALISM" },
		{ id: "item-4", text: "HIGH END MOTION" },
	];

	return (
		<div className="relative flex w-full overflow-hidden border-black border-y-4 bg-[#ffef00] py-4">
			<div className="flex w-max animate-marquee space-x-16">
				{/* Using a stable identifier for the two copies of the marquee content */}
				{["first-copy", "second-copy"].map((copyId) => (
					<div
						key={`marquee-group-${copyId}`}
						className="flex min-w-max items-center space-x-16"
					>
						{items.map((item) => (
							<React.Fragment key={`${copyId}-${item.id}`}>
								<span className="font-black font-display text-4xl text-black uppercase tracking-[-0.02em]">
									{item.text}
								</span>
								<span className="h-4 w-4 rounded-none bg-black" />
							</React.Fragment>
						))}
					</div>
				))}
			</div>
		</div>
	);
}
