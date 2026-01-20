"use client";

import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

type MeetingStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

const statusConfig: Record<
	MeetingStatus,
	{ label: string; className: string }
> = {
	SCHEDULED: {
		label: "Scheduled",
		className: "bg-info/10 text-info",
	},
	COMPLETED: {
		label: "Completed",
		className: "bg-success/10 text-success",
	},
	CANCELLED: {
		label: "Cancelled",
		className: "bg-muted text-muted-foreground",
	},
	NO_SHOW: {
		label: "No Show",
		className: "bg-destructive/10 text-destructive",
	},
};

function StatusBadge({ status }: { status: MeetingStatus }) {
	const config = statusConfig[status];
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-none px-2 py-1 font-medium text-xs",
				config.className
			)}
		>
			{config.label}
		</span>
	);
}

function CalendarIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function ClockIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function VideoIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function ExternalLinkIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function formatDate(date: Date | string): string {
	return new Date(date).toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

function formatTime(date: Date | string): string {
	return new Date(date).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
}

function formatDuration(minutes: number): string {
	if (minutes < 60) {
		return `${minutes} min`;
	}
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	if (remainingMinutes === 0) {
		return `${hours} hr`;
	}
	return `${hours} hr ${remainingMinutes} min`;
}

function isUpcoming(date: Date | string): boolean {
	return new Date(date) > new Date();
}

function StatCardSkeleton() {
	return (
		<Card size="sm">
			<CardContent className="pt-4">
				<Skeleton className="mb-1 h-6 w-8" />
				<Skeleton className="h-3 w-16" />
			</CardContent>
		</Card>
	);
}

function MeetingCardSkeleton() {
	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-3">
						<Skeleton className="mt-0.5 size-5" />
						<div className="space-y-2">
							<Skeleton className="h-5 w-48" />
							<Skeleton className="h-4 w-72" />
						</div>
					</div>
					<Skeleton className="h-6 w-20" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex flex-wrap gap-6">
					<Skeleton className="h-10 w-32" />
					<Skeleton className="h-10 w-24" />
				</div>
			</CardContent>
		</Card>
	);
}

