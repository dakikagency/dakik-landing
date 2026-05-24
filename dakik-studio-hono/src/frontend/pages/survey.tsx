import { useHead } from "@unhead/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { cn } from "../lib/utils";

const TOTAL_STEPS = 5;
type Step = 1 | 2 | 3 | 4 | 5;

interface FormState {
	projectType: string;
	budget: string;
	details: string;
	name: string;
	email: string;
	phone: string;
	source: string;
}

const INITIAL: FormState = {
	projectType: "",
	budget: "",
	details: "",
	name: "",
	email: "",
	phone: "",
	source: "",
};

interface ChipOption {
	label: string;
	value: string;
}

const PROJECT_TYPES: readonly ChipOption[] = [
	{ label: "A website or app", value: "WEB_MOBILE" },
	{ label: "A brand or rebrand", value: "BRAND_IDENTITY" },
	{ label: "Automating something", value: "AI_AUTOMATION" },
	{ label: "All of the above", value: "FULL_PRODUCT" },
];

const BUDGETS: readonly ChipOption[] = [
	{ label: "£5k – £10k", value: "RANGE_5K_10K" },
	{ label: "£10k – £25k", value: "RANGE_10K_25K" },
	{ label: "£25k – £50k", value: "RANGE_25K_50K" },
	{ label: "£50k+", value: "RANGE_50K_PLUS" },
];

const SOURCES: readonly ChipOption[] = [
	{ label: "Google", value: "Google" },
	{ label: "Referral", value: "Referral" },
	{ label: "Social", value: "Social" },
	{ label: "Other", value: "Other" },
];

const MEETING_DURATION_MINS = 30;
const MEETING_WINDOW_DAYS = 14;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface BookedMeeting {
	date: string;
	startTime: string;
	meetUrl?: string;
}

