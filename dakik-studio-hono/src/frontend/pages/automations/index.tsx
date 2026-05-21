import { useQuery } from "@tanstack/react-query";
import { useHead } from "@unhead/react";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
	AutomationCard,
	type AutomationSummary,
} from "../../components/automations/automation-card";
import { Footer } from "../../components/landing/footer";
import { Navbar } from "../../components/landing/navbar";

async function fetchAutomations(): Promise<{ automations: AutomationSummary[] }> {
	const res = await fetch("/api/automations");
	if (!res.ok) throw new Error("Failed to load automations");
	return res.json();
}

export function AutomationsIndexPage() {
	const [search, setSearch] = useState("");

	useHead({
		title: "Automations · Dakik Studio",
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
		<div className="min-h-screen bg-white">
			<Navbar />
			<main className="mx-auto max-w-7xl px-6 pt-32 pb-24 lg:px-10">
				<header className="mb-12 max-w-3xl">
					<span className="font-semibold text-gray-400 text-xs uppercase tracking-widest">
						Automations
					</span>
					<h1 className="mt-3 font-bold text-4xl tracking-tight sm:text-5xl lg:text-6xl">
						Pre-built playbooks
					</h1>
					<p className="mt-5 text-gray-500 text-lg leading-relaxed">
						Drop-in automations for marketing, onboarding, finance, and ops.
					</p>
				</header>

				<div className="mb-10 flex max-w-md items-center gap-3 rounded-full border border-gray-200 px-4 py-2.5">
					<Search className="h-4 w-4 text-gray-400" />
					<input
						className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search automations..."
						value={search}
					/>
				</div>

				{isLoading && <p className="text-gray-500">Loading...</p>}

				<div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
					{filtered.map((a) => (
						<AutomationCard automation={a} key={a.slug} />
					))}
				</div>

				{!isLoading && filtered.length === 0 && (
					<p className="text-gray-500">No automations match your search.</p>
				)}
			</main>
			<Footer />
		</div>
	);
}

export default AutomationsIndexPage;
