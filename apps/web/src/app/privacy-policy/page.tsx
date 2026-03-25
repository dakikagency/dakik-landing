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
		title: "Who this policy applies to",
		body: "This Privacy Policy explains how Dakik Studio collects, uses, and protects personal information when you visit our website, submit an enquiry, sign in with Google, book meetings, sign contracts, upload files, or use our client portal and related services.",
	},
	{
		title: "Information we collect",
		body: "We may collect contact details, company information, project requirements, billing details, account identifiers, communications, uploaded files, meeting preferences, and basic technical data such as browser, device, IP address, and analytics events.",
		items: [
			"Information you provide directly through forms, emails, contracts, invoices, or portal activity.",
			"Authentication data needed to create and maintain your account, including data returned by Google OAuth when you choose Google sign-in.",
			"Scheduling and communication data when you book meetings or respond to project updates.",
		],
	},
	{
		title: "How we use your information",
		body: "We use personal information to run Dakik Studio, deliver services, manage customer relationships, authenticate users, schedule meetings, process payments, support projects, improve the website, and comply with legal obligations.",
		items: [
			"To respond to enquiries and start new projects.",
			"To provide access to the customer portal and admin workflows.",
			"To prepare proposals, contracts, invoices, and project updates.",
			"To monitor site performance, security, and product quality.",
		],
	},
	{
		title: "Google user data and OAuth",
		body: "If you sign in with Google, Dakik Studio uses the information returned by Google only to authenticate your account, identify you inside the application, and support features you request. If meeting-booking or calendar features are enabled for your account, Google Calendar data is used only to create, manage, or coordinate scheduled meetings. We do not sell Google user data and we do not use it for advertising.",
		items: [
			"Google profile data is used for account creation, sign-in, and session management.",
			"Google Calendar access, where granted, is used only for meeting scheduling and related operational workflows.",
			"You can revoke Dakik Studio access from your Google account settings at any time.",
		],
	},
	{
		title: "Third-party services we rely on",
		body: "We work with trusted service providers to operate Dakik Studio. These providers process data only as needed to supply infrastructure or requested features.",
		items: [
			"Google for authentication and calendar-related workflows.",
			"Neon/PostgreSQL for application data storage.",
			"Stripe for payment processing and invoicing.",
			"Cloudinary for media storage and delivery.",
			"Analytics and tag-management providers for website measurement.",
			"Email providers and SMTP infrastructure for transactional communication.",
		],
	},
	{
		title: "Cookies and analytics",
		body: "Dakik Studio may use cookies and similar technologies to keep you signed in, remember preferences, understand traffic patterns, and measure site performance. You can control cookies through your browser settings, but some features may stop working properly if essential cookies are disabled.",
	},
	{
		title: "Data retention",
		body: "We keep personal information only for as long as needed to operate the service, maintain business records, resolve disputes, meet legal obligations, and enforce agreements. Retention periods vary depending on the type of data and the services you use.",
	},
	{
		title: "Your rights",
		body: "Depending on your location, you may have rights to request access, correction, deletion, restriction, objection, or portability of your personal information. You may also request information about the data we hold and how it is used.",
	},
	{
		title: "Security",
		body: "We use reasonable technical and organisational safeguards to protect personal information, including authenticated access controls, secure infrastructure, and limited third-party access. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.",
	},
	{
		title: "Contact",
		body: `For privacy questions, access requests, or data-related concerns, contact us at ${contactEmail}.`,
	},
] satisfies readonly Section[];

export const metadata: Metadata = {
	title: "Privacy Policy",
	description:
		"Privacy Policy for Dakik Studio covering website visitors, leads, customers, portal users, and Google OAuth authentication.",
};

export default function PrivacyPolicyPage() {
	return (
		<main className="bg-white text-black">
			<div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
				<div className="max-w-3xl">
					<p className="font-mono text-[11px] text-black/45 uppercase tracking-[0.35em]">
						Dakik Studio
					</p>
					<h1 className="mt-4 font-black font-display text-4xl uppercase leading-none tracking-[-0.04em] sm:text-6xl">
						Privacy Policy
					</h1>
					<p className="mt-6 max-w-2xl text-base text-black/70 leading-7 sm:text-lg">
						This page explains what personal data Dakik Studio collects, how we
						use it, and the choices available to visitors, leads, customers, and
						portal users.
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
								We collect only the data needed to operate the website and
								client experience.
							</li>
							<li>
								Google account data is used for sign-in and operational meeting
								workflows.
							</li>
							<li>We do not sell personal data or Google user data.</li>
							<li>
								You can contact us to request access, correction, or deletion.
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
