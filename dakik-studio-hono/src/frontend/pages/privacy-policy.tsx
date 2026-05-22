import {
	LegalPage,
	type LegalSection,
} from "../components/legal/legal-page";

const sections: readonly LegalSection[] = [
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
			"Cloudflare R2 for media storage and delivery.",
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
		body: "For privacy questions, access requests, or data-related concerns, contact us at hello@dakik.co.uk.",
	},
];

const summary = [
	"We collect only what we need to deliver Dakik Studio services.",
	"Google sign-in and Calendar data are used only for the features you request.",
	"You can ask us to access, correct, or delete the data we hold about you.",
	"Third-party services have their own terms; we use trusted providers.",
];

export function PrivacyPolicyPage() {
	return (
		<LegalPage
			title="Privacy Policy"
			intro="This Privacy Policy explains what personal information Dakik Studio collects, how we use it, and the rights you have."
			summary={summary}
			sections={sections}
			metaDescription="Privacy Policy for Dakik Studio covering data collection, Google OAuth, third-party services, retention, security, and user rights."
			lastUpdated="March 7, 2026"
		/>
	);
}

export default PrivacyPolicyPage;
