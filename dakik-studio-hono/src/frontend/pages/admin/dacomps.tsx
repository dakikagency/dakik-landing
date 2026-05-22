import {
	MoreHorizontalIcon,
	PencilIcon,
	PlusIcon,
	Trash2Icon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	ComponentForm,
	type ComponentFormValues,
} from "../../components/admin/component-form";
import { api, type ComponentDoc } from "../../lib/api";

function valuesFromComponent(c: ComponentDoc): ComponentFormValues {
	return {
		name: c.name,
		slug: c.slug,
		category: c.category,
		description: c.description ?? "",
		props: JSON.stringify(c.props ?? {}, null, 2),
		code: c.code,
		preview: c.preview ?? "",
		published: c.published,
		files: c.files.map((f) => ({
			id: f.id,
			filename: f.filename,
			fileType: f.fileType ?? "TYPESCRIPT",
			content: f.content,
			isMainFile: f.isMainFile ?? false,
			order: f.order ?? 0,
		})),
	};
}

export function AdminDacomps() {
	const [items, setItems] = useState<ComponentDoc[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<string>("");

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editing, setEditing] = useState<ComponentDoc | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [openMenuId, setOpenMenuId] = useState<string | null>(null);

	const fetchItems = useCallback(async () => {
		try {
			setIsLoading(true);
			const params: { search?: string; category?: string } = {};
			if (search) params.search = search;
			if (category) params.category = category;
			const data = await api.admin.components.list(params);
			setItems(data.components);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load components");
		} finally {
			setIsLoading(false);
		}
	}, [search, category]);

	useEffect(() => {
		fetchItems();
	}, [fetchItems]);

	const categories = Array.from(new Set(items.map((i) => i.category))).sort();

	async function handleSubmit(
		values: ComponentFormValues,
		parsedProps: unknown,
	) {
		try {
			setIsSubmitting(true);
			const payload = {
				name: values.name,
				slug: values.slug,
				category: values.category,
				description: values.description || undefined,
				props: parsedProps,
				code: values.code,
				preview: values.preview || null,
				published: values.published,
				files: values.files,
			};
			if (editing) {
				await api.admin.components.update(editing.id, payload);
			} else {
				await api.admin.components.create(payload);
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

	async function handleDelete(c: ComponentDoc) {
		if (!confirm(`Delete "${c.name}"? This cannot be undone.`)) return;
		try {
			await api.admin.components.delete(c.id);
			fetchItems();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Delete failed");
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl tracking-tight">Dacomps</h1>
					<p className="mt-1 text-sm text-white/60">
						Component documentation library. One main code block per
						component, plus optional companion files (CSS, types, README).
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
					New component
				</button>
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<input
					className="w-64 rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm placeholder:text-white/40"
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search by name or slug"
					value={search}
				/>
				<select
					className="rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm"
					onChange={(e) => setCategory(e.target.value)}
					value={category}
				>
					<option value="">All categories</option>
					{categories.map((c) => (
						<option key={c} value={c}>
							{c}
						</option>
					))}
				</select>
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
									Name
								</th>
								<th className="hidden px-4 py-3 text-left font-medium text-white/60 text-xs sm:table-cell">
									Slug
								</th>
								<th className="px-4 py-3 text-left font-medium text-white/60 text-xs">
									Category
								</th>
								<th className="hidden px-4 py-3 text-left font-medium text-white/60 text-xs md:table-cell">
									Files
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
										No components match the filter.
									</td>
								</tr>
							)}
							{!isLoading &&
								items.map((c) => (
									<tr
										className="border-white/5 border-b last:border-0"
										key={c.id}
									>
										<td className="px-4 py-3 text-sm">
											<div className="font-medium">{c.name}</div>
											{c.description && (
												<div className="mt-0.5 line-clamp-1 text-white/40 text-xs">
													{c.description}
												</div>
											)}
										</td>
										<td className="hidden px-4 py-3 font-mono text-white/60 text-xs sm:table-cell">
											{c.slug}
										</td>
										<td className="px-4 py-3 text-sm text-white/70">{c.category}</td>
										<td className="hidden px-4 py-3 text-sm text-white/60 md:table-cell">
											{c.files.length === 0
												? "—"
												: `${c.files.length} extra`}
										</td>
										<td className="hidden px-4 py-3 text-sm text-white/60 lg:table-cell">
											{new Date(c.updatedAt).toLocaleDateString()}
										</td>
										<td className="px-4 py-3 text-right">
											<div className="relative inline-block">
												<button
													className="rounded p-1 hover:bg-white/10"
													onClick={() =>
														setOpenMenuId(openMenuId === c.id ? null : c.id)
													}
													type="button"
												>
													<MoreHorizontalIcon className="size-4 text-white/60" />
												</button>
												{openMenuId === c.id && (
													<div className="absolute top-full right-0 z-10 mt-1 w-36 rounded-lg border border-white/10 bg-neutral-800 py-1 shadow-lg">
														<button
															className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-white/10"
															onClick={() => {
																setEditing(c);
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
																handleDelete(c);
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

			<ComponentForm
				initial={editing ? valuesFromComponent(editing) : null}
				isOpen={isModalOpen}
				isSubmitting={isSubmitting}
				onClose={() => {
					setIsModalOpen(false);
					setEditing(null);
				}}
				onSubmit={handleSubmit}
			/>
		</div>
	);
}

export default AdminDacomps;
