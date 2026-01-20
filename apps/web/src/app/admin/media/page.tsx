"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	CheckIcon,
	ClipboardIcon,
	FolderIcon,
	GridIcon,
	ImageIcon,
	Loader2Icon,
	MoreHorizontalIcon,
	PlusIcon,
	SearchIcon,
	TrashIcon,
	UploadIcon,
	XIcon,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

interface Asset {
	id: string;
	publicId: string;
	url: string;
	secureUrl: string;
	format: string;
	resourceType: string;
	width: number | null;
	height: number | null;
	bytes: number;
	folder: string | null;
	createdAt: Date | string;
}

interface UploadResponse {
	public_id: string;
	url: string;
	secure_url: string;
	format: string;
	resource_type: string;
	width?: number;
	height?: number;
	bytes: number;
	folder?: string;
}

const SKELETON_KEYS = Array.from({ length: 12 }, (_, i) => `sk-${i}`);

function formatBytes(bytes: number): string {
	if (bytes === 0) {
		return "0 B";
	}
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

function LoadingSkeleton() {
	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
			{SKELETON_KEYS.map((key) => (
				<div className="space-y-2" key={key}>
					<Skeleton className="aspect-square w-full" />
					<Skeleton className="h-3 w-3/4" />
					<Skeleton className="h-3 w-1/2" />
				</div>
			))}
		</div>
	);
}

function EmptyState({
	hasFilters,
	onUpload,
}: {
	hasFilters: boolean;
	onUpload: () => void;
}) {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<div className="mb-4 flex size-16 items-center justify-center border">
				<ImageIcon className="size-8 text-muted-foreground" />
			</div>
			<h3 className="font-medium text-sm">
				{hasFilters ? "No assets found" : "No media files yet"}
			</h3>
			<p className="mt-1 max-w-sm text-muted-foreground text-xs">
				{hasFilters
					? "Try adjusting your search or filters to find what you're looking for."
					: "Upload your first image or file to get started with your media library."}
			</p>
			{!hasFilters && (
				<Button className="mt-4" onClick={onUpload}>
					<UploadIcon className="mr-2 size-4" />
					Upload Files
				</Button>
			)}
		</div>
	);
}

