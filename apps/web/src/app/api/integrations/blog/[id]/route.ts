import prisma from "@collab/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { validateApiKey } from "@/lib/api-auth";

// Schema for updating a blog post
const updateBlogPostSchema = z.object({
	title: z.string().min(1, "Title is required").optional(),
	slug: z.string().min(1, "Slug is required").optional(),
	content: z.string().min(1, "Content is required").optional(),
	excerpt: z.string().optional().nullable(),
	coverImage: z.string().url().optional().nullable(),
	tags: z.array(z.string()).optional(),
	published: z.boolean().optional(),
});

interface RouteContext {
	params: Promise<{ id: string }>;
}

/**
 * GET /api/integrations/blog/[id]
 * Get a single blog post by ID
 */
export async function GET(request: Request, context: RouteContext) {
	const authResult = validateApiKey(request);
	if (!authResult.valid) {
		return authResult.response;
	}

	try {
		const { id } = await context.params;

		const post = await prisma.blogPost.findUnique({
			where: { id },
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

		if (!post) {
			return NextResponse.json(
				{ error: "Blog post not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ data: post });
	} catch (error) {
		console.error("Error fetching blog post:", error);
		return NextResponse.json(
			{ error: "Failed to fetch blog post" },
			{ status: 500 }
		);
	}
}

/**
 * PUT /api/integrations/blog/[id]
 * Update a blog post
 */
export async function PUT(request: Request, context: RouteContext) {
	const authResult = validateApiKey(request);
	if (!authResult.valid) {
		return authResult.response;
	}

	try {
		const { id } = await context.params;
		const body = await request.json();
		const validationResult = updateBlogPostSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: "Validation failed",
					details: validationResult.error.flatten().fieldErrors,
				},
				{ status: 400 }
			);
		}

		// Check if post exists
		const existingPost = await prisma.blogPost.findUnique({
			where: { id },
		});

		if (!existingPost) {
			return NextResponse.json(
				{ error: "Blog post not found" },
				{ status: 404 }
			);
		}

		const { tags, ...postData } = validationResult.data;

		// Check if new slug already exists (if slug is being changed)
		if (postData.slug && postData.slug !== existingPost.slug) {
			const slugExists = await prisma.blogPost.findUnique({
				where: { slug: postData.slug },
			});

			if (slugExists) {
				return NextResponse.json(
					{ error: "A blog post with this slug already exists" },
					{ status: 409 }
				);
			}
		}

		// Handle publishedAt timestamp
		const updateData: Record<string, unknown> = { ...postData };
		if (postData.published === true && !existingPost.publishedAt) {
			updateData.publishedAt = new Date();
		} else if (postData.published === false) {
			updateData.publishedAt = null;
		}

		// Update the post
		const post = await prisma.blogPost.update({
			where: { id },
			data: {
				...updateData,
				...(tags && {
					tags: {
						set: [], // Disconnect all existing tags
						connectOrCreate: tags.map((tag) => ({
							where: { slug: tag.toLowerCase().replaceAll(" ", "-") },
							create: {
								name: tag,
								slug: tag.toLowerCase().replaceAll(" ", "-"),
							},
						})),
					},
				}),
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

		return NextResponse.json({ data: post });
	} catch (error) {
		console.error("Error updating blog post:", error);
		return NextResponse.json(
			{ error: "Failed to update blog post" },
			{ status: 500 }
		);
	}
}

/**
 * DELETE /api/integrations/blog/[id]
 * Delete a blog post
 */
export async function DELETE(request: Request, context: RouteContext) {
	const authResult = validateApiKey(request);
	if (!authResult.valid) {
		return authResult.response;
	}

	try {
		const { id } = await context.params;

		// Check if post exists
		const existingPost = await prisma.blogPost.findUnique({
			where: { id },
		});

		if (!existingPost) {
			return NextResponse.json(
				{ error: "Blog post not found" },
				{ status: 404 }
			);
		}

		await prisma.blogPost.delete({
			where: { id },
		});

		return NextResponse.json(
			{ message: "Blog post deleted successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error deleting blog post:", error);
		return NextResponse.json(
			{ error: "Failed to delete blog post" },
			{ status: 500 }
		);
	}
}
