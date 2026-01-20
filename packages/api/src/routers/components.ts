import prisma from "@collab/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../index";

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

const COMPONENT_CATEGORIES = [
	"Buttons",
	"Forms",
	"Cards",
	"Navigation",
	"Layout",
	"Data Display",
	"Feedback",
	"Overlays",
] as const;

const listInputSchema = z.object({
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(50).default(20),
	category: z.string().optional(),
	search: z.string().optional(),
	status: z.enum(["all", "published", "draft"]).default("all"),
});

const createInputSchema = z.object({
	name: z.string().min(1, "Name is required"),
	slug: z.string().min(1, "Slug is required"),
	category: z.enum(COMPONENT_CATEGORIES),
	description: z.string().optional(),
	props: z.any().default({}),
	code: z.string().min(1, "Code is required"),
	preview: z.string().optional(),
	published: z.boolean().default(true),
});

const updateInputSchema = z.object({
	id: z.string(),
	name: z.string().min(1, "Name is required").optional(),
	slug: z.string().min(1, "Slug is required").optional(),
	category: z.enum(COMPONENT_CATEGORIES).optional(),
	description: z.string().nullable().optional(),
	props: z.any().optional(),
	code: z.string().min(1, "Code is required").optional(),
	preview: z.string().nullable().optional(),
	published: z.boolean().optional(),
});

const fileInputSchema = z.object({
	componentId: z.string(),
	filename: z.string().min(1, "Filename is required"),
	fileType: z
		.enum([
			"TYPESCRIPT",
			"TYPESCRIPT_RX",
			"CSS",
			"SCSS",
			"JSON",
			"MARKDOWN",
			"OTHER",
		])
		.default("TYPESCRIPT"),
	content: z.string().min(1, "Content is required"),
	isMainFile: z.boolean().default(false),
	order: z.number().default(0),
});

const fileUpdateInputSchema = z.object({
	id: z.string(),
	filename: z.string().min(1).optional(),
	fileType: z
		.enum([
			"TYPESCRIPT",
			"TYPESCRIPT_RX",
			"CSS",
			"SCSS",
			"JSON",
			"MARKDOWN",
			"OTHER",
		])
		.optional(),
	content: z.string().min(1).optional(),
	isMainFile: z.boolean().optional(),
	order: z.number().optional(),
});

