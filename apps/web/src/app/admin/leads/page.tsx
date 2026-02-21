"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	CalendarIcon,
	EyeIcon,
	MailIcon,
	MoreHorizontalIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import {
	AdvancedFilters,
	type FilterConfig,
	type FilterPreset,
	type FilterValues,
} from "@/components/admin/advanced-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { trpc } from "@/utils/trpc";

// =============================================================================
// Constants
// =============================================================================

const STATUS_OPTIONS = [
	{ value: "NEW", label: "New" },
	{ value: "CONTACTED", label: "Contacted" },
	{ value: "MEETING_SCHEDULED", label: "Meeting Scheduled" },
	{ value: "MEETING_COMPLETED", label: "Meeting Completed" },
	{ value: "CONVERTED", label: "Converted" },
	{ value: "CLOSED", label: "Closed" },
];

const PROJECT_TYPE_OPTIONS = [
	{ value: "AI_AUTOMATION", label: "AI Automation" },
	{ value: "BRAND_IDENTITY", label: "Brand Identity" },
	{ value: "WEB_MOBILE", label: "Web & Mobile" },
	{ value: "FULL_PRODUCT", label: "Full Product" },
];

const BUDGET_OPTIONS = [
	{ value: "RANGE_5K_10K", label: "$5K - $10K" },
	{ value: "RANGE_10K_25K", label: "$10K - $25K" },
	{ value: "RANGE_25K_50K", label: "$25K - $50K" },
	{ value: "RANGE_50K_PLUS", label: "$50K+" },
];

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

// Filter configuration
const FILTER_CONFIG: FilterConfig[] = [
	{
		key: "search",
		label: "Search",
		type: "text",
		placeholder: "Search leads...",
	},
	{
		key: "statuses",
		label: "Status",
		type: "multiselect",
		options: STATUS_OPTIONS,
		placeholder: "Select statuses",
	},
	{
		key: "projectTypes",
		label: "Project Type",
		type: "multiselect",
		options: PROJECT_TYPE_OPTIONS,
		placeholder: "Select project types",
	},
	{
		key: "budgets",
		label: "Budget",
		type: "multiselect",
		options: BUDGET_OPTIONS,
		placeholder: "Select budgets",
	},
	{
		key: "dateRange",
		label: "Created Date",
		type: "dateRange",
		placeholder: "Select date range",
	},
];

// Default presets
const DEFAULT_PRESETS: FilterPreset[] = [
	{
		id: "new-leads",
		name: "New Leads",
		filters: { statuses: ["NEW"] },
	},
	{
		id: "active-leads",
		name: "Active",
		filters: {
			statuses: ["CONTACTED", "MEETING_SCHEDULED", "MEETING_COMPLETED"],
		},
	},
	{
		id: "high-budget",
		name: "High Budget",
		filters: { budgets: ["RANGE_25K_50K", "RANGE_50K_PLUS"] },
	},
];

// =============================================================================
// Helpers
// =============================================================================

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

// =============================================================================
// Components
// =============================================================================

function LoadingSkeletons() {
	return (
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
					<Skeleton className="h-5 w-24" />
				</div>
			))}
		</div>
	);
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
	return (
		<div className="py-8 text-center">
			<p className="text-muted-foreground text-sm">
				{hasFilters
					? "No leads found matching your criteria."
					: "No leads yet."}
			</p>
		</div>
	);
}

// =============================================================================
// Main Component
// =============================================================================

