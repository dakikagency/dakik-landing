"use client";

import { ArrowRight, CheckCircle2, Download, Layers } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { subscribeToStarterKit } from "@/actions/starter-kit";
import { Footer, Navbar } from "@/components/landing";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Use a simple server action for the form submission to keep it cleaner?
// Or use TRPC. Since I haven't set up public TRPC procedures for lead capture well (auth protected usually?),
// I'll use a server action.

export default function UiKitPage() {
	const [email, setEmail] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) {
			return;
		}

		setIsLoading(true);
		try {
			const result = await subscribeToStarterKit(email);
			if (result.success) {
				setIsSubmitted(true);
				// Automatically start download if URL returned
				if (result.downloadUrl) {
					window.location.href = result.downloadUrl;
				}
				toast.success("Thanks! Your download should start shortly.");
			} else {
				toast.error(result.error || "Something went wrong.");
			}
		} catch (_error) {
			toast.error("Failed to subscribe. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Navbar />
			<main className="relative min-h-screen overflow-hidden bg-background pt-20">
				<div className="relative z-10 mx-auto w-full max-w-screen-xl px-[clamp(1rem,5vw,4rem)]">
					{/* Hero Section */}
					<section className="py-20 lg:py-32">
						<div className="grid gap-12 lg:grid-cols-2 lg:items-center">
							<div className="space-y-8">
								<div className="inline-flex items-center gap-2 rounded-full border bg-background/50 px-3 py-1 font-medium text-muted-foreground text-xs uppercase tracking-wider backdrop-blur-sm">
									<Layers className="size-3" />
									<span>Free Resource</span>
								</div>
								<h1 className="font-bold font-display text-4xl tracking-tight sm:text-5xl lg:text-6xl">
									The Agency <span className="text-primary">Starter Kit</span>
								</h1>
								<p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
									Stop reinventing the wheel. Get the core components, design
									tokens, and utility functions we use to build premium
									applications at Dakik.
								</p>

								{isSubmitted ? (
									<Card className="max-w-md border-green-500/20 bg-green-500/5 backdrop-blur-sm">
										<CardContent className="pt-6">
											<div className="flex flex-col items-center space-y-4 text-center">
												<div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500">
													<CheckCircle2 className="size-6" />
												</div>
												<div className="space-y-1">
													<h3 className="font-semibold text-lg">
														Check your inbox!
													</h3>
													<p className="text-muted-foreground text-sm">
														We've sent the download link to {email}.
													</p>
												</div>
												<Button
													onClick={() => setIsSubmitted(false)}
													variant="outline"
												>
													Send to another email
												</Button>
											</div>
										</CardContent>
									</Card>
								) : (
									<Card className="max-w-md border-primary/20 bg-background/60 backdrop-blur-sm">
										<CardHeader>
											<CardTitle>Get the Source Code</CardTitle>
											<CardDescription>
												Includes Figma file + React components.
											</CardDescription>
										</CardHeader>
										<CardContent>
											<form className="space-y-4" onSubmit={handleSubmit}>
												<div className="space-y-2">
													<Label htmlFor="email">Email address</Label>
													<Input
														className="bg-background"
														id="email"
														onChange={(e) => setEmail(e.target.value)}
														placeholder="you@company.com"
														required
														type="email"
														value={email}
													/>
												</div>
												<Button
													className="w-full"
													disabled={isLoading}
													type="submit"
												>
													{isLoading ? (
														"Sending..."
													) : (
														<>
															Download Now
															<Download className="ml-2 size-4" />
														</>
													)}
												</Button>
												<p className="text-center text-[10px] text-muted-foreground">
													We'll add you to our newsletter. Unsubscribe anytime.
												</p>
											</form>
										</CardContent>
									</Card>
								)}
							</div>

							{/* Preview/Visuals */}
							<div className="relative isolate">
								<div className="absolute -inset-4 z-[-1] rounded-[2.5rem] bg-linear-to-tr from-primary/20 via-primary/5 to-transparent blur-2xl" />
								<div className="rounded-2xl border bg-background/50 p-6 shadow-2xl backdrop-blur-xl lg:p-10">
									<div className="grid gap-6">
										<div className="flex items-center justify-between border-b pb-4">
											<div className="space-y-1">
												<div className="h-2 w-20 rounded bg-foreground/20" />
												<div className="h-2 w-32 rounded bg-muted-foreground/20" />
											</div>
											<div className="h-8 w-8 rounded-full bg-primary/20" />
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div className="h-24 rounded-lg border border-dashed bg-muted/50" />
											<div className="h-24 rounded-lg border border-dashed bg-muted/50" />
										</div>
										<div className="space-y-2">
											<div className="h-8 w-full rounded bg-primary/10" />
											<div className="h-8 w-full rounded bg-primary/10" />
										</div>
									</div>
									<div className="mt-8 flex items-center justify-center gap-8 font-medium text-muted-foreground text-xs uppercase tracking-widest">
										<span>React</span>
										<span>Tailwind</span>
										<span>TypeScript</span>
										<span>Figma</span>
									</div>
								</div>
							</div>
						</div>
					</section>

					{/* Features Grid */}
					<section className="border-border/40 border-t py-24">
						<div className="mb-16 text-center">
							<h2 className="font-bold font-display text-3xl tracking-tight">
								What's included?
							</h2>
						</div>
						<div className="grid gap-8 md:grid-cols-3">
							{[
								{
									title: "5+ Core Components",
									description:
										"Buttons, Inputs, Cards, and more. Built on Radix UI and styled with Tailwind.",
								},
								{
									title: "Design Tokens",
									description:
										"A complete tailwind.config.ts with our signature typography and color palette.",
								},
								{
									title: "Figma File",
									description:
										"Pixel-perfect design assets that match the code 1:1.",
								},
							].map((feature) => (
								<div
									className="group rounded-2xl border bg-card p-8 transition-colors hover:border-primary/50"
									key={feature.title}
								>
									<h3 className="font-semibold text-lg">{feature.title}</h3>
									<p className="mt-2 text-muted-foreground">
										{feature.description}
									</p>
								</div>
							))}
						</div>
					</section>

					{/* CTA */}
					<section className="relative isolate mb-24 overflow-hidden rounded-3xl bg-primary px-6 py-24 text-center shadow-2xl sm:px-16 lg:px-24">
						<div className="mx-auto max-w-2xl">
							<h2 className="mx-auto max-w-xl font-bold font-display text-3xl text-white tracking-tight sm:text-4xl">
								Ready to ship faster?
							</h2>
							<p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/80 leading-8">
								Join other founders Building Bloody Work.
							</p>
							<div className="mt-10 flex items-center justify-center gap-x-6">
								<Button
									onClick={() =>
										window.scrollTo({ top: 0, behavior: "smooth" })
									}
									size="lg"
									variant="secondary"
								>
									Get the Kit
									<ArrowRight className="ml-2 size-4" />
								</Button>
							</div>
						</div>
						<svg
							aria-hidden="true"
							className="absolute top-1/2 left-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
							viewBox="0 0 1024 1024"
						>
							<circle
								cx={512}
								cy={512}
								fill="url(#gradient)"
								fillOpacity="0.7"
								r={512}
							/>
							<defs>
								<radialGradient id="gradient">
									<stop stopColor="white" />
									<stop offset={1} stopColor="white" />
								</radialGradient>
							</defs>
						</svg>
					</section>
				</div>
			</main>
			<Footer />
		</>
	);
}
