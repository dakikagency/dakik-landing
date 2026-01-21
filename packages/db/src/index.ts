import { env } from "@collab/env/server";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

import { PrismaClient } from "@prisma/client";

// biome-ignore lint/performance/noBarrelFile: Necessary for Prisma client type exports
export * from "@prisma/client";

// CRITICAL: Set DATABASE_URL in process.env unconditionally
// Prisma 7's query compiler requires this even when using driver adapters
process.env.DATABASE_URL = env.DATABASE_URL;

// Debug: Log connection info in development
if (process.env.NODE_ENV === "development") {
	console.log(
		"[DB] Connecting to:",
		env.DATABASE_URL ? env.DATABASE_URL.substring(0, 30) + "..." : "UNDEFINED"
	);
}

// Validate DATABASE_URL
if (!(env.DATABASE_URL && env.DATABASE_URL.startsWith("postgresql://"))) {
	throw new Error(
		`Invalid DATABASE_URL: ${env.DATABASE_URL ? "Invalid format" : "Not set"}. Expected: postgresql://user:password@host/database`
	);
}

// Configure Neon WebSocket for Node.js environment
neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = false;

// Create the Prisma adapter with connection string directly (per Prisma docs)
const adapter = new PrismaNeon({ connectionString: env.DATABASE_URL });

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
