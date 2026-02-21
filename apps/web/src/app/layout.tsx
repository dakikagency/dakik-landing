import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import type { Metadata } from "next";

import "../index.css";
import Providers from "@/components/providers";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://dakik.co.uk";

export const metadata: Metadata = {
	metadataBase: new URL(BASE_URL),
	title: {
		template: "%s | Dakik Studio",
		default: "Dakik Studio | Boutique Digital Agency",
	},
	description:
		"We transform bold visions into polished digital products through AI automation, brand identity, and custom web/mobile development.",
	keywords: [
		"digital agency london",
		"boutique software agency",
		"custom web development",
		"mobile app development",
		"AI automation agency",
		"Next.js development agency",
		"MVP development startup",
		"technical audit services",
		"scale up engineering team",
		"dedicated software teams",
		"Typescript development agency",
		"brand identity design",
	],
	authors: [{ name: "Dakik Studio" }],
	creator: "Dakik Studio",
	publisher: "Dakik Studio",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: BASE_URL,
		siteName: "Dakik Studio",
		title: "Dakik Studio | Boutique Digital Agency",
		description:
			"We transform bold visions into polished digital products through AI automation, brand identity, and custom web/mobile development.",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Dakik Studio - Boutique Digital Agency",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Dakik Studio | Boutique Digital Agency",
		description:
			"We transform bold visions into polished digital products through AI automation, brand identity, and custom web/mobile development.",
		images: ["/og-image.png"],
		creator: "@dakikstudio",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon-16x16.png",
		apple: "/apple-touch-icon.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: injecting json-ld schema
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "ProfessionalService",
							name: "Dakik Studio | London Digital Agency",
							url: BASE_URL,
							logo: `${BASE_URL}/apple-touch-icon.png`,
							description:
								"Boutique digital agency specializing in custom web development, mobile apps, and AI automation.",
							address: {
								"@type": "PostalAddress",
								addressLocality: "London",
								addressCountry: "UK",
							},
						}),
					}}
					type="application/ld+json"
				/>
			</head>
			<body className="antialiased">
				{/** biome-ignore lint/style/noNonNullAssertion: Required for integration */}
				<GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID!} />
				{/** biome-ignore lint/style/noNonNullAssertion: Required for integration */}
				<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />

				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
