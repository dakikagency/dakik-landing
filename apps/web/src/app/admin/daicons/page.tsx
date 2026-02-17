"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowLeftIcon,
	EditIcon,
	FilterIcon,
	Loader2Icon,
	MoreHorizontalIcon,
	PlusIcon,
	SearchIcon,
	TrashIcon,
	UploadIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

interface Icon {
	id: string;
	name: string;
	slug: string;
	category: string;
	svgContent: string;
	keywords: string[];
	isCustom: boolean;
	createdAt: Date | string;
	updatedAt: Date | string;
}

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];

// Regex patterns for SVG sanitization - moved to top level for performance
const SCRIPT_TAG_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const EVENT_HANDLER_REGEX = /on\w+="[^"]*"/gi;
const SVG_OPEN_TAG_REGEX = /<svg/;

function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

function IconPreview({ svgContent }: { svgContent: string }) {
	// Sanitize and render SVG safely
	const sanitizedSvg = svgContent
		.replace(SCRIPT_TAG_REGEX, "")
		.replace(EVENT_HANDLER_REGEX, "");

	return (
		<div
			className="flex size-10 items-center justify-center border bg-muted/50 p-2 [&>svg]:size-6 [&>svg]:text-foreground"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized SVG content
			dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
		/>
	);
}

