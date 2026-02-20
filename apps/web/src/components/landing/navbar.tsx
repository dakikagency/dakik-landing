"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
	{ href: "/daicons", label: "daIcons" },
	{ href: "/dacomps", label: "daComps" },
	{ href: "/blog", label: "Blog" },
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
				"fixed top-0 right-0 left-0 z-50 text-background mix-blend-difference"
			)}
		>
			<nav className="mx-auto px-[clamp(1rem,5vw,4rem)]">
				<div className="flex h-20 items-center justify-between">
					{/* Logo */}
					<Link
						className="flex flex-row items-center font-bold text-base tracking-tight transition-opacity hover:opacity-70 lg:text-xl"
						href="/"
					>
						<svg
							className="h-12 w-auto"
							fill="none"
							viewBox="0 0 83 61"
							xmlns="http://www.w3.org/2000/svg"
						>
							<title>logo</title>
							<path
								clipRule="evenodd"
								d="M54.7035 42.1371C70.6106 57.6996 89.8421 44.2653 79.0218 22.7498C72.5239 9.8291 68.8745 11.8514 64.057 14.5209C60.8523 16.2967 57.1307 18.3589 51.71 16.4995C48.8968 15.5346 44.722 13.4724 40.4219 11.3484C23.9799 3.22697 5.70536 -5.79968 54.7035 42.1371ZM74.1948 32.863C74.1948 28.997 71.0608 25.863 67.1948 25.863C63.3288 25.863 58 28.997 58 32.863C58 36.729 63.3288 39.863 67.1948 39.863C71.0608 39.863 74.1948 36.729 74.1948 32.863Z"
								fillRule="evenodd"
								fill="currentColor"
							/>
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M27.8698 21.8099C10.932 7.37606 -7.33196 22.0988 4.93977 42.8209C12.3093 55.265 15.8113 52.997 20.4342 50.0031C23.5094 48.0115 27.0806 45.6987 32.6162 47.1816C35.489 47.9511 39.7955 49.7218 44.2313 51.5456C61.1919 58.5193 80.0431 66.2702 27.8698 21.8099ZM9.06118 32.4002C9.32656 36.2571 12.6683 39.1685 16.5252 38.9032C20.3821 38.6378 23.7654 32.2359 23.5 28.379C23.2346 24.5222 19.421 24.6708 15.5641 24.9362C11.7073 25.2016 8.7958 28.5433 9.06118 32.4002Z"
								fill="currentColor"
							/>
						</svg>
						<span className="hidden lg:inline">dakik</span>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex md:items-center md:gap-8">
						{navLinks.map((link) => (
							<Link
								className="font-medium text-sm opacity-70 transition-opacity hover:opacity-100 lg:text-base"
								href={link.href}
								key={link.href}
							>
								{link.label}
							</Link>
						))}
						<Link
							className="whitespace-nowrap font-medium text-sm opacity-70 transition-opacity hover:opacity-100 lg:text-base"
							href="/login"
						>
							Customer Login
						</Link>
						<Link
							className="whitespace-nowrap font-black text-sm transition-opacity hover:opacity-70 lg:text-base"
							href="/survey"
						>
							Start a Project
						</Link>
					</div>

					{/* Mobile Menu Button */}
					<motion.button
						aria-expanded={isOpen}
						aria-label={isOpen ? "Close menu" : "Open menu"}
						className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-black/5 md:hidden"
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

				{/* Mobile Navigation */}
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
										<Link
											className="block rounded-lg px-3 py-2.5 font-medium text-base transition-colors hover:bg-black/5"
											href={link.href}
											onClick={closeMenu}
										>
											{link.label}
										</Link>
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
									<Link
										className="block rounded-lg px-3 py-2.5 font-medium text-base transition-colors hover:bg-black/5"
										href="/login"
										onClick={closeMenu}
									>
										Customer Login
									</Link>
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
									<Link
										className="block w-full rounded-full bg-cta px-5 py-3 text-center font-medium text-base text-white transition-colors hover:bg-cta-dark"
										href="/survey"
										onClick={closeMenu}
									>
										Start a Project
									</Link>
								</motion.div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</nav>
		</motion.header>
	);
}
