"use client";

import { Laptop, MonitorSmartphone, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepPlatformProps {
	value: "web" | "mobile" | "both" | null;
	onChange: (val: "web" | "mobile" | "both") => void;
	onNext: () => void;
}

const platforms = [
	{
		id: "web",
		title: "Web App",
		description: "SaaS platforms, admin dashboards, portals.",
		icon: Laptop,
	},
	{
		id: "mobile",
		title: "Mobile App",
		description: "iOS & Android native feel apps.",
		icon: Smartphone,
	},
	{
		id: "both",
		title: "Web & Mobile",
		description: "Complete cross-platform solution.",
		icon: MonitorSmartphone,
	},
] as const;

export function StepPlatform({ value, onChange, onNext }: StepPlatformProps) {
	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="font-bold font-display text-2xl">
					What are we building?
				</h2>
				<p className="mt-2 text-muted-foreground">
					Select the target platform for your project.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				{platforms.map((p) => {
					const Icon = p.icon;
					const isSelected = value === p.id;
					return (
						<button
							className={cn(
								"group relative flex flex-col items-center justify-center gap-4 rounded-xl border p-6 text-center transition-all hover:border-primary/50",
								isSelected
									? "border-primary bg-primary/5 ring-1 ring-primary"
									: "bg-card"
							)}
							key={p.id}
							onClick={() => {
								onChange(p.id);
								// Auto advance after short delay for better UX? Or let user click next.
								// Let's auto advance for single selection steps usually feels snappy.
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
								<h3 className="font-semibold">{p.title}</h3>
								<p className="mt-1 text-muted-foreground text-xs">
									{p.description}
								</p>
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}
