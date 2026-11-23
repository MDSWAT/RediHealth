import { readFileSync } from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement("a", { href, ...rest }, children),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: () => {},
    replace: () => {},
    prefetch: () => {},
    back: () => {},
  }),
  usePathname: () => "/stiri",
  useSearchParams: () => new URLSearchParams(),
}));

import { NewsArticleView } from "@/components/news/NewsArticleView";
import { NewsHub } from "@/components/news/NewsHub";
import { newsForPlace } from "@/components/news/PlaceNewsModal";
import {
  buildCaravanIcs,
  caravanDirectionsUrl,
  escapeIcsText,
  foldIcsLine,
  parseCaravanHours,
} from "@/components/news/caravan-calendar";
import { NEWS_ARTICLES, articleCountry, type NewsArticle } from "@/lib/data/news";
import { LanguageContext } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";

const ALL_LANGS: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];

function withLang(lang: Lang, child: React.ReactNode) {
  return React.createElement(
    LanguageContext.Provider,
    {
      value: {
        lang,
        setLang: () => {},
        t: translations[lang],
      },
    },
    child,
  );
}

describe("caravan-calendar RFC 5545 helpers", () => {
  test("parses standard, em-dash, and parenthetical Albanian schedule strings", () => {
    expect(parseCaravanHours("09:00 – 16:30")).toEqual({
      startHour: 9,
      startMinute: 0,
      endHour: 16,
      endMinute: 30,
    });
    expect(parseCaravanHours("09:00 - 15:30 (vineri și sâmbătă)")).toEqual({
      startHour: 9,
      startMinute: 0,
      endHour: 15,
      endMinute: 30,
    });
    expect(parseCaravanHours("8:30 — 14:15")).toEqual({
      startHour: 8,
      startMinute: 30,
      endHour: 14,
      endMinute: 15,
    });
    expect(parseCaravanHours("16:00 – 09:00")).toBeNull();
    expect(parseCaravanHours("tot weekendul")).toBeNull();
  });

  test("escapes commas, semicolons, backslashes, newlines, and control chars", () => {
    expect(escapeIcsText("Barcea, Galați; Cămin\\1\r\nEtaj 2\u0007")).toBe(
      "Barcea\\, Galați\\; Cămin\\\\1\\nEtaj 2",
    );
  });

  test("folds multi-byte UTF-8 lines within 75 octets without splitting code points", () => {
    const raw =
      "DESCRIPTION:Caravană medicală în Tiranë, Shqipëria, București — consultații gratuite pentru familie și copii";
    const folded = foldIcsLine(raw);
    const segments = folded.split("\r\n");

    expect(segments.length).toBeGreaterThan(1);
    for (let i = 0; i < segments.length; i++) {
      expect(Buffer.byteLength(segments[i], "utf8")).toBeLessThanOrEqual(75);
      if (i > 0) {
        expect(segments[i].startsWith(" ")).toBe(true);
      }
    }

    const unfolded = segments.map((s, i) => (i === 0 ? s : s.slice(1))).join("");
    expect(unfolded).toBe(raw);
  });

  test("builds valid CRLF VCALENDAR/VEVENT payloads for all caravan articles", () => {
    const caravans = NEWS_ARTICLES.filter((a) => Boolean(a.caravanDetails));
    expect(caravans.length).toBeGreaterThan(0);

    for (const article of caravans) {
      const ics = buildCaravanIcs(article, {
        url: `https://redihealth.org/stiri/${article.slug}`,
        now: new Date("2026-11-10T10:00:00Z"),
      });

      expect(ics.endsWith("\r\n")).toBe(true);
      expect(ics.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);

      const lines = ics.slice(0, -2).split("\r\n");
      for (const line of lines) {
        expect(Buffer.byteLength(line, "utf8")).toBeLessThanOrEqual(75);
      }

      expect(ics).toContain("BEGIN:VCALENDAR\r\n");
      expect(ics).toContain("VERSION:2.0\r\n");
      expect(ics).toContain("BEGIN:VEVENT\r\n");
      expect(ics).toContain(`UID:${article.slug}-`);
      expect(ics).toContain("DTSTAMP:20261110T100000Z\r\n");
      expect(ics).toContain("DTSTART:");
      expect(ics).toContain("DTEND:");
      expect(ics).toContain("SUMMARY:");
      expect(ics).toContain("LOCATION:");
      expect(ics).toContain("STATUS:CONFIRMED\r\n");
      expect(ics).toContain("END:VEVENT\r\n");
      expect(ics).toContain("END:VCALENDAR\r\n");
    }
  });

  test("falls back to VALUE=DATE when caravan hours are unparseable", () => {
    const sample: NewsArticle = {
      ...NEWS_ARTICLES.find((a) => Boolean(a.caravanDetails))!,
      date: "2026-11-30",
      caravanDetails: {
        village: "Barcea",
        landmark: "Cămin cultural",
        hours: "program anunțat local",
        freeServices: ["EKG"],
      },
    };
    const ics = buildCaravanIcs(sample, { now: new Date("2026-11-10T10:00:00Z") });
    expect(ics).toContain("DTSTART;VALUE=DATE:20261130\r\n");
    expect(ics).toContain("DTEND;VALUE=DATE:20261201\r\n");
  });

  test("builds Google Maps directions query without repeating area or whole-country sentinels", () => {
    const alCaravan = NEWS_ARTICLES.find((a) => Boolean(a.caravanDetails) && articleCountry(a) === "al")!;
    expect(alCaravan).toBeDefined();
    const alUrl = caravanDirectionsUrl(alCaravan);
    expect(alUrl).toContain("https://www.google.com/maps/search/?api=1&query=");
    expect(decodeURIComponent(alUrl)).toContain("Albania");

    const wideUrl = caravanDirectionsUrl({
      county: "Toate județele",
      country: "ro",
      caravanDetails: {
        village: "Barcea",
        landmark: "Primărie",
        hours: "09:00 – 16:00",
        freeServices: [],
      },
    });
    expect(decodeURIComponent(wideUrl)).toBe("https://www.google.com/maps/search/?api=1&query=Barcea, Romania");
  });
});

