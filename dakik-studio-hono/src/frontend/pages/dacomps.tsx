import { useQuery } from "@tanstack/react-query";
import { useHead } from "@unhead/react";
import { ArrowLeft, Check, Copy, Search } from "lucide-react";
import { useMemo, useState } from "react";
import Noise from "../components/noise";
import { DakikMark } from "../components/shared/dakik-mark";
import { cn } from "../lib/utils";

/** One entry from the Dakik Bits shadcn registry index (`/registry.json`). */
interface RegistryItem {
	name: string;
	type: string;
	title?: string;
	description?: string;
	categories?: string[];
}

interface RegistryIndex {
	name: string;
	homepage: string;
	items: RegistryItem[];
}

async function fetchRegistry(): Promise<RegistryIndex> {
	const res = await fetch("/registry.json");
	if (!res.ok) throw new Error("Failed to load registry");
	return res.json();
}

const installCmd = (name: string) => `npx shadcn add @dakik/${name}`;

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);
	return (
		<button
			aria-label="Copy install command"
			className="shrink-0 text-white/40 transition-colors hover:text-white"
			onClick={async () => {
				try {
					await navigator.clipboard.writeText(text);
					setCopied(true);
					setTimeout(() => setCopied(false), 1200);
				} catch {
					/* clipboard unavailable */
				}
			}}
			type="button"
		>
			{copied ? (
				<Check className="size-3.5 text-emerald-400" />
			) : (
				<Copy className="size-3.5" />
			)}
		</button>
	);
}

export function DacompsPage() {
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<string | null>(null);

	useHead({
		title: "Dakik Bits — React component registry",
		meta: [
			{
				name: "description",
				content:
					"A shadcn registry of production-ready React components by Dakik Studio. Install any component with the shadcn CLI.",
			},
		],
	});

	const { data, isLoading } = useQuery({
		queryKey: ["registry"],
		queryFn: fetchRegistry,
	});

	const items = data?.items ?? [];
	const categories = useMemo(() => {
		const set = new Set(items.map((c) => c.categories?.[0] ?? "Components"));
		return Array.from(set).sort();
	}, [items]);

	const filtered = useMemo(() => {
		return items.filter((c) => {
			if (category && (c.categories?.[0] ?? "Components") !== category) return false;
			if (!search) return true;
			const q = search.toLowerCase();
			return (
				c.name.toLowerCase().includes(q) ||
				(c.title ?? "").toLowerCase().includes(q) ||
				(c.description ?? "").toLowerCase().includes(q)
			);
		});
	}, [items, category, search]);

	return (
		<div className="relative min-h-screen overflow-hidden bg-black text-white">
			<header className="relative z-10 mx-auto flex items-center justify-between px-[clamp(1rem,5vw,4rem)] pt-10">
				<div className="flex items-center gap-3">
					<DakikMark className="h-9 w-auto shrink-0" />
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

			<main className="relative z-10 mx-auto px-[clamp(1rem,5vw,4rem)] pt-16 pb-20">
				<section className="mb-12 max-w-3xl">
					<p className="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
						// shadcn registry
					</p>
					<h1 className="mt-4 font-black text-[clamp(3rem,10vw,8rem)] uppercase leading-[0.85] tracking-[-0.04em]">
						Bits.
					</h1>
					<p className="mt-6 max-w-[52ch] text-base text-white/70 leading-snug sm:text-lg">
						Production-ready React components, installable straight from the
						shadcn CLI. Drop them in and ship.
					</p>
					<div className="mt-6 inline-flex items-center gap-3 border border-white/15 bg-white/[0.03] px-4 py-2.5">
						<code className="font-mono text-[12px] text-white/80">
							npx shadcn add @dakik/button
						</code>
						<CopyButton text={installCmd("button")} />
					</div>
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
									{category === null && <span className="mr-2 text-white">●</span>}
									All ({items.length})
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
										{category === c && <span className="mr-2 text-white">●</span>}
										{c}
									</button>
								))}
							</nav>
						</div>
					</aside>

					<section>
						{isLoading && (
							<p className="font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
								// Loading registry…
							</p>
						)}

						{!isLoading && (
							<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
								{filtered.map((c) => (
									<article
										className="group relative flex flex-col border border-white/10 bg-neutral-950 p-5 transition-colors hover:border-white/30"
										key={c.name}
									>
										<div className="min-w-0">
											<span className="font-mono text-[10px] text-white/50 uppercase tracking-[0.35em]">
												// {c.categories?.[0] ?? "Components"}
											</span>
											<h3 className="mt-2 font-bold text-base uppercase tracking-tight">
												{c.title ?? c.name}
											</h3>
										</div>

										{c.description && (
											<p className="mt-2 line-clamp-2 flex-1 text-sm text-white/55">
												{c.description}
											</p>
										)}

										<div className="mt-4 flex items-center gap-2 border border-white/10 bg-black/40 px-3 py-2">
											<code className="flex-1 truncate font-mono text-[11px] text-white/70">
												npx shadcn add @dakik/{c.name}
											</code>
											<CopyButton text={installCmd(c.name)} />
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

			<footer className="relative z-10 mx-auto flex items-center justify-between border-white/10 border-t px-[clamp(1rem,5vw,4rem)] py-8">
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
