import { useQuery } from "@tanstack/react-query";
import { useHead } from "@unhead/react";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Footer } from "../components/landing/footer";
import { Navbar } from "../components/landing/navbar";

interface ComponentDoc {
	id: string;
	slug: string;
	name: string;
	category: string;
	description?: string | null;
	preview?: string | null;
}

async function fetchComponents(): Promise<{ components: ComponentDoc[]; total: number }> {
	const res = await fetch("/api/components?limit=100");
	if (!res.ok) throw new Error("Failed to load components");
	return res.json();
}

export function DacompsPage() {
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<string | null>(null);

	useHead({
		title: "daComps · Dakik Studio",
		meta: [
			{
				name: "description",
				content:
					"daComps — a curated component library by Dakik Studio. Browse production-ready React components with code, props, and previews.",
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
		<div className="min-h-screen bg-white">
			<Navbar />
			<main className="mx-auto grid max-w-7xl gap-10 px-6 pt-32 pb-24 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-10">
				<aside>
					<h1 className="mb-2 font-bold text-2xl tracking-tight">daComps</h1>
					<p className="mb-6 text-gray-500 text-sm">A library of production-ready React components.</p>

					<div className="mb-6 flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2">
						<Search className="h-4 w-4 text-gray-400" />
						<input
							className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search..."
							value={search}
						/>
					</div>

					<nav className="flex flex-col gap-1 text-sm">
						<button
							className={`text-left ${category === null ? "font-medium text-black" : "text-gray-500 hover:text-black"}`}
							onClick={() => setCategory(null)}
							type="button"
						>
							All
						</button>
						{categories.map((c) => (
							<button
								className={`text-left ${category === c ? "font-medium text-black" : "text-gray-500 hover:text-black"}`}
								key={c}
								onClick={() => setCategory(c)}
								type="button"
							>
								{c}
							</button>
						))}
					</nav>
				</aside>

				<section>
					{isLoading && <p className="text-gray-500">Loading...</p>}

					<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
						{filtered.map((c) => (
							<article
								className="group relative overflow-hidden rounded-2xl border border-gray-100 transition hover:shadow-md"
								key={c.slug}
							>
								<div className="aspect-[4/3] bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.06)_1px,transparent_0)] [background-size:18px_18px]">
									{c.preview && (
										<img
											alt={c.name}
											className="h-full w-full object-cover"
											src={c.preview}
										/>
									)}
								</div>
								<div className="border-gray-100 border-t p-5">
									<span className="font-medium text-gray-400 text-xs uppercase tracking-widest">
										{c.category}
									</span>
									<h3 className="mt-2 font-semibold text-base leading-tight">{c.name}</h3>
									{c.description && (
										<p className="mt-2 line-clamp-2 text-gray-500 text-sm">{c.description}</p>
									)}
								</div>
							</article>
						))}
					</div>

					{!isLoading && filtered.length === 0 && (
						<p className="text-gray-500">No components match your filters.</p>
					)}
				</section>
			</main>
			<Footer />
		</div>
	);
}

export default DacompsPage;
