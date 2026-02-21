import "@collab/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	serverExternalPackages: ["@prisma/client", "ws"],
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "files.catbox.moe",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "o.uguu.se",
			},
			{
				protocol: "https",
				hostname: "platform.theverge.com",
			},
		],
	},
};

export default nextConfig;