export function SurveyPage() {
	useHead({
		title: "Start a project · Dakik Studio",
		meta: [
			{
				name: "description",
				content:
					"Tell us what you want to build. A handful of questions, then pick a time.",
			},
			{ name: "robots", content: "noindex" },
		],
	});

	const [step, setStep] = useState<Step>(1);
	const [form, setForm] = useState<FormState>(INITIAL);
	const [errors, setErrors] = useState<
		Partial<Record<keyof FormState, string>>
	>({});
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [leadId, setLeadId] = useState<string | null>(null);
	const [bookedMeeting, setBookedMeeting] = useState<BookedMeeting | null>(null);

	const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS) as Step);
	const goBack = () => setStep((s) => Math.max(s - 1, 1) as Step);

	const selectAndAdvance = (field: keyof FormState, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
		setTimeout(goNext, 350);
	};

	const updateField = (field: keyof FormState, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
	};

	const validateContact = (): boolean => {
		const next: Partial<Record<keyof FormState, string>> = {};
		if (!form.name.trim()) next.name = "Required";
		if (!form.email.trim()) next.email = "Required";
		else if (!emailRegex.test(form.email)) next.email = "Doesn't look right";
		setErrors(next);
		return Object.keys(next).length === 0;
	};

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError(null);
		if (!validateContact()) return;
		setSubmitting(true);
		try {
			const res = await api.leads.create({
				name: form.name,
				email: form.email,
				projectType: form.projectType || undefined,
				budget: form.budget || undefined,
				details: form.details || undefined,
				source: form.source || undefined,
				status: "NEW",
			});
			setLeadId(res.lead.id);
			goNext();
		} catch (err) {
			setSubmitError(
				err instanceof Error
					? err.message
					: "Something went wrong. Try again, or email hello@dakik.co.uk.",
			);
		} finally {
			setSubmitting(false);
		}
	};

	const handleMeetingBooked = (meeting: BookedMeeting) => {
		setBookedMeeting(meeting);
	};

	if (bookedMeeting) {
		return <SuccessScreen meeting={bookedMeeting} />;
	}

	return (
		<div className="relative flex min-h-screen flex-col bg-black text-white">
			<ProgressBar percent={(step / TOTAL_STEPS) * 100} />

			<header className="flex items-baseline justify-between px-[clamp(1.5rem,6vw,6rem)] pt-12">
				<span className="font-mono text-[11px] text-white/55 uppercase tracking-[0.35em] tabular-nums">
					{String(step).padStart(2, "0")} /{" "}
					{String(TOTAL_STEPS).padStart(2, "0")}
				</span>
				<Link
					className="font-mono text-[11px] text-white/55 uppercase tracking-[0.35em] transition-colors hover:text-white"
					to="/"
				>
					Dakik Studio
				</Link>
			</header>

			<main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-[clamp(1.5rem,6vw,6rem)] py-16">
				{step === 1 && (
					<Question
						question="What are you trying to build?"
						sublabel="Pick the closest match. We'll dig into specifics on the call."
					>
						<ChipGrid
							onSelect={(v) => selectAndAdvance("projectType", v)}
							options={PROJECT_TYPES}
							selected={form.projectType}
						/>
					</Question>
				)}

				{step === 2 && (
					<Question
						question="What's the budget?"
						sublabel="Rough range is fine. Helps us figure out what's realistic."
					>
						<ChipGrid
							onSelect={(v) => selectAndAdvance("budget", v)}
							options={BUDGETS}
							selected={form.budget}
						/>
					</Question>
				)}

				{step === 3 && (
					<Question
						question="Tell us about it."
						sublabel="What you want, when, anything we should know. Skip if you'd rather chat."
					>
						{/* biome-ignore lint/a11y/noAutofocus: focused for survey flow */}
						<textarea
							autoFocus
							className="w-full resize-none border-white/20 border-b-2 bg-transparent pb-3 text-xl text-white leading-relaxed placeholder:text-white/25 focus:border-white focus:outline-none lg:text-2xl"
							onChange={(e) => updateField("details", e.target.value)}
							placeholder="Paste a link, jot down what you're picturing…"
							rows={5}
							value={form.details}
						/>
					</Question>
				)}

				{step === 4 && (
					<form id="contact-form" onSubmit={submit}>
						<Question
							question="How do we reach you?"
							sublabel="Name and email are enough. The rest is optional."
						>
							<div className="space-y-8">
								<FieldInput
									autoFocus
									error={errors.name}
									label="Name"
									onChange={(v) => updateField("name", v)}
									value={form.name}
								/>
								<FieldInput
									error={errors.email}
									label="Email"
									onChange={(v) => updateField("email", v)}
									type="email"
									value={form.email}
								/>
								<FieldInput
									label="Phone (optional)"
									onChange={(v) => updateField("phone", v)}
									type="tel"
									value={form.phone}
								/>
								<div>
									<span className="mb-3 block font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
										Where did you find us? (optional)
									</span>
									<div className="flex flex-wrap gap-2">
										{SOURCES.map((src) => (
											<button
												className={cn(
													"border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.25em] transition-colors",
													form.source === src.value
														? "border-white bg-white text-black"
														: "border-white/20 text-white/65 hover:border-white/50 hover:text-white",
												)}
												key={src.value}
												onClick={() => updateField("source", src.value)}
												type="button"
											>
												{src.label}
											</button>
										))}
									</div>
								</div>
							</div>
						</Question>

						{submitError && (
							<div className="mt-8 border-2 border-white bg-white/[0.02] px-4 py-3 font-mono text-[11px] text-white uppercase tracking-[0.25em]">
								// Error: {submitError}
							</div>
						)}
					</form>
				)}

				{step === 5 && leadId && (
					<MeetingStep
						leadId={leadId}
						lead={{ name: form.name, email: form.email }}
						onBooked={handleMeetingBooked}
					/>
				)}
			</main>

			<nav className="flex items-center justify-between px-[clamp(1.5rem,6vw,6rem)] pb-12">
				{step > 1 && step < 5 ? (
					<button
						className="group inline-flex items-center gap-3 font-mono text-[11px] text-white/55 uppercase tracking-[0.35em] transition-colors hover:text-white"
						onClick={goBack}
						type="button"
					>
						<ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
						Back
					</button>
				) : (
					<span />
				)}

				{step === 3 && (
					<button
						className="group inline-flex items-center gap-3 border-2 border-white px-6 py-3 font-medium text-base uppercase tracking-wider transition-colors hover:bg-white hover:text-black"
						onClick={goNext}
						type="button"
					>
						Next
						<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
					</button>
				)}

				{step === 4 && (
					<button
						className="group inline-flex items-center gap-3 border-2 border-white bg-white px-6 py-3 font-medium text-base text-black uppercase tracking-wider transition-colors hover:bg-transparent hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
						disabled={submitting}
						form="contact-form"
						type="submit"
					>
						{submitting ? "Sending…" : "Continue"}
						{!submitting && <ArrowRight className="size-4" />}
					</button>
				)}
			</nav>
		</div>
	);
}

