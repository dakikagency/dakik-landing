import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { authClient, getSession, type Session } from "../lib/auth-client";

interface SessionContextValue {
	session: Session | null;
	user: Session["user"] | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	isExpired: boolean;
	error: string | null;
	signOut: () => Promise<void>;
	refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const SESSION_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const SESSION_EXPIRY_CHECK_INTERVAL = 30 * 1000; // 30 seconds

interface SessionProviderProps {
	children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
		null,
	);
	const expiryCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);

	/**
	 * Refresh the session from the server.
	 * Surfaces failures via `error` rather than silently treating an outage
	 * as "logged out".
	 */
	const refreshSession = useCallback(async () => {
		try {
			const newSession = await getSession();
			setSession(newSession);
			setError(null);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Unable to verify your session",
			);
			throw err;
		}
	}, []);

	/**
	 * Check if session is expired
	 */
	const isSessionExpired = useCallback((s: Session | null): boolean => {
		if (!s) return true;
		const expiresAt = new Date(s.session.expiresAt);
		return expiresAt <= new Date();
	}, []);

	/**
	 * Sign out the current user
	 */
	const signOut = useCallback(async () => {
		try {
			await authClient.signOut();
		} finally {
			setSession(null);
		}
	}, []);

	/**
	 * Initialize session on mount
	 */
	useEffect(() => {
		const initSession = async () => {
			setIsLoading(true);
			try {
				const initialSession = await getSession();
				setSession(initialSession);
				setError(null);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Unable to verify your session",
				);
			} finally {
				setIsLoading(false);
			}
		};

		initSession();

		refreshIntervalRef.current = setInterval(() => {
			refreshSession().catch(() => {
				// error already surfaced via state by refreshSession
			});
		}, SESSION_REFRESH_INTERVAL);

		// Set up expiry check interval
		expiryCheckRef.current = setInterval(() => {
			setSession((current) => {
				if (current && isSessionExpired(current)) {
					// Clear session if expired
					return null;
				}
				return current;
			});
		}, SESSION_EXPIRY_CHECK_INTERVAL);

		return () => {
			if (refreshIntervalRef.current) {
				clearInterval(refreshIntervalRef.current);
			}
			if (expiryCheckRef.current) {
				clearInterval(expiryCheckRef.current);
			}
		};
	}, [refreshSession, isSessionExpired]);

	// Listen for auth state changes
	useEffect(() => {
		const handleAuthChange = () => {
			refreshSession().catch(() => {
				// error already surfaced via state by refreshSession
			});
		};

		// better-auth emits events on sign in/out
		window.addEventListener("auth-change", handleAuthChange);

		return () => {
			window.removeEventListener("auth-change", handleAuthChange);
		};
	}, [refreshSession]);

	const value: SessionContextValue = {
		session,
		user: session?.user ?? null,
		isLoading,
		isAuthenticated: session !== null && !isSessionExpired(session),
		isExpired: session !== null && isSessionExpired(session),
		error,
		signOut,
		refreshSession,
	};

	return (
		<SessionContext.Provider value={value}>{children}</SessionContext.Provider>
	);
}

export function useSessionContext(): SessionContextValue {
	const context = useContext(SessionContext);
	if (!context) {
		throw new Error("useSessionContext must be used within a SessionProvider");
	}
	return context;
}
