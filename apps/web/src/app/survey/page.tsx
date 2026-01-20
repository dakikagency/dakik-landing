"use client";

import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import {
	StepContact,
	StepDuplicateEmail,
	StepMeetingPicker,
	StepSuccess,
	SurveyLayout,
	SurveyProvider,
	useSurvey,
} from "@/components/survey";
import { StepDynamicQuestion } from "@/components/survey/steps/step-dynamic-question";
import { queryClient, trpc } from "@/utils/trpc";

// Special step indices that come after dynamic questions
const _STEP_CONTACT = "contact";
const _STEP_DUPLICATE_EMAIL = "duplicate_email";
const _STEP_MEETING_PICKER = "meeting_picker";
const _STEP_SUCCESS = "success";

function SurveyContent() {
	const { currentStep, prevStep, nextStep, questionAnswers, setAnswer } =
		useSurvey();

	const { data: questions, isLoading } = useQuery(
		trpc.surveyOptions.getActiveQuestions.queryOptions()
	);

	const handleBack = () => {
		prevStep();
	};

	if (isLoading) {
		return (
			<SurveyLayout currentStep={currentStep} onBack={undefined}>
				<div className="flex justify-center py-12">
					<div className="text-muted-foreground">Loading survey...</div>
				</div>
			</SurveyLayout>
		);
	}

	// Calculate total steps: dynamic questions + contact + meeting + success
	const totalDynamicQuestions = questions?.length ?? 0;
	const isContactStep = currentStep === totalDynamicQuestions;
	const isDuplicateEmailStep = currentStep === totalDynamicQuestions + 0.5; // Special fractional step
	const isMeetingStep = currentStep === totalDynamicQuestions + 1;
	const isSuccessStep = currentStep === totalDynamicQuestions + 2;

	const renderStep = () => {
		// Success step (no layout)
		if (isSuccessStep) {
			return <StepSuccess />;
		}

		// Duplicate email step (no layout)
		if (isDuplicateEmailStep) {
			return <StepDuplicateEmail />;
		}

		// Contact step
		if (isContactStep) {
			return <StepContact />;
		}

		// Meeting picker step
		if (isMeetingStep) {
			return <StepMeetingPicker />;
		}

		// Dynamic question steps
		if (questions && currentStep < totalDynamicQuestions) {
			const question = questions[currentStep];
			if (!question) {
				return <div>Question not found</div>;
			}

			return (
				<StepDynamicQuestion
					onBack={currentStep > 0 ? handleBack : undefined}
					onNext={nextStep}
					onValueChange={(value) => setAnswer(question.id, value)}
					questionId={question.id}
					selectedValue={questionAnswers[question.id] || null}
				/>
			);
		}

		return <div>Invalid step</div>;
	};

	// Don't show layout on success step or duplicate email step
	if (isSuccessStep) {
		return <StepSuccess />;
	}

	if (isDuplicateEmailStep) {
		return <StepDuplicateEmail />;
	}

	return (
		<SurveyLayout
			currentStep={currentStep}
			onBack={currentStep > 0 ? handleBack : undefined}
		>
			{renderStep()}
		</SurveyLayout>
	);
}

export default function SurveyPage() {
	return (
		<QueryClientProvider client={queryClient}>
			<SurveyProvider>
				<SurveyContent />
			</SurveyProvider>
		</QueryClientProvider>
	);
}
