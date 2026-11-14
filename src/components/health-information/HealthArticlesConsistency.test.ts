import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LanguageContext } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";
import {
  getHealthInformationDictionary,
  getHealthTopicBySlug,
} from "@/lib/i18n/health-information-topics";
import { NEWS_ARTICLES } from "@/lib/data/news";
import { TopicDetailPageContent } from "./TopicDetailPageContent";
import { NewsArticleView } from "@/components/news/NewsArticleView";

const state = vi.hoisted(() => ({ lang: "ro" as Lang }));

vi.mock("@/lib/i18n/server-routing", async () => ({
  getRequestLang: async () => state.lang,
  withLangPrefix: (await import("@/lib/i18n/routing")).withLangPrefix,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => `/${state.lang}/news/${NEWS_ARTICLES[0].slug}`,
}));

import HealthSummaryPage from "@/app/health-information/topics/[topic]/page";
import HealthArticlePage from "@/app/health-information/articles/[article]/page";

describe("unified layout and elderly WCAG consistency across health reading surfaces", () => {
  it.each(["ro", "en"] as const)(
    "renders identical single-column max-w-3xl structure, 18px prose, audio action, next-steps, and zero UI clutter in %s",
    async (lang) => {
      state.lang = lang;
      const dictionary = getHealthInformationDictionary(lang);
      const topic = getHealthTopicBySlug(lang, "heart-health")!;
      const relatedTopics = dictionary.topics
        .filter((item) => item.slug !== topic.slug)
        .slice(0, 3);

      const providerWrap = (node: ReturnType<typeof createElement>) =>
        createElement(
          LanguageContext.Provider,
          { value: { lang, t: translations[lang], setLang: () => {} } },
          node,
        );

      const topicGuideHtml = renderToStaticMarkup(
        providerWrap(
          createElement(TopicDetailPageContent, {
            topic,
            relatedTopics,
          }),
        ),
      );

      const topicSummaryHtml = renderToStaticMarkup(
        providerWrap(
          await HealthSummaryPage({
            params: Promise.resolve({ topic: "allergies" }),
          }),
        ),
      );

      const healthArticleHtml = renderToStaticMarkup(
        providerWrap(
          await HealthArticlePage({
            params: Promise.resolve({ article: "dust-mite-allergies" }),
          }),
        ),
      );

      const newsArticleHtml = renderToStaticMarkup(
        providerWrap(
          createElement(NewsArticleView, { id: NEWS_ARTICLES[0].slug }),
        ),
      );

      const surfaces = [
        ["topic-guide", topicGuideHtml],
        ["topic-summary", topicSummaryHtml],
        ["health-article", healthArticleHtml],
        ["news-article", newsArticleHtml],
      ] as const;

      for (const [surfaceName, html] of surfaces) {
        expect(html, `${surfaceName} (${lang}) missing max-w-3xl`).toContain("max-w-3xl");
        expect(html, `${surfaceName} (${lang}) missing column marker`).toContain(
          "data-health-article-column",
        );
        expect(html, `${surfaceName} (${lang}) missing 18px prose`).toContain(
          "text-[1.125rem] leading-[1.75] text-foreground",
        );
        expect(html, `${surfaceName} (${lang}) missing measure constraint`).toContain(
          "max-w-[65ch]",
        );
        expect(html, `${surfaceName} (${lang}) missing TopicNextSteps`).toContain(
          'id="next-steps-heading"',
        );
        expect(html, `${surfaceName} (${lang}) missing safety disclaimer`).toContain(
          'data-testid="medical-safety-disclaimer"',
        );
        expect(html, `${surfaceName} (${lang}) missing Listen button`).toContain(
          'aria-pressed="false"',
        );
        expect(html, `${surfaceName} (${lang}) missing 48px target`).toContain("min-h-12");

        expect(html, `${surfaceName} (${lang}) must not use 2-col sidebar`).not.toContain(
          "lg:grid-cols-[1fr_320px]",
        );
        expect(html, `${surfaceName} (${lang}) must not use fixed bottom bar`).not.toContain(
          "data-bottom-bar",
        );
        {
          // Pill shapes are allowed only inside two-way capsule switches (track, thumb, two options).
          const pillCount = html.split("rounded-full").length - 1;
          const switchCount = html.split("data-capsule-switch").length - 1;
          expect(pillCount, `${surfaceName} (${lang}) must not use rounded-full pills`).toBe(switchCount * 4);
        }
        expect(html, `${surfaceName} (${lang}) must not use middle dot separators`).not.toContain(
          "\u00b7",
        );
      }
    },
  );
});
