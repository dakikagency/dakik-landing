"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface Tag {
	id: string;
	name: string;
	slug: string;
}

interface FeaturedPost {
	slug: string;
	title: string;
	excerpt?: string | null;
	coverImage?: string | null;
	tags: Tag[];
}

interface BlogFeaturedHeroProps {
	post: FeaturedPost;
	className?: string;
}

export function BlogFeaturedHero({ post, className }: BlogFeaturedHeroProps) {
	const firstTag = post.tags[0];

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
				href={`/blog/${post.slug}`}
			>
				{post.coverImage ? (
					<Image
						alt={post.title}
						className="object-cover transition-transform duration-700 group-hover:scale-105"
						fill
						priority
						sizes="(max-width: 1024px) 100vw, 60vw"
						src={post.coverImage}
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-gray-100">
						<span className="font-medium text-gray-400 text-sm">No image</span>
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
						{post.title}
					</h2>
					{post.excerpt && (
						<p className="mt-3 line-clamp-2 max-w-md text-sm text-white/80 leading-relaxed">
							{post.excerpt}
						</p>
					)}
				</div>
			</Link>
		</motion.article>
	);
}

interface BlogFeaturedSidebarProps {
	posts: FeaturedPost[];
	className?: string;
}

export function BlogFeaturedSidebar({
	posts,
	className,
}: BlogFeaturedSidebarProps) {
	return (
		<div className={cn("flex flex-col", className)}>
			<h3 className="mb-5 font-semibold text-gray-400 text-xs uppercase tracking-widest">
				Featured Posts
			</h3>
			<div className="flex flex-col gap-5">
				{posts.map((post, index) => (
					<motion.div
						initial={{ opacity: 0, x: 10 }}
						key={post.slug}
						transition={{
							duration: 0.4,
							delay: index * 0.08,
							ease: [0.4, 0, 0.2, 1],
						}}
						viewport={{ once: true, margin: "-50px" }}
						whileInView={{ opacity: 1, x: 0 }}
					>
						<Link className="group flex gap-4" href={`/blog/${post.slug}`}>
							<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
								{post.coverImage ? (
									<Image
										alt={post.title}
										className="object-cover transition-transform duration-500 group-hover:scale-110"
										fill
										sizes="64px"
										src={post.coverImage}
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center">
										<span className="text-gray-300 text-xs">No img</span>
									</div>
								)}
							</div>
							<div className="flex min-w-0 flex-col justify-center">
								<h4 className="line-clamp-2 font-medium text-sm leading-snug transition-colors group-hover:text-gray-500">
									{post.title}
								</h4>
							</div>
						</Link>
					</motion.div>
				))}
			</div>
		</div>
	);
}
