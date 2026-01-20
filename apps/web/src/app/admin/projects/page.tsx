"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	CalendarIcon,
	EyeIcon,
	MoreHorizontalIcon,
	PlusIcon,
	TrendingUpIcon,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { queryClient, trpc } from "@/utils/trpc";

// =============================================================================
// Constants
// =============================================================================

const STATUS_OPTIONS = [
	{ value: "PENDING", label: "Pending" },
	{ value: "IN_PROGRESS", label: "In Progress" },
	{ value: "ON_HOLD", label: "On Hold" },
	{ value: "COMPLETED", label: "Completed" },
	{ value: "CANCELLED", label: "Cancelled" },
];

type ProjectStatus = (typeof STATUS_OPTIONS)[number]["value"];

// Filter configuration
const FILTER_CONFIG: FilterConfig[] = [
	{
		key: "search",
		label: "Search",
		type: "text",
		placeholder: "Search projects...",
	},
	{
		key: "statuses",
		label: "Status",
		type: "multiselect",
		options: STATUS_OPTIONS,
		placeholder: "Select statuses",
	},
	{
		key: "progressRange",
		label: "Progress",
		type: "numberRange",
		min: 0,
		max: 100,
		placeholder: "Progress range",
	},
	{
		key: "createdRange",
		label: "Created Date",
		type: "dateRange",
		placeholder: "Select date range",
	},
];

// Default presets
const DEFAULT_PRESETS: FilterPreset[] = [
	{
		id: "active-projects",
		name: "Active",
		filters: { statuses: ["IN_PROGRESS"] },
	},
	{
		id: "pending-projects",
		name: "Pending",
		filters: { statuses: ["PENDING"] },
	},
	{
		id: "on-hold",
		name: "On Hold",
		filters: { statuses: ["ON_HOLD"] },
	},
	{
		id: "nearly-complete",
		name: "Nearly Complete",
		filters: { progressRange: [80, 100] as [number, number] },
	},
];

// =============================================================================
// Types
// =============================================================================

interface ProjectData {
	id: string;
	title: string;
	description: string | null;
	status: ProjectStatus;
	progress: number;
	startDate: Date | string | null;
	endDate: Date | string | null;
	createdAt: Date | string;
	updatedAt: Date | string;
	customer: {
		id: string;
		companyName: string | null;
		user: {
			id: string;
			name: string | null;
			email: string;
		};
	};
	_count: {
		updates: number;
	};
}

interface EditingProject {
	id: string;
	title: string;
	progress: number;
	status: ProjectStatus;
}

// =============================================================================
// Helpers
// =============================================================================

function getStatusBadgeVariant(status: string) {
	const variants: Record<
		string,
		"info" | "warning" | "secondary" | "success" | "outline" | "destructive"
	> = {
		PENDING: "secondary",
		IN_PROGRESS: "info",
		ON_HOLD: "warning",
		COMPLETED: "success",
		CANCELLED: "destructive",
	};
	return variants[status] ?? "outline";
}

function formatStatus(status: string) {
	return status.replace(/_/g, " ");
}

// =============================================================================
// Components
// =============================================================================

function ProgressBar({ progress }: { progress: number }) {
	return (
		<div className="flex items-center gap-2">
			<div className="h-1.5 w-16 overflow-hidden rounded-none bg-muted">
				<div
					className="h-full bg-primary transition-all"
					style={{ width: `${progress}%` }}
				/>
			</div>
			<span className="text-muted-foreground text-xs">{progress}%</span>
		</div>
	);
}

function UpdateProgressForm({
	project,
	onClose,
}: {
	project: EditingProject;
	onClose: () => void;
}) {
	const [progress, setProgress] = useState(project.progress.toString());
	const [status, setStatus] = useState(project.status);
	const [updateTitle, setUpdateTitle] = useState("");
	const [updateContent, setUpdateContent] = useState("");

	const updateMutation = useMutation(
		trpc.admin.updateProjectProgress.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.admin.getProjects.queryKey(),
				});
				toast.success("Project updated successfully");
				onClose();
			},
			onError: (error) => {
				toast.error(error.message || "Failed to update project");
			},
		})
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const progressNum = Number.parseInt(progress, 10);
		if (Number.isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
			toast.error("Progress must be a number between 0 and 100");
			return;
		}

		updateMutation.mutate({
			projectId: project.id,
			progress: progressNum,
			status:
				status !== project.status
					? (status as
							| "PENDING"
							| "IN_PROGRESS"
							| "ON_HOLD"
							| "COMPLETED"
							| "CANCELLED")
					: undefined,
			updateTitle: updateTitle.trim() || undefined,
			updateContent: updateContent.trim() || undefined,
		});
	};

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			<div className="space-y-2">
				<Label htmlFor="progress">Progress (%)</Label>
				<Input
					id="progress"
					max={100}
					min={0}
					onChange={(e) => setProgress(e.target.value)}
					placeholder="0-100"
					type="number"
					value={progress}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="status">Status</Label>
				<Select
					onValueChange={(value) => {
						const validValue = STATUS_OPTIONS.find(
							(opt) => opt.value === value
						);
						if (validValue) {
							setStatus(validValue.value);
						}
					}}
					value={status}
				>
					<SelectTrigger className="w-full" id="status">
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

			<div className="border-t pt-4">
				<p className="mb-2 text-muted-foreground text-xs">
					Optionally add an update note:
				</p>
				<div className="space-y-2">
					<Input
						onChange={(e) => setUpdateTitle(e.target.value)}
						placeholder="Update title"
						value={updateTitle}
					/>
					<textarea
						className="h-20 w-full rounded-none border border-input bg-transparent px-2.5 py-2 text-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
						onChange={(e) => setUpdateContent(e.target.value)}
						placeholder="Update content..."
						value={updateContent}
					/>
				</div>
			</div>

			<div className="flex justify-end gap-2">
				<Button onClick={onClose} type="button" variant="outline">
					Cancel
				</Button>
				<Button disabled={updateMutation.isPending} type="submit">
					{updateMutation.isPending ? "Saving..." : "Save Changes"}
				</Button>
			</div>
		</form>
	);
}

