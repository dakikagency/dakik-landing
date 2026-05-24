import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { api, type Meeting } from "../../lib/api";
import { cn } from "../../lib/utils";

const statusConfig: Record<string, { label: string; tone: string }> = {
	SCHEDULED: {
		label: "Scheduled",
		tone: "text-emerald-400 border-emerald-500/40",
	},
	COMPLETED: { label: "Completed", tone: "text-white/70 border-white/30" },
	CANCELLED: { label: "Cancelled", tone: "text-red-400 border-red-500/40" },
};

export function PortalMeetings() {
	const [meetings, setMeetings] = useState<Meeting[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchMeetings() {
			try {
				const res = await api.meetings.list();
				setMeetings(res.meetings);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load meetings");
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
			prev.map((m) =>
				m.id === meetingId ? { ...m, status: "CANCELLED" } : m
			)
		);
	};

	const getStatusConfig = (status: string) =>
		statusConfig[status] || {
			label: status,
			tone: "text-white/70 border-white/20",
		};

	const now = new Date();
	const upcomingMeetings = meetings.filter(
		(m) => m.status === "SCHEDULED" && new Date(m.scheduledAt) > now
	);
	const pastMeetings = meetings.filter(
		(m) => m.status !== "SCHEDULED" || new Date(m.scheduledAt) <= now
	);

	return (
		<div className="space-y-10">
			<header>
				<p className="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
					// Meetings
				</p>
				<h1 className="mt-3 font-black text-4xl uppercase leading-[0.9] tracking-[-0.03em] sm:text-5xl">
					On The Calendar.
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
							className="h-20 animate-pulse border border-white/10 bg-white/5"
							key={i}
						/>
					))}
				</div>
			)}

			{!isLoading && !error && meetings.length === 0 && (
				<div className="flex flex-col items-center justify-center border border-white/10 bg-white/[0.02] py-20">
					<Calendar className="h-10 w-10 text-white/20" />
					<p className="mt-6 font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
						// No meetings yet
					</p>
					<p className="mt-2 text-sm text-white/40">
						Upcoming meetings will land here.
					</p>
				</div>
			)}

			{!isLoading && meetings.length > 0 && (
				<>
					{upcomingMeetings.length > 0 && (
						<MeetingsSection
							caption="// Upcoming"
							meetings={upcomingMeetings}
							formatDateTime={formatDateTime}
							formatDuration={formatDuration}
							getStatusConfig={getStatusConfig}
							onJoin={handleJoin}
							onCancel={handleCancel}
							showActions
						/>
					)}

					{pastMeetings.length > 0 && (
						<MeetingsSection
							caption="// Past"
							meetings={pastMeetings}
							formatDateTime={formatDateTime}
							formatDuration={formatDuration}
							getStatusConfig={getStatusConfig}
							dimmed
						/>
					)}
				</>
			)}
		</div>
	);
}

interface MeetingsSectionProps {
	caption: string;
	meetings: Meeting[];
	formatDateTime: (s: string) => { date: string; time: string };
	formatDuration: (m: number) => string;
	getStatusConfig: (s: string) => { label: string; tone: string };
	onJoin?: (m: Meeting) => void;
	onCancel?: (id: string) => void;
	showActions?: boolean;
	dimmed?: boolean;
}

function MeetingsSection({
	caption,
	meetings,
	formatDateTime,
	formatDuration,
	getStatusConfig,
	onJoin,
	onCancel,
	showActions,
	dimmed,
}: MeetingsSectionProps) {
	return (
		<section>
			<div className="mb-5 flex items-center gap-3">
				<span className="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
					{caption}
				</span>
				<span className="h-px flex-1 bg-white/10" />
				<span className="font-mono text-[10px] text-white/40 uppercase tracking-[0.35em]">
					{meetings.length}
				</span>
			</div>

			<div
				className={cn(
					"space-y-3",
					dimmed && "opacity-60"
				)}
			>
				{meetings.map((meeting) => {
					const { date, time } = formatDateTime(meeting.scheduledAt);
					const statusCfg = getStatusConfig(meeting.status);
					const canJoin =
						meeting.status === "SCHEDULED" && Boolean(meeting.meetUrl);
					const canCancel = meeting.status === "SCHEDULED";

					return (
						<div
							className="border border-white/10 bg-neutral-950 p-5 transition-colors hover:border-white/20"
							key={meeting.id}
						>
							<div className="flex flex-wrap items-start justify-between gap-4">
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-3">
										<h3 className="font-bold text-base uppercase tracking-tight sm:text-lg">
											{meeting.title}
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
									{meeting.description && (
										<p className="mt-1.5 line-clamp-1 text-sm text-white/55">
											{meeting.description}
										</p>
									)}
								</div>

								{showActions && (
									<div className="flex items-center gap-2">
										{canJoin && onJoin && (
											<button
												className="inline-flex items-center justify-center border-2 border-white bg-white px-4 py-2 font-medium text-black uppercase tracking-wider transition-colors hover:bg-black hover:text-white"
												onClick={() => onJoin(meeting)}
												type="button"
											>
												<span className="text-xs">Join</span>
											</button>
										)}
										{canCancel && onCancel && (
											<button
												className="inline-flex items-center justify-center border-2 border-white/20 bg-transparent px-4 py-2 font-medium text-white/70 uppercase tracking-wider transition-colors hover:border-white hover:text-white"
												onClick={() => onCancel(meeting.id)}
												type="button"
											>
												<span className="text-xs">Cancel</span>
											</button>
										)}
									</div>
								)}
							</div>

							<dl className="mt-4 grid gap-3 border-white/5 border-t pt-4 sm:grid-cols-3">
								<MetaRow label="Date" value={date} />
								<MetaRow label="Time" value={time} />
								<MetaRow label="Duration" value={formatDuration(meeting.duration)} />
							</dl>
						</div>
					);
				})}
			</div>
		</section>
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
