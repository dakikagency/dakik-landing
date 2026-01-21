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
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

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

const DEFAULT_ICON = Bot;

function getIconComponent(iconName: string | null): LucideIcon {
	if (!iconName) {
		return DEFAULT_ICON;
	}
	return ICON_MAP[iconName] ?? DEFAULT_ICON;
}

const SKELETON_ITEMS = Array.from({ length: 4 }, (_, i) => ({
	id: `dynamic-question-skeleton-${i}`,
}));

function LoadingSkeleton() {
	return (
		<div className="grid gap-4 sm:grid-cols-2">
			{SKELETON_ITEMS.map((item) => (
				<div
					className="flex flex-col items-start gap-3 border p-6"
					key={item.id}
				>
					<Skeleton className="size-10" />
					<div className="w-full space-y-2">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-3 w-full" />
					</div>
				</div>
			))}
		</div>
	);
}

interface DynamicQuestionStepProps {
	questionId: string;
	selectedValue: string | string[] | null;
	onValueChange: (value: string | string[]) => void;
	onNext: () => void;
}

export function StepDynamicQuestion({
	questionId,
	selectedValue,
	onValueChange,
	onNext,
}: DynamicQuestionStepProps) {
	const { data: questionData, isLoading: isLoadingQuestion } = useQuery(
		trpc.surveyOptions.getAllQuestions.queryOptions()
	);

	const question = questionData?.find((q) => q.id === questionId);
	const isMultipleChoice = question?.inputType === "MULTIPLE_CHOICE";

	const handleOptionClick = (optionValue: string) => {
		if (isMultipleChoice) {
			const currentValues = Array.isArray(selectedValue) ? selectedValue : [];
			if (currentValues.includes(optionValue)) {
				onValueChange(currentValues.filter((v) => v !== optionValue));
			} else {
				onValueChange([...currentValues, optionValue]);
			}
		} else {
			onValueChange(optionValue);
		}
	};

	const handleContinue = () => {
		if (
			selectedValue &&
			(isMultipleChoice ? (selectedValue as string[]).length > 0 : true)
		) {
			onNext();
		}
	};

	const isSelected = (optionValue: string): boolean => {
		if (isMultipleChoice && Array.isArray(selectedValue)) {
			return selectedValue.includes(optionValue);
		}
		return selectedValue === optionValue;
	};

	const hasSelection = isMultipleChoice
		? Array.isArray(selectedValue) && selectedValue.length > 0
		: Boolean(selectedValue);

	if (isLoadingQuestion || !question) {
		return (
			<div className="flex flex-col gap-8">
				<div className="space-y-2">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-4 w-96" />
				</div>
				<LoadingSkeleton />
			</div>
		);
	}

	return (
		<div className="flex w-full max-w-3xl flex-col gap-12">
			<div className="space-y-4 text-center">
				<h2 className="font-black font-display text-4xl uppercase tracking-tight lg:text-6xl">
					{question.title}
				</h2>
				{question.description && (
					<p className="mx-auto max-w-md text-foreground/60 text-lg">
						{question.description}
					</p>
				)}
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				{question.options.map((option) => {
					const isOptionSelected = isSelected(option.value);
					const Icon = getIconComponent(option.icon);

					return (
						<motion.button
							className={cn(
								"group relative flex flex-col items-start gap-4 border-2 border-foreground/10 p-8 text-left transition-all",
								"hover:border-foreground/30 hover:bg-muted/30",
								isOptionSelected && "border-foreground bg-muted/50"
							)}
							key={option.id}
							onClick={() => handleOptionClick(option.value)}
							type="button"
							whileHover={{ scale: 1.01 }}
							whileTap={{ scale: 0.99 }}
						>
							{isMultipleChoice ? (
								<div className="flex w-full items-start gap-4">
									<Checkbox
										checked={isOptionSelected}
										className="mt-1 size-5 border-2"
										onCheckedChange={() => handleOptionClick(option.value)}
									/>
									<div className="flex-1">
										<div className="mb-2 flex items-center gap-3">
											<Icon className="size-6" />
											<h3 className="font-semibold text-lg">{option.label}</h3>
										</div>
										{option.description && (
											<p className="text-foreground/60 text-sm leading-relaxed">
												{option.description}
											</p>
										)}
									</div>
								</div>
							) : (
								<>
									<motion.div
										animate={isOptionSelected ? { scale: 1.1 } : { scale: 1 }}
										className={cn(
											"flex size-12 items-center justify-center border-2 transition-all",
											isOptionSelected
												? "border-foreground bg-foreground text-background"
												: "border-foreground/20 bg-transparent"
										)}
										transition={{ type: "spring", stiffness: 400, damping: 20 }}
									>
										<Icon className="size-6" />
									</motion.div>

									<div className="space-y-2">
										<h3 className="font-semibold text-lg">{option.label}</h3>
										{option.description && (
											<p className="text-foreground/60 text-sm leading-relaxed">
												{option.description}
											</p>
										)}
									</div>

									{isOptionSelected && (
										<motion.div
											animate={{ opacity: 1 }}
											className="absolute inset-0 border-2 border-foreground"
											initial={{ opacity: 0 }}
											transition={{ duration: 0.15 }}
										/>
									)}
								</>
							)}
						</motion.button>
					);
				})}
			</div>

			<div className="flex justify-center">
				<Button
					className="h-14 min-w-48 border-2 border-foreground bg-foreground text-background text-base transition-all hover:bg-background hover:text-foreground"
					disabled={!hasSelection}
					onClick={handleContinue}
				>
					Continue
				</Button>
			</div>
		</div>
	);
}
