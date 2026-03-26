import { useState } from "react";
import { api } from "../lib/api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormData {
	name: string;
	email: string;
	phone: string;
	projectType: string;
	budget: string;
	timeline: string;
	details: string;
	source: string;
}

const initialFormData: FormData = {
	name: "",
	email: "",
	phone: "",
	projectType: "",
	budget: "",
	timeline: "",
	details: "",
	source: "",
};

const projectTypes = [
	{ value: "", label: "Select project type" },
	{ value: "Website", label: "Website" },
	{ value: "Mobile App", label: "Mobile App" },
	{ value: "Web App", label: "Web App" },
	{ value: "Branding", label: "Branding" },
	{ value: "Other", label: "Other" },
];

const budgetRanges = [
	{ value: "", label: "Select budget range" },
	{ value: "<$5k", label: "Under $5,000" },
	{ value: "$5k-$15k", label: "$5,000 - $15,000" },
	{ value: "$15k-$50k", label: "$15,000 - $50,000" },
	{ value: "$50k+", label: "$50,000+" },
];

const timelines = [
	{ value: "", label: "Select timeline" },
	{ value: "<1 month", label: "Less than 1 month" },
	{ value: "1-3 months", label: "1-3 months" },
	{ value: "3-6 months", label: "3-6 months" },
	{ value: "6+ months", label: "6+ months" },
];

const sources = [
	{ value: "", label: "How did you hear about us?" },
	{ value: "Google", label: "Google" },
	{ value: "Referral", label: "Referral" },
	{ value: "Social Media", label: "Social Media" },
	{ value: "Other", label: "Other" },
];

const steps = [
	{ number: 1, label: "Contact Info" },
	{ number: 2, label: "Project Details" },
	{ number: 3, label: "Additional Info" },
];

