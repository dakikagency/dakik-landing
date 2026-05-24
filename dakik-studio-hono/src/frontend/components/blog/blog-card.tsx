import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { type BlogPostSummary, formatDate } from "../../lib/blog";
import { cn } from "../../lib/utils";

interface BlogCardProps
	extends Pick<
		BlogPostSummary,
		"slug" | "title" | "excerpt" | "coverImage" | "publishedAt" | "tags"
	> {
	className?: string;
	/**
	 * `lead` is the full-width card used at the top of the blog index for the
	 * latest post; `default` is the smaller card used in the grid.
	 */
	variant?: "default" | "lead";
}

/**
 * Visually-distinct placeholder for posts without a cover image. The
 * previous version used a low-contrast gray block that ended up the same
 * tone as white-text overlays on cards — making titles unreadable.
 * This is high-contrast black-on-white with a mono index marker so we
 * never need to render light text over a light surface.
 */
function NoImagePlaceholder({ slug }: { slug: string }) {
	const initial = (slug.match(/[a-z]/i)?.[0] ?? "•").toUpperCase();
	return (
		<div className="absolute inset-0 flex items-center justify-center bg-black text-white">
			<span className="font-black text-[20vw] leading-none tracking-tighter sm:text-[12rem]">
				{initial}
			</span>
		</div>
	);
}

export function BlogCard({
	slug,
	title,
	excerpt,
	coverImage,
	publishedAt,
	tags,
	className,
	variant = "default",
}: BlogCardProps) {
	const isLead = variant === "lead";

	return (
		<article className={cn("group", className)}>
			<Link className="block" to={`/blog/${slug}`}>
				<div
					className={cn(
						"relative overflow-hidden bg-black/5",
						isLead ? "aspect-[16/9] lg:aspect-[21/9]" : "aspect-[16/10]",
					)}
				>
					{coverImage ? (
						<img
							alt={title}
							className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.03]"
							src={coverImage}
						/>
					) : (
						<NoImagePlaceholder slug={slug} />
					)}
					<div
						aria-hidden="true"
						className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100"
					>
						<ArrowUpRight className="h-5 w-5" />
					</div>
				</div>

				<div
					className={cn(
						"flex flex-col",
						isLead ? "mt-8 max-w-3xl gap-3" : "mt-5 gap-2",
					)}
				>
					<div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-black/55 uppercase tracking-[0.3em]">
						{tags[0] && <span>{tags[0].name}</span>}
						{tags[0] && publishedAt && (
							<span aria-hidden="true" className="text-black/30">
								/
							</span>
						)}
						{publishedAt && (
							<time dateTime={new Date(publishedAt).toISOString()}>
								{formatDate(publishedAt)}
							</time>
						)}
					</div>

					<h3
						className={cn(
							"break-words font-black uppercase leading-[0.95] tracking-[-0.03em] transition-colors group-hover:text-black/60",
							isLead
								? "text-2xl sm:text-4xl lg:text-5xl"
								: "text-lg sm:text-xl lg:text-2xl",
						)}
					>
						{title}
					</h3>

					{excerpt && (
						<p
							className={cn(
								"text-black/65 leading-relaxed",
								isLead
									? "max-w-2xl text-base lg:text-lg"
									: "line-clamp-3 text-sm lg:text-base",
							)}
						>
							{excerpt}
						</p>
					)}
				</div>
			</Link>
		</article>
	);
}
