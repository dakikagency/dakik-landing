import { db } from "@collab/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../index";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
	if (ctx.session.user.role !== "ADMIN") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Admin access required",
		});
	}
	return next({ ctx });
});

const webhookEvents = [
	"lead.created",
	"project.updated",
	"invoice.paid",
] as const;

export const webhooksRouter = router({
	list: adminProcedure.query(() => {
		return db
			.selectFrom("webhook")
			.selectAll()
			.orderBy("createdAt", "desc")
			.execute();
	}),

	create: adminProcedure
		.input(
			z.object({
				url: z.string().url(),
				secret: z.string().optional(),
				events: z.array(z.enum(webhookEvents)),
			})
		)
		.mutation(({ input }) => {
			return db
				.insertInto("webhook")
				.values({
					id: crypto.randomUUID(),
					url: input.url,
					secret: input.secret,
					events: input.events,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returningAll()
				.executeTakeFirstOrThrow();
		}),

	update: adminProcedure
		.input(
			z.object({
				id: z.string(),
				url: z.string().url().optional(),
				secret: z.string().optional(),
				events: z.array(z.enum(webhookEvents)).optional(),
				isActive: z.boolean().optional(),
			})
		)
		.mutation(({ input }) => {
			const { id, ...data } = input;
			return db
				.updateTable("webhook")
				.set(data)
				.where("id", "=", id)
				.returningAll()
				.executeTakeFirstOrThrow();
		}),

	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(({ input }) => {
			return db
				.deleteFrom("webhook")
				.where("id", "=", input.id)
				.returningAll()
				.executeTakeFirstOrThrow();
		}),
});
