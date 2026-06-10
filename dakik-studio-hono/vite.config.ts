import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// micromark's HTML-entity decoder (a transitive dep of react-markdown) ships a
// DOM build (index.dom.js) that touches `document` at module-init — crashes the
// worker at boot. Force its Node build, which decodes via a data table.
const decodeNamedNode = fileURLToPath(
	new URL(
		"node_modules/decode-named-character-reference/index.js",
		import.meta.url,
	),
);

// Materialized bits registry components (scripts/materialize-bits-components.mjs)
// import each other shadcn-style via "@/..." — point the alias at their root.
const bitsRoot = fileURLToPath(new URL("src/frontend/bits", import.meta.url));

// Two builds share this config:
//   `vite build`                        → client bundle → dist/ (wipes dist)
//   `vite build --ssr entry-server.tsx` → SSR bundle    → dist/server/ (keeps dist)
export default defineConfig(({ isSsrBuild }) => ({
	plugins: [react()],
	root: "src/frontend",
	publicDir: "../../public",
	base: "/",
	build: {
		outDir: isSsrBuild ? "../../dist/server" : "../../dist",
		// The client build wipes dist/; the SSR build runs AFTER it and writes
		// into dist/server, so it must not empty (or it would delete the client).
		emptyOutDir: !isSsrBuild,
		// The SSR bundle is JS-only — don't duplicate public assets (videos!)
		// into dist/server. Only the client build serves static files.
		copyPublicDir: !isSsrBuild,
	},
	// `ssr.*` is only consulted during the SSR build. webworker target keeps
	// workerd-style resolution (avoids Node's fileURLToPath/import.meta.url at
	// module init); noExternal bundles everything into one self-contained file.
	ssr: {
		target: "webworker",
		noExternal: true,
	},
	// SSR build only: `workerd` picks react-dom/server.edge (its MessageChannel is
	// polyfilled in ssr-polyfill.ts); the alias forces the markdown entity-decoder
	// to its Node build. Client build keeps default browser resolution.
	resolve: {
		alias: {
			"@": bitsRoot,
			...(isSsrBuild
				? { "decode-named-character-reference": decodeNamedNode }
				: {}),
		},
		...(isSsrBuild ? { conditions: ["workerd", "worker"] } : {}),
	},
	server: {
		port: 5173,
		proxy: {
			"/api": {
				target: "http://localhost:8787",
				changeOrigin: true,
			},
		},
	},
}));
