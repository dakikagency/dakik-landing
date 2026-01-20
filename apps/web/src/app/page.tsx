"use client";

import {
	FAQ,
	Footer,
	Hero,
	Navbar,
	ServicesSection,
} from "@/components/landing";

export default function Home() {
	return (
		<>
			<Navbar />
			<main className="relative">
				<div className="relative z-20">
					<Hero />
					<ServicesSection />
					<FAQ />
				</div>
				<div className="pointer-events-none absolute top-0 right-[clamp(1rem,5vw,4rem)] bottom-0 left-[clamp(1rem,5vw,4rem)] z-20">
					<div className="absolute top-0 bottom-0 left-0 z-20 w-0.5 bg-linear-to-b from-transparent via-gray-800/20 to-transparent" />
					<div className="absolute top-0 bottom-0 left-1/8 z-20 hidden w-0.5 bg-linear-to-b from-transparent via-gray-800/20 to-transparent lg:flex" />
					<div className="absolute top-0 bottom-0 left-2/8 z-20 w-0.5 bg-linear-to-b from-transparent via-gray-800/20 to-transparent" />
					<div className="absolute top-0 bottom-0 left-3/8 z-20 hidden w-0.5 bg-linear-to-b from-transparent via-gray-800/20 to-transparent lg:flex" />
					<div className="absolute top-0 bottom-0 left-4/8 z-20 w-0.5 bg-linear-to-b from-transparent via-gray-800/20 to-transparent" />
					<div className="absolute top-0 bottom-0 left-5/8 z-20 hidden w-0.5 bg-linear-to-b from-transparent via-gray-800/20 to-transparent lg:flex" />
					<div className="absolute top-0 bottom-0 left-6/8 z-20 w-0.5 bg-linear-to-b from-transparent via-gray-800/20 to-transparent" />
					<div className="absolute top-0 bottom-0 left-7/8 z-20 hidden w-0.5 bg-linear-to-b from-transparent via-gray-800/20 to-transparent lg:flex" />
					<div className="absolute top-0 bottom-0 left-full z-20 w-0.5 bg-linear-to-b from-transparent via-gray-800/20 to-transparent" />
				</div>
			</main>
			<Footer />
		</>
	);
}
