"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface PageTransitionProps {
	children: ReactNode;
	className?: string;
}

const TRANSITION_DURATION = 0.25;

const pageVariants: Variants = {
	initial: {
		opacity: 0,
		y: 8,
	},
	enter: {
		opacity: 1,
		y: 0,
		transition: {
			duration: TRANSITION_DURATION,
			ease: [0.4, 0, 0.2, 1],
		},
	},
	exit: {
		opacity: 0,
		transition: {
			duration: TRANSITION_DURATION * 0.8,
			ease: [0.4, 0, 1, 1],
		},
	},
};

const reducedMotionVariants: Variants = {
	initial: { opacity: 1, y: 0 },
	enter: { opacity: 1, y: 0 },
	exit: { opacity: 1, y: 0 },
};

export function PageTransition({ children, className }: PageTransitionProps) {
	const prefersReducedMotion = useReducedMotion();

	const variants = prefersReducedMotion ? reducedMotionVariants : pageVariants;

	return (
		<AnimatePresence mode="wait">
			<motion.div
				animate="enter"
				className={className}
				exit="exit"
				initial="initial"
				variants={variants}
			>
				{children}
			</motion.div>
		</AnimatePresence>
	);
}
