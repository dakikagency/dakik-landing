import { z } from "zod";

export const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	CORS_ORIGIN: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function getEnv(c: { env: Record<string, string | undefined> }): Env {
	return {
		NODE_ENV: (c.env.NODE_ENV as Env["NODE_ENV"]) || "development",
		CORS_ORIGIN: c.env.CORS_ORIGIN,
	};
}