export default function MeetingsPage() {
	const {
		data: meetings,
		isLoading,
		isError,
	} = useQuery(trpc.portal.getMeetings.queryOptions());

	const upcomingMeetings =
		meetings
			?.filter((m) => m.status === "SCHEDULED" && isUpcoming(m.scheduledAt))
			.sort(
				(a, b) =>
					new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
			) ?? [];

	const pastMeetings =
		meetings
			?.filter(
				(m) =>
					m.status === "COMPLETED" ||
					m.status === "NO_SHOW" ||
					(m.status === "SCHEDULED" && !isUpcoming(m.scheduledAt))
			)
			.sort(
				(a, b) =>
					new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
			) ?? [];

	const cancelledMeetings =
		meetings?.filter((m) => m.status === "CANCELLED") ?? [];

	return (
		<div className="p-6 lg:p-8">
			{/* Page Header */}
			<div className="mb-8">
				<h1 className="font-medium text-2xl tracking-tight">Meetings</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					View your upcoming meetings and access meeting links.
				</p>
			</div>

			{/* Summary Stats */}
			<div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{isLoading ? (
					<>
						<StatCardSkeleton />
						<StatCardSkeleton />
						<StatCardSkeleton />
						<StatCardSkeleton />
					</>
				) : (
					<>
						<Card size="sm">
							<CardContent className="pt-4">
								<div className="font-medium text-2xl">
									{meetings?.length ?? 0}
								</div>
								<p className="text-muted-foreground text-xs">Total Meetings</p>
							</CardContent>
						</Card>
						<Card size="sm">
							<CardContent className="pt-4">
								<div className="font-medium text-2xl">
									{upcomingMeetings.length}
								</div>
								<p className="text-muted-foreground text-xs">Upcoming</p>
							</CardContent>
						</Card>
						<Card size="sm">
							<CardContent className="pt-4">
								<div className="font-medium text-2xl">
									{pastMeetings.length}
								</div>
								<p className="text-muted-foreground text-xs">Completed</p>
							</CardContent>
						</Card>
						<Card size="sm">
							<CardContent className="pt-4">
								<div className="font-medium text-2xl">
									{cancelledMeetings.length}
								</div>
								<p className="text-muted-foreground text-xs">Cancelled</p>
							</CardContent>
						</Card>
					</>
				)}
			</div>

			{/* Upcoming Meetings */}
			<div className="mb-8">
				<h2 className="mb-4 font-medium text-lg">Upcoming Meetings</h2>
				{isLoading && (
					<div className="space-y-4">
						<MeetingCardSkeleton />
						<MeetingCardSkeleton />
					</div>
				)}
				{!isLoading && isError && (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-8">
							<p className="text-muted-foreground text-sm">
								Unable to load meetings. Please try again later.
							</p>
						</CardContent>
					</Card>
				)}
				{!(isLoading || isError) && upcomingMeetings.length > 0 && (
					<div className="space-y-4">
						{upcomingMeetings.map((meeting) => (
							<Card className="border-l-4 border-l-info" key={meeting.id}>
								<CardHeader>
									<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
										<div className="flex items-start gap-3">
											<VideoIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
											<div>
												<CardTitle>{meeting.title}</CardTitle>
												{meeting.description && (
													<CardDescription className="mt-1">
														{meeting.description}
													</CardDescription>
												)}
											</div>
										</div>
										<StatusBadge status={meeting.status as MeetingStatus} />
									</div>
								</CardHeader>
								<CardContent>
									<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
										<div className="flex flex-wrap gap-6 text-xs">
											<div className="flex items-center gap-2">
												<CalendarIcon className="size-4 text-muted-foreground" />
												<div>
													<p className="font-medium">
														{formatDate(meeting.scheduledAt)}
													</p>
													<p className="text-muted-foreground">
														{formatTime(meeting.scheduledAt)}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<ClockIcon className="size-4 text-muted-foreground" />
												<div>
													<p className="font-medium">Duration</p>
													<p className="text-muted-foreground">
														{formatDuration(meeting.duration)}
													</p>
												</div>
											</div>
										</div>
										{meeting.meetUrl && (
											<a
												href={meeting.meetUrl}
												rel="noopener noreferrer"
												target="_blank"
											>
												<Button size="sm" variant="default">
													<VideoIcon className="size-4" />
													Join Meeting
													<ExternalLinkIcon className="size-3" />
												</Button>
											</a>
										)}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
				{!(isLoading || isError) && upcomingMeetings.length === 0 && (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-8">
							<CalendarIcon className="mb-2 size-8 text-muted-foreground" />
							<p className="text-muted-foreground text-sm">
								No upcoming meetings scheduled.
							</p>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Past Meetings */}
			<div>
				<h2 className="mb-4 font-medium text-lg">Past Meetings</h2>
				{isLoading && (
					<div className="space-y-4">
						<MeetingCardSkeleton />
						<MeetingCardSkeleton />
					</div>
				)}
				{!isLoading && pastMeetings.length > 0 && (
					<div className="space-y-4">
						{pastMeetings.map((meeting) => (
							<Card className="opacity-75" key={meeting.id}>
								<CardHeader>
									<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
										<div className="flex items-start gap-3">
											<VideoIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
											<div>
												<CardTitle>{meeting.title}</CardTitle>
												{meeting.description && (
													<CardDescription className="mt-1">
														{meeting.description}
													</CardDescription>
												)}
											</div>
										</div>
										<StatusBadge status={meeting.status as MeetingStatus} />
									</div>
								</CardHeader>
								<CardContent>
									<div className="flex flex-wrap gap-6 text-xs">
										<div className="flex items-center gap-2">
											<CalendarIcon className="size-4 text-muted-foreground" />
											<div>
												<p className="font-medium">
													{formatDate(meeting.scheduledAt)}
												</p>
												<p className="text-muted-foreground">
													{formatTime(meeting.scheduledAt)}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<ClockIcon className="size-4 text-muted-foreground" />
											<div>
												<p className="font-medium">Duration</p>
												<p className="text-muted-foreground">
													{formatDuration(meeting.duration)}
												</p>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
				{!isLoading && pastMeetings.length === 0 && (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-8">
							<p className="text-muted-foreground text-sm">
								No past meetings to display.
							</p>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
