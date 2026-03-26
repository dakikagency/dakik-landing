interface ErrorMessageProps {
	error: string | Error | null;
	onRetry?: () => void;
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
	const message =
		error instanceof Error ? error.message : error || "An error occurred";

	return (
		<div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
			<div className="rounded-lg bg-red-500/10 p-4">
				<p className="text-red-500">{message}</p>
			</div>
			{onRetry && (
				<button
					className="rounded bg-black px-4 py-2 text-white"
					onClick={onRetry}
					type="button"
				>
					Try again
				</button>
			)}
		</div>
	);
}
