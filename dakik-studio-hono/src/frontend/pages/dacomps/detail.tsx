import { useQuery } from "@tanstack/react-query";
import { useHead } from "@unhead/react";
import { ArrowLeft, ArrowUpRight, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Noise from "../../components/noise";
import { pageHead } from "../../lib/head";
import { cn } from "../../lib/utils";
import {
	BitsFooter,
	BitsHeader,
	CopyButton,
	fetchRegistry,
	installCmd,
	type RegistryItem,
} from "./shared";

/**
 * Dakik Bits component detail page — bits.dakik.co.uk/<slug>.
 *
 * ReactBits-style docs for a single registry item: install commands (shadcn CLI
 * per package manager + manual), a generated usage snippet, the full TSX source
 * with copy/expand, and the npm + registry dependencies. Everything is derived
 * from the same `component_doc` row that serves `/r/<slug>.json`, so the docs
 * can never drift from what the CLI installs.
 */

/** Shadcn registry metadata stored in `component_doc.props`. */
interface RegistryProps {
	type?: string;
	author?: string;
	dependencies?: string[];
	registryDependencies?: string[];
	meta?: { ark?: string; usage?: string; [k: string]: unknown };
	file?: { path: string; type: string; target?: string };
}

interface ComponentFileRow {
	id: string;
	filename: string;
	fileType: string;
	content: string;
	isMainFile: boolean;
	order: number;
}

interface ComponentDoc {
	name: string;
	slug: string;
	category: string;
	description: string | null;
	props: RegistryProps | null;
	code: string;
	preview: string | null;
	files: ComponentFileRow[];
}

async function fetchComponent(slug: string): Promise<{ component: ComponentDoc }> {
	const res = await fetch(`/api/components/${encodeURIComponent(slug)}`);
	if (!res.ok) throw new Error("Failed to load component");
	return res.json();
}

// ---------------------------------------------------------------------------
// Install commands
// ---------------------------------------------------------------------------

const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;
type PackageManager = (typeof PACKAGE_MANAGERS)[number];

function cliCommand(pm: PackageManager, slug: string): string {
	switch (pm) {
		case "npm":
			return `npx shadcn@latest add @dakik/${slug}`;
		case "pnpm":
			return `pnpm dlx shadcn@latest add @dakik/${slug}`;
		case "yarn":
			return `yarn dlx shadcn@latest add @dakik/${slug}`;
		case "bun":
			return `bunx shadcn@latest add @dakik/${slug}`;
	}
}

const REGISTRY_CONFIG_SNIPPET = `{
  "registries": {
    "@dakik": "https://bits.dakik.co.uk/r/{name}.json"
  }
}`;

// ---------------------------------------------------------------------------
// Source-derived helpers
// ---------------------------------------------------------------------------

/** Where the shadcn CLI will write the file in a consumer project. */
function installTarget(props: RegistryProps | null, slug: string): string {
	if (props?.file?.target) return props.file.target.replace(/^\.?\//, "");
	const base = props?.file?.path?.split("/").pop() ?? `${slug}.tsx`;
	const type = props?.file?.type ?? props?.type ?? "registry:ui";
	if (type === "registry:lib") return `lib/${base}`;
	if (type === "registry:hook") return `hooks/${base}`;
	return `components/ui/${base}`;
}

/** "@/components/ui/button" from "components/ui/button.tsx". */
function importPathOf(target: string): string {
	return `@/${target.replace(/\.[jt]sx?$/, "")}`;
}

/** Package name without any version specifier ("@scope/pkg@^1" → "@scope/pkg"). */
function npmName(spec: string): string {
	const at = spec.indexOf("@", 1);
	return at === -1 ? spec : spec.slice(0, at);
}

/** Registry dependency → slug when it points at our own registry, else null. */
function dakikSlugOf(dep: string): string | null {
	const m = dep.match(/^https:\/\/bits\.dakik\.co\.uk\/r\/([\w-]+)(?:\.json)?$/);
	return m ? m[1] : null;
}

/** Named exports declared in the source (drives the generated usage snippet). */
function extractExports(code: string): string[] {
	const names = new Set<string>();
	for (const m of code.matchAll(
		/export\s+(?:async\s+)?(?:function|const|let|var|class)\s+([A-Za-z_$][\w$]*)/g,
	)) {
		names.add(m[1]);
	}
	for (const m of code.matchAll(/export\s*\{([^}]+)\}/g)) {
		for (const part of m[1].split(",")) {
			const name = part.split(/\s+as\s+/).pop()?.trim();
			if (name && name !== "default" && /^[A-Za-z_$][\w$]*$/.test(name)) {
				names.add(name);
			}
		}
	}
	return [...names];
}

function usageSnippet(doc: ComponentDoc): string {
	const custom = doc.props?.meta?.usage;
	if (typeof custom === "string" && custom.trim()) return custom;

	const importPath = importPathOf(installTarget(doc.props ?? null, doc.slug));
	const exports = extractExports(doc.code);
	const components = exports.filter((n) => /^[A-Z]/.test(n));
	const shown = (components.length ? components : exports).slice(0, 4);
	if (!shown.length) return `import "${importPath}";`;

	const lines = [`import { ${shown.join(", ")} } from "${importPath}";`];
	if (components.length) lines.push("", `<${components[0]} />`);
	return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Monochrome syntax highlighting — deliberately black & white (house style),
// shades carry the structure: comments faint, strings soft, keywords bright.
// ---------------------------------------------------------------------------

const KEYWORDS = new Set([
	"import", "export", "from", "default", "const", "let", "var", "function",
	"return", "if", "else", "for", "while", "do", "switch", "case", "break",
	"continue", "new", "typeof", "instanceof", "in", "of", "class", "extends",
	"super", "this", "async", "await", "try", "catch", "finally", "throw",
	"interface", "type", "enum", "implements", "declare", "namespace", "as",
	"satisfies", "keyof", "infer", "readonly", "public", "private", "protected",
	"static", "yield", "delete", "void", "never", "unknown", "any", "null",
	"undefined", "true", "false",
]);

const TOKEN_RE =
	/(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|(`(?:\\[\s\S]|[^\\`])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|((?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)|([A-Za-z_$][\w$]*)/g;

interface Token {
	text: string;
	cls?: string;
}

/** Tokenize source into per-line spans (tokens may span lines, e.g. comments). */
function highlight(code: string): Token[][] {
	const lines: Token[][] = [[]];
	const push = (text: string, cls?: string) => {
		const parts = text.split("\n");
		parts.forEach((part, i) => {
			if (i > 0) lines.push([]);
			if (part) lines[lines.length - 1].push({ text: part, cls });
		});
	};

	let last = 0;
	for (const m of code.matchAll(TOKEN_RE)) {
		const index = m.index ?? 0;
		if (index > last) push(code.slice(last, index));
		if (m[1]) push(m[1], "italic text-white/35");
		else if (m[2]) push(m[2], "text-white/80");
		else if (m[3]) push(m[3], "text-white/80");
		else if (m[4]) {
			push(
				m[4],
				KEYWORDS.has(m[4])
					? "font-semibold text-white"
					: /^[A-Z]/.test(m[4])
						? "text-white/90"
						: undefined,
			);
		}
		last = index + m[0].length;
	}
	if (last < code.length) push(code.slice(last));
	return lines;
}

const COLLAPSED_LINES = 28;

function CodeBlock({
	code,
	collapsible = false,
}: {
	code: string;
	collapsible?: boolean;
}) {
	const lines = useMemo(() => highlight(code), [code]);
	const [expanded, setExpanded] = useState(false);
	const canCollapse = collapsible && lines.length > COLLAPSED_LINES + 8;
	const shown = canCollapse && !expanded ? lines.slice(0, COLLAPSED_LINES) : lines;

	return (
		<div className="relative border border-white/10 bg-neutral-950">
			<div className="absolute top-3 right-3 z-10">
				<CopyButton label="Copy code" text={code} />
			</div>
			<pre className="overflow-x-auto py-4 pr-12 font-mono text-[12px] text-white/60 leading-relaxed">
				<code>
					{shown.map((toks, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: lines are static per code string
						<div className="px-4" key={i}>
							<span className="mr-4 inline-block w-7 select-none text-right text-white/20">
								{i + 1}
							</span>
							{toks.map((t, j) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: tokens are static per line
								<span className={t.cls} key={j}>
									{t.text}
								</span>
							))}
						</div>
					))}
				</code>
			</pre>
			{canCollapse && (
				<button
					aria-expanded={expanded}
					className={cn(
						"flex w-full items-center justify-center gap-2 border-white/10 border-t py-2.5 font-mono text-[10px] text-white/55 uppercase tracking-[0.35em] transition-colors hover:text-white",
						!expanded &&
							"absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950 via-neutral-950/95 to-neutral-950/0 pt-10",
					)}
					onClick={() => setExpanded((e) => !e)}
					type="button"
				>
					{expanded ? "// Collapse" : `// Expand · ${lines.length} lines`}
					<ChevronDown
						className={cn("size-3 transition-transform", expanded && "rotate-180")}
					/>
				</button>
			)}
		</div>
	);
}

function CommandBox({ command }: { command: string }) {
	return (
		<div className="flex items-center gap-3 border border-white/15 bg-white/[0.03] px-4 py-2.5">
			<code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-[12px] text-white/80">
				{command}
			</code>
			<CopyButton text={command} />
		</div>
	);
}

function SectionLabel({ children }: { children: string }) {
	return (
		<p className="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
			{children}
		</p>
	);
}

// ---------------------------------------------------------------------------
// Sidebar — all bits grouped by category, current one marked.
// ---------------------------------------------------------------------------

function Sidebar({ items, active }: { items: RegistryItem[]; active: string }) {
	const grouped = useMemo(() => {
		const map = new Map<string, RegistryItem[]>();
		for (const item of items) {
			const cat = item.categories?.[0] ?? "Components";
			const list = map.get(cat) ?? [];
			list.push(item);
			map.set(cat, list);
		}
		return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
	}, [items]);

	return (
		<aside className="sticky top-10 hidden max-h-[calc(100vh-5rem)] gap-8 self-start overflow-y-auto pr-2 pb-8 lg:flex lg:flex-col">
			<Link
				className="group inline-flex items-center gap-2 font-mono text-[11px] text-white/55 uppercase tracking-[0.35em] transition-colors hover:text-white"
				to="/"
			>
				<ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
				All bits
			</Link>
			{grouped.map(([cat, list]) => (
				<div key={cat}>
					<p className="mb-3 font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
						// {cat}
					</p>
					<nav className="flex flex-col gap-1.5">
						{list.map((item) => (
							<Link
								className={cn(
									"truncate text-left font-mono text-[11px] uppercase tracking-[0.25em] transition-colors",
									item.name === active
										? "text-white"
										: "text-white/50 hover:text-white",
								)}
								key={item.name}
								to={`/${item.name}`}
							>
								{item.name === active && <span className="mr-2 text-white">●</span>}
								{item.title ?? item.name}
							</Link>
						))}
					</nav>
				</div>
			))}
		</aside>
	);
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function PageShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="relative min-h-screen overflow-hidden bg-black text-white">
			<BitsHeader />
			{children}
			<BitsFooter />
			<Noise patternAlpha={15} patternRefreshInterval={4} />
		</div>
	);
}

export function DacompsDetailPage() {
	const { slug = "" } = useParams<{ slug: string }>();
	const [pm, setPm] = useState<PackageManager>("npm");
	const [installMode, setInstallMode] = useState<"cli" | "manual">("cli");
	const [activeFile, setActiveFile] = useState(0);
	const [showSetup, setShowSetup] = useState(false);

	const { data, isLoading, isError } = useQuery({
		queryKey: ["bits", "component", slug],
		queryFn: () => fetchComponent(slug),
		enabled: !!slug,
	});
	const { data: registry } = useQuery({
		queryKey: ["registry"],
		queryFn: fetchRegistry,
	});

	// The route element survives sidebar navigation (only :slug changes), so
	// reset the per-component file tab when moving between bits.
	useEffect(() => setActiveFile(0), [slug]);

	const doc = data?.component;
	const props = doc?.props ?? null;
	const dependencies = props?.dependencies ?? [];
	const registryDependencies = props?.registryDependencies ?? [];
	const target = doc ? installTarget(props, doc.slug) : "";
	const usage = useMemo(() => (doc ? usageSnippet(doc) : ""), [doc]);
	const arkUrl =
		typeof props?.meta?.ark === "string" && /^https?:\/\//.test(props.meta.ark)
			? props.meta.ark
			: null;

	// Main source + any extra files, as code tabs.
	const fileTabs = useMemo(() => {
		if (!doc) return [];
		const main = {
			filename: target.split("/").pop() ?? `${doc.slug}.tsx`,
			content: doc.code,
		};
		const extras = [...doc.files]
			.sort((a, b) => a.order - b.order)
			.map((f) => ({ filename: f.filename, content: f.content }));
		return [main, ...extras];
	}, [doc, target]);
	const currentFile = fileTabs[Math.min(activeFile, fileTabs.length - 1)];

	useHead(
		doc
			? pageHead({
					title: `${doc.name} · Dakik Bits`,
					description:
						doc.description ??
						`${doc.name} — a production-ready React component from the Dakik Bits shadcn registry.`,
					canonical: `https://bits.dakik.co.uk/${doc.slug}`,
				})
			: { title: "Dakik Bits" },
	);

	if (isLoading) {
		return (
			<PageShell>
				<main className="relative z-10 mx-auto px-[clamp(1rem,5vw,4rem)] pt-16 pb-24">
					<p className="font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
						// Loading bit…
					</p>
				</main>
			</PageShell>
		);
	}

	if (isError || !doc) {
		return (
			<PageShell>
				<main className="relative z-10 mx-auto max-w-3xl px-[clamp(1rem,5vw,4rem)] pt-16 pb-24">
					<p className="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
						// Not found
					</p>
					<h1 className="mt-3 font-black text-4xl uppercase leading-[0.9] tracking-[-0.03em] sm:text-5xl">
						Bit missing.
					</h1>
					<p className="mt-4 max-w-[48ch] text-white/60">
						No component lives at this address. It may have been renamed or
						unpublished.
					</p>
					<Link
						className="group mt-8 inline-flex items-center gap-2 font-mono text-[11px] text-white/55 uppercase tracking-[0.35em] transition-colors hover:text-white"
						to="/"
					>
						<ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
						All bits
					</Link>
				</main>
			</PageShell>
		);
	}

	return (
		<PageShell>
			<main className="relative z-10 mx-auto px-[clamp(1rem,5vw,4rem)] pt-12 pb-20">
				<div className="grid gap-12 lg:grid-cols-[240px_minmax(0,1fr)]">
					<Sidebar active={doc.slug} items={registry?.items ?? []} />

					<article className="min-w-0 max-w-4xl">
						<Link
							className="group mb-6 inline-flex items-center gap-2 font-mono text-[11px] text-white/55 uppercase tracking-[0.35em] transition-colors hover:text-white lg:hidden"
							to="/"
						>
							<ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
							All bits
						</Link>

						<SectionLabel>{`// ${doc.category}`}</SectionLabel>
						<h1 className="mt-3 font-black text-[clamp(2.5rem,7vw,5rem)] uppercase leading-[0.85] tracking-[-0.04em]">
							{doc.name}
						</h1>
						{doc.description && (
							<p className="mt-5 max-w-[58ch] text-base text-white/70 leading-snug sm:text-lg">
								{doc.description}
							</p>
						)}
						{arkUrl && (
							<a
								className="group mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] text-white/45 uppercase tracking-[0.3em] transition-colors hover:text-white"
								href={arkUrl}
								rel="noreferrer"
								target="_blank"
							>
								Built on Ark UI
								<ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
							</a>
						)}

						{doc.preview && /^https?:\/\//.test(doc.preview) && (
							<div className="mt-10 border border-white/10 bg-neutral-950">
								<img
									alt={`${doc.name} preview`}
									className="w-full"
									src={doc.preview}
								/>
							</div>
						)}

						{/* Install */}
						<section className="mt-14">
							<SectionLabel>// Install</SectionLabel>
							<div className="mt-4 flex flex-wrap items-center gap-2">
								{(["cli", "manual"] as const).map((mode) => (
									<button
										className={cn(
											"border-2 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.25em] transition-colors",
											installMode === mode
												? "border-white bg-white text-black"
												: "border-white/20 text-white/60 hover:border-white/50 hover:text-white",
										)}
										key={mode}
										onClick={() => setInstallMode(mode)}
										type="button"
									>
										{mode === "cli" ? "shadcn CLI" : "Manual"}
									</button>
								))}
							</div>

							{installMode === "cli" && (
								<div className="mt-4 border border-white/10 bg-neutral-950">
									<div className="flex border-white/10 border-b">
										{PACKAGE_MANAGERS.map((p) => (
											<button
												className={cn(
													"px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors",
													pm === p
														? "bg-white/[0.06] text-white"
														: "text-white/45 hover:text-white",
												)}
												key={p}
												onClick={() => setPm(p)}
												type="button"
											>
												{p}
											</button>
										))}
									</div>
									<div className="flex items-center gap-3 px-4 py-3">
										<code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-[12px] text-white/80">
											{cliCommand(pm, doc.slug)}
										</code>
										<CopyButton text={cliCommand(pm, doc.slug)} />
									</div>
								</div>
							)}

							{installMode === "cli" && (
								<div className="mt-3">
									<button
										aria-expanded={showSetup}
										className="flex items-center gap-2 font-mono text-[10px] text-white/45 uppercase tracking-[0.3em] transition-colors hover:text-white"
										onClick={() => setShowSetup((s) => !s)}
										type="button"
									>
										<ChevronDown
											className={cn(
												"size-3 transition-transform",
												showSetup && "rotate-180",
											)}
										/>
										One-time setup — register @dakik
									</button>
									{showSetup && (
										<div className="mt-3 space-y-3">
											<p className="max-w-[60ch] text-sm text-white/55">
												Add the registry once to your project's{" "}
												<code className="font-mono text-white/75">
													components.json
												</code>
												, then any bit installs by name:
											</p>
											<CodeBlock code={REGISTRY_CONFIG_SNIPPET} />
											<p className="max-w-[60ch] text-sm text-white/55">
												Or skip the setup and install straight from the URL:
											</p>
											<CommandBox
												command={`npx shadcn@latest add https://bits.dakik.co.uk/r/${doc.slug}.json`}
											/>
										</div>
									)}
								</div>
							)}

							{installMode === "manual" && (
								<div className="mt-4 space-y-5">
									{dependencies.length > 0 && (
										<div>
											<p className="mb-2 text-sm text-white/55">
												1. Install the dependencies:
											</p>
											<CommandBox command={`npm i ${dependencies.join(" ")}`} />
										</div>
									)}
									{registryDependencies.length > 0 && (
										<div>
											<p className="mb-2 text-sm text-white/55">
												{dependencies.length ? "2." : "1."} This bit also needs:
											</p>
											<div className="flex flex-wrap gap-2">
												{registryDependencies.map((dep) => {
													const depSlug = dakikSlugOf(dep);
													return depSlug ? (
														<Link
															className="border border-white/15 px-3 py-1.5 font-mono text-[11px] text-white/70 transition-colors hover:border-white/50 hover:text-white"
															key={dep}
															to={`/${depSlug}`}
														>
															@dakik/{depSlug}
														</Link>
													) : (
														<span
															className="border border-white/15 px-3 py-1.5 font-mono text-[11px] text-white/70"
															key={dep}
														>
															{dep}
														</span>
													);
												})}
											</div>
										</div>
									)}
									<p className="text-sm text-white/55">
										{(dependencies.length ? 1 : 0) +
											(registryDependencies.length ? 1 : 0) +
											1}
										. Copy the source below into{" "}
										<code className="font-mono text-white/75">{target}</code> —
										done.
									</p>
								</div>
							)}
						</section>

						{/* Usage */}
						<section className="mt-14">
							<SectionLabel>// Usage</SectionLabel>
							<div className="mt-4">
								<CodeBlock code={usage} />
							</div>
						</section>

						{/* Code */}
						<section className="mt-14">
							<SectionLabel>// Code</SectionLabel>
							{fileTabs.length > 1 && (
								<div className="mt-4 flex flex-wrap gap-2">
									{fileTabs.map((f, i) => (
										<button
											className={cn(
												"border-2 px-3 py-1.5 font-mono text-[11px] transition-colors",
												i === Math.min(activeFile, fileTabs.length - 1)
													? "border-white bg-white text-black"
													: "border-white/20 text-white/60 hover:border-white/50 hover:text-white",
											)}
											key={f.filename}
											onClick={() => setActiveFile(i)}
											type="button"
										>
											{f.filename}
										</button>
									))}
								</div>
							)}
							{currentFile && (
								<div className="mt-4">
									<CodeBlock
										code={currentFile.content}
										collapsible
										key={`${doc.slug}/${currentFile.filename}`}
									/>
								</div>
							)}
						</section>

						{/* Dependencies */}
						{(dependencies.length > 0 || registryDependencies.length > 0) && (
							<section className="mt-14">
								<SectionLabel>// Dependencies</SectionLabel>
								<div className="mt-4 flex flex-wrap gap-2">
									{dependencies.map((dep) => (
										<a
											className="group inline-flex items-center gap-1.5 border border-white/15 px-3 py-1.5 font-mono text-[11px] text-white/70 transition-colors hover:border-white/50 hover:text-white"
											href={`https://www.npmjs.com/package/${npmName(dep)}`}
											key={dep}
											rel="noreferrer"
											target="_blank"
										>
											{dep}
											<ArrowUpRight className="size-3 text-white/30 transition-colors group-hover:text-white" />
										</a>
									))}
									{registryDependencies.map((dep) => {
										const depSlug = dakikSlugOf(dep);
										return depSlug ? (
											<Link
												className="border border-white/15 px-3 py-1.5 font-mono text-[11px] text-white/70 transition-colors hover:border-white/50 hover:text-white"
												key={dep}
												to={`/${depSlug}`}
											>
												@dakik/{depSlug}
											</Link>
										) : (
											<span
												className="border border-white/15 px-3 py-1.5 font-mono text-[11px] text-white/70"
												key={dep}
											>
												{dep}
											</span>
										);
									})}
								</div>
							</section>
						)}
					</article>
				</div>
			</main>
		</PageShell>
	);
}

export default DacompsDetailPage;
