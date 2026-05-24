import { ChevronDown, FolderKanban } from "lucide-react";
import { useEffect, useState } from "react";
import { api, type Project } from "../../lib/api";
import { cn } from "../../lib/utils";

const statusConfig: Record<string, { label: string; tone: string }> = {
	PENDING: { label: "Pending", tone: "text-amber-400 border-amber-500/40" },
	IN_PROGRESS: {
		label: "In Progress",
		tone: "text-primary border-primary/40",
	},
	ON_HOLD: { label: "On Hold", tone: "text-orange-400 border-orange-500/40" },
	COMPLETED: {
		label: "Completed",
		tone: "text-emerald-400 border-emerald-500/40",
	},
	CANCELLED: { label: "Cancelled", tone: "text-red-400 border-red-500/40" },
};

export function PortalProjects() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [expandedId, setExpandedId] = useState<string | null>(null);

	useEffect(() => {
		async function fetchProjects() {
			try {
				const mockCustomerId = "customer-1";
				const res = await api.projects.list({ customerId: mockCustomerId });
				setProjects(res.projects);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load projects");
			} finally {
				setIsLoading(false);
			}
		}

		fetchProjects();
	}, []);

	const getStatusConfig = (status: string) =>
		statusConfig[status] || {
			label: status,
			tone: "text-white/70 border-white/20",
		};

	return (
		<div className="space-y-10">
			<header>
				<p className="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
					// Projects
				</p>
				<h1 className="mt-3 font-black text-4xl uppercase leading-[0.9] tracking-[-0.03em] sm:text-5xl">
					Your Work.
				</h1>
				<div className="mt-6 h-px bg-white/10" />
			</header>

			{error && (
				<div className="border border-red-500/30 bg-red-500/5 p-4 font-mono text-[11px] text-red-300 uppercase tracking-[0.2em]">
					// {error}
				</div>
			)}

			{isLoading && (
				<div className="space-y-3">
					{[1, 2, 3].map((i) => (
						<div
							className="h-24 animate-pulse border border-white/10 bg-white/5"
							key={i}
						/>
					))}
				</div>
			)}

			{!isLoading && !error && projects.length === 0 && (
				<div className="flex flex-col items-center justify-center border border-white/10 bg-white/[0.02] py-20">
					<FolderKanban className="h-10 w-10 text-white/20" />
					<p className="mt-6 font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
						// No projects yet
					</p>
					<p className="mt-2 text-sm text-white/40">
						Your active projects will land here.
					</p>
				</div>
			)}

			{!isLoading && projects.length > 0 && (
				<div className="space-y-3">
					{projects.map((project, index) => {
						const isExpanded = expandedId === project.id;
						const statusCfg = getStatusConfig(project.status);
						const idx = String(index + 1).padStart(2, "0");

						return (
							<div
								className="border border-white/10 bg-neutral-950 transition-colors hover:border-white/20"
								key={project.id}
							>
								<button
									className="flex w-full items-center gap-4 p-5 text-left"
									onClick={() =>
										setExpandedId(isExpanded ? null : project.id)
									}
									type="button"
								>
									<span className="font-mono text-[10px] text-white/40 uppercase tracking-[0.35em]">
										{idx}
									</span>
									<div className="flex-1">
										<div className="flex flex-wrap items-center gap-3">
											<h3 className="font-bold text-base uppercase tracking-tight sm:text-lg">
												{project.title}
											</h3>
											<span
												className={cn(
													"inline-flex border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em]",
													statusCfg.tone
												)}
											>
												{statusCfg.label}
											</span>
										</div>
										{project.description && (
											<p className="mt-1.5 line-clamp-2 text-sm text-white/55">
												{project.description}
											</p>
										)}
									</div>
									<ChevronDown
										className={cn(
											"h-4 w-4 text-white/40 transition-transform",
											isExpanded && "rotate-180"
										)}
									/>
								</button>

								{isExpanded && (
									<div className="border-white/10 border-t px-5 pt-5 pb-6">
										<div className="space-y-5">
											<div>
												<div className="flex items-baseline justify-between">
													<span className="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
														// Progress
													</span>
													<span className="font-black text-2xl tracking-tight">
														{project.progress}%
													</span>
												</div>
												<div className="mt-3 h-1 overflow-hidden bg-white/10">
													<div
														className="h-full bg-white transition-all duration-500"
														style={{ width: `${project.progress}%` }}
													/>
												</div>
											</div>

											<dl className="grid gap-3 sm:grid-cols-3">
												{project.startDate && (
													<MetaRow
														label="Started"
														value={new Date(
															project.startDate
														).toLocaleDateString()}
													/>
												)}
												{project.endDate && (
													<MetaRow
														label="Target"
														value={new Date(
															project.endDate
														).toLocaleDateString()}
													/>
												)}
												{project.customer?.companyName && (
													<MetaRow
														label="Company"
														value={project.customer.companyName}
													/>
												)}
											</dl>
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

function MetaRow({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<dt className="font-mono text-[10px] text-white/45 uppercase tracking-[0.35em]">
				// {label}
			</dt>
			<dd className="mt-1 text-sm text-white/80">{value}</dd>
		</div>
	);
}
