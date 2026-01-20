"use client";

import {
	CalendarIcon,
	FilterIcon,
	SaveIcon,
	SearchIcon,
	XIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

export interface FilterOption {
	value: string;
	label: string;
}

export interface FilterConfig {
	key: string;
	label: string;
	type:
		| "select"
		| "multiselect"
		| "dateRange"
		| "text"
		| "number"
		| "numberRange";
	options?: FilterOption[];
	placeholder?: string;
	min?: number;
	max?: number;
}

export interface FilterValues {
	[key: string]:
		| string
		| string[]
		| DateRange
		| number
		| [number, number]
		| undefined;
}

export interface FilterPreset {
	id: string;
	name: string;
	filters: FilterValues;
}

export interface AdvancedFiltersProps {
	filters: FilterConfig[];
	values: FilterValues;
	onChange: (values: FilterValues) => void;
	presets?: FilterPreset[];
	onSavePreset?: (name: string, filters: FilterValues) => void;
	onDeletePreset?: (id: string) => void;
	searchPlaceholder?: string;
	className?: string;
}

// =============================================================================
// Helper Components
// =============================================================================

function DateRangePicker({
	value,
	onChange,
	placeholder = "Select date range",
}: {
	value?: DateRange;
	onChange: (value: DateRange | undefined) => void;
	placeholder?: string;
}) {
	const [isOpen, setIsOpen] = useState(false);

	const formatDateRange = (range: DateRange | undefined) => {
		if (!range?.from) {
			return placeholder;
		}
		if (!range.to) {
			return range.from.toLocaleDateString();
		}
		return `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`;
	};

	return (
		<div className="relative">
			<Button
				className="w-full justify-start text-left font-normal"
				onClick={() => setIsOpen(!isOpen)}
				type="button"
				variant="outline"
			>
				<CalendarIcon className="mr-2 size-4" />
				<span className={cn(!value?.from && "text-muted-foreground")}>
					{formatDateRange(value)}
				</span>
			</Button>
			{isOpen && (
				<div className="absolute top-full left-0 z-50 mt-1 rounded-none border bg-popover p-0 shadow-md">
					<Calendar
						defaultMonth={value?.from}
						mode="range"
						numberOfMonths={2}
						onSelect={(range) => {
							onChange(range);
							if (range?.to) {
								setIsOpen(false);
							}
						}}
						selected={value}
					/>
					<div className="flex justify-end gap-2 border-t p-2">
						<Button
							onClick={() => {
								onChange(undefined);
								setIsOpen(false);
							}}
							size="xs"
							variant="ghost"
						>
							Clear
						</Button>
						<Button
							onClick={() => setIsOpen(false)}
							size="xs"
							variant="outline"
						>
							Close
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

function MultiSelectFilter({
	options,
	value = [],
	onChange,
	placeholder = "Select options",
}: {
	options: FilterOption[];
	value?: string[];
	onChange: (value: string[]) => void;
	placeholder?: string;
}) {
	const [isOpen, setIsOpen] = useState(false);

	const toggleOption = (optionValue: string) => {
		const newValue = value.includes(optionValue)
			? value.filter((v) => v !== optionValue)
			: [...value, optionValue];
		onChange(newValue);
	};

	const selectedLabels = value
		.map((v) => options.find((o) => o.value === v)?.label)
		.filter(Boolean);

	return (
		<div className="relative">
			<Button
				className="w-full justify-start text-left font-normal"
				onClick={() => setIsOpen(!isOpen)}
				type="button"
				variant="outline"
			>
				{selectedLabels.length > 0 ? (
					<div className="flex flex-wrap gap-1">
						{selectedLabels.slice(0, 2).map((label) => (
							<Badge className="text-xs" key={label} variant="secondary">
								{label}
							</Badge>
						))}
						{selectedLabels.length > 2 && (
							<Badge className="text-xs" variant="outline">
								+{selectedLabels.length - 2}
							</Badge>
						)}
					</div>
				) : (
					<span className="text-muted-foreground">{placeholder}</span>
				)}
			</Button>
			{isOpen && (
				<div className="absolute top-full left-0 z-50 mt-1 min-w-48 rounded-none border bg-popover p-2 shadow-md">
					<div className="max-h-48 space-y-1 overflow-y-auto">
						{options.map((option) => {
							const checkboxId = `checkbox-${option.value}`;
							return (
								<label
									className="flex cursor-pointer items-center gap-2 rounded-none p-1.5 text-xs hover:bg-accent"
									htmlFor={checkboxId}
									key={option.value}
								>
									<Checkbox
										checked={value.includes(option.value)}
										id={checkboxId}
										onCheckedChange={() => toggleOption(option.value)}
									/>
									{option.label}
								</label>
							);
						})}
					</div>
					<div className="mt-2 flex justify-end gap-2 border-t pt-2">
						<Button onClick={() => onChange([])} size="xs" variant="ghost">
							Clear
						</Button>
						<Button
							onClick={() => setIsOpen(false)}
							size="xs"
							variant="outline"
						>
							Close
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

function NumberRangeFilter({
	value,
	onChange,
	min = 0,
	max = 100,
	placeholder: _placeholder = "Range",
}: {
	value?: [number, number];
	onChange: (value: [number, number] | undefined) => void;
	min?: number;
	max?: number;
	placeholder?: string;
}) {
	const [localMin, setLocalMin] = useState(value?.[0]?.toString() ?? "");
	const [localMax, setLocalMax] = useState(value?.[1]?.toString() ?? "");

	const handleBlur = () => {
		const minVal = localMin ? Number.parseInt(localMin, 10) : undefined;
		const maxVal = localMax ? Number.parseInt(localMax, 10) : undefined;
		if (minVal !== undefined && maxVal !== undefined) {
			onChange([
				Math.max(min, Math.min(minVal, max)),
				Math.max(min, Math.min(maxVal, max)),
			]);
		} else if (minVal !== undefined) {
			onChange([minVal, max]);
		} else if (maxVal !== undefined) {
			onChange([min, maxVal]);
		} else {
			onChange(undefined);
		}
	};

	return (
		<div className="flex items-center gap-2">
			<Input
				className="w-20"
				max={max}
				min={min}
				onBlur={handleBlur}
				onChange={(e) => setLocalMin(e.target.value)}
				placeholder="Min"
				type="number"
				value={localMin}
			/>
			<span className="text-muted-foreground text-xs">to</span>
			<Input
				className="w-20"
				max={max}
				min={min}
				onBlur={handleBlur}
				onChange={(e) => setLocalMax(e.target.value)}
				placeholder="Max"
				type="number"
				value={localMax}
			/>
		</div>
	);
}

// =============================================================================
// Main Component
// =============================================================================

export function AdvancedFilters({
	filters,
	values,
	onChange,
	presets = [],
	onSavePreset,
	onDeletePreset,
	searchPlaceholder = "Search...",
	className,
}: AdvancedFiltersProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [presetName, setPresetName] = useState("");
	const [showPresetInput, setShowPresetInput] = useState(false);

	const searchFilter = filters.find(
		(f) => f.type === "text" && f.key === "search"
	);
	const otherFilters = filters.filter(
		(f) => !(f.type === "text" && f.key === "search")
	);

	const activeFilterCount = Object.entries(values).filter(([key, value]) => {
		if (key === "search") {
			return false;
		}
		if (value === undefined || value === "") {
			return false;
		}
		if (Array.isArray(value) && value.length === 0) {
			return false;
		}
		return true;
	}).length;

	const handleFilterChange = useCallback(
		(key: string, value: FilterValues[string]) => {
			onChange({ ...values, [key]: value });
		},
		[onChange, values]
	);

	const clearAllFilters = useCallback(() => {
		const clearedValues: FilterValues = {};
		for (const filter of filters) {
			clearedValues[filter.key] = undefined;
		}
		onChange(clearedValues);
	}, [filters, onChange]);

	const applyPreset = useCallback(
		(preset: FilterPreset) => {
			onChange({ ...preset.filters });
		},
		[onChange]
	);

	const handleSavePreset = useCallback(() => {
		if (presetName.trim() && onSavePreset) {
			onSavePreset(presetName.trim(), values);
			setPresetName("");
			setShowPresetInput(false);
		}
	}, [presetName, onSavePreset, values]);

	const renderFilter = (filter: FilterConfig) => {
		const value = values[filter.key];

		switch (filter.type) {
			case "select":
				return (
					<Select
						key={filter.key}
						onValueChange={(v) =>
							handleFilterChange(
								filter.key,
								v === "all" || v === null ? undefined : v
							)
						}
						value={(value as string) ?? "all"}
					>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All {filter.label}</SelectItem>
							{filter.options?.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				);

			case "multiselect":
				return (
					<MultiSelectFilter
						key={filter.key}
						onChange={(v) =>
							handleFilterChange(filter.key, v.length > 0 ? v : undefined)
						}
						options={filter.options ?? []}
						placeholder={filter.placeholder ?? `Select ${filter.label}`}
						value={(value as string[]) ?? []}
					/>
				);

			case "dateRange":
				return (
					<DateRangePicker
						key={filter.key}
						onChange={(v) => handleFilterChange(filter.key, v)}
						placeholder={filter.placeholder ?? "Select date range"}
						value={value as DateRange | undefined}
					/>
				);

			case "numberRange":
				return (
					<NumberRangeFilter
						key={filter.key}
						max={filter.max}
						min={filter.min}
						onChange={(v) => handleFilterChange(filter.key, v)}
						placeholder={filter.placeholder}
						value={value as [number, number] | undefined}
					/>
				);

			case "number":
				return (
					<Input
						key={filter.key}
						max={filter.max}
						min={filter.min}
						onChange={(e) =>
							handleFilterChange(
								filter.key,
								e.target.value ? Number.parseInt(e.target.value, 10) : undefined
							)
						}
						placeholder={filter.placeholder ?? filter.label}
						type="number"
						value={(value as number) ?? ""}
					/>
				);

			default:
				return (
					<Input
						key={filter.key}
						onChange={(e) =>
							handleFilterChange(filter.key, e.target.value || undefined)
						}
						placeholder={filter.placeholder ?? filter.label}
						value={(value as string) ?? ""}
					/>
				);
		}
	};

	// Helper to get display value for filter chips
	const getFilterDisplayValue = (
		value: FilterValues[string],
		filter: FilterConfig
	): string => {
		if (Array.isArray(value)) {
			const labels = value
				.map((v) => filter.options?.find((o) => o.value === v)?.label ?? v)
				.slice(0, 2);
			const displayValue = labels.join(", ");
			return value.length > 2
				? `${displayValue} +${value.length - 2}`
				: displayValue;
		}

		if (typeof value === "object" && "from" in value) {
			const dateRange = value as DateRange;
			if (!dateRange.from) {
				return "";
			}
			if (dateRange.to) {
				return `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`;
			}
			return dateRange.from.toLocaleDateString();
		}

		if (typeof value === "string") {
			return filter.options?.find((o) => o.value === value)?.label ?? value;
		}

		return String(value);
	};

	// Helper to check if filter value should be displayed
	const shouldDisplayFilter = (
		key: string,
		value: FilterValues[string]
	): boolean => {
		if (key === "search" || value === undefined || value === "") {
			return false;
		}
		if (Array.isArray(value) && value.length === 0) {
			return false;
		}
		return true;
	};

	// Helper to render filter chip
	const renderFilterChip = (
		key: string,
		value: FilterValues[string],
		filter: FilterConfig
	) => {
		if (!shouldDisplayFilter(key, value)) {
			return null;
		}

		const displayValue = getFilterDisplayValue(value, filter);

		return (
			<Badge className="gap-1 pr-1" key={key} variant="secondary">
				<span className="text-muted-foreground">{filter.label}:</span>
				{displayValue}
				<Button
					className="ml-1 size-4 p-0 hover:bg-transparent"
					onClick={() => handleFilterChange(key, undefined)}
					size="xs"
					variant="ghost"
				>
					<XIcon className="size-3" />
				</Button>
			</Badge>
		);
	};

	return (
		<div className={cn("space-y-4", className)}>
			{/* Search and Basic Filter Bar */}
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
				{/* Search Input */}
				{searchFilter && (
					<div className="relative flex-1 sm:max-w-xs">
						<SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							className="pl-8"
							onChange={(e) =>
								handleFilterChange("search", e.target.value || undefined)
							}
							placeholder={searchPlaceholder}
							value={(values.search as string) ?? ""}
						/>
					</div>
				)}

				{/* Advanced Filters Toggle */}
				<Button
					className="gap-2"
					onClick={() => setIsExpanded(!isExpanded)}
					variant={
						isExpanded || activeFilterCount > 0 ? "secondary" : "outline"
					}
				>
					<FilterIcon className="size-4" />
					Filters
					{activeFilterCount > 0 && (
						<Badge className="ml-1 text-xs" variant="default">
							{activeFilterCount}
						</Badge>
					)}
				</Button>

				{/* Clear All */}
				{activeFilterCount > 0 && (
					<Button
						className="gap-1"
						onClick={clearAllFilters}
						size="sm"
						variant="ghost"
					>
						<XIcon className="size-3" />
						Clear all
					</Button>
				)}
			</div>

			{/* Expanded Filters Panel */}
			{isExpanded && (
				<div className="rounded-none border bg-card p-4">
					{/* Presets */}
					{(presets.length > 0 || onSavePreset) && (
						<div className="mb-4 border-b pb-4">
							<Label className="mb-2 block font-medium text-xs">
								Quick Filters
							</Label>
							<div className="flex flex-wrap gap-2">
								{presets.map((preset) => (
									<div className="flex items-center gap-1" key={preset.id}>
										<Button
											onClick={() => applyPreset(preset)}
											size="xs"
											variant="outline"
										>
											{preset.name}
										</Button>
										{onDeletePreset && (
											<Button
												className="size-5 p-0"
												onClick={() => onDeletePreset(preset.id)}
												size="xs"
												variant="ghost"
											>
												<XIcon className="size-3" />
											</Button>
										)}
									</div>
								))}
								{onSavePreset &&
									(showPresetInput ? (
										<div className="flex items-center gap-1">
											<Input
												className="h-6 w-32 text-xs"
												onChange={(e) => setPresetName(e.target.value)}
												onKeyDown={(e) =>
													e.key === "Enter" && handleSavePreset()
												}
												placeholder="Preset name"
												value={presetName}
											/>
											<Button
												onClick={handleSavePreset}
												size="xs"
												variant="outline"
											>
												<SaveIcon className="size-3" />
											</Button>
											<Button
												onClick={() => {
													setShowPresetInput(false);
													setPresetName("");
												}}
												size="xs"
												variant="ghost"
											>
												<XIcon className="size-3" />
											</Button>
										</div>
									) : (
										<Button
											className="text-xs"
											onClick={() => setShowPresetInput(true)}
											size="xs"
											variant="ghost"
										>
											+ Save current filters
										</Button>
									))}
							</div>
						</div>
					)}

					{/* Filter Fields */}
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{otherFilters.map((filter) => (
							<div className="space-y-1.5" key={filter.key}>
								<Label className="text-xs">{filter.label}</Label>
								{renderFilter(filter)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Active Filters Display */}
			{activeFilterCount > 0 && !isExpanded && (
				<div className="flex flex-wrap gap-2">
					{Object.entries(values).map(([key, value]) => {
						const filter = filters.find((f) => f.key === key);
						if (!filter) {
							return null;
						}
						return renderFilterChip(key, value, filter);
					})}
				</div>
			)}
		</div>
	);
}

// =============================================================================
// Hook for managing filter state with URL sync
// =============================================================================

export function useAdvancedFilters(
	_initialFilters: FilterConfig[],
	options?: {
		syncToUrl?: boolean;
		storageKey?: string;
	}
) {
	const [values, setValues] = useState<FilterValues>({});
	const [presets, setPresets] = useState<FilterPreset[]>([]);

	// Load presets from localStorage
	useEffect(() => {
		if (options?.storageKey) {
			try {
				const saved = localStorage.getItem(`${options.storageKey}-presets`);
				if (saved) {
					setPresets(JSON.parse(saved));
				}
			} catch (e) {
				console.error("Failed to load presets:", e);
			}
		}
	}, [options?.storageKey]);

	// Save presets to localStorage
	const savePreset = useCallback(
		(name: string, filters: FilterValues) => {
			const newPreset: FilterPreset = {
				id: crypto.randomUUID(),
				name,
				filters,
			};
			const updated = [...presets, newPreset];
			setPresets(updated);
			if (options?.storageKey) {
				localStorage.setItem(
					`${options.storageKey}-presets`,
					JSON.stringify(updated)
				);
			}
		},
		[presets, options?.storageKey]
	);

	const deletePreset = useCallback(
		(id: string) => {
			const updated = presets.filter((p) => p.id !== id);
			setPresets(updated);
			if (options?.storageKey) {
				localStorage.setItem(
					`${options.storageKey}-presets`,
					JSON.stringify(updated)
				);
			}
		},
		[presets, options?.storageKey]
	);

	return {
		values,
		setValues,
		presets,
		savePreset,
		deletePreset,
	};
}
