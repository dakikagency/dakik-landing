import {
	FAQ,
	Footer,
	Hero,
	Navbar,
	ServicesSection,
} from "../components/landing";

export function LandingPage() {
	return (
		<div className="min-h-screen bg-black text-white">
			<Navbar />
			<main>
				<Hero />
				<ServicesSection />
				<FAQ />
			</main>
			<Footer />
		</div>
	);
}
