"use client";

import {
	FAQ,
	Footer,
	Hero,
	Navbar,
	ServicesSection,
	Testimonials,
} from "@/components/landing";

export default function Home() {
	return (
		<>
			<Navbar />
			<main className="relative">
				<div className="relative z-20">
					<Hero />
					<ServicesSection />
					<Testimonials />
					<FAQ />
				</div>
			</main>
			<Footer />
		</>
	);
}
