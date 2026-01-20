"use client";

import { useQuery } from "@tanstack/react-query";

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

type ProjectStatus =
	| "PENDING"
	| "IN_PROGRESS"
	| "COMPLETED"
	| "ON_HOLD"
	| "CANCELLED";

const statusConfig: Record<
	ProjectStatus,
	{ label: string; className: string }
> = {
	PENDING: {
		label: "Pending",
		className: "bg-muted text-muted-foreground",
	},
	IN_PROGRESS: {
		label: "In Progress",
		className: "bg-info/10 text-info",
	},
	COMPLETED: {
		label: "Completed",
		className: "bg-success/10 text-success",
	},
	ON_HOLD: {
		label: "On Hold",
		className: "bg-warning/10 text-warning",
	},
	CANCELLED: {
		label: "Cancelled",
		className: "bg-destructive/10 text-destructive",
	},
};

function StatusBadge({ status }: { status: ProjectStatus }) {
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

function ProgressBar({ progress }: { progress: number }) {
	return (
		<div className="relative h-2 w-full overflow-hidden rounded-none bg-muted">
			<div
				className={cn(
					"absolute inset-y-0 left-0 transition-all duration-500",
					progress === 100 ? "bg-success" : "bg-foreground"
				)}
				style={{ width: `${progress}%` }}
			/>
		</div>
	);
}

function formatDate(date: Date | string | null): string {
	if (!date) {
		return "Not set";
	}
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatRelativeTime(date: Date | string): string {
	const now = new Date();
	const d = new Date(date);
	const diffMs = now.getTime() - d.getTime();
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffHours / 24);

	if (diffHours < 1) {
		return "just now";
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
	if (diffDays < 14) {
		return "1 week ago";
	}
	if (diffDays < 30) {
		return `${Math.floor(diffDays / 7)} weeks ago`;
	}
	return formatDate(date);
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

function ProjectCardSkeleton() {
	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div className="space-y-2">
						<Skeleton className="h-5 w-48" />
						<Skeleton className="h-4 w-72" />
					</div>
					<Skeleton className="h-6 w-20" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div>
						<div className="mb-2 flex items-center justify-between">
							<Skeleton className="h-3 w-16" />
							<Skeleton className="h-3 w-8" />
						</div>
						<Skeleton className="h-2 w-full" />
					</div>
					<div className="grid gap-4 sm:grid-cols-3">
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default function ProjectsPage() {
	const {
		data: projects,
		isLoading,
		isError,
	} = useQuery(trpc.portal.getProjects.queryOptions());

	const activeProjects =
		projects?.filter(
			(p) => p.status === "IN_PROGRESS" || p.status === "PENDING"
		) ?? [];
	const completedProjects =
		projects?.filter((p) => p.status === "COMPLETED") ?? [];
	const onHoldProjects = projects?.filter((p) => p.status === "ON_HOLD") ?? [];

	return (
		<div className="p-6 lg:p-8">
			{/* Page Header */}
			<div className="mb-8">
				<h1 className="font-medium text-2xl tracking-tight">Projects</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Track the progress of your ongoing projects and view completed work.
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
									{projects?.length ?? 0}
								</div>
								<p className="text-muted-foreground text-xs">Total Projects</p>
							</CardContent>
						</Card>
						<Card size="sm">
							<CardContent className="pt-4">
								<div className="font-medium text-2xl">
									{activeProjects.length}
								</div>
								<p className="text-muted-foreground text-xs">Active</p>
							</CardContent>
						</Card>
						<Card size="sm">
							<CardContent className="pt-4">
								<div className="font-medium text-2xl">
									{completedProjects.length}
								</div>
								<p className="text-muted-foreground text-xs">Completed</p>
							</CardContent>
						</Card>
						<Card size="sm">
							<CardContent className="pt-4">
								<div className="font-medium text-2xl">
									{onHoldProjects.length}
								</div>
								<p className="text-muted-foreground text-xs">On Hold</p>
							</CardContent>
						</Card>
					</>
				)}
			</div>

			{/* Projects List */}
			<div className="space-y-4">
				{isLoading && (
					<>
						<ProjectCardSkeleton />
						<ProjectCardSkeleton />
						<ProjectCardSkeleton />
					</>
				)}
				{!isLoading && isError && (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<p className="text-muted-foreground text-sm">
								Unable to load projects. Please try again later.
							</p>
						</CardContent>
					</Card>
				)}
				{!(isLoading || isError) &&
					projects &&
					projects.length > 0 &&
					projects.map((project) => (
						<Card key={project.id}>
							<CardHeader>
								<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
									<div>
										<CardTitle>{project.title}</CardTitle>
										{project.description && (
											<CardDescription className="mt-1">
												{project.description}
											</CardDescription>
										)}
									</div>
									<StatusBadge status={project.status as ProjectStatus} />
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{/* Progress */}
									<div>
										<div className="mb-2 flex items-center justify-between">
											<span className="text-muted-foreground text-xs">
												Progress
											</span>
											<span className="font-medium text-xs">
												{project.progress}%
											</span>
										</div>
										<ProgressBar progress={project.progress} />
									</div>

									{/* Project Details */}
									<div className="grid gap-4 text-xs sm:grid-cols-3">
										<div>
											<span className="text-muted-foreground">Start Date</span>
											<p className="mt-1 font-medium">
												{formatDate(project.startDate)}
											</p>
										</div>
										<div>
											<span className="text-muted-foreground">
												Estimated Completion
											</span>
											<p className="mt-1 font-medium">
												{formatDate(project.endDate)}
											</p>
										</div>
										<div>
											<span className="text-muted-foreground">
												Last Updated
											</span>
											<p className="mt-1 font-medium">
												{formatRelativeTime(project.updatedAt)}
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				{!(isLoading || isError) && (!projects || projects.length === 0) && (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<p className="text-muted-foreground text-sm">
								No projects found. Projects will appear here once they are
								created.
							</p>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
