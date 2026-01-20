"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	CalendarIcon,
	EyeIcon,
	FileTextIcon,
	FilterIcon,
	MoreHorizontalIcon,
	PlusIcon,
	SearchIcon,
	SendIcon,
	TrashIcon,
	XIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

const STATUS_OPTIONS = [
	{ value: "all", label: "All Statuses" },
	{ value: "DRAFT", label: "Draft" },
	{ value: "SENT", label: "Sent" },
	{ value: "VIEWED", label: "Viewed" },
	{ value: "SIGNED", label: "Signed" },
	{ value: "EXPIRED", label: "Expired" },
] as const;

type ContractStatus = Exclude<(typeof STATUS_OPTIONS)[number]["value"], "all">;

interface ContractData {
	id: string;
	title: string;
	fileUrl: string;
	status: ContractStatus;
	signedAt: Date | string | null;
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
}

interface CustomerOption {
	id: string;
	companyName: string | null;
	user: {
		id: string;
		name: string | null;
		email: string;
	};
}

function getStatusBadgeVariant(status: string) {
	const variants: Record<
		string,
		"info" | "warning" | "secondary" | "success" | "outline" | "destructive"
	> = {
		DRAFT: "secondary",
		SENT: "info",
		VIEWED: "warning",
		SIGNED: "success",
		EXPIRED: "destructive",
	};
	return variants[status] ?? "outline";
}

function formatStatus(status: string) {
	return status.replace(/_/g, " ");
}

function formatDate(date: Date | string) {
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
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
						<Skeleton className="h-5 w-16" />
						<Skeleton className="h-8 w-8" />
					</div>
				</div>
			))}
		</div>
	);
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
	return (
		<div className="py-8 text-center">
			<FileTextIcon className="mx-auto size-12 text-muted-foreground/50" />
			<p className="mt-4 text-muted-foreground text-sm">
				{hasFilters
					? "No contracts found matching your criteria."
					: "No contracts yet. Create your first contract to get started."}
			</p>
		</div>
	);
}

function CustomerSelectOptions({
	customers,
	isLoading,
}: {
	customers: CustomerOption[] | undefined;
	isLoading: boolean;
}) {
	if (isLoading) {
		return (
			<SelectItem disabled value="loading">
				Loading customers...
			</SelectItem>
		);
	}

	if (!customers || customers.length === 0) {
		return (
			<SelectItem disabled value="none">
				No customers available
			</SelectItem>
		);
	}

	return customers.map((customer) => (
		<SelectItem key={customer.id} value={customer.id}>
			{customer.user.name ?? customer.user.email}
			{customer.companyName && ` (${customer.companyName})`}
		</SelectItem>
	));
}

function CreateContractForm({ onClose }: { onClose: () => void }) {
	const [title, setTitle] = useState("");
	const [customerId, setCustomerId] = useState("");
	const [fileUrl, setFileUrl] = useState("");

	const { data: customers, isLoading: isLoadingCustomers } = useQuery(
		trpc.admin.getCustomers.queryOptions({})
	);

	const createMutation = useMutation(
		trpc.contracts.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.contracts.list.queryKey(),
				});
				toast.success("Contract created successfully");
				onClose();
			},
			onError: (error) => {
				toast.error(error.message || "Failed to create contract");
			},
		})
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!title.trim()) {
			toast.error("Please enter a contract title");
			return;
		}

		if (!customerId) {
			toast.error("Please select a customer");
			return;
		}

		if (!fileUrl.trim()) {
			toast.error("Please enter a file URL");
			return;
		}

		try {
			new URL(fileUrl);
		} catch {
			toast.error("Please enter a valid URL");
			return;
		}

		createMutation.mutate({
			title: title.trim(),
			customerId,
			fileUrl: fileUrl.trim(),
		});
	};

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			<div className="space-y-2">
				<Label htmlFor="title">Contract Title</Label>
				<Input
					id="title"
					onChange={(e) => setTitle(e.target.value)}
					placeholder="e.g., Website Development Agreement"
					value={title}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="customer">Customer</Label>
				<Select
					onValueChange={(value) => {
						if (value) {
							setCustomerId(value);
						}
					}}
					value={customerId || undefined}
				>
					<SelectTrigger className="w-full" id="customer">
						{customerId ? (
							<SelectValue />
						) : (
							<span className="text-muted-foreground">Select a customer</span>
						)}
					</SelectTrigger>
					<SelectContent>
						<CustomerSelectOptions
							customers={customers}
							isLoading={isLoadingCustomers}
						/>
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="fileUrl">Contract PDF URL</Label>
				<Input
					id="fileUrl"
					onChange={(e) => setFileUrl(e.target.value)}
					placeholder="https://example.com/contract.pdf"
					type="url"
					value={fileUrl}
				/>
				<p className="text-muted-foreground text-xs">
					Enter the URL to the contract PDF document.
				</p>
			</div>

			<div className="flex justify-end gap-2 pt-2">
				<Button onClick={onClose} type="button" variant="outline">
					Cancel
				</Button>
				<Button disabled={createMutation.isPending} type="submit">
					{createMutation.isPending ? "Creating..." : "Create Contract"}
				</Button>
			</div>
		</form>
	);
}

