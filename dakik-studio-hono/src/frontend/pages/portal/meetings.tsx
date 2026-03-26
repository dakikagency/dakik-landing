import { useEffect, useState } from "react";
import { api, type Meeting } from "../../lib/api";
import { cn } from "../../lib/utils";

const statusConfig: Record<string, { label: string; color: string }> = {
	SCHEDULED: {
		label: "Scheduled",
		color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
	},
	COMPLETED: {
		label: "Completed",
		color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
	},
	CANCELLED: {
		label: "Cancelled",
		color: "bg-red-500/10 text-red-400 border-red-500/20",
	},
};

export function PortalMeetings() {
	const [meetings, setMeetings] = useState<Meeting[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchMeetings() {
			try {
				const res = await api.meetings.list();
				setMeetings(res.meetings);
			} catch {
				setMeetings([]);
			} finally {
				setIsLoading(false);
			}
		}

		fetchMeetings();
	}, []);

	const formatDateTime = (dateStr: string) => {
		const date = new Date(dateStr);
		return {
			date: date.toLocaleDateString("en-US", {
				weekday: "short",
				month: "short",
				day: "numeric",
			}),
			time: date.toLocaleTimeString("en-US", {
				hour: "numeric",
				minute: "2-digit",
			}),
		};
	};

	const formatDuration = (minutes: number) =>
		minutes < 60
			? `${minutes} min`
			: (() => {
					const hours = Math.floor(minutes / 60);
					const mins = minutes % 60;
					return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
				})();

	const handleJoin = (meeting: Meeting) => {
		if (meeting.meetUrl) {
			window.open(meeting.meetUrl, "_blank", "noopener,noreferrer");
		}
	};

	const handleCancel = async (meetingId: string) => {
		await api.meetings.update(meetingId, { status: "CANCELLED" });
		setMeetings((prev) =>
			prev.map((m) => (m.id === meetingId ? { ...m, status: "CANCELLED" } : m))
		);
	};

	const getStatusConfig = (status: string) => {
		return (
			statusConfig[status] || {
				label: status,
				color: "bg-white/10 text-white/70 border-white/20",
			}
		);
	};

	const now = new Date();
	const upcomingMeetings = meetings.filter(
		(m) => m.status === "SCHEDULED" && new Date(m.scheduledAt) > now
	);
	const pastMeetings = meetings.filter(
		(m) => m.status !== "SCHEDULED" || new Date(m.scheduledAt) <= now
	);

	return (
		<div className="space-y-8">
			<div>
				<h1 className="font-bold text-3xl">My Meetings</h1>
				<p className="mt-2 text-white/60">
					View and manage your scheduled meetings
				</p>
			</div>

			{isLoading && (
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<div className="h-20 animate-pulse rounded-xl bg-white/5" key={i} />
					))}
				</div>
			)}

			{!isLoading && meetings.length === 0 && (
				<div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-16">
					<svg
						aria-hidden="true"
						className="h-12 w-12 text-white/30"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
						/>
					</svg>
					<p className="mt-4 font-medium text-lg">No meetings scheduled</p>
					<p className="mt-1 text-sm text-white/50">
						Your upcoming meetings will appear here
					</p>
				</div>
			)}

			{!isLoading && meetings.length > 0 && (
				<>
					{upcomingMeetings.length > 0 && (
						<div className="space-y-4">
							<h2 className="font-semibold text-lg">Upcoming Meetings</h2>
							<div className="overflow-hidden rounded-xl border border-white/10">
								<table className="w-full">
									<thead className="border-white/10 border-b bg-white/5">
										<tr>
											<th className="px-6 py-4 text-left font-medium text-sm text-white/60">
												Title
											</th>
											<th className="px-6 py-4 text-left font-medium text-sm text-white/60">
												Date & Time
											</th>
											<th className="px-6 py-4 text-center font-medium text-sm text-white/60">
												Duration
											</th>
											<th className="px-6 py-4 text-center font-medium text-sm text-white/60">
												Status
											</th>
											<th className="px-6 py-4 text-right font-medium text-sm text-white/60">
												Action
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-white/10">
										{upcomingMeetings.map((meeting) => {
											const { date, time } = formatDateTime(
												meeting.scheduledAt
											);
											const statusCfg = getStatusConfig(meeting.status);
											const canJoin =
												meeting.status === "SCHEDULED" && meeting.meetUrl;
											const canCancel = meeting.status === "SCHEDULED";

											return (
												<tr
													className="transition-colors hover:bg-white/5"
													key={meeting.id}
												>
													<td className="px-6 py-4">
														<div>
															<p className="font-medium">{meeting.title}</p>
															{meeting.description && (
																<p className="mt-1 line-clamp-1 text-sm text-white/50">
																	{meeting.description}
																</p>
															)}
														</div>
													</td>
													<td className="whitespace-nowrap px-6 py-4">
														<div className="text-sm">
															<p>{date}</p>
															<p className="text-white/50">{time}</p>
														</div>
													</td>
													<td className="whitespace-nowrap px-6 py-4 text-center">
														<span className="text-sm text-white/60">
															{formatDuration(meeting.duration)}
														</span>
													</td>
													<td className="whitespace-nowrap px-6 py-4 text-center">
														<span
															className={cn(
																"inline-flex rounded-full border px-2.5 py-0.5 font-medium text-xs",
																statusCfg.color
															)}
														>
															{statusCfg.label}
														</span>
													</td>
													<td className="whitespace-nowrap px-6 py-4 text-right">
														<div className="flex items-center justify-end gap-2">
															{canJoin && (
																<button
																	className="rounded-lg bg-white px-4 py-2 font-medium text-black text-sm transition-opacity hover:opacity-90"
																	onClick={() => handleJoin(meeting)}
																	type="button"
																>
																	Join
																</button>
															)}
															{canCancel && (
																<button
																	className="rounded-lg border border-white/10 px-4 py-2 font-medium text-sm text-white/70 transition-colors hover:bg-white/5"
																	onClick={() => handleCancel(meeting.id)}
																	type="button"
																>
																	Cancel
																</button>
															)}
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>
					)}

					{pastMeetings.length > 0 && (
						<div className="space-y-4">
							<h2 className="font-semibold text-lg">Past Meetings</h2>
							<div className="overflow-hidden rounded-xl border border-white/10">
								<table className="w-full">
									<thead className="border-white/10 border-b bg-white/5">
										<tr>
											<th className="px-6 py-4 text-left font-medium text-sm text-white/60">
												Title
											</th>
											<th className="px-6 py-4 text-left font-medium text-sm text-white/60">
												Date & Time
											</th>
											<th className="px-6 py-4 text-center font-medium text-sm text-white/60">
												Duration
											</th>
											<th className="px-6 py-4 text-center font-medium text-sm text-white/60">
												Status
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-white/10">
										{pastMeetings.map((meeting) => {
											const { date, time } = formatDateTime(
												meeting.scheduledAt
											);
											const statusCfg = getStatusConfig(meeting.status);

											return (
												<tr
													className="opacity-60 transition-colors hover:bg-white/5"
													key={meeting.id}
												>
													<td className="px-6 py-4">
														<p className="font-medium">{meeting.title}</p>
													</td>
													<td className="whitespace-nowrap px-6 py-4">
														<div className="text-sm">
															<p>{date}</p>
															<p className="text-white/50">{time}</p>
														</div>
													</td>
													<td className="whitespace-nowrap px-6 py-4 text-center">
														<span className="text-sm text-white/60">
															{formatDuration(meeting.duration)}
														</span>
													</td>
													<td className="whitespace-nowrap px-6 py-4 text-center">
														<span
															className={cn(
																"inline-flex rounded-full border px-2.5 py-0.5 font-medium text-xs",
																statusCfg.color
															)}
														>
															{statusCfg.label}
														</span>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}
