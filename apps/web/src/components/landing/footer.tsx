"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const resourceLinks = [
	{ name: "daIcons", href: "/daicons" },
	{ name: "daComps", href: "/dacomps" },
	{ name: "Blog", href: "/blog" },
	{ name: "About", href: "/about" },
	{ name: "Contact", href: "/contact" },
	{ name: "Privacy", href: "/privacy" },
] as const;

export function Footer() {
	const [hoveredLink, setHoveredLink] = useState<string | null>(null);
	const currentYear = new Date().getFullYear();
	const prefersReducedMotion = useReducedMotion();
	const dakikLetters = "dakik"
		.split("")
		.map((letter, index) => ({ id: `${letter}-${index + 1}`, letter }));

	return (
		<footer className="relative overflow-hidden bg-black text-white">
			<div className="relative z-10 mx-auto w-full px-[clamp(1rem,5vw,4rem)] pt-16 md:pt-24">
				{/* Big CTA Row */}
				<motion.div
					className="mb-8 border-white/10 border-b pb-8"
					initial={{ opacity: 0 }}
					viewport={{ once: true }}
					whileInView={{ opacity: 1 }}
				>
					<Link className="group block" href="/survey">
						<div className="flex items-baseline justify-between">
							<span className="font-bold font-display text-[clamp(40px,12vw,160px)] leading-[0.9] tracking-tight transition-colors duration-300 group-hover:text-[#FA5D29]">
								LET'S TALK
							</span>
							<span className="text-[clamp(24px,6vw,80px)] transition-transform duration-300 group-hover:translate-x-4">
								→
							</span>
						</div>
					</Link>
				</motion.div>

				{/* Dense Links Grid */}
				<div className="grid grid-cols-2 gap-x-4 gap-y-8 border-white/10 border-b pb-12 md:grid-cols-4">
					{/* Pages */}
					<motion.div
						initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
						transition={{ duration: 0.5 }}
						viewport={{ once: true }}
						whileInView={{ opacity: 1, y: 0 }}
					>
						<span className="mb-4 block text-[10px] text-white/30 uppercase tracking-[0.2em]">
							Pages
						</span>
						<div className="space-y-1">
							{resourceLinks.map((link) => (
								<a
									className={cn(
										"block text-sm transition-colors duration-200",
										hoveredLink === link.name ? "text-white" : "text-white/50"
									)}
									href={link.href}
									key={link.name}
									onMouseEnter={() => setHoveredLink(link.name)}
									onMouseLeave={() => setHoveredLink(null)}
								>
									{link.name}
								</a>
							))}
						</div>
					</motion.div>

					{/* Contact */}
					<motion.div
						initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
						transition={{ delay: 0.2, duration: 0.5 }}
						viewport={{ once: true }}
						whileInView={{ opacity: 1, y: 0 }}
					>
						<span className="mb-4 block text-[10px] text-white/30 uppercase tracking-[0.2em]">
							Contact
						</span>
						<div className="space-y-1">
							<a
								className="block text-sm text-white/50 transition-colors hover:text-[#4ADE80]"
								href="mailto:hello@dakik.co.uk"
							>
								new@dakik.co.uk
							</a>
							<a
								className="block text-sm text-white/50 transition-colors hover:text-[#4ADE80]"
								href="mailto:hello@dakik.co.uk"
							>
								ask@dakik.co.uk
							</a>
							<a
								className="block text-sm text-white/50 transition-colors hover:text-[#4ADE80]"
								href="mailto:hello@dakik.co.uk"
							>
								help@dakik.co.uk
							</a>
						</div>
					</motion.div>

					{/* Location */}
					<motion.div
						initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
						transition={{ delay: 0.3, duration: 0.5 }}
						viewport={{ once: true }}
						whileInView={{ opacity: 1, y: 0 }}
					>
						<span className="mb-4 block text-[10px] text-white/30 uppercase tracking-[0.2em]">
							Location
						</span>
						<div className="space-y-1 text-sm text-white/50">
							<p>London, UK</p>
							<p className="text-white/30">
								Working with
								<br />
								founders globally
							</p>
						</div>
					</motion.div>
				</div>

				{/* Bottom Row - Dense */}
				<div className="flex flex-col items-start justify-between gap-4 py-6 md:flex-row md:items-center">
					<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-white/30">
						<span>© {currentYear} Dakik Studio Ltd</span>
						<span className="hidden md:inline">·</span>
						<a className="transition-colors hover:text-white" href="/privacy">
							Privacy Policy
						</a>
						<span className="hidden md:inline">·</span>
						<a className="transition-colors hover:text-white" href="/terms">
							Terms of Service
						</a>
						<span className="hidden md:inline">·</span>
						<a className="transition-colors hover:text-white" href="/cookies">
							Cookie Settings
						</a>
					</div>
					<button
						className="flex items-center gap-2 text-[11px] text-white/30 transition-colors hover:text-white"
						onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
						type="button"
					>
						<span>TOP</span>
						<span className="text-lg leading-none">↑</span>
					</button>
				</div>
			</div>

			{/* Large Logo - KEEPING AS IS */}
			<div className="-mb-20 flex items-center justify-center pb-8 lg:-mb-32">
				<h1
					aria-label="dakik"
					className="font-black font-display text-[clamp(18px,32vw,620px)] text-white leading-[0.9em] tracking-tight lg:mt-[0.05em] lg:leading-[0.85]"
				>
					{dakikLetters.map((letter) => (
						<span aria-hidden="true" className="inline-block" key={letter.id}>
							{letter.letter}
						</span>
					))}
				</h1>
			</div>
		</footer>
	);
}
