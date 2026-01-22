"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	ArrowLeftIcon,
	CalendarIcon,
	ClockIcon,
	DollarSignIcon,
	ExternalLinkIcon,
	FolderIcon,
	Loader2Icon,
	MailIcon,
	UserIcon,
	VideoIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, trpc } from "@/utils/trpc";

const PROJECT_TYPE_LABELS: Record<string, string> = {
	AI_AUTOMATION: "AI Automation",
	BRAND_IDENTITY: "Brand Identity",
	WEB_MOBILE: "Web & Mobile",
	FULL_PRODUCT: "Full Product",
};

const BUDGET_LABELS: Record<string, string> = {
	RANGE_5K_10K: "$5K - $10K",
	RANGE_10K_25K: "$10K - $25K",
	RANGE_25K_50K: "$25K - $50K",
	RANGE_50K_PLUS: "$50K+",
};

const STATUS_OPTIONS = [
	{ value: "NEW", label: "New" },
	{ value: "CONTACTED", label: "Contacted" },
	{ value: "MEETING_SCHEDULED", label: "Meeting Scheduled" },
	{ value: "MEETING_COMPLETED", label: "Meeting Completed" },
	{ value: "CONVERTED", label: "Converted" },
	{ value: "CLOSED", label: "Closed" },
] as const;

type LeadStatus = (typeof STATUS_OPTIONS)[number]["value"];
interface UpdateLeadStatusInput {
	leadId: string;
	status: LeadStatus;
}

const MEETING_STATUS_COLORS: Record<string, string> = {
	SCHEDULED: "bg-blue-500/10 text-blue-500",
	COMPLETED: "bg-green-500/10 text-green-500",
	CANCELLED: "bg-red-500/10 text-red-500",
	NO_SHOW: "bg-yellow-500/10 text-yellow-500",
};

function getStatusBadgeVariant(status: string) {
	const variants: Record<
		string,
		"info" | "warning" | "secondary" | "success" | "outline" | "default"
	> = {
		NEW: "info",
		CONTACTED: "warning",
		MEETING_SCHEDULED: "secondary",
		MEETING_COMPLETED: "secondary",
		CONVERTED: "success",
		CLOSED: "outline",
	};
	return variants[status] ?? "default";
}

