import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
	title: "Our Work | Dakik Agency Case Studies",
	description:
		"See how we solve complex business problems with high-performance software.",
	openGraph: {
		title: "Our Work | Dakik Agency Case Studies",
		description:
			"See how we solve complex business problems with high-performance software.",
		type: "website",
	},
	keywords: [
		"fintech migration case study",
		"AI support agent portfolio",
		"custom logistics software",
		"NextJS migration examples",
		"startup scaleup case studies",
		"legacy code rewrite",
		"development portfolio",
	],
	twitter: {
		card: "summary",
		title: "Our Work | Dakik Agency Case Studies",
		description:
			"See how we solve complex business problems with high-performance software.",
	},
};

const caseStudies = [
	{
		id: 1,
		title: "Legacy FinTech Migration",
		category: "Migration",
		summary:
			"Rebuilding a mission-critical financial dashboard from PHP to Next.js.",
		challenge:
			"A slowing legacy code base was preventing feature releases and causing downtime during peak trading hours.",
		solution:
			"We incrementally migrated the frontend to Next.js while keeping the backend stable, eventually replacing the API layer with tRPC.",
		results: [
			"50% faster load times",
			"Zero downtime during switchover",
			"Deployment time reduced from 1 hour to 5 minutes",
		],
		image: "bg-blue-100",
	},
	{
		id: 2,
		title: "AI Support Agent Integration",
		category: "AI Automation",
		summary:
			"Reducing support ticket volume by 40% for a mid-market e-commerce brand.",
		challenge:
			"Customer support team was overwhelmed by repetitive 'where is my order' queries, affecting response times for serious issues.",
		solution:
			"We deployed a context-aware LLM agent integrated with their Shopify API and zendesk, handling Level 1 queries autonomously.",
		results: [
			"40% reduction in human tickets",
			"24/7 instant response time",
			"$50k estimated annual savings",
		],
		image: "bg-purple-100",
	},
	{
		id: 3,
		title: "Global Logistics Portal",
		category: "Internal Tool",
		summary:
			"Real-time tracking and document management for a freight forwarder.",
		challenge:
			"Operations relied on spreadsheets and email chains to track shipments, leading to data errors and lost revenue.",
		solution:
			"We built a centralized portal for clients to book, track, and manage documents, with role-based access for staff.",
		results: [
			"Eliminated 100+ weekly spreadsheets",
			"Client self-service adopted by 80% of users",
			"Reduced manual data entry errors by 90%",
		],
		image: "bg-green-100",
	},
];

export default function WorkPage() {
	return (
		<div className="flex min-h-screen flex-col">
			<section className="container mx-auto px-4 py-24 md:py-32">
				<div className="mx-auto max-w-3xl text-center">
					<h1 className="mb-6 font-bold text-4xl tracking-tight sm:text-6xl">
						Results, Not Just <span className="text-primary">Repos</span>
					</h1>
					<p className="mb-8 text-muted-foreground text-xl">
						We take on the projects where performance, reliability, and
						complexity matter. Here is how we turn problems into products.
					</p>
				</div>
			</section>

			<section className="bg-muted/30 py-24">
				<div className="container mx-auto px-4">
					<div className="grid gap-12">
						{caseStudies.map((study, index) => (
							<div
								className={`flex flex-col gap-12 lg:items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"}`}
								key={study.id}
							>
								<div className="flex-1">
									<div
										className={`aspect-video w-full rounded-2xl ${study.image} flex items-center justify-center`}
									>
										{/* Placeholder for real screenshot */}
										<span className="font-semibold text-muted-foreground/50 text-xl">
											{study.title} Screenshot
										</span>
									</div>
								</div>
								<div className="flex-1 space-y-6">
									<div>
										<Badge className="mb-4">{study.category}</Badge>
										<h2 className="mb-2 font-bold text-3xl">{study.title}</h2>
										<p className="font-medium text-lg text-muted-foreground">
											{study.summary}
										</p>
									</div>

									<div className="grid gap-6 border-y py-6 md:grid-cols-2">
										<div>
											<h3 className="mb-2 font-semibold text-foreground">
												The Challenge
											</h3>
											<p className="text-muted-foreground text-sm">
												{study.challenge}
											</p>
										</div>
										<div>
											<h3 className="mb-2 font-semibold text-foreground">
												The Solution
											</h3>
											<p className="text-muted-foreground text-sm">
												{study.solution}
											</p>
										</div>
									</div>

									<div>
										<h3 className="mb-3 font-semibold">Key Results</h3>
										<ul className="grid gap-2 sm:grid-cols-2">
											{study.results.map((result) => (
												<li
													className="flex items-center gap-2 text-muted-foreground text-sm"
													key={result}
												>
													<div className="h-1.5 w-1.5 rounded-full bg-primary" />
													{result}
												</li>
											))}
										</ul>
									</div>

									<div className="pt-4">
										{/* In a real scenario, this links to the detailed case study page */}
										<Button className="gap-2" variant="outline">
											Read Full Case Study <ArrowRight className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="container mx-auto px-4 py-24 text-center">
				<div className="rounded-2xl bg-primary p-12 text-primary-foreground">
					<h2 className="mb-4 font-bold text-3xl">
						Ready to tackle your challenge?
					</h2>
					<p className="mb-8 text-lg opacity-90">
						Let's discuss how we can bring these same results to your business.
					</p>
					<Button
						render={<Link href="/contact" />}
						size="lg"
						variant="secondary"
					>
						Book an Audit
					</Button>
				</div>
			</section>
		</div>
	);
}
