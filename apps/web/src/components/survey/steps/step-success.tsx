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
		<div className="relative flex w-full max-w-lg flex-col items-center gap-8 text-center">
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
					className="absolute inset-0 rounded-full border-2 border-cta"
					transition={{
						duration: 2,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
				/>

				{/* Main checkmark container */}
				<div className="flex size-24 items-center justify-center rounded-full border-2 border-cta bg-cta/10">
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
						<Check className="size-12 text-cta" strokeWidth={3} />
					</motion.div>
				</div>
			</motion.div>

			{/* Success Message */}
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="space-y-2"
				initial={{ opacity: 0, y: 20 }}
				transition={{ delay: 0.5, duration: 0.5 }}
			>
				<h2 className="font-medium text-2xl">Meeting Scheduled!</h2>
				<p className="text-muted-foreground text-sm">
					{contact?.name
						? `Thanks ${contact.name}, we're looking forward to meeting you.`
						: "We're looking forward to meeting you."}
				</p>
			</motion.div>

			{/* Meeting Details Card */}
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="w-full space-y-4 border border-gray-800 bg-gray-900/50 p-6"
				initial={{ opacity: 0, y: 20 }}
				transition={{ delay: 0.7, duration: 0.5 }}
			>
				<div className="space-y-4">
					{/* Date and Time */}
					<div className="flex items-start gap-4">
						<div className="flex size-10 shrink-0 items-center justify-center border border-gray-700 bg-gray-800">
							<Calendar className="size-5 text-gray-400" />
						</div>
						<div className="text-left">
							<p className="font-medium text-sm">{formatDate(meeting.date)}</p>
							<p className="text-muted-foreground text-xs">
								{formatTime(meeting.date)}
							</p>
						</div>
					</div>

					{/* Meeting Type */}
					<div className="flex items-start gap-4">
						<div className="flex size-10 shrink-0 items-center justify-center border border-gray-700 bg-gray-800">
							<Video className="size-5 text-gray-400" />
						</div>
						<div className="text-left">
							<p className="font-medium text-sm">{meeting.meetingType}</p>
							<p className="text-muted-foreground text-xs">
								Video call via Google Meet
							</p>
						</div>
					</div>

					{/* Google Meet Link */}
					<div className="flex items-start gap-4">
						<div className="flex size-10 shrink-0 items-center justify-center border border-gray-700 bg-gray-800">
							<ExternalLink className="size-5 text-gray-400" />
						</div>
						<div className="text-left">
							<p className="font-medium text-sm">Meeting Link</p>
							<a
								className="inline-flex items-center gap-1 text-cta text-xs transition-colors hover:text-cta-dark"
								href={meeting.meetLink}
								rel="noopener noreferrer"
								target="_blank"
							>
								{meeting.meetLink}
								<ExternalLink className="size-3" />
							</a>
						</div>
					</div>
				</div>
			</motion.div>

			{/* Action Buttons */}
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center"
				initial={{ opacity: 0, y: 20 }}
				transition={{ delay: 0.9, duration: 0.5 }}
			>
				<Button
					className="min-w-40 gap-2 bg-cta text-white hover:bg-cta-dark"
					onClick={handleAddToCalendar}
					type="button"
				>
					<Calendar className="size-4" />
					Add to Calendar
				</Button>

				<Link
					className="inline-flex h-10 min-w-40 items-center justify-center gap-2 border border-input bg-background px-4 py-2 font-medium text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					href="/"
				>
					<Home className="size-4" />
					Back to Home
				</Link>
			</motion.div>

			{/* Confirmation Email Note */}
			<motion.p
				animate={{ opacity: 1 }}
				className="text-muted-foreground text-xs"
				initial={{ opacity: 0 }}
				transition={{ delay: 1.1, duration: 0.5 }}
			>
				A confirmation email has been sent to{" "}
				{contact?.email ?? "your email address"}.
			</motion.p>
		</div>
	);
}
