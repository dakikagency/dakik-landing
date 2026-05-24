import { Calendar, FolderKanban, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Invoice, type Meeting, type Project } from "../../lib/api";

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
	const [error, setError] = useState<string | null>(null);
	const [customerName, setCustomerName] = useState("there");

	useEffect(() => {
		async function fetchData() {
			try {
				const mockCustomerId = "customer-1";

				const [projectsRes, invoicesRes, meetingsRes] = await Promise.all([
					api.projects.list({ customerId: mockCustomerId }),
					api.invoices.list({ customerId: mockCustomerId }),
					api.meetings.list(),
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
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load dashboard");
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
		},
		{
			label: "Pending Invoices",
			value: stats.pendingInvoices,
			href: "/portal/invoices",
		},
		{
			label: "Upcoming Meetings",
			value: stats.upcomingMeetings,
			href: "/portal/meetings",
		},
	];

	const quickActions = [
		{
			label: "View Projects",
			href: "/portal/projects",
			Icon: FolderKanban,
		},
		{
			label: "View Invoices",
			href: "/portal/invoices",
			Icon: Receipt,
		},
		{
			label: "Schedule Meeting",
			href: "/portal/meetings",
			Icon: Calendar,
		},
	];

	return (
		<div className="space-y-10">
			<header>
				<p className="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
					// Welcome back
				</p>
				<h1 className="mt-3 font-black text-4xl uppercase leading-[0.9] tracking-[-0.03em] sm:text-5xl">
					Hello, {customerName}.
				</h1>
				<div className="mt-6 h-px bg-white/10" />
			</header>

			{error && (
				<div className="border-2 border-white bg-white/[0.02] p-4 font-mono text-[11px] text-white uppercase tracking-[0.2em]">
					// Error: {error}
				</div>
			)}

			<section>
				<div className="mb-5 flex items-center gap-3">
					<span className="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
						// Overview
					</span>
					<span className="h-px flex-1 bg-white/10" />
				</div>
				{isLoading ? (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<div
								className="h-36 animate-pulse border border-white/10 bg-white/5"
								key={i}
							/>
						))}
					</div>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{statCards.map((card) => (
							<Link
								className="group relative flex flex-col justify-between border border-white/10 bg-neutral-950 p-6 transition-colors hover:border-white/30 hover:bg-neutral-900"
								key={card.label}
								to={card.href}
							>
								<p className="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
									{card.label}
								</p>
								<p className="mt-6 font-black text-6xl text-white tracking-[-0.04em]">
									{card.value}
								</p>
								<span className="absolute right-4 bottom-4 font-mono text-[10px] text-white/30 uppercase tracking-[0.35em] transition-colors group-hover:text-white/60">
									View →
								</span>
							</Link>
						))}
					</div>
				)}
			</section>

			<section>
				<div className="mb-5 flex items-center gap-3">
					<span className="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
						// Quick actions
					</span>
					<span className="h-px flex-1 bg-white/10" />
				</div>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{quickActions.map((action) => (
						<Link
							className="group flex items-center gap-4 border border-white/10 bg-transparent p-5 transition-colors hover:border-white/30 hover:bg-white/5"
							key={action.label}
							to={action.href}
						>
							<div className="flex h-12 w-12 items-center justify-center border-2 border-white/20 transition-colors group-hover:border-white">
								<action.Icon className="h-5 w-5 text-white/70 group-hover:text-white" />
							</div>
							<span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/80 group-hover:text-white">
								{action.label}
							</span>
						</Link>
					))}
				</div>
			</section>
		</div>
	);
}
