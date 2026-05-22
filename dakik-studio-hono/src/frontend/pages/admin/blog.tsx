import {
	MoreHorizontalIcon,
	PencilIcon,
	PlusIcon,
	Trash2Icon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	ContentPostForm,
	type ContentPostFormValues,
} from "../../components/admin/content-post-form";
import { api, type BlogPost } from "../../lib/api";

type PublishedFilter = "all" | "published" | "draft";

function PublishedBadge({ published }: { published: boolean }) {
	if (published) {
		return (
			<span className="inline-flex rounded-full border border-green-500/30 bg-green-500/20 px-2 py-0.5 font-medium text-green-400 text-xs">
				Published
			</span>
		);
	}
	return (
		<span className="inline-flex rounded-full border border-gray-500/30 bg-gray-500/20 px-2 py-0.5 font-medium text-gray-400 text-xs">
			Draft
		</span>
	);
}

function valuesFromPost(post: BlogPost): ContentPostFormValues {
	return {
		title: post.title,
		slug: post.slug,
		excerpt: post.excerpt ?? "",
		content: post.content,
		coverImage: post.coverImage ?? null,
		published: post.published,
		tags: post.tags.map((t) => t.slug),
	};
}

export function AdminBlog() {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filter, setFilter] = useState<PublishedFilter>("all");
	const [search, setSearch] = useState("");

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editing, setEditing] = useState<BlogPost | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [openMenuId, setOpenMenuId] = useState<string | null>(null);

	const fetchPosts = useCallback(async () => {
		try {
			setIsLoading(true);
			const params: { search?: string; published?: "true" | "false" } = {};
			if (search) params.search = search;
			if (filter === "published") params.published = "true";
			if (filter === "draft") params.published = "false";
			const data = await api.admin.blog.list(params);
			setPosts(data.posts);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load posts");
		} finally {
			setIsLoading(false);
		}
	}, [filter, search]);

	useEffect(() => {
		fetchPosts();
	}, [fetchPosts]);

	function openCreate() {
		setEditing(null);
		setIsModalOpen(true);
	}

	function openEdit(post: BlogPost) {
		setEditing(post);
		setIsModalOpen(true);
		setOpenMenuId(null);
	}

	async function handleSubmit(values: ContentPostFormValues) {
		try {
			setIsSubmitting(true);
			if (editing) {
				await api.admin.blog.update(editing.id, values);
			} else {
				await api.admin.blog.create(values);
			}
			setIsModalOpen(false);
			setEditing(null);
			fetchPosts();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Save failed");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDelete(post: BlogPost) {
		if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
		try {
			await api.admin.blog.delete(post.id);
			fetchPosts();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Delete failed");
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl tracking-tight">Blog</h1>
					<p className="mt-1 text-sm text-white/60">
						Author and publish blog posts. Markdown supported in content.
					</p>
				</div>
				<button
					className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-black text-sm hover:bg-white/90"
					onClick={openCreate}
					type="button"
				>
					<PlusIcon className="size-4" />
					New post
				</button>
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<input
					className="w-64 rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm placeholder:text-white/40"
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search by title or slug"
					value={search}
				/>
				<div className="inline-flex rounded-lg border border-white/10 bg-neutral-900 p-0.5 text-xs">
					{(["all", "published", "draft"] as const).map((f) => (
						<button
							className={`rounded-md px-3 py-1.5 capitalize ${
								filter === f
									? "bg-white text-black"
									: "text-white/60 hover:text-white"
							}`}
							key={f}
							onClick={() => setFilter(f)}
							type="button"
						>
							{f}
						</button>
					))}
				</div>
			</div>

			{error && (
				<div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400 text-sm">
					{error}
				</div>
			)}

			<div className="rounded-xl border border-white/10 bg-neutral-900">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-white/10 border-b">
								<th className="px-4 py-3 text-left font-medium text-white/60 text-xs">
									Title
								</th>
								<th className="hidden px-4 py-3 text-left font-medium text-white/60 text-xs sm:table-cell">
									Slug
								</th>
								<th className="hidden px-4 py-3 text-left font-medium text-white/60 text-xs md:table-cell">
									Tags
								</th>
								<th className="px-4 py-3 text-left font-medium text-white/60 text-xs">
									Status
								</th>
								<th className="hidden px-4 py-3 text-left font-medium text-white/60 text-xs lg:table-cell">
									Updated
								</th>
								<th className="w-12 px-4 py-3 text-right font-medium text-white/60 text-xs">
									<span className="sr-only">Actions</span>
								</th>
							</tr>
						</thead>
						<tbody>
							{isLoading && (
								<tr>
									<td className="px-4 py-12 text-center text-sm text-white/50" colSpan={6}>
										Loading…
									</td>
								</tr>
							)}
							{!isLoading && posts.length === 0 && (
								<tr>
									<td className="px-4 py-12 text-center text-sm text-white/40" colSpan={6}>
										No posts match the filter.
									</td>
								</tr>
							)}
							{!isLoading &&
								posts.map((post) => (
									<tr
										className="border-white/5 border-b last:border-0"
										key={post.id}
									>
										<td className="px-4 py-3 text-sm">
											<div className="font-medium">{post.title}</div>
											{post.excerpt && (
												<div className="mt-0.5 line-clamp-1 text-white/40 text-xs">
													{post.excerpt}
												</div>
											)}
										</td>
										<td className="hidden px-4 py-3 font-mono text-white/60 text-xs sm:table-cell">
											{post.slug}
										</td>
										<td className="hidden px-4 py-3 md:table-cell">
											<div className="flex flex-wrap gap-1">
												{post.tags.slice(0, 3).map((t) => (
													<span
														className="rounded-full bg-white/5 px-1.5 py-0.5 text-white/60 text-xs"
														key={t.id}
													>
														{t.slug}
													</span>
												))}
												{post.tags.length > 3 && (
													<span className="text-white/40 text-xs">
														+{post.tags.length - 3}
													</span>
												)}
											</div>
										</td>
										<td className="px-4 py-3">
											<PublishedBadge published={post.published} />
										</td>
										<td className="hidden px-4 py-3 text-sm text-white/60 lg:table-cell">
											{new Date(post.updatedAt).toLocaleDateString()}
										</td>
										<td className="px-4 py-3 text-right">
											<div className="relative inline-block">
												<button
													className="rounded p-1 hover:bg-white/10"
													onClick={() =>
														setOpenMenuId(openMenuId === post.id ? null : post.id)
													}
													type="button"
												>
													<MoreHorizontalIcon className="size-4 text-white/60" />
												</button>
												{openMenuId === post.id && (
													<div className="absolute top-full right-0 z-10 mt-1 w-36 rounded-lg border border-white/10 bg-neutral-800 py-1 shadow-lg">
														<button
															className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-white/10"
															onClick={() => openEdit(post)}
															type="button"
														>
															<PencilIcon className="size-4" />
															Edit
														</button>
														<button
															className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-400 text-sm hover:bg-white/10"
															onClick={() => {
																setOpenMenuId(null);
																handleDelete(post);
															}}
															type="button"
														>
															<Trash2Icon className="size-4" />
															Delete
														</button>
													</div>
												)}
											</div>
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			</div>

			<ContentPostForm
				initial={editing ? valuesFromPost(editing) : null}
				isOpen={isModalOpen}
				isSubmitting={isSubmitting}
				onClose={() => {
					setIsModalOpen(false);
					setEditing(null);
				}}
				onSubmit={handleSubmit}
				resourceLabel="Post"
				uploadFolder="blog"
			/>
		</div>
	);
}

export default AdminBlog;
