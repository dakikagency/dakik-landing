/**
 * Utility functions for use in Cloudflare Workers (web APIs only)
 */

export function jsonResponse<T>(data: T, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"Content-Type": "application/json",
		},
	});
}

export function parseJSON<T>(body: string, fallback: T): T {
	try {
		return JSON.parse(body) as T;
	} catch {
		return fallback;
	}
}
