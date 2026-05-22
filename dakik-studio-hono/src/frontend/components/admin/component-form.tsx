import { PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { ComponentFileEntry } from "../../lib/api";

const inputClass =
	"w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/30";
const inputMono = `${inputClass} font-mono text-xs`;

const FILE_TYPES = [
	"TYPESCRIPT",
	"TYPESCRIPT_RX",
	"CSS",
	"SCSS",
	"JSON",
	"MARKDOWN",
	"OTHER",
] as const;

export interface ComponentFormValues {
	name: string;
	slug: string;
	category: string;
	description: string;
	props: string; // JSON as string in the UI; parsed on submit
	code: string;
	preview: string;
	published: boolean;
	files: ComponentFileEntry[];
}

const EMPTY: ComponentFormValues = {
	name: "",
	slug: "",
	category: "",
	description: "",
	props: "{}",
	code: "",
	preview: "",
	published: true,
	files: [],
};

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

interface ComponentFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: ComponentFormValues, parsedProps: unknown) => Promise<void>;
	initial?: ComponentFormValues | null;
	isSubmitting?: boolean;
}

export function ComponentForm({
	isOpen,
	onClose,
	onSubmit,
	initial,
	isSubmitting,
}: ComponentFormProps) {
	const [values, setValues] = useState<ComponentFormValues>(EMPTY);
	const [slugTouched, setSlugTouched] = useState(false);
	const [propsError, setPropsError] = useState<string | null>(null);

	useEffect(() => {
		setValues(initial ?? EMPTY);
		setSlugTouched(Boolean(initial?.slug));
		setPropsError(null);
	}, [initial]);

	if (!isOpen) return null;

	function update<K extends keyof ComponentFormValues>(
		key: K,
		value: ComponentFormValues[K],
	) {
		setValues((p) => ({ ...p, [key]: value }));
	}

	function handleNameChange(next: string) {
		update("name", next);
		if (!slugTouched) update("slug", slugify(next));
	}

	function addFile() {
		update("files", [
			...values.files,
			{
				filename: "",
				content: "",
				fileType: "TYPESCRIPT",
				isMainFile: false,
				order: values.files.length,
			},
		]);
	}

	function updateFile(idx: number, patch: Partial<ComponentFileEntry>) {
		const next = values.files.map((f, i) => (i === idx ? { ...f, ...patch } : f));
		update("files", next);
	}

	function removeFile(idx: number) {
		update(
			"files",
			values.files.filter((_, i) => i !== idx),
		);
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		let parsed: unknown = {};
		try {
			parsed = values.props.trim() ? JSON.parse(values.props) : {};
			setPropsError(null);
		} catch (err) {
			setPropsError(
				err instanceof Error ? err.message : "props must be valid JSON",
			);
			return;
		}
		await onSubmit(values, parsed);
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
			<div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl border border-white/10 bg-neutral-900">
				<div className="flex items-center justify-between border-white/10 border-b px-6 py-4">
					<h2 className="font-semibold text-lg">
						{initial?.slug ? "Edit component" : "Create component"}
					</h2>
					<button onClick={onClose} type="button">
						<XIcon className="size-5 text-white/60" />
					</button>
				</div>

				<form
					className="flex-1 space-y-5 overflow-y-auto px-6 py-5"
					id="component-form"
					onSubmit={handleSubmit}
				>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Name *">
							<input
								className={inputClass}
								onChange={(e) => handleNameChange(e.target.value)}
								placeholder="Button"
								required
								value={values.name}
							/>
						</Field>
						<Field label="Slug *">
							<input
								className={inputMono}
								onChange={(e) => {
									setSlugTouched(true);
									update("slug", slugify(e.target.value));
								}}
								placeholder="button"
								required
								value={values.slug}
							/>
						</Field>
						<Field label="Category *">
							<input
								className={inputClass}
								onChange={(e) => update("category", e.target.value.toLowerCase())}
								placeholder="forms, layout, navigation..."
								required
								value={values.category}
							/>
						</Field>
						<Field label="Preview URL or component name">
							<input
								className={inputClass}
								onChange={(e) => update("preview", e.target.value)}
								placeholder="optional"
								value={values.preview}
							/>
						</Field>
					</div>

					<Field label="Description">
						<textarea
							className={`${inputClass} min-h-[80px]`}
							onChange={(e) => update("description", e.target.value)}
							placeholder="One paragraph describing what this component does and when to use it"
							value={values.description}
						/>
					</Field>

					<Field label="Props (JSON)">
						<textarea
							className={`${inputMono} min-h-[120px] ${
								propsError ? "border-red-500/40" : ""
							}`}
							onChange={(e) => update("props", e.target.value)}
							placeholder='{"size": {"type": "string", "default": "md"}}'
							value={values.props}
						/>
						{propsError && (
							<p className="mt-1 text-red-400 text-xs">{propsError}</p>
						)}
					</Field>

					<Field label="Main code *">
						<textarea
							className={`${inputMono} min-h-[200px] leading-relaxed`}
							onChange={(e) => update("code", e.target.value)}
							placeholder="export function Button() { ... }"
							required
							value={values.code}
						/>
					</Field>

					<div>
						<div className="mb-2 flex items-center justify-between">
							<label className="text-white/60 text-xs">Extra files</label>
							<button
								className="flex items-center gap-1 rounded-md border border-white/10 bg-neutral-800 px-2 py-1 text-white/80 text-xs hover:bg-neutral-700"
								onClick={addFile}
								type="button"
							>
								<PlusIcon className="size-3" />
								Add file
							</button>
						</div>
						{values.files.length === 0 ? (
							<p className="rounded-lg border border-white/5 bg-neutral-950 px-3 py-3 text-white/40 text-xs">
								No extra files. Single-file components only need the main code
								above.
							</p>
						) : (
							<div className="space-y-3">
								{values.files.map((file, idx) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: file order is stable in this UI
									<div
										className="rounded-lg border border-white/10 bg-neutral-950 p-3"
										key={idx}
									>
										<div className="mb-2 grid gap-2 sm:grid-cols-[1fr_140px_auto_auto]">
											<input
												className={inputClass}
												onChange={(e) =>
													updateFile(idx, { filename: e.target.value })
												}
												placeholder="Button.module.css"
												value={file.filename}
											/>
											<select
												className={inputClass}
												onChange={(e) =>
													updateFile(idx, { fileType: e.target.value })
												}
												value={file.fileType ?? "TYPESCRIPT"}
											>
												{FILE_TYPES.map((t) => (
													<option key={t} value={t}>
														{t.toLowerCase().replace("_", " ")}
													</option>
												))}
											</select>
											<label className="flex items-center gap-1.5 px-2 text-white/60 text-xs">
												<input
													checked={file.isMainFile ?? false}
													className="size-3.5 accent-white"
													onChange={(e) =>
														updateFile(idx, { isMainFile: e.target.checked })
													}
													type="checkbox"
												/>
												main
											</label>
											<button
												className="rounded-md border border-red-500/20 bg-red-500/10 px-2 text-red-400"
												onClick={() => removeFile(idx)}
												title="Remove file"
												type="button"
											>
												<Trash2Icon className="size-3" />
											</button>
										</div>
										<textarea
											className={`${inputMono} min-h-[120px] leading-relaxed`}
											onChange={(e) =>
												updateFile(idx, { content: e.target.value })
											}
											placeholder="File contents…"
											value={file.content}
										/>
									</div>
								))}
							</div>
						)}
					</div>

					<label className="flex items-center gap-3 text-sm">
						<input
							checked={values.published}
							className="size-4 accent-white"
							onChange={(e) => update("published", e.target.checked)}
							type="checkbox"
						/>
						<span>Published</span>
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
						form="component-form"
						type="submit"
					>
						{isSubmitting ? "Saving…" : "Save"}
					</button>
				</div>
			</div>
		</div>
	);
}

function Field({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<label className="mb-1 block text-white/60 text-xs">{label}</label>
			{children}
		</div>
	);
}