function formatDate(date: Date | string): string {
	return new Date(date).toLocaleDateString("en-US", {
		weekday: "short",
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function formatTime(date: Date | string): string {
	return new Date(date).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
}

function formatDateTime(date: Date | string): string {
	return `${formatDate(date)} at ${formatTime(date)}`;
}

export default function LeadDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const leadId = params.id as string;

	const {
		data: lead,
		isLoading,
		isError,
	} = useQuery(trpc.admin.getLead.queryOptions({ id: leadId }));

	const updateLeadStatus = trpc.admin.updateLeadStatus as unknown as {
		mutate: (input: UpdateLeadStatusInput) => Promise<unknown>;
	};

	const updateStatusMutation = useMutation({
		mutationFn: (input: UpdateLeadStatusInput) =>
			updateLeadStatus.mutate(input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: trpc.admin.getLead.queryKey({ id: leadId }),
			});
			queryClient.invalidateQueries({
				queryKey: trpc.admin.getLeads.queryKey({}),
			});
			toast.success("Lead status updated");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update status");
		},
	});

	const handleStatusChange = (newStatus: string | null) => {
		if (!newStatus) {
			return;
		}
		updateStatusMutation.mutate({
			leadId,
			status: newStatus as LeadStatus,
		});
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Skeleton className="h-10 w-10" />
					<div className="space-y-2">
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-4 w-32" />
					</div>
				</div>
				<div className="grid gap-6 md:grid-cols-2">
					<Skeleton className="h-64" />
					<Skeleton className="h-64" />
				</div>
			</div>
		);
	}

	if (isError || !lead) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-16">
				<p className="text-muted-foreground">Lead not found</p>
				<Button onClick={() => router.push("/admin/leads" as Route)}>
					Back to Leads
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<Button
						onClick={() => router.push("/admin/leads" as Route)}
						size="icon"
						variant="outline"
					>
						<ArrowLeftIcon className="size-4" />
						<span className="sr-only">Back to leads</span>
					</Button>
					<div>
						<h1 className="font-bold font-display text-2xl tracking-tight">
							{lead.name}
						</h1>
						<p className="text-muted-foreground text-sm">{lead.email}</p>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<Badge variant={getStatusBadgeVariant(lead.status)}>
						{lead.status.replace(/_/g, " ")}
					</Badge>
					<Select
						disabled={updateStatusMutation.isPending}
						onValueChange={handleStatusChange}
						value={lead.status}
					>
						<SelectTrigger className="w-44">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{STATUS_OPTIONS.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Main content grid */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Lead Information */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Lead Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-full bg-muted">
								<UserIcon className="size-5 text-muted-foreground" />
							</div>
							<div>
								<p className="font-medium text-sm">{lead.name}</p>
								<p className="text-muted-foreground text-xs">Full Name</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-full bg-muted">
								<MailIcon className="size-5 text-muted-foreground" />
							</div>
							<div>
								<a
									className="font-medium text-sm hover:underline"
									href={`mailto:${lead.email}`}
								>
									{lead.email}
								</a>
								<p className="text-muted-foreground text-xs">Email</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-full bg-muted">
								<FolderIcon className="size-5 text-muted-foreground" />
							</div>
							<div>
								<p className="font-medium text-sm">
									{lead.projectType
										? (PROJECT_TYPE_LABELS[lead.projectType] ??
											lead.projectType)
										: "Not specified"}
								</p>
								<p className="text-muted-foreground text-xs">Project Type</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-full bg-muted">
								<DollarSignIcon className="size-5 text-muted-foreground" />
							</div>
							<div>
								<p className="font-medium text-sm">
									{lead.budget
										? (BUDGET_LABELS[lead.budget] ?? lead.budget)
										: "Not specified"}
								</p>
								<p className="text-muted-foreground text-xs">Budget Range</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-full bg-muted">
								<CalendarIcon className="size-5 text-muted-foreground" />
							</div>
							<div>
								<p className="font-medium text-sm">
									{formatDate(lead.createdAt)}
								</p>
								<p className="text-muted-foreground text-xs">Submitted</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Project Details */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Project Details</CardTitle>
					</CardHeader>
					<CardContent>
						{lead.details ? (
							<p className="whitespace-pre-wrap text-muted-foreground text-sm">
								{lead.details}
							</p>
						) : (
							<p className="text-muted-foreground text-sm italic">
								No project details provided
							</p>
						)}
					</CardContent>
				</Card>

				{/* Meetings */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle className="text-base">
							Meetings ({lead.meetings.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						{lead.meetings.length === 0 ? (
							<p className="text-muted-foreground text-sm italic">
								No meetings scheduled yet
							</p>
						) : (
							<div className="space-y-4">
								{lead.meetings.map((meeting) => (
									<div
										className="flex flex-col gap-4 border-b pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
										key={meeting.id}
									>
										<div className="flex items-start gap-3">
											<div className="flex size-10 items-center justify-center rounded-full bg-muted">
												<VideoIcon className="size-5 text-muted-foreground" />
											</div>
											<div>
												<p className="font-medium text-sm">{meeting.title}</p>
												<p className="text-muted-foreground text-xs">
													{formatDateTime(meeting.scheduledAt)}
												</p>
												<div className="mt-1 flex items-center gap-2">
													<Badge
														className={
															MEETING_STATUS_COLORS[meeting.status] ?? ""
														}
														variant="secondary"
													>
														{meeting.status}
													</Badge>
													<span className="flex items-center gap-1 text-muted-foreground text-xs">
														<ClockIcon className="size-3" />
														{meeting.duration} min
													</span>
												</div>
											</div>
										</div>

										{meeting.meetUrl && (
											<a
												className="inline-flex h-8 items-center justify-center gap-2 border border-input bg-background px-3 font-medium text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
												href={meeting.meetUrl}
												rel="noopener noreferrer"
												target="_blank"
											>
												<ExternalLinkIcon className="size-4" />
												Join Meeting
											</a>
										)}
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Actions */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Actions</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-3">
					<a
						className="inline-flex h-10 items-center justify-center gap-2 border border-input bg-background px-4 py-2 font-medium text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						href={`mailto:${lead.email}`}
					>
						<MailIcon className="size-4" />
						Send Email
					</a>
					<Link
						className="inline-flex h-10 items-center justify-center gap-2 border border-input bg-background px-4 py-2 font-medium text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						href={"/admin/meetings" as Route}
					>
						<CalendarIcon className="size-4" />
						Schedule Meeting
					</Link>
					{lead.status !== "CLOSED" && (
						<Button
							disabled={updateStatusMutation.isPending}
							onClick={() => handleStatusChange("CLOSED")}
							variant="destructive"
						>
							{updateStatusMutation.isPending ? (
								<Loader2Icon className="mr-2 size-4 animate-spin" />
							) : null}
							Mark as Closed
						</Button>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
