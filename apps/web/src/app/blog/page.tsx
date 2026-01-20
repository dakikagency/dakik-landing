"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { BlogCard } from "@/components/blog";
import { Footer, Navbar } from "@/components/landing";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

// Sample blog data for when database is empty
const samplePosts = [
	{
		id: "1",
		slug: "crafting-digital-experiences",
		title: "Crafting Digital Experiences That Matter",
		excerpt:
			"How thoughtful design and development can transform your business presence in the digital landscape.",
		content: "",
		coverImage:
			"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
		published: true,
		publishedAt: new Date("2025-01-10"),
		createdAt: new Date(),
		updatedAt: new Date(),
		tags: [
			{ id: "1", name: "Design", slug: "design" },
			{ id: "2", name: "Development", slug: "development" },
		],
	},
	{
		id: "2",
		slug: "ai-automation-future",
		title: "The Future of AI Automation in Business",
		excerpt:
			"Exploring how artificial intelligence is reshaping workflows and creating new opportunities for growth.",
		content: "",
		coverImage:
			"https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
		published: true,
		publishedAt: new Date("2025-01-08"),
		createdAt: new Date(),
		updatedAt: new Date(),
		tags: [
			{ id: "3", name: "AI", slug: "ai" },
			{ id: "4", name: "Automation", slug: "automation" },
		],
	},
	{
		id: "3",
		slug: "brand-identity-guide",
		title: "Building a Brand Identity That Resonates",
		excerpt:
			"A comprehensive guide to creating a cohesive brand presence that connects with your audience.",
		content: "",
		coverImage:
			"https://images.unsplash.com/photo-1634942537034-2531766767d1?w=800&q=80",
		published: true,
		publishedAt: new Date("2025-01-05"),
		createdAt: new Date(),
		updatedAt: new Date(),
		tags: [
			{ id: "5", name: "Branding", slug: "branding" },
			{ id: "1", name: "Design", slug: "design" },
		],
	},
	{
		id: "4",
		slug: "minimalist-web-design",
		title: "The Power of Minimalist Web Design",
		excerpt:
			"Why less is more when it comes to creating impactful digital experiences.",
		content: "",
		coverImage:
			"https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80",
		published: true,
		publishedAt: new Date("2025-01-02"),
		createdAt: new Date(),
		updatedAt: new Date(),
		tags: [
			{ id: "1", name: "Design", slug: "design" },
			{ id: "6", name: "Web", slug: "web" },
		],
	},
	{
		id: "5",
		slug: "mobile-first-approach",
		title: "Why Mobile-First Design is Non-Negotiable",
		excerpt:
			"Understanding the importance of prioritizing mobile experiences in modern web development.",
		content: "",
		coverImage:
			"https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
		published: true,
		publishedAt: new Date("2024-12-28"),
		createdAt: new Date(),
		updatedAt: new Date(),
		tags: [
			{ id: "6", name: "Web", slug: "web" },
			{ id: "7", name: "Mobile", slug: "mobile" },
		],
	},
	{
		id: "6",
		slug: "product-development-process",
		title: "Our Product Development Process",
		excerpt:
			"A behind-the-scenes look at how we transform ideas into successful digital products.",
		content: "",
		coverImage:
			"https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80",
		published: true,
		publishedAt: new Date("2024-12-20"),
		createdAt: new Date(),
		updatedAt: new Date(),
		tags: [
			{ id: "8", name: "Process", slug: "process" },
			{ id: "2", name: "Development", slug: "development" },
		],
	},
];

const sampleTags = [
	{ id: "1", name: "Design", slug: "design", _count: { posts: 3 } },
	{ id: "2", name: "Development", slug: "development", _count: { posts: 2 } },
	{ id: "3", name: "AI", slug: "ai", _count: { posts: 1 } },
	{ id: "4", name: "Automation", slug: "automation", _count: { posts: 1 } },
	{ id: "5", name: "Branding", slug: "branding", _count: { posts: 1 } },
	{ id: "6", name: "Web", slug: "web", _count: { posts: 2 } },
];

