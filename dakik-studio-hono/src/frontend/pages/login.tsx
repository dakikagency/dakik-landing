import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
	signInWithEmail,
	signUpWithEmail,
	signInWithGoogle,
} from "../lib/auth-client";

export function LoginPage() {
	const navigate = useNavigate();
	const [isSignUp, setIsSignUp] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [emailError, setEmailError] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [authError, setAuthError] = useState("");

	/**
	 * Redirect user based on their role
	 */
	const redirectBasedOnRole = (role?: string) => {
		if (role === "admin") {
			navigate("/admin");
		} else {
			navigate("/portal");
		}
	};

	/**
	 * Handle Google OAuth sign in
	 */
	const handleGoogleSignIn = async () => {
		setAuthError("");
		setIsLoading(true);
		try {
			await signInWithGoogle();
			// Note: OAuth redirect happens automatically, so we don't need to redirect here
		} catch {
			setAuthError("Google sign in failed. Please try again.");
			setIsLoading(false);
		}
	};

	const validateEmail = (value: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!value) {
			setEmailError("Email is required");
			return false;
		}
		if (!emailRegex.test(value)) {
			setEmailError("Please enter a valid email address");
			return false;
		}
		setEmailError("");
		return true;
	};

	const validatePassword = (value: string): boolean => {
		if (!value) {
			setPasswordError("Password is required");
			return false;
		}
		const minLength = isSignUp ? 8 : 6;
		if (value.length < minLength) {
			setPasswordError(
				isSignUp
					? "Password must be at least 8 characters"
					: "Password must be at least 6 characters"
			);
			return false;
		}
		setPasswordError("");
		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const isEmailValid = validateEmail(email);
		const isPasswordValid = validatePassword(password);

		if (!isEmailValid || !isPasswordValid) return;

		setIsLoading(true);
		setAuthError("");

		const authFn = isSignUp ? signUpWithEmail : signInWithEmail;
		const result = await authFn(email, password);

		setIsLoading(false);

		if ("error" in result) {
			setAuthError(result.error);
			return;
		}

		redirectBasedOnRole(result.user.role);
	};

	const toggleMode = () => {
		setIsSignUp(!isSignUp);
		setEmailError("");
		setPasswordError("");
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-black text-white">
			<div className="w-full max-w-md space-y-8 rounded-2xl border border-neutral-800 bg-neutral-950 p-8 shadow-2xl">
				<AnimatePresence mode="wait">
					<motion.div
						key={isSignUp ? "signup" : "signin"}
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						transition={{ duration: 0.2 }}
					>
						<div className="text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary">
								<svg
									className="h-8 w-8 text-white"
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
									viewBox="0 0 24 24"
								>
									<title>Dakik Studio logo</title>
									<path
										d="M13 10V3L4 14h7v7l9-11h-7z"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
							<h1 className="font-bold text-2xl">Dakik Studio</h1>
							<p className="mt-2 text-neutral-400">
								{isSignUp ? "Create your account" : "Welcome back"}
							</p>
						</div>
					</motion.div>
				</AnimatePresence>

				<button
					className="flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-700 bg-white px-4 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
					onClick={handleGoogleSignIn}
					disabled={isLoading}
					type="button"
				>
					<svg
						aria-labelledby="google-title"
						className="h-5 w-5"
						role="img"
						viewBox="0 0 24 24"
					>
						<title id="google-title">Google</title>
						<path
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							fill="#4285F4"
						/>
						<path
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							fill="#34A853"
						/>
						<path
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							fill="#FBBC05"
						/>
						<path
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							fill="#EA4335"
						/>
					</svg>
					Continue with Google
				</button>

				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-neutral-800 border-t" />
					</div>
					<div className="relative flex justify-center text-sm">
						<span className="bg-neutral-950 px-4 text-neutral-500">
							or continue with email
						</span>
					</div>
				</div>

				<form className="space-y-4" onSubmit={handleSubmit}>
					<div>
						<label
							className="block font-medium text-neutral-300 text-sm"
							htmlFor="email"
						>
							Email
						</label>
						<input
							autoComplete="email"
							className={`mt-1 block w-full rounded-lg border ${
								emailError ? "border-red-500" : "border-neutral-700"
							} bg-neutral-900 px-4 py-3 text-white placeholder-neutral-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
							id="email"
							name="email"
							placeholder="you@example.com"
							required
							type="email"
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								if (emailError) validateEmail(e.target.value);
							}}
							onBlur={() => validateEmail(email)}
						/>
						{emailError && (
							<p className="mt-1 text-sm text-red-500">{emailError}</p>
						)}
					</div>

					<div>
						<label
							className="block font-medium text-neutral-300 text-sm"
							htmlFor="password"
						>
							Password
						</label>
						<input
							autoComplete={isSignUp ? "new-password" : "current-password"}
							className={`mt-1 block w-full rounded-lg border ${
								passwordError ? "border-red-500" : "border-neutral-700"
							} bg-neutral-900 px-4 py-3 text-white placeholder-neutral-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
							id="password"
							name="password"
							placeholder={
								isSignUp ? "Create a password" : "Enter your password"
							}
							required
							type="password"
							value={password}
							onChange={(e) => {
								setPassword(e.target.value);
								if (passwordError) validatePassword(e.target.value);
							}}
							onBlur={() => validatePassword(password)}
						/>
						{passwordError && (
							<p className="mt-1 text-sm text-red-500">{passwordError}</p>
						)}
					</div>

					<button
						className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
						type="submit"
						disabled={isLoading}
					>
						{isLoading && (
							<svg
								className="h-5 w-5 animate-spin"
								fill="none"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<title>Loading</title>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
						)}
						{isLoading ? "Please wait..." : isSignUp ? "Sign up" : "Sign in"}
					</button>

					{authError && (
						<p className="text-center text-sm text-red-500">{authError}</p>
					)}
				</form>

				<AnimatePresence mode="wait">
					<motion.p
						key={isSignUp ? "signup-link" : "signin-link"}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="text-center text-neutral-400 text-sm"
					>
						{isSignUp ? (
							<>
								Already have an account?{" "}
								<button
									className="cursor-pointer text-primary hover:underline"
									onClick={toggleMode}
									type="button"
								>
									Sign in
								</button>
							</>
						) : (
							<>
								Don&apos;t have an account?{" "}
								<button
									className="cursor-pointer text-primary hover:underline"
									onClick={toggleMode}
									type="button"
								>
									Sign up
								</button>
							</>
						)}
					</motion.p>
				</AnimatePresence>
			</div>
		</div>
	);
}