function ProgressBar({ percent }: { percent: number }) {
	return (
		<div
			aria-label="Survey progress"
			className="fixed top-0 right-0 left-0 z-50 h-px bg-white/10"
			role="progressbar"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(percent)}
		>
			<div
				className="h-full bg-white transition-[width] duration-500 ease-out"
				style={{ width: `${percent}%` }}
			/>
		</div>
	);
}

function Question({
	question,
	sublabel,
	children,
}: {
	question: string;
	sublabel: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<h1 className="font-black text-[clamp(2.25rem,7vw,5rem)] uppercase leading-[0.92] tracking-[-0.04em]">
				{question}
			</h1>
			<p className="mt-4 max-w-[48ch] text-base text-white/55 leading-relaxed lg:text-lg">
				{sublabel}
			</p>
			<div className="mt-10 lg:mt-12">{children}</div>
		</div>
	);
}

function ChipGrid({
	options,
	selected,
	onSelect,
}: {
	options: readonly ChipOption[];
	selected: string;
	onSelect: (value: string) => void;
}) {
	return (
		<div className="flex flex-col gap-3">
			{options.map((opt, i) => {
				const isSelected = selected === opt.value;
				return (
					<button
						className={cn(
							"group flex items-center justify-between gap-4 border-2 px-6 py-5 text-left transition-all",
							isSelected
								? "border-white bg-white text-black"
								: "border-white/15 text-white hover:border-white hover:bg-white/[0.03]",
						)}
						key={`${opt.value}-${i}`}
						onClick={() => onSelect(opt.value)}
						type="button"
					>
						<span className="font-medium text-lg lg:text-xl">{opt.label}</span>
						{isSelected ? (
							<Check className="size-5 shrink-0" />
						) : (
							<ArrowRight className="size-5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
						)}
					</button>
				);
			})}
		</div>
	);
}

function FieldInput({
	label,
	value,
	onChange,
	error,
	type = "text",
	autoFocus,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	error?: string;
	type?: string;
	autoFocus?: boolean;
}) {
	return (
		<label className="block">
			<span className="mb-3 block font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
				{label}
			</span>
			{/* biome-ignore lint/a11y/noAutofocus: focused for survey flow */}
			<input
				autoFocus={autoFocus}
				className={cn(
					"w-full border-b-2 bg-transparent pb-3 text-xl text-white placeholder:text-white/20 focus:outline-none lg:text-2xl",
					error ? "border-white" : "border-white/20 focus:border-white",
				)}
				onChange={(e) => onChange(e.target.value)}
				type={type}
				value={value}
			/>
			{error && (
				<span className="mt-2 block font-mono text-[10px] text-white uppercase tracking-[0.25em]">
					// {error}
				</span>
			)}
		</label>
	);
}

interface AvailabilityResponse {
	slots: Array<{
		date: string;
		times: Array<{ start: string; end: string; available: boolean }>;
	}>;
}

