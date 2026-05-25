import { createBrowserRouter, Outlet } from "react-router-dom";
import { AdminLayout } from "./components/admin/admin-layout";
import { RequireAdmin } from "./components/auth/require-admin";
import { PortalLayout } from "./components/portal/portal-layout";
import { AboutPage } from "./pages/about";
import { AdminAutomations } from "./pages/admin/automations";
import { AdminBlog } from "./pages/admin/blog";
import { AdminCustomers } from "./pages/admin/customers";
import { AdminDacomps } from "./pages/admin/dacomps";
import { AdminDaicons } from "./pages/admin/daicons";
import { AdminDashboard } from "./pages/admin/dashboard";
import { AdminInvoices } from "./pages/admin/invoices";
import { AdminLeads } from "./pages/admin/leads";
import { AdminMeetings } from "./pages/admin/meetings";
import { AdminProjects } from "./pages/admin/projects";
import { AuthCallbackPage } from "./pages/auth-callback";
import { AutomationsIndexPage } from "./pages/automations";
import { AutomationDetailPage } from "./pages/automations/post";
import { BlogIndexPage } from "./pages/blog";
import { BlogPostPage } from "./pages/blog/post";
import { ContactPage } from "./pages/contact";
import { CookiesPage } from "./pages/cookies";
import { DacompsPage } from "./pages/dacomps";
import { DaiconsPage } from "./pages/daicons";
import { LandingPage } from "./pages/landing-page";
import { LoginPage } from "./pages/login";
import { PortalAccessDeniedPage } from "./pages/portal-access-denied";
import { PortalDashboard } from "./pages/portal/dashboard";
import { PortalInvoices } from "./pages/portal/invoices";
import { PortalMeetings } from "./pages/portal/meetings";
import { PortalProjects } from "./pages/portal/projects";
import { PrivacyPolicyPage } from "./pages/privacy-policy";
import { SurveyPage } from "./pages/survey";
import { TermsOfServicePage } from "./pages/terms-of-service";

/**
 * Hostname-based routing. One worker, one bundle, four distinct experiences
 * picked from window.location.hostname at boot:
 *
 *   icons.dakik.co.uk → Dakik Icons (SVG icon library)
 *   bits.dakik.co.uk  → Dakik Bits  (React component library)
 *   flow.dakik.co.uk  → Dakik Flow  (automation playbooks)
 *   dakik.co.uk       → main marketing + portal app (everything else)
 *
 * Each subdomain serves a public browser at `/`, an `/admin` CRUD gated by
 * RequireAdmin, and the shared `/login` + `/auth/callback` flow. The backend
 * (Hono router + API + DB) is shared across all four hosts.
 *
 * SSR-safe: window check defaults to main host during build.
 */
const hostname =
	typeof window !== "undefined" ? window.location.hostname : "";

type SubdomainKind = "icons" | "bits" | "flow" | "main";
function detectSubdomain(): SubdomainKind {
	if (hostname.startsWith("icons.")) return "icons";
	if (hostname.startsWith("bits.")) return "bits";
	if (hostname.startsWith("flow.")) return "flow";
	return "main";
}

const subdomain = detectSubdomain();

const sharedAuthRoutes = [
	{ path: "login", element: <LoginPage /> },
	{ path: "auth/callback", element: <AuthCallbackPage /> },
];

const iconsRoutes = [
	{ index: true, element: <DaiconsPage /> },
	...sharedAuthRoutes,
	{
		path: "admin",
		element: (
			<RequireAdmin>
				<AdminLayout />
			</RequireAdmin>
		),
		children: [{ index: true, element: <AdminDaicons /> }],
	},
];

const bitsRoutes = [
	{ index: true, element: <DacompsPage /> },
	...sharedAuthRoutes,
	{
		path: "admin",
		element: (
			<RequireAdmin>
				<AdminLayout />
			</RequireAdmin>
		),
		children: [{ index: true, element: <AdminDacomps /> }],
	},
];

const flowRoutes = [
	{ index: true, element: <AutomationsIndexPage /> },
	{ path: ":slug", element: <AutomationDetailPage /> },
	...sharedAuthRoutes,
	{
		path: "admin",
		element: (
			<RequireAdmin>
				<AdminLayout />
			</RequireAdmin>
		),
		children: [{ index: true, element: <AdminAutomations /> }],
	},
];

const mainRoutes = [
	{ index: true, element: <LandingPage /> },
	{ path: "about", element: <AboutPage /> },
	{ path: "contact", element: <ContactPage /> },
	{ path: "blog", element: <BlogIndexPage /> },
	{ path: "blog/:slug", element: <BlogPostPage /> },
	...sharedAuthRoutes,
	{ path: "survey", element: <SurveyPage /> },
	{ path: "cookies", element: <CookiesPage /> },
	{ path: "privacy-policy", element: <PrivacyPolicyPage /> },
	{ path: "terms-of-service", element: <TermsOfServicePage /> },
	{ path: "portal-access-denied", element: <PortalAccessDeniedPage /> },
	{
		path: "admin",
		element: (
			<RequireAdmin>
				<AdminLayout />
			</RequireAdmin>
		),
		children: [
			{ index: true, element: <AdminDashboard /> },
			{ path: "leads", element: <AdminLeads /> },
			{ path: "customers", element: <AdminCustomers /> },
			{ path: "projects", element: <AdminProjects /> },
			{ path: "invoices", element: <AdminInvoices /> },
			{ path: "meetings", element: <AdminMeetings /> },
			{ path: "blog", element: <AdminBlog /> },
		],
	},
	{
		path: "portal",
		element: <PortalLayout />,
		children: [
			{ index: true, element: <PortalDashboard /> },
			{ path: "projects", element: <PortalProjects /> },
			{ path: "invoices", element: <PortalInvoices /> },
			{ path: "meetings", element: <PortalMeetings /> },
		],
	},
];

const routesForSubdomain: Record<SubdomainKind, typeof mainRoutes> = {
	icons: iconsRoutes,
	bits: bitsRoutes,
	flow: flowRoutes,
	main: mainRoutes,
};

export const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		children: routesForSubdomain[subdomain],
	},
]);

function App() {
	return <Outlet />;
}
