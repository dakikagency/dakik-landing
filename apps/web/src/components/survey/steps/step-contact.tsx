"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { queryClient, trpc } from "@/utils/trpc";

import { contactSchema, useSurvey } from "../survey-context";

export function StepContact() {
	const {
		contact,
		setContact,
		nextStep,
		prevStep,
		goToStep,
		setLeadId,
		questionAnswers,
		currentStep,
	} = useSurvey();

	const submitMutation = useMutation(trpc.survey.submit.mutationOptions());

	const form = useForm({
		defaultValues: {
			name: contact?.name ?? "",
			email: contact?.email ?? "",
		},
		onSubmit: async ({ value }) => {
			// First check if email already exists
			const result = await queryClient.fetchQuery(
				trpc.survey.checkEmail.queryOptions({ email: value.email })
			);

			if (result.exists) {
				setContact(value);
				// Jump to duplicate email step (fractional step)
				goToStep(currentStep + 0.5);
				return;
			}

			// Submit the survey and create the lead with dynamic question answers
			const submitResult = await submitMutation.mutateAsync({
				questionAnswers,
				name: value.name,
				email: value.email,
			});

			setLeadId(submitResult.leadId);
			setContact(value);
			nextStep();
		},
		validators: {
			onSubmit: contactSchema,
		},
	});

	return (
		<div className="flex flex-col gap-8">
			<div className="space-y-2">
				<h2 className="font-medium text-2xl">How can we reach you?</h2>
				<p className="text-muted-foreground text-sm">
					We will use this information to get in touch about your project
				</p>
			</div>

			<form
				className="flex flex-col gap-6"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<form.Field name="name">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>
								Name <span className="text-destructive">*</span>
							</Label>
							<Input
								autoComplete="name"
								id={field.name}
								name={field.name}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Your name"
								value={field.state.value}
							/>
							{field.state.meta.errors.length > 0 && (
								<div className="space-y-1">
									{field.state.meta.errors.map((error) => (
										<p
											className="text-destructive text-xs"
											key={error?.message}
										>
											{error?.message}
										</p>
									))}
								</div>
							)}
						</div>
					)}
				</form.Field>

				<form.Field name="email">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>
								Email <span className="text-destructive">*</span>
							</Label>
							<Input
								autoComplete="email"
								id={field.name}
								name={field.name}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="your@email.com"
								type="email"
								value={field.state.value}
							/>
							{field.state.meta.errors.length > 0 && (
								<div className="space-y-1">
									{field.state.meta.errors.map((error) => (
										<p
											className="text-destructive text-xs"
											key={error?.message}
										>
											{error?.message}
										</p>
									))}
								</div>
							)}
						</div>
					)}
				</form.Field>

				<div className="flex justify-between pt-4">
					<Button onClick={prevStep} type="button" variant="ghost">
						Back
					</Button>
					<form.Subscribe>
						{(state) => (
							<Button
								className="min-w-32"
								disabled={state.isSubmitting}
								type="submit"
							>
								{state.isSubmitting ? "Submitting..." : "Continue"}
							</Button>
						)}
					</form.Subscribe>
				</div>
			</form>
		</div>
	);
}
