import type { Metadata } from "next";

import AutomationListContent from "@/components/automations/automation-list-content";

export const metadata: Metadata = {
	title: "Automations",
	description:
		"Discover powerful automation workflows that streamline your business processes and boost productivity.",
	openGraph: {
		title: "Automations | Dakik Studio",
		description:
			"Discover powerful automation workflows that streamline your business processes and boost productivity.",
		type: "website",
	},
	keywords: [
		"business automation",
		"workflow automation",
		"email automation",
		"CRM automation",
		"data synchronization",
		"productivity tools",
		"no-code automation",
	],
	twitter: {
		card: "summary_large_image",
		title: "Automations | Dakik Studio",
		description:
			"Discover powerful automation workflows that streamline your business processes and boost productivity.",
	},
};

export default function AutomationsPage() {
	return <AutomationListContent />;
}
