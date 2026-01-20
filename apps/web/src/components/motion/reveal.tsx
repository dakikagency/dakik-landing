"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface RevealProps {
	children: ReactNode;
	direction?: "up" | "down" | "left" | "right";
	delay?: number;
	className?: string;
}

const directions = {
	up: { y: 40 },
	down: { y: -40 },
	left: { x: 40 },
	right: { x: -40 },
};

export function Reveal({
	children,
	direction = "up",
	delay = 0,
	className,
}: RevealProps) {
	const prefersReducedMotion = useReducedMotion();

	if (prefersReducedMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, ...directions[direction] }}
			transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
			viewport={{ once: true, margin: "-100px" }}
			whileInView={{ opacity: 1, x: 0, y: 0 }}
		>
			{children}
		</motion.div>
	);
}
