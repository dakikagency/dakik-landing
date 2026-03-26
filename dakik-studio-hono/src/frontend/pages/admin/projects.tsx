import {
	MoreHorizontalIcon,
	PencilIcon,
	PlusIcon,
	Trash2Icon,
	XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api, type Project } from "../../lib/api";

const STATUS_OPTIONS = [
	{ value: "PENDING", label: "Pending" },
	{ value: "IN_PROGRESS", label: "In Progress" },
	{ value: "ON_HOLD", label: "On Hold" },
	{ value: "COMPLETED", label: "Completed" },
	{ value: "CANCELLED", label: "Cancelled" },
];

function StatusBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
		IN_PROGRESS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
		ON_HOLD: "bg-orange-500/20 text-orange-400 border-orange-500/30",
		COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
		CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
	};

	return (
		<span
			className={`inline-flex rounded-full border px-2 py-0.5 font-medium text-xs ${colors[status] ?? "border-gray-500/30 bg-gray-500/20 text-gray-400"}`}
		>
			{status.replace(/_/g, " ")}
		</span>
	);
}

function ProgressBar({ progress }: { progress: number }) {
	return (
		<div className="w-20 rounded-full bg-white/10">
			<div
				className="h-2 rounded-full bg-white/60"
				style={{ width: `${progress}%` }}
			/>
		</div>
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
			<p className="text-sm text-white/40">No projects yet.</p>
		</div>
	);
}

interface ProjectFormData {
	title: string;
	description: string;
	status: string;
	progress: number;
	customerId: string;
}

function ProjectModal({
	isOpen,
	onClose,
	onSubmit,
	initialData,
	isLoading,
}: {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: ProjectFormData) => void;
	initialData?: Project;
	isLoading?: boolean;
}) {
	const [formData, setFormData] = useState<ProjectFormData>({
		title: "",
		description: "",
		status: "PENDING",
		progress: 0,
		customerId: "",
	});

	useEffect(() => {
		if (initialData) {
			setFormData({
				title: initialData.title,
				description: initialData.description ?? "",
				status: initialData.status,
				progress: initialData.progress,
				customerId: initialData.customerId,
			});
		} else {
			setFormData({
				title: "",
				description: "",
				status: "PENDING",
				progress: 0,
				customerId: "",
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
						{initialData ? "Edit Project" : "Create Project"}
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
						<label className="mb-1 block text-white/60 text-xs" htmlFor="title">
							Title *
						</label>
						<input
							className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-white/40"
							id="title"
							onChange={(e) =>
								setFormData({ ...formData, title: e.target.value })
							}
							placeholder="Project title"
							required
							type="text"
							value={formData.title}
						/>
					</div>
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
							htmlFor="progress"
						>
							Progress ({formData.progress}%)
						</label>
						<input
							className="w-full"
							id="progress"
							max={100}
							min={0}
							onChange={(e) =>
								setFormData({
									...formData,
									progress: Number.parseInt(e.target.value, 10),
								})
							}
							type="range"
							value={formData.progress}
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
							placeholder="Project description..."
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

export function AdminProjects() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingProject, setEditingProject] = useState<Project | undefined>();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [openMenuId, setOpenMenuId] = useState<string | null>(null);

	async function fetchProjects() {
		try {
			setIsLoading(true);
			const data = await api.projects.list();
			setProjects(data.projects);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load projects");
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		fetchProjects();
	}, [fetchProjects]);

	async function handleCreate(data: ProjectFormData) {
		try {
			setIsSubmitting(true);
			await api.projects.create(data);
			setIsModalOpen(false);
			fetchProjects();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to create project");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleUpdate(data: ProjectFormData) {
		if (!editingProject) {
			return;
		}
		try {
			setIsSubmitting(true);
			await api.projects.update(editingProject.id, data);
			setIsModalOpen(false);
			setEditingProject(undefined);
			fetchProjects();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to update project");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDelete(id: string) {
		if (!confirm("Are you sure you want to delete this project?")) {
			return;
		}
		try {
			await api.projects.delete(id);
			fetchProjects();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to delete project");
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl tracking-tight">Projects</h1>
					<p className="mt-1 text-sm text-white/60">
						Manage your client projects.
					</p>
				</div>
				<button
					className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-black text-sm hover:bg-white/90"
					onClick={() => {
						setEditingProject(undefined);
						setIsModalOpen(true);
					}}
					type="button"
				>
					<PlusIcon className="size-4" />
					Create Project
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
									Title
								</th>
								<th className="hidden px-4 py-3 text-left font-medium text-white/60 text-xs md:table-cell">
									Customer
								</th>
								<th className="px-4 py-3 text-left font-medium text-white/60 text-xs">
									Status
								</th>
								<th className="hidden px-4 py-3 text-left font-medium text-white/60 text-xs lg:table-cell">
									Progress
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
							{!isLoading && projects.length === 0 && <EmptyState />}
							{!isLoading &&
								projects.map((project) => (
									<tr
										className="border-white/5 border-b last:border-0"
										key={project.id}
									>
										<td className="px-4 py-3 text-sm">{project.title}</td>
										<td className="hidden px-4 py-3 text-sm text-white/60 md:table-cell">
											{project.customer?.companyName ?? project.customerId}
										</td>
										<td className="px-4 py-3">
											<StatusBadge status={project.status} />
										</td>
										<td className="hidden px-4 py-3 lg:table-cell">
											<ProgressBar progress={project.progress} />
										</td>
										<td className="hidden px-4 py-3 text-sm text-white/60 lg:table-cell">
											{new Date(project.createdAt).toLocaleDateString()}
										</td>
										<td className="px-4 py-3 text-right">
											<div className="relative">
												<button
													className="rounded p-1 hover:bg-white/10"
													onClick={() =>
														setOpenMenuId(
															openMenuId === project.id ? null : project.id
														)
													}
													type="button"
												>
													<MoreHorizontalIcon className="size-4 text-white/60" />
												</button>
												{openMenuId === project.id && (
													<div className="absolute top-full right-0 z-10 mt-1 w-36 rounded-lg border border-white/10 bg-neutral-800 py-1 shadow-lg">
														<button
															className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-white/10"
															onClick={() => {
																setEditingProject(project);
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
																handleDelete(project.id);
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

			<ProjectModal
				initialData={editingProject}
				isLoading={isSubmitting}
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setEditingProject(undefined);
				}}
				onSubmit={editingProject ? handleUpdate : handleCreate}
			/>
		</div>
	);
}
