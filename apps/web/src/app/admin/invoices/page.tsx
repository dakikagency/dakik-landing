"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	EyeIcon,
	FileTextIcon,
	MoreHorizontalIcon,
	PlusIcon,
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
import { Badge, type BadgeProps } from "@/components/ui/badge";
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
	{ value: "UNPAID", label: "Unpaid" },
	{ value: "PENDING", label: "Pending" },
	{ value: "PAID", label: "Paid" },
	{ value: "OVERDUE", label: "Overdue" },
];

const FILTER_CONFIG: FilterConfig[] = [
	{
		key: "search",
		label: "Search",
		type: "text",
		placeholder: "Search invoices...",
	},
	{
		key: "statuses",
		label: "Status",
		type: "multiselect",
		options: STATUS_OPTIONS,
		placeholder: "Filter by status",
	},
	{
		key: "dateRange",
		label: "Date Range",
		type: "dateRange",
		placeholder: "Select date range",
	},
];

const DEFAULT_PRESETS: FilterPreset[] = [
	{
		id: "pending-invoices",
		name: "Pending",
		filters: { statuses: ["PENDING"] },
	},
	{
		id: "overdue-invoices",
		name: "Overdue",
		filters: { statuses: ["OVERDUE"] },
	},
];

function getInvoiceStatusVariant(status: string): BadgeProps["variant"] {
	switch (status) {
		case "PAID":
			return "success";
		case "PENDING":
			return "warning";
		case "OVERDUE":
			return "destructive";
		case "UNPAID":
			return "secondary";
		default:
			return "outline";
	}
}

function LoadingSkeletons() {
	return (
		<div className="space-y-3">
			{Array.from({ length: 5 }, (_, i) => i).map((index) => (
				<div
					className="flex items-center justify-between py-3"
					key={`invoice-skeleton-${index}`}
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
					? "No invoices found matching your criteria."
					: "No invoices yet."}
			</p>
		</div>
	);
}

export default function InvoicesPage() {
	const queryClient = useQueryClient();

	const updateInvoice = useMutation({
		...trpc.invoices.update.mutationOptions(),
		onSuccess: () => {
			toast.success("Invoice status updated successfully");
			queryClient.invalidateQueries({ queryKey: trpc.admin.getInvoices.queryKey() });
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update invoice");
		},
	});

	const [filterValues, setFilterValues] = useState<FilterValues>({});
	const [presets, setPresets] = useState<FilterPreset[]>(() => {
		if (typeof window !== "undefined") {
			try {
				const saved = localStorage.getItem("invoices-filter-presets");
				if (saved) {
					return [...DEFAULT_PRESETS, ...JSON.parse(saved)];
				}
			} catch {
				// Ignore localStorage errors
			}
		}
		return DEFAULT_PRESETS;
	});

	const apiParams = useMemo(() => {
		const params: {
			search?: string;
			statuses?: string[];
			dateFrom?: Date;
			dateTo?: Date;
		} = {};

		if (filterValues.search) {
			params.search = filterValues.search as string;
		}
		if (filterValues.statuses && Array.isArray(filterValues.statuses)) {
			params.statuses = filterValues.statuses as string[];
		} else if (filterValues.status && filterValues.status !== "all") {
			params.statuses = [filterValues.status as string];
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

	const { data: invoices, isLoading } = useQuery(
		trpc.admin.getInvoices.queryOptions(apiParams)
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
				"invoices-filter-presets",
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
				"invoices-filter-presets",
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
						Invoices
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Manage your customer invoices.
					</p>
				</div>
				<Button>
					<PlusIcon className="mr-2 size-4" />
					Create Invoice
				</Button>
			</div>

			{/* Search and Filters */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<CardTitle className="text-sm">All Invoices</CardTitle>
						{invoices && (
							<span className="text-muted-foreground text-xs">
								{invoices.length} invoice{invoices.length !== 1 ? "s" : ""}{" "}
								found
							</span>
						)}
					</div>
				</CardHeader>
				<CardContent>
					<AdvancedFilters
						className="mb-4"
						filters={FILTER_CONFIG}
						onChange={setFilterValues}
						onDeletePreset={handleDeletePreset}
						onSavePreset={handleSavePreset}
						presets={presets}
						searchPlaceholder="Search by description, customer name..."
						values={filterValues}
					/>

					{isLoading && <LoadingSkeletons />}
					{!isLoading && invoices?.length === 0 && (
						<EmptyState hasFilters={hasFilters} />
					)}
					{!isLoading && invoices && invoices.length > 0 && (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Invoice #</TableHead>
									<TableHead>Customer</TableHead>
									<TableHead className="hidden md:table-cell">Date</TableHead>
									<TableHead className="hidden lg:table-cell">Amount</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="w-12">
										<span className="sr-only">Actions</span>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{invoices?.map((invoice) => (
									<TableRow key={invoice.id}>
										<TableCell className="font-medium">
											{invoice.id.slice(-6).toUpperCase()}
										</TableCell>
										<TableCell>
											<div className="flex flex-col">
												<span className="font-medium">
													{invoice.customer?.name ?? "Unknown"}
												</span>
												<span className="text-muted-foreground text-xs">
													{invoice.customer?.email}
												</span>
											</div>
										</TableCell>
										<TableCell className="hidden text-muted-foreground md:table-cell">
											{format(new Date(invoice.invoiceDate), "MMM d, yyyy")}
										</TableCell>
										<TableCell className="hidden lg:table-cell">
											${Number(invoice.amount).toFixed(2)}
										</TableCell>
										<TableCell>
											<Badge variant={getInvoiceStatusVariant(invoice.status)}>
												{invoice.status}
											</Badge>
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
																href={`/admin/invoices/${invoice.id}` as Route}
															/>
														}
													>
														<EyeIcon className="mr-2 size-4" />
														View Details
													</DropdownMenuItem>
													{invoice.fileUrl && (
														<DropdownMenuItem
															onClick={() =>
																window.open(invoice.fileUrl as string, "_blank")
															}
														>
															<FileTextIcon className="mr-2 size-4" />
															Download PDF
														</DropdownMenuItem>
													)}
													<DropdownMenuItem
														onClick={() =>
															toast.info(
																"Invoice regeneration is not yet implemented in backend"
															)
														}
													>
														Regenerate
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
