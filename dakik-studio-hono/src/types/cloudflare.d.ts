import type { EnvVars } from "../lib/env";

declare global {
	interface CloudflareEnv extends EnvVars {
		DB: D1Database;
		ASSETS: Fetcher;
	}
}

export type { CloudflareEnv };
