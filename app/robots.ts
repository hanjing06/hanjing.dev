import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://hanjing.dev/sitemap.xml",
    host: "https://hanjing.dev",
  };
}
