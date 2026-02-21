import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "daComps | Dakik Studio",
	description:
		"Curated UI building blocks with clear usage guidance, built for the Dakik Studio ecosystem. Fast, accessible, and highly customizable.",
	openGraph: {
		title: "daComps | UI Component Library by Dakik Studio",
		description:
			"Curated UI building blocks with clear usage guidance, built for the Dakik Studio ecosystem. Fast, accessible, and highly customizable.",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "daComps - UI Component Library",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "daComps | UI Component Library by Dakik Studio",
		description:
			"Curated UI building blocks with clear usage guidance, built for the Dakik Studio ecosystem.",
		images: ["/og-image.png"],
	},
};

export default function DaCompsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
