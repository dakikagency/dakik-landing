import { createBrowserRouter, Outlet } from "react-router-dom";
import { AdminLayout } from "./components/admin/admin-layout";
import { PortalLayout } from "./components/portal/portal-layout";
import { AdminCustomers } from "./pages/admin/customers";
import { AdminDashboard } from "./pages/admin/dashboard";
import { AdminInvoices } from "./pages/admin/invoices";
import { AdminLeads } from "./pages/admin/leads";
import { AdminMeetings } from "./pages/admin/meetings";
import { AdminProjects } from "./pages/admin/projects";
import { LandingPage } from "./pages/landing-page";
import { LoginPage } from "./pages/login";
import { PortalDashboard } from "./pages/portal/dashboard";
import { PortalInvoices } from "./pages/portal/invoices";
import { PortalMeetings } from "./pages/portal/meetings";
import { PortalProjects } from "./pages/portal/projects";
import { SurveyPage } from "./pages/survey";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		children: [
			{ index: true, element: <LandingPage /> },
			{ path: "login", element: <LoginPage /> },
			{ path: "survey", element: <SurveyPage /> },
			{
				path: "admin",
				element: <AdminLayout />,
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
