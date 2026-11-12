import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { languages, translations, type Lang } from "@/lib/i18n/translations";
import { LanguageContext } from "@/lib/i18n/language-context";
import { HealthArticleDirectory } from "@/components/health-information/HealthArticleDirectory";
import { healthArticleCopy } from "@/lib/i18n/health-article-translations";
import { getHealthArticle } from "@/lib/data/health-articles";
import { healthArticleIndex } from "@/lib/data/health-article-index";
import { healthContentLanguageNotice } from "@/lib/i18n/health-content-language";

const state = vi.hoisted(() => ({ lang: "ro" as Lang }));
vi.mock("@/lib/i18n/server-routing", async () => ({ getRequestLang: async () => state.lang,
  withLangPrefix: (await import("@/lib/i18n/routing")).withLangPrefix }));
import Page, { generateMetadata, generateStaticParams } from "./page";

describe("individual article reading", () => {
  it.each(["hr", "rom"] as const)("serves the actual %s article when its translation is registered", async code => {
    state.lang = code;
    const article = await getHealthArticle(code, "acne");
    const english = await getHealthArticle("en", "acne");
    const html = renderToStaticMarkup(await Page({ params: Promise.resolve({ article: "acne" }) }));
    expect(article!.contentLanguage).toBe(code);
    expect(article!.intro).not.toBe(english!.intro);
    expect(html).toContain(`lang="${code}"`);
    expect(html).not.toContain(healthContentLanguageNotice(code));
  });
  it.each(["hr", "rom"] as const)("identifies English library content on the %s route", async code => {
    state.lang = code;
    const article = await getHealthArticle(code, "dust-mite-allergies");
    const html = renderToStaticMarkup(await Page({ params: Promise.resolve({ article: "dust-mite-allergies" }) }));
    expect(article!.contentLanguage).toBe("en");
    expect(html).toContain('lang="en"');
    expect(html).toContain(healthContentLanguageNotice(code));
  });
  it.each(languages)("renders all $code content locally, with outgoing sources only in the bottom footer", async ({ code }) => {
    state.lang = code;
    const props = { params: Promise.resolve({ article: "dust-mite-allergies" }) };
    const html = renderToStaticMarkup(await Page(props));
    const article = await getHealthArticle(code, "dust-mite-allergies");
    expect(html).toContain(article!.title.replaceAll("&", "&amp;").replaceAll("'", "&#x27;"));
    expect(html).toContain(healthArticleCopy[code].examples);
    expect(html).toContain(healthArticleCopy[code].review);
    expect(html).toContain(`href="/${code}/health-information#health-articles"`);
    const footerIndex = html.indexOf("<footer");
    expect(footerIndex).toBeGreaterThan(html.indexOf('id="article-examples"'));
    expect(html.slice(0, footerIndex)).not.toMatch(/href="https?:/);
    expect(html.slice(footerIndex)).toContain('href="https://www.informedhealth.org/dust-mite-allergies.html"');
    expect((await generateMetadata(props)).alternates).toMatchObject({ canonical: expect.stringContaining(`/${code}/health-information/articles/dust-mite-allergies`) });
  });
  it("links category results to local articles and includes the full manifest in static parameters", () => {
    const html = renderToStaticMarkup(createElement(LanguageContext.Provider, { value: { lang: "ro", t: translations.ro, setLang: () => {} } }, createElement(HealthArticleDirectory, { areaId: "allergies" })));
    expect(html).toContain('href="/ro/health-information/articles/dust-mite-allergies"');
    expect(html).not.toMatch(/href="https?:/);
    expect(generateStaticParams()).toHaveLength(healthArticleIndex.length);
  });
  it("returns 404 for an unknown article", async () => {
    await expect(Page({ params: Promise.resolve({ article: "does-not-exist" }) })).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });
});
