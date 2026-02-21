import fs from 'fs/promises';
import path from 'path';

async function processDirectory(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
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

        // Remove existing <style> tags to avoid duplicates
        content = content.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');

        // Strip width and height from <svg ...>
        content = content.replace(/<svg\b([^>]*)>/i, (match, p1) => {
            let inner = p1;
            inner = inner.replace(/\b(width|height)=["'][^"']*["']/gi, '');
            inner = inner.replace(/\bfill=["'][^"']*["']/gi, '');
            inner = inner.replace(/\bstroke=["'][^"']*["']/gi, '');
            // strip out brutalist wrapper classes
            inner = inner.replace(/class=["'][^"']*["']/gi, '');
            return `<svg${inner}>`;
        });

        // Strip brutalist wrapper tags from previous run
        content = content.replace(/<rect class="shadow"[^>]*\/>/i, '');
        content = content.replace(/<g class="brutalist-container">/i, '');
        content = content.replace(/<rect class="bg"[^>]*\/>/i, '');
        content = content.replace(/<g class="icon-path"[^>]*>/i, '');
        content = content.replace(/<\/g>\s*<\/g>\s*<\/svg>/i, '</svg>');

        content = content.replace(/\bfill=["'][^"']*["']/gi, '');
        content = content.replace(/\bstroke=["'][^"']*["']/gi, '');

        const styleTag = `<style>
  svg { transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1); }
  @media (hover: hover) { svg:hover { transform: scale(1.1); } }
  * { fill: currentColor !important; stroke: none !important; }
</style>`;

        content = content.replace(/(<svg\b[^>]*>)/i, `$1\n${styleTag}\n`);

        await fs.writeFile(filePath, content, 'utf-8');
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
    }
}

const targetDir = '/Users/erdenizkorkmaz/Documents/GitHub/Personal/xtreme-main/apps/web/public';
console.log(`Starting processing in ${targetDir}...`);
await processDirectory(targetDir);
console.log(`Successfully processed ${count} SVG files.`);
console.log('Done!');
