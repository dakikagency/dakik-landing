"use client";

import { useForm } from "@tanstack/react-form";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup";

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.2,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
	},
};

const formVariants = {
	enter: { opacity: 0, x: 20 },
	center: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: -20 },
};

function getRedirectPath(role: string | undefined): Route {
	switch (role) {
		case "ADMIN":
			return "/admin";
		case "CUSTOMER":
			return "/portal";
		default:
			return "/portal-access-denied";
	}
}

function GoogleIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-label="Google"
			className={className}
			role="img"
			viewBox="0 0 24 24"
		>
			<title>Google</title>
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
	);
}

function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
	const router = useRouter();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			const result = await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: async () => {
						const session = await authClient.getSession();
						const role = (session.data?.user as { role?: string })?.role;
						const redirectPath = getRedirectPath(role);
						toast.success("Sign in successful");
						router.push(redirectPath);
					},
					onError: (error: {
						error: { message?: string; statusText?: string };
					}) => {
						toast.error(error.error.message ?? error.error.statusText);
					},
				}
			);
			return result;
		},
		validators: {
			onSubmit: z.object({
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	const handleGoogleSignIn = async () => {
		try {
			const result = await authClient.signIn.social({
				provider: "google",
				callbackURL: "/auth/callback",
			});

			// If we get here without redirect, something went wrong
			if (result.error) {
				toast.error(result.error.message ?? "Failed to sign in with Google");
			}
		} catch (error) {
			console.error("Google sign-in error:", error);
			toast.error("Failed to initiate Google sign-in");
		}
	};

	return (
		<motion.div
			animate="center"
			className="w-full"
			exit="exit"
			initial="enter"
			key="signin"
			transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
			variants={formVariants}
		>
			<motion.h1
				className="mb-2 text-center font-bold font-display text-2xl tracking-tight"
				variants={itemVariants}
			>
				Welcome Back
			</motion.h1>
			<motion.p
				className="mb-8 text-center text-muted-foreground text-sm"
				variants={itemVariants}
			>
				Sign in to access your dashboard
			</motion.p>

			<motion.div variants={itemVariants}>
				<Button
					className="w-full gap-3 border-border"
					onClick={handleGoogleSignIn}
					type="button"
					variant="outline"
				>
					<GoogleIcon className="size-4" />
					Continue with Google
				</Button>
			</motion.div>

			<motion.div
				className="my-6 flex items-center gap-4"
				variants={itemVariants}
			>
				<div className="h-px flex-1 bg-border" />
				<span className="text-muted-foreground text-xs">or</span>
				<div className="h-px flex-1 bg-border" />
			</motion.div>

			<form
				className="space-y-4"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<motion.div variants={itemVariants}>
					<form.Field name="email">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Email</Label>
								<Input
									id={field.name}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="you@example.com"
									type="email"
									value={field.state.value}
								/>
								{field.state.meta.errors.map((error) => (
									<p className="text-destructive text-xs" key={error?.message}>
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</motion.div>

				<motion.div variants={itemVariants}>
					<form.Field name="password">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Password</Label>
								<Input
									id={field.name}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Enter your password"
									type="password"
									value={field.state.value}
								/>
								{field.state.meta.errors.map((error) => (
									<p className="text-destructive text-xs" key={error?.message}>
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</motion.div>

				<motion.div variants={itemVariants}>
					<form.Subscribe>
						{(state) => (
							<Button
								className="w-full"
								disabled={!state.canSubmit || state.isSubmitting}
								type="submit"
							>
								{state.isSubmitting ? (
									<>
										<Loader2 className="mr-2 size-4 animate-spin" />
										Signing in...
									</>
								) : (
									"Sign In"
								)}
							</Button>
						)}
					</form.Subscribe>
				</motion.div>
			</form>

			<motion.div className="mt-6 text-center" variants={itemVariants}>
				<span className="text-muted-foreground text-sm">
					Don't have an account?{" "}
				</span>
				<button
					className="font-medium text-foreground text-sm underline-offset-4 hover:underline"
					onClick={onSwitchToSignUp}
					type="button"
				>
					Sign up
				</button>
			</motion.div>
		</motion.div>
	);
}

function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
	const router = useRouter();

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			const result = await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
				},
				{
					onSuccess: async () => {
						const session = await authClient.getSession();
						const role = (session.data?.user as { role?: string })?.role;
						const redirectPath = getRedirectPath(role);
						toast.success("Account created successfully");
						router.push(redirectPath);
					},
					onError: (error: {
						error: { message?: string; statusText?: string };
					}) => {
						toast.error(error.error.message ?? error.error.statusText);
					},
				}
			);
			return result;
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Name must be at least 2 characters"),
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	const handleGoogleSignUp = async () => {
		try {
			const result = await authClient.signIn.social({
				provider: "google",
				callbackURL: "/auth/callback",
			});

			if (result.error) {
				toast.error(result.error.message ?? "Failed to sign in with Google");
			}
		} catch (error) {
			console.error("Google sign-up error:", error);
			toast.error("Failed to initiate Google sign-in");
		}
	};

	return (
		<motion.div
			animate="center"
			className="w-full"
			exit="exit"
			initial="enter"
			key="signup"
			transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
			variants={formVariants}
		>
			<motion.h1
				className="mb-2 text-center font-bold font-display text-2xl tracking-tight"
				variants={itemVariants}
			>
				Create Account
			</motion.h1>
			<motion.p
				className="mb-8 text-center text-muted-foreground text-sm"
				variants={itemVariants}
			>
				Get started with your new account
			</motion.p>

			<motion.div variants={itemVariants}>
				<Button
					className="w-full gap-3 border-border"
					onClick={handleGoogleSignUp}
					type="button"
					variant="outline"
				>
					<GoogleIcon className="size-4" />
					Continue with Google
				</Button>
			</motion.div>

			<motion.div
				className="my-6 flex items-center gap-4"
				variants={itemVariants}
			>
				<div className="h-px flex-1 bg-border" />
				<span className="text-muted-foreground text-xs">or</span>
				<div className="h-px flex-1 bg-border" />
			</motion.div>

			<form
				className="space-y-4"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<motion.div variants={itemVariants}>
					<form.Field name="name">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Name</Label>
								<Input
									id={field.name}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Your name"
									value={field.state.value}
								/>
								{field.state.meta.errors.map((error) => (
									<p className="text-destructive text-xs" key={error?.message}>
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</motion.div>

				<motion.div variants={itemVariants}>
					<form.Field name="email">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Email</Label>
								<Input
									id={field.name}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="you@example.com"
									type="email"
									value={field.state.value}
								/>
								{field.state.meta.errors.map((error) => (
									<p className="text-destructive text-xs" key={error?.message}>
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</motion.div>

				<motion.div variants={itemVariants}>
					<form.Field name="password">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Password</Label>
								<Input
									id={field.name}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Create a password"
									type="password"
									value={field.state.value}
								/>
								{field.state.meta.errors.map((error) => (
									<p className="text-destructive text-xs" key={error?.message}>
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</motion.div>

				<motion.div variants={itemVariants}>
					<form.Subscribe>
						{(state) => (
							<Button
								className="w-full"
								disabled={!state.canSubmit || state.isSubmitting}
								type="submit"
							>
								{state.isSubmitting ? (
									<>
										<Loader2 className="mr-2 size-4 animate-spin" />
										Creating account...
									</>
								) : (
									"Create Account"
								)}
							</Button>
						)}
					</form.Subscribe>
				</motion.div>
			</form>

			<motion.div className="mt-6 text-center" variants={itemVariants}>
				<span className="text-muted-foreground text-sm">
					Already have an account?{" "}
				</span>
				<button
					className="font-medium text-foreground text-sm underline-offset-4 hover:underline"
					onClick={onSwitchToSignIn}
					type="button"
				>
					Sign in
				</button>
			</motion.div>
		</motion.div>
	);
}

export default function LoginPage() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const [mode, setMode] = useState<AuthMode>("signin");

	useEffect(() => {
		if (session?.user) {
			const role = (session.user as { role?: string }).role;
			const redirectPath = getRedirectPath(role);
			router.push(redirectPath);
		}
	}, [session, router]);

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<Loader2 className="size-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (session?.user) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<Loader2 className="size-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<motion.main
				animate="visible"
				className="flex flex-1 flex-col items-center justify-center px-4 py-12"
				initial="hidden"
				variants={containerVariants}
			>
				<motion.div className="w-full max-w-sm" variants={itemVariants}>
					{/* Logo */}
					<motion.div className="mb-8 text-center" variants={itemVariants}>
						<Link
							className="inline-block font-bold font-display text-2xl tracking-tight transition-opacity hover:opacity-70"
							href="/"
						>
							Dakik Studio
						</Link>
					</motion.div>

					{/* Form Container */}
					<motion.div
						className={cn(
							"rounded-lg border border-border bg-card p-8",
							"shadow-sm"
						)}
						variants={itemVariants}
					>
						<AnimatePresence initial={false} mode="wait">
							{mode === "signin" ? (
								<SignInForm
									key="signin"
									onSwitchToSignUp={() => setMode("signup")}
								/>
							) : (
								<SignUpForm
									key="signup"
									onSwitchToSignIn={() => setMode("signin")}
								/>
							)}
						</AnimatePresence>
					</motion.div>

					{/* Footer Link */}
					<motion.p
						className="mt-8 text-center text-muted-foreground text-xs"
						variants={itemVariants}
					>
						<Link className="hover:underline" href="/">
							Back to home
						</Link>
					</motion.p>
				</motion.div>
			</motion.main>
		</div>
	);
}
