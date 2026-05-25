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
 * Hostname-based routing.
 *
 * icons.dakik.co.uk serves the standalone Dakik Icons app (public browser at /,
 * admin CRUD at /admin). dakik.co.uk serves the main marketing + portal app
 * (everything except daicons). One worker, one bundle, two distinct experiences
 * — picked by Host header at request time.
 *
 * SSR-safe: window check defaults to "main" during build so the bundle ships
 * with both route sets compiled.
 */
const hostname =
	typeof window !== "undefined" ? window.location.hostname : "";
const isIconsHost =
	hostname === "icons.dakik.co.uk" || hostname.startsWith("icons.");

const iconsRoutes = [
	{ index: true, element: <DaiconsPage /> },
	{ path: "login", element: <LoginPage /> },
	{ path: "auth/callback", element: <AuthCallbackPage /> },
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

const mainRoutes = [
	{ index: true, element: <LandingPage /> },
	{ path: "about", element: <AboutPage /> },
	{ path: "contact", element: <ContactPage /> },
	{ path: "blog", element: <BlogIndexPage /> },
	{ path: "blog/:slug", element: <BlogPostPage /> },
	{ path: "automations", element: <AutomationsIndexPage /> },
	{ path: "automations/:slug", element: <AutomationDetailPage /> },
	{ path: "dacomps", element: <DacompsPage /> },
	{ path: "login", element: <LoginPage /> },
	{ path: "survey", element: <SurveyPage /> },
	{ path: "cookies", element: <CookiesPage /> },
	{ path: "privacy-policy", element: <PrivacyPolicyPage /> },
	{ path: "terms-of-service", element: <TermsOfServicePage /> },
	{ path: "auth/callback", element: <AuthCallbackPage /> },
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
			{ path: "automations", element: <AdminAutomations /> },
			{ path: "dacomps", element: <AdminDacomps /> },
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

export const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		children: isIconsHost ? iconsRoutes : mainRoutes,
	},
]);

function App() {
	return <Outlet />;
}
