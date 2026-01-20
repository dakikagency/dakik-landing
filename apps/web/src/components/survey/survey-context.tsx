"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { z } from "zod";

// Zod schemas for validation
export const contactSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
});

export type ContactInfo = z.infer<typeof contactSchema>;

export type ProjectType =
	| "AI_AUTOMATION"
	| "BRAND_IDENTITY"
	| "WEB_MOBILE"
	| "FULL_PRODUCT";

export type BudgetRange =
	| "RANGE_5K_10K"
	| "RANGE_10K_25K"
	| "RANGE_25K_50K"
	| "RANGE_50K_PLUS";

// Meeting data type
export interface ScheduledMeeting {
	date: Date;
	meetingType: string;
	meetLink: string;
}

// Dynamic question answer type
export type QuestionAnswer = string | string[];

// Survey state type
interface SurveyState {
	currentStep: number;
	questionAnswers: Record<string, QuestionAnswer>; // questionId -> answer(s)
	projectType: ProjectType | null;
	budget: BudgetRange | null;
	contact: ContactInfo | null;
	scheduledMeeting: ScheduledMeeting | null;
	leadId: string | null;
}

// Survey context type with actions
interface SurveyContextValue extends SurveyState {
	nextStep: () => void;
	prevStep: () => void;
	setAnswer: (questionId: string, answer: QuestionAnswer) => void;
	setProjectType: (projectType: ProjectType) => void;
	setBudget: (budget: BudgetRange) => void;
	setContact: (contact: ContactInfo) => void;
	setScheduledMeeting: (meeting: ScheduledMeeting) => void;
	setLeadId: (leadId: string) => void;
	reset: () => void;
	goToStep: (step: number) => void;
}

const initialState: SurveyState = {
	currentStep: 0,
	questionAnswers: {},
	projectType: null,
	budget: null,
	contact: null,
	scheduledMeeting: null,
	leadId: null,
};

const SurveyContext = createContext<SurveyContextValue | null>(null);

interface SurveyProviderProps {
	children: ReactNode;
}

export function SurveyProvider({ children }: SurveyProviderProps) {
	const [state, setState] = useState<SurveyState>(initialState);

	const nextStep = useCallback(() => {
		setState((prev) => ({
			...prev,
			currentStep: prev.currentStep + 1,
		}));
	}, []);

	const prevStep = useCallback(() => {
		setState((prev) => ({
			...prev,
			currentStep: Math.max(0, prev.currentStep - 1),
		}));
	}, []);

	const goToStep = useCallback((step: number) => {
		setState((prev) => ({ ...prev, currentStep: step }));
	}, []);

	const setAnswer = useCallback(
		(questionId: string, answer: QuestionAnswer) => {
			setState((prev) => ({
				...prev,
				questionAnswers: {
					...prev.questionAnswers,
					[questionId]: answer,
				},
			}));
		},
		[]
	);

	const setProjectType = useCallback((projectType: ProjectType) => {
		setState((prev) => ({
			...prev,
			projectType,
			questionAnswers: {
				...prev.questionAnswers,
				PROJECT_TYPE: projectType,
			},
		}));
	}, []);

	const setBudget = useCallback((budget: BudgetRange) => {
		setState((prev) => ({
			...prev,
			budget,
			questionAnswers: {
				...prev.questionAnswers,
				BUDGET: budget,
			},
		}));
	}, []);

	const setContact = useCallback((contact: ContactInfo) => {
		setState((prev) => ({ ...prev, contact }));
	}, []);

	const setScheduledMeeting = useCallback((meeting: ScheduledMeeting) => {
		setState((prev) => ({ ...prev, scheduledMeeting: meeting }));
	}, []);

	const setLeadId = useCallback((leadId: string) => {
		setState((prev) => ({ ...prev, leadId }));
	}, []);

	const reset = useCallback(() => {
		setState(initialState);
	}, []);

	const value = useMemo<SurveyContextValue>(
		() => ({
			...state,
			nextStep,
			prevStep,
			goToStep,
			setAnswer,
			setProjectType,
			setBudget,
			setContact,
			setScheduledMeeting,
			setLeadId,
			reset,
		}),
		[
			state,
			nextStep,
			prevStep,
			goToStep,
			setAnswer,
			setProjectType,
			setBudget,
			setContact,
			setScheduledMeeting,
			setLeadId,
			reset,
		]
	);

	return (
		<SurveyContext.Provider value={value}>{children}</SurveyContext.Provider>
	);
}

export function useSurvey(): SurveyContextValue {
	const context = useContext(SurveyContext);

	if (!context) {
		throw new Error("useSurvey must be used within a SurveyProvider");
	}

	return context;
}
