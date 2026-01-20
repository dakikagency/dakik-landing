import prisma from "@collab/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { validateApiKey } from "@/lib/api-auth";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

// Schema for creating a blog post
const createBlogPostSchema = z.object({
	title: z.string().min(1, "Title is required"),
	slug: z.string().min(1, "Slug is required"),
	content: z.string().min(1, "Content is required"),
	excerpt: z.string().optional(),
	coverImage: z.string().url().optional().nullable(),
	tags: z.array(z.string()).optional().default([]),
	published: z.boolean().optional().default(false),
});

/**
 * GET /api/integrations/blog
 * List published blog posts with pagination
 */
export async function GET(request: Request) {
	const authResult = validateApiKey(request);
	if (!authResult.valid) {
		return authResult.response;
	}

	try {
		const { searchParams } = new URL(request.url);
		const page = Math.max(1, Number(searchParams.get("page")) || 1);
		const limit = Math.min(
			MAX_PAGE_SIZE,
			Math.max(1, Number(searchParams.get("limit")) || DEFAULT_PAGE_SIZE)
		);
		const skip = (page - 1) * limit;
		const includeUnpublished =
			searchParams.get("includeUnpublished") === "true";

		const where = includeUnpublished ? {} : { published: true };

		const [posts, total] = await Promise.all([
			prisma.blogPost.findMany({
				where,
				skip,
				take: limit,
				orderBy: { publishedAt: "desc" },
				include: {
					tags: {
						select: {
							id: true,
							name: true,
							slug: true,
						},
					},
				},
			}),
			prisma.blogPost.count({ where }),
		]);

		return NextResponse.json({
			data: posts,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
				hasMore: skip + posts.length < total,
			},
		});
	} catch (error) {
		console.error("Error fetching blog posts:", error);
		return NextResponse.json(
			{ error: "Failed to fetch blog posts" },
			{ status: 500 }
		);
	}
}

/**
 * POST /api/integrations/blog
 * Create a new blog post
 */
export async function POST(request: Request) {
	const authResult = validateApiKey(request);
	if (!authResult.valid) {
		return authResult.response;
	}

	try {
		const body = await request.json();
		const validationResult = createBlogPostSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: "Validation failed",
					details: validationResult.error.flatten().fieldErrors,
				},
				{ status: 400 }
			);
		}

		const { tags, ...postData } = validationResult.data;

		// Check if slug already exists
		const existingPost = await prisma.blogPost.findUnique({
			where: { slug: postData.slug },
		});

		if (existingPost) {
			return NextResponse.json(
				{ error: "A blog post with this slug already exists" },
				{ status: 409 }
			);
		}

		// Create the post with tags
		const post = await prisma.blogPost.create({
			data: {
				...postData,
				publishedAt: postData.published ? new Date() : null,
				tags: {
					connectOrCreate: tags.map((tag) => ({
						where: { slug: tag.toLowerCase().replaceAll(" ", "-") },
						create: {
							name: tag,
							slug: tag.toLowerCase().replaceAll(" ", "-"),
						},
					})),
				},
			},
			include: {
				tags: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
			},
		});

		return NextResponse.json({ data: post }, { status: 201 });
	} catch (error) {
		console.error("Error creating blog post:", error);
		return NextResponse.json(
			{ error: "Failed to create blog post" },
			{ status: 500 }
		);
	}
}
