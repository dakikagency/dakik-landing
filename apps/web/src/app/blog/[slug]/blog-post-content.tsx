"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, Tag, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogCard, BlogContent } from "@/components/blog";
import { Footer, Navbar } from "@/components/landing";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion";
import { trpc } from "@/utils/trpc";

export default function BlogPostContent({ slug }: { slug: string }) {
	const postQuery = useQuery(trpc.blog.getBySlug.queryOptions({ slug }));

	const relatedPostsQuery = useQuery(
		trpc.blog.getRelatedPosts.queryOptions({ slug, limit: 3 })
	);

	const post = postQuery.data ?? null;
	const relatedPosts = relatedPostsQuery.data ?? [];

	// Show loading state
	if (postQuery.isLoading) {
		return (
			<>
				<Navbar />
				<main className="min-h-screen bg-white pt-16">
					<div className="animate-pulse">
						<div className="h-[50vh] bg-gray-200" />
						<div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
							<div className="mx-auto max-w-3xl">
								<div className="mb-4 h-8 w-1/4 rounded bg-gray-200" />
								<div className="mb-8 h-12 w-3/4 rounded bg-gray-200" />
								<div className="space-y-4">
									<div className="h-4 w-[85%] rounded bg-gray-200" />
									<div className="h-4 w-[92%] rounded bg-gray-200" />
									<div className="h-4 w-[78%] rounded bg-gray-200" />
									<div className="h-4 w-[95%] rounded bg-gray-200" />
									<div className="h-4 w-[68%] rounded bg-gray-200" />
									<div className="h-4 w-[88%] rounded bg-gray-200" />
									<div className="h-4 w-[75%] rounded bg-gray-200" />
									<div className="h-4 w-[82%] rounded bg-gray-200" />
								</div>
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

	return (
		<>
			<Navbar />
			<main className="min-h-screen bg-white pt-16">
				{/* Cover Image */}
				<motion.div
					animate={{ opacity: 1 }}
					className="relative h-[50vh] min-h-[400px] overflow-hidden bg-gray-100"
					initial={{ opacity: 0 }}
					transition={{ duration: 0.6 }}
				>
					{post.coverImage ? (
						<Image
							alt={post.title}
							className="object-cover"
							fill
							priority
							sizes="100vw"
							src={post.coverImage}
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center">
							<span className="font-medium text-gray-400 text-lg">
								No cover image
							</span>
						</div>
					)}
					{/* Gradient overlay */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
				</motion.div>

				{/* Article Content */}
				<article className="relative -mt-20 pb-20">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-3xl">
							{/* Header */}
							<motion.div
								animate={{ opacity: 1, y: 0 }}
								className="mb-12 rounded-lg bg-white p-8 shadow-sm"
								initial={{ opacity: 0, y: 20 }}
								transition={{ duration: 0.5, delay: 0.2 }}
							>
								{/* Back link */}
								<Link
									className="mb-6 inline-flex items-center gap-2 text-gray-500 text-sm transition-colors hover:text-black"
									href="/blog"
								>
									<ArrowLeft className="h-4 w-4" />
									Back to Blog
								</Link>

								{/* Tags */}
								{post.tags.length > 0 && (
									<div className="mb-4 flex flex-wrap gap-2">
										{post.tags.map((tag) => (
											<Link
												className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600 text-xs transition-colors hover:bg-gray-200"
												href={`/blog?tag=${tag.slug}`}
												key={tag.id}
											>
												<Tag className="h-3 w-3" />
												{tag.name}
											</Link>
										))}
									</div>
								)}

								{/* Title */}
								<h1 className="mb-4 font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl">
									{post.title}
								</h1>

								{/* Meta */}
								<div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm">
									{formattedDate && post.publishedAt && (
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4" />
											<time dateTime={new Date(post.publishedAt).toISOString()}>
												{formattedDate}
											</time>
										</div>
									)}

									<div className="flex items-center gap-2">
										<User className="h-4 w-4" />
										<span>Erdeniz Korkmaz</span>
									</div>

									{post.updatedAt &&
										new Date(post.updatedAt) >
											new Date(post.publishedAt || 0) && (
											<div className="text-muted-foreground text-xs">
												(Updated:{" "}
												{new Intl.DateTimeFormat("en-US", {
													month: "short",
													day: "numeric",
													year: "numeric",
												}).format(new Date(post.updatedAt))}
												)
											</div>
										)}
								</div>
							</motion.div>

							{/* Content */}
							<motion.div
								animate={{ opacity: 1, y: 0 }}
								initial={{ opacity: 0, y: 20 }}
								transition={{ duration: 0.5, delay: 0.4 }}
							>
								<BlogContent content={post.content} />
							</motion.div>
						</div>
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
