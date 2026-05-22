import {
	MoreHorizontalIcon,
	PencilIcon,
	PlusIcon,
	Trash2Icon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	ContentPostForm,
	type ContentPostFormValues,
} from "../../components/admin/content-post-form";
import { api, type Automation } from "../../lib/api";

type PublishedFilter = "all" | "published" | "draft";

function PublishedBadge({ published }: { published: boolean }) {
	if (published) {
		return (
			<span className="inline-flex rounded-full border border-green-500/30 bg-green-500/20 px-2 py-0.5 font-medium text-green-400 text-xs">
				Published
			</span>
		);
	}
	return (
		<span className="inline-flex rounded-full border border-gray-500/30 bg-gray-500/20 px-2 py-0.5 font-medium text-gray-400 text-xs">
			Draft
		</span>
	);
}

function valuesFromAutomation(a: Automation): ContentPostFormValues {
	return {
		title: a.title,
		slug: a.slug,
		excerpt: a.excerpt ?? "",
		content: a.content,
		coverImage: a.coverImage ?? null,
		fileUrl: a.fileUrl ?? null,
		published: a.published,
		tags: a.tags.map((t) => t.slug),
	};
}

export function AdminAutomations() {
	const [items, setItems] = useState<Automation[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filter, setFilter] = useState<PublishedFilter>("all");
	const [search, setSearch] = useState("");

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editing, setEditing] = useState<Automation | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [openMenuId, setOpenMenuId] = useState<string | null>(null);

	const fetchItems = useCallback(async () => {
		try {
			setIsLoading(true);
			const params: { search?: string; published?: "true" | "false" } = {};
			if (search) params.search = search;
			if (filter === "published") params.published = "true";
			if (filter === "draft") params.published = "false";
			const data = await api.admin.automations.list(params);
			setItems(data.automations);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load automations");
		} finally {
			setIsLoading(false);
		}
	}, [filter, search]);

	useEffect(() => {
		fetchItems();
	}, [fetchItems]);

	async function handleSubmit(values: ContentPostFormValues) {
		try {
			setIsSubmitting(true);
			if (editing) {
				await api.admin.automations.update(editing.id, values);
			} else {
				await api.admin.automations.create(values);
			}
			setIsModalOpen(false);
			setEditing(null);
			fetchItems();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Save failed");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDelete(a: Automation) {
		if (!confirm(`Delete "${a.title}"? This cannot be undone.`)) return;
		try {
			await api.admin.automations.delete(a.id);
			fetchItems();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Delete failed");
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl tracking-tight">Automations</h1>
					<p className="mt-1 text-sm text-white/60">
						Publish automation playbooks with optional downloadable assets.
					</p>
				</div>
				<button
					className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-black text-sm hover:bg-white/90"
					onClick={() => {
						setEditing(null);
						setIsModalOpen(true);
					}}
					type="button"
				>
					<PlusIcon className="size-4" />
					New automation
				</button>
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<input
					className="w-64 rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm placeholder:text-white/40"
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search by title or slug"
					value={search}
				/>
				<div className="inline-flex rounded-lg border border-white/10 bg-neutral-900 p-0.5 text-xs">
					{(["all", "published", "draft"] as const).map((f) => (
						<button
							className={`rounded-md px-3 py-1.5 capitalize ${
								filter === f
									? "bg-white text-black"
									: "text-white/60 hover:text-white"
							}`}
							key={f}
							onClick={() => setFilter(f)}
							type="button"
						>
							{f}
						</button>
					))}
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
									Title
								</th>
								<th className="hidden px-4 py-3 text-left font-medium text-white/60 text-xs sm:table-cell">
									Slug
								</th>
								<th className="hidden px-4 py-3 text-left font-medium text-white/60 text-xs md:table-cell">
									Asset
								</th>
								<th className="px-4 py-3 text-left font-medium text-white/60 text-xs">
									Status
								</th>
								<th className="hidden px-4 py-3 text-left font-medium text-white/60 text-xs lg:table-cell">
									Updated
								</th>
								<th className="w-12 px-4 py-3 text-right font-medium text-white/60 text-xs">
									<span className="sr-only">Actions</span>
								</th>
							</tr>
						</thead>
						<tbody>
							{isLoading && (
								<tr>
									<td className="px-4 py-12 text-center text-sm text-white/50" colSpan={6}>
										Loading…
									</td>
								</tr>
							)}
							{!isLoading && items.length === 0 && (
								<tr>
									<td className="px-4 py-12 text-center text-sm text-white/40" colSpan={6}>
										No automations match the filter.
									</td>
								</tr>
							)}
							{!isLoading &&
								items.map((a) => (
									<tr
										className="border-white/5 border-b last:border-0"
										key={a.id}
									>
										<td className="px-4 py-3 text-sm">
											<div className="font-medium">{a.title}</div>
											{a.excerpt && (
												<div className="mt-0.5 line-clamp-1 text-white/40 text-xs">
													{a.excerpt}
												</div>
											)}
										</td>
										<td className="hidden px-4 py-3 font-mono text-white/60 text-xs sm:table-cell">
											{a.slug}
										</td>
										<td className="hidden px-4 py-3 text-xs md:table-cell">
											{a.fileUrl ? (
												<span className="text-green-400">Attached</span>
											) : (
												<span className="text-white/40">—</span>
											)}
										</td>
										<td className="px-4 py-3">
											<PublishedBadge published={a.published} />
										</td>
										<td className="hidden px-4 py-3 text-sm text-white/60 lg:table-cell">
											{new Date(a.updatedAt).toLocaleDateString()}
										</td>
										<td className="px-4 py-3 text-right">
											<div className="relative inline-block">
												<button
													className="rounded p-1 hover:bg-white/10"
													onClick={() =>
														setOpenMenuId(openMenuId === a.id ? null : a.id)
													}
													type="button"
												>
													<MoreHorizontalIcon className="size-4 text-white/60" />
												</button>
												{openMenuId === a.id && (
													<div className="absolute top-full right-0 z-10 mt-1 w-36 rounded-lg border border-white/10 bg-neutral-800 py-1 shadow-lg">
														<button
															className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-white/10"
															onClick={() => {
																setEditing(a);
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
																setOpenMenuId(null);
																handleDelete(a);
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

			<ContentPostForm
				initial={editing ? valuesFromAutomation(editing) : null}
				isOpen={isModalOpen}
				isSubmitting={isSubmitting}
				onClose={() => {
					setIsModalOpen(false);
					setEditing(null);
				}}
				onSubmit={handleSubmit}
				resourceLabel="Automation"
				showFileUrl
				uploadFolder="automations"
			/>
		</div>
	);
}

export default AdminAutomations;
