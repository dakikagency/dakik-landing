import "@collab/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	serverExternalPackages: ["@prisma/client", "ws"],
};

export default nextConfig;
