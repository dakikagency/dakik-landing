import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";

/**
 * Create a PrismaClient bound to Cloudflare D1.
 *
 * Always per-request in Workers — Cloudflare binds I/O objects (sockets,
 * streams, fetch bodies) to the request that opened them, and sharing a
 * long-lived PrismaClient across requests fails with:
 *   "Cannot perform I/O on behalf of a different request."
 *
 * Counter-intuitive coming from Node: caching saves cold-start cost there,
 * but in Workers the platform actively prevents cross-request I/O reuse.
 * The right pattern is "fresh per request" and accept the construction
 * cost. With the D1 adapter the cost is negligible — it's a thin wrapper
 * over the D1 binding object the worker already has.
 *
 * Migration history: this used to call `new PrismaNeon({ connectionString:
 * env.DATABASE_URL })`. We moved off Neon's free tier in May 2026 after
 * recurring monthly-quota outages we couldn't manage (no admin access to
 * the Neon project). D1 is bound directly via wrangler.jsonc and needs no
 * connection string.
 */
export function getDb(env: { DB: D1Database }): PrismaClient {
	const adapter = new PrismaD1(env.DB);
	return new PrismaClient({ adapter });
}

export type { PrismaClient };
export type * from "@prisma/client";
