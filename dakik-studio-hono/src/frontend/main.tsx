import "./index.css";
import {
	type DehydratedState,
	HydrationBoundary,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { createHead, UnheadProvider } from "@unhead/react/client";
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SessionProvider } from "./contexts/SessionContext";
import { createRoutes, detectSubdomain } from "./router";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60_000,
			refetchOnWindowFocus: false,
			retry: 1,
		},
	},
});

const head = createHead();

// React Query cache dehydrated by the worker's SSR path and embedded in the
// page. Absent on client-only / non-SSR routes (then HydrationBoundary is a
// no-op and queries fetch normally on mount).
const dehydratedState = (
	window as unknown as { __DAKIK_SSR__?: DehydratedState }
).__DAKIK_SSR__;

const router = createBrowserRouter(
	createRoutes(detectSubdomain(window.location.hostname)),
);

const app = (
	<StrictMode>
		<UnheadProvider head={head}>
			<QueryClientProvider client={queryClient}>
				<HydrationBoundary state={dehydratedState}>
					<SessionProvider>
						<RouterProvider router={router} />
					</SessionProvider>
				</HydrationBoundary>
			</QueryClientProvider>
		</UnheadProvider>
	</StrictMode>
);

const container = document.getElementById("root")!;

// SSR'd pages ship server-rendered markup inside #root → hydrate it.
// Client-only pages (apex landing, /about, …) ship an empty #root → fresh
// client render. Branching avoids React hydration warnings on empty roots.
if (container.firstElementChild) {
	hydrateRoot(container, app);
} else {
	createRoot(container).render(app);
}
