import { useQuery } from "@tanstack/react-query";
import { useHead } from "@unhead/react";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { BlogCard } from "../../components/blog/blog-card";
import { BlogContent } from "../../components/blog/blog-content";
import { ShareArticle } from "../../components/blog/share-article";
import { Footer } from "../../components/landing/footer";
import { Navbar } from "../../components/landing/navbar";
import {
	BLOG_AUTHOR,
	type BlogPostFull,
	type BlogPostSummary,
	calculateReadTime,
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
			<Navbar />
			<main className="mx-auto max-w-5xl px-[clamp(1.25rem,5vw,5rem)] pt-24 pb-20 lg:pt-32 lg:pb-32">
				{children}
			</main>
			<Footer />
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

	useHead({
		title: post ? `${post.title} · Dakik Studio` : "Article · Dakik Studio",
		meta: post
			? [
					{ name: "description", content: post.excerpt ?? "" },
					{ property: "og:title", content: post.title },
					{ property: "og:type", content: "article" },
					{ property: "og:description", content: post.excerpt ?? "" },
					...(post.coverImage
						? [{ property: "og:image", content: post.coverImage }]
						: []),
				]
			: [],
	});

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
					<h1 className="mt-4 font-black text-[clamp(2.25rem,6vw,5rem)] uppercase leading-[0.95] tracking-[-0.04em] break-words">
						Article not
						<br />
						found.
					</h1>
					<p className="mt-6 max-w-[44ch] text-base text-black/65 leading-relaxed lg:text-lg">
						The article you're looking for is unavailable or has been moved.
					</p>
				</div>
			</PageShell>
		);
	}

	const shareUrl =
		typeof window !== "undefined" ? window.location.href : "";

	return (
		<PageShell>
			<div className="mb-10 lg:mb-14">
				<BackLink />
			</div>

			{/* 1. Cover image — full-bleed within the page padding */}
			{post.coverImage && (
				<div className="mb-10 overflow-hidden bg-black/5 lg:mb-14">
					<img
						alt={post.title}
						className="h-auto w-full object-cover"
						src={post.coverImage}
					/>
				</div>
			)}

			{/* 2. Tag eyebrow + title + excerpt */}
			<header className="mb-12 lg:mb-16">
				<span className="font-mono text-[10px] text-black/55 uppercase tracking-[0.35em] sm:text-[11px]">
					{post.tags[0]?.name ?? "Article"}
				</span>
				<h1 className="mt-4 font-black text-[clamp(1.875rem,5.5vw,4.25rem)] uppercase leading-[0.95] tracking-[-0.03em] break-words">
					{post.title}
				</h1>
				{post.excerpt && (
					<p className="mt-6 max-w-[60ch] text-lg text-black/70 leading-relaxed lg:text-xl">
						{post.excerpt}
					</p>
				)}
			</header>

			{/* 3. Body content — full width, no ToC sidebar */}
			<article className="mx-auto max-w-[68ch]">
				<BlogContent content={post.content} />
			</article>

			{/* 4. Author + date + read time + share — at the end */}
			<footer className="mx-auto mt-16 max-w-[68ch] border-black/10 border-t pt-10 lg:mt-20">
				<div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[10px] text-black/55 uppercase tracking-[0.25em] sm:text-[11px]">
					<div className="flex items-center gap-2.5">
						<span
							aria-hidden="true"
							className="flex h-7 w-7 items-center justify-center rounded-full bg-black font-mono text-[9px] text-white tracking-[0.1em]"
						>
							{BLOG_AUTHOR.initials}
						</span>
						<span className="text-black">{BLOG_AUTHOR.name}</span>
					</div>
					<span aria-hidden="true" className="text-black/25">/</span>
					{post.publishedAt && (
						<>
							<time dateTime={new Date(post.publishedAt).toISOString()}>
								{formatDate(post.publishedAt)}
							</time>
							<span aria-hidden="true" className="text-black/25">/</span>
						</>
					)}
					<span>{readTime} min read</span>
				</div>
				<div className="mt-8">
					<ShareArticle title={post.title} url={shareUrl} />
				</div>
			</footer>

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
					<div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:gap-x-10">
						{related.map((p) => (
							<BlogCard key={p.slug} {...p} />
						))}
					</div>
				</section>
			)}
		</PageShell>
	);
}

export default BlogPostPage;
