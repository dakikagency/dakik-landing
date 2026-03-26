export function Loading({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
	const sizeClasses = {
		sm: "h-4 w-4",
		md: "h-8 w-8",
		lg: "h-12 w-12",
	};

	return (
		<div className="flex items-center justify-center p-8">
			<div
				className={`animate-spin rounded-full border-2 border-gray-300 border-t-black ${sizeClasses[size]}`}
			/>
		</div>
	);
}

export function PageLoading() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<Loading size="lg" />
		</div>
	);
}
