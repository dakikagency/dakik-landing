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

export const automationRouter = router({
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

		const [automations, total] = await Promise.all([
			prisma.automation.findMany({
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
			prisma.automation.count({ where }),
		]);

		return {
			automations,
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
			const automation = await prisma.automation.findFirst({
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

			return automation;
		}),

	getTags: publicProcedure.query(async () => {
		const tags = await prisma.tag.findMany({
			orderBy: { name: "asc" },
			include: {
				_count: {
					select: { automations: true },
				},
			},
		});

		return tags.filter((tag) => tag._count.automations > 0);
	}),

	getRelatedAutomations: publicProcedure
		.input(
			z.object({
				slug: z.string(),
				limit: z.number().min(1).max(6).default(3),
			})
		)
		.query(async ({ input }) => {
			const currentAutomation = await prisma.automation.findFirst({
				where: { slug: input.slug, published: true },
				include: { tags: true },
			});

			if (!currentAutomation) {
				return [];
			}

			const tagIds = currentAutomation.tags.map((tag) => tag.id);

			const relatedAutomations = await prisma.automation.findMany({
				where: {
					published: true,
					id: { not: currentAutomation.id },
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

			return relatedAutomations;
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

			const [automations, total] = await Promise.all([
				prisma.automation.findMany({
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
				prisma.automation.count({ where }),
			]);

			return {
				automations,
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
			const automation = await prisma.automation.findUnique({
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

			if (!automation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Automation not found",
				});
			}

			return automation;
		}),

	getAllTags: adminProcedure.query(async () => {
		const tags = await prisma.tag.findMany({
			orderBy: { name: "asc" },
			include: {
				_count: {
					select: { posts: true, automations: true },
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
				fileUrl: z
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
				const existingAutomation = await prisma.automation.findUnique({
					where: { slug: data.slug },
				});

				if (existingAutomation) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "An automation with this slug already exists",
					});
				}

				// Create the automation
				const automation = await prisma.automation.create({
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
					action: "CREATE_AUTOMATION",
					entity: "Automation",
					entityId: automation.id,
					details: { title: automation.title, slug: automation.slug },
					userId: ctx.session.user.id,
					ipAddress: ctx.ip,
					userAgent: ctx.userAgent,
				});

				return automation;
			} catch (error) {
				console.error("Error creating automation:", error);

				// If it's already a TRPCError, rethrow it
				if (error instanceof TRPCError) {
					throw error;
				}

				// Otherwise, wrap it with details
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						error instanceof Error
							? `Failed to create automation: ${error.message}`
							: "Failed to create automation",
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
				fileUrl: z
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

			// Find the existing automation
			const existingAutomation = await prisma.automation.findUnique({
				where: { id },
			});

			if (!existingAutomation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Automation not found",
				});
			}

			// Check if slug is unique (if changing)
			if (data.slug && data.slug !== existingAutomation.slug) {
				const automationWithSlug = await prisma.automation.findUnique({
					where: { slug: data.slug },
				});

				if (automationWithSlug) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "An automation with this slug already exists",
					});
				}
			}

			// Handle publishedAt logic
			let publishedAt = existingAutomation.publishedAt;
			if (data.published !== undefined) {
				if (data.published && !existingAutomation.published) {
					// Publishing for the first time
					publishedAt = new Date();
				} else if (!data.published) {
					// Unpublishing
					publishedAt = null;
				}
			}

			const automation = await prisma.automation.update({
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

			return automation;
		}),

	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const existingAutomation = await prisma.automation.findUnique({
				where: { id: input.id },
			});

			if (!existingAutomation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Automation not found",
				});
			}

			await prisma.automation.delete({
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