function BlogListContent() {
	const searchParams = useSearchParams();
	const pageParam = searchParams.get("page");
	const tagParam = searchParams.get("tag");

	const [currentPage, setCurrentPage] = useState(
		pageParam ? Number.parseInt(pageParam, 10) : 1
	);
	const [selectedTag, setSelectedTag] = useState<string | undefined>(
		tagParam ?? undefined
	);

	const postsQuery = useQuery(
		trpc.blog.list.queryOptions({
			page: currentPage,
			limit: 12,
			tag: selectedTag,
		})
	);

	const tagsQuery = useQuery(trpc.blog.getTags.queryOptions());

	// Use sample data if database is empty or query failed
	const posts =
		postsQuery.data?.posts && postsQuery.data.posts.length > 0
			? postsQuery.data.posts
			: samplePosts;
	const pagination = postsQuery.data?.pagination ?? {
		page: 1,
		limit: 12,
		total: samplePosts.length,
		totalPages: 1,
		hasNext: false,
		hasPrev: false,
	};
	const tags =
		tagsQuery.data && tagsQuery.data.length > 0 ? tagsQuery.data : sampleTags;

	const handleTagClick = (tagSlug: string | undefined) => {
		setSelectedTag(tagSlug);
		setCurrentPage(1);
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<>
			<Navbar />
			<main className="min-h-screen bg-white pt-16">
				{/* Hero Section */}
				<section className="border-gray-100 border-b py-20">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8">
						<Reveal direction="up">
							<span className="mb-4 inline-block font-medium text-gray-500 text-sm uppercase tracking-widest">
								Insights
							</span>
						</Reveal>
						<Reveal delay={0.1} direction="up">
							<h1 className="mb-6 max-w-3xl font-bold text-5xl tracking-tight md:text-6xl">
								Blog
							</h1>
						</Reveal>
						<Reveal delay={0.2} direction="up">
							<p className="max-w-2xl text-gray-600 text-lg leading-relaxed">
								Thoughts, insights, and perspectives on design, development, and
								the digital landscape.
							</p>
						</Reveal>
					</div>
				</section>

				{/* Filter Section */}
				<section className="border-gray-100 border-b py-6">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex flex-wrap items-center gap-3">
							<span className="mr-2 font-medium text-gray-400 text-sm">
								Filter:
							</span>
							<button
								className={cn(
									"rounded-full px-4 py-1.5 font-medium text-sm transition-colors",
									selectedTag
										? "bg-gray-100 text-gray-600 hover:bg-gray-200"
										: "bg-black text-white"
								)}
								onClick={() => handleTagClick(undefined)}
								type="button"
							>
								All
							</button>
							{tags.map((tag) => (
								<button
									className={cn(
										"rounded-full px-4 py-1.5 font-medium text-sm transition-colors",
										selectedTag === tag.slug
											? "bg-black text-white"
											: "bg-gray-100 text-gray-600 hover:bg-gray-200"
									)}
									key={tag.id}
									onClick={() => handleTagClick(tag.slug)}
									type="button"
								>
									{tag.name}
								</button>
							))}
						</div>
					</div>
				</section>

				{/* Posts Grid */}
				<section className="py-16">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8">
						{postsQuery.isLoading ? (
							<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
								<div className="animate-pulse">
									<div className="mb-4 aspect-[16/10] rounded bg-gray-200" />
									<div className="mb-2 h-4 w-20 rounded bg-gray-200" />
									<div className="mb-2 h-6 w-3/4 rounded bg-gray-200" />
									<div className="h-4 w-full rounded bg-gray-200" />
								</div>
								<div className="animate-pulse">
									<div className="mb-4 aspect-[16/10] rounded bg-gray-200" />
									<div className="mb-2 h-4 w-20 rounded bg-gray-200" />
									<div className="mb-2 h-6 w-3/4 rounded bg-gray-200" />
									<div className="h-4 w-full rounded bg-gray-200" />
								</div>
								<div className="animate-pulse">
									<div className="mb-4 aspect-[16/10] rounded bg-gray-200" />
									<div className="mb-2 h-4 w-20 rounded bg-gray-200" />
									<div className="mb-2 h-6 w-3/4 rounded bg-gray-200" />
									<div className="h-4 w-full rounded bg-gray-200" />
								</div>
								<div className="hidden animate-pulse md:block">
									<div className="mb-4 aspect-[16/10] rounded bg-gray-200" />
									<div className="mb-2 h-4 w-20 rounded bg-gray-200" />
									<div className="mb-2 h-6 w-3/4 rounded bg-gray-200" />
									<div className="h-4 w-full rounded bg-gray-200" />
								</div>
								<div className="hidden animate-pulse lg:block">
									<div className="mb-4 aspect-[16/10] rounded bg-gray-200" />
									<div className="mb-2 h-4 w-20 rounded bg-gray-200" />
									<div className="mb-2 h-6 w-3/4 rounded bg-gray-200" />
									<div className="h-4 w-full rounded bg-gray-200" />
								</div>
								<div className="hidden animate-pulse lg:block">
									<div className="mb-4 aspect-[16/10] rounded bg-gray-200" />
									<div className="mb-2 h-4 w-20 rounded bg-gray-200" />
									<div className="mb-2 h-6 w-3/4 rounded bg-gray-200" />
									<div className="h-4 w-full rounded bg-gray-200" />
								</div>
							</div>
						) : (
							<StaggerContainer className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
								{posts.map((post) => (
									<StaggerItem key={post.id}>
										<BlogCard
											coverImage={post.coverImage}
											excerpt={post.excerpt}
											publishedAt={post.publishedAt}
											slug={post.slug}
											tags={post.tags}
											title={post.title}
										/>
									</StaggerItem>
								))}
							</StaggerContainer>
						)}

						{/* Empty State */}
						{!postsQuery.isLoading && posts.length === 0 && (
							<div className="py-20 text-center">
								<Search className="mx-auto mb-4 h-12 w-12 text-gray-300" />
								<h3 className="mb-2 font-semibold text-lg">No posts found</h3>
								<p className="text-gray-500">
									{selectedTag
										? "No posts match the selected tag. Try a different filter."
										: "Check back soon for new content."}
								</p>
							</div>
						)}

						{/* Pagination */}
						{pagination.totalPages > 1 && (
							<div className="mt-16 flex items-center justify-center gap-4">
								<button
									className={cn(
										"flex items-center gap-2 rounded-full px-5 py-2.5 font-medium text-sm transition-colors",
										pagination.hasPrev
											? "bg-gray-100 text-black hover:bg-gray-200"
											: "cursor-not-allowed bg-gray-50 text-gray-300"
									)}
									disabled={!pagination.hasPrev}
									onClick={() => handlePageChange(currentPage - 1)}
									type="button"
								>
									<ArrowLeft className="h-4 w-4" />
									Previous
								</button>
								<span className="text-gray-500 text-sm">
									Page {pagination.page} of {pagination.totalPages}
								</span>
								<button
									className={cn(
										"flex items-center gap-2 rounded-full px-5 py-2.5 font-medium text-sm transition-colors",
										pagination.hasNext
											? "bg-gray-100 text-black hover:bg-gray-200"
											: "cursor-not-allowed bg-gray-50 text-gray-300"
									)}
									disabled={!pagination.hasNext}
									onClick={() => handlePageChange(currentPage + 1)}
									type="button"
								>
									Next
									<ArrowRight className="h-4 w-4" />
								</button>
							</div>
						)}
					</div>
				</section>
			</main>
			<Footer />
		</>
	);
}

export default function BlogPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
				</div>
			}
		>
			<BlogListContent />
		</Suspense>
	);
}
