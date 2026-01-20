"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, trpc } from "@/utils/trpc";

function QuestionIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function CheckCircleIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function ClockIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function PlusIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M12 4.5v15m7.5-7.5h-15"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function formatDate(date: Date | string): string {
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatRelativeTime(date: Date | string): string {
	const d = new Date(date);
	const now = new Date();
	const diffMs = now.getTime() - d.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) {
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		if (diffHours === 0) {
			const diffMinutes = Math.floor(diffMs / (1000 * 60));
			return `${diffMinutes} minutes ago`;
		}
		return `${diffHours} hours ago`;
	}
	if (diffDays === 1) {
		return "Yesterday";
	}
	if (diffDays < 7) {
		return `${diffDays} days ago`;
	}
	return formatDate(date);
}

function StatCardSkeleton() {
	return (
		<Card size="sm">
			<CardContent className="pt-4">
				<Skeleton className="mb-1 h-6 w-8" />
				<Skeleton className="h-3 w-20" />
			</CardContent>
		</Card>
	);
}

function QACardSkeleton() {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-start gap-3">
					<Skeleton className="mt-0.5 size-5" />
					<div className="space-y-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-5 w-64" />
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<Skeleton className="h-16 w-full" />
				<Skeleton className="mt-3 h-3 w-32" />
			</CardContent>
		</Card>
	);
}

interface Project {
	id: string;
	title: string;
}

