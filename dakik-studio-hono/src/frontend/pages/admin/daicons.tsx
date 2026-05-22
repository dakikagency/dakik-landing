import {
	PencilIcon,
	PlusIcon,
	Trash2Icon,
	XIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { sanitizeSvg } from "../../../lib/sanitize-svg";
import { api, type Icon, type IconInput } from "../../lib/api";

const inputClass =
	"w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/30";

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

function valuesFromIcon(icon: Icon): IconInput & { isCustom: boolean } {
	return {
		name: icon.name,
		slug: icon.slug,
		category: icon.category,
		svgContent: icon.svgContent,
		keywords: icon.keywords,
		isCustom: icon.isCustom,
	};
}

const EMPTY: IconInput & { isCustom: boolean } = {
	name: "",
	slug: "",
	category: "",
	svgContent: "",
	keywords: [],
	isCustom: true,
};

interface IconFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: IconInput) => Promise<void>;
	initial?: (IconInput & { isCustom: boolean }) | null;
	isSubmitting?: boolean;
}

function IconForm({
	isOpen,
	onClose,
	onSubmit,
	initial,
	isSubmitting,
}: IconFormProps) {
	const [values, setValues] = useState<IconInput & { isCustom: boolean }>(EMPTY);
	const [slugTouched, setSlugTouched] = useState(false);
	const [keywordsInput, setKeywordsInput] = useState("");

	useEffect(() => {
		if (initial) {
			setValues(initial);
			setKeywordsInput((initial.keywords ?? []).join(", "));
			setSlugTouched(Boolean(initial.slug));
		} else {
			setValues(EMPTY);
			setKeywordsInput("");
			setSlugTouched(false);
		}
	}, [initial]);

	if (!isOpen) return null;

	function update<K extends keyof typeof values>(
		key: K,
		value: (typeof values)[K],
	) {
		setValues((p) => ({ ...p, [key]: value }));
	}

	function handleNameChange(next: string) {
		update("name", next);
		if (!slugTouched) {
			update("slug", slugify(next));
		}
	}

	function handleKeywordsChange(raw: string) {
		setKeywordsInput(raw);
		update(
			"keywords",
			raw
				.split(",")
				.map((k) => k.trim().toLowerCase())
				.filter(Boolean),
		);
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		await onSubmit({
			name: values.name,
			slug: values.slug,
			category: values.category,
			svgContent: sanitizeSvg(values.svgContent),
			keywords: values.keywords ?? [],
			isCustom: values.isCustom,
		});
	}

	const safePreview = sanitizeSvg(values.svgContent);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
			<div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-white/10 bg-neutral-900">
				<div className="flex items-center justify-between border-white/10 border-b px-6 py-4">
					<h2 className="font-semibold text-lg">
						{initial?.slug ? "Edit icon" : "Create icon"}
					</h2>
					<button onClick={onClose} type="button">
						<XIcon className="size-5 text-white/60" />
					</button>
				</div>

				<form
					className="flex-1 space-y-5 overflow-y-auto px-6 py-5"
					id="icon-form"
					onSubmit={handleSubmit}
				>
					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<label className="mb-1 block text-white/60 text-xs">Name *</label>
							<input
								className={inputClass}
								onChange={(e) => handleNameChange(e.target.value)}
								placeholder="Arrow Right"
								required
								value={values.name}
							/>
						</div>
						<div>
							<label className="mb-1 block text-white/60 text-xs">Slug *</label>
							<input
								className={`${inputClass} font-mono text-xs`}
								onChange={(e) => {
									setSlugTouched(true);
									update("slug", slugify(e.target.value));
								}}
								placeholder="arrow-right"
								required
								value={values.slug}
							/>
						</div>
					</div>

					<div>
						<label className="mb-1 block text-white/60 text-xs">Category *</label>
						<input
							className={inputClass}
							onChange={(e) => update("category", e.target.value.toLowerCase())}
							placeholder="arrows, ui, etc."
							required
							value={values.category}
						/>
					</div>

					<div>
						<label className="mb-1 block text-white/60 text-xs">
							Keywords (comma separated)
						</label>
						<input
							className={inputClass}
							onChange={(e) => handleKeywordsChange(e.target.value)}
							placeholder="arrow, right, forward, next"
							value={keywordsInput}
						/>
					</div>

					<div>
						<label className="mb-1 block text-white/60 text-xs">SVG content *</label>
						<div className="grid gap-3 sm:grid-cols-[1fr_auto]">
							<textarea
								className={`${inputClass} min-h-[180px] font-mono text-xs leading-relaxed`}
								onChange={(e) => update("svgContent", e.target.value)}
								placeholder='<svg viewBox="0 0 24 24">...'
								required
								value={values.svgContent}
							/>
							<div className="flex h-[180px] w-[180px] items-center justify-center rounded border border-white/10 border-dashed bg-neutral-950 p-4">
								{safePreview.includes("<svg") ? (
									<div
										aria-label="Icon preview"
										className="size-24 text-white"
										// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized via sanitizeSvg()
										dangerouslySetInnerHTML={{ __html: safePreview }}
									/>
								) : (
									<span className="text-white/40 text-xs">Preview</span>
								)}
							</div>
						</div>
						<p className="mt-1 text-white/40 text-xs">
							Paste a full &lt;svg&gt; element. Use currentColor so the icon can
							be styled by parent text color. Scripts and event handlers are
							stripped on save.
						</p>
					</div>

					<label className="flex items-center gap-3 text-sm">
						<input
							checked={values.isCustom}
							className="size-4 accent-white"
							onChange={(e) => update("isCustom", e.target.checked)}
							type="checkbox"
						/>
						<span>Custom (made in-house)</span>
					</label>
				</form>

				<div className="flex gap-3 border-white/10 border-t px-6 py-4">
					<button
						className="flex-1 rounded-lg border border-white/10 bg-neutral-800 px-4 py-2 font-medium text-sm text-white hover:bg-neutral-700"
						onClick={onClose}
						type="button"
					>
						Cancel
					</button>
					<button
						className="flex-1 rounded-lg bg-white px-4 py-2 font-medium text-black text-sm hover:bg-white/90 disabled:opacity-50"
						disabled={isSubmitting}
						form="icon-form"
						type="submit"
					>
						{isSubmitting ? "Saving…" : "Save"}
					</button>
				</div>
			</div>
		</div>
	);
}

