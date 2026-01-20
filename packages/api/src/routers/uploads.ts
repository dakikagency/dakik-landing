import prisma from "@collab/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../index";

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

/**
 * Generate SHA-1 hash for Cloudinary signature
 */
async function sha1(message: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(message);
	const hashBuffer = await crypto.subtle.digest("SHA-1", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const uploadsRouter = router({
	/**
	 * Get signed upload parameters for direct browser upload to Cloudinary
	 */
	getSignature: adminProcedure
		.input(
			z.object({
				folder: z.string().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
			const apiKey = process.env.CLOUDINARY_API_KEY;
			const apiSecret = process.env.CLOUDINARY_API_SECRET;

			if (!(cloudName && apiKey && apiSecret)) {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message: "Cloudinary is not configured",
				});
			}

			const timestamp = Math.round(Date.now() / 1000);

			// Build the string to sign
			const signatureParams: Record<string, string | number> = {
				timestamp,
			};

			if (input.folder) {
				signatureParams.folder = input.folder;
			}

			// Sort and create the signature string
			const sortedParams = Object.keys(signatureParams)
				.sort()
				.map((key) => `${key}=${signatureParams[key]}`)
				.join("&");

			const stringToSign = `${sortedParams}${apiSecret}`;
			const signature = await sha1(stringToSign);

			return {
				timestamp,
				signature,
				apiKey,
				cloudName,
				folder: input.folder,
			};
		}),

	/**
	 * Save asset metadata to database after successful upload
	 */
	saveAsset: adminProcedure
		.input(
			z.object({
				publicId: z.string(),
				url: z.string().url(),
				secureUrl: z.string().url(),
				format: z.string(),
				resourceType: z.string(),
				width: z.number().optional(),
				height: z.number().optional(),
				bytes: z.number(),
				folder: z.string().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const asset = await prisma.asset.create({
				data: {
					publicId: input.publicId,
					url: input.url,
					secureUrl: input.secureUrl,
					format: input.format,
					resourceType: input.resourceType,
					width: input.width,
					height: input.height,
					bytes: input.bytes,
					folder: input.folder,
				},
			});

			return asset;
		}),

	/**
	 * List assets from the database with pagination and filtering
	 */
	list: adminProcedure
		.input(
			z.object({
				page: z.number().min(1).optional().default(1),
				limit: z.number().min(1).max(100).optional().default(24),
				folder: z.string().optional(),
				search: z.string().optional(),
				resourceType: z.string().optional(),
			})
		)
		.query(async ({ input }) => {
			const { page, limit, folder, search, resourceType } = input;
			const skip = (page - 1) * limit;

			const where = {
				AND: [
					folder ? { folder: { equals: folder } } : {},
					resourceType ? { resourceType: { equals: resourceType } } : {},
					search
						? {
								OR: [
									{
										publicId: {
											contains: search,
											mode: "insensitive" as const,
										},
									},
									{
										folder: { contains: search, mode: "insensitive" as const },
									},
								],
							}
						: {},
				],
			};

			const [assets, total] = await Promise.all([
				prisma.asset.findMany({
					where,
					skip,
					take: limit,
					orderBy: { createdAt: "desc" },
				}),
				prisma.asset.count({ where }),
			]);

			const totalPages = Math.ceil(total / limit);

			return {
				assets,
				pagination: {
					page,
					limit,
					total,
					totalPages,
					hasNext: page < totalPages,
					hasPrev: page > 1,
				},
			};
		}),

	/**
	 * Get unique folders for filtering
	 */
	getFolders: adminProcedure.query(async () => {
		const folders = await prisma.asset.findMany({
			select: { folder: true },
			distinct: ["folder"],
			where: {
				folder: { not: null },
			},
			orderBy: { folder: "asc" },
		});

		return folders.map((f) => f.folder).filter(Boolean) as string[];
	}),

	/**
	 * Delete an asset from both Cloudinary and database
	 */
	delete: adminProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
			const apiKey = process.env.CLOUDINARY_API_KEY;
			const apiSecret = process.env.CLOUDINARY_API_SECRET;

			// Find the asset first
			const asset = await prisma.asset.findUnique({
				where: { id: input.id },
			});

			if (!asset) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Asset not found",
				});
			}

			// Delete from Cloudinary if configured
			if (cloudName && apiKey && apiSecret) {
				const timestamp = Math.round(Date.now() / 1000);
				const stringToSign = `public_id=${asset.publicId}&timestamp=${timestamp}${apiSecret}`;
				const signature = await sha1(stringToSign);

				const formData = new FormData();
				formData.append("public_id", asset.publicId);
				formData.append("signature", signature);
				formData.append("api_key", apiKey);
				formData.append("timestamp", timestamp.toString());

				try {
					await fetch(
						`https://api.cloudinary.com/v1_1/${cloudName}/${asset.resourceType}/destroy`,
						{
							method: "POST",
							body: formData,
						}
					);
				} catch (error) {
					console.error("Failed to delete from Cloudinary:", error);
					// Continue to delete from database even if Cloudinary fails
				}
			}

			// Delete from database
			await prisma.asset.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),

	/**
	 * Delete multiple assets
	 */
	deleteMany: adminProcedure
		.input(
			z.object({
				ids: z.array(z.string()),
			})
		)
		.mutation(async ({ input }) => {
			const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
			const apiKey = process.env.CLOUDINARY_API_KEY;
			const apiSecret = process.env.CLOUDINARY_API_SECRET;

			// Find all assets
			const assets = await prisma.asset.findMany({
				where: { id: { in: input.ids } },
			});

			// Delete from Cloudinary if configured
			if (cloudName && apiKey && apiSecret) {
				for (const asset of assets) {
					const timestamp = Math.round(Date.now() / 1000);
					const stringToSign = `public_id=${asset.publicId}&timestamp=${timestamp}${apiSecret}`;
					const signature = await sha1(stringToSign);

					const formData = new FormData();
					formData.append("public_id", asset.publicId);
					formData.append("signature", signature);
					formData.append("api_key", apiKey);
					formData.append("timestamp", timestamp.toString());

					try {
						await fetch(
							`https://api.cloudinary.com/v1_1/${cloudName}/${asset.resourceType}/destroy`,
							{
								method: "POST",
								body: formData,
							}
						);
					} catch (error) {
						console.error("Failed to delete from Cloudinary:", error);
					}
				}
			}

			// Delete from database
			await prisma.asset.deleteMany({
				where: { id: { in: input.ids } },
			});

			return { success: true, count: assets.length };
		}),
});

export type UploadsRouter = typeof uploadsRouter;
