import { db } from "@collab/db";
import { TRPCError } from "@trpc/server";
import { sql } from "kysely";
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

		let query = db
			.selectFrom("component_doc")
			.selectAll()
			.where("published", "=", true);

		if (category) {
			query = query.where("category", "=", category);
		}

		if (search) {
			query = query.where(
				sql<boolean>`("name" ILIKE ${`%${search}%`} OR "description" ILIKE ${`%${search}%`})`
			);
		}

		const [components, totalRow] = await Promise.all([
			query
				.orderBy("category", "asc")
				.orderBy("name", "asc")
				.limit(limit)
				.offset(skip)
				.execute(),
			db
				.selectFrom("component_doc")
				.select((eb) => eb.fn.count("id").as("count"))
				.where("published", "=", true)
				.$if(!!category, (qb) => qb.where("category", "=", category))
				.$if(!!search, (qb) =>
					qb.where(
						sql<boolean>`("name" ILIKE ${`%${search}%`} OR "description" ILIKE ${`%${search}%`})`
					)
				)
				.executeTakeFirst(),
		]);

		const total = Number(totalRow?.count ?? 0);

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
			return await db
				.selectFrom("component_doc")
				.selectAll()
				.where("slug", "=", input.slug)
				.where("published", "=", true)
				.executeTakeFirst();
		}),

	getCategories: publicProcedure.query(() => {
		return COMPONENT_CATEGORIES;
	}),

	// Admin endpoints
	adminList: adminProcedure.input(listInputSchema).query(async ({ input }) => {
		const { page, limit, category, search, status } = input;
		const skip = (page - 1) * limit;

		let query = db.selectFrom("component_doc").selectAll();

		if (status === "published") {
			query = query.where("published", "=", true);
		}
		if (status === "draft") {
			query = query.where("published", "=", false);
		}
		if (category) {
			query = query.where("category", "=", category);
		}
		if (search) {
			query = query.where(
				sql<boolean>`("name" ILIKE ${`%${search}%`} OR "description" ILIKE ${`%${search}%`})`
			);
		}

		const [components, totalRow] = await Promise.all([
			query.orderBy("createdAt", "desc").limit(limit).offset(skip).execute(),
			db
				.selectFrom("component_doc")
				.select((eb) => eb.fn.count("id").as("count"))
				.$if(status === "published", (qb) => qb.where("published", "=", true))
				.$if(status === "draft", (qb) => qb.where("published", "=", false))
				.$if(!!category, (qb) => qb.where("category", "=", category))
				.$if(!!search, (qb) =>
					qb.where(
						sql<boolean>`("name" ILIKE ${`%${search}%`} OR "description" ILIKE ${`%${search}%`})`
					)
				)
				.executeTakeFirst(),
		]);

		const total = Number(totalRow?.count ?? 0);

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
			const component = await db
				.selectFrom("component_doc")
				.selectAll()
				.where("id", "=", input.id)
				.executeTakeFirst();

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
			const existingComponent = await db
				.selectFrom("component_doc")
				.select(["id"])
				.where("slug", "=", input.slug)
				.executeTakeFirst();

			if (existingComponent) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "A component with this slug already exists",
				});
			}

			const component = await db
				.insertInto("component_doc")
				.values({
					id: crypto.randomUUID(),
					name: input.name,
					slug: input.slug,
					category: input.category,
					description: input.description ?? null,
					props: input.props,
					code: input.code,
					preview: input.preview ?? null,
					published: input.published,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returningAll()
				.executeTakeFirstOrThrow();

			return component;
		}),

	update: adminProcedure
		.input(updateInputSchema)
		.mutation(async ({ input }) => {
			const { id, ...data } = input;

			// Find the existing component
			const existingComponent = await db
				.selectFrom("component_doc")
				.selectAll()
				.where("id", "=", id)
				.executeTakeFirst();

			if (!existingComponent) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Component not found",
				});
			}

			// Check if slug is unique (if changing)
			if (data.slug && data.slug !== existingComponent.slug) {
				const componentWithSlug = await db
					.selectFrom("component_doc")
					.select(["id"])
					.where("slug", "=", data.slug)
					.executeTakeFirst();

				if (componentWithSlug) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "A component with this slug already exists",
					});
				}
			}

			const component = await db
				.updateTable("component_doc")
				.set(data)
				.where("id", "=", id)
				.returningAll()
				.executeTakeFirstOrThrow();

			return component;
		}),

	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const existingComponent = await db
				.selectFrom("component_doc")
				.select(["id"])
				.where("id", "=", input.id)
				.executeTakeFirst();

			if (!existingComponent) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Component not found",
				});
			}

			await db.deleteFrom("component_doc").where("id", "=", input.id).execute();

			return { success: true };
		}),

	// ==================== Component Files (Multi-file support) ====================

	// Get all files for a component
	getFiles: adminProcedure
		.input(z.object({ componentId: z.string() }))
		.query(async ({ input }) => {
			return await db
				.selectFrom("component_file")
				.selectAll()
				.where("componentId", "=", input.componentId)
				.orderBy("order", "asc")
				.execute();
		}),

	// Get a single file
	getFile: adminProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const file = await db
				.selectFrom("component_file")
				.selectAll()
				.where("id", "=", input.id)
				.executeTakeFirst();

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
			const component = await db
				.selectFrom("component_doc")
				.select(["id"])
				.where("id", "=", input.componentId)
				.executeTakeFirst();

			if (!component) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Component not found",
				});
			}

			// Check if filename is unique for this component
			const existingFile = await db
				.selectFrom("component_file")
				.select(["id"])
				.where("componentId", "=", input.componentId)
				.where("filename", "=", input.filename)
				.executeTakeFirst();

			if (existingFile) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "A file with this name already exists for this component",
				});
			}

			const file = await db
				.insertInto("component_file")
				.values({
					id: crypto.randomUUID(),
					...input,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returningAll()
				.executeTakeFirstOrThrow();

			return file;
		}),

	// Update a file
	updateFile: adminProcedure
		.input(fileUpdateInputSchema)
		.mutation(async ({ input }) => {
			const { id, ...data } = input;

			// Verify file exists
			const existingFile = await db
				.selectFrom("component_file")
				.selectAll()
				.where("id", "=", id)
				.executeTakeFirst();

			if (!existingFile) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "File not found",
				});
			}

			// If filename is being changed, check for conflicts
			if (data.filename && data.filename !== existingFile.filename) {
				const conflictFile = await db
					.selectFrom("component_file")
					.select(["id"])
					.where("componentId", "=", existingFile.componentId)
					.where("filename", "=", data.filename)
					.executeTakeFirst();

				if (conflictFile) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "A file with this name already exists for this component",
					});
				}
			}

			const file = await db
				.updateTable("component_file")
				.set(data)
				.where("id", "=", id)
				.returningAll()
				.executeTakeFirstOrThrow();

			return file;
		}),

	// Delete a file
	deleteFile: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const existingFile = await db
				.selectFrom("component_file")
				.select(["id"])
				.where("id", "=", input.id)
				.executeTakeFirst();

			if (!existingFile) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "File not found",
				});
			}

			await db
				.deleteFrom("component_file")
				.where("id", "=", input.id)
				.execute();

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
			await db.transaction().execute(async (trx) => {
				await Promise.all(
					input.files.map((file) =>
						trx
							.updateTable("component_file")
							.set({ order: file.order })
							.where("id", "=", file.id)
							.execute()
					)
				);
			});

			return { success: true };
		}),
});
