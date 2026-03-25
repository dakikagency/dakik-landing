import type { Metadata } from "next";
import Link from "next/link";

const contactEmail = "hello@dakik.co.uk";
const lastUpdated = "March 7, 2026";

interface Section {
	title: string;
	body: string;
	items?: readonly string[];
}

const sections = [
	{
		title: "How Dakik Studio uses cookies",
		body: "Dakik Studio uses cookies and similar technologies to keep the website working, maintain secure sessions, understand traffic patterns, and improve the performance of our website and client-facing tools.",
	},
	{
		title: "Essential cookies",
		body: "Some cookies are required for core site and portal functions. These may be used to keep you signed in, protect forms and sessions, remember basic preferences, and support secure access to customer or admin areas.",
	},
	{
		title: "Analytics and measurement",
		body: "We may use analytics and tag-management tools to understand visits, page performance, and site interactions. This helps Dakik Studio improve content, user journeys, and service quality.",
		items: [
			"Analytics cookies may record page views, device/browser information, and aggregated behaviour patterns.",
			"Tag-management scripts may load measurement tools used for product and marketing analysis.",
			"We use this information to improve the website and related workflows, not to sell personal data.",
		],
	},
	{
		title: "Third-party services",
		body: "Some cookies or similar identifiers may be set or read by trusted third-party services that support features such as authentication, analytics, media delivery, meeting workflows, and payments. Their handling of data is also governed by their own policies and terms.",
	},
	{
		title: "Managing cookies",
		body: "You can manage or delete cookies through your browser settings. If you block essential cookies, parts of the Dakik Studio website, login experience, or portal may stop working correctly.",
	},
	{
		title: "Contact",
		body: `If you have questions about cookie usage on Dakik Studio, contact ${contactEmail}.`,
	},
] satisfies readonly Section[];

export const metadata: Metadata = {
	title: "Cookie Settings",
	description:
		"Cookie information for Dakik Studio covering essential cookies, analytics, third-party services, and browser-based cookie controls.",
};

export default function CookiesPage() {
	return (
		<main className="bg-white text-black">
			<div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
				<div className="max-w-3xl">
					<p className="font-mono text-[11px] text-black/45 uppercase tracking-[0.35em]">
						Dakik Studio
					</p>
					<h1 className="mt-4 font-black font-display text-4xl uppercase leading-none tracking-[-0.04em] sm:text-6xl">
						Cookie Settings
					</h1>
					<p className="mt-6 max-w-2xl text-base text-black/70 leading-7 sm:text-lg">
						This page explains how Dakik Studio uses cookies and similar
						technologies, and how you can manage them in your browser.
					</p>
					<div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-black/55 text-sm">
						<span>Last updated: {lastUpdated}</span>
						<a
							className="underline decoration-black/20 underline-offset-4 transition-colors hover:text-black"
							href={`mailto:${contactEmail}`}
						>
							{contactEmail}
						</a>
						<Link
							className="underline decoration-black/20 underline-offset-4 transition-colors hover:text-black"
							href="/"
						>
							Return home
						</Link>
					</div>
				</div>

				<div className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
					<aside className="h-fit border-black/10 border-t pt-4 lg:sticky lg:top-10">
						<p className="font-mono text-[11px] text-black/45 uppercase tracking-[0.3em]">
							Quick summary
						</p>
						<ul className="mt-4 space-y-3 text-black/65 text-sm leading-6">
							<li>
								Essential cookies help the site and portal function securely.
							</li>
							<li>
								Analytics cookies help us understand usage and improve the
								experience.
							</li>
							<li>
								You can manage cookie behaviour through your browser settings.
							</li>
							<li>
								Questions can be sent to the Dakik Studio contact address.
							</li>
						</ul>
					</aside>

					<div className="space-y-10">
						{sections.map((section) => (
							<section
								className="border-black/10 border-t pt-5"
								key={section.title}
							>
								<h2 className="font-semibold text-2xl tracking-tight">
									{section.title}
								</h2>
								<p className="mt-3 text-black/72 leading-7">{section.body}</p>
								{section.items ? (
									<ul className="mt-4 space-y-2 text-black/72 leading-7">
										{section.items.map((item) => (
											<li className="flex gap-3" key={item}>
												<span
													aria-hidden="true"
													className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-black"
												/>
												<span>{item}</span>
											</li>
										))}
									</ul>
								) : null}
							</section>
						))}
					</div>
				</div>
			</div>
		</main>
	);
}
