import {
	MoreHorizontalIcon,
	PencilIcon,
	PlusIcon,
	Trash2Icon,
	XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api, type Invoice } from "../../lib/api";

const STATUS_OPTIONS = [
	{ value: "UNPAID", label: "Unpaid" },
	{ value: "PENDING", label: "Pending" },
	{ value: "PAID", label: "Paid" },
	{ value: "OVERDUE", label: "Overdue" },
];

function StatusBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		UNPAID: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
		PENDING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
		PAID: "bg-green-500/20 text-green-400 border-green-500/30",
		OVERDUE: "bg-red-500/20 text-red-400 border-red-500/30",
	};

	return (
		<span
			className={`inline-flex rounded-full border px-2 py-0.5 font-medium text-xs ${colors[status] ?? "border-gray-500/30 bg-gray-500/20 text-gray-400"}`}
		>
			{status}
		</span>
	);
}

function LoadingSkeletons() {
	return (
		<div className="space-y-3">
			{[1, 2, 3, 4, 5].map((i) => (
				<div className="flex items-center justify-between py-3" key={i}>
					<div className="space-y-2">
						<div className="h-4 w-32 animate-pulse rounded bg-white/10" />
						<div className="h-3 w-48 animate-pulse rounded bg-white/10" />
					</div>
					<div className="h-5 w-24 animate-pulse rounded bg-white/10" />
				</div>
			))}
		</div>
	);
}

function EmptyState() {
	return (
		<div className="py-8 text-center">
			<p className="text-sm text-white/40">No invoices yet.</p>
		</div>
	);
}

interface InvoiceFormData {
	customerId: string;
	projectId: string;
	amount: number;
	description: string;
	status: string;
	invoiceDate: string;
	dueDate: string;
}

