"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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

export default function InvoicesPage() {
	const { data: invoices, isLoading } = useQuery(
		trpc.portal.getInvoices.queryOptions()
	);

	return (
		<div className="p-6 lg:p-8">
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="font-medium text-2xl tracking-tight">Invoices</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						View and manage your invoices.
					</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Invoices</CardTitle>
					<CardDescription>
						A list of all invoices issued to you.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading && (
						<div className="space-y-4">
							<Skeleton className="h-12 w-full" />
							<Skeleton className="h-12 w-full" />
							<Skeleton className="h-12 w-full" />
						</div>
					)}
					{!isLoading && (!invoices || invoices.length === 0) && (
						<div className="py-8 text-center text-muted-foreground">
							No invoices found.
						</div>
					)}
					{!isLoading && invoices && invoices.length > 0 && (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Invoice #</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{invoices?.map((invoice) => (
									<TableRow key={invoice.id}>
										<TableCell className="font-medium">
											{invoice.id.slice(-6).toUpperCase()}
										</TableCell>
										<TableCell>
											{format(new Date(invoice.invoiceDate), "MMM d, yyyy")}
										</TableCell>
										<TableCell>${Number(invoice.amount).toFixed(2)}</TableCell>
										<TableCell>
											<Badge variant={getInvoiceStatusVariant(invoice.status)}>
												{invoice.status}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<Link href={`/portal/invoices/${invoice.id}`}>
												<Button size="sm" variant="outline">
													View Details
												</Button>
											</Link>
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
