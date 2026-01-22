import { db } from "@collab/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
	createCalendarEvent,
	deleteCalendarEvent,
	isGoogleCalendarConfigured,
	updateCalendarEvent,
} from "../google-calendar";
import { publicProcedure, router } from "../index";

const generateMeetId = (): string => {
	const chars = "abcdefghijklmnopqrstuvwxyz";
	const segments = [3, 4, 3];
	return segments
		.map((len) =>
			Array.from(
				{ length: len },
				() => chars[Math.floor(Math.random() * chars.length)]
			).join("")
		)
		.join("-");
};

const generateEventId = (): string => {
	return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

const parseTime = (time: string): { hours: number; minutes: number } => {
	const parts = time.split(":").map(Number);
	return { hours: parts[0] ?? 0, minutes: parts[1] ?? 0 };
};

const isTimeWithinRange = (
	time: string,
	startTime: string,
	endTime: string
): boolean => {
	const { hours: h, minutes: m } = parseTime(time);
	const { hours: startH, minutes: startM } = parseTime(startTime);
	const { hours: endH, minutes: endM } = parseTime(endTime);

	const timeMinutes = h * 60 + m;
	const startMinutes = startH * 60 + startM;
	const endMinutes = endH * 60 + endM;

	return timeMinutes >= startMinutes && timeMinutes < endMinutes;
};

const isSlotEndWithinRange = (
	startTime: string,
	duration: number,
	endTimeLimit: string
): boolean => {
	const { hours: startH, minutes: startM } = parseTime(startTime);
	const { hours: endH, minutes: endM } = parseTime(endTimeLimit);

	const slotEndMinutes = startH * 60 + startM + duration;
	const endLimitMinutes = endH * 60 + endM;

	return slotEndMinutes <= endLimitMinutes;
};

export const meetingsRouter = router({
	book: publicProcedure
		.input(
			z.object({
				leadId: z.string(),
				date: z.string(), // ISO date string (YYYY-MM-DD)
				startTime: z
					.string()
					.regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format"),
				duration: z.number().min(15).max(480),
				timezone: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const { leadId, date, startTime, duration, timezone: _timezone } = input;

			// Verify the lead exists
			const lead = await db
				.selectFrom("lead")
				.selectAll()
				.where("id", "=", leadId)
				.executeTakeFirst();

			if (!lead) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Lead not found",
				});
			}

			// Parse the date and get day of week (0 = Sunday, 6 = Saturday)
			const meetingDate = new Date(date);
			const dayOfWeek = meetingDate.getDay();

			// Check working hours for this day
			const workingHours = await db
				.selectFrom("working_hours")
				.selectAll()
				.where("dayOfWeek", "=", dayOfWeek)
				.executeTakeFirst();

			if (!workingHours?.isEnabled) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "SLOT_UNAVAILABLE",
				});
			}

			// Check if requested time is within working hours
			if (
				!isTimeWithinRange(
					startTime,
					workingHours.startTime,
					workingHours.endTime
				)
			) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "SLOT_UNAVAILABLE",
				});
			}

			// Check if the meeting end time is within working hours
			if (!isSlotEndWithinRange(startTime, duration, workingHours.endTime)) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "SLOT_UNAVAILABLE",
				});
			}

			// Calculate the scheduled datetime
			const { hours, minutes } = parseTime(startTime);
			const scheduledAt = new Date(date);
			scheduledAt.setHours(hours, minutes, 0, 0);

			const meetingEndTime = new Date(
				scheduledAt.getTime() + duration * 60 * 1000
			);

			// Check for conflicting meetings
			const conflictingMeeting = await db
				.selectFrom("meeting")
				.selectAll()
				.where("status", "<>", "CANCELLED")
				.where("scheduledAt", "<=", scheduledAt)
				.where(
					"scheduledAt",
					">=",
					new Date(scheduledAt.getTime() - 480 * 60 * 1000)
				)
				.executeTakeFirst();

			// More precise conflict check
			if (conflictingMeeting) {
				const existingStart = new Date(conflictingMeeting.scheduledAt);
				const existingEnd = new Date(
					existingStart.getTime() + conflictingMeeting.duration * 60 * 1000
				);

				const newStart = scheduledAt;
				const newEnd = meetingEndTime;

				// Check if there's an actual overlap
				const hasOverlap = newStart < existingEnd && newEnd > existingStart;

				if (hasOverlap) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "SLOT_UNAVAILABLE",
					});
				}
			}

			// Check for availability blocks that conflict with this slot
			const conflictingBlock = await db
				.selectFrom("availability_block")
				.selectAll()
				.where("startDate", "<=", meetingEndTime)
				.where("endDate", ">", scheduledAt)
				.executeTakeFirst();

			if (conflictingBlock) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "SLOT_UNAVAILABLE",
				});
			}

			// Create Google Calendar event if configured, otherwise use placeholder
			let eventId: string;
			let meetUrl: string;

			if (isGoogleCalendarConfigured()) {
				try {
					const calendarResult = await createCalendarEvent({
						summary: `Meeting with ${lead.name}`,
						description: `Discovery call with ${lead.name} (${lead.email})`,
						startTime: scheduledAt,
						endTime: meetingEndTime,
						attendeeEmail: lead.email,
						attendeeName: lead.name as string,
						timezone: input.timezone,
					});
					eventId = calendarResult.eventId;
					meetUrl =
						calendarResult.meetUrl ??
						`https://meet.google.com/${generateMeetId()}`;
				} catch (error) {
					console.error("Failed to create Google Calendar event:", error);
					// Fall back to placeholder if Google Calendar fails
					eventId = generateEventId();
					meetUrl = `https://meet.google.com/${generateMeetId()}`;
				}
			} else {
				// Use placeholder IDs when Google Calendar is not configured
				eventId = generateEventId();
				meetUrl = `https://meet.google.com/${generateMeetId()}`;
			}

			// Create the meeting
			const meeting = await db
				.insertInto("meeting")
				.values({
					id: crypto.randomUUID(),
					leadId,
					eventId,
					meetUrl,
					title: `Meeting with ${lead.name}`,
					scheduledAt,
					duration,
					status: "SCHEDULED",
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returningAll()
				.executeTakeFirstOrThrow();

			// Update lead status to MEETING_SCHEDULED
			await db
				.updateTable("lead")
				.set({ status: "MEETING_SCHEDULED" })
				.where("id", "=", leadId)
				.execute();

			return {
				success: true as const,
				meeting: {
					id: meeting.id,
					eventId: meeting.eventId,
					meetUrl: meeting.meetUrl,
					scheduledAt: meeting.scheduledAt,
					duration: meeting.duration,
				},
			};
		}),

	cancel: publicProcedure
		.input(
			z.object({
				meetingId: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const { meetingId } = input;

			const meeting = await db
				.selectFrom("meeting")
				.selectAll()
				.where("id", "=", meetingId)
				.executeTakeFirst();

			if (!meeting) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Meeting not found",
				});
			}

			// Delete from Google Calendar if configured and has a real event ID
			if (
				isGoogleCalendarConfigured() &&
				meeting.eventId &&
				!meeting.eventId.startsWith("evt_")
			) {
				try {
					await deleteCalendarEvent(meeting.eventId);
				} catch (error) {
					console.error("Failed to delete Google Calendar event:", error);
					// Continue with local cancellation even if Google Calendar fails
				}
			}

			// Update meeting status
			const updatedMeeting = await db
				.updateTable("meeting")
				.set({ status: "CANCELLED" })
				.where("id", "=", meetingId)
				.returningAll()
				.executeTakeFirstOrThrow();

			return {
				success: true as const,
				meeting: updatedMeeting,
			};
		}),

	reschedule: publicProcedure
		.input(
			z.object({
				meetingId: z.string(),
				date: z.string(),
				startTime: z
					.string()
					.regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format"),
				duration: z.number().min(15).max(480).optional(),
				timezone: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const { meetingId, date, startTime, duration, timezone } = input;

			const meeting = await db
				.selectFrom("meeting as m")
				.innerJoin("lead as l", "m.leadId", "l.id")
				.select([
					"m.id",
					"m.eventId",
					"m.meetUrl",
					"m.duration",
					"m.scheduledAt",
					"l.id as lead_id",
					"l.name as lead_name",
					"l.email as lead_email",
				])
				.where("m.id", "=", meetingId)
				.executeTakeFirst();

			if (!meeting) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Meeting not found",
				});
			}

			// Calculate new scheduled time
			const { hours, minutes } = parseTime(startTime);
			const newScheduledAt = new Date(date);
			newScheduledAt.setHours(hours, minutes, 0, 0);

			const newDuration = duration ?? meeting.duration;
			const newEndTime = new Date(
				newScheduledAt.getTime() + newDuration * 60 * 1000
			);

			// Update Google Calendar if configured and has a real event ID
			let newEventId = meeting.eventId;
			let newMeetUrl = meeting.meetUrl;

			if (
				isGoogleCalendarConfigured() &&
				meeting.eventId &&
				!meeting.eventId.startsWith("evt_")
			) {
				try {
					const calendarResult = await updateCalendarEvent(meeting.eventId, {
						startTime: newScheduledAt,
						endTime: newEndTime,
						timezone,
					});
					newEventId = calendarResult.eventId;
					if (calendarResult.meetUrl) {
						newMeetUrl = calendarResult.meetUrl;
					}
				} catch (error) {
					console.error("Failed to update Google Calendar event:", error);
					// Continue with local update even if Google Calendar fails
				}
			}

			// Update meeting in database
			const updatedMeeting = await db
				.updateTable("meeting")
				.set({
					scheduledAt: newScheduledAt,
					duration: newDuration,
					eventId: newEventId,
					meetUrl: newMeetUrl,
				})
				.where("id", "=", meetingId)
				.returningAll()
				.executeTakeFirstOrThrow();

			return {
				success: true as const,
				meeting: {
					id: updatedMeeting.id,
					eventId: updatedMeeting.eventId,
					meetUrl: updatedMeeting.meetUrl,
					scheduledAt: updatedMeeting.scheduledAt,
					duration: updatedMeeting.duration,
				},
			};
		}),

	getCalendarStatus: publicProcedure.query(() => {
		return {
			configured: isGoogleCalendarConfigured(),
		};
	}),
});

export type MeetingsRouter = typeof meetingsRouter;
