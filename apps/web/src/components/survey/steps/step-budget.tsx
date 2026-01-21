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
	const { budget, setBudget, nextStep } = useSurvey();

	const { data: options, isLoading } = useQuery(
		trpc.surveyOptions.getByType.queryOptions({ questionType: "BUDGET" })
	);

	const handleContinue = () => {
		if (budget) {
			nextStep();
		}
	};

	return (
		<div className="flex w-full max-w-3xl flex-col gap-12">
			<div className="space-y-4 text-center">
				<h2 className="font-black font-display text-4xl uppercase tracking-tight lg:text-6xl">
					What is your budget?
				</h2>
				<p className="mx-auto max-w-md text-foreground/60 text-lg">
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
									"group relative flex items-center gap-5 border-2 border-foreground/10 p-8 text-left transition-all",
									"hover:border-foreground/30 hover:bg-muted/30",
									isSelected && "border-foreground bg-muted/50"
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
										"flex size-12 items-center justify-center border-2 transition-all",
										isSelected
											? "border-foreground bg-foreground text-background"
											: "border-foreground/20 bg-transparent"
									)}
									transition={{ type: "spring", stiffness: 400, damping: 20 }}
								>
									<Icon className="size-6" />
								</motion.div>

								<div className="space-y-1">
									<h3 className="font-semibold text-lg">{option.label}</h3>
									{option.description && (
										<p className="text-foreground/60 text-sm">
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

			<div className="flex justify-center">
				<Button
					className="h-14 min-w-48 border-2 border-foreground bg-foreground text-background text-base transition-all hover:bg-background hover:text-foreground"
					disabled={!budget}
					onClick={handleContinue}
				>
					Continue
				</Button>
			</div>
		</div>
	);
}
