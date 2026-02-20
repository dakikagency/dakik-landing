"use client";

import { motion } from "framer-motion";
import { UserCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { useSurvey } from "../survey-context";

export function StepDuplicateEmail() {
	const { currentStep, goToStep } = useSurvey();

	const handleUseDifferentEmail = () => {
		goToStep(Math.floor(currentStep));
	};

	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className="flex max-w-md flex-col items-center gap-8 text-center"
			initial={{ opacity: 0, y: 20 }}
			transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
		>
			<motion.div
				animate={{ scale: 1, opacity: 1 }}
				className="flex size-20 items-center justify-center border border-foreground/20 bg-muted"
				initial={{ scale: 0.8, opacity: 0 }}
				transition={{ delay: 0.1, duration: 0.3 }}
			>
				<UserCircle className="size-10 text-foreground" />
			</motion.div>

			<div className="space-y-3">
				<motion.h2
					animate={{ opacity: 1, y: 0 }}
					className="font-medium text-2xl"
					initial={{ opacity: 0, y: 10 }}
					transition={{ delay: 0.2, duration: 0.3 }}
				>
					Looks like you're already with us!
				</motion.h2>
				<motion.p
					animate={{ opacity: 1, y: 0 }}
					className="text-muted-foreground text-sm"
					initial={{ opacity: 0, y: 10 }}
					transition={{ delay: 0.3, duration: 0.3 }}
				>
					An account with this email already exists.
				</motion.p>
			</div>

			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center"
				initial={{ opacity: 0, y: 10 }}
				transition={{ delay: 0.4, duration: 0.3 }}
			>
				<Link
					className="inline-flex h-10 min-w-40 items-center justify-center gap-2 bg-primary px-4 py-2 font-medium text-primary-foreground text-sm ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					href="/login"
				>
					Sign In
				</Link>
				<Button
					className="min-w-40"
					onClick={handleUseDifferentEmail}
					variant="outline"
				>
					Use a different email
				</Button>
			</motion.div>
		</motion.div>
	);
}
