import {
	FAQ,
	Footer,
	Hero,
	Marquee,
	Navbar,
	ServicesSection,
} from "../components/landing";

export function LandingPage() {
	return (
		<div className="min-h-screen bg-black text-white">
			<Navbar />
			<main>
				<Hero />
				<Marquee />
				<ServicesSection />
				<FAQ />
			</main>
			<Footer />
		</div>
	);
}