export function SurveyPage() {
	const [currentStep, setCurrentStep] = useState(1);
	const [formData, setFormData] = useState<FormData>(initialFormData);
	const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
		{}
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const validateStep = (step: number): boolean => {
		const newErrors: Partial<Record<keyof FormData, string>> = {};

		if (step === 1) {
			if (!formData.name.trim()) {
				newErrors.name = "Name is required";
			}
			if (!formData.email.trim()) {
				newErrors.email = "Email is required";
			} else if (!emailRegex.test(formData.email)) {
				newErrors.email = "Please enter a valid email";
			}
		}

		if (step === 2) {
			if (!formData.projectType) {
				newErrors.projectType = "Please select a project type";
			}
			if (!formData.budget) {
				newErrors.budget = "Please select a budget range";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNext = () => {
		if (validateStep(currentStep)) {
			setCurrentStep((prev) => Math.min(prev + 1, 3));
		}
	};

	const handleBack = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 1));
	};

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		if (errors[name as keyof FormData]) {
			setErrors((prev) => ({ ...prev, [name]: undefined }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError(null);

		if (!validateStep(2)) {
			setCurrentStep(2);
			return;
		}

		setIsSubmitting(true);

		try {
			await api.leads.create({
				name: formData.name,
				email: formData.email,
				projectType: formData.projectType,
				budget: formData.budget,
				details: formData.details || undefined,
				source: formData.source || undefined,
				status: "NEW",
			});
			setIsSuccess(true);
		} catch (err) {
			setSubmitError(
				err instanceof Error
					? err.message
					: "Failed to submit. Please try again."
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isSuccess) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-black text-white">
				<div className="mx-4 w-full max-w-md text-center">
					<div className="mb-6 flex justify-center">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-900/30">
							<svg
								aria-label="Success checkmark"
								className="h-8 w-8 text-green-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Success</title>
								<path
									d="M5 13l4 4L19 7"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						</div>
					</div>
					<h1 className="mb-4 font-bold text-3xl">Thank You!</h1>
					<p className="mb-8 text-gray-400">
						Your submission has been received. We'll be in touch soon.
					</p>
					<button
						className="rounded-lg bg-white px-6 py-3 font-semibold text-black transition-colors hover:bg-gray-200"
						onClick={() => {
							setFormData(initialFormData);
							setCurrentStep(1);
							setIsSuccess(false);
						}}
						type="button"
					>
						Submit Another
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-black py-12 text-white">
			<div className="mx-4 w-full max-w-lg">
				{/* Header */}
				<div className="mb-8 text-center">
					<h1 className="mb-2 font-bold text-3xl">Get in Touch</h1>
					<p className="text-gray-400">Tell us about your project</p>
				</div>

				{/* Progress Indicator */}
				<div className="mb-8">
					<div className="flex items-center justify-between">
						{steps.map((step, index) => (
							<div className="flex flex-1 items-center" key={step.number}>
								<div className="flex flex-col items-center">
									<div
										className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-colors ${
											currentStep >= step.number
												? "border-white bg-white text-black"
												: "border-gray-600 text-gray-500"
										}`}
									>
										{currentStep > step.number ? (
											<svg
												aria-label="Completed"
												className="h-5 w-5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<title>Step completed</title>
												<path
													d="M5 13l4 4L19 7"
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
												/>
											</svg>
										) : (
											step.number
										)}
									</div>
									<span
										className={`mt-2 text-xs ${
											currentStep >= step.number
												? "text-white"
												: "text-gray-500"
										}`}
									>
										{step.label}
									</span>
								</div>
								{index < steps.length - 1 && (
									<div
										className={`mx-2 h-0.5 flex-1 transition-colors ${
											currentStep > step.number ? "bg-white" : "bg-gray-700"
										}`}
									/>
								)}
							</div>
						))}
					</div>
				</div>

				{/* Form */}
				<form className="rounded-xl bg-zinc-900 p-6" onSubmit={handleSubmit}>
					{/* Step 1: Contact Info */}
					{currentStep === 1 && (
						<div className="space-y-4">
							<div>
								<label
									className="mb-1 block font-medium text-sm"
									htmlFor="name"
								>
									Name <span className="text-red-500">*</span>
								</label>
								<input
									className={`w-full rounded-lg border bg-zinc-800 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white ${
										errors.name ? "border-red-500" : "border-zinc-700"
									}`}
									id="name"
									name="name"
									onChange={handleChange}
									placeholder="John Smith"
									type="text"
									value={formData.name}
								/>
								{errors.name && (
									<p className="mt-1 text-red-500 text-sm">{errors.name}</p>
								)}
							</div>

							<div>
								<label
									className="mb-1 block font-medium text-sm"
									htmlFor="email"
								>
									Email <span className="text-red-500">*</span>
								</label>
								<input
									className={`w-full rounded-lg border bg-zinc-800 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white ${
										errors.email ? "border-red-500" : "border-zinc-700"
									}`}
									id="email"
									name="email"
									onChange={handleChange}
									placeholder="john@company.com"
									type="email"
									value={formData.email}
								/>
								{errors.email && (
									<p className="mt-1 text-red-500 text-sm">{errors.email}</p>
								)}
							</div>

							<div>
								<label
									className="mb-1 block font-medium text-sm"
									htmlFor="phone"
								>
									Phone <span className="text-gray-500">(optional)</span>
								</label>
								<input
									className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
									id="phone"
									name="phone"
									onChange={handleChange}
									placeholder="+1 (555) 000-0000"
									type="tel"
									value={formData.phone}
								/>
							</div>
						</div>
					)}

					{/* Step 2: Project Details */}
					{currentStep === 2 && (
						<div className="space-y-4">
							<div>
								<label
									className="mb-1 block font-medium text-sm"
									htmlFor="projectType"
								>
									Project Type <span className="text-red-500">*</span>
								</label>
								<select
									className={`w-full rounded-lg border bg-zinc-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white ${
										errors.projectType ? "border-red-500" : "border-zinc-700"
									}`}
									id="projectType"
									name="projectType"
									onChange={handleChange}
									value={formData.projectType}
								>
									{projectTypes.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
								{errors.projectType && (
									<p className="mt-1 text-red-500 text-sm">
										{errors.projectType}
									</p>
								)}
							</div>

							<div>
								<label
									className="mb-1 block font-medium text-sm"
									htmlFor="budget"
								>
									Budget Range <span className="text-red-500">*</span>
								</label>
								<select
									className={`w-full rounded-lg border bg-zinc-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white ${
										errors.budget ? "border-red-500" : "border-zinc-700"
									}`}
									id="budget"
									name="budget"
									onChange={handleChange}
									value={formData.budget}
								>
									{budgetRanges.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
								{errors.budget && (
									<p className="mt-1 text-red-500 text-sm">{errors.budget}</p>
								)}
							</div>

							<div>
								<label
									className="mb-1 block font-medium text-sm"
									htmlFor="timeline"
								>
									Timeline
								</label>
								<select
									className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white"
									id="timeline"
									name="timeline"
									onChange={handleChange}
									value={formData.timeline}
								>
									{timelines.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
							</div>
						</div>
					)}

					{/* Step 3: Additional Info */}
					{currentStep === 3 && (
						<div className="space-y-4">
							<div>
								<label
									className="mb-1 block font-medium text-sm"
									htmlFor="details"
								>
									Project Description
								</label>
								<textarea
									className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
									id="details"
									name="details"
									onChange={handleChange}
									placeholder="Tell us about your project goals and requirements..."
									rows={4}
									value={formData.details}
								/>
							</div>

							<div>
								<label
									className="mb-1 block font-medium text-sm"
									htmlFor="source"
								>
									How did you hear about us?
								</label>
								<select
									className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white"
									id="source"
									name="source"
									onChange={handleChange}
									value={formData.source}
								>
									{sources.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
							</div>
						</div>
					)}

					{/* Submit Error */}
					{submitError && (
						<div className="mt-4 rounded-lg bg-red-900/30 p-3 text-red-400 text-sm">
							{submitError}
						</div>
					)}

					{/* Navigation */}
					<div className="mt-6 flex justify-between gap-4">
						{currentStep > 1 ? (
							<button
								className="rounded-lg border border-zinc-700 px-6 py-3 font-semibold transition-colors hover:bg-zinc-800"
								onClick={handleBack}
								type="button"
							>
								Back
							</button>
						) : (
							<div />
						)}

						{currentStep < 3 ? (
							<button
								className="rounded-lg bg-white px-6 py-3 font-semibold text-black transition-colors hover:bg-gray-200"
								onClick={handleNext}
								type="button"
							>
								Next
							</button>
						) : (
							<button
								className="rounded-lg bg-white px-6 py-3 font-semibold text-black transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
								disabled={isSubmitting}
								type="submit"
							>
								{isSubmitting ? "Submitting..." : "Submit"}
							</button>
						)}
					</div>
				</form>
			</div>
		</div>
	);
}
