import { db } from "@collab/db";
import type { Metadata } from "next";

import BlogListContent, { type BlogListPost } from "./blog-list-content";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://dakik.co.uk";
const BLOG_PATH = "/blog";
const BLOG_URL = `${BASE_URL}${BLOG_PATH}`;
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Blog",
	description:
		"Thoughts, insights, and perspectives on design, development, and the digital landscape.",
	alternates: {
		canonical: BLOG_PATH,
	},
	openGraph: {
		title: "Blog | Dakik Studio",
		description:
			"Thoughts, insights, and perspectives on design, development, and the digital landscape.",
		type: "website",
		url: BLOG_URL,
		images: [
			{
				url: DEFAULT_OG_IMAGE,
				width: 1200,
				height: 630,
				alt: "Dakik Studio blog",
			},
		],
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
		images: [DEFAULT_OG_IMAGE],
		creator: "@dakikstudio",
	},
};

async function fetchTagsByPostIds(
	postIds: string[]
): Promise<Map<string, BlogListPost["tags"]>> {
	if (postIds.length === 0) {
		return new Map();
	}

	const rows = await db
		.selectFrom("_BlogPostToTag as bt")
		.innerJoin("tag as t", "bt.B", "t.id")
		.select([
			"bt.A as postId",
			"t.id as id",
			"t.name as name",
			"t.slug as slug",
		])
		.where("bt.A", "in", postIds)
		.orderBy("t.name", "asc")
		.execute();

	const tagsByPostId = new Map<string, BlogListPost["tags"]>();
	for (const row of rows) {
		const existingTags = tagsByPostId.get(row.postId) ?? [];
		existingTags.push({ id: row.id, name: row.name, slug: row.slug });
		tagsByPostId.set(row.postId, existingTags);
	}

	return tagsByPostId;
}

async function getBlogPosts(limit: number): Promise<BlogListPost[]> {
	const posts = await db
		.selectFrom("blog_post")
		.select([
			"id",
			"slug",
			"title",
			"excerpt",
			"content",
			"coverImage",
			"publishedAt",
		])
		.where("published", "=", true)
		.where("publishedAt", "is not", null)
		.orderBy("publishedAt", "desc")
		.limit(limit)
		.execute();

	const tagsByPostId = await fetchTagsByPostIds(posts.map((post) => post.id));

	return posts.map((post) => ({
		id: post.id,
		slug: post.slug,
		title: post.title,
		excerpt: post.excerpt,
		content: post.content,
		coverImage: post.coverImage,
		publishedAt: post.publishedAt?.toISOString() ?? null,
		tags: tagsByPostId.get(post.id) ?? [],
	}));
}

export default async function BlogPage() {
	const posts = await getBlogPosts(15);
	return <BlogListContent initialPosts={posts} />;
}
