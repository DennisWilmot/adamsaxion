import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/stripe/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/profile", "/auth"],
    },
    sitemap: `${getAppUrl()}/sitemap.xml`,
  };
}
