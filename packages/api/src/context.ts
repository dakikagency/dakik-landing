import { auth } from "@collab/auth";
import prisma from "@collab/db";
import type { NextRequest } from "next/server";

export async function createContext(req: NextRequest) {
	const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
	const userAgent = req.headers.get("user-agent") ?? undefined;

	console.log("[Context] Creating context for request");

	try {
		console.log("[Context] Calling auth.api.getSession...");
		const session = await auth.api.getSession({
			headers: req.headers,
		});
		console.log("[Context] Session result:", session ? "found" : "null");

		// If there's a session, fetch the user's role from the database
		if (session?.user?.id) {
			console.log("[Context] Fetching user role for:", session.user.id);
			const user = await prisma.user.findUnique({
				where: { id: session.user.id },
				select: { role: true },
			});
			console.log("[Context] User role:", user?.role);

			return {
				session: {
					...session,
					user: {
						...session.user,
						role: user?.role ?? "CUSTOMER",
					},
				},
				ip,
				userAgent,
			};
		}

		console.log("[Context] No session, returning null");
		return {
			session: null,
			ip,
			userAgent,
		};
	} catch (error) {
		// Log the full error for debugging
		console.error("[Context] Failed to get session:");
		console.error("[Context] Error:", error);
		console.error("[Context] Error message:", error instanceof Error ? error.message : "N/A");
		console.error("[Context] Error stack:", error instanceof Error ? error.stack : "N/A");

		return {
			session: null,
			ip,
			userAgent,
		};
	}
}

export type Context = Awaited<ReturnType<typeof createContext>>;
