import { useHead } from "@unhead/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { cn } from "../lib/utils";

const TOTAL_STEPS = 4;
type Step = 1 | 2 | 3 | 4;

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

/**
 * Conversational labels mapped to ProjectType enum on the backend.
 * The user sees plain English; the database gets the enum.
 */
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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SurveyPage() {
	useHead({
		title: "Start a project · Dakik Studio",
		meta: [
			{
				name: "description",
				content:
					"Tell us what you want to build. Four short questions, no sales pitch.",
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
	const [success, setSuccess] = useState(false);

	const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS) as Step);
	const goBack = () => setStep((s) => Math.max(s - 1, 1) as Step);

	/**
	 * On chip-style questions, selecting an option auto-advances after a brief
	 * pause. The pause lets the user see their selection register before the
	 * panel transitions — important confirmation cue. ~350ms feels snappy
	 * without being abrupt.
	 */
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
		else if (!emailRegex.test(form.email))
			next.email = "Doesn't look right";
		setErrors(next);
		return Object.keys(next).length === 0;
	};

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError(null);
		if (!validateContact()) return;
		setSubmitting(true);
		try {
			await api.leads.create({
				name: form.name,
				email: form.email,
				projectType: form.projectType || undefined,
				budget: form.budget || undefined,
				details: form.details || undefined,
				source: form.source || undefined,
				status: "NEW",
			});
			setSuccess(true);
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

	if (success) {
		return <SuccessScreen />;
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
							<div className="mt-8 border border-red-500/30 bg-red-500/10 px-4 py-3 font-mono text-[11px] text-red-400 uppercase tracking-[0.25em]">
								{submitError}
							</div>
						)}
					</form>
				)}
			</main>

			<nav className="flex items-center justify-between px-[clamp(1.5rem,6vw,6rem)] pb-12">
				{step > 1 ? (
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
						{submitting ? "Sending…" : "Send it"}
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
					error
						? "border-red-500/50"
						: "border-white/20 focus:border-white",
				)}
				onChange={(e) => onChange(e.target.value)}
				type={type}
				value={value}
			/>
			{error && (
				<span className="mt-2 block font-mono text-[10px] text-red-400 uppercase tracking-[0.25em]">
					{error}
				</span>
			)}
		</label>
	);
}

function SuccessScreen() {
	return (
		<div className="relative flex min-h-screen flex-col bg-black text-white">
			<div
				aria-hidden="true"
				className="fixed top-0 right-0 left-0 z-50 h-px bg-white"
			/>
			<header className="flex items-baseline justify-between px-[clamp(1.5rem,6vw,6rem)] pt-12">
				<span className="font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
					Done
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
					Got it.
				</h1>
				<p className="mt-6 max-w-[48ch] text-lg text-white/75 leading-relaxed lg:text-xl">
					We'll be in touch within a couple of working days. If it's urgent,
					email{" "}
					<a
						className="text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
						href="mailto:hello@dakik.co.uk"
					>
						hello@dakik.co.uk
					</a>{" "}
					and we'll bump it.
				</p>
				<div className="mt-12">
					<Link
						className="inline-flex items-center gap-3 border-2 border-white bg-white px-6 py-3 font-medium text-base text-black uppercase tracking-wider transition-colors hover:bg-transparent hover:text-white"
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