describe("NewsHub inline live-filtered feed (#9)", () => {
  test("removes modal popping and slice(0, 3) truncation from NewsHub while preserving PlaceNewsModal", () => {
    const hubSource = readFileSync(path.join(process.cwd(), "src/components/news/NewsHub.tsx"), "utf8");
    const modalSource = readFileSync(path.join(process.cwd(), "src/components/news/PlaceNewsModal.tsx"), "utf8");

    expect(hubSource).not.toContain("<PlaceNewsModal");
    expect(hubSource).not.toContain(".slice(0, 3)");
    expect(modalSource).toContain("export function PlaceNewsModal");
    expect(modalSource).toContain("export function newsForPlace");
    expect(modalSource).toContain("export function placeCountry");
  });

  test("renders all local and national items for the selected place without slice(0, 3) truncation", () => {
    const roArticles = NEWS_ARTICLES.filter((a) => articleCountry(a) === "ro");
    const bucGroups = newsForPlace("București", roArticles, "ro");
    const expectedArticles = [...bucGroups.local, ...bucGroups.national];
    expect(expectedArticles.length).toBeGreaterThan(3);

    const html = renderToStaticMarkup(withLang("ro", React.createElement(NewsHub)));
    for (const article of expectedArticles) {
      expect(html).toContain(article.slug);
    }

    const hrArticles = NEWS_ARTICLES.filter((a) => articleCountry(a) === "hr");
    expect(hrArticles.length).toBeGreaterThan(3);
    const hrHtml = renderToStaticMarkup(withLang("hr", React.createElement(NewsHub)));
    for (const article of hrArticles) {
      expect(hrHtml).toContain(article.slug);
    }
  });

  test.each(ALL_LANGS)("SSR renders inline feed with collapsible filters and zero modals in %s", (lang) => {
    const html = renderToStaticMarkup(withLang(lang, React.createElement(NewsHub)));

    expect(html).not.toContain('role="dialog"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-controls="news-filters-panel"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('id="news-category-select"');
    expect(html).toContain('value="all"');
    expect(html).toContain("whitespace-nowrap");
    expect(html).not.toContain("rounded-full");
    expect(html).not.toContain("\u00b7");

    if (lang === "sq") {
      expect(html.toLowerCase()).not.toContain("ndërmjetës");
    }
  });
});

describe("NewsArticleView actionable civic caravan pass (#10)", () => {
  const caravanArticles = NEWS_ARTICLES.filter((a) => Boolean(a.caravanDetails));
  const primaryCaravan = caravanArticles[0]!;

  test.each(ALL_LANGS)(
    "SSR renders Directions, Save reminder, FamilyShareButton and consistency invariants in %s",
    (lang) => {
      const html = renderToStaticMarkup(
        withLang(lang, React.createElement(NewsArticleView, { id: primaryCaravan.slug })),
      );

      expect(html).toContain("data-health-article-column");
      expect(html).not.toContain('id="next-steps-heading"');
      expect(html).not.toContain("/medic-online");
      expect(html).toContain('data-testid="medical-safety-disclaimer"');
      expect(html).toContain("https://www.google.com/maps/search/?api=1");
      expect(html).toContain("whitespace-nowrap");
      expect(html).toContain("min-h-11");
      expect(html).not.toContain("rounded-full");
      expect(html).not.toContain("\u00b7");

      const plainText = html.replace(/<[^>]+>/g, " ");
      expect(plainText).not.toContain("&amp;");
      if (lang === "sq") {
        expect(plainText.toLowerCase()).not.toContain("ndërmjetës");
      }
    },
  );

  test("keeps NewsArticleView metadata wrap-safe, removes decorative icons, and provides single-line print action", () => {
    const viewSrc = readFileSync(
      path.join(process.cwd(), "src/components/news/NewsArticleView.tsx"),
      "utf8",
    );
    expect(viewSrc).not.toContain("border-l border-border pl-3");
    expect(viewSrc).not.toContain("<PinIcon");
    expect(viewSrc).not.toContain("<ClockIcon");
    expect(viewSrc).toContain("btn-row flex w-full flex-wrap items-start gap-2.5");
    expect(viewSrc).toContain("mt-7 space-y-5 sm:mt-8");
    expect(viewSrc).toContain('<div className="print:hidden">');
    expect(viewSrc).not.toContain("минута чтения");

    const standardArticle = NEWS_ARTICLES.find((a) => !a.caravanDetails)!;
    for (const lang of ALL_LANGS) {
      const html = renderToStaticMarkup(
        withLang(lang, React.createElement(NewsArticleView, { id: standardArticle.slug })),
      );
      expect(html).toContain("data-health-article-column");
      expect(html).toContain("btn-row flex w-full flex-wrap items-start gap-2.5");
      expect(html).toContain("whitespace-nowrap");
      expect(html).toContain("min-h-11");
      expect(html).not.toContain("border-l border-border pl-3");
      expect(html).not.toContain("rounded-full");
      expect(html).not.toContain("\u00b7");
      const plainText = html.replace(/<[^>]+>/g, " ");
      expect(plainText).not.toContain("&amp;");
    }
  });
});
