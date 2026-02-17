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
	},
};

export default function BlogPage() {
	return <BlogListContent />;
}
