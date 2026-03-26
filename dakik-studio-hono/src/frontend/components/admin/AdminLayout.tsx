import { MenuIcon } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function AdminLayout() {
	const [isMobileOpen, setIsMobileOpen] = useState(false);

	const handleLogout = () => {
		window.location.href = "/";
	};

	return (
		<div className="flex min-h-screen bg-black p-2">
			<Sidebar
				isMobileOpen={isMobileOpen}
				onClose={() => setIsMobileOpen(false)}
				onLogout={handleLogout}
			/>

			<div className="relative z-50 flex flex-1 flex-col rounded-2xl border border-white/10 bg-neutral-950 text-white shadow-lg">
				<header className="flex h-14 items-center gap-4 border-white/10 border-b px-4 lg:hidden">
					<button
						className=""
						onClick={() => setIsMobileOpen(true)}
						type="button"
					>
						<MenuIcon className="size-4" />
						<span className="sr-only">Open sidebar</span>
					</button>
					<span className="font-semibold text-sm tracking-tight">
						Dakik Admin
					</span>
				</header>

				<main className="flex-1 overflow-auto p-4 lg:p-6">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
