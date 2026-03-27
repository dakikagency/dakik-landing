"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export type QuestionType =
	| "text"
	| "textarea"
	| "single-choice"
	| "multi-choice"
	| "rating"
	| "scale";

export interface QuestionOption {
	id: string;
	label: string;
	value: string;
}

export interface Question {
	id: string;
	type: QuestionType;
	question: string;
	description?: string;
	required?: boolean;
	options?: QuestionOption[];
	min?: number;
	max?: number;
}

interface QuestionCardProps {
	question: Question;
	value?: string | string[];
	onChange?: (value: string | string[]) => void;
	error?: string;
	disabled?: boolean;
	className?: string;
}

function TextInput({
	value,
	onChange,
	disabled,
	error,
	placeholder,
}: {
	value?: string;
	onChange?: (value: string) => void;
	disabled?: boolean;
	error?: string;
	placeholder?: string;
}) {
	return (
		<input
			type="text"
			value={value || ""}
			onChange={(e) => onChange?.(e.target.value)}
			disabled={disabled}
			placeholder={placeholder}
			className={cn(
				"h-11 w-full border bg-white px-4 text-sm",
				error ? "border-red-500" : "border-black/15",
				disabled && "cursor-not-allowed bg-black/[0.02] opacity-50",
				!disabled && "hover:border-black/30",
				"focus:outline-none focus:ring-2 focus:ring-black/10",
			)}
		/>
	);
}

function TextAreaInput({
	value,
	onChange,
	disabled,
	error,
	placeholder,
}: {
	value?: string;
	onChange?: (value: string) => void;
	disabled?: boolean;
	error?: string;
	placeholder?: string;
}) {
	return (
		<textarea
			value={value || ""}
			onChange={(e) => onChange?.(e.target.value)}
			disabled={disabled}
			placeholder={placeholder}
			rows={4}
			className={cn(
				"w-full border bg-white p-4 text-sm",
				error ? "border-red-500" : "border-black/15",
				disabled && "cursor-not-allowed bg-black/[0.02] opacity-50",
				!disabled && "hover:border-black/30",
				"focus:outline-none focus:ring-2 focus:ring-black/10",
				"resize-none",
			)}
		/>
	);
}

function SingleChoice({
	question,
	value,
	onChange,
	disabled,
}: {
	question: Question;
	value?: string;
	onChange?: (value: string) => void;
	disabled?: boolean;
}) {
	return (
		<div className="space-y-2">
			{question.options?.map((option) => {
				const isSelected = value === option.value;
				return (
					<button
						key={option.id}
						type="button"
						disabled={disabled}
						onClick={() => onChange?.(option.value)}
						className={cn(
							"flex w-full items-center gap-3 border p-3 text-left text-sm transition-colors",
							isSelected
								? "border-black bg-black/[0.03]"
								: "border-black/15 bg-white hover:border-black/30",
							disabled && "cursor-not-allowed opacity-50",
						)}
					>
						<div
							className={cn(
								"flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
								isSelected ? "border-black bg-black" : "border-black/30",
							)}
						>
							{isSelected && (
								<svg
									aria-hidden="true"
									className="h-2.5 w-2.5 text-white"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<circle cx="12" cy="12" r="6" />
								</svg>
							)}
						</div>
						<span>{option.label}</span>
					</button>
				);
			})}
		</div>
	);
}

