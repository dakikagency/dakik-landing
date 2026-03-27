"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { cn } from "../../lib/utils";

interface DatePickerProps {
	value?: Date;
	onChange?: (date: Date) => void;
	minDate?: Date;
	maxDate?: Date;
	disabled?: boolean;
	className?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

function getDaysInMonth(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
	return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

function isDisabled(date: Date, minDate?: Date, maxDate?: Date): boolean {
	if (minDate && date < minDate) return true;
	if (maxDate && date > maxDate) return true;
	return false;
}

export function DatePicker({
	value,
	onChange,
	minDate,
	maxDate,
	disabled = false,
	className,
}: DatePickerProps) {
	const today = new Date();
	const [isOpen, setIsOpen] = useState(false);
	const [viewDate, setViewDate] = useState(value || today);

	const selectedDate = value || null;

	const year = viewDate.getFullYear();
	const month = viewDate.getMonth();

	const daysInMonth = getDaysInMonth(year, month);
	const firstDayOfMonth = getFirstDayOfMonth(year, month);

	const prevMonth = useCallback(() => {
		setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
	}, []);

	const nextMonth = useCallback(() => {
		setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
	}, []);

	const selectDate = useCallback(
		(day: number) => {
			const newDate = new Date(year, month, day);
			if (!isDisabled(newDate, minDate, maxDate)) {
				onChange?.(newDate);
				setIsOpen(false);
			}
		},
		[year, month, onChange, minDate, maxDate],
	);

	const formatDisplayDate = (date: Date | null): string => {
		if (!date) return "Select a date";
		return date.toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	return (
		<div className={cn("relative", className)}>
			<button
				type="button"
				disabled={disabled}
				onClick={() => !disabled && setIsOpen(!isOpen)}
				className={cn(
					"flex h-11 w-full items-center justify-between border border-black/15 bg-white px-4",
					"text-left text-sm transition-colors",
					disabled && "cursor-not-allowed opacity-50",
					!disabled && "hover:border-black/30",
				)}
			>
				<span className={selectedDate ? "text-black" : "text-black/50"}>
					{formatDisplayDate(selectedDate)}
				</span>
				<svg
					aria-hidden="true"
					className={cn(
						"h-4 w-4 text-black/50 transition-transform",
						isOpen && "rotate-180",
					)}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.15 }}
						className="absolute left-0 top-full z-50 mt-2 w-72 border border-black/15 bg-white p-4 shadow-lg"
					>
						<div className="mb-4 flex items-center justify-between">
							<button
								type="button"
								onClick={prevMonth}
								className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5"
								aria-label="Previous month"
							>
								<svg
									aria-hidden="true"
									className="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 19l-7-7 7-7"
									/>
								</svg>
							</button>
							<span className="font-medium text-sm">
								{MONTHS[month]} {year}
							</span>
							<button
								type="button"
								onClick={nextMonth}
								className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5"
								aria-label="Next month"
							>
								<svg
									aria-hidden="true"
									className="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</button>
						</div>

						<div className="grid grid-cols-7 gap-1 mb-2">
							{WEEKDAYS.map((day) => (
								<div
									key={day}
									className="flex h-8 items-center justify-center font-mono text-[10px] uppercase text-black/40"
								>
									{day}
								</div>
							))}
						</div>

						<div className="grid grid-cols-7 gap-1">
							{Array.from({ length: firstDayOfMonth }).map((_, idx) => {
								const emptyKey = `empty-cell-${year}-${month}-${firstDayOfMonth}-${idx}`;
								return <div key={emptyKey} />;
							})}
							{Array.from({ length: daysInMonth }).map((_, i) => {
								const day = i + 1;
								const date = new Date(year, month, day);
								const isSelected =
									selectedDate && isSameDay(date, selectedDate);
								const isToday = isSameDay(date, today);
								const isDayDisabled = isDisabled(date, minDate, maxDate);

								return (
									<button
										key={day}
										type="button"
										disabled={isDayDisabled}
										onClick={() => selectDate(day)}
										className={cn(
											"flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors",
											isSelected && "bg-black text-white",
											isToday && !isSelected && "border border-black/30",
											!isSelected && !isDayDisabled && "hover:bg-black/5",
											isDayDisabled && "cursor-not-allowed text-black/30",
										)}
									>
										{day}
									</button>
								);
							})}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
