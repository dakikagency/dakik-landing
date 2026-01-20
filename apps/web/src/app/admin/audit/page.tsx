"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import type { DateRange } from "react-day-picker";

import {
	AdvancedFilters,
	type FilterConfig,
	useAdvancedFilters,
} from "@/components/admin/advanced-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { trpc } from "@/utils/trpc";

const FILTER_CONFIG: FilterConfig[] = [
	{
		key: "search",
		label: "Search",
		type: "text",
		placeholder: "Search logs...",
	},
	{
		key: "action",
		label: "Action",
		type: "text",
		placeholder: "Filter by action...",
	},
	{
		key: "entity",
		label: "Entity",
		type: "text",
		placeholder: "Filter by entity...",
	},
	{
		key: "userId",
		label: "User ID",
		type: "text",
		placeholder: "Filter by User ID...",
	},
	{
		key: "dateRange",
		label: "Date Range",
		type: "dateRange",
		placeholder: "Select date range",
	},
];

export default function AuditPage() {
	const { values, setValues, presets, savePreset, deletePreset } =
		useAdvancedFilters(FILTER_CONFIG, {
			storageKey: "audit-filters",
		});

	const apiParams = useMemo(() => {
		const params: {
			limit: number;
			search?: string;
			action?: string;
			entity?: string;
			userId?: string;
			dateFrom?: Date;
			dateTo?: Date;
		} = {
			limit: 50,
		};
		if (values.search) {
			params.search = values.search as string;
		}
		if (values.action) {
			params.action = values.action as string;
		}
		if (values.entity) {
			params.entity = values.entity as string;
		}
		if (values.userId) {
			params.userId = values.userId as string;
		}

		if (values.dateRange) {
			const dateRange = values.dateRange as DateRange;
			if (dateRange.from) {
				params.dateFrom = dateRange.from;
			}
			if (dateRange.to) {
				params.dateTo = dateRange.to;
			}
		}

		return params;
	}, [values]);

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
		useInfiniteQuery(
			trpc.audit.getLogs.infiniteQueryOptions(apiParams, {
				getNextPageParam: (lastPage: { nextCursor?: string }) =>
					lastPage.nextCursor,
			})
		);

	const logs = data?.pages.flatMap((page) => page.items) ?? [];

	const getTableBodyContent = () => {
		if (isLoading) {
			return (
				<TableRow>
					<TableCell className="h-24 text-center" colSpan={5}>
						<Loader2 className="mx-auto h-6 w-6 animate-spin" />
					</TableCell>
				</TableRow>
			);
		}

		if (logs.length === 0) {
			return (
				<TableRow>
					<TableCell className="h-24 text-center" colSpan={5}>
						No logs found.
					</TableCell>
				</TableRow>
			);
		}

		return logs.map((log) => (
			<TableRow key={log.id}>
				<TableCell className="whitespace-nowrap text-xs">
					{format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
				</TableCell>
				<TableCell>
					<div className="flex flex-col">
						<span className="font-medium text-sm">
							{log.user?.name ?? "Unknown"}
						</span>
						<span className="text-muted-foreground text-xs">
							{log.user?.email}
						</span>
					</div>
				</TableCell>
				<TableCell>
					<Badge variant="outline">{log.action}</Badge>
				</TableCell>
				<TableCell>
					<div className="flex flex-col">
						<span className="text-sm">{log.entity}</span>
						<span className="text-muted-foreground text-xs">
							{log.entityId}
						</span>
					</div>
				</TableCell>
				<TableCell className="max-w-75 truncate text-muted-foreground text-xs">
					{JSON.stringify(log.details)}
				</TableCell>
			</TableRow>
		));
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold font-display text-2xl tracking-tight">
						Audit Logs
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Track system activities and changes.
					</p>
				</div>
			</div>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm">Activity History</CardTitle>
				</CardHeader>
				<CardContent>
					<AdvancedFilters
						className="mb-4"
						filters={FILTER_CONFIG}
						onChange={setValues}
						onDeletePreset={deletePreset}
						onSavePreset={savePreset}
						presets={presets}
						searchPlaceholder="Search logs..."
						values={values}
					/>

					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>User</TableHead>
									<TableHead>Action</TableHead>
									<TableHead>Entity</TableHead>
									<TableHead>Details</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{getTableBodyContent()}
								{isFetchingNextPage && (
									<TableRow>
										<TableCell className="h-24 text-center" colSpan={5}>
											<Loader2 className="mx-auto h-6 w-6 animate-spin" />
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>

					{hasNextPage && (
						<div className="mt-4 flex justify-center">
							<Button
								disabled={isFetchingNextPage}
								onClick={() => fetchNextPage()}
								variant="outline"
							>
								{isFetchingNextPage ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Loading...
									</>
								) : (
									"Load More"
								)}
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
