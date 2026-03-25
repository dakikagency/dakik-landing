"use client";

import type { Route } from "next";
import Link from "next/link";
import {
	FAQ,
	Footer,
	Hero,
	Navbar,
	ServicesSection,
	Testimonials,
} from "@/components/landing";
import { Marquee } from "@/components/landing/marquee";

export default function Home() {
	return (
		<>
			<Navbar />
			<main className="relative">
				<section className="border-foreground/10 border-b bg-background px-[clamp(1rem,5vw,4rem)] pt-28 pb-8 text-foreground">
					<div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
						<div className="max-w-3xl">
							<p className="font-mono text-[11px] text-foreground/55 uppercase tracking-[0.28em]">
								Dakik Studio
							</p>
							<h1 className="mt-3 font-display text-4xl uppercase tracking-[-0.04em] sm:text-5xl">
								Dakik Studio client portal and digital product studio
							</h1>
							<p className="mt-4 max-w-2xl text-base text-foreground/72 leading-relaxed sm:text-lg">
								Dakik Studio helps clients plan and launch websites, apps, brand
								systems, and AI automations. Customers can use the app to sign
								in, start projects, book discovery calls, review scope, sign
								contracts, and manage invoices in one place.
							</p>
						</div>
						<div className="flex flex-wrap gap-3 text-sm">
							<Link
								className="border border-foreground/20 px-4 py-2 transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
								href={"/privacy-policy" as Route}
							>
								Privacy Policy
							</Link>
							<Link
								className="border border-foreground/20 px-4 py-2 transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
								href={"/terms-of-service" as Route}
							>
								Terms of Service
							</Link>
						</div>
					</div>
				</section>
				<Hero />
				<Marquee />
				<ServicesSection />
				<Testimonials />
				<FAQ />
			</main>
			<Footer />
		</>
	);
}
