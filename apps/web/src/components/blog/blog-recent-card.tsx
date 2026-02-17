"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { BLOG_AUTHOR, calculateReadTime } from "@/lib/blog";
import { cn } from "@/lib/utils";

interface BlogRecentCardProps {
	slug: string;
	title: string;
	excerpt?: string | null;
	coverImage?: string | null;
	content?: string | null;
	className?: string;
}

export function BlogRecentCard({
	slug,
	title,
	excerpt,
	coverImage,
	content,
	className,
}: BlogRecentCardProps) {
	const readTime = calculateReadTime(content);

	return (
		<motion.article
			className={cn("group flex flex-col", className)}
			initial={{ opacity: 0, y: 20 }}
			transition={{ duration: 0.5 }}
			viewport={{ once: true, margin: "-50px" }}
			whileInView={{ opacity: 1, y: 0 }}
		>
			<Link className="block" href={`/blog/${slug}`}>
				{/* Cover Image */}
				<div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-gray-100">
					{coverImage ? (
						<Image
							alt={title}
							className="object-cover transition-transform duration-500 group-hover:scale-105"
							fill
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							src={coverImage}
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center">
							<span className="font-medium text-gray-400 text-sm">
								No image
							</span>
						</div>
					)}
				</div>

				{/* Content */}
				<div className="flex flex-1 flex-col pt-4">
					<h3 className="mb-2 font-semibold text-lg leading-tight tracking-tight transition-colors group-hover:text-gray-500">
						{title}
					</h3>
					{excerpt && (
						<p className="mb-4 line-clamp-2 flex-1 text-gray-500 text-sm leading-relaxed">
							{excerpt}
						</p>
					)}

					{/* Author row */}
					<div className="mt-auto flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 font-medium text-white text-xs">
							{BLOG_AUTHOR.initials}
						</div>
						<div className="flex items-center gap-2 text-gray-500 text-xs">
							<span className="font-medium text-gray-700">
								{BLOG_AUTHOR.name}
							</span>
							<span className="text-gray-300">&middot;</span>
							<span className="flex items-center gap-1">
								<Clock className="h-3 w-3" />
								{readTime} min read
							</span>
						</div>
					</div>
				</div>
			</Link>
		</motion.article>
	);
}
