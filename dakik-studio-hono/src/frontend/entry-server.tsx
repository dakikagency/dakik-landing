// MUST be first: defines MessageChannel before react-dom/server.edge inits.
import "./ssr-polyfill";
import {
	dehydrate,
	QueryClient,
	QueryClientProvider,
	type QueryKey,
} from "@tanstack/react-query";
import { createHead, renderSSRHead, UnheadProvider } from "@unhead/react/server";
import { renderToString } from "react-dom/server";
import {
	createStaticHandler,
	createStaticRouter,
	StaticRouterProvider,
} from "react-router-dom";
import { SessionProvider } from "./contexts/SessionContext";
import { createRoutes, type SubdomainKind } from "./router";

export interface RenderInput {
	/** Full request URL, e.g. `https://icons.dakik.co.uk/`. */
	url: string;
	subdomain: SubdomainKind;
	/** `[queryKey, data]` pairs prefetched by the worker, seeded into the cache. */
	prefetched: Array<[QueryKey, unknown]>;
}

export interface RenderResult {
	appHtml: string;
	headTags: string;
	dehydratedState: unknown;
}

/**
 * Render a route to HTML on the worker. Pure React — no Hono/Prisma here, so the
 * Vite SSR bundle stays self-contained. Data arrives pre-fetched and is seeded
 * into a fresh QueryClient (so `useQuery` hits the cache and renders synchronously,
 * no Suspense), then dehydrated for the client to hydrate without refetching.
 */
export async function render({
	url,
	subdomain,
	prefetched,
}: RenderInput): Promise<RenderResult> {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 },
		},
	});
	for (const [key, data] of prefetched) {
		queryClient.setQueryData(key, data);
	}

	const { query, dataRoutes } = createStaticHandler(createRoutes(subdomain));
	const context = await query(new Request(url));

	// A Response means a redirect / notFound during route matching — bail so the
	// worker falls back to the head-only shell rather than rendering an error.
	if (context instanceof Response) {
		throw new Error(`SSR routing returned a Response (${context.status})`);
	}

	const router = createStaticRouter(dataRoutes, context);
	const head = createHead();

	const appHtml = renderToString(
		<UnheadProvider value={head}>
			<QueryClientProvider client={queryClient}>
				<SessionProvider>
					{/* hydrate={false}: client uses createBrowserRouter (no RR
					    hydrationData), so suppress the hydration-data <script> to keep
					    server/client DOM identical. */}
					<StaticRouterProvider
						context={context}
						hydrate={false}
						router={router}
					/>
				</SessionProvider>
			</QueryClientProvider>
		</UnheadProvider>,
	);

	const { headTags } = await renderSSRHead(head);

	return { appHtml, headTags, dehydratedState: dehydrate(queryClient) };
}
