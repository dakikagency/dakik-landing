import { auth } from "@collab/auth";
import prisma from "@collab/db";
import type { NextRequest } from "next/server";

export async function createContext(req: NextRequest) {
	const session = await auth.api.getSession({
		headers: req.headers,
	});

	// If there's a session, fetch the user's role from the database
	if (session?.user?.id) {
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { role: true },
		});

		return {
			session: {
				...session,
				user: {
					...session.user,
					role: user?.role ?? "CUSTOMER",
				},
			},
			ip: req.headers.get("x-forwarded-for") ?? "127.0.0.1",
			userAgent: req.headers.get("user-agent") ?? undefined,
		};
	}

	return {
		session: null,
		ip: req.headers.get("x-forwarded-for") ?? "127.0.0.1",
		userAgent: req.headers.get("user-agent") ?? undefined,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
