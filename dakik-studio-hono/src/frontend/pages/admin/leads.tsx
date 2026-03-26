import {
	MoreHorizontalIcon,
	PencilIcon,
	PlusIcon,
	Trash2Icon,
	XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api, type Lead } from "../../lib/api";

const STATUS_OPTIONS = [
	{ value: "NEW", label: "New" },
	{ value: "CONTACTED", label: "Contacted" },
	{ value: "MEETING_SCHEDULED", label: "Meeting Scheduled" },
	{ value: "MEETING_COMPLETED", label: "Meeting Completed" },
	{ value: "CONVERTED", label: "Converted" },
	{ value: "CLOSED", label: "Closed" },
];

const PROJECT_TYPE_OPTIONS = [
	{ value: "AI_AUTOMATION", label: "AI Automation" },
	{ value: "BRAND_IDENTITY", label: "Brand Identity" },
	{ value: "WEB_MOBILE", label: "Web & Mobile" },
	{ value: "FULL_PRODUCT", label: "Full Product" },
];

function StatusBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		NEW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
		CONTACTED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
		MEETING_SCHEDULED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
		MEETING_COMPLETED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
		CONVERTED: "bg-green-500/20 text-green-400 border-green-500/30",
		CLOSED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
	};

	return (
		<span
			className={`inline-flex rounded-full border px-2 py-0.5 font-medium text-xs ${colors[status] ?? "border-gray-500/30 bg-gray-500/20 text-gray-400"}`}
		>
			{status.replace(/_/g, " ")}
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
			<p className="text-sm text-white/40">No leads yet.</p>
		</div>
	);
}

interface LeadFormData {
	email: string;
	name: string;
	projectType: string;
	budget: string;
	details: string;
	status: string;
}

function LeadModal({
	isOpen,
	onClose,
	onSubmit,
	initialData,
	isLoading,
}: {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: LeadFormData) => void;
	initialData?: Lead;
	isLoading?: boolean;
}) {
	const [formData, setFormData] = useState<LeadFormData>({
		email: "",
		name: "",
		projectType: "",
		budget: "",
		details: "",
		status: "NEW",
	});

	useEffect(() => {
		if (initialData) {
			setFormData({
				email: initialData.email,
				name: initialData.name ?? "",
				projectType: initialData.projectType ?? "",
				budget: initialData.budget ?? "",
				details: initialData.details ?? "",
				status: initialData.status,
			});
		} else {
			setFormData({
				email: "",
				name: "",
				projectType: "",
				budget: "",
				details: "",
				status: "NEW",
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
						{initialData ? "Edit Lead" : "Create Lead"}
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
						<label className="mb-1 block text-white/60 text-xs">Email *</label>
						<input
							className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-white/40"
							onChange={(e) =>
								setFormData({ ...formData, email: e.target.value })
							}
							placeholder="email@example.com"
							required
							type="email"
							value={formData.email}
						/>
					</div>
					<div>
						<label className="mb-1 block text-white/60 text-xs">Name</label>
						<input
							className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-white/40"
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							placeholder="John Doe"
							type="text"
							value={formData.name}
						/>
					</div>
					<div>
						<label className="mb-1 block text-white/60 text-xs">
							Project Type
						</label>
						<select
							className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white"
							onChange={(e) =>
								setFormData({ ...formData, projectType: e.target.value })
							}
							value={formData.projectType}
						>
							<option value="">Select project type</option>
							{PROJECT_TYPE_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="mb-1 block text-white/60 text-xs">Status</label>
						<select
							className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white"
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
						<label className="mb-1 block text-white/60 text-xs">Details</label>
						<textarea
							className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-white/40"
							onChange={(e) =>
								setFormData({ ...formData, details: e.target.value })
							}
							placeholder="Additional details..."
							rows={3}
							value={formData.details}
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

export function AdminLeads() {
	const [leads, setLeads] = useState<Lead[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingLead, setEditingLead] = useState<Lead | undefined>();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [openMenuId, setOpenMenuId] = useState<string | null>(null);

	async function fetchLeads() {
		try {
			setIsLoading(true);
			const data = await api.leads.list();
			setLeads(data.leads);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load leads");
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		fetchLeads();
	}, [fetchLeads]);

	async function handleCreate(data: LeadFormData) {
		try {
			setIsSubmitting(true);
			await api.leads.create(data);
			setIsModalOpen(false);
			fetchLeads();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to create lead");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleUpdate(data: LeadFormData) {
		if (!editingLead) {
			return;
		}
		try {
			setIsSubmitting(true);
			await api.leads.update(editingLead.id, data);
			setIsModalOpen(false);
			setEditingLead(undefined);
			fetchLeads();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to update lead");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDelete(id: string) {
		if (!confirm("Are you sure you want to delete this lead?")) {
			return;
		}
		try {
			await api.leads.delete(id);
			fetchLeads();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to delete lead");
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl tracking-tight">Leads</h1>
					<p className="mt-1 text-sm text-white/60">
						Manage leads from survey submissions.
					</p>
				</div>
				<button
					className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-black text-sm hover:bg-white/90"
					onClick={() => {
						setEditingLead(undefined);
						setIsModalOpen(true);
					}}
					type="button"
				>
					<PlusIcon className="size-4" />
					Create Lead
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
									Email
								</th>
								<th className="px-4 py-3 text-left font-medium text-white/60 text-xs">
									Name
								</th>
								<th className="hidden px-4 py-3 text-left font-medium text-white/60 text-xs md:table-cell">
									Project Type
								</th>
								<th className="px-4 py-3 text-left font-medium text-white/60 text-xs">
									Status
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
							{!isLoading && leads.length === 0 && <EmptyState />}
							{!isLoading &&
								leads.map((lead) => (
									<tr
										className="border-white/5 border-b last:border-0"
										key={lead.id}
									>
										<td className="px-4 py-3 text-sm">{lead.email}</td>
										<td className="px-4 py-3 text-sm">{lead.name ?? "—"}</td>
										<td className="hidden px-4 py-3 text-sm text-white/60 md:table-cell">
											{lead.projectType ?? "—"}
										</td>
										<td className="px-4 py-3">
											<StatusBadge status={lead.status} />
										</td>
										<td className="hidden px-4 py-3 text-sm text-white/60 lg:table-cell">
											{new Date(lead.createdAt).toLocaleDateString()}
										</td>
										<td className="px-4 py-3 text-right">
											<div className="relative">
												<button
													className="rounded p-1 hover:bg-white/10"
													onClick={() =>
														setOpenMenuId(
															openMenuId === lead.id ? null : lead.id
														)
													}
													type="button"
												>
													<MoreHorizontalIcon className="size-4 text-white/60" />
												</button>
												{openMenuId === lead.id && (
													<div className="absolute top-full right-0 z-10 mt-1 w-36 rounded-lg border border-white/10 bg-neutral-800 py-1 shadow-lg">
														<button
															className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-white/10"
															onClick={() => {
																setEditingLead(lead);
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
																handleDelete(lead.id);
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

			<LeadModal
				initialData={editingLead}
				isLoading={isSubmitting}
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setEditingLead(undefined);
				}}
				onSubmit={editingLead ? handleUpdate : handleCreate}
			/>
		</div>
	);
}
