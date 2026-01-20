"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const services = [
	{
		id: "sprint",
		num: "01",
		title: "Sprint",
		tagline: "idea → product",
		time: "4-6 weeks",
		color: "#FA5D29",
	},
	{
		id: "overhaul",
		num: "02",
		title: "Overhaul",
		tagline: "mess → clean",
		time: "ongoing",
		color: "#49B3FC",
	},
	{
		id: "growth",
		num: "03",
		title: "Growth",
		tagline: "traffic → money",
		time: "2-4 weeks",
		color: "#4ADE80",
	},
];

export function ServicesSection() {
	const [activeId, setActiveId] = useState<string | null>(null);
	const prefersReducedMotion = useReducedMotion();

	return (
		<section
			className="mx-auto flex flex-col justify-center bg-white px-[clamp(1rem,5vw,4rem)] py-16 text-black md:py-24 lg:px-[clamp(4rem,24vw,20rem)]"
			id="services"
		>
			<div className="page-container">
				{/* Main content */}
				<div className="space-y-4 md:space-y-0">
					{services.map((service, index) => {
						const isActive = activeId === service.id;

						return (
							<motion.div
								className="group cursor-pointer"
								initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 60 }}
								key={service.id}
								onMouseEnter={() => setActiveId(service.id)}
								onMouseLeave={() => setActiveId(null)}
								transition={{
									delay: prefersReducedMotion ? 0 : index * 0.1,
									duration: 0.8,
									ease: [0.16, 1, 0.3, 1],
								}}
								viewport={{ once: true, margin: "-50px" }}
								whileInView={{ opacity: 1, y: 0 }}
							>
								<div className="flex items-baseline justify-between border-black/10 border-b py-4 md:py-6">
									{/* Title - massive */}
									<div className="flex items-baseline gap-4 md:gap-8">
										<span
											className="font-mono text-[clamp(12px,1.5vw,14px)] transition-colors duration-300"
											style={{
												color: isActive ? service.color : "rgba(0,0,0,0.3)",
											}}
										>
											{service.num}
										</span>
										<h3
											className={cn(
												"font-bold font-display uppercase transition-all duration-300",
												"text-[clamp(48px,12vw,180px)] leading-[0.85] tracking-[-0.04em]"
											)}
											style={{
												color: isActive ? service.color : "#000",
												WebkitTextStroke: isActive ? "none" : undefined,
											}}
										>
											{service.title}
										</h3>
									</div>

									{/* Right side - tagline & time */}
									<div className="hidden items-baseline gap-12 md:flex">
										<motion.span
											animate={{
												opacity: isActive ? 1 : 0,
												x: isActive ? 0 : 20,
											}}
											className="text-black/60 text-lg"
											initial={false}
											transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
										>
											{service.tagline}
										</motion.span>
										<span
											className={cn(
												"font-mono text-sm transition-colors duration-300",
												isActive ? "text-black" : "text-black/30"
											)}
										>
											{service.time}
										</span>
									</div>
								</div>

								{/* Mobile tagline */}
								<AnimatePresence>
									{isActive && (
										<motion.div
											animate={{ height: "auto", opacity: 1 }}
											className="overflow-hidden md:hidden"
											exit={{ height: 0, opacity: 0 }}
											initial={{ height: 0, opacity: 0 }}
											transition={{ duration: 0.3 }}
										>
											<div className="flex justify-between py-4 text-sm">
												<span className="text-black/60">{service.tagline}</span>
												<span className="font-mono text-black/40">
													{service.time}
												</span>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
