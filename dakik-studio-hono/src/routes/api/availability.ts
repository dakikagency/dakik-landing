import { google } from "googleapis";
import { Hono } from "hono";

// Default working window if the WorkingHours table is empty.
// Mon-Fri 09:00–18:00, weekends off.
const DEFAULT_WORKING_HOURS = [
	{ dayOfWeek: 0, startTime: "00:00", endTime: "00:00", isEnabled: false },
	{ dayOfWeek: 1, startTime: "09:00", endTime: "18:00", isEnabled: true },
	{ dayOfWeek: 2, startTime: "09:00", endTime: "18:00", isEnabled: true },
	{ dayOfWeek: 3, startTime: "09:00", endTime: "18:00", isEnabled: true },
	{ dayOfWeek: 4, startTime: "09:00", endTime: "18:00", isEnabled: true },
	{ dayOfWeek: 5, startTime: "09:00", endTime: "18:00", isEnabled: true },
	{ dayOfWeek: 6, startTime: "00:00", endTime: "00:00", isEnabled: false },
];

interface BusyRange {
	start: Date;
	end: Date;
}

async function fetchGoogleCalendarBusy(
	env: {
		GOOGLE_CALENDAR_CLIENT_ID?: string;
		GOOGLE_CALENDAR_CLIENT_SECRET?: string;
		GOOGLE_CALENDAR_REFRESH_TOKEN?: string;
		GOOGLE_CALENDAR_ID?: string;
	},
	timeMin: Date,
	timeMax: Date,
): Promise<BusyRange[]> {
	if (
		!(
			env.GOOGLE_CALENDAR_CLIENT_ID &&
			env.GOOGLE_CALENDAR_CLIENT_SECRET &&
			env.GOOGLE_CALENDAR_REFRESH_TOKEN
		)
	) {
		return [];
	}

	const oauth2Client = new google.auth.OAuth2(
		env.GOOGLE_CALENDAR_CLIENT_ID,
		env.GOOGLE_CALENDAR_CLIENT_SECRET,
		"https://oauth2.googleapis.com/token",
	);
	oauth2Client.setCredentials({
		refresh_token: env.GOOGLE_CALENDAR_REFRESH_TOKEN,
	});
	const calendar = google.calendar({ version: "v3", auth: oauth2Client });
	const calendarId = env.GOOGLE_CALENDAR_ID || "primary";

	const response = await calendar.freebusy.query({
		requestBody: {
			timeMin: timeMin.toISOString(),
			timeMax: timeMax.toISOString(),
			items: [{ id: calendarId }],
		},
	});

	const busy = response.data.calendars?.[calendarId]?.busy ?? [];
	return busy.map((b) => ({
		start: new Date(b.start ?? timeMin),
		end: new Date(b.end ?? timeMax),
	}));
}

export function createAvailabilityRouter() {
	const availability = new Hono();

	// GET /api/availability/slots - Get available time slots
	availability.get("/slots", async (c) => {
		const db = c.get("db");
		const env = c.env as {
			GOOGLE_CALENDAR_CLIENT_ID?: string;
			GOOGLE_CALENDAR_CLIENT_SECRET?: string;
			GOOGLE_CALENDAR_REFRESH_TOKEN?: string;
			GOOGLE_CALENDAR_ID?: string;
		};
		const { startDate, endDate, duration = "30" } = c.req.query();

		if (!(startDate && endDate)) {
			return c.json({ error: "startDate and endDate are required" }, 400);
		}

		const durationMins = Number.parseInt(duration, 10);
		const start = new Date(startDate);
		const end = new Date(endDate);

		// Working hours: prefer DB rows; fall back to Mon-Fri 9-18 defaults.
		const dbWorkingHours = await db.workingHours.findMany({
			orderBy: { dayOfWeek: "asc" },
		});
		const workingHours =
			dbWorkingHours.length > 0 ? dbWorkingHours : DEFAULT_WORKING_HOURS;

		// Existing DB-tracked meetings.
		const existingMeetings = await db.meeting.findMany({
			where: {
				scheduledAt: { gte: start, lte: end },
				status: { in: ["SCHEDULED", "COMPLETED"] },
			},
		});

		// Blocked time (vacations, etc.).
		const blocks = await db.availabilityBlock.findMany({
			where: {
				startDate: { lte: end },
				endDate: { gte: start },
			},
		});

		// Real Google Calendar busy ranges — ensures we don't double-book over
		// events that exist on the calendar but not in Dakik's DB.
		const calendarBusy = await fetchGoogleCalendarBusy(env, start, end).catch(
			(err) => {
				// If the calendar call fails (auth/network), fall through to
				// DB-only conflict checks rather than blocking the survey.
				console.error("Google Calendar freebusy failed:", err);
				return [] as BusyRange[];
			},
		);

		const now = new Date();
		const slots: {
			date: string;
			times: { start: string; end: string; available: boolean }[];
		}[] = [];
		const cursor = new Date(start);

		while (cursor <= end) {
			const dayOfWeek = cursor.getDay();
			const dayHours = workingHours.find(
				(wh) => wh.dayOfWeek === dayOfWeek && wh.isEnabled,
			);

			if (dayHours) {
				const dateStr = cursor.toISOString().split("T")[0];
				const daySlots: { start: string; end: string; available: boolean }[] = [];

				const [startH, startM] = dayHours.startTime.split(":").map(Number);
				const [endH, endM] = dayHours.endTime.split(":").map(Number);

				let slotStart = new Date(cursor);
				slotStart.setHours(startH, startM, 0, 0);

				const dayEnd = new Date(cursor);
				dayEnd.setHours(endH, endM, 0, 0);

				while (slotStart < dayEnd) {
					const slotEnd = new Date(slotStart.getTime() + durationMins * 60_000);
					if (slotEnd > dayEnd) break;

					const conflictingMeeting = existingMeetings.find((m) => {
						const mStart = new Date(m.scheduledAt);
						const mEnd = new Date(mStart.getTime() + m.duration * 60_000);
						return slotStart < mEnd && slotEnd > mStart;
					});

					const blocked = blocks.find(
						(b) =>
							slotStart >= new Date(b.startDate) &&
							slotStart < new Date(b.endDate),
					);

					const calendarConflict = calendarBusy.find(
						(b) => slotStart < b.end && slotEnd > b.start,
					);

					const isInFuture = slotStart > now;
					const isAvailable =
						isInFuture && !(conflictingMeeting || blocked || calendarConflict);

					daySlots.push({
						start: slotStart.toTimeString().slice(0, 5),
						end: slotEnd.toTimeString().slice(0, 5),
						available: isAvailable,
					});

					slotStart = slotEnd;
				}

				slots.push({ date: dateStr, times: daySlots });
			}

			cursor.setDate(cursor.getDate() + 1);
		}

		return c.json({ slots, timezone: "UTC" });
	});

	return availability;
}
