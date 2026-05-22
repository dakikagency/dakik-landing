import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSessionContext } from "../../contexts/SessionContext";

interface RequireAdminProps {
	children: ReactNode;
	/**
	 * Path to redirect non-admins (authenticated but wrong role) to.
	 * Defaults to /portal-access-denied so customers don't land on /login
	 * and re-loop.
	 */
	fallbackPath?: string;
}

/**
 * Gate for admin-only sections of the SPA.
 *
 * - While the session is loading, renders a neutral placeholder so the admin
 *   chrome doesn't flash for non-admins.
 * - Unauthenticated users go to /login with a returnTo query so they land
 *   back where they wanted after signing in.
 * - Authenticated users whose role is not ADMIN go to fallbackPath
 *   (default: /portal-access-denied).
 *
 * Security note: this is UX-level only. The backend requireAdmin middleware
 * is the source of truth — never rely on the frontend guard for protection.
 */
export function RequireAdmin({
	children,
	fallbackPath = "/portal-access-denied",
}: RequireAdminProps) {
	const { isLoading, isAuthenticated, user, error } = useSessionContext();
	const location = useLocation();

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-black">
				<div className="size-6 animate-pulse rounded-full bg-white/20" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-black px-6 text-center">
				<div className="max-w-md space-y-3 text-white/80">
					<h1 className="font-semibold text-xl">Session unavailable</h1>
					<p className="text-sm text-white/60">{error}</p>
					<p className="text-sm text-white/60">
						Reload the page or check your network and try again.
					</p>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		const returnTo = encodeURIComponent(location.pathname + location.search);
		return <Navigate replace to={`/login?returnTo=${returnTo}`} />;
	}

	if (user?.role !== "ADMIN") {
		return <Navigate replace to={fallbackPath} />;
	}

	return <>{children}</>;
}
