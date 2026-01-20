import { env } from "@collab/env/server";
import { NextResponse } from "next/server";

export type ApiKeyValidationResult =
	| { valid: true }
	| { valid: false; response: NextResponse };

/**
 * Validates the API key from the X-API-Key header
 * Returns an error response if validation fails, or { valid: true } if successful
 */
export function validateApiKey(request: Request): ApiKeyValidationResult {
	const apiKey = request.headers.get("X-API-Key");

	// Check if API key is configured
	if (!env.BLOG_INTEGRATION_API_KEY) {
		return {
			valid: false,
			response: NextResponse.json(
				{ error: "API integration is not configured" },
				{ status: 503 }
			),
		};
	}

	// Check if API key is provided
	if (!apiKey) {
		return {
			valid: false,
			response: NextResponse.json(
				{ error: "API key is required" },
				{ status: 401 }
			),
		};
	}

	// Check if API key matches
	if (apiKey !== env.BLOG_INTEGRATION_API_KEY) {
		return {
			valid: false,
			response: NextResponse.json(
				{ error: "Invalid API key" },
				{ status: 403 }
			),
		};
	}

	return { valid: true };
}