export default function LeadsPage() {
	const queryClient = useQueryClient();
	const updateStatus = useMutation({
		...trpc.admin.updateLeadStatus.mutationOptions(),
		onSuccess: () => {
			toast.success("Lead status updated to CLOSED");
			queryClient.invalidateQueries({
				queryKey: trpc.admin.getLeads.queryKey(),
			});
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update lead status");
		},
	});

	const [filterValues, setFilterValues] = useState<FilterValues>({});
	const [presets, setPresets] = useState<FilterPreset[]>(() => {
		if (typeof window !== "undefined") {
			try {
				const saved = localStorage.getItem("leads-filter-presets");
				if (saved) {
					return [...DEFAULT_PRESETS, ...JSON.parse(saved)];
				}
			} catch {
				// Ignore localStorage errors
			}
		}
		return DEFAULT_PRESETS;
	});

	// Convert filter values to API params
	const apiParams = useMemo(() => {
		const params: {
			search?: string;
			statuses?: string[];
			projectTypes?: string[];
			budgets?: string[];
			dateFrom?: Date;
			dateTo?: Date;
		} = {};

		if (filterValues.search) {
			params.search = filterValues.search as string;
		}
		if (
			filterValues.statuses &&
			(filterValues.statuses as string[]).length > 0
		) {
			params.statuses = filterValues.statuses as string[];
		}
		if (
			filterValues.projectTypes &&
			(filterValues.projectTypes as string[]).length > 0
		) {
			params.projectTypes = filterValues.projectTypes as string[];
		}
		if (filterValues.budgets && (filterValues.budgets as string[]).length > 0) {
			params.budgets = filterValues.budgets as string[];
		}
		if (filterValues.dateRange) {
			const dateRange = filterValues.dateRange as DateRange;
			if (dateRange.from) {
				params.dateFrom = dateRange.from;
			}
			if (dateRange.to) {
				params.dateTo = dateRange.to;
			}
		}

		return params;
	}, [filterValues]);

	const { data: leads, isLoading } = useQuery(
		trpc.admin.getLeads.queryOptions(apiParams)
	);

	const hasFilters = Object.values(filterValues).some((v) => {
		if (v === undefined || v === "") {
			return false;
		}
		if (Array.isArray(v) && v.length === 0) {
			return false;
		}
		return true;
	});

	const handleSavePreset = useCallback(
		(name: string, filters: FilterValues) => {
			const newPreset: FilterPreset = {
				id: crypto.randomUUID(),
				name,
				filters,
			};
			const customPresets = presets.filter(
				(p) => !DEFAULT_PRESETS.some((d) => d.id === p.id)
			);
			const updated = [...DEFAULT_PRESETS, ...customPresets, newPreset];
			setPresets(updated);
			localStorage.setItem(
				"leads-filter-presets",
				JSON.stringify(
					updated.filter((p) => !DEFAULT_PRESETS.some((d) => d.id === p.id))
				)
			);
		},
		[presets]
	);

	const handleDeletePreset = useCallback(
		(id: string) => {
			if (DEFAULT_PRESETS.some((p) => p.id === id)) {
				return;
			}
			const updated = presets.filter((p) => p.id !== id);
			setPresets(updated);
			localStorage.setItem(
				"leads-filter-presets",
				JSON.stringify(
					updated.filter((p) => !DEFAULT_PRESETS.some((d) => d.id === p.id))
				)
			);
		},
		[presets]
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold font-display text-2xl tracking-tight">
						Leads
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Manage leads from survey submissions.
					</p>
				</div>
			</div>

			{/* Search and Filters */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<CardTitle className="text-sm">All Leads</CardTitle>
						{leads && (
							<span className="text-muted-foreground text-xs">
								{leads.length} lead{leads.length !== 1 ? "s" : ""} found
							</span>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{/* Advanced Filters */}
					<AdvancedFilters
						className="mb-4"
						filters={FILTER_CONFIG}
						onChange={setFilterValues}
						onDeletePreset={handleDeletePreset}
						onSavePreset={handleSavePreset}
						presets={presets}
						searchPlaceholder="Search by name, email, or details..."
						values={filterValues}
					/>

					{/* Table Content */}
					{isLoading && <LoadingSkeletons />}
					{!isLoading && leads?.length === 0 && (
						<EmptyState hasFilters={hasFilters} />
					)}
					{!isLoading && leads && leads.length > 0 && (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead className="hidden sm:table-cell">
										Project Type
									</TableHead>
									<TableHead className="hidden md:table-cell">Budget</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="hidden lg:table-cell">
										Created
									</TableHead>
									<TableHead className="w-12">
										<span className="sr-only">Actions</span>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{leads?.map((lead) => (
									<TableRow key={lead.id}>
										<TableCell>
											<div className="space-y-1">
												<span className="font-medium">{lead.name}</span>
												<p className="text-muted-foreground text-xs">
													{lead.email}
												</p>
											</div>
										</TableCell>
										<TableCell className="hidden sm:table-cell">
											<Badge variant="outline">
												{PROJECT_TYPE_LABELS[lead.projectType ?? ""] ??
													lead.projectType}
											</Badge>
										</TableCell>
										<TableCell className="hidden text-muted-foreground md:table-cell">
											{BUDGET_LABELS[lead.budget ?? ""] ?? lead.budget}
										</TableCell>
										<TableCell>
											<Badge variant={getStatusBadgeVariant(lead.status)}>
												{lead.status.replace(/_/g, " ")}
											</Badge>
										</TableCell>
										<TableCell className="hidden text-muted-foreground lg:table-cell">
											{new Date(lead.createdAt).toLocaleDateString()}
										</TableCell>
										<TableCell>
											<DropdownMenu>
												<DropdownMenuTrigger
													render={<Button size="icon-sm" variant="ghost" />}
												>
													<MoreHorizontalIcon className="size-4" />
													<span className="sr-only">Open menu</span>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														render={
															<Link href={`/admin/leads/${lead.id}` as Route} />
														}
													>
														<EyeIcon className="mr-2 size-4" />
														View Details
													</DropdownMenuItem>
													<DropdownMenuItem
														render={
															// biome-ignore lint/a11y/useAnchorContent: this anchor receives content from DropdownMenuItem
															<a
																aria-label="Send Email"
																href={`mailto:${lead.email}`}
															/>
														}
													>
														<MailIcon className="mr-2 size-4" />
														Send Email
													</DropdownMenuItem>
													<DropdownMenuItem
														render={
															// biome-ignore lint/a11y/useAnchorContent: this anchor receives content from DropdownMenuItem
															<a
																aria-label="Schedule Meeting"
																href={`mailto:${lead.email}?subject=Meeting%20Request`}
															/>
														}
													>
														<CalendarIcon className="mr-2 size-4" />
														Schedule Meeting
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														disabled={
															updateStatus.isPending || lead.status === "CLOSED"
														}
														onClick={() =>
															updateStatus.mutate({
																leadId: lead.id,
																status: "CLOSED",
															})
														}
														variant="destructive"
													>
														Mark as Closed
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Lead Details Card (shown on mobile) */}
			{leads && leads.length > 0 && (
				<div className="block sm:hidden">
					<Card>
						<CardHeader>
							<CardTitle className="text-sm">Lead Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{leads.slice(0, 5).map((lead) => (
								<div
									className="border-b pb-4 last:border-0 last:pb-0"
									key={`mobile-lead-${lead.id}`}
								>
									<div className="flex items-start justify-between">
										<div className="space-y-1">
											<p className="font-medium">{lead.name}</p>
											<p className="text-muted-foreground text-xs">
												{lead.email}
											</p>
										</div>
										<Badge variant={getStatusBadgeVariant(lead.status)}>
											{lead.status.replace(/_/g, " ")}
										</Badge>
									</div>
									<div className="mt-2 flex flex-wrap gap-2">
										<Badge variant="outline">
											{PROJECT_TYPE_LABELS[lead.projectType ?? ""] ??
												lead.projectType}
										</Badge>
										<span className="text-muted-foreground text-xs">
											{BUDGET_LABELS[lead.budget ?? ""] ?? lead.budget}
										</span>
									</div>
									{lead.details && (
										<p className="mt-2 line-clamp-2 text-muted-foreground text-xs">
											{lead.details}
										</p>
									)}
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
