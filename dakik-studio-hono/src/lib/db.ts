import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import type { EnvVars } from "./env";

let prismaClient: PrismaClient | undefined;

/**
 * Get a PrismaClient. Cached per isolate (Workers) or per Node process.
 *
 * The previous Workers branch created a brand-new Pool + PrismaClient on
 * every call. With dbMiddleware running on every /api/* request AND the
 * auth handler hitting the DB for session lookup when a cookie is present,
 * each isolate accumulated dozens of connections, eventually saturating
 * Neon's connection limit. New requests would then hang waiting for a
 * connection until Cloudflare's 30s timeout killed the worker with
 * "code hung and would never generate a response."
 *
 * Isolate-level caching means the same client is reused for the lifetime
 * of the isolate. When the isolate is evicted, the Pool's connections are
 * released. max: 5 lets a few concurrent requests in the same isolate
 * run in parallel without serializing on a single connection.
 */
export function getDb(env: EnvVars): PrismaClient {
	if (prismaClient) return prismaClient;

	const isWorkers =
		typeof globalThis !== "undefined" && "caches" in globalThis;

	const pool = new Pool({
		connectionString: env.DATABASE_URL,
		max: isWorkers ? 5 : 10,
	});
	const adapter = new PrismaPg(pool);

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
