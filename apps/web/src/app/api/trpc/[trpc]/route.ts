import { createContext } from "@collab/api/context";
import { appRouter } from "@collab/api/routers/index";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";

function handler(req: NextRequest) {
	return fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: () => createContext(req),
		onError: ({ error, path }) => {
			// Always log errors in development for debugging
			console.error(`[tRPC Error] ${path}:`, error.message || error);
			console.error("[tRPC Error] Stack:", error.stack);
			console.error("[tRPC Error] Cause:", error.cause);

			// In production, sanitize the error message
			if (
				process.env.NODE_ENV === "production" &&
				error.code === "INTERNAL_SERVER_ERROR"
			) {
				error.message = "An internal error occurred";
			}
		},
	});
}
export { handler as GET, handler as POST };