function MultiChoice({
	question,
	value = [],
	onChange,
	disabled,
}: {
	question: Question;
	value?: string[];
	onChange?: (value: string[]) => void;
	disabled?: boolean;
}) {
	const toggleOption = (optionValue: string) => {
		if (value.includes(optionValue)) {
			onChange?.(value.filter((v) => v !== optionValue));
		} else {
			onChange?.([...value, optionValue]);
		}
	};

	return (
		<div className="space-y-2">
			{question.options?.map((option) => {
				const isSelected = value.includes(option.value);
				return (
					<button
						key={option.id}
						type="button"
						disabled={disabled}
						onClick={() => toggleOption(option.value)}
						className={cn(
							"flex w-full items-center gap-3 border p-3 text-left text-sm transition-colors",
							isSelected
								? "border-black bg-black/[0.03]"
								: "border-black/15 bg-white hover:border-black/30",
							disabled && "cursor-not-allowed opacity-50",
						)}
					>
						<div
							className={cn(
								"flex h-4 w-4 shrink-0 items-center justify-center rounded border",
								isSelected ? "border-black bg-black" : "border-black/30",
							)}
						>
							{isSelected && (
								<svg
									aria-hidden="true"
									className="h-2.5 w-2.5 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={3}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							)}
						</div>
						<span>{option.label}</span>
					</button>
				);
			})}
		</div>
	);
}

function Rating({
	value,
	onChange,
	disabled,
	max = 5,
}: {
	value?: number;
	onChange?: (value: number) => void;
	disabled?: boolean;
	max?: number;
}) {
	return (
		<div className="flex gap-2">
			{Array.from({ length: max }).map((_, i) => {
				const rating = i + 1;
				const isSelected = value === rating;
				return (
					<button
						key={rating}
						type="button"
						disabled={disabled}
						onClick={() => onChange?.(rating)}
						className={cn(
							"flex h-10 w-10 items-center justify-center border text-sm transition-colors",
							isSelected
								? "border-black bg-black text-white"
								: "border-black/15 bg-white hover:border-black/30",
							disabled && "cursor-not-allowed opacity-50",
						)}
					>
						{rating}
					</button>
				);
			})}
		</div>
	);
}

function Scale({
	value,
	onChange,
	disabled,
	min = 1,
	max = 10,
}: {
	value?: number;
	onChange?: (value: number) => void;
	disabled?: boolean;
	min?: number;
	max?: number;
}) {
	const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);

	return (
		<div className="flex gap-1">
			{range.map((num) => {
				const isSelected = value === num;
				return (
					<button
						key={num}
						type="button"
						disabled={disabled}
						onClick={() => onChange?.(num)}
						className={cn(
							"flex h-9 w-9 items-center justify-center border text-xs transition-colors",
							isSelected
								? "border-black bg-black text-white"
								: "border-black/15 bg-white hover:border-black/30",
							disabled && "cursor-not-allowed opacity-50",
						)}
					>
						{num}
					</button>
				);
			})}
		</div>
	);
}

export function QuestionCard({
	question,
	value,
	onChange,
	error,
	disabled = false,
	className,
}: QuestionCardProps) {
	return (
		<motion.div
			initial={false}
			animate={{
				boxShadow: error
					? "0 0 0 2px rgba(239, 68, 68, 0.2)"
					: "0 0 0 0px rgba(0, 0, 0, 0)",
			}}
			transition={{ duration: 0.2 }}
			className={cn("border border-black/15 bg-white p-6", className)}
		>
			<div className="mb-4">
				<div className="flex items-start gap-2">
					<h3 className="text-base font-medium text-black">
						{question.question}
					</h3>
					{question.required && <span className="text-red-500 text-sm">*</span>}
				</div>
				{question.description && (
					<p className="mt-1 text-sm text-black/60">{question.description}</p>
				)}
			</div>

			{error && <p className="mb-3 text-sm text-red-500">{error}</p>}

			{question.type === "text" && (
				<TextInput
					value={value as string}
					onChange={(v) => onChange?.(v)}
					disabled={disabled}
				/>
			)}

			{question.type === "textarea" && (
				<TextAreaInput
					value={value as string}
					onChange={(v) => onChange?.(v)}
					disabled={disabled}
				/>
			)}

			{question.type === "single-choice" && (
				<SingleChoice
					question={question}
					value={value as string}
					onChange={(v) => onChange?.(v)}
					disabled={disabled}
				/>
			)}

			{question.type === "multi-choice" && (
				<MultiChoice
					question={question}
					value={value as string[]}
					onChange={(v) => onChange?.(v)}
					disabled={disabled}
				/>
			)}

			{question.type === "rating" && (
				<Rating
					value={value as unknown as number}
					onChange={(v) => onChange?.(String(v) as unknown as string[])}
					disabled={disabled}
					max={question.max || 5}
				/>
			)}

			{question.type === "scale" && (
				<Scale
					value={value as unknown as number}
					onChange={(v) => onChange?.(String(v) as unknown as string[])}
					disabled={disabled}
					min={question.min || 1}
					max={question.max || 10}
				/>
			)}
		</motion.div>
	);
}
