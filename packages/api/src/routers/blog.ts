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

const fetchTagsByPostIds = async (postIds: string[]) => {
	if (postIds.length === 0) {
		return new Map<string, { id: string; name: string; slug: string }[]>();
	}

	const rows = await db
		.selectFrom("_BlogPostToTag as bt")
		.innerJoin("tag as t", "bt.B", "t.id")
		.select([
			"bt.A as postId",
			"t.id as id",
			"t.name as name",
			"t.slug as slug",
		])
		.where("bt.A", "in", postIds)
		.orderBy("t.name", "asc")
		.execute();

	const map = new Map<string, { id: string; name: string; slug: string }[]>();
	for (const row of rows) {
		const list = map.get(row.postId) ?? [];
		list.push({ id: row.id, name: row.name, slug: row.slug });
		map.set(row.postId, list);
	}

	return map;
};

export const blogRouter = router({
	list: publicProcedure.input(listInputSchema).query(async ({ input }) => {
		const { page, limit, tag } = input;
		const skip = (page - 1) * limit;

		let postIdsByTag: string[] | null = null;
		if (tag) {
			const tagRow = await db
				.selectFrom("tag")
				.select(["id"])
				.where("slug", "=", tag)
				.executeTakeFirst();

			if (!tagRow) {
				return {
					posts: [],
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
				.selectFrom("_BlogPostToTag")
				.select(["A"])
				.where("B", "=", tagRow.id)
				.execute();

			postIdsByTag = rows.map((row) => row.A);
		}

		let query = db
			.selectFrom("blog_post")
			.selectAll()
			.where("published", "=", true)
			.where("publishedAt", "is not", null);

		if (postIdsByTag) {
			if (postIdsByTag.length === 0) {
				return {
					posts: [],
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
			query = query.where("id", "in", postIdsByTag);
		}

		const [posts, totalRow] = await Promise.all([
			query.orderBy("publishedAt", "desc").limit(limit).offset(skip).execute(),
			db
				.selectFrom("blog_post")
				.select((eb) => eb.fn.count("id").as("count"))
				.where("published", "=", true)
				.where("publishedAt", "is not", null)
				.$if(!!postIdsByTag, (qb) =>
					postIdsByTag && postIdsByTag.length > 0
						? qb.where("id", "in", postIdsByTag)
						: qb.where("id", "=", "__none__")
				)
				.executeTakeFirst(),
		]);

		const tagsByPostId = await fetchTagsByPostIds(posts.map((post) => post.id));
		const total = Number(totalRow?.count ?? 0);

		return {
			posts: posts.map((post) => ({
				...post,
				tags: tagsByPostId.get(post.id) ?? [],
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
			const post = await db
				.selectFrom("blog_post")
				.selectAll()
				.where("slug", "=", input.slug)
				.where("published", "=", true)
				.executeTakeFirst();

			if (!post) {
				return null;
			}

			const tagsByPostId = await fetchTagsByPostIds([post.id]);

			return {
				...post,
				tags: tagsByPostId.get(post.id) ?? [],
			};
		}),

	getTags: publicProcedure.query(async () => {
		const rows = await db
			.selectFrom("tag as t")
			.leftJoin("_BlogPostToTag as bt", "t.id", "bt.B")
			.select(["t.id", "t.name", "t.slug"])
			.select((eb) => eb.fn.count("bt.A").as("postsCount"))
			.groupBy(["t.id", "t.name", "t.slug"])
			.orderBy("t.name", "asc")
			.execute();

		return rows
			.map((row) => ({
				id: row.id,
				name: row.name,
				slug: row.slug,
				_count: { posts: Number(row.postsCount ?? 0) },
			}))
			.filter((tag) => tag._count.posts > 0);
	}),

	getRelatedPosts: publicProcedure
		.input(
			z.object({
				slug: z.string(),
				limit: z.number().min(1).max(6).default(3),
			})
		)
		.query(async ({ input }) => {
			const currentPost = await db
				.selectFrom("blog_post")
				.selectAll()
				.where("slug", "=", input.slug)
				.where("published", "=", true)
				.executeTakeFirst();

			if (!currentPost) {
				return [];
			}

			const tagLinks = await db
				.selectFrom("_BlogPostToTag")
				.select(["B"])
				.where("A", "=", currentPost.id)
				.execute();

			const tagIds = tagLinks.map((link) => link.B);
			if (tagIds.length === 0) {
				return [];
			}

			const relatedIdsRows = await db
				.selectFrom("_BlogPostToTag")
				.select(["A"])
				.where("B", "in", tagIds)
				.where("A", "<>", currentPost.id)
				.distinct()
				.execute();

			const relatedIds = relatedIdsRows.map((row) => row.A);
			if (relatedIds.length === 0) {
				return [];
			}

			const relatedPosts = await db
				.selectFrom("blog_post")
				.selectAll()
				.where("published", "=", true)
				.where("id", "in", relatedIds)
				.orderBy("publishedAt", "desc")
				.limit(input.limit)
				.execute();

			const tagsByPostId = await fetchTagsByPostIds(
				relatedPosts.map((post) => post.id)
			);

			return relatedPosts.map((post) => ({
				...post,
				tags: tagsByPostId.get(post.id) ?? [],
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

			let query = db.selectFrom("blog_post").selectAll();

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

			const [posts, totalRow] = await Promise.all([
				query.orderBy("createdAt", "desc").limit(limit).offset(skip).execute(),
				db
					.selectFrom("blog_post")
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

			const tagsByPostId = await fetchTagsByPostIds(
				posts.map((post) => post.id)
			);

			const total = Number(totalRow?.count ?? 0);

			return {
				posts: posts.map((post) => ({
					...post,
					tags: tagsByPostId.get(post.id) ?? [],
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
			const post = await db
				.selectFrom("blog_post")
				.selectAll()
				.where("id", "=", input.id)
				.executeTakeFirst();

			if (!post) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Blog post not found",
				});
			}

			const tagsByPostId = await fetchTagsByPostIds([post.id]);

			return {
				...post,
				tags: tagsByPostId.get(post.id) ?? [],
			};
		}),

	getAllTags: adminProcedure.query(async () => {
		const rows = await db
			.selectFrom("tag as t")
			.leftJoin("_BlogPostToTag as bt", "t.id", "bt.B")
			.select(["t.id", "t.name", "t.slug"])
			.select((eb) => eb.fn.count("bt.A").as("postsCount"))
			.groupBy(["t.id", "t.name", "t.slug"])
			.orderBy("t.name", "asc")
			.execute();

		return rows.map((row) => ({
			id: row.id,
			name: row.name,
			slug: row.slug,
			_count: { posts: Number(row.postsCount ?? 0) },
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
				published: z.boolean().default(false),
				tagIds: z.array(z.string()).default([]),
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const { tagIds, ...data } = input;

				// Check if slug is unique
				const existingPost = await db
					.selectFrom("blog_post")
					.select(["id"])
					.where("slug", "=", data.slug)
					.executeTakeFirst();

				if (existingPost) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "A post with this slug already exists",
					});
				}

				// Create the blog post
				const post = await db
					.insertInto("blog_post")
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
						.insertInto("_BlogPostToTag")
						.values(tagIds.map((id) => ({ A: post.id, B: id })))
						.execute();
				}

				const tagsByPostId = await fetchTagsByPostIds([post.id]);

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

				return {
					...post,
					tags: tagsByPostId.get(post.id) ?? [],
				};
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
			const existingPost = await db
				.selectFrom("blog_post")
				.selectAll()
				.where("id", "=", id)
				.executeTakeFirst();

			if (!existingPost) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Blog post not found",
				});
			}

			// Check if slug is unique (if changing)
			if (data.slug && data.slug !== existingPost.slug) {
				const postWithSlug = await db
					.selectFrom("blog_post")
					.select(["id"])
					.where("slug", "=", data.slug)
					.executeTakeFirst();

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

			const post = await db.transaction().execute(async (trx) => {
				const updated = await trx
					.updateTable("blog_post")
					.set({
						...data,
						publishedAt,
					})
					.where("id", "=", id)
					.returningAll()
					.executeTakeFirstOrThrow();

				if (tagIds) {
					await trx.deleteFrom("_BlogPostToTag").where("A", "=", id).execute();

					if (tagIds.length > 0) {
						await trx
							.insertInto("_BlogPostToTag")
							.values(tagIds.map((tagId) => ({ A: id, B: tagId })))
							.execute();
					}
				}

				return updated;
			});

			const tagsByPostId = await fetchTagsByPostIds([post.id]);

			return {
				...post,
				tags: tagsByPostId.get(post.id) ?? [],
			};
		}),

	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const existingPost = await db
				.selectFrom("blog_post")
				.select(["id"])
				.where("id", "=", input.id)
				.executeTakeFirst();

			if (!existingPost) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Blog post not found",
				});
			}

			type BlogPostDeleteTransaction = typeof db;

			await db.transaction().execute(async (trx: BlogPostDeleteTransaction) => {
				await trx
					.deleteFrom("_BlogPostToTag")
					.where("A", "=", input.id)
					.execute();
				await trx.deleteFrom("blog_post").where("id", "=", input.id).execute();
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
