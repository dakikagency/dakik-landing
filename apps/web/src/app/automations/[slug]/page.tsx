"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, Download, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";

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

	// Show loading state
	if (automationQuery.isLoading) {
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
					{automation.coverImage ? (
						<Image
							alt={automation.title}
							className="object-cover"
							fill
							priority
							sizes="100vw"
							src={automation.coverImage}
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
									href="/automations"
								>
									<ArrowLeft className="h-4 w-4" />
									Back to Automations
								</Link>

								{/* Tags */}
								{automation.tags.length > 0 && (
									<div className="mb-4 flex flex-wrap gap-2">
										{automation.tags.map((tag) => (
											<Link
												className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600 text-xs transition-colors hover:bg-gray-200"
												href={`/automations?tag=${tag.slug}`}
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
									{automation.title}
								</h1>

								{/* Meta */}
								<div className="flex flex-wrap items-center gap-4">
									{formattedDate && automation.publishedAt && (
										<div className="flex items-center gap-2 text-gray-500 text-sm">
											<Calendar className="h-4 w-4" />
											<time
												dateTime={new Date(
													automation.publishedAt
												).toISOString()}
											>
												{formattedDate}
											</time>
										</div>
									)}

									{/* Download Button */}
									{automation.fileUrl && (
										<a
											className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-gray-800"
											download
											href={automation.fileUrl}
											rel="noopener noreferrer"
											target="_blank"
										>
											<Download className="h-4 w-4" />
											Download File
										</a>
									)}
								</div>
							</motion.div>

							{/* Content */}
							<motion.div
								animate={{ opacity: 1, y: 0 }}
								initial={{ opacity: 0, y: 20 }}
								transition={{ duration: 0.5, delay: 0.4 }}
							>
								<AutomationContent content={automation.content} />
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
									Ready to automate?
								</span>
								<h2 className="mb-6 font-bold text-3xl tracking-tight md:text-4xl">
									Let's Build Your Automation Solution
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
