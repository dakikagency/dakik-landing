import prisma from "@collab/db";
import { z } from "zod";

import {
	getFreeBusyTimes,
	isGoogleCalendarConfigured,
} from "../google-calendar";
import { publicProcedure, router } from "../index";

const getSlotsInputSchema = z.object({
	startDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
		message: "Invalid ISO date string",
	}),
	endDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
		message: "Invalid ISO date string",
	}),
	duration: z.number().min(15).max(480).default(30),
});

export interface TimeSlot {
	start: string;
	end: string;
	available: boolean;
}

export interface DaySlots {
	date: string;
	times: TimeSlot[];
}

/**
 * Parse a time string (HH:mm) into minutes from midnight
 */
function parseTimeToMinutes(time: string): number {
	const parts = time.split(":");
	const hours = Number(parts[0]) || 0;
	const minutes = Number(parts[1]) || 0;
	return hours * 60 + minutes;
}

/**
 * Format minutes from midnight to HH:mm string
 */
function formatMinutesToTime(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

/**
 * Check if two time ranges overlap
 */
function timeRangesOverlap(
	start1: Date,
	end1: Date,
	start2: Date,
	end2: Date
): boolean {
	return start1 < end2 && end1 > start2;
}

export const availabilityRouter = router({
	getSlots: publicProcedure
		.input(getSlotsInputSchema)
		.query(async ({ input }) => {
			const { startDate, endDate, duration } = input;

			const start = new Date(startDate);
			const end = new Date(endDate);

			// Set time boundaries for the date range
			start.setHours(0, 0, 0, 0);
			end.setHours(23, 59, 59, 999);

			// Fetch all required data in parallel
			const [workingHours, meetings, availabilityBlocks, googleBusyTimes] =
				await Promise.all([
					prisma.workingHours.findMany({
						where: { isEnabled: true },
					}),
					prisma.meeting.findMany({
						where: {
							scheduledAt: {
								gte: start,
								lte: end,
							},
							status: {
								in: ["SCHEDULED", "COMPLETED"],
							},
						},
						select: {
							scheduledAt: true,
							duration: true,
						},
					}),
					prisma.availabilityBlock.findMany({
						where: {
							OR: [
								{
									startDate: { lte: end },
									endDate: { gte: start },
								},
							],
						},
						select: {
							startDate: true,
							endDate: true,
						},
					}),
					// Fetch Google Calendar busy times if configured
					isGoogleCalendarConfigured()
						? getFreeBusyTimes(start, end).catch((error) => {
								console.error(
									"Failed to fetch Google Calendar busy times:",
									error
								);
								return [];
							})
						: Promise.resolve([]),
				]);

			// Create a map of working hours by day of week
			const workingHoursMap = new Map<
				number,
				{ startTime: string; endTime: string }
			>();
			for (const wh of workingHours) {
				workingHoursMap.set(wh.dayOfWeek, {
					startTime: wh.startTime,
					endTime: wh.endTime,
				});
			}

			const slots: DaySlots[] = [];

			// Generate slots for each day in the range
			const currentDate = new Date(start);
			while (currentDate <= end) {
				const dayOfWeek = currentDate.getDay();
				const workingHoursForDay = workingHoursMap.get(dayOfWeek);

				const dateString = currentDate.toISOString().split("T")[0] as string;
				const daySlots: TimeSlot[] = [];

				if (workingHoursForDay) {
					const startMinutes = parseTimeToMinutes(workingHoursForDay.startTime);
					const endMinutes = parseTimeToMinutes(workingHoursForDay.endTime);

					// Generate time slots based on duration
					for (
						let slotStart = startMinutes;
						slotStart + duration <= endMinutes;
						slotStart += duration
					) {
						const slotEnd = slotStart + duration;

						const slotStartTime = formatMinutesToTime(slotStart);
						const slotEndTime = formatMinutesToTime(slotEnd);

						// Create actual Date objects for this slot
						const slotStartDate = new Date(currentDate);
						slotStartDate.setHours(
							Math.floor(slotStart / 60),
							slotStart % 60,
							0,
							0
						);

						const slotEndDate = new Date(currentDate);
						slotEndDate.setHours(Math.floor(slotEnd / 60), slotEnd % 60, 0, 0);

						// Check if slot overlaps with any meeting
						const hasConflictingMeeting = meetings.some((meeting) => {
							const meetingStart = new Date(meeting.scheduledAt);
							const meetingEnd = new Date(
								meetingStart.getTime() + meeting.duration * 60 * 1000
							);
							return timeRangesOverlap(
								slotStartDate,
								slotEndDate,
								meetingStart,
								meetingEnd
							);
						});

						// Check if slot overlaps with any availability block
						const hasConflictingBlock = availabilityBlocks.some((block) => {
							return timeRangesOverlap(
								slotStartDate,
								slotEndDate,
								new Date(block.startDate),
								new Date(block.endDate)
							);
						});

						// Check if slot overlaps with any Google Calendar busy time
						const hasGoogleConflict = googleBusyTimes.some((busyTime) => {
							return timeRangesOverlap(
								slotStartDate,
								slotEndDate,
								busyTime.start,
								busyTime.end
							);
						});

						// Check if slot is in the past
						const isPast = slotStartDate < new Date();

						daySlots.push({
							start: slotStartTime,
							end: slotEndTime,
							available: !(
								hasConflictingMeeting ||
								hasConflictingBlock ||
								hasGoogleConflict ||
								isPast
							),
						});
					}
				}

				slots.push({
					date: dateString,
					times: daySlots,
				});

				// Move to next day
				currentDate.setDate(currentDate.getDate() + 1);
			}

			// Return with a default timezone - in production this could be configurable
			return {
				slots,
				timezone: "UTC",
			};
		}),
});
