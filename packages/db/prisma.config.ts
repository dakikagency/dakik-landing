import { env } from "@collab/env/server";

export default {
	datasources: {
		db: {
			url: env.DATABASE_URL,
		},
	},
};
