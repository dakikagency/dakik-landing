import { useQuery } from "@tanstack/react-query";
import { useHead } from "@unhead/react";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
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
	calculateReadTime,
	extractHeadings,
	formatDate,
	type BlogPostFull,
	type BlogPostSummary,
} from "../../lib/blog";

async function fetchPost(slug: string): Promise<{
	post: BlogPostFull;
	related: BlogPostSummary[];
}> {
	const res = await fetch(`/api/blog/${encodeURIComponent(slug)}`);
	if (!res.ok) throw new Error("Failed to load post");
	return res.json();
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
			<div className="min-h-screen bg-white">
				<Navbar />
				<main className="mx-auto max-w-3xl px-6 pt-32 pb-24">
					<p className="text-gray-500">Loading...</p>
				</main>
				<Footer />
			</div>
		);
	}

	if (isError || !post) {
		return (
			<div className="min-h-screen bg-white">
				<Navbar />
				<main className="mx-auto max-w-3xl px-6 pt-32 pb-24">
					<h1 className="font-bold text-3xl">Article not found</h1>
					<p className="mt-3 text-gray-500">
						The article you're looking for is unavailable or has been moved.
					</p>
					<Link className="mt-6 inline-flex items-center gap-2 text-sm" to="/blog">
						<ArrowLeft className="h-4 w-4" /> Back to blog
					</Link>
				</main>
				<Footer />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white">
			<Navbar />
			<main className="mx-auto max-w-7xl px-6 pt-32 pb-24 lg:px-10">
				<Link className="mb-8 inline-flex items-center gap-2 text-gray-500 text-sm transition-colors hover:text-black" to="/blog">
					<ArrowLeft className="h-4 w-4" /> Blog
				</Link>

				<header className="mx-auto mb-12 max-w-3xl">
					{post.tags[0] && (
						<span className="mb-4 inline-block rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600 text-xs uppercase tracking-wide">
							{post.tags[0].name}
						</span>
					)}
					<h1 className="font-bold text-4xl leading-tight tracking-tight sm:text-5xl">
						{post.title}
					</h1>
					{post.excerpt && (
						<p className="mt-5 text-gray-500 text-lg leading-relaxed">{post.excerpt}</p>
					)}

					<div className="mt-8 flex flex-wrap items-center gap-6 text-gray-500 text-sm">
						<div className="flex items-center gap-3">
							<div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 font-semibold text-white text-xs">
								{BLOG_AUTHOR.initials}
							</div>
							<span>{BLOG_AUTHOR.name}</span>
						</div>
						{post.publishedAt && (
							<div className="flex items-center gap-1.5">
								<Calendar className="h-4 w-4" />
								<time dateTime={new Date(post.publishedAt).toISOString()}>
									{formatDate(post.publishedAt)}
								</time>
							</div>
						)}
						<div className="flex items-center gap-1.5">
							<Clock className="h-4 w-4" />
							<span>{readTime} min read</span>
						</div>
					</div>
				</header>

				{post.coverImage && (
					<div className="mb-16 overflow-hidden rounded-2xl bg-gray-100">
						<img
							alt={post.title}
							className="h-auto w-full object-cover"
							src={post.coverImage}
						/>
					</div>
				)}

				<div className="grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)_200px]">
					<aside className="hidden lg:block">
						<TableOfContents headings={headings} />
					</aside>
					<article className="mx-auto w-full max-w-3xl">
						<BlogContent content={post.content} />
					</article>
					<aside className="hidden lg:flex flex-col gap-6">
						<ShareArticle
							title={post.title}
							url={typeof window !== "undefined" ? window.location.href : ""}
						/>
					</aside>
				</div>

				{related.length > 0 && (
					<section className="mt-24 border-gray-100 border-t pt-16">
						<h2 className="mb-8 font-bold text-2xl tracking-tight">Related articles</h2>
						<div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
							{related.map((p) => (
								<BlogCard key={p.slug} {...p} />
							))}
						</div>
					</section>
				)}
			</main>
			<Footer />
		</div>
	);
}

export default BlogPostPage;
