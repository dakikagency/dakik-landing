import type { Metadata } from "next";

import BlogListContent from "./blog-list-content";

export const metadata: Metadata = {
	title: "Blog",
	description:
		"Thoughts, insights, and perspectives on design, development, and the digital landscape.",
	openGraph: {
		title: "Blog | Dakik Studio",
		description:
			"Thoughts, insights, and perspectives on design, development, and the digital landscape.",
		type: "website",
	},
	keywords: [
		"software engineering blog",
		"AI agency insights",
		"startup tech stacks",
		"Next.js tutorials",
		"fullstack development",
		"React design patterns",
		"digital product growth",
	],
	twitter: {
		card: "summary_large_image",
		title: "Blog | Dakik Studio",
		description:
			"Thoughts, insights, and perspectives on design, development, and the digital landscape.",
	},
};

export default function BlogPage() {
	return <BlogListContent />;
}
