"use client";

import { motion } from "framer-motion";
import { useCallback } from "react";
import { cn } from "../../lib/utils";

export interface TimeSlot {
	id: string;
	time: string;
	available: boolean;
}

interface TimeSlotPickerProps {
	slots: TimeSlot[];
	selectedSlotId?: string;
	onSelect?: (slot: TimeSlot) => void;
	disabled?: boolean;
	className?: string;
}

export function TimeSlotPicker({
	slots,
	selectedSlotId,
	onSelect,
	disabled = false,
	className,
}: TimeSlotPickerProps) {
	const handleSelect = useCallback(
		(slot: TimeSlot) => {
			if (!disabled && slot.available) {
				onSelect?.(slot);
			}
		},
		[disabled, onSelect],
	);

	return (
		<div className={cn("space-y-3", className)}>
			<div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
				{slots.map((slot) => {
					const isSelected = slot.id === selectedSlotId;
					const isDisabled = disabled || !slot.available;

					return (
						<motion.button
							key={slot.id}
							type="button"
							disabled={isDisabled}
							onClick={() => handleSelect(slot)}
							initial={false}
							animate={{
								scale: isSelected ? 1 : 1,
								backgroundColor: isSelected
									? "rgb(0, 0, 0)"
									: slot.available
										? "rgb(255, 255, 255)"
										: "rgb(245, 245, 245)",
								borderColor: isSelected
									? "rgb(0, 0, 0)"
									: slot.available
										? "rgb(0, 0, 0, 0.15)"
										: "rgb(0, 0, 0, 0.05)",
								color: isSelected
									? "rgb(255, 255, 255)"
									: slot.available
										? "rgb(0, 0, 0)"
										: "rgb(0, 0, 0, 0.3)",
							}}
							transition={{ duration: 0.15 }}
							className={cn(
								"relative flex h-11 items-center justify-center border text-sm font-medium",
								"transition-colors",
								isDisabled && "cursor-not-allowed",
							)}
						>
							{slot.time}
							{!slot.available && (
								<span className="absolute inset-0 flex items-center justify-center">
									<svg
										aria-hidden="true"
										className="h-4 w-4 text-black/20"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M18 6L6 18M6 6l12 12"
										/>
									</svg>
								</span>
							)}
						</motion.button>
					);
				})}
			</div>

			{slots.length === 0 && (
				<p className="py-4 text-center text-sm text-black/50">
					No time slots available
				</p>
			)}
		</div>
	);
}
