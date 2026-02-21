"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
	CheckIcon,
	ChevronDownIcon,
	DownloadIcon,
	Loader2Icon,
	SearchIcon,
	XIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

interface Icon {
	id: string;
	name: string;
	slug: string;
	category: string;
	svgContent: string;
	keywords: string[] | null;
}

// Regex patterns for SVG sanitization
const SCRIPT_TAG_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const EVENT_HANDLER_REGEX = /on\w+="[^"]*"/gi;

function sanitizeSvg(svgContent: string): string {
	return svgContent
		.replace(SCRIPT_TAG_REGEX, "")
		.replace(EVENT_HANDLER_REGEX, "");
}

function IconSvg({
	svgContent,
	className,
}: {
	svgContent: string;
	className?: string;
}) {
	const sanitized = sanitizeSvg(svgContent);
	return (
		<div
			className={cn("flex items-center justify-center", className)}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized SVG content from our database
			dangerouslySetInnerHTML={{ __html: sanitized }}
		/>
	);
}

export function IconGrid() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [copiedIcon, setCopiedIcon] = useState<string | null>(null);

	// Fetch icons from the API
	const { data: iconsData, isLoading: isIconsLoading } = useQuery(
		trpc.icons.listPublic.queryOptions({
			limit: 200,
		})
	);

	// Fetch categories from the backend
	const { data: backendCategories, isLoading: isCategoriesLoading } = useQuery(
		trpc.icons.getPublicCategories.queryOptions()
	);

	// Build categories list: "All" + backend categories
	const categories = useMemo(() => {
		if (!backendCategories) {
			return ["All"];
		}
		return ["All", ...backendCategories];
	}, [backendCategories]);

	// Get all icons from API response
	const allIcons = useMemo(() => {
		return iconsData?.icons ?? [];
	}, [iconsData]);

	// Filter icons by search and category
	const filteredIcons = useMemo(() => {
		let icons = allIcons;

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			icons = icons.filter(
				(icon) =>
					icon.name.toLowerCase().includes(query) ||
					icon.slug.toLowerCase().includes(query) ||
					(icon.keywords ?? []).some((kw) => kw.toLowerCase().includes(query))
			);
		}

		// Filter by category
		if (selectedCategory !== "All") {
			icons = icons.filter((icon) => icon.category === selectedCategory);
		}

		return icons;
	}, [allIcons, searchQuery, selectedCategory]);

	const handleCopySvg = async (icon: Icon) => {
		try {
			const svgString = sanitizeSvg(icon.svgContent);
			await navigator.clipboard.writeText(svgString);
			setCopiedIcon(icon.id);
			toast.success(`Copied ${icon.name} SVG to clipboard`);
			setTimeout(() => setCopiedIcon(null), 2000);
		} catch {
			toast.error("Failed to copy SVG");
		}
	};

	const handleDownload = (icon: Icon) => {
		const svgString = sanitizeSvg(icon.svgContent);
		const blob = new Blob([svgString], { type: "image/svg+xml" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `${icon.slug}.svg`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
		toast.success(`Downloaded ${icon.name} SVG`);
	};

	const clearSearch = () => {
		setSearchQuery("");
	};

	return (
		<div className="flex flex-col gap-8">
			{/* Filters Bar */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				{/* Search Input */}
				<div className="relative w-full sm:max-w-sm">
					<SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						className="pr-10 pl-10"
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search icons..."
						type="text"
						value={searchQuery}
					/>
					{searchQuery && (
						<button
							aria-label="Clear search"
							className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
							onClick={clearSearch}
							type="button"
						>
							<XIcon className="size-4" />
						</button>
					)}
				</div>

				<div className="flex flex-wrap items-center gap-3">
					{/* Category Filter */}
					<DropdownMenu>
						<DropdownMenuTrigger className="inline-flex h-8 min-w-32 shrink-0 select-none items-center justify-between whitespace-nowrap rounded-none border border-border bg-background px-2.5 font-medium text-xs outline-none transition-all hover:bg-muted focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50">
							{isCategoriesLoading ? (
								<span className="flex items-center gap-2">
									<Loader2Icon className="size-3 animate-spin" />
									Loading...
								</span>
							) : (
								selectedCategory
							)}
							<ChevronDownIcon className="ml-2 size-4" />
						</DropdownMenuTrigger>
						<DropdownMenuContent className="max-h-64 overflow-y-auto">
							{categories.map((category) => (
								<DropdownMenuItem
									key={category}
									onClick={() => setSelectedCategory(category)}
								>
									{category}
									{selectedCategory === category && (
										<CheckIcon className="ml-auto size-4" />
									)}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Results Count */}
			<div className="text-muted-foreground text-sm">
				{isIconsLoading ? (
					<span className="flex items-center gap-2">
						<Loader2Icon className="size-3 animate-spin" />
						Loading icons...
					</span>
				) : (
					<>
						{filteredIcons.length} icon
						{filteredIcons.length !== 1 ? "s" : ""}{" "}
						{searchQuery || selectedCategory !== "All" ? "found" : "available"}
					</>
				)}
			</div>

			{/* Icon Grid */}
			<AnimatePresence mode="wait">
				{isIconsLoading ? (
					<motion.div
						animate={{ opacity: 1 }}
						className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10"
						initial={{ opacity: 0 }}
						key="loading"
					>
						{Array.from({ length: 20 }).map((_, index) => (
							<div
								className="flex aspect-square animate-pulse flex-col items-center justify-center gap-2 border border-border bg-muted p-3"
								key={index}
							/>
						))}
					</motion.div>
				) : filteredIcons.length > 0 ? (
					<motion.div
						animate={{ opacity: 1 }}
						className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						key={`${selectedCategory}-${searchQuery}`}
						transition={{ duration: 0.2 }}
					>
						{filteredIcons.map((icon, index) => {
							const isCopied = copiedIcon === icon.id;

							return (
								<motion.div
									animate={{ opacity: 1, y: 0 }}
									className="group relative"
									initial={{ opacity: 0, y: 10 }}
									key={icon.id}
									transition={{
										duration: 0.2,
										delay: Math.min(index * 0.01, 0.3),
									}}
								>
									<button
										aria-label={`Copy ${icon.name} SVG`}
										className={cn(
											"flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-none border border-border bg-background p-3 transition-all",
											"hover:border-foreground/30 hover:bg-muted",
											isCopied && "border-success bg-success/10"
										)}
										onClick={() => handleCopySvg(icon)}
										type="button"
									>
										<div className="relative flex items-center justify-center">
											{isCopied ? (
												<CheckIcon className="size-6 text-success" />
											) : (
												<IconSvg
													className="size-6 text-foreground transition-transform group-hover:scale-110 [&>svg]:size-6 [&>svg]:text-foreground"
													svgContent={icon.svgContent}
												/>
											)}
										</div>
									</button>

									{/* Tooltip with name */}
									<div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-none border border-border bg-popover px-2 py-1 font-mono text-[10px] text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
										{icon.name}
									</div>

									{/* Download button */}
									<button
										aria-label={`Download ${icon.name} SVG`}
										className="absolute top-1 right-1 rounded-none bg-background/80 p-1 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
										onClick={(e) => {
											e.stopPropagation();
											handleDownload(icon);
										}}
										type="button"
									>
										<DownloadIcon className="size-3" />
									</button>
								</motion.div>
							);
						})}
					</motion.div>
				) : (
					<motion.div
						animate={{ opacity: 1 }}
						className="flex flex-col items-center justify-center py-20 text-center"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
					>
						<SearchIcon className="mb-4 size-12 text-muted-foreground" />
						<h3 className="mb-2 font-medium text-lg">No icons found</h3>
						<p className="text-muted-foreground text-sm">
							Try adjusting your search or filter criteria
						</p>
						<Button
							className="mt-4"
							onClick={() => {
								setSearchQuery("");
								setSelectedCategory("All");
							}}
							variant="outline"
						>
							Clear filters
						</Button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
