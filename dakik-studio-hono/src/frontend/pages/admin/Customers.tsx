import {
	MoreHorizontalIcon,
	PencilIcon,
	Trash2Icon,
	XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api, type Customer } from "../../lib/api";

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
			<p className="text-sm text-white/40">No customers yet.</p>
		</div>
	);
}

interface CustomerFormData {
	companyName: string;
	phone: string;
}

function CustomerModal({
	isOpen,
	onClose,
	onSubmit,
	initialData,
	isLoading,
}: {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: CustomerFormData) => void;
	initialData?: Customer;
	isLoading?: boolean;
}) {
	const [formData, setFormData] = useState<CustomerFormData>({
		companyName: "",
		phone: "",
	});

	useEffect(() => {
		if (initialData) {
			setFormData({
				companyName: initialData.companyName ?? "",
				phone: initialData.phone ?? "",
			});
		} else {
			setFormData({
				companyName: "",
				phone: "",
			});
		}
	}, [initialData, isOpen]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
			<div className="w-full max-w-md rounded-xl border border-white/10 bg-neutral-900 p-6">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="font-semibold text-lg">
						{initialData ? "Edit Customer" : "Create Customer"}
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
							htmlFor="companyName"
						>
							Company Name
						</label>
						<input
							className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-white/40"
							id="companyName"
							onChange={(e) =>
								setFormData({ ...formData, companyName: e.target.value })
							}
							placeholder="Acme Inc."
							type="text"
							value={formData.companyName}
						/>
					</div>
					<div>
						<label className="mb-1 block text-white/60 text-xs" htmlFor="phone">
							Phone
						</label>
						<input
							className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-white/40"
							id="phone"
							onChange={(e) =>
								setFormData({ ...formData, phone: e.target.value })
							}
							placeholder="+1 234 567 8900"
							type="tel"
							value={formData.phone}
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

export function AdminCustomers() {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCustomer, setEditingCustomer] = useState<
		Customer | undefined
	>();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [openMenuId, setOpenMenuId] = useState<string | null>(null);

	async function fetchCustomers() {
		try {
			setIsLoading(true);
			const data = await api.customers.list();
			setCustomers(data.customers);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load customers");
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		fetchCustomers();
	}, []);

	async function handleUpdate(data: CustomerFormData) {
		if (!editingCustomer) return;
		try {
			setIsSubmitting(true);
			await api.customers.update(editingCustomer.id, data);
			setIsModalOpen(false);
			setEditingCustomer(undefined);
			fetchCustomers();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to update customer");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDelete(id: string) {
		if (!confirm("Are you sure you want to delete this customer?")) return;
		try {
			await api.customers.delete(id);
			fetchCustomers();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to delete customer");
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl tracking-tight">Customers</h1>
					<p className="mt-1 text-sm text-white/60">
						Manage your converted customers.
					</p>
				</div>
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
									Company
								</th>
								<th className="px-4 py-3 text-left font-medium text-white/60 text-xs">
									Email
								</th>
								<th className="hidden px-4 py-3 text-left font-medium text-white/60 text-xs md:table-cell">
									Phone
								</th>
								<th className="hidden px-4 py-3 text-left font-medium text-white/60 text-xs lg:table-cell">
									Created
								</th>
								<th className="w-12 px-4 py-3 text-right font-medium text-white/60 text-xs">
									<span className="sr-only">Actions</span>
								</th>
							</tr>
						</thead>
						<tbody>
							{isLoading && <LoadingSkeletons />}
							{!isLoading && customers.length === 0 && <EmptyState />}
							{!isLoading &&
								customers.map((customer) => (
									<tr
										className="border-white/5 border-b last:border-0"
										key={customer.id}
									>
										<td className="px-4 py-3 text-sm">
											{customer.companyName ?? "—"}
										</td>
										<td className="px-4 py-3 text-sm">
											{customer.user?.email ?? "—"}
										</td>
										<td className="hidden px-4 py-3 text-sm text-white/60 md:table-cell">
											{customer.phone ?? "—"}
										</td>
										<td className="hidden px-4 py-3 text-sm text-white/60 lg:table-cell">
											{new Date(customer.createdAt).toLocaleDateString()}
										</td>
										<td className="px-4 py-3 text-right">
											<div className="relative">
												<button
													className="rounded p-1 hover:bg-white/10"
													onClick={() =>
														setOpenMenuId(
															openMenuId === customer.id ? null : customer.id
														)
													}
													type="button"
												>
													<MoreHorizontalIcon className="size-4 text-white/60" />
												</button>
												{openMenuId === customer.id && (
													<div className="absolute top-full right-0 z-10 mt-1 w-36 rounded-lg border border-white/10 bg-neutral-800 py-1 shadow-lg">
														<button
															className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-white/10"
															onClick={() => {
																setEditingCustomer(customer);
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
																handleDelete(customer.id);
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

			<CustomerModal
				initialData={editingCustomer}
				isLoading={isSubmitting}
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setEditingCustomer(undefined);
				}}
				onSubmit={handleUpdate}
			/>
		</div>
	);
}
