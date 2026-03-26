import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import type { EnvVars } from "./env";

let prismaClient: PrismaClient | undefined;

export function getDb(env: EnvVars): PrismaClient {
	// In Workers, create a new client per request
	// Connection pooling is handled by Neon
	if (typeof globalThis !== "undefined" && "caches" in globalThis) {
		const pool = new Pool({
			connectionString: env.DATABASE_URL,
			max: 1, // Workers are single-threaded
		});
		const adapter = new PrismaPg(pool);
		return new PrismaClient({ adapter });
	}

	// In Node.js (dev/migrations), use singleton
	if (!prismaClient) {
		const pool = new Pool({
			connectionString: env.DATABASE_URL,
			max: 10,
		});
		const adapter = new PrismaPg(pool);
		prismaClient = new PrismaClient({
			adapter,
			log:
				env.ENVIRONMENT === "development"
					? ["query", "error", "warn"]
					: ["error"],
		});
	}
	return prismaClient;
}

// Export types
export type { PrismaClient };
export type * from "@prisma/client";
