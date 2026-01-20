"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
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
						<Image
							alt="Dakik Studio"
							className="h-12"
							height={61}
							src="/dakik_logo.svg"
							width={83}
						/>
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
