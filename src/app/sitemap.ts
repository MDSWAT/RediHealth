import type { MetadataRoute } from "next";
import { healthTopicSlugs } from "@/lib/i18n/health-information-topics";
import { withLangPrefix } from "@/lib/i18n/routing";
import { languages } from "@/lib/i18n/translations";
import { getSiteUrl } from "@/lib/site-url";

const publicPaths = [
  "/",
  "/about",
  "/accessibility",
  "/contact",
  "/demo",
  "/find-help",
  "/get-help",
  "/health-assistant",
  "/health-check",
  "/health-information",
  "/news",
  "/prescription-review",
  "/privacy",
  "/report-issue",
  "/stiri",
  "/terms",
  ...healthTopicSlugs.map((slug) => `/health-information/${slug}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteUrl();
  const urlFor = (path: string, lang: (typeof languages)[number]["code"]) => `${origin}${withLangPrefix(path, lang)}`;

  return publicPaths.flatMap((path) =>
    languages.map(({ code }) => ({
      url: urlFor(path, code),
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(languages.map((item) => [item.code, urlFor(path, item.code)])),
      },
    })),
  );
}
