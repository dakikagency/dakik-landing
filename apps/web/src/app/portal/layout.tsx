"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const navItems: {
	href: Route;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}[] = [
	{ href: "/portal", label: "Dashboard", icon: DashboardIcon },
	{ href: "/portal/projects", label: "Projects", icon: ProjectsIcon },
	{ href: "/portal/contracts", label: "Contracts", icon: ContractsIcon },
	{ href: "/portal/invoices" as Route, label: "Invoices", icon: InvoicesIcon },
	{ href: "/portal/meetings", label: "Meetings", icon: MeetingsIcon },
	{ href: "/portal/qanda", label: "Q&A", icon: QandAIcon },
];

function DashboardIcon({ className }: { className?: string }) {
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
				d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function InvoicesIcon({ className }: { className?: string }) {
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
				d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function ProjectsIcon({ className }: { className?: string }) {
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
				d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function ContractsIcon({ className }: { className?: string }) {
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
				d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function MeetingsIcon({ className }: { className?: string }) {
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
				d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function QandAIcon({ className }: { className?: string }) {
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
				d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function MenuIcon({ className }: { className?: string }) {
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
				d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function CloseIcon({ className }: { className?: string }) {
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
				d="M6 18L18 6M6 6l12 12"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function LogOutIcon({ className }: { className?: string }) {
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
				d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export default function PortalLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const { data: session, isPending } = authClient.useSession();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	useEffect(() => {
		if (!(isPending || session)) {
			router.push("/login");
		}
	}, [isPending, session, router]);

	useEffect(() => {
		setSidebarOpen(false);
	}, []);

	if (isPending) {
		return (
			<div className="flex h-svh items-center justify-center">
				<Skeleton className="h-8 w-32" />
			</div>
		);
	}

	if (!session) {
		return null;
	}

	const handleSignOut = () => {
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/");
				},
			},
		});
	};

	return (
		<div className="flex h-svh bg-admin-sidebar-background">
			{/* Mobile sidebar overlay */}
			{sidebarOpen && (
				<div
					aria-hidden="true"
					className="fixed inset-0 z-40 bg-black/50 lg:hidden"
					onClick={() => setSidebarOpen(false)}
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							setSidebarOpen(false);
						}
					}}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-transparent transition-transform duration-300 lg:static lg:translate-x-0",
					sidebarOpen ? "translate-x-0" : "-translate-x-full"
				)}
			>
				{/* Sidebar Header */}
				<div className="flex h-16 items-center justify-between border-sidebar-border border-b px-4">
					<Link className="flex items-center gap-2" href="/portal">
						<span className="font-medium text-sidebar-foreground text-sm">
							Customer Portal
						</span>
					</Link>
					<Button
						className="lg:hidden"
						onClick={() => setSidebarOpen(false)}
						size="icon-sm"
						variant="ghost"
					>
						<CloseIcon className="size-5" />
						<span className="sr-only">Close sidebar</span>
					</Button>
				</div>

				{/* User Info */}
				<div className="border-sidebar-border border-b px-4 py-4">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-full bg-sidebar-accent">
							<span className="font-medium text-sidebar-accent-foreground text-sm">
								{session.user.name?.[0]?.toUpperCase() ?? "U"}
							</span>
						</div>
						<div className="flex-1 overflow-hidden">
							<p className="truncate font-medium text-sidebar-foreground text-sm">
								{session.user.name}
							</p>
							<p className="truncate text-muted-foreground text-xs">
								{session.user.email}
							</p>
						</div>
					</div>
				</div>

				{/* Navigation */}
				<nav className="flex-1 overflow-y-auto p-4">
					<ul className="space-y-1">
						{navItems.map((item) => {
							const isActive =
								pathname === item.href ||
								(item.href !== "/portal" && pathname.startsWith(item.href));
							return (
								<li key={item.href}>
									<Link
										className={cn(
											"flex items-center gap-3 rounded-none px-3 py-2 text-sm transition-colors",
											isActive
												? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
												: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
										)}
										href={item.href}
									>
										<item.icon className="size-5" />
										{item.label}
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>

				{/* Sidebar Footer */}
				<div className="border-sidebar-border border-t p-4">
					<Button
						className="w-full justify-start gap-3"
						onClick={handleSignOut}
						variant="ghost"
					>
						<LogOutIcon className="size-5" />
						Sign Out
					</Button>
				</div>
			</aside>

			{/* Main Content */}
			<div className="flex min-h-screen flex-1 flex-col overflow-hidden p-2">
				{/* Mobile Header */}
				<header className="flex h-16 items-center gap-4 border-border border-b px-4 lg:hidden">
					<Button
						onClick={() => setSidebarOpen(true)}
						size="icon-sm"
						variant="ghost"
					>
						<MenuIcon className="size-5" />
						<span className="sr-only">Open sidebar</span>
					</Button>
					<span className="font-medium text-sm">Customer Portal</span>
				</header>

				{/* Page Content */}
				<main className="flex-1 overflow-y-auto rounded-2xl border border-black/10 bg-white shadow-lg">
					{children}
				</main>
			</div>
		</div>
	);
}
