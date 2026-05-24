import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import type { EnvVars } from "./env";

/**
 * Create a PrismaClient. Always per-request in Workers.
 *
 * Cloudflare Workers bind I/O objects (sockets, streams, fetch bodies) to
 * the request that opened them. Sharing a long-lived PrismaClient across
 * requests fails with:
 *   "Cannot perform I/O on behalf of a different request."
 *
 * Counter-intuitive coming from Node: caching saves cold-start cost there,
 * but in Workers the platform actively prevents cross-request I/O reuse.
 * The right pattern is "fresh per request" and accept the construction
 * cost. With the Neon serverless driver (HTTP/WebSocket, no TCP pool
 * setup) this is cheap.
 */
export function getDb(env: EnvVars): PrismaClient {
	const adapter = new PrismaNeon({ connectionString: env.DATABASE_URL });
	return new PrismaClient({ adapter });
}

export type { PrismaClient };
export type * from "@prisma/client";
