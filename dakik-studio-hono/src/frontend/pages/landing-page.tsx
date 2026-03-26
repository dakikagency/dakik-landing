import {
	FAQ,
	Footer,
	Hero,
	LogoCarousel,
	Marquee,
	Navbar,
	ServicesSection,
	Testimonials,
	Work,
} from "../components/landing";

export function LandingPage() {
	return (
		<div className="min-h-screen bg-black text-white">
			<Navbar />
			<main>
				<Hero />
				<Marquee />
				<LogoCarousel />
				<ServicesSection />
				<Work />
				<Testimonials />
				<FAQ />
			</main>
			<Footer />
		</div>
	);
}