function InvoiceModal({
	isOpen,
	onClose,
	onSubmit,
	initialData,
	isLoading,
}: {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: InvoiceFormData) => void;
	initialData?: Invoice;
	isLoading?: boolean;
}) {
	const [formData, setFormData] = useState<InvoiceFormData>({
		customerId: "",
		projectId: "",
		amount: 0,
		description: "",
		status: "UNPAID",
		invoiceDate: new Date().toISOString().split("T")[0],
		dueDate: "",
	});

	useEffect(() => {
		if (initialData) {
			setFormData({
				customerId: initialData.customerId,
				projectId: initialData.projectId ?? "",
				amount: initialData.amount,
				description: initialData.description ?? "",
				status: initialData.status,
				invoiceDate: initialData.invoiceDate.split("T")[0],
				dueDate: initialData.dueDate?.split("T")[0] ?? "",
			});
		} else {
			setFormData({
				customerId: "",
				projectId: "",
				amount: 0,
				description: "",
				status: "UNPAID",
				invoiceDate: new Date().toISOString().split("T")[0],
				dueDate: "",
			});
		}
	}, [initialData]);

	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
			<div className="w-full max-w-md rounded-xl border border-white/10 bg-neutral-900 p-6">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="font-semibold text-lg">
						{initialData ? "Edit Invoice" : "Create Invoice"}
					</h2>
					<button onClick={onClose} type="button">
						<XIcon className="size-5 text-white/60" />
					</button>
				</div>
				<form
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();
						onSubmit(formData);
					}}
				>
					<div>
						<label
							className="mb-1 block text-white/60 text-xs"
							htmlFor="customerId"
						>
							Customer ID *
						</label>
						<input
							className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-white/40"
							id="customerId"
							onChange={(e) =>
								setFormData({ ...formData, customerId: e.target.value })
							}
							placeholder="Customer ID"
							required
							type="text"
							value={formData.customerId}
						/>
					</div>
					<div>
						<label
							className="mb-1 block text-white/60 text-xs"
							htmlFor="projectId"
						>
							Project ID
						</label>
						<input
							className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-white/40"
							id="projectId"
							onChange={(e) =>
								setFormData({ ...formData, projectId: e.target.value })
							}
							placeholder="Project ID (optional)"
							type="text"
							value={formData.projectId}
						/>
					</div>
					<div>
						<label
							className="mb-1 block text-white/60 text-xs"
							htmlFor="amount"
						>
							Amount *
						</label>
						<input
							className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-white/40"
							id="amount"
							min={0}
							onChange={(e) =>
								setFormData({
									...formData,
									amount: Number.parseFloat(e.target.value),
								})
							}
							placeholder="0.00"
							required
							step="0.01"
							type="number"
							value={formData.amount}
						/>
					</div>
					<div>
						<label
							className="mb-1 block text-white/60 text-xs"
							htmlFor="status"
						>
							Status
						</label>
						<select
							className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white"
							id="status"
							onChange={(e) =>
								setFormData({ ...formData, status: e.target.value })
							}
							value={formData.status}
						>
							{STATUS_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					</div>
					<div>
						<label
							className="mb-1 block text-white/60 text-xs"
							htmlFor="invoiceDate"
						>
							Invoice Date *
						</label>
						<input
							className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white"
							id="invoiceDate"
							onChange={(e) =>
								setFormData({ ...formData, invoiceDate: e.target.value })
							}
							required
							type="date"
							value={formData.invoiceDate}
						/>
					</div>
					<div>
						<label
							className="mb-1 block text-white/60 text-xs"
							htmlFor="dueDate"
						>
							Due Date
						</label>
						<input
							className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white"
							id="dueDate"
							onChange={(e) =>
								setFormData({ ...formData, dueDate: e.target.value })
							}
							type="date"
							value={formData.dueDate}
						/>
					</div>
					<div>
						<label
							className="mb-1 block text-white/60 text-xs"
							htmlFor="description"
						>
							Description
						</label>
						<textarea
							className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-white/40"
							id="description"
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
							placeholder="Invoice description..."
							rows={3}
							value={formData.description}
						/>
					</div>
					<div className="flex gap-3 pt-2">
						<button
							className="flex-1 rounded-lg border border-white/10 bg-neutral-800 px-4 py-2 font-medium text-sm text-white hover:bg-neutral-700"
							onClick={onClose}
							type="button"
						>
							Cancel
						</button>
						<button
							className="flex-1 rounded-lg bg-white px-4 py-2 font-medium text-black text-sm hover:bg-white/90 disabled:opacity-50"
							disabled={isLoading}
							type="submit"
						>
							{isLoading ? "Saving..." : "Save"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export function AdminInvoices() {
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [openMenuId, setOpenMenuId] = useState<string | null>(null);

	async function fetchInvoices() {
		try {
			setIsLoading(true);
			const data = await api.invoices.list();
			setInvoices(data.invoices);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load invoices");
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		fetchInvoices();
	}, [fetchInvoices]);

	async function handleCreate(data: InvoiceFormData) {
		try {
			setIsSubmitting(true);
			await api.invoices.create(data);
			setIsModalOpen(false);
			fetchInvoices();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to create invoice");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleUpdate(data: InvoiceFormData) {
		if (!editingInvoice) {
			return;
		}
		try {
			setIsSubmitting(true);
			await api.invoices.update(editingInvoice.id, data);
			setIsModalOpen(false);
			setEditingInvoice(undefined);
			fetchInvoices();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to update invoice");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDelete(id: string) {
		if (!confirm("Are you sure you want to delete this invoice?")) {
			return;
		}
		try {
			await api.invoices.delete(id);
			fetchInvoices();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to delete invoice");
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl tracking-tight">Invoices</h1>
					<p className="mt-1 text-sm text-white/60">
						Manage invoices and payments.
					</p>
				</div>
				<button
					className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-black text-sm hover:bg-white/90"
					onClick={() => {
						setEditingInvoice(undefined);
						setIsModalOpen(true);
					}}
					type="button"
				>
					<PlusIcon className="size-4" />
					Create Invoice
				</button>
			</div>

			{error && (
				<div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400 text-sm">
					{error}
				</div>
			)}

			<div className="rounded-xl border border-white/10 bg-neutral-900">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-white/10 border-b">
								<th className="px-4 py-3 text-left font-medium text-white/60 text-xs">
									Invoice #
								</th>
								<th className="hidden px-4 py-3 text-left font-medium text-white/60 text-xs md:table-cell">
									Customer
								</th>
								<th className="px-4 py-3 text-left font-medium text-white/60 text-xs">
									Amount
								</th>
								<th className="px-4 py-3 text-left font-medium text-white/60 text-xs">
									Status
								</th>
								<th className="hidden px-4 py-3 text-left font-medium text-white/60 text-xs lg:table-cell">
									Due Date
								</th>
								<th className="w-12 px-4 py-3 text-right font-medium text-white/60 text-xs">
									<span className="sr-only">Actions</span>
								</th>
							</tr>
						</thead>
						<tbody>
							{isLoading && <LoadingSkeletons />}
							{!isLoading && invoices.length === 0 && <EmptyState />}
							{!isLoading &&
								invoices.map((invoice) => (
									<tr
										className="border-white/5 border-b last:border-0"
										key={invoice.id}
									>
										<td className="px-4 py-3 font-mono text-sm">
											{invoice.id.slice(0, 8)}
										</td>
										<td className="hidden px-4 py-3 text-sm text-white/60 md:table-cell">
											{invoice.customerId}
										</td>
										<td className="px-4 py-3 text-sm">
											${invoice.amount.toFixed(2)}
										</td>
										<td className="px-4 py-3">
											<StatusBadge status={invoice.status} />
										</td>
										<td className="hidden px-4 py-3 text-sm text-white/60 lg:table-cell">
											{invoice.dueDate
												? new Date(invoice.dueDate).toLocaleDateString()
												: "—"}
										</td>
										<td className="px-4 py-3 text-right">
											<div className="relative">
												<button
													className="rounded p-1 hover:bg-white/10"
													onClick={() =>
														setOpenMenuId(
															openMenuId === invoice.id ? null : invoice.id
														)
													}
													type="button"
												>
													<MoreHorizontalIcon className="size-4 text-white/60" />
												</button>
												{openMenuId === invoice.id && (
													<div className="absolute top-full right-0 z-10 mt-1 w-36 rounded-lg border border-white/10 bg-neutral-800 py-1 shadow-lg">
														<button
															className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-white/10"
															onClick={() => {
																setEditingInvoice(invoice);
																setIsModalOpen(true);
																setOpenMenuId(null);
															}}
															type="button"
														>
															<PencilIcon className="size-4" />
															Edit
														</button>
														<button
															className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-400 text-sm hover:bg-white/10"
															onClick={() => {
																handleDelete(invoice.id);
																setOpenMenuId(null);
															}}
															type="button"
														>
															<Trash2Icon className="size-4" />
															Delete
														</button>
													</div>
												)}
											</div>
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			</div>

			<InvoiceModal
				initialData={editingInvoice}
				isLoading={isSubmitting}
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setEditingInvoice(undefined);
				}}
				onSubmit={editingInvoice ? handleUpdate : handleCreate}
			/>
		</div>
	);
}
