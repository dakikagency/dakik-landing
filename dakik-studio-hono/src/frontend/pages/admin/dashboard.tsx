import {
	ClockIcon,
	DollarSignIcon,
	TrendingUpIcon,
	UsersIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	api,
	type Customer,
	type Invoice,
	type Lead,
	type Meeting,
	type Project,
} from "../../lib/api";

interface StatCardProps {
	title: string;
	value: number | string;
	description?: string;
	icon: React.ElementType;
	trend?: { value: number; isPositive: boolean };
	isLoading?: boolean;
}

function StatCard({
	title,
	value,
	description,
	icon: Icon,
	trend,
	isLoading,
}: StatCardProps) {
	return (
		<div className="rounded-xl border border-white/10 bg-neutral-900 p-6">
			<div className="flex flex-row items-center justify-between space-y-0 pb-2">
				<h3 className="font-medium text-sm text-white/60">{title}</h3>
				<Icon className="size-4 text-white/40" />
			</div>
			<div className="pt-2">
				{isLoading ? (
					<div className="h-8 w-20 animate-pulse rounded bg-white/10" />
				) : (
					<div className="font-bold text-3xl">{value}</div>
				)}
				{description && (
					<p className="mt-1 text-white/40 text-xs">{description}</p>
				)}
				{trend && (
					<div className="mt-1 flex items-center gap-1">
						<TrendingUpIcon
							className={`size-3 ${trend.isPositive ? "text-green-500" : "rotate-180 text-red-500"}`}
						/>
						<span
							className={`text-xs ${trend.isPositive ? "text-green-500" : "text-red-500"}`}
						>
							{trend.value}%
						</span>
						<span className="text-white/40 text-xs">from last month</span>
					</div>
				)}
			</div>
		</div>
	);
}

interface RecentItemProps {
	label: string;
	subtitle?: string;
	value: string;
}

function RecentItem({ label, subtitle, value }: RecentItemProps) {
	return (
		<div className="flex items-center justify-between border-white/5 border-b py-3 last:border-0">
			<div className="space-y-1">
				<p className="font-medium text-sm">{label}</p>
				{subtitle && <p className="text-white/40 text-xs">{subtitle}</p>}
			</div>
			<span className="text-white/60 text-xs">{value}</span>
		</div>
	);
}

