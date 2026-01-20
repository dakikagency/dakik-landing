import { env } from "@collab/env/server";

interface CloudinarySignatureParams {
	timestamp: number;
	folder?: string;
	uploadPreset?: string;
}

interface SignedUploadParams extends CloudinarySignatureParams {
	signature: string;
	apiKey: string;
	cloudName: string;
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
	return Boolean(
		env.CLOUDINARY_CLOUD_NAME &&
			env.CLOUDINARY_API_KEY &&
			env.CLOUDINARY_API_SECRET
	);
}

/**
 * Get Cloudinary configuration (public values only)
 */
export function getCloudinaryConfig() {
	return {
		cloudName: env.CLOUDINARY_CLOUD_NAME,
		apiKey: env.CLOUDINARY_API_KEY,
	};
}

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

/**
 * Generate a signed upload signature for direct browser uploads
 */
export async function generateUploadSignature(
	params: Omit<CloudinarySignatureParams, "timestamp"> = {}
): Promise<SignedUploadParams> {
	if (!isCloudinaryConfigured()) {
		throw new Error("Cloudinary is not configured");
	}

	const timestamp = Math.round(Date.now() / 1000);

	// Build the string to sign
	// Parameters must be sorted alphabetically
	const signatureParams: Record<string, string | number> = {
		timestamp,
	};

	if (params.folder) {
		signatureParams.folder = params.folder;
	}

	if (params.uploadPreset) {
		signatureParams.upload_preset = params.uploadPreset;
	}

	// Sort and create the signature string
	const sortedParams = Object.keys(signatureParams)
		.sort()
		.map((key) => `${key}=${signatureParams[key]}`)
		.join("&");

	const stringToSign = `${sortedParams}${env.CLOUDINARY_API_SECRET}`;
	const signature = await sha1(stringToSign);

	return {
		timestamp,
		signature,
		apiKey: env.CLOUDINARY_API_KEY,
		cloudName: env.CLOUDINARY_CLOUD_NAME,
		folder: params.folder,
		uploadPreset: params.uploadPreset,
	};
}

/**
 * Generate signature for deletion
 */
export async function generateDeleteSignature(publicId: string): Promise<{
	timestamp: number;
	signature: string;
	apiKey: string;
	cloudName: string;
}> {
	if (!isCloudinaryConfigured()) {
		throw new Error("Cloudinary is not configured");
	}

	const timestamp = Math.round(Date.now() / 1000);
	const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
	const signature = await sha1(stringToSign);

	return {
		timestamp,
		signature,
		apiKey: env.CLOUDINARY_API_KEY,
		cloudName: env.CLOUDINARY_CLOUD_NAME,
	};
}

/**
 * Delete an asset from Cloudinary
 */
export async function deleteCloudinaryAsset(
	publicId: string,
	resourceType = "image"
): Promise<boolean> {
	const { timestamp, signature, apiKey, cloudName } =
		await generateDeleteSignature(publicId);

	const formData = new FormData();
	formData.append("public_id", publicId);
	formData.append("signature", signature);
	formData.append("api_key", apiKey);
	formData.append("timestamp", timestamp.toString());

	const response = await fetch(
		`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
		{
			method: "POST",
			body: formData,
		}
	);

	const result = await response.json();
	return result.result === "ok";
}
