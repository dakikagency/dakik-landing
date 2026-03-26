import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface StaggerItemProps {
	children: ReactNode;
	className?: string;
}

export function StaggerItem({ children, className = "" }: StaggerItemProps) {
	const shouldReduceMotion = useReducedMotion();

	const itemVariants: Variants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: shouldReduceMotion ? 0 : 0.4 },
		},
	};

	return (
		<motion.div className={className} variants={itemVariants}>
			{children}
		</motion.div>
	);
}
