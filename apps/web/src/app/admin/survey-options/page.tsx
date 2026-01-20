"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowDownIcon,
	ArrowLeftIcon,
	ArrowUpIcon,
	EditIcon,
	EyeIcon,
	EyeOffIcon,
	GripVerticalIcon,
	Layers,
	Loader2Icon,
	MoreHorizontalIcon,
	PlusIcon,
	RotateCcwIcon,
	TrashIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

// Regex for validating option keys
const OPTION_KEY_REGEX = /^[A-Z0-9_]+$/;

type QuestionType = "PROJECT_TYPE" | "BUDGET";
type InputType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE";

interface SurveyQuestion {
	id: string;
	key: string;
	title: string;
	description: string | null;
	inputType: InputType;
	order: number;
	isActive: boolean;
	createdAt: Date | string;
	updatedAt: Date | string;
	options: SurveyOption[];
}

interface SurveyOption {
	id: string;
	questionId: string | null;
	questionType: QuestionType | null;
	label: string;
	value: string;
	description: string | null;
	icon: string | null;
	order: number;
	isActive: boolean;
	createdAt: Date | string;
	updatedAt: Date | string;
}

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
	PROJECT_TYPE: "Project Type",
	BUDGET: "Budget Range",
};

const INPUT_TYPE_LABELS: Record<InputType, string> = {
	SINGLE_CHOICE: "Single Choice",
	MULTIPLE_CHOICE: "Multiple Choice",
};

const ICON_OPTIONS = [
	{ value: "Bot", label: "Bot (AI)" },
	{ value: "Palette", label: "Palette (Design)" },
	{ value: "Smartphone", label: "Smartphone (Mobile)" },
	{ value: "Layers", label: "Layers (Product)" },
	{ value: "DollarSign", label: "Dollar Sign (Money)" },
	{ value: "Briefcase", label: "Briefcase (Business)" },
	{ value: "Code", label: "Code (Development)" },
	{ value: "Globe", label: "Globe (Web)" },
	{ value: "Rocket", label: "Rocket (Launch)" },
	{ value: "Zap", label: "Zap (Fast)" },
];

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4"];

