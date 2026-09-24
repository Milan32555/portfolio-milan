import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";

const siteUrl = "https://portfolio-milan-omega.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/proyectos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/servicios`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/sobre-mi`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/contacto`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.7 },
    ...projects.map((p) => ({
      url: `${siteUrl}/proyectos/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
