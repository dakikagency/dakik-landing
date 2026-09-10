#!/usr/bin/env node
/**
 * Dakik Icons font kit generator — builds public/daicons/v1/ from the three
 * upstream icon-font packages (devDependencies):
 *
 *   material-icons        → plain  `da-<name>`     (default library)
 *   @phosphor-icons/web   → prefix `da-ph-<name>`  (regular weight)
 *   lucide-static         → prefix `da-lu-<name>`
 *
 * Output (gitignored, regenerated on every build; vite copies public/ → dist/):
 *   public/daicons/v1/da-icons.css     one class per icon → glyph codepoint
 *   public/daicons/v1/fonts/*.woff2    the three fonts, renamed to da-* families
 *   public/daicons/v1/icons.json       catalog consumed by the icons.dakik.co.uk browser
 *
 * Sizing model: every icon glyph renders at `var(--da-size, 14px)`. The size
 * classes only set that custom property, so they work both on the icon element
 * itself (`<i class="da-book da-xl">`) and on any ancestor (`<html class="da-16">`
 * re-defaults every icon on the page — custom properties inherit).
 */
import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const nm = join(root, "node_modules");
const outDir = join(root, "public", "daicons", "v1");
mkdirSync(join(outDir, "fonts"), { recursive: true });

const pkgVersion = (name) =>
	JSON.parse(readFileSync(join(nm, name, "package.json"), "utf8")).version;

// ---------------------------------------------------------------------------
// Parse name → hex codepoint per library
// ---------------------------------------------------------------------------

/** material-icons ships an SCSS map: `"account_circle": e853,` */
function parseMaterial() {
	const scss = readFileSync(
		join(nm, "material-icons", "css", "_codepoints.scss"),
		"utf8",
	);
	const map = new Map();
	for (const [, name, hex] of scss.matchAll(/"([^"]+)":\s*([0-9a-f]+)/g)) {
		map.set(name.replace(/_/g, "-"), hex);
	}
	return map;
}