function QuestionEditor({
	question,
	onCancel,
	onSuccess,
}: {
	question?: SurveyQuestion | null;
	onCancel: () => void;
	onSuccess: () => void;
}) {
	const queryClient = useQueryClient();
	const isEditing = Boolean(question);

	const [key, setKey] = useState(question?.key ?? "");
	const [title, setTitle] = useState(question?.title ?? "");
	const [description, setDescription] = useState(question?.description ?? "");
	const [inputType, setInputType] = useState<InputType>(
		question?.inputType ?? "SINGLE_CHOICE"
	);
	const [isActive, setIsActive] = useState(question?.isActive ?? true);
	const [keyManuallyEdited, setKeyManuallyEdited] = useState(isEditing);

	const createMutation = useMutation(
		trpc.surveyOptions.createQuestion.mutationOptions()
	);
	const updateMutation = useMutation(
		trpc.surveyOptions.updateQuestion.mutationOptions()
	);

	const generateKey = (text: string): string => {
		return text
			.toUpperCase()
			.replace(/[^A-Z0-9]+/g, "_")
			.replace(/(^_|_$)/g, "");
	};

	const handleTitleChange = (newTitle: string) => {
		setTitle(newTitle);
		if (!keyManuallyEdited) {
			setKey(generateKey(newTitle));
		}
	};

	const handleKeyChange = (newKey: string) => {
		setKeyManuallyEdited(true);
		setKey(generateKey(newKey));
	};

	const validateForm = (): boolean => {
		if (!title.trim()) {
			toast.error("Title is required");
			return false;
		}
		if (!key.trim()) {
			toast.error("Key is required");
			return false;
		}
		if (!OPTION_KEY_REGEX.test(key)) {
			toast.error("Key must be uppercase alphanumeric with underscores");
			return false;
		}
		return true;
	};

	const handleSave = async () => {
		if (!validateForm()) {
			return;
		}

		try {
			if (isEditing && question) {
				await updateMutation.mutateAsync({
					id: question.id,
					title: title.trim(),
					description: description.trim() || null,
					inputType,
					isActive,
				});
				toast.success("Question updated");
			} else {
				await createMutation.mutateAsync({
					key: key.trim(),
					title: title.trim(),
					description: description.trim() || undefined,
					inputType,
					isActive,
				});
				toast.success("Question created");
			}

			await queryClient.invalidateQueries({
				queryKey: trpc.surveyOptions.getAllQuestions.queryKey(),
			});
			onSuccess();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to save question";
			toast.error(message);
		}
	};

	const isSaving = createMutation.isPending || updateMutation.isPending;

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<Button onClick={onCancel} size="icon-sm" variant="ghost">
						<ArrowLeftIcon className="size-4" />
					</Button>
					<div>
						<h1 className="font-bold font-display text-2xl tracking-tight">
							{isEditing ? "Edit Question" : "New Question"}
						</h1>
						<p className="mt-1 text-muted-foreground text-sm">
							{isEditing
								? "Update the survey question."
								: "Create a new survey question."}
						</p>
					</div>
				</div>
				<Button disabled={isSaving} onClick={handleSave}>
					{isSaving ? (
						<Loader2Icon className="mr-2 size-4 animate-spin" />
					) : null}
					{isEditing ? "Update" : "Create"}
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Question Details</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								onChange={(e) => handleTitleChange(e.target.value)}
								placeholder="e.g., What type of project?"
								value={title}
							/>
							<p className="text-muted-foreground text-xs">
								The question shown to users.
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="key">Key</Label>
							<Input
								disabled={isEditing}
								id="key"
								onChange={(e) => handleKeyChange(e.target.value)}
								placeholder="e.g., PROJECT_TYPE"
								value={key}
							/>
							<p className="text-muted-foreground text-xs">
								{isEditing
									? "Key cannot be changed after creation."
									: "The internal identifier for this question."}
							</p>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<textarea
							className={cn(
								"min-h-20 w-full resize-none border bg-transparent px-3 py-2 text-sm outline-none transition-colors",
								"placeholder:text-muted-foreground",
								"focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
								"disabled:cursor-not-allowed disabled:opacity-50"
							)}
							id="description"
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Subtitle or helper text..."
							value={description}
						/>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="inputType">Input Type</Label>
							<Select
								onValueChange={(val) => val && setInputType(val as InputType)}
								value={inputType}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(INPUT_TYPE_LABELS).map(([value, label]) => (
										<SelectItem key={value} value={value}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className="text-muted-foreground text-xs">
								Whether users can select one or multiple options.
							</p>
						</div>

						<div className="space-y-2">
							<Label>Status</Label>
							<div className="flex items-center gap-2 pt-2">
								<Checkbox
									checked={isActive}
									id="isActive"
									onCheckedChange={(checked) => setIsActive(checked === true)}
								/>
								<Label className="cursor-pointer text-sm" htmlFor="isActive">
									Active
								</Label>
							</div>
							<p className="text-muted-foreground text-xs">
								{isActive
									? "This question is visible in the survey."
									: "This question is hidden from the survey."}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function OptionEditor({
	option,
	questionId,
	questionType,
	onCancel,
	onSuccess,
}: {
	option?: SurveyOption | null;
	questionId?: string;
	questionType?: QuestionType;
	onCancel: () => void;
	onSuccess: () => void;
}) {
	const queryClient = useQueryClient();
	const isEditing = Boolean(option);

	const [label, setLabel] = useState(option?.label ?? "");
	const [value, setValue] = useState(option?.value ?? "");
	const [description, setDescription] = useState(option?.description ?? "");
	const [icon, setIcon] = useState(option?.icon ?? "");
	const [isActive, setIsActive] = useState(option?.isActive ?? true);
	const [valueManuallyEdited, setValueManuallyEdited] = useState(isEditing);

	const createMutation = useMutation(
		trpc.surveyOptions.create.mutationOptions()
	);
	const updateMutation = useMutation(
		trpc.surveyOptions.update.mutationOptions()
	);

	const generateValue = (text: string): string => {
		return text
			.toUpperCase()
			.replace(/[^A-Z0-9]+/g, "_")
			.replace(/(^_|_$)/g, "");
	};

	const handleLabelChange = (newLabel: string) => {
		setLabel(newLabel);
		if (!valueManuallyEdited) {
			setValue(generateValue(newLabel));
		}
	};

	const handleValueChange = (newValue: string) => {
		setValueManuallyEdited(true);
		setValue(generateValue(newValue));
	};

	const validateForm = (): boolean => {
		if (!label.trim()) {
			toast.error("Label is required");
			return false;
		}
		if (!value.trim()) {
			toast.error("Value is required");
			return false;
		}
		return true;
	};

	const handleSave = async () => {
		if (!validateForm()) {
			return;
		}

		try {
			if (isEditing && option) {
				await updateMutation.mutateAsync({
					id: option.id,
					label: label.trim(),
					description: description.trim() || null,
					icon: icon || null,
					isActive,
				});
				toast.success("Option updated");
			} else {
				await createMutation.mutateAsync({
					questionId,
					questionType,
					label: label.trim(),
					value: value.trim(),
					description: description.trim() || undefined,
					icon: icon || undefined,
					isActive,
				});
				toast.success("Option created");
			}

			await queryClient.invalidateQueries({
				queryKey: trpc.surveyOptions.getAll.queryKey(),
			});
			await queryClient.invalidateQueries({
				queryKey: trpc.surveyOptions.getAllQuestions.queryKey(),
			});
			onSuccess();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to save option";
			toast.error(message);
		}
	};

	const isSaving = createMutation.isPending || updateMutation.isPending;

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<Button onClick={onCancel} size="icon-sm" variant="ghost">
						<ArrowLeftIcon className="size-4" />
					</Button>
					<div>
						<h1 className="font-bold font-display text-2xl tracking-tight">
							{isEditing ? "Edit Option" : "New Option"}
						</h1>
						<p className="mt-1 text-muted-foreground text-sm">
							{isEditing
								? "Update the survey option."
								: "Create a new survey option."}
						</p>
					</div>
				</div>
				<Button disabled={isSaving} onClick={handleSave}>
					{isSaving ? (
						<Loader2Icon className="mr-2 size-4 animate-spin" />
					) : null}
					{isEditing ? "Update" : "Create"}
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Option Details</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="label">Label</Label>
							<Input
								id="label"
								onChange={(e) => handleLabelChange(e.target.value)}
								placeholder="e.g., AI Automation"
								value={label}
							/>
							<p className="text-muted-foreground text-xs">
								The display name shown to users.
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="value">Value</Label>
							<Input
								disabled={isEditing}
								id="value"
								onChange={(e) => handleValueChange(e.target.value)}
								placeholder="e.g., AI_AUTOMATION"
								value={value}
							/>
							<p className="text-muted-foreground text-xs">
								{isEditing
									? "Value cannot be changed after creation."
									: "The internal value stored in the database."}
							</p>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<textarea
							className={cn(
								"min-h-20 w-full resize-none border bg-transparent px-3 py-2 text-sm outline-none transition-colors",
								"placeholder:text-muted-foreground",
								"focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
								"disabled:cursor-not-allowed disabled:opacity-50"
							)}
							id="description"
							onChange={(e) => setDescription(e.target.value)}
							placeholder="A brief description of this option..."
							value={description}
						/>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="icon">Icon</Label>
							<Select onValueChange={(val) => val && setIcon(val)} value={icon}>
								<SelectTrigger>
									<SelectValue>
										{(value: string | null) => value ?? "Select an icon"}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{ICON_OPTIONS.map((iconOption) => (
										<SelectItem key={iconOption.value} value={iconOption.value}>
											{iconOption.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className="text-muted-foreground text-xs">
								The icon displayed with this option.
							</p>
						</div>

						<div className="space-y-2">
							<Label>Status</Label>
							<div className="flex items-center gap-2 pt-2">
								<Checkbox
									checked={isActive}
									id="isActive"
									onCheckedChange={(checked) => setIsActive(checked === true)}
								/>
								<Label className="cursor-pointer text-sm" htmlFor="isActive">
									Active
								</Label>
							</div>
							<p className="text-muted-foreground text-xs">
								{isActive
									? "This option is visible in the survey."
									: "This option is hidden from the survey."}
							</p>
						</div>
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
					<div className="flex items-center gap-4">
						<Skeleton className="size-4" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-3 w-48" />
						</div>
					</div>
					<Skeleton className="h-5 w-20" />
				</div>
			))}
		</div>
	);
}

function EmptyState({ questionType }: { questionType: QuestionType }) {
	return (
		<div className="py-8 text-center">
			<p className="text-muted-foreground text-sm">
				No {QUESTION_TYPE_LABELS[questionType].toLowerCase()} options yet.
				Create your first option!
			</p>
		</div>
	);
}

function DeleteConfirmBanner({
	onCancel,
	onConfirm,
	isPending,
}: {
	onCancel: () => void;
	onConfirm: () => void;
	isPending: boolean;
}) {
	return (
		<div className="mb-4 flex items-center justify-between border border-destructive/50 bg-destructive/10 p-3">
			<p className="text-sm">Are you sure you want to delete this option?</p>
			<div className="flex gap-2">
				<Button
					disabled={isPending}
					onClick={onCancel}
					size="sm"
					variant="outline"
				>
					Cancel
				</Button>
				<Button
					disabled={isPending}
					onClick={onConfirm}
					size="sm"
					variant="destructive"
				>
					{isPending ? (
						<Loader2Icon className="mr-2 size-4 animate-spin" />
					) : null}
					Delete
				</Button>
			</div>
		</div>
	);
}

function OptionsTable({
	options,
	onEdit,
	onToggleActive,
	onDeleteClick,
	onMoveUp,
	onMoveDown,
}: {
	options: SurveyOption[];
	onEdit: (option: SurveyOption) => void;
	onToggleActive: (option: SurveyOption) => void;
	onDeleteClick: (id: string) => void;
	onMoveUp: (option: SurveyOption, index: number) => void;
	onMoveDown: (option: SurveyOption, index: number) => void;
}) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-12">Order</TableHead>
					<TableHead>Label</TableHead>
					<TableHead className="hidden md:table-cell">Value</TableHead>
					<TableHead className="hidden lg:table-cell">Description</TableHead>
					<TableHead>Status</TableHead>
					<TableHead className="w-12">
						<span className="sr-only">Actions</span>
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{options.map((option, index) => (
					<TableRow
						className={cn(!option.isActive && "opacity-60")}
						key={option.id}
					>
						<TableCell>
							<div className="flex items-center gap-1">
								<GripVerticalIcon className="size-4 text-muted-foreground" />
								<div className="flex flex-col">
									<Button
										className="h-5 w-5"
										disabled={index === 0}
										onClick={() => onMoveUp(option, index)}
										size="icon-sm"
										variant="ghost"
									>
										<ArrowUpIcon className="size-3" />
									</Button>
									<Button
										className="h-5 w-5"
										disabled={index === options.length - 1}
										onClick={() => onMoveDown(option, index)}
										size="icon-sm"
										variant="ghost"
									>
										<ArrowDownIcon className="size-3" />
									</Button>
								</div>
							</div>
						</TableCell>
						<TableCell>
							<div className="space-y-1">
								<span className="font-medium">{option.label}</span>
								{option.icon && (
									<p className="text-muted-foreground text-xs">
										Icon: {option.icon}
									</p>
								)}
							</div>
						</TableCell>
						<TableCell className="hidden font-mono text-xs md:table-cell">
							{option.value}
						</TableCell>
						<TableCell className="hidden max-w-xs truncate text-muted-foreground lg:table-cell">
							{option.description ?? "-"}
						</TableCell>
						<TableCell>
							<Badge variant={option.isActive ? "success" : "secondary"}>
								{option.isActive ? "Active" : "Inactive"}
							</Badge>
						</TableCell>
						<TableCell>
							<DropdownMenu>
								<DropdownMenuTrigger
									render={<Button size="icon-sm" variant="ghost" />}
								>
									<MoreHorizontalIcon className="size-4" />
									<span className="sr-only">Open menu</span>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => onEdit(option)}>
										<EditIcon className="mr-2 size-4" />
										Edit
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => onToggleActive(option)}>
										{option.isActive ? (
											<>
												<EyeOffIcon className="mr-2 size-4" />
												Deactivate
											</>
										) : (
											<>
												<EyeIcon className="mr-2 size-4" />
												Activate
											</>
										)}
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => onDeleteClick(option.id)}
										variant="destructive"
									>
										<TrashIcon className="mr-2 size-4" />
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

function OptionsList({
	questionType,
	options,
	isLoading,
	onEdit,
	onCreate,
}: {
	questionType: QuestionType;
	options: SurveyOption[];
	isLoading: boolean;
	onEdit: (option: SurveyOption) => void;
	onCreate: () => void;
}) {
	const queryClient = useQueryClient();
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

	const deleteMutation = useMutation(
		trpc.surveyOptions.delete.mutationOptions()
	);
	const toggleActiveMutation = useMutation(
		trpc.surveyOptions.toggleActive.mutationOptions()
	);
	const reorderMutation = useMutation(
		trpc.surveyOptions.reorder.mutationOptions()
	);

	const handleDeleteClick = (id: string) => {
		setDeleteConfirmId(id);
	};

	const handleDeleteConfirm = async () => {
		if (!deleteConfirmId) {
			return;
		}

		try {
			await deleteMutation.mutateAsync({ id: deleteConfirmId });
			await queryClient.invalidateQueries({
				queryKey: trpc.surveyOptions.getAll.queryKey(),
			});
			toast.success("Option deleted");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to delete option";
			toast.error(message);
		} finally {
			setDeleteConfirmId(null);
		}
	};

	const handleToggleActive = async (option: SurveyOption) => {
		try {
			await toggleActiveMutation.mutateAsync({ id: option.id });
			await queryClient.invalidateQueries({
				queryKey: trpc.surveyOptions.getAll.queryKey(),
			});
			toast.success(
				option.isActive ? "Option deactivated" : "Option activated"
			);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to update option";
			toast.error(message);
		}
	};

	const handleMoveUp = async (option: SurveyOption, index: number) => {
		if (index === 0) {
			return;
		}

		const newOrder = [...options];
		const temp = newOrder[index - 1];
		newOrder[index - 1] = option;
		newOrder[index] = temp;

		try {
			await reorderMutation.mutateAsync({
				questionType,
				orderedIds: newOrder.map((o) => o.id),
			});
			await queryClient.invalidateQueries({
				queryKey: trpc.surveyOptions.getAll.queryKey(),
			});
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to reorder options";
			toast.error(message);
		}
	};

	const handleMoveDown = async (option: SurveyOption, index: number) => {
		if (index === options.length - 1) {
			return;
		}

		const newOrder = [...options];
		const temp = newOrder[index + 1];
		newOrder[index + 1] = option;
		newOrder[index] = temp;

		try {
			await reorderMutation.mutateAsync({
				questionType,
				orderedIds: newOrder.map((o) => o.id),
			});
			await queryClient.invalidateQueries({
				queryKey: trpc.surveyOptions.getAll.queryKey(),
			});
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to reorder options";
			toast.error(message);
		}
	};

	const filteredOptions = options.filter(
		(o) => o.questionType === questionType
	);

	const renderContent = () => {
		if (isLoading) {
			return <LoadingSkeleton />;
		}

		if (filteredOptions.length === 0) {
			return <EmptyState questionType={questionType} />;
		}

		return (
			<OptionsTable
				onDeleteClick={handleDeleteClick}
				onEdit={onEdit}
				onMoveDown={handleMoveDown}
				onMoveUp={handleMoveUp}
				onToggleActive={handleToggleActive}
				options={filteredOptions}
			/>
		);
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<CardTitle className="text-sm">
						{QUESTION_TYPE_LABELS[questionType]} Options (
						{filteredOptions.length})
					</CardTitle>
					<Button onClick={onCreate} size="sm">
						<PlusIcon className="mr-2 size-4" />
						Add Option
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{deleteConfirmId && (
					<DeleteConfirmBanner
						isPending={deleteMutation.isPending}
						onCancel={() => setDeleteConfirmId(null)}
						onConfirm={handleDeleteConfirm}
					/>
				)}
				{renderContent()}
			</CardContent>
		</Card>
	);
}

function QuestionsList({
	questions,
	isLoading,
	onEdit,
	onCreate,
	onManageOptions,
}: {
	questions: SurveyQuestion[];
	isLoading: boolean;
	onEdit: (question: SurveyQuestion) => void;
	onCreate: () => void;
	onManageOptions: (question: SurveyQuestion) => void;
}) {
	const queryClient = useQueryClient();
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

	const deleteMutation = useMutation(
		trpc.surveyOptions.deleteQuestion.mutationOptions()
	);
	const toggleActiveMutation = useMutation(
		trpc.surveyOptions.toggleQuestionActive.mutationOptions()
	);
	const reorderMutation = useMutation(
		trpc.surveyOptions.reorderQuestions.mutationOptions()
	);

	const handleDeleteClick = (id: string) => {
		setDeleteConfirmId(id);
	};

	const handleDeleteConfirm = async () => {
		if (!deleteConfirmId) {
			return;
		}

		try {
			await deleteMutation.mutateAsync({ id: deleteConfirmId });
			await queryClient.invalidateQueries({
				queryKey: trpc.surveyOptions.getAllQuestions.queryKey(),
			});
			toast.success("Question deleted");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to delete question";
			toast.error(message);
		} finally {
			setDeleteConfirmId(null);
		}
	};

	const handleToggleActive = async (question: SurveyQuestion) => {
		try {
			await toggleActiveMutation.mutateAsync({ id: question.id });
			await queryClient.invalidateQueries({
				queryKey: trpc.surveyOptions.getAllQuestions.queryKey(),
			});
			toast.success(
				question.isActive ? "Question deactivated" : "Question activated"
			);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to update question";
			toast.error(message);
		}
	};

	const handleMoveUp = async (question: SurveyQuestion, index: number) => {
		if (index === 0) {
			return;
		}

		const newOrder = [...questions];
		const temp = newOrder[index - 1];
		newOrder[index - 1] = question;
		newOrder[index] = temp;

		try {
			await reorderMutation.mutateAsync({
				orderedIds: newOrder.map((q) => q.id),
			});
			await queryClient.invalidateQueries({
				queryKey: trpc.surveyOptions.getAllQuestions.queryKey(),
			});
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to reorder questions";
			toast.error(message);
		}
	};

	const handleMoveDown = async (question: SurveyQuestion, index: number) => {
		if (index === questions.length - 1) {
			return;
		}

		const newOrder = [...questions];
		const temp = newOrder[index + 1];
		newOrder[index + 1] = question;
		newOrder[index] = temp;

		try {
			await reorderMutation.mutateAsync({
				orderedIds: newOrder.map((q) => q.id),
			});
			await queryClient.invalidateQueries({
				queryKey: trpc.surveyOptions.getAllQuestions.queryKey(),
			});
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to reorder questions";
			toast.error(message);
		}
	};

	const renderContent = () => {
		if (isLoading) {
			return <LoadingSkeleton />;
		}

		if (questions.length === 0) {
			return (
				<div className="py-8 text-center">
					<p className="text-muted-foreground text-sm">
						No questions yet. Create your first question!
					</p>
				</div>
			);
		}

		return (
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-12">Order</TableHead>
						<TableHead>Title</TableHead>
						<TableHead className="hidden md:table-cell">Key</TableHead>
						<TableHead className="hidden lg:table-cell">Type</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className="w-12">
							<span className="sr-only">Actions</span>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{questions.map((question, index) => (
						<TableRow
							className={cn(!question.isActive && "opacity-60")}
							key={question.id}
						>
							<TableCell>
								<div className="flex items-center gap-1">
									<GripVerticalIcon className="size-4 text-muted-foreground" />
									<div className="flex flex-col">
										<Button
											className="h-5 w-5"
											disabled={index === 0}
											onClick={() => handleMoveUp(question, index)}
											size="icon-sm"
											variant="ghost"
										>
											<ArrowUpIcon className="size-3" />
										</Button>
										<Button
											className="h-5 w-5"
											disabled={index === questions.length - 1}
											onClick={() => handleMoveDown(question, index)}
											size="icon-sm"
											variant="ghost"
										>
											<ArrowDownIcon className="size-3" />
										</Button>
									</div>
								</div>
							</TableCell>
							<TableCell>
								<div className="space-y-1">
									<span className="font-medium">{question.title}</span>
									{question.description && (
										<p className="text-muted-foreground text-xs">
											{question.description}
										</p>
									)}
									<p className="text-muted-foreground text-xs">
										{question.options.length} option
										{question.options.length !== 1 ? "s" : ""}
									</p>
								</div>
							</TableCell>
							<TableCell className="hidden font-mono text-xs md:table-cell">
								{question.key}
							</TableCell>
							<TableCell className="hidden lg:table-cell">
								<Badge variant="outline">
									{INPUT_TYPE_LABELS[question.inputType]}
								</Badge>
							</TableCell>
							<TableCell>
								<Badge variant={question.isActive ? "success" : "secondary"}>
									{question.isActive ? "Active" : "Inactive"}
								</Badge>
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger
										render={<Button size="icon-sm" variant="ghost" />}
									>
										<MoreHorizontalIcon className="size-4" />
										<span className="sr-only">Open menu</span>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => onEdit(question)}>
											<EditIcon className="mr-2 size-4" />
											Edit
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => onManageOptions(question)}>
											<Layers className="mr-2 size-4" />
											Manage Options
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => handleToggleActive(question)}
										>
											{question.isActive ? (
												<>
													<EyeOffIcon className="mr-2 size-4" />
													Deactivate
												</>
											) : (
												<>
													<EyeIcon className="mr-2 size-4" />
													Activate
												</>
											)}
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() => handleDeleteClick(question.id)}
											variant="destructive"
										>
											<TrashIcon className="mr-2 size-4" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		);
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<CardTitle className="text-sm">
						Survey Questions ({questions.length})
					</CardTitle>
					<Button onClick={onCreate} size="sm">
						<PlusIcon className="mr-2 size-4" />
						Add Question
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{deleteConfirmId && (
					<DeleteConfirmBanner
						isPending={deleteMutation.isPending}
						onCancel={() => setDeleteConfirmId(null)}
						onConfirm={handleDeleteConfirm}
					/>
				)}
				{renderContent()}
			</CardContent>
		</Card>
	);
}

export default function SurveyOptionsPage() {
	const queryClient = useQueryClient();
	const [view, setView] = useState<
		| "list"
		| "create-question"
		| "edit-question"
		| "create-option"
		| "edit-option"
		| "manage-options"
	>("list");
	const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(
		null
	);
	const [editingOption, setEditingOption] = useState<SurveyOption | null>(null);
	const [selectedQuestion, setSelectedQuestion] =
		useState<SurveyQuestion | null>(null);
	const [activeTab, setActiveTab] = useState<"questions" | QuestionType>(
		"questions"
	);

	const { data: questions, isLoading: isLoadingQuestions } = useQuery(
		trpc.surveyOptions.getAllQuestions.queryOptions()
	);

	const { data: options, isLoading: isLoadingOptions } = useQuery(
		trpc.surveyOptions.getAll.queryOptions()
	);

	const seedMutation = useMutation(
		trpc.surveyOptions.seedDefaults.mutationOptions()
	);

	// Question handlers
	const handleCreateQuestion = useCallback(() => {
		setEditingQuestion(null);
		setView("create-question");
	}, []);

	const handleEditQuestion = useCallback((question: SurveyQuestion) => {
		setEditingQuestion(question);
		setView("edit-question");
	}, []);

	const handleManageOptions = useCallback((question: SurveyQuestion) => {
		setSelectedQuestion(question);
		setView("manage-options");
	}, []);

	// Option handlers
	const handleCreateOption = useCallback(() => {
		setEditingOption(null);
		if (activeTab === "questions" && selectedQuestion) {
			setView("create-option");
		} else {
			setView("create-option");
		}
	}, [activeTab, selectedQuestion]);

	const handleEditOption = useCallback((option: SurveyOption) => {
		setEditingOption(option);
		setView("edit-option");
	}, []);

	const handleCancel = useCallback(() => {
		setEditingQuestion(null);
		setEditingOption(null);
		setSelectedQuestion(null);
		setView("list");
	}, []);

	const handleSuccess = useCallback(() => {
		setEditingQuestion(null);
		setEditingOption(null);
		// Don't clear selectedQuestion if we're managing options
		if (view !== "manage-options") {
			setSelectedQuestion(null);
		}
		setView(
			view === "create-option" || view === "edit-option"
				? "manage-options"
				: "list"
		);
	}, [view]);

	const handleSeedDefaults = async () => {
		try {
			await seedMutation.mutateAsync();
			await queryClient.invalidateQueries({
				queryKey: trpc.surveyOptions.getAll.queryKey(),
			});
			await queryClient.invalidateQueries({
				queryKey: trpc.surveyOptions.getAllQuestions.queryKey(),
			});
			toast.success("Default options seeded successfully");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to seed defaults";
			toast.error(message);
		}
	};

	// Render different views
	if (view === "create-question" || view === "edit-question") {
		return (
			<QuestionEditor
				onCancel={handleCancel}
				onSuccess={handleSuccess}
				question={editingQuestion}
			/>
		);
	}

	if (view === "create-option" || view === "edit-option") {
		const questionId = selectedQuestion?.id;
		const questionType = activeTab !== "questions" ? activeTab : undefined;

		return (
			<OptionEditor
				onCancel={handleCancel}
				onSuccess={handleSuccess}
				option={editingOption}
				questionId={questionId}
				questionType={questionType}
			/>
		);
	}

	if (view === "manage-options" && selectedQuestion) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Button onClick={handleCancel} size="icon-sm" variant="ghost">
						<ArrowLeftIcon className="size-4" />
					</Button>
					<div>
						<h1 className="font-bold font-display text-2xl tracking-tight">
							{selectedQuestion.title}
						</h1>
						<p className="mt-1 text-muted-foreground text-sm">
							Manage options for this question
						</p>
					</div>
				</div>

				<Card>
					<CardHeader className="pb-3">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<CardTitle className="text-sm">
								Options ({selectedQuestion.options.length})
							</CardTitle>
							<Button onClick={handleCreateOption} size="sm">
								<PlusIcon className="mr-2 size-4" />
								Add Option
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<OptionsTable
							onDeleteClick={(_id) => {
								/* implement delete */
							}}
							onEdit={handleEditOption}
							onMoveDown={(_opt, _idx) => {
								/* implement move */
							}}
							onMoveUp={(_opt, _idx) => {
								/* implement move */
							}}
							onToggleActive={(_opt) => {
								/* implement toggle */
							}}
							options={selectedQuestion.options}
						/>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold font-display text-2xl tracking-tight">
						Survey Configuration
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Manage survey questions and their options.
					</p>
				</div>
				<Button
					disabled={seedMutation.isPending}
					onClick={handleSeedDefaults}
					variant="outline"
				>
					{seedMutation.isPending ? (
						<Loader2Icon className="mr-2 size-4 animate-spin" />
					) : (
						<RotateCcwIcon className="mr-2 size-4" />
					)}
					Seed Defaults
				</Button>
			</div>

			<Tabs
				onValueChange={(value) =>
					setActiveTab(value as "questions" | QuestionType)
				}
				value={activeTab}
			>
				<TabsList>
					<TabsTrigger value="questions">Questions</TabsTrigger>
					<TabsTrigger value="PROJECT_TYPE">Project Types (Legacy)</TabsTrigger>
					<TabsTrigger value="BUDGET">Budget Ranges (Legacy)</TabsTrigger>
				</TabsList>

				<TabsContent className="mt-6" value="questions">
					<QuestionsList
						isLoading={isLoadingQuestions}
						onCreate={handleCreateQuestion}
						onEdit={handleEditQuestion}
						onManageOptions={handleManageOptions}
						questions={questions ?? []}
					/>
				</TabsContent>

				<TabsContent className="mt-6" value="PROJECT_TYPE">
					<OptionsList
						isLoading={isLoadingOptions}
						onCreate={handleCreateOption}
						onEdit={handleEditOption}
						options={options ?? []}
						questionType="PROJECT_TYPE"
					/>
				</TabsContent>

				<TabsContent className="mt-6" value="BUDGET">
					<OptionsList
						isLoading={isLoadingOptions}
						onCreate={handleCreateOption}
						onEdit={handleEditOption}
						options={options ?? []}
						questionType="BUDGET"
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
