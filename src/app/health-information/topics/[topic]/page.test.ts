import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { languages, translations, type Lang } from "@/lib/i18n/translations";
import { LanguageContext } from "@/lib/i18n/language-context";
import { InformedHealthDirectory } from "@/components/health-information/InformedHealthDirectory";
import { getHealthSummary } from "@/lib/data/health-summaries";
import { healthSummaryCopy } from "@/lib/i18n/health-summary-translations";

const state = vi.hoisted(() => ({ lang: "ro" as Lang }));
vi.mock("@/lib/i18n/server-routing", async () => ({
  getRequestLang: async () => state.lang,
  withLangPrefix: (await import("@/lib/i18n/routing")).withLangPrefix,
}));
import Page, { generateMetadata, generateStaticParams } from "./page";

describe("on-site health summary reading", () => {
  it.each(languages)("renders the $code summary locally and places the source in its footer", async ({ code }) => {
    state.lang = code;
    const props = { params: Promise.resolve({ topic: "allergies" }) };
    const html = renderToStaticMarkup(createElement(LanguageContext.Provider, { value: { lang: code, t: translations[code], setLang: () => {} } }, await Page(props)));
    const summary = getHealthSummary(code, "allergies")!;
    expect(html).toContain(summary.title);
    expect(html).toContain(healthSummaryCopy[code].questions);
    expect(html).toContain(`href="/${code}/health-information#informedhealth-library"`);
    const footer = html.slice(html.indexOf("<footer"));
    expect(footer).toContain('href="https://www.informedhealth.org/topic-areas/allergies.html"');
    expect(html.slice(0, html.indexOf("<footer"))).not.toContain('href="https://www.informedhealth.org');
    expect((await generateMetadata(props)).alternates).toMatchObject({ canonical: expect.stringContaining(`/${code}/health-information/topics/allergies`) });
  });

  it("links the directory into RediHealth and includes all summaries in static parameters", () => {
    const html = renderToStaticMarkup(createElement(LanguageContext.Provider, { value: { lang: "ro", t: translations.ro, setLang: () => {} } }, createElement(InformedHealthDirectory)));
    expect(html).toContain('href="/ro/health-information/topics/allergies"');
    expect(html).not.toContain('href="https://www.informedhealth.org');
    expect(generateStaticParams()).toHaveLength(51);
  });

  it("returns not-found for an unknown topic instead of showing an English fallback", async () => {
    state.lang = "ro";
    await expect(Page({ params: Promise.resolve({ topic: "does-not-exist" }) })).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });
});
