import fs from "node:fs/promises";
import path from "node:path";
import SVGPathCommander from "svg-path-commander";

const MULTI_SPACE_REGEX = /\s{2,}/g;
const PATH_TAG_REGEX = /<path([^>]*?)d=["'](.*?)["']([^>]*)>/gi;
const NODE_MODULES_DIRECTORY = "node_modules";

// Number of segments to break a bezier curve into. Lower = sharper/more brutalist.
const RESOLUTION = 3;

let count = 0;

function getErrorMessage(error) {
	return error instanceof Error ? error.message : String(error);
}

function facetPath(d) {
	if (!d) {
		return d;
	}

	try {
		const pathData = SVGPathCommander.pathToString(
			SVGPathCommander.normalizePath(d)
		);
		const cubicPath = SVGPathCommander.pathToCurve(pathData);

		let newPathData = "";
		let currentX = 0;
		let currentY = 0;

		for (const segment of cubicPath) {
			const cmd = segment[0];

			if (cmd === "M") {
				currentX = segment[1];
				currentY = segment[2];
				newPathData += `M ${currentX} ${currentY} `;
				continue;
			}

			if (cmd === "C") {
				const x1 = segment[1];
				const y1 = segment[2];
				const x2 = segment[3];
				const y2 = segment[4];
				const x3 = segment[5];
				const y3 = segment[6];

				for (let index = 1; index <= RESOLUTION; index++) {
					const t = index / RESOLUTION;
					const mt = 1 - t;

					const px =
						mt * mt * mt * currentX +
						3 * mt * mt * t * x1 +
						3 * mt * t * t * x2 +
						t * t * t * x3;
					const py =
						mt * mt * mt * currentY +
						3 * mt * mt * t * y1 +
						3 * mt * t * t * y2 +
						t * t * t * y3;

					newPathData += `L ${px.toFixed(2)} ${py.toFixed(2)} `;
				}

				currentX = x3;
				currentY = y3;
				continue;
			}

			if (cmd === "Z") {
				newPathData += "Z ";
				continue;
			}

			console.warn("Unexpected command in curve path:", cmd);
		}

		return newPathData.trim().replace(MULTI_SPACE_REGEX, " ");
	} catch (error) {
		console.warn(
			"Could not process path:",
			d.substring(0, 30),
			getErrorMessage(error)
		);
		return d;
	}
}

async function processDirectory(directory) {
	const entries = await fs.readdir(directory, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(directory, entry.name);

		if (entry.isDirectory() && entry.name !== NODE_MODULES_DIRECTORY) {
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

		content = content.replace(PATH_TAG_REGEX, (_match, prefix, d, suffix) => {
			const newPathData = facetPath(d);
			return `<path${prefix}d="${newPathData}"${suffix}>`;
		});

		await fs.writeFile(filePath, content, "utf-8");
	} catch (error) {
		console.error(`Error processing ${filePath}:`, getErrorMessage(error));
	}
}

const targetDir =
	"/Users/erdenizkorkmaz/Documents/GitHub/Personal/xtreme-main/apps/web/public";

console.log(`Starting faceting processing in ${targetDir}...`);
await processDirectory(targetDir);
console.log(`Successfully faceted ${count} SVG files.`);
console.log("Done!");
