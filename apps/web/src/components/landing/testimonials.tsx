"use client";

import { InfiniteMovingCards } from "@/components/ui/aceternity/infinite-moving-cards";
import { GridBackdrop } from "@/components/ui/reactbits/grid-backdrop";

const testimonials = [
	{
		name: "Erkan",
		title: "Founder",
		quote: "Fast, clean delivery. Felt like having an in-house team overnight.",
	},
	{
		name: "Aylin",
		title: "Product Lead",
		quote:
			"Design system snapped into place and conversions went up in a week.",
	},
	{
		name: "Hyejin",
		title: "Designer",
		quote: "Sharp typography, great motion, and zero fluff. Loved the craft.",
	},
	{
		name: "Mert",
		title: "CTO",
		quote: "They shipped a landing + pipeline that didn’t fall apart at scale.",
	},
];

export function Testimonials() {
	return (
		<section
			className="relative mx-auto bg-white px-[clamp(1rem,5vw,4rem)] py-16 text-black md:py-24"
			id="testimonials"
		>
			<GridBackdrop className="opacity-90" />
			<div className="relative mx-auto max-w-6xl">
				<div className="mb-10">
					<span className="mb-3 inline-block font-medium text-black/50 text-sm uppercase tracking-widest">
						Testimonials
					</span>
					<h2 className="font-bold text-display-md tracking-tight">
						People ship faster with us
					</h2>
					<p className="mt-3 max-w-[60ch] text-black/70">
						Short, punchy feedback from founders and teams we’ve helped.
					</p>
				</div>
				<InfiniteMovingCards items={testimonials} />
			</div>
		</section>
	);
}
