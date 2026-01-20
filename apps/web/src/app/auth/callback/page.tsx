"use client";

import { Loader2 } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { authClient } from "@/lib/auth-client";

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

export default function AuthCallbackPage() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (!isPending) {
			if (session?.user) {
				const role = (session.user as { role?: string }).role;
				const redirectPath = getRedirectPath(role);
				router.replace(redirectPath);
			} else {
				router.replace("/login");
			}
		}
	}, [session, isPending, router]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="flex flex-col items-center gap-4">
				<Loader2 className="size-8 animate-spin text-muted-foreground" />
				<p className="text-muted-foreground text-sm">Redirecting...</p>
			</div>
		</div>
	);
}
