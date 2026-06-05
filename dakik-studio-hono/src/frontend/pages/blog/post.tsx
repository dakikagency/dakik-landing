import { useQuery } from "@tanstack/react-query";
import { useHead } from "@unhead/react";
import { ArrowLeft } from "lucide-react";
import { pageHead } from "../../lib/head";
import { cn } from "../../lib/utils";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { BlogCard } from "../../components/blog/blog-card";
import { BlogContent } from "../../components/blog/blog-content";
import {
	TableOfContents,
	useActiveSection,
} from "../../components/blog/table-of-contents";
import { ShareArticle } from "../../components/blog/share-article";
import { Footer } from "../../components/landing/footer";
import { Navbar } from "../../components/landing/navbar";
import {
	BLOG_AUTHOR,
	type BlogPostFull,
	type BlogPostSummary,
	calculateReadTime,
	extractHeadings,
	formatDate,
} from "../../lib/blog";

async function fetchPost(slug: string): Promise<{
	post: BlogPostFull;
	related: BlogPostSummary[];
}> {
	const res = await fetch(`/api/blog/${encodeURIComponent(slug)}`);
	if (!res.ok) throw new Error("Failed to load post");
	return res.json();
}

function BackLink() {
	return (
		<Link
			className="inline-flex items-center gap-2 font-mono text-[11px] text-black/55 uppercase tracking-[0.35em] transition-colors hover:text-black"
			to="/blog"
		>
			<ArrowLeft className="h-3.5 w-3.5" /> Back to journal
		</Link>
	);
}

function PageShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen overflow-x-hidden bg-white text-black">
			<Navbar theme="light" />
			<main className="mx-auto max-w-6xl px-[clamp(1.25rem,5vw,5rem)] pt-24 pb-20 lg:pt-32 lg:pb-32">
				{children}
			</main>
			<Footer />
		</div>
	);
}

function Byline({
	post,
	readTime,
}: { post: BlogPostFull; readTime: number }) {
	return (
		<div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] text-black/50 uppercase tracking-[0.25em] sm:text-[11px]">
			<div className="flex items-center gap-2">
				<span
					aria-hidden="true"
					className="flex h-6 w-6 items-center justify-center rounded-full bg-black font-mono text-[9px] text-white tracking-[0.1em]"
				>
					{BLOG_AUTHOR.initials}
				</span>
				<span className="text-black">{BLOG_AUTHOR.name}</span>
			</div>
			{post.publishedAt && (
				<>
					<span aria-hidden="true" className="text-black/20">/</span>
					<time dateTime={new Date(post.publishedAt).toISOString()}>
						{formatDate(post.publishedAt)}
					</time>
				</>
			)}
			<span aria-hidden="true" className="text-black/20">/</span>
			<span>{readTime} min read</span>
		</div>
	);
}

