"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface Tag {
	id: string;
	name: string;
	slug: string;
}

interface AutomationCardProps {
	slug: string;
	title: string;
	excerpt?: string | null;
	coverImage?: string | null;
	publishedAt: Date | string | null;
	tags: Tag[];
	className?: string;
}

export function AutomationCard({
	slug,
	title,
	excerpt,
	coverImage,
	publishedAt,
	tags,
	className,
}: AutomationCardProps) {
	const formattedDate = publishedAt
		? new Intl.DateTimeFormat("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			}).format(new Date(publishedAt))
		: null;

	return (
		<motion.article
			className={cn("group relative flex flex-col", className)}
			initial={{ opacity: 0, y: 20 }}
			transition={{ duration: 0.5 }}
			viewport={{ once: true, margin: "-50px" }}
			whileInView={{ opacity: 1, y: 0 }}
		>
			<Link className="block" href={`/automations/${slug}`}>
				{/* Cover Image */}
				<div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
					{coverImage ? (
						<Image
							alt={title}
							className="object-cover transition-transform duration-500 group-hover:scale-105"
							fill
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							src={coverImage}
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center bg-gray-100">
							<span className="font-medium text-gray-400 text-sm">
								No image
							</span>
						</div>
					)}
					{/* Hover overlay */}
					<div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
					{/* Arrow indicator */}
					<motion.div
						className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100"
						initial={false}
					>
						<ArrowUpRight className="h-5 w-5" />
					</motion.div>
				</div>

				{/* Content */}
				<div className="flex flex-1 flex-col pt-5">
					{/* Tags */}
					{tags.length > 0 && (
						<div className="mb-3 flex flex-wrap gap-2">
							{tags.slice(0, 3).map((tag) => (
								<span
									className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600 text-xs transition-colors group-hover:bg-gray-200"
									key={tag.id}
								>
									{tag.name}
								</span>
							))}
						</div>
					)}

					{/* Title */}
					<h3 className="mb-2 font-semibold text-lg leading-tight tracking-tight transition-colors group-hover:text-gray-600">
						{title}
					</h3>

					{/* Excerpt */}
					{excerpt && (
						<p className="mb-4 line-clamp-2 flex-1 text-gray-500 text-sm leading-relaxed">
							{excerpt}
						</p>
					)}

					{/* Date */}
					{formattedDate && publishedAt && (
						<div className="mt-auto flex items-center gap-1.5 text-gray-400 text-xs">
							<Calendar className="h-3.5 w-3.5" />
							<time dateTime={new Date(publishedAt).toISOString()}>
								{formattedDate}
							</time>
						</div>
					)}
				</div>
			</Link>
		</motion.article>
	);
}
