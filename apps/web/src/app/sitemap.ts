import { db } from "@collab/db";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://dakik.co.uk";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// Static pages with their priorities and change frequencies
	const staticPages: MetadataRoute.Sitemap = [
		{
			url: BASE_URL,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${BASE_URL}/survey`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.9,
		},
		{
			url: `${BASE_URL}/daicons`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${BASE_URL}/dacomps`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${BASE_URL}/blog`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.8,
		},
		{
			url: `${BASE_URL}/about`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${BASE_URL}/work`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${BASE_URL}/pricing`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${BASE_URL}/contact`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${BASE_URL}/privacy`,
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.3,
		},
	];

	// Dynamic blog post pages
	const posts = await db
		.selectFrom("blog_post")
		.select(["slug", "updatedAt", "publishedAt"])
		.where("published", "=", true)
		.where("publishedAt", "is not", null)
		.execute();

	const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
		url: `${BASE_URL}/blog/${post.slug}`,
		lastModified: post.updatedAt ?? post.publishedAt ?? new Date(),
		changeFrequency: "monthly",
		priority: 0.6,
	}));

	return [...staticPages, ...blogPages];
}
