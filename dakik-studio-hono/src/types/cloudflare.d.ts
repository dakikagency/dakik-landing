import type { EnvVars } from "../lib/env";

declare global {
	interface CloudflareEnv extends EnvVars {
		DB: D1Database;
		ASSETS: Fetcher;
		MEDIA: R2Bucket;
	}
}

export type { CloudflareEnv };
