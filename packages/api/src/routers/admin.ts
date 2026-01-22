import { db } from "@collab/db";
import { TRPCError } from "@trpc/server";
import { sql } from "kysely";
import { z } from "zod";

import {
	createCalendarEvent,
	isGoogleCalendarConfigured,
} from "../google-calendar";
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

type ProjectSortBy =
	| "createdAt"
	| "updatedAt"
	| "title"
	| "progress"
	| "startDate"
	| "endDate";

const getProjectSortColumn = (sortBy?: ProjectSortBy): string => {
	switch (sortBy) {
		case "title":
			return "p.title";
		case "progress":
			return "p.progress";
		case "startDate":
			return "p.startDate";
		case "endDate":
			return "p.endDate";
		case "updatedAt":
			return "p.updatedAt";
		default:
			return "p.createdAt";
	}
};

const applyProjectFilters = (
	query: ReturnType<typeof db.selectFrom>,
	filters: {
		search?: string;
		status?: string;
		statuses?: string[];
		progressMin?: number;
		progressMax?: number;
		startDateFrom?: Date;
		startDateTo?: Date;
		endDateFrom?: Date;
		endDateTo?: Date;
		createdFrom?: Date;
		createdTo?: Date;
		customerId?: string;
	}
) => {
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
	} = filters;

	return query
		.$if(!!search, (qb) =>
			qb.where(
				sql<boolean>`("p"."title" ILIKE ${`%${search}%`} OR "p"."description" ILIKE ${`%${search}%`} OR "u"."name" ILIKE ${`%${search}%`} OR "c"."companyName" ILIKE ${`%${search}%`})`
			)
		)
		.$if(!!status, (qb) => qb.where("p.status", "=", status))
		.$if(!!statuses?.length, (qb) => qb.where("p.status", "in", statuses))
		.$if(progressMin !== undefined, (qb) =>
			qb.where("p.progress", ">=", progressMin)
		)
		.$if(progressMax !== undefined, (qb) =>
			qb.where("p.progress", "<=", progressMax)
		)
		.$if(!!startDateFrom, (qb) => qb.where("p.startDate", ">=", startDateFrom))
		.$if(!!startDateTo, (qb) => qb.where("p.startDate", "<=", startDateTo))
		.$if(!!endDateFrom, (qb) => qb.where("p.endDate", ">=", endDateFrom))
		.$if(!!endDateTo, (qb) => qb.where("p.endDate", "<=", endDateTo))
		.$if(!!createdFrom, (qb) => qb.where("p.createdAt", ">=", createdFrom))
		.$if(!!createdTo, (qb) => qb.where("p.createdAt", "<=", createdTo))
		.$if(!!customerId, (qb) => qb.where("p.customerId", "=", customerId));
};

const applyProjectCursor = async (
	query: ReturnType<typeof db.selectFrom>,
	params: {
		cursor?: string;
		sortColumn: string;
		orderDirection: "asc" | "desc";
	}
) => {
	const { cursor, sortColumn, orderDirection } = params;
	if (!cursor) {
		return query;
	}

	const cursorRow = await db
		.selectFrom("project as p")
		.select(sql.ref(sortColumn).as("cursor_value"))
		.where("p.id", "=", cursor)
		.executeTakeFirst();

	const cursorValue = cursorRow?.cursor_value;
	if (cursorValue === undefined || cursorValue === null) {
		return query;
	}

	return query.where((eb) =>
		eb.or([
			eb(
				sql.ref(sortColumn),
				orderDirection === "asc" ? ">" : "<",
				cursorValue
			),
			eb.and([
				eb(sql.ref(sortColumn), "=", cursorValue),
				eb("p.id", orderDirection === "asc" ? ">" : "<", cursor),
			]),
		])
	);
};

