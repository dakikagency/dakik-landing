"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignaturePad } from "@/components/ui/signature-pad";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { queryClient, trpc } from "@/utils/trpc";

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

function ArrowLeftIcon({ className }: { className?: string }) {
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
				d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
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

function CheckCircleIcon({ className }: { className?: string }) {
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
				d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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

function formatDate(date: Date | string): string {
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatDateTime(date: Date | string): string {
	return new Date(date).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
}

export default function ContractDetailPage() {
	const params = useParams();
	const router = useRouter();
	const contractId = params.id as string;

	const [signatureData, setSignatureData] = useState<string | null>(null);
	const [signerName, setSignerName] = useState("");
	const [agreedToTerms, setAgreedToTerms] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const {
		data: contract,
		isLoading,
		isError,
	} = useQuery(trpc.portal.getContractById.queryOptions({ contractId }));

	const markViewedMutation = useMutation(
		trpc.portal.markContractViewed.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.portal.getContractById.queryKey({ contractId }),
				});
			},
		})
	);

	const signContractMutation = useMutation(
		trpc.portal.signContract.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.portal.getContractById.queryKey({ contractId }),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.portal.getContracts.queryKey(),
				});
			},
			onError: (err) => {
				setError(err.message);
			},
		})
	);

	// Mark as viewed when page loads (if SENT status)
	if (contract?.status === "SENT" && !markViewedMutation.isPending) {
		markViewedMutation.mutate({ contractId });
	}

	const handleSignContract = () => {
		setError(null);

		if (!signatureData) {
			setError("Please draw your signature");
			return;
		}

		if (!signerName.trim()) {
			setError("Please enter your full name");
			return;
		}

		if (!agreedToTerms) {
			setError("You must agree to the terms to sign the contract");
			return;
		}

		signContractMutation.mutate({
			contractId,
			signatureData,
			signerName: signerName.trim(),
			agreedToTerms,
		});
	};

	const canSign = contract?.status === "SENT" || contract?.status === "VIEWED";

	if (isLoading) {
		return (
			<div className="p-6 lg:p-8">
				<div className="mb-8">
					<Skeleton className="mb-2 h-8 w-32" />
					<Skeleton className="h-6 w-64" />
				</div>
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-4 w-32" />
					</CardHeader>
					<CardContent className="space-y-4">
						<Skeleton className="h-32 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-32" />
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isError || !contract) {
		return (
			<div className="p-6 lg:p-8">
				<div className="mb-8">
					<Link
						className="mb-4 inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
						href="/portal/contracts"
					>
						<ArrowLeftIcon className="size-4" />
						Back to Contracts
					</Link>
				</div>
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<p className="text-muted-foreground text-sm">
							Contract not found or you don&apos;t have access to this contract.
						</p>
						<Button
							className="mt-4"
							onClick={() => router.push("/portal/contracts")}
							variant="outline"
						>
							Return to Contracts
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="p-6 lg:p-8">
			{/* Back Link */}
			<div className="mb-6">
				<Link
					className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
					href="/portal/contracts"
				>
					<ArrowLeftIcon className="size-4" />
					Back to Contracts
				</Link>
			</div>

			{/* Contract Header */}
			<div className="mb-8">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex items-start gap-3">
						<DocumentIcon className="mt-1 size-6 shrink-0 text-muted-foreground" />
						<div>
							<h1 className="font-medium text-2xl tracking-tight">
								{contract.title}
							</h1>
							<p className="mt-1 text-muted-foreground text-sm">
								Created {formatDate(contract.createdAt)}
							</p>
						</div>
					</div>
					<StatusBadge status={contract.status as ContractStatus} />
				</div>
			</div>

			{/* Contract Document Preview */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Contract Document</CardTitle>
					<CardDescription>
						Review the contract document before signing
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-muted-foreground text-sm">
							Click below to view and review the full contract document.
						</p>
						<Button
							onClick={() =>
								window.open(contract.fileUrl, "_blank", "noopener,noreferrer")
							}
							size="sm"
							variant="outline"
						>
							<DownloadIcon className="size-4" />
							View Document
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Signed Contract Info */}
			{contract.status === "SIGNED" && (
				<Card className="border-l-4 border-l-success">
					<CardHeader>
						<div className="flex items-center gap-2">
							<CheckCircleIcon className="size-5 text-success" />
							<CardTitle>Contract Signed</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<span className="text-muted-foreground text-xs">Signed by</span>
								<p className="mt-1 font-medium text-sm">
									{contract.signerName}
								</p>
							</div>
							<div>
								<span className="text-muted-foreground text-xs">Signed at</span>
								<p className="mt-1 font-medium text-sm">
									{contract.signedAt
										? formatDateTime(contract.signedAt)
										: "N/A"}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* E-Signature Section */}
			{canSign && (
				<Card>
					<CardHeader>
						<CardTitle>Sign Contract</CardTitle>
						<CardDescription>
							Please review the contract document above, then sign below to
							indicate your agreement.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Signer Name */}
						<div className="space-y-2">
							<Label htmlFor="signerName">Full Legal Name</Label>
							<Input
								id="signerName"
								onChange={(e) => setSignerName(e.target.value)}
								placeholder="Enter your full name as it appears on legal documents"
								value={signerName}
							/>
						</div>

						{/* Signature Pad */}
						<div className="space-y-2">
							<Label>Your Signature</Label>
							<SignaturePad
								className="max-w-lg"
								disabled={signContractMutation.isPending}
								onSignatureChange={setSignatureData}
							/>
						</div>

						{/* Terms Agreement */}
						<div className="flex items-start gap-2">
							<Checkbox
								checked={agreedToTerms}
								disabled={signContractMutation.isPending}
								id="terms"
								onCheckedChange={(checked) =>
									setAgreedToTerms(checked === true)
								}
							/>
							<Label className="text-sm leading-relaxed" htmlFor="terms">
								I have read and agree to the terms and conditions outlined in
								this contract. I understand that by signing electronically, this
								signature is legally binding.
							</Label>
						</div>

						{/* Error Message */}
						{error && (
							<div className="rounded-none border border-destructive/20 bg-destructive/10 p-3 text-destructive text-sm">
								{error}
							</div>
						)}

						{/* Submit Button */}
						<div className="flex gap-4">
							<Button
								disabled={
									!(signatureData && signerName.trim() && agreedToTerms) ||
									signContractMutation.isPending
								}
								onClick={handleSignContract}
							>
								{signContractMutation.isPending
									? "Signing..."
									: "Sign Contract"}
							</Button>
							<Button
								onClick={() => router.push("/portal/contracts")}
								variant="outline"
							>
								Cancel
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Expired Contract Notice */}
			{contract.status === "EXPIRED" && (
				<Card className="border-l-4 border-l-destructive">
					<CardContent className="py-6">
						<p className="text-muted-foreground text-sm">
							This contract has expired and can no longer be signed. Please
							contact support if you need assistance.
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
