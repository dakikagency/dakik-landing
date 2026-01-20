"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { Reveal } from "@/components/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import Noise from "../noise";

export function Hero() {
	const sectionRef = useRef<HTMLElement>(null);
	const prefersReducedMotion = useReducedMotion();

	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ["start start", "end start"],
	});

	// Text fades out as user scrolls
	const textOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

	// Video expands to fullscreen
	const videoWidth = useTransform(
		scrollYProgress,
		[0, 0.3, 1],
		["50%", "100vw", "100vw"]
	);
	const videoRight = useTransform(
		scrollYProgress,
		[0, 0.3, 1],
		["20px", "0px", "0px"]
	);
	const videoBottom = useTransform(
		scrollYProgress,
		[0, 0.3, 1],
		["20px", "0px", "0px"]
	);

	return (
		<section
			className="relative h-[200vh] bg-background text-foreground"
			id="hero"
			ref={sectionRef}
		>
			<div className="sticky top-0 h-screen overflow-hidden">
				{/* Text content - fades out on scroll */}
				<motion.div
					className="relative mx-auto flex h-full flex-col px-[clamp(1rem,5vw,4rem)] pt-[clamp(6rem,15vh,10rem)] pb-[clamp(2rem,5vh,4rem)]"
					style={{ opacity: prefersReducedMotion ? 1 : textOpacity }}
				>
					{/* Main Headline */}
					<div className="flex-1">
						<Reveal delay={0.1} direction="up">
							<h1 className="relative block text-left font-black font-display text-5xl uppercase leading-[0.7em] tracking-[-0.03em] lg:inline lg:text-8xl">
								<span className="leading-[0.6em]">WE DELIVER</span>
								<br className="leading-[0.6em]" />
								<span className="relative block leading-none lg:inline">
									<span className="text-nowrap leading-[0.7em]">
										DIGITAL PRODUCTS
									</span>
									<span className="absolute top-0 left-0 mt-[0.84em] w-full lg:mt-[1em]">
										<span className="items-center-safe block text-5xl leading-none lg:inline lg:flex lg:flex-1 lg:text-8xl">
											<span className="text-nowrap leading-[0.7em]">
												BLOODY WORK
											</span>
											<Link
												className="group mt-[0.20em] ml-[0.1em] inline-flex h-[1em] w-full translate-y-[-0.08em] items-center justify-center border-4 border-foreground bg-background px-[0.25em] align-middle transition-all duration-300 hover:bg-foreground hover:text-background lg:h-[0.72em] lg:w-[calc(100%-0.1em-16px)] lg:border-8"
												href="/survey"
											>
												<span className="text-nowrap font-display font-medium text-lg uppercase tracking-wider">
													Start a Project
												</span>
											</Link>
										</span>
									</span>
								</span>
							</h1>
						</Reveal>
					</div>

					{/* Scroll Indicator */}
					<Reveal
						className="absolute top-1/2 right-[clamp(1rem,5vw,4rem)] hidden -translate-y-1/2 lg:block"
						delay={0.6}
						direction="right"
					>
						<span className="font-display text-sm tracking-wide">(Scroll)</span>
					</Reveal>

					{/* Description */}
					<div className="mt-auto mb-32 lg:mb-0">
						<Reveal delay={0.4} direction="down">
							<p className="w-[25ch] text-3xl text-foreground/90 leading-[1.15]">
								Boutique digital agency crafting premium experiences through AI
								automation, brand identity, and custom development.
							</p>
						</Reveal>
					</div>
				</motion.div>

				{/* Video - expands to fullscreen on scroll */}
				{prefersReducedMotion ? (
					<div className="absolute right-[clamp(1rem,5vw,4rem)] bottom-[clamp(2rem,5vh,4rem)] w-1/2">
						<video
							autoPlay
							className="h-full w-full object-cover shadow-2xl"
							loop
							muted
							playsInline
							src="/video.mp4"
						/>
						<VideoCorners />
					</div>
				) : (
					<motion.div
						className="absolute aspect-video"
						style={{
							width: videoWidth,
							right: videoRight,
							bottom: videoBottom,
							willChange: "width, height, right, bottom",
						}}
					>
						<video
							autoPlay
							className="h-full w-full object-cover shadow-2xl"
							loop
							muted
							playsInline
							src="/video.mp4"
						/>
						<VideoCorners />
					</motion.div>
				)}

				<Noise
					patternAlpha={25}
					patternRefreshInterval={2}
					patternScaleX={1}
					patternScaleY={1}
					patternSize={500}
				/>
			</div>
		</section>
	);
}

function VideoCorners() {
	return (
		<div className="pointer-events-none absolute inset-0">
			<span className="absolute -top-1.5 -left-1.5 h-5 w-1 bg-foreground" />
			<span className="absolute -top-1.5 -left-1 h-1 w-4 bg-foreground" />
			<span className="absolute -top-1.5 -right-1.5 h-5 w-1 bg-foreground" />
			<span className="absolute -top-1.5 -right-1 h-1 w-4 bg-foreground" />
			<span className="absolute -bottom-1.5 -left-1.5 h-5 w-1 bg-foreground" />
			<span className="absolute -bottom-1.5 -left-1 h-1 w-4 bg-foreground" />
			<span className="absolute -right-1.5 -bottom-1.5 h-5 w-1 bg-foreground" />
			<span className="absolute -right-1 -bottom-1.5 h-1 w-4 bg-foreground" />
		</div>
	);
}
