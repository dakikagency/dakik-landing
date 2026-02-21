"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { AutomationListCard } from "@/components/automations/automation-list-card";
import { Footer, Navbar } from "@/components/landing";
import { Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

// Sample automation data for when database is empty
const sampleAutomations = [
	{
		id: "1",
		slug: "email-automation-workflow",
		title: "Automated Email Marketing Workflow",
		excerpt:
			"Streamline your email campaigns with intelligent automation that adapts to customer behavior.",
		content: "",
		coverImage:
			"https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
		fileUrl: "https://example.com/files/email-automation-workflow.zip",
		published: true,
		publishedAt: new Date("2025-01-15"),
		createdAt: new Date(),
		updatedAt: new Date(),
		tags: [
			{ id: "1", name: "Email", slug: "email" },
			{ id: "2", name: "Marketing", slug: "marketing" },
		],
	},
	{
		id: "2",
		slug: "customer-onboarding-automation",
		title: "Smart Customer Onboarding System",
		excerpt:
			"Create seamless onboarding experiences with automated workflows and personalized touchpoints.",
		content: "",
		coverImage:
			"https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
		published: true,
		publishedAt: new Date("2025-01-12"),
		createdAt: new Date(),
		updatedAt: new Date(),
		tags: [
			{ id: "3", name: "Onboarding", slug: "onboarding" },
			{ id: "4", name: "CRM", slug: "crm" },
		],
	},
	{
		id: "3",
		slug: "data-sync-automation",
		title: "Automated Data Synchronization",
		excerpt:
			"Keep your data in sync across multiple platforms with real-time automation.",
		content: "",
		coverImage:
			"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
		fileUrl: "https://example.com/files/data-sync-automation.zip",
		published: true,
		publishedAt: new Date("2025-01-08"),
		createdAt: new Date(),
		updatedAt: new Date(),
		tags: [
			{ id: "5", name: "Data", slug: "data" },
			{ id: "6", name: "Integration", slug: "integration" },
		],
	},
	{
		id: "4",
		slug: "social-media-automation",
		title: "Social Media Content Scheduler",
		excerpt:
			"Schedule and automate your social media posts across all platforms with intelligent timing.",
		content: "",
		coverImage: null,
		published: true,
		publishedAt: new Date("2025-01-05"),
		createdAt: new Date(),
		updatedAt: new Date(),
		tags: [
			{ id: "7", name: "Social", slug: "social" },
			{ id: "8", name: "Content", slug: "content" },
		],
	},
	{
		id: "5",
		slug: "invoice-automation",
		title: "Automated Invoice Processing",
		excerpt:
			"Automatically generate, send, and track invoices with smart payment reminders.",
		content: "",
		coverImage: null,
		fileUrl: "https://example.com/files/invoice-automation.zip",
		published: true,
		publishedAt: new Date("2025-01-03"),
		createdAt: new Date(),
		updatedAt: new Date(),
		tags: [
			{ id: "9", name: "Finance", slug: "finance" },
			{ id: "10", name: "Invoicing", slug: "invoicing" },
		],
	},
];

const sampleTags = [
	{ id: "1", name: "Email", slug: "email", _count: { automations: 1 } },
	{ id: "2", name: "Marketing", slug: "marketing", _count: { automations: 1 } },
	{
		id: "3",
		name: "Onboarding",
		slug: "onboarding",
		_count: { automations: 1 },
	},
	{ id: "5", name: "Data", slug: "data", _count: { automations: 1 } },
	{ id: "9", name: "Finance", slug: "finance", _count: { automations: 1 } },
];

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
			<h3 className="mb-2 font-semibold text-lg">No automations yet</h3>
			<p className="text-gray-500">
				Check back soon for new automation workflows.
			</p>
		</div>
	);
}

