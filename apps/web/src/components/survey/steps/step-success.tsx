"use client";

import { motion } from "framer-motion";
import { Calendar, Check, ExternalLink, Home, Video } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { useSurvey } from "../survey-context";

// Confetti particle component
function ConfettiParticle({
	delay,
	x,
	color,
}: {
	delay: number;
	x: number;
	color: string;
}) {
	return (
		<motion.div
			animate={{
				y: [0, -200, 400],
				x: [0, x, x * 1.5],
				opacity: [1, 1, 0],
				rotate: [0, 180, 360],
			}}
			className="absolute top-1/2 left-1/2 h-2 w-2"
			initial={{ y: 0, x: 0, opacity: 0 }}
			style={{ backgroundColor: color }}
			transition={{
				duration: 2.5,
				delay,
				ease: [0.23, 1, 0.32, 1],
			}}
		/>
	);
}

// Generate confetti particles
function Confetti() {
	const colors = ["#d2141c", "#ffffff", "#404040", "#737373", "#d4d4d4"];
	const particles = Array.from({ length: 30 }, (_, i) => ({
		id: i,
		delay: Math.random() * 0.5,
		x: (Math.random() - 0.5) * 400,
		color: colors[Math.floor(Math.random() * colors.length)],
	}));

	return (
		<div className="pointer-events-none absolute inset-0 overflow-hidden">
			{particles.map((particle) => (
				<ConfettiParticle
					color={particle.color}
					delay={particle.delay}
					key={particle.id}
					x={particle.x}
				/>
			))}
		</div>
	);
}

function formatDate(date: Date): string {
	return date.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

function formatTime(date: Date): string {
	return date.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
}

export function StepSuccess() {
	const { scheduledMeeting, contact } = useSurvey();

	// Fallback meeting data for display if not set
	const meeting = scheduledMeeting ?? {
		date: new Date(),
		meetingType: "30 min Discovery Call",
		meetLink: "https://meet.google.com/xxx-xxxx-xxx",
	};

	const handleAddToCalendar = () => {
		// Generate Google Calendar URL
		const startTime = meeting.date;
		const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 minutes later

		const formatForCalendar = (d: Date) =>
			`${d.toISOString().replaceAll(/[-:]/g, "").split(".")[0]}Z`;

		const calendarUrl = new URL("https://calendar.google.com/calendar/render");
		calendarUrl.searchParams.set("action", "TEMPLATE");
		calendarUrl.searchParams.set("text", meeting.meetingType);
		calendarUrl.searchParams.set(
			"dates",
			`${formatForCalendar(startTime)}/${formatForCalendar(endTime)}`
		);
		calendarUrl.searchParams.set(
			"details",
			`Discovery call with Dakik Studio\n\nJoin via Google Meet: ${meeting.meetLink}`
		);
		calendarUrl.searchParams.set("location", meeting.meetLink);

		window.open(calendarUrl.toString(), "_blank", "noopener,noreferrer");
	};

	return (
		<div className="relative flex w-full max-w-2xl flex-col items-center gap-12 text-center">
			<Confetti />

			{/* Animated Checkmark */}
			<motion.div
				animate={{ scale: 1, opacity: 1 }}
				className="relative"
				initial={{ scale: 0, opacity: 0 }}
				transition={{
					type: "spring",
					stiffness: 200,
					damping: 15,
					delay: 0.2,
				}}
			>
				{/* Outer ring pulse animation */}
				<motion.div
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.5, 0, 0.5],
					}}
					className="absolute inset-0 border-2 border-cta"
					transition={{
						duration: 2,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
				/>

				{/* Main checkmark container */}
				<div className="flex size-28 items-center justify-center border-2 border-cta bg-cta/10">
					<motion.div
						animate={{ scale: 1 }}
						initial={{ scale: 0 }}
						transition={{
							type: "spring",
							stiffness: 300,
							damping: 20,
							delay: 0.4,
						}}
					>
						<Check className="size-14 text-cta" strokeWidth={3} />
					</motion.div>
				</div>
			</motion.div>

			{/* Success Message */}
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="space-y-4"
				initial={{ opacity: 0, y: 20 }}
				transition={{ delay: 0.5, duration: 0.5 }}
			>
				<h2 className="font-black font-display text-4xl uppercase tracking-tight lg:text-6xl">
					Meeting Scheduled!
				</h2>
				<p className="mx-auto max-w-md text-foreground/60 text-lg">
					{contact?.name
						? `Thanks ${contact.name}, we're looking forward to meeting you.`
						: "We're looking forward to meeting you."}
				</p>
			</motion.div>

			{/* Meeting Details Card */}
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="w-full space-y-6 border-2 border-foreground/10 bg-muted/30 p-8"
				initial={{ opacity: 0, y: 20 }}
				transition={{ delay: 0.7, duration: 0.5 }}
			>
				<div className="space-y-5">
					{/* Date and Time */}
					<div className="flex items-start gap-5">
						<div className="flex size-12 shrink-0 items-center justify-center border-2 border-foreground/20 bg-background">
							<Calendar className="size-6 text-foreground/60" />
						</div>
						<div className="text-left">
							<p className="font-semibold text-base">
								{formatDate(meeting.date)}
							</p>
							<p className="text-foreground/60 text-sm">
								{formatTime(meeting.date)}
							</p>
						</div>
					</div>

					{/* Meeting Type */}
					<div className="flex items-start gap-5">
						<div className="flex size-12 shrink-0 items-center justify-center border-2 border-foreground/20 bg-background">
							<Video className="size-6 text-foreground/60" />
						</div>
						<div className="text-left">
							<p className="font-semibold text-base">{meeting.meetingType}</p>
							<p className="text-foreground/60 text-sm">
								Video call via Google Meet
							</p>
						</div>
					</div>

					{/* Google Meet Link */}
					<div className="flex items-start gap-5">
						<div className="flex size-12 shrink-0 items-center justify-center border-2 border-foreground/20 bg-background">
							<ExternalLink className="size-6 text-foreground/60" />
						</div>
						<div className="text-left">
							<p className="font-semibold text-base">Meeting Link</p>
							<a
								className="inline-flex items-center gap-1 text-cta text-sm transition-colors hover:text-cta-dark"
								href={meeting.meetLink}
								rel="noopener noreferrer"
								target="_blank"
							>
								{meeting.meetLink}
								<ExternalLink className="size-4" />
							</a>
						</div>
					</div>
				</div>
			</motion.div>

			{/* Action Buttons */}
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center"
				initial={{ opacity: 0, y: 20 }}
				transition={{ delay: 0.9, duration: 0.5 }}
			>
				<Button
					className="h-14 min-w-48 gap-2 border-2 border-cta bg-cta text-base text-white transition-all hover:bg-transparent hover:text-cta"
					onClick={handleAddToCalendar}
					type="button"
				>
					<Calendar className="size-5" />
					Add to Calendar
				</Button>

				<Link
					className="inline-flex h-14 min-w-48 items-center justify-center gap-2 border-2 border-foreground bg-transparent px-6 font-medium text-base text-foreground transition-all hover:bg-foreground hover:text-background"
					href="/"
				>
					<Home className="size-5" />
					Back to Home
				</Link>
			</motion.div>

			{/* Confirmation Email Note */}
			<motion.p
				animate={{ opacity: 1 }}
				className="text-foreground/50 text-sm"
				initial={{ opacity: 0 }}
				transition={{ delay: 1.1, duration: 0.5 }}
			>
				A confirmation email has been sent to{" "}
				{contact?.email ?? "your email address"}.
			</motion.p>
		</div>
	);
}
