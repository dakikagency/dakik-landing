"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircleIcon,
	CheckCircleIcon,
	ClockIcon,
	EyeIcon,
	Loader2Icon,
	MailIcon,
	PlusIcon,
	SendIcon,
	XCircleIcon,
	XIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];

// Email validation regex - defined at top level for performance
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getStatusBadgeVariant(status: string) {
	const variants: Record<
		string,
		"success" | "destructive" | "warning" | "secondary"
	> = {
		SENT: "success",
		FAILED: "destructive",
		BOUNCED: "warning",
	};
	return variants[status] ?? "secondary";
}

function getStatusIcon(status: string) {
	const icons: Record<string, React.ReactNode> = {
		SENT: <CheckCircleIcon className="size-3.5" />,
		FAILED: <XCircleIcon className="size-3.5" />,
		BOUNCED: <AlertCircleIcon className="size-3.5" />,
	};
	return icons[status] ?? <ClockIcon className="size-3.5" />;
}

interface EmailComposerProps {
	onSuccess: () => void;
	onCancel: () => void;
}

function EmailComposer({ onSuccess, onCancel }: EmailComposerProps) {
	const queryClient = useQueryClient();
	const [recipients, setRecipients] = useState<string[]>([]);
	const [recipientInput, setRecipientInput] = useState("");
	const [subject, setSubject] = useState("");
	const [body, setBody] = useState("");
	const [replyTo, setReplyTo] = useState("");

	const { data: config } = useQuery(trpc.email.getConfig.queryOptions());
	const sendMutation = useMutation(trpc.email.send.mutationOptions());

	const addRecipient = useCallback(() => {
		const email = recipientInput.trim().toLowerCase();
		if (!email) {
			return;
		}

		// Basic email validation
		if (!EMAIL_REGEX.test(email)) {
			toast.error("Please enter a valid email address");
			return;
		}

		if (recipients.includes(email)) {
			toast.error("This email is already added");
			return;
		}

		setRecipients((prev) => [...prev, email]);
		setRecipientInput("");
	}, [recipientInput, recipients]);

	const removeRecipient = useCallback((email: string) => {
		setRecipients((prev) => prev.filter((r) => r !== email));
	}, []);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter") {
				e.preventDefault();
				addRecipient();
			}
		},
		[addRecipient]
	);

	const handleSend = useCallback(async () => {
		if (recipients.length === 0) {
			toast.error("Please add at least one recipient");
			return;
		}

		if (!subject.trim()) {
			toast.error("Subject is required");
			return;
		}

		if (!body.trim()) {
			toast.error("Email body is required");
			return;
		}

		try {
			await sendMutation.mutateAsync({
				to: recipients,
				subject: subject.trim(),
				body: body.trim(),
				replyTo: replyTo.trim() || undefined,
			});

			await queryClient.invalidateQueries({
				queryKey: trpc.email.getHistory.queryKey(),
			});

			toast.success("Email sent successfully");
			onSuccess();
		} catch {
			// Error is handled by the mutation
		}
	}, [
		recipients,
		subject,
		body,
		replyTo,
		sendMutation,
		queryClient,
		onSuccess,
	]);

	const isSending = sendMutation.isPending;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold font-display text-2xl tracking-tight">
						Compose Email
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						{config?.configured
							? `Sending from ${config.userEmail}`
							: "Gmail not configured - emails will be mocked in development"}
					</p>
				</div>
				<div className="flex gap-2">
					<Button disabled={isSending} onClick={onCancel} variant="outline">
						Cancel
					</Button>
					<Button
						disabled={isSending || recipients.length === 0}
						onClick={handleSend}
					>
						{isSending ? (
							<Loader2Icon className="mr-2 size-4 animate-spin" />
						) : (
							<SendIcon className="mr-2 size-4" />
						)}
						Send Email
					</Button>
				</div>
			</div>

			{/* Configuration Warning */}
			{!config?.configured && (
				<Card className="border-warning/50 bg-warning/10">
					<CardContent className="py-3">
						<div className="flex items-center gap-2 text-sm">
							<AlertCircleIcon className="size-4 text-warning" />
							<span>
								Gmail is not configured. In development mode, emails will be
								logged to the console instead of being sent.
							</span>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Email Form */}
			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Email Details</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Recipients */}
					<div className="space-y-2">
						<Label htmlFor="recipients">To</Label>
						<div className="flex gap-2">
							<Input
								id="recipients"
								onChange={(e) => setRecipientInput(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="Enter email address..."
								type="email"
								value={recipientInput}
							/>
							<Button
								disabled={!recipientInput.trim()}
								onClick={addRecipient}
								size="sm"
								type="button"
								variant="outline"
							>
								<PlusIcon className="size-4" />
							</Button>
						</div>
						{recipients.length > 0 && (
							<div className="flex flex-wrap gap-2 pt-2">
								{recipients.map((email) => (
									<Badge
										className="flex items-center gap-1 pr-1"
										key={email}
										variant="secondary"
									>
										{email}
										<button
											className="hover:text-foreground"
											onClick={() => removeRecipient(email)}
											type="button"
										>
											<XIcon className="size-3" />
										</button>
									</Badge>
								))}
							</div>
						)}
					</div>

					{/* Subject */}
					<div className="space-y-2">
						<Label htmlFor="subject">Subject</Label>
						<Input
							id="subject"
							onChange={(e) => setSubject(e.target.value)}
							placeholder="Enter email subject..."
							value={subject}
						/>
					</div>

					{/* Reply To (optional) */}
					<div className="space-y-2">
						<Label htmlFor="replyTo">
							Reply To <span className="text-muted-foreground">(optional)</span>
						</Label>
						<Input
							id="replyTo"
							onChange={(e) => setReplyTo(e.target.value)}
							placeholder="Enter reply-to email address..."
							type="email"
							value={replyTo}
						/>
					</div>

					{/* Body */}
					<div className="space-y-2">
						<Label htmlFor="body">Message</Label>
						<textarea
							className={cn(
								"min-h-64 w-full resize-y border bg-transparent px-3 py-2 text-sm outline-none transition-colors",
								"placeholder:text-muted-foreground",
								"focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
								"disabled:cursor-not-allowed disabled:opacity-50"
							)}
							id="body"
							onChange={(e) => setBody(e.target.value)}
							placeholder="Write your email message..."
							value={body}
						/>
						<p className="text-muted-foreground text-xs">
							Plain text will be converted to HTML for better formatting.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

interface EmailDetailProps {
	emailId: string;
	onClose: () => void;
}

function EmailDetail({ emailId, onClose }: EmailDetailProps) {
	const { data: email, isLoading } = useQuery(
		trpc.email.getById.queryOptions({ id: emailId })
	);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Skeleton className="h-8 w-64" />
				</div>
				<Card>
					<CardContent className="py-6">
						<div className="space-y-4">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-4 w-48" />
							<Skeleton className="h-32 w-full" />
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!email) {
		return (
			<div className="py-8 text-center">
				<p className="text-muted-foreground">Email not found</p>
				<Button className="mt-4" onClick={onClose} variant="outline">
					Go Back
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold font-display text-2xl tracking-tight">
						Email Details
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Sent on {new Date(email.sentAt).toLocaleString()}
					</p>
				</div>
				<Button onClick={onClose} variant="outline">
					Back to List
				</Button>
			</div>

			{/* Email Content */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="text-sm">{email.subject}</CardTitle>
						<Badge variant={getStatusBadgeVariant(email.status)}>
							{getStatusIcon(email.status)}
							<span className="ml-1">{email.status}</span>
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2 border-b pb-4">
						<div className="flex items-start gap-2">
							<span className="text-muted-foreground text-xs">To:</span>
							<div className="flex flex-wrap gap-1">
								{(email.to ?? []).map((recipient) => (
									<Badge key={recipient} variant="outline">
										{recipient}
									</Badge>
								))}
							</div>
						</div>
						<div className="flex items-center gap-2 text-xs">
							<span className="text-muted-foreground">From:</span>
							<span>
								{email.user?.name ?? "Unknown"} (
								{email.user?.email ?? "No email"})
							</span>
						</div>
					</div>

					<div className="prose prose-sm dark:prose-invert max-w-none">
						<div className="whitespace-pre-wrap text-sm">{email.body}</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function LoadingSkeleton() {
	return (
		<div className="space-y-3">
			{SKELETON_KEYS.map((key) => (
				<div className="flex items-center justify-between py-3" key={key}>
					<div className="space-y-2">
						<Skeleton className="h-4 w-64" />
						<Skeleton className="h-3 w-32" />
					</div>
					<Skeleton className="h-5 w-20" />
				</div>
			))}
		</div>
	);
}

function EmptyState() {
	return (
		<div className="py-8 text-center">
			<MailIcon className="mx-auto size-8 text-muted-foreground" />
			<p className="mt-2 text-muted-foreground text-sm">
				No emails sent yet. Compose your first email!
			</p>
		</div>
	);
}

interface EmailListProps {
	onCompose: () => void;
	onViewEmail: (id: string) => void;
}

interface Email {
	id: string;
	to: string[];
	subject: string;
	body: string;
	status: string;
	sentAt: Date | string;
	user: {
		id: string;
		name: string;
		email: string;
	};
}

function EmailTableContent({
	emails,
	onViewEmail,
}: {
	emails: Email[];
	onViewEmail: (id: string) => void;
}) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Subject</TableHead>
					<TableHead className="hidden md:table-cell">To</TableHead>
					<TableHead>Status</TableHead>
					<TableHead className="hidden lg:table-cell">Date</TableHead>
					<TableHead className="w-12">
						<span className="sr-only">Actions</span>
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{emails.map((email) => (
					<TableRow key={email.id}>
						<TableCell>
							<div className="space-y-1">
								<span className="line-clamp-1 font-medium">
									{email.subject}
								</span>
								<p className="line-clamp-1 text-muted-foreground text-xs">
									{email.body.substring(0, 50)}...
								</p>
							</div>
						</TableCell>
						<TableCell className="hidden md:table-cell">
							<div className="flex flex-wrap gap-1">
								{(email.to ?? []).slice(0, 2).map((recipient) => (
									<Badge key={recipient} variant="outline">
										{recipient.split("@")[0]}
									</Badge>
								))}
								{(email.to ?? []).length > 2 && (
									<Badge variant="secondary">
										+{(email.to ?? []).length - 2}
									</Badge>
								)}
							</div>
						</TableCell>
						<TableCell>
							<Badge variant={getStatusBadgeVariant(email.status)}>
								{getStatusIcon(email.status)}
								<span className="ml-1">{email.status}</span>
							</Badge>
						</TableCell>
						<TableCell className="hidden text-muted-foreground lg:table-cell">
							{new Date(email.sentAt).toLocaleDateString()}
						</TableCell>
						<TableCell>
							<Button
								onClick={() => onViewEmail(email.id)}
								size="icon-sm"
								variant="ghost"
							>
								<EyeIcon className="size-4" />
								<span className="sr-only">View email</span>
							</Button>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

function EmailList({ onCompose, onViewEmail }: EmailListProps) {
	const { data, isLoading } = useQuery(
		trpc.email.getHistory.queryOptions({ limit: 50 })
	);

	const emails =
		data?.emails.map((email) => ({
			...email,
			to: email.to ?? [],
			user: {
				id: email.user?.id ?? "",
				name: email.user?.name ?? "Unknown",
				email: email.user?.email ?? "no-email",
			},
		})) ?? [];

	const renderContent = () => {
		if (isLoading) {
			return <LoadingSkeleton />;
		}
		if (emails.length === 0) {
			return <EmptyState />;
		}
		return <EmailTableContent emails={emails} onViewEmail={onViewEmail} />;
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold font-display text-2xl tracking-tight">
						Email
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Send emails and view history.
					</p>
				</div>
				<Button onClick={onCompose}>
					<PlusIcon className="mr-2 size-4" />
					Compose Email
				</Button>
			</div>

			{/* Email History */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm">Sent Emails</CardTitle>
				</CardHeader>
				<CardContent>{renderContent()}</CardContent>
			</Card>

			{/* Mobile Cards */}
			{!isLoading && emails.length > 0 && (
				<div className="block md:hidden">
					<Card>
						<CardHeader>
							<CardTitle className="text-sm">Recent Emails</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{emails.slice(0, 5).map((email) => (
								<button
									className="block w-full border-b pb-4 text-left last:border-0 last:pb-0"
									key={`mobile-${email.id}`}
									onClick={() => onViewEmail(email.id)}
									type="button"
								>
									<div className="flex items-start justify-between">
										<div className="space-y-1">
											<p className="line-clamp-1 font-medium">
												{email.subject}
											</p>
											<p className="line-clamp-1 text-muted-foreground text-xs">
												To: {(email.to ?? []).join(", ")}
											</p>
										</div>
										<Badge variant={getStatusBadgeVariant(email.status)}>
											{email.status}
										</Badge>
									</div>
									<p className="mt-2 line-clamp-2 text-muted-foreground text-xs">
										{email.body}
									</p>
								</button>
							))}
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}

type PageMode = "list" | "compose" | "view";

export default function EmailPage() {
	const [mode, setMode] = useState<PageMode>("list");
	const [viewingEmailId, setViewingEmailId] = useState<string | null>(null);

	const handleCompose = useCallback(() => {
		setMode("compose");
	}, []);

	const handleViewEmail = useCallback((id: string) => {
		setViewingEmailId(id);
		setMode("view");
	}, []);

	const handleBackToList = useCallback(() => {
		setMode("list");
		setViewingEmailId(null);
	}, []);

	if (mode === "compose") {
		return (
			<EmailComposer onCancel={handleBackToList} onSuccess={handleBackToList} />
		);
	}

	if (mode === "view" && viewingEmailId) {
		return <EmailDetail emailId={viewingEmailId} onClose={handleBackToList} />;
	}

	return <EmailList onCompose={handleCompose} onViewEmail={handleViewEmail} />;
}
