import { Hono } from "hono";
import type { CloudflareEnv } from "../../../types/cloudflare";

const ALLOWED_TYPES = new Set([
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
	"image/svg+xml",
	"application/pdf",
]);

const MAX_BYTES = 25 * 1024 * 1024; // 25MB

/**
 * Generate a stable, web-safe key for an uploaded file.
 *
 * Format: <folder>/<timestamp>-<random>.<ext>
 *
 * - Timestamp gives roughly-chronological ordering in the bucket UI.
 * - Random suffix avoids collisions on concurrent uploads in the same ms.
 * - Original extension preserved so Content-Type can be re-derived if needed.
 */
function generateKey(folder: string, filename: string): string {
	const extMatch = filename.match(/\.([a-zA-Z0-9]+)$/);
	const ext = extMatch ? extMatch[1].toLowerCase() : "bin";
	const ts = Date.now();
	const random = crypto.randomUUID().split("-")[0];
	const safeFolder = folder.replace(/[^a-z0-9-_/]/gi, "");
	return `${safeFolder}/${ts}-${random}.${ext}`;
}

/**
 * Admin file upload via R2.
 *
 * POST /api/admin/upload
 *   multipart/form-data:
 *     - file: the file (required)
 *     - folder: optional bucket folder (default "uploads")
 *
 * Stores the object in the MEDIA R2 bucket, creates an Asset row pointing
 * at the worker-served URL (/media/:key), and returns the URL + asset id.
 */
export function createAdminUploadRouter() {
	const upload = new Hono<{ Bindings: CloudflareEnv }>();

	upload.post("/", async (c) => {
		const formData = await c.req.formData();
		const file = formData.get("file");
		const folder = (formData.get("folder") as string) || "uploads";

		if (!(file instanceof File)) {
			return c.json({ error: "file is required" }, 400);
		}

		if (!ALLOWED_TYPES.has(file.type)) {
			return c.json(
				{
					error: `unsupported file type: ${file.type || "unknown"}`,
					allowed: Array.from(ALLOWED_TYPES),
				},
				400,
			);
		}

		if (file.size > MAX_BYTES) {
			return c.json(
				{ error: `file too large: ${file.size} bytes (max ${MAX_BYTES})` },
				413,
			);
		}

		const key = generateKey(folder, file.name || "upload");

		await c.env.MEDIA.put(key, await file.arrayBuffer(), {
			httpMetadata: { contentType: file.type },
			customMetadata: {
				originalName: file.name || "",
				uploadedBy: c.get("user").email,
			},
		});

		const db = c.get("db");
		const url = `/media/${key}`;
		const asset = await db.asset.create({
			data: {
				publicId: key,
				url,
				secureUrl: url,
				format: file.type.split("/")[1] ?? "bin",
				resourceType: file.type.startsWith("image/") ? "image" : "raw",
				bytes: file.size,
				folder,
			},
		});

		return c.json({ asset, url, key }, 201);
	});

	return upload;
}
