import prisma, { type Prisma } from "@collab/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../index";

// Admin-only procedure that checks for ADMIN role
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
	if (ctx.session.user.role !== "ADMIN") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Admin access required",
		});
	}
	return next({ ctx });
});

export interface Activity {
	type: "lead" | "meeting" | "customer" | "project";
	description: string;
	timestamp: Date;
}

// Helper to build text search conditions for projects
const buildSearchConditions = (
	searchTerm: string
): Prisma.ProjectWhereInput => ({
	OR: [
		{ title: { contains: searchTerm, mode: "insensitive" } },
		{ description: { contains: searchTerm, mode: "insensitive" } },
		{
			customer: {
				user: { name: { contains: searchTerm, mode: "insensitive" } },
			},
		},
		{
			customer: {
				companyName: { contains: searchTerm, mode: "insensitive" },
			},
		},
	],
});

// Helper to build date range conditions for projects
const buildDateRangeConditions = (
	field: "startDate" | "endDate" | "createdAt",
	from?: Date,
	to?: Date
): Prisma.ProjectWhereInput | null => {
	if (!(from || to)) {
		return null;
	}
	const condition: Record<string, unknown> = {};
	if (from) {
		condition.gte = from;
	}
	if (to) {
		condition.lte = to;
	}
	return { [field]: condition };
};

