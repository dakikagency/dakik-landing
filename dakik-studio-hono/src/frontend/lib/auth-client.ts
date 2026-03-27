import { createAuthClient } from "better-auth/react";

const BETTER_AUTH_URL = import.meta.env.VITE_BETTER_AUTH_URL || "";
const API_BASE = "/api";

/**
 * Auth client for frontend session management.
 * Provides login, logout, session, and user management functions.
 *
 * Environment variables required:
 * - VITE_BETTER_AUTH_URL: The base URL of the better-auth server
 *
 * Google OAuth credentials are configured server-side via:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 */
export const authClient = createAuthClient({
	baseURL: BETTER_AUTH_URL,
	apiBaseURL: API_BASE,
});

/**
 * Session type for authenticated users
 */
export interface Session {
	user: {
		id: string;
		email: string;
		name?: string;
		image?: string;
		role?: string;
	};
	session: {
		id: string;
		expiresAt: string;
	};
}

/**
 * Get the current session.
 * Returns null if not authenticated.
 */
export async function getSession(): Promise<Session | null> {
	try {
		const session = await authClient.getSession();
		return session;
	} catch {
		return null;
	}
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
	const session = await getSession();
	return session !== null && new Date(session.session.expiresAt) > new Date();
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
	email: string,
	password: string,
): Promise<{ user: Session["user"] } | { error: string }> {
	try {
		const result = await authClient.signIn.emailPassword(email, password);
		return result;
	} catch (err) {
		return { error: err instanceof Error ? err.message : "Sign in failed" };
	}
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
	email: string,
	password: string,
	name?: string,
): Promise<{ user: Session["user"] } | { error: string }> {
	try {
		const result = await authClient.signUp.emailPassword(email, password, {
			name,
		});
		return result;
	} catch (err) {
		return { error: err instanceof Error ? err.message : "Sign up failed" };
	}
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<void> {
	await authClient.signIn.socialOAuth({
		provider: "google",
		callbackURL: "/portal",
	});
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
	await authClient.signOut();
}

/**
 * Get the current user
 */
export async function getUser(): Promise<Session["user"] | null> {
	const session = await getSession();
	return session?.user ?? null;
}

// Re-export authClient for direct access to better-auth methods
export { authClient };
