import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createHead, UnheadProvider } from "@unhead/react/client";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { SessionProvider } from "./contexts/SessionContext";
import { router } from "./router";

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

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<UnheadProvider head={head}>
			<QueryClientProvider client={queryClient}>
				<SessionProvider>
					<RouterProvider router={router} />
				</SessionProvider>
			</QueryClientProvider>
		</UnheadProvider>
	</StrictMode>,
);
