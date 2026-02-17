import { db } from "@collab/db";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "..";

export const leadMagnetRouter = router({
	list: protectedProcedure.query(() => {
		return db
			.selectFrom("lead_magnet")
			.innerJoin("asset", "asset.id", "lead_magnet.assetId")
			.selectAll("lead_magnet")
			.select([
				"asset.id as asset_id",
				"asset.publicId as asset_publicId",
				"asset.url as asset_url",
				"asset.secureUrl as asset_secureUrl",
				"asset.format as asset_format",
				"asset.resourceType as asset_resourceType",
				"asset.width as asset_width",
				"asset.height as asset_height",
				"asset.bytes as asset_bytes",
				"asset.folder as asset_folder",
			])
			.orderBy("lead_magnet.createdAt", "desc")
			.execute()
			.then((rows) =>
				rows.map((row) => ({
					id: row.id,
					name: row.name,
					slug: row.slug,
					description: row.description,
					assetId: row.assetId,
					isActive: row.isActive,
					createdAt: row.createdAt,
					updatedAt: row.updatedAt,
					asset: {
						id: row.asset_id,
						publicId: row.asset_publicId,
						url: row.asset_url,
						secureUrl: row.asset_secureUrl,
						format: row.asset_format,
						resourceType: row.asset_resourceType,
						width: row.asset_width,
						height: row.asset_height,
						bytes: row.asset_bytes,
						folder: row.asset_folder,
					},
				}))
			);
	}),

	getBySlug: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ input }) => {
			const row = await db
				.selectFrom("lead_magnet")
				.innerJoin("asset", "asset.id", "lead_magnet.assetId")
				.selectAll("lead_magnet")
				.select([
					"asset.id as asset_id",
					"asset.publicId as asset_publicId",
					"asset.url as asset_url",
					"asset.secureUrl as asset_secureUrl",
					"asset.format as asset_format",
					"asset.resourceType as asset_resourceType",
					"asset.width as asset_width",
					"asset.height as asset_height",
					"asset.bytes as asset_bytes",
					"asset.folder as asset_folder",
				])
				.where("lead_magnet.slug", "=", input.slug)
				.executeTakeFirst();

			if (!row) {
				return null;
			}

			return {
				id: row.id,
				name: row.name,
				slug: row.slug,
				description: row.description,
				assetId: row.assetId,
				isActive: row.isActive,
				createdAt: row.createdAt,
				updatedAt: row.updatedAt,
				asset: {
					id: row.asset_id,
					publicId: row.asset_publicId,
					url: row.asset_url,
					secureUrl: row.asset_secureUrl,
					format: row.asset_format,
					resourceType: row.asset_resourceType,
					width: row.asset_width,
					height: row.asset_height,
					bytes: row.asset_bytes,
					folder: row.asset_folder,
				},
			};
		}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				slug: z.string(),
				description: z.string().optional(),
				assetId: z.string(),
				isActive: z.boolean(),
			})
		)
		.mutation(async ({ input }) => {
			// Check slug uniqueness
			const existing = await db
				.selectFrom("lead_magnet")
				.where("slug", "=", input.slug)
				.select("id")
				.executeTakeFirst();

			if (existing) {
				throw new Error("Slug already exists");
			}

			return db
				.insertInto("lead_magnet")
				.values({
					id: crypto.randomUUID(),
					name: input.name,
					slug: input.slug,
					description: input.description ?? null,
					assetId: input.assetId,
					isActive: input.isActive,
					updatedAt: new Date(),
				})
				.returningAll()
				.executeTakeFirstOrThrow();
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().optional(),
				slug: z.string().optional(),
				description: z.string().optional(),
				assetId: z.string().optional(),
				isActive: z.boolean().optional(),
			})
		)
		.mutation(({ input }) => {
			const { id, ...data } = input;
			return db
				.updateTable("lead_magnet")
				.set({
					...data,
					updatedAt: new Date(),
				})
				.where("id", "=", id)
				.returningAll()
				.executeTakeFirstOrThrow();
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(({ input }) => {
			return db
				.deleteFrom("lead_magnet")
				.where("id", "=", input.id)
				.returningAll()
				.executeTakeFirstOrThrow();
		}),
});
