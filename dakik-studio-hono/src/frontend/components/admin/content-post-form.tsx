import { ImageIcon, Loader2Icon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { uploadAdminFile } from "../../lib/upload";

const inputClass =
	"w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/30";
const inputMonoClass = `${inputClass} font-mono text-xs`;

/**
 * Shared form for blog posts and automations.
 * Both share: title, slug, excerpt, content (markdown), coverImage, tags, published.
 * Automations also have fileUrl which is passed through via extraFields.
 *
 * Slug auto-derives from the title on initial typing, but unlocks once the
 * user manually edits the slug field — common UX pattern that prevents the
 * slug from being overwritten when fixing a typo in the title later.
 */

export interface ContentPostFormValues {
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	coverImage: string | null;
	published: boolean;
	tags: string[];
	fileUrl?: string | null;
}

interface ContentPostFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: ContentPostFormValues) => Promise<void>;
	initial?: Partial<ContentPostFormValues> | null;
	isSubmitting?: boolean;
	resourceLabel: "Post" | "Automation";
	uploadFolder: string;
	/**
	 * If true, shows the fileUrl input (used for automation downloads).
	 */
	showFileUrl?: boolean;
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

const EMPTY_VALUES: ContentPostFormValues = {
	title: "",
	slug: "",
	excerpt: "",
	content: "",
	coverImage: null,
	published: false,
	tags: [],
	fileUrl: null,
};

