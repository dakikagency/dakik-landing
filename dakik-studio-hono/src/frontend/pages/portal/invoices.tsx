import { Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { api, type Invoice } from "../../lib/api";
import { cn } from "../../lib/utils";

const statusConfig: Record<string, { label: string; tone: string }> = {
	UNPAID: { label: "Unpaid", tone: "text-red-400 border-red-500/40" },
	PENDING: { label: "Pending", tone: "text-amber-400 border-amber-500/40" },
	PAID: { label: "Paid", tone: "text-emerald-400 border-emerald-500/40" },
	OVERDUE: { label: "Overdue", tone: "text-orange-400 border-orange-500/40" },
};

export function PortalInvoices() {
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchInvoices() {
			try {
				const mockCustomerId = "customer-1";
				const res = await api.invoices.list({ customerId: mockCustomerId });
				setInvoices(res.invoices);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load invoices");
			} finally {
				setIsLoading(false);
			}
		}

		fetchInvoices();
	}, []);

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);

	const formatDate = (dateStr: string) =>
		new Date(dateStr).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});

	const handlePayNow = (invoice: Invoice) => {
		if (invoice.fileUrl) {
			window.open(invoice.fileUrl, "_blank");
		}
	};

	const getStatusConfig = (status: string) =>
		statusConfig[status] || {
			label: status,
			tone: "text-white/70 border-white/20",
		};

	const outstanding = invoices
		.filter(
			(i) =>
				i.status === "UNPAID" ||
				i.status === "PENDING" ||
				i.status === "OVERDUE"
		)
		.reduce((sum, i) => sum + i.amount, 0);

	return (
		<div className="space-y-10">
			<header>
				<p className="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
					// Invoices
				</p>
				<h1 className="mt-3 font-black text-4xl uppercase leading-[0.9] tracking-[-0.03em] sm:text-5xl">
					Pay & Done.
				</h1>
				<div className="mt-6 h-px bg-white/10" />
			</header>

			{error && (
				<div className="border border-red-500/30 bg-red-500/5 p-4 font-mono text-[11px] text-red-300 uppercase tracking-[0.2em]">
					// {error}
				</div>
			)}

			{invoices.length > 0 && (
				<div className="flex flex-wrap items-end justify-between gap-4 border border-white/10 bg-neutral-950 p-6">
					<div>
						<p className="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
							// Total outstanding
						</p>
						<p
							className={cn(
								"mt-2 font-black text-5xl tracking-[-0.04em]",
								outstanding > 0 ? "text-primary" : "text-white"
							)}
						>
							{formatCurrency(outstanding)}
						</p>
					</div>
					<p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.35em]">
						// {invoices.length} invoice
						{invoices.length === 1 ? "" : "s"} total
					</p>
				</div>
			)}

			{isLoading && (
				<div className="space-y-3">
					{[1, 2, 3].map((i) => (
						<div
							className="h-16 animate-pulse border border-white/10 bg-white/5"
							key={i}
						/>
					))}
				</div>
			)}

			{!isLoading && !error && invoices.length === 0 && (
				<div className="flex flex-col items-center justify-center border border-white/10 bg-white/[0.02] py-20">
					<Receipt className="h-10 w-10 text-white/20" />
					<p className="mt-6 font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
						// No invoices yet
					</p>
					<p className="mt-2 text-sm text-white/40">
						Invoices will appear here once issued.
					</p>
				</div>
			)}

			{!isLoading && invoices.length > 0 && (
				<>
					{/* Desktop table */}
					<div className="hidden border border-white/10 bg-neutral-950 md:block">
						<table className="w-full">
							<thead className="border-white/10 border-b">
								<tr>
									<Th align="left">// Invoice</Th>
									<Th align="left">// Description</Th>
									<Th align="right">// Amount</Th>
									<Th align="center">// Status</Th>
									<Th align="right">// Due</Th>
									<Th align="right">// Action</Th>
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
											className="transition-colors hover:bg-white/[0.03]"
											key={invoice.id}
										>
											<td className="whitespace-nowrap px-6 py-4">
												<span className="font-mono text-[11px] text-white/80 uppercase tracking-[0.15em]">
													#{invoice.id.slice(-8).toUpperCase()}
												</span>
											</td>
											<td className="px-6 py-4">
												<span className="text-sm text-white/80">
													{invoice.description || "Project Invoice"}
												</span>
											</td>
											<td className="whitespace-nowrap px-6 py-4 text-right">
												<span className="font-bold tabular-nums">
													{formatCurrency(invoice.amount)}
												</span>
											</td>
											<td className="whitespace-nowrap px-6 py-4 text-center">
												<span
													className={cn(
														"inline-flex border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em]",
														statusCfg.tone
													)}
												>
													{statusCfg.label}
												</span>
											</td>
											<td className="whitespace-nowrap px-6 py-4 text-right">
												<span className="font-mono text-[11px] text-white/50 uppercase tracking-[0.15em]">
													{invoice.dueDate ? formatDate(invoice.dueDate) : "—"}
												</span>
											</td>
											<td className="whitespace-nowrap px-6 py-4 text-right">
												{isPayable ? (
													<button
														className="inline-flex items-center justify-center border-2 border-white bg-white px-4 py-2 font-medium text-black uppercase tracking-wider transition-colors hover:bg-black hover:text-white"
														onClick={() => handlePayNow(invoice)}
														type="button"
													>
														<span className="text-xs">Pay now</span>
													</button>
												) : (
													<span className="font-mono text-[10px] text-white/30 uppercase tracking-[0.35em]">
														// Paid
													</span>
												)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>

					{/* Mobile stacked cards */}
					<div className="space-y-3 md:hidden">
						{invoices.map((invoice) => {
							const statusCfg = getStatusConfig(invoice.status);
							const isPayable =
								invoice.status === "UNPAID" ||
								invoice.status === "PENDING" ||
								invoice.status === "OVERDUE";

							return (
								<div
									className="border border-white/10 bg-neutral-950 p-4"
									key={invoice.id}
								>
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0 flex-1">
											<span className="font-mono text-[10px] text-white/50 uppercase tracking-[0.25em]">
												#{invoice.id.slice(-8).toUpperCase()}
											</span>
											<p className="mt-1 truncate text-sm text-white/80">
												{invoice.description || "Project Invoice"}
											</p>
										</div>
										<span
											className={cn(
												"inline-flex shrink-0 border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em]",
												statusCfg.tone
											)}
										>
											{statusCfg.label}
										</span>
									</div>
									<div className="mt-4 flex items-end justify-between gap-3">
										<div>
											<p className="font-mono text-[9px] text-white/40 uppercase tracking-[0.35em]">
												// Amount
											</p>
											<p className="mt-1 font-bold text-xl tabular-nums">
												{formatCurrency(invoice.amount)}
											</p>
											{invoice.dueDate && (
												<p className="mt-1 font-mono text-[9px] text-white/40 uppercase tracking-[0.25em]">
													Due {formatDate(invoice.dueDate)}
												</p>
											)}
										</div>
										{isPayable && (
											<button
												className="inline-flex items-center justify-center border-2 border-white bg-white px-4 py-2 font-medium text-black uppercase tracking-wider transition-colors hover:bg-black hover:text-white"
												onClick={() => handlePayNow(invoice)}
												type="button"
											>
												<span className="text-xs">Pay</span>
											</button>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</>
			)}
		</div>
	);
}

function Th({
	children,
	align,
}: {
	children: React.ReactNode;
	align: "left" | "right" | "center";
}) {
	return (
		<th
			className={cn(
				"px-6 py-4 font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]",
				align === "left" && "text-left",
				align === "right" && "text-right",
				align === "center" && "text-center"
			)}
		>
			{children}
		</th>
	);
}
