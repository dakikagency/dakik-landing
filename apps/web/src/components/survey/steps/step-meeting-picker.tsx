"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Globe, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
	const ampm = hour >= 12 ? "PM" : "AM";
	const displayHour = hour % 12 || 12;
	return `${displayHour}:${minutes} ${ampm}`;
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
		}
	};

	const handleTimeSelect = (time: string) => {
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
			<div className="flex w-full max-w-2xl flex-col items-center justify-center gap-4 py-16">
				<Loader2 className="size-8 animate-spin text-muted-foreground" />
				<p className="text-muted-foreground text-sm">
					Loading available times...
				</p>
			</div>
		);
	}

	// Error state
	if (isError) {
		return (
			<div className="flex w-full max-w-2xl flex-col items-center justify-center gap-4 py-16">
				<p className="text-destructive text-sm">
					Failed to load available times. Please try again.
				</p>
				<Button onClick={prevStep} type="button" variant="outline">
					Go Back
				</Button>
			</div>
		);
	}

	return (
		<div className="flex w-full max-w-2xl flex-col gap-8">
			{/* Header */}
			<div className="space-y-2">
				<h2 className="font-medium text-2xl">Schedule a Meeting</h2>
				<p className="text-muted-foreground text-sm">
					Select a convenient time for a 30-minute discovery call
				</p>
			</div>

			{/* Timezone indicator */}
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="flex items-center gap-2 text-muted-foreground text-sm"
				initial={{ opacity: 0, y: -10 }}
			>
				<Globe className="size-4" />
				<span>Times shown in {timezone}</span>
			</motion.div>

			{/* Inline Calendar */}
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="flex justify-center"
				initial={{ opacity: 0, y: 10 }}
			>
				<Calendar
					classNames={{
						months: "flex flex-col",
						month: "space-y-4",
						caption: "flex justify-center pt-1 relative items-center mb-4",
						caption_label: "text-base font-medium",
						nav: "space-x-1 flex items-center",
						nav_button:
							"h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 border border-border hover:bg-muted inline-flex items-center justify-center",
						nav_button_previous: "absolute left-1",
						nav_button_next: "absolute right-1",
						table: "w-full border-collapse",
						head_row: "flex",
						head_cell:
							"text-muted-foreground w-10 font-medium text-xs text-center py-2",
						row: "flex w-full",
						cell: "relative p-0 text-center focus-within:relative focus-within:z-20",
						day: cn(
							"inline-flex h-10 w-10 items-center justify-center p-0 font-normal text-sm transition-colors",
							"hover:bg-muted hover:text-foreground",
							"focus:outline-none focus:ring-1 focus:ring-ring",
							"aria-disabled:pointer-events-none aria-disabled:opacity-40"
						),
						day_selected:
							"bg-foreground text-background hover:bg-foreground hover:text-background",
						day_today: "border border-foreground/30",
						day_outside: "text-muted-foreground/40",
						day_disabled: "text-muted-foreground/40",
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

			{/* Time slots grid */}
			<AnimatePresence mode="wait">
				{selectedDate && (
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className="space-y-4"
						exit={{ opacity: 0, y: -10 }}
						initial={{ opacity: 0, y: 10 }}
						key={selectedDate.toISOString()}
						transition={{ duration: 0.2 }}
					>
						<div className="flex items-center gap-2">
							<Clock className="size-4 text-muted-foreground" />
							<span className="font-medium text-sm">
								Available times for {formatDate(selectedDate)}
							</span>
						</div>

						<div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
							{selectedDaySlots.map((slot) => {
								const isSelected = selectedTime === slot.time;

								return (
									<motion.button
										animate={{ opacity: 1, scale: 1 }}
										className={cn(
											"relative border px-4 py-3 text-center text-sm transition-colors",
											slot.available
												? "hover:border-foreground/30 hover:bg-muted/50"
												: "cursor-not-allowed bg-muted/30 text-muted-foreground/50 line-through",
											isSelected &&
												slot.available &&
												"border-foreground bg-muted"
										)}
										disabled={!slot.available}
										initial={{ opacity: 0, scale: 0.95 }}
										key={slot.time}
										onClick={() => handleTimeSelect(slot.time)}
										type="button"
										whileHover={slot.available ? { scale: 1.02 } : undefined}
										whileTap={slot.available ? { scale: 0.98 } : undefined}
									>
										{formatTime(slot.time)}

										{isSelected && slot.available && (
											<motion.div
												animate={{ opacity: 1 }}
												className="absolute inset-0 border-2 border-foreground"
												initial={{ opacity: 0 }}
												layoutId="time-highlight"
												transition={{ duration: 0.15 }}
											/>
										)}
									</motion.button>
								);
							})}
						</div>

						{/* No available slots message */}
						{selectedDaySlots.every((slot) => !slot.available) && (
							<motion.p
								animate={{ opacity: 1 }}
								className="text-center text-muted-foreground text-sm"
								initial={{ opacity: 0 }}
							>
								No available slots for this date. Please select another date.
							</motion.p>
						)}
					</motion.div>
				)}
			</AnimatePresence>

			{/* Selected slot summary */}
			<AnimatePresence>
				{isSlotSelected && (
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className="border border-foreground/20 bg-muted/30 p-4"
						exit={{ opacity: 0, y: 10 }}
						initial={{ opacity: 0, y: 10 }}
					>
						<p className="text-sm">
							<span className="text-muted-foreground">Selected: </span>
							<span className="font-medium">
								{formatDate(selectedDate)} at {formatTime(selectedTime)}
							</span>
						</p>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Actions */}
			<div className="flex justify-between pt-4">
				<Button
					disabled={isBooking}
					onClick={prevStep}
					type="button"
					variant="ghost"
				>
					Back
				</Button>
				<Button
					className="min-w-40"
					disabled={!isSlotSelected || isBooking}
					onClick={handleConfirm}
				>
					{isBooking ? (
						<>
							<Loader2 className="mr-2 size-4 animate-spin" />
							Booking...
						</>
					) : (
						"Confirm Booking"
					)}
				</Button>
			</div>
		</div>
	);
}
