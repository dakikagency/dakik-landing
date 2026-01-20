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

const ICON_CATEGORIES = [
	"General",
	"Interface",
	"Arrows",
	"Social",
	"Commerce",
	"Media",
	"Communication",
	"Files",
	"Weather",
	"Maps",
	"Development",
	"Design",
	"Health",
	"Finance",
	"Education",
	"Other",
] as const;

export const iconsRouter = router({
	// List custom icons only (isCustom: true)
	listCustom: adminProcedure
		.input(
			z.object({
				search: z.string().optional(),
				category: z.string().optional(),
				limit: z.number().min(1).max(100).optional().default(50),
				cursor: z.string().optional(),
			})
		)
		.query(async ({ input }) => {
			const { search, category, limit, cursor } = input;

			const icons = await prisma.icon.findMany({
				where: {
					AND: [
						{ isCustom: true },
						search
							? {
									OR: [
										{ name: { contains: search, mode: "insensitive" } },
										{ slug: { contains: search, mode: "insensitive" } },
										{ keywords: { hasSome: [search.toLowerCase()] } },
									],
								}
							: {},
						category ? { category } : {},
					],
				},
				take: limit,
				skip: cursor ? 1 : 0,
				cursor: cursor ? { id: cursor } : undefined,
				orderBy: { createdAt: "desc" },
			});

			return {
				icons,
				nextCursor: icons.length === limit ? icons.at(-1)?.id : null,
			};
		}),

	// Get single icon by ID
	getById: adminProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const icon = await prisma.icon.findUnique({
				where: { id: input.id },
			});

			if (!icon) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Icon not found",
				});
			}

			return icon;
		}),

	// Create custom icon
	create: adminProcedure
		.input(
			z.object({
				name: z.string().min(1, "Name is required"),
				slug: z.string().min(1, "Slug is required"),
				category: z.string().min(1, "Category is required"),
				svgContent: z.string().min(1, "SVG content is required"),
				keywords: z.array(z.string()).optional().default([]),
			})
		)
		.mutation(async ({ input }) => {
			// Check if slug already exists
			const existing = await prisma.icon.findUnique({
				where: { slug: input.slug },
			});

			if (existing) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "An icon with this slug already exists",
				});
			}

			const icon = await prisma.icon.create({
				data: {
					name: input.name,
					slug: input.slug,
					category: input.category,
					svgContent: input.svgContent,
					keywords: input.keywords,
					isCustom: true,
				},
			});

			return icon;
		}),

	// Update icon
	update: adminProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1).optional(),
				slug: z.string().min(1).optional(),
				category: z.string().min(1).optional(),
				svgContent: z.string().min(1).optional(),
				keywords: z.array(z.string()).optional(),
			})
		)
		.mutation(async ({ input }) => {
			const { id, ...data } = input;

			// Check if icon exists
			const existing = await prisma.icon.findUnique({
				where: { id },
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Icon not found",
				});
			}

			// If slug is being changed, check for conflicts
			if (data.slug && data.slug !== existing.slug) {
				const slugConflict = await prisma.icon.findUnique({
					where: { slug: data.slug },
				});

				if (slugConflict) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "An icon with this slug already exists",
					});
				}
			}

			const icon = await prisma.icon.update({
				where: { id },
				data,
			});

			return icon;
		}),

	// Delete icon
	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const existing = await prisma.icon.findUnique({
				where: { id: input.id },
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Icon not found",
				});
			}

			// Only allow deleting custom icons
			if (!existing.isCustom) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Cannot delete non-custom icons",
				});
			}

			await prisma.icon.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),

	// Bulk import icons
	bulkCreate: adminProcedure
		.input(
			z.object({
				icons: z.array(
					z.object({
						name: z.string().min(1),
						slug: z.string().min(1),
						category: z.string().min(1),
						svgContent: z.string().min(1),
						keywords: z.array(z.string()).optional().default([]),
					})
				),
			})
		)
		.mutation(async ({ input }) => {
			// Check for duplicate slugs in input
			const slugs = input.icons.map((i) => i.slug);
			const uniqueSlugs = new Set(slugs);
			if (slugs.length !== uniqueSlugs.size) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Duplicate slugs found in import data",
				});
			}

			// Check for existing slugs in database
			const existingSlugs = await prisma.icon.findMany({
				where: { slug: { in: slugs } },
				select: { slug: true },
			});

			if (existingSlugs.length > 0) {
				const conflictSlugs = existingSlugs.map((i) => i.slug).join(", ");
				throw new TRPCError({
					code: "CONFLICT",
					message: `Icons with these slugs already exist: ${conflictSlugs}`,
				});
			}

			const icons = await prisma.icon.createMany({
				data: input.icons.map((icon) => ({
					...icon,
					isCustom: true,
				})),
			});

			return { count: icons.count };
		}),

	// Create icon with variants (line and/or filled)
	createWithVariants: adminProcedure
		.input(
			z.object({
				baseName: z.string().min(1, "Base name is required"),
				category: z.string().min(1, "Category is required"),
				keywords: z.array(z.string()).optional().default([]),
				lineSvgContent: z.string().optional(),
				filledSvgContent: z.string().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const { baseName, category, keywords, lineSvgContent, filledSvgContent } =
				input;

			// At least one variant must be provided
			if (!(lineSvgContent || filledSvgContent)) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "At least one SVG variant (line or filled) is required",
				});
			}

			// Validate SVG content
			const validateSvg = (content: string, variantName: string) => {
				if (!(content.includes("<svg") && content.includes("</svg>"))) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: `Invalid SVG content for ${variantName} variant - must contain <svg> tags`,
					});
				}
			};

			if (lineSvgContent) {
				validateSvg(lineSvgContent, "line");
			}
			if (filledSvgContent) {
				validateSvg(filledSvgContent, "filled");
			}

			// Generate base slug from name
			const baseSlug = baseName
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/(^-|-$)/g, "");

			// Prepare variants to create
			const variantsToCreate: Array<{
				name: string;
				slug: string;
				category: string;
				svgContent: string;
				keywords: string[];
				isCustom: boolean;
			}> = [];

			if (lineSvgContent) {
				variantsToCreate.push({
					name: `${baseName} Line`,
					slug: `${baseSlug}-line`,
					category,
					svgContent: lineSvgContent.trim(),
					keywords: [...keywords, "line", "outline"],
					isCustom: true,
				});
			}

			if (filledSvgContent) {
				variantsToCreate.push({
					name: `${baseName} Filled`,
					slug: `${baseSlug}-filled`,
					category,
					svgContent: filledSvgContent.trim(),
					keywords: [...keywords, "filled", "solid"],
					isCustom: true,
				});
			}

			// Check for existing slugs
			const slugsToCheck = variantsToCreate.map((v) => v.slug);
			const existingSlugs = await prisma.icon.findMany({
				where: { slug: { in: slugsToCheck } },
				select: { slug: true },
			});

			if (existingSlugs.length > 0) {
				const conflictSlugs = existingSlugs.map((i) => i.slug).join(", ");
				throw new TRPCError({
					code: "CONFLICT",
					message: `Icons with these slugs already exist: ${conflictSlugs}`,
				});
			}

			// Create all variants
			const result = await prisma.icon.createMany({
				data: variantsToCreate,
			});

			return {
				count: result.count,
				variants: variantsToCreate.map((v) => ({
					name: v.name,
					slug: v.slug,
				})),
			};
		}),

	// Get available categories (admin)
	getCategories: adminProcedure.query(() => {
		return ICON_CATEGORIES;
	}),

	// ==================== PUBLIC ENDPOINTS ====================

	// Get available categories (public)
	getPublicCategories: publicProcedure.query(() => {
		return ICON_CATEGORIES;
	}),

	// List all icons (public) - for the public daIcons page
	listPublic: publicProcedure
		.input(
			z.object({
				search: z.string().optional(),
				category: z.string().optional(),
				limit: z.number().min(1).max(200).optional().default(100),
				cursor: z.string().optional(),
			})
		)
		.query(async ({ input }) => {
			const { search, category, limit, cursor } = input;

			const icons = await prisma.icon.findMany({
				where: {
					AND: [
						search
							? {
									OR: [
										{ name: { contains: search, mode: "insensitive" } },
										{ slug: { contains: search, mode: "insensitive" } },
										{ keywords: { hasSome: [search.toLowerCase()] } },
									],
								}
							: {},
						category ? { category } : {},
					],
				},
				take: limit,
				skip: cursor ? 1 : 0,
				cursor: cursor ? { id: cursor } : undefined,
				orderBy: { name: "asc" },
				select: {
					id: true,
					name: true,
					slug: true,
					category: true,
					svgContent: true,
					keywords: true,
				},
			});

			return {
				icons,
				nextCursor: icons.length === limit ? icons.at(-1)?.id : null,
			};
		}),
});

export type IconsRouter = typeof iconsRouter;
