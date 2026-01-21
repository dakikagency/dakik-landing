"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface SurveyLayoutProps {
	children: ReactNode;
	currentStep: number;
	onBack?: () => void;
}

export function SurveyLayout({
	children,
	currentStep,
	onBack,
}: SurveyLayoutProps) {
	const showBackButton = currentStep > 1;

	return (
		<div className="min-h-screen bg-background text-foreground">
			{/* Minimal header */}
			<header className="fixed top-0 right-0 left-0 z-50">
				<div className="mx-auto px-[clamp(1rem,5vw,4rem)] py-6">
					<div className="flex items-center justify-between">
						{/* Back button or Home link */}
						<div className="w-24">
							{showBackButton ? (
								<motion.button
									animate={{ opacity: 1, x: 0 }}
									className="group flex items-center gap-2 text-foreground/60 transition-colors hover:text-foreground"
									initial={{ opacity: 0, x: -10 }}
									onClick={onBack}
									type="button"
								>
									<ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
									<span className="font-medium text-sm">Back</span>
								</motion.button>
							) : (
								<Link
									className="group flex items-center gap-2 text-foreground/60 transition-colors hover:text-foreground"
									href="/"
								>
									<ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
									<span className="font-medium text-sm">Home</span>
								</Link>
							)}
						</div>

						{/* Close button to go home */}
						<div className="flex w-24 justify-end">
							<Link
								aria-label="Close and return to home"
								className="flex h-10 w-10 items-center justify-center border border-foreground/20 text-foreground/60 transition-all hover:border-foreground hover:text-foreground"
								href="/"
							>
								<X className="h-5 w-5" />
							</Link>
						</div>
					</div>
				</div>
			</header>

			{/* Main content area with step transition */}
			<main className="mx-auto min-h-screen px-[clamp(1rem,5vw,4rem)]">
				<AnimatePresence mode="wait">
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className="flex min-h-screen flex-col items-center justify-center py-32"
						exit={{ opacity: 0, y: -20 }}
						initial={{ opacity: 0, y: 20 }}
						key={currentStep}
						transition={{
							duration: 0.5,
							ease: [0.4, 0, 0.2, 1],
						}}
					>
						{children}
					</motion.div>
				</AnimatePresence>
			</main>
		</div>
	);
}
