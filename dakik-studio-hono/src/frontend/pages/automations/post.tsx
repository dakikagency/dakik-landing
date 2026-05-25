import { useQuery } from "@tanstack/react-query";
import { useHead } from "@unhead/react";
import { ArrowLeft, ArrowRight, Calendar, Clock, Download } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import type { AutomationSummary } from "../../components/automations/automation-card";
import { BlogContent } from "../../components/blog/blog-content";
import Noise from "../../components/noise";
import { calculateReadTime, formatDate } from "../../lib/blog";

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

function SubdomainHeader() {
	return (
		<header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-[clamp(1.5rem,5vw,4rem)] pt-10">
			<Link className="flex items-center gap-3" to="/">
				<div className="flex h-9 w-9 items-center justify-center border-2 border-white bg-black font-black text-lg">
					D
				</div>
				<div className="flex flex-col leading-none">
					<span className="font-black text-sm uppercase tracking-[-0.02em]">
						Dakik
					</span>
					<span className="font-mono text-[9px] text-white/45 uppercase tracking-[0.35em]">
						// Flow
					</span>
				</div>
			</Link>
			<a
				className="group inline-flex items-center gap-2 font-mono text-[11px] text-white/55 uppercase tracking-[0.35em] transition-colors hover:text-white"
				href="https://dakik.co.uk"
			>
				<ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
				Dakik.co.uk
			</a>
		</header>
	);
}

function SubdomainFooter() {
	return (
		<footer className="relative z-10 mx-auto flex max-w-7xl items-center justify-between border-white/10 border-t px-[clamp(1.5rem,5vw,4rem)] py-8">
			<span className="font-mono text-[10px] text-white/40 uppercase tracking-[0.35em]">
				// Dakik Flow · MIT
			</span>
			<a
				className="font-mono text-[10px] text-white/40 uppercase tracking-[0.35em] transition-colors hover:text-white"
				href="https://dakik.co.uk"
			>
				Dakik Studio →
			</a>
		</footer>
	);
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
			? `${automation.title} · Dakik Flow`
			: "Dakik Flow",
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
			<div className="relative min-h-screen overflow-hidden bg-black text-white">
				<SubdomainHeader />
				<main className="mx-auto max-w-3xl px-[clamp(1.5rem,5vw,4rem)] pt-20 pb-24">
					<p className="font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
						// Loading playbook…
					</p>
				</main>
				<SubdomainFooter />
				<Noise patternAlpha={15} patternRefreshInterval={4} />
			</div>
		);
	}

	if (isError || !automation) {
		return (
			<div className="relative min-h-screen overflow-hidden bg-black text-white">
				<SubdomainHeader />
				<main className="mx-auto max-w-3xl px-[clamp(1.5rem,5vw,4rem)] pt-20 pb-24">
					<p className="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
						// Not found
					</p>
					<h1 className="mt-3 font-black text-4xl uppercase leading-[0.9] tracking-[-0.03em] sm:text-5xl">
						Playbook missing.
					</h1>
					<Link
						className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] text-white/55 uppercase tracking-[0.35em] hover:text-white"
						to="/"
					>
						<ArrowLeft className="size-3" />
						Back to playbooks
					</Link>
				</main>
				<SubdomainFooter />
				<Noise patternAlpha={15} patternRefreshInterval={4} />
			</div>
		);
	}

	return (
		<div className="relative min-h-screen overflow-hidden bg-black text-white">
			<SubdomainHeader />

			<main className="relative z-10 mx-auto max-w-7xl px-[clamp(1.5rem,5vw,4rem)] pt-16 pb-20">
				<Link
					className="group mb-10 inline-flex items-center gap-2 font-mono text-[11px] text-white/55 uppercase tracking-[0.35em] transition-colors hover:text-white"
					to="/"
				>
					<ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
					All playbooks
				</Link>

				<header className="mx-auto mb-12 max-w-3xl">
					<h1 className="font-black text-4xl uppercase leading-[0.9] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
						{automation.title}
					</h1>
					{automation.excerpt && (
						<p className="mt-6 text-lg text-white/70 leading-snug">
							{automation.excerpt}
						</p>
					)}
					<div className="mt-8 flex flex-wrap items-center gap-5 font-mono text-[10px] text-white/55 uppercase tracking-[0.25em]">
						{automation.publishedAt && (
							<div className="flex items-center gap-2">
								<Calendar className="h-3 w-3" />
								<time dateTime={new Date(automation.publishedAt).toISOString()}>
									{formatDate(automation.publishedAt)}
								</time>
							</div>
						)}
						<div className="flex items-center gap-2">
							<Clock className="h-3 w-3" />
							<span>{readTime} min read</span>
						</div>
						{automation.fileUrl && (
							<a
								className="inline-flex items-center gap-2 border-2 border-white bg-white px-4 py-2 font-medium text-black uppercase tracking-wider transition-colors hover:bg-black hover:text-white"
								href={automation.fileUrl}
								rel="noreferrer"
								target="_blank"
							>
								<Download className="h-3 w-3" />
								<span className="text-xs">Download files</span>
							</a>
						)}
					</div>
				</header>

				{automation.coverImage && (
					<div className="mb-16 overflow-hidden border border-white/10 bg-white/[0.02]">
						<img
							alt={automation.title}
							className="h-auto w-full object-cover"
							src={automation.coverImage}
						/>
					</div>
				)}

				<article className="prose prose-invert prose-headings:uppercase prose-headings:tracking-tight mx-auto w-full max-w-3xl">
					<BlogContent content={automation.content} />
				</article>

				{related.length > 0 && (
					<section className="mt-24 border-white/10 border-t pt-16">
						<p className="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
							// Related playbooks
						</p>
						<div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{related.map((a) => (
								<Link
									className="group flex flex-col border border-white/10 bg-neutral-950 p-5 transition-colors hover:border-white/30"
									key={a.slug}
									to={`/${a.slug}`}
								>
									{a.tags[0] && (
										<span className="font-mono text-[10px] text-white/50 uppercase tracking-[0.35em]">
											// {a.tags[0].name}
										</span>
									)}
									<h3 className="mt-2 font-bold text-base uppercase tracking-tight">
										{a.title}
									</h3>
									{a.excerpt && (
										<p className="mt-2 line-clamp-2 flex-1 text-sm text-white/55">
											{a.excerpt}
										</p>
									)}
									<span className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] text-white/50 uppercase tracking-[0.35em] group-hover:text-white">
										Read
										<ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
									</span>
								</Link>
							))}
						</div>
					</section>
				)}
			</main>

			<SubdomainFooter />
			<Noise patternAlpha={15} patternRefreshInterval={4} />
		</div>
	);
}

export default AutomationDetailPage;
