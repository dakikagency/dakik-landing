"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Clock, Globe, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

import { useSurvey } from "../survey-context";

// Types for time slots
interface TimeSlot {
	time: string;
	available: boolean;
}

interface DayAvailability {
	date: Date;
	slots: TimeSlot[];
}

const SKELETON_COLUMN_KEYS = ["col-1", "col-2", "col-3"];
const SKELETON_SLOT_KEYS = Array.from(
	{ length: 12 },
	(_unused, index) => `slot-${index + 1}`
);

// Format date for display
function formatDate(date: Date): string {
	return date.toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
	});
}

// Format time for display (12-hour format)
function formatTime(time: string): string {
	const [hours, minutes] = time.split(":");
	const hour = Number.parseInt(hours, 10);
	const ampm = hour >= 12 ? "pm" : "am";
	const displayHour = hour % 12 || 12;
	return `${displayHour}:${minutes}${ampm}`;
}

// Get user timezone
function getUserTimezone(): string {
	return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function StepMeetingPicker() {
	const { nextStep, prevStep, leadId, setScheduledMeeting } = useSurvey();

	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [selectedTime, setSelectedTime] = useState<string | null>(null);
	const [timezone, setTimezone] = useState<string>("UTC");
	const [isBooking, setIsBooking] = useState(false);
	const [showMobileTimeSlots, setShowMobileTimeSlots] = useState(false);

	// Booking mutation
	const bookMutation = useMutation(trpc.meetings.book.mutationOptions());

	// Calculate date range for the next 14 days
	const dateRange = useMemo(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const endDate = new Date(today);
		endDate.setDate(today.getDate() + 14);
		return {
			startDate: today.toISOString(),
			endDate: endDate.toISOString(),
		};
	}, []);

	// Fetch availability data from the API
	const {
		data: availabilityData,
		isLoading,
		isError,
	} = useQuery(
		trpc.availability.getSlots.queryOptions({
			startDate: dateRange.startDate,
			endDate: dateRange.endDate,
			duration: 30,
		})
	);

	// Transform API response to local format
	const availability = useMemo<DayAvailability[]>(() => {
		if (!availabilityData?.slots) {
			return [];
		}

		return availabilityData.slots
			.filter((day) => day.times.length > 0)
			.map((day) => ({
				date: new Date(day.date),
				slots: day.times.map((slot) => ({
					time: slot.start,
					available: slot.available,
				})),
			}));
	}, [availabilityData]);

	// Update timezone from API response
	useEffect(() => {
		if (availabilityData?.timezone) {
			setTimezone(availabilityData.timezone);
		} else {
			setTimezone(getUserTimezone());
		}
	}, [availabilityData?.timezone]);

	// Set initial selected date to first available day
	useEffect(() => {
		if (availability.length > 0 && !selectedDate) {
			const firstAvailableDay = availability.find((day) =>
				day.slots.some((slot) => slot.available)
			);
			if (firstAvailableDay) {
				setSelectedDate(firstAvailableDay.date);
			} else {
				setSelectedDate(availability[0].date);
			}
		}
	}, [availability, selectedDate]);

	// Get 3-day view starting from selected date
	const threeDayView = useMemo(() => {
		if (!selectedDate || availability.length === 0) {
			return [];
		}

		const selectedIndex = availability.findIndex(
			(d) => d.date.toDateString() === selectedDate.toDateString()
		);

		if (selectedIndex === -1) {
			return availability.slice(0, 3);
		}

		// Get the selected date and next 2 days
		return availability.slice(selectedIndex, selectedIndex + 3);
	}, [availability, selectedDate]);

	// Get slots for selected date
	const selectedDaySlots = useMemo(() => {
		if (!selectedDate) {
			return [];
		}
		const day = availability.find(
			(d) => d.date.toDateString() === selectedDate.toDateString()
		);
		return day?.slots ?? [];
	}, [availability, selectedDate]);

	// Get dates that have available slots for the calendar
	const availableDates = useMemo(() => {
		return availability
			.filter((day) => day.slots.some((slot) => slot.available))
			.map((day) => day.date);
	}, [availability]);

	// Function to check if a date should be disabled in the calendar
	const isDateDisabled = (date: Date): boolean => {
		// Disable dates outside the date range
		const startDate = new Date(dateRange.startDate);
		const endDate = new Date(dateRange.endDate);
		if (date < startDate || date > endDate) {
			return true;
		}
		// Disable dates that don't have any available slots
		return !availableDates.some(
			(availableDate) => availableDate.toDateString() === date.toDateString()
		);
	};

	const handleDateSelect = (date: Date | undefined) => {
		if (date) {
			setSelectedDate(date);
			setSelectedTime(null); // Reset time when date changes
			setShowMobileTimeSlots(true); // Show time slots on mobile
		}
	};

	const handleTimeSelect = (time: string, date: Date) => {
		setSelectedDate(date);
		setSelectedTime(time);
	};

	const handleConfirm = async () => {
		if (!(selectedDate && selectedTime && leadId)) {
			toast.error("Please select a date and time");
			return;
		}

		setIsBooking(true);

		try {
			const result = await bookMutation.mutateAsync({
				leadId,
				date: selectedDate.toISOString().split("T")[0],
				startTime: selectedTime,
				duration: 30,
				timezone,
			});

			if (result.success && result.meeting) {
				// Store meeting details for success screen
				setScheduledMeeting({
					date: new Date(result.meeting.scheduledAt),
					meetingType: "30 min Discovery Call",
					meetLink: result.meeting.meetUrl,
				});
				nextStep();
			}
		} catch (_error) {
			toast.error("Failed to book meeting. Please try again.");
		} finally {
			setIsBooking(false);
		}
	};

	const isSlotSelected = selectedDate && selectedTime;

	// Loading state
	if (isLoading) {
		return (
			<div className="flex w-full max-w-7xl flex-col gap-8">
				{/* Header */}
				<div className="space-y-4 text-center">
					<h2 className="font-black font-display text-4xl uppercase tracking-tight lg:text-6xl">
						Select an appointment time
					</h2>
					<div className="flex items-center justify-center gap-2 text-foreground/60">
						<Globe className="size-4" />
						<span className="text-sm">Loading timezone...</span>
					</div>
				</div>

				{/* Split Panel Skeleton */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-[40%_60%]">
					{/* Calendar Skeleton */}
					<div className="flex flex-col gap-4">
						<Skeleton className="mx-auto h-[340px] w-full max-w-[320px]" />
					</div>

					{/* Time Slots Skeleton */}
					<div className="flex flex-col gap-4">
						<div className="grid grid-cols-3 gap-4">
							{SKELETON_COLUMN_KEYS.map((colKey) => (
								<div className="flex flex-col gap-2" key={colKey}>
									<Skeleton className="h-8 w-full" />
									{SKELETON_SLOT_KEYS.map((slotKey) => (
										<Skeleton
											className="h-12 w-full"
											key={`${colKey}-${slotKey}`}
										/>
									))}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (isError) {
		return (
			<div className="flex w-full max-w-3xl flex-col items-center justify-center gap-6 py-16">
				<p className="text-destructive text-lg">
					Failed to load available times. Please try again.
				</p>
				<Button
					className="h-14 min-w-48 border-2 border-foreground bg-transparent text-base text-foreground transition-all hover:bg-foreground hover:text-background"
					onClick={prevStep}
					type="button"
				>
					Go Back
				</Button>
			</div>
		);
	}

	return (
		<div className="flex w-full max-w-7xl flex-col gap-8">
			{/* Header */}
			<div className="space-y-4 text-center">
				<h2 className="font-black font-display text-4xl uppercase tracking-tight lg:text-6xl">
					Select an appointment time
				</h2>
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className="flex items-center justify-center gap-2 text-foreground/60"
					initial={{ opacity: 0, y: -10 }}
				>
					<Globe className="size-4" />
					<span className="text-sm">
						({timezone}){" "}
						{
							Intl.DateTimeFormat("en-US", { timeZoneName: "long" })
								.format(new Date())
								.split(", ")[1]
						}
					</span>
				</motion.div>
			</div>

			{/* Mobile: Progressive Disclosure */}
			<div className="block lg:hidden">
				{showMobileTimeSlots ? (
					<motion.div
						animate={{ opacity: 1, x: 0 }}
						className="flex flex-col gap-6"
						initial={{ opacity: 0, x: 20 }}
					>
						<button
							className="flex items-center gap-2 text-foreground/60 transition-colors hover:text-foreground"
							onClick={() => setShowMobileTimeSlots(false)}
							type="button"
						>
							<ArrowLeft className="size-5" />
							<span className="font-medium text-sm">Back to calendar</span>
						</button>

						<div className="space-y-4">
							<div className="flex items-center justify-center gap-2 text-foreground">
								<Clock className="size-5" />
								<span className="font-semibold text-base">
									{selectedDate && formatDate(selectedDate)}
								</span>
							</div>

							<div className="grid grid-cols-2 gap-3">
								{selectedDaySlots.map((slot, index) => {
									const isSelected = Boolean(
										selectedDate && selectedTime === slot.time
									);

									return (
										<motion.button
											animate={{ opacity: 1, scale: 1 }}
											aria-disabled={!slot.available}
											aria-label={`${formatTime(slot.time)}, ${selectedDate && formatDate(selectedDate)}, ${slot.available ? "available" : "unavailable"}`}
											aria-selected={isSelected || undefined}
											className={cn(
												"relative flex h-14 items-center justify-center rounded-full border-2 px-4 text-center font-medium text-base transition-all",
												slot.available
													? "border-foreground/20 hover:scale-105 hover:border-primary hover:bg-primary/10"
													: "cursor-not-allowed border-foreground/10 bg-muted/20 text-foreground/30 opacity-50",
												isSelected &&
													slot.available &&
													"border-primary bg-primary text-primary-foreground"
											)}
											disabled={!slot.available}
											initial={{ opacity: 0, scale: 0.95 }}
											key={slot.time}
											onClick={() =>
												selectedDate &&
												handleTimeSelect(slot.time, selectedDate)
											}
											transition={{ delay: index * 0.02 }}
											type="button"
										>
											{formatTime(slot.time)}
											{isSelected && slot.available && (
												<Check className="ml-2 size-4" />
											)}
										</motion.button>
									);
								})}
							</div>

							{selectedDaySlots.every((slot) => !slot.available) && (
								<motion.div
									animate={{ opacity: 1 }}
									className="flex flex-col items-center gap-4 py-8 text-center"
									initial={{ opacity: 0 }}
								>
									<Clock className="size-12 text-muted-foreground" />
									<div className="space-y-2">
										<p className="font-medium text-base">
											No available time slots
										</p>
										<p className="text-muted-foreground text-sm">
											Please select another date from the calendar
										</p>
									</div>
								</motion.div>
							)}
						</div>
					</motion.div>
				) : (
					<motion.div
						animate={{ opacity: 1, x: 0 }}
						className="flex flex-col gap-6"
						initial={{ opacity: 0, x: -20 }}
					>
						<Calendar
							aria-label="Select appointment date"
							classNames={{
								months: "flex flex-col",
								month: "space-y-4",
								caption: "flex justify-center pt-1 relative items-center mb-4",
								caption_label: "text-base font-semibold",
								nav: "space-x-1 flex items-center",
								nav_button:
									"h-10 w-10 bg-transparent p-0 opacity-70 hover:opacity-100 border border-border hover:bg-muted inline-flex items-center justify-center rounded-md transition-all",
								nav_button_previous: "absolute left-1",
								nav_button_next: "absolute right-1",
								table: "w-full border-collapse",
								head_row: "flex",
								head_cell:
									"text-muted-foreground w-11 font-medium text-sm text-center py-2",
								row: "flex w-full mt-1",
								cell: "relative p-0 text-center focus-within:relative focus-within:z-20",
								day: cn(
									"inline-flex h-11 w-11 items-center justify-center rounded-full p-0 font-normal text-sm transition-all",
									"hover:bg-primary/10 hover:text-foreground",
									"focus:outline-none focus:ring-2 focus:ring-primary",
									"aria-disabled:pointer-events-none aria-disabled:opacity-40"
								),
								day_selected:
									"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-semibold",
								day_today: "border border-primary/50 font-semibold",
								day_outside: "text-muted-foreground/40 opacity-50",
								day_disabled: "text-muted-foreground/40 opacity-40",
								day_hidden: "invisible",
							}}
							defaultMonth={selectedDate ?? new Date()}
							disabled={isDateDisabled}
							mode="single"
							onSelect={handleDateSelect}
							selected={selectedDate ?? undefined}
							showOutsideDays={false}
						/>
					</motion.div>
				)}
			</div>

			{/* Desktop & Tablet: Split Panel Layout */}
			<div className="hidden lg:grid lg:grid-cols-[40%_60%] lg:gap-8">
				{/* Left Panel: Calendar */}
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className="flex flex-col items-center"
					initial={{ opacity: 0, y: 10 }}
				>
					<Calendar
						aria-label="Select appointment date"
						classNames={{
							months: "flex flex-col",
							month: "space-y-4 w-full",
							caption: "flex justify-center pt-1 relative items-center mb-4",
							caption_label: "text-base font-semibold",
							nav: "space-x-1 flex items-center",
							nav_button:
								"h-10 w-10 bg-transparent p-0 opacity-70 hover:opacity-100 border border-border hover:bg-muted inline-flex items-center justify-center rounded-md transition-all",
							nav_button_previous: "absolute left-1",
							nav_button_next: "absolute right-1",
							table: "w-full border-collapse",
							head_row: "flex",
							head_cell:
								"text-muted-foreground w-10 font-medium text-sm text-center py-2",
							row: "flex w-full mt-1",
							cell: "relative p-0 text-center focus-within:relative focus-within:z-20",
							day: cn(
								"inline-flex h-10 w-10 items-center justify-center rounded-full p-0 font-normal text-sm transition-all",
								"hover:bg-primary/10 hover:text-foreground",
								"focus:outline-none focus:ring-2 focus:ring-primary",
								"aria-disabled:pointer-events-none aria-disabled:opacity-40"
							),
							day_selected:
								"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-semibold",
							day_today: "border border-primary/50 font-semibold",
							day_outside: "text-muted-foreground/40 opacity-50",
							day_disabled: "text-muted-foreground/40 opacity-40",
							day_hidden: "invisible",
						}}
						defaultMonth={selectedDate ?? new Date()}
						disabled={isDateDisabled}
						mode="single"
						onSelect={handleDateSelect}
						selected={selectedDate ?? undefined}
						showOutsideDays={false}
					/>
				</motion.div>

				{/* Right Panel: 3-Day Time Slot Grid */}
				<AnimatePresence mode="wait">
					{selectedDate ? (
						<motion.div
							animate={{ opacity: 1, y: 0 }}
							className="relative"
							exit={{ opacity: 0, y: -10 }}
							initial={{ opacity: 0, y: 10 }}
							key={selectedDate.toISOString()}
							transition={{ duration: 0.2 }}
						>
							<section aria-live="polite" className="grid grid-cols-3 gap-4">
								{threeDayView.map((day, dayIndex) => {
									const isToday =
										day.date.toDateString() === new Date().toDateString();

									return (
										<div className="flex flex-col" key={day.date.toISOString()}>
											{/* Column Header */}
											<div
												className={cn(
													"sticky top-0 z-10 mb-3 border-b-2 pb-2 text-center",
													isToday
														? "border-primary bg-background/95"
														: "border-foreground/10 bg-background/80"
												)}
											>
												<h3 className="font-semibold text-sm uppercase tracking-wide">
													{day.date.toLocaleDateString("en-US", {
														weekday: "short",
													})}
												</h3>
												<p className="text-foreground/60 text-xs">
													{day.date.toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
													})}
												</p>
											</div>

											{/* Time Slots */}
											<div className="flex flex-col gap-2">
												{day.slots.length > 0 ? (
													day.slots.map((slot, slotIndex) => {
														const isSelected =
															selectedDate.toDateString() ===
																day.date.toDateString() &&
															selectedTime === slot.time;

														return (
															<motion.button
																animate={{ opacity: 1, scale: 1 }}
																aria-disabled={!slot.available}
																aria-label={`${formatTime(slot.time)}, ${formatDate(day.date)}, ${slot.available ? "available" : "unavailable"}`}
																aria-selected={isSelected || undefined}
																className={cn(
																	"relative flex h-12 min-h-[44px] items-center justify-center rounded-full border-2 px-3 text-center font-medium text-sm transition-all",
																	slot.available
																		? "border-foreground/20 hover:scale-105 hover:border-primary hover:bg-primary/10"
																		: "cursor-not-allowed border-foreground/10 bg-muted/20 text-foreground/30 opacity-50",
																	isSelected &&
																		slot.available &&
																		"border-primary bg-primary text-primary-foreground shadow-md"
																)}
																disabled={!slot.available}
																initial={{ opacity: 0, scale: 0.95 }}
																key={slot.time}
																onClick={() =>
																	handleTimeSelect(slot.time, day.date)
																}
																transition={{
																	delay: dayIndex * 0.05 + slotIndex * 0.02,
																}}
																type="button"
															>
																{formatTime(slot.time)}
																{isSelected && slot.available && (
																	<Check className="ml-1 size-4" />
																)}
															</motion.button>
														);
													})
												) : (
													<motion.div
														animate={{ opacity: 1 }}
														className="flex h-32 items-center justify-center text-center"
														initial={{ opacity: 0 }}
													>
														<p className="text-muted-foreground text-sm">
															No slots available
														</p>
													</motion.div>
												)}
											</div>
										</div>
									);
								})}
							</section>

							{/* Empty State */}
							{threeDayView.every((day) =>
								day.slots.every((slot) => !slot.available)
							) && (
								<motion.div
									animate={{ opacity: 1 }}
									className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm"
									initial={{ opacity: 0 }}
								>
									<Clock className="size-16 text-muted-foreground" />
									<div className="space-y-2 text-center">
										<p className="font-medium text-lg">
											No available time slots
										</p>
										<p className="text-muted-foreground text-sm">
											Please select another date from the calendar
										</p>
									</div>
								</motion.div>
							)}
						</motion.div>
					) : (
						<motion.div
							animate={{ opacity: 1 }}
							className="flex flex-col items-center justify-center gap-4 py-16"
							initial={{ opacity: 0 }}
						>
							<Clock className="size-16 text-muted-foreground/40" />
							<p className="text-base text-muted-foreground">
								Select a date to view available times
							</p>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Selected Slot Summary & Action */}
			<AnimatePresence>
				{isSlotSelected && (
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className="flex flex-col items-center gap-6"
						exit={{ opacity: 0, y: 10 }}
						initial={{ opacity: 0, y: 10 }}
					>
						<div className="rounded-md border-2 border-primary/20 bg-primary/5 px-6 py-4 text-center">
							<p className="text-base">
								<span className="text-foreground/60">Selected: </span>
								<span className="font-semibold">
									{formatDate(selectedDate)} at {formatTime(selectedTime)}
								</span>
							</p>
						</div>

						<Button
							aria-label="Confirm booking and proceed to next step"
							className="h-14 min-w-48 rounded-md border-2 border-foreground bg-foreground font-semibold text-background text-base transition-all hover:bg-background hover:text-foreground"
							disabled={!isSlotSelected || isBooking}
							onClick={handleConfirm}
						>
							{isBooking ? (
								<>
									<Loader2 className="mr-2 size-5 animate-spin" />
									Booking...
								</>
							) : (
								"Confirm Booking"
							)}
						</Button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
