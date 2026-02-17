"use client";

import { Palette, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepDesignProps {
	value: "ready" | "needed" | null;
	onChange: (val: "ready" | "needed") => void;
	onNext: () => void;
}

const options = [
	{
		id: "ready",
		title: "I have a design",
		description: "Figma files are ready to be implemented.",
		icon: Palette,
	},
	{
		id: "needed",
		title: "I need design",
		description: "Starting from scratch or wireframes.",
		icon: PenTool,
	},
] as const;

export function StepDesign({ value, onChange, onNext }: StepDesignProps) {
	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="font-bold font-display text-2xl">Design Status</h2>
				<p className="mt-2 text-muted-foreground">
					Do you already have high-fidelity designs?
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{options.map((o) => {
					const Icon = o.icon;
					const isSelected = value === o.id;
					return (
						<button
							className={cn(
								"group relative flex flex-col items-center justify-center gap-4 rounded-xl border p-8 text-center transition-all hover:border-primary/50",
								isSelected
									? "border-primary bg-primary/5 ring-1 ring-primary"
									: "bg-card"
							)}
							key={o.id}
							onClick={() => {
								onChange(o.id);
								setTimeout(onNext, 300);
							}}
							type="button"
						>
							<div
								className={cn(
									"flex h-12 w-12 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary/10",
									isSelected && "bg-primary/10 text-primary"
								)}
							>
								<Icon className="size-6" />
							</div>
							<div>
								<h3 className="font-semibold">{o.title}</h3>
								<p className="mt-1 text-muted-foreground text-xs">
									{o.description}
								</p>
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}
