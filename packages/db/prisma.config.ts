import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Get the directory of this file (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try multiple possible locations for .env file
const possibleEnvPaths = [
	join(__dirname, "../../.env"), // packages/db -> root
	join(process.cwd(), ".env"), // Current working directory
	resolve(__dirname, "../../.env"), // Resolved absolute path
];

// Load the first .env file that exists
for (const envPath of possibleEnvPaths) {
	if (existsSync(envPath)) {
		config({ path: envPath });
		break;
	}
}

export default defineConfig({
	schema: "prisma/schema",
	datasource: {
		url: process.env.DATABASE_URL,
	},
});