function ProjectDates({ project }: { project: ProjectData }) {
	const hasNoDates = !(project.startDate || project.endDate);

	if (hasNoDates) {
		return <span>No dates set</span>;
	}

	return (
		<>
			{project.startDate && (
				<div className="flex items-center gap-1">
					<CalendarIcon className="size-3" />
					<span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
				</div>
			)}
			{project.endDate && (
				<div className="flex items-center gap-1">
					<CalendarIcon className="size-3" />
					<span>End: {new Date(project.endDate).toLocaleDateString()}</span>
				</div>
			)}
		</>
	);
}

function LoadingSkeletons() {
	const skeletonIds = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];
	return (
		<div className="space-y-3">
			{skeletonIds.map((id) => (
				<div className="flex items-center justify-between py-3" key={id}>
					<div className="space-y-2">
						<Skeleton className="h-4 w-48" />
						<Skeleton className="h-3 w-32" />
					</div>
					<div className="flex items-center gap-4">
						<Skeleton className="h-1.5 w-16" />
						<Skeleton className="h-5 w-24" />
					</div>
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
					? "No projects found matching your criteria."
					: "No projects yet."}
			</p>
		</div>
	);
}

function ProjectsTable({
	projects,
	onEditProject,
}: {
	projects: ProjectData[];
	onEditProject: (project: EditingProject) => void;
}) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Project</TableHead>
					<TableHead className="hidden sm:table-cell">Customer</TableHead>
					<TableHead>Status</TableHead>
					<TableHead className="hidden md:table-cell">Progress</TableHead>
					<TableHead className="hidden lg:table-cell">Dates</TableHead>
					<TableHead className="w-12">
						<span className="sr-only">Actions</span>
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{projects.map((project) => (
					<TableRow key={project.id}>
						<TableCell>
							<div className="space-y-1">
								<span className="font-medium">{project.title}</span>
								{project.description && (
									<p className="line-clamp-1 text-muted-foreground text-xs">
										{project.description}
									</p>
								)}
							</div>
						</TableCell>
						<TableCell className="hidden sm:table-cell">
							<div className="space-y-1">
								<span className="text-sm">{project.customer.user.name}</span>
								{project.customer.companyName && (
									<p className="text-muted-foreground text-xs">
										{project.customer.companyName}
									</p>
								)}
							</div>
						</TableCell>
						<TableCell>
							<Badge variant={getStatusBadgeVariant(project.status)}>
								{formatStatus(project.status)}
							</Badge>
						</TableCell>
						<TableCell className="hidden md:table-cell">
							<ProgressBar progress={project.progress} />
						</TableCell>
						<TableCell className="hidden lg:table-cell">
							<div className="space-y-1 text-muted-foreground text-xs">
								<ProjectDates project={project} />
							</div>
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
											<Link href={`/admin/projects/${project.id}` as Route} />
										}
									>
										<EyeIcon className="mr-2 size-4" />
										View Details
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() =>
											onEditProject({
												id: project.id,
												title: project.title,
												progress: project.progress,
												status: project.status,
											})
										}
									>
										<TrendingUpIcon className="mr-2 size-4" />
										Update Progress
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem variant="destructive">
										Cancel Project
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

function MobileProjectCards({
	projects,
	onEditProject,
}: {
	projects: ProjectData[];
	onEditProject: (project: EditingProject) => void;
}) {
	return (
		<div className="block sm:hidden">
			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Project Details</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{projects.slice(0, 5).map((project) => (
						<div
							className="border-b pb-4 last:border-0 last:pb-0"
							key={`mobile-project-${project.id}`}
						>
							<div className="flex items-start justify-between">
								<div className="space-y-1">
									<p className="font-medium">{project.title}</p>
									<p className="text-muted-foreground text-xs">
										{project.customer.user.name}
										{project.customer.companyName &&
											` - ${project.customer.companyName}`}
									</p>
								</div>
								<Badge variant={getStatusBadgeVariant(project.status)}>
									{formatStatus(project.status)}
								</Badge>
							</div>
							<div className="mt-3">
								<ProgressBar progress={project.progress} />
							</div>
							{(project.startDate || project.endDate) && (
								<div className="mt-2 flex flex-wrap gap-2 text-muted-foreground text-xs">
									{project.startDate && (
										<span>
											Start: {new Date(project.startDate).toLocaleDateString()}
										</span>
									)}
									{project.endDate && (
										<span>
											End: {new Date(project.endDate).toLocaleDateString()}
										</span>
									)}
								</div>
							)}
							<div className="mt-3 flex gap-2">
								<Button
									render={
										<Link href={`/admin/projects/${project.id}` as Route} />
									}
									size="xs"
									variant="outline"
								>
									<EyeIcon className="mr-1.5 size-3" />
									View
								</Button>
								<Button
									onClick={() =>
										onEditProject({
											id: project.id,
											title: project.title,
											progress: project.progress,
											status: project.status,
										})
									}
									size="xs"
									variant="outline"
								>
									<TrendingUpIcon className="mr-1.5 size-3" />
									Update
								</Button>
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}

// =============================================================================
// Main Component
// =============================================================================

export default function ProjectsPage() {
	const [filterValues, setFilterValues] = useState<FilterValues>({});
	const [editingProject, setEditingProject] = useState<EditingProject | null>(
		null
	);
	const [presets, setPresets] = useState<FilterPreset[]>(() => {
		if (typeof window !== "undefined") {
			try {
				const saved = localStorage.getItem("projects-filter-presets");
				if (saved) {
					return [...DEFAULT_PRESETS, ...JSON.parse(saved)];
				}
			} catch {
				// Ignore localStorage errors
			}
		}
		return DEFAULT_PRESETS;
	});

	// Helper to build progress range params
	const getProgressParams = useCallback((progressRange: unknown) => {
		const range = progressRange as [number, number];
		const params: { progressMin?: number; progressMax?: number } = {};
		if (range[0] !== undefined) {
			params.progressMin = range[0];
		}
		if (range[1] !== undefined) {
			params.progressMax = range[1];
		}
		return params;
	}, []);

	// Helper to build date range params
	const getDateParams = useCallback((dateRange: unknown) => {
		const range = dateRange as DateRange;
		const params: { createdFrom?: Date; createdTo?: Date } = {};
		if (range.from) {
			params.createdFrom = range.from;
		}
		if (range.to) {
			params.createdTo = range.to;
		}
		return params;
	}, []);

	// Convert filter values to API params
	const apiParams = useMemo(() => {
		const params: {
			search?: string;
			statuses?: string[];
			progressMin?: number;
			progressMax?: number;
			createdFrom?: Date;
			createdTo?: Date;
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
		if (filterValues.progressRange) {
			Object.assign(params, getProgressParams(filterValues.progressRange));
		}
		if (filterValues.createdRange) {
			Object.assign(params, getDateParams(filterValues.createdRange));
		}

		return params;
	}, [filterValues, getDateParams, getProgressParams]);

	const { data: projects, isLoading } = useQuery(
		trpc.admin.getProjects.queryOptions(apiParams)
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
	const hasProjects = projects && projects.length > 0;

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
				"projects-filter-presets",
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
				"projects-filter-presets",
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
						Projects
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Manage customer projects and track progress.
					</p>
				</div>
				<Button>
					<PlusIcon className="mr-2 size-4" />
					New Project
				</Button>
			</div>

			{/* Search and Filters */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<CardTitle className="text-sm">All Projects</CardTitle>
						{projects && (
							<span className="text-muted-foreground text-xs">
								{projects.length} project{projects.length !== 1 ? "s" : ""}{" "}
								found
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
						searchPlaceholder="Search by title, description, or customer..."
						values={filterValues}
					/>

					{/* Table Content */}
					{isLoading && <LoadingSkeletons />}
					{!isLoading && hasProjects && (
						<ProjectsTable
							onEditProject={setEditingProject}
							projects={projects as ProjectData[]}
						/>
					)}
					{!(isLoading || hasProjects) && (
						<EmptyState hasFilters={hasFilters} />
					)}
				</CardContent>
			</Card>

			{/* Update Progress Panel */}
			{editingProject && (
				<Card>
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm">
								Update Progress: {editingProject.title}
							</CardTitle>
							<Button
								onClick={() => setEditingProject(null)}
								size="icon-xs"
								variant="ghost"
							>
								<span className="sr-only">Close</span>
								&times;
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<UpdateProgressForm
							onClose={() => setEditingProject(null)}
							project={editingProject}
						/>
					</CardContent>
				</Card>
			)}

			{/* Mobile Project Cards */}
			{hasProjects && (
				<MobileProjectCards
					onEditProject={setEditingProject}
					projects={projects as ProjectData[]}
				/>
			)}
		</div>
	);
}
