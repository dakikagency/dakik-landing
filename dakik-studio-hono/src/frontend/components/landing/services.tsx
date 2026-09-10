"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import "./services.css";

const steps = [
	{
		id: "discover",
		label: "Discover",
		angle: "We map the real problem.",
		body: "Short call, fast audit, then we define what ‘done’ means. Scope stays tight so you ship, not spiral.",
		meta: "1-2 days",
	},
	{
		id: "design",
		label: "Design",
		angle: "Systems, not vibes.",
		body: "Typography, layout rules, and reusable blocks. Premium look, consistent system, ready to scale.",
		meta: "3-7 days",
	},
	{
		id: "build",
		label: "Build",
		angle: "Ship the thing.",
		body: "Hono, React, Tailwind, motion where it matters. Clean code, fast pages, SEO baked in.",
		meta: "1-3 weeks",
	},
	{
		id: "improve",
		label: "Improve",
		angle: "Measure, then iterate.",
		body: "Analytics, experiments, conversion tweaks. Small changes, big wins. No guesswork.",
		meta: "Ongoing",
	},
] as const;

function ServiceRow({
	step,
	index,
	active,
}: {
	step: (typeof steps)[number];
	index: number;
	active: boolean;
}) {
	const ref = useRef<HTMLLIElement>(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "start center"],
	});
	// Function transforms retain section-relative offsets in browsers that
	// otherwise promote keyframe transforms to a document ScrollTimeline.
	const y = useTransform(() => (1 - scrollYProgress.get()) * 44);
	const opacity = useTransform(() => 0.45 + scrollYProgress.get() * 0.55);

	return (
		<li
			className="service-row"
			data-active={active}
			data-service-index={index}
			id={`service-${step.id}`}
			ref={ref}
		>
			<div className="service-row-meta">
				<span className="service-row-number">0{index + 1}</span>
				<span>{step.meta}</span>
			</div>
			<h3 className="service-title">
				<motion.span
					className="service-title-reveal"
					style={{ y, opacity }}
				>
					{step.label}<span className="service-title-period">.</span>
				</motion.span>
			</h3>
			<div className="service-description">
				<p className="service-angle">{step.angle}</p>
				<p className="service-body">{step.body}</p>
			</div>
		</li>
	);
}

export function ServicesSection() {
	const listRef = useRef<HTMLOListElement>(null);
	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		const rows = listRef.current?.querySelectorAll<HTMLElement>(
			"[data-service-index]",
		);
		if (!rows) return;

		let observer: IntersectionObserver;
		const observe = () => {
			observer?.disconnect();
			// Keep anchor navigation on the chosen step even on tall screens
			// where several complete rows can be visible at once.
			const readingLine = Math.min(window.innerHeight * 0.4, 240);
			const updateActiveStep = () => {
				let next = 0;
				for (const row of rows) {
					if (row.getBoundingClientRect().top > readingLine) break;
					next = Number(row.dataset.serviceIndex);
				}
				setActiveIndex(next);
			};
			// A one-pixel reading line handles forward/backward scrolling and
			// anchor jumps. Pixel margins also work in narrow, tall viewports.
			observer = new IntersectionObserver(updateActiveStep, {
				rootMargin: `-${readingLine}px 0px -${window.innerHeight - readingLine - 1}px 0px`,
				threshold: 0,
			});
			for (const row of rows) observer.observe(row);
			updateActiveStep();
		};
		observe();
		window.addEventListener("resize", observe);
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", observe);
		};
	}, []);

	return (
		<section aria-labelledby="services-heading" className="services" id="services">
			<header className="services-intro">
				<p className="services-caption">// Services</p>
				<h2 id="services-heading">
					From first idea<br />
					to what’s next.
				</h2>
			</header>

			<div className="services-layout">
				<aside className="services-index">
					<p className="services-index-label">One team. Every step.</p>
					<div aria-hidden="true" className="services-counter">
						<span>0</span>
						<div className="services-counter-window">
							<div
								className="services-counter-reel"
								style={{ transform: `translateY(${activeIndex * -25}%)` }}
							>
								{steps.map((step, index) => (
									<span key={step.id}>{index + 1}</span>
								))}
							</div>
						</div>
					</div>
					<nav aria-label="Our process" className="services-nav">
						{steps.map((step, index) => (
							<a
								aria-current={activeIndex === index ? "step" : undefined}
								href={`#service-${step.id}`}
								key={step.id}
							>
								<span className="services-nav-number">0{index + 1}</span>
								{step.label}
							</a>
						))}
					</nav>
				</aside>

				<ol className="services-list" ref={listRef}>
					{steps.map((step, index) => (
						<ServiceRow
							active={activeIndex === index}
							index={index}
							key={step.id}
							step={step}
						/>
					))}
				</ol>
			</div>
		</section>
	);
}