function AssetCard({
	asset,
	isSelected,
	onSelect,
	onDelete,
	onCopyUrl,
}: {
	asset: Asset;
	isSelected: boolean;
	onSelect: (id: string, selected: boolean) => void;
	onDelete: (id: string) => void;
	onCopyUrl: (url: string) => void;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		onCopyUrl(asset.secureUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, [asset.secureUrl, onCopyUrl]);

	const isImage = asset.resourceType === "image";

	return (
		<div
			className={cn(
				"group relative flex flex-col overflow-hidden border bg-card transition-colors",
				isSelected && "border-primary ring-1 ring-primary"
			)}
		>
			{/* Selection checkbox */}
			<button
				aria-label={isSelected ? "Deselect asset" : "Select asset"}
				className={cn(
					"absolute top-2 left-2 z-10 flex size-5 items-center justify-center border bg-background/80 backdrop-blur-sm transition-opacity",
					isSelected
						? "border-primary bg-primary text-primary-foreground"
						: "opacity-0 group-hover:opacity-100"
				)}
				onClick={() => onSelect(asset.id, !isSelected)}
				type="button"
			>
				{isSelected && <CheckIcon className="size-3" />}
			</button>

			{/* Thumbnail */}
			<div className="relative aspect-square bg-muted">
				{isImage ? (
					<Image
						alt={asset.publicId}
						className="object-cover"
						fill
						sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
						src={asset.secureUrl}
						unoptimized
					/>
				) : (
					<div className="flex h-full items-center justify-center">
						<FolderIcon className="size-12 text-muted-foreground" />
					</div>
				)}

				{/* Actions overlay */}
				<div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
					<Button onClick={handleCopy} size="icon-sm" variant="secondary">
						{copied ? (
							<CheckIcon className="size-4" />
						) : (
							<ClipboardIcon className="size-4" />
						)}
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger
							render={<Button size="icon-sm" variant="secondary" />}
						>
							<MoreHorizontalIcon className="size-4" />
						</DropdownMenuTrigger>
						<DropdownMenuContent align="center">
							<DropdownMenuItem onClick={handleCopy}>
								<ClipboardIcon className="mr-2 size-4" />
								Copy URL
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => window.open(asset.secureUrl, "_blank")}
							>
								<ImageIcon className="mr-2 size-4" />
								Open Original
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => onDelete(asset.id)}
								variant="destructive"
							>
								<TrashIcon className="mr-2 size-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Info */}
			<div className="flex-1 p-2">
				<p className="truncate font-medium text-xs">
					{asset.publicId.split("/").pop()}
				</p>
				<div className="mt-1 flex items-center gap-2 text-muted-foreground">
					<span className="text-[10px] uppercase">{asset.format}</span>
					<span className="text-[10px]">{formatBytes(asset.bytes)}</span>
					{asset.width && asset.height && (
						<span className="text-[10px]">
							{asset.width}x{asset.height}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}

function UploadDropzone({
	isUploading,
	uploadProgress,
	onUpload,
	onClose,
}: {
	isUploading: boolean;
	uploadProgress: number;
	onUpload: (files: FileList) => void;
	onClose: () => void;
}) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	const handleDragOver = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (!isUploading) {
				setIsDragging(true);
			}
		},
		[isUploading]
	);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);

			if (isUploading) {
				return;
			}

			const { files } = e.dataTransfer;
			if (files.length > 0) {
				onUpload(files);
			}
		},
		[isUploading, onUpload]
	);

	const handleFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const { files } = e.target;
			if (files && files.length > 0) {
				onUpload(files);
			}
		},
		[onUpload]
	);

	return (
		<div className="mb-6">
			<div className="flex items-center justify-between pb-3">
				<h2 className="font-medium text-sm">Upload Files</h2>
				<Button onClick={onClose} size="icon-sm" variant="ghost">
					<XIcon className="size-4" />
				</Button>
			</div>
			{/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Drag-and-drop zone requires event handlers for file upload functionality */}
			<label
				className={cn(
					"relative flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-8 transition-colors",
					isDragging && "border-primary bg-primary/5",
					isUploading && "pointer-events-none cursor-wait opacity-60"
				)}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				<input
					accept="image/*,video/*,.pdf,.doc,.docx"
					className="sr-only"
					disabled={isUploading}
					multiple
					onChange={handleFileSelect}
					ref={fileInputRef}
					type="file"
				/>

				{isUploading ? (
					<div className="flex flex-col items-center gap-4">
						<Loader2Icon className="size-8 animate-spin text-primary" />
						<div className="text-center">
							<p className="font-medium text-sm">Uploading...</p>
							<p className="mt-1 text-muted-foreground text-xs">
								{uploadProgress}% complete
							</p>
						</div>
						<div className="h-1.5 w-48 overflow-hidden bg-muted">
							<div
								className="h-full bg-primary transition-all duration-300"
								style={{ width: `${uploadProgress}%` }}
							/>
						</div>
					</div>
				) : (
					<>
						<UploadIcon className="mb-4 size-8 text-muted-foreground" />
						<p className="font-medium text-sm">
							Drag and drop files here, or{" "}
							<span className="text-primary underline-offset-4 hover:underline">
								browse
							</span>
						</p>
						<p className="mt-2 text-muted-foreground text-xs">
							Supports images, videos, PDFs, and documents
						</p>
					</>
				)}
			</label>
		</div>
	);
}

