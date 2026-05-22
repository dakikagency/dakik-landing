import {
	LegalPage,
	type LegalSection,
} from "../components/legal/legal-page";

const sections: readonly LegalSection[] = [
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
		body: "If you have questions about cookie usage on Dakik Studio, contact hello@dakik.co.uk.",
	},
];

const summary = [
	"Essential cookies help the site and portal function securely.",
	"Analytics cookies help us understand usage and improve the experience.",
	"You can manage cookie behaviour through your browser settings.",
	"Questions can be sent to the Dakik Studio contact address.",
];

export function CookiesPage() {
	return (
		<LegalPage
			title="Cookie Settings"
			intro="This page explains how Dakik Studio uses cookies and similar technologies, and how you can manage them in your browser."
			summary={summary}
			sections={sections}
			metaDescription="Cookie information for Dakik Studio covering essential cookies, analytics, third-party services, and browser-based cookie controls."
			lastUpdated="March 7, 2026"
		/>
	);
}

export default CookiesPage;
