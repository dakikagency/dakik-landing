"use client";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface TextRevealProps {
	text: string;
	className?: string;
	charDelay?: number;
}

export function CharacterReveal({
	text,
	className,
	charDelay = 0.02,
}: TextRevealProps) {
	const prefersReducedMotion = useReducedMotion();
	const letters = text.split("");

	if (prefersReducedMotion) {
		return <span className={className}>{text}</span>;
	}

	return (
		<motion.span
			className={className}
			initial="hidden"
			viewport={{ once: true }}
			whileInView="visible"
		>
			{letters.map((letter, i) => (
				<motion.span
					key={`char-${i}-${letter}`}
					transition={{ duration: 0.3, delay: i * charDelay }}
					variants={{
						hidden: { opacity: 0, y: 20 },
						visible: { opacity: 1, y: 0 },
					}}
				>
					{letter}
				</motion.span>
			))}
		</motion.span>
	);
}

export function WordReveal({
	text,
	className,
}: Omit<TextRevealProps, "charDelay">) {
	const prefersReducedMotion = useReducedMotion();
	const words = text.split(" ");

	if (prefersReducedMotion) {
		return <p className={className}>{text}</p>;
	}

	return (
		<motion.p
			className={className}
			initial="hidden"
			viewport={{ once: true }}
			whileInView="visible"
		>
			{words.map((word, i) => (
				<span
					className="inline-block overflow-hidden"
					key={`word-${i}-${word}`}
				>
					<motion.span
						className="inline-block"
						transition={{ duration: 0.5, delay: i * 0.1 }}
						variants={{
							hidden: { y: "100%" },
							visible: { y: 0 },
						}}
					>
						{word}&nbsp;
					</motion.span>
				</span>
			))}
		</motion.p>
	);
}
