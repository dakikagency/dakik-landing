"use client";

import { Check, Clipboard, Code, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PropDefinition {
	name: string;
	type: string;
	default?: string;
	description: string;
	required?: boolean;
}

interface ComponentData {
	id: string;
	name: string;
	slug: string;
	category: string;
	description: string | null;
	props: PropDefinition[] | unknown;
	code: string;
	preview: string | null;
}

interface ComponentViewerProps {
	component: ComponentData;
}

const REGEX_STRING = /^("[^"]*"|'[^']*')/;
const REGEX_TEMPLATE = /^`[^`]*`/;
const REGEX_COMMENT = /^(\/\/.*|\/\*[\s\S]*?\*\/)/;
const REGEX_JSX_TAG = /^(<\/?[A-Z][a-zA-Z0-9]*)/;
const REGEX_HTML_TAG = /^(<\/?[a-z][a-z0-9]*)/;
const REGEX_NUMBER = /^\b\d+\.?\d*\b/;
const REGEX_ATTR = /^([a-zA-Z][a-zA-Z0-9]*)(=)/;
const REGEX_PUNCT = /^[{}()[\]<>/;:,.\-+*&|?!]/;
const REGEX_WHITESPACE = /^\s+/;
const REGEX_WORD = /^[a-zA-Z_$][a-zA-Z0-9_$]*/;
const REGEX_WORD_BOUNDARY = /[a-zA-Z0-9_$]/;

const KEYWORDS = new Set([
	"import",
	"export",
	"from",
	"const",
	"let",
	"function",
	"return",
	"if",
	"else",
	"default",
	"type",
	"interface",
]);

const REACT_KEYWORDS = new Set([
	"useState",
	"useEffect",
	"useRef",
	"useMemo",
	"useCallback",
]);

interface Token {
	text: string;
	className?: string;
}

type TokenMatcher = (
	remaining: string
) => { tokens: Token[]; length: number } | null;

function createRegexMatcher(regex: RegExp, className: string): TokenMatcher {
	return (remaining: string) => {
		const match = remaining.match(regex);
		if (match) {
			return {
				tokens: [{ text: match[0], className }],
				length: match[0].length,
			};
		}
		return null;
	};
}

function createKeywordMatcher(
	keywords: Set<string>,
	className: string
): TokenMatcher {
	return (remaining: string) => {
		for (const keyword of keywords) {
			if (remaining.startsWith(keyword)) {
				const nextChar = remaining[keyword.length];
				const isWordBoundary = !(
					nextChar && REGEX_WORD_BOUNDARY.test(nextChar)
				);
				if (isWordBoundary) {
					return {
						tokens: [{ text: keyword, className }],
						length: keyword.length,
					};
				}
			}
		}
		return null;
	};
}

const matchString = createRegexMatcher(REGEX_STRING, "text-emerald-400");
const matchTemplate = createRegexMatcher(REGEX_TEMPLATE, "text-emerald-400");
const matchComment = createRegexMatcher(REGEX_COMMENT, "text-gray-500 italic");
const matchJsxTag = createRegexMatcher(REGEX_JSX_TAG, "text-cyan-400");
const matchHtmlTag = createRegexMatcher(REGEX_HTML_TAG, "text-rose-400");
const matchNumber = createRegexMatcher(REGEX_NUMBER, "text-orange-400");
const matchPunct = createRegexMatcher(REGEX_PUNCT, "text-gray-400");
const matchWord = createRegexMatcher(REGEX_WORD, "text-gray-200");
const matchKeyword = createKeywordMatcher(KEYWORDS, "text-violet-400");
const matchReactKeyword = createKeywordMatcher(
	REACT_KEYWORDS,
	"text-amber-400"
);

function matchWhitespace(
	remaining: string
): { tokens: Token[]; length: number } | null {
	const match = remaining.match(REGEX_WHITESPACE);
	if (match) {
		return { tokens: [{ text: match[0] }], length: match[0].length };
	}
	return null;
}

function matchAttribute(
	remaining: string
): { tokens: Token[]; length: number } | null {
	const match = remaining.match(REGEX_ATTR);
	if (match) {
		return {
			tokens: [
				{ text: match[1], className: "text-sky-300" },
				{ text: match[2], className: "text-gray-400" },
			],
			length: match[0].length,
		};
	}
	return null;
}

const TOKEN_MATCHERS: TokenMatcher[] = [
	matchString,
	matchTemplate,
	matchComment,
	matchJsxTag,
	matchHtmlTag,
	matchKeyword,
	matchReactKeyword,
	matchNumber,
	matchAttribute,
	matchPunct,
	matchWhitespace,
	matchWord,
];

function tokenizeLine(line: string): Token[] {
	const tokens: Token[] = [];
	let remaining = line;

	while (remaining.length > 0) {
		let matched = false;

		for (const matcher of TOKEN_MATCHERS) {
			const result = matcher(remaining);
			if (result) {
				tokens.push(...result.tokens);
				remaining = remaining.slice(result.length);
				matched = true;
				break;
			}
		}

		if (!matched) {
			tokens.push({ text: remaining[0], className: "text-gray-200" });
			remaining = remaining.slice(1);
		}
	}

	return tokens;
}

function CodeLine({ line, lineNumber }: { line: string; lineNumber: number }) {
	const tokens = tokenizeLine(line);

	return (
		<div className="table-row">
			<span className="table-cell select-none pr-4 text-right text-gray-600">
				{lineNumber}
			</span>
			<span className="table-cell">
				{tokens.map((token, idx) => (
					<span
						className={token.className}
						key={`${lineNumber}-${idx}-${token.text.slice(0, 5)}`}
					>
						{token.text}
					</span>
				))}
			</span>
		</div>
	);
}

function CodeBlock({ code }: { code: string }) {
	const lines = code.split("\n");

	return (
		<pre className="table font-mono text-sm leading-relaxed">
			<code>
				{lines.map((line, idx) => (
					<CodeLine key={`line-${idx + 1}`} line={line} lineNumber={idx + 1} />
				))}
			</code>
		</pre>
	);
}

function PreviewContent({ preview }: { preview: string | null }) {
	if (!preview) {
		return (
			<div className="flex min-h-[200px] items-center justify-center bg-muted/20 p-8">
				<p className="text-muted-foreground text-sm">No preview available</p>
			</div>
		);
	}

	if (preview.trim().startsWith("<")) {
		return (
			<div
				className="flex min-h-[200px] items-center justify-center bg-muted/20 p-8"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: Safe HTML preview rendering for component viewer
				dangerouslySetInnerHTML={{ __html: preview }}
			/>
		);
	}

	return (
		<div className="flex min-h-[200px] items-center justify-center bg-muted/20 p-8">
			<p className="text-muted-foreground text-sm">Preview: {preview}</p>
		</div>
	);
}

export function ComponentViewer({ component }: ComponentViewerProps) {
	const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(component.code);
			setCopied(true);
			toast.success("Copied to clipboard");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy");
		}
	};

	const propsArray = Array.isArray(component.props)
		? (component.props as PropDefinition[])
		: [];

	return (
		<div className="flex flex-col gap-6">
			<div className="border-border border-b pb-4">
				<h1 className="font-display font-semibold text-2xl tracking-tight">
					{component.name}
				</h1>
				{component.description && (
					<p className="mt-2 text-muted-foreground text-sm">
						{component.description}
					</p>
				)}
			</div>

			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<div className="flex gap-1 rounded-none border border-border bg-muted/30 p-0.5">
						<button
							className={cn(
								"flex items-center gap-1.5 px-3 py-1.5 font-medium text-xs transition-colors",
								activeTab === "preview"
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							)}
							onClick={() => setActiveTab("preview")}
							type="button"
						>
							<Eye className="size-3.5" />
							Preview
						</button>
						<button
							className={cn(
								"flex items-center gap-1.5 px-3 py-1.5 font-medium text-xs transition-colors",
								activeTab === "code"
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							)}
							onClick={() => setActiveTab("code")}
							type="button"
						>
							<Code className="size-3.5" />
							Code
						</button>
					</div>

					{activeTab === "code" && (
						<Button
							className="gap-1.5"
							onClick={handleCopy}
							size="xs"
							variant="outline"
						>
							{copied ? (
								<>
									<Check className="size-3" />
									Copied
								</>
							) : (
								<>
									<Clipboard className="size-3" />
									Copy
								</>
							)}
						</Button>
					)}
				</div>

				<div className="overflow-hidden rounded-none border border-border">
					{activeTab === "preview" ? (
						<PreviewContent preview={component.preview} />
					) : (
						<div className="relative overflow-x-auto bg-gray-950 p-4">
							<CodeBlock code={component.code} />
						</div>
					)}
				</div>
			</div>

			{propsArray.length > 0 && (
				<div className="flex flex-col gap-3">
					<h2 className="font-display font-medium text-lg">Props</h2>
					<div className="overflow-x-auto rounded-none border border-border">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-border border-b bg-muted/30">
									<th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
										Prop
									</th>
									<th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
										Type
									</th>
									<th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
										Default
									</th>
									<th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
										Description
									</th>
								</tr>
							</thead>
							<tbody>
								{propsArray.map((prop) => (
									<tr
										className="border-border border-b last:border-0"
										key={prop.name}
									>
										<td className="px-4 py-2.5">
											<code className="rounded-none bg-muted px-1.5 py-0.5 font-mono text-xs">
												{prop.name}
												{prop.required && (
													<span className="ml-1 text-destructive">*</span>
												)}
											</code>
										</td>
										<td className="px-4 py-2.5">
											<code className="font-mono text-muted-foreground text-xs">
												{prop.type}
											</code>
										</td>
										<td className="px-4 py-2.5">
											{prop.default ? (
												<code className="font-mono text-muted-foreground text-xs">
													{prop.default}
												</code>
											) : (
												<span className="text-muted-foreground">-</span>
											)}
										</td>
										<td className="px-4 py-2.5 text-muted-foreground">
											{prop.description}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}
