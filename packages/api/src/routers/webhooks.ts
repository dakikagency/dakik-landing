import prisma from "@collab/db";
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
		return prisma.webhook.findMany({
			orderBy: { createdAt: "desc" },
		});
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
			return prisma.webhook.create({
				data: {
					url: input.url,
					secret: input.secret,
					events: input.events,
				},
			});
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
			return prisma.webhook.update({
				where: { id },
				data,
			});
		}),

	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(({ input }) => {
			return prisma.webhook.delete({
				where: { id: input.id },
			});
		}),
});
