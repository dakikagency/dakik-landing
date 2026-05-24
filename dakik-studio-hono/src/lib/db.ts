import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import type { EnvVars } from "./env";

let prismaClient: PrismaClient | undefined;

/**
 * Get a PrismaClient backed by Neon's serverless driver.
 *
 * Previous setup used @prisma/adapter-pg with node-pg's Pool against Neon's
 * PgBouncer-pooled endpoint (the `-pooler` host). That combination is
 * unreliable for two reasons:
 *
 *   1. node-pg holds persistent TCP connections, which don't survive
 *      Workers isolate eviction cleanly and burn Neon's connection budget
 *      faster than the limit allows.
 *   2. Prisma uses prepared statements by default; PgBouncer in transaction
 *      mode (Neon pooler default) reuses connections across transactions
 *      and corrupts prepared-statement state, leading to hangs and silent
 *      failures.
 *
 * The Neon serverless driver (`@neondatabase/serverless`) talks to Neon
 * over HTTP/WebSocket instead of TCP, has no persistent pool, and works
 * cleanly with Prisma via @prisma/adapter-neon. Same DATABASE_URL string
 * works — the pooler URL still routes correctly through their serverless
 * proxy.
 *
 * Module-level cache survives the lifetime of an isolate so repeated
 * requests reuse the same PrismaClient instance (and its internal state).
 */
export function getDb(env: EnvVars): PrismaClient {
	if (prismaClient) return prismaClient;

	// PrismaNeon v7.8+ takes a PoolConfig directly and manages the
	// underlying serverless Pool internally — no explicit Pool import.
	const adapter = new PrismaNeon({ connectionString: env.DATABASE_URL });

	const isWorkers =
		typeof globalThis !== "undefined" && "caches" in globalThis;

	prismaClient = new PrismaClient({
		adapter,
		log:
			!isWorkers && env.ENVIRONMENT === "development"
				? ["query", "error", "warn"]
				: ["error"],
	});
	return prismaClient;
}

export type { PrismaClient };
export type * from "@prisma/client";
