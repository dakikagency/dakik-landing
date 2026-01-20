"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion";
import Noise from "../noise";

const faqs = [
	{
		question: "What is your design and development process?",
		answer:
			"We follow an iterative process: Discovery → Design → Development → Testing → Launch. Each phase includes client checkpoints to ensure alignment with your vision. We use agile methodologies for flexibility and rapid iteration.",
	},
	{
		question: "How long does a typical project take?",
		answer:
			"Project timelines vary based on scope. Sprint projects (MVPs) typically take 4-6 weeks. Growth optimization projects run 2-4 weeks. Overhaul projects are ongoing engagements. We'll provide a detailed timeline during our initial consultation.",
	},
	{
		question: "What technologies do you work with?",
		answer:
			"We specialize in modern web technologies: React, Next.js, TypeScript, Node.js, and various AI/ML tools. For mobile, we use React Native. We're also experienced with cloud platforms like AWS, Vercel, and Cloudflare.",
	},
	{
		question: "What are your pricing models?",
		answer:
			"We offer project-based pricing for defined scopes and retainer models for ongoing work. Our projects typically range from $5k-$50k+ depending on complexity. We'll provide a detailed proposal after understanding your requirements.",
	},
	{
		question: "Do you provide ongoing support after launch?",
		answer:
			"Yes! We offer maintenance and support packages to ensure your product stays up-to-date, secure, and performing optimally. This includes bug fixes, updates, and feature enhancements as needed.",
	},
];

interface AccordionItemProps {
	question: string;
	answer: string;
	isOpen: boolean;
	onToggle: () => void;
}

function AccordionItem({
	question,
	answer,
	isOpen,
	onToggle,
}: AccordionItemProps) {
	return (
		<div className="border-white/10 border-b">
			<button
				className="flex w-full items-center justify-between py-6 text-left"
				onClick={onToggle}
				type="button"
			>
				<span className="pr-4 font-medium text-lg">{question}</span>
				<motion.span
					animate={{ rotate: isOpen ? 180 : 0 }}
					transition={{ duration: 0.2 }}
				>
					{isOpen ? (
						<Minus className="h-5 w-5 flex-shrink-0" />
					) : (
						<Plus className="h-5 w-5 flex-shrink-0" />
					)}
				</motion.span>
			</button>
			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.div
						animate={{ height: "auto", opacity: 1 }}
						className="overflow-hidden"
						exit={{ height: 0, opacity: 0 }}
						initial={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
					>
						<p className="pb-6 text-gray-400">{answer}</p>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export function FAQ() {
	const [openIndex, setOpenIndex] = useState<number | null>(0);

	return (
		<section
			className="relative z-10 mx-auto w-full px-[clamp(1rem,5vw,4rem)] pt-16 md:pt-24 lg:px-[clamp(4rem,32vw,23rem)]"
			id="faq"
		>
			<div className="relative top-0 mx-auto flex w-auto w-full">
				<video
					autoPlay
					className="pointer-events-auto absolute z-10 aspect-video h-auto w-full lg:h-96 lg:w-auto"
					loop
					muted
					src="/faq.mp4"
				/>
				<div className="pointer-events-auto relative z-50 aspect-video h-auto w-full lg:h-96 lg:w-auto">
					<Noise
						patternAlpha={25}
						patternRefreshInterval={2}
						patternScaleX={1}
						patternScaleY={1}
						patternSize={500}
					/>
				</div>
			</div>
			<div className="mx-auto mt-20 w-full lg:px-[clamp(2rem,16vw,12.5rem)]">
				<Reveal direction="up">
					<div className="mb-4 text-left lg:mb-16">
						<span className="mb-4 inline-block font-medium text-gray-500 text-sm uppercase tracking-widest">
							FAQ
						</span>
						<h2 className="font-bold text-display-md tracking-tight">
							Common questions
						</h2>
					</div>
				</Reveal>

				<div className="mx-auto">
					<StaggerContainer>
						{faqs.map((faq, index) => (
							<StaggerItem key={faq.question}>
								<AccordionItem
									answer={faq.answer}
									isOpen={openIndex === index}
									onToggle={() =>
										setOpenIndex(openIndex === index ? null : index)
									}
									question={faq.question}
								/>
							</StaggerItem>
						))}
					</StaggerContainer>
				</div>
			</div>
			<div className="relative top-0 right-0 mt-12 mb-32 ml-auto flex w-fit">
				<video
					autoPlay
					className="pointer-events-auto absolute z-10 aspect-video h-auto w-full lg:h-96 lg:w-auto"
					loop
					muted
					src="/faq3.mp4"
				/>
				<div className="pointer-events-auto relative z-50 aspect-video h-auto w-full lg:h-96 lg:w-auto">
					<Noise
						patternAlpha={25}
						patternRefreshInterval={2}
						patternScaleX={1}
						patternScaleY={1}
						patternSize={500}
					/>
				</div>
			</div>
		</section>
	);
}
