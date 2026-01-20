"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
	Bot,
	Briefcase,
	Code,
	DollarSign,
	Globe,
	Layers,
	Palette,
	Rocket,
	Smartphone,
	Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

import type { BudgetRange } from "../survey-context";
import { useSurvey } from "../survey-context";

const ICON_MAP: Record<string, LucideIcon> = {
	Bot,
	Palette,
	Smartphone,
	Layers,
	DollarSign,
	Briefcase,
	Code,
	Globe,
	Rocket,
	Zap,
};

const DEFAULT_ICON = DollarSign;

function getIconComponent(iconName: string | null): LucideIcon {
	if (!iconName) {
		return DEFAULT_ICON;
	}
	return ICON_MAP[iconName] ?? DEFAULT_ICON;
}

const SKELETON_ITEMS = Array.from({ length: 4 }, (_, i) => ({
	id: `budget-skeleton-${i}`,
}));

function LoadingSkeleton() {
	return (
		<div className="grid gap-4 sm:grid-cols-2">
			{SKELETON_ITEMS.map((item) => (
				<div className="flex items-center gap-4 border p-6" key={item.id}>
					<Skeleton className="size-10" />
					<div className="space-y-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-3 w-40" />
					</div>
				</div>
			))}
		</div>
	);
}

export function StepBudget() {
	const { budget, setBudget, nextStep, prevStep } = useSurvey();

	const { data: options, isLoading } = useQuery(
		trpc.surveyOptions.getByType.queryOptions({ questionType: "BUDGET" })
	);

	const handleContinue = () => {
		if (budget) {
			nextStep();
		}
	};

	return (
		<div className="flex flex-col gap-8">
			<div className="space-y-2">
				<h2 className="font-medium text-2xl">What is your budget range?</h2>
				<p className="text-muted-foreground text-sm">
					Select the investment level that aligns with your project scope
				</p>
			</div>

			{isLoading ? (
				<LoadingSkeleton />
			) : (
				<div className="grid gap-4 sm:grid-cols-2">
					{options?.map((option) => {
						const isSelected = budget === option.value;
						const Icon = getIconComponent(option.icon);

						return (
							<motion.button
								className={cn(
									"group relative flex items-center gap-4 border p-6 text-left transition-colors",
									"hover:border-foreground/30 hover:bg-muted/50",
									isSelected && "border-foreground bg-muted"
								)}
								key={option.id}
								onClick={() => setBudget(option.value as BudgetRange)}
								type="button"
								whileHover={{ scale: 1.01 }}
								whileTap={{ scale: 0.99 }}
							>
								<motion.div
									animate={isSelected ? { scale: 1.1 } : { scale: 1 }}
									className={cn(
										"flex size-10 items-center justify-center border transition-colors",
										isSelected
											? "border-foreground bg-foreground text-background"
											: "border-foreground/20 bg-transparent"
									)}
									transition={{ type: "spring", stiffness: 400, damping: 20 }}
								>
									<Icon className="size-5" />
								</motion.div>

								<div className="space-y-1">
									<h3 className="font-medium text-base">{option.label}</h3>
									{option.description && (
										<p className="text-muted-foreground text-xs">
											{option.description}
										</p>
									)}
								</div>

								{isSelected && (
									<motion.div
										animate={{ opacity: 1 }}
										className="absolute inset-0 border-2 border-foreground"
										initial={{ opacity: 0 }}
										transition={{ duration: 0.15 }}
									/>
								)}
							</motion.button>
						);
					})}
				</div>
			)}

			<div className="flex justify-between">
				<Button onClick={prevStep} variant="ghost">
					Back
				</Button>
				<Button
					className="min-w-32"
					disabled={!budget}
					onClick={handleContinue}
				>
					Continue
				</Button>
			</div>
		</div>
	);
}
