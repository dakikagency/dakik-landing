/**
 * Google Calendar API Client Configuration
 * OAuth Scopes Required:
 * - https://www.googleapis.com/auth/calendar.events - Create/manage events
 * - https://www.googleapis.com/auth/calendar.readonly - Read calendar data
 */

import { type calendar_v3, google } from "googleapis";

export const oauth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CALENDAR_CLIENT_ID,
	process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
	process.env.NODE_ENV === "production"
		? "https://your-domain.com/api/auth/google/callback"
		: "http://localhost:8787/api/auth/google/callback",
);

oauth2Client.setCredentials({
	refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
});

export const calendar = google.calendar({
	version: "v3",
	auth: oauth2Client,
});

export interface TimeSlot {
	start: Date;
	end: Date;
}

export interface AvailabilityResult {
	email: string;
	busySlots: TimeSlot[];
	freeSlots: TimeSlot[];
}

export interface CreateEventParams {
	summary: string;
	description?: string;
	start: Date;
	end: Date;
	attendees?: string[];
	timeZone?: string;
	location?: string;
}

export interface EventCreatedResult {
	id: string;
	htmlLink: string;
	summary: string;
	start: Date;
	end: Date;
}

export function getCalendarId(): string {
	return process.env.GOOGLE_CALENDAR_ID || "primary";
}

export async function getAvailability(
	emails: string[],
	timeMin?: Date,
	timeMax?: Date,
): Promise<AvailabilityResult[]> {
	const now = timeMin || new Date();
	const weekFromNow = timeMax || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

	const response = await calendar.freebusy.query({
		requestBody: {
			timeMin: now.toISOString(),
			timeMax: weekFromNow.toISOString(),
			items: emails.map((email) => ({ id: email })),
		},
	});

	const result: AvailabilityResult[] = [];

	for (const email of emails) {
		const busyRanges = response.data.calendars?.[email]?.busy ?? [];

		const busySlots: TimeSlot[] = busyRanges.map((range) => ({
			start: new Date(range.start ?? now),
			end: new Date(range.end ?? weekFromNow),
		}));

		const freeSlots = calculateFreeSlots(now, weekFromNow, busySlots);

		result.push({
			email,
			busySlots,
			freeSlots,
		});
	}

	return result;
}

function calculateFreeSlots(
	start: Date,
	end: Date,
	busySlots: TimeSlot[],
): TimeSlot[] {
	if (busySlots.length === 0) {
		return [{ start, end }];
	}

	const sorted = [...busySlots].sort(
		(a, b) => a.start.getTime() - b.start.getTime(),
	);
	const freeSlots: TimeSlot[] = [];

	let currentStart = start;

	for (const busy of sorted) {
		if (currentStart < busy.start) {
			freeSlots.push({
				start: currentStart,
				end: busy.start,
			});
		}
		if (busy.end > currentStart) {
			currentStart = busy.end;
		}
	}

	if (currentStart < end) {
		freeSlots.push({
			start: currentStart,
			end,
		});
	}

	return freeSlots;
}

export async function createCalendarEvent(
	params: CreateEventParams,
): Promise<EventCreatedResult> {
	const calendarId = getCalendarId();

	const event: calendar_v3.Schema$Event = {
		summary: params.summary,
		description: params.description,
		location: params.location,
		start: {
			dateTime: params.start.toISOString(),
			timeZone: params.timeZone || "UTC",
		},
		end: {
			dateTime: params.end.toISOString(),
			timeZone: params.timeZone || "UTC",
		},
		attendees: params.attendees?.map((email) => ({ email })),
		reminders: {
			useDefault: false,
			overrides: [
				{ method: "email", minutes: 1440 },
				{ method: "popup", minutes: 30 },
			],
		},
	};

	const response = await calendar.events.insert({
		calendarId,
		requestBody: event,
		sendUpdates: "all",
	});

	const createdEvent = response.data;
	const eventId = createdEvent?.id;
	const eventLink = createdEvent?.htmlLink;
	const eventSummary = createdEvent?.summary;
	const eventStart = createdEvent?.start?.dateTime;
	const eventEnd = createdEvent?.end?.dateTime;

	const isValidEvent = Boolean(eventId && eventLink);
	if (!isValidEvent) {
		throw new Error("Failed to create calendar event: Missing response data");
	}

	return {
		id: eventId as string,
		htmlLink: eventLink as string,
		summary: eventSummary ?? params.summary,
		start: new Date(eventStart ?? params.start),
		end: new Date(eventEnd ?? params.end),
	};
}

export async function isSlotAvailable(
	start: Date,
	end: Date,
	emails?: string[],
): Promise<boolean> {
	const checkEmails = emails ?? [process.env.GOOGLE_CALENDAR_ID ?? "primary"];

	const availability = await getAvailability(checkEmails, start, end);

	for (const cal of availability) {
		const hasConflict = cal.busySlots.some(
			(busy) => busy.start < end && busy.end > start,
		);
		if (hasConflict) {
			return false;
		}
	}

	return true;
}

export async function getUpcomingEvents(
	maxResults = 10,
	timeMin?: Date,
): Promise<calendar_v3.Schema$Event[]> {
	const calendarId = getCalendarId();

	const response = await calendar.events.list({
		calendarId,
		timeMin: (timeMin ?? new Date()).toISOString(),
		maxResults,
		singleEvents: true,
		orderBy: "startTime",
	});

	return response.data.items ?? [];
}
