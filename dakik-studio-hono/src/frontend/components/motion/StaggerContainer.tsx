import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface StaggerContainerProps {
	children: ReactNode;
	delay?: number;
	staggerDelay?: number;
	className?: string;
}

export function StaggerContainer({
	children,
	delay = 0,
	staggerDelay = 0.1,
	className = "",
}: StaggerContainerProps) {
	const shouldReduceMotion = useReducedMotion();

	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				delayChildren: shouldReduceMotion ? 0 : delay,
				staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
			},
		},
	};

	return (
		<motion.div
			className={className}
			initial="hidden"
			variants={containerVariants}
			viewport={{ once: true }}
			whileInView="visible"
		>
			{children}
		</motion.div>
	);
}
