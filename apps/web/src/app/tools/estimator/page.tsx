"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { StepDesign } from "@/components/estimator/steps/step-design";
import { StepFeatures } from "@/components/estimator/steps/step-features";
import { StepPlatform } from "@/components/estimator/steps/step-platform";
import { StepResult } from "@/components/estimator/steps/step-result";
import { Footer, Navbar } from "@/components/landing";
import { Button } from "@/components/ui/button";

type Step = "platform" | "design" | "features" | "result";

export default function EstimatorPage() {
	const [step, setStep] = useState<Step>("platform");
	const [history, setHistory] = useState<Step[]>([]);

	const [formData, setFormData] = useState({
		platform: null as "web" | "mobile" | "both" | null,
		designStatus: null as "ready" | "needed" | null,
		features: [] as string[],
	});

	const next = (nextStep: Step) => {
		setHistory((prev) => [...prev, step]);
		setStep(nextStep);
	};

	const back = () => {
		const prev = history.at(-1);
		if (prev) {
			setHistory((h) => h.slice(0, -1));
			setStep(prev);
		}
	};

	// Progress calculation
	const stepsOrder: Step[] = ["platform", "design", "features", "result"];
	const currentIdx = stepsOrder.indexOf(step);
	const progress = ((currentIdx + 1) / stepsOrder.length) * 100;

	return (
		<>
			<Navbar />
			<main className="min-h-screen bg-background pt-24 pb-20">
				<div className="mx-auto w-full max-w-lg px-6">
					{/* Header / Progress */}
					<div className="mb-10 space-y-4">
						<div className="flex items-center justify-between">
							{step !== "platform" && step !== "result" ? (
								<Button
									className="-ml-2 text-muted-foreground"
									onClick={back}
									size="sm"
									variant="ghost"
								>
									<ChevronLeft className="mr-1 size-4" />
									Back
								</Button>
							) : (
								<div />
							)}
							<span className="font-medium text-muted-foreground text-xs uppercase tracking-widest">
								Step {currentIdx + 1}/{stepsOrder.length}
							</span>
						</div>
						<div className="h-1 w-full overflow-hidden rounded-full bg-muted">
							<motion.div
								animate={{ width: `${progress}%` }}
								className="h-full bg-primary"
								initial={{ width: 0 }}
								transition={{ duration: 0.5 }}
							/>
						</div>
					</div>

					{/* Steps */}
					<AnimatePresence mode="wait">
						<motion.div
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							initial={{ opacity: 0, x: 20 }}
							key={step}
							transition={{ duration: 0.3 }}
						>
							{step === "platform" && (
								<StepPlatform
									onChange={(val) =>
										setFormData((prev) => ({ ...prev, platform: val }))
									}
									onNext={() => next("design")}
									value={formData.platform}
								/>
							)}

							{step === "design" && (
								<StepDesign
									onChange={(val) =>
										setFormData((prev) => ({ ...prev, designStatus: val }))
									}
									onNext={() => next("features")}
									value={formData.designStatus}
								/>
							)}

							{step === "features" && (
								<StepFeatures
									onChange={(val) =>
										setFormData((prev) => ({ ...prev, features: val }))
									}
									onNext={() => next("result")}
									value={formData.features}
								/>
							)}

							{step === "result" &&
								formData.platform &&
								formData.designStatus && (
									<StepResult
										formData={{
											platform: formData.platform,
											designStatus: formData.designStatus,
											features: formData.features,
										}}
									/>
								)}
						</motion.div>
					</AnimatePresence>
				</div>
			</main>
			<Footer />
		</>
	);
}
