import { useQuery } from "@tanstack/react-query";
import { useHead } from "@unhead/react";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { BlogCard } from "../../components/blog/blog-card";
import { BlogContent } from "../../components/blog/blog-content";
import { ShareArticle } from "../../components/blog/share-article";
import { TableOfContents } from "../../components/blog/table-of-contents";
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
		<div className="min-h-screen bg-white text-black">
			<Navbar />
			<main className="mx-auto max-w-7xl px-[clamp(1.5rem,6vw,6rem)] pt-32 pb-32">
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
	const headings = useMemo(
		() => (post ? extractHeadings(post.content) : []),
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
					<h1 className="mt-4 font-black text-[clamp(2.5rem,6vw,5rem)] uppercase leading-[0.9] tracking-[-0.04em]">
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
			<div className="mb-12">
				<BackLink />
			</div>

			<header className="mx-auto mb-16 grid max-w-5xl grid-cols-12 gap-6 lg:mb-20">
				<div className="col-span-12 lg:col-span-2">
					<span className="font-mono text-[10px] text-black/55 uppercase tracking-[0.35em]">
						{post.tags[0]?.name ?? "Article"}
					</span>
				</div>
				<div className="col-span-12 lg:col-span-10">
					<h1 className="font-black text-[clamp(2rem,5.5vw,4.5rem)] uppercase leading-[0.95] tracking-[-0.03em]">
						{post.title}
					</h1>
					{post.excerpt && (
						<p className="mt-6 max-w-[60ch] text-lg text-black/70 leading-relaxed lg:text-xl">
							{post.excerpt}
						</p>
					)}

					<div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-black/10 border-t pt-6 font-mono text-[11px] text-black/55 uppercase tracking-[0.25em]">
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
				</div>
			</header>

			{post.coverImage && (
				<div className="mx-auto mb-20 max-w-6xl overflow-hidden bg-black/5">
					<img
						alt={post.title}
						className="h-auto w-full object-cover"
						src={post.coverImage}
					/>
				</div>
			)}

			<div className="mx-auto grid max-w-6xl grid-cols-12 gap-x-10 gap-y-12">
				<aside className="col-span-12 lg:col-span-3 lg:sticky lg:top-32 lg:self-start">
					<TableOfContents headings={headings} />
				</aside>
				<article className="col-span-12 lg:col-span-9 lg:max-w-[72ch]">
					<BlogContent content={post.content} />
					<div className="mt-16 border-black/10 border-t pt-10">
						<ShareArticle title={post.title} url={shareUrl} />
					</div>
				</article>
			</div>

			{related.length > 0 && (
				<section className="mt-32 border-black/10 border-t pt-16">
					<div className="mb-10 flex items-baseline justify-between">
						<span className="font-mono text-[10px] text-black/55 uppercase tracking-[0.35em]">
							Keep reading
						</span>
						<span className="font-mono text-[10px] text-black/45 uppercase tracking-[0.35em] tabular-nums">
							{String(related.length).padStart(2, "0")}
						</span>
					</div>
					<div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-10">
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
