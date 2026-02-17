"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StepFeaturesProps {
	value: string[];
	onChange: (val: string[]) => void;
	onNext: () => void;
}

const features = [
	{ id: "auth", label: "Authentication", price: "+$1k" },
	{ id: "payments", label: "Payments (Stripe)", price: "+$2k" },
	{ id: "cms", label: "CMS / Blog", price: "+$2k" },
	{ id: "admin", label: "Admin Dashboard", price: "+$3k" },
	{ id: "ai", label: "AI Integration (LLMs)", price: "+$5k" },
];

export function StepFeatures({ value, onChange, onNext }: StepFeaturesProps) {
	const toggleFeature = (id: string) => {
		if (value.includes(id)) {
			onChange(value.filter((v) => v !== id));
		} else {
			onChange([...value, id]);
		}
	};

	return (
		<div className="space-y-8">
			<div className="text-center">
				<h2 className="font-bold font-display text-2xl">Key Features</h2>
				<p className="mt-2 text-muted-foreground">
					Select the main components you need.
				</p>
			</div>

			<div className="grid gap-3">
				{features.map((f) => {
					const isSelected = value.includes(f.id);
					return (
						<button
							className={cn(
								"flex w-full items-center justify-between rounded-lg border p-4 transition-all hover:bg-muted/50",
								isSelected && "border-primary bg-primary/5 ring-1 ring-primary"
							)}
							key={f.id}
							onClick={() => toggleFeature(f.id)}
							type="button"
						>
							<span className="font-medium">{f.label}</span>
							<div className="flex items-center gap-3">
								<span className="font-medium text-muted-foreground text-xs">
									{f.price}
								</span>
								<div
									className={cn(
										"flex size-5 items-center justify-center rounded border transition-colors",
										isSelected
											? "border-primary bg-primary text-primary-foreground"
											: "border-input"
									)}
								>
									{isSelected && <Check className="size-3.5" />}
								</div>
							</div>
						</button>
					);
				})}
			</div>

			<Button className="w-full" onClick={onNext} size="lg">
				Calculate Estimate
			</Button>
		</div>
	);
}
