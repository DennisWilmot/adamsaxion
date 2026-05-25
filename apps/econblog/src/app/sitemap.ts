import type { MetadataRoute } from "next";
import { STATIC_CAROUSEL_SLUGS } from "@/lib/landing/carousel-manifest";
import { getAppUrl } from "@/lib/stripe/config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getAppUrl();
  const lessons = STATIC_CAROUSEL_SLUGS;

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/lessons`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...lessons.map((slug) => ({
      url: `${base}/lessons/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
