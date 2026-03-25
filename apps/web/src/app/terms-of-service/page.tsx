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
		title: "Agreement to these terms",
		body: "These Terms of Service govern your access to and use of the Dakik Studio website, client portal, project workflows, and related services. By using the site or engaging Dakik Studio, you agree to these terms.",
	},
	{
		title: "What Dakik Studio provides",
		body: "Dakik Studio provides digital product services and operational tools, which may include project enquiries, discovery calls, portal access, contracts, invoices, content, media delivery, automation workflows, and customer collaboration features.",
	},
	{
		title: "Accounts and access",
		body: "You are responsible for maintaining accurate account details, protecting your login credentials, and using the service lawfully. We may suspend or restrict access where needed to protect the platform, clients, or legal compliance obligations.",
		items: [
			"Portal access is personal to the authorised customer or team members invited to the workspace.",
			"Google sign-in and other access methods must not be used to impersonate another person or organisation.",
			"You must notify Dakik Studio promptly if you suspect unauthorised access to your account.",
		],
	},
	{
		title: "Project, contract, and payment terms",
		body: "Commercial terms for specific projects may also be set out in proposals, signed contracts, statements of work, or invoices. If there is a conflict between those documents and these site terms, the project-specific agreement controls for that engagement.",
		items: [
			"Fees, milestones, delivery scope, and payment schedules are defined in the applicable proposal or contract.",
			"Late or failed payments may pause delivery, access, or related support until the account is brought back into good standing.",
			"Third-party charges, taxes, and processor fees may apply where stated in the relevant agreement or invoice.",
		],
	},
	{
		title: "Acceptable use",
		body: "You agree not to misuse the website or services, interfere with infrastructure, attempt unauthorised access, upload unlawful or harmful material, or use the platform in a way that could harm Dakik Studio or other users.",
	},
	{
		title: "Intellectual property",
		body: "Unless otherwise agreed in writing, Dakik Studio retains ownership of its pre-existing materials, internal methods, reusable systems, and platform features. Ownership of project deliverables, content, and licensed materials is governed by the specific client agreement covering that work.",
	},
	{
		title: "Third-party services",
		body: "Dakik Studio relies on third-party providers such as Google, Stripe, Cloudinary, analytics services, hosting providers, and email infrastructure. Their availability and terms may affect how certain features operate.",
	},
	{
		title: "Disclaimers and liability",
		body: 'The website and platform are provided on an "as is" and "as available" basis, except where specific service commitments are stated in a signed agreement. To the maximum extent permitted by law, Dakik Studio is not liable for indirect, incidental, special, consequential, or punitive damages arising from use of the website or platform.',
	},
	{
		title: "Termination",
		body: "We may suspend or terminate access to the website or portal where necessary for security, non-payment, breach of contract, unlawful conduct, or misuse of the service. You may stop using the service at any time, subject to any contractual obligations already agreed.",
	},
	{
		title: "Contact",
		body: `Questions about these terms can be sent to ${contactEmail}.`,
	},
] satisfies readonly Section[];

export const metadata: Metadata = {
	title: "Terms of Service",
	description:
		"Terms of Service for Dakik Studio covering site use, accounts, project workflows, contracts, invoices, and customer portal access.",
};

export default function TermsOfServicePage() {
	return (
		<main className="bg-white text-black">
			<div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
				<div className="max-w-3xl">
					<p className="font-mono text-[11px] text-black/45 uppercase tracking-[0.35em]">
						Dakik Studio
					</p>
					<h1 className="mt-4 font-black font-display text-4xl uppercase leading-none tracking-[-0.04em] sm:text-6xl">
						Terms of Service
					</h1>
					<p className="mt-6 max-w-2xl text-base text-black/70 leading-7 sm:text-lg">
						These terms explain the rules for using the Dakik Studio website,
						client portal, and project-related services.
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
							<li>Using the site or portal means you agree to these terms.</li>
							<li>
								Project-specific contracts override general site terms where
								they conflict.
							</li>
							<li>
								Misuse, non-payment, or security issues can lead to access
								restrictions.
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