function AskQuestionForm({
	projects,
	onSuccess,
}: {
	projects: Project[];
	onSuccess: () => void;
}) {
	const [selectedProject, setSelectedProject] = useState<string>("");
	const [question, setQuestion] = useState("");

	const submitMutation = useMutation(
		trpc.portal.submitQuestion.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.portal.getQandA.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.portal.getDashboardOverview.queryKey(),
				});
				toast.success("Question submitted successfully");
				setSelectedProject("");
				setQuestion("");
				onSuccess();
			},
			onError: (error) => {
				toast.error(error.message || "Failed to submit question");
			},
		})
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedProject) {
			toast.error("Please select a project");
			return;
		}
		if (question.trim().length < 10) {
			toast.error("Question must be at least 10 characters");
			return;
		}
		submitMutation.mutate({
			projectId: selectedProject,
			question: question.trim(),
		});
	};

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			<div className="space-y-2">
				<Label htmlFor="project">Project</Label>
				<Select
					onValueChange={(value) => setSelectedProject(value ?? "")}
					value={selectedProject}
				>
					<SelectTrigger className="w-full" id="project">
						{selectedProject ? (
							<SelectValue />
						) : (
							<span className="text-muted-foreground">Select a project</span>
						)}
					</SelectTrigger>
					<SelectContent>
						{projects.map((project) => (
							<SelectItem key={project.id} value={project.id}>
								{project.title}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="space-y-2">
				<Label htmlFor="question">Your Question</Label>
				<textarea
					className="h-24 w-full rounded-none border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
					id="question"
					onChange={(e) => setQuestion(e.target.value)}
					placeholder="What would you like to know about your project?"
					value={question}
				/>
			</div>
			<div className="flex justify-end">
				<Button disabled={submitMutation.isPending} type="submit">
					{submitMutation.isPending ? "Submitting..." : "Submit Question"}
				</Button>
			</div>
		</form>
	);
}

export default function QandAPage() {
	const [showAskForm, setShowAskForm] = useState(false);

	const {
		data: qAndAs,
		isLoading,
		isError,
	} = useQuery(trpc.portal.getQandA.queryOptions());

	const { data: projects, isLoading: projectsLoading } = useQuery(
		trpc.portal.getProjects.queryOptions()
	);

	const pendingQuestions = qAndAs?.filter((q) => q.answer === null) ?? [];
	const answeredQuestions = qAndAs?.filter((q) => q.answer !== null) ?? [];

	return (
		<div className="p-6 lg:p-8">
			{/* Page Header */}
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-medium text-2xl tracking-tight">Q&A</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Questions and answers about your projects. Ask questions and track
						responses.
					</p>
				</div>
				<Button onClick={() => setShowAskForm(!showAskForm)}>
					<PlusIcon className="size-4" />
					{showAskForm ? "Cancel" : "Ask Question"}
				</Button>
			</div>

			{/* Ask Question Form */}
			{showAskForm && (
				<Card className="mb-8">
					<CardHeader>
						<CardTitle className="text-lg">Ask a Question</CardTitle>
						<CardDescription>
							Submit a question about one of your projects
						</CardDescription>
					</CardHeader>
					<CardContent>
						{projectsLoading && (
							<div className="space-y-4">
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-24 w-full" />
							</div>
						)}
						{!projectsLoading && projects && projects.length > 0 && (
							<AskQuestionForm
								onSuccess={() => setShowAskForm(false)}
								projects={projects}
							/>
						)}
						{!projectsLoading && (!projects || projects.length === 0) && (
							<p className="py-4 text-center text-muted-foreground text-sm">
								No projects available. Questions can only be asked about active
								projects.
							</p>
						)}
					</CardContent>
				</Card>
			)}

			{/* Summary Stats */}
			<div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{isLoading ? (
					<>
						<StatCardSkeleton />
						<StatCardSkeleton />
						<StatCardSkeleton />
					</>
				) : (
					<>
						<Card size="sm">
							<CardContent className="pt-4">
								<div className="font-medium text-2xl">
									{qAndAs?.length ?? 0}
								</div>
								<p className="text-muted-foreground text-xs">Total Questions</p>
							</CardContent>
						</Card>
						<Card size="sm">
							<CardContent className="pt-4">
								<div className="font-medium text-2xl">
									{pendingQuestions.length}
								</div>
								<p className="text-muted-foreground text-xs">Awaiting Answer</p>
							</CardContent>
						</Card>
						<Card size="sm">
							<CardContent className="pt-4">
								<div className="font-medium text-2xl">
									{answeredQuestions.length}
								</div>
								<p className="text-muted-foreground text-xs">Answered</p>
							</CardContent>
						</Card>
					</>
				)}
			</div>

			{/* Pending Questions */}
			{!isLoading && pendingQuestions.length > 0 && (
				<div className="mb-8">
					<h2 className="mb-4 font-medium text-lg">Awaiting Answer</h2>
					<div className="space-y-4">
						{pendingQuestions.map((qa) => (
							<Card className="border-l-4 border-l-warning" key={qa.id}>
								<CardHeader>
									<div className="flex items-start justify-between gap-4">
										<div className="flex items-start gap-3">
											<ClockIcon className="mt-0.5 size-5 shrink-0 text-warning" />
											<div>
												<CardDescription className="mb-1">
													{qa.project.title}
												</CardDescription>
												<CardTitle className="text-base">
													{qa.question}
												</CardTitle>
											</div>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground text-xs">
										Asked {formatRelativeTime(qa.askedAt)}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			)}

			{/* Answered Questions */}
			<div>
				<h2 className="mb-4 font-medium text-lg">Answered Questions</h2>
				{isLoading && (
					<div className="space-y-4">
						<QACardSkeleton />
						<QACardSkeleton />
					</div>
				)}
				{!isLoading && isError && (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-8">
							<p className="text-muted-foreground text-sm">
								Unable to load Q&A. Please try again later.
							</p>
						</CardContent>
					</Card>
				)}
				{!(isLoading || isError) && answeredQuestions.length > 0 && (
					<div className="space-y-4">
						{answeredQuestions.map((qa) => (
							<Card key={qa.id}>
								<CardHeader>
									<div className="flex items-start gap-3">
										<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-success" />
										<div>
											<CardDescription className="mb-1">
												{qa.project.title}
											</CardDescription>
											<CardTitle className="text-base">{qa.question}</CardTitle>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className="ml-8 space-y-3">
										<div className="rounded-none border-muted border-l-2 bg-muted/30 p-4">
											<p className="text-sm">{qa.answer}</p>
										</div>
										<div className="flex gap-4 text-muted-foreground text-xs">
											<span>Asked {formatRelativeTime(qa.askedAt)}</span>
											{qa.answeredAt && (
												<span>
													Answered {formatRelativeTime(qa.answeredAt)}
												</span>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
				{!(isLoading || isError) && answeredQuestions.length === 0 && (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-8">
							<QuestionIcon className="mb-2 size-8 text-muted-foreground" />
							<p className="text-muted-foreground text-sm">
								No answered questions yet.
							</p>
						</CardContent>
					</Card>
				)}
			</div>

			{!(isLoading || qAndAs?.length) && (
				<Card className="mt-8">
					<CardContent className="flex flex-col items-center justify-center py-12">
						<QuestionIcon className="mb-4 size-12 text-muted-foreground" />
						<p className="mb-2 font-medium text-sm">No questions yet</p>
						<p className="text-center text-muted-foreground text-xs">
							Questions about your projects will appear here. You can ask
							questions and track responses.
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
