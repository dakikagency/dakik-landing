"use client";

import { ChevronRight, Layers, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ComponentViewer } from "@/components/dacomps/component-viewer";
import { Navbar } from "@/components/landing";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

const COMPONENT_DATA: ComponentDoc[] = [
	{
		id: "1",
		name: "Button",
		slug: "button",
		category: "Forms",
		description:
			"A versatile button component with multiple variants and sizes.",
		props: [
			{
				name: "variant",
				type: '"default" | "outline" | "secondary" | "ghost" | "destructive" | "link"',
				default: '"default"',
				description: "The visual style variant of the button",
			},
			{
				name: "size",
				type: '"default" | "xs" | "sm" | "lg" | "icon"',
				default: '"default"',
				description: "The size of the button",
			},
		],
		code: `import { Button } from "@/components/ui/button";

export function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
    </div>
  );
}`,
		preview:
			'<div class="flex flex-wrap items-center gap-4"><button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">Default</button><button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">Outline</button></div>',
		published: true,
	},
	{
		id: "2",
		name: "Input",
		slug: "input",
		category: "Forms",
		description:
			"A text input component with consistent styling and validation states.",
		props: [
			{
				name: "type",
				type: "string",
				default: '"text"',
				description: "The type of the input",
			},
			{
				name: "placeholder",
				type: "string",
				description: "Placeholder text",
			},
		],
		code: `import { Input } from "@/components/ui/input";

export function InputDemo() {
  return <Input placeholder="Enter text..." />;
}`,
		preview:
			'<div class="flex w-full max-w-sm flex-col gap-1.5"><input class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" placeholder="Enter text..." type="text"></div>',
		published: true,
	},
	{
		id: "3",
		name: "Card",
		slug: "card",
		category: "Data Display",
		description: "A flexible card component for grouping related content.",
		props: [
			{
				name: "className",
				type: "string",
				description: "Additional CSS classes",
			},
		],
		code: `import { Card, CardContent } from "@/components/ui/card";

export function CardDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardContent className="pt-6">
        <p>Card content goes here.</p>
      </CardContent>
    </Card>
  );
}`,
		preview:
			'<div class="relative flex w-full min-w-[280px] max-w-sm flex-col rounded-xl border border-border bg-card text-card-foreground shadow-sm"><div class="flex flex-col space-y-1.5 p-6"><h3 class="font-semibold leading-none tracking-tight text-lg">Card Title</h3></div><div class="p-6 pt-0"><p class="text-sm text-muted-foreground">Card content goes here.</p></div></div>',
		published: true,
	},
];

export default function DaCompsPage() {
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [selectedComponent, setSelectedComponent] =
		useState<ComponentDoc | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	const components = COMPONENT_DATA;

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

	const displayComponents = searchQuery
		? components.filter(
				(c) =>
					c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					c.description?.toLowerCase().includes(searchQuery.toLowerCase())
			)
		: filteredComponents;

	const initialComponent = selectedComponent ?? displayComponents[0] ?? null;

	return (
		<>
			<Navbar />
			<div className="flex min-h-screen flex-col bg-background pt-16">
				<header className="sticky top-16 z-40 border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="mx-auto flex h-14 max-w-screen-2xl items-center px-6">
						<Link className="flex items-center gap-2" href="/dacomps">
							<Layers className="size-5" />
							<span className="font-display font-semibold tracking-tight">
								daComps
							</span>
						</Link>
						<div className="ml-auto flex items-center gap-4">
							<div className="relative">
								<Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									className="w-64 pl-9"
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search components..."
									type="search"
									value={searchQuery}
								/>
							</div>
						</div>
					</div>
				</header>

				<div className="mx-auto flex w-full max-w-screen-2xl flex-1">
					<aside className="hidden w-64 shrink-0 border-border border-r lg:block">
						<nav className="sticky top-[7.5rem] flex flex-col gap-1 p-4">
							<h3 className="mb-2 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
								Categories
							</h3>
							{categories.map((category) => (
								<button
									className={cn(
										"flex items-center justify-between rounded-none px-2 py-1.5 text-sm transition-colors",
										selectedCategory === category.slug
											? "bg-muted font-medium text-foreground"
											: "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
									)}
									key={category.slug}
									onClick={() => handleCategoryChange(category.slug)}
									type="button"
								>
									<span>{category.name}</span>
									<span
										className={cn(
											"rounded-none px-1.5 py-0.5 text-xs",
											selectedCategory === category.slug
												? "bg-foreground/10"
												: "bg-muted"
										)}
									>
										{category.count}
									</span>
								</button>
							))}

							<div className="my-4 border-border border-t" />

							<h3 className="mb-2 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
								Components
							</h3>
							{displayComponents.length === 0 ? (
								<p className="px-2 text-muted-foreground text-sm">
									No components found.
								</p>
							) : (
								displayComponents.map((component) => (
									<button
										className={cn(
											"flex items-center gap-2 rounded-none px-2 py-1.5 text-left text-sm transition-colors",
											initialComponent?.slug === component.slug
												? "bg-muted font-medium text-foreground"
												: "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
										)}
										key={component.slug}
										onClick={() => handleSelectComponent(component)}
										type="button"
									>
										<ChevronRight
											className={cn(
												"size-3 transition-transform",
												initialComponent?.slug === component.slug && "rotate-90"
											)}
										/>
										{component.name}
									</button>
								))
							)}
						</nav>
					</aside>

					<main className="flex-1 overflow-auto">
						<div className="p-6 lg:p-8">
							{initialComponent ? (
								<>
									<nav className="mb-6 flex items-center gap-1 text-muted-foreground text-sm">
										<span>Components</span>
										<ChevronRight className="size-3" />
										<span>{initialComponent.category}</span>
										<ChevronRight className="size-3" />
										<span className="text-foreground">
											{initialComponent.name}
										</span>
									</nav>
									<ComponentViewer component={initialComponent} />
								</>
							) : (
								<div className="flex flex-col items-center justify-center py-12 text-center">
									<p className="text-lg text-muted-foreground">
										No components available yet.
									</p>
									<p className="text-muted-foreground text-sm">
										Check back later or add components through the admin panel.
									</p>
								</div>
							)}
						</div>
					</main>
				</div>

				<footer className="border-border border-t bg-muted/30">
					<div className="mx-auto flex h-12 max-w-screen-2xl items-center justify-between px-6 text-muted-foreground text-xs">
						<span>Dakik Studio Component Library</span>
						<span>Built with shadcn/ui and Base UI</span>
					</div>
				</footer>
			</div>
		</>
	);
}
