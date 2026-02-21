"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowLeftIcon,
	CalendarIcon,
	ClockIcon,
	LinkIcon,
	Loader2Icon,
	MoreHorizontalIcon,
	PlusIcon,
	UserIcon,
	VideoIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";

import {
	AdvancedFilters,
	type FilterConfig,
	type FilterPreset,
	type FilterValues,
} from "@/components/admin/advanced-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

// =============================================================================
// Constants
// =============================================================================

const STATUS_OPTIONS = [
	{ value: "SCHEDULED", label: "Scheduled" },
	{ value: "COMPLETED", label: "Completed" },
	{ value: "CANCELLED", label: "Cancelled" },
	{ value: "NO_SHOW", label: "No Show" },
];

const ATTENDEE_TYPE_OPTIONS = [
	{ value: "lead", label: "Lead" },
	{ value: "customer", label: "Customer" },
];

// Filter configuration
const FILTER_CONFIG: FilterConfig[] = [
	{
		key: "search",
		label: "Search",
		type: "text",
		placeholder: "Search meetings...",
	},
	{
		key: "statuses",
		label: "Status",
		type: "multiselect",
		options: STATUS_OPTIONS,
		placeholder: "Select statuses",
	},
	{
		key: "attendeeType",
		label: "Attendee Type",
		type: "select",
		options: ATTENDEE_TYPE_OPTIONS,
		placeholder: "Select type",
	},
	{
		key: "dateRange",
		label: "Scheduled Date",
		type: "dateRange",
		placeholder: "Select date range",
	},
];

// Default presets
const DEFAULT_PRESETS: FilterPreset[] = [
	{
		id: "upcoming",
		name: "Upcoming",
		filters: { statuses: ["SCHEDULED"] },
	},
	{
		id: "completed",
		name: "Completed",
		filters: { statuses: ["COMPLETED"] },
	},
	{
		id: "needs-attention",
		name: "Needs Attention",
		filters: { statuses: ["CANCELLED", "NO_SHOW"] },
	},
	{
		id: "lead-meetings",
		name: "Lead Meetings",
		filters: { attendeeType: "lead" },
	},
];

// =============================================================================
// Helpers
// =============================================================================

function getStatusBadgeVariant(status: string) {
	const variants: Record<
		string,
		"info" | "success" | "destructive" | "warning" | "outline"
	> = {
		SCHEDULED: "info",
		COMPLETED: "success",
		CANCELLED: "destructive",
		NO_SHOW: "warning",
	};
	return variants[status] ?? "outline";
}

function formatDateTime(date: Date) {
	return {
		date: new Date(date).toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
		}),
		time: new Date(date).toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
		}),
	};
}

function generateTimeSlots(): string[] {
	const slots: string[] = [];
	for (let hour = 0; hour < 24; hour++) {
		for (let minute = 0; minute < 60; minute += 15) {
			const hourStr = hour.toString().padStart(2, "0");
			const minuteStr = minute.toString().padStart(2, "0");
			slots.push(`${hourStr}:${minuteStr}`);
		}
	}
	return slots;
}

function formatTime(time: string): string {
	const [hours, minutes] = time.split(":");
	const hour = Number.parseInt(hours, 10);
	const ampm = hour >= 12 ? "PM" : "AM";
	const displayHour = hour % 12 || 12;
	return `${displayHour}:${minutes} ${ampm}`;
}

