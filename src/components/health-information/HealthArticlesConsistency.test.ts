import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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
import { PageHeader } from "@/components/ui/PageHeader";

const ALL_LANGS: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];
const readSrc = (relPath: string) => readFileSync(resolve(process.cwd(), relPath), "utf8");

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
    "renders identical centred single-column structure, 18px prose, audio action, next-steps, and zero UI clutter in %s",
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
        expect(html, `${surfaceName} (${lang}) missing the reading column width`).toContain("max-w-[44rem]");
        expect(html, `${surfaceName} (${lang}) missing column marker`).toContain(
          "data-health-article-column",
        );
        expect(html, `${surfaceName} (${lang}) missing 18px prose`).toContain(
          "text-reading text-foreground",
        );
        expect(html, `${surfaceName} (${lang}) missing measure constraint`).toContain(
          "max-w-(--measure-reading)",
        );
        if (surfaceName === "news-article") {
          expect(html, `${surfaceName} (${lang}) must not embed TopicNextSteps detours`).not.toContain(
            'id="next-steps-heading"',
          );
          expect(html, `${surfaceName} (${lang}) must not push online doctor`).not.toContain(
            "/medic-online",
          );
        } else {
          expect(html, `${surfaceName} (${lang}) missing TopicNextSteps`).toContain(
            'id="next-steps-heading"',
          );
        }
        expect(html, `${surfaceName} (${lang}) missing safety disclaimer`).toContain(
          'data-testid="medical-safety-disclaimer"',
        );
        expect(html, `${surfaceName} (${lang}) missing Listen button`).toContain(
          'aria-pressed="false"',
        );
        expect(html, `${surfaceName} (${lang}) missing 48px target`).toContain("min-h-12");
        // Content is one centred column; the side table of contents was removed on every width.
        expect(html, `${surfaceName} (${lang}) still renders the side TOC rail`).not.toContain(
          "data-health-toc-rail",
        );
        expect(html, `${surfaceName} (${lang}) reading column is not centred`).toContain("mx-auto w-full max-w-[44rem]");

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

  it("guards PageHeader and HealthArticleHeader against crushed text columns, dead voids, and empty action strips", () => {
    const pageHeaderSrc = readSrc("src/components/ui/PageHeader.tsx");
    expect(pageHeaderSrc).not.toContain("lg:flex lg:items-end lg:justify-between");
    expect(pageHeaderSrc).not.toContain("lg:shrink-0");
    expect(pageHeaderSrc).toContain("max-w-(--measure-lead)");
    expect(pageHeaderSrc).toContain("[&:not(:has(*))]:hidden");

    const renderedPageHeader = renderToStaticMarkup(
      createElement(PageHeader, {
        title: "Sample page",
        lead: "Supporting summary paragraph.",
        actions: createElement("button", { type: "button" }, "Listen"),
      }),
    );
    expect(renderedPageHeader).toMatch(/<header[^>]*><h1\b/);
    expect(renderedPageHeader).toContain("max-w-(--measure-lead)");
    expect(renderedPageHeader).not.toContain("lg:shrink-0");

    const shellSrc = readSrc("src/components/health-information/HealthArticleShell.tsx");
    expect(shellSrc).toContain("md:grid-cols-[minmax(0,1fr)_min(13rem,32%)]");
    expect(shellSrc).not.toContain("sm:grid-cols-");
    expect(shellSrc).toContain("text-page text-foreground [overflow-wrap:break-word]");
    expect(shellSrc).not.toContain("text-display text-foreground");
    expect(shellSrc).toContain("max-w-(--measure-reading) text-pretty text-lead");
    expect(shellSrc).toContain("border-b border-border pb-6 pt-1 sm:pb-7");
    expect(shellSrc).toContain("[&:not(:has(*))]:hidden");
  });

  it("enforces wrapping self-sized single-line buttons and balanced layout for stroke and graves-disease across all 7 locales", async () => {
    const offlineActionsSrc = readSrc(
      "src/components/health-information/GuideOfflinePrintActions.tsx",
    );
    expect(offlineActionsSrc).not.toContain("grid-cols-2");
    expect(offlineActionsSrc).toContain("flex-wrap items-center gap-2.5");
    expect(offlineActionsSrc).toContain("btn-row");
    expect(offlineActionsSrc).toContain("text-body font-semibold");
    expect(offlineActionsSrc).toContain("rounded-(--radius-control)");
    expect(offlineActionsSrc).toContain("border-border-control");
    expect(offlineActionsSrc).toContain("whitespace-nowrap");
    expect(offlineActionsSrc).toContain("w-0 min-w-full basis-full");

    const toolbarSrc = readSrc("src/components/health-information/SubjectHeaderToolbar.tsx");
    expect(toolbarSrc).toContain("btn-row flex w-full flex-wrap items-start gap-2.5");
    expect(toolbarSrc).not.toContain("sm:justify-between");
    expect(toolbarSrc).not.toContain("border-sapphire/35!");
    expect(toolbarSrc).not.toContain("bg-sapphire-soft/45!");

    for (const lang of ALL_LANGS) {
      state.lang = lang;
      for (const articleId of ["stroke", "graves-disease"] as const) {
        const html = renderToStaticMarkup(
          createElement(
            LanguageContext.Provider,
            { value: { lang, t: translations[lang], setLang: () => {} } },
            await HealthArticlePage({
              params: Promise.resolve({ article: articleId }),
            }),
          ),
        );
        expect(html, `${articleId} (${lang}) must keep centred 44rem column`).toContain(
          "mx-auto w-full max-w-[44rem]",
        );
        expect(html, `${articleId} (${lang}) must keep text-page h1`).toContain(
          "text-balance text-page text-foreground",
        );
        expect(html, `${articleId} (${lang}) must keep full-measure lead`).toContain(
          "max-w-(--measure-reading) text-pretty text-lead",
        );
        expect(html, `${articleId} (${lang}) must not crush actions in grid-cols-2`).not.toContain(
          "grid-cols-2",
        );
        expect(html, `${articleId} (${lang}) must not use lg:shrink-0`).not.toContain(
          "lg:shrink-0",
        );
        expect(html, `${articleId} (${lang}) must remove extra top margin on first section`).toContain(
          "mt-10 first:mt-0",
        );
        expect(html, `${articleId} (${lang}) must keep wrap-safe source links`).toContain(
          "[overflow-wrap:anywhere]",
        );
        expect(html, `${articleId} (${lang}) must not render rounded-full pills`).not.toContain(
          "rounded-full",
        );
        expect(html, `${articleId} (${lang}) must not use middle dots`).not.toContain("\u00b7");
      }
    }
  });

  it("preserves article sources footer in High Contrast and Print and bounds floating popovers/jump-bars", () => {
    const css = readSrc("src/app/globals.css");
    expect(css).toContain("html[data-high-contrast]:not(.dark) article footer");
    expect(css).toContain("footer:not(article footer):not(.print-block)");
    expect(css).toContain("article:not(:has(section))");
    expect(css).toContain("break-after: avoid");

    const readerSrc = readSrc(
      "src/components/health-information/SynchronizedSentenceReader.tsx",
    );
    expect(readerSrc).toContain("sm:max-w-[calc(100vw-2rem)]");

    const jumpBarSrc = readSrc(
      "src/components/health-information/MobileGuideJumpBar.tsx",
    );
    expect(jumpBarSrc).toContain("sm:max-w-[calc(100vw-2rem)]");
  });
});
