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
 * Returns null if the user is not authenticated.
 * Throws if the session endpoint is unreachable or returns an error — callers
 * should surface that to the UI rather than silently treating it as "logged out".
 */
export async function getSession(): Promise<Session | null> {
	const result = await authClient.getSession();
	if (result && "error" in result && result.error) {
		throw new Error(result.error.message ?? "Failed to fetch session");
	}
	return (result?.data as Session | null) ?? null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
	const session = await getSession();
	return session !== null && new Date(session.session.expiresAt) > new Date();
}

/**
 * Sign in with email and password.
 * Errors from the auth server are returned as `{ error }`; transport-level
 * failures throw so callers can decide how to surface them.
 */
export async function signInWithEmail(
	email: string,
	password: string,
): Promise<{ user: Session["user"] } | { error: string }> {
	const result = await authClient.signIn.email({ email, password });
	if (result.error) {
		return { error: result.error.message ?? "Sign in failed" };
	}
	const data = result.data as unknown as { user: Session["user"] };
	return { user: data.user };
}

/**
 * Sign up with email and password.
 */
export async function signUpWithEmail(
	email: string,
	password: string,
	name?: string,
): Promise<{ user: Session["user"] } | { error: string }> {
	const result = await authClient.signUp.email({
		email,
		password,
		name: name ?? email.split("@")[0],
	});
	if (result.error) {
		return { error: result.error.message ?? "Sign up failed" };
	}
	const data = result.data as unknown as { user: Session["user"] };
	return { user: data.user };
}

/**
 * Sign in with Google OAuth.
 */
export async function signInWithGoogle(): Promise<void> {
	const result = await authClient.signIn.social({
		provider: "google",
		callbackURL: "/auth/callback",
	});
	if (result.error) {
		throw new Error(result.error.message ?? "Google sign in failed");
	}
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

