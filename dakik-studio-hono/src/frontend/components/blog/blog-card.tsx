import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { type BlogPostSummary, formatDate } from "../../lib/blog";
import { cn } from "../../lib/utils";

interface BlogCardProps
	extends Pick<
		BlogPostSummary,
		| "slug"
		| "title"
		| "excerpt"
		| "coverImage"
		| "publishedAt"
		| "tags"
		| "readingTime"
	> {
	className?: string;
	/**
	 * `featured` is the horizontal split card (text beside image) used at the
	 * top of the blog index for the latest post. `compact` is the denser
	 * image-on-top card used in the archive / related grids. `default` keeps
	 * the original image-on-top card.
	 */
	variant?: "default" | "featured" | "compact";
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

/** Shared image box: cover (or placeholder) + the hover arrow affordance. */
function CardImage({
	coverImage,
	title,
	slug,
	className,
	eager,
}: {
	coverImage?: string | null;
	title: string;
	slug: string;
	className?: string;
	eager?: boolean;
}) {
	return (
		<div className={cn("relative overflow-hidden bg-black/5", className)}>
			{coverImage ? (
				<img
					alt={title}
					className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.03]"
					decoding="async"
					loading={eager ? "eager" : "lazy"}
					src={coverImage}
				/>
			) : (
				<NoImagePlaceholder slug={slug} />
			)}
			{/* Square (zero-radius) hover affordance — fades in on card hover. */}
			<div
				aria-hidden="true"
				className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center bg-white text-black opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			>
				<ArrowUpRight className="h-5 w-5" />
			</div>
		</div>
	);
}

/** Mono meta strip: optional tag, optional published date. */
function MetaRow({
	tag,
	publishedAt,
}: {
	tag?: string;
	publishedAt: string | null;
}) {
	return (
		<div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-black/55 uppercase tracking-[0.3em]">
			{tag && <span>{tag}</span>}
			{tag && publishedAt && (
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
	);
}

export function BlogCard({
	slug,
	title,
	excerpt,
	coverImage,
	publishedAt,
	tags,
	readingTime,
	className,
	variant = "default",
}: BlogCardProps) {
	// Featured: horizontal split — text (left on desktop, top on mobile) beside
	// a height-matched cover image. Replaces the old full-width banner so the
	// latest post no longer eats a whole screen.
	if (variant === "featured") {
		return (
			<article className={cn("group", className)}>
				<Link
					className="block border border-black/10 p-5 sm:p-6"
					to={`/blog/${slug}`}
				>
					{/* Narrow text column beside a wide, inset cover — mirrors the
					    reference featured card. Stacks text-over-image on mobile. */}
					<div className="grid items-stretch gap-6 lg:grid-cols-[1fr_3fr] lg:gap-8">
						<div className="flex flex-col justify-center gap-3">
							<MetaRow publishedAt={publishedAt} />
							<div className="flex flex-col gap-1.5">
								<h3 className="break-words font-black text-xl uppercase leading-[1.1] tracking-[-0.02em] transition-colors group-hover:text-black/60 sm:text-2xl">
									{title}
								</h3>
								{readingTime ? (
									<span className="font-mono text-[10px] text-black/45 uppercase tracking-[0.25em]">
										{readingTime} min read
									</span>
								) : null}
							</div>
							{excerpt && (
								<p className="text-sm text-black/65 leading-[1.5] lg:text-base">
									{excerpt}
								</p>
							)}
							{tags.length > 0 && (
								<div className="mt-1 flex flex-wrap gap-2">
									{tags.map((t) => (
										<span
											key={t.id}
											className="border border-black/15 px-2 py-1 font-mono text-[10px] text-black/55 uppercase tracking-[0.25em]"
										>
											{t.name}
										</span>
									))}
								</div>
							)}
						</div>
						<CardImage
							className="aspect-[16/9] lg:aspect-auto lg:min-h-[20rem]"
							coverImage={coverImage}
							eager
							slug={slug}
							title={title}
						/>
					</div>
				</Link>
			</article>
		);
	}

	// Stacked image-on-top card. `compact` is denser (shorter image, tighter
	// text) for the archive / related grids; `default` keeps the original feel.
	const isCompact = variant === "compact";
	return (
		<article className={cn("group", className)}>
			<Link className="block" to={`/blog/${slug}`}>
				<CardImage
					className={isCompact ? "aspect-[3/2]" : "aspect-[16/10]"}
					coverImage={coverImage}
					slug={slug}
					title={title}
				/>
				<div
					className={cn(
						"flex flex-col",
						isCompact ? "mt-4 gap-1.5" : "mt-5 gap-2",
					)}
				>
					<MetaRow tag={tags[0]?.name} publishedAt={publishedAt} />
					<h3 className="break-words font-black text-lg uppercase leading-[0.95] tracking-[-0.03em] transition-colors group-hover:text-black/60 sm:text-xl lg:text-2xl">
						{title}
					</h3>
					{excerpt && (
						<p
							className={cn(
								"text-black/65 text-sm leading-[1.4] lg:text-base",
								isCompact ? "line-clamp-2" : "line-clamp-3",
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
