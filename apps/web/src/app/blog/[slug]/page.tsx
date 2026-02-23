import { db } from "@collab/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_AUTHOR } from "@/lib/blog";

import BlogPostContent, {
	type BlogPostViewModel,
	type RelatedBlogPostViewModel,
} from "./blog-post-content";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://dakik.co.uk";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

export const dynamic = "force-dynamic";

interface BlogTag {
	id: string;
	name: string;
	slug: string;
}

async function getPost(slug: string) {
	return db
		.selectFrom("blog_post")
		.selectAll()
		.where("slug", "=", slug)
		.where("published", "=", true)
		.where("publishedAt", "is not", null)
		.executeTakeFirst();
}

async function fetchTagsByPostIds(
	postIds: string[]
): Promise<Map<string, BlogTag[]>> {
	if (postIds.length === 0) {
		return new Map();
	}

	const rows = await db
		.selectFrom("_BlogPostToTag as bt")
		.innerJoin("tag as t", "t.id", "bt.B")
		.select([
			"bt.A as postId",
			"t.id as id",
			"t.name as name",
			"t.slug as slug",
		])
		.where("bt.A", "in", postIds)
		.orderBy("t.name", "asc")
		.execute();

	const tagsByPostId = new Map<string, BlogTag[]>();
	for (const row of rows) {
		const existingTags = tagsByPostId.get(row.postId) ?? [];
		existingTags.push({ id: row.id, name: row.name, slug: row.slug });
		tagsByPostId.set(row.postId, existingTags);
	}

	return tagsByPostId;
}

async function getRelatedPosts(postId: string, limit: number) {
	const tagLinks = await db
		.selectFrom("_BlogPostToTag")
		.select(["B"])
		.where("A", "=", postId)
		.execute();

	const tagIds = tagLinks.map((link) => link.B);
	if (tagIds.length === 0) {
		return [];
	}

	const relatedIdsRows = await db
		.selectFrom("_BlogPostToTag")
		.select(["A"])
		.where("B", "in", tagIds)
		.where("A", "<>", postId)
		.distinct()
		.execute();

	const relatedIds = relatedIdsRows.map((row) => row.A);
	if (relatedIds.length === 0) {
		return [];
	}

	return db
		.selectFrom("blog_post")
		.select(["id", "slug", "title", "excerpt", "coverImage", "publishedAt"])
		.where("published", "=", true)
		.where("publishedAt", "is not", null)
		.where("id", "in", relatedIds)
		.orderBy("publishedAt", "desc")
		.limit(limit)
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
		return {
			robots: {
				index: false,
				follow: false,
			},
		};
	}

	const tagsByPostId = await fetchTagsByPostIds([post.id]);
	const tags = tagsByPostId.get(post.id) ?? [];
	const keywords = tags.map((tag) => tag.name);
	const encodedSlug = encodeURIComponent(post.slug);
	const canonicalPath = `/blog/${encodedSlug}`;
	const canonicalUrl = `${BASE_URL}${canonicalPath}`;
	const description =
		post.excerpt ?? `Read ${post.title} on the Dakik Studio blog.`;
	const imageUrl = post.coverImage ?? DEFAULT_OG_IMAGE;

	return {
		title: post.title,
		description,
		alternates: {
			canonical: canonicalPath,
		},
		openGraph: {
			title: post.title,
			description,
			type: "article",
			url: canonicalUrl,
			publishedTime: post.publishedAt?.toISOString(),
			authors: [BLOG_AUTHOR.name],
			images: [{ url: imageUrl, alt: post.title }],
		},
		twitter: {
			card: "summary_large_image",
			title: post.title,
			description,
			images: [imageUrl],
			creator: "@dakikstudio",
		},
		keywords,
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

	const tagsByPostId = await fetchTagsByPostIds([post.id]);
	const tags = tagsByPostId.get(post.id) ?? [];
	const relatedPosts = await getRelatedPosts(post.id, 3);
	const relatedTagsByPostId = await fetchTagsByPostIds(
		relatedPosts.map((item) => item.id)
	);
	const encodedSlug = encodeURIComponent(post.slug);
	const canonicalUrl = `${BASE_URL}/blog/${encodedSlug}`;
	const keywordStrings = tags.map((tag) => tag.name).join(", ");
	const postViewModel: BlogPostViewModel = {
		id: post.id,
		slug: post.slug,
		title: post.title,
		excerpt: post.excerpt,
		content: post.content,
		coverImage: post.coverImage,
		publishedAt: post.publishedAt?.toISOString() ?? null,
		updatedAt: post.updatedAt?.toISOString() ?? null,
		tags,
	};
	const relatedPostsViewModel: RelatedBlogPostViewModel[] = relatedPosts.map(
		(relatedPost) => ({
			id: relatedPost.id,
			slug: relatedPost.slug,
			title: relatedPost.title,
			excerpt: relatedPost.excerpt,
			coverImage: relatedPost.coverImage,
			publishedAt: relatedPost.publishedAt?.toISOString() ?? null,
			tags: relatedTagsByPostId.get(relatedPost.id) ?? [],
		})
	);

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		description: post.excerpt,
		image: post.coverImage ?? DEFAULT_OG_IMAGE,
		datePublished: post.publishedAt?.toISOString(),
		dateModified: post.updatedAt?.toISOString(),
		author: { "@type": "Person", name: BLOG_AUTHOR.name },
		publisher: {
			"@type": "Organization",
			name: "Dakik Studio",
			logo: { "@type": "ImageObject", url: `${BASE_URL}/apple-touch-icon.png` },
		},
		mainEntityOfPage: canonicalUrl,
		url: canonicalUrl,
		keywords: keywordStrings,
	};

	return (
		<>
			<script
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data for SEO
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				type="application/ld+json"
			/>
			<BlogPostContent
				post={postViewModel}
				relatedPosts={relatedPostsViewModel}
			/>
		</>
	);
}
