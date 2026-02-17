"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";

import {
	BlogFeaturedHero,
	BlogFeaturedSidebar,
	BlogRecentCard,
} from "@/components/blog";
import { Footer, Navbar } from "@/components/landing";
import { Reveal } from "@/components/motion";
import { trpc } from "@/utils/trpc";

function FeaturedSkeleton() {
	return (
		<div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
			{/* Hero skeleton */}
			<div className="animate-pulse lg:col-span-3">
				<div className="aspect-[16/10] rounded-2xl bg-gray-200" />
			</div>
			{/* Sidebar skeleton */}
			<div className="animate-pulse lg:col-span-2">
				<div className="mb-5 h-4 w-28 rounded bg-gray-200" />
				<div className="flex flex-col gap-5">
					<SidebarSkeletonItem />
					<SidebarSkeletonItem />
					<SidebarSkeletonItem />
					<SidebarSkeletonItem />
					<SidebarSkeletonItem />
				</div>
			</div>
		</div>
	);
}

function SidebarSkeletonItem() {
	return (
		<div className="flex gap-4">
			<div className="h-16 w-16 shrink-0 rounded-lg bg-gray-200" />
			<div className="flex flex-1 flex-col justify-center gap-2">
				<div className="h-4 w-full rounded bg-gray-200" />
				<div className="h-4 w-2/3 rounded bg-gray-200" />
			</div>
		</div>
	);
}

function EmptyState() {
	return (
		<div className="py-20 text-center">
			<Search className="mx-auto mb-4 h-12 w-12 text-gray-300" />
			<h3 className="mb-2 font-semibold text-lg">No posts yet</h3>
			<p className="text-gray-500">Check back soon for new content.</p>
		</div>
	);
}

export default function BlogListContent() {
	const postsQuery = useQuery(
		trpc.blog.list.queryOptions({
			page: 1,
			limit: 15,
		})
	);

	const posts = postsQuery.data?.posts ?? [];

	const heroPost = posts[0] ?? null;
	const sidebarPosts = posts.slice(1, 6);
	const recentPosts = posts.slice(6);

	return (
		<>
			<Navbar />
			<main className="min-h-screen bg-white pt-16">
				{/* Hero / Featured Section */}
				<section className="py-12 sm:py-16">
					<div className="mx-auto max-w-6xl px-[clamp(1rem,5vw,4rem)]">
						<Reveal direction="up">
							<span className="mb-6 inline-block font-medium text-gray-500 text-sm uppercase tracking-widest">
								Blog
							</span>
						</Reveal>

						{postsQuery.isLoading && <FeaturedSkeleton />}
						{!(postsQuery.isLoading || heroPost) && <EmptyState />}
						{!postsQuery.isLoading && heroPost && (
							<div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
								<BlogFeaturedHero className="lg:col-span-3" post={heroPost} />
								{sidebarPosts.length > 0 && (
									<BlogFeaturedSidebar
										className="lg:col-span-2"
										posts={sidebarPosts}
									/>
								)}
							</div>
						)}
					</div>
				</section>

				{/* Recent Posts Section */}
				{recentPosts.length > 0 && (
					<section className="border-gray-100 border-t py-12 sm:py-16">
						<div className="mx-auto max-w-6xl px-[clamp(1rem,5vw,4rem)]">
							<Reveal direction="up">
								<div className="mb-10 flex items-center justify-between">
									<h2 className="font-bold text-2xl tracking-tight">
										Recent Posts
									</h2>
									<Link
										className="flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 font-medium text-gray-600 text-sm transition-colors hover:bg-gray-200"
										href="/blog"
									>
										All Posts
										<ArrowRight className="h-3.5 w-3.5" />
									</Link>
								</div>
							</Reveal>

							<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
								{recentPosts.map((post) => (
									<BlogRecentCard
										content={post.content}
										coverImage={post.coverImage}
										excerpt={post.excerpt}
										key={post.id}
										slug={post.slug}
										title={post.title}
									/>
								))}
							</div>
						</div>
					</section>
				)}
			</main>
			<Footer />
		</>
	);
}
