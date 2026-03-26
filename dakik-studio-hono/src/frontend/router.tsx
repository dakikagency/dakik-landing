import { createBrowserRouter, Outlet } from "react-router-dom";
import { AdminLayout } from "./components/admin/AdminLayout";
import { PortalLayout } from "./components/portal/PortalLayout";
import { AdminCustomers } from "./pages/admin/Customers";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { AdminInvoices } from "./pages/admin/Invoices";
import { AdminLeads } from "./pages/admin/Leads";
import { AdminMeetings } from "./pages/admin/Meetings";
import { AdminProjects } from "./pages/admin/Projects";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/Login";
import { PortalDashboard } from "./pages/portal/Dashboard";
import { PortalInvoices } from "./pages/portal/Invoices";
import { PortalMeetings } from "./pages/portal/Meetings";
import { PortalProjects } from "./pages/portal/Projects";
import { SurveyPage } from "./pages/Survey";

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
