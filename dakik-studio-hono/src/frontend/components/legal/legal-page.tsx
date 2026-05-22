import { useHead } from "@unhead/react";
import { Link } from "react-router-dom";

export interface LegalSection {
	title: string;
	body: string;
	items?: readonly string[];
}

export interface LegalPageProps {
	title: string;
	eyebrow?: string;
	intro: string;
	summary: readonly string[];
	sections: readonly LegalSection[];
	metaDescription: string;
	lastUpdated: string;
	contactEmail?: string;
}

const DEFAULT_CONTACT_EMAIL = "hello@dakik.co.uk";

export function LegalPage({
	title,
	eyebrow = "Dakik Studio",
	intro,
	summary,
	sections,
	metaDescription,
	lastUpdated,
	contactEmail = DEFAULT_CONTACT_EMAIL,
}: LegalPageProps) {
	useHead({
		title: `${title} · Dakik Studio`,
		meta: [
			{ name: "description", content: metaDescription },
			{ property: "og:title", content: `${title} · Dakik Studio` },
			{ property: "og:description", content: metaDescription },
			{ property: "og:type", content: "website" },
		],
	});

	return (
		<main className="bg-white text-black">
			<div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
				<div className="max-w-3xl">
					<p className="font-mono text-[11px] text-black/45 uppercase tracking-[0.35em]">
						{eyebrow}
					</p>
					<h1 className="mt-4 font-black text-4xl uppercase leading-none tracking-[-0.04em] sm:text-6xl">
						{title}
					</h1>
					<p className="mt-6 max-w-2xl text-base text-black/70 leading-7 sm:text-lg">
						{intro}
					</p>
					<div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-black/55 text-sm">
						<span>Last updated: {lastUpdated}</span>
						<a
							className="underline decoration-black/20 underline-offset-4 transition-colors hover:text-black"
							href={`mailto:${contactEmail}`}
						>
							{contactEmail}
						</a>
						<Link
							className="underline decoration-black/20 underline-offset-4 transition-colors hover:text-black"
							to="/"
						>
							Return home
						</Link>
					</div>
				</div>

				<div className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
					<aside className="h-fit border-black/10 border-t pt-4 lg:sticky lg:top-10">
						<p className="font-mono text-[11px] text-black/45 uppercase tracking-[0.3em]">
							Quick summary
						</p>
						<ul className="mt-4 space-y-3 text-black/65 text-sm leading-6">
							{summary.map((point) => (
								<li key={point}>{point}</li>
							))}
						</ul>
					</aside>

					<div className="space-y-10">
						{sections.map((section) => (
							<section
								className="border-black/10 border-t pt-5"
								key={section.title}
							>
								<h2 className="font-semibold text-2xl tracking-tight">
									{section.title}
								</h2>
								<p className="mt-3 text-black/72 leading-7">{section.body}</p>
								{section.items ? (
									<ul className="mt-4 space-y-2 text-black/72 leading-7">
										{section.items.map((item) => (
											<li className="flex gap-3" key={item}>
												<span
													aria-hidden="true"
													className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-black"
												/>
												<span>{item}</span>
											</li>
										))}
									</ul>
								) : null}
							</section>
						))}
					</div>
				</div>
			</div>
		</main>
	);
}
