import type { CloudflareEnv } from "./cloudflare";
import type { PrismaClient } from "@prisma/client";

declare module "hono" {
	interface ContextVariableMap {
		env: CloudflareEnv;
		db: PrismaClient;
	}
}