function DeleteConfirmBanner({
	count,
	onCancel,
	onConfirm,
	isPending,
}: {
	count: number;
	onCancel: () => void;
	onConfirm: () => void;
	isPending: boolean;
}) {
	return (
		<div className="mb-4 flex items-center justify-between border border-destructive/50 bg-destructive/10 p-3">
			<p className="text-sm">
				Delete {count} {count === 1 ? "asset" : "assets"}? This cannot be
				undone.
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

export default function MediaPage() {
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [folder, setFolder] = useState<string>("all");
	const [page, setPage] = useState(1);
	const [showUpload, setShowUpload] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [deleteConfirmIds, setDeleteConfirmIds] = useState<string[]>([]);

	// Fetch assets
	const { data, isLoading } = useQuery(
		trpc.uploads.list.queryOptions({
			page,
			limit: 24,
			search: search || undefined,
			folder: folder === "all" ? undefined : folder,
		})
	);

	// Fetch folders for filter
	const { data: folders } = useQuery(trpc.uploads.getFolders.queryOptions());

	// Mutations
	const getSignatureMutation = useMutation(
		trpc.uploads.getSignature.mutationOptions()
	);
	const saveAssetMutation = useMutation(
		trpc.uploads.saveAsset.mutationOptions()
	);
	const deleteMutation = useMutation(trpc.uploads.delete.mutationOptions());
	const deleteManyMutation = useMutation(
		trpc.uploads.deleteMany.mutationOptions()
	);

	const handleUpload = useCallback(
		async (files: FileList) => {
			setIsUploading(true);
			setUploadProgress(0);

			const fileArray = Array.from(files);
			let completed = 0;

			try {
				for (const file of fileArray) {
					// Get signature for upload
					const signatureData = await getSignatureMutation.mutateAsync({
						folder: "dakik-studio",
					});

					// Upload to Cloudinary
					const formData = new FormData();
					formData.append("file", file);
					formData.append("api_key", signatureData.apiKey);
					formData.append("timestamp", signatureData.timestamp.toString());
					formData.append("signature", signatureData.signature);
					if (signatureData.folder) {
						formData.append("folder", signatureData.folder);
					}

					const uploadResponse = await fetch(
						`https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`,
						{
							method: "POST",
							body: formData,
						}
					);

					if (!uploadResponse.ok) {
						throw new Error("Upload failed");
					}

					const result: UploadResponse = await uploadResponse.json();

					// Save asset to database
					await saveAssetMutation.mutateAsync({
						publicId: result.public_id,
						url: result.url,
						secureUrl: result.secure_url,
						format: result.format,
						resourceType: result.resource_type,
						width: result.width,
						height: result.height,
						bytes: result.bytes,
						folder: result.folder,
					});

					completed += 1;
					setUploadProgress(Math.round((completed / fileArray.length) * 100));
				}

				await queryClient.invalidateQueries({
					queryKey: trpc.uploads.list.queryKey(),
				});
				await queryClient.invalidateQueries({
					queryKey: trpc.uploads.getFolders.queryKey(),
				});

				toast.success(
					`Uploaded ${completed} ${completed === 1 ? "file" : "files"}`
				);
				setShowUpload(false);
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Upload failed";
				toast.error(message);
			} finally {
				setIsUploading(false);
				setUploadProgress(0);
			}
		},
		[getSignatureMutation, saveAssetMutation, queryClient]
	);

	const handleSelect = useCallback((id: string, selected: boolean) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (selected) {
				next.add(id);
			} else {
				next.delete(id);
			}
			return next;
		});
	}, []);

	const handleSelectAll = useCallback(() => {
		if (!data?.assets) {
			return;
		}
		const allIds = new Set(data.assets.map((a) => a.id));
		setSelectedIds(allIds);
	}, [data?.assets]);

	const handleClearSelection = useCallback(() => {
		setSelectedIds(new Set());
	}, []);

	const handleCopyUrl = useCallback((url: string) => {
		navigator.clipboard.writeText(url);
		toast.success("URL copied to clipboard");
	}, []);

	const handleDeleteClick = useCallback((id: string) => {
		setDeleteConfirmIds([id]);
	}, []);

	const handleDeleteSelected = useCallback(() => {
		setDeleteConfirmIds(Array.from(selectedIds));
	}, [selectedIds]);

	const handleDeleteConfirm = useCallback(async () => {
		try {
			if (deleteConfirmIds.length === 1) {
				await deleteMutation.mutateAsync({ id: deleteConfirmIds[0] });
			} else {
				await deleteManyMutation.mutateAsync({ ids: deleteConfirmIds });
			}

			await queryClient.invalidateQueries({
				queryKey: trpc.uploads.list.queryKey(),
			});
			await queryClient.invalidateQueries({
				queryKey: trpc.uploads.getFolders.queryKey(),
			});

			setSelectedIds((prev) => {
				const next = new Set(prev);
				for (const id of deleteConfirmIds) {
					next.delete(id);
				}
				return next;
			});

			toast.success(
				`Deleted ${deleteConfirmIds.length} ${deleteConfirmIds.length === 1 ? "asset" : "assets"}`
			);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to delete";
			toast.error(message);
		} finally {
			setDeleteConfirmIds([]);
		}
	}, [deleteConfirmIds, deleteMutation, deleteManyMutation, queryClient]);

	const assets = data?.assets ?? [];
	const pagination = data?.pagination;
	const hasFilters = Boolean(search || folder !== "all");

	const renderContent = () => {
		if (isLoading) {
			return <LoadingSkeleton />;
		}

		if (assets.length === 0) {
			return (
				<EmptyState
					hasFilters={hasFilters}
					onUpload={() => setShowUpload(true)}
				/>
			);
		}

		return (
			<>
				{/* Asset Grid */}
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
					{assets.map((asset) => (
						<AssetCard
							asset={asset}
							isSelected={selectedIds.has(asset.id)}
							key={asset.id}
							onCopyUrl={handleCopyUrl}
							onDelete={handleDeleteClick}
							onSelect={handleSelect}
						/>
					))}
				</div>

				{/* Pagination */}
				{pagination && pagination.totalPages > 1 && (
					<div className="mt-6 flex items-center justify-between">
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
			</>
		);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold font-display text-2xl tracking-tight">
						Media Library
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Manage images and files for your projects.
					</p>
				</div>
				<div className="flex gap-2">
					{selectedIds.size > 0 && (
						<>
							<Button onClick={handleClearSelection} size="sm" variant="ghost">
								Clear ({selectedIds.size})
							</Button>
							<Button
								onClick={handleDeleteSelected}
								size="sm"
								variant="destructive"
							>
								<TrashIcon className="mr-2 size-4" />
								Delete
							</Button>
						</>
					)}
					<Button onClick={() => setShowUpload(!showUpload)}>
						<PlusIcon className="mr-2 size-4" />
						Upload
					</Button>
				</div>
			</div>

			{/* Upload Dropzone */}
			{showUpload && (
				<UploadDropzone
					isUploading={isUploading}
					onClose={() => setShowUpload(false)}
					onUpload={handleUpload}
					uploadProgress={uploadProgress}
				/>
			)}

			{/* Filters */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-2">
							<CardTitle className="text-sm">
								All Assets ({pagination?.total ?? 0})
							</CardTitle>
							{selectedIds.size > 0 && (
								<Badge variant="secondary">{selectedIds.size} selected</Badge>
							)}
						</div>
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
							<div className="relative w-full sm:w-64">
								<SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									className="pl-8"
									onChange={(e) => {
										setSearch(e.target.value);
										setPage(1);
									}}
									placeholder="Search assets..."
									value={search}
								/>
							</div>
							<Select
								onValueChange={(value) => {
									if (value) {
										setFolder(value);
										setPage(1);
									}
								}}
								value={folder}
							>
								<SelectTrigger className="w-full sm:w-40">
									<FolderIcon className="mr-2 size-4" />
									<SelectValue>
										{(value: string | null) => value ?? "All folders"}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All folders</SelectItem>
									{folders?.map((f) => (
										<SelectItem key={f} value={f}>
											{f}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{assets.length > 0 && (
								<Button onClick={handleSelectAll} size="sm" variant="outline">
									<GridIcon className="mr-2 size-4" />
									Select All
								</Button>
							)}
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{deleteConfirmIds.length > 0 && (
						<DeleteConfirmBanner
							count={deleteConfirmIds.length}
							isPending={
								deleteMutation.isPending || deleteManyMutation.isPending
							}
							onCancel={() => setDeleteConfirmIds([])}
							onConfirm={handleDeleteConfirm}
						/>
					)}

					{renderContent()}
				</CardContent>
			</Card>
		</div>
	);
}
