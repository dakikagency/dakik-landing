"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, Clock, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo } from "react";

import { AutomationCard } from "@/components/automations/automation-card";
import { AutomationContent } from "@/components/automations/automation-content";
import { Footer, Navbar } from "@/components/landing";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion";
import { trpc } from "@/utils/trpc";

// Sample automation data for when database is empty
const sampleAutomationContent = `
## Overview

This automation workflow streamlines email marketing campaigns by automatically segmenting audiences, personalizing content, and optimizing send times based on user behavior patterns.

## How It Works

The system analyzes your customer data and implements intelligent automation to:

- Automatically segment contacts based on engagement levels
- Personalize email content for each segment
- Optimize send times for maximum open rates
- Track and report on campaign performance

> "Automation is not just about saving time—it's about delivering better experiences at scale."

## Key Features

### Intelligent Segmentation

Our AI-powered segmentation engine automatically groups your contacts based on:

1. Purchase history and browsing behavior
2. Email engagement patterns
3. Demographic and firmographic data
4. Custom criteria specific to your business

### Dynamic Content

Content adapts automatically based on:
- User preferences
- Past interactions
- Current stage in customer journey
- Real-time behavioral signals

### Performance Analytics

Track key metrics with detailed reporting:

\`\`\`javascript
const analytics = {
  openRate: 0.42,
  clickRate: 0.18,
  conversionRate: 0.08,
  revenueGenerated: "$45,320"
};
\`\`\`

## Implementation Guide

Setting up this automation is straightforward. Download the workflow file and import it into your automation platform. Customize the segments and content to match your brand and goals.

## Results You Can Expect

Based on our client implementations:
- **35% increase** in email open rates
- **50% improvement** in click-through rates
- **28% boost** in conversion rates
- **Significant time savings** on campaign management

---

*Ready to automate your email marketing? Download the workflow file and get started today.*
`;

const sampleAutomation = {
	id: "1",
	slug: "email-automation-workflow",
	title: "Automated Email Marketing Workflow",
	excerpt:
		"Streamline your email campaigns with intelligent automation that adapts to customer behavior.",
	content: sampleAutomationContent,
	coverImage:
		"https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&q=80",
	fileUrl: "https://example.com/files/email-automation-workflow.zip",
	published: true,
	publishedAt: new Date("2025-01-15"),
	createdAt: new Date(),
	updatedAt: new Date(),
	tags: [
		{ id: "1", name: "Email", slug: "email" },
		{ id: "2", name: "Marketing", slug: "marketing" },
	],
};

