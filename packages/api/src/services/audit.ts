import prisma, { type Prisma } from "@collab/db";

interface LogActivityParams {
	action: string;
	entity: string;
	entityId?: string;
	details?: Record<string, unknown>;
	ipAddress?: string;
	userAgent?: string;
	userId?: string;
}

export const logActivity = async (params: LogActivityParams) => {
	try {
		await prisma.auditLog.create({
			data: {
				action: params.action,
				entity: params.entity,
				entityId: params.entityId,
				details: params.details as Prisma.InputJsonValue,
				ipAddress: params.ipAddress,
				userAgent: params.userAgent,
				userId: params.userId,
			},
		});
	} catch (error) {
		console.error("Failed to log activity:", error);
		// Don't throw, we don't want to block the main action if logging fails
	}
};
