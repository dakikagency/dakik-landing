"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";

function ProjectIcon({ className }: { className?: string }) {
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
				d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
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

function ContractIcon({ className }: { className?: string }) {
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
				d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function ArrowRightIcon({ className }: { className?: string }) {
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
				d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function formatRelativeTime(date: Date | string): string {
	const now = new Date();
	const diffMs = now.getTime() - new Date(date).getTime();
	const diffSeconds = Math.floor(diffMs / 1000);
	const diffMinutes = Math.floor(diffSeconds / 60);
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffSeconds < 60) {
		return "just now";
	}
	if (diffMinutes < 60) {
		return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
	}
	if (diffHours < 24) {
		return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
	}
	if (diffDays === 1) {
		return "yesterday";
	}
	if (diffDays < 7) {
		return `${diffDays} days ago`;
	}
	return new Date(date).toLocaleDateString();
}

function OverviewCardSkeleton() {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="size-5" />
			</CardHeader>
			<CardContent>
				<Skeleton className="mb-1 h-8 w-12" />
				<Skeleton className="h-3 w-20" />
			</CardContent>
		</Card>
	);
}

function ActivitySkeleton() {
	return (
		<div className="space-y-4">
			{[1, 2, 3, 4].map((i) => (
				<div
					className="flex items-start gap-4 border-border border-b pb-4 last:border-0 last:pb-0"
					key={i}
				>
					<Skeleton className="size-10 rounded-full" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-3 w-24" />
					</div>
					<Skeleton className="h-3 w-16" />
				</div>
			))}
		</div>
	);
}

export default function PortalDashboard() {
	const { data, isLoading, isError } = useQuery(
		trpc.portal.getDashboardOverview.queryOptions()
	);

	return (
		<div className="p-6 lg:p-8">
			{/* Page Header */}
			<div className="mb-8">
				<h1 className="font-medium text-2xl tracking-tight">Dashboard</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Welcome back. Here's an overview of your projects and activities.
				</p>
			</div>

			{/* Overview Cards */}
			<div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{isLoading && (
					<>
						<OverviewCardSkeleton />
						<OverviewCardSkeleton />
						<OverviewCardSkeleton />
					</>
				)}
				{!isLoading && isError && (
					<Card className="sm:col-span-2 lg:col-span-3">
						<CardContent className="py-8 text-center text-muted-foreground">
							Unable to load dashboard data. Please try again later.
						</CardContent>
					</Card>
				)}
				{!(isLoading || isError) && (
					<>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="font-medium text-sm">
									Active Projects
								</CardTitle>
								<ProjectIcon className="size-5 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="font-medium text-3xl">
									{data?.activeProjects ?? 0}
								</div>
								<p className="mt-1 text-muted-foreground text-xs">
									Projects in progress
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="font-medium text-sm">
									Upcoming Meetings
								</CardTitle>
								<CalendarIcon className="size-5 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="font-medium text-3xl">
									{data?.upcomingMeetings ?? 0}
								</div>
								<p className="mt-1 text-muted-foreground text-xs">
									Scheduled this week
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="font-medium text-sm">
									Pending Contracts
								</CardTitle>
								<ContractIcon className="size-5 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="font-medium text-3xl">
									{data?.pendingContracts ?? 0}
								</div>
								<p className="mt-1 text-muted-foreground text-xs">
									Awaiting signature
								</p>
							</CardContent>
						</Card>
					</>
				)}
			</div>

			{/* Recent Activity & Quick Actions */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Recent Activity */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
						<CardDescription>
							Your latest project updates and notifications
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading && <ActivitySkeleton />}
						{!isLoading && isError && (
							<p className="py-4 text-center text-muted-foreground text-sm">
								Unable to load activity.
							</p>
						)}
						{!(isLoading || isError) &&
							data?.recentActivity &&
							data.recentActivity.length > 0 && (
								<div className="space-y-4">
									{data.recentActivity.map((activity) => (
										<div
											className="flex items-start gap-4 border-border border-b pb-4 last:border-0 last:pb-0"
											key={activity.id}
										>
											<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
												{activity.type === "project" && (
													<ProjectIcon className="size-5 text-muted-foreground" />
												)}
												{activity.type === "meeting" && (
													<CalendarIcon className="size-5 text-muted-foreground" />
												)}
												{activity.type === "contract" && (
													<ContractIcon className="size-5 text-muted-foreground" />
												)}
											</div>
											<div className="flex-1">
												<p className="font-medium text-sm">{activity.title}</p>
												<p className="text-muted-foreground text-xs">
													{activity.description}
												</p>
											</div>
											<span className="shrink-0 text-muted-foreground text-xs">
												{formatRelativeTime(activity.date)}
											</span>
										</div>
									))}
								</div>
							)}
						{!(isLoading || isError) &&
							(!data?.recentActivity || data.recentActivity.length === 0) && (
								<p className="py-4 text-center text-muted-foreground text-sm">
									No recent activity. Your project updates will appear here.
								</p>
							)}
					</CardContent>
				</Card>

				{/* Quick Actions */}
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
						<CardDescription>Common tasks and shortcuts</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<Link className="block" href="/portal/projects">
								<Button className="w-full justify-between" variant="outline">
									View Projects
									<ArrowRightIcon className="size-4" />
								</Button>
							</Link>
							<Link className="block" href="/portal/contracts">
								<Button className="w-full justify-between" variant="outline">
									Review Contracts
									<ArrowRightIcon className="size-4" />
								</Button>
							</Link>
							<Link className="block" href="/portal/meetings">
								<Button className="w-full justify-between" variant="outline">
									View Meetings
									<ArrowRightIcon className="size-4" />
								</Button>
							</Link>
							<Link className="block" href="/portal/qanda">
								<Button className="w-full justify-between" variant="outline">
									Ask a Question
									<ArrowRightIcon className="size-4" />
								</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
