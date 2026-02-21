"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Layers, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ComponentViewer } from "@/components/dacomps/component-viewer";
import { Footer, Navbar } from "@/components/landing";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

interface ComponentDoc {
	id: string;
	name: string;
	slug: string;
	category: string;
	description: string | null;
	props: unknown;
	code: string;
	preview: string | null;
	published: boolean;
}

export default function DaCompsPage() {
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [selectedComponent, setSelectedComponent] =
		useState<ComponentDoc | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	const { data } = useQuery(
		trpc.components.list.queryOptions({
			page: 1,
			limit: 50,
			search: searchQuery || undefined,
			category: selectedCategory === "all" ? undefined : selectedCategory,
		})
	);

	const components = useMemo(() => data?.components ?? [], [data]);

	const categories = [
		{ name: "All", slug: "all", count: components.length },
		...Array.from(new Set(components.map((c) => c.category))).map((cat) => ({
			name: cat,
			slug: cat.toLowerCase().replace(" ", "-"),
			count: components.filter((c) => c.category === cat).length,
		})),
	];

	const filteredComponents =
		selectedCategory === "all"
			? components
			: components.filter(
					(c) => c.category.toLowerCase().replace(" ", "-") === selectedCategory
				);

	const handleSelectComponent = (component: ComponentDoc) => {
		setSelectedComponent(component);
	};

	const handleCategoryChange = (categorySlug: string) => {
		setSelectedCategory(categorySlug);
		setSelectedComponent(null);
	};

	const displayComponents: ComponentDoc[] = searchQuery
		? components.filter(
				(c) =>
					c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					c.description?.toLowerCase().includes(searchQuery.toLowerCase())
			)
		: filteredComponents;

	const initialComponent: ComponentDoc | null =
		selectedComponent ??
		(displayComponents.length > 0 ? displayComponents[0] : null);

	return (
		<>
			<Navbar />
			<main className="relative min-h-screen bg-background pt-20 text-foreground">
				<div className="relative z-10 mx-auto w-full max-w-screen-2xl px-[clamp(1rem,5vw,4rem)]">
					<section className="border-border/60 border-b pt-8 pb-10 lg:pt-12 lg:pb-16">
						<div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
							<div className="max-w-2xl">
								<div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
									<Layers className="size-3" />
									<span>Component Library</span>
								</div>
								<h1 className="mt-4 font-black font-display text-4xl uppercase leading-[0.85] tracking-[-0.02em] lg:text-6xl">
									daComps
								</h1>
								<p className="mt-4 text-foreground/80 text-lg leading-relaxed lg:text-xl">
									Curated UI building blocks with clear usage guidance, built
									for the Dakik Studio ecosystem.
								</p>
							</div>
							<div className="flex w-full items-center gap-3 lg:w-auto">
								<div className="relative w-full lg:w-72">
									<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										className="h-11 w-full rounded-full border-border/70 bg-transparent pl-10 text-sm"
										onChange={(e) => setSearchQuery(e.target.value)}
										placeholder="Search components..."
										type="search"
										value={searchQuery}
									/>
								</div>
								<Link
									className="hidden whitespace-nowrap rounded-full border border-foreground/40 px-4 py-2 font-medium text-xs uppercase tracking-[0.2em] transition-colors hover:border-foreground hover:text-foreground lg:inline-flex"
									href="/dacomps"
								>
									Browse
								</Link>
							</div>
						</div>
					</section>

					<section className="grid gap-8 py-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12 lg:py-14">
						<aside className="order-2 lg:order-1">
							<nav className="lg:sticky lg:top-28">
								<div className="mb-6">
									<h3 className="mb-3 text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
										Categories
									</h3>
									<div className="flex flex-col gap-1">
										{categories.map((category) => (
											<button
												className={cn(
													"flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all",
													selectedCategory === category.slug
														? "bg-muted/50 font-medium text-foreground"
														: "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
												)}
												key={category.slug}
												onClick={() => handleCategoryChange(category.slug)}
												type="button"
											>
												<span>{category.name}</span>
												<span
													className={cn(
														"rounded-full px-2 py-0.5 text-[10px]",
														selectedCategory === category.slug
															? "bg-foreground/10 text-foreground"
															: "bg-muted text-muted-foreground"
													)}
												>
													{category.count}
												</span>
											</button>
										))}
									</div>
								</div>

								<div className="border-border/60 border-t pt-6">
									<h3 className="mb-3 text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
										Components
									</h3>
									{displayComponents.length === 0 ? (
										<p className="text-muted-foreground text-sm">
											No components found.
										</p>
									) : (
										<div className="flex flex-col gap-1">
											{displayComponents.map((component) => (
												<button
													className={cn(
														"flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all",
														initialComponent?.slug === component.slug
															? "bg-muted/50 font-medium text-foreground"
															: "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
													)}
													key={component.slug}
													onClick={() => handleSelectComponent(component)}
													type="button"
												>
													<ChevronRight
														className={cn(
															"size-3 transition-transform",
															initialComponent?.slug === component.slug &&
																"rotate-90"
														)}
													/>
													{component.name}
												</button>
											))}
										</div>
									)}
								</div>
							</nav>
						</aside>

						<div className="order-1 lg:order-2">
							{initialComponent ? (
								<div className="space-y-6">
									<nav className="flex items-center gap-2 text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
										<span>Components</span>
										<ChevronRight className="size-3" />
										<span>{initialComponent.category}</span>
										<ChevronRight className="size-3" />
										<span className="text-foreground">
											{initialComponent.name}
										</span>
									</nav>
									<div className="rounded-2xl border border-border/60 bg-background/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] lg:p-8">
										<ComponentViewer component={initialComponent} />
									</div>
								</div>
							) : (
								<div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-muted/20 py-16 text-center">
									<p className="text-lg text-muted-foreground">
										No components available yet.
									</p>
									<p className="text-muted-foreground text-sm">
										Check back later or add components through the admin panel.
									</p>
								</div>
							)}
						</div>
					</section>
				</div>

				<div className="pointer-events-none absolute top-0 right-[clamp(1rem,5vw,4rem)] bottom-0 left-[clamp(1rem,5vw,4rem)]">
					<div className="absolute top-0 bottom-0 left-0 w-0.5 bg-linear-to-b from-transparent via-gray-800/10 to-transparent" />
					<div className="absolute top-0 bottom-0 left-1/8 hidden w-0.5 bg-linear-to-b from-transparent via-gray-800/10 to-transparent lg:flex" />
					<div className="absolute top-0 bottom-0 left-2/8 w-0.5 bg-linear-to-b from-transparent via-gray-800/10 to-transparent" />
					<div className="absolute top-0 bottom-0 left-3/8 hidden w-0.5 bg-linear-to-b from-transparent via-gray-800/10 to-transparent lg:flex" />
					<div className="absolute top-0 bottom-0 left-4/8 w-0.5 bg-linear-to-b from-transparent via-gray-800/10 to-transparent" />
					<div className="absolute top-0 bottom-0 left-5/8 hidden w-0.5 bg-linear-to-b from-transparent via-gray-800/10 to-transparent lg:flex" />
					<div className="absolute top-0 bottom-0 left-6/8 w-0.5 bg-linear-to-b from-transparent via-gray-800/10 to-transparent" />
					<div className="absolute top-0 bottom-0 left-7/8 hidden w-0.5 bg-linear-to-b from-transparent via-gray-800/10 to-transparent lg:flex" />
					<div className="absolute top-0 bottom-0 left-full w-0.5 bg-linear-to-b from-transparent via-gray-800/10 to-transparent" />
				</div>
			</main>
			<Footer />
		</>
	);
}
