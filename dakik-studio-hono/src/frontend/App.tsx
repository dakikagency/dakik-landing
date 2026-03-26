import { useState } from "react";

export default function App() {
	const [page, setPage] = useState<string>("home");

	return (
		<div className="min-h-screen bg-black text-white">
			{/* Simple SPA shell - will be replaced with full landing page */}
			<nav className="fixed top-0 right-0 left-0 z-50 border-white/10 border-b bg-black/80 backdrop-blur-sm">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
					<h1 className="font-bold text-xl">Dakik Studio</h1>
					<div className="flex gap-6">
						<button
							className="transition hover:text-red-500"
							onClick={() => setPage("home")}
						>
							Home
						</button>
						<button
							className="transition hover:text-red-500"
							onClick={() => setPage("admin")}
						>
							Admin
						</button>
						<button
							className="transition hover:text-red-500"
							onClick={() => setPage("portal")}
						>
							Portal
						</button>
					</div>
				</div>
			</nav>

			<main className="pt-20">
				{page === "home" && (
					<div className="flex min-h-screen items-center justify-center">
						<h2 className="font-bold text-4xl">Welcome to Dakik Studio</h2>
					</div>
				)}
				{page === "admin" && (
					<div className="flex min-h-screen items-center justify-center">
						<h2 className="font-bold text-4xl">Admin Dashboard</h2>
					</div>
				)}
				{page === "portal" && (
					<div className="flex min-h-screen items-center justify-center">
						<h2 className="font-bold text-4xl">Customer Portal</h2>
					</div>
				)}
			</main>
		</div>
	);
}
