import type { MetadataRoute } from "next";
import { loadAllLessonMeta } from "@/lib/lesson-loader";
import { getAppUrl } from "@/lib/stripe/config";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getAppUrl();
  const lessons = await loadAllLessonMeta();

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
    ...lessons.map((lesson) => ({
      url: `${base}/lessons/${lesson.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
