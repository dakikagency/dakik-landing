import { defineConfig } from "prisma/config";

export default defineConfig({
	schema: "prisma/schema.prisma",
	// Local SQLite file for Prisma migrate / studio tooling.
	// At runtime the worker uses the PrismaD1 driver adapter — the URL here
	// is only consulted by the CLI for migrate diff, prisma studio, etc.
	datasource: {
		url: "file:./prisma/dev.db",
	},
});