function getUserTimezone(): string {
	return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// =============================================================================
// Components
// =============================================================================

export interface MeetingData {
	id: string;
	title: string;
	scheduledAt: string | Date;
	duration: number;
	status: string;
	meetUrl: string;
	lead?: { name: string | null; email: string } | null;
	customer?: { user: { name: string | null; email: string } } | null;
}

function MeetingActionsMenu({ meeting }: { meeting: MeetingData }) {
	const queryClient = useQueryClient();
	const updateMeetingStatus = useMutation({
		...trpc.admin.updateMeetingStatus.mutationOptions(),
		onSuccess: () => {
			toast.success("Meeting status updated successfully");
			queryClient.invalidateQueries({
				queryKey: trpc.admin.getMeetings.queryKey(),
			});
		},
		onError: (error) => toast.error(error.message),
	});

	const isUpcoming =
		meeting.status === "SCHEDULED" &&
		new Date(meeting.scheduledAt) > new Date();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button className="ml-2 shrink-0" size="icon-xs" variant="ghost" />
				}
			>
				<MoreHorizontalIcon className="size-4" />
				<span className="sr-only">Open menu</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{isUpcoming && (
					<DropdownMenuItem
						render={
							<a
								href={meeting.meetUrl}
								rel="noopener noreferrer"
								target="_blank"
							>
								Join Meeting
							</a>
						}
					>
						Join Meeting
					</DropdownMenuItem>
				)}
				<DropdownMenuItem
					onClick={() => {
						navigator.clipboard.writeText(meeting.meetUrl);
						toast.success("Meeting link copied to clipboard");
					}}
				>
					<LinkIcon className="mr-2 size-4" />
					Copy Link
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() =>
						toast.info("Reschedule not yet implemented in backend")
					}
				>
					<CalendarIcon className="mr-2 size-4" />
					Reschedule
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					disabled={
						updateMeetingStatus.isPending || meeting.status === "CANCELLED"
					}
					onClick={() => {
						updateMeetingStatus.mutate({
							meetingId: meeting.id,
							status: "CANCELLED",
						});
					}}
					variant="destructive"
				>
					Cancel Meeting
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function MeetingCard({ meeting }: { meeting: MeetingData }) {
	const { date, time } = formatDateTime(new Date(meeting.scheduledAt));
	const attendee = meeting.lead ?? meeting.customer?.user;
	const isUpcoming =
		meeting.status === "SCHEDULED" &&
		new Date(meeting.scheduledAt) > new Date();

	return (
		<Card className={isUpcoming ? "ring-2 ring-primary/20" : ""}>
			<CardContent className="p-4">
				<div className="flex items-start justify-between">
					<div className="flex-1 space-y-3">
						{/* Header */}
						<div className="flex items-start justify-between gap-2">
							<div>
								<h3 className="font-medium text-sm">{meeting.title}</h3>
								{attendee && (
									<p className="mt-0.5 text-muted-foreground text-xs">
										with {attendee.name}
									</p>
								)}
							</div>
							<Badge variant={getStatusBadgeVariant(meeting.status)}>
								{meeting.status}
							</Badge>
						</div>

						{/* Details */}
						<div className="flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground text-xs">
							<div className="flex items-center gap-1.5">
								<CalendarIcon className="size-3.5" />
								{date}
							</div>
							<div className="flex items-center gap-1.5">
								<ClockIcon className="size-3.5" />
								{time} ({meeting.duration} min)
							</div>
							{attendee && (
								<div className="flex items-center gap-1.5">
									<UserIcon className="size-3.5" />
									{attendee.email}
								</div>
							)}
						</div>

						{/* Actions */}
						<div className="flex items-center gap-2">
							{isUpcoming && (
								<Button
									render={
										<a
											href={meeting.meetUrl}
											rel="noopener noreferrer"
											target="_blank"
										>
											Join Meeting
										</a>
									}
									size="xs"
									variant="outline"
								>
									<VideoIcon className="mr-1.5 size-3" />
									Join Meeting
								</Button>
							)}
							<Button size="xs" variant="ghost">
								<LinkIcon className="mr-1.5 size-3" />
								Copy Link
							</Button>
						</div>
					</div>

					<MeetingActionsMenu meeting={meeting} />
				</div>
			</CardContent>
		</Card>
	);
}

