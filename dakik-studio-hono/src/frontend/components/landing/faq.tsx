import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface FaqItem {
	question: string;
	answer: string;
}

const faqs: readonly FaqItem[] = [
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
	index: number;
}

function AccordionItem({
	question,
	answer,
	isOpen,
	onToggle,
	index,
}: AccordionItemProps) {
	const contentId = `faq-panel-${index}`;
	return (
		<div className="border-black/10 border-t">
			<button
				aria-controls={contentId}
				aria-expanded={isOpen}
				className="group flex w-full items-start gap-6 py-7 text-left transition-colors hover:bg-black/[0.02] focus-visible:bg-black/[0.03] focus-visible:outline-none"
				onClick={onToggle}
				type="button"
			>
				<span className="mt-[0.55em] shrink-0 font-mono text-[11px] text-black/45 uppercase tracking-[0.35em] tabular-nums">
					{String(index + 1).padStart(2, "0")}
				</span>
				<span className="flex-1 font-medium text-lg leading-snug text-balance tracking-tight lg:text-2xl">
					{question}
				</span>
				<span
					aria-hidden="true"
					className="mt-[0.4em] shrink-0 font-mono text-base text-black/45 transition-colors group-hover:text-black"
				>
					{isOpen ? "—" : "+"}
				</span>
			</button>

			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.div
						animate={{ height: "auto", opacity: 1 }}
						className="overflow-hidden"
						exit={{ height: 0, opacity: 0 }}
						id={contentId}
						initial={{ height: 0, opacity: 0 }}
						role="region"
						transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
					>
						<div className="pb-8 pl-12 pr-6 lg:pl-[calc(11px+1.5rem)]">
							<p className="max-w-[60ch] text-base text-black/65 leading-relaxed lg:text-lg">
								{answer}
							</p>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export function FAQ() {
	const [openIndex, setOpenIndex] = useState<number | null>(0);

	return (
		<section className="relative bg-white text-black" id="faq">
			<div className="mx-auto max-w-7xl px-[clamp(1.5rem,6vw,6rem)] py-[clamp(6rem,12vh,10rem)]">
				<div className="grid grid-cols-12 gap-x-8 gap-y-12 lg:gap-x-12">
					<header className="col-span-12 min-w-0 lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
						<span className="font-mono text-[11px] text-black/55 uppercase tracking-[0.35em]">
							FAQ
						</span>
						<h2 className="mt-4 font-black text-[clamp(2rem,4vw,3.5rem)] uppercase leading-[0.9] tracking-[-0.03em]">
							Frequently
							<br />
							asked.
						</h2>
						<p className="mt-6 max-w-[34ch] text-base text-black/65 leading-relaxed">
							The questions we hear most often. Email{" "}
							<a
								className="font-medium text-black underline decoration-black/30 underline-offset-4 transition-colors hover:decoration-black"
								href="mailto:hello@dakik.co.uk"
							>
								hello@dakik.co.uk
							</a>{" "}
							if you don't see yours.
						</p>
					</header>

					<div className="col-span-12 min-w-0 lg:col-span-7">
						<div className="border-black/10 border-b">
							{faqs.map((faq, index) => (
								<AccordionItem
									answer={faq.answer}
									index={index}
									isOpen={openIndex === index}
									key={faq.question}
									onToggle={() =>
										setOpenIndex(openIndex === index ? null : index)
									}
									question={faq.question}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
