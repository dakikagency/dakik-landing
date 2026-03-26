import { env } from "@collab/env/server";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

export type { Prisma } from "@prisma/client";
export { db } from "./kysely";

const databaseUrl = env.DATABASE_URL;

if (databaseUrl) {
	process.env.DATABASE_URL = databaseUrl;
}

if (process.env.NODE_ENV === "development") {
	console.log("[DB] Database connection configured");
	console.log(`[DB] DATABASE_URL loaded: ${!!databaseUrl}`);
}

if (!databaseUrl) {
	throw new Error(
		"DATABASE_URL is not configured. Please check your .env file at the monorepo root or set the DATABASE_URL environment variable."
	);
}

if (
	!(
		databaseUrl.startsWith("postgresql://") ||
		databaseUrl.startsWith("postgres://")
	)
) {
	throw new Error(
		"DATABASE_URL must be a valid PostgreSQL connection string starting with 'postgresql://' or 'postgres://'"
	);
}

neonConfig.poolQueryViaFetch = true;

const adapter = new PrismaNeon({ connectionString: databaseUrl });

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
		log:
			process.env.NODE_ENV === "development"
				? ["query", "error", "warn"]
				: ["error"],
	});

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}

export default prisma;
