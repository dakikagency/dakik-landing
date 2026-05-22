import {
	LegalPage,
	type LegalSection,
} from "../components/legal/legal-page";

const sections: readonly LegalSection[] = [
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
		body: "Dakik Studio relies on third-party providers such as Google, Stripe, Cloudflare, analytics services, hosting providers, and email infrastructure. Their availability and terms may affect how certain features operate.",
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
		body: "Questions about these terms can be sent to hello@dakik.co.uk.",
	},
];

const summary = [
	"By using the site or working with Dakik Studio, you agree to these terms.",
	"Project-specific contracts override these site terms for that engagement.",
	"You must use the service lawfully and protect your account credentials.",
	"Service is provided as-is with limits on liability where law allows.",
];

export function TermsOfServicePage() {
	return (
		<LegalPage
			title="Terms of Service"
			intro="These terms explain the rules for using the Dakik Studio website, client portal, and project-related services."
			summary={summary}
			sections={sections}
			metaDescription="Terms of Service for Dakik Studio covering site use, accounts, project workflows, contracts, invoices, and customer portal access."
			lastUpdated="March 7, 2026"
		/>
	);
}

export default TermsOfServicePage;