const sampleRelatedAutomations = [
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

// Regex for calculating read time - defined at top level for performance
const WHITESPACE_RE = /\s+/;

// Helper function to calculate read time (approximate)
function calculateReadTime(content: string | null | undefined): number {
	if (!content) {
		return 1;
	}
	const words = content.trim().split(WHITESPACE_RE).length;
	return Math.max(1, Math.round(words / 200));
}

// Helper to check if file URL is valid (not null, empty, or example URL)
function hasValidFileUrl(fileUrl: string | null | undefined): boolean {
	if (!fileUrl) {
		return false;
	}
	if (fileUrl.trim() === "") {
		return false;
	}
	// Exclude example/test URLs that might be in sample data
	if (fileUrl.includes("example.com")) {
		return false;
	}
	return true;
}

export default function AutomationPage() {
	const params = useParams();
	const slug = params.slug as string;

	const automationQuery = useQuery(
		trpc.automation.getBySlug.queryOptions({ slug })
	);

	const relatedAutomationsQuery = useQuery(
		trpc.automation.getRelatedAutomations.queryOptions({ slug, limit: 3 })
	);

	// Use sample data if database is empty
	const automation =
		automationQuery.data ??
		(slug === sampleAutomation.slug ? sampleAutomation : null);
	const relatedAutomations =
		relatedAutomationsQuery.data && relatedAutomationsQuery.data.length > 0
			? relatedAutomationsQuery.data
			: sampleRelatedAutomations;

	const readTime = useMemo(
		() => calculateReadTime(automation?.content),
		[automation?.content]
	);

	// Show loading state
	if (automationQuery.isLoading) {
		return (
			<>
				<Navbar />
				<main className="min-h-screen bg-white pt-24">
					<div className="animate-pulse">
						<div className="mx-auto max-w-4xl px-4">
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

	// Show 404 if automation not found
	if (!(automation || automationQuery.isLoading)) {
		notFound();
	}

	if (!automation) {
		return null;
	}

	const formattedDate = automation.publishedAt
		? new Intl.DateTimeFormat("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
			}).format(new Date(automation.publishedAt))
		: null;

	// Check if file is actually available (fixes the bug)
	const showDownloadButton = hasValidFileUrl(automation.fileUrl);

	return (
		<>
			<Navbar />
			<main className="min-h-screen bg-white pt-24">
				{/* Header Section - Similar to blog post */}
				<header className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						initial={{ opacity: 0, y: 16 }}
						transition={{ duration: 0.5 }}
					>
						{/* Back link */}
						<Link
							className="mb-8 inline-flex items-center gap-2 text-gray-500 text-sm transition-colors hover:text-black"
							href="/automations"
						>
							<ArrowLeft className="h-4 w-4" />
							Back to Automations
						</Link>

						{/* Tags */}
						{automation.tags.length > 0 && (
							<div className="mb-4 flex flex-wrap justify-center gap-2">
								{automation.tags.map((tag) => (
									<Link
										className="rounded-full border border-gray-300 px-4 py-1 font-medium text-gray-600 text-sm transition-colors hover:border-gray-400 hover:text-black"
										href={`/automations?tag=${tag.slug}`}
										key={tag.id}
									>
										{tag.name}
									</Link>
								))}
							</div>
						)}

						{/* Title */}
						<h1 className="mb-4 text-center font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl">
							{automation.title}
						</h1>

						{/* Meta line */}
						<div className="mb-10 flex flex-wrap items-center justify-center gap-3 text-gray-500 text-sm">
							{formattedDate && (
								<time
									dateTime={
										automation.publishedAt
											? new Date(automation.publishedAt).toISOString()
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
							{showDownloadButton && (
								<>
									<span aria-hidden="true">&middot;</span>
									<span className="inline-flex items-center gap-1 text-green-600">
										<Download className="h-3.5 w-3.5" />
										Download available
									</span>
								</>
							)}
						</div>
					</motion.div>
				</header>

				{/* Cover Image - Optional, smaller than before */}
				{automation.coverImage && (
					<motion.div
						animate={{ opacity: 1, scale: 1 }}
						className="mx-auto mb-12 max-w-5xl px-4 sm:px-6 lg:px-8"
						initial={{ opacity: 0, scale: 0.98 }}
						transition={{ duration: 0.6, delay: 0.15 }}
					>
						<div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-gray-100">
							<Image
								alt={automation.title}
								className="object-cover"
								fill
								priority
								sizes="(max-width: 1024px) 100vw, 1024px"
								src={automation.coverImage}
							/>
						</div>
					</motion.div>
				)}

				{/* Content Area */}
				<article className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
					<div className="relative lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
						{/* Sidebar */}
						<aside className="mb-8 lg:mb-0">
							<div className="sticky top-28 space-y-8">
								{/* Download Card - Only show if file exists */}
								{showDownloadButton && (
									<motion.div
										animate={{ opacity: 1, y: 0 }}
										className="rounded-xl border border-gray-200 p-5"
										initial={{ opacity: 0, y: 10 }}
										transition={{ duration: 0.4, delay: 0.3 }}
									>
										<h3 className="mb-2 font-semibold text-sm">Download</h3>
										<p className="mb-4 text-gray-500 text-sm">
											Get the workflow file and import it into your automation
											platform.
										</p>
										<a
											className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 font-medium text-sm text-white transition-colors hover:bg-gray-800"
											download
											href={automation.fileUrl ?? undefined}
											rel="noopener noreferrer"
											target="_blank"
										>
											<Download className="h-4 w-4" />
											Download File
										</a>
									</motion.div>
								)}

								{/* Info Card */}
								<motion.div
									animate={{ opacity: 1, y: 0 }}
									className="rounded-xl border border-gray-200 p-5"
									initial={{ opacity: 0, y: 10 }}
									transition={{ duration: 0.4, delay: 0.4 }}
								>
									<h3 className="mb-3 font-semibold text-sm">Details</h3>
									<div className="space-y-3 text-sm">
										{automation.publishedAt && (
											<div className="flex items-center gap-2 text-gray-500">
												<Calendar className="h-4 w-4" />
												<span>
													Published{" "}
													{new Intl.DateTimeFormat("en-US", {
														month: "short",
														day: "numeric",
														year: "numeric",
													}).format(new Date(automation.publishedAt))}
												</span>
											</div>
										)}
										{automation.tags.length > 0 && (
											<div className="pt-2">
												<span className="text-gray-400">Tags:</span>
												<div className="mt-1 flex flex-wrap gap-1">
													{automation.tags.map((tag) => (
														<Link
															className="text-gray-600 hover:text-black hover:underline"
															href={`/automations?tag=${tag.slug}`}
															key={tag.id}
														>
															{tag.name}
														</Link>
													))}
												</div>
											</div>
										)}
									</div>
								</motion.div>
							</div>
						</aside>

						{/* Article content */}
						<motion.div
							animate={{ opacity: 1, y: 0 }}
							initial={{ opacity: 0, y: 20 }}
							transition={{ duration: 0.5, delay: 0.3 }}
						>
							<AutomationContent content={automation.content} />

							{/* Updated line */}
							{automation.updatedAt &&
								automation.publishedAt &&
								new Date(automation.updatedAt) >
									new Date(automation.publishedAt) && (
									<div className="mt-12 border-gray-100 border-t pt-6 text-gray-400 text-sm">
										Last updated{" "}
										{new Intl.DateTimeFormat("en-US", {
											month: "long",
											day: "numeric",
											year: "numeric",
										}).format(new Date(automation.updatedAt))}
									</div>
								)}
						</motion.div>
					</div>
				</article>

				{/* CTA Section */}
				<section className="border-gray-100 border-y bg-gray-50 py-20">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8">
						<Reveal direction="up">
							<div className="mx-auto max-w-2xl text-center">
								<span className="mb-4 inline-block font-medium text-gray-500 text-sm uppercase tracking-widest">
									Ready to automate?
								</span>
								<h2 className="mb-6 font-bold text-3xl tracking-tight md:text-4xl">
									Let&apos;s Build Your Automation Solution
								</h2>
								<p className="mb-8 text-gray-600 text-lg leading-relaxed">
									Looking for custom automation solutions? We specialize in
									building tailored workflows that transform your business
									processes.
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

				{/* Related Automations */}
				{relatedAutomations.length > 0 && (
					<section className="py-20">
						<div className="container mx-auto px-4 sm:px-6 lg:px-8">
							<Reveal direction="up">
								<h2 className="mb-12 font-bold text-2xl tracking-tight md:text-3xl">
									Related Automations
								</h2>
							</Reveal>
							<StaggerContainer className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
								{relatedAutomations.map((relatedAutomation) => (
									<StaggerItem key={relatedAutomation.id}>
										<AutomationCard
											coverImage={relatedAutomation.coverImage}
											excerpt={relatedAutomation.excerpt}
											publishedAt={relatedAutomation.publishedAt}
											slug={relatedAutomation.slug}
											tags={relatedAutomation.tags}
											title={relatedAutomation.title}
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
