import { join } from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env from monorepo root (two levels up from packages/db)
config({ path: join(__dirname, "../../.env") });

export default defineConfig({
	schema: "prisma/schema",
	datasource: {
		url: process.env.DATABASE_URL,
	},
});
