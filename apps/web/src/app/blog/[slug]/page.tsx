import { db } from "@collab/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_AUTHOR } from "@/lib/blog";

import BlogPostContent from "./blog-post-content";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://dakik.co.uk";

async function getPost(slug: string) {
	return db
		.selectFrom("blog_post")
		.selectAll()
		.where("slug", "=", slug)
		.where("published", "=", true)
		.executeTakeFirst();
}

async function getPostTags(postId: string) {
	return db
		.selectFrom("_BlogPostToTag")
		.innerJoin("tag", "tag.id", "_BlogPostToTag.B")
		.select(["tag.name"])
		.where("_BlogPostToTag.A", "=", postId)
		.execute();
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const post = await getPost(slug);
	if (!post) {
		return {};
	}

	const tags = await getPostTags(post.id);
	const keywordStrings = tags.map((t) => t.name);

	return {
		title: post.title,
		description: post.excerpt ?? undefined,
		openGraph: {
			title: post.title,
			description: post.excerpt ?? undefined,
			type: "article",
			publishedTime: post.publishedAt?.toISOString(),
			authors: [BLOG_AUTHOR.name],
			images: post.coverImage ? [{ url: post.coverImage }] : undefined,
		},
		twitter: {
			card: "summary_large_image",
			title: post.title,
			description: post.excerpt ?? undefined,
			images: post.coverImage ? [post.coverImage] : undefined,
		},
		keywords: keywordStrings,
	};
}

export default async function BlogPostPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = await getPost(slug);
	if (!post) {
		notFound();
	}

	const tags = await getPostTags(post.id);
	const keywordStrings = tags.map((t) => t.name).join(", ");

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		description: post.excerpt,
		image: post.coverImage,
		datePublished: post.publishedAt?.toISOString(),
		dateModified: post.updatedAt?.toISOString(),
		author: { "@type": "Person", name: BLOG_AUTHOR.name },
		publisher: { "@type": "Organization", name: "Dakik Studio" },
		url: `${BASE_URL}/blog/${slug}`,
		keywords: keywordStrings,
	};

	return (
		<>
			<script
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data for SEO
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				type="application/ld+json"
			/>
			<BlogPostContent slug={slug} />
		</>
	);
}
