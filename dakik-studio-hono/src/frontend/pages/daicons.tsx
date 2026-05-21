import { useQuery } from "@tanstack/react-query";
import { useHead } from "@unhead/react";
import { Check, Copy, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Footer } from "../components/landing/footer";
import { Navbar } from "../components/landing/navbar";

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
			className="group relative flex aspect-square items-center justify-center rounded-xl border border-gray-100 transition hover:border-gray-300"
			onClick={handleCopy}
			title={icon.name}
			type="button"
		>
			<img
				alt={icon.name}
				className="h-7 w-7"
				src={svgToDataUri(icon.svgContent)}
			/>
			<span className="pointer-events-none absolute bottom-2 right-2 text-gray-400 opacity-0 transition group-hover:opacity-100">
				{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
			</span>
		</button>
	);
}

export function DaiconsPage() {
	const [search, setSearch] = useState("");

	useHead({
		title: "daIcons · Dakik Studio",
		meta: [
			{
				name: "description",
				content:
					"daIcons — a curated icon set crafted for product UI. Search, copy, and drop into your project.",
			},
		],
	});

	const { data, isLoading } = useQuery({ queryKey: ["icons"], queryFn: fetchIcons });
	const icons = data?.icons ?? [];

	const filtered = useMemo(() => {
		if (!search) return icons;
		const q = search.toLowerCase();
		return icons.filter((i) => i.name.toLowerCase().includes(q));
	}, [icons, search]);

	return (
		<div className="min-h-screen bg-white">
			<Navbar />
			<main className="mx-auto max-w-7xl px-6 pt-32 pb-24 lg:px-10">
				<header className="mb-10 max-w-3xl">
					<span className="font-semibold text-gray-400 text-xs uppercase tracking-widest">Icons</span>
					<h1 className="mt-3 font-bold text-4xl tracking-tight sm:text-5xl">daIcons</h1>
					<p className="mt-5 text-gray-500 text-lg leading-relaxed">
						A curated SVG icon set crafted for product UI. Click any tile to copy its SVG markup.
					</p>
				</header>

				<div className="mb-8 flex max-w-md items-center gap-3 rounded-full border border-gray-200 px-4 py-2.5">
					<Search className="h-4 w-4 text-gray-400" />
					<input
						className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search icons..."
						value={search}
					/>
				</div>

				{isLoading && <p className="text-gray-500">Loading...</p>}

				<div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
					{filtered.map((i) => (
						<IconTile icon={i} key={i.slug} />
					))}
				</div>

				{!isLoading && filtered.length === 0 && (
					<p className="text-gray-500">No icons match your search.</p>
				)}

				<section className="mt-20 rounded-2xl bg-gray-50 p-8">
					<h2 className="mb-3 font-bold text-xl tracking-tight">Usage</h2>
					<p className="text-gray-500 text-sm leading-relaxed">
						Click an icon to copy its SVG. Paste directly into your JSX, drop into an SVG sprite,
						or save as a file. Icons are MIT-licensed.
					</p>
				</section>
			</main>
			<Footer />
		</div>
	);
}

export default DaiconsPage;
