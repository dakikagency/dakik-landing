"use client";

import { ArrowCounterClockwise, House, Warning } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
	useEffect(() => {
		console.error("Application error:", error);
	}, [error]);

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
					<Warning className="size-12 text-muted-foreground" />
				</motion.div>

				<motion.h1
					animate={{ opacity: 1, y: 0 }}
					className="mb-3 font-bold font-display text-4xl text-foreground tracking-tight"
					initial={{ opacity: 0, y: 10 }}
					transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
				>
					Something Went Wrong
				</motion.h1>

				<motion.p
					animate={{ opacity: 1, y: 0 }}
					className="mb-8 text-muted-foreground"
					initial={{ opacity: 0, y: 10 }}
					transition={{ duration: 0.5, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
				>
					An unexpected error occurred. Please try again or return to the home
					page.
				</motion.p>

				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className="flex flex-col gap-3 sm:flex-row"
					initial={{ opacity: 0, y: 10 }}
					transition={{ duration: 0.5, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
				>
					<Button onClick={reset} size="lg">
						<ArrowCounterClockwise data-icon="inline-start" />
						Try Again
					</Button>
					<Link
						className="inline-flex h-11 items-center justify-center gap-2 border border-input bg-background px-8 font-medium text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						href="/"
					>
						<House data-icon="inline-start" />
						Return to Home
					</Link>
				</motion.div>
			</motion.div>

			{error.digest ? (
				<motion.div
					animate={{ opacity: 1 }}
					className="absolute bottom-8 text-muted-foreground text-sm"
					initial={{ opacity: 0 }}
					transition={{ duration: 0.5, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
				>
					Error ID: {error.digest}
				</motion.div>
			) : null}
		</main>
	);
}