export function BlogPostPage() {
	const { slug = "" } = useParams<{ slug: string }>();
	const { data, isLoading, isError } = useQuery({
		queryKey: ["blog", "post", slug],
		queryFn: () => fetchPost(slug),
		enabled: !!slug,
	});

	const post = data?.post;
	const related = data?.related ?? [];

	const readTime = useMemo(
		() => (post ? calculateReadTime(post.content) : 0),
		[post],
	);

	const headings = useMemo(
		() => (post ? extractHeadings(post.content) : []),
		[post],
	);

	const headingIds = useMemo(() => headings.map((h) => h.id), [headings]);
	const activeId = useActiveSection(headingIds);

	useHead(
		post
			? pageHead({
					title: `${post.title} · Dakik Studio`,
					description: post.excerpt ?? "",
					canonical: `https://dakik.co.uk/blog/${post.slug}`,
					image: post.coverImage,
					type: "article",
				})
			: { title: "Article · Dakik Studio" },
	);

	if (isLoading) {
		return (
			<PageShell>
				<p className="font-mono text-[11px] text-black/45 uppercase tracking-[0.35em]">
					Loading…
				</p>
			</PageShell>
		);
	}

	if (isError || !post) {
		return (
			<PageShell>
				<BackLink />
				<div className="mt-16 max-w-3xl">
					<span className="font-mono text-[11px] text-black/55 uppercase tracking-[0.35em]">
						404
					</span>
					<h1 className="mt-4 font-black text-[clamp(2.25rem,6vw,5rem)] uppercase leading-[1.2] tracking-[-0.04em] break-words">
						Article not
						<br />
						found.
					</h1>
					<p className="mt-6 max-w-[44ch] text-base text-black/65 leading-[1.4] lg:text-lg">
						The article you're looking for is unavailable or has been moved.
					</p>
				</div>
			</PageShell>
		);
	}

	// Canonical, deterministic on server + client (avoids a hydration mismatch
	// vs window.location). `post` is guaranteed defined past the guard above.
	const shareUrl = `https://dakik.co.uk/blog/${post.slug}`;

	return (
		<PageShell>
			{/* Back nav */}
			<div className="mb-10 lg:mb-12">
				<BackLink />
			</div>

			{/* Hero — title, excerpt and byline first (readable immediately) beside
			    a height-capped cover. Stacks title-first on mobile; splits with the
			    cover on the right at lg. */}
			<div
				className={cn(
					"mb-12 border-black/10 border-b pb-10 lg:mb-16 lg:pb-14",
					post.coverImage
						? "grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
						: "max-w-3xl",
				)}
			>
				<header>
					<span className="font-mono text-[10px] text-black/55 uppercase tracking-[0.35em] sm:text-[11px]">
						{post.tags[0]?.name ?? "Article"}
					</span>
					<h1 className="mt-3 break-words font-black text-[clamp(1.875rem,5.5vw,4rem)] uppercase leading-[1.1] tracking-[-0.03em]">
						{post.title}
					</h1>
					{post.excerpt && (
						<p className="mt-5 max-w-[52ch] text-lg text-black/65 leading-[1.4] lg:text-xl">
							{post.excerpt}
						</p>
					)}
					<div className="mt-7 border-black/10 border-t pt-6">
						<Byline post={post} readTime={readTime} />
					</div>
				</header>
				{post.coverImage && (
					<div className="relative aspect-[4/3] overflow-hidden bg-black/5 lg:aspect-[5/4]">
						<img
							alt={post.title}
							className="absolute inset-0 h-full w-full object-cover"
							decoding="async"
							fetchPriority="high"
							loading="eager"
							src={post.coverImage}
						/>
					</div>
				)}
			</div>

			{/* 2-col: sticky ToC sidebar + article */}
			<div className="grid gap-x-14 lg:grid-cols-[200px_1fr]">
				{/* Sidebar */}
				<aside className="hidden lg:block">
					<div className="sticky top-28 border-black/10 border-t pt-4">
						<TableOfContents headings={headings} activeId={activeId} />
					</div>
				</aside>

				{/* Article body */}
				<div>
					<article>
						<BlogContent content={post.content} />
					</article>

					{/* Share */}
					<div className="mt-14 border-black/10 border-t pt-10">
						<ShareArticle title={post.title} url={shareUrl} />
					</div>
				</div>
			</div>

			{/* Related posts */}
			{related.length > 0 && (
				<section className="mt-24 border-black/10 border-t pt-14 lg:mt-32 lg:pt-16">
					<div className="mb-10 flex items-baseline justify-between">
						<span className="font-mono text-[10px] text-black/55 uppercase tracking-[0.35em] sm:text-[11px]">
							Keep reading
						</span>
						<span className="font-mono text-[10px] text-black/45 uppercase tracking-[0.35em] tabular-nums sm:text-[11px]">
							{String(related.length).padStart(2, "0")}
						</span>
					</div>
					<div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10">
						{related.map((p) => (
							<BlogCard key={p.slug} {...p} variant="compact" />
						))}
					</div>
				</section>
			)}
		</PageShell>
	);
}

export default BlogPostPage;
