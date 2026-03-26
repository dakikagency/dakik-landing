import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

declare global {
	// eslint-disable-next-line no-var
	var prisma: PrismaClient | undefined;
}

export function getPrismaClient(databaseUrl: string): PrismaClient {
	if (process.env.NODE_ENV === "production") {
		const pool = new Pool({ connectionString: databaseUrl, max: 1 });
		const adapter = new PrismaPg(pool);
		return new PrismaClient({ adapter });
	}

	if (!globalThis.prisma) {
		const pool = new Pool({ connectionString: databaseUrl, max: 1 });
		const adapter = new PrismaPg(pool);
		globalThis.prisma = new PrismaClient({
			adapter,
			log: ["error", "warn"],
		});
	}
	return globalThis.prisma;
}

export type { PrismaClient };
export type * from "@prisma/client";
