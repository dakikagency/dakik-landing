"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, CreditCard, Download, FileText } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { PaymentModal } from "@/components/portal/payment-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";

type BadgeVariant = "default" | "destructive" | "secondary";

function getInvoiceStatusVariant(status: string): BadgeVariant {
	if (status === "PAID") {
		return "default";
	}
	if (status === "OVERDUE") {
		return "destructive";
	}
	return "secondary";
}

export default function InvoiceDetailsPage() {
	const params = useParams();
	const _router = useRouter();
	const invoiceId = params.id as string;
	const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

	const {
		data: invoice,
		isLoading,
		refetch,
	} = useQuery(trpc.portal.getInvoiceById.queryOptions({ invoiceId }));

	if (isLoading) {
		return (
			<div className="space-y-6 p-6 lg:p-8">
				<div className="flex items-center gap-4">
					<Skeleton className="size-8 rounded-full" />
					<Skeleton className="h-8 w-48" />
				</div>
				<Card>
					<CardHeader>
						<Skeleton className="h-8 w-32" />
						<Skeleton className="h-4 w-48" />
					</CardHeader>
					<CardContent className="space-y-4">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-full" />
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!invoice) {
		return (
			<div className="p-6 lg:p-8">
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<FileText className="size-12 text-muted-foreground" />
					<h2 className="mt-4 font-semibold text-lg">Invoice not found</h2>
					<p className="mt-2 text-muted-foreground text-sm">
						The invoice you are looking for does not exist or you do not have
						permission to view it.
					</p>
					<Link className="mt-6" href="/portal/invoices">
						<Button variant="outline">
							<ArrowLeft className="mr-2 size-4" />
							Back to Invoices
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 lg:p-8">
			{/* Header */}
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<Link href="/portal/invoices">
						<Button className="rounded-full" size="icon" variant="ghost">
							<ArrowLeft className="size-4" />
							<span className="sr-only">Back</span>
						</Button>
					</Link>
					<div>
						<div className="flex items-center gap-3">
							<h1 className="font-medium text-2xl tracking-tight">
								Invoice {invoice.id.slice(-6).toUpperCase()}
							</h1>
							<Badge variant={getInvoiceStatusVariant(invoice.status)}>
								{invoice.status}
							</Badge>
						</div>
						<p className="mt-1 text-muted-foreground text-sm">
							Issued on {format(new Date(invoice.invoiceDate), "MMMM d, yyyy")}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{invoice.fileUrl && (
						<Link href={invoice.fileUrl} target="_blank">
							<Button variant="outline">
								<Download className="mr-2 size-4" />
								Download PDF
							</Button>
						</Link>
					)}
					{invoice.status !== "PAID" && (
						<Button onClick={() => setIsPaymentModalOpen(true)}>
							<CreditCard className="mr-2 size-4" />
							Pay Now
						</Button>
					)}
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Main Content */}
				<div className="space-y-6 lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Invoice Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<h3 className="font-medium text-muted-foreground text-sm">
										Billed To
									</h3>
									<p className="mt-1 font-medium">Dakik Studio Client</p>
									{/* Add customer details if available in invoice object */}
								</div>
								<div>
									<h3 className="font-medium text-muted-foreground text-sm">
										Project
									</h3>
									<p className="mt-1 font-medium">
										{invoice.project?.title || "N/A"}
									</p>
								</div>
							</div>

							<Separator />

							<div>
								<h3 className="mb-2 font-medium text-muted-foreground text-sm">
									Description
								</h3>
								<p className="text-sm">
									{invoice.description || "No description provided."}
								</p>
							</div>

							<Separator />

							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Subtotal</span>
									<span>${Number(invoice.amount).toFixed(2)}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Tax</span>
									<span>$0.00</span>
								</div>
								<Separator className="my-2" />
								<div className="flex justify-between font-medium text-lg">
									<span>Total</span>
									<span>${Number(invoice.amount).toFixed(2)}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="font-medium text-sm">
								Payment Information
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<div className="mb-1 font-semibold text-muted-foreground text-xs uppercase">
									Status
								</div>
								<div className="font-medium">{invoice.status}</div>
							</div>
							<div>
								<div className="mb-1 font-semibold text-muted-foreground text-xs uppercase">
									Due Date
								</div>
								<div className="font-medium">
									{invoice.dueDate
										? format(new Date(invoice.dueDate), "MMM d, yyyy")
										: "Due on receipt"}
								</div>
							</div>
							{invoice.paidAt && (
								<div>
									<div className="mb-1 font-semibold text-muted-foreground text-xs uppercase">
										Paid On
									</div>
									<div className="font-medium">
										{format(new Date(invoice.paidAt), "MMM d, yyyy")}
									</div>
								</div>
							)}
						</CardContent>
						{invoice.status !== "PAID" && (
							<CardFooter>
								<Button
									className="w-full"
									onClick={() => setIsPaymentModalOpen(true)}
								>
									Pay Invoice
								</Button>
							</CardFooter>
						)}
					</Card>
				</div>
			</div>

			<PaymentModal
				amount={Number(invoice.amount)}
				invoiceId={invoiceId}
				isOpen={isPaymentModalOpen}
				onClose={() => setIsPaymentModalOpen(false)}
				onSuccess={() => {
					setIsPaymentModalOpen(false);
					refetch();
				}}
			/>
		</div>
	);
}
