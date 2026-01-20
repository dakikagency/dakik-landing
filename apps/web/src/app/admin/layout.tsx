"use client";

import {
	BoxIcon,
	CalendarIcon,
	ClipboardListIcon,
	DollarSignIcon,
	FileTextIcon,
	HistoryIcon,
	ImageIcon,
	InboxIcon,
	LayoutDashboardIcon,
	LogOutIcon,
	MailIcon,
	MenuIcon,
	NewspaperIcon,
	ShapesIcon,
	UsersIcon,
	XIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const navItems: {
	href: Route;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}[] = [
	{ href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
	{ href: "/admin/audit" as Route, label: "Audit Logs", icon: HistoryIcon },
	{ href: "/admin/customers", label: "Customers", icon: UsersIcon },
	{ href: "/admin/leads", label: "Leads", icon: InboxIcon },
	{ href: "/admin/invoices" as Route, label: "Invoices", icon: DollarSignIcon },
	{ href: "/admin/contracts", label: "Contracts", icon: FileTextIcon },
	{ href: "/admin/meetings", label: "Meetings", icon: CalendarIcon },
	{ href: "/admin/email" as Route, label: "Email", icon: MailIcon },
	{
		href: "/admin/survey-options" as Route,
		label: "Survey Options",
		icon: ClipboardListIcon,
	},
	{ href: "/admin/blog", label: "Blog", icon: NewspaperIcon },
	{ href: "/admin/media", label: "Media", icon: ImageIcon },
	{ href: "/admin/daicons" as Route, label: "daIcons", icon: ShapesIcon },
	{ href: "/admin/dacomps" as Route, label: "daComps", icon: BoxIcon },
];

function Sidebar({
	isMobileOpen,
	onClose,
	onLogout,
}: {
	isMobileOpen: boolean;
	onClose: () => void;
	onLogout: () => void;
}) {
	const pathname = usePathname();

	return (
		<>
			{/* Mobile overlay */}
			{isMobileOpen && (
				<button
					aria-label="Close sidebar"
					className="fixed inset-0 z-40 cursor-default bg-black/50 lg:hidden"
					onClick={onClose}
					type="button"
				/>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed top-0 left-0 z-50 flex h-shv w-56 flex-col bg-admin-sidebar-background text-admin-sidebar-foreground transition-transform duration-200 lg:static lg:translate-x-0",
					isMobileOpen ? "translate-x-0" : "-translate-x-full"
				)}
			>
				{/* Header */}
				<div className="flex h-14 items-center justify-between border-b px-4">
					<Link
						className="font-display font-semibold text-sm tracking-tight"
						href="/admin"
					>
						Dakik Admin
					</Link>
					<Button
						className="lg:hidden"
						onClick={onClose}
						size="icon-sm"
						variant="ghost"
					>
						<XIcon className="size-4" />
						<span className="sr-only">Close sidebar</span>
					</Button>
				</div>

				{/* Navigation */}
				<nav className="flex-1 space-y-1 p-3">
					{navItems.map((item) => {
						const isActive =
							pathname === item.href ||
							(item.href !== "/admin" && pathname.startsWith(item.href));
						const Icon = item.icon;

						return (
							<Link
								className={cn(
									"flex items-center gap-3 rounded-full px-3 py-2 text-xs transition-colors",
									isActive
										? "bg-admin-sidebar-foreground text-admin-sidebar-background"
										: "bg-transparent text-admin-sidebar-foreground hover:text-admin-sidebar-foreground/80"
								)}
								href={item.href}
								key={item.href}
								onClick={onClose}
							>
								<Icon className="size-5" />
								{item.label}
							</Link>
						);
					})}
				</nav>

				{/* Footer */}
				<div className="flex flex-col gap-2 border-t p-4">
					<Link
						className="text-muted-foreground text-xs hover:text-foreground"
						href="/"
					>
						Back to site
					</Link>
					<button
						className="flex items-center gap-2 text-muted-foreground text-xs hover:text-foreground"
						onClick={onLogout}
						type="button"
					>
						<LogOutIcon className="size-3" />
						Logout
					</button>
				</div>
			</aside>
		</>
	);
}

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const [isMobileOpen, setIsMobileOpen] = useState(false);

	const handleLogout = () => {
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/");
				},
			},
		});
	};

	return (
		<div className="flex min-h-screen bg-admin-sidebar-background p-2">
			<Sidebar
				isMobileOpen={isMobileOpen}
				onClose={() => setIsMobileOpen(false)}
				onLogout={handleLogout}
			/>

			{/* Main content */}
			<div className="relative z-50 flex flex-1 flex-col rounded-2xl border border-black/10 bg-white shadow-lg">
				{/* Mobile header */}
				<header className="flex h-14 items-center gap-4 border-b px-4 lg:hidden">
					<Button
						onClick={() => setIsMobileOpen(true)}
						size="icon-sm"
						variant="ghost"
					>
						<MenuIcon className="size-4" />
						<span className="sr-only">Open sidebar</span>
					</Button>
					<span className="font-display font-semibold text-sm tracking-tight">
						Dakik Admin
					</span>
				</header>

				{/* Page content */}
				<main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
			</div>
		</div>
	);
}
