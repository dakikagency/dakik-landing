import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
	schema: "prisma/schema",
	datasource: {
		// Use process.env with fallback for prisma generate (doesn't need real DB connection)
		// The actual URL is validated at runtime in src/index.ts
		url: process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder",
	},
});
