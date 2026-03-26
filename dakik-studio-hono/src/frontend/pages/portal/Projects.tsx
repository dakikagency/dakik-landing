import { useEffect, useState } from "react";
import { api, type Project } from "../../lib/api";
import { cn } from "../../lib/utils";

const statusConfig: Record<string, { label: string; color: string }> = {
	PENDING: {
		label: "Pending",
		color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
	},
	IN_PROGRESS: {
		label: "In Progress",
		color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
	},
	ON_HOLD: {
		label: "On Hold",
		color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
	},
	COMPLETED: {
		label: "Completed",
		color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
	},
	CANCELLED: {
		label: "Cancelled",
		color: "bg-red-500/10 text-red-400 border-red-500/20",
	},
};

export function PortalProjects() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [expandedId, setExpandedId] = useState<string | null>(null);

	useEffect(() => {
		async function fetchProjects() {
			try {
				const mockCustomerId = "customer-1";
				const res = await api.projects.list({ customerId: mockCustomerId });
				setProjects(res.projects);
			} catch {
				setProjects([]);
			} finally {
				setIsLoading(false);
			}
		}

		fetchProjects();
	}, []);

	const getStatusConfig = (status: string) => {
		return (
			statusConfig[status] || {
				label: status,
				color: "bg-white/10 text-white/70 border-white/20",
			}
		);
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-3xl">My Projects</h1>
				<p className="mt-2 text-white/60">
					Track the progress of your projects
				</p>
			</div>

			{isLoading && (
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<div className="h-32 animate-pulse rounded-xl bg-white/5" key={i} />
					))}
				</div>
			)}

			{!isLoading && projects.length === 0 && (
				<div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-16">
					<svg
						aria-hidden="true"
						className="h-12 w-12 text-white/30"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
						/>
					</svg>
					<p className="mt-4 font-medium text-lg">No projects yet</p>
					<p className="mt-1 text-sm text-white/50">
						Your active projects will appear here
					</p>
				</div>
			)}

			{!isLoading && projects.length > 0 && (
				<div className="space-y-4">
					{projects.map((project) => {
						const isExpanded = expandedId === project.id;
						const statusCfg = getStatusConfig(project.status);

						return (
							<div
								className="overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all"
								key={project.id}
							>
								<button
									className="flex w-full items-center justify-between p-6 text-left"
									onClick={() => setExpandedId(isExpanded ? null : project.id)}
									type="button"
								>
									<div className="flex-1">
										<div className="flex items-center gap-3">
											<h3 className="font-semibold text-lg">{project.title}</h3>
											<span
												className={cn(
													"rounded-full border px-2.5 py-0.5 font-medium text-xs",
													statusCfg.color
												)}
											>
												{statusCfg.label}
											</span>
										</div>
										{project.description && (
											<p className="mt-1 line-clamp-2 text-sm text-white/60">
												{project.description}
											</p>
										)}
									</div>
									<svg
										aria-hidden="true"
										className={cn(
											"ml-4 h-5 w-5 text-white/40 transition-transform",
											isExpanded && "rotate-180"
										)}
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											d="M19 9l-7 7-7-7"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
										/>
									</svg>
								</button>

								{isExpanded && (
									<div className="border-white/10 border-t px-6 pt-4 pb-6">
										<div className="space-y-4">
											<div>
												<div className="flex justify-between text-sm">
													<span className="text-white/60">Progress</span>
													<span className="font-medium">
														{project.progress}%
													</span>
												</div>
												<div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
													<div
														className="h-full rounded-full bg-white transition-all duration-500"
														style={{ width: `${project.progress}%` }}
													/>
												</div>
											</div>

											{project.startDate && (
												<div className="flex justify-between text-sm">
													<span className="text-white/60">Start Date</span>
													<span>
														{new Date(project.startDate).toLocaleDateString()}
													</span>
												</div>
											)}

											{project.endDate && (
												<div className="flex justify-between text-sm">
													<span className="text-white/60">End Date</span>
													<span>
														{new Date(project.endDate).toLocaleDateString()}
													</span>
												</div>
											)}

											{project.customer?.companyName && (
												<div className="flex justify-between text-sm">
													<span className="text-white/60">Company</span>
													<span>{project.customer.companyName}</span>
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
