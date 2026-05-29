import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "../../lib/utils";

const navLinks = [
	{ href: "https://icons.dakik.co.uk", label: "Icons" },
	{ href: "https://bits.dakik.co.uk", label: "Bits" },
	{ href: "https://flow.dakik.co.uk", label: "Flow" },
	{ href: "/blog", label: "Blog" },
	{ href: "/privacy-policy", label: "Privacy" },
] as const;

export function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const [_isScrolled, setIsScrolled] = useState(false);

	const handleScroll = useCallback(() => {
		setIsScrolled(window.scrollY > 10);
	}, []);

	useEffect(() => {
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [handleScroll]);

	const closeMenu = useCallback(() => {
		setIsOpen(false);
	}, []);

	const toggleMenu = useCallback(() => {
		setIsOpen((prev) => !prev);
	}, []);

	return (
		<motion.header
			className={cn(
				"fixed top-0 right-0 left-0 z-50 text-white mix-blend-difference"
			)}
		>
			<nav className="mx-auto px-[clamp(1rem,5vw,4rem)]">
				<div className="flex h-20 items-center justify-between">
					<a
						aria-label="Dakik Studio home"
						className="flex flex-row items-center gap-2 font-bold text-base tracking-tight text-white transition-opacity hover:opacity-70 lg:text-xl"
						href="/"
					>
						{/* Inlined SVG so currentColor resolves to text-white. Loading
						    the same file via <img> sandboxes the SVG; its `fill:
						    currentColor` defaults to black, which then disappears under
						    the header's mix-blend-difference. */}
						<svg
							aria-hidden="true"
							className="h-12 w-auto shrink-0"
							fill="currentColor"
							viewBox="0 0 83 61"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								clipRule="evenodd"
								d="M 54.7035 42.1371 L 70.48 48.81 L 81.06 40.80 L 79.02 22.75 L 73.32 14.28 L 68.63 12.60 L 64.06 14.52 L 60.64 16.24 L 56.61 17.21 L 51.71 16.50 L 48.49 15.21 L 44.63 13.41 L 40.42 11.35 L 25.93 5.07 L 25.57 11.04 L 54.70 42.14 L 54.70 42.14 L 54.70 42.14 L 54.70 42.14 M 74.1948 32.863 L 73.24 29.33 L 70.73 26.82 L 67.19 25.86 L 63.09 26.82 L 59.52 29.33 L 58.00 32.86 L 59.52 36.40 L 63.09 38.91 L 67.19 39.86 L 70.73 38.91 L 73.24 36.40 L 74.19 32.86 L 74.19 32.86 L 74.19 32.86 L 74.19 32.86"
								fillRule="evenodd"
							/>
							<path
								clipRule="evenodd"
								d="M 27.8698 21.8099 L 11.67 16.24 L 1.67 24.96 L 4.94 42.82 L 11.20 50.88 L 16.00 52.24 L 20.43 50.00 L 23.73 48.06 L 27.68 46.81 L 32.62 47.18 L 35.92 48.25 L 39.89 49.77 L 44.23 51.55 L 59.12 56.82 L 59.07 50.83 L 27.87 21.81 L 27.87 21.81 L 27.87 21.81 L 27.87 21.81 M 9.0612 32.4002 L 10.26 35.86 L 12.93 38.19 L 16.53 38.90 L 20.11 36.91 L 22.67 32.76 L 23.50 28.38 L 22.18 25.71 L 19.28 24.85 L 15.56 24.94 L 12.11 26.13 L 9.77 28.81 L 9.06 32.40 L 9.06 32.40 L 9.06 32.40 L 9.06 32.40"
								fillRule="evenodd"
							/>
						</svg>
						<span className="hidden lg:inline">Dakik Studio</span>
					</a>

					<div className="hidden md:flex md:items-center md:gap-8">
						{navLinks.map((link) => (
							<a
								className="font-medium text-sm opacity-70 transition-opacity hover:opacity-100 lg:text-base"
								href={link.href}
								key={link.href}
							>
								{link.label}
							</a>
						))}
						<a
							className="whitespace-nowrap font-medium text-sm opacity-70 transition-opacity hover:opacity-100 lg:text-base"
							href="/login"
						>
							Customer Login
						</a>
						<a
							className="whitespace-nowrap font-black text-sm transition-opacity hover:opacity-70 lg:text-base"
							href="/survey"
						>
							Start a Project
						</a>
					</div>

					<motion.button
						aria-expanded={isOpen}
						aria-label={isOpen ? "Close menu" : "Open menu"}
						className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-white/10 md:hidden"
						onClick={toggleMenu}
						type="button"
						whileTap={{ scale: 0.95 }}
					>
						<AnimatePresence initial={false} mode="wait">
							{isOpen ? (
								<motion.div
									animate={{ opacity: 1, rotate: 0 }}
									exit={{ opacity: 0, rotate: 90 }}
									initial={{ opacity: 0, rotate: -90 }}
									key="close"
									transition={{ duration: 0.15 }}
								>
									<X size={24} />
								</motion.div>
							) : (
								<motion.div
									animate={{ opacity: 1, rotate: 0 }}
									exit={{ opacity: 0, rotate: -90 }}
									initial={{ opacity: 0, rotate: 90 }}
									key="menu"
									transition={{ duration: 0.15 }}
								>
									<Menu size={24} />
								</motion.div>
							)}
						</AnimatePresence>
					</motion.button>
				</div>
				<hr className="border-0.5 border-gray-800/60" />

				<AnimatePresence>
					{isOpen && (
						<motion.div
							animate={{ opacity: 1, height: "auto" }}
							className="overflow-hidden md:hidden"
							exit={{ opacity: 0, height: 0 }}
							initial={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
						>
							<div className="space-y-1 pt-2 pb-6">
								{navLinks.map((link, index) => (
									<motion.div
										animate={{ opacity: 1, x: 0 }}
										initial={{ opacity: 0, x: -20 }}
										key={link.href}
										transition={{
											delay: index * 0.05,
											duration: 0.3,
										}}
									>
										<a
											className="block rounded-lg px-3 py-2.5 font-medium text-base transition-colors hover:bg-white/10"
											href={link.href}
											onClick={closeMenu}
										>
											{link.label}
										</a>
									</motion.div>
								))}
								<motion.div
									animate={{ opacity: 1, x: 0 }}
									initial={{ opacity: 0, x: -20 }}
									transition={{
										delay: navLinks.length * 0.05,
										duration: 0.3,
									}}
								>
									<a
										className="block rounded-lg px-3 py-2.5 font-medium text-base transition-colors hover:bg-white/10"
										href="/login"
										onClick={closeMenu}
									>
										Customer Login
									</a>
								</motion.div>
								<motion.div
									animate={{ opacity: 1, y: 0 }}
									className="pt-4"
									initial={{ opacity: 0, y: 10 }}
									transition={{
										delay: (navLinks.length + 1) * 0.05,
										duration: 0.3,
									}}
								>
									<a
										className="block w-full rounded-full bg-red-500 px-5 py-3 text-center font-medium text-base text-white transition-colors hover:bg-red-600"
										href="/survey"
										onClick={closeMenu}
									>
										Start a Project
									</a>
								</motion.div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</nav>
		</motion.header>
	);
}
