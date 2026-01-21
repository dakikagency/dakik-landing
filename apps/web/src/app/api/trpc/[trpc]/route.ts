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
		onError:
			process.env.NODE_ENV === "production"
				? ({ error }) => {
						// Log error server-side but sanitize for client
						console.error("tRPC error:", error.message);
						// Don't expose internal error details to client
						if (error.code === "INTERNAL_SERVER_ERROR") {
							error.message = "An internal error occurred";
						}
					}
				: undefined,
	});
}
export { handler as GET, handler as POST };
