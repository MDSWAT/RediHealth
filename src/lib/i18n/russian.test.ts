import { describe, expect, it } from "vitest";
import { languages, translations } from "./translations";
import { getLangFromPathname, isSupportedLang, stripLangFromPathname, withLangPrefix } from "./routing";
import { getHealthCheckTranslations } from "./health-check-translations";
import { getHealthInformationDictionary } from "./health-information-topics";
import { findHelpTranslations, formatOpeningHours } from "./find-help-translations";
import { panelTranslations, langToLocale } from "./panel-translations";
import { siteMetadata } from "./site-metadata";
import { getHealthMyths, getMythCategories } from "./health-myths";
import { countryForLang } from "@/lib/medical-institutes";
import { buildSystemInstruction, urgentPattern } from "@/lib/health-assistant";
import { classifyLocalIntent } from "@/components/health-assistant/intent-keywords";

const identifiers = new Set(["id", "slug", "href", "actionHref", "assistantHref", "mediatorHref", "icon", "glyph", "applicableSex"]);

function checkContract(english: unknown, russian: unknown, key = "root"): void {
  expect(typeof russian, key).toBe(typeof english);
  if (typeof english === "string") {
    expect((russian as string).match(/\{[A-Za-z][A-Za-z0-9_]*\}/g) ?? [], key)
      .toEqual(english.match(/\{[A-Za-z][A-Za-z0-9_]*\}/g) ?? []);
    if (identifiers.has(key) || english.startsWith("/")) expect(russian, key).toBe(english);
  } else if (Array.isArray(english)) {
    expect(russian, key).toHaveLength(english.length);
    english.forEach((entry, i) => checkContract(entry, (russian as unknown[])[i], key));
  } else if (english && typeof english === "object") {
    expect(Object.keys(russian as object).sort(), key).toEqual(Object.keys(english).sort());
    for (const [name, value] of Object.entries(english)) checkContract(value, (russian as Record<string, unknown>)[name], name);
  }
}

describe("Russian language", () => {
  it("supports Russian URLs, language switching and Moldova's directory", () => {
    expect(languages.find(language => language.code === "ru")?.label).toBe("Русский");
    expect(isSupportedLang("ru")).toBe(true);
    expect(getLangFromPathname("/ru/find-help")).toBe("ru");
    expect(stripLangFromPathname("/ru/panel/patients")).toBe("/panel/patients");
    expect(withLangPrefix("/en/find-help", "ru")).toBe("/ru/find-help");
    expect(countryForLang("ru")).toBe("MD");
    expect(siteMetadata.ru.openGraphLocale).toBe("ru_RU");
    expect(langToLocale.ru).toBe("ru-RU");
    expect(buildSystemInstruction("ru")).toContain("Russian");
  });

  it("preserves translation keys, placeholders and navigation identifiers", () => {
    checkContract(translations.en, translations.ru);
    checkContract(getHealthCheckTranslations("en"), getHealthCheckTranslations("ru"));
    checkContract(getHealthInformationDictionary("en"), getHealthInformationDictionary("ru"));
    checkContract(panelTranslations.en, panelTranslations.ru);
    checkContract(getHealthMyths("en"), getHealthMyths("ru"));
    expect(getHealthMyths("ru").every(myth => /[А-Яа-я]/.test(myth.statement))).toBe(true);
    expect(getMythCategories("ru")[0].label).toBe("Все мифы");
  });

  it("uses Russian plural forms and opening-hour labels", () => {
    const copy = findHelpTranslations.ru;
    expect([1, 2, 5, 11, 21, 22].map(copy.resultsCount)).toEqual(["1 место", "2 места", "5 мест", "11 мест", "21 место", "22 места"]);
    expect(copy.showMore(25)).toBe("Показать ещё 25 мест");
    expect(formatOpeningHours("Su 09:00-12:00; PH off", copy)).toBe("Вс 09:00–12:00; Праздничные дни закрыто");
  });

  it("routes Russian symptoms to the symptom pathway", () => {
    expect(classifyLocalIntent("Болит грудь, трудно дышать", "ru")).toBe("symptoms");
    expect(classifyLocalIntent("Объясните рецепт", "ru")).toBe("prescription");
    expect(classifyLocalIntent("Где найти семейного врача", "ru")).toBe("navigation");
    expect(urgentPattern.test("Боль в груди, трудно дышать")).toBe(true);
    expect(urgentPattern.test("Нет сознания после передозировки")).toBe(true);
  });
});
