import { useQuery } from "@tanstack/react-query";
import { useHead } from "@unhead/react";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Noise from "../../components/noise";
import type { AutomationSummary } from "../../components/automations/automation-card";

async function fetchAutomations(): Promise<{
	automations: AutomationSummary[];
}> {
	const res = await fetch("/api/automations");
	if (!res.ok) throw new Error("Failed to load automations");
	return res.json();
}

export function AutomationsIndexPage() {
	const [search, setSearch] = useState("");

	useHead({
		title: "Dakik Flow — Automation playbooks",
		meta: [
			{
				name: "description",
				content:
					"Ready-to-use automation playbooks built and maintained by Dakik Studio.",
			},
		],
	});

	const { data, isLoading } = useQuery({
		queryKey: ["automations", "list"],
		queryFn: fetchAutomations,
	});

	const filtered = useMemo(() => {
		const items = data?.automations ?? [];
		if (!search) return items;
		const q = search.toLowerCase();
		return items.filter(
			(a) =>
				a.title.toLowerCase().includes(q) ||
				(a.excerpt ?? "").toLowerCase().includes(q),
		);
	}, [data, search]);

	return (
		<div className="relative min-h-screen overflow-hidden bg-black text-white">
			<header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-[clamp(1.5rem,5vw,4rem)] pt-10">
				<div className="flex items-center gap-3">
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
				</div>
				<a
					className="group inline-flex items-center gap-2 font-mono text-[11px] text-white/55 uppercase tracking-[0.35em] transition-colors hover:text-white"
					href="https://dakik.co.uk"
				>
					<ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
					Dakik.co.uk
				</a>
			</header>

			<main className="relative z-10 mx-auto max-w-7xl px-[clamp(1.5rem,5vw,4rem)] pt-16 pb-20">
				<section className="mb-12 max-w-3xl">
					<p className="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
						// Automation playbooks
					</p>
					<h1 className="mt-4 font-black text-[clamp(3rem,10vw,8rem)] uppercase leading-[0.85] tracking-[-0.04em]">
						Flow.
					</h1>
					<p className="mt-6 max-w-[52ch] text-base text-white/70 leading-snug sm:text-lg">
						Drop-in automations for marketing, onboarding, finance, and ops.
						Built and maintained by Dakik Studio.
					</p>
				</section>

				<div className="mb-10 flex max-w-md items-center gap-3 border-2 border-white/20 px-4 py-3 transition-colors focus-within:border-white">
					<Search className="h-4 w-4 text-white/40" />
					<input
						className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search playbooks…"
						value={search}
					/>
				</div>

				{isLoading && (
					<p className="font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
						// Loading playbooks…
					</p>
				)}

				{!isLoading && (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{filtered.map((a) => (
							<AutomationTile automation={a} key={a.slug} />
						))}
					</div>
				)}

				{!isLoading && filtered.length === 0 && (
					<p className="font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
						// Nothing matches "{search}"
					</p>
				)}
			</main>

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

			<Noise patternAlpha={15} patternRefreshInterval={4} />
		</div>
	);
}

function AutomationTile({ automation }: { automation: AutomationSummary }) {
	return (
		<Link
			className="group flex flex-col border border-white/10 bg-neutral-950 transition-colors hover:border-white/30"
			to={`/${automation.slug}`}
		>
			{automation.coverImage && (
				<div className="aspect-[16/10] overflow-hidden border-white/10 border-b bg-white/[0.02]">
					<img
						alt={automation.title}
						className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
						src={automation.coverImage}
					/>
				</div>
			)}
			<div className="flex flex-1 flex-col p-5">
				{automation.tags[0] && (
					<span className="font-mono text-[10px] text-white/50 uppercase tracking-[0.35em]">
						// {automation.tags[0].name}
					</span>
				)}
				<h3 className="mt-2 font-bold text-base uppercase tracking-tight">
					{automation.title}
				</h3>
				{automation.excerpt && (
					<p className="mt-2 line-clamp-2 flex-1 text-sm text-white/55">
						{automation.excerpt}
					</p>
				)}
				<span className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] text-white/50 uppercase tracking-[0.35em] transition-colors group-hover:text-white">
					Read playbook
					<ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
				</span>
			</div>
		</Link>
	);
}

export default AutomationsIndexPage;
