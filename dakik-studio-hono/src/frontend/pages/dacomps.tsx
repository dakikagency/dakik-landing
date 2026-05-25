import { useQuery } from "@tanstack/react-query";
import { useHead } from "@unhead/react";
import { ArrowLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";
import Noise from "../components/noise";
import { cn } from "../lib/utils";

interface ComponentDoc {
	id: string;
	slug: string;
	name: string;
	category: string;
	description?: string | null;
	preview?: string | null;
}

async function fetchComponents(): Promise<{
	components: ComponentDoc[];
	total: number;
}> {
	const res = await fetch("/api/components?limit=200");
	if (!res.ok) throw new Error("Failed to load components");
	return res.json();
}

export function DacompsPage() {
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<string | null>(null);

	useHead({
		title: "Dakik Bits — React component library",
		meta: [
			{
				name: "description",
				content:
					"A curated component library by Dakik Studio. Browse production-ready React components with code, props, and previews.",
			},
		],
	});

	const { data, isLoading } = useQuery({
		queryKey: ["components"],
		queryFn: fetchComponents,
	});

	const components = data?.components ?? [];
	const categories = useMemo(() => {
		const set = new Set(components.map((c) => c.category));
		return Array.from(set).sort();
	}, [components]);

	const filtered = useMemo(() => {
		return components.filter((c) => {
			if (category && c.category !== category) return false;
			if (!search) return true;
			const q = search.toLowerCase();
			return (
				c.name.toLowerCase().includes(q) ||
				(c.description ?? "").toLowerCase().includes(q)
			);
		});
	}, [components, category, search]);

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
							// Bits
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
						// React components
					</p>
					<h1 className="mt-4 font-black text-[clamp(3rem,10vw,8rem)] uppercase leading-[0.85] tracking-[-0.04em]">
						Bits.
					</h1>
					<p className="mt-6 max-w-[52ch] text-base text-white/70 leading-snug sm:text-lg">
						Production-ready React components with code, props, and previews.
						Drop them in and ship.
					</p>
				</section>

				<div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
					<aside className="space-y-6">
						<div className="flex items-center gap-3 border-2 border-white/20 px-4 py-3 transition-colors focus-within:border-white">
							<Search className="h-4 w-4 text-white/40" />
							<input
								className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search…"
								value={search}
							/>
						</div>

						<div>
							<p className="mb-3 font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
								// Categories
							</p>
							<nav className="flex flex-col gap-1">
								<button
									className={cn(
										"text-left font-mono text-[11px] uppercase tracking-[0.25em] transition-colors",
										category === null
											? "text-white"
											: "text-white/50 hover:text-white",
									)}
									onClick={() => setCategory(null)}
									type="button"
								>
									{category === null && (
										<span className="mr-2 text-white">●</span>
									)}
									All ({components.length})
								</button>
								{categories.map((c) => (
									<button
										className={cn(
											"text-left font-mono text-[11px] uppercase tracking-[0.25em] transition-colors",
											category === c
												? "text-white"
												: "text-white/50 hover:text-white",
										)}
										key={c}
										onClick={() => setCategory(c)}
										type="button"
									>
										{category === c && (
											<span className="mr-2 text-white">●</span>
										)}
										{c}
									</button>
								))}
							</nav>
						</div>
					</aside>

					<section>
						{isLoading && (
							<p className="font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
								// Loading components…
							</p>
						)}

						{!isLoading && (
							<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
								{filtered.map((c) => (
									<article
										className="group relative flex flex-col border border-white/10 bg-neutral-950 transition-colors hover:border-white/30"
										key={c.slug}
									>
										<div className="aspect-[4/3] overflow-hidden border-white/10 border-b bg-white/[0.02]">
											{c.preview && (
												<img
													alt={c.name}
													className="h-full w-full object-cover"
													src={c.preview}
												/>
											)}
										</div>
										<div className="flex-1 p-5">
											<span className="font-mono text-[10px] text-white/50 uppercase tracking-[0.35em]">
												// {c.category}
											</span>
											<h3 className="mt-2 font-bold text-base uppercase tracking-tight">
												{c.name}
											</h3>
											{c.description && (
												<p className="mt-2 line-clamp-2 text-sm text-white/55">
													{c.description}
												</p>
											)}
										</div>
									</article>
								))}
							</div>
						)}

						{!isLoading && filtered.length === 0 && (
							<p className="font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
								// Nothing matches your filters
							</p>
						)}
					</section>
				</div>
			</main>

			<footer className="relative z-10 mx-auto flex max-w-7xl items-center justify-between border-white/10 border-t px-[clamp(1.5rem,5vw,4rem)] py-8">
				<span className="font-mono text-[10px] text-white/40 uppercase tracking-[0.35em]">
					// Dakik Bits · MIT
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

export default DacompsPage;