export const componentsRouter = router({
	// Public endpoints
	list: publicProcedure.input(listInputSchema).query(async ({ input }) => {
		const { page, limit, category, search } = input;
		const skip = (page - 1) * limit;

		const where = {
			published: true,
			...(category && { category }),
			...(search && {
				OR: [
					{ name: { contains: search, mode: "insensitive" as const } },
					{ description: { contains: search, mode: "insensitive" as const } },
				],
			}),
		};

		const [components, total] = await Promise.all([
			prisma.componentDoc.findMany({
				where,
				orderBy: [{ category: "asc" }, { name: "asc" }],
				skip,
				take: limit,
			}),
			prisma.componentDoc.count({ where }),
		]);

		return {
			components,
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
		.input(z.object({ slug: z.string().min(1) }))
		.query(async ({ input }) => {
			const component = await prisma.componentDoc.findFirst({
				where: {
					slug: input.slug,
					published: true,
				},
			});

			return component;
		}),

	getCategories: publicProcedure.query(() => {
		return COMPONENT_CATEGORIES;
	}),

	// Admin endpoints
	adminList: adminProcedure.input(listInputSchema).query(async ({ input }) => {
		const { page, limit, category, search, status } = input;
		const skip = (page - 1) * limit;

		const where = {
			...(status === "published" && { published: true }),
			...(status === "draft" && { published: false }),
			...(category && { category }),
			...(search && {
				OR: [
					{ name: { contains: search, mode: "insensitive" as const } },
					{ description: { contains: search, mode: "insensitive" as const } },
				],
			}),
		};

		const [components, total] = await Promise.all([
			prisma.componentDoc.findMany({
				where,
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			prisma.componentDoc.count({ where }),
		]);

		return {
			components,
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
			const component = await prisma.componentDoc.findUnique({
				where: { id: input.id },
			});

			if (!component) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Component not found",
				});
			}

			return component;
		}),

	create: adminProcedure
		.input(createInputSchema)
		.mutation(async ({ input }) => {
			// Check if slug is unique
			const existingComponent = await prisma.componentDoc.findUnique({
				where: { slug: input.slug },
			});

			if (existingComponent) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "A component with this slug already exists",
				});
			}

			const component = await prisma.componentDoc.create({
				data: {
					name: input.name,
					slug: input.slug,
					category: input.category,
					description: input.description ?? null,
					props: input.props,
					code: input.code,
					preview: input.preview ?? null,
					published: input.published,
				},
			});

			return component;
		}),

	update: adminProcedure
		.input(updateInputSchema)
		.mutation(async ({ input }) => {
			const { id, ...data } = input;

			// Find the existing component
			const existingComponent = await prisma.componentDoc.findUnique({
				where: { id },
			});

			if (!existingComponent) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Component not found",
				});
			}

			// Check if slug is unique (if changing)
			if (data.slug && data.slug !== existingComponent.slug) {
				const componentWithSlug = await prisma.componentDoc.findUnique({
					where: { slug: data.slug },
				});

				if (componentWithSlug) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "A component with this slug already exists",
					});
				}
			}

			const component = await prisma.componentDoc.update({
				where: { id },
				data,
			});

			return component;
		}),

	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const existingComponent = await prisma.componentDoc.findUnique({
				where: { id: input.id },
			});

			if (!existingComponent) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Component not found",
				});
			}

			await prisma.componentDoc.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),

	// ==================== Component Files (Multi-file support) ====================

	// Get all files for a component
	getFiles: adminProcedure
		.input(z.object({ componentId: z.string() }))
		.query(async ({ input }) => {
			const files = await prisma.componentFile.findMany({
				where: { componentId: input.componentId },
				orderBy: { order: "asc" },
			});
			return files;
		}),

	// Get a single file
	getFile: adminProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const file = await prisma.componentFile.findUnique({
				where: { id: input.id },
			});

			if (!file) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "File not found",
				});
			}

			return file;
		}),

	// Create a new file for a component
	createFile: adminProcedure
		.input(fileInputSchema)
		.mutation(async ({ input }) => {
			// Verify component exists
			const component = await prisma.componentDoc.findUnique({
				where: { id: input.componentId },
			});

			if (!component) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Component not found",
				});
			}

			// Check if filename is unique for this component
			const existingFile = await prisma.componentFile.findUnique({
				where: {
					componentId_filename: {
						componentId: input.componentId,
						filename: input.filename,
					},
				},
			});

			if (existingFile) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "A file with this name already exists for this component",
				});
			}

			const file = await prisma.componentFile.create({
				data: input,
			});

			return file;
		}),

	// Update a file
	updateFile: adminProcedure
		.input(fileUpdateInputSchema)
		.mutation(async ({ input }) => {
			const { id, ...data } = input;

			// Verify file exists
			const existingFile = await prisma.componentFile.findUnique({
				where: { id },
			});

			if (!existingFile) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "File not found",
				});
			}

			// If filename is being changed, check for conflicts
			if (data.filename && data.filename !== existingFile.filename) {
				const conflictFile = await prisma.componentFile.findUnique({
					where: {
						componentId_filename: {
							componentId: existingFile.componentId,
							filename: data.filename,
						},
					},
				});

				if (conflictFile) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "A file with this name already exists for this component",
					});
				}
			}

			const file = await prisma.componentFile.update({
				where: { id },
				data,
			});

			return file;
		}),

	// Delete a file
	deleteFile: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const existingFile = await prisma.componentFile.findUnique({
				where: { id: input.id },
			});

			if (!existingFile) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "File not found",
				});
			}

			await prisma.componentFile.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),

	// Reorder files
	reorderFiles: adminProcedure
		.input(
			z.object({
				files: z.array(
					z.object({
						id: z.string(),
						order: z.number(),
					})
				),
			})
		)
		.mutation(async ({ input }) => {
			const updates = input.files.map((file) =>
				prisma.componentFile.update({
					where: { id: file.id },
					data: { order: file.order },
				})
			);

			await prisma.$transaction(updates);

			return { success: true };
		}),
});
