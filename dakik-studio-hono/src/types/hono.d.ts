import type { CloudflareEnv } from "./cloudflare";

declare module "hono" {
	interface ContextVariableMap {
		env: CloudflareEnv;
	}
}