function MeetingStep({
	leadId,
	lead,
	onBooked,
}: {
	leadId: string;
	lead: { name: string; email: string };
	onBooked: (m: BookedMeeting) => void;
}) {
	const [availability, setAvailability] = useState<AvailabilityResponse | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [selectedStart, setSelectedStart] = useState<string | null>(null);
	const [booking, setBooking] = useState(false);
	const [bookingError, setBookingError] = useState<string | null>(null);

	useEffect(() => {
		const fetchSlots = async () => {
			try {
				const today = new Date();
				const end = new Date();
				end.setDate(end.getDate() + MEETING_WINDOW_DAYS);
				const res = await api.availability.getSlots({
					startDate: today.toISOString().split("T")[0],
					endDate: end.toISOString().split("T")[0],
					duration: MEETING_DURATION_MINS,
				});
				setAvailability(res);
				// Default to first day that has at least one available slot.
				const firstAvailableDay = res.slots.find((d) =>
					d.times.some((t) => t.available),
				);
				if (firstAvailableDay) {
					setSelectedDate(firstAvailableDay.date);
				} else if (res.slots.length > 0) {
					setSelectedDate(res.slots[0].date);
				}
			} catch (err) {
				setLoadError(
					err instanceof Error ? err.message : "Couldn't load availability",
				);
			} finally {
				setLoading(false);
			}
		};
		fetchSlots();
	}, []);

	const selectedDay = availability?.slots.find((d) => d.date === selectedDate);
	const availableTimes = selectedDay?.times.filter((t) => t.available) ?? [];

	const bookSlot = async (startTime: string) => {
		if (!selectedDate) return;
		setSelectedStart(startTime);
		setBooking(true);
		setBookingError(null);
		try {
			const res = await api.meetings.create({
				leadId,
				title: `Intro call · ${lead.name}`,
				description: `Project intake call with ${lead.name} (${lead.email}).`,
				date: selectedDate,
				startTime,
				duration: MEETING_DURATION_MINS,
			});
			onBooked({
				date: selectedDate,
				startTime,
				meetUrl: res.meeting.meetUrl,
			});
		} catch (err) {
			setBookingError(
				err instanceof Error
					? err.message
					: "Couldn't book that slot. Try another.",
			);
			setSelectedStart(null);
		} finally {
			setBooking(false);
		}
	};

	return (
		<div>
			<h1 className="font-black text-[clamp(2.25rem,7vw,5rem)] uppercase leading-[0.92] tracking-[-0.04em]">
				Pick a time.
			</h1>
			<p className="mt-4 max-w-[48ch] text-base text-white/55 leading-relaxed lg:text-lg">
				A {MEETING_DURATION_MINS}-minute intro call with Erdeniz. We'll confirm
				by email and add Google Meet.
			</p>

			{loading && (
				<div className="mt-10 font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
					// Loading availability…
				</div>
			)}

			{loadError && (
				<div className="mt-10 border-2 border-white bg-white/[0.02] px-4 py-3 font-mono text-[11px] text-white uppercase tracking-[0.25em]">
					// Error: {loadError}
				</div>
			)}

			{!loading && !loadError && availability && (
				<div className="mt-10 space-y-8">
					<DateStrip
						days={availability.slots}
						selected={selectedDate}
						onSelect={(d) => {
							setSelectedDate(d);
							setSelectedStart(null);
							setBookingError(null);
						}}
					/>

					<TimeGrid
						times={availableTimes}
						selectedStart={selectedStart}
						disabled={booking}
						onSelect={bookSlot}
					/>

					{availableTimes.length === 0 && selectedDate && (
						<p className="font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
							// Nothing free this day — try another
						</p>
					)}

					{bookingError && (
						<div className="border-2 border-white bg-white/[0.02] px-4 py-3 font-mono text-[11px] text-white uppercase tracking-[0.25em]">
							// Error: {bookingError}
						</div>
					)}

					{booking && (
						<div className="font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
							// Booking {selectedStart}…
						</div>
					)}
				</div>
			)}
		</div>
	);
}

