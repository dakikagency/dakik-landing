import { db } from "@collab/db";
import { TRPCError } from "@trpc/server";
import { sql } from "kysely";
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

const fetchTagsByAutomationIds = async (automationIds: string[]) => {
	if (automationIds.length === 0) {
		return new Map<string, { id: string; name: string; slug: string }[]>();
	}

	const rows = await db
		.selectFrom("_AutomationToTag as at")
		.innerJoin("tag as t", "at.B", "t.id")
		.select([
			"at.A as automationId",
			"t.id as id",
			"t.name as name",
			"t.slug as slug",
		])
		.where("at.A", "in", automationIds)
		.orderBy("t.name", "asc")
		.execute();

	const map = new Map<string, { id: string; name: string; slug: string }[]>();
	for (const row of rows) {
		const list = map.get(row.automationId) ?? [];
		list.push({ id: row.id, name: row.name, slug: row.slug });
		map.set(row.automationId, list);
	}

	return map;
};

export const automationRouter = router({
	list: publicProcedure.input(listInputSchema).query(async ({ input }) => {
		const { page, limit, tag } = input;
		const skip = (page - 1) * limit;

		let automationIdsByTag: string[] | null = null;
		if (tag) {
			const tagRow = await db
				.selectFrom("tag")
				.select(["id"])
				.where("slug", "=", tag)
				.executeTakeFirst();

			if (!tagRow) {
				return {
					automations: [],
					pagination: {
						page,
						limit,
						total: 0,
						totalPages: 0,
						hasNext: false,
						hasPrev: page > 1,
					},
				};
			}

			const rows = await db
				.selectFrom("_AutomationToTag")
				.select(["A"])
				.where("B", "=", tagRow.id)
				.execute();

			automationIdsByTag = rows.map((row) => row.A);
		}

		let query = db
			.selectFrom("automation")
			.selectAll()
			.where("published", "=", true)
			.where("publishedAt", "is not", null);

		if (automationIdsByTag) {
			if (automationIdsByTag.length === 0) {
				return {
					automations: [],
					pagination: {
						page,
						limit,
						total: 0,
						totalPages: 0,
						hasNext: false,
						hasPrev: page > 1,
					},
				};
			}
			query = query.where("id", "in", automationIdsByTag);
		}

		const [automations, totalRow] = await Promise.all([
			query.orderBy("publishedAt", "desc").limit(limit).offset(skip).execute(),
			db
				.selectFrom("automation")
				.select((eb) => eb.fn.count("id").as("count"))
				.where("published", "=", true)
				.where("publishedAt", "is not", null)
				.$if(!!automationIdsByTag, (qb) =>
					automationIdsByTag && automationIdsByTag.length > 0
						? qb.where("id", "in", automationIdsByTag)
						: qb.where("id", "=", "__none__")
				)
				.executeTakeFirst(),
		]);

		const tagsByAutomationId = await fetchTagsByAutomationIds(
			automations.map((automation) => automation.id)
		);

		const total = Number(totalRow?.count ?? 0);

		return {
			automations: automations.map((automation) => ({
				...automation,
				tags: tagsByAutomationId.get(automation.id) ?? [],
			})),
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
			const automation = await db
				.selectFrom("automation")
				.selectAll()
				.where("slug", "=", input.slug)
				.where("published", "=", true)
				.executeTakeFirst();

			if (!automation) {
				return null;
			}

			const tagsByAutomationId = await fetchTagsByAutomationIds([
				automation.id,
			]);

			return {
				...automation,
				tags: tagsByAutomationId.get(automation.id) ?? [],
			};
		}),

	getTags: publicProcedure.query(async () => {
		const rows = await db
			.selectFrom("tag as t")
			.leftJoin("_AutomationToTag as at", "t.id", "at.B")
			.select(["t.id", "t.name", "t.slug"])
			.select((eb) => eb.fn.count("at.A").as("automationCount"))
			.groupBy(["t.id", "t.name", "t.slug"])
			.orderBy("t.name", "asc")
			.execute();

		return rows
			.map((row) => ({
				id: row.id,
				name: row.name,
				slug: row.slug,
				_count: { automations: Number(row.automationCount ?? 0) },
			}))
			.filter((tag) => tag._count.automations > 0);
	}),

	getRelatedAutomations: publicProcedure
		.input(
			z.object({
				slug: z.string(),
				limit: z.number().min(1).max(6).default(3),
			})
		)
		.query(async ({ input }) => {
			const currentAutomation = await db
				.selectFrom("automation")
				.selectAll()
				.where("slug", "=", input.slug)
				.where("published", "=", true)
				.executeTakeFirst();

			if (!currentAutomation) {
				return [];
			}

			const tagLinks = await db
				.selectFrom("_AutomationToTag")
				.select(["B"])
				.where("A", "=", currentAutomation.id)
				.execute();

			const tagIds = tagLinks.map((link) => link.B);
			if (tagIds.length === 0) {
				return [];
			}

			const relatedIdsRows = await db
				.selectFrom("_AutomationToTag")
				.select(["A"])
				.where("B", "in", tagIds)
				.where("A", "<>", currentAutomation.id)
				.distinct()
				.execute();

			const relatedIds = relatedIdsRows.map((row) => row.A);
			if (relatedIds.length === 0) {
				return [];
			}

			const relatedAutomations = await db
				.selectFrom("automation")
				.selectAll()
				.where("published", "=", true)
				.where("id", "in", relatedIds)
				.orderBy("publishedAt", "desc")
				.limit(input.limit)
				.execute();

			const tagsByAutomationId = await fetchTagsByAutomationIds(
				relatedAutomations.map((automation) => automation.id)
			);

			return relatedAutomations.map((automation) => ({
				...automation,
				tags: tagsByAutomationId.get(automation.id) ?? [],
			}));
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

			let query = db.selectFrom("automation").selectAll();

			if (status === "published") {
				query = query.where("published", "=", true);
			}
			if (status === "draft") {
				query = query.where("published", "=", false);
			}
			if (search) {
				query = query.where(
					sql<boolean>`("title" ILIKE ${`%${search}%`} OR "content" ILIKE ${`%${search}%`})`
				);
			}

			const [automations, totalRow] = await Promise.all([
				query.orderBy("createdAt", "desc").limit(limit).offset(skip).execute(),
				db
					.selectFrom("automation")
					.select((eb) => eb.fn.count("id").as("count"))
					.$if(status === "published", (qb) => qb.where("published", "=", true))
					.$if(status === "draft", (qb) => qb.where("published", "=", false))
					.$if(!!search, (qb) =>
						qb.where(
							sql<boolean>`("title" ILIKE ${`%${search}%`} OR "content" ILIKE ${`%${search}%`})`
						)
					)
					.executeTakeFirst(),
			]);

			const tagsByAutomationId = await fetchTagsByAutomationIds(
				automations.map((automation) => automation.id)
			);

			const total = Number(totalRow?.count ?? 0);

			return {
				automations: automations.map((automation) => ({
					...automation,
					tags: tagsByAutomationId.get(automation.id) ?? [],
				})),
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
			const automation = await db
				.selectFrom("automation")
				.selectAll()
				.where("id", "=", input.id)
				.executeTakeFirst();

			if (!automation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Automation not found",
				});
			}

			const tagsByAutomationId = await fetchTagsByAutomationIds([
				automation.id,
			]);

			return {
				...automation,
				tags: tagsByAutomationId.get(automation.id) ?? [],
			};
		}),

	getAllTags: adminProcedure.query(async () => {
		const rows = await db
			.selectFrom("tag as t")
			.leftJoin("_BlogPostToTag as bt", "t.id", "bt.B")
			.leftJoin("_AutomationToTag as at", "t.id", "at.B")
			.select(["t.id", "t.name", "t.slug"])
			.select((eb) => eb.fn.count("bt.A").as("postsCount"))
			.select((eb) => eb.fn.count("at.A").as("automationsCount"))
			.groupBy(["t.id", "t.name", "t.slug"])
			.orderBy("t.name", "asc")
			.execute();

		return rows.map((row) => ({
			id: row.id,
			name: row.name,
			slug: row.slug,
			_count: {
				posts: Number(row.postsCount ?? 0),
				automations: Number(row.automationsCount ?? 0),
			},
		}));
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
				const existingAutomation = await db
					.selectFrom("automation")
					.select(["id"])
					.where("slug", "=", data.slug)
					.executeTakeFirst();

				if (existingAutomation) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "An automation with this slug already exists",
					});
				}

				// Create the automation
				const automation = await db
					.insertInto("automation")
					.values({
						id: crypto.randomUUID(),
						...data,
						publishedAt: data.published ? new Date() : null,
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returningAll()
					.executeTakeFirstOrThrow();

				if (tagIds.length > 0) {
					await db
						.insertInto("_AutomationToTag")
						.values(tagIds.map((id) => ({ A: automation.id, B: id })))
						.execute();
				}

				const tagsByAutomationId = await fetchTagsByAutomationIds([
					automation.id,
				]);

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

				return {
					...automation,
					tags: tagsByAutomationId.get(automation.id) ?? [],
				};
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
			const existingAutomation = await db
				.selectFrom("automation")
				.selectAll()
				.where("id", "=", id)
				.executeTakeFirst();

			if (!existingAutomation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Automation not found",
				});
			}

			// Check if slug is unique (if changing)
			if (data.slug && data.slug !== existingAutomation.slug) {
				const automationWithSlug = await db
					.selectFrom("automation")
					.select(["id"])
					.where("slug", "=", data.slug)
					.executeTakeFirst();

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

			const automation = await db.transaction().execute(async (trx) => {
				const updated = await trx
					.updateTable("automation")
					.set({
						...data,
						publishedAt,
					})
					.where("id", "=", id)
					.returningAll()
					.executeTakeFirstOrThrow();

				if (tagIds) {
					await trx
						.deleteFrom("_AutomationToTag")
						.where("A", "=", id)
						.execute();

					if (tagIds.length > 0) {
						await trx
							.insertInto("_AutomationToTag")
							.values(tagIds.map((tagId) => ({ A: id, B: tagId })))
							.execute();
					}
				}

				return updated;
			});

			const tagsByAutomationId = await fetchTagsByAutomationIds([
				automation.id,
			]);

			return {
				...automation,
				tags: tagsByAutomationId.get(automation.id) ?? [],
			};
		}),

	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const existingAutomation = await db
				.selectFrom("automation")
				.select(["id"])
				.where("id", "=", input.id)
				.executeTakeFirst();

			if (!existingAutomation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Automation not found",
				});
			}

			await db.transaction().execute(async (trx) => {
				await trx
					.deleteFrom("_AutomationToTag")
					.where("A", "=", input.id)
					.execute();
				await trx.deleteFrom("automation").where("id", "=", input.id).execute();
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
			const existingTag = await db
				.selectFrom("tag")
				.select(["id"])
				.where("slug", "=", input.slug)
				.executeTakeFirst();

			if (existingTag) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "A tag with this slug already exists",
				});
			}

			return db
				.insertInto("tag")
				.values({
					id: crypto.randomUUID(),
					...input,
				})
				.returningAll()
				.executeTakeFirstOrThrow();
		}),
});