/** @phosphor-icons/web regular CSS: `.ph.ph-acorn:before { content: "\eb9a"; }` */
function parsePhosphor() {
	const css = readFileSync(
		join(nm, "@phosphor-icons", "web", "src", "regular", "style.css"),
		"utf8",
	);
	const map = new Map();
	for (const [, name, hex] of css.matchAll(
		/\.ph\.ph-([a-z0-9-]+):before\s*\{\s*content:\s*"\\([0-9a-f]+)"/g,
	)) {
		map.set(name, hex);
	}
	return map;
}

/** lucide-static codepoints.json: `{ "activity": 57400, ... }` (decimal) */
function parseLucide() {
	const json = JSON.parse(
		readFileSync(join(nm, "lucide-static", "font", "codepoints.json"), "utf8"),
	);
	const map = new Map();
	for (const [name, code] of Object.entries(json)) {
		map.set(name, Number(code).toString(16));
	}
	return map;
}

const libraries = [
	{
		id: "material",
		label: "Material Icons",
		classPrefix: "da-",
		family: "da-material",
		license: "Apache-2.0",
		source: "google/material-design-icons",
		version: pkgVersion("material-icons"),
		font: join(nm, "material-icons", "iconfont", "material-icons.woff2"),
		fontFile: "material.woff2",
		icons: parseMaterial(),
	},
	{
		id: "phosphor",
		label: "Phosphor",
		classPrefix: "da-ph-",
		family: "da-phosphor",
		license: "MIT",
		source: "phosphor-icons/web",
		version: pkgVersion("@phosphor-icons/web"),
		font: join(nm, "@phosphor-icons", "web", "src", "regular", "Phosphor.woff2"),
		fontFile: "phosphor.woff2",
		icons: parsePhosphor(),
	},
	{
		id: "lucide",
		label: "Lucide",
		classPrefix: "da-lu-",
		family: "da-lucide",
		license: "ISC",
		source: "lucide-icons/lucide",
		version: pkgVersion("lucide-static"),
		font: join(nm, "lucide-static", "font", "lucide.woff2"),
		fontFile: "lucide.woff2",
		icons: parseLucide(),
	},
];

// ---------------------------------------------------------------------------
// Sizing classes — all just set --da-size (see header comment)
// ---------------------------------------------------------------------------
const T_SHIRT_SIZES = {
	xs: 10, sm: 12, md: 14, lg: 16, xl: 20,
	"2xl": 24, "3xl": 32, "4xl": 40, "5xl": 48,
};
const PIXEL_SIZES = [10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48, 56, 64];

// Guard: a size class must never collide with an icon class.
const sizeClassNames = new Set(
	[...Object.keys(T_SHIRT_SIZES), ...PIXEL_SIZES].map((s) => `da-${s}`),
);

// ---------------------------------------------------------------------------
// Emit CSS
// ---------------------------------------------------------------------------
const seen = new Set();
const lines = [];

lines.push(
	`/*! Dakik Icons v1 — https://icons.dakik.co.uk` +
		` | Material Icons ${libraries[0].version} (Apache-2.0, Google)` +
		` | Phosphor ${libraries[1].version} (MIT, Phosphor Icons)` +
		` | Lucide ${libraries[2].version} (ISC, Lucide Contributors) */`,
);

for (const lib of libraries) {
	lines.push(
		`@font-face{font-family:${lib.family};src:url(./fonts/${lib.fontFile}) format("woff2");font-style:normal;font-weight:400;font-display:block}`,
	);
}

// Base glyph styles. Drawn on ::before so the rule is inert on non-icon da-*
// classes (a bare size class like `da-16` on <html> produces a contentless
// ::before, which never renders).
lines.push(
	`[class^="da-"]::before,[class*=" da-"]::before{` +
		`font-family:da-material;font-style:normal;font-weight:400;font-variant:normal;` +
		`text-transform:none;line-height:1;letter-spacing:normal;display:inline-block;` +
		`font-size:var(--da-size,14px);speak:never;-webkit-font-smoothing:antialiased;` +
		`-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}`,
);
lines.push(
	`[class^="da-ph-"]::before,[class*=" da-ph-"]::before{font-family:da-phosphor}`,
);
lines.push(
	`[class^="da-lu-"]::before,[class*=" da-lu-"]::before{font-family:da-lucide}`,
);

const sizeRules = [
	...Object.entries(T_SHIRT_SIZES).map(([k, px]) => [`da-${k}`, px]),
	...PIXEL_SIZES.map((px) => [`da-${px}`, px]),
];
lines.push(sizeRules.map(([cls, px]) => `.${cls}{--da-size:${px}px}`).join(""));

for (const lib of libraries) {
	for (const [name, hex] of lib.icons) {
		const cls = `${lib.classPrefix}${name}`;
		if (sizeClassNames.has(cls)) {
			throw new Error(`Icon class collides with a size class: .${cls}`);
		}
		if (seen.has(cls)) {
			console.warn(`duplicate class skipped: .${cls} (${lib.id}/${name})`);
			continue;
		}
		seen.add(cls);
		lines.push(`.${cls}::before{content:"\\${hex}"}`);
	}
}

writeFileSync(join(outDir, "da-icons.css"), `${lines.join("\n")}\n`);

for (const lib of libraries) {
	copyFileSync(lib.font, join(outDir, "fonts", lib.fontFile));
}

// ---------------------------------------------------------------------------
// Catalog for the icons.dakik.co.uk browser page
// ---------------------------------------------------------------------------
const catalog = {
	version: 1,
	sizes: {
		default: 14,
		tshirt: T_SHIRT_SIZES,
		pixels: PIXEL_SIZES,
	},
	libraries: libraries.map((lib) => ({
		id: lib.id,
		label: lib.label,
		classPrefix: lib.classPrefix,
		license: lib.license,
		source: lib.source,
		version: lib.version,
		count: lib.icons.size,
		icons: [...lib.icons.keys()],
	})),
};
writeFileSync(join(outDir, "icons.json"), JSON.stringify(catalog));

const total = libraries.reduce((n, l) => n + l.icons.size, 0);
console.log(
	`daicons v1: ${total} icons (${libraries
		.map((l) => `${l.id} ${l.icons.size}`)
		.join(", ")}) → public/daicons/v1/`,
);
