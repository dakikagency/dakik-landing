import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps {
	children: ReactNode;
	delay?: number;
	duration?: number;
	className?: string;
}

export function FadeIn({
	children,
	delay = 0,
	duration = 0.5,
	className = "",
}: FadeInProps) {
	const shouldReduceMotion = useReducedMotion();

	const variants: Variants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1 },
	};

	return (
		<motion.div
			className={className}
			initial="hidden"
			transition={{
				duration: shouldReduceMotion ? 0 : duration,
				delay: shouldReduceMotion ? 0 : delay,
			}}
			variants={variants}
			viewport={{ once: true }}
			whileInView="visible"
		>
			{children}
		</motion.div>
	);
}
