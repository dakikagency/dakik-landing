"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowLeftIcon,
	CodeIcon,
	EditIcon,
	FilterIcon,
	Loader2Icon,
	MoreHorizontalIcon,
	PlusIcon,
	SearchIcon,
	TrashIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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

interface ComponentDoc {
	id: string;
	name: string;
	slug: string;
	category: string;
	description: string | null;
	props: unknown;
	code: string;
	preview: string | null;
	published: boolean;
	createdAt: Date | string;
	updatedAt: Date | string;
}

const CATEGORY_OPTIONS = [
	"Buttons",
	"Forms",
	"Cards",
	"Navigation",
	"Layout",
	"Data Display",
	"Feedback",
	"Overlays",
] as const;

const STATUS_OPTIONS = [
	{ value: "all", label: "All Components" },
	{ value: "published", label: "Published" },
	{ value: "draft", label: "Drafts" },
] as const;

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];

function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

function ComponentEditor({
	component,
	onCancel,
	onSuccess,
}: {
	component?: ComponentDoc | null;
	onCancel: () => void;
	onSuccess: () => void;
}) {
	const queryClient = useQueryClient();
	const isEditing = Boolean(component);

	const [name, setName] = useState(component?.name ?? "");
	const [slug, setSlug] = useState(component?.slug ?? "");
	const [category, setCategory] = useState<string>(
		component?.category ?? "Buttons"
	);
	const [description, setDescription] = useState(component?.description ?? "");
	const [propsJson, setPropsJson] = useState(
		component?.props ? JSON.stringify(component.props, null, 2) : "[]"
	);
	const [code, setCode] = useState(component?.code ?? "");
	const [preview, setPreview] = useState(component?.preview ?? "");
	const [published, setPublished] = useState(component?.published ?? true);
	const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
	const [propsError, setPropsError] = useState<string | null>(null);

	const createMutation = useMutation(trpc.components.create.mutationOptions());
	const updateMutation = useMutation(trpc.components.update.mutationOptions());

	useEffect(() => {
		if (!(slugManuallyEdited || isEditing)) {
			setSlug(generateSlug(name));
		}
	}, [name, slugManuallyEdited, isEditing]);

	const handleSlugChange = (value: string) => {
		setSlugManuallyEdited(true);
		setSlug(generateSlug(value));
	};

	const handlePropsChange = (value: string) => {
		setPropsJson(value);
		try {
			JSON.parse(value);
			setPropsError(null);
		} catch {
			setPropsError("Invalid JSON format");
		}
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
		if (!code.trim()) {
			toast.error("Code is required");
			return false;
		}
		if (propsError) {
			toast.error("Props JSON is invalid");
			return false;
		}
		return true;
	};

	const handleSave = async () => {
		if (!validateForm()) {
			return;
		}

		let parsedProps: unknown = [];
		try {
			parsedProps = JSON.parse(propsJson);
		} catch {
			toast.error("Invalid props JSON");
			return;
		}

		const componentData = {
			name: name.trim(),
			slug: slug.trim(),
			category: category as (typeof CATEGORY_OPTIONS)[number],
			description: description.trim() || undefined,
			props: parsedProps,
			code: code.trim(),
			preview: preview.trim() || undefined,
			published,
		};

		try {
			if (isEditing && component) {
				await updateMutation.mutateAsync({
					id: component.id,
					...componentData,
					description: componentData.description ?? null,
					preview: componentData.preview ?? null,
				});
				toast.success("Component updated");
			} else {
				await createMutation.mutateAsync(componentData);
				toast.success("Component created");
			}

			await queryClient.invalidateQueries({
				queryKey: trpc.components.adminList.queryKey(),
			});
			onSuccess();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to save component";
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
							{isEditing ? "Edit Component" : "New Component"}
						</h1>
						<p className="mt-1 text-muted-foreground text-sm">
							{isEditing
								? "Update the component documentation."
								: "Add a new component to the library."}
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
							<CardTitle className="text-sm">Component Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="name">Name</Label>
									<Input
										id="name"
										onChange={(e) => setName(e.target.value)}
										placeholder="Button"
										value={name}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="slug">Slug</Label>
									<div className="flex items-center gap-2">
										<span className="text-muted-foreground text-xs">
											/dacomps/
										</span>
										<Input
											id="slug"
											onChange={(e) => handleSlugChange(e.target.value)}
											placeholder="button"
											value={slug}
										/>
									</div>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="category">Category</Label>
								<Select
									onValueChange={(value) => value && setCategory(value)}
									value={category}
								>
									<SelectTrigger>
										<SelectValue>
											{(value: string | null) => value ?? "Select a category"}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										{CATEGORY_OPTIONS.map((cat) => (
											<SelectItem key={cat} value={cat}>
												{cat}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<textarea
									className={cn(
										"min-h-20 w-full resize-none border bg-transparent px-3 py-2 text-sm outline-none transition-colors",
										"placeholder:text-muted-foreground",
										"focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
										"disabled:cursor-not-allowed disabled:opacity-50"
									)}
									id="description"
									onChange={(e) => setDescription(e.target.value)}
									placeholder="A brief description of the component..."
									value={description}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-sm">
								<CodeIcon className="size-4" />
								Props Documentation (JSON)
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<textarea
								className={cn(
									"min-h-48 w-full resize-y border bg-transparent px-3 py-2 font-mono text-sm outline-none transition-colors",
									"placeholder:text-muted-foreground",
									"focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
									"disabled:cursor-not-allowed disabled:opacity-50",
									propsError && "border-destructive"
								)}
								onChange={(e) => handlePropsChange(e.target.value)}
								placeholder='[{"name": "variant", "type": "string", "default": "default", "description": "The style variant"}]'
								value={propsJson}
							/>
							{propsError ? (
								<p className="text-destructive text-xs">{propsError}</p>
							) : (
								<p className="text-muted-foreground text-xs">
									Array of prop definitions with name, type, default, and
									description fields.
								</p>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-sm">
								<CodeIcon className="size-4" />
								Code Example
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<textarea
								className={cn(
									"min-h-64 w-full resize-y border bg-transparent px-3 py-2 font-mono text-sm outline-none transition-colors",
									"placeholder:text-muted-foreground",
									"focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
									"disabled:cursor-not-allowed disabled:opacity-50"
								)}
								onChange={(e) => setCode(e.target.value)}
								placeholder="import { Button } from '@/components/ui/button';&#10;&#10;export function Example() {&#10;  return <Button>Click me</Button>;&#10;}"
								value={code}
							/>
							<p className="text-muted-foreground text-xs">
								The code example that demonstrates how to use the component.
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-sm">Preview HTML (Optional)</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<textarea
								className={cn(
									"min-h-32 w-full resize-y border bg-transparent px-3 py-2 font-mono text-sm outline-none transition-colors",
									"placeholder:text-muted-foreground",
									"focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
									"disabled:cursor-not-allowed disabled:opacity-50"
								)}
								onChange={(e) => setPreview(e.target.value)}
								placeholder="<div>Preview HTML here</div>"
								value={preview}
							/>
							<p className="text-muted-foreground text-xs">
								Optional static HTML for preview rendering.
							</p>
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
									? "This component is visible on the public daComps page."
									: "This component is hidden from the public."}
							</p>
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
						<Skeleton className="h-4 w-48" />
						<Skeleton className="h-3 w-24" />
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
					? "No components found matching your criteria."
					: "No components yet. Create your first component!"}
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
			<p className="text-sm">Are you sure you want to delete this component?</p>
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

function ComponentsTable({
	components,
	onEdit,
	onTogglePublish,
	onDeleteClick,
}: {
	components: ComponentDoc[];
	onEdit: (component: ComponentDoc) => void;
	onTogglePublish: (component: ComponentDoc) => void;
	onDeleteClick: (id: string) => void;
}) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Category</TableHead>
					<TableHead>Status</TableHead>
					<TableHead className="hidden lg:table-cell">Updated</TableHead>
					<TableHead className="w-12">
						<span className="sr-only">Actions</span>
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{components.map((component) => (
					<TableRow key={component.id}>
						<TableCell>
							<div className="space-y-1">
								<span className="font-medium">{component.name}</span>
								<p className="text-muted-foreground text-xs">
									/dacomps/{component.slug}
								</p>
							</div>
						</TableCell>
						<TableCell>
							<Badge variant="outline">{component.category}</Badge>
						</TableCell>
						<TableCell>
							<Badge variant={component.published ? "success" : "secondary"}>
								{component.published ? "Published" : "Draft"}
							</Badge>
						</TableCell>
						<TableCell className="hidden text-muted-foreground lg:table-cell">
							{new Date(component.updatedAt).toLocaleDateString()}
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
									<DropdownMenuItem onClick={() => onEdit(component)}>
										<EditIcon className="mr-2 size-4" />
										Edit
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => onTogglePublish(component)}>
										{component.published ? "Unpublish" : "Publish"}
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => onDeleteClick(component.id)}
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

function ComponentsList({
	onEdit,
	onCreate,
}: {
	onEdit: (component: ComponentDoc) => void;
	onCreate: () => void;
}) {
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"all" | "published" | "draft"
	>("all");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");
	const [page, setPage] = useState(1);
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

	const { data, isLoading } = useQuery(
		trpc.components.adminList.queryOptions({
			page,
			limit: 20,
			search: search || undefined,
			status: statusFilter,
			category: categoryFilter === "all" ? undefined : categoryFilter,
		})
	);

	const deleteMutation = useMutation(trpc.components.delete.mutationOptions());
	const updateMutation = useMutation(trpc.components.update.mutationOptions());

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
				queryKey: trpc.components.adminList.queryKey(),
			});
			toast.success("Component deleted");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to delete component";
			toast.error(message);
		} finally {
			setDeleteConfirmId(null);
		}
	};

	const handleTogglePublish = async (component: ComponentDoc) => {
		try {
			await updateMutation.mutateAsync({
				id: component.id,
				published: !component.published,
			});
			await queryClient.invalidateQueries({
				queryKey: trpc.components.adminList.queryKey(),
			});
			toast.success(
				component.published ? "Component unpublished" : "Component published"
			);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to update component";
			toast.error(message);
		}
	};

	const components = data?.components ?? [];
	const pagination = data?.pagination;
	const hasFilters = Boolean(
		search || statusFilter !== "all" || categoryFilter !== "all"
	);

	const renderContent = () => {
		if (isLoading) {
			return <LoadingSkeleton />;
		}

		if (components.length === 0) {
			return <EmptyState hasFilters={hasFilters} />;
		}

		return (
			<ComponentsTable
				components={components}
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
						daComps
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Manage component documentation for the public library.
					</p>
				</div>
				<Button onClick={onCreate}>
					<PlusIcon className="mr-2 size-4" />
					New Component
				</Button>
			</div>

			{/* Search and Filters */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<CardTitle className="text-sm">
							All Components ({pagination?.total ?? 0})
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
									placeholder="Search components..."
									value={search}
								/>
							</div>
							<Select
								onValueChange={(value) => {
									if (value) {
										setCategoryFilter(value);
										setPage(1);
									}
								}}
								value={categoryFilter}
							>
								<SelectTrigger className="w-full sm:w-36">
									<SelectValue>
										{(value: string | null) => value ?? "Category"}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Categories</SelectItem>
									{CATEGORY_OPTIONS.map((cat) => (
										<SelectItem key={cat} value={cat}>
											{cat}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								onValueChange={(value) => {
									if (value) {
										setStatusFilter(value as "all" | "published" | "draft");
										setPage(1);
									}
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

export default function DaCompsAdminPage() {
	const [mode, setMode] = useState<"list" | "create" | "edit">("list");
	const [editingComponent, setEditingComponent] = useState<ComponentDoc | null>(
		null
	);

	const handleEdit = useCallback((component: ComponentDoc) => {
		setEditingComponent(component);
		setMode("edit");
	}, []);

	const handleCreate = useCallback(() => {
		setEditingComponent(null);
		setMode("create");
	}, []);

	const handleCancel = useCallback(() => {
		setEditingComponent(null);
		setMode("list");
	}, []);

	const handleSuccess = useCallback(() => {
		setEditingComponent(null);
		setMode("list");
	}, []);

	if (mode === "create" || mode === "edit") {
		return (
			<ComponentEditor
				component={editingComponent}
				onCancel={handleCancel}
				onSuccess={handleSuccess}
			/>
		);
	}

	return <ComponentsList onCreate={handleCreate} onEdit={handleEdit} />;
}
