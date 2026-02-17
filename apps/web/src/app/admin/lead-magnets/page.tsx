"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	FileIcon,
	Loader2Icon,
	MoreHorizontalIcon,
	PencilIcon,
	PlusIcon,
	SearchIcon,
	TrashIcon,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, trpc } from "@/utils/trpc";

// Schema for the form
const leadMagnetSchema = z.object({
	name: z.string().min(1, "Name is required"),
	slug: z.string().min(1, "Slug is required"),
	description: z.string().optional(),
	assetId: z.string().min(1, "Asset is required"),
	isActive: z.boolean(),
});

type LeadMagnetFormValues = z.infer<typeof leadMagnetSchema>;

function AssetSelector({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState("");

	// Fetch assets (simplified for brevity, reused from media page logic ideally)
	const { data, isLoading } = useQuery(
		trpc.uploads.list.queryOptions({
			page: 1,
			limit: 20,
			search: search || undefined,
		})
	);

	const selectedAsset = data?.assets?.find((a) => a.id === value);

	return (
		<Dialog onOpenChange={setIsOpen} open={isOpen}>
			<div className="flex flex-col gap-2">
				{selectedAsset ? (
					<div className="flex items-center gap-3 rounded-md border p-2">
						<div className="relative size-10 overflow-hidden rounded bg-muted">
							{selectedAsset.resourceType === "image" ? (
								<Image
									alt={selectedAsset.publicId}
									className="object-cover"
									fill
									src={selectedAsset.secureUrl}
								/>
							) : (
								<div className="flex h-full items-center justify-center">
									<FileIcon className="size-5 text-muted-foreground" />
								</div>
							)}
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate font-medium text-sm">
								{selectedAsset.publicId}
							</p>
						</div>
						<Button onClick={() => onChange("")} size="sm" variant="ghost">
							Remove
						</Button>
					</div>
				) : (
					<DialogTrigger
						render={
							<Button className="w-full justify-start" variant="outline" />
						}
					>
						<PlusIcon className="mr-2 size-4" />
						Select Asset
					</DialogTrigger>
				)}
			</div>
			<DialogContent className="flex h-[80vh] max-w-3xl flex-col">
				<DialogHeader>
					<DialogTitle>Select Asset</DialogTitle>
				</DialogHeader>
				<div className="relative">
					<SearchIcon className="absolute top-2.5 left-2 size-4 text-muted-foreground" />
					<Input
						className="pl-8"
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search assets..."
						value={search}
					/>
				</div>
				<div className="grid min-h-0 flex-1 grid-cols-4 gap-4 overflow-y-auto p-1">
					{isLoading ? (
						<div className="col-span-4 flex justify-center py-8">
							<Loader2Icon className="size-6 animate-spin text-muted-foreground" />
						</div>
					) : (
						data?.assets.map((asset) => (
							<button
								className="group relative aspect-square overflow-hidden rounded-md border bg-muted hover:ring-2 hover:ring-primary focus:outline-none focus:ring-2 focus:ring-primary"
								key={asset.id}
								onClick={() => {
									onChange(asset.id);
									setIsOpen(false);
								}}
								type="button"
							>
								{asset.resourceType === "image" ? (
									<Image
										alt={asset.publicId}
										className="object-cover"
										fill
										src={asset.secureUrl}
									/>
								) : (
									<div className="flex h-full items-center justify-center">
										<FileIcon className="size-8 text-muted-foreground" />
									</div>
								)}
								<div className="absolute inset-x-0 bottom-0 truncate bg-black/60 p-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
									{asset.publicId}
								</div>
							</button>
						))
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

function LeadMagnetForm({
	defaultValues,
	onSubmit,
	isSubmitting,
}: {
	defaultValues?: LeadMagnetFormValues;
	onSubmit: (values: LeadMagnetFormValues) => void;
	isSubmitting: boolean;
}) {
	const form = useForm<LeadMagnetFormValues>({
		resolver: zodResolver(leadMagnetSchema),
		defaultValues: defaultValues || {
			name: "",
			slug: "",
			description: "",
			assetId: "",
			isActive: true,
		},
	});

	return (
		<Form {...form}>
			<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input placeholder="Starter Kit" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="slug"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Slug</FormLabel>
							<FormControl>
								<Input placeholder="starter-kit" {...field} />
							</FormControl>
							<FormDescription>Used in URL: /ui?download=slug</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Textarea placeholder="Internal description..." {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="assetId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Asset (File)</FormLabel>
							<FormControl>
								<AssetSelector onChange={field.onChange} value={field.value} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="isActive"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
							<div className="space-y-0.5">
								<FormLabel className="text-base">Active</FormLabel>
								<FormDescription>
									Enable or disable public access.
								</FormDescription>
							</div>
							<FormControl>
								<Switch
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
						</FormItem>
					)}
				/>
				<Button className="w-full" disabled={isSubmitting} type="submit">
					{isSubmitting && <Loader2Icon className="mr-2 size-4 animate-spin" />}
					Save Lead Magnet
				</Button>
			</form>
		</Form>
	);
}

export default function LeadMagnetsPage() {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	// Queries
	const { data: leadMagnets, isLoading } = useQuery(
		trpc.leadMagnets.list.queryOptions()
	);

	// Mutations
	const createMutation = useMutation(trpc.leadMagnets.create.mutationOptions());
	const updateMutation = useMutation(trpc.leadMagnets.update.mutationOptions());
	const deleteMutation = useMutation(trpc.leadMagnets.delete.mutationOptions());

	const handleCreate = async (values: LeadMagnetFormValues) => {
		try {
			await createMutation.mutateAsync(values);
			toast.success("Lead magnet created");
			setIsCreateOpen(false);
			await queryClient.invalidateQueries({
				queryKey: trpc.leadMagnets.list.queryKey(),
			});
		} catch (error) {
			console.log(error);
			toast.error("Failed to create lead magnet");
		}
	};

	const handleUpdate = async (values: LeadMagnetFormValues) => {
		if (!editingId) {
			return;
		}
		try {
			await updateMutation.mutateAsync({ id: editingId, ...values });
			toast.success("Lead magnet updated");
			setEditingId(null);
			await queryClient.invalidateQueries({
				queryKey: trpc.leadMagnets.list.queryKey(),
			});
		} catch (error) {
			console.log(error);
			toast.error("Failed to update lead magnet");
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await deleteMutation.mutateAsync({ id });
			toast.success("Lead magnet deleted");
			await queryClient.invalidateQueries({
				queryKey: trpc.leadMagnets.list.queryKey(),
			});
		} catch (error) {
			console.log(error);
			toast.error("Failed to delete lead magnet");
		}
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold font-display text-2xl tracking-tight">
						Lead Magnets
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Manage downloadable resources.
					</p>
				</div>
				<Dialog onOpenChange={setIsCreateOpen} open={isCreateOpen}>
					<DialogTrigger render={<Button />}>
						<PlusIcon className="mr-2 size-4" />
						Create New
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create Lead Magnet</DialogTitle>
						</DialogHeader>
						<LeadMagnetForm
							isSubmitting={createMutation.isPending}
							onSubmit={handleCreate}
						/>
					</DialogContent>
				</Dialog>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{leadMagnets?.map((magnet) => (
					<Card key={magnet.id}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">
								{magnet.name}
							</CardTitle>
							<DropdownMenu>
								<DropdownMenuTrigger
									render={<Button className="h-8 w-8 p-0" variant="ghost" />}
								>
									<span className="sr-only">Open menu</span>
									<MoreHorizontalIcon className="h-4 w-4" />
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => setEditingId(magnet.id)}>
										<PencilIcon className="mr-2 size-4" />
										Edit
									</DropdownMenuItem>
									<DropdownMenuItem
										className="text-destructive"
										onClick={() => handleDelete(magnet.id)}
									>
										<TrashIcon className="mr-2 size-4" />
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</CardHeader>
						<CardContent>
							<div className="mb-4 text-muted-foreground text-xs">
								{magnet.description || "No description"}
							</div>
							<div className="flex items-center gap-2">
								<Badge variant={magnet.isActive ? "default" : "secondary"}>
									{magnet.isActive ? "Active" : "Inactive"}
								</Badge>
								<code className="rounded bg-muted px-1 py-0.5 text-[10px]">
									{magnet.slug}
								</code>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<Dialog
				onOpenChange={(open) => !open && setEditingId(null)}
				open={!!editingId}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Lead Magnet</DialogTitle>
					</DialogHeader>
					{editingId &&
						(() => {
							const editingItem = leadMagnets?.find((m) => m.id === editingId);
							if (!editingItem) {
								return null;
							}
							return (
								<LeadMagnetForm
									defaultValues={{
										name: editingItem.name,
										slug: editingItem.slug,
										description: editingItem.description || "",
										assetId: editingItem.assetId,
										isActive: editingItem.isActive,
									}}
									isSubmitting={updateMutation.isPending}
									onSubmit={handleUpdate}
								/>
							);
						})()}
				</DialogContent>
			</Dialog>
		</div>
	);
}
