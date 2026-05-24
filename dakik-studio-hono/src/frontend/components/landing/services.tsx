import {
	motion,
	type MotionValue,
	useScroll,
	useTransform,
} from "framer-motion";
import { useRef } from "react";

interface Step {
	num: string;
	label: string;
	angle: string;
	body: string;
	meta: string;
}

const steps: readonly Step[] = [
	{
		num: "01",
		label: "Discover",
		angle: "We map the real problem",
		body: "Short call, fast audit, then we define what 'done' means. Scope stays tight so you ship, not spiral.",
		meta: "1–2 days",
	},
	{
		num: "02",
		label: "Design",
		angle: "Systems, not vibes",
		body: "Typography, layout rules, and reusable blocks. Premium look, consistent system, ready to scale.",
		meta: "3–7 days",
	},
	{
		num: "03",
		label: "Build",
		angle: "Ship the thing",
		body: "Hono, React, Tailwind, motion where it matters. Clean code, fast pages, SEO baked in.",
		meta: "1–3 weeks",
	},
	{
		num: "04",
		label: "Improve",
		angle: "Measure, then iterate",
		body: "Analytics, experiments, conversion tweaks. Small changes, big wins — no guesswork.",
		meta: "ongoing",
	},
];

const TOTAL_LABEL = String(steps.length).padStart(2, "0");

/**
 * Render-time read of prefers-reduced-motion. No useEffect subscription —
 * the OS preference doesn't change mid-session in practice, so the cost of
 * waiting for an effect to fire (and re-rendering the whole section after)
 * isn't worth it. Saves one useEffect per mount.
 */
function getPrefersReducedMotion(): boolean {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Panel uses absolute positioning so the top-label row and the bottom
 * headline+body cluster sit at the same pixel position on every panel.
 * That guarantees horizontal alignment as the user scrolls between
 * panels — text doesn't jump up or down between transitions.
 *
 * No flex column, no mt-auto: those distribute space based on content
 * height, which varies between panels (different headline lengths)
 * and breaks cross-panel alignment.
 */
function Panel({ step }: { step: Step }) {
	return (
		<article className="relative h-full w-screen shrink-0">
			{/* Top labels — anchored to top */}
			<div className="absolute inset-x-[clamp(1.5rem,6vw,6rem)] top-[clamp(2rem,10vh,6rem)] flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
				<span className="font-mono text-[10px] text-black/55 uppercase tracking-[0.35em] sm:text-[11px]">
					{step.num} / {TOTAL_LABEL} · {step.label}
				</span>
				<span className="font-mono text-[10px] text-black/45 uppercase tracking-[0.3em] sm:text-[11px]">
					{step.meta}
				</span>
			</div>

			{/* Headline + body — bottom-anchored cluster. The body's bottom
			    edge sits at the same y on every panel; headlines grow upward
			    from above the body, so longer or shorter headlines don't
			    shift body position. */}
			<div className="absolute inset-x-[clamp(1.5rem,6vw,6rem)] bottom-[clamp(6rem,18vh,12rem)]">
				<h3 className="font-black text-[clamp(2rem,8vw,9rem)] uppercase leading-[0.9] tracking-[-0.04em] lg:leading-[0.88]">
					{step.angle}
				</h3>
				<p className="mt-5 max-w-[44ch] text-base text-black/70 leading-relaxed lg:mt-8 lg:text-lg">
					{step.body}
				</p>
			</div>
		</article>
	);
}

/**
 * One progress marker. Width and opacity grow while its panel is on
 * screen via useTransform — framer-motion writes directly to the DOM
 * style, no React re-render fires on scroll. Extracted so each
 * instance owns its own hook call (rules of hooks).
 */
function Dot({
	progress,
	start,
	end,
}: {
	progress: MotionValue<number>;
	start: number;
	end: number;
}) {
	const opacity = useTransform(
		progress,
		[Math.max(0, start - 0.05), start, end, Math.min(1, end + 0.05)],
		[0.25, 1, 1, 0.25],
	);
	const width = useTransform(
		progress,
		[Math.max(0, start - 0.05), start, end, Math.min(1, end + 0.05)],
		[16, 40, 40, 16],
	);
	return (
		<motion.span
			aria-hidden="true"
			className="h-0.5 bg-black"
			style={{ opacity, width }}
		/>
	);
}

export function ServicesSection() {
	const ref = useRef<HTMLElement>(null);
	const prefersReducedMotion = getPrefersReducedMotion();
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end end"],
	});

	// Map vertical scroll to horizontal translate.
	// scrollYProgress = 0 → panel 0 visible (x = 0)
	// scrollYProgress = 1 → panel N-1 visible (x = -(N-1)*100vw)
	const x = useTransform(
		scrollYProgress,
		[0, 1],
		["0vw", `-${(steps.length - 1) * 100}vw`],
	);

	if (prefersReducedMotion) {
		return (
			<section className="bg-white text-black" id="services">
				<header className="mx-auto max-w-6xl px-[clamp(1.5rem,6vw,6rem)] pt-24 pb-8">
					<span className="font-mono text-[11px] text-black/55 uppercase tracking-[0.35em]">
						How we work
					</span>
				</header>
				<div className="divide-y divide-black/10">
					{steps.map((step) => (
						<div className="min-h-[80vh]" key={step.num}>
							<Panel step={step} />
						</div>
					))}
				</div>
			</section>
		);
	}

	return (
		<section
			className="relative bg-white text-black"
			id="services"
			ref={ref}
			style={{ height: `${steps.length * 100}vh` }}
		>
			<div className="sticky top-0 h-screen w-full overflow-hidden">
				<div className="absolute top-[clamp(2rem,8vh,5rem)] left-[clamp(1.5rem,6vw,6rem)] z-10">
					<span className="font-mono text-[11px] text-black/55 uppercase tracking-[0.35em]">
						How we work
					</span>
				</div>

				<div className="absolute bottom-[clamp(2rem,6vh,4rem)] left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
					{steps.map((s, i) => (
						<Dot
							end={(i + 1) / steps.length}
							key={s.num}
							progress={scrollYProgress}
							start={i / steps.length}
						/>
					))}
				</div>

				<motion.div
					className="flex h-full will-change-transform"
					style={{ x }}
				>
					{steps.map((step) => (
						<Panel key={step.num} step={step} />
					))}
				</motion.div>
			</div>
		</section>
	);
}
