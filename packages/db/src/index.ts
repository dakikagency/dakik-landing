import { env } from "@collab/env/server";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

export type { Prisma } from "@prisma/client";
export { db } from "./kysely";

// Get DATABASE_URL from env package (which handles loading from .env)
const databaseUrl = env.DATABASE_URL;

// CRITICAL: Set DATABASE_URL in process.env unconditionally
// Prisma 7's query compiler requires this even when using driver adapters
if (databaseUrl) {
	process.env.DATABASE_URL = databaseUrl;
}

// Debug: Log connection status in development (never log actual URL)
if (process.env.NODE_ENV === "development") {
	console.log("[DB] Database connection configured");
	console.log(`[DB] DATABASE_URL loaded: ${!!databaseUrl}`);
}

// Validate DATABASE_URL
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

// Configure Neon WebSocket for Node.js environment
neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = false;

// Create the Prisma adapter with connection string directly (per Prisma docs)
const adapter = new PrismaNeon({ connectionString: databaseUrl });

// Initialize Prisma Client with singleton pattern
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
