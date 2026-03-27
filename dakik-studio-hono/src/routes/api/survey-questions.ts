import { Hono } from "hono";
import { createAuth } from "../../lib/auth";

async function checkAdminSession(c: {
	req: { raw: Request };
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	env: any;
}) {
	const auth = createAuth(c.env);
	const cookieHeader = c.req.raw.headers.get("cookie") || "";

	const sessionToken = cookieHeader.match(/dakik-auth-session-token=([^;]+)/)?.[1];

	if (!sessionToken) {
		return { authorized: false, status: 401, message: "Unauthorized: No session token" };
	}

	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	if (!session) {
		return { authorized: false, status: 401, message: "Unauthorized: Invalid session" };
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const role = (session.user as any).role;
	if (role !== "ADMIN") {
		return { authorized: false, status: 403, message: "Forbidden: Admin access required" };
	}

	return { authorized: true, session };
}

export function createSurveyQuestionsRouter() {
	const surveyQuestions = new Hono();

	surveyQuestions.get("/", async (c) => {
		const authResult = await checkAdminSession(c);
		if (!authResult.authorized) {
			return c.json({ error: authResult.message }, authResult.status as 401 | 403);
		}

		const db = c.get("db");

		const questions = await db.surveyQuestionItem.findMany({
			orderBy: { orderIndex: "asc" },
		});

		return c.json({ questions });
	});

	surveyQuestions.get("/:id", async (c) => {
		const authResult = await checkAdminSession(c);
		if (!authResult.authorized) {
			return c.json({ error: authResult.message }, authResult.status as 401 | 403);
		}

		const db = c.get("db");
		const id = c.req.param("id");

		const question = await db.surveyQuestionItem.findUnique({
			where: { id },
		});

		if (!question) {
			return c.json({ error: "Question not found" }, 404);
		}

		return c.json({ question });
	});

	surveyQuestions.post("/", async (c) => {
		const authResult = await checkAdminSession(c);
		if (!authResult.authorized) {
			return c.json({ error: authResult.message }, authResult.status as 401 | 403);
		}

		const db = c.get("db");
		const body = await c.req.json();

		if (!body.questionText) {
			return c.json({ error: "questionText is required" }, 400);
		}

		if (!body.questionType) {
			return c.json({ error: "questionType is required" }, 400);
		}

		const validTypes = ["TEXT", "SINGLE_CHOICE", "MULTI_CHOICE"];
		if (!validTypes.includes(body.questionType)) {
			return c.json(
				{ error: `Invalid questionType. Must be one of: ${validTypes.join(", ")}` },
				400
			);
		}

		if (body.questionType !== "TEXT" && !body.options) {
			return c.json(
				{ error: "options are required for choice-based questions" },
				400
			);
		}

		const maxOrderQuestion = await db.surveyQuestionItem.findFirst({
			orderBy: { orderIndex: "desc" },
		});
		const newOrderIndex = (maxOrderQuestion?.orderIndex ?? -1) + 1;

		const question = await db.surveyQuestionItem.create({
			data: {
				questionText: body.questionText,
				questionType: body.questionType,
				options: body.options ?? null,
				orderIndex: body.orderIndex ?? newOrderIndex,
			},
		});

		return c.json({ question }, 201);
	});

	surveyQuestions.put("/:id", async (c) => {
		const authResult = await checkAdminSession(c);
		if (!authResult.authorized) {
			return c.json({ error: authResult.message }, authResult.status as 401 | 403);
		}

		const db = c.get("db");
		const id = c.req.param("id");
		const body = await c.req.json();

		const existing = await db.surveyQuestionItem.findUnique({
			where: { id },
		});

		if (!existing) {
			return c.json({ error: "Question not found" }, 404);
		}

		if (body.questionType) {
			const validTypes = ["TEXT", "SINGLE_CHOICE", "MULTI_CHOICE"];
			if (!validTypes.includes(body.questionType)) {
				return c.json(
					{ error: `Invalid questionType. Must be one of: ${validTypes.join(", ")}` },
					400
				);
			}
		}

		const finalQuestionType = body.questionType ?? existing.questionType;
		if (finalQuestionType !== "TEXT" && !body.options && !existing.options) {
			return c.json(
				{ error: "options are required for choice-based questions" },
				400
			);
		}

		const question = await db.surveyQuestionItem.update({
			where: { id },
			data: {
				questionText: body.questionText ?? existing.questionText,
				questionType: body.questionType ?? existing.questionType,
				options: body.options !== undefined ? body.options : existing.options,
				orderIndex: body.orderIndex ?? existing.orderIndex,
			},
		});

		return c.json({ question });
	});

	surveyQuestions.delete("/:id", async (c) => {
		const authResult = await checkAdminSession(c);
		if (!authResult.authorized) {
			return c.json({ error: authResult.message }, authResult.status as 401 | 403);
		}

		const db = c.get("db");
		const id = c.req.param("id");

		const question = await db.surveyQuestionItem.findUnique({
			where: { id },
		});

		if (!question) {
			return c.json({ error: "Question not found" }, 404);
		}

		await db.surveyQuestionItem.delete({
			where: { id },
		});

		return c.json({ success: true });
	});

	surveyQuestions.put("/reorder", async (c) => {
		const authResult = await checkAdminSession(c);
		if (!authResult.authorized) {
			return c.json({ error: authResult.message }, authResult.status as 401 | 403);
		}

		const db = c.get("db");
		const body = await c.req.json();

		if (!body.questionIds || !Array.isArray(body.questionIds)) {
			return c.json({ error: "questionIds array is required" }, 400);
		}

		const updates = body.questionIds.map(async (id: string, index: number) => {
			await db.surveyQuestionItem.update({
				where: { id },
				data: { orderIndex: index },
			});
		});

		await Promise.all(updates);

		const questions = await db.surveyQuestionItem.findMany({
			orderBy: { orderIndex: "asc" },
		});

		return c.json({ questions });
	});

	return surveyQuestions;
}
