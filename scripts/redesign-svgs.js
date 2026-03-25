import fs from "node:fs/promises";
import path from "node:path";

const STYLE_TAG_REGEX = /<style\b[^>]*>[\s\S]*?<\/style>/gi;
const SVG_OPEN_TAG_REGEX = /<svg\b([^>]*)>/i;
const SIZE_ATTR_REGEX = /\b(width|height)=["'][^"']*["']/gi;
const FILL_ATTR_REGEX = /\bfill=["'][^"']*["']/gi;
const STROKE_ATTR_REGEX = /\bstroke=["'][^"']*["']/gi;
const CLASS_ATTR_REGEX = /class=["'][^"']*["']/gi;
const SHADOW_RECT_REGEX = /<rect class="shadow"[^>]*\/>/i;
const BRUTALIST_CONTAINER_REGEX = /<g class="brutalist-container">/i;
const BG_RECT_REGEX = /<rect class="bg"[^>]*\/>/i;
const ICON_PATH_GROUP_REGEX = /<g class="icon-path"[^>]*>/i;
const TRAILING_WRAPPER_REGEX = /<\/g>\s*<\/g>\s*<\/svg>/i;
const SVG_INSERT_REGEX = /(<svg\b[^>]*>)/i;

let count = 0;

function getErrorMessage(error) {
	return error instanceof Error ? error.message : String(error);
}

async function processDirectory(directory) {
	const entries = await fs.readdir(directory, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(directory, entry.name);

		if (entry.isDirectory()) {
			await processDirectory(fullPath);
			continue;
		}

		if (entry.isFile() && fullPath.endsWith(".svg")) {
			await processSvg(fullPath);
			count++;
		}
	}
}

async function processSvg(filePath) {
	try {
		let content = await fs.readFile(filePath, "utf-8");

		content = content.replace(STYLE_TAG_REGEX, "");
		content = content.replace(SVG_OPEN_TAG_REGEX, (_match, innerContent) => {
			let sanitizedInnerContent = innerContent;
			sanitizedInnerContent = sanitizedInnerContent.replace(
				SIZE_ATTR_REGEX,
				""
			);
			sanitizedInnerContent = sanitizedInnerContent.replace(
				FILL_ATTR_REGEX,
				""
			);
			sanitizedInnerContent = sanitizedInnerContent.replace(
				STROKE_ATTR_REGEX,
				""
			);
			sanitizedInnerContent = sanitizedInnerContent.replace(
				CLASS_ATTR_REGEX,
				""
			);

			return `<svg${sanitizedInnerContent}>`;
		});

		content = content.replace(SHADOW_RECT_REGEX, "");
		content = content.replace(BRUTALIST_CONTAINER_REGEX, "");
		content = content.replace(BG_RECT_REGEX, "");
		content = content.replace(ICON_PATH_GROUP_REGEX, "");
		content = content.replace(TRAILING_WRAPPER_REGEX, "</svg>");
		content = content.replace(FILL_ATTR_REGEX, "");
		content = content.replace(STROKE_ATTR_REGEX, "");

		const styleTag = `<style>
  svg { transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1); }
  @media (hover: hover) { svg:hover { transform: scale(1.1); } }
  * { fill: currentColor !important; stroke: none !important; }
</style>`;

		content = content.replace(SVG_INSERT_REGEX, `$1\n${styleTag}\n`);

		await fs.writeFile(filePath, content, "utf-8");
	} catch (error) {
		console.error(`Error processing ${filePath}:`, getErrorMessage(error));
	}
}

const targetDir =
	"/Users/erdenizkorkmaz/Documents/GitHub/Personal/xtreme-main/apps/web/public";

console.log(`Starting processing in ${targetDir}...`);
await processDirectory(targetDir);
console.log(`Successfully processed ${count} SVG files.`);
console.log("Done!");