export const adminRouter = router({
	getDashboardMetrics: adminProcedure.query(async () => {
		const now = new Date();
		const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

		// Get all metrics in parallel
		const [
			totalCustomersRow,
			activeProjectsRow,
			newLeadsThisWeekRow,
			upcomingMeetingsRow,
			recentLeads,
			recentMeetingsRows,
			recentCustomersRows,
		] = await Promise.all([
			// Total customers count
			db
				.selectFrom("customer")
				.select((eb) => eb.fn.count("id").as("count"))
				.executeTakeFirst(),

			// Active projects count
			db
				.selectFrom("project")
				.select((eb) => eb.fn.count("id").as("count"))
				.where("status", "=", "IN_PROGRESS")
				.executeTakeFirst(),

			// New leads this week
			db
				.selectFrom("lead")
				.select((eb) => eb.fn.count("id").as("count"))
				.where("createdAt", ">=", oneWeekAgo)
				.executeTakeFirst(),

			// Upcoming meetings count
			db
				.selectFrom("meeting")
				.select((eb) => eb.fn.count("id").as("count"))
				.where("status", "=", "SCHEDULED")
				.where("scheduledAt", ">=", now)
				.executeTakeFirst(),

			// Recent leads (last 5)
			db
				.selectFrom("lead")
				.select(["id", "name", "email", "projectType", "status", "createdAt"])
				.orderBy("createdAt", "desc")
				.limit(5)
				.execute(),

			// Recent meetings (last 5)
			db
				.selectFrom("meeting as m")
				.leftJoin("lead as l", "l.id", "m.leadId")
				.leftJoin("customer as c", "c.id", "m.customerId")
				.leftJoin("user as u", "u.id", "c.userId")
				.select([
					"m.id",
					"m.title",
					"m.scheduledAt",
					"m.status",
					"l.name as lead_name",
					"u.name as customer_user_name",
				])
				.orderBy("m.createdAt", "desc")
				.limit(5)
				.execute(),

			// Recent customers (last 5)
			db
				.selectFrom("customer as c")
				.innerJoin("user as u", "u.id", "c.userId")
				.select(["c.id", "c.createdAt", "u.name as user_name"])
				.orderBy("c.createdAt", "desc")
				.limit(5)
				.execute(),
		]);

		const totalCustomers = Number(totalCustomersRow?.count ?? 0);
		const activeProjects = Number(activeProjectsRow?.count ?? 0);
		const newLeadsThisWeek = Number(newLeadsThisWeekRow?.count ?? 0);
		const upcomingMeetings = Number(upcomingMeetingsRow?.count ?? 0);

		const recentMeetings = recentMeetingsRows.map((meeting) => ({
			id: meeting.id,
			title: meeting.title,
			scheduledAt: meeting.scheduledAt,
			status: meeting.status,
			lead: meeting.lead_name ? { name: meeting.lead_name } : null,
			customer: meeting.customer_user_name
				? { user: { name: meeting.customer_user_name } }
				: null,
		}));

		const recentCustomers = recentCustomersRows.map((customer) => ({
			id: customer.id,
			createdAt: customer.createdAt,
			user: {
				name: customer.user_name,
			},
		}));

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

			let query = db
				.selectFrom("customer as c")
				.innerJoin("user as u", "u.id", "c.userId")
				.select([
					"c.id",
					"c.companyName",
					"c.phone",
					"c.createdAt",
					"u.id as user_id",
					"u.name as user_name",
					"u.email as user_email",
					"u.image as user_image",
				]);

			if (search) {
				query = query.where(
					sql<boolean>`("u"."name" ILIKE ${`%${search}%`} OR "u"."email" ILIKE ${`%${search}%`} OR "c"."companyName" ILIKE ${`%${search}%`} OR "c"."phone" ILIKE ${`%${search}%`})`
				);
			}

			if (hasProjects === true) {
				query = query.where((eb) =>
					eb.exists(
						db
							.selectFrom("project")
							.select("id")
							.whereRef("project.customerId", "=", "c.id")
					)
				);
			} else if (hasProjects === false) {
				query = query.where((eb) =>
					eb.not(
						eb.exists(
							db
								.selectFrom("project")
								.select("id")
								.whereRef("project.customerId", "=", "c.id")
						)
					)
				);
			}

			if (hasContracts === true) {
				query = query.where((eb) =>
					eb.exists(
						db
							.selectFrom("contract")
							.select("id")
							.whereRef("contract.customerId", "=", "c.id")
					)
				);
			} else if (hasContracts === false) {
				query = query.where((eb) =>
					eb.not(
						eb.exists(
							db
								.selectFrom("contract")
								.select("id")
								.whereRef("contract.customerId", "=", "c.id")
						)
					)
				);
			}

			if (dateFrom) {
				query = query.where("c.createdAt", ">=", dateFrom);
			}
			if (dateTo) {
				query = query.where("c.createdAt", "<=", dateTo);
			}

			const orderDirection = sortOrder ?? "desc";
			if (sortBy === "name") {
				query = query.orderBy("u.name", orderDirection);
			} else if (sortBy === "email") {
				query = query.orderBy("u.email", orderDirection);
			} else if (sortBy === "companyName") {
				query = query.orderBy("c.companyName", orderDirection);
			} else {
				query = query.orderBy("c.createdAt", orderDirection);
			}
			query = query.orderBy("c.id", orderDirection);

			const customerRows = await query.limit(limit).execute();
			const customerIds = customerRows.map((customer) => customer.id);

			const projectCounts = customerIds.length
				? await db
						.selectFrom("project")
						.select(["customerId"])
						.select((eb) => eb.fn.count("id").as("count"))
						.where("customerId", "in", customerIds)
						.groupBy("customerId")
						.execute()
				: [];

			const contractCounts = customerIds.length
				? await db
						.selectFrom("contract")
						.select(["customerId"])
						.select((eb) => eb.fn.count("id").as("count"))
						.where("customerId", "in", customerIds)
						.groupBy("customerId")
						.execute()
				: [];

			const projectCountByCustomer = new Map(
				projectCounts.map((row) => [row.customerId, Number(row.count ?? 0)])
			);
			const contractCountByCustomer = new Map(
				contractCounts.map((row) => [row.customerId, Number(row.count ?? 0)])
			);

			const customers = customerRows.map((customer) => ({
				id: customer.id,
				companyName: customer.companyName,
				phone: customer.phone,
				createdAt: customer.createdAt,
				user: {
					id: customer.user_id,
					name: customer.user_name,
					email: customer.user_email,
					image: customer.user_image,
				},
				_count: {
					projects: projectCountByCustomer.get(customer.id) ?? 0,
					contracts: contractCountByCustomer.get(customer.id) ?? 0,
				},
			}));

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
			const lead = await db
				.selectFrom("lead")
				.selectAll()
				.where("id", "=", input.id)
				.executeTakeFirst();

			if (!lead) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Lead not found",
				});
			}

			const meetings = await db
				.selectFrom("meeting")
				.select([
					"id",
					"title",
					"description",
					"scheduledAt",
					"duration",
					"status",
					"meetUrl",
					"eventId",
					"createdAt",
				])
				.where("leadId", "=", input.id)
				.orderBy("scheduledAt", "desc")
				.execute();

			return {
				...lead,
				meetings,
			};
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

			let query = db
				.selectFrom("lead")
				.select([
					"id",
					"name",
					"email",
					"projectType",
					"budget",
					"details",
					"status",
					"createdAt",
					"updatedAt",
				]);

			if (search) {
				query = query.where(
					sql<boolean>`("name" ILIKE ${`%${search}%`} OR "email" ILIKE ${`%${search}%`} OR "details" ILIKE ${`%${search}%`})`
				);
			}

			if (status) {
				query = query.where("status", "=", status);
			}

			if (statuses && statuses.length > 0) {
				query = query.where("status", "in", statuses);
			}

			if (projectTypes && projectTypes.length > 0) {
				query = query.where("projectType", "in", projectTypes);
			}

			if (budgets && budgets.length > 0) {
				query = query.where("budget", "in", budgets);
			}

			if (dateFrom) {
				query = query.where("createdAt", ">=", dateFrom);
			}
			if (dateTo) {
				query = query.where("createdAt", "<=", dateTo);
			}

			const orderDirection = sortOrder ?? "desc";
			if (sortBy === "name") {
				query = query.orderBy("name", orderDirection);
			} else if (sortBy === "email") {
				query = query.orderBy("email", orderDirection);
			} else if (sortBy === "updatedAt") {
				query = query.orderBy("updatedAt", orderDirection);
			} else {
				query = query.orderBy("createdAt", orderDirection);
			}
			query = query.orderBy("id", orderDirection);

			const leads = await query.limit(limit).execute();
			const leadIds = leads.map((lead) => lead.id);

			const meetingCounts = leadIds.length
				? await db
						.selectFrom("meeting")
						.select(["leadId"])
						.select((eb) => eb.fn.count("id").as("count"))
						.where("leadId", "in", leadIds)
						.groupBy("leadId")
						.execute()
				: [];

			const meetingCountByLead = new Map(
				meetingCounts.map((row) => [row.leadId, Number(row.count ?? 0)])
			);

			return leads.map((lead) => ({
				...lead,
				_count: {
					meetings: meetingCountByLead.get(lead.id) ?? 0,
				},
			}));
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

			let query = db
				.selectFrom("meeting as m")
				.leftJoin("lead as l", "l.id", "m.leadId")
				.leftJoin("customer as c", "c.id", "m.customerId")
				.leftJoin("user as u", "u.id", "c.userId")
				.select([
					"m.id",
					"m.title",
					"m.description",
					"m.scheduledAt",
					"m.duration",
					"m.status",
					"m.meetUrl",
					"m.eventId",
					"m.createdAt",
					"l.id as lead_id",
					"l.name as lead_name",
					"l.email as lead_email",
					"c.id as customer_id",
					"u.name as customer_user_name",
					"u.email as customer_user_email",
				]);

			if (search) {
				query = query.where(
					sql<boolean>`("m"."title" ILIKE ${`%${search}%`} OR "m"."description" ILIKE ${`%${search}%`} OR "l"."name" ILIKE ${`%${search}%`} OR "l"."email" ILIKE ${`%${search}%`} OR "u"."name" ILIKE ${`%${search}%`} OR "u"."email" ILIKE ${`%${search}%`})`
				);
			}

			if (status) {
				query = query.where("m.status", "=", status);
			}

			if (statuses && statuses.length > 0) {
				query = query.where("m.status", "in", statuses);
			}

			if (startDate) {
				query = query.where("m.scheduledAt", ">=", startDate);
			}
			if (endDate) {
				query = query.where("m.scheduledAt", "<=", endDate);
			}

			if (durationMin !== undefined) {
				query = query.where("m.duration", ">=", durationMin);
			}
			if (durationMax !== undefined) {
				query = query.where("m.duration", "<=", durationMax);
			}

			if (attendeeType === "lead") {
				query = query.where("m.leadId", "is not", null);
			} else if (attendeeType === "customer") {
				query = query.where("m.customerId", "is not", null);
			}

			const orderDirection = sortOrder ?? "desc";
			if (sortBy === "createdAt") {
				query = query.orderBy("m.createdAt", orderDirection);
			} else if (sortBy === "duration") {
				query = query.orderBy("m.duration", orderDirection);
			} else if (sortBy === "title") {
				query = query.orderBy("m.title", orderDirection);
			} else {
				query = query.orderBy("m.scheduledAt", orderDirection);
			}
			query = query.orderBy("m.id", orderDirection);

			const meetings = await query.limit(limit).execute();

			return meetings.map((meeting) => ({
				id: meeting.id,
				title: meeting.title,
				description: meeting.description,
				scheduledAt: meeting.scheduledAt,
				duration: meeting.duration,
				status: meeting.status,
				meetUrl: meeting.meetUrl,
				eventId: meeting.eventId,
				createdAt: meeting.createdAt,
				lead: meeting.lead_id
					? {
							id: meeting.lead_id,
							name: meeting.lead_name,
							email: meeting.lead_email,
						}
					: null,
				customer: meeting.customer_id
					? {
							id: meeting.customer_id,
							user: {
								name: meeting.customer_user_name,
								email: meeting.customer_user_email,
							},
						}
					: null,
			}));
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

			const lead = await db
				.updateTable("lead")
				.set({ status })
				.where("id", "=", leadId)
				.returningAll()
				.executeTakeFirst();

			if (!lead) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Lead not found",
				});
			}

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

			const meeting = await db
				.updateTable("meeting")
				.set({ status })
				.where("id", "=", meetingId)
				.returningAll()
				.executeTakeFirst();

			if (!meeting) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Meeting not found",
				});
			}

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

			let query = db
				.selectFrom("project as p")
				.innerJoin("customer as c", "c.id", "p.customerId")
				.innerJoin("user as u", "u.id", "c.userId")
				.select([
					"p.id",
					"p.title",
					"p.description",
					"p.status",
					"p.progress",
					"p.startDate",
					"p.endDate",
					"p.createdAt",
					"p.updatedAt",
					"c.id as customer_id",
					"c.companyName as customer_companyName",
					"u.id as user_id",
					"u.name as user_name",
					"u.email as user_email",
				]);

			query = applyProjectFilters(query, {
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
			});

			const orderDirection = sortOrder ?? "desc";
			const sortColumn = getProjectSortColumn(sortBy);
			query = await applyProjectCursor(query, {
				cursor,
				sortColumn,
				orderDirection,
			});

			query = query
				.orderBy(sql.ref(sortColumn), orderDirection)
				.orderBy("p.id", orderDirection);

			const projectRows = await query.limit(limit).execute();
			const projectIds = projectRows.map((project) => project.id);

			const updateCounts = projectIds.length
				? await db
						.selectFrom("project_update")
						.select(["projectId"])
						.select((eb) => eb.fn.count("id").as("count"))
						.where("projectId", "in", projectIds)
						.groupBy("projectId")
						.execute()
				: [];

			const updateCountByProject = new Map(
				updateCounts.map((row) => [row.projectId, Number(row.count ?? 0)])
			);

			return projectRows.map((project) => ({
				id: project.id,
				title: project.title,
				description: project.description,
				status: project.status,
				progress: project.progress,
				startDate: project.startDate,
				endDate: project.endDate,
				createdAt: project.createdAt,
				updatedAt: project.updatedAt,
				customer: {
					id: project.customer_id,
					companyName: project.customer_companyName,
					user: {
						id: project.user_id,
						name: project.user_name,
						email: project.user_email,
					},
				},
				_count: {
					updates: updateCountByProject.get(project.id) ?? 0,
				},
			}));
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
			const project = await db
				.updateTable("project")
				.set({
					progress,
					...(status && { status }),
				})
				.where("id", "=", projectId)
				.returningAll()
				.executeTakeFirst();

			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			// Create a project update if title and content are provided
			if (updateTitle && updateContent) {
				await db
					.insertInto("project_update")
					.values({
						projectId,
						title: updateTitle,
						content: updateContent,
						progress,
					})
					.execute();
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
			let attendeeName: string | null = null;
			let attendeeEmail: string;
			let leadId: string | null = null;
			let customerId: string | null = null;

			if (attendeeType === "lead") {
				const lead = await db
					.selectFrom("lead")
					.select(["id", "name", "email"])
					.where("id", "=", attendeeId)
					.executeTakeFirst();

				if (!lead) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Lead not found",
					});
				}

				attendeeName = lead.name;
				attendeeEmail = lead.email;
				leadId = lead.id;
			} else {
				const customer = await db
					.selectFrom("customer as c")
					.innerJoin("user as u", "u.id", "c.userId")
					.select(["c.id", "u.name", "u.email"])
					.where("c.id", "=", attendeeId)
					.executeTakeFirst();

				if (!customer) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Customer not found",
					});
				}

				attendeeName = customer.name;
				attendeeEmail = customer.email;
				customerId = customer.id;
			}

			// Calculate the scheduled datetime
			const { hours, minutes } = parseTime(startTime);
			const scheduledAt = new Date(date);
			scheduledAt.setHours(hours, minutes, 0, 0);

			const meetingEndTime = new Date(
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

			if (isGoogleCalendarConfigured()) {
				try {
					const calendarResult = await createCalendarEvent({
						summary: title,
						description:
							description ?? `Meeting with ${attendeeName} (${attendeeEmail})`,
						startTime: scheduledAt,
						endTime: meetingEndTime,
						attendeeEmail,
						attendeeName: attendeeName ?? undefined,
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
					customerId,
					eventId,
					meetUrl,
					title,
					description,
					scheduledAt,
					duration,
					status: "SCHEDULED",
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returningAll()
				.executeTakeFirstOrThrow();

			// Update lead status if applicable
			if (leadId) {
				await db
					.updateTable("lead")
					.set({ status: "MEETING_SCHEDULED" })
					.where("id", "=", leadId)
					.execute();
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
