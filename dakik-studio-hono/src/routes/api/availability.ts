import { Hono } from "hono";

export function createAvailabilityRouter() {
	const availability = new Hono();

	// GET /api/availability/slots - Get available time slots
	availability.get("/slots", async (c) => {
		const db = c.get("db");
		const { startDate, endDate, duration = "30" } = c.req.query();

		if (!(startDate && endDate)) {
			return c.json({ error: "startDate and endDate are required" }, 400);
		}

		const durationMins = Number.parseInt(duration, 10);
		const start = new Date(startDate);
		const end = new Date(endDate);

		// Get working hours
		const workingHours = await db.workingHours.findMany({
			orderBy: { dayOfWeek: "asc" },
		});

		// Get existing meetings in range
		const existingMeetings = await db.meeting.findMany({
			where: {
				scheduledAt: { gte: start, lte: end },
				status: { in: ["SCHEDULED", "COMPLETED"] },
			},
		});

		// Get availability blocks (blocked time like vacations)
		const blocks = await db.availabilityBlock.findMany({
			where: {
				startDate: { lte: end },
				endDate: { gte: start },
			},
		});

		// Generate slots
		const slots: {
			date: string;
			times: { start: string; end: string; available: boolean }[];
		}[] = [];
		const current = new Date(start);

		while (current <= end) {
			const dayOfWeek = current.getDay();
			const dayHours = workingHours.find((wh) => wh.dayOfWeek === dayOfWeek);

			if (dayHours?.isEnabled) {
				const dateStr = current.toISOString().split("T")[0];
				const daySlots: { start: string; end: string; available: boolean }[] =
					[];

				// Parse working hours
				const [startH, startM] = dayHours.startTime.split(":").map(Number);
				const [endH, endM] = dayHours.endTime.split(":").map(Number);

				let slotStart = new Date(current);
				slotStart.setHours(startH, startM, 0, 0);

				const dayEnd = new Date(current);
				dayEnd.setHours(endH, endM, 0, 0);

				while (slotStart < dayEnd) {
					const slotEnd = new Date(slotStart.getTime() + durationMins * 60_000);

					if (slotEnd > dayEnd) {
						break;
					}

					// Check if slot conflicts with existing meetings
					const conflicting = existingMeetings.find((m) => {
						const mStart = new Date(m.scheduledAt);
						const mEnd = new Date(mStart.getTime() + m.duration * 60_000);
						return slotStart < mEnd && slotEnd > mStart;
					});

					// Check if slot is in a blocked period
					const blocked = blocks.find((b) => {
						return (
							slotStart >= new Date(b.startDate) &&
							slotStart < new Date(b.endDate)
						);
					});

					daySlots.push({
						start: slotStart.toTimeString().slice(0, 5),
						end: slotEnd.toTimeString().slice(0, 5),
						available: !(conflicting || blocked) && slotStart > new Date(),
					});

					slotStart = slotEnd;
				}

				slots.push({ date: dateStr, times: daySlots });
			}

			current.setDate(current.getDate() + 1);
		}

		return c.json({ slots, timezone: "UTC" });
	});

	return availability;
}
