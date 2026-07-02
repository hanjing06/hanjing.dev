import type { MetadataRoute } from "next";

const siteUrl = "https://hanjing.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/about",
    "/projects",
    "/projects/sunstang-vcu-2026",
    "/projects/the-perfect-squat",
    "/projects/tiny-squares-camera-system",
    "/contact",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "monthly" : "yearly",
    priority: route === "" ? 1 : route === "/projects" ? 0.9 : 0.7,
  }));
}
