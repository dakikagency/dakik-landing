"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SignaturePadProps {
	onSignatureChange?: (signatureData: string | null) => void;
	className?: string;
	disabled?: boolean;
}

export function SignaturePad({
	onSignatureChange,
	className,
	disabled = false,
}: SignaturePadProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [hasSignature, setHasSignature] = useState(false);

	// Initialize canvas
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const ctx = canvas.getContext("2d");
		if (!ctx) {
			return;
		}

		// Set canvas size to match display size
		const rect = canvas.getBoundingClientRect();
		const dpr = window.devicePixelRatio || 1;
		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;
		ctx.scale(dpr, dpr);

		// Set drawing styles
		ctx.strokeStyle = "#000000";
		ctx.lineWidth = 2;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		// Fill with white background
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, rect.width, rect.height);
	}, []);

	const getCoordinates = useCallback(
		(
			e:
				| React.MouseEvent<HTMLCanvasElement>
				| React.TouchEvent<HTMLCanvasElement>
		) => {
			const canvas = canvasRef.current;
			if (!canvas) {
				return null;
			}

			const rect = canvas.getBoundingClientRect();

			if ("touches" in e) {
				const touch = e.touches[0];
				if (!touch) {
					return null;
				}
				return {
					x: touch.clientX - rect.left,
					y: touch.clientY - rect.top,
				};
			}

			return {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			};
		},
		[]
	);

	const startDrawing = useCallback(
		(
			e:
				| React.MouseEvent<HTMLCanvasElement>
				| React.TouchEvent<HTMLCanvasElement>
		) => {
			if (disabled) {
				return;
			}

			const coords = getCoordinates(e);
			if (!coords) {
				return;
			}

			const canvas = canvasRef.current;
			const ctx = canvas?.getContext("2d");
			if (!ctx) {
				return;
			}

			ctx.beginPath();
			ctx.moveTo(coords.x, coords.y);
			setIsDrawing(true);
		},
		[disabled, getCoordinates]
	);

	const draw = useCallback(
		(
			e:
				| React.MouseEvent<HTMLCanvasElement>
				| React.TouchEvent<HTMLCanvasElement>
		) => {
			if (!isDrawing || disabled) {
				return;
			}

			const coords = getCoordinates(e);
			if (!coords) {
				return;
			}

			const canvas = canvasRef.current;
			const ctx = canvas?.getContext("2d");
			if (!ctx) {
				return;
			}

			ctx.lineTo(coords.x, coords.y);
			ctx.stroke();
		},
		[isDrawing, disabled, getCoordinates]
	);

	const stopDrawing = useCallback(() => {
		if (isDrawing) {
			setIsDrawing(false);
			setHasSignature(true);

			// Get signature data
			const canvas = canvasRef.current;
			if (canvas && onSignatureChange) {
				const signatureData = canvas.toDataURL("image/png");
				onSignatureChange(signatureData);
			}
		}
	}, [isDrawing, onSignatureChange]);

	const clearSignature = useCallback(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (!(ctx && canvas)) {
			return;
		}

		const rect = canvas.getBoundingClientRect();
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, rect.width, rect.height);

		setHasSignature(false);
		onSignatureChange?.(null);
	}, [onSignatureChange]);

	// Prevent scrolling while drawing on touch devices
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const preventScroll = (e: TouchEvent) => {
			if (isDrawing) {
				e.preventDefault();
			}
		};

		canvas.addEventListener("touchmove", preventScroll, { passive: false });
		return () => {
			canvas.removeEventListener("touchmove", preventScroll);
		};
	}, [isDrawing]);

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<div className="relative">
				<canvas
					className={cn(
						"w-full touch-none border bg-white",
						disabled ? "cursor-not-allowed opacity-50" : "cursor-crosshair",
						"h-32 sm:h-40"
					)}
					onMouseDown={startDrawing}
					onMouseLeave={stopDrawing}
					onMouseMove={draw}
					onMouseUp={stopDrawing}
					onTouchEnd={stopDrawing}
					onTouchMove={draw}
					onTouchStart={startDrawing}
					ref={canvasRef}
				/>
				{!(hasSignature || disabled) && (
					<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
						<span className="text-muted-foreground text-sm">
							Draw your signature here
						</span>
					</div>
				)}
			</div>
			<div className="flex justify-end">
				<Button
					disabled={!hasSignature || disabled}
					onClick={clearSignature}
					size="sm"
					type="button"
					variant="outline"
				>
					Clear Signature
				</Button>
			</div>
		</div>
	);
}

export default SignaturePad;