export function ContentPostForm({
	isOpen,
	onClose,
	onSubmit,
	initial,
	isSubmitting,
	resourceLabel,
	uploadFolder,
	showFileUrl,
}: ContentPostFormProps) {
	const [values, setValues] = useState<ContentPostFormValues>(EMPTY_VALUES);
	const [slugTouched, setSlugTouched] = useState(false);
	const [coverUploading, setCoverUploading] = useState(false);
	const [fileUploading, setFileUploading] = useState(false);
	const [tagsInput, setTagsInput] = useState("");

	useEffect(() => {
		if (initial) {
			setValues({
				title: initial.title ?? "",
				slug: initial.slug ?? "",
				excerpt: initial.excerpt ?? "",
				content: initial.content ?? "",
				coverImage: initial.coverImage ?? null,
				published: initial.published ?? false,
				tags: initial.tags ?? [],
				fileUrl: initial.fileUrl ?? null,
			});
			setSlugTouched(Boolean(initial.slug));
			setTagsInput((initial.tags ?? []).join(", "));
		} else {
			setValues(EMPTY_VALUES);
			setSlugTouched(false);
			setTagsInput("");
		}
	}, [initial]);

	if (!isOpen) return null;

	function update<K extends keyof ContentPostFormValues>(
		key: K,
		value: ContentPostFormValues[K],
	) {
		setValues((prev) => ({ ...prev, [key]: value }));
	}

	function handleTitleChange(next: string) {
		update("title", next);
		if (!slugTouched) {
			update("slug", slugify(next));
		}
	}

	function handleTagsChange(raw: string) {
		setTagsInput(raw);
		const parsed = raw
			.split(",")
			.map((t) => slugify(t))
			.filter(Boolean);
		update("tags", Array.from(new Set(parsed)));
	}

	async function handleCoverUpload(file: File) {
		setCoverUploading(true);
		try {
			const result = await uploadAdminFile(file, uploadFolder);
			update("coverImage", result.url);
		} catch (err) {
			alert(err instanceof Error ? err.message : "Cover upload failed");
		} finally {
			setCoverUploading(false);
		}
	}

	async function handleFileUpload(file: File) {
		setFileUploading(true);
		try {
			const result = await uploadAdminFile(file, `${uploadFolder}/downloads`);
			update("fileUrl", result.url);
		} catch (err) {
			alert(err instanceof Error ? err.message : "File upload failed");
		} finally {
			setFileUploading(false);
		}
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		await onSubmit(values);
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
			<div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl border border-white/10 bg-neutral-900">
				<div className="flex items-center justify-between border-white/10 border-b px-6 py-4">
					<h2 className="font-semibold text-lg">
						{initial?.slug ? `Edit ${resourceLabel}` : `Create ${resourceLabel}`}
					</h2>
					<button onClick={onClose} type="button">
						<XIcon className="size-5 text-white/60" />
					</button>
				</div>

				<form
					className="flex-1 space-y-5 overflow-y-auto px-6 py-5"
					id="content-post-form"
					onSubmit={handleSubmit}
				>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Title *">
							<input
								className={inputClass}
								onChange={(e) => handleTitleChange(e.target.value)}
								placeholder="A great post"
								required
								value={values.title}
							/>
						</Field>
						<Field label="Slug *">
							<input
								className={inputMonoClass}
								onChange={(e) => {
									setSlugTouched(true);
									update("slug", slugify(e.target.value));
								}}
								placeholder="a-great-post"
								required
								value={values.slug}
							/>
						</Field>
					</div>

					<Field label="Excerpt">
						<input
							className={inputClass}
							maxLength={280}
							onChange={(e) => update("excerpt", e.target.value)}
							placeholder="Short summary shown on listings"
							value={values.excerpt}
						/>
					</Field>

					<Field label="Cover image">
						<div className="flex items-center gap-3">
							{values.coverImage ? (
								<div className="relative">
									{/* biome-ignore lint/performance/noImgElement: SPA, no Next/Image */}
									<img
										alt=""
										className="h-16 w-24 rounded border border-white/10 object-cover"
										src={values.coverImage}
									/>
									<button
										className="-top-1.5 -right-1.5 absolute rounded-full bg-red-500 p-0.5 text-white"
										onClick={() => update("coverImage", null)}
										type="button"
									>
										<XIcon className="size-3" />
									</button>
								</div>
							) : (
								<div className="flex h-16 w-24 items-center justify-center rounded border border-white/10 border-dashed text-white/40">
									<ImageIcon className="size-5" />
								</div>
							)}
							<label className="cursor-pointer rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700">
								{coverUploading ? (
									<span className="inline-flex items-center gap-2">
										<Loader2Icon className="size-3 animate-spin" />
										Uploading…
									</span>
								) : (
									"Upload cover"
								)}
								<input
									accept="image/*"
									className="hidden"
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) {
											handleCoverUpload(file);
											e.target.value = "";
										}
									}}
									type="file"
								/>
							</label>
						</div>
					</Field>

					{showFileUrl && (
						<Field label="Download file (automation asset)">
							<div className="flex items-center gap-3">
								<input
									className={`${inputMonoClass} flex-1`}
									onChange={(e) => update("fileUrl", e.target.value || null)}
									placeholder="/media/automations/downloads/..."
									value={values.fileUrl ?? ""}
								/>
								<label className="cursor-pointer rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700">
									{fileUploading ? (
										<span className="inline-flex items-center gap-2">
											<Loader2Icon className="size-3 animate-spin" />
											Uploading…
										</span>
									) : (
										"Upload file"
									)}
									<input
										className="hidden"
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file) {
												handleFileUpload(file);
												e.target.value = "";
											}
										}}
										type="file"
									/>
								</label>
							</div>
						</Field>
					)}

					<Field label="Tags (comma separated)">
						<input
							className={inputClass}
							onChange={(e) => handleTagsChange(e.target.value)}
							placeholder="design, performance"
							value={tagsInput}
						/>
						{values.tags.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-1.5">
								{values.tags.map((t) => (
									<span
										className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-white/70 text-xs"
										key={t}
									>
										{t}
									</span>
								))}
							</div>
						)}
					</Field>

					<Field label="Content (markdown) *">
						<textarea
							className={`${inputMonoClass} min-h-[260px] leading-relaxed`}
							onChange={(e) => update("content", e.target.value)}
							placeholder={"## Heading\n\nWrite in markdown. Supports headings, lists, links, code blocks…"}
							required
							value={values.content}
						/>
					</Field>

					<label className="flex items-center gap-3 text-sm">
						<input
							checked={values.published}
							className="size-4 accent-white"
							onChange={(e) => update("published", e.target.checked)}
							type="checkbox"
						/>
						<span>Published</span>
						<span className="text-white/40 text-xs">
							{values.published
								? "Will appear on the public site immediately."
								: "Drafts are hidden from public listings."}
						</span>
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
						disabled={isSubmitting || coverUploading || fileUploading}
						form="content-post-form"
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
