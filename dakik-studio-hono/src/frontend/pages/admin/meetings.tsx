import {
	CalendarIcon,
	LinkIcon,
	MoreHorizontalIcon,
	PencilIcon,
	Trash2Icon,
	XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api, type Meeting } from "../../lib/api";

const STATUS_OPTIONS = [
	{ value: "SCHEDULED", label: "Scheduled" },
	{ value: "COMPLETED", label: "Completed" },
	{ value: "CANCELLED", label: "Cancelled" },
];

function StatusBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		SCHEDULED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
		COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
		CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
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
			<p className="text-sm text-white/40">No meetings yet.</p>
		</div>
	);
}

interface MeetingFormData {
	title: string;
	description: string;
	scheduledAt: string;
	duration: number;
	status: string;
	leadId: string;
	customerId: string;
}

function MeetingModal({
	isOpen,
	onClose,
	onSubmit,
	initialData,
	isLoading,
}: {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: MeetingFormData) => void;
	initialData?: Meeting;
	isLoading?: boolean;
}) {
	const [formData, setFormData] = useState<MeetingFormData>({
		title: "",
		description: "",
		scheduledAt: "",
		duration: 30,
		status: "SCHEDULED",
		leadId: "",
		customerId: "",
	});

	useEffect(() => {
		if (initialData) {
			const dateStr = initialData.scheduledAt.split("T")[0];
			const timeStr =
				initialData.scheduledAt.split("T")[1]?.slice(0, 5) ?? "09:00";
			setFormData({
				title: initialData.title,
				description: initialData.description ?? "",
				scheduledAt: `${dateStr}T${timeStr}`,
				duration: initialData.duration,
				status: initialData.status,
				leadId: initialData.leadId ?? "",
				customerId: initialData.customerId ?? "",
			});
		} else {
			const now = new Date();
			now.setHours(now.getHours() + 1, 0, 0, 0);
			setFormData({
				title: "",
				description: "",
				scheduledAt: now.toISOString().slice(0, 16),
				duration: 30,
				status: "SCHEDULED",
				leadId: "",
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
						{initialData ? "Edit Meeting" : "Schedule Meeting"}
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
							placeholder="Meeting title"
							required
							type="text"
							value={formData.title}
						/>
					</div>
					<div>
						<label
							className="mb-1 block text-white/60 text-xs"
							htmlFor="scheduledAt"
						>
							Date & Time *
						</label>
						<input
							className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white"
							id="scheduledAt"
							onChange={(e) =>
								setFormData({ ...formData, scheduledAt: e.target.value })
							}
							required
							type="datetime-local"
							value={formData.scheduledAt}
						/>
					</div>
					<div>
						<label
							className="mb-1 block text-white/60 text-xs"
							htmlFor="duration"
						>
							Duration (minutes)
						</label>
						<select
							className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white"
							id="duration"
							onChange={(e) =>
								setFormData({
									...formData,
									duration: Number.parseInt(e.target.value, 10),
								})
							}
							value={formData.duration}
						>
							<option value={15}>15 min</option>
							<option value={30}>30 min</option>
							<option value={45}>45 min</option>
							<option value={60}>60 min</option>
							<option value={90}>90 min</option>
						</select>
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
							htmlFor="leadId"
						>
							Lead ID
						</label>
						<input
							className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-white/40"
							id="leadId"
							onChange={(e) =>
								setFormData({ ...formData, leadId: e.target.value })
							}
							placeholder="Lead ID (optional)"
							type="text"
							value={formData.leadId}
						/>
					</div>
					<div>
						<label
							className="mb-1 block text-white/60 text-xs"
							htmlFor="customerId"
						>
							Customer ID
						</label>
						<input
							className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-white/40"
							id="customerId"
							onChange={(e) =>
								setFormData({ ...formData, customerId: e.target.value })
							}
							placeholder="Customer ID (optional)"
							type="text"
							value={formData.customerId}
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
							placeholder="Meeting agenda..."
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

export function AdminMeetings() {
	const [meetings, setMeetings] = useState<Meeting[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [openMenuId, setOpenMenuId] = useState<string | null>(null);

	async function fetchMeetings() {
		try {
			setIsLoading(true);
			const data = await api.meetings.list();
			setMeetings(data.meetings);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load meetings");
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		fetchMeetings();
	}, [fetchMeetings]);

	async function handleCreate(data: MeetingFormData) {
		try {
			setIsSubmitting(true);
			const [datePart, timePart] = data.scheduledAt.split("T");
			await api.meetings.create({
				...data,
				date: datePart,
				startTime: timePart,
			});
			setIsModalOpen(false);
			fetchMeetings();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to create meeting");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleUpdate(data: MeetingFormData) {
		if (!editingMeeting) {
			return;
		}
		try {
			setIsSubmitting(true);
			await api.meetings.update(editingMeeting.id, { status: data.status });
			setIsModalOpen(false);
			setEditingMeeting(undefined);
			fetchMeetings();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to update meeting");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDelete(id: string) {
		if (!confirm("Are you sure you want to delete this meeting?")) {
			return;
		}
		try {
			await api.meetings.delete(id);
			fetchMeetings();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to delete meeting");
		}
	}

	async function handleCancel(id: string) {
		try {
			await api.meetings.update(id, { status: "CANCELLED" });
			fetchMeetings();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to cancel meeting");
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl tracking-tight">Meetings</h1>
					<p className="mt-1 text-sm text-white/60">
						Manage scheduled meetings.
					</p>
				</div>
				<button
					className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-black text-sm hover:bg-white/90"
					onClick={() => {
						setEditingMeeting(undefined);
						setIsModalOpen(true);
					}}
					type="button"
				>
					<CalendarIcon className="size-4" />
					Schedule Meeting
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
									Date & Time
								</th>
								<th className="px-4 py-3 text-left font-medium text-white/60 text-xs">
									Duration
								</th>
								<th className="px-4 py-3 text-left font-medium text-white/60 text-xs">
									Status
								</th>
								<th className="w-12 px-4 py-3 text-right font-medium text-white/60 text-xs">
									<span className="sr-only">Actions</span>
								</th>
							</tr>
						</thead>
						<tbody>
							{isLoading && <LoadingSkeletons />}
							{!isLoading && meetings.length === 0 && <EmptyState />}
							{!isLoading &&
								meetings.map((meeting) => (
									<tr
										className="border-white/5 border-b last:border-0"
										key={meeting.id}
									>
										<td className="px-4 py-3 text-sm">
											<div className="flex items-center gap-2">
												{meeting.title}
												{meeting.meetUrl && (
													<a
														className="text-white/40 hover:text-white"
														href={meeting.meetUrl}
														rel="noopener noreferrer"
														target="_blank"
													>
														<LinkIcon className="size-3" />
													</a>
												)}
											</div>
										</td>
										<td className="hidden px-4 py-3 text-sm text-white/60 md:table-cell">
											{new Date(meeting.scheduledAt).toLocaleString()}
										</td>
										<td className="px-4 py-3 text-sm">
											{meeting.duration} min
										</td>
										<td className="px-4 py-3">
											<StatusBadge status={meeting.status} />
										</td>
										<td className="px-4 py-3 text-right">
											<div className="relative">
												<button
													className="rounded p-1 hover:bg-white/10"
													onClick={() =>
														setOpenMenuId(
															openMenuId === meeting.id ? null : meeting.id
														)
													}
													type="button"
												>
													<MoreHorizontalIcon className="size-4 text-white/60" />
												</button>
												{openMenuId === meeting.id && (
													<div className="absolute top-full right-0 z-10 mt-1 w-36 rounded-lg border border-white/10 bg-neutral-800 py-1 shadow-lg">
														{meeting.meetUrl && (
															<a
																className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-white/10"
																href={meeting.meetUrl}
																rel="noopener noreferrer"
																target="_blank"
															>
																<LinkIcon className="size-4" />
																Join
															</a>
														)}
														<button
															className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-white/10"
															onClick={() => {
																setEditingMeeting(meeting);
																setIsModalOpen(true);
																setOpenMenuId(null);
															}}
															type="button"
														>
															<PencilIcon className="size-4" />
															Edit
														</button>
														{meeting.status === "SCHEDULED" && (
															<button
																className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-yellow-400 hover:bg-white/10"
																onClick={() => {
																	handleCancel(meeting.id);
																	setOpenMenuId(null);
																}}
																type="button"
															>
																Cancel
															</button>
														)}
														<button
															className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-400 text-sm hover:bg-white/10"
															onClick={() => {
																handleDelete(meeting.id);
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

			<MeetingModal
				initialData={editingMeeting}
				isLoading={isSubmitting}
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setEditingMeeting(undefined);
				}}
				onSubmit={editingMeeting ? handleUpdate : handleCreate}
			/>
		</div>
	);
}
