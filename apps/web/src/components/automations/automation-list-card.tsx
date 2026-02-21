"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface Tag {
	id: string;
	name: string;
	slug: string;
}

interface AutomationListCardProps {
	slug: string;
	title: string;
	excerpt?: string | null;
	coverImage?: string | null;
	publishedAt: Date | string | null;
	tags: Tag[];
	fileUrl?: string | null;
	className?: string;
	variant?: "featured" | "sidebar" | "default";
}

export function AutomationListCard({
	slug,
	title,
	excerpt,
	coverImage,
	publishedAt,
	tags,
	fileUrl,
	className,
	variant = "default",
}: AutomationListCardProps) {
	const formattedDate = publishedAt
		? new Intl.DateTimeFormat("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			}).format(new Date(publishedAt))
		: null;

	// Featured variant - Large hero card (like blog featured hero)
	if (variant === "featured") {
		const firstTag = tags[0];

		return (
			<motion.article
				className={cn("group relative", className)}
				initial={{ opacity: 0, y: 20 }}
				transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
				viewport={{ once: true, margin: "-50px" }}
				whileInView={{ opacity: 1, y: 0 }}
			>
				<Link
					className="relative block aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-[16/10]"
					href={`/automations/${slug}`}
				>
					{coverImage ? (
						<Image
							alt={title}
							className="object-cover transition-transform duration-700 group-hover:scale-105"
							fill
							priority
							sizes="(max-width: 1024px) 100vw, 60vw"
							src={coverImage}
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center bg-gray-100">
							<span className="font-medium text-gray-400 text-sm">
								No image
							</span>
						</div>
					)}

					{/* Gradient overlay */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

					{/* Content overlay */}
					<div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
						{firstTag && (
							<span className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 font-medium text-white text-xs backdrop-blur-sm">
								{firstTag.name}
							</span>
						)}
						<h2 className="max-w-lg font-bold text-2xl text-white leading-tight tracking-tight sm:text-3xl lg:text-4xl">
							{title}
						</h2>
						{excerpt && (
							<p className="mt-3 line-clamp-2 max-w-md text-sm text-white/80 leading-relaxed">
								{excerpt}
							</p>
						)}
					</div>
				</Link>
			</motion.article>
		);
	}

	// Sidebar variant - Compact text-focused (like blog sidebar)
	if (variant === "sidebar") {
		return (
			<motion.div
				initial={{ opacity: 0, x: 10 }}
				transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
				viewport={{ once: true, margin: "-50px" }}
				whileInView={{ opacity: 1, x: 0 }}
			>
				<Link className="group flex gap-4" href={`/automations/${slug}`}>
					<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
						{coverImage ? (
							<Image
								alt={title}
								className="object-cover transition-transform duration-500 group-hover:scale-110"
								fill
								sizes="64px"
								src={coverImage}
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center">
								<span className="text-gray-300 text-xs">No img</span>
							</div>
						)}
					</div>
					<div className="flex min-w-0 flex-col justify-center">
						<h4 className="line-clamp-2 font-medium text-sm leading-snug transition-colors group-hover:text-gray-500">
							{title}
						</h4>
						{formattedDate && (
							<span className="mt-1 text-gray-400 text-xs">
								{formattedDate}
							</span>
						)}
					</div>
				</Link>
			</motion.div>
		);
	}

	// Default variant - Text-oriented list card
	return (
		<motion.article
			className={cn(
				"group relative border-gray-100 border-b py-6 last:border-b-0",
				className
			)}
			initial={{ opacity: 0, y: 20 }}
			transition={{ duration: 0.5 }}
			viewport={{ once: true, margin: "-50px" }}
			whileInView={{ opacity: 1, y: 0 }}
		>
			<Link
				className="flex flex-col gap-4 sm:flex-row sm:items-start"
				href={`/automations/${slug}`}
			>
				{/* Optional thumbnail - smaller and less prominent */}
				{coverImage && (
					<div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:aspect-square sm:w-24">
						<Image
							alt={title}
							className="object-cover transition-transform duration-500 group-hover:scale-105"
							fill
							sizes="(max-width: 640px) 100vw, 96px"
							src={coverImage}
						/>
					</div>
				)}

				{/* Content - Text focused */}
				<div className="flex flex-1 flex-col">
					{/* Tags */}
					{tags.length > 0 && (
						<div className="mb-2 flex flex-wrap gap-2">
							{tags.slice(0, 3).map((tag) => (
								<span
									className="rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-600 text-xs"
									key={tag.id}
								>
									{tag.name}
								</span>
							))}
							{fileUrl && (
								<span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 font-medium text-green-600 text-xs">
									<Download className="h-3 w-3" />
									Downloadable
								</span>
							)}
						</div>
					)}

					{/* Title - More prominent for text-focused design */}
					<h3 className="mb-2 font-semibold text-lg leading-tight tracking-tight transition-colors group-hover:text-gray-500">
						{title}
					</h3>

					{/* Excerpt */}
					{excerpt && (
						<p className="mb-3 line-clamp-2 text-gray-500 text-sm leading-relaxed">
							{excerpt}
						</p>
					)}

					{/* Meta row */}
					<div className="mt-auto flex items-center justify-between">
						<div className="flex items-center gap-3 text-gray-400 text-xs">
							{formattedDate && publishedAt && (
								<span className="flex items-center gap-1">
									<Calendar className="h-3.5 w-3.5" />
									<time dateTime={new Date(publishedAt).toISOString()}>
										{formattedDate}
									</time>
								</span>
							)}
						</div>

						{/* Arrow indicator */}
						<motion.div
							className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 opacity-0 transition-opacity group-hover:opacity-100"
							initial={false}
						>
							<ArrowUpRight className="h-4 w-4" />
						</motion.div>
					</div>
				</div>
			</Link>
		</motion.article>
	);
}
