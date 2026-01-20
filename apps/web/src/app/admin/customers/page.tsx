"use client";

import { useQuery } from "@tanstack/react-query";
import { EyeIcon, MailIcon, MoreHorizontalIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";

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

const HAS_PROJECTS_OPTIONS = [
	{ value: "true", label: "Has Projects" },
	{ value: "false", label: "No Projects" },
];

const HAS_CONTRACTS_OPTIONS = [
	{ value: "true", label: "Has Contracts" },
	{ value: "false", label: "No Contracts" },
];

// Filter configuration
const FILTER_CONFIG: FilterConfig[] = [
	{
		key: "search",
		label: "Search",
		type: "text",
		placeholder: "Search customers...",
	},
	{
		key: "hasProjects",
		label: "Projects",
		type: "select",
		options: HAS_PROJECTS_OPTIONS,
		placeholder: "Project status",
	},
	{
		key: "hasContracts",
		label: "Contracts",
		type: "select",
		options: HAS_CONTRACTS_OPTIONS,
		placeholder: "Contract status",
	},
	{
		key: "dateRange",
		label: "Joined Date",
		type: "dateRange",
		placeholder: "Select date range",
	},
];

// Default presets
const DEFAULT_PRESETS: FilterPreset[] = [
	{
		id: "with-projects",
		name: "With Projects",
		filters: { hasProjects: "true" },
	},
	{
		id: "no-projects",
		name: "No Projects",
		filters: { hasProjects: "false" },
	},
	{
		id: "with-contracts",
		name: "With Contracts",
		filters: { hasContracts: "true" },
	},
];

// =============================================================================
// Components
// =============================================================================

function LoadingSkeletons() {
	return (
		<div className="space-y-3">
			{Array.from({ length: 5 }, (_, i) => i).map((index) => (
				<div
					className="flex items-center justify-between py-3"
					key={`customer-skeleton-${index}`}
				>
					<div className="flex items-center gap-4">
						<Skeleton className="size-10 rounded-full" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-3 w-48" />
						</div>
					</div>
					<Skeleton className="h-8 w-8" />
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
					? "No customers found matching your criteria."
					: "No customers yet."}
			</p>
		</div>
	);
}

// =============================================================================
// Main Component
// =============================================================================

export default function CustomersPage() {
	const [filterValues, setFilterValues] = useState<FilterValues>({});
	const [presets, setPresets] = useState<FilterPreset[]>(() => {
		if (typeof window !== "undefined") {
			try {
				const saved = localStorage.getItem("customers-filter-presets");
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
			hasProjects?: boolean;
			hasContracts?: boolean;
			dateFrom?: Date;
			dateTo?: Date;
		} = {};

		if (filterValues.search) {
			params.search = filterValues.search as string;
		}
		if (filterValues.hasProjects && filterValues.hasProjects !== "all") {
			params.hasProjects = filterValues.hasProjects === "true";
		}
		if (filterValues.hasContracts && filterValues.hasContracts !== "all") {
			params.hasContracts = filterValues.hasContracts === "true";
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

	const { data: customers, isLoading } = useQuery(
		trpc.admin.getCustomers.queryOptions(apiParams)
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
				"customers-filter-presets",
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
				"customers-filter-presets",
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
						Customers
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Manage your customer accounts and their projects.
					</p>
				</div>
			</div>

			{/* Search and Filters */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<CardTitle className="text-sm">All Customers</CardTitle>
						{customers && (
							<span className="text-muted-foreground text-xs">
								{customers.length} customer{customers.length !== 1 ? "s" : ""}{" "}
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
						searchPlaceholder="Search by name, email, company, or phone..."
						values={filterValues}
					/>

					{/* Table Content */}
					{isLoading && <LoadingSkeletons />}
					{!isLoading && customers?.length === 0 && (
						<EmptyState hasFilters={hasFilters} />
					)}
					{!isLoading && customers && customers.length > 0 && (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead className="hidden sm:table-cell">
										Company
									</TableHead>
									<TableHead className="hidden md:table-cell">
										Projects
									</TableHead>
									<TableHead className="hidden lg:table-cell">Joined</TableHead>
									<TableHead className="w-12">
										<span className="sr-only">Actions</span>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{customers?.map((customer) => (
									<TableRow key={customer.id}>
										<TableCell>
											<div className="flex items-center gap-3">
												<div className="flex size-8 items-center justify-center rounded-full bg-muted font-medium text-xs uppercase">
													{customer.user.name
														?.split(" ")
														.map((n) => n[0])
														.join("")
														.slice(0, 2) ?? "?"}
												</div>
												<span className="font-medium">
													{customer.user.name}
												</span>
											</div>
										</TableCell>
										<TableCell className="text-muted-foreground">
											{customer.user.email}
										</TableCell>
										<TableCell className="hidden text-muted-foreground sm:table-cell">
											{customer.companyName ?? "-"}
										</TableCell>
										<TableCell className="hidden md:table-cell">
											<Badge
												variant={
													customer._count?.projects > 0
														? "secondary"
														: "outline"
												}
											>
												{customer._count?.projects ?? 0} project
												{(customer._count?.projects ?? 0) !== 1 ? "s" : ""}
											</Badge>
										</TableCell>
										<TableCell className="hidden text-muted-foreground lg:table-cell">
											{new Date(customer.createdAt).toLocaleDateString()}
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
															<Link
																href={
																	`/admin/customers/${customer.id}` as Route
																}
															/>
														}
													>
														<EyeIcon className="mr-2 size-4" />
														View Details
													</DropdownMenuItem>
													<DropdownMenuItem>
														<MailIcon className="mr-2 size-4" />
														Send Email
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem variant="destructive">
														Deactivate
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
		</div>
	);
}
