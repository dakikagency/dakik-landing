import { ArrowLeft, Check, Copy } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { DakikMark } from "../../components/shared/dakik-mark";

/** One entry from the Dakik Bits shadcn registry index (`/registry.json`). */
export interface RegistryItem {
	name: string;
	type: string;
	title?: string;
	description?: string;
	categories?: string[];
}

export interface RegistryIndex {
	name: string;
	homepage: string;
	items: RegistryItem[];
}

export async function fetchRegistry(): Promise<RegistryIndex> {
	const res = await fetch("/registry.json");
	if (!res.ok) throw new Error("Failed to load registry");
	return res.json();
}

export const installCmd = (name: string) =>
	`npx shadcn@latest add @dakik/${name}`;

export function CopyButton({
	text,
	label = "Copy install command",
}: {
	text: string;
	label?: string;
}) {
	const [copied, setCopied] = useState(false);
	return (
		<button
			aria-label={label}
			className="shrink-0 text-white/40 transition-colors hover:text-white"
			onClick={async () => {
				try {
					await navigator.clipboard.writeText(text);
					setCopied(true);
					setTimeout(() => setCopied(false), 1200);
				} catch {
					/* clipboard unavailable */
				}
			}}
			type="button"
		>
			{copied ? (
				<Check className="size-3.5 text-emerald-400" />
			) : (
				<Copy className="size-3.5" />
			)}
		</button>
	);
}

export function BitsHeader() {
	return (
		<header className="relative z-10 mx-auto flex items-center justify-between px-[clamp(1rem,5vw,4rem)] pt-10">
			<Link className="flex items-center gap-3" to="/">
				<DakikMark className="h-9 w-auto shrink-0" />
				<div className="flex flex-col leading-none">
					<span className="font-black text-sm uppercase tracking-[-0.02em]">
						Dakik
					</span>
					<span className="font-mono text-[9px] text-white/45 uppercase tracking-[0.35em]">
						// Bits
					</span>
				</div>
			</Link>
			<a
				className="group inline-flex items-center gap-2 font-mono text-[11px] text-white/55 uppercase tracking-[0.35em] transition-colors hover:text-white"
				href="https://dakik.co.uk"
			>
				<ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
				Dakik.co.uk
			</a>
		</header>
	);
}

export function BitsFooter() {
	return (
		<footer className="relative z-10 mx-auto flex items-center justify-between border-white/10 border-t px-[clamp(1rem,5vw,4rem)] py-8">
			<span className="font-mono text-[10px] text-white/40 uppercase tracking-[0.35em]">
				// Dakik Bits · MIT
			</span>
			<a
				className="font-mono text-[10px] text-white/40 uppercase tracking-[0.35em] transition-colors hover:text-white"
				href="https://dakik.co.uk"
			>
				Dakik Studio →
			</a>
		</footer>
	);
}
