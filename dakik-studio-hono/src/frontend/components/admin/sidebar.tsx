import {
	CalendarIcon,
	ClipboardListIcon,
	DollarSignIcon,
	LayoutDashboardIcon,
	LogOutIcon,
	UsersIcon,
	XIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

interface SidebarProps {
	isMobileOpen: boolean;
	onClose: () => void;
	onLogout: () => void;
}

const navItems = [
	{ href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
	{ href: "/admin/leads", label: "Leads", icon: ClipboardListIcon },
	{ href: "/admin/customers", label: "Customers", icon: UsersIcon },
	{ href: "/admin/projects", label: "Projects", icon: ClipboardListIcon },
	{ href: "/admin/invoices", label: "Invoices", icon: DollarSignIcon },
	{ href: "/admin/meetings", label: "Meetings", icon: CalendarIcon },
];

export function Sidebar({ isMobileOpen, onClose, onLogout }: SidebarProps) {
	const location = useLocation();

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
					"fixed top-0 left-0 z-50 flex h-screen w-56 flex-col bg-black text-white transition-transform duration-200 lg:static lg:translate-x-0",
					isMobileOpen ? "translate-x-0" : "-translate-x-full"
				)}
			>
				{/* Header */}
				<div className="flex h-14 items-center justify-between border-white/10 border-b px-4">
					<Link className="font-semibold text-sm tracking-tight" to="/admin">
						Dakik Admin
					</Link>
					<button className="lg:hidden" onClick={onClose} type="button">
						<XIcon className="size-4" />
						<span className="sr-only">Close sidebar</span>
					</button>
				</div>

				{/* Navigation */}
				<nav className="flex-1 space-y-1 p-3">
					{navItems.map((item) => {
						const isActive =
							item.href === "/admin"
								? location.pathname === "/admin"
								: location.pathname.startsWith(item.href);
						const Icon = item.icon;

						return (
							<Link
								className={cn(
									"flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
									isActive
										? "bg-white text-black"
										: "text-white/70 hover:bg-white/10 hover:text-white"
								)}
								key={item.href}
								onClick={onClose}
								to={item.href}
							>
								<Icon className="size-5" />
								{item.label}
							</Link>
						);
					})}
				</nav>

				{/* Footer */}
				<div className="flex flex-col gap-2 border-white/10 border-t p-4">
					<Link className="text-white/60 text-xs hover:text-white" to="/">
						Back to site
					</Link>
					<button
						className="flex items-center gap-2 text-white/60 text-xs hover:text-white"
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
