import prisma from "@collab/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../index";
import { logActivity } from "../services/audit";

// Admin-only procedure that checks for ADMIN role
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
	if (ctx.session.user.role !== "ADMIN") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Admin access required",
		});
	}
	return next({ ctx });
});

const listInputSchema = z.object({
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(50).default(12),
	tag: z.string().optional(),
});

const getBySlugInputSchema = z.object({
	slug: z.string().min(1),
});

export const blogRouter = router({
	list: publicProcedure.input(listInputSchema).query(async ({ input }) => {
		const { page, limit, tag } = input;
		const skip = (page - 1) * limit;

		const where = {
			published: true,
			publishedAt: { not: null },
			...(tag && {
				tags: {
					some: {
						slug: tag,
					},
				},
			}),
		};

		const [posts, total] = await Promise.all([
			prisma.blogPost.findMany({
				where,
				orderBy: { publishedAt: "desc" },
				skip,
				take: limit,
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

		return {
			posts,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
				hasNext: page * limit < total,
				hasPrev: page > 1,
			},
		};
	}),

	getBySlug: publicProcedure
		.input(getBySlugInputSchema)
		.query(async ({ input }) => {
			const post = await prisma.blogPost.findFirst({
				where: {
					slug: input.slug,
					published: true,
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

			return post;
		}),

	getTags: publicProcedure.query(async () => {
		const tags = await prisma.tag.findMany({
			orderBy: { name: "asc" },
			include: {
				_count: {
					select: { posts: true },
				},
			},
		});

		return tags.filter((tag) => tag._count.posts > 0);
	}),

	getRelatedPosts: publicProcedure
		.input(
			z.object({
				slug: z.string(),
				limit: z.number().min(1).max(6).default(3),
			})
		)
		.query(async ({ input }) => {
			const currentPost = await prisma.blogPost.findFirst({
				where: { slug: input.slug, published: true },
				include: { tags: true },
			});

			if (!currentPost) {
				return [];
			}

			const tagIds = currentPost.tags.map((tag) => tag.id);

			const relatedPosts = await prisma.blogPost.findMany({
				where: {
					published: true,
					id: { not: currentPost.id },
					tags: {
						some: {
							id: { in: tagIds },
						},
					},
				},
				orderBy: { publishedAt: "desc" },
				take: input.limit,
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

			return relatedPosts;
		}),

	// Admin endpoints
	adminList: adminProcedure
		.input(
			z.object({
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(50).default(20),
				search: z.string().optional(),
				status: z.enum(["all", "published", "draft"]).default("all"),
			})
		)
		.query(async ({ input }) => {
			const { page, limit, search, status } = input;
			const skip = (page - 1) * limit;

			const where = {
				...(status === "published" && { published: true }),
				...(status === "draft" && { published: false }),
				...(search && {
					OR: [
						{ title: { contains: search, mode: "insensitive" as const } },
						{ content: { contains: search, mode: "insensitive" as const } },
					],
				}),
			};

			const [posts, total] = await Promise.all([
				prisma.blogPost.findMany({
					where,
					orderBy: { createdAt: "desc" },
					skip,
					take: limit,
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

			return {
				posts,
				pagination: {
					page,
					limit,
					total,
					totalPages: Math.ceil(total / limit),
					hasNext: page * limit < total,
					hasPrev: page > 1,
				},
			};
		}),

	getById: adminProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const post = await prisma.blogPost.findUnique({
				where: { id: input.id },
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
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Blog post not found",
				});
			}

			return post;
		}),

	getAllTags: adminProcedure.query(async () => {
		const tags = await prisma.tag.findMany({
			orderBy: { name: "asc" },
			include: {
				_count: {
					select: { posts: true },
				},
			},
		});

		return tags;
	}),

	create: adminProcedure
		.input(
			z.object({
				title: z.string().min(1, "Title is required"),
				slug: z.string().min(1, "Slug is required"),
				excerpt: z
					.string()
					.nullish()
					.transform((val) => (val?.trim() ? val.trim() : null)),
				content: z.string().min(1, "Content is required"),
				coverImage: z
					.string()
					.nullish()
					.transform((val) => (val?.trim() ? val.trim() : null)),
				published: z.boolean().default(false),
				tagIds: z.array(z.string()).default([]),
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const { tagIds, ...data } = input;

				// Check if slug is unique
				const existingPost = await prisma.blogPost.findUnique({
					where: { slug: data.slug },
				});

				if (existingPost) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "A post with this slug already exists",
					});
				}

				// Create the blog post
				const post = await prisma.blogPost.create({
					data: {
						...data,
						publishedAt: data.published ? new Date() : null,
						...(tagIds.length > 0 && {
							tags: {
								connect: tagIds.map((id) => ({ id })),
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

				// Log activity (non-blocking, errors are caught internally)
				await logActivity({
					action: "CREATE_BLOG_POST",
					entity: "BlogPost",
					entityId: post.id,
					details: { title: post.title, slug: post.slug },
					userId: ctx.session.user.id,
					ipAddress: ctx.ip,
					userAgent: ctx.userAgent,
				});

				return post;
			} catch (error) {
				console.error("Error creating blog post:", error);

				// If it's already a TRPCError, rethrow it
				if (error instanceof TRPCError) {
					throw error;
				}

				// Otherwise, wrap it with details
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						error instanceof Error
							? `Failed to create blog post: ${error.message}`
							: "Failed to create blog post",
					cause: error,
				});
			}
		}),

	update: adminProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().min(1, "Title is required").optional(),
				slug: z.string().min(1, "Slug is required").optional(),
				excerpt: z
					.string()
					.nullish()
					.transform((val) => (val?.trim() ? val.trim() : null))
					.optional(),
				content: z.string().min(1, "Content is required").optional(),
				coverImage: z
					.string()
					.nullish()
					.transform((val) => (val?.trim() ? val.trim() : null))
					.optional(),
				published: z.boolean().optional(),
				tagIds: z.array(z.string()).optional(),
			})
		)
		.mutation(async ({ input }) => {
			const { id, tagIds, ...data } = input;

			// Find the existing post
			const existingPost = await prisma.blogPost.findUnique({
				where: { id },
			});

			if (!existingPost) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Blog post not found",
				});
			}

			// Check if slug is unique (if changing)
			if (data.slug && data.slug !== existingPost.slug) {
				const postWithSlug = await prisma.blogPost.findUnique({
					where: { slug: data.slug },
				});

				if (postWithSlug) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "A post with this slug already exists",
					});
				}
			}

			// Handle publishedAt logic
			let publishedAt = existingPost.publishedAt;
			if (data.published !== undefined) {
				if (data.published && !existingPost.published) {
					// Publishing for the first time
					publishedAt = new Date();
				} else if (!data.published) {
					// Unpublishing
					publishedAt = null;
				}
			}

			const post = await prisma.blogPost.update({
				where: { id },
				data: {
					...data,
					publishedAt,
					...(tagIds && {
						tags: {
							set: tagIds.map((tagId) => ({ id: tagId })),
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

			return post;
		}),

	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const existingPost = await prisma.blogPost.findUnique({
				where: { id: input.id },
			});

			if (!existingPost) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Blog post not found",
				});
			}

			await prisma.blogPost.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),

	createTag: adminProcedure
		.input(
			z.object({
				name: z.string().min(1, "Name is required"),
				slug: z.string().min(1, "Slug is required"),
			})
		)
		.mutation(async ({ input }) => {
			// Check if slug is unique
			const existingTag = await prisma.tag.findUnique({
				where: { slug: input.slug },
			});

			if (existingTag) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "A tag with this slug already exists",
				});
			}

			const tag = await prisma.tag.create({
				data: input,
			});

			return tag;
		}),
});
