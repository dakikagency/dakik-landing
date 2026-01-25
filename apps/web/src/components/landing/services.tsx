"use client";

import Image from "next/image";
import Link from "next/link";
import { GridBackdrop } from "@/components/ui/reactbits/grid-backdrop";
import { HoverReveal } from "@/components/ui/reactbits/hover-reveal";
import { LogoStrip } from "@/components/ui/reactbits/logo-strip";

const steps = [
	{
		label: "01 / Discover",
		title: "We map the real problem",
		description:
			"Short call, fast audit, then we define what ‘done’ means. Scope stays tight so you ship, not spiral.",
		meta: "1–2 days",
	},
	{
		label: "02 / Design",
		title: "Systems, not vibes",
		description:
			"Typography, layout rules, and reusable blocks. Looks premium, stays consistent, scales clean.",
		meta: "3–7 days",
	},
	{
		label: "03 / Build",
		title: "Ship the thing",
		description:
			"Next.js + Tailwind + motion where it matters. Clean code, fast pages, proper SEO hygiene.",
		meta: "1–3 weeks",
	},
	{
		label: "04 / Improve",
		title: "Measure → iterate",
		description:
			"Analytics, experiments, and conversion tweaks. Small changes, big wins — no guesswork.",
		meta: "ongoing",
	},
];

export function ServicesSection() {
	return (
		<section
			className="relative z-30 mx-auto bg-white px-[clamp(1rem,5vw,4rem)] py-16 text-black md:py-24"
			id="services"
		>
			<GridBackdrop className="opacity-90" />
			<div className="relative mx-auto max-w-6xl">
				<div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
					<div className="lg:col-span-5">
						<span className="inline-block font-mono text-black/50 text-xs uppercase tracking-widest">
							How we work
						</span>
						<h2 className="mt-3 font-black font-display text-[clamp(2.4rem,5vw,4.2rem)] uppercase leading-[0.85] tracking-[-0.04em]">
							No waffle.
							<br />
							Just shipping.
						</h2>
						<p className="mt-4 max-w-[52ch] text-black/70">
							We build digital products with a strict system: define, design,
							build, then improve. Detailed enough to feel premium — short
							enough that you won’t drown in text.
						</p>

						<div className="mt-6 flex flex-wrap gap-3">
							<Link
								className="inline-flex border-2 border-black bg-white px-4 py-3 font-mono text-black text-xs uppercase tracking-widest hover:bg-black hover:text-white"
								href="/survey"
							>
								Start a project
							</Link>
							<Link
								className="inline-flex border-2 border-black/30 bg-white px-4 py-3 font-mono text-black text-xs uppercase tracking-widest hover:border-black"
								href="#faq"
							>
								See FAQs
							</Link>
						</div>

						<div className="mt-8">
							<LogoStrip />
						</div>

						<div className="mt-6 border-2 border-black bg-white p-3">
							<div className="relative aspect-[3/2] w-full overflow-hidden border-2 border-black bg-white">
								<Image
									alt="Dakik process illustration"
									className="animate-float-y object-cover"
									fill
									priority={false}
									src="/landing/services-art.svg"
								/>
							</div>
							<div className="mt-3 flex items-center justify-between gap-4">
								<span className="font-mono text-[11px] text-black/60 uppercase tracking-widest">
									Blueprint mode
								</span>
								<span className="font-mono text-[11px] text-black/40 uppercase tracking-widest">
									Square / mono / fast
								</span>
							</div>
						</div>
					</div>

					<div className="lg:col-span-7">
						<div className="grid grid-cols-1 gap-4">
							{steps.map((s) => (
								<HoverReveal
									description={s.description}
									key={s.label}
									label={s.label}
									meta={s.meta}
									title={s.title}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
