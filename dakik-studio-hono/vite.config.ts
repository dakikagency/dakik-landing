import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	root: "src/frontend",
	publicDir: "../../public",
	base: "/",
	build: {
		outDir: "../../dist",
		emptyOutDir: true,
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
	resolve: {
		alias: {
			"hono/jsx-runtime":
				"/Users/erdenizkorkmaz/Documents/GitHub/Dakik/dakik-landing/dakik-studio-hono/node_modules/react/jsx-runtime",
		},
	},
});
