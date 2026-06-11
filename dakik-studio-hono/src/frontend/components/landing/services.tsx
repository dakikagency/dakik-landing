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
	img: string;
}

const steps: readonly Step[] = [
	{
		num: "01",
		label: "Discover",
		angle: "We map the real problem",
		body: "Short call, fast audit, then we define what 'done' means. Scope stays tight so you ship, not spiral.",
		meta: "1–2 days",
		img: "/landing/services-discover.webp",
	},
	{
		num: "02",
		label: "Design",
		angle: "Systems, not vibes",
		body: "Typography, layout rules, and reusable blocks. Premium look, consistent system, ready to scale.",
		meta: "3–7 days",
		img: "/landing/services-design.webp",
	},
	{
		num: "03",
		label: "Build",
		angle: "Ship the thing",
		body: "Hono, React, Tailwind, motion where it matters. Clean code, fast pages, SEO baked in.",
		meta: "1–3 weeks",
		img: "/landing/services-build.webp",
	},
	{
		num: "04",
		label: "Improve",
		angle: "Measure, then iterate",
		body: "Analytics, experiments, conversion tweaks. Small changes, big wins — no guesswork.",
		meta: "ongoing",
		img: "/landing/services-improve.webp",
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
function Panel({ step, showImage = false }: { step: Step; showImage?: boolean }) {
	return (
		<article className="relative h-full w-screen shrink-0">
			{/* Reduced-motion branch only: static per-panel artwork. The
			    animated branch renders artwork once in the shared stage
			    instead, so it can crossfade between panels. First in DOM so
			    the text clusters paint above it. */}
			{showImage && (
				<img
					alt=""
					className="pointer-events-none absolute top-1/2 right-[clamp(1.5rem,6vw,6rem)] h-[min(52vh,72vw)] w-auto -translate-y-1/2 select-none object-contain grayscale mix-blend-multiply"
					decoding="async"
					draggable={false}
					height={1024}
					loading="lazy"
					src={step.img}
					width={1024}
				/>
			)}

			{/* Top labels — anchored to top */}
			<div className="absolute inset-x-[clamp(1.5rem,6vw,6rem)] top-[clamp(5.5rem,12vh,7rem)] flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
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

/** Clamped 0→1 progress of p through [a, b]. */
function ramp(p: number, a: number, b: number): number {
	return Math.min(1, Math.max(0, (p - a) / (b - a)));
}

/**
 * One artwork in the shared sticky stage. All four images occupy the
 * same box; scroll position decides which one is visible. Each image
 * owns the scroll range centred on its panel (centre = index/(count-1),
 * half-window to the adjacent panel's midpoint). Fades complete exactly
 * at panel midpoints, so one image is fully gone before the next
 * appears — no double-exposure mid-transition. Scale and x drift across
 * the whole window read as parallax against the faster-moving panels.
 *
 * Images are greyscale-on-white and multiply-blended, so their frames
 * are invisible against the white section — only the marble shows.
 *
 * IMPORTANT: these use the function form of useTransform, not the
 * keyframe-array form. The array form lets framer promote the
 * animation to a native ScrollTimeline, which Chrome then binds to
 * PAGE scroll — the section's target offsets get lost and every value
 * maps to the wrong scroll range (observed in dev and prod builds).
 * The function form stays JS-driven and tracks the section correctly.
 */
function StageImage({
	progress,
	index,
	count,
	src,
}: {
	progress: MotionValue<number>;
	index: number;
	count: number;
	src: string;
}) {
	const center = index / (count - 1);
	const half = 0.5 / (count - 1);
	const fade = 0.07;

	const opacity = useTransform(() => {
		const p = progress.get();
		const fadeIn = index > 0 ? ramp(p, center - half, center - half + fade) : 1;
		const fadeOut =
			index < count - 1 ? 1 - ramp(p, center + half - fade, center + half) : 1;
		return Math.min(fadeIn, fadeOut);
	});
	// 0→1 across this image's whole window; drives the parallax drift.
	const x = useTransform(
		() => `${4 - 8 * ramp(progress.get(), center - half, center + half)}%`,
	);
	const scale = useTransform(
		() => 1.04 - 0.07 * ramp(progress.get(), center - half, center + half),
	);

	return (
		<motion.img
			alt=""
			className="absolute inset-0 h-full w-full object-contain grayscale mix-blend-multiply"
			decoding="async"
			draggable={false}
			height={1024}
			loading="lazy"
			src={src}
			style={{ opacity, scale, x }}
			width={1024}
		/>
	);
}

/**
 * One progress marker. Width and opacity grow while its panel is on
 * screen — function-form useTransform writes directly to the DOM
 * style, no React re-render fires on scroll (see StageImage for why
 * the keyframe-array form is avoided). Extracted so each instance
 * owns its own hook call (rules of hooks).
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
	const active = useTransform(() => {
		const p = progress.get();
		const fadeIn = start <= 0 ? 1 : ramp(p, start - 0.05, start);
		const fadeOut = end >= 1 ? 1 : 1 - ramp(p, end, end + 0.05);
		return Math.min(fadeIn, fadeOut);
	});
	const opacity = useTransform(() => 0.25 + 0.75 * active.get());
	const width = useTransform(() => 16 + 24 * active.get());
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
				<div className="divide-y divide-black/10 pt-[clamp(4rem,10vh,7rem)]">
					{steps.map((step) => (
						<div className="min-h-[80vh]" key={step.num}>
							<Panel showImage step={step} />
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

				{/* Shared artwork stage. Stays put while panels slide past;
				    images hand off to each other at panel midpoints. Upper-
				    centre on mobile (clear of the bottom text cluster),
				    right-of-centre on desktop where headlines can overlap
				    the marble for an editorial layer. */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute top-[17vh] left-1/2 h-[min(44vh,85vw)] w-[min(44vh,85vw)] -translate-x-1/2 select-none lg:top-1/2 lg:right-[4vw] lg:left-auto lg:h-[min(72vh,46vw)] lg:w-[min(72vh,46vw)] lg:-translate-x-0 lg:-translate-y-1/2"
				>
					{steps.map((step, i) => (
						<StageImage
							count={steps.length}
							index={i}
							key={step.num}
							progress={scrollYProgress}
							src={step.img}
						/>
					))}
				</div>

				<motion.div
					className="relative flex h-full will-change-transform"
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
