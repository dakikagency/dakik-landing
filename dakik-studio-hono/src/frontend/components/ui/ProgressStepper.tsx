"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../lib/utils";

export interface Step {
	id: string;
	label: string;
	description?: string;
}

interface ProgressStepperProps {
	steps: Step[];
	currentStep: number;
	className?: string;
}

export function ProgressStepper({
	steps,
	currentStep,
	className,
}: ProgressStepperProps) {
	const shouldReduceMotion = useReducedMotion();
	const totalSteps = steps.length;

	return (
		<div className={cn("w-full", className)}>
			<div className="flex items-center">
				{steps.map((step, index) => {
					const stepNumber = index + 1;
					const isCompleted = stepNumber < currentStep;
					const isCurrent = stepNumber === currentStep;
					const isLast = index === totalSteps - 1;

					return (
						<div key={step.id} className="flex flex-1 items-center">
							<div className="flex flex-col items-center">
								<motion.div
									initial={false}
									animate={{
										backgroundColor:
											isCompleted || isCurrent
												? "rgb(0, 0, 0)"
												: "rgb(255, 255, 255)",
										borderColor:
											isCompleted || isCurrent
												? "rgb(0, 0, 0)"
												: "rgb(0, 0, 0, 0.15)",
									}}
									transition={{
										duration: shouldReduceMotion ? 0 : 0.2,
									}}
									className="flex h-8 w-8 items-center justify-center border-2 text-sm font-medium"
								>
									{isCompleted ? (
										<svg
											aria-hidden="true"
											className="h-4 w-4 text-white"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2.5}
												d="M5 13l4 4L19 7"
											/>
										</svg>
									) : (
										<span
											className={cn(
												"text-xs",
												isCurrent ? "text-white" : "text-black/50",
											)}
										>
											{stepNumber}
										</span>
									)}
								</motion.div>

								<div className="mt-2 text-center">
									<div
										className={cn(
											"text-xs font-medium",
											isCurrent ? "text-black" : "text-black/50",
										)}
									>
										{step.label}
									</div>
									{step.description && (
										<div className="mt-0.5 text-[10px] text-black/40">
											{step.description}
										</div>
									)}
								</div>
							</div>

							{!isLast && (
								<div className="relative mx-2 h-[2px] flex-1 bg-black/10">
									<motion.div
										initial={false}
										animate={{
											scaleX: isCompleted ? 1 : 0,
											backgroundColor: "rgb(0, 0, 0)",
										}}
										transition={{
											duration: shouldReduceMotion ? 0 : 0.3,
										}}
										className="absolute inset-0 origin-left"
									/>
								</div>
							)}
						</div>
					);
				})}
			</div>

			<div className="mt-4 flex justify-between text-xs text-black/40">
				<span>
					Step {currentStep} of {totalSteps}
				</span>
				<span>{Math.round((currentStep / totalSteps) * 100)}% complete</span>
			</div>
		</div>
	);
}
