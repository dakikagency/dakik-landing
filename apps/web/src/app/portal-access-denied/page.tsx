"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

function ShieldIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export default function PortalAccessDeniedPage() {
	const { data: session } = authClient.useSession();

	const handleSignOut = () => {
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.href = "/";
				},
			},
		});
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
			<div className="w-full max-w-md text-center">
				<div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-muted">
					<ShieldIcon className="size-8 text-muted-foreground" />
				</div>

				<h1 className="mb-2 font-bold font-display text-2xl tracking-tight">
					Access Restricted
				</h1>

				<p className="mb-6 text-muted-foreground">
					The customer portal is only available to users who have submitted a
					project inquiry through our survey form.
				</p>

				{session?.user && (
					<p className="mb-6 text-muted-foreground text-sm">
						Signed in as{" "}
						<span className="font-medium text-foreground">
							{session.user.email}
						</span>
					</p>
				)}

				<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
					<Link
						className="inline-flex h-10 items-center justify-center gap-2 bg-primary px-4 py-2 font-medium text-primary-foreground text-sm ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						href="/survey"
					>
						Submit a Project Inquiry
					</Link>
					<Link
						className="inline-flex h-10 items-center justify-center gap-2 border border-input bg-background px-4 py-2 font-medium text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						href="/"
					>
						Back to Home
					</Link>
				</div>

				{session?.user && (
					<div className="mt-6 border-border border-t pt-6">
						<p className="mb-3 text-muted-foreground text-sm">
							Wrong account? You can sign out and try a different one.
						</p>
						<Button onClick={handleSignOut} size="sm" variant="ghost">
							Sign Out
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
