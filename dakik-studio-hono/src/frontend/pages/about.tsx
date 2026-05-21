import { useHead } from "@unhead/react";
import { CheckCircle2, Code2, Rocket, Search, Users } from "lucide-react";
import { Footer } from "../components/landing/footer";
import { Navbar } from "../components/landing/navbar";

const ABOUT_TITLE = "About Dakik Agency | The Bloody Work of Growth";
const ABOUT_DESC =
	"We don't just build software. We solve the messy, complex business problems that others ignore.";

function Card({ icon: Icon, title, children }: { icon: typeof Search; title: string; children: React.ReactNode }) {
	return (
		<div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
			<Icon className="mb-3 h-9 w-9 text-black" />
			<h3 className="mb-2 font-semibold text-lg tracking-tight">{title}</h3>
			<p className="text-gray-500 text-sm leading-relaxed">{children}</p>
		</div>
	);
}

export function AboutPage() {
	useHead({
		title: ABOUT_TITLE,
		meta: [
			{ name: "description", content: ABOUT_DESC },
			{ property: "og:title", content: ABOUT_TITLE },
			{ property: "og:description", content: ABOUT_DESC },
			{ property: "og:type", content: "website" },
		],
	});

	return (
		<div className="flex min-h-screen flex-col bg-white">
			<Navbar />
			<main className="flex-1">
				<section className="mx-auto max-w-7xl px-6 pt-32 pb-20 lg:px-10">
					<div className="mx-auto max-w-3xl text-center">
						<h1 className="mb-6 font-bold text-4xl tracking-tight sm:text-6xl">
							We Do The <span className="text-blue-600">Bloody Work</span>
						</h1>
						<p className="mb-8 text-gray-500 text-xl leading-relaxed">
							Growth isn't just about flashy features. It's about unearthing the messy, boring,
							complex bottlenecks in your business and fixing them for good. We don't just write
							code; we engineer outcomes.
						</p>
					</div>
				</section>

				<section className="bg-gray-50 py-24">
					<div className="mx-auto max-w-7xl px-6 lg:px-10">
						<div className="mb-12 text-center">
							<h2 className="mb-3 font-bold text-3xl tracking-tight">How We Work</h2>
							<p className="text-gray-500 text-lg">Predictable delivery, week after week.</p>
						</div>
						<div className="grid gap-6 md:grid-cols-3">
							<Card icon={Search} title="1. Audit & Strategy">
								We stop guessing. We analyze your tech stack, user flows, and business goals to
								identify the highest-leverage opportunities.
							</Card>
							<Card icon={Rocket} title="2. Weekly Sprints">
								No black boxes. We deliver tangible value every single week, with clear
								deliverables and constant communication.
							</Card>
							<Card icon={Users} title="3. Scale & Support">
								We build for the long haul. Our systems are designed to scale with your business,
								ensuring you never outgrow your tech.
							</Card>
						</div>
					</div>
				</section>

				<section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
					<div className="grid gap-16 md:grid-cols-2">
						<div>
							<h2 className="mb-5 font-bold text-3xl tracking-tight">Technology That Means Business</h2>
							<p className="mb-8 text-gray-500 text-lg">
								We choose our stack not because it's trendy, but because it delivers speed,
								stability, and scalability.
							</p>
							<div className="space-y-4">
								{[
									{
										title: "Next.js & Turborepo",
										desc: "Global performance and monorepo efficiency for rapid iteration.",
									},
									{
										title: "Type-Safe Backend",
										desc: "End-to-end type safety means fewer bugs and faster feature shipping.",
									},
									{
										title: "Automated Infrastructure",
										desc: "Deployment pipelines that just work, so we focus on product, not plumbing.",
									},
								].map((item) => (
									<div className="flex items-start gap-4" key={item.title}>
										<CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-green-500" />
										<div>
											<h3 className="font-semibold">{item.title}</h3>
											<p className="text-gray-500 text-sm">{item.desc}</p>
										</div>
									</div>
								))}
							</div>
						</div>
						<div className="flex items-center justify-center rounded-2xl bg-gray-100 p-8">
							<Code2 className="h-48 w-48 text-gray-300" />
						</div>
					</div>
				</section>

				<section className="bg-gray-50 py-24">
					<div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
						<h2 className="mb-12 font-bold text-3xl tracking-tight">Who We Are</h2>
						<div className="mx-auto max-w-sm rounded-2xl bg-white p-6 shadow-sm">
							<div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gray-200" />
							<h3 className="font-bold text-xl">Erdeniz Korkmaz</h3>
							<p className="mb-3 text-blue-600">Founder & Lead Engineer</p>
							<p className="text-gray-500 text-sm">
								London-based engineer obsessed with high-performance web applications and
								scalable agency systems.
							</p>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}

export default AboutPage;
