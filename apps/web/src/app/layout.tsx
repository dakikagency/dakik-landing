import type { Metadata } from "next";

import {
	JetBrains_Mono,
	Sofia_Sans_Extra_Condensed,
	Space_Grotesk,
} from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";

const display = Sofia_Sans_Extra_Condensed({
	variable: "--font-display-base",
	subsets: ["latin"],
	weight: ["900"],
});

const sans = Space_Grotesk({
	variable: "--font-sans-base",
	subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-mono-base",
	subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://dakik.studio";

export const metadata: Metadata = {
	metadataBase: new URL(BASE_URL),
	title: {
		template: "%s | Dakik Studio",
		default: "Dakik Studio | Boutique Digital Agency",
	},
	description:
		"We transform bold visions into polished digital products through AI automation, brand identity, and custom web/mobile development.",
	keywords: [
		"digital agency",
		"web development",
		"mobile development",
		"AI automation",
		"brand identity",
		"custom software",
		"boutique agency",
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
			<body
				className={`${sans.variable} ${display.variable} ${jetbrainsMono.variable} antialiased`}
			>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
