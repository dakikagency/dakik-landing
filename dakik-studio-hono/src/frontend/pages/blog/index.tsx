import { useQuery } from "@tanstack/react-query";
import { useHead } from "@unhead/react";
import { BlogCard } from "../../components/blog/blog-card";
import { pageHead } from "../../lib/head";
import { Footer } from "../../components/landing/footer";
import { Navbar } from "../../components/landing/navbar";
import type { BlogPostSummary } from "../../lib/blog";

async function fetchPosts(): Promise<{ posts: BlogPostSummary[] }> {
	const res = await fetch("/api/blog");
	if (!res.ok) throw new Error("Failed to load posts");
	return res.json();
}

export function BlogIndexPage() {
	useHead(
		pageHead({
			title: "Blog · Dakik Studio",
			description:
				"Articles on design systems, web performance, and product engineering from the Dakik Studio team.",
			canonical: "https://dakik.co.uk/blog",
		}),
	);

	const { data, isLoading, isError } = useQuery({
		queryKey: ["blog", "list"],
		queryFn: fetchPosts,
	});

	const posts = data?.posts ?? [];
	const lead = posts[0];
	const rest = posts.slice(1);

	return (
		<div className="min-h-screen overflow-x-hidden bg-white text-black">
			<Navbar theme="light" />
			<main className="mx-auto max-w-7xl px-[clamp(1.25rem,5vw,5rem)] pt-24 pb-20 lg:pt-32 lg:pb-32">
				<header className="mb-16 grid grid-cols-12 gap-6 lg:mb-28">
					<div className="col-span-12 lg:col-span-8">
						<span className="font-mono text-[10px] text-black/55 uppercase tracking-[0.35em] sm:text-[11px]">
							Journal
						</span>
						<h1 className="mt-4 font-black text-[clamp(2.25rem,7vw,6rem)] uppercase leading-[0.92] tracking-[-0.04em] break-words">
							Notes from
							<br />
							the studio.
						</h1>
					</div>
					<p className="col-span-12 max-w-[44ch] self-end text-base text-black/65 leading-[1.4] lg:col-span-4 lg:text-lg">
						Design systems, web performance, and product engineering —
						written from the ground floor.
					</p>
				</header>

				{isLoading && (
					<p className="font-mono text-[11px] text-black/45 uppercase tracking-[0.35em]">
						Loading…
					</p>
				)}
				{isError && (
					<p className="font-mono text-[11px] text-black/45 uppercase tracking-[0.35em]">
						Posts are temporarily unavailable. Check back soon.
					</p>
				)}

				{!isLoading && !isError && posts.length === 0 && (
					<p className="font-mono text-[11px] text-black/45 uppercase tracking-[0.35em]">
						No posts yet.
					</p>
				)}

				{lead && (
					<section className="mb-20 border-black/10 border-b pb-16 lg:mb-28 lg:pb-24">
						<BlogCard {...lead} variant="featured" />
					</section>
				)}

				{rest.length > 0 && (
					<section>
						<div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10">
							<div className="flex flex-col justify-center">
								<span className="font-mono text-[10px] text-black/55 uppercase tracking-[0.35em] sm:text-[11px]">
									Archive
								</span>
								<h2 className="mt-4 font-black text-3xl uppercase leading-[0.95] tracking-[-0.03em] lg:text-4xl">
									More from
									<br />
									the journal.
								</h2>
								<span className="mt-4 font-mono text-[10px] text-black/45 uppercase tracking-[0.35em] tabular-nums sm:text-[11px]">
									{String(rest.length).padStart(2, "0")} posts
								</span>
							</div>
							{rest.map((post) => (
								<BlogCard key={post.slug} {...post} variant="compact" />
							))}
						</div>
					</section>
				)}
			</main>
			<Footer />
		</div>
	);
}

export default BlogIndexPage;
