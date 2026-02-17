"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useMemo } from "react";

import {
	BlogCard,
	BlogContent,
	extractHeadings,
	ShareArticle,
	TableOfContents,
} from "@/components/blog";
import { Footer, Navbar } from "@/components/landing";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion";
import { BLOG_AUTHOR, calculateReadTime } from "@/lib/blog";
import { trpc } from "@/utils/trpc";

export default function BlogPostContent({ slug }: { slug: string }) {
	const postQuery = useQuery(trpc.blog.getBySlug.queryOptions({ slug }));

	const relatedPostsQuery = useQuery(
		trpc.blog.getRelatedPosts.queryOptions({ slug, limit: 3 })
	);

	const post = postQuery.data ?? null;
	const relatedPosts = relatedPostsQuery.data ?? [];

	const headings = useMemo(
		() => (post ? extractHeadings(post.content) : []),
		[post]
	);

	const readTime = useMemo(
		() => (post ? calculateReadTime(post.content) : 0),
		[post]
	);

	// Show loading state
	if (postQuery.isLoading) {
		return (
			<>
				<Navbar />
				<main className="min-h-screen bg-white pt-24">
					<div className="animate-pulse">
						<div className="mx-auto max-w-3xl px-4">
							<div className="mb-6 h-5 w-20 rounded bg-gray-200" />
							<div className="mb-4 h-10 w-3/4 rounded bg-gray-200" />
							<div className="mb-10 h-5 w-1/3 rounded bg-gray-200" />
						</div>
						<div className="mx-auto max-w-5xl px-4">
							<div className="aspect-[16/9] rounded-xl bg-gray-200" />
						</div>
						<div className="mx-auto max-w-3xl px-4 py-12">
							<div className="space-y-4">
								<div className="h-4 w-[85%] rounded bg-gray-200" />
								<div className="h-4 w-[92%] rounded bg-gray-200" />
								<div className="h-4 w-[78%] rounded bg-gray-200" />
								<div className="h-4 w-[95%] rounded bg-gray-200" />
								<div className="h-4 w-[68%] rounded bg-gray-200" />
							</div>
						</div>
					</div>
				</main>
				<Footer />
			</>
		);
	}

	// Show 404 if post not found
	if (!(post || postQuery.isLoading)) {
		notFound();
	}

	if (!post) {
		return null;
	}

	const formattedDate = post.publishedAt
		? new Intl.DateTimeFormat("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
			}).format(new Date(post.publishedAt))
		: null;

	const articleUrl =
		typeof window !== "undefined"
			? window.location.href
			: `https://dakik.co.uk/blog/${slug}`;

	return (
		<>
			<Navbar />
			<main className="min-h-screen bg-white pt-24">
				{/* Header Section */}
				<header className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						initial={{ opacity: 0, y: 16 }}
						transition={{ duration: 0.5 }}
					>
						{/* Back link */}
						<Link
							className="mb-8 inline-flex items-center gap-2 text-gray-500 text-sm transition-colors hover:text-black"
							href="/blog"
						>
							<ArrowLeft className="h-4 w-4" />
							Back
						</Link>

						{/* Tag pill */}
						{post.tags.length > 0 && (
							<div className="mb-4 flex justify-center">
								<Link
									className="rounded-full border border-gray-300 px-4 py-1 font-medium text-gray-600 text-sm transition-colors hover:border-gray-400 hover:text-black"
									href={`/blog?tag=${post.tags[0].slug}`}
								>
									{post.tags[0].name}
								</Link>
							</div>
						)}

						{/* Title */}
						<h1 className="mb-4 text-center font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl">
							{post.title}
						</h1>

						{/* Meta line */}
						<div className="mb-10 flex items-center justify-center gap-3 text-gray-500 text-sm">
							{formattedDate && (
								<time
									dateTime={
										post.publishedAt
											? new Date(post.publishedAt).toISOString()
											: undefined
									}
								>
									{formattedDate}
								</time>
							)}
							{formattedDate && readTime > 0 && (
								<span aria-hidden="true">&middot;</span>
							)}
							{readTime > 0 && (
								<span className="flex items-center gap-1">
									<Clock className="h-3.5 w-3.5" />
									{readTime} min read
								</span>
							)}
						</div>
					</motion.div>
				</header>

				{/* Cover Image */}
				{post.coverImage && (
					<motion.div
						animate={{ opacity: 1, scale: 1 }}
						className="mx-auto mb-12 max-w-5xl px-4 sm:px-6 lg:px-8"
						initial={{ opacity: 0, scale: 0.98 }}
						transition={{ duration: 0.6, delay: 0.15 }}
					>
						<div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-gray-100">
							<Image
								alt={post.title}
								className="object-cover"
								fill
								priority
								sizes="(max-width: 1024px) 100vw, 1024px"
								src={post.coverImage}
							/>
						</div>
					</motion.div>
				)}

				{/* Content Area (two-column) */}
				<article className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
					<div className="relative lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
						{/* Sidebar */}
						<aside className="hidden lg:block">
							<div className="sticky top-28 space-y-10">
								<TableOfContents headings={headings} />
								<ShareArticle title={post.title} url={articleUrl} />
							</div>
						</aside>

						{/* Article content */}
						<motion.div
							animate={{ opacity: 1, y: 0 }}
							initial={{ opacity: 0, y: 20 }}
							transition={{ duration: 0.5, delay: 0.3 }}
						>
							<BlogContent content={post.content} />

							{/* Author line */}
							<div className="mt-12 border-gray-100 border-t pt-6 text-gray-500 text-sm">
								Written by {BLOG_AUTHOR.name}
								{post.updatedAt &&
									new Date(post.updatedAt) >
										new Date(post.publishedAt || 0) && (
										<span className="ml-2 text-gray-400">
											&middot; Updated{" "}
											{new Intl.DateTimeFormat("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											}).format(new Date(post.updatedAt))}
										</span>
									)}
							</div>
						</motion.div>
					</div>
				</article>

				{/* CTA Section */}
				<section className="border-gray-100 border-y bg-gray-50 py-20">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8">
						<Reveal direction="up">
							<div className="mx-auto max-w-2xl text-center">
								<span className="mb-4 inline-block font-medium text-gray-500 text-sm uppercase tracking-widest">
									Ready to start?
								</span>
								<h2 className="mb-6 font-bold text-3xl tracking-tight md:text-4xl">
									Let's Build Something Together
								</h2>
								<p className="mb-8 text-gray-600 text-lg leading-relaxed">
									Have a project in mind? We'd love to hear about it. Get in
									touch and let's create something extraordinary.
								</p>
								<Link
									className="inline-flex items-center gap-2 rounded-full bg-black px-8 py-4 font-medium text-lg text-white transition-colors hover:bg-gray-800"
									href="/survey"
								>
									Start a Project
									<ArrowRight className="h-5 w-5" />
								</Link>
							</div>
						</Reveal>
					</div>
				</section>

				{/* Related Posts */}
				{relatedPosts.length > 0 && (
					<section className="py-20">
						<div className="container mx-auto px-4 sm:px-6 lg:px-8">
							<Reveal direction="up">
								<h2 className="mb-12 font-bold text-2xl tracking-tight md:text-3xl">
									Related Posts
								</h2>
							</Reveal>
							<StaggerContainer className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
								{relatedPosts.map((relatedPost) => (
									<StaggerItem key={relatedPost.id}>
										<BlogCard
											coverImage={relatedPost.coverImage}
											excerpt={relatedPost.excerpt}
											publishedAt={relatedPost.publishedAt}
											slug={relatedPost.slug}
											tags={relatedPost.tags}
											title={relatedPost.title}
										/>
									</StaggerItem>
								))}
							</StaggerContainer>
						</div>
					</section>
				)}
			</main>
			<Footer />
		</>
	);
}