function IconEditor({
	icon,
	onCancel,
	onSuccess,
}: {
	icon?: Icon | null;
	onCancel: () => void;
	onSuccess: () => void;
}) {
	const queryClient = useQueryClient();
	const isEditing = Boolean(icon);

	const [name, setName] = useState(icon?.name ?? "");
	const [slug, setSlug] = useState(icon?.slug ?? "");
	const [category, setCategory] = useState(icon?.category ?? "General");
	const [svgContent, setSvgContent] = useState(icon?.svgContent ?? "");
	const [keywords, setKeywords] = useState(icon?.keywords.join(", ") ?? "");
	const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

	const { data: categories } = useQuery(
		trpc.icons.getCategories.queryOptions()
	);

	const createMutation = useMutation(trpc.icons.create.mutationOptions());
	const updateMutation = useMutation(trpc.icons.update.mutationOptions());

	useEffect(() => {
		if (!(slugManuallyEdited || isEditing)) {
			setSlug(generateSlug(name));
		}
	}, [name, slugManuallyEdited, isEditing]);

	const handleSlugChange = (value: string) => {
		setSlugManuallyEdited(true);
		setSlug(generateSlug(value));
	};

	const parseKeywords = (input: string): string[] => {
		return input
			.split(",")
			.map((k) => k.trim().toLowerCase())
			.filter((k) => k.length > 0);
	};

	const validateForm = (): boolean => {
		if (!name.trim()) {
			toast.error("Name is required");
			return false;
		}
		if (!slug.trim()) {
			toast.error("Slug is required");
			return false;
		}
		if (!category) {
			toast.error("Category is required");
			return false;
		}
		if (!svgContent.trim()) {
			toast.error("SVG content is required");
			return false;
		}
		// Basic SVG validation
		if (!(svgContent.includes("<svg") && svgContent.includes("</svg>"))) {
			toast.error("Invalid SVG content - must contain <svg> tags");
			return false;
		}
		return true;
	};

	const handleSave = async () => {
		if (!validateForm()) {
			return;
		}

		const iconData = {
			name: name.trim(),
			slug: slug.trim(),
			category,
			svgContent: svgContent.trim(),
			keywords: parseKeywords(keywords),
		};

		try {
			if (isEditing && icon) {
				await updateMutation.mutateAsync({ id: icon.id, ...iconData });
				toast.success("Icon updated");
			} else {
				await createMutation.mutateAsync(iconData);
				toast.success("Icon created");
			}

			await queryClient.invalidateQueries({
				queryKey: trpc.icons.listCustom.queryKey(),
			});
			onSuccess();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to save icon";
			toast.error(message);
		}
	};

	const isSaving = createMutation.isPending || updateMutation.isPending;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<Button onClick={onCancel} size="icon-sm" variant="ghost">
						<ArrowLeftIcon className="size-4" />
					</Button>
					<div>
						<h1 className="font-bold font-display text-2xl tracking-tight">
							{isEditing ? "Edit Icon" : "New Icon"}
						</h1>
						<p className="mt-1 text-muted-foreground text-sm">
							{isEditing
								? "Update the custom icon details below."
								: "Create a new custom icon for the library."}
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					<Button disabled={isSaving} onClick={onCancel} variant="outline">
						Cancel
					</Button>
					<Button disabled={isSaving} onClick={handleSave}>
						{isSaving ? (
							<Loader2Icon className="mr-2 size-4 animate-spin" />
						) : null}
						{isEditing ? "Update" : "Create"}
					</Button>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Main Content */}
				<div className="space-y-6 lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="text-sm">Icon Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									onChange={(e) => setName(e.target.value)}
									placeholder="Enter icon name..."
									value={name}
								/>
								<p className="text-muted-foreground text-xs">
									Human-readable name for the icon.
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="slug">Slug</Label>
								<Input
									id="slug"
									onChange={(e) => handleSlugChange(e.target.value)}
									placeholder="icon-slug"
									value={slug}
								/>
								<p className="text-muted-foreground text-xs">
									Unique identifier for the icon. Auto-generated from name.
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="category">Category</Label>
								<Select
									onValueChange={(value) => value && setCategory(value)}
									value={category}
								>
									<SelectTrigger className="w-full">
										<SelectValue>
											{(value: string | null) => value ?? "Select category"}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										{categories?.map((cat) => (
											<SelectItem key={cat} value={cat}>
												{cat}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="keywords">Keywords</Label>
								<Input
									id="keywords"
									onChange={(e) => setKeywords(e.target.value)}
									placeholder="search, find, lookup"
									value={keywords}
								/>
								<p className="text-muted-foreground text-xs">
									Comma-separated keywords for search.
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="svgContent">SVG Content</Label>
								<textarea
									className={cn(
										"min-h-64 w-full resize-y border bg-transparent px-3 py-2 font-mono text-sm outline-none transition-colors",
										"placeholder:text-muted-foreground",
										"focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
										"disabled:cursor-not-allowed disabled:opacity-50"
									)}
									id="svgContent"
									onChange={(e) => setSvgContent(e.target.value)}
									placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">...</svg>'
									value={svgContent}
								/>
								<p className="text-muted-foreground text-xs">
									Paste the full SVG code. Use currentColor for stroke/fill to
									support theming.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar - Preview */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-sm">Preview</CardTitle>
						</CardHeader>
						<CardContent>
							{svgContent ? (
								<div className="space-y-4">
									<div className="flex items-center justify-center border bg-background p-8">
										<div
											className="[&>svg]:size-16 [&>svg]:text-foreground"
											// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized SVG content
											dangerouslySetInnerHTML={{
												__html: svgContent
													.replace(SCRIPT_TAG_REGEX, "")
													.replace(EVENT_HANDLER_REGEX, ""),
											}}
										/>
									</div>
									<div className="grid grid-cols-4 gap-2">
										{[16, 20, 24, 32].map((size) => (
											<div
												className="flex flex-col items-center gap-1"
												key={size}
											>
												<div
													className="flex items-center justify-center border bg-muted/50 p-2"
													style={{
														width: size + 16,
														height: size + 16,
													}}
												>
													<div
														className="[&>svg]:text-foreground"
														// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized SVG content
														dangerouslySetInnerHTML={{
															__html: svgContent
																.replace(SCRIPT_TAG_REGEX, "")
																.replace(EVENT_HANDLER_REGEX, "")
																.replace(
																	SVG_OPEN_TAG_REGEX,
																	`<svg width="${size}" height="${size}"`
																),
														}}
													/>
												</div>
												<span className="text-muted-foreground text-xs">
													{size}px
												</span>
											</div>
										))}
									</div>
								</div>
							) : (
								<div className="flex items-center justify-center border bg-muted/50 p-8">
									<p className="text-muted-foreground text-sm">
										Paste SVG code to preview
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm">Tips</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-muted-foreground text-xs">
							<p>
								Use <code className="bg-muted px-1">currentColor</code> for{" "}
								<code className="bg-muted px-1">stroke</code> and{" "}
								<code className="bg-muted px-1">fill</code> to support theming.
							</p>
							<p>
								Set <code className="bg-muted px-1">fill="none"</code> and{" "}
								<code className="bg-muted px-1">stroke="currentColor"</code> for
								line icons.
							</p>
							<p>
								Include <code className="bg-muted px-1">viewBox</code> attribute
								for proper scaling.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

function VariantPreview({
	label,
	svgContent,
}: {
	label: string;
	svgContent: string;
}) {
	if (!svgContent) {
		return (
			<div className="space-y-2">
				<p className="font-medium text-sm">{label}</p>
				<div className="flex items-center justify-center border border-dashed bg-muted/30 p-6">
					<p className="text-muted-foreground text-xs">No SVG provided</p>
				</div>
			</div>
		);
	}

	const sanitizedSvg = svgContent
		.replace(SCRIPT_TAG_REGEX, "")
		.replace(EVENT_HANDLER_REGEX, "");

	return (
		<div className="space-y-2">
			<p className="font-medium text-sm">{label}</p>
			<div className="flex items-center justify-center border bg-background p-6">
				<div
					className="[&>svg]:size-12 [&>svg]:text-foreground"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized SVG content
					dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
				/>
			</div>
		</div>
	);
}

function MultiVariantIconEditor({
	onCancel,
	onSuccess,
}: {
	onCancel: () => void;
	onSuccess: () => void;
}) {
	const queryClient = useQueryClient();

	const [baseName, setBaseName] = useState("");
	const [category, setCategory] = useState("General");
	const [keywords, setKeywords] = useState("");
	const [lineSvgContent, setLineSvgContent] = useState("");
	const [filledSvgContent, setFilledSvgContent] = useState("");

	const { data: categories } = useQuery(
		trpc.icons.getCategories.queryOptions()
	);

	const createWithVariantsMutation = useMutation(
		trpc.icons.createWithVariants.mutationOptions()
	);

	const parseKeywords = (input: string): string[] => {
		return input
			.split(",")
			.map((k) => k.trim().toLowerCase())
			.filter((k) => k.length > 0);
	};

	const validateSvg = (content: string): boolean => {
		if (!content.trim()) {
			return true; // Empty is valid (optional)
		}
		return content.includes("<svg") && content.includes("</svg>");
	};

	const validateForm = (): boolean => {
		if (!baseName.trim()) {
			toast.error("Base name is required");
			return false;
		}
		if (!category) {
			toast.error("Category is required");
			return false;
		}
		if (!(lineSvgContent.trim() || filledSvgContent.trim())) {
			toast.error("At least one SVG variant (line or filled) is required");
			return false;
		}
		if (lineSvgContent.trim() && !validateSvg(lineSvgContent)) {
			toast.error(
				"Invalid SVG content for line variant - must contain <svg> tags"
			);
			return false;
		}
		if (filledSvgContent.trim() && !validateSvg(filledSvgContent)) {
			toast.error(
				"Invalid SVG content for filled variant - must contain <svg> tags"
			);
			return false;
		}
		return true;
	};

	const handleSave = async () => {
		if (!validateForm()) {
			return;
		}

		try {
			const result = await createWithVariantsMutation.mutateAsync({
				baseName: baseName.trim(),
				category,
				keywords: parseKeywords(keywords),
				lineSvgContent: lineSvgContent.trim() || undefined,
				filledSvgContent: filledSvgContent.trim() || undefined,
			});

			await queryClient.invalidateQueries({
				queryKey: trpc.icons.listCustom.queryKey(),
			});

			const variantNames = result.variants.map((v) => v.name).join(", ");
			toast.success(`Created ${result.count} icon variant(s): ${variantNames}`);
			onSuccess();
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to create icon variants";
			toast.error(message);
		}
	};

	const isSaving = createWithVariantsMutation.isPending;
	const baseSlug = generateSlug(baseName);
	const hasLineVariant = Boolean(lineSvgContent.trim());
	const hasFilledVariant = Boolean(filledSvgContent.trim());

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<Button onClick={onCancel} size="icon-sm" variant="ghost">
						<ArrowLeftIcon className="size-4" />
					</Button>
					<div>
						<h1 className="font-bold font-display text-2xl tracking-tight">
							New Icon with Variants
						</h1>
						<p className="mt-1 text-muted-foreground text-sm">
							Create line and/or filled versions of an icon at once.
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					<Button disabled={isSaving} onClick={onCancel} variant="outline">
						Cancel
					</Button>
					<Button disabled={isSaving} onClick={handleSave}>
						{isSaving ? (
							<Loader2Icon className="mr-2 size-4 animate-spin" />
						) : null}
						Create Variants
					</Button>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Main Content */}
				<div className="space-y-6 lg:col-span-2">
					{/* Base Details Card */}
					<Card>
						<CardHeader>
							<CardTitle className="text-sm">Base Icon Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="baseName">Base Name</Label>
								<Input
									id="baseName"
									onChange={(e) => setBaseName(e.target.value)}
									placeholder="e.g., acorn, star, heart"
									value={baseName}
								/>
								<p className="text-muted-foreground text-xs">
									The base name for the icon. Variants will be named "
									{baseName || "name"} Line" and "{baseName || "name"} Filled".
								</p>
							</div>

							{baseName && (
								<div className="border bg-muted/30 p-3">
									<p className="font-medium text-xs">Generated slugs:</p>
									<div className="mt-1 flex flex-wrap gap-2">
										{hasLineVariant && (
											<Badge variant="secondary">{baseSlug}-line</Badge>
										)}
										{hasFilledVariant && (
											<Badge variant="secondary">{baseSlug}-filled</Badge>
										)}
										{!(hasLineVariant || hasFilledVariant) && (
											<span className="text-muted-foreground text-xs">
												Add SVG content to see generated slugs
											</span>
										)}
									</div>
								</div>
							)}

							<div className="space-y-2">
								<Label htmlFor="variantCategory">Category</Label>
								<Select
									onValueChange={(value) => value && setCategory(value)}
									value={category}
								>
									<SelectTrigger className="w-full">
										<SelectValue>
											{(value: string | null) => value ?? "Select category"}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										{categories?.map((cat) => (
											<SelectItem key={cat} value={cat}>
												{cat}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="variantKeywords">Keywords</Label>
								<Input
									id="variantKeywords"
									onChange={(e) => setKeywords(e.target.value)}
									placeholder="search, find, lookup"
									value={keywords}
								/>
								<p className="text-muted-foreground text-xs">
									Comma-separated keywords for search. "line" and "filled"
									keywords are added automatically.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Line Variant Card */}
					<Card>
						<CardHeader>
							<CardTitle className="text-sm">
								Line Variant
								{hasLineVariant && (
									<Badge className="ml-2" variant="outline">
										Provided
									</Badge>
								)}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<Label htmlFor="lineSvgContent">SVG Content (Optional)</Label>
							<textarea
								className={cn(
									"min-h-40 w-full resize-y border bg-transparent px-3 py-2 font-mono text-sm outline-none transition-colors",
									"placeholder:text-muted-foreground",
									"focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
									"disabled:cursor-not-allowed disabled:opacity-50"
								)}
								id="lineSvgContent"
								onChange={(e) => setLineSvgContent(e.target.value)}
								placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">...</svg>'
								value={lineSvgContent}
							/>
							<p className="text-muted-foreground text-xs">
								Paste the line/outline version of the icon. Use
								stroke="currentColor" for theming.
							</p>
						</CardContent>
					</Card>

					{/* Filled Variant Card */}
					<Card>
						<CardHeader>
							<CardTitle className="text-sm">
								Filled Variant
								{hasFilledVariant && (
									<Badge className="ml-2" variant="outline">
										Provided
									</Badge>
								)}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<Label htmlFor="filledSvgContent">SVG Content (Optional)</Label>
							<textarea
								className={cn(
									"min-h-40 w-full resize-y border bg-transparent px-3 py-2 font-mono text-sm outline-none transition-colors",
									"placeholder:text-muted-foreground",
									"focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
									"disabled:cursor-not-allowed disabled:opacity-50"
								)}
								id="filledSvgContent"
								onChange={(e) => setFilledSvgContent(e.target.value)}
								placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">...</svg>'
								value={filledSvgContent}
							/>
							<p className="text-muted-foreground text-xs">
								Paste the filled/solid version of the icon. Use
								fill="currentColor" for theming.
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar - Preview */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-sm">Preview</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<VariantPreview
								label="Line Variant"
								svgContent={lineSvgContent}
							/>
							<VariantPreview
								label="Filled Variant"
								svgContent={filledSvgContent}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm">Tips</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-muted-foreground text-xs">
							<p>
								<strong>Line icons:</strong> Use{" "}
								<code className="bg-muted px-1">fill="none"</code> and{" "}
								<code className="bg-muted px-1">stroke="currentColor"</code>.
							</p>
							<p>
								<strong>Filled icons:</strong> Use{" "}
								<code className="bg-muted px-1">fill="currentColor"</code>.
							</p>
							<p>
								You can add just one variant now and add the other later by
								creating a single icon.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

function BulkImportModal({
	onClose,
	onSuccess,
}: {
	onClose: () => void;
	onSuccess: () => void;
}) {
	const queryClient = useQueryClient();
	const [jsonInput, setJsonInput] = useState("");

	const bulkCreateMutation = useMutation(
		trpc.icons.bulkCreate.mutationOptions()
	);

	const handleImport = async () => {
		try {
			const parsed = JSON.parse(jsonInput);
			if (!Array.isArray(parsed)) {
				toast.error("Input must be a JSON array");
				return;
			}

			await bulkCreateMutation.mutateAsync({ icons: parsed });
			await queryClient.invalidateQueries({
				queryKey: trpc.icons.listCustom.queryKey(),
			});
			toast.success(`Imported ${parsed.length} icons`);
			onSuccess();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to import icons";
			toast.error(message);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
			<Card className="w-full max-w-2xl">
				<CardHeader>
					<CardTitle>Bulk Import Icons</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="jsonInput">JSON Array</Label>
						<textarea
							className={cn(
								"min-h-64 w-full resize-y border bg-transparent px-3 py-2 font-mono text-sm outline-none transition-colors",
								"placeholder:text-muted-foreground",
								"focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
							)}
							id="jsonInput"
							onChange={(e) => setJsonInput(e.target.value)}
							placeholder={`[
  {
    "name": "Icon Name",
    "slug": "icon-name",
    "category": "General",
    "svgContent": "<svg>...</svg>",
    "keywords": ["keyword1", "keyword2"]
  }
]`}
							value={jsonInput}
						/>
						<p className="text-muted-foreground text-xs">
							Paste a JSON array of icon objects. Each object must have name,
							slug, category, and svgContent.
						</p>
					</div>
					<div className="flex justify-end gap-2">
						<Button onClick={onClose} variant="outline">
							Cancel
						</Button>
						<Button
							disabled={bulkCreateMutation.isPending || !jsonInput.trim()}
							onClick={handleImport}
						>
							{bulkCreateMutation.isPending ? (
								<Loader2Icon className="mr-2 size-4 animate-spin" />
							) : null}
							Import
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function LoadingSkeleton() {
	return (
		<div className="space-y-3">
			{SKELETON_KEYS.map((key) => (
				<div className="flex items-center justify-between py-3" key={key}>
					<div className="flex items-center gap-4">
						<Skeleton className="size-10" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-3 w-24" />
						</div>
					</div>
					<Skeleton className="h-5 w-20" />
				</div>
			))}
		</div>
	);
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
	return (
		<div className="py-8 text-center">
			<p className="text-muted-foreground text-sm">
				{hasFilters
					? "No icons found matching your criteria."
					: "No custom icons yet. Create your first icon!"}
			</p>
		</div>
	);
}

function DeleteConfirmBanner({
	onCancel,
	onConfirm,
	isPending,
}: {
	onCancel: () => void;
	onConfirm: () => void;
	isPending: boolean;
}) {
	return (
		<div className="mb-4 flex items-center justify-between border border-destructive/50 bg-destructive/10 p-3">
			<p className="text-sm">Are you sure you want to delete this icon?</p>
			<div className="flex gap-2">
				<Button
					disabled={isPending}
					onClick={onCancel}
					size="sm"
					variant="outline"
				>
					Cancel
				</Button>
				<Button
					disabled={isPending}
					onClick={onConfirm}
					size="sm"
					variant="destructive"
				>
					{isPending ? (
						<Loader2Icon className="mr-2 size-4 animate-spin" />
					) : null}
					Delete
				</Button>
			</div>
		</div>
	);
}

function IconsTable({
	icons,
	onEdit,
	onDeleteClick,
}: {
	icons: Icon[];
	onEdit: (icon: Icon) => void;
	onDeleteClick: (id: string) => void;
}) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-16">Preview</TableHead>
					<TableHead>Name</TableHead>
					<TableHead className="hidden md:table-cell">Category</TableHead>
					<TableHead className="hidden lg:table-cell">Keywords</TableHead>
					<TableHead className="hidden lg:table-cell">Created</TableHead>
					<TableHead className="w-12">
						<span className="sr-only">Actions</span>
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{icons.map((icon) => (
					<TableRow key={icon.id}>
						<TableCell>
							<IconPreview svgContent={icon.svgContent} />
						</TableCell>
						<TableCell>
							<div className="space-y-1">
								<span className="font-medium">{icon.name}</span>
								<p className="text-muted-foreground text-xs">{icon.slug}</p>
							</div>
						</TableCell>
						<TableCell className="hidden md:table-cell">
							<Badge variant="outline">{icon.category}</Badge>
						</TableCell>
						<TableCell className="hidden lg:table-cell">
							<div className="flex max-w-48 flex-wrap gap-1">
								{icon.keywords.slice(0, 3).map((kw) => (
									<Badge key={kw} variant="secondary">
										{kw}
									</Badge>
								))}
								{icon.keywords.length > 3 && (
									<Badge variant="secondary">+{icon.keywords.length - 3}</Badge>
								)}
							</div>
						</TableCell>
						<TableCell className="hidden text-muted-foreground lg:table-cell">
							{new Date(icon.createdAt).toLocaleDateString()}
						</TableCell>
						<TableCell>
							<DropdownMenu>
								<DropdownMenuTrigger
									render={<Button size="icon-sm" variant="ghost" />}
								>
									<MoreHorizontalIcon className="size-4" />
									<span className="sr-only">Open menu</span>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => onEdit(icon)}>
										<EditIcon className="mr-2 size-4" />
										Edit
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => onDeleteClick(icon.id)}
										variant="destructive"
									>
										<TrashIcon className="mr-2 size-4" />
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

function IconsList({
	onEdit,
	onCreate,
	onCreateWithVariants,
}: {
	onEdit: (icon: Icon) => void;
	onCreate: () => void;
	onCreateWithVariants: () => void;
}) {
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
	const [showBulkImport, setShowBulkImport] = useState(false);

	const { data: categories } = useQuery(
		trpc.icons.getCategories.queryOptions()
	);

	const { data, isLoading } = useQuery(
		trpc.icons.listCustom.queryOptions({
			search: search || undefined,
			category: categoryFilter === "all" ? undefined : categoryFilter,
			limit: 50,
		})
	);

	const deleteMutation = useMutation(trpc.icons.delete.mutationOptions());

	const handleDeleteClick = (id: string) => {
		setDeleteConfirmId(id);
	};

	const handleDeleteConfirm = async () => {
		if (!deleteConfirmId) {
			return;
		}

		try {
			await deleteMutation.mutateAsync({ id: deleteConfirmId });
			await queryClient.invalidateQueries({
				queryKey: trpc.icons.listCustom.queryKey(),
			});
			toast.success("Icon deleted");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to delete icon";
			toast.error(message);
		} finally {
			setDeleteConfirmId(null);
		}
	};

	const icons =
		data?.icons.map((icon) => ({ ...icon, keywords: icon.keywords ?? [] })) ??
		[];
	const hasFilters = Boolean(search || categoryFilter !== "all");

	const renderContent = () => {
		if (isLoading) {
			return <LoadingSkeleton />;
		}

		if (icons.length === 0) {
			return <EmptyState hasFilters={hasFilters} />;
		}

		return (
			<IconsTable
				icons={icons}
				onDeleteClick={handleDeleteClick}
				onEdit={onEdit}
			/>
		);
	};

	return (
		<div className="space-y-6">
			{showBulkImport && (
				<BulkImportModal
					onClose={() => setShowBulkImport(false)}
					onSuccess={() => setShowBulkImport(false)}
				/>
			)}

			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold font-display text-2xl tracking-tight">
						daIcons
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Manage custom icons for the icon library.
					</p>
				</div>
				<div className="flex gap-2">
					<Button onClick={() => setShowBulkImport(true)} variant="outline">
						<UploadIcon className="mr-2 size-4" />
						Bulk Import
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger render={<Button />}>
							<PlusIcon className="mr-2 size-4" />
							New Icon
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={onCreate}>
								<PlusIcon className="mr-2 size-4" />
								Single Icon
							</DropdownMenuItem>
							<DropdownMenuItem onClick={onCreateWithVariants}>
								<PlusIcon className="mr-2 size-4" />
								Icon with Variants
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Search and Filters */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<CardTitle className="text-sm">
							Custom Icons ({icons.length})
						</CardTitle>
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
							<div className="relative w-full sm:w-64">
								<SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									className="pl-8"
									onChange={(e) => setSearch(e.target.value)}
									placeholder="Search icons..."
									value={search}
								/>
							</div>
							<Select
								onValueChange={(value) => value && setCategoryFilter(value)}
								value={categoryFilter}
							>
								<SelectTrigger className="w-full sm:w-40">
									<FilterIcon className="mr-2 size-4" />
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Categories</SelectItem>
									{categories?.map((cat) => (
										<SelectItem key={cat} value={cat}>
											{cat}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{deleteConfirmId && (
						<DeleteConfirmBanner
							isPending={deleteMutation.isPending}
							onCancel={() => setDeleteConfirmId(null)}
							onConfirm={handleDeleteConfirm}
						/>
					)}
					{renderContent()}
				</CardContent>
			</Card>
		</div>
	);
}

export default function DaIconsPage() {
	const [mode, setMode] = useState<
		"list" | "create" | "edit" | "create-variants"
	>("list");
	const [editingIcon, setEditingIcon] = useState<Icon | null>(null);

	const handleEdit = useCallback((icon: Icon) => {
		setEditingIcon(icon);
		setMode("edit");
	}, []);

	const handleCreate = useCallback(() => {
		setEditingIcon(null);
		setMode("create");
	}, []);

	const handleCreateWithVariants = useCallback(() => {
		setEditingIcon(null);
		setMode("create-variants");
	}, []);

	const handleCancel = useCallback(() => {
		setEditingIcon(null);
		setMode("list");
	}, []);

	const handleSuccess = useCallback(() => {
		setEditingIcon(null);
		setMode("list");
	}, []);

	if (mode === "create" || mode === "edit") {
		return (
			<IconEditor
				icon={editingIcon}
				onCancel={handleCancel}
				onSuccess={handleSuccess}
			/>
		);
	}

	if (mode === "create-variants") {
		return (
			<MultiVariantIconEditor
				onCancel={handleCancel}
				onSuccess={handleSuccess}
			/>
		);
	}

	return (
		<IconsList
			onCreate={handleCreate}
			onCreateWithVariants={handleCreateWithVariants}
			onEdit={handleEdit}
		/>
	);
}
