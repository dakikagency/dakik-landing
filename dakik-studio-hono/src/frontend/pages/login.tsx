import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Noise from "../components/noise";
import { signInWithEmail, signInWithGoogle } from "../lib/auth-client";

export function LoginPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [emailError, setEmailError] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [authError, setAuthError] = useState("");

	const redirectBasedOnRole = (role?: string) => {
		if (role === "admin" || role === "ADMIN") {
			navigate("/admin");
		} else {
			navigate("/portal");
		}
	};

	const handleGoogleSignIn = async () => {
		setAuthError("");
		setIsLoading(true);
		try {
			await signInWithGoogle();
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
			setEmailError("Enter a valid email address");
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
		if (value.length < 6) {
			setPasswordError("Password must be at least 6 characters");
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
		const result = await signInWithEmail(email, password);
		setIsLoading(false);

		if ("error" in result) {
			setAuthError(result.error);
			return;
		}
		redirectBasedOnRole(result.user.role);
	};

	return (
		<div className="relative min-h-screen bg-black text-white">
			<div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
				{/* Left column — typographic hero */}
				<section className="relative flex min-h-[40vh] flex-col justify-between overflow-hidden border-neutral-900 border-b px-[clamp(1.5rem,5vw,4rem)] py-[clamp(2rem,6vh,4rem)] lg:min-h-screen lg:border-r lg:border-b-0">
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, ease: [0.25, 0.25, 0.25, 0.75] }}
						className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
					>
						<span className="font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
							// Access
						</span>
						<span className="hidden h-px w-12 bg-white/20 sm:block" />
						<span className="text-sm text-white/55">Dakik Studio workspace</span>
					</motion.div>

					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							duration: 0.5,
							delay: 0.1,
							ease: [0.25, 0.25, 0.25, 0.75],
						}}
						className="my-8 font-black text-[clamp(3.5rem,12vw,9rem)] uppercase leading-[0.85] tracking-[-0.04em] lg:my-0 lg:leading-[0.8em]"
					>
						<span className="block">Log</span>
						<span className="block">In.</span>
					</motion.h1>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							duration: 0.5,
							delay: 0.25,
							ease: [0.25, 0.25, 0.25, 0.75],
						}}
						className="flex flex-col gap-4"
					>
						<p className="max-w-[36ch] text-base text-white/70 leading-snug sm:text-lg">
							Return to your projects, invoices, and meetings. No fluff, just
							work.
						</p>
						<div className="flex items-center gap-3">
							<span className="font-mono text-[10px] text-white/45 uppercase tracking-[0.35em]">
								// Est 2024
							</span>
							<span className="h-px flex-1 bg-white/10" />
							<a
								className="font-mono text-[10px] text-white/45 uppercase tracking-[0.35em] transition-colors hover:text-white"
								href="/"
							>
								← Back to site
							</a>
						</div>
					</motion.div>

					<Noise patternAlpha={20} patternRefreshInterval={3} />
				</section>

				{/* Right column — form */}
				<section className="flex flex-col justify-center px-[clamp(1.5rem,5vw,4rem)] py-[clamp(2rem,6vh,5rem)]">
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							duration: 0.5,
							delay: 0.2,
							ease: [0.25, 0.25, 0.25, 0.75],
						}}
						className="mx-auto w-full max-w-md"
					>
						<div className="mb-8 flex items-center gap-3">
							<span className="font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
								// Sign in
							</span>
							<span className="h-px flex-1 bg-white/10" />
						</div>

						<button
							className="flex w-full items-center justify-center gap-3 border-2 border-white bg-white px-4 py-3 font-medium text-black uppercase tracking-wider transition-colors duration-300 hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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
							<span className="text-sm">Continue with Google</span>
						</button>

						<div className="relative my-8">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-white/10 border-t" />
							</div>
							<div className="relative flex justify-center">
								<span className="bg-black px-4 font-mono text-[10px] text-white/45 uppercase tracking-[0.35em]">
									// Or with email
								</span>
							</div>
						</div>

						<form className="space-y-5" onSubmit={handleSubmit}>
							<div>
								<label
									className="mb-2 block font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]"
									htmlFor="email"
								>
									// Email
								</label>
								<input
									autoComplete="email"
									className={`block w-full border bg-transparent px-4 py-3 text-white placeholder-white/30 transition-colors focus:border-primary focus:outline-none ${
										emailError ? "border-red-500" : "border-white/20"
									}`}
									id="email"
									name="email"
									placeholder="you@domain.com"
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
									<p className="mt-2 font-mono text-[10px] text-red-500 uppercase tracking-[0.2em]">
										{emailError}
									</p>
								)}
							</div>

							<div>
								<label
									className="mb-2 block font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]"
									htmlFor="password"
								>
									// Password
								</label>
								<input
									autoComplete="current-password"
									className={`block w-full border bg-transparent px-4 py-3 text-white placeholder-white/30 transition-colors focus:border-primary focus:outline-none ${
										passwordError ? "border-red-500" : "border-white/20"
									}`}
									id="password"
									name="password"
									placeholder="••••••••"
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
									<p className="mt-2 font-mono text-[10px] text-red-500 uppercase tracking-[0.2em]">
										{passwordError}
									</p>
								)}
							</div>

							<button
								className="group flex w-full items-center justify-center border-4 border-white bg-black px-6 py-4 font-medium text-white uppercase tracking-wider transition-colors duration-300 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50 lg:border-8"
								type="submit"
								disabled={isLoading}
							>
								<span className="text-sm">
									{isLoading ? "Working…" : "Sign in"}
								</span>
							</button>

							{authError && (
								<p className="text-center font-mono text-[10px] text-red-500 uppercase tracking-[0.2em]">
									{authError}
								</p>
							)}
						</form>

						<p className="mt-8 text-center font-mono text-[10px] text-white/45 uppercase tracking-[0.35em]">
							// New here?{" "}
							<a
								className="text-white/70 transition-colors hover:text-white"
								href="/survey"
							>
								Start a project →
							</a>
						</p>
					</motion.div>
				</section>
			</div>
		</div>
	);
}
