import { env } from "@collab/env/server";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { Kysely, PostgresDialect } from "kysely";
import ws from "ws";
import type { DB } from "./db.types";

const databaseUrl = env.DATABASE_URL;

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

const globalForKysely = globalThis as unknown as {
	db: Kysely<DB> | undefined;
};

const db =
	globalForKysely.db ??
	new Kysely<DB>({
		dialect: new PostgresDialect({
			pool: new Pool({ connectionString: databaseUrl }),
		}),
	});

if (process.env.NODE_ENV !== "production") {
	globalForKysely.db = db;
}

export { db };
