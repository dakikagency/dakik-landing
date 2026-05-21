import { useHead } from "@unhead/react";
import { Mail } from "lucide-react";
import { Footer } from "../components/landing/footer";
import { Navbar } from "../components/landing/navbar";

export function ContactPage() {
	useHead({
		title: "Contact · Dakik Studio",
		meta: [
			{
				name: "description",
				content:
					"Get in touch with Dakik Studio about a project, partnership, or audit.",
			},
		],
	});

	return (
		<div className="flex min-h-screen flex-col bg-white">
			<Navbar />
			<main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-32 text-center">
				<h1 className="mb-5 font-bold text-4xl tracking-tight sm:text-5xl">Let's talk.</h1>
				<p className="mb-10 max-w-xl text-gray-500 text-lg leading-relaxed">
					The fastest way to start is the survey — it gives us context before our first call. Or
					email us directly.
				</p>
				<div className="flex flex-col gap-3 sm:flex-row">
					<a
						className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 font-medium text-sm text-white transition hover:bg-gray-800"
						href="/survey"
					>
						Start the survey
					</a>
					<a
						className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-6 font-medium text-sm text-gray-700 transition hover:bg-gray-50"
						href="mailto:hello@dakik.co.uk"
					>
						<Mail className="h-4 w-4" /> hello@dakik.co.uk
					</a>
				</div>
			</main>
			<Footer />
		</div>
	);
}

export default ContactPage;
