import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import type { BlogPostSummary } from "../../lib/blog";
import { formatDate } from "../../lib/blog";

interface BlogRecentCardProps extends Pick<BlogPostSummary, "slug" | "title" | "excerpt" | "coverImage" | "publishedAt" | "tags"> {
	className?: string;
}

export function BlogRecentCard({
	slug,
	title,
	excerpt,
	coverImage,
	publishedAt,
	tags,
	className,
}: BlogRecentCardProps) {
	return (
		<motion.article
			className={cn("group", className)}
			initial={{ opacity: 0, y: 20 }}
			transition={{ duration: 0.5 }}
			viewport={{ once: true, margin: "-50px" }}
			whileInView={{ opacity: 1, y: 0 }}
		>
			<Link className="flex gap-5" to={`/blog/${slug}`}>
				<div className="relative aspect-[4/3] w-40 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:w-48">
					{coverImage ? (
						<img
							alt={title}
							className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
							src={coverImage}
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center">
							<span className="text-gray-300 text-xs">No img</span>
						</div>
					)}
				</div>
				<div className="flex min-w-0 flex-1 flex-col justify-center">
					{tags[0] && (
						<span className="mb-2 inline-block w-fit rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-600 text-[10px] uppercase tracking-wide">
							{tags[0].name}
						</span>
					)}
					<h3 className="mb-1 line-clamp-2 font-semibold text-base leading-tight transition-colors group-hover:text-gray-500 sm:text-lg">
						{title}
					</h3>
					{excerpt && (
						<p className="line-clamp-2 text-gray-500 text-sm leading-relaxed">{excerpt}</p>
					)}
					{publishedAt && (
						<div className="mt-2 flex items-center gap-2 text-gray-400 text-xs">
							<time dateTime={new Date(publishedAt).toISOString()}>{formatDate(publishedAt)}</time>
							<ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
						</div>
					)}
				</div>
			</Link>
		</motion.article>
	);
}
