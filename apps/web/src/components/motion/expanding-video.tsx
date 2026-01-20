"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface ExpandingVideoProps {
	src: string;
}

export function ExpandingVideo({ src }: ExpandingVideoProps) {
	const prefersReducedMotion = useReducedMotion();
	const sectionRef = useRef<HTMLDivElement>(null);

	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ["start start", "end start"],
	});

	// Animation: video scales from 1 to cover full viewport
	// Using viewport units for consistent sizing
	const scale = useTransform(scrollYProgress, [-200, 100], [1, 2.1]);
	const x = useTransform(scrollYProgress, [-200, 100], ["10%", "-150%"]);
	const y = useTransform(scrollYProgress, [-200, 100], ["10%", "-185%"]);
	const opacity = useTransform(scrollYProgress, [0.85, 2], [1, 0]);

	if (prefersReducedMotion) {
		return (
			<section className="relative h-screen bg-background" ref={sectionRef}>
				<div className="absolute right-[clamp(1rem,5vw,4rem)] bottom-[clamp(2rem,5vh,4rem)] w-full lg:w-1/2">
					<div className="relative">
						<video
							autoPlay
							className="w-full object-cover shadow-2xl"
							loop
							muted
							playsInline
							src={src}
						/>
						<VideoCorners />
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="relative h-[200vh] bg-background" ref={sectionRef}>
			{/* Sticky container keeps video in view while scrolling */}
			<div className="sticky top-0 h-screen overflow-hidden">
				<motion.div
					className="absolute right-[clamp(1rem,5vw,4rem)] bottom-[clamp(2rem,5vh,4rem)] w-full origin-bottom-right lg:w-1/2"
					style={{
						scale,
						x,
						y,
						opacity,
						willChange: "transform, opacity",
					}}
				>
					<video
						autoPlay
						className="w-full object-cover shadow-2xl"
						loop
						muted
						playsInline
						src={src}
					/>
					<VideoCorners />
				</motion.div>
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
