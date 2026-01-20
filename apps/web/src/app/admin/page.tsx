"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ActivityIcon,
	CalendarIcon,
	InboxIcon,
	TrendingUpIcon,
	UsersIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";

function MetricCard({
	title,
	value,
	description,
	icon: Icon,
	trend,
	isLoading,
}: {
	title: string;
	value: string | number;
	description?: string;
	icon: React.ElementType;
	trend?: { value: number; isPositive: boolean };
	isLoading?: boolean;
}) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="font-medium text-xs">{title}</CardTitle>
				<Icon className="size-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<Skeleton className="h-7 w-20" />
				) : (
					<div className="font-bold font-display text-2xl">{value}</div>
				)}
				{description && (
					<p className="mt-1 text-muted-foreground text-xs">{description}</p>
				)}
				{trend && (
					<div className="mt-1 flex items-center gap-1">
						<TrendingUpIcon
							className={`size-3 ${trend.isPositive ? "text-emerald-500" : "rotate-180 text-red-500"}`}
						/>
						<span
							className={`text-xs ${trend.isPositive ? "text-emerald-500" : "text-red-500"}`}
						>
							{trend.value}%
						</span>
						<span className="text-muted-foreground text-xs">
							from last month
						</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function RecentLeadItem({
	name,
	email,
	projectType,
	status,
	createdAt,
}: {
	name: string | null;
	email: string | null;
	projectType: string | null;
	status: string;
	createdAt: Date | string;
}) {
	const statusVariant = {
		NEW: "info",
		CONTACTED: "warning",
		MEETING_SCHEDULED: "secondary",
		MEETING_COMPLETED: "secondary",
		CONVERTED: "success",
		CLOSED: "outline",
	}[status] as "info" | "warning" | "secondary" | "success" | "outline";

	const projectTypeLabel = projectType
		? ({
				AI_AUTOMATION: "AI Automation",
				BRAND_IDENTITY: "Brand Identity",
				WEB_MOBILE: "Web & Mobile",
				FULL_PRODUCT: "Full Product",
			}[projectType] ?? projectType)
		: "Project type not specified";

	return (
		<div className="flex items-center justify-between border-b py-3 last:border-0">
			<div className="space-y-1">
				<p className="font-medium text-sm">{name ?? "Unnamed lead"}</p>
				<p className="text-muted-foreground text-xs">
					{email ?? "No email provided"}
				</p>
				<p className="text-muted-foreground text-xs">{projectTypeLabel}</p>
			</div>
			<div className="flex flex-col items-end gap-1">
				<Badge variant={statusVariant}>{status.replace(/_/g, " ")}</Badge>
				<span className="text-muted-foreground text-xs">
					{new Date(createdAt).toLocaleDateString()}
				</span>
			</div>
		</div>
	);
}

function ActivityItem({
	type,
	description,
	timestamp,
}: {
	type: "lead" | "meeting" | "customer" | "project";
	description: string;
	timestamp: Date | string;
}) {
	const icons = {
		lead: InboxIcon,
		meeting: CalendarIcon,
		customer: UsersIcon,
		project: ActivityIcon,
	};
	const Icon = icons[type];

	return (
		<div className="flex items-start gap-3 border-b py-3 last:border-0">
			<div className="mt-0.5 rounded-none bg-muted p-1.5">
				<Icon className="size-3" />
			</div>
			<div className="flex-1 space-y-1">
				<p className="text-xs">{description}</p>
				<p className="text-muted-foreground text-xs">
					{new Date(timestamp).toLocaleString()}
				</p>
			</div>
		</div>
	);
}

export default function AdminDashboard() {
	const { data: metrics, isLoading: metricsLoading } = useQuery(
		trpc.admin.getDashboardMetrics.queryOptions()
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="font-bold font-display text-2xl tracking-tight">
					Dashboard
				</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Overview of your business metrics and recent activity.
				</p>
			</div>

			{/* Metrics Grid */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					description="Active accounts"
					icon={UsersIcon}
					isLoading={metricsLoading}
					title="Total Customers"
					value={metrics?.totalCustomers ?? 0}
				/>
				<MetricCard
					description="In progress"
					icon={ActivityIcon}
					isLoading={metricsLoading}
					title="Active Projects"
					value={metrics?.activeProjects ?? 0}
				/>
				<MetricCard
					description="This week"
					icon={InboxIcon}
					isLoading={metricsLoading}
					title="New Leads"
					value={metrics?.newLeadsThisWeek ?? 0}
				/>
				<MetricCard
					description="Scheduled"
					icon={CalendarIcon}
					isLoading={metricsLoading}
					title="Upcoming Meetings"
					value={metrics?.upcomingMeetings ?? 0}
				/>
			</div>

			{/* Recent Activity Grid */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Recent Leads */}
				<Card>
					<CardHeader>
						<CardTitle>Recent Leads</CardTitle>
						<CardDescription>
							Latest survey submissions from potential clients
						</CardDescription>
					</CardHeader>
					<CardContent>
						{metricsLoading && (
							<div className="space-y-3">
								{Array.from({ length: 5 }, (_, i) => i).map((index) => (
									<div
										className="flex items-center justify-between py-3"
										key={`lead-skeleton-${index}`}
									>
										<div className="space-y-2">
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-3 w-48" />
										</div>
										<Skeleton className="h-5 w-16" />
									</div>
								))}
							</div>
						)}
						{!metricsLoading && metrics?.recentLeads?.length === 0 && (
							<p className="py-8 text-center text-muted-foreground text-sm">
								No leads yet
							</p>
						)}
						{!metricsLoading &&
							metrics?.recentLeads &&
							metrics.recentLeads.length > 0 && (
								<div>
									{metrics?.recentLeads?.map((lead) => (
										<RecentLeadItem
											createdAt={lead.createdAt}
											email={lead.email}
											key={lead.id}
											name={lead.name}
											projectType={lead.projectType}
											status={lead.status}
										/>
									))}
								</div>
							)}
					</CardContent>
				</Card>

				{/* Recent Activity */}
				<Card>
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
						<CardDescription>
							Latest updates across the platform
						</CardDescription>
					</CardHeader>
					<CardContent>
						{metricsLoading && (
							<div className="space-y-3">
								{Array.from({ length: 5 }, (_, i) => i).map((index) => (
									<div
										className="flex items-start gap-3 py-3"
										key={`activity-skeleton-${index}`}
									>
										<Skeleton className="size-7" />
										<div className="flex-1 space-y-2">
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-3 w-24" />
										</div>
									</div>
								))}
							</div>
						)}
						{!metricsLoading && metrics?.recentActivity?.length === 0 && (
							<p className="py-8 text-center text-muted-foreground text-sm">
								No activity yet
							</p>
						)}
						{!metricsLoading &&
							metrics?.recentLeads &&
							metrics.recentLeads.length > 0 && (
								<div>
									{metrics?.recentActivity?.map((activity, index) => (
										<ActivityItem
											description={activity.description}
											key={`activity-${activity.type}-${new Date(activity.timestamp).getTime()}-${index}`}
											timestamp={activity.timestamp}
											type={activity.type}
										/>
									))}
								</div>
							)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
