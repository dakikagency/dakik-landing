"use client";

import { motion } from "framer-motion";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion";

const projects = [
	{
		title: "Finance Dashboard",
		category: "Web Development",
		description:
			"Modern banking platform with real-time analytics and AI-powered insights.",
		image: "/work/finance.jpg",
	},
	{
		title: "E-commerce Redesign",
		category: "Brand Identity",
		description:
			"Complete brand overhaul and storefront redesign for luxury fashion brand.",
		image: "/work/ecommerce.jpg",
	},
	{
		title: "Healthcare AI",
		category: "AI Automation",
		description:
			"Intelligent patient scheduling and diagnosis assistance system.",
		image: "/work/healthcare.jpg",
	},
	{
		title: "Startup MVP",
		category: "Full Product",
		description:
			"From concept to launch: SaaS platform for remote team management.",
		image: "/work/startup.jpg",
	},
];

export function Work() {
	return (
		<section className="bg-gray-50 py-section-y text-black" id="work">
			<div className="container mx-auto px-section-x">
				<Reveal direction="up">
					<div className="mb-16 text-center">
						<span className="mb-4 inline-block font-medium text-gray-500 text-sm uppercase tracking-widest">
							Our Work
						</span>
						<h2 className="font-bold text-display-md tracking-tight">
							Selected projects
						</h2>
					</div>
				</Reveal>

				<StaggerContainer className="grid gap-8 sm:grid-cols-2">
					{projects.map((project) => (
						<StaggerItem key={project.title}>
							<motion.article
								className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gray-200"
								initial="initial"
								whileHover="hover"
							>
								{/* Placeholder Image */}
								<div className="aspect-[4/3] bg-gradient-to-br from-gray-300 to-gray-400">
									{/* Placeholder gradient - replace with actual images */}
									<div className="absolute inset-0 bg-gradient-to-br from-gray-800/0 to-gray-900/60" />
								</div>

								{/* Content Overlay */}
								<motion.div
									className="absolute inset-0 flex flex-col justify-end p-6 text-white"
									variants={{
										initial: { opacity: 0.8 },
										hover: { opacity: 1 },
									}}
								>
									{/* Category Tag */}
									<motion.span
										className="mb-2 inline-block w-fit rounded-full bg-white/20 px-3 py-1 font-medium text-xs backdrop-blur-sm"
										transition={{ duration: 0.3 }}
										variants={{
											initial: { y: 10, opacity: 0 },
											hover: { y: 0, opacity: 1 },
										}}
									>
										{project.category}
									</motion.span>

									{/* Title */}
									<h3 className="mb-2 font-bold text-2xl">{project.title}</h3>

									{/* Description - shows on hover */}
									<motion.p
										className="text-sm text-white/80"
										transition={{ duration: 0.3, delay: 0.1 }}
										variants={{
											initial: { y: 20, opacity: 0 },
											hover: { y: 0, opacity: 1 },
										}}
									>
										{project.description}
									</motion.p>
								</motion.div>

								{/* Hover Shine Effect */}
								<motion.div
									className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
									transition={{ duration: 0.6 }}
									variants={{
										initial: { x: "-100%" },
										hover: { x: "100%" },
									}}
								/>
							</motion.article>
						</StaggerItem>
					))}
				</StaggerContainer>
			</div>
		</section>
	);
}
