/**
 * Minimal SVG sanitizer for admin-rendered icons.
 *
 * Removes the high-impact XSS vectors:
 *   - <script> elements
 *   - on* event handler attributes (onclick, onerror, onload, ...)
 *   - javascript: URLs in href / xlink:href
 *
 * Not a substitute for DOMPurify if you ever render untrusted SVGs — but
 * for admin-only paste in the icon library, the threat model is a
 * compromised admin account, and this blocks the obvious payloads.
 *
 * The function preserves currentColor and other styling so icons still
 * inherit text color from their parent.
 */
export function sanitizeSvg(svg: string): string {
	return svg
		.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
		.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
		.replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
		.replace(/\son\w+\s*=\s*'[^']*'/gi, "")
		.replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
		.replace(/\s(href|xlink:href)\s*=\s*"javascript:[^"]*"/gi, "")
		.replace(/\s(href|xlink:href)\s*=\s*'javascript:[^']*'/gi, "");
}
