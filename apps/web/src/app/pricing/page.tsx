import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
	title: "Pricing | Transparent Weekly Rates",
	description:
		"Simple, predictable pricing. No hidden fees, no equity demands. Just rigorous engineering.",
};

export default function PricingPage() {
	return (
		<div className="flex min-h-screen flex-col">
			<section className="container mx-auto px-4 py-24 md:py-32">
				<div className="mx-auto max-w-3xl text-center">
					<h1 className="mb-6 font-bold text-4xl tracking-tight sm:text-6xl">
						Transparent <span className="text-primary">Pricing</span>
					</h1>
					<p className="mb-8 text-muted-foreground text-xl">
						No hourly billing surprises. No long-term lock-ins. We charge a flat
						weekly rate for predictable velocity.
					</p>
				</div>
			</section>

			{/* Packages */}
			<section className="container mx-auto px-4 pb-24">
				<div className="grid gap-8 md:grid-cols-3">
					{/* Audit */}
					<Card className="flex flex-col">
						<CardHeader>
							<CardTitle className="text-2xl">Tech Audit</CardTitle>
							<CardDescription>
								The entry point. Know exactly where you stand.
							</CardDescription>
							<div className="mt-4 font-bold text-4xl">
								£995
								<span className="font-normal text-base text-muted-foreground">
									{" "}
									/ one-off
								</span>
							</div>
						</CardHeader>
						<CardContent className="flex-1">
							<ul className="space-y-3">
								<li className="flex items-start gap-2">
									<Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
									<span className="text-sm">Full architecture review</span>
								</li>
								<li className="flex items-start gap-2">
									<Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
									<span className="text-sm">Security & Performance Report</span>
								</li>
								<li className="flex items-start gap-2">
									<Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
									<span className="text-sm">Refactoring Roadmap</span>
								</li>
								<li className="flex items-start gap-2">
									<Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
									<span className="font-semibold text-foreground text-sm">
										Credited if you hire us
									</span>
								</li>
							</ul>
						</CardContent>
						<CardFooter>
							<Button
								className="w-full"
								render={<Link href="/contact" />}
								variant="outline"
							>
								Book Audit
							</Button>
						</CardFooter>
					</Card>

					{/* Sprint - Highlighted */}
					<Card className="relative flex flex-col overflow-hidden border-primary shadow-lg">
						<div className="absolute top-0 right-0 rounded-bl bg-primary px-3 py-1 font-bold text-primary-foreground text-xs">
							MOST POPULAR
						</div>
						<CardHeader>
							<CardTitle className="text-2xl">Weekly Sprint</CardTitle>
							<CardDescription>
								High-velocity development. Creating real value.
							</CardDescription>
							<div className="mt-4 font-bold text-4xl">
								£2,500
								<span className="font-normal text-base text-muted-foreground">
									{" "}
									/ week
								</span>
							</div>
						</CardHeader>
						<CardContent className="flex-1">
							<ul className="space-y-3">
								<li className="flex items-start gap-2">
									<Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
									<span className="text-sm">Dedicated Senior Engineer</span>
								</li>
								<li className="flex items-start gap-2">
									<Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
									<span className="text-sm">Daily updates & communication</span>
								</li>
								<li className="flex items-start gap-2">
									<Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
									<span className="text-sm">Code delivered to your repo</span>
								</li>
								<li className="flex items-start gap-2">
									<Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
									<span className="text-sm">Pause or cancel anytime</span>
								</li>
							</ul>
						</CardContent>
						<CardFooter>
							<Button
								className="w-full"
								render={<Link href="/contact?package=sprint" />}
							>
								Start Sprint
							</Button>
						</CardFooter>
					</Card>

					{/* Scale */}
					<Card className="flex flex-col">
						<CardHeader>
							<CardTitle className="text-2xl">Scale & Maintain</CardTitle>
							<CardDescription>
								Long-term partnership for growing products.
							</CardDescription>
							<div className="mt-4 font-bold text-4xl">Custom</div>
						</CardHeader>
						<CardContent className="flex-1">
							<ul className="space-y-3">
								<li className="flex items-start gap-2">
									<Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
									<span className="text-sm">Guaranteed SLA response times</span>
								</li>
								<li className="flex items-start gap-2">
									<Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
									<span className="text-sm">Monthly feature allowance</span>
								</li>
								<li className="flex items-start gap-2">
									<Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
									<span className="text-sm">Infrastructure management</span>
								</li>
								<li className="flex items-start gap-2">
									<Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
									<span className="text-sm">Priority Support</span>
								</li>
							</ul>
						</CardContent>
						<CardFooter>
							<Button
								className="w-full"
								render={<Link href="/contact" />}
								variant="outline"
							>
								Contact Sales
							</Button>
						</CardFooter>
					</Card>
				</div>
			</section>

			{/* FAQ */}
			<section className="bg-muted/50 py-24">
				<div className="container mx-auto max-w-3xl px-4">
					<div className="mb-12 text-center">
						<h2 className="mb-4 font-bold text-3xl">Common Questions</h2>
						<p className="text-muted-foreground">
							Everything you need to know about how we work.
						</p>
					</div>

					<div className="w-full space-y-4">
						<div className="rounded-lg border px-4 py-3">
							<details className="group">
								<summary className="flex cursor-pointer list-none items-center justify-between font-medium">
									Who owns the code?
								</summary>
								<div className="mt-4 border-t pt-4 text-muted-foreground">
									You do. 100%. We work directly in your GitHub/GitLab
									repositories. Once a sprint is paid for, the IP is yours. We
									don't hold your code hostage.
								</div>
							</details>
						</div>

						<div className="rounded-lg border px-4 py-3">
							<details className="group">
								<summary className="flex cursor-pointer list-none items-center justify-between font-medium">
									How do we communicate?
								</summary>
								<div className="mt-4 border-t pt-4 text-muted-foreground">
									We integrate into your Slack or Teams channel for daily async
									updates. We also have a scheduled weekly sync to review
									progress and plan the next sprint. No unnecessary meetings.
								</div>
							</details>
						</div>

						<div className="rounded-lg border px-4 py-3">
							<details className="group">
								<summary className="flex cursor-pointer list-none items-center justify-between font-medium">
									What if I'm not happy with the work?
								</summary>
								<div className="mt-4 border-t pt-4 text-muted-foreground">
									If you're not satisfied with a sprint, you don't pay for the
									next one. We value long-term relationships over short-term
									gains. We also offer a full refund on the first week if we're
									not a good fit.
								</div>
							</details>
						</div>

						<div className="rounded-lg border px-4 py-3">
							<details className="group">
								<summary className="flex cursor-pointer list-none items-center justify-between font-medium">
									Why weekly sprints instead of fixed project quotes?
								</summary>
								<div className="mt-4 border-t pt-4 text-muted-foreground">
									Software estimation is notoriously inaccurate. Fixed bids
									often lead to cut corners or bloated buffers. Weekly sprints
									align incentives: we focus on delivering the highest value
									features as fast as possible, and you have the flexibility to
									change direction based on real feedback.
								</div>
							</details>
						</div>

						<div className="rounded-lg border px-4 py-3">
							<details className="group">
								<summary className="flex cursor-pointer list-none items-center justify-between font-medium">
									Do you take equity?
								</summary>
								<div className="mt-4 border-t pt-4 text-muted-foreground">
									Generally, no. We are a cash-for-services business. This keeps
									our relationship simple and professional. However, for select
									startups with exceptional potential, we may consider a small
									equity component in exchange for discounted rates, but this is
									rare.
								</div>
							</details>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
