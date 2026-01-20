import type { Metadata } from "next";

import { IconGrid } from "@/components/daicons/icon-grid";
import { Navbar } from "@/components/landing";

export const metadata: Metadata = {
	title: "daIcons | Dakik Studio",
	description:
		"Open-source icon library with 9000+ icons in multiple styles. Search, preview, and copy SVG icons for your projects.",
};

export default function DaIconsPage() {
	return (
		<>
			<Navbar />
			<main className="min-h-screen bg-background pt-16">
				{/* Header Section */}
				<section className="border-border border-b bg-background py-16 md:py-24">
					<div className="container mx-auto px-4 md:px-6">
						<div className="mx-auto max-w-3xl text-center">
							<span className="mb-4 inline-block font-mono text-muted-foreground text-xs uppercase tracking-widest">
								Open Source
							</span>
							<h1 className="mb-6 font-bold font-display text-4xl tracking-tight md:text-5xl lg:text-6xl">
								daIcons
							</h1>
							<p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
								A comprehensive icon library featuring 9,000+ icons in multiple
								weights and styles. Click any icon to copy its SVG code.
							</p>
						</div>
					</div>
				</section>

				{/* Icon Grid Section */}
				<section className="py-12 md:py-16">
					<div className="container mx-auto px-4 md:px-6">
						<IconGrid />
					</div>
				</section>

				{/* Usage Section */}
				<section className="border-border border-t bg-muted/30 py-12 md:py-16">
					<div className="container mx-auto px-4 md:px-6">
						<div className="mx-auto max-w-3xl">
							<h2 className="mb-6 font-display font-semibold text-2xl">
								How to Use
							</h2>

							<div className="space-y-6">
								<div className="rounded-none border border-border bg-background p-6">
									<h3 className="mb-3 font-medium">React / Next.js</h3>
									<pre className="overflow-x-auto rounded-none bg-muted p-4 font-mono text-sm">
										<code>{`npm install @phosphor-icons/react

import { House, Heart, Star } from "@phosphor-icons/react";

<House size={32} weight="regular" />
<Heart size={32} weight="fill" />
<Star size={32} weight="duotone" />`}</code>
									</pre>
								</div>

								<div className="rounded-none border border-border bg-background p-6">
									<h3 className="mb-3 font-medium">Vanilla SVG</h3>
									<p className="mb-3 text-muted-foreground text-sm">
										Click any icon above to copy its SVG code, then paste
										directly into your HTML.
									</p>
									<pre className="overflow-x-auto rounded-none bg-muted p-4 font-mono text-sm">
										<code>{`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <!-- SVG path data -->
</svg>`}</code>
									</pre>
								</div>

								<div className="rounded-none border border-border bg-background p-6">
									<h3 className="mb-3 font-medium">Available Weights</h3>
									<div className="flex flex-wrap gap-2">
										{[
											"Thin",
											"Light",
											"Regular",
											"Bold",
											"Filled",
											"Duotone",
										].map((weight) => (
											<span
												className="rounded-none bg-muted px-3 py-1 font-mono text-xs"
												key={weight}
											>
												{weight}
											</span>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Credits */}
				<section className="border-border border-t py-8">
					<div className="container mx-auto px-4 text-center md:px-6">
						<p className="text-muted-foreground text-sm">
							Icons powered by{" "}
							<a
								className="text-foreground underline-offset-4 transition-colors hover:underline"
								href="https://phosphoricons.com"
								rel="noopener noreferrer"
								target="_blank"
							>
								Phosphor Icons
							</a>{" "}
							<span className="text-muted-foreground/60">|</span>{" "}
							<span className="font-mono text-xs">MIT Licensed</span>
						</p>
					</div>
				</section>
			</main>
		</>
	);
}
