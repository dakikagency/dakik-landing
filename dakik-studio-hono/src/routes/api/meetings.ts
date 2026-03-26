import { google } from "googleapis";
import { Hono } from "hono";

export function createMeetingRouter() {
	const meetings = new Hono();

	async function createCalendarEvent(
		env: {
			GOOGLE_CALENDAR_CLIENT_ID?: string;
			GOOGLE_CALENDAR_CLIENT_SECRET?: string;
			GOOGLE_CALENDAR_REFRESH_TOKEN?: string;
			GOOGLE_CALENDAR_ID?: string;
		},
		{
			title,
			description,
			start,
			end,
			attendees,
		}: {
			title: string;
			description?: string;
			start: Date;
			end: Date;
			attendees?: string[];
		}
	) {
		if (
			!(
				env.GOOGLE_CALENDAR_CLIENT_ID &&
				env.GOOGLE_CALENDAR_CLIENT_SECRET &&
				env.GOOGLE_CALENDAR_REFRESH_TOKEN
			)
		) {
			return null;
		}

		const oauth2Client = new google.auth.OAuth2(
			env.GOOGLE_CALENDAR_CLIENT_ID,
			env.GOOGLE_CALENDAR_CLIENT_SECRET,
			"https://oauth2.googleapis.com/token"
		);

		oauth2Client.setCredentials({
			refresh_token: env.GOOGLE_CALENDAR_REFRESH_TOKEN,
		});

		const calendar = google.calendar({ version: "v3", auth: oauth2Client });

		const event = await calendar.events.insert({
			calendarId: env.GOOGLE_CALENDAR_ID || "primary",
			requestBody: {
				summary: title,
				description,
				start: { dateTime: start.toISOString() },
				end: { dateTime: end.toISOString() },
				attendees: attendees?.map((email: string) => ({ email })),
				conferenceData: { createRequest: { requestId: crypto.randomUUID() } },
			},
			conferenceDataVersion: 1,
		});

		return event.data;
	}

	meetings.get("/", async (c) => {
		const db = c.get("db");
		const { status, startDate, endDate, limit = "50" } = c.req.query();

		const where: Record<string, unknown> = {};
		if (status) {
			where.status = status;
		}
		if (startDate || endDate) {
			where.scheduledAt = {};
			if (startDate) {
				(where.scheduledAt as Record<string, unknown>).gte = new Date(
					startDate
				);
			}
			if (endDate) {
				(where.scheduledAt as Record<string, unknown>).lte = new Date(endDate);
			}
		}

		const meetingsList = await db.meeting.findMany({
			where,
			take: Number.parseInt(limit, 10),
			orderBy: { scheduledAt: "desc" },
			include: {
				lead: { select: { id: true, email: true, name: true } },
				customer: {
					include: { user: { select: { email: true, name: true } } },
				},
			},
		});

		return c.json({ meetings: meetingsList });
	});

	meetings.get("/:id", async (c) => {
		const db = c.get("db");
		const id = c.req.param("id");

		const meeting = await db.meeting.findUnique({
			where: { id },
			include: { lead: true, customer: { include: { user: true } } },
		});

		if (!meeting) {
			return c.json({ error: "Meeting not found" }, 404);
		}

		return c.json({ meeting });
	});

	meetings.post("/", async (c) => {
		const db = c.get("db");
		const env = c.env as {
			GOOGLE_CALENDAR_CLIENT_ID?: string;
			GOOGLE_CALENDAR_CLIENT_SECRET?: string;
			GOOGLE_CALENDAR_REFRESH_TOKEN?: string;
			GOOGLE_CALENDAR_ID?: string;
		};
		const body = await c.req.json();

		const {
			leadId,
			customerId,
			title,
			description,
			date,
			startTime,
			duration = 30,
		} = body;

		const [hours, minutes] = startTime.split(":").map(Number);
		const scheduledAt = new Date(date);
		scheduledAt.setHours(hours, minutes, 0, 0);

		const endTime = new Date(scheduledAt.getTime() + duration * 60_000);

		let attendeeEmail = "";
		if (leadId) {
			const lead = await db.lead.findUnique({ where: { id: leadId } });
			attendeeEmail = lead?.email || "";
		} else if (customerId) {
			const customer = await db.customer.findUnique({
				where: { id: customerId },
				include: { user: true },
			});
			attendeeEmail = customer?.user?.email || "";
		}

		let eventId: string | null = null;
		let meetUrl: string | null = null;

		const calendarEvent = await createCalendarEvent(env, {
			title,
			description,
			start: scheduledAt,
			end: endTime,
			attendees: attendeeEmail ? [attendeeEmail] : [],
		});

		if (calendarEvent) {
			eventId = calendarEvent.id ?? null;
			meetUrl =
				calendarEvent.hangoutLink ||
				`https://meet.google.com/${crypto.randomUUID().slice(0, 12)}`;
		}

		const meeting = await db.meeting.create({
			data: {
				leadId,
				customerId,
				eventId: eventId || crypto.randomUUID(),
				meetUrl:
					meetUrl ||
					`https://meet.google.com/${crypto.randomUUID().slice(0, 12)}`,
				title,
				description,
				scheduledAt,
				duration,
				status: "SCHEDULED",
			},
		});

		if (leadId) {
			await db.lead.update({
				where: { id: leadId },
				data: { status: "MEETING_SCHEDULED" },
			});
		}

		return c.json({ meeting }, 201);
	});

	meetings.put("/:id", async (c) => {
		const db = c.get("db");
		const id = c.req.param("id");
		const body = await c.req.json();

		const meeting = await db.meeting.update({
			where: { id },
			data: {
				status: body.status,
			},
		});

		return c.json({ meeting });
	});

	meetings.delete("/:id", async (c) => {
		const db = c.get("db");
		const env = c.env as {
			GOOGLE_CALENDAR_CLIENT_ID?: string;
			GOOGLE_CALENDAR_CLIENT_SECRET?: string;
			GOOGLE_CALENDAR_REFRESH_TOKEN?: string;
			GOOGLE_CALENDAR_ID?: string;
		};
		const id = c.req.param("id");

		const meeting = await db.meeting.findUnique({ where: { id } });
		if (!meeting) {
			return c.json({ error: "Meeting not found" }, 404);
		}

		if (meeting.eventId && env.GOOGLE_CALENDAR_CLIENT_ID) {
			try {
				const oauth2Client = new google.auth.OAuth2(
					env.GOOGLE_CALENDAR_CLIENT_ID,
					env.GOOGLE_CALENDAR_CLIENT_SECRET,
					"https://oauth2.googleapis.com/token"
				);
				oauth2Client.setCredentials({
					refresh_token: env.GOOGLE_CALENDAR_REFRESH_TOKEN,
				});
				const calendar = google.calendar({ version: "v3", auth: oauth2Client });
				await calendar.events.delete({
					calendarId: env.GOOGLE_CALENDAR_ID || "primary",
					eventId: meeting.eventId,
				});
			} catch {
				// Ignore calendar deletion errors
			}
		}

		await db.meeting.update({
			where: { id },
			data: { status: "CANCELLED" },
		});

		return c.json({ success: true });
	});

	return meetings;
}
