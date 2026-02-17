import { CheckCircle2, Code2, Rocket, Search, Users } from "lucide-react";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
	title: "About Dakik Agency | The Bloody Work of Growth",
	description:
		"We don't just build software. We solve the messy, complex business problems that others ignore.",
};

export default function AboutPage() {
	return (
		<div className="flex min-h-screen flex-col">
			{/* Hero Section / Manifesto */}
			<section className="container mx-auto px-4 py-24 md:py-32">
				<div className="mx-auto max-w-3xl text-center">
					<h1 className="mb-6 font-bold text-4xl tracking-tight sm:text-6xl">
						We Do The <span className="text-primary">Bloody Work</span>
					</h1>
					<p className="mb-8 text-muted-foreground text-xl leading-relaxed">
						Growth isn't just about flashy features. It's about unearthing the
						messy, boring, complex bottlenecks in your business and fixing them
						for good. We don't just write code; we engineer outcomes.
					</p>
				</div>
			</section>

			{/* How We Work */}
			<section className="bg-muted/50 py-24">
				<div className="container mx-auto px-4">
					<div className="mb-16 text-center">
						<h2 className="mb-4 font-bold text-3xl">How We Work</h2>
						<p className="text-lg text-muted-foreground">
							Predictable delivery, week after week.
						</p>
					</div>
					<div className="grid gap-8 md:grid-cols-3">
						<Card>
							<CardHeader>
								<Search className="mb-2 h-10 w-10 text-primary" />
								<CardTitle>1. Audit & Strategy</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									We stop guessing. We analyze your tech stack, user flows, and
									business goals to identify the highest-leverage opportunities.
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<Rocket className="mb-2 h-10 w-10 text-primary" />
								<CardTitle>2. Weekly Sprints</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									No black boxes. We deliver tangible value every single week,
									with clear deliverables and constant communication.
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<Users className="mb-2 h-10 w-10 text-primary" />
								<CardTitle>3. Scale & Support</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									We build for the long haul. Our systems are designed to scale
									with your business, ensuring you never outgrow your tech.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Tech Stack as Outcomes */}
			<section className="container mx-auto px-4 py-24">
				<div className="grid gap-16 md:grid-cols-2">
					<div>
						<h2 className="mb-6 font-bold text-3xl">
							Technology That Means Business
						</h2>
						<p className="mb-8 text-lg text-muted-foreground">
							We choose our stack not because it's trendy, but because it
							delivers speed, stability, and scalability.
						</p>
						<div className="space-y-4">
							<div className="flex items-start gap-4">
								<CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-green-500" />
								<div>
									<h3 className="font-semibold">Next.js & Turborepo</h3>
									<p className="text-muted-foreground text-sm">
										Global performance and monorepo efficiency for rapid
										iteration.
									</p>
								</div>
							</div>
							<div className="flex items-start gap-4">
								<CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-green-500" />
								<div>
									<h3 className="font-semibold">Type-Safe Backend</h3>
									<p className="text-muted-foreground text-sm">
										End-to-end type safety means fewer bugs and faster feature
										shipping.
									</p>
								</div>
							</div>
							<div className="flex items-start gap-4">
								<CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-green-500" />
								<div>
									<h3 className="font-semibold">Automated Infrastructure</h3>
									<p className="text-muted-foreground text-sm">
										Deployment pipelines that just work, so we focus on product,
										not plumbing.
									</p>
								</div>
							</div>
						</div>
					</div>
					<div className="flex items-center justify-center rounded-2xl bg-muted p-8">
						<Code2 className="h-48 w-48 text-muted-foreground/20" />
						{/* Placeholder for visual or tech cloud */}
					</div>
				</div>
			</section>

			{/* Team */}
			<section className="bg-muted/50 py-24">
				<div className="container mx-auto px-4 text-center">
					<h2 className="mb-12 font-bold text-3xl">Who We Are</h2>
					<div className="mx-auto max-w-sm rounded-lg bg-background p-6 shadow-sm">
						<div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full bg-gray-200">
							{/* Placeholder for Avatar */}
						</div>
						<h3 className="font-bold text-xl">Erdeniz Korkmaz</h3>
						<p className="mb-4 text-primary">Founder & Lead Engineer</p>
						<p className="text-muted-foreground text-sm">
							London-based engineer obsessed with high-performance web
							applications and scalable agency systems.
						</p>
					</div>
				</div>
			</section>
		</div>
	);
}
