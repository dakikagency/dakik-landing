import { env } from "@collab/env/server";
import type { calendar_v3 } from "googleapis";
import { google } from "googleapis";

/**
 * Check if Google Calendar is configured
 */
export function isGoogleCalendarConfigured(): boolean {
	return Boolean(
		env.GOOGLE_CALENDAR_CLIENT_ID &&
			env.GOOGLE_CALENDAR_CLIENT_SECRET &&
			env.GOOGLE_CALENDAR_REFRESH_TOKEN &&
			env.GOOGLE_CALENDAR_ID
	);
}

/**
 * Create an OAuth2 client for Google Calendar API
 */
function createOAuth2Client() {
	if (!isGoogleCalendarConfigured()) {
		throw new Error("Google Calendar is not configured");
	}

	const oauth2Client = new google.auth.OAuth2(
		env.GOOGLE_CALENDAR_CLIENT_ID,
		env.GOOGLE_CALENDAR_CLIENT_SECRET
	);

	oauth2Client.setCredentials({
		refresh_token: env.GOOGLE_CALENDAR_REFRESH_TOKEN,
	});

	return oauth2Client;
}

/**
 * Get the Google Calendar API client
 */
function getCalendarClient(): calendar_v3.Calendar {
	const auth = createOAuth2Client();
	return google.calendar({ version: "v3", auth });
}

export interface CreateEventParams {
	summary: string;
	description?: string;
	startTime: Date;
	endTime: Date;
	attendeeEmail?: string;
	attendeeName?: string;
	timezone?: string;
}

export interface CalendarEventResult {
	eventId: string;
	meetUrl: string | null;
	htmlLink: string | null;
}

/**
 * Create a calendar event with Google Meet
 */
export async function createCalendarEvent(
	params: CreateEventParams
): Promise<CalendarEventResult> {
	const calendar = getCalendarClient();
	const calendarId = env.GOOGLE_CALENDAR_ID;

	const attendees: calendar_v3.Schema$EventAttendee[] = [];
	if (params.attendeeEmail) {
		attendees.push({
			email: params.attendeeEmail,
			displayName: params.attendeeName,
		});
	}

	const event: calendar_v3.Schema$Event = {
		summary: params.summary,
		description: params.description,
		start: {
			dateTime: params.startTime.toISOString(),
			timeZone: params.timezone ?? "UTC",
		},
		end: {
			dateTime: params.endTime.toISOString(),
			timeZone: params.timezone ?? "UTC",
		},
		attendees,
		conferenceData: {
			createRequest: {
				requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
				conferenceSolutionKey: {
					type: "hangoutsMeet",
				},
			},
		},
		reminders: {
			useDefault: false,
			overrides: [
				{ method: "email", minutes: 24 * 60 }, // 24 hours before
				{ method: "popup", minutes: 30 }, // 30 minutes before
			],
		},
	};

	const response = await calendar.events.insert({
		calendarId,
		requestBody: event,
		conferenceDataVersion: 1,
		sendUpdates: "all",
	});

	const meetUrl =
		response.data.conferenceData?.entryPoints?.find(
			(ep) => ep.entryPointType === "video"
		)?.uri ?? null;

	return {
		eventId: response.data.id ?? "",
		meetUrl,
		htmlLink: response.data.htmlLink ?? null,
	};
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(
	eventId: string,
	params: Partial<CreateEventParams>
): Promise<CalendarEventResult> {
	const calendar = getCalendarClient();
	const calendarId = env.GOOGLE_CALENDAR_ID;

	const updateData: calendar_v3.Schema$Event = {};

	if (params.summary) {
		updateData.summary = params.summary;
	}

	if (params.description !== undefined) {
		updateData.description = params.description;
	}

	if (params.startTime) {
		updateData.start = {
			dateTime: params.startTime.toISOString(),
			timeZone: params.timezone ?? "UTC",
		};
	}

	if (params.endTime) {
		updateData.end = {
			dateTime: params.endTime.toISOString(),
			timeZone: params.timezone ?? "UTC",
		};
	}

	if (params.attendeeEmail) {
		updateData.attendees = [
			{
				email: params.attendeeEmail,
				displayName: params.attendeeName,
			},
		];
	}

	const response = await calendar.events.patch({
		calendarId,
		eventId,
		requestBody: updateData,
		sendUpdates: "all",
	});

	const meetUrl =
		response.data.conferenceData?.entryPoints?.find(
			(ep) => ep.entryPointType === "video"
		)?.uri ?? null;

	return {
		eventId: response.data.id ?? "",
		meetUrl,
		htmlLink: response.data.htmlLink ?? null,
	};
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
	const calendar = getCalendarClient();
	const calendarId = env.GOOGLE_CALENDAR_ID;

	try {
		await calendar.events.delete({
			calendarId,
			eventId,
			sendUpdates: "all",
		});
		return true;
	} catch (error) {
		console.error("Failed to delete calendar event:", error);
		return false;
	}
}

export interface FreeBusyTimeSlot {
	start: Date;
	end: Date;
}

/**
 * Get free/busy times from Google Calendar
 */
export async function getFreeBusyTimes(
	startTime: Date,
	endTime: Date
): Promise<FreeBusyTimeSlot[]> {
	const calendar = getCalendarClient();
	const calendarId = env.GOOGLE_CALENDAR_ID;

	const response = await calendar.freebusy.query({
		requestBody: {
			timeMin: startTime.toISOString(),
			timeMax: endTime.toISOString(),
			items: [{ id: calendarId }],
		},
	});

	const busySlots = response.data.calendars?.[calendarId]?.busy ?? [];

	return busySlots
		.filter(
			(slot): slot is { start: string; end: string } =>
				Boolean(slot.start) && Boolean(slot.end)
		)
		.map((slot) => ({
			start: new Date(slot.start),
			end: new Date(slot.end),
		}));
}

/**
 * Get calendar events within a time range
 */
export async function getCalendarEvents(
	startTime: Date,
	endTime: Date
): Promise<calendar_v3.Schema$Event[]> {
	const calendar = getCalendarClient();
	const calendarId = env.GOOGLE_CALENDAR_ID;

	const response = await calendar.events.list({
		calendarId,
		timeMin: startTime.toISOString(),
		timeMax: endTime.toISOString(),
		singleEvents: true,
		orderBy: "startTime",
	});

	return response.data.items ?? [];
}
