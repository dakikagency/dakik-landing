"use client";
import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export const staggerContainer: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.2,
		},
	},
};

export const staggerItem: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5 },
	},
};

export const staggerContainerReduced: Variants = {
	hidden: { opacity: 1 },
	visible: { opacity: 1 },
};

export const staggerItemReduced: Variants = {
	hidden: { opacity: 1, y: 0 },
	visible: { opacity: 1, y: 0 },
};

interface StaggerContainerProps {
	children: ReactNode;
	className?: string;
}

export function StaggerContainer({
	children,
	className,
}: StaggerContainerProps) {
	const prefersReducedMotion = useReducedMotion();

	if (prefersReducedMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			className={className}
			initial="hidden"
			variants={staggerContainer}
			viewport={{ once: true, margin: "-50px" }}
			whileInView="visible"
		>
			{children}
		</motion.div>
	);
}

export function StaggerItem({ children, className }: StaggerContainerProps) {
	const prefersReducedMotion = useReducedMotion();

	if (prefersReducedMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div className={className} variants={staggerItem}>
			{children}
		</motion.div>
	);
}