function DateStrip({
	days,
	selected,
	onSelect,
}: {
	days: Array<{ date: string; times: Array<{ available: boolean }> }>;
	selected: string | null;
	onSelect: (date: string) => void;
}) {
	return (
		<div>
			<span className="mb-3 block font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
				// Date
			</span>
			<div className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-2">
				{days.map((day) => {
					const dt = new Date(`${day.date}T00:00:00`);
					const dayName = dt.toLocaleDateString("en-US", { weekday: "short" });
					const dayNum = dt.getDate();
					const monthName = dt.toLocaleDateString("en-US", { month: "short" });
					const isSelected = day.date === selected;
					const hasAvailability = day.times.some((t) => t.available);

					return (
						<button
							className={cn(
								"flex shrink-0 flex-col items-center gap-1 border-2 px-4 py-3 transition-colors",
								isSelected
									? "border-white bg-white text-black"
									: hasAvailability
										? "border-white/20 text-white hover:border-white/60"
										: "border-white/10 text-white/30 hover:border-white/20",
							)}
							key={day.date}
							onClick={() => onSelect(day.date)}
							type="button"
						>
							<span className="font-mono text-[9px] uppercase tracking-[0.25em] opacity-70">
								{dayName}
							</span>
							<span className="font-black text-xl leading-none tracking-tight">
								{dayNum}
							</span>
							<span className="font-mono text-[9px] uppercase tracking-[0.25em] opacity-70">
								{monthName}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}

function TimeGrid({
	times,
	selectedStart,
	disabled,
	onSelect,
}: {
	times: Array<{ start: string; end: string; available: boolean }>;
	selectedStart: string | null;
	disabled: boolean;
	onSelect: (start: string) => void;
}) {
	if (times.length === 0) return null;

	return (
		<div>
			<span className="mb-3 block font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
				// Time
			</span>
			<div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
				{times.map((slot) => {
					const isSelected = slot.start === selectedStart;
					return (
						<button
							className={cn(
								"flex h-11 items-center justify-center border-2 font-mono text-xs uppercase tracking-wider transition-colors",
								isSelected
									? "border-white bg-white text-black"
									: "border-white/20 text-white hover:border-white",
								disabled && "cursor-not-allowed opacity-40",
							)}
							disabled={disabled}
							key={slot.start}
							onClick={() => onSelect(slot.start)}
							type="button"
						>
							{slot.start}
						</button>
					);
				})}
			</div>
		</div>
	);
}

function SuccessScreen({ meeting }: { meeting: BookedMeeting }) {
	const dt = new Date(`${meeting.date}T${meeting.startTime}:00`);
	const dateLabel = dt.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
	});
	const timeLabel = dt.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
	});

	return (
		<div className="relative flex min-h-screen flex-col bg-black text-white">
			<div
				aria-hidden="true"
				className="fixed top-0 right-0 left-0 z-50 h-px bg-white"
			/>
			<header className="flex items-baseline justify-between px-[clamp(1.5rem,6vw,6rem)] pt-12">
				<span className="font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
					// Booked
				</span>
				<Link
					className="font-mono text-[11px] text-white/55 uppercase tracking-[0.35em] transition-colors hover:text-white"
					to="/"
				>
					Dakik Studio
				</Link>
			</header>
			<main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-[clamp(1.5rem,6vw,6rem)] py-16">
				<h1 className="font-black text-[clamp(3rem,8vw,7rem)] uppercase leading-[0.9] tracking-[-0.04em]">
					See you then.
				</h1>
				<p className="mt-6 max-w-[48ch] text-lg text-white/75 leading-relaxed lg:text-xl">
					Your call is on the calendar — a confirmation with the Google Meet
					link is heading to your inbox.
				</p>

				<dl className="mt-10 grid gap-6 border-white/10 border-y py-8 sm:grid-cols-3">
					<div>
						<dt className="font-mono text-[10px] text-white/45 uppercase tracking-[0.35em]">
							// Date
						</dt>
						<dd className="mt-2 font-bold text-lg uppercase tracking-tight">
							{dateLabel}
						</dd>
					</div>
					<div>
						<dt className="font-mono text-[10px] text-white/45 uppercase tracking-[0.35em]">
							// Time
						</dt>
						<dd className="mt-2 font-bold text-lg uppercase tracking-tight">
							{timeLabel}
						</dd>
					</div>
					<div>
						<dt className="font-mono text-[10px] text-white/45 uppercase tracking-[0.35em]">
							// Duration
						</dt>
						<dd className="mt-2 font-bold text-lg uppercase tracking-tight">
							{MEETING_DURATION_MINS} min
						</dd>
					</div>
				</dl>

				<div className="mt-12 flex flex-wrap gap-3">
					{meeting.meetUrl && (
						<a
							className="inline-flex items-center gap-3 border-2 border-white bg-white px-6 py-3 font-medium text-base text-black uppercase tracking-wider transition-colors hover:bg-transparent hover:text-white"
							href={meeting.meetUrl}
							rel="noopener noreferrer"
							target="_blank"
						>
							Open Meet link
						</a>
					)}
					<Link
						className="inline-flex items-center gap-3 border-2 border-white/20 px-6 py-3 font-medium text-base text-white/80 uppercase tracking-wider transition-colors hover:border-white hover:text-white"
						to="/"
					>
						<ArrowLeft className="size-4" />
						Back home
					</Link>
				</div>
			</main>
		</div>
	);
}

export default SurveyPage;