function AutomationsListContentInner() {
	const searchParams = useSearchParams();
	const pageParam = searchParams.get("page");
	const tagParam = searchParams.get("tag");

	const [currentPage, setCurrentPage] = useState(
		pageParam ? Number.parseInt(pageParam, 10) : 1
	);
	const [selectedTag, setSelectedTag] = useState<string | undefined>(
		tagParam ?? undefined
	);

	const automationsQuery = useQuery(
		trpc.automation.list.queryOptions({
			page: currentPage,
			limit: 12,
			tag: selectedTag,
		})
	);

	const tagsQuery = useQuery(trpc.automation.getTags.queryOptions());

	// Use sample data if database is empty or query failed
	const automations =
		automationsQuery.data?.automations &&
		automationsQuery.data.automations.length > 0
			? automationsQuery.data.automations
			: sampleAutomations;
	const pagination = automationsQuery.data?.pagination ?? {
		page: 1,
		limit: 12,
		total: sampleAutomations.length,
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

	// Filter automations by selected tag for sample data
	const filteredAutomations = selectedTag
		? automations.filter((a) => a.tags.some((t) => t.slug === selectedTag))
		: automations;

	const heroAutomation = filteredAutomations[0] ?? null;
	const sidebarAutomations = filteredAutomations.slice(1, 6);
	const listAutomations = filteredAutomations.slice(6);

	return (
		<>
			<Navbar />
			<main className="min-h-screen bg-white pt-16">
				{/* Hero / Featured Section */}
				<section className="py-12 sm:py-16">
					<div className="mx-auto max-w-6xl px-[clamp(1rem,5vw,4rem)]">
						<Reveal direction="up">
							<span className="mb-6 inline-block font-medium text-gray-500 text-sm uppercase tracking-widest">
								Automations
							</span>
						</Reveal>

						{automationsQuery.isLoading && <FeaturedSkeleton />}

						{!(automationsQuery.isLoading || heroAutomation) && <EmptyState />}

						{!automationsQuery.isLoading && heroAutomation && (
							<div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
								<AutomationListCard
									className="lg:col-span-3"
									coverImage={heroAutomation.coverImage}
									excerpt={heroAutomation.excerpt}
									publishedAt={heroAutomation.publishedAt}
									slug={heroAutomation.slug}
									tags={heroAutomation.tags}
									title={heroAutomation.title}
									variant="featured"
								/>
								{sidebarAutomations.length > 0 && (
									<div className="lg:col-span-2">
										<Reveal direction="up">
											<h3 className="mb-5 font-semibold text-gray-400 text-xs uppercase tracking-widest">
												Featured
											</h3>
										</Reveal>
										<div className="flex flex-col gap-5">
											{sidebarAutomations.map((automation) => (
												<AutomationListCard
													coverImage={automation.coverImage}
													fileUrl={automation.fileUrl}
													key={automation.id}
													publishedAt={automation.publishedAt}
													slug={automation.slug}
													tags={automation.tags}
													title={automation.title}
													variant="sidebar"
												/>
											))}
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				</section>

				{/* Tag Filter Section */}
				<section className="border-gray-100 border-t">
					<div className="mx-auto max-w-6xl px-[clamp(1rem,5vw,4rem)] py-6">
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

				{/* List Section */}
				{listAutomations.length > 0 && (
					<section className="border-gray-100 border-t py-12 sm:py-16">
						<div className="mx-auto max-w-6xl px-[clamp(1rem,5vw,4rem)]">
							<Reveal direction="up">
								<div className="mb-8 flex items-center justify-between">
									<h2 className="font-bold text-2xl tracking-tight">
										All Automations
									</h2>
									<Link
										className="flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 font-medium text-gray-600 text-sm transition-colors hover:bg-gray-200"
										href="/automations"
									>
										View All
										<ArrowRight className="h-3.5 w-3.5" />
									</Link>
								</div>
							</Reveal>

							<div className="divide-y divide-gray-100">
								{listAutomations.map((automation) => (
									<AutomationListCard
										coverImage={automation.coverImage}
										excerpt={automation.excerpt}
										fileUrl={automation.fileUrl}
										key={automation.id}
										publishedAt={automation.publishedAt}
										slug={automation.slug}
										tags={automation.tags}
										title={automation.title}
									/>
								))}
							</div>

							{/* Pagination */}
							{pagination.totalPages > 1 && (
								<div className="mt-12 flex items-center justify-center gap-4">
									<button
										className={cn(
											"rounded-full px-5 py-2.5 font-medium text-sm transition-colors",
											pagination.hasPrev
												? "bg-gray-100 text-black hover:bg-gray-200"
												: "cursor-not-allowed bg-gray-50 text-gray-300"
										)}
										disabled={!pagination.hasPrev}
										onClick={() => handlePageChange(currentPage - 1)}
										type="button"
									>
										Previous
									</button>
									<span className="text-gray-500 text-sm">
										Page {pagination.page} of {pagination.totalPages}
									</span>
									<button
										className={cn(
											"rounded-full px-5 py-2.5 font-medium text-sm transition-colors",
											pagination.hasNext
												? "bg-gray-100 text-black hover:bg-gray-200"
												: "cursor-not-allowed bg-gray-50 text-gray-300"
										)}
										disabled={!pagination.hasNext}
										onClick={() => handlePageChange(currentPage + 1)}
										type="button"
									>
										Next
									</button>
								</div>
							)}
						</div>
					</section>
				)}
			</main>
			<Footer />
		</>
	);
}

export default function AutomationListContent() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
				</div>
			}
		>
			<AutomationsListContentInner />
		</Suspense>
	);
}
