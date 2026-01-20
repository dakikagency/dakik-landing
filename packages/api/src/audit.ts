import prisma from "@collab/db";

export async function logActivity(data: {
	userId?: string | null;
	action: string;
	entity: string;
	entityId?: string | null;
	details?: unknown;
	ipAddress?: string | null;
	userAgent?: string | null;
}) {
	try {
		const id = crypto.randomUUID();
		const now = new Date();
		const detailsJson = data.details ? JSON.stringify(data.details) : null;

		await prisma.$executeRaw`
			INSERT INTO "audit_log" ("id", "action", "entity", "entityId", "details", "ipAddress", "userAgent", "userId", "createdAt")
			VALUES (${id}, ${data.action}, ${data.entity}, ${data.entityId}, ${detailsJson}::jsonb, ${data.ipAddress}, ${data.userAgent}, ${data.userId}, ${now})
		`;
	} catch (error) {
		console.error("Failed to create audit log:", error);
		// Don't throw, we don't want to fail the request just because logging failed
	}
}
