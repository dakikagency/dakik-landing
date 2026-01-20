"use client";

import type { IconWeight, Icon as PhosphorIcon } from "@phosphor-icons/react";
// biome-ignore lint/performance/noNamespaceImport: Need namespace import to iterate all icons dynamically
import * as PhosphorIcons from "@phosphor-icons/react";
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
import { useCallback, useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
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

const ICON_WEIGHTS: IconWeight[] = [
	"thin",
	"light",
	"regular",
	"bold",
	"fill",
	"duotone",
];

const WEIGHT_LABELS: Record<IconWeight, string> = {
	thin: "Thin",
	light: "Light",
	regular: "Regular",
	bold: "Bold",
	fill: "Filled",
	duotone: "Duotone",
};

// Mapping from backend categories to Phosphor Icon keywords for filtering
const CATEGORY_KEYWORDS: Record<string, string[]> = {
	General: [],
	Interface: [
		"Menu",
		"Grid",
		"Settings",
		"Gear",
		"Sliders",
		"Toggle",
		"Check",
		"X",
		"Plus",
		"Minus",
	],
	Arrows: [
		"Arrow",
		"Caret",
		"CaretCircle",
		"Direction",
		"Navigation",
		"Pointer",
	],
	Social: [
		"Twitter",
		"Facebook",
		"Instagram",
		"Linkedin",
		"Github",
		"Discord",
		"Youtube",
		"Tiktok",
	],
	Commerce: [
		"Bag",
		"Cart",
		"Credit",
		"Currency",
		"Money",
		"Wallet",
		"Receipt",
		"Percent",
		"Tag",
		"Barcode",
	],
	Media: [
		"Play",
		"Pause",
		"Stop",
		"Record",
		"Camera",
		"Microphone",
		"Speaker",
		"Volume",
	],
	Communication: [
		"Chat",
		"Envelope",
		"Mail",
		"Message",
		"Phone",
		"Video",
		"Voicemail",
		"Megaphone",
	],
	Files: [
		"File",
		"Folder",
		"Document",
		"Archive",
		"Clipboard",
		"Copy",
		"Image",
	],
	Weather: ["Sun", "Moon", "Cloud", "Rain", "Snow", "Wind", "Thermometer"],
	Maps: [
		"Map",
		"Pin",
		"Compass",
		"Globe",
		"Navigation",
		"Path",
		"Route",
		"Location",
	],
	Development: [
		"Code",
		"Terminal",
		"Bug",
		"Git",
		"Database",
		"Server",
		"Cloud",
		"Api",
		"Brackets",
	],
	Design: [
		"Brush",
		"Paint",
		"Palette",
		"Pencil",
		"Ruler",
		"Scissors",
		"Selection",
		"Crop",
		"Gradient",
	],
	Health: ["Heart", "Pill", "Syringe", "FirstAid", "Hospital", "Tooth"],
	Finance: [
		"Bank",
		"Coin",
		"CurrencyDollar",
		"CurrencyEur",
		"ChartLine",
		"TrendUp",
		"TrendDown",
		"Percent",
	],
	Education: [
		"Book",
		"BookOpen",
		"GraduationCap",
		"Student",
		"Chalkboard",
		"Certificate",
	],
	Other: [],
};

interface IconData {
	name: string;
	displayName: string;
	component: PhosphorIcon;
}

function getPhosphorIcons(): IconData[] {
	const icons: IconData[] = [];
	const iconEntries = Object.entries(PhosphorIcons);

	for (const [name, component] of iconEntries) {
		if (
			typeof component === "function" &&
			name !== "IconContext" &&
			name !== "IconBase" &&
			!name.startsWith("Ssr") &&
			!name.includes("Ssr")
		) {
			const displayName = name.replace(/([A-Z])/g, " $1").trim();
			icons.push({
				name,
				displayName,
				component: component as PhosphorIcon,
			});
		}
	}

	return icons.sort((a, b) => a.name.localeCompare(b.name));
}

function matchesCategory(
	iconName: string,
	categoryKeywords: string[]
): boolean {
	if (categoryKeywords.length === 0) {
		return true;
	}

	const lowerName = iconName.toLowerCase();
	return categoryKeywords.some((keyword) =>
		lowerName.includes(keyword.toLowerCase())
	);
}

export function IconGrid() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [selectedWeight, setSelectedWeight] = useState<IconWeight>("regular");
	const [copiedIcon, setCopiedIcon] = useState<string | null>(null);

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

	const allIcons = useMemo(() => getPhosphorIcons(), []);

	const filteredIcons = useMemo(() => {
		let icons = allIcons;

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			icons = icons.filter(
				(icon) =>
					icon.name.toLowerCase().includes(query) ||
					icon.displayName.toLowerCase().includes(query)
			);
		}

		// Filter by category
		if (selectedCategory !== "All") {
			const categoryKeywords = CATEGORY_KEYWORDS[selectedCategory] ?? [];
			icons = icons.filter((icon) =>
				matchesCategory(icon.name, categoryKeywords)
			);
		}

		return icons;
	}, [allIcons, searchQuery, selectedCategory]);

	const getSvgString = useCallback(
		(IconComponent: PhosphorIcon, iconName: string): string => {
			const svgMarkup = renderToStaticMarkup(
				<IconComponent size={24} weight={selectedWeight} />
			);
			return svgMarkup.replace(
				"<svg",
				`<svg xmlns="http://www.w3.org/2000/svg" aria-label="${iconName}"`
			);
		},
		[selectedWeight]
	);

	const handleCopySvg = useCallback(
		async (icon: IconData) => {
			try {
				const svgString = getSvgString(icon.component, icon.name);
				await navigator.clipboard.writeText(svgString);
				setCopiedIcon(icon.name);
				toast.success(`Copied ${icon.displayName} SVG to clipboard`);
				setTimeout(() => setCopiedIcon(null), 2000);
			} catch {
				toast.error("Failed to copy SVG");
			}
		},
		[getSvgString]
	);

	const handleDownload = useCallback(
		(icon: IconData) => {
			const svgString = getSvgString(icon.component, icon.name);
			const blob = new Blob([svgString], { type: "image/svg+xml" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${icon.name.toLowerCase()}-${selectedWeight}.svg`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			toast.success(`Downloaded ${icon.displayName} SVG`);
		},
		[getSvgString, selectedWeight]
	);

	const clearSearch = useCallback(() => {
		setSearchQuery("");
	}, []);

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

					{/* Weight Toggle */}
					<div className="flex rounded-none border border-border">
						{ICON_WEIGHTS.map((weight) => (
							<button
								className={cn(
									"px-3 py-1.5 text-xs transition-colors",
									selectedWeight === weight
										? "bg-foreground text-background"
										: "text-muted-foreground hover:bg-muted hover:text-foreground"
								)}
								key={weight}
								onClick={() => setSelectedWeight(weight)}
								type="button"
							>
								{WEIGHT_LABELS[weight]}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Results Count */}
			<div className="text-muted-foreground text-sm">
				{filteredIcons.length} icon{filteredIcons.length !== 1 ? "s" : ""}{" "}
				{searchQuery || selectedCategory !== "All" ? "found" : "available"}
			</div>

			{/* Icon Grid */}
			<AnimatePresence mode="wait">
				{filteredIcons.length > 0 ? (
					<motion.div
						animate={{ opacity: 1 }}
						className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						key={`${selectedCategory}-${searchQuery}`}
						transition={{ duration: 0.2 }}
					>
						{filteredIcons.map((icon, index) => {
							const IconComponent = icon.component;
							const isCopied = copiedIcon === icon.name;

							return (
								<motion.div
									animate={{ opacity: 1, y: 0 }}
									className="group relative"
									initial={{ opacity: 0, y: 10 }}
									key={icon.name}
									transition={{
										duration: 0.2,
										delay: Math.min(index * 0.01, 0.3),
									}}
								>
									<button
										aria-label={`Copy ${icon.displayName} SVG`}
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
												<IconComponent
													className="size-6 text-foreground transition-transform group-hover:scale-110"
													weight={selectedWeight}
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
										aria-label={`Download ${icon.displayName} SVG`}
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
