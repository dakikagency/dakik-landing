import fs from 'fs/promises';
import path from 'path';
import SVGPathCommander from 'svg-path-commander';

// Number of segments to break a bezier curve into. Lower = sharper/more brutalist.
const RESOLUTION = 3;

function facetPath(d) {
    if (!d) return d;
    try {
        // Convert the path to an absolute string, then parse it
        const pathData = SVGPathCommander.pathToString(SVGPathCommander.normalizePath(d));
        const inst = new SVGPathCommander(pathData);

        // svg-path-commander has a utility to convert to polygon/polyline points 
        // by sampling along the curve length. However, custom parsing is more reliable for faceting.
        // We will convert all arcs and curves to cubic beziers first.
        const cubicPath = SVGPathCommander.pathToCurve(pathData);

        let newD = '';
        let currentX = 0;
        let currentY = 0;

        for (const segment of cubicPath) {
            const cmd = segment[0];
            if (cmd === 'M') {
                currentX = segment[1];
                currentY = segment[2];
                newD += `M ${currentX} ${currentY} `;
            } else if (cmd === 'C') {
                const x1 = segment[1], y1 = segment[2];
                const x2 = segment[3], y2 = segment[4];
                const x3 = segment[5], y3 = segment[6];

                // Sample points along the cubic bezier
                for (let i = 1; i <= RESOLUTION; i++) {
                    const t = i / RESOLUTION;
                    const mt = 1 - t;

                    // Cubic bezier formula
                    const px = (mt * mt * mt * currentX) +
                        (3 * mt * mt * t * x1) +
                        (3 * mt * t * t * x2) +
                        (t * t * t * x3);

                    const py = (mt * mt * mt * currentY) +
                        (3 * mt * mt * t * y1) +
                        (3 * mt * t * t * y2) +
                        (t * t * t * y3);

                    newD += `L ${px.toFixed(2)} ${py.toFixed(2)} `;
                }
                currentX = x3;
                currentY = y3;
            } else if (cmd === 'Z') {
                newD += 'Z ';
            } else {
                // If it's L, H, V it should already be handled by normalizePath/pathToCurve mostly converting to C or L.
                // Wait, pathToCurve converts EVERYTHING to M, C, and Z.
                console.warn("Unexpected command in curve path: ", cmd);
            }
        }

        // Clean up the string to minimize size
        return newD.trim().replace(/\s{2,}/g, ' ');

    } catch (e) {
        console.warn("Could not process path:", d.substring(0, 30), e.message);
        return d;
    }
}


async function processDirectory(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== 'node_modules') {
            await processDirectory(fullPath);
        } else if (entry.isFile() && fullPath.endsWith('.svg')) {
            await processSvg(fullPath);
            count++;
        }
    }
}

let count = 0;

async function processSvg(filePath) {
    try {
        let content = await fs.readFile(filePath, 'utf-8');

        // Find all <path d="..."> and replace the d attribute
        content = content.replace(/<path([^>]*?)d=["'](.*?)["']([^>]*)>/gi, (match, prefix, d, suffix) => {
            const newD = facetPath(d);
            return `<path${prefix}d="${newD}"${suffix}>`;
        });

        await fs.writeFile(filePath, content, 'utf-8');
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
    }
}

const targetDir = '/Users/erdenizkorkmaz/Documents/GitHub/Personal/xtreme-main/apps/web/public';
console.log(`Starting faceting processing in ${targetDir}...`);
await processDirectory(targetDir);
console.log(`Successfully faceted ${count} SVG files.`);
console.log('Done!');
