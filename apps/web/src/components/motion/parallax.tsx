"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { type ReactNode, useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface ParallaxProps {
	children: ReactNode;
	speed?: number;
	className?: string;
}

export function Parallax({ children, speed = 0.5, className }: ParallaxProps) {
	const prefersReducedMotion = useReducedMotion();
	const ref = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"],
	});

	const y = useTransform(scrollYProgress, [0, 1], [0, speed * 200]);

	if (prefersReducedMotion) {
		return (
			<div className={className} ref={ref}>
				{children}
			</div>
		);
	}

	return (
		<motion.div className={className} ref={ref} style={{ y }}>
			{children}
		</motion.div>
	);
}
