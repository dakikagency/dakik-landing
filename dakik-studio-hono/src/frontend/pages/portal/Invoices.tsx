import { useEffect, useState } from "react";
import { api, type Invoice } from "../../lib/api";
import { cn } from "../../lib/utils";

const statusConfig: Record<string, { label: string; color: string }> = {
	UNPAID: {
		label: "Unpaid",
		color: "bg-red-500/10 text-red-400 border-red-500/20",
	},
	PENDING: {
		label: "Pending",
		color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
	},
	PAID: {
		label: "Paid",
		color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
	},
	OVERDUE: {
		label: "Overdue",
		color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
	},
};

export function PortalInvoices() {
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchInvoices() {
			try {
				const mockCustomerId = "customer-1";
				const res = await api.invoices.list({ customerId: mockCustomerId });
				setInvoices(res.invoices);
			} catch {
				setInvoices([]);
			} finally {
				setIsLoading(false);
			}
		}

		fetchInvoices();
	}, []);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const handlePayNow = (invoice: Invoice) => {
		if (invoice.fileUrl) {
			window.open(invoice.fileUrl, "_blank");
		}
	};

	const getStatusConfig = (status: string) => {
		return (
			statusConfig[status] || {
				label: status,
				color: "bg-white/10 text-white/70 border-white/20",
			}
		);
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-3xl">My Invoices</h1>
				<p className="mt-2 text-white/60">View and pay your invoices</p>
			</div>

			{isLoading && (
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<div className="h-20 animate-pulse rounded-xl bg-white/5" key={i} />
					))}
				</div>
			)}

			{!isLoading && invoices.length === 0 && (
				<div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-16">
					<svg
						aria-hidden="true"
						className="h-12 w-12 text-white/30"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
						/>
					</svg>
					<p className="mt-4 font-medium text-lg">No invoices yet</p>
					<p className="mt-1 text-sm text-white/50">
						Your invoices will appear here
					</p>
				</div>
			)}

			{!isLoading && invoices.length > 0 && (
				<div className="overflow-hidden rounded-xl border border-white/10">
					<table className="w-full">
						<thead className="border-white/10 border-b bg-white/5">
							<tr>
								<th className="px-6 py-4 text-left font-medium text-sm text-white/60">
									Invoice #
								</th>
								<th className="px-6 py-4 text-left font-medium text-sm text-white/60">
									Description
								</th>
								<th className="px-6 py-4 text-right font-medium text-sm text-white/60">
									Amount
								</th>
								<th className="px-6 py-4 text-center font-medium text-sm text-white/60">
									Status
								</th>
								<th className="px-6 py-4 text-right font-medium text-sm text-white/60">
									Due Date
								</th>
								<th className="px-6 py-4 text-right font-medium text-sm text-white/60">
									Action
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/10">
							{invoices.map((invoice) => {
								const statusCfg = getStatusConfig(invoice.status);
								const isPayable =
									invoice.status === "UNPAID" ||
									invoice.status === "PENDING" ||
									invoice.status === "OVERDUE";

								return (
									<tr
										className="transition-colors hover:bg-white/5"
										key={invoice.id}
									>
										<td className="whitespace-nowrap px-6 py-4">
											<span className="font-mono text-sm">
												#{invoice.id.slice(-8).toUpperCase()}
											</span>
										</td>
										<td className="px-6 py-4">
											<span className="text-sm">
												{invoice.description || "Project Invoice"}
											</span>
										</td>
										<td className="whitespace-nowrap px-6 py-4 text-right">
											<span className="font-medium">
												{formatCurrency(invoice.amount)}
											</span>
										</td>
										<td className="whitespace-nowrap px-6 py-4 text-center">
											<span
												className={cn(
													"inline-flex rounded-full border px-2.5 py-0.5 font-medium text-xs",
													statusCfg.color
												)}
											>
												{statusCfg.label}
											</span>
										</td>
										<td className="whitespace-nowrap px-6 py-4 text-right">
											<span className="text-sm text-white/60">
												{invoice.dueDate ? formatDate(invoice.dueDate) : "-"}
											</span>
										</td>
										<td className="whitespace-nowrap px-6 py-4 text-right">
											{isPayable ? (
												<button
													className="rounded-lg bg-white px-4 py-2 font-medium text-black text-sm transition-opacity hover:opacity-90"
													onClick={() => handlePayNow(invoice)}
													type="button"
												>
													Pay Now
												</button>
											) : (
												<span className="text-sm text-white/40">Paid</span>
											)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			{invoices.length > 0 && (
				<div className="rounded-xl border border-white/10 bg-white/5 p-6">
					<div className="flex items-center justify-between">
						<span className="text-white/60">Total Outstanding</span>
						<span className="font-bold text-2xl">
							{formatCurrency(
								invoices
									.filter(
										(i) =>
											i.status === "UNPAID" ||
											i.status === "PENDING" ||
											i.status === "OVERDUE"
									)
									.reduce((sum, i) => sum + i.amount, 0)
							)}
						</span>
					</div>
				</div>
			)}
		</div>
	);
}
