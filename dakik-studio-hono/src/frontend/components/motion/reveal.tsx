import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
	children: ReactNode;
	direction?: "up" | "down" | "left" | "right";
	delay?: number;
	duration?: number;
	className?: string;
}

export function Reveal({
	children,
	direction = "up",
	delay = 0,
	duration = 0.5,
	className = "",
}: RevealProps) {
	const shouldReduceMotion = useReducedMotion();

	const variants: Variants = {
		hidden: {
			opacity: 0,
			y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
			x: direction === "left" ? 40 : direction === "right" ? -40 : 0,
		},
		visible: {
			opacity: 1,
			y: 0,
			x: 0,
		},
	};

	return (
		<motion.div
			className={className}
			initial="hidden"
			transition={{
				duration: shouldReduceMotion ? 0 : duration,
				delay: shouldReduceMotion ? 0 : delay,
				ease: [0.25, 0.25, 0.25, 0.75],
			}}
			variants={variants}
			viewport={{ once: true, margin: "-100px" }}
			whileInView="visible"
		>
			{children}
		</motion.div>
	);
}