export const adminRouter = router({
	getDashboardMetrics: adminProcedure.query(async () => {
		const now = new Date();
		const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

		// Get all metrics in parallel
		const [
			totalCustomers,
			activeProjects,
			newLeadsThisWeek,
			upcomingMeetings,
			recentLeads,
			recentMeetings,
			recentCustomers,
		] = await Promise.all([
			// Total customers count
			prisma.customer.count(),

			// Active projects count
			prisma.project.count({
				where: {
					status: "IN_PROGRESS",
				},
			}),

			// New leads this week
			prisma.lead.count({
				where: {
					createdAt: {
						gte: oneWeekAgo,
					},
				},
			}),

			// Upcoming meetings count
			prisma.meeting.count({
				where: {
					status: "SCHEDULED",
					scheduledAt: {
						gte: now,
					},
				},
			}),

			// Recent leads (last 5)
			prisma.lead.findMany({
				take: 5,
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					name: true,
					email: true,
					projectType: true,
					status: true,
					createdAt: true,
				},
			}),

			// Recent meetings (last 5)
			prisma.meeting.findMany({
				take: 5,
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					title: true,
					scheduledAt: true,
					status: true,
					lead: {
						select: { name: true },
					},
					customer: {
						select: {
							user: {
								select: { name: true },
							},
						},
					},
				},
			}),

			// Recent customers (last 5)
			prisma.customer.findMany({
				take: 5,
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					createdAt: true,
					user: {
						select: { name: true },
					},
				},
			}),
		]);

		// Build recent activity from various sources
		const recentActivity: Activity[] = [
			...recentLeads.map((lead) => ({
				type: "lead" as const,
				description: `New lead from ${lead.name} (${(lead.projectType ?? "UNKNOWN").replace(/_/g, " ")})`,
				timestamp: lead.createdAt,
			})),
			...recentMeetings.map((meeting) => {
				const attendeeName =
					meeting.lead?.name ?? meeting.customer?.user?.name ?? "Unknown";
				return {
					type: "meeting" as const,
					description: `Meeting "${meeting.title}" with ${attendeeName} - ${meeting.status}`,
					timestamp: meeting.scheduledAt,
				};
			}),
			...recentCustomers.map((customer) => ({
				type: "customer" as const,
				description: `New customer: ${customer.user.name}`,
				timestamp: customer.createdAt,
			})),
		]
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
			.slice(0, 10);

		return {
			totalCustomers,
			activeProjects,
			newLeadsThisWeek,
			upcomingMeetings,
			recentLeads,
			recentActivity,
		};
	}),

	getCustomers: adminProcedure
		.input(
			z.object({
				search: z.string().optional(),
				hasProjects: z.boolean().optional(),
				hasContracts: z.boolean().optional(),
				projectCountMin: z.number().optional(),
				projectCountMax: z.number().optional(),
				dateFrom: z.date().optional(),
				dateTo: z.date().optional(),
				sortBy: z
					.enum(["createdAt", "name", "email", "companyName"])
					.optional(),
				sortOrder: z.enum(["asc", "desc"]).optional(),
				limit: z.number().min(1).max(100).optional().default(50),
				cursor: z.string().optional(),
			})
		)
		.query(async ({ input }) => {
			const {
				search,
				hasProjects,
				hasContracts,
				projectCountMin,
				projectCountMax,
				dateFrom,
				dateTo,
				sortBy,
				sortOrder,
				limit,
			} = input;

			// Build where conditions
			const whereConditions: Prisma.CustomerWhereInput[] = [];

			// Text search
			if (search) {
				whereConditions.push({
					OR: [
						{ user: { name: { contains: search, mode: "insensitive" } } },
						{ user: { email: { contains: search, mode: "insensitive" } } },
						{ companyName: { contains: search, mode: "insensitive" } },
						{ phone: { contains: search, mode: "insensitive" } },
					],
				});
			}

			// Has projects filter
			if (hasProjects === true) {
				whereConditions.push({
					projects: { some: {} },
				});
			} else if (hasProjects === false) {
				whereConditions.push({
					projects: { none: {} },
				});
			}

			// Has contracts filter
			if (hasContracts === true) {
				whereConditions.push({
					contracts: { some: {} },
				});
			} else if (hasContracts === false) {
				whereConditions.push({
					contracts: { none: {} },
				});
			}

			// Date range filter
			if (dateFrom || dateTo) {
				whereConditions.push({
					createdAt: {
						...(dateFrom && { gte: dateFrom }),
						...(dateTo && { lte: dateTo }),
					},
				});
			}

			// Determine sort field and order
			let orderBy: Prisma.CustomerFindManyArgs["orderBy"];
			if (sortBy === "name" || sortBy === "email") {
				orderBy = { user: { [sortBy]: sortOrder ?? "desc" } };
			} else {
				orderBy = { [sortBy ?? "createdAt"]: sortOrder ?? "desc" };
			}

			const customers = await prisma.customer.findMany({
				where:
					whereConditions.length > 0 ? { AND: whereConditions } : undefined,
				take: limit,
				orderBy,
				select: {
					id: true,
					companyName: true,
					phone: true,
					createdAt: true,
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							image: true,
						},
					},
					_count: {
						select: {
							projects: true,
							contracts: true,
						},
					},
				},
			});

			// Filter by project count if needed (done in memory as Prisma doesn't support count filters directly)
			let filteredCustomers = customers;
			if (projectCountMin !== undefined || projectCountMax !== undefined) {
				filteredCustomers = customers.filter((c) => {
					const count = c._count?.projects ?? 0;
					if (projectCountMin !== undefined && count < projectCountMin) {
						return false;
					}
					if (projectCountMax !== undefined && count > projectCountMax) {
						return false;
					}
					return true;
				});
			}

			return filteredCustomers;
		}),

	getLead: adminProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const lead = await prisma.lead.findUnique({
				where: { id: input.id },
				include: {
					meetings: {
						orderBy: { scheduledAt: "desc" },
						select: {
							id: true,
							title: true,
							description: true,
							scheduledAt: true,
							duration: true,
							status: true,
							meetUrl: true,
							eventId: true,
							createdAt: true,
						},
					},
				},
			});

			if (!lead) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Lead not found",
				});
			}

			return lead;
		}),

	getLeads: adminProcedure
		.input(
			z.object({
				search: z.string().optional(),
				status: z.string().optional(),
				statuses: z.array(z.string()).optional(), // Multi-select statuses
				projectTypes: z.array(z.string()).optional(), // Multi-select project types
				budgets: z.array(z.string()).optional(), // Multi-select budgets
				dateFrom: z.date().optional(),
				dateTo: z.date().optional(),
				sortBy: z.enum(["createdAt", "updatedAt", "name", "email"]).optional(),
				sortOrder: z.enum(["asc", "desc"]).optional(),
				limit: z.number().min(1).max(100).optional().default(50),
			})
		)
		.query(async ({ input }) => {
			const {
				search,
				status,
				statuses,
				projectTypes,
				budgets,
				dateFrom,
				dateTo,
				sortBy,
				sortOrder,
				limit,
			} = input;

			// Build where conditions
			const whereConditions: Prisma.LeadWhereInput[] = [];

			// Text search
			if (search) {
				whereConditions.push({
					OR: [
						{ name: { contains: search, mode: "insensitive" } },
						{ email: { contains: search, mode: "insensitive" } },
						{ details: { contains: search, mode: "insensitive" } },
					],
				});
			}

			// Single status filter (backward compatibility)
			if (status) {
				whereConditions.push({
					status: status as
						| "NEW"
						| "CONTACTED"
						| "MEETING_SCHEDULED"
						| "MEETING_COMPLETED"
						| "CONVERTED"
						| "CLOSED",
				});
			}

			// Multi-select statuses
			if (statuses && statuses.length > 0) {
				whereConditions.push({
					status: {
						in: statuses as (
							| "NEW"
							| "CONTACTED"
							| "MEETING_SCHEDULED"
							| "MEETING_COMPLETED"
							| "CONVERTED"
							| "CLOSED"
						)[],
					},
				});
			}

			// Multi-select project types
			if (projectTypes && projectTypes.length > 0) {
				whereConditions.push({
					projectType: {
						in: projectTypes as (
							| "AI_AUTOMATION"
							| "BRAND_IDENTITY"
							| "WEB_MOBILE"
							| "FULL_PRODUCT"
						)[],
					},
				});
			}

			// Multi-select budgets
			if (budgets && budgets.length > 0) {
				whereConditions.push({
					budget: {
						in: budgets as (
							| "RANGE_5K_10K"
							| "RANGE_10K_25K"
							| "RANGE_25K_50K"
							| "RANGE_50K_PLUS"
						)[],
					},
				});
			}

			// Date range filter
			if (dateFrom || dateTo) {
				whereConditions.push({
					createdAt: {
						...(dateFrom && { gte: dateFrom }),
						...(dateTo && { lte: dateTo }),
					},
				});
			}

			const leads = await prisma.lead.findMany({
				where:
					whereConditions.length > 0 ? { AND: whereConditions } : undefined,
				take: limit,
				orderBy: { [sortBy ?? "createdAt"]: sortOrder ?? "desc" },
				select: {
					id: true,
					name: true,
					email: true,
					projectType: true,
					budget: true,
					details: true,
					status: true,
					createdAt: true,
					updatedAt: true,
					_count: {
						select: {
							meetings: true,
						},
					},
				},
			});

			return leads;
		}),

	getMeetings: adminProcedure
		.input(
			z.object({
				search: z.string().optional(),
				status: z.string().optional(),
				statuses: z.array(z.string()).optional(), // Multi-select statuses
				startDate: z.date().optional(),
				endDate: z.date().optional(),
				durationMin: z.number().optional(),
				durationMax: z.number().optional(),
				attendeeType: z.enum(["lead", "customer", "all"]).optional(),
				sortBy: z
					.enum(["scheduledAt", "createdAt", "duration", "title"])
					.optional(),
				sortOrder: z.enum(["asc", "desc"]).optional(),
				limit: z.number().min(1).max(100).optional().default(50),
			})
		)
		.query(async ({ input }) => {
			const {
				search,
				status,
				statuses,
				startDate,
				endDate,
				durationMin,
				durationMax,
				attendeeType,
				sortBy,
				sortOrder,
				limit,
			} = input;

			// Build where conditions
			const whereConditions: Prisma.MeetingWhereInput[] = [];

			// Text search
			if (search) {
				whereConditions.push({
					OR: [
						{ title: { contains: search, mode: "insensitive" } },
						{ description: { contains: search, mode: "insensitive" } },
						{ lead: { name: { contains: search, mode: "insensitive" } } },
						{ lead: { email: { contains: search, mode: "insensitive" } } },
						{
							customer: {
								user: { name: { contains: search, mode: "insensitive" } },
							},
						},
						{
							customer: {
								user: { email: { contains: search, mode: "insensitive" } },
							},
						},
					],
				});
			}

			// Single status filter (backward compatibility)
			if (status) {
				whereConditions.push({
					status: status as "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW",
				});
			}

			// Multi-select statuses
			if (statuses && statuses.length > 0) {
				whereConditions.push({
					status: {
						in: statuses as (
							| "SCHEDULED"
							| "COMPLETED"
							| "CANCELLED"
							| "NO_SHOW"
						)[],
					},
				});
			}

			// Date range filter
			if (startDate || endDate) {
				whereConditions.push({
					scheduledAt: {
						...(startDate && { gte: startDate }),
						...(endDate && { lte: endDate }),
					},
				});
			}

			// Duration filter
			if (durationMin !== undefined || durationMax !== undefined) {
				whereConditions.push({
					duration: {
						...(durationMin !== undefined && { gte: durationMin }),
						...(durationMax !== undefined && { lte: durationMax }),
					},
				});
			}

			// Attendee type filter
			if (attendeeType === "lead") {
				whereConditions.push({ leadId: { not: null } });
			} else if (attendeeType === "customer") {
				whereConditions.push({ customerId: { not: null } });
			}

			const meetings = await prisma.meeting.findMany({
				where:
					whereConditions.length > 0 ? { AND: whereConditions } : undefined,
				take: limit,
				orderBy: { [sortBy ?? "scheduledAt"]: sortOrder ?? "desc" },
				select: {
					id: true,
					title: true,
					description: true,
					scheduledAt: true,
					duration: true,
					status: true,
					meetUrl: true,
					eventId: true,
					createdAt: true,
					lead: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					customer: {
						select: {
							id: true,
							user: {
								select: {
									name: true,
									email: true,
								},
							},
						},
					},
				},
			});

			return meetings;
		}),

	updateLeadStatus: adminProcedure
		.input(
			z.object({
				leadId: z.string(),
				status: z.enum([
					"NEW",
					"CONTACTED",
					"MEETING_SCHEDULED",
					"MEETING_COMPLETED",
					"CONVERTED",
					"CLOSED",
				]),
			})
		)
		.mutation(async ({ input }) => {
			const { leadId, status } = input;

			const lead = await prisma.lead.update({
				where: { id: leadId },
				data: { status },
			});

			// TODO: Implement activity logging
			// await logActivity({
			// 	userId: ctx.session.user.id,
			// 	action: "UPDATE_LEAD_STATUS",
			// 	entity: "Lead",
			// 	entityId: lead.id,
			// 	details: { status },
			// });

			return lead;
		}),

	updateMeetingStatus: adminProcedure
		.input(
			z.object({
				meetingId: z.string(),
				status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
			})
		)
		.mutation(async ({ input }) => {
			const { meetingId, status } = input;

			const meeting = await prisma.meeting.update({
				where: { id: meetingId },
				data: { status },
			});

			// TODO: Implement activity logging
			// await logActivity({
			// 	userId: ctx.session.user.id,
			// 	action: "UPDATE_MEETING_STATUS",
			// 	entity: "Meeting",
			// 	entityId: meeting.id,
			// 	details: { status },
			// });

			return meeting;
		}),

	getProjects: adminProcedure
		.input(
			z.object({
				search: z.string().optional(),
				status: z.string().optional(),
				statuses: z.array(z.string()).optional(), // Multi-select statuses
				progressMin: z.number().min(0).max(100).optional(),
				progressMax: z.number().min(0).max(100).optional(),
				startDateFrom: z.date().optional(),
				startDateTo: z.date().optional(),
				endDateFrom: z.date().optional(),
				endDateTo: z.date().optional(),
				createdFrom: z.date().optional(),
				createdTo: z.date().optional(),
				customerId: z.string().optional(),
				sortBy: z
					.enum([
						"createdAt",
						"updatedAt",
						"title",
						"progress",
						"startDate",
						"endDate",
					])
					.optional(),
				sortOrder: z.enum(["asc", "desc"]).optional(),
				limit: z.number().min(1).max(100).optional().default(50),
				cursor: z.string().optional(),
			})
		)
		.query(async ({ input }) => {
			const {
				search,
				status,
				statuses,
				progressMin,
				progressMax,
				startDateFrom,
				startDateTo,
				endDateFrom,
				endDateTo,
				createdFrom,
				createdTo,
				customerId,
				sortBy,
				sortOrder,
				limit,
				cursor,
			} = input;

			// Build where conditions
			const whereConditions: Prisma.ProjectWhereInput[] = [];

			// Text search
			if (search) {
				whereConditions.push(buildSearchConditions(search));
			}

			// Single status filter (backward compatibility)
			if (status) {
				whereConditions.push({
					status: status as
						| "PENDING"
						| "IN_PROGRESS"
						| "ON_HOLD"
						| "COMPLETED"
						| "CANCELLED",
				});
			}

			// Multi-select statuses
			if (statuses && statuses.length > 0) {
				whereConditions.push({
					status: {
						in: statuses as (
							| "PENDING"
							| "IN_PROGRESS"
							| "ON_HOLD"
							| "COMPLETED"
							| "CANCELLED"
						)[],
					},
				});
			}

			// Progress range
			if (progressMin !== undefined || progressMax !== undefined) {
				whereConditions.push({
					progress: {
						...(progressMin !== undefined && { gte: progressMin }),
						...(progressMax !== undefined && { lte: progressMax }),
					},
				});
			}

			// Date range filters
			const startDateCond = buildDateRangeConditions(
				"startDate",
				startDateFrom,
				startDateTo
			);
			if (startDateCond) {
				whereConditions.push(startDateCond);
			}

			const endDateCond = buildDateRangeConditions(
				"endDate",
				endDateFrom,
				endDateTo
			);
			if (endDateCond) {
				whereConditions.push(endDateCond);
			}

			const createdDateCond = buildDateRangeConditions(
				"createdAt",
				createdFrom,
				createdTo
			);
			if (createdDateCond) {
				whereConditions.push(createdDateCond);
			}

			// Customer filter
			if (customerId) {
				whereConditions.push({ customerId });
			}

			const projects = await prisma.project.findMany({
				where:
					whereConditions.length > 0 ? { AND: whereConditions } : undefined,
				take: limit,
				skip: cursor ? 1 : 0,
				cursor: cursor ? { id: cursor } : undefined,
				orderBy: { [sortBy ?? "createdAt"]: sortOrder ?? "desc" },
				select: {
					id: true,
					title: true,
					description: true,
					status: true,
					progress: true,
					startDate: true,
					endDate: true,
					createdAt: true,
					updatedAt: true,
					customer: {
						select: {
							id: true,
							companyName: true,
							user: {
								select: {
									id: true,
									name: true,
									email: true,
								},
							},
						},
					},
					_count: {
						select: {
							updates: true,
						},
					},
				},
			});

			return projects;
		}),

	updateProjectProgress: adminProcedure
		.input(
			z.object({
				projectId: z.string(),
				progress: z.number().min(0).max(100),
				status: z
					.enum(["PENDING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"])
					.optional(),
				updateTitle: z.string().optional(),
				updateContent: z.string().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const { projectId, progress, status, updateTitle, updateContent } = input;

			// Update the project
			const project = await prisma.project.update({
				where: { id: projectId },
				data: {
					progress,
					...(status && { status }),
				},
			});

			// Create a project update if title and content are provided
			if (updateTitle && updateContent) {
				await prisma.projectUpdate.create({
					data: {
						projectId,
						title: updateTitle,
						content: updateContent,
						progress,
					},
				});
			}

			// TODO: Implement webhook service
			// webhookService.dispatch("project.updated", {
			// 	projectId: project.id,
			// 	title: project.title,
			// 	status: project.status,
			// 	progress: project.progress,
			// 	customerId: project.customerId,
			// 	updatedAt: project.updatedAt,
			// });

			return project;
		}),

	createMeeting: adminProcedure
		.input(
			z.object({
				attendeeType: z.enum(["lead", "customer"]),
				attendeeId: z.string(),
				title: z.string().min(1),
				description: z.string().optional(),
				date: z.string(), // ISO date string (YYYY-MM-DD)
				startTime: z
					.string()
					.regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format"),
				duration: z.number().min(15).max(480),
				timezone: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const {
				attendeeType,
				attendeeId,
				title,
				description,
				date,
				startTime,
				duration,
			} = input;

			// Verify the attendee exists
			let _attendeeName: string | null = null;
			let _attendeeEmail: string;
			let leadId: string | null = null;
			let customerId: string | null = null;

			if (attendeeType === "lead") {
				const lead = await prisma.lead.findUnique({
					where: { id: attendeeId },
				});

				if (!lead) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Lead not found",
					});
				}

				_attendeeName = lead.name;
				_attendeeEmail = lead.email;
				leadId = lead.id;
			} else {
				const customer = await prisma.customer.findUnique({
					where: { id: attendeeId },
					include: { user: true },
				});

				if (!customer) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Customer not found",
					});
				}

				_attendeeName = customer.user.name;
				_attendeeEmail = customer.user.email;
				customerId = customer.id;
			}

			// Calculate the scheduled datetime
			const { hours, minutes } = parseTime(startTime);
			const scheduledAt = new Date(date);
			scheduledAt.setHours(hours, minutes, 0, 0);

			const _meetingEndTime = new Date(
				scheduledAt.getTime() + duration * 60 * 1000
			);

			// Generate IDs for calendar event
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

			// Create Google Calendar event if configured, otherwise use placeholder
			let eventId: string;
			let meetUrl: string;

			// TODO: Implement Google Calendar integration
			const isCalendarConfigured = false; // Replace with actual implementation
			const createCalendarFn: ((params: unknown) => Promise<unknown>) | null =
				null; // Replace with actual implementation

			if (isCalendarConfigured && createCalendarFn) {
				try {
					// TODO: Uncomment when Google Calendar integration is ready
					// const calendarResult = await createCalendarFn({
					// 	summary: title,
					// 	description: description ?? `Meeting with ${attendeeName} (${attendeeEmail})`,
					// 	startTime: scheduledAt,
					// 	endTime: meetingEndTime,
					// 	attendeeEmail,
					// 	attendeeName: attendeeName ?? undefined,
					// 	timezone,
					// });
					// eventId = calendarResult.eventId;
					// meetUrl = calendarResult.meetUrl ?? `https://meet.google.com/${generateMeetId()}`;

					// Placeholder until integration is ready
					eventId = generateEventId();
					meetUrl = `https://meet.google.com/${generateMeetId()}`;
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
			const meeting = await prisma.meeting.create({
				data: {
					leadId,
					customerId,
					eventId,
					meetUrl,
					title,
					description,
					scheduledAt,
					duration,
					status: "SCHEDULED",
				},
			});

			// Update lead status if applicable
			if (leadId) {
				await prisma.lead.update({
					where: { id: leadId },
					data: { status: "MEETING_SCHEDULED" },
				});
			}

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
});

// Helper function for parsing time
function parseTime(time: string): { hours: number; minutes: number } {
	const parts = time.split(":").map(Number);
	return { hours: parts[0] ?? 0, minutes: parts[1] ?? 0 };
}

export type AdminRouter = typeof adminRouter;
