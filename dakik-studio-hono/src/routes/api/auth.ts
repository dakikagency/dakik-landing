import { createAuth } from "../../lib/auth";
import type { EnvVars } from "../../lib/env";

export function createAuthHandler(env: EnvVars & { DB: D1Database }) {
	const auth = createAuth(env);
	return {
		auth,
		handler: (c: { req: { raw: Request } }) => {
			return auth.handler(c.req.raw);
		},
	};
}
