import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSession } from "../../hooks/useSession";
import { cn } from "../../lib/utils";

const navItems = [
	{ label: "Dashboard", href: "/portal", exact: true },
	{ label: "Projects", href: "/portal/projects" },
	{ label: "Invoices", href: "/portal/invoices" },
	{ label: "Meetings", href: "/portal/meetings" },
];

export function PortalLayout() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, signOut } = useSession();
	const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

	const displayName = user?.name || user?.email?.split("@")[0] || "Guest";
	const displayEmail = user?.email || "";
	const initial = (displayName || displayEmail).charAt(0).toUpperCase();

	const handleLogout = async () => {
		setIsUserMenuOpen(false);
		setIsMobileNavOpen(false);
		await signOut();
		navigate("/login");
	};

	const isActive = (href: string, exact?: boolean) =>
		exact ? location.pathname === href : location.pathname.startsWith(href);

	return (
		<div className="min-h-screen bg-black text-white">
			{/* Header */}
			<header className="sticky top-0 z-50 border-white/10 border-b bg-black/80 backdrop-blur-md">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-[clamp(1rem,4vw,2rem)]">
					{/* Logo */}
					<Link className="flex items-center gap-3" to="/portal">
						<div className="flex h-9 w-9 items-center justify-center border-2 border-white bg-black font-black text-lg text-white">
							D
						</div>
						<div className="hidden flex-col leading-none sm:flex">
							<span className="font-black text-sm uppercase tracking-[-0.02em]">
								Dakik
							</span>
							<span className="font-mono text-[9px] text-white/45 uppercase tracking-[0.35em]">
								// Portal
							</span>
						</div>
					</Link>

					{/* Desktop nav */}
					<nav className="hidden items-center gap-1 md:flex">
						{navItems.map((item) => {
							const active = isActive(item.href, item.exact);
							return (
								<NavLink
									className={cn(
										"px-4 py-2 font-mono text-[11px] uppercase tracking-[0.25em] transition-colors",
										active
											? "text-white"
											: "text-white/50 hover:text-white"
									)}
									key={item.href}
									to={item.href}
								>
									{active && <span className="mr-2 text-white">●</span>}
									{item.label}
								</NavLink>
							);
						})}
					</nav>

					{/* Right side: user menu (desktop) + hamburger (mobile) */}
					<div className="flex items-center gap-2">
						{/* User menu */}
						<div className="relative hidden md:block">
							<button
								className="flex items-center gap-3 px-2 py-1.5 transition-colors hover:bg-white/5"
								onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
								type="button"
							>
								<div className="text-right">
									<p className="font-medium text-sm leading-tight">
										{displayName}
									</p>
									<p className="font-mono text-[9px] text-white/40 uppercase tracking-[0.25em]">
										{displayEmail}
									</p>
								</div>
								<div className="flex h-9 w-9 items-center justify-center border-2 border-white/20 bg-black font-medium text-sm">
									{initial}
								</div>
							</button>

							{isUserMenuOpen && (
								<>
									<button
										aria-label="Close menu"
										className="fixed inset-0 z-40 cursor-default"
										onClick={() => setIsUserMenuOpen(false)}
										type="button"
									/>
									<div className="absolute right-0 z-50 mt-2 w-60 border border-white/10 bg-black py-2">
										<div className="border-white/10 border-b px-4 pt-1 pb-3">
											<p className="font-mono text-[9px] text-white/40 uppercase tracking-[0.35em]">
												// Signed in
											</p>
											<p className="mt-1 font-medium text-sm">{displayName}</p>
											<p className="text-white/50 text-xs">{displayEmail}</p>
										</div>
										<button
											className="flex w-full items-center gap-3 px-4 py-3 text-left font-mono text-[11px] text-white/70 uppercase tracking-[0.25em] transition-colors hover:bg-white/5 hover:text-white"
											onClick={handleLogout}
											type="button"
										>
											<LogOut className="h-3.5 w-3.5" />
											Sign out
										</button>
									</div>
								</>
							)}
						</div>

						{/* Mobile hamburger */}
						<button
							aria-label={isMobileNavOpen ? "Close menu" : "Open menu"}
							className="flex items-center justify-center border border-white/10 p-2 transition-colors hover:bg-white/5 md:hidden"
							onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
							type="button"
						>
							{isMobileNavOpen ? (
								<X className="h-5 w-5" />
							) : (
								<Menu className="h-5 w-5" />
							)}
						</button>
					</div>
				</div>

				{/* Mobile nav drawer */}
				{isMobileNavOpen && (
					<nav className="border-white/10 border-t px-[clamp(1rem,4vw,2rem)] py-4 md:hidden">
						<div className="mb-4 flex items-center gap-3 border-white/10 border-b pb-4">
							<div className="flex h-10 w-10 items-center justify-center border-2 border-white/20 bg-black font-medium text-sm">
								{initial}
							</div>
							<div>
								<p className="font-medium text-sm">{displayName}</p>
								<p className="font-mono text-[9px] text-white/40 uppercase tracking-[0.25em]">
									{displayEmail}
								</p>
							</div>
						</div>
						<div className="flex flex-col gap-1">
							{navItems.map((item) => {
								const active = isActive(item.href, item.exact);
								return (
									<Link
										className={cn(
											"flex items-center px-3 py-3 font-mono text-[11px] uppercase tracking-[0.25em] transition-colors",
											active
												? "bg-white/5 text-white"
												: "text-white/60 hover:bg-white/5 hover:text-white"
										)}
										key={item.href}
										onClick={() => setIsMobileNavOpen(false)}
										to={item.href}
									>
										{active && <span className="mr-2 text-white">●</span>}
										{item.label}
									</Link>
								);
							})}
							<button
								className="mt-2 flex w-full items-center gap-3 border-white/10 border-t px-3 pt-4 pb-2 text-left font-mono text-[11px] text-white/60 uppercase tracking-[0.25em] transition-colors hover:text-white"
								onClick={handleLogout}
								type="button"
							>
								<LogOut className="h-3.5 w-3.5" />
								Sign out
							</button>
						</div>
					</nav>
				)}
			</header>

			{/* Main Content */}
			<main className="mx-auto max-w-7xl px-[clamp(1rem,4vw,2rem)] py-[clamp(1.5rem,4vh,3rem)]">
				<Outlet />
			</main>
		</div>
	);
}
