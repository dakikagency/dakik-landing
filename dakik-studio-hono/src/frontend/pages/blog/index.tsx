import { useQuery } from "@tanstack/react-query";
import { useHead } from "@unhead/react";
import { Navbar } from "../../components/landing/navbar";
import { Footer } from "../../components/landing/footer";
import { BlogCard } from "../../components/blog/blog-card";
import { BlogFeaturedHero, BlogFeaturedSidebar } from "../../components/blog/blog-featured";
import { BlogRecentCard } from "../../components/blog/blog-recent-card";
import type { BlogPostSummary } from "../../lib/blog";

async function fetchPosts(): Promise<{ posts: BlogPostSummary[] }> {
	const res = await fetch("/api/blog");
	if (!res.ok) throw new Error("Failed to load posts");
	return res.json();
}

export function BlogIndexPage() {
	useHead({
		title: "Blog · Dakik Studio",
		meta: [
			{
				name: "description",
				content:
					"Articles on design systems, web performance, and product engineering from the Dakik Studio team.",
			},
			{ property: "og:title", content: "Blog · Dakik Studio" },
			{ property: "og:type", content: "website" },
		],
	});

	const { data, isLoading, isError } = useQuery({
		queryKey: ["blog", "list"],
		queryFn: fetchPosts,
	});

	const posts = data?.posts ?? [];
	const hero = posts[0];
	const sidebar = posts.slice(1, 6);
	const recent = posts.slice(6);

	return (
		<div className="min-h-screen bg-white">
			<Navbar />
			<main className="mx-auto max-w-7xl px-6 pt-32 pb-24 lg:px-10">
				<header className="mb-16 max-w-3xl">
					<span className="font-semibold text-gray-400 text-xs uppercase tracking-widest">
						Journal
					</span>
					<h1 className="mt-3 font-bold text-4xl tracking-tight sm:text-5xl lg:text-6xl">
						Notes from the studio
					</h1>
					<p className="mt-5 text-gray-500 text-lg leading-relaxed">
						Design systems, performance, and product engineering — written from the ground floor.
					</p>
				</header>

				{isLoading && <p className="text-gray-500">Loading...</p>}
				{isError && (
					<p className="text-gray-500">Posts are temporarily unavailable. Check back soon.</p>
				)}

				{hero && (
					<section className="mb-20 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
						<BlogFeaturedHero post={hero} />
						<BlogFeaturedSidebar posts={sidebar} />
					</section>
				)}

				{posts.length > 1 && (
					<section className="mb-20">
						<h2 className="mb-8 font-bold text-2xl tracking-tight">Latest</h2>
						<div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
							{posts.slice(1, 7).map((post) => (
								<BlogCard key={post.slug} {...post} />
							))}
						</div>
					</section>
				)}

				{recent.length > 0 && (
					<section>
						<h2 className="mb-8 font-bold text-2xl tracking-tight">More</h2>
						<div className="flex flex-col gap-8">
							{recent.map((post) => (
								<BlogRecentCard key={post.slug} {...post} />
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
