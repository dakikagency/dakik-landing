import { useQuery } from "@tanstack/react-query";
import { useHead } from "@unhead/react";
import { ArrowLeft, Calendar, Clock, Download } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
	AutomationCard,
	type AutomationSummary,
} from "../../components/automations/automation-card";
import { BlogContent } from "../../components/blog/blog-content";
import { Footer } from "../../components/landing/footer";
import { Navbar } from "../../components/landing/navbar";
import {
	calculateReadTime,
	formatDate,
} from "../../lib/blog";

interface AutomationFull extends AutomationSummary {
	content: string;
	publishedAt: string | null;
	updatedAt: string;
}

async function fetchAutomation(slug: string): Promise<{
	automation: AutomationFull;
	related: AutomationSummary[];
}> {
	const res = await fetch(`/api/automations/${encodeURIComponent(slug)}`);
	if (!res.ok) throw new Error("Failed to load automation");
	return res.json();
}

export function AutomationDetailPage() {
	const { slug = "" } = useParams<{ slug: string }>();
	const { data, isLoading, isError } = useQuery({
		queryKey: ["automations", "post", slug],
		queryFn: () => fetchAutomation(slug),
		enabled: !!slug,
	});

	const automation = data?.automation;
	const related = data?.related ?? [];
	const readTime = useMemo(
		() => (automation ? calculateReadTime(automation.content) : 0),
		[automation],
	);

	useHead({
		title: automation
			? `${automation.title} · Dakik Studio`
			: "Automation · Dakik Studio",
		meta: automation
			? [
					{ name: "description", content: automation.excerpt ?? "" },
					{ property: "og:title", content: automation.title },
					{ property: "og:type", content: "article" },
					...(automation.coverImage
						? [{ property: "og:image", content: automation.coverImage }]
						: []),
				]
			: [],
	});

	if (isLoading) {
		return (
			<div className="min-h-screen bg-white">
				<Navbar />
				<main className="mx-auto max-w-3xl px-6 pt-32 pb-24">
					<p className="text-gray-500">Loading...</p>
				</main>
				<Footer />
			</div>
		);
	}

	if (isError || !automation) {
		return (
			<div className="min-h-screen bg-white">
				<Navbar />
				<main className="mx-auto max-w-3xl px-6 pt-32 pb-24">
					<h1 className="font-bold text-3xl">Automation not found</h1>
					<Link className="mt-6 inline-flex items-center gap-2 text-sm" to="/automations">
						<ArrowLeft className="h-4 w-4" /> Back to automations
					</Link>
				</main>
				<Footer />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white">
			<Navbar />
			<main className="mx-auto max-w-7xl px-6 pt-32 pb-24 lg:px-10">
				<Link className="mb-8 inline-flex items-center gap-2 text-gray-500 text-sm hover:text-black" to="/automations">
					<ArrowLeft className="h-4 w-4" /> Automations
				</Link>

				<header className="mx-auto mb-12 max-w-3xl">
					<h1 className="font-bold text-4xl leading-tight tracking-tight sm:text-5xl">
						{automation.title}
					</h1>
					{automation.excerpt && (
						<p className="mt-5 text-gray-500 text-lg leading-relaxed">
							{automation.excerpt}
						</p>
					)}
					<div className="mt-8 flex flex-wrap items-center gap-6 text-gray-500 text-sm">
						{automation.publishedAt && (
							<div className="flex items-center gap-1.5">
								<Calendar className="h-4 w-4" />
								<time dateTime={new Date(automation.publishedAt).toISOString()}>
									{formatDate(automation.publishedAt)}
								</time>
							</div>
						)}
						<div className="flex items-center gap-1.5">
							<Clock className="h-4 w-4" />
							<span>{readTime} min read</span>
						</div>
						{automation.fileUrl && (
							<a
								className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 font-medium text-white text-xs hover:bg-gray-800"
								href={automation.fileUrl}
								rel="noreferrer"
								target="_blank"
							>
								<Download className="h-4 w-4" /> Download files
							</a>
						)}
					</div>
				</header>

				{automation.coverImage && (
					<div className="mb-16 overflow-hidden rounded-2xl bg-gray-100">
						<img
							alt={automation.title}
							className="h-auto w-full object-cover"
							src={automation.coverImage}
						/>
					</div>
				)}

				<article className="mx-auto w-full max-w-3xl">
					<BlogContent content={automation.content} />
				</article>

				{related.length > 0 && (
					<section className="mt-24 border-gray-100 border-t pt-16">
						<h2 className="mb-8 font-bold text-2xl tracking-tight">Related automations</h2>
						<div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
							{related.map((a) => (
								<AutomationCard automation={a} key={a.slug} />
							))}
						</div>
					</section>
				)}
			</main>
			<Footer />
		</div>
	);
}

export default AutomationDetailPage;