export function AdminDashboard() {
	const [leads, setLeads] = useState<Lead[]>([]);
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [meetings, setMeetings] = useState<Meeting[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchData() {
			try {
				setIsLoading(true);
				const [leadsRes, customersRes, projectsRes, invoicesRes, meetingsRes] =
					await Promise.allSettled([
						api.leads.list({ limit: 5 }),
						api.customers.list({ limit: 5 }),
						api.projects.list({ limit: 5 }),
						api.invoices.list({ limit: 5 }),
						api.meetings.list(),
					]);

				if (leadsRes.status === "fulfilled") {
					setLeads(leadsRes.value.leads);
				}
				if (customersRes.status === "fulfilled") {
					setCustomers(customersRes.value.customers);
				}
				if (projectsRes.status === "fulfilled") {
					setProjects(projectsRes.value.projects);
				}
				if (invoicesRes.status === "fulfilled") {
					setInvoices(invoicesRes.value.invoices);
				}
				if (meetingsRes.status === "fulfilled") {
					setMeetings(meetingsRes.value.meetings);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load data");
			} finally {
				setIsLoading(false);
			}
		}

		fetchData();
	}, []);

	const totalLeads = leads.length;
	const totalCustomers = customers.length;
	const activeProjects = projects.filter(
		(p) => p.status === "IN_PROGRESS"
	).length;
	const pendingInvoices = invoices.filter((i) => i.status === "UNPAID").length;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-2xl tracking-tight">Dashboard</h1>
				<p className="mt-1 text-sm text-white/60">
					Overview of your business metrics and recent activity.
				</p>
			</div>

			{error && (
				<div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400 text-sm">
					{error}
				</div>
			)}

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					description="Total leads"
					icon={UsersIcon}
					isLoading={isLoading}
					title="Total Leads"
					value={totalLeads}
				/>
				<StatCard
					description="Converted customers"
					icon={UsersIcon}
					isLoading={isLoading}
					title="Total Customers"
					value={totalCustomers}
				/>
				<StatCard
					description="In progress"
					icon={ClockIcon}
					isLoading={isLoading}
					title="Active Projects"
					value={activeProjects}
				/>
				<StatCard
					description="Awaiting payment"
					icon={DollarSignIcon}
					isLoading={isLoading}
					title="Pending Invoices"
					value={pendingInvoices}
				/>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<div className="rounded-xl border border-white/10 bg-neutral-900 p-6">
					<h3 className="mb-4 font-medium text-sm">Recent Leads</h3>
					{isLoading && (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<div className="flex items-center justify-between py-3" key={i}>
									<div className="space-y-2">
										<div className="h-4 w-32 animate-pulse rounded bg-white/10" />
										<div className="h-3 w-48 animate-pulse rounded bg-white/10" />
									</div>
									<div className="h-5 w-16 animate-pulse rounded bg-white/10" />
								</div>
							))}
						</div>
					)}
					{!isLoading && leads.length === 0 && (
						<p className="py-8 text-center text-sm text-white/40">
							No leads yet
						</p>
					)}
					{!isLoading && leads.length > 0 && (
						<div>
							{leads.slice(0, 5).map((lead) => (
								<RecentItem
									key={lead.id}
									label={lead.name ?? "Unnamed lead"}
									subtitle={lead.email}
									value={new Date(lead.createdAt).toLocaleDateString()}
								/>
							))}
						</div>
					)}
				</div>

				<div className="rounded-xl border border-white/10 bg-neutral-900 p-6">
					<h3 className="mb-4 font-medium text-sm">Upcoming Meetings</h3>
					{isLoading && (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<div className="flex items-start gap-3 py-3" key={i}>
									<div className="size-7 animate-pulse rounded bg-white/10" />
									<div className="flex-1 space-y-2">
										<div className="h-4 w-full animate-pulse rounded bg-white/10" />
										<div className="h-3 w-24 animate-pulse rounded bg-white/10" />
									</div>
								</div>
							))}
						</div>
					)}
					{!isLoading && meetings.length === 0 && (
						<p className="py-8 text-center text-sm text-white/40">
							No meetings scheduled
						</p>
					)}
					{!isLoading && meetings.length > 0 && (
						<div>
							{meetings.slice(0, 5).map((meeting) => (
								<RecentItem
									key={meeting.id}
									label={meeting.title}
									subtitle={`${meeting.duration} min`}
									value={new Date(meeting.scheduledAt).toLocaleDateString()}
								/>
							))}
						</div>
					)}
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<div className="rounded-xl border border-white/10 bg-neutral-900 p-6">
					<h3 className="mb-4 font-medium text-sm">Recent Projects</h3>
					{isLoading && (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<div className="flex items-center justify-between py-3" key={i}>
									<div className="space-y-2">
										<div className="h-4 w-32 animate-pulse rounded bg-white/10" />
										<div className="h-3 w-24 animate-pulse rounded bg-white/10" />
									</div>
									<div className="h-5 w-16 animate-pulse rounded bg-white/10" />
								</div>
							))}
						</div>
					)}
					{!isLoading && projects.length === 0 && (
						<p className="py-8 text-center text-sm text-white/40">
							No projects yet
						</p>
					)}
					{!isLoading && projects.length > 0 && (
						<div>
							{projects.slice(0, 5).map((project) => (
								<RecentItem
									key={project.id}
									label={project.title}
									subtitle={project.status}
									value={`${project.progress}%`}
								/>
							))}
						</div>
					)}
				</div>

				<div className="rounded-xl border border-white/10 bg-neutral-900 p-6">
					<h3 className="mb-4 font-medium text-sm">Recent Invoices</h3>
					{isLoading && (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<div className="flex items-center justify-between py-3" key={i}>
									<div className="space-y-2">
										<div className="h-4 w-32 animate-pulse rounded bg-white/10" />
										<div className="h-3 w-24 animate-pulse rounded bg-white/10" />
									</div>
									<div className="h-5 w-16 animate-pulse rounded bg-white/10" />
								</div>
							))}
						</div>
					)}
					{!isLoading && invoices.length === 0 && (
						<p className="py-8 text-center text-sm text-white/40">
							No invoices yet
						</p>
					)}
					{!isLoading && invoices.length > 0 && (
						<div>
							{invoices.slice(0, 5).map((invoice) => (
								<RecentItem
									key={invoice.id}
									label={`$${invoice.amount.toFixed(2)}`}
									subtitle={invoice.status}
									value={
										invoice.dueDate
											? new Date(invoice.dueDate).toLocaleDateString()
											: "No due date"
									}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
