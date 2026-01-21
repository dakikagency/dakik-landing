"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowLeftIcon,
	EditIcon,
	FileIcon,
	FilterIcon,
	Loader2Icon,
	MoreHorizontalIcon,
	PlusIcon,
	SearchIcon,
	TrashIcon,
	UploadIcon,
	XIcon,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

interface Automation {
	id: string;
	slug: string;
	title: string;
	excerpt: string | null;
	content: string;
	coverImage: string | null;
	fileUrl: string | null;
	published: boolean;
	publishedAt: Date | string | null;
	createdAt: Date | string;
	updatedAt: Date | string;
	tags: { id: string; name: string; slug: string }[];
}

interface Tag {
	id: string;
	name: string;
	slug: string;
	_count: { posts: number; automations: number };
}

const STATUS_OPTIONS = [
	{ value: "all", label: "All Automations" },
	{ value: "published", label: "Published" },
	{ value: "draft", label: "Drafts" },
] as const;

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];

function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

function AutomationEditor({
	automation,
	onCancel,
	onSuccess,
}: {
	automation?: Automation | null;
	onCancel: () => void;
	onSuccess: () => void;
}) {
	const queryClient = useQueryClient();
	const isEditing = Boolean(automation);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [title, setTitle] = useState(automation?.title ?? "");
	const [slug, setSlug] = useState(automation?.slug ?? "");
	const [excerpt, setExcerpt] = useState(automation?.excerpt ?? "");
	const [content, setContent] = useState(automation?.content ?? "");
	const [coverImage, setCoverImage] = useState(automation?.coverImage ?? "");
	const [fileUrl, setFileUrl] = useState(automation?.fileUrl ?? "");
	const [published, setPublished] = useState(automation?.published ?? false);
	const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
		automation?.tags.map((t) => t.id) ?? []
	);
	const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
	const [newTagName, setNewTagName] = useState("");
	const [uploadingFile, setUploadingFile] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const { data: allTags } = useQuery(trpc.automation.getAllTags.queryOptions());

	const createMutation = useMutation(trpc.automation.create.mutationOptions());
	const updateMutation = useMutation(trpc.automation.update.mutationOptions());
	const createTagMutation = useMutation(
		trpc.automation.createTag.mutationOptions()
	);
	// TODO: Fix upload mutation - the uploads router doesn't have an 'upload' method
	// const uploadMutation = useMutation(trpc.uploads.upload.mutationOptions());

	useEffect(() => {
		if (!(slugManuallyEdited || isEditing)) {
			setSlug(generateSlug(title));
		}
	}, [title, slugManuallyEdited, isEditing]);

	const handleSlugChange = (value: string) => {
		setSlugManuallyEdited(true);
		setSlug(generateSlug(value));
	};

	const handleTagToggle = (tagId: string) => {
		setSelectedTagIds((prev) =>
			prev.includes(tagId)
				? prev.filter((id) => id !== tagId)
				: [...prev, tagId]
		);
	};

	const handleCreateTag = async () => {
		if (!newTagName.trim()) {
			return;
		}

		try {
			const newTag = await createTagMutation.mutateAsync({
				name: newTagName.trim(),
				slug: generateSlug(newTagName.trim()),
			});

			await queryClient.invalidateQueries({
				queryKey: trpc.automation.getAllTags.queryKey(),
			});
			setSelectedTagIds((prev) => [...prev, newTag.id]);
			setNewTagName("");
			toast.success("Tag created");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to create tag";
			toast.error(message);
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setSelectedFile(file);
		}
	};

	const handleFileUpload = async () => {
		if (!selectedFile) {
			return;
		}

		setUploadingFile(true);
		try {
			// TODO: Implement file upload using getSignature and saveAsset mutations
			toast.error("File upload is not yet implemented");
			setUploadingFile(false);
			/*
			const reader = new FileReader();
			reader.onloadend = async () => {
				try {
					const base64 = reader.result as string;
					const result = await uploadMutation.mutateAsync({
						file: base64,
						folder: "automations",
					});
					setFileUrl(result.url);
					setSelectedFile(null);
					toast.success("File uploaded successfully");
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to upload file";
					toast.error(message);
				} finally {
					setUploadingFile(false);
				}
			};
			reader.readAsDataURL(selectedFile);
			*/
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to upload file";
			toast.error(message);
			setUploadingFile(false);
		}
	};

	const handleRemoveFile = () => {
		setFileUrl("");
		setSelectedFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const validateForm = (): boolean => {
		if (!title.trim()) {
			toast.error("Title is required");
			return false;
		}
		if (!slug.trim()) {
			toast.error("Slug is required");
			return false;
		}
		if (!content.trim()) {
			toast.error("Content is required");
			return false;
		}
		return true;
	};

	const handleSave = async (shouldPublish: boolean) => {
		if (!validateForm()) {
			return;
		}

		const automationData = {
			title: title.trim(),
			slug: slug.trim(),
			excerpt: excerpt.trim(),
			content: content.trim(),
			coverImage: coverImage.trim(),
			fileUrl: fileUrl.trim(),
			published: shouldPublish,
			tagIds: selectedTagIds,
		};

		try {
			if (isEditing && automation) {
				await updateMutation.mutateAsync({
					id: automation.id,
					...automationData,
				});
				toast.success(shouldPublish ? "Automation published" : "Automation saved");
			} else {
				await createMutation.mutateAsync(automationData);
				toast.success(shouldPublish ? "Automation published" : "Draft saved");
			}

			await queryClient.invalidateQueries({
				queryKey: trpc.automation.adminList.queryKey(),
			});
			onSuccess();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to save automation";
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
							{isEditing ? "Edit Automation" : "New Automation"}
						</h1>
						<p className="mt-1 text-muted-foreground text-sm">
							{isEditing
								? "Update the automation details below."
								: "Create a new automation workflow."}
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					<Button
						disabled={isSaving}
						onClick={() => handleSave(false)}
						variant="outline"
					>
						{isSaving ? (
							<Loader2Icon className="mr-2 size-4 animate-spin" />
						) : null}
						Save Draft
					</Button>
					<Button disabled={isSaving} onClick={() => handleSave(true)}>
						{isSaving ? (
							<Loader2Icon className="mr-2 size-4 animate-spin" />
						) : null}
						{published ? "Update" : "Publish"}
					</Button>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Main Content */}
				<div className="space-y-6 lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="text-sm">Automation Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="title">Title</Label>
								<Input
									id="title"
									onChange={(e) => setTitle(e.target.value)}
									placeholder="Enter automation title..."
									value={title}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="slug">Slug</Label>
								<div className="flex items-center gap-2">
									<span className="text-muted-foreground text-xs">
										/automations/
									</span>
									<Input
										id="slug"
										onChange={(e) => handleSlugChange(e.target.value)}
										placeholder="automation-url-slug"
										value={slug}
									/>
								</div>
								<p className="text-muted-foreground text-xs">
									The URL-friendly version of the title.
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="excerpt">Excerpt</Label>
								<textarea
									className={cn(
										"min-h-20 w-full resize-none border bg-transparent px-3 py-2 text-sm outline-none transition-colors",
										"placeholder:text-muted-foreground",
										"focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
										"disabled:cursor-not-allowed disabled:opacity-50"
									)}
									id="excerpt"
									onChange={(e) => setExcerpt(e.target.value)}
									placeholder="A brief summary..."
									value={excerpt}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="content">Content (Markdown)</Label>
								<textarea
									className={cn(
										"min-h-96 w-full resize-y border bg-transparent px-3 py-2 font-mono text-sm outline-none transition-colors",
										"placeholder:text-muted-foreground",
										"focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
										"disabled:cursor-not-allowed disabled:opacity-50"
									)}
									id="content"
									onChange={(e) => setContent(e.target.value)}
									placeholder="Write your automation content in Markdown..."
									value={content}
								/>
								<p className="text-muted-foreground text-xs">
									Supports Markdown formatting.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-sm">Cover Image</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="coverImage">Image URL</Label>
								<Input
									id="coverImage"
									onChange={(e) => setCoverImage(e.target.value)}
									placeholder="https://example.com/image.jpg"
									value={coverImage}
								/>
							</div>
							{coverImage && (
								<div className="relative aspect-video w-full overflow-hidden border">
									<Image
										alt="Cover preview"
										className="object-cover"
										fill
										sizes="(max-width: 768px) 100vw, 33vw"
										src={coverImage}
										unoptimized
									/>
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm">Automation File</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{fileUrl ? (
								<div className="flex items-center justify-between border p-3">
									<div className="flex items-center gap-2">
										<FileIcon className="size-4 text-gray-500" />
										<span className="text-sm">File attached</span>
									</div>
									<Button
										onClick={handleRemoveFile}
										size="icon-sm"
										variant="ghost"
									>
										<XIcon className="size-4" />
									</Button>
								</div>
							) : (
								<div className="space-y-2">
									<input
										accept="*/*"
										className="hidden"
										onChange={handleFileSelect}
										ref={fileInputRef}
										type="file"
									/>
									{selectedFile ? (
										<div className="space-y-2">
											<div className="flex items-center gap-2 border p-3">
												<FileIcon className="size-4 text-gray-500" />
												<span className="flex-1 truncate text-sm">
													{selectedFile.name}
												</span>
											</div>
											<Button
												className="w-full"
												disabled={uploadingFile}
												onClick={handleFileUpload}
												size="sm"
											>
												{uploadingFile ? (
													<Loader2Icon className="mr-2 size-4 animate-spin" />
												) : (
													<UploadIcon className="mr-2 size-4" />
												)}
												Upload File
											</Button>
										</div>
									) : (
										<Button
											className="w-full"
											onClick={() => fileInputRef.current?.click()}
											size="sm"
											variant="outline"
										>
											<FileIcon className="mr-2 size-4" />
											Select File
										</Button>
									)}
								</div>
							)}
							<p className="text-muted-foreground text-xs">
								Optional file attachment for download (workflow, template, etc.)
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm">Tags</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex flex-wrap gap-2">
								{allTags?.map((tag) => (
									<button
										className={cn(
											"border px-2 py-1 text-xs transition-colors",
											selectedTagIds.includes(tag.id)
												? "border-primary bg-primary text-primary-foreground"
												: "border-input hover:border-primary/50"
										)}
										key={tag.id}
										onClick={() => handleTagToggle(tag.id)}
										type="button"
									>
										{tag.name}
									</button>
								))}
							</div>
							<div className="flex gap-2">
								<Input
									onChange={(e) => setNewTagName(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleCreateTag();
										}
									}}
									placeholder="New tag name"
									value={newTagName}
								/>
								<Button
									disabled={createTagMutation.isPending || !newTagName.trim()}
									onClick={handleCreateTag}
									size="sm"
									variant="outline"
								>
									Add
								</Button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm">Publishing</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center gap-2">
								<Checkbox
									checked={published}
									id="published"
									onCheckedChange={(checked) => setPublished(checked === true)}
								/>
								<Label className="cursor-pointer text-sm" htmlFor="published">
									Published
								</Label>
							</div>
							<p className="mt-2 text-muted-foreground text-xs">
								{published
									? "This automation is visible to the public."
									: "This automation is saved as a draft."}
							</p>
							{automation?.publishedAt && (
								<p className="mt-2 text-muted-foreground text-xs">
									Published on:{" "}
									{new Date(automation.publishedAt).toLocaleDateString()}
								</p>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

function LoadingSkeleton() {
	return (
		<div className="space-y-3">
			{SKELETON_KEYS.map((key) => (
				<div className="flex items-center justify-between py-3" key={key}>
					<div className="space-y-2">
						<Skeleton className="h-4 w-64" />
						<Skeleton className="h-3 w-32" />
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
					? "No automations found matching your criteria."
					: "No automations yet. Create your first automation!"}
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
			<p className="text-sm">
				Are you sure you want to delete this automation?
			</p>
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

function AutomationsTable({
	automations,
	onEdit,
	onTogglePublish,
	onDeleteClick,
}: {
	automations: Automation[];
	onEdit: (automation: Automation) => void;
	onTogglePublish: (automation: Automation) => void;
	onDeleteClick: (id: string) => void;
}) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Title</TableHead>
					<TableHead className="hidden md:table-cell">Tags</TableHead>
					<TableHead>Status</TableHead>
					<TableHead className="hidden lg:table-cell">Date</TableHead>
					<TableHead className="w-12">
						<span className="sr-only">Actions</span>
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{automations.map((automation: Automation) => (
					<TableRow key={automation.id}>
						<TableCell>
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<span className="font-medium">{automation.title}</span>
									{automation.fileUrl && (
										<FileIcon className="size-3 text-gray-400" />
									)}
								</div>
								<p className="text-muted-foreground text-xs">
									/automations/{automation.slug}
								</p>
							</div>
						</TableCell>
						<TableCell className="hidden md:table-cell">
							<div className="flex flex-wrap gap-1">
								{automation.tags.slice(0, 3).map((tag) => (
									<Badge key={tag.id} variant="outline">
										{tag.name}
									</Badge>
								))}
								{automation.tags.length > 3 && (
									<Badge variant="secondary">+{automation.tags.length - 3}</Badge>
								)}
							</div>
						</TableCell>
						<TableCell>
							<Badge variant={automation.published ? "success" : "secondary"}>
								{automation.published ? "Published" : "Draft"}
							</Badge>
						</TableCell>
						<TableCell className="hidden text-muted-foreground lg:table-cell">
							{automation.publishedAt
								? new Date(automation.publishedAt).toLocaleDateString()
								: new Date(automation.createdAt).toLocaleDateString()}
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
									<DropdownMenuItem onClick={() => onEdit(automation)}>
										<EditIcon className="mr-2 size-4" />
										Edit
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => onTogglePublish(automation)}>
										{automation.published ? "Unpublish" : "Publish"}
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => onDeleteClick(automation.id)}
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

function AutomationsList({
	onEdit,
	onCreate,
}: {
	onEdit: (automation: Automation) => void;
	onCreate: () => void;
}) {
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"all" | "published" | "draft"
	>("all");
	const [page, setPage] = useState(1);
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

	const { data, isLoading } = useQuery(
		trpc.automation.adminList.queryOptions({
			page,
			limit: 20,
			search: search || undefined,
			status: statusFilter,
		})
	);

	const deleteMutation = useMutation(trpc.automation.delete.mutationOptions());
	const updateMutation = useMutation(trpc.automation.update.mutationOptions());

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
				queryKey: trpc.automation.adminList.queryKey(),
			});
			toast.success("Automation deleted");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to delete automation";
			toast.error(message);
		} finally {
			setDeleteConfirmId(null);
		}
	};

	const handleTogglePublish = async (automation: Automation) => {
		try {
			await updateMutation.mutateAsync({
				id: automation.id,
				published: !automation.published,
			});
			await queryClient.invalidateQueries({
				queryKey: trpc.automation.adminList.queryKey(),
			});
			toast.success(
				automation.published ? "Automation unpublished" : "Automation published"
			);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to update automation";
			toast.error(message);
		}
	};

	const automations = data?.automations ?? [];
	const pagination = data?.pagination;
	const hasFilters = Boolean(search || statusFilter !== "all");

	const renderContent = () => {
		if (isLoading) {
			return <LoadingSkeleton />;
		}
		if (automations.length === 0) {
			return <EmptyState hasFilters={hasFilters} />;
		}
		return (
			<AutomationsTable
				automations={automations}
				onDeleteClick={handleDeleteClick}
				onEdit={onEdit}
				onTogglePublish={handleTogglePublish}
			/>
		);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold font-display text-2xl tracking-tight">
						Automations
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Manage automation workflows and templates.
					</p>
				</div>
				<Button onClick={onCreate}>
					<PlusIcon className="mr-2 size-4" />
					New Automation
				</Button>
			</div>

			{/* Search and Filters */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<CardTitle className="text-sm">
							All Automations ({pagination?.total ?? 0})
						</CardTitle>
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
							<div className="relative w-full sm:w-64">
								<SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									className="pl-8"
									onChange={(e) => {
										setSearch(e.target.value);
										setPage(1);
									}}
									placeholder="Search automations..."
									value={search}
								/>
							</div>
							<Select
								onValueChange={(value) => {
									setStatusFilter(value as "all" | "published" | "draft");
									setPage(1);
								}}
								value={statusFilter}
							>
								<SelectTrigger className="w-full sm:w-36">
									<FilterIcon className="mr-2 size-4" />
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{STATUS_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
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

					{/* Pagination */}
					{pagination && pagination.totalPages > 1 && (
						<div className="mt-4 flex items-center justify-between">
							<p className="text-muted-foreground text-xs">
								Page {pagination.page} of {pagination.totalPages}
							</p>
							<div className="flex gap-2">
								<Button
									disabled={!pagination.hasPrev}
									onClick={() => setPage((p) => p - 1)}
									size="sm"
									variant="outline"
								>
									Previous
								</Button>
								<Button
									disabled={!pagination.hasNext}
									onClick={() => setPage((p) => p + 1)}
									size="sm"
									variant="outline"
								>
									Next
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export default function AutomationsPage() {
	const [mode, setMode] = useState<"list" | "create" | "edit">("list");
	const [editingAutomation, setEditingAutomation] = useState<Automation | null>(
		null
	);

	const handleEdit = useCallback((automation: Automation) => {
		setEditingAutomation(automation);
		setMode("edit");
	}, []);

	const handleCreate = useCallback(() => {
		setEditingAutomation(null);
		setMode("create");
	}, []);

	const handleCancel = useCallback(() => {
		setEditingAutomation(null);
		setMode("list");
	}, []);

	const handleSuccess = useCallback(() => {
		setEditingAutomation(null);
		setMode("list");
	}, []);

	if (mode === "create" || mode === "edit") {
		return (
			<AutomationEditor
				automation={editingAutomation}
				onCancel={handleCancel}
				onSuccess={handleSuccess}
			/>
		);
	}

	return <AutomationsList onCreate={handleCreate} onEdit={handleEdit} />;
}
