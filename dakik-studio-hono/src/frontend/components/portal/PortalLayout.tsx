import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";

interface User {
	name?: string;
	email: string;
}

interface PortalLayoutProps {
	user?: User;
}

export function PortalLayout({ user }: PortalLayoutProps) {
	const navigate = useNavigate();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const mockUser: User = user || {
		name: "John Doe",
		email: "john@example.com",
	};

	const handleLogout = () => {
		navigate("/login");
	};

	const navItems = [
		{ label: "Dashboard", href: "/portal" },
		{ label: "Projects", href: "/portal/projects" },
		{ label: "Invoices", href: "/portal/invoices" },
		{ label: "Meetings", href: "/portal/meetings" },
	];

	return (
		<div className="min-h-screen bg-black text-white">
			{/* Header */}
			<header className="sticky top-0 z-50 border-white/10 border-b bg-black/80 backdrop-blur-md">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
					<Link className="flex items-center gap-2" to="/portal">
						<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black">
							<span className="font-bold text-lg">D</span>
						</div>
						<span className="hidden font-semibold sm:inline-block">
							Dakik Studio
						</span>
					</Link>

					<nav className="hidden items-center gap-1 md:flex">
						{navItems.map((item) => (
							<Link
								className={cn(
									"rounded-lg px-4 py-2 font-medium text-sm transition-colors",
									"text-white/70 hover:bg-white/5 hover:text-white"
								)}
								key={item.href}
								to={item.href}
							>
								{item.label}
							</Link>
						))}
					</nav>

					<div className="relative">
						<button
							className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/5"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							type="button"
						>
							<div className="hidden text-right sm:block">
								<p className="font-medium text-sm">{mockUser.name}</p>
								<p className="text-white/50 text-xs">{mockUser.email}</p>
							</div>
							<div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 font-medium text-sm">
								{mockUser.name
									? mockUser.name.charAt(0).toUpperCase()
									: mockUser.email.charAt(0).toUpperCase()}
							</div>
						</button>

						{isMenuOpen && (
							<>
								<button
									aria-label="Close menu"
									className="fixed inset-0 z-40 cursor-default"
									onClick={() => setIsMenuOpen(false)}
									type="button"
								/>
								<div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-white/10 bg-black py-2 shadow-xl">
									<div className="hidden border-white/10 border-b px-4 pt-1 pb-3 sm:block">
										<p className="font-medium">{mockUser.name}</p>
										<p className="text-sm text-white/50">{mockUser.email}</p>
									</div>
									<button
										className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
										onClick={handleLogout}
										type="button"
									>
										<svg
											aria-hidden="true"
											className="h-4 w-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
											/>
										</svg>
										Sign out
									</button>
								</div>
							</>
						)}
					</div>

					<button
						aria-label={isMenuOpen ? "Close menu" : "Open menu"}
						className="flex items-center justify-center rounded-lg p-2 md:hidden"
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						type="button"
					>
						<svg
							aria-hidden="true"
							className="h-6 w-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								d={
									isMenuOpen
										? "M6 18L18 6M6 6l12 12"
										: "M4 6h16M4 12h16M4 18h16"
								}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
							/>
						</svg>
					</button>
				</div>

				{isMenuOpen && (
					<nav className="border-white/10 border-t px-4 py-4 md:hidden">
						<div className="flex flex-col gap-1">
							{navItems.map((item) => (
								<Link
									className="rounded-lg px-4 py-3 font-medium text-sm text-white/70 hover:bg-white/5 hover:text-white"
									key={item.href}
									onClick={() => setIsMenuOpen(false)}
									to={item.href}
								>
									{item.label}
								</Link>
							))}
							<button
								className="mt-2 flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left font-medium text-sm text-white/70 hover:bg-white/5 hover:text-white"
								onClick={handleLogout}
								type="button"
							>
								<svg
									aria-hidden="true"
									className="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
									/>
								</svg>
								Sign out
							</button>
						</div>
					</nav>
				)}
			</header>

			{/* Main Content */}
			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<Outlet />
			</main>
		</div>
	);
}
