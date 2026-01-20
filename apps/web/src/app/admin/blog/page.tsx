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
} from "lucide-react";
import Image from "next/image";
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

interface BlogPost {
	id: string;
	slug: string;
	title: string;
	excerpt: string | null;
	content: string;
	coverImage: string | null;
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
	_count: { posts: number };
}

const STATUS_OPTIONS = [
	{ value: "all", label: "All Posts" },
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

function BlogPostEditor({
	post,
	onCancel,
	onSuccess,
}: {
	post?: BlogPost | null;
	onCancel: () => void;
	onSuccess: () => void;
}) {
	const queryClient = useQueryClient();
	const isEditing = Boolean(post);

	const [title, setTitle] = useState(post?.title ?? "");
	const [slug, setSlug] = useState(post?.slug ?? "");
	const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
	const [content, setContent] = useState(post?.content ?? "");
	const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
	const [published, setPublished] = useState(post?.published ?? false);
	const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
		post?.tags.map((t) => t.id) ?? []
	);
	const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
	const [newTagName, setNewTagName] = useState("");

	const { data: tags } = useQuery(trpc.blog.getAllTags.queryOptions());

	const createMutation = useMutation(trpc.blog.create.mutationOptions());
	const updateMutation = useMutation(trpc.blog.update.mutationOptions());
	const createTagMutation = useMutation(trpc.blog.createTag.mutationOptions());

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
				queryKey: trpc.blog.getAllTags.queryKey(),
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

		const postData = {
			title: title.trim(),
			slug: slug.trim(),
			excerpt: excerpt.trim(),
			content: content.trim(),
			coverImage: coverImage.trim(),
			published: shouldPublish,
			tagIds: selectedTagIds,
		};

		try {
			if (isEditing && post) {
				await updateMutation.mutateAsync({ id: post.id, ...postData });
				toast.success(shouldPublish ? "Post published" : "Post saved");
			} else {
				await createMutation.mutateAsync(postData);
				toast.success(shouldPublish ? "Post published" : "Draft saved");
			}

			await queryClient.invalidateQueries({
				queryKey: trpc.blog.adminList.queryKey(),
			});
			onSuccess();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to save post";
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
							{isEditing ? "Edit Post" : "New Post"}
						</h1>
						<p className="mt-1 text-muted-foreground text-sm">
							{isEditing
								? "Update the blog post details below."
								: "Create a new blog post."}
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
							<CardTitle className="text-sm">Post Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="title">Title</Label>
								<Input
									id="title"
									onChange={(e) => setTitle(e.target.value)}
									placeholder="Enter post title..."
									value={title}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="slug">Slug</Label>
								<div className="flex items-center gap-2">
									<span className="text-muted-foreground text-xs">/blog/</span>
									<Input
										id="slug"
										onChange={(e) => handleSlugChange(e.target.value)}
										placeholder="post-url-slug"
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
									placeholder="A brief summary of the post..."
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
									placeholder="Write your post content in Markdown..."
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
							<CardTitle className="text-sm">Tags</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex flex-wrap gap-2">
								{tags?.map((tag: Tag) => (
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
									? "This post is visible to the public."
									: "This post is saved as a draft."}
							</p>
							{post?.publishedAt && (
								<p className="mt-2 text-muted-foreground text-xs">
									Published on:{" "}
									{new Date(post.publishedAt).toLocaleDateString()}
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
					? "No posts found matching your criteria."
					: "No blog posts yet. Create your first post!"}
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
			<p className="text-sm">Are you sure you want to delete this post?</p>
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

function PostsTable({
	posts,
	onEdit,
	onTogglePublish,
	onDeleteClick,
}: {
	posts: BlogPost[];
	onEdit: (post: BlogPost) => void;
	onTogglePublish: (post: BlogPost) => void;
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
				{posts.map((post: BlogPost) => (
					<TableRow key={post.id}>
						<TableCell>
							<div className="space-y-1">
								<span className="font-medium">{post.title}</span>
								<p className="text-muted-foreground text-xs">
									/blog/{post.slug}
								</p>
							</div>
						</TableCell>
						<TableCell className="hidden md:table-cell">
							<div className="flex flex-wrap gap-1">
								{post.tags.slice(0, 3).map((tag) => (
									<Badge key={tag.id} variant="outline">
										{tag.name}
									</Badge>
								))}
								{post.tags.length > 3 && (
									<Badge variant="secondary">+{post.tags.length - 3}</Badge>
								)}
							</div>
						</TableCell>
						<TableCell>
							<Badge variant={post.published ? "success" : "secondary"}>
								{post.published ? "Published" : "Draft"}
							</Badge>
						</TableCell>
						<TableCell className="hidden text-muted-foreground lg:table-cell">
							{post.publishedAt
								? new Date(post.publishedAt).toLocaleDateString()
								: new Date(post.createdAt).toLocaleDateString()}
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
									<DropdownMenuItem onClick={() => onEdit(post)}>
										<EditIcon className="mr-2 size-4" />
										Edit
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => onTogglePublish(post)}>
										{post.published ? "Unpublish" : "Publish"}
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => onDeleteClick(post.id)}
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

function BlogPostsList({
	onEdit,
	onCreate,
}: {
	onEdit: (post: BlogPost) => void;
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
		trpc.blog.adminList.queryOptions({
			page,
			limit: 20,
			search: search || undefined,
			status: statusFilter,
		})
	);

	const deleteMutation = useMutation(trpc.blog.delete.mutationOptions());
	const updateMutation = useMutation(trpc.blog.update.mutationOptions());

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
				queryKey: trpc.blog.adminList.queryKey(),
			});
			toast.success("Post deleted");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to delete post";
			toast.error(message);
		} finally {
			setDeleteConfirmId(null);
		}
	};

	const handleTogglePublish = async (post: BlogPost) => {
		try {
			await updateMutation.mutateAsync({
				id: post.id,
				published: !post.published,
			});
			await queryClient.invalidateQueries({
				queryKey: trpc.blog.adminList.queryKey(),
			});
			toast.success(post.published ? "Post unpublished" : "Post published");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to update post";
			toast.error(message);
		}
	};

	const posts = data?.posts ?? [];
	const pagination = data?.pagination;
	const hasFilters = Boolean(search || statusFilter !== "all");

	const renderContent = () => {
		if (isLoading) {
			return <LoadingSkeleton />;
		}
		if (posts.length === 0) {
			return <EmptyState hasFilters={hasFilters} />;
		}
		return (
			<PostsTable
				onDeleteClick={handleDeleteClick}
				onEdit={onEdit}
				onTogglePublish={handleTogglePublish}
				posts={posts}
			/>
		);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold font-display text-2xl tracking-tight">
						Blog
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Manage blog posts and articles.
					</p>
				</div>
				<Button onClick={onCreate}>
					<PlusIcon className="mr-2 size-4" />
					New Post
				</Button>
			</div>

			{/* Search and Filters */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<CardTitle className="text-sm">
							All Posts ({pagination?.total ?? 0})
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
									placeholder="Search posts..."
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

export default function BlogPage() {
	const [mode, setMode] = useState<"list" | "create" | "edit">("list");
	const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

	const handleEdit = useCallback((post: BlogPost) => {
		setEditingPost(post);
		setMode("edit");
	}, []);

	const handleCreate = useCallback(() => {
		setEditingPost(null);
		setMode("create");
	}, []);

	const handleCancel = useCallback(() => {
		setEditingPost(null);
		setMode("list");
	}, []);

	const handleSuccess = useCallback(() => {
		setEditingPost(null);
		setMode("list");
	}, []);

	if (mode === "create" || mode === "edit") {
		return (
			<BlogPostEditor
				onCancel={handleCancel}
				onSuccess={handleSuccess}
				post={editingPost}
			/>
		);
	}

	return <BlogPostsList onCreate={handleCreate} onEdit={handleEdit} />;
}
