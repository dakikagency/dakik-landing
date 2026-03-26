import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Invoice, type Meeting, type Project } from "../../lib/api";
import { cn } from "../../lib/utils";

interface Stats {
	activeProjects: number;
	pendingInvoices: number;
	upcomingMeetings: number;
}

export function PortalDashboard() {
	const [stats, setStats] = useState<Stats>({
		activeProjects: 0,
		pendingInvoices: 0,
		upcomingMeetings: 0,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [customerName, setCustomerName] = useState("there");

	useEffect(() => {
		async function fetchData() {
			try {
				const mockCustomerId = "customer-1";

				const [projectsRes, invoicesRes, meetingsRes] = await Promise.all([
					api.projects
						.list({ customerId: mockCustomerId })
						.catch(() => ({ projects: [] })),
					api.invoices
						.list({ customerId: mockCustomerId })
						.catch(() => ({ invoices: [] })),
					api.meetings.list().catch(() => ({ meetings: [] })),
				]);

				const projects = projectsRes.projects as Project[];
				const invoices = invoicesRes.invoices as Invoice[];
				const meetings = meetingsRes.meetings as Meeting[];

				const now = new Date();
				const activeProjects = projects.filter(
					(p) => p.status === "IN_PROGRESS" || p.status === "PENDING"
				).length;
				const pendingInvoices = invoices.filter(
					(i) => i.status === "UNPAID" || i.status === "PENDING"
				).length;
				const upcomingMeetings = meetings.filter(
					(m) => m.status === "SCHEDULED" && new Date(m.scheduledAt) > now
				).length;

				setStats({ activeProjects, pendingInvoices, upcomingMeetings });

				if (projects.length > 0 && projects[0].customer?.user?.name) {
					setCustomerName(projects[0].customer.user.name.split(" ")[0]);
				}
			} finally {
				setIsLoading(false);
			}
		}

		fetchData();
	}, []);

	const statCards = [
		{
			label: "Active Projects",
			value: stats.activeProjects,
			href: "/portal/projects",
			color: "bg-blue-500/10 border-blue-500/20",
			textColor: "text-blue-400",
		},
		{
			label: "Pending Invoices",
			value: stats.pendingInvoices,
			href: "/portal/invoices",
			color: "bg-amber-500/10 border-amber-500/20",
			textColor: "text-amber-400",
		},
		{
			label: "Upcoming Meetings",
			value: stats.upcomingMeetings,
			href: "/portal/meetings",
			color: "bg-emerald-500/10 border-emerald-500/20",
			textColor: "text-emerald-400",
		},
	];

	const quickActions = [
		{
			label: "View Projects",
			href: "/portal/projects",
			icon: (
				<svg
					aria-hidden="true"
					className="h-5 w-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
					/>
				</svg>
			),
		},
		{
			label: "View Invoices",
			href: "/portal/invoices",
			icon: (
				<svg
					aria-hidden="true"
					className="h-5 w-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
					/>
				</svg>
			),
		},
		{
			label: "Schedule Meeting",
			href: "/portal/meetings",
			icon: (
				<svg
					aria-hidden="true"
					className="h-5 w-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
					/>
				</svg>
			),
		},
	];

	return (
		<div className="space-y-8">
			<div>
				<h1 className="font-bold text-3xl">Welcome back, {customerName}</h1>
				<p className="mt-2 text-white/60">
					Here&apos;s an overview of your account
				</p>
			</div>

			{isLoading ? (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<div className="h-32 animate-pulse rounded-xl bg-white/5" key={i} />
					))}
				</div>
			) : (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{statCards.map((card) => (
						<Link
							className={cn(
								"group rounded-xl border p-6 transition-all hover:scale-[1.02]",
								card.color
							)}
							key={card.label}
							to={card.href}
						>
							<p className="text-sm text-white/60">{card.label}</p>
							<p className={cn("mt-2 font-bold text-4xl", card.textColor)}>
								{card.value}
							</p>
						</Link>
					))}
				</div>
			)}

			<div>
				<h2 className="font-semibold text-xl">Quick Actions</h2>
				<div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{quickActions.map((action) => (
						<Link
							className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:bg-white/10"
							key={action.label}
							to={action.href}
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
								{action.icon}
							</div>
							<span className="font-medium">{action.label}</span>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
