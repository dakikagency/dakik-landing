"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { AutomationCard } from "@/components/automations";
import { Footer, Navbar } from "@/components/landing";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion";
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
		published: true,
		publishedAt: new Date("2025-01-08"),
		createdAt: new Date(),
		updatedAt: new Date(),
		tags: [
			{ id: "5", name: "Data", slug: "data" },
			{ id: "6", name: "Integration", slug: "integration" },
		],
	},
];

const sampleTags = [
	{ id: "1", name: "Email", slug: "email", _count: { automations: 1 } },
	{ id: "2", name: "Marketing", slug: "marketing", _count: { automations: 1 } },
	{ id: "3", name: "Onboarding", slug: "onboarding", _count: { automations: 1 } },
];

function AutomationsListContent() {
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
		automationsQuery.data?.automations && automationsQuery.data.automations.length > 0
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

	return (
		<>
			<Navbar />
			<main className="min-h-screen bg-white pt-16">
				{/* Hero Section */}
				<section className="border-gray-100 border-b py-20">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8">
						<Reveal direction="up">
							<span className="mb-4 inline-block font-medium text-gray-500 text-sm uppercase tracking-widest">
								Automation Solutions
							</span>
						</Reveal>
						<Reveal delay={0.1} direction="up">
							<h1 className="mb-6 max-w-3xl font-bold text-5xl tracking-tight md:text-6xl">
								Automations
							</h1>
						</Reveal>
						<Reveal delay={0.2} direction="up">
							<p className="max-w-2xl text-gray-600 text-lg leading-relaxed">
								Discover powerful automation workflows that streamline your business
								processes and boost productivity.
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

				{/* Automations Grid */}
				<section className="py-16">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8">
						{automationsQuery.isLoading ? (
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
							</div>
						) : (
							<StaggerContainer className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
								{automations.map((automation) => (
									<StaggerItem key={automation.id}>
										<AutomationCard
											coverImage={automation.coverImage}
											excerpt={automation.excerpt}
											publishedAt={automation.publishedAt}
											slug={automation.slug}
											tags={automation.tags}
											title={automation.title}
										/>
									</StaggerItem>
								))}
							</StaggerContainer>
						)}

						{/* Empty State */}
						{!automationsQuery.isLoading && automations.length === 0 && (
							<div className="py-20 text-center">
								<Search className="mx-auto mb-4 h-12 w-12 text-gray-300" />
								<h3 className="mb-2 font-semibold text-lg">No automations found</h3>
								<p className="text-gray-500">
									{selectedTag
										? "No automations match the selected tag. Try a different filter."
										: "Check back soon for new automation workflows."}
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

export default function AutomationsPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
				</div>
			}
		>
			<AutomationsListContent />
		</Suspense>
	);
}
