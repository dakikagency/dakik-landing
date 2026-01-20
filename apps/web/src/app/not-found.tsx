"use client";

import { House, MagnifyingGlass } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="flex max-w-md flex-col items-center text-center"
				initial={{ opacity: 0, y: 20 }}
				transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
			>
				<motion.div
					animate={{ scale: 1, opacity: 1 }}
					className="mb-8 flex size-24 items-center justify-center rounded-full border border-border bg-muted"
					initial={{ scale: 0.8, opacity: 0 }}
					transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
				>
					<MagnifyingGlass className="size-12 text-muted-foreground" />
				</motion.div>

				<motion.h1
					animate={{ opacity: 1, y: 0 }}
					className="mb-3 font-bold font-display text-4xl text-foreground tracking-tight"
					initial={{ opacity: 0, y: 10 }}
					transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
				>
					Page Not Found
				</motion.h1>

				<motion.p
					animate={{ opacity: 1, y: 0 }}
					className="mb-8 text-muted-foreground"
					initial={{ opacity: 0, y: 10 }}
					transition={{ duration: 0.5, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
				>
					The page you are looking for does not exist or has been moved.
				</motion.p>

				<motion.div
					animate={{ opacity: 1, y: 0 }}
					initial={{ opacity: 0, y: 10 }}
					transition={{ duration: 0.5, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
				>
					<Link
						className="inline-flex h-11 items-center justify-center gap-2 bg-primary px-8 font-medium text-primary-foreground text-sm ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						href="/"
					>
						<House data-icon="inline-start" />
						Return to Home
					</Link>
				</motion.div>
			</motion.div>

			<motion.div
				animate={{ opacity: 1 }}
				className="absolute bottom-8 text-muted-foreground text-sm"
				initial={{ opacity: 0 }}
				transition={{ duration: 0.5, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
			>
				Error 404
			</motion.div>
		</main>
	);
}
