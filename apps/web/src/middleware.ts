import { auth, type Session } from "@collab/auth";
import prisma from "@collab/db";
import { type NextRequest, NextResponse } from "next/server";

type UserRole = "ADMIN" | "CUSTOMER";
type SessionWithRole = Session & {
	user: Session["user"] & { role?: UserRole };
};

const ADMIN_ROUTES = ["/admin"];
const PORTAL_ROUTES = ["/portal"];
const PUBLIC_ROUTES = ["/login", "/api/auth", "/portal-access-denied"];

function isPathMatch(pathname: string, routes: string[]): boolean {
	return routes.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`)
	);
}

async function checkUserIsLead(email: string): Promise<boolean> {
	const lead = await prisma.lead.findUnique({
		where: { email },
		select: { id: true },
	});
	return lead !== null;
}

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Allow public routes
	if (isPathMatch(pathname, PUBLIC_ROUTES)) {
		return NextResponse.next();
	}

	// Check if this is a protected route
	const isAdminRoute = isPathMatch(pathname, ADMIN_ROUTES);
	const isPortalRoute = isPathMatch(pathname, PORTAL_ROUTES);

	if (!(isAdminRoute || isPortalRoute)) {
		return NextResponse.next();
	}

	// Get session from better-auth
	const session = (await auth.api.getSession({
		headers: request.headers,
	})) as SessionWithRole | null;

	// Redirect unauthenticated users to login
	if (!session?.user) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(loginUrl);
	}

	const userRole = session.user.role ?? "CUSTOMER";
	const userEmail = session.user.email;

	// Check admin routes - only ADMIN role allowed
	if (isAdminRoute && userRole !== "ADMIN") {
		// Redirect non-admin users to portal if they're customers, otherwise to home
		if (userRole === "CUSTOMER") {
			return NextResponse.redirect(new URL("/portal", request.url));
		}
		return NextResponse.redirect(new URL("/", request.url));
	}

	// Check portal routes - only CUSTOMER role allowed
	if (isPortalRoute && userRole !== "CUSTOMER") {
		// Redirect admin users to admin panel
		if (userRole === "ADMIN") {
			return NextResponse.redirect(new URL("/admin", request.url));
		}
		return NextResponse.redirect(new URL("/", request.url));
	}

	// For portal routes, verify user submitted the survey (exists in Lead table)
	if (isPortalRoute && userEmail) {
		const isLead = await checkUserIsLead(userEmail);
		if (!isLead) {
			return NextResponse.redirect(
				new URL("/portal-access-denied", request.url)
			);
		}
	}

	return NextResponse.next();
}

export const config = {
	runtime: "nodejs",
	matcher: ["/admin/:path*", "/portal/:path*"],
};
