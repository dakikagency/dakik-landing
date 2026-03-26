import { z } from "zod";

// Placeholder schemas - expand as needed

export const healthSchema = z.object({
	status: z.string(),
	timestamp: z.string().datetime(),
});