function MeetingListItem({ meeting }: { meeting: MeetingData }) {
	const { time } = formatDateTime(new Date(meeting.scheduledAt));
	const attendee = meeting.lead ?? meeting.customer?.user;
	const isUpcoming =
		meeting.status === "SCHEDULED" &&
		new Date(meeting.scheduledAt) > new Date();

	return (
		<div className="flex items-center justify-between border-b py-3 last:border-0">
			<div className="flex items-center gap-4">
				<div className="hidden size-10 flex-col items-center justify-center rounded-none bg-muted text-center sm:flex">
					<span className="font-medium text-xs">
						{new Date(meeting.scheduledAt).toLocaleDateString("en-US", {
							day: "numeric",
						})}
					</span>
					<span className="text-muted-foreground text-xs">
						{new Date(meeting.scheduledAt).toLocaleDateString("en-US", {
							month: "short",
						})}
					</span>
				</div>
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<span className="font-medium text-sm">{meeting.title}</span>
						<Badge
							className="hidden sm:inline-flex"
							variant={getStatusBadgeVariant(meeting.status)}
						>
							{meeting.status}
						</Badge>
					</div>
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
						<span>{time}</span>
						<span>{meeting.duration} min</span>
						{attendee && <span>{attendee.name}</span>}
					</div>
				</div>
			</div>
			<div className="flex items-center gap-2">
				{isUpcoming && (
					<Button
						className="hidden sm:inline-flex"
						render={
							<a
								href={meeting.meetUrl}
								rel="noopener noreferrer"
								target="_blank"
							>
								Join
							</a>
						}
						size="xs"
						variant="outline"
					>
						<VideoIcon className="mr-1.5 size-3" />
						Join
					</Button>
				)}
				<MeetingActionsMenu meeting={meeting} />
			</div>
		</div>
	);
}