function IconCard({
	icon,
	onEdit,
	onDelete,
}: {
	icon: Icon;
	onEdit: () => void;
	onDelete: () => void;
}) {
	const safe = sanitizeSvg(icon.svgContent);
	return (
		<div className="group relative rounded-xl border border-white/10 bg-neutral-900 p-4">
			<div
				className="flex h-16 items-center justify-center text-white"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized via sanitizeSvg()
				dangerouslySetInnerHTML={{ __html: safe }}
			/>
			<div className="mt-3 truncate text-center font-medium text-sm">
				{icon.name}
			</div>
			<div className="truncate text-center font-mono text-white/40 text-xs">
				{icon.slug}
			</div>

			<div className="-top-2 -right-2 absolute hidden gap-1 group-hover:flex">
				<button
					className="rounded-full bg-white p-1 text-black shadow-md"
					onClick={onEdit}
					title="Edit"
					type="button"
				>
					<PencilIcon className="size-3" />
				</button>
				<button
					className="rounded-full bg-red-500 p-1 text-white shadow-md"
					onClick={onDelete}
					title="Delete"
					type="button"
				>
					<Trash2Icon className="size-3" />
				</button>
			</div>
		</div>
	);
}

export function AdminDaicons() {
	const [icons, setIcons] = useState<Icon[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<string>("");

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editing, setEditing] = useState<Icon | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const fetchIcons = useCallback(async () => {
		try {
			setIsLoading(true);
			const params: { search?: string; category?: string } = {};
			if (search) params.search = search;
			if (category) params.category = category;
			const data = await api.admin.icons.list(params);
			setIcons(data.icons);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load icons");
		} finally {
			setIsLoading(false);
		}
	}, [search, category]);

	useEffect(() => {
		fetchIcons();
	}, [fetchIcons]);

	const categories = Array.from(new Set(icons.map((i) => i.category))).sort();

	async function handleSubmit(values: IconInput) {
		try {
			setIsSubmitting(true);
			if (editing) {
				await api.admin.icons.update(editing.id, values);
			} else {
				await api.admin.icons.create(values);
			}
			setIsModalOpen(false);
			setEditing(null);
			fetchIcons();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Save failed");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDelete(icon: Icon) {
		if (!confirm(`Delete "${icon.name}"? This cannot be undone.`)) return;
		try {
			await api.admin.icons.delete(icon.id);
			fetchIcons();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Delete failed");
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl tracking-tight">Daicons</h1>
					<p className="mt-1 text-sm text-white/60">
						Custom icon library. Paste SVGs and search by keyword.
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
					New icon
				</button>
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<input
					className="w-64 rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm placeholder:text-white/40"
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search by name, slug or keyword"
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

			{isLoading && (
				<div className="rounded-xl border border-white/10 bg-neutral-900 py-12 text-center text-sm text-white/50">
					Loading…
				</div>
			)}

			{!isLoading && icons.length === 0 && (
				<div className="rounded-xl border border-white/10 bg-neutral-900 py-12 text-center text-sm text-white/40">
					No icons match the filter.
				</div>
			)}

			{!isLoading && icons.length > 0 && (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
					{icons.map((icon) => (
						<IconCard
							icon={icon}
							key={icon.id}
							onDelete={() => handleDelete(icon)}
							onEdit={() => {
								setEditing(icon);
								setIsModalOpen(true);
							}}
						/>
					))}
				</div>
			)}

			<IconForm
				initial={editing ? valuesFromIcon(editing) : null}
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

export default AdminDaicons;
