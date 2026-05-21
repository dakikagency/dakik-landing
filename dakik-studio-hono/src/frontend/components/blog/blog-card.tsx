import { motion } from "framer-motion";
import { ArrowUpRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import type { BlogPostSummary } from "../../lib/blog";
import { formatDate } from "../../lib/blog";

interface BlogCardProps extends Pick<BlogPostSummary, "slug" | "title" | "excerpt" | "coverImage" | "publishedAt" | "tags"> {
	className?: string;
}

export function BlogCard({
	slug,
	title,
	excerpt,
	coverImage,
	publishedAt,
	tags,
	className,
}: BlogCardProps) {
	return (
		<motion.article
			className={cn("group relative flex flex-col", className)}
			initial={{ opacity: 0, y: 20 }}
			transition={{ duration: 0.5 }}
			viewport={{ once: true, margin: "-50px" }}
			whileInView={{ opacity: 1, y: 0 }}
		>
			<Link className="block" to={`/blog/${slug}`}>
				<div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
					{coverImage ? (
						<img
							alt={title}
							className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
							src={coverImage}
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center bg-gray-100">
							<span className="font-medium text-gray-400 text-sm">No image</span>
						</div>
					)}
					<div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
					<div className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100">
						<ArrowUpRight className="h-5 w-5" />
					</div>
				</div>

				<div className="flex flex-1 flex-col pt-5">
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
					<h3 className="mb-2 font-semibold text-lg leading-tight tracking-tight transition-colors group-hover:text-gray-600">
						{title}
					</h3>
					{excerpt && (
						<p className="mb-4 line-clamp-2 flex-1 text-gray-500 text-sm leading-relaxed">
							{excerpt}
						</p>
					)}
					{publishedAt && (
						<div className="mt-auto flex items-center gap-1.5 text-gray-400 text-xs">
							<Calendar className="h-3.5 w-3.5" />
							<time dateTime={new Date(publishedAt).toISOString()}>{formatDate(publishedAt)}</time>
						</div>
					)}
				</div>
			</Link>
		</motion.article>
	);
}
