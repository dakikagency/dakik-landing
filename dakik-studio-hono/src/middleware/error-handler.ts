import type { ErrorHandler } from "hono";

export const errorHandler: ErrorHandler = (err, c) => {
	console.error("Error:", err);

	const status = err instanceof Error ? 500 : 400;
	const message = err instanceof Error ? err.message : "Internal Server Error";

	return c.json(
		{
			error: message,
			status,
		},
		status
	);
};
