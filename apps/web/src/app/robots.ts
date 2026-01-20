import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://dakik.co.uk";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/admin", "/admin/*", "/portal", "/portal/*", "/api/*"],
			},
		],
		sitemap: `${BASE_URL}/sitemap.xml`,
	};
}
