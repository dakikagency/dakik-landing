"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const STEPS = [
	{ label: "Project Type", step: 1 },
	{ label: "Budget", step: 2 },
	{ label: "Contact", step: 3 },
	{ label: "Schedule", step: 4 },
] as const;

function getStepBackgroundColor(
	isCompleted: boolean,
	isActive: boolean
): string {
	if (isCompleted) {
		return "#d2141c";
	}
	if (isActive) {
		return "#ffffff";
	}
	return "#404040";
}

function getStepBorderColor(isCompleted: boolean, isActive: boolean): string {
	if (isCompleted) {
		return "#d2141c";
	}
	if (isActive) {
		return "#ffffff";
	}
	return "#404040";
}

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
		<div className="min-h-screen bg-black text-white">
			{/* Header with progress */}
			<header className="fixed top-0 right-0 left-0 z-50 border-gray-800 border-b bg-black/90 backdrop-blur-sm">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						{/* Back button or Home link */}
						<div className="w-24">
							{showBackButton ? (
								<motion.button
									animate={{ opacity: 1, x: 0 }}
									className="flex items-center gap-2 text-gray-400 text-sm transition-colors hover:text-white"
									initial={{ opacity: 0, x: -10 }}
									onClick={onBack}
									type="button"
								>
									<ArrowLeft className="h-4 w-4" />
									<span>Back</span>
								</motion.button>
							) : (
								<Link
									className="flex items-center gap-2 text-gray-400 text-sm transition-colors hover:text-white"
									href="/"
								>
									<ArrowLeft className="h-4 w-4" />
									<span>Home</span>
								</Link>
							)}
						</div>

						{/* Progress indicator */}
						<nav className="flex items-center gap-2 sm:gap-4">
							{STEPS.map(({ label, step }) => {
								const isCompleted = step < currentStep;
								const isActive = step === currentStep;

								return (
									<div className="flex items-center gap-2 sm:gap-4" key={step}>
										{/* Step indicator */}
										<div className="flex flex-col items-center gap-1">
											<motion.div
												animate={{
													backgroundColor: getStepBackgroundColor(
														isCompleted,
														isActive
													),
													borderColor: getStepBorderColor(
														isCompleted,
														isActive
													),
												}}
												className={cn(
													"flex h-8 w-8 items-center justify-center rounded-full border-2 font-medium text-sm transition-colors",
													isCompleted && "text-white",
													isActive && "text-black",
													!(isCompleted || isActive) && "text-gray-500"
												)}
												initial={false}
												transition={{ duration: 0.3 }}
											>
												{isCompleted ? (
													<motion.div
														animate={{ scale: 1, opacity: 1 }}
														initial={{ scale: 0.5, opacity: 0 }}
														transition={{ duration: 0.2 }}
													>
														<Check className="h-4 w-4" />
													</motion.div>
												) : (
													step
												)}
											</motion.div>

											{/* Step label - hidden on mobile */}
											<span
												className={cn(
													"hidden text-xs sm:block",
													isActive && "font-medium text-white",
													isCompleted && !isActive && "text-gray-300",
													!(isCompleted || isActive) && "text-gray-500"
												)}
											>
												{label}
											</span>
										</div>

										{/* Connector line */}
										{step < STEPS.length && (
											<div
												className={cn(
													"h-px w-4 sm:w-8",
													step < currentStep ? "bg-cta" : "bg-gray-700"
												)}
											/>
										)}
									</div>
								);
							})}
						</nav>

						{/* Close button to go home */}
						<div className="flex w-24 justify-end">
							<Link
								aria-label="Close and return to home"
								className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
								href="/"
							>
								<X className="h-5 w-5" />
							</Link>
						</div>
					</div>
				</div>
			</header>

			{/* Main content area with step transition */}
			<main className="container mx-auto min-h-screen px-4 pt-32 pb-16">
				<AnimatePresence mode="wait">
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center"
						exit={{ opacity: 0, y: -20 }}
						initial={{ opacity: 0, y: 20 }}
						key={currentStep}
						transition={{
							duration: 0.4,
							ease: [0.4, 0, 0.2, 1],
						}}
					>
						{children}
					</motion.div>
				</AnimatePresence>
			</main>

			{/* Progress bar at bottom */}
			<div className="fixed right-0 bottom-0 left-0 h-1 bg-gray-900">
				<motion.div
					animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
					className="h-full bg-cta"
					initial={{ width: 0 }}
					transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
				/>
			</div>
		</div>
	);
}
