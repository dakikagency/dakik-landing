import { useQuery } from "@tanstack/react-query";
import { useHead } from "@unhead/react";
import { ArrowLeft, Check, Copy, Search } from "lucide-react";
import { useMemo, useState } from "react";
import Noise from "../components/noise";

interface Icon {
	id: string;
	name: string;
	slug: string;
	category: string;
	svgContent: string;
}

async function fetchIcons(): Promise<{ icons: Icon[] }> {
	const res = await fetch("/api/icons?limit=2000");
	if (!res.ok) throw new Error("Failed to load icons");
	return res.json();
}

function svgToDataUri(svg: string): string {
	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function IconTile({ icon }: { icon: Icon }) {
	const [copied, setCopied] = useState(false);
	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(icon.svgContent);
			setCopied(true);
			setTimeout(() => setCopied(false), 1200);
		} catch {
			setCopied(false);
		}
	};
	return (
		<button
			className="group relative flex aspect-square items-center justify-center border border-white/10 bg-transparent transition-colors hover:border-white hover:bg-white"
			onClick={handleCopy}
			title={icon.name}
			type="button"
		>
			<img
				alt={icon.name}
				className="h-7 w-7 invert transition-[filter] group-hover:invert-0"
				src={svgToDataUri(icon.svgContent)}
			/>
			<span className="pointer-events-none absolute right-1.5 bottom-1.5 font-mono text-[8px] text-white/0 uppercase tracking-[0.2em] group-hover:text-black/60">
				{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
			</span>
		</button>
	);
}

export function DaiconsPage() {
	const [search, setSearch] = useState("");

	useHead({
		title: "Dakik Icons — Free SVG icon set",
		meta: [
			{
				name: "description",
				content:
					"A free, curated SVG icon set crafted for product UI. Search, click to copy, drop into your project.",
			},
		],
	});

	const { data, isLoading } = useQuery({
		queryKey: ["icons"],
		queryFn: fetchIcons,
	});
	const icons = data?.icons ?? [];

	const filtered = useMemo(() => {
		if (!search) return icons;
		const q = search.toLowerCase();
		return icons.filter(
			(i) =>
				i.name.toLowerCase().includes(q) ||
				i.category.toLowerCase().includes(q),
		);
	}, [icons, search]);

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
							// Icons
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
						// Free SVG set
					</p>
					<h1 className="mt-4 font-black text-[clamp(3rem,10vw,8rem)] uppercase leading-[0.85] tracking-[-0.04em]">
						Icons.
					</h1>
					<p className="mt-6 max-w-[52ch] text-base text-white/70 leading-snug sm:text-lg">
						A curated SVG set built for product UI. Click any tile to copy its
						SVG. MIT-licensed, drop them anywhere.
					</p>
				</section>

				<div className="mb-8 flex max-w-md items-center gap-3 border-2 border-white/20 px-4 py-3 transition-colors focus-within:border-white">
					<Search className="h-4 w-4 text-white/40" />
					<input
						className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by name or category…"
						value={search}
					/>
					<span className="font-mono text-[10px] text-white/40 uppercase tracking-[0.25em] tabular-nums">
						{filtered.length}
					</span>
				</div>

				{isLoading && (
					<p className="font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
						// Loading icons…
					</p>
				)}

				{!isLoading && (
					<div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
						{filtered.map((i) => (
							<IconTile icon={i} key={i.slug} />
						))}
					</div>
				)}

				{!isLoading && filtered.length === 0 && (
					<p className="mt-10 font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
						// Nothing matches "{search}"
					</p>
				)}

				<section className="mt-20 border-white/10 border-t pt-10">
					<p className="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
						// Usage
					</p>
					<p className="mt-4 max-w-[60ch] text-base text-white/70 leading-snug">
						Click an icon to copy its SVG to your clipboard. Paste into JSX, an
						SVG sprite, or save as a file. Set <code className="font-mono text-white/90">fill="currentColor"</code> in your usage to inherit color.
					</p>
				</section>
			</main>

			<footer className="relative z-10 mx-auto flex max-w-7xl items-center justify-between border-white/10 border-t px-[clamp(1.5rem,5vw,4rem)] py-8">
				<span className="font-mono text-[10px] text-white/40 uppercase tracking-[0.35em]">
					// Dakik Icons · MIT
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

export default DaiconsPage;