function LoadingSkeletons() {
	return (
		<div className="space-y-4">
			{Array.from({ length: 5 }, (_, i) => i).map((i) => (
				<Card key={`meeting-skeleton-${i}`}>
					<CardContent className="p-4">
						<div className="flex items-start justify-between">
							<div className="space-y-3">
								<Skeleton className="h-5 w-48" />
								<div className="flex gap-4">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-24" />
								</div>
							</div>
							<Skeleton className="h-5 w-20" />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function EmptyState({
	hasFilters,
	onNewMeeting,
}: {
	hasFilters: boolean;
	onNewMeeting: () => void;
}) {
	return (
		<Card>
			<CardContent className="py-12 text-center">
				<CalendarIcon className="mx-auto size-12 text-muted-foreground/50" />
				<h3 className="mt-4 font-medium">No meetings found</h3>
				<p className="mt-1 text-muted-foreground text-sm">
					{hasFilters
						? "Try adjusting your filters"
						: "Schedule your first meeting to get started"}
				</p>
				<Button className="mt-4" onClick={onNewMeeting}>
					<PlusIcon className="mr-2 size-4" />
					New Meeting
				</Button>
			</CardContent>
		</Card>
	);
}

// Meeting Editor Component
function MeetingEditor({
	onCancel,
	onSuccess,
}: {
	onCancel: () => void;
	onSuccess: () => void;
}) {
	const queryClient = useQueryClient();

	const [attendeeType, setAttendeeType] = useState<"lead" | "customer">("lead");
	const [attendeeId, setAttendeeId] = useState("");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(
		new Date()
	);
	const [selectedTime, setSelectedTime] = useState("09:00");
	const [duration, setDuration] = useState(30);
	const [timezone] = useState(getUserTimezone());

	// Fetch leads for selection
	const { data: leads } = useQuery(
		trpc.admin.getLeads.queryOptions({ limit: 100 })
	);

	// Fetch customers for selection
	const { data: customers } = useQuery(
		trpc.admin.getCustomers.queryOptions({ limit: 100 })
	);

	const createMutation = useMutation(
		trpc.admin.createMeeting.mutationOptions()
	);

	// Auto-generate title when attendee changes
	useEffect(() => {
		if (!attendeeId) {
			return;
		}

		if (attendeeType === "lead") {
			const lead = leads?.find((l) => l.id === attendeeId);
			if (lead) {
				setTitle(`Meeting with ${lead.name}`);
			}
			return;
		}

		const customer = customers?.find((c) => c.id === attendeeId);
		if (customer) {
			setTitle(`Meeting with ${customer.user.name}`);
		}
	}, [attendeeId, attendeeType, leads, customers]);

	const handleSave = async () => {
		if (!attendeeId) {
			toast.error("Please select an attendee");
			return;
		}
		if (!title.trim()) {
			toast.error("Please enter a meeting title");
			return;
		}
		if (!selectedDate) {
			toast.error("Please select a date");
			return;
		}

		try {
			await createMutation.mutateAsync({
				attendeeType,
				attendeeId,
				title: title.trim(),
				description: description.trim() || undefined,
				date: selectedDate.toISOString().split("T")[0],
				startTime: selectedTime,
				duration,
				timezone,
			});

			await queryClient.invalidateQueries({
				queryKey: trpc.admin.getMeetings.queryKey(),
			});

			toast.success("Meeting created successfully");
			onSuccess();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to create meeting";
			toast.error(message);
		}
	};

	const isSaving = createMutation.isPending;
	const timeSlots = useMemo(() => generateTimeSlots(), []);

	// Filter attendee list based on type
	const attendeeOptions = useMemo(() => {
		if (attendeeType === "lead") {
			return (
				leads?.map((lead) => ({
					id: lead.id,
					name: lead.name,
					email: lead.email,
				})) ?? []
			);
		}
		return (
			customers?.map((customer) => ({
				id: customer.id,
				name: customer.user.name,
				email: customer.user.email,
			})) ?? []
		);
	}, [attendeeType, leads, customers]);

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
							New Meeting
						</h1>
						<p className="mt-1 text-muted-foreground text-sm">
							Schedule a meeting with a lead or customer.
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
						Create Meeting
					</Button>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Main Content */}
				<div className="space-y-6 lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="text-sm">Meeting Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Attendee Type */}
							<div className="space-y-2">
								<Label htmlFor="attendeeType">Attendee Type</Label>
								<Select
									onValueChange={(value) => {
										if (value) {
											setAttendeeType(value as "lead" | "customer");
											setAttendeeId("");
										}
									}}
									value={attendeeType}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="lead">Lead</SelectItem>
										<SelectItem value="customer">Customer</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Attendee Selection */}
							<div className="space-y-2">
								<Label htmlFor="attendee">
									Select {attendeeType === "lead" ? "Lead" : "Customer"}
								</Label>
								<Select
									onValueChange={(value) => value && setAttendeeId(value)}
									value={attendeeId}
								>
									<SelectTrigger className="w-full">
										<SelectValue>
											{(value) => {
												if (!value) {
													return `Choose a ${attendeeType}...`;
												}
												const selected = attendeeOptions.find(
													(option) => option.id === value
												);
												return selected
													? `${selected.name} (${selected.email})`
													: `Choose a ${attendeeType}...`;
											}}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										{attendeeOptions.map((option) => (
											<SelectItem key={option.id} value={option.id}>
												{option.name} ({option.email})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Title */}
							<div className="space-y-2">
								<Label htmlFor="title">Title</Label>
								<Input
									id="title"
									onChange={(e) => setTitle(e.target.value)}
									placeholder="Meeting title..."
									value={title}
								/>
							</div>

							{/* Description */}
							<div className="space-y-2">
								<Label htmlFor="description">Description (Optional)</Label>
								<textarea
									className={cn(
										"min-h-24 w-full resize-y border bg-transparent px-3 py-2 text-sm outline-none transition-colors",
										"placeholder:text-muted-foreground",
										"focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
										"disabled:cursor-not-allowed disabled:opacity-50"
									)}
									id="description"
									onChange={(e) => setDescription(e.target.value)}
									placeholder="Additional details about the meeting..."
									value={description}
								/>
							</div>

							{/* Duration */}
							<div className="space-y-2">
								<Label htmlFor="duration">Duration (minutes)</Label>
								<Select
									onValueChange={(value) => value && setDuration(Number(value))}
									value={duration.toString()}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="15">15 minutes</SelectItem>
										<SelectItem value="30">30 minutes</SelectItem>
										<SelectItem value="45">45 minutes</SelectItem>
										<SelectItem value="60">1 hour</SelectItem>
										<SelectItem value="90">1.5 hours</SelectItem>
										<SelectItem value="120">2 hours</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar - Date & Time */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-sm">Date & Time</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Calendar */}
							<div className="space-y-2">
								<Label>Date</Label>
								<Calendar
									className="border p-3"
									disabled={(date) => date < new Date()}
									mode="single"
									onSelect={setSelectedDate}
									selected={selectedDate}
								/>
							</div>

							{/* Time Selection */}
							<div className="space-y-2">
								<Label htmlFor="time">Time</Label>
								<Select
									onValueChange={(value) => value && setSelectedTime(value)}
									value={selectedTime}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent className="max-h-60">
										{timeSlots.map((slot) => (
											<SelectItem key={slot} value={slot}>
												{formatTime(slot)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Timezone Display */}
							<div className="border bg-muted/30 p-3 text-xs">
								<p className="text-muted-foreground">
									Timezone: <span className="font-medium">{timezone}</span>
								</p>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm">Google Meet</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-muted-foreground text-xs">
							<p>
								A Google Meet link will be automatically generated and included
								in the meeting.
							</p>
							<p>
								The attendee will receive a calendar invitation with the meeting
								details.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

// =============================================================================
// Main Component
// =============================================================================

export default function MeetingsPage() {
	const [mode, setMode] = useState<"list" | "create">("list");
	const [filterValues, setFilterValues] = useState<FilterValues>({});
	const [viewMode, setViewMode] = useState<"list" | "cards">("list");
	const [presets, setPresets] = useState<FilterPreset[]>(() => {
		if (typeof window !== "undefined") {
			try {
				const saved = localStorage.getItem("meetings-filter-presets");
				if (saved) {
					return [...DEFAULT_PRESETS, ...JSON.parse(saved)];
				}
			} catch {
				// Ignore invalid JSON in localStorage
			}
		}
		return DEFAULT_PRESETS;
	});

	// Convert filter values to API params
	const apiParams = useMemo(() => {
		const params: {
			search?: string;
			statuses?: string[];
			attendeeType?: "lead" | "customer" | "all";
			startDate?: Date;
			endDate?: Date;
		} = {};

		if (filterValues.search) {
			params.search = filterValues.search as string;
		}
		if (
			filterValues.statuses &&
			(filterValues.statuses as string[]).length > 0
		) {
			params.statuses = filterValues.statuses as string[];
		}
		if (filterValues.attendeeType && filterValues.attendeeType !== "all") {
			params.attendeeType = filterValues.attendeeType as "lead" | "customer";
		}
		if (filterValues.dateRange) {
			const dateRange = filterValues.dateRange as DateRange;
			if (dateRange.from) {
				params.startDate = dateRange.from;
			}
			if (dateRange.to) {
				params.endDate = dateRange.to;
			}
		}

		return params;
	}, [filterValues]);

	const { data: rawMeetings, isLoading } = useQuery(
		trpc.admin.getMeetings.queryOptions(apiParams)
	);

	const meetings = rawMeetings?.map((m) => ({
		...m,
		lead: m.lead ? { ...m.lead, email: m.lead.email ?? "" } : null,
		customer: m.customer
			? {
					...m.customer,
					user: { ...m.customer.user, email: m.customer.user.email ?? "" },
				}
			: null,
	}));

	const hasFilters = Object.values(filterValues).some((v) => {
		if (v === undefined || v === "") {
			return false;
		}
		if (Array.isArray(v) && v.length === 0) {
			return false;
		}
		return true;
	});

	// Group meetings by date for upcoming section
	const upcomingMeetings = meetings?.filter(
		(m) => m.status === "SCHEDULED" && new Date(m.scheduledAt) > new Date()
	);
	const pastMeetings = meetings?.filter(
		(m) => m.status !== "SCHEDULED" || new Date(m.scheduledAt) <= new Date()
	);

	const handleSavePreset = useCallback(
		(name: string, filters: FilterValues) => {
			const newPreset: FilterPreset = {
				id: crypto.randomUUID(),
				name,
				filters,
			};
			const customPresets = presets.filter(
				(p) => !DEFAULT_PRESETS.some((d) => d.id === p.id)
			);
			const updated = [...DEFAULT_PRESETS, ...customPresets, newPreset];
			setPresets(updated);
			localStorage.setItem(
				"meetings-filter-presets",
				JSON.stringify(
					updated.filter((p) => !DEFAULT_PRESETS.some((d) => d.id === p.id))
				)
			);
		},
		[presets]
	);

	const handleDeletePreset = useCallback(
		(id: string) => {
			if (DEFAULT_PRESETS.some((p) => p.id === id)) {
				return;
			}
			const updated = presets.filter((p) => p.id !== id);
			setPresets(updated);
			localStorage.setItem(
				"meetings-filter-presets",
				JSON.stringify(
					updated.filter((p) => !DEFAULT_PRESETS.some((d) => d.id === p.id))
				)
			);
		},
		[presets]
	);

	const handleNewMeeting = useCallback(() => {
		setMode("create");
	}, []);

	const handleCancel = useCallback(() => {
		setMode("list");
	}, []);

	const handleSuccess = useCallback(() => {
		setMode("list");
	}, []);

	// Render create mode
	if (mode === "create") {
		return <MeetingEditor onCancel={handleCancel} onSuccess={handleSuccess} />;
	}

	// Render list mode
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold font-display text-2xl tracking-tight">
						Meetings
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Manage and schedule meetings with leads and customers.
					</p>
				</div>
				<Button onClick={handleNewMeeting}>
					<PlusIcon className="mr-2 size-4" />
					New Meeting
				</Button>
			</div>

			{/* Filters and View Toggle */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<CardTitle className="text-sm">All Meetings</CardTitle>
						<div className="flex items-center gap-2">
							{meetings && (
								<span className="text-muted-foreground text-xs">
									{meetings.length} meeting{meetings.length !== 1 ? "s" : ""}{" "}
									found
								</span>
							)}
							<div className="ml-2 flex items-center gap-1 border-l pl-2">
								<Button
									onClick={() => setViewMode("list")}
									size="xs"
									variant={viewMode === "list" ? "secondary" : "ghost"}
								>
									List
								</Button>
								<Button
									onClick={() => setViewMode("cards")}
									size="xs"
									variant={viewMode === "cards" ? "secondary" : "ghost"}
								>
									Cards
								</Button>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{/* Advanced Filters */}
					<AdvancedFilters
						className="mb-4"
						filters={FILTER_CONFIG}
						onChange={setFilterValues}
						onDeletePreset={handleDeletePreset}
						onSavePreset={handleSavePreset}
						presets={presets}
						searchPlaceholder="Search by title, description, or attendee..."
						values={filterValues}
					/>
				</CardContent>
			</Card>

			{/* Content */}
			{isLoading && <LoadingSkeletons />}
			{!isLoading && meetings?.length === 0 && (
				<EmptyState hasFilters={hasFilters} onNewMeeting={handleNewMeeting} />
			)}
			{!isLoading &&
				meetings &&
				meetings.length > 0 &&
				viewMode === "cards" && (
					<div className="space-y-6">
						{/* Upcoming Meetings */}
						{upcomingMeetings && upcomingMeetings.length > 0 && (
							<div className="space-y-4">
								<h2 className="font-medium text-sm">Upcoming</h2>
								<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
									{upcomingMeetings.map((meeting) => (
										<MeetingCard key={meeting.id} meeting={meeting} />
									))}
								</div>
							</div>
						)}

						{/* Past/Other Meetings */}
						{pastMeetings && pastMeetings.length > 0 && (
							<div className="space-y-4">
								<h2 className="font-medium text-muted-foreground text-sm">
									Past & Other
								</h2>
								<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
									{pastMeetings.map((meeting) => (
										<MeetingCard key={meeting.id} meeting={meeting} />
									))}
								</div>
							</div>
						)}
					</div>
				)}
			{!isLoading && meetings && meetings.length > 0 && viewMode === "list" && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm">All Meetings</CardTitle>
					</CardHeader>
					<CardContent>
						{meetings?.map((meeting) => (
							<MeetingListItem key={meeting.id} meeting={meeting} />
						))}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
