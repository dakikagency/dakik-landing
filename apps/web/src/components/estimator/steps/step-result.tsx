"use client";

import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { submitEstimatorLead } from "@/actions/estimator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StepResultProps {
	formData: {
		platform: "web" | "mobile" | "both";
		designStatus: "ready" | "needed";
		features: string[];
	};
}

export function StepResult({ formData }: StepResultProps) {
	const [email, setEmail] = useState("");
	const [result, setResult] = useState<{ min: number; max: number } | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) {
			return;
		}

		setIsLoading(true);
		try {
			const response = await submitEstimatorLead({
				email,
				...formData,
			});

			if (response.success && response.minPrice && response.maxPrice) {
				setResult({ min: response.minPrice, max: response.maxPrice });
			} else {
				toast.error(response.error || "Failed to calculate estimate");
			}
		} catch (_error) {
			toast.error("Something went wrong");
		} finally {
			setIsLoading(false);
		}
	};

	if (result) {
		return (
			<div className="space-y-8 text-center">
				<div className="space-y-2">
					<h2 className="font-bold font-display text-2xl">Estimated Cost</h2>
					<p className="text-muted-foreground">Based on your selection.</p>
				</div>

				<div className="py-8">
					<span className="font-bold font-display text-5xl text-primary tracking-tight">
						${(result.min / 1000).toFixed(0)}k - $
						{(result.max / 1000).toFixed(0)}k
					</span>
					<p className="mt-2 text-muted-foreground text-sm">
						Estimated timeline: 4-6 weeks
					</p>
				</div>

				<div className="space-y-4 rounded-xl bg-muted/50 p-6">
					<p className="font-medium text-sm">Ready to start?</p>
					{/* biome-ignore lint/a11y/useAnchorContent: Content is provided by Button children via Base UI render prop */}
					<Button className="w-full" render={<a href="/contact" />} size="lg">
						Book a detailed sprint call
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 text-center">
			<div className="space-y-2">
				<h2 className="font-bold font-display text-2xl">
					Your estimate is ready
				</h2>
				<p className="text-muted-foreground">
					Enter your email to see the pricing breakdown.
				</p>
			</div>

			<form className="mx-auto max-w-sm space-y-4" onSubmit={handleSubmit}>
				<div className="relative">
					<Mail className="absolute top-3 left-3 size-4 text-muted-foreground" />
					<Input
						className="pl-9"
						onChange={(e) => setEmail(e.target.value)}
						placeholder="name@company.com"
						required
						type="email"
						value={email}
					/>
				</div>
				<Button className="w-full" disabled={isLoading} size="lg" type="submit">
					{isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
					Unlock Estimate
				</Button>
				<p className="text-[10px] text-muted-foreground">
					We respect your inbox. No spam.
				</p>
			</form>
		</div>
	);
}
