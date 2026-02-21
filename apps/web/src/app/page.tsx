"use client";

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
