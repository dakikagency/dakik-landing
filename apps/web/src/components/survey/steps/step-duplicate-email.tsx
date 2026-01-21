"use client";

import { motion } from "framer-motion";
import { UserCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { useSurvey } from "../survey-context";

export function StepDuplicateEmail() {
	const { goToStep } = useSurvey();

	const handleUseDifferentEmail = () => {
		goToStep(2);
	};

	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className="flex max-w-xl flex-col items-center gap-12 text-center"
			initial={{ opacity: 0, y: 20 }}
			transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
		>
			<motion.div
				animate={{ scale: 1, opacity: 1 }}
				className="flex size-28 items-center justify-center border-2 border-foreground/20 bg-muted/30"
				initial={{ scale: 0.8, opacity: 0 }}
				transition={{ delay: 0.1, duration: 0.3 }}
			>
				<UserCircle className="size-14 text-foreground" />
			</motion.div>

			<div className="space-y-4">
				<motion.h2
					animate={{ opacity: 1, y: 0 }}
					className="font-black font-display text-4xl uppercase tracking-tight lg:text-6xl"
					initial={{ opacity: 0, y: 10 }}
					transition={{ delay: 0.2, duration: 0.3 }}
				>
					Already with us!
				</motion.h2>
				<motion.p
					animate={{ opacity: 1, y: 0 }}
					className="mx-auto max-w-md text-foreground/60 text-lg"
					initial={{ opacity: 0, y: 10 }}
					transition={{ delay: 0.3, duration: 0.3 }}
				>
					An account with this email already exists.
				</motion.p>
			</div>

			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center"
				initial={{ opacity: 0, y: 10 }}
				transition={{ delay: 0.4, duration: 0.3 }}
			>
				<Link
					className="inline-flex h-14 min-w-48 items-center justify-center gap-2 border-2 border-foreground bg-foreground px-6 font-medium text-background text-base transition-all hover:bg-background hover:text-foreground"
					href="/login"
				>
					Sign In
				</Link>
				<Button
					className="h-14 min-w-48 border-2 border-foreground/20 bg-transparent text-base text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background"
					onClick={handleUseDifferentEmail}
					variant="ghost"
				>
					Use a different email
				</Button>
			</motion.div>
		</motion.div>
	);
}