function ContractsTable({
	contracts,
	onSend,
	onDelete,
	onView,
}: {
	contracts: ContractData[];
	onSend: (id: string) => void;
	onDelete: (id: string) => void;
	onView: (url: string) => void;
}) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Contract</TableHead>
					<TableHead className="hidden sm:table-cell">Customer</TableHead>
					<TableHead>Status</TableHead>
					<TableHead className="hidden md:table-cell">Created</TableHead>
					<TableHead className="w-12">
						<span className="sr-only">Actions</span>
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{contracts.map((contract) => (
					<TableRow key={contract.id}>
						<TableCell>
							<div className="space-y-1">
								<span className="font-medium">{contract.title}</span>
								<p className="text-muted-foreground text-xs sm:hidden">
									{contract.customer.user.name}
								</p>
							</div>
						</TableCell>
						<TableCell className="hidden sm:table-cell">
							<div className="space-y-1">
								<span className="text-sm">
									{contract.customer.user.name ?? contract.customer.user.email}
								</span>
								{contract.customer.companyName && (
									<p className="text-muted-foreground text-xs">
										{contract.customer.companyName}
									</p>
								)}
							</div>
						</TableCell>
						<TableCell>
							<Badge variant={getStatusBadgeVariant(contract.status)}>
								{formatStatus(contract.status)}
							</Badge>
							{contract.signedAt && (
								<p className="mt-1 text-muted-foreground text-xs">
									Signed: {formatDate(contract.signedAt)}
								</p>
							)}
						</TableCell>
						<TableCell className="hidden md:table-cell">
							<div className="flex items-center gap-1 text-muted-foreground text-xs">
								<CalendarIcon className="size-3" />
								{formatDate(contract.createdAt)}
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
									<DropdownMenuItem onClick={() => onView(contract.fileUrl)}>
										<EyeIcon className="mr-2 size-4" />
										View PDF
									</DropdownMenuItem>
									{contract.status === "DRAFT" && (
										<DropdownMenuItem onClick={() => onSend(contract.id)}>
											<SendIcon className="mr-2 size-4" />
											Send Contract
										</DropdownMenuItem>
									)}
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => onDelete(contract.id)}
										variant="destructive"
									>
										<TrashIcon className="mr-2 size-4" />
										Delete
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

function MobileContractCards({
	contracts,
	onSend,
	onDelete,
	onView,
}: {
	contracts: ContractData[];
	onSend: (id: string) => void;
	onDelete: (id: string) => void;
	onView: (url: string) => void;
}) {
	return (
		<div className="block sm:hidden">
			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Contract Details</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{contracts.slice(0, 5).map((contract) => (
						<div
							className="border-b pb-4 last:border-0 last:pb-0"
							key={`mobile-contract-${contract.id}`}
						>
							<div className="flex items-start justify-between">
								<div className="space-y-1">
									<p className="font-medium">{contract.title}</p>
									<p className="text-muted-foreground text-xs">
										{contract.customer.user.name}
										{contract.customer.companyName &&
											` - ${contract.customer.companyName}`}
									</p>
								</div>
								<Badge variant={getStatusBadgeVariant(contract.status)}>
									{formatStatus(contract.status)}
								</Badge>
							</div>
							<div className="mt-2 flex items-center gap-1 text-muted-foreground text-xs">
								<CalendarIcon className="size-3" />
								Created: {formatDate(contract.createdAt)}
							</div>
							{contract.signedAt && (
								<div className="mt-1 text-muted-foreground text-xs">
									Signed: {formatDate(contract.signedAt)}
								</div>
							)}
							<div className="mt-3 flex gap-2">
								<Button
									onClick={() => onView(contract.fileUrl)}
									size="xs"
									variant="outline"
								>
									<EyeIcon className="mr-1.5 size-3" />
									View
								</Button>
								{contract.status === "DRAFT" && (
									<Button
										onClick={() => onSend(contract.id)}
										size="xs"
										variant="outline"
									>
										<SendIcon className="mr-1.5 size-3" />
										Send
									</Button>
								)}
								<Button
									onClick={() => onDelete(contract.id)}
									size="xs"
									variant="outline"
								>
									<TrashIcon className="mr-1.5 size-3" />
									Delete
								</Button>
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}

export default function ContractsPage() {
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] =
		useState<(typeof STATUS_OPTIONS)[number]["value"]>("all");
	const [showCreateForm, setShowCreateForm] = useState(false);

	const { data: contracts, isLoading } = useQuery(
		trpc.contracts.list.queryOptions({
			search: search || undefined,
			status: statusFilter === "all" ? undefined : statusFilter,
		})
	);

	const sendMutation = useMutation(
		trpc.contracts.send.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries({
					queryKey: trpc.contracts.list.queryKey(),
				});
				toast.success(
					`Contract sent to ${data.customer.user.name ?? data.customer.user.email}`
				);
			},
			onError: (error) => {
				toast.error(error.message || "Failed to send contract");
			},
		})
	);

	const deleteMutation = useMutation(
		trpc.contracts.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.contracts.list.queryKey(),
				});
				toast.success("Contract deleted");
			},
			onError: (error) => {
				toast.error(error.message || "Failed to delete contract");
			},
		})
	);

	const handleSend = (id: string) => {
		sendMutation.mutate({ id });
	};

	const handleDelete = (id: string) => {
		deleteMutation.mutate({ id });
	};

	const handleView = (url: string) => {
		window.open(url, "_blank", "noopener,noreferrer");
	};

	const hasFilters = search !== "" || statusFilter !== "all";
	const hasContracts = contracts && contracts.length > 0;

	function renderTableContent() {
		if (isLoading) {
			return <LoadingSkeletons />;
		}
		if (!hasContracts) {
			return <EmptyState hasFilters={hasFilters} />;
		}
		return (
			<ContractsTable
				contracts={contracts}
				onDelete={handleDelete}
				onSend={handleSend}
				onView={handleView}
			/>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold font-display text-2xl tracking-tight">
						Contracts
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Manage contracts and agreements.
					</p>
				</div>
				<Button onClick={() => setShowCreateForm(true)}>
					<PlusIcon className="mr-2 size-4" />
					New Contract
				</Button>
			</div>

			{/* Create Contract Form */}
			{showCreateForm && (
				<Card>
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm">Create New Contract</CardTitle>
							<Button
								onClick={() => setShowCreateForm(false)}
								size="icon-xs"
								variant="ghost"
							>
								<XIcon className="size-4" />
								<span className="sr-only">Close</span>
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<CreateContractForm onClose={() => setShowCreateForm(false)} />
					</CardContent>
				</Card>
			)}

			{/* Search and Filters */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<CardTitle className="text-sm">All Contracts</CardTitle>
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
							<div className="relative w-full sm:w-64">
								<SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									className="pl-8"
									onChange={(e) => setSearch(e.target.value)}
									placeholder="Search contracts..."
									value={search}
								/>
							</div>
							<Select
								onValueChange={(value) => setStatusFilter(value ?? "all")}
								value={statusFilter}
							>
								<SelectTrigger className="w-full sm:w-44">
									<FilterIcon className="mr-2 size-4" />
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
				</CardHeader>
				<CardContent>{renderTableContent()}</CardContent>
			</Card>

			{/* Mobile Contract Cards */}
			{hasContracts && (
				<MobileContractCards
					contracts={contracts}
					onDelete={handleDelete}
					onSend={handleSend}
					onView={handleView}
				/>
			)}
		</div>
	);
}
