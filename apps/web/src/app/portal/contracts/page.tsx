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
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

type ContractStatus = "DRAFT" | "SENT" | "VIEWED" | "SIGNED" | "EXPIRED";

const statusConfig: Record<
	ContractStatus,
	{ label: string; className: string }
> = {
	DRAFT: {
		label: "Draft",
		className: "bg-muted text-muted-foreground",
	},
	SENT: {
		label: "Awaiting Signature",
		className: "bg-warning/10 text-warning",
	},
	VIEWED: {
		label: "Viewed",
		className: "bg-info/10 text-info",
	},
	SIGNED: {
		label: "Signed",
		className: "bg-success/10 text-success",
	},
	EXPIRED: {
		label: "Expired",
		className: "bg-destructive/10 text-destructive",
	},
};

function StatusBadge({ status }: { status: ContractStatus }) {
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

function DocumentIcon({ className }: { className?: string }) {
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
				d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function DownloadIcon({ className }: { className?: string }) {
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
				d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function PenIcon({ className }: { className?: string }) {
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
				d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function formatDate(date: Date | string): string {
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
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

function ContractCardSkeleton() {
	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-3">
						<Skeleton className="mt-0.5 size-5" />
						<div className="space-y-2">
							<Skeleton className="h-5 w-48" />
							<Skeleton className="h-4 w-72" />
						</div>
					</div>
					<Skeleton className="h-6 w-28" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="grid gap-4 sm:grid-cols-2">
						<Skeleton className="h-8 w-24" />
						<Skeleton className="h-8 w-24" />
					</div>
					<Skeleton className="h-8 w-24" />
				</div>
			</CardContent>
		</Card>
	);
}

interface Contract {
	id: string;
	title: string;
	fileUrl: string;
	status: ContractStatus;
	signedAt: Date | string | null;
	signerName?: string | null;
	createdAt: Date | string;
	updatedAt: Date | string;
}

function ContractCard({
	contract,
	isPending,
}: {
	contract: Contract;
	isPending: boolean;
}) {
	const handleDownload = () => {
		window.open(contract.fileUrl, "_blank", "noopener,noreferrer");
	};

	return (
		<Card className={isPending ? "border-l-4 border-l-warning" : undefined}>
			<CardHeader>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-3">
						<DocumentIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
						<div>
							<CardTitle>{contract.title}</CardTitle>
							<CardDescription className="mt-1">
								Contract document
							</CardDescription>
						</div>
					</div>
					<StatusBadge status={contract.status} />
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="grid gap-4 text-xs sm:grid-cols-3">
						<div>
							<span className="text-muted-foreground">Created</span>
							<p className="mt-1 font-medium">
								{formatDate(contract.createdAt)}
							</p>
						</div>
						{contract.signedAt && (
							<div>
								<span className="text-muted-foreground">Signed</span>
								<p className="mt-1 font-medium">
									{formatDate(contract.signedAt)}
								</p>
							</div>
						)}
						{contract.signerName && (
							<div>
								<span className="text-muted-foreground">Signed by</span>
								<p className="mt-1 font-medium">{contract.signerName}</p>
							</div>
						)}
					</div>
					<div className="flex gap-2">
						{(contract.status === "SENT" || contract.status === "VIEWED") && (
							<Button asChild size="sm" variant="default">
								<Link href={`/portal/contracts/${contract.id}`}>
									<PenIcon className="size-4" />
									Review & Sign
								</Link>
							</Button>
						)}
						{contract.status === "SIGNED" && (
							<>
								<Button asChild size="sm" variant="outline">
									<Link href={`/portal/contracts/${contract.id}`}>
										View Details
									</Link>
								</Button>
								<Button onClick={handleDownload} size="sm" variant="ghost">
									<DownloadIcon className="size-4" />
									Download
								</Button>
							</>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default function ContractsPage() {
	const {
		data: contracts,
		isLoading,
		isError,
	} = useQuery(trpc.portal.getContracts.queryOptions());

	const pendingContracts =
		contracts?.filter((c) => c.status === "SENT" || c.status === "VIEWED") ??
		[];
	const signedContracts = contracts?.filter((c) => c.status === "SIGNED") ?? [];
	const expiredContracts =
		contracts?.filter((c) => c.status === "EXPIRED") ?? [];

	return (
		<div className="p-6 lg:p-8">
			{/* Page Header */}
			<div className="mb-8">
				<h1 className="font-medium text-2xl tracking-tight">Contracts</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					View and manage your contracts and agreements.
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
									{contracts?.length ?? 0}
								</div>
								<p className="text-muted-foreground text-xs">Total Contracts</p>
							</CardContent>
						</Card>
						<Card size="sm">
							<CardContent className="pt-4">
								<div className="font-medium text-2xl">
									{pendingContracts.length}
								</div>
								<p className="text-muted-foreground text-xs">Pending Action</p>
							</CardContent>
						</Card>
						<Card size="sm">
							<CardContent className="pt-4">
								<div className="font-medium text-2xl">
									{signedContracts.length}
								</div>
								<p className="text-muted-foreground text-xs">Signed</p>
							</CardContent>
						</Card>
						<Card size="sm">
							<CardContent className="pt-4">
								<div className="font-medium text-2xl">
									{expiredContracts.length}
								</div>
								<p className="text-muted-foreground text-xs">Expired</p>
							</CardContent>
						</Card>
					</>
				)}
			</div>

			{/* Contracts requiring action */}
			{!isLoading && pendingContracts.length > 0 && (
				<div className="mb-8">
					<h2 className="mb-4 font-medium text-lg">Requires Your Attention</h2>
					<div className="space-y-4">
						{pendingContracts.map((contract) => (
							<ContractCard
								contract={contract as Contract}
								isPending
								key={contract.id}
							/>
						))}
					</div>
				</div>
			)}

			{/* All Contracts */}
			<div>
				<h2 className="mb-4 font-medium text-lg">All Contracts</h2>
				<div className="space-y-4">
					{isLoading && (
						<>
							<ContractCardSkeleton />
							<ContractCardSkeleton />
							<ContractCardSkeleton />
						</>
					)}
					{!isLoading && isError && (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-12">
								<p className="text-muted-foreground text-sm">
									Unable to load contracts. Please try again later.
								</p>
							</CardContent>
						</Card>
					)}
					{!(isLoading || isError) &&
						contracts &&
						contracts.length > 0 &&
						contracts.map((contract) => (
							<ContractCard
								contract={contract as Contract}
								isPending={false}
								key={contract.id}
							/>
						))}
					{!(isLoading || isError) &&
						(!contracts || contracts.length === 0) && (
							<Card>
								<CardContent className="flex flex-col items-center justify-center py-12">
									<p className="text-muted-foreground text-sm">
										No contracts found. Contracts will appear here once they are
										created.
									</p>
								</CardContent>
							</Card>
						)}
				</div>
			</div>
		</div>
	);
}
