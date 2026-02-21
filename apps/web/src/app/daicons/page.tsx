import type { Metadata } from "next";

import { IconGrid } from "@/components/daicons/icon-grid";
import { Navbar } from "@/components/landing";

export const metadata: Metadata = {
	title: "daIcons | Dakik Studio",
	description:
		"Custom icon library with unique SVG icons. Search, preview, and copy SVG icons for your projects.",
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
								A curated icon library featuring custom-designed SVG icons.
								Click any icon to copy its SVG code.
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
									<h3 className="mb-3 font-medium">Vanilla SVG</h3>
									<p className="mb-3 text-muted-foreground text-sm">
										Click any icon above to copy its SVG code, then paste
										directly into your HTML or download as an SVG file.
									</p>
									<pre className="overflow-x-auto rounded-none bg-muted p-4 font-mono text-sm">
										<code>{`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <!-- SVG path data -->
</svg>`}</code>
									</pre>
								</div>

								<div className="rounded-none border border-border bg-background p-6">
									<h3 className="mb-3 font-medium">React / Next.js</h3>
									<p className="mb-3 text-muted-foreground text-sm">
										Copy the SVG code and paste it directly into your React
										components, or save as a reusable component.
									</p>
									<pre className="overflow-x-auto rounded-none bg-muted p-4 font-mono text-sm">
										<code>{`// As inline SVG
export function IconName({ className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24"
      className={className}
    >
      {/* SVG content */}
    </svg>
  );
}`}</code>
									</pre>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Credits */}
				<section className="border-border border-t py-8">
					<div className="container mx-auto px-4 text-center md:px-6">
						<p className="text-muted-foreground text-sm">
							Custom icons by{" "}
							<span className="font-medium text-foreground">Dakik Studio</span>
							<span className="text-muted-foreground/60"> | </span>
							<span className="font-mono text-xs">MIT Licensed</span>
						</p>
					</div>
				</section>
			</main>
		</>
	);
}
