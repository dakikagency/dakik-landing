import { createBrowserRouter, Outlet } from "react-router-dom";
import { AdminLayout } from "./components/admin/admin-layout";
import { RequireAdmin } from "./components/auth/require-admin";
import { PortalLayout } from "./components/portal/portal-layout";
import { AboutPage } from "./pages/about";
import { AdminCustomers } from "./pages/admin/customers";
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

export const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		children: [
			{ index: true, element: <LandingPage /> },
			{ path: "about", element: <AboutPage /> },
			{ path: "contact", element: <ContactPage /> },
			{ path: "blog", element: <BlogIndexPage /> },
			{ path: "blog/:slug", element: <BlogPostPage /> },
			{ path: "automations", element: <AutomationsIndexPage /> },
			{ path: "automations/:slug", element: <AutomationDetailPage /> },
			{ path: "dacomps", element: <DacompsPage /> },
			{ path: "daicons", element: <DaiconsPage /> },
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
		],
	},
]);

function App() {
	return <Outlet />;
}
