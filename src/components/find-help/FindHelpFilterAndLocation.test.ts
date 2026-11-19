import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/find-help",
}));

import { FindHelpExplorer, PlaceCardActions } from "@/components/find-help/FindHelpExplorer";
import { FindHelpPageContent } from "@/components/find-help/FindHelpPageContent";
import {
  LocationFilterPopover,
  type LocationFilterPopoverProps,
} from "@/components/find-help/LocationFilterPopover";
import { FilterDropdown, FilterMenuGroup, FilterMenuOption } from "@/components/ui/FilterDropdown";
import { SUPPORTED_COUNTRIES, type CountryCode } from "@/lib/countries";
import {
  REGIONAL_CITY_PRESETS,
  findHelpTranslations,
  formatHumanDistance,
} from "@/lib/i18n/find-help-translations";
import { LanguageContext } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";
import { resolveSmartLocation } from "@/lib/smart-location";

const ROOT = process.cwd();
const ALL_LANGS: readonly Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];
const ALL_PRESET_CITY_NAMES = SUPPORTED_COUNTRIES.flatMap((country) =>
  REGIONAL_CITY_PRESETS[country].map((city) => city.name),
);

function readSrc(relPath: string): string {
  return readFileSync(resolve(ROOT, relPath), "utf8");
}

function renderWithLang(lang: Lang, element: ReturnType<typeof createElement>): string {
  return renderToStaticMarkup(
    createElement(
      LanguageContext.Provider,
      { value: { lang, t: translations[lang], setLang: () => {} } },
      element,
    ),
  );
}

function decodeHtmlEntities(value: string): string {
  return value
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

function extractButtons(html: string): { attrs: string; text: string }[] {
  const buttons: { attrs: string; text: string }[] = [];
  for (const match of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
    const rawText = match[2].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    buttons.push({
      attrs: match[1],
      text: decodeHtmlEntities(rawText),
    });
  }
  return buttons;
}

function extractVisibleText(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function extractAttributeValues(html: string, attrNames: readonly string[]): string[] {
  const values: string[] = [];
  const pattern = new RegExp(`\\b(?:${attrNames.join("|")})="([^"]*)"`, "g");
  for (const match of html.matchAll(pattern)) {
    values.push(decodeHtmlEntities(match[1]));
  }
  return values;
}

function assertCleanButtons(html: string, contextLabel: string): { attrs: string; text: string }[] {
  const buttons = extractButtons(html);
  expect(buttons.length, `${contextLabel}: expected at least one <button>`).toBeGreaterThan(0);
  for (const button of buttons) {
    expect(button.attrs, `${contextLabel} button "${button.text}" missing whitespace-nowrap`).toContain("whitespace-nowrap");
    expect(button.attrs, `${contextLabel} button "${button.text}" missing 44px/48px touch target`).toMatch(/\bmin-h-(?:11|12)\b/);
    expect(button.attrs, `${contextLabel} button "${button.text}" missing focus-visible:ring-ring`).toContain("focus-visible:ring-ring");
  }
  return buttons;
}

function buildLocationPopoverProps(
  lang: Lang,
  overrides: Partial<LocationFilterPopoverProps> = {},
): LocationFilterPopoverProps {
  const copy = findHelpTranslations[lang];
  const activeCountry: CountryCode = overrides.activeCountry ?? "IT";
  const wholeCountrySelected = overrides.wholeCountrySelected ?? false;
  const activeCityName =
    overrides.activeCityName !== undefined
      ? overrides.activeCityName
      : wholeCountrySelected
        ? null
        : REGIONAL_CITY_PRESETS[activeCountry][0].name;
  const displayValue =
    overrides.displayValue ??
    (activeCityName ? `${activeCityName}, ${copy.countries[activeCountry]}` : copy.countries[activeCountry]);

  return {
    id: "find-help-location",
    defaultOpen: false,
    label: copy.locationLabel,
    displayValue,
    activeCountry,
    wholeCountrySelected,
    activeCityName,
    gpsActive: false,
    locating: false,
    countries: copy.countries,
    countryGroupLabel: copy.countryLabel,
    cityGroupLabel: copy.cityQuickJumpLabel,
    useMyLocationLabel: copy.useMyLocation,
    locatingLabel: copy.locating,
    wholeCountryOption: copy.wholeCountryOption,
    onSelectCountry: () => {},
    onSelectCity: () => {},
    onLocateUser: () => {},
    ...overrides,
  };
}

describe("FindHelp location popover, inline FilterDropdown, and filter toolbar", () => {
  it("renders LocationFilterPopover closed and open across all 7 locales with Country before City and clean controls", () => {
    for (const lang of ALL_LANGS) {
      const copy = findHelpTranslations[lang];
      const resolved = resolveSmartLocation({ lang });
      const activeCountry = resolved.country;
      const activeCityName = resolved.city?.name ?? REGIONAL_CITY_PRESETS[activeCountry][0].name;
      const cityDisplay = `${activeCityName}, ${copy.countries[activeCountry]}`;

      // Closed state with City, Country trigger value
      const closedCityHtml = renderToStaticMarkup(
        createElement(
          LocationFilterPopover,
          buildLocationPopoverProps(lang, {
            defaultOpen: false,
            activeCountry,
            activeCityName,
            wholeCountrySelected: false,
            displayValue: cityDisplay,
          }),
        ),
      );

      expect(closedCityHtml).not.toContain("rounded-full");
      expect(closedCityHtml).not.toContain("&");
      expect(closedCityHtml).not.toContain("\u00b7");
      expect(closedCityHtml).not.toContain('role="group"');
      const closedButtons = assertCleanButtons(closedCityHtml, `${lang} closed LocationFilterPopover`);
      expect(closedButtons).toHaveLength(1);
      expect(closedButtons[0].attrs).toContain("min-h-12");
      expect(closedButtons[0].attrs).toContain("rounded-(--radius-control)");
      expect(closedButtons[0].attrs).toContain('aria-expanded="false"');
      expect(closedButtons[0].attrs).toContain(`aria-label="${copy.locationLabel}: ${cityDisplay}"`);
      expect(closedCityHtml).toContain(`${copy.locationLabel}:`);
      expect(closedCityHtml).toContain(cityDisplay);
      expect(closedCityHtml).toContain("items-baseline");
      expect(closedCityHtml).toContain("text-body");
      expect(closedCityHtml).not.toContain("whitespace-normal");
      expect(closedCityHtml).not.toContain("flex-wrap items-baseline");

      // Closed state with Country-only trigger value
      const closedCountryHtml = renderToStaticMarkup(
        createElement(
          LocationFilterPopover,
          buildLocationPopoverProps(lang, {
            defaultOpen: false,
            activeCountry,
            activeCityName: null,
            wholeCountrySelected: true,
            displayValue: copy.countries[activeCountry],
          }),
        ),
      );
      expect(closedCountryHtml).toContain(copy.countries[activeCountry]);
      expect(closedCountryHtml).toContain('aria-expanded="false"');
      expect(closedCountryHtml).not.toContain("rounded-full");
      expect(closedCountryHtml).not.toContain("&");
      expect(closedCountryHtml).not.toContain("\u00b7");

      // Open state across all 7 locales
      const openHtml = renderToStaticMarkup(
        createElement(
          LocationFilterPopover,
          buildLocationPopoverProps(lang, {
            defaultOpen: true,
            activeCountry,
            activeCityName,
            wholeCountrySelected: false,
            displayValue: cityDisplay,
          }),
        ),
      );

      expect(openHtml).not.toContain("rounded-full");
      expect(openHtml).not.toContain("&");
      expect(openHtml).not.toContain("\u00b7");

      const openButtons = assertCleanButtons(openHtml, `${lang} open LocationFilterPopover`);
      expect(openButtons[0].attrs).toContain("min-h-12");
      expect(openButtons[0].attrs).toContain('aria-expanded="true"');

      // GPS action first, then Country group, then City group
      const gpsIndex = openHtml.indexOf(copy.useMyLocation);
      const countryGroupIndex = openHtml.indexOf(copy.countryLabel);
      const cityGroupIndex = openHtml.indexOf(copy.cityQuickJumpLabel);
      const wholeCountryText = copy.wholeCountryOption(copy.countries[activeCountry]);
      const wholeCountryIndex = openHtml.indexOf(wholeCountryText);
      expect(gpsIndex).toBeGreaterThan(-1);
      expect(countryGroupIndex).toBeGreaterThan(gpsIndex);
      expect(cityGroupIndex).toBeGreaterThan(countryGroupIndex);
      expect(wholeCountryIndex).toBeGreaterThan(cityGroupIndex);

      const buttonTexts = openButtons.map((button) => button.text);
      expect(buttonTexts).toContain(copy.useMyLocation);
      expect(buttonTexts).toContain(wholeCountryText);

      for (const country of SUPPORTED_COUNTRIES) {
        expect(buttonTexts).toContain(copy.countries[country]);
      }

      const activeCities = REGIONAL_CITY_PRESETS[activeCountry].map((city) => city.name);
      for (const cityName of activeCities) {
        expect(buttonTexts).toContain(cityName);
      }
      for (const foreignCity of ALL_PRESET_CITY_NAMES.filter((name) => !activeCities.includes(name))) {
        expect(buttonTexts, `${lang} open popover leaked foreign city "${foreignCity}"`).not.toContain(foreignCity);
      }

      // Locating + GPS active state preserves button invariants and sentence-cased copy
      const gpsOpenHtml = renderToStaticMarkup(
        createElement(
          LocationFilterPopover,
          buildLocationPopoverProps(lang, {
            defaultOpen: true,
            activeCountry,
            activeCityName: null,
            wholeCountrySelected: false,
            gpsActive: true,
            locating: true,
            displayValue: copy.locating,
          }),
        ),
      );
      expect(gpsOpenHtml).not.toContain("rounded-full");
      expect(gpsOpenHtml).not.toContain("&");
      expect(gpsOpenHtml).not.toContain("\u00b7");
      const gpsButtons = assertCleanButtons(gpsOpenHtml, `${lang} locating LocationFilterPopover`);
      const gpsActionButton = gpsButtons.find((button) => button.text === copy.locating);
      expect(gpsActionButton?.attrs).toContain('aria-pressed="true"');
    }
  });

  it("isolates activeCountry presets on lang='it' with activeCountry='RO' (shows Bucuresti/Cluj-Napoca, excludes Roma/Milano/Tirane)", () => {
    const lang: Lang = "it";
    const copy = findHelpTranslations[lang];
    const html = renderToStaticMarkup(
      createElement(
        LocationFilterPopover,
        buildLocationPopoverProps(lang, {
          defaultOpen: true,
          activeCountry: "RO",
          activeCityName: "București",
          wholeCountrySelected: false,
          displayValue: `București, ${copy.countries.RO}`,
        }),
      ),
    );

    const buttons = assertCleanButtons(html, "it/RO LocationFilterPopover");
    const buttonTexts = buttons.map((button) => button.text);

    expect(buttonTexts).toContain("București");
    expect(buttonTexts).toContain("Cluj-Napoca");
    expect(buttonTexts).toContain(copy.wholeCountryOption(copy.countries.RO));
    expect(buttonTexts).not.toContain("Roma");
    expect(buttonTexts).not.toContain("Milano");
    expect(buttonTexts).not.toContain("Tiranë");

    for (const country of SUPPORTED_COUNTRIES) {
      const countryBtn = buttons.find((button) => button.text === copy.countries[country]);
      expect(countryBtn?.attrs).toContain(`aria-pressed="${country === "RO" ? "true" : "false"}"`);
    }

    const locationPopoverSrc = readSrc("src/components/find-help/LocationFilterPopover.tsx");
    expect(locationPopoverSrc).toContain("[scrollbar-width:thin]");
    expect(locationPopoverSrc).toContain("focus-visible:ring-ring");
    expect(locationPopoverSrc).not.toContain("focus-visible:ring-sapphire");
    expect(locationPopoverSrc).not.toContain("rounded-full");
  });

  it("renders FilterDropdown with inlineLabel: true on a single horizontal baseline while preserving control tokens", () => {
    for (const lang of ALL_LANGS) {
      const copy = findHelpTranslations[lang];
      const html = renderToStaticMarkup(
        createElement(
          FilterDropdown,
          {
            id: `category-${lang}`,
            label: copy.categoryLabel,
            value: copy.allCategories,
            align: "right",
            inlineLabel: true,
          },
          createElement(
            FilterMenuGroup,
            { label: copy.categoryLabel },
            createElement(FilterMenuOption, { selected: true, onSelect: () => {} }, copy.allCategories),
          ),
        ),
      );

      expect(html).toContain("min-h-12");
      expect(html).toContain("rounded-(--radius-control)");
      expect(html).toContain("border-border-control");
      expect(html).toContain("focus-visible:ring-ring");
      expect(html).toContain("whitespace-nowrap");
      expect(html).toContain("items-baseline");
      expect(html).toContain("text-body");
      expect(html).toContain(`${copy.categoryLabel}:`);
      expect(html).toContain(copy.allCategories);
      expect(html).not.toContain("rounded-full");
      expect(html).not.toContain("&");
      expect(html).not.toContain("\u00b7");
    }

    const filterDropdownSrc = readSrc("src/components/ui/FilterDropdown.tsx");
    expect(filterDropdownSrc).toContain("inlineLabel?: boolean");
    expect(filterDropdownSrc).toContain("[scrollbar-width:thin]");
  });

  it("renders FindHelpExplorer SSR markup across all 7 locales with clean filter controls, zero switch/submit bloat, and aligned map/list tops", () => {
    for (const lang of ALL_LANGS) {
      const copy = findHelpTranslations[lang];
      const resolved = resolveSmartLocation({ lang });
      const expectedCity = resolved.city?.name ?? REGIONAL_CITY_PRESETS[resolved.country][0].name;
      const expectedLocationDisplay = `${expectedCity}, ${copy.countries[resolved.country]}`;

      const html = renderWithLang(
        lang,
        createElement(FindHelpExplorer, {
          initialCountry: resolved.country,
        }),
      );

      expect(html).not.toContain('type="submit"');
      expect(html).not.toContain('role="switch"');
      expect(html).not.toContain("aria-checked=");
      expect(html).not.toContain("rounded-full");
      expect(html).not.toContain("mb-3 flex min-h-11");
      expect(html).toMatch(/<div role="status" aria-label="[^"]+"><span class="sr-only">[^<]+<\/span><ul\b/);

      // Location trigger shows City, Country and Category dropdown renders inline label
      expect(html).toContain(`${copy.locationLabel}:`);
      expect(html).toContain(expectedLocationDisplay);
      expect(html).toContain(`${copy.categoryLabel}:`);
      expect(html).toContain(copy.allCategories);

      // Extract the filter toolbar section to validate visible text, attributes, and buttons
      const toolbarMatch = html.match(/<section\b[^>]*>[\s\S]*?<\/section>/);
      expect(toolbarMatch, `${lang}: missing filter toolbar <section>`).not.toBeNull();
      const toolbarHtml = toolbarMatch![0];

      const toolbarText = extractVisibleText(toolbarHtml);
      expect(toolbarText).not.toContain("&");
      expect(toolbarText).not.toContain("\u00b7");

      for (const attrValue of extractAttributeValues(toolbarHtml, ["aria-label", "title", "placeholder"])) {
        expect(attrValue, `${lang}: attribute "${attrValue}" contains &`).not.toContain("&");
        expect(attrValue, `${lang}: attribute "${attrValue}" contains middle dot`).not.toContain("\u00b7");
      }

      const toolbarButtons = assertCleanButtons(toolbarHtml, `${lang} FindHelpExplorer toolbar`);
      expect(toolbarButtons.some((button) => button.text.includes(copy.emergencyWalkInFilter))).toBe(true);
      expect(toolbarButtons.some((button) => button.text.includes(copy.openNowFilter))).toBe(true);
      expect(toolbarButtons.every((button) => !button.attrs.includes('type="submit"'))).toBe(true);
    }

    // Source checks confirming top-edge alignment and city-level country scoping in requestQuery
    const explorerSrc = readSrc("src/components/find-help/FindHelpExplorer.tsx");
    expect(explorerSrc).not.toContain("mb-3 flex min-h-11");
    expect(explorerSrc).not.toContain('type="submit"');
    expect(explorerSrc).not.toContain('role="switch"');
    expect(explorerSrc).not.toContain("smartSuggestions");
    expect(explorerSrc).not.toContain("rounded-full");
    expect(explorerSrc).toContain('if (area.source === "city" && area.country)');
    expect(explorerSrc).toContain('params.set("country", area.country)');
  });

  it("renders full-width Call {number} row without truncation and wraps labeled secondary actions across cards (P07)", () => {
    for (const lang of ALL_LANGS) {
      const copy = findHelpTranslations[lang];
      const formatted = copy.callNumber("+385 1 4660 222");
      expect(formatted).toContain("+385 1 4660 222");
      expect(formatted).not.toContain("&");
      if (lang === "sq") {
        expect(formatted).not.toMatch(/ndërmjetës/i);
      }
    }

    const withPhoneHtml = renderToStaticMarkup(
      createElement(PlaceCardActions, {
        institute: {
          id: "hr-clinic-1",
          country_code: "HR",
          name: "Dom zdravlja",
          category: "clinic",
          address: "Runjaninova 4",
          city: "Zagreb",
          phone: "+385 1 4660 222",
          website: "https://example.hr",
          hours: "Mo-Fr 08:00-20:00",
          emergency: false,
          lat: 45.8,
          lng: 15.97,
        },
        hasPhone: true,
        phoneHref: "tel:+38514660222",
        displayPhone: "+385 1 4660 222",
        shareText: "Runjaninova 4, Zagreb",
        copy: findHelpTranslations.hr,
        lang: "hr",
        stopPropagation: true,
      }),
    );

    expect(withPhoneHtml).toContain("href=\"tel:+38514660222\"");
    expect(withPhoneHtml).toContain("Nazovi +385 1 4660 222");
    expect(withPhoneHtml).toContain("flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap");
    expect(withPhoneHtml).toContain("flex flex-wrap items-center gap-2");
    expect(withPhoneHtml).toContain(">Upute<");
    expect(withPhoneHtml).toContain(">Web stranica<");
    expect(withPhoneHtml).toContain("Pošalji obitelji");
    expect(withPhoneHtml).not.toContain("sr-only");
    expect(withPhoneHtml).not.toContain("truncate font-semibold");

    const noPhoneHtml = renderToStaticMarkup(
      createElement(PlaceCardActions, {
        institute: {
          id: "en-pharm-1",
          country_code: "RO",
          name: "Farmacia Centrala",
          category: "pharmacy",
          address: "Strada Principala 10",
          city: "Cluj-Napoca",
          phone: null,
          website: null,
          hours: null,
          emergency: false,
          lat: 46.77,
          lng: 23.59,
        },
        hasPhone: false,
        phoneHref: null,
        displayPhone: null,
        shareText: "Strada Principala 10, Cluj-Napoca",
        copy: findHelpTranslations.en,
        lang: "en",
      }),
    );

    expect(noPhoneHtml).not.toContain("tel:");
    expect(noPhoneHtml.match(/>Directions</g)?.length).toBe(1);
    expect(noPhoneHtml).toContain("flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap");
    expect(noPhoneHtml).toContain("Send to family");

    const explorerSrc = readSrc("src/components/find-help/FindHelpExplorer.tsx");
    expect(explorerSrc.match(/<PlaceCardActions\b/g)?.length).toBe(2);
  });

  it("folds phone filters into a one-row summary with a sheet-in dialog and uses honest city-centre distances (P21)", () => {
    for (const lang of ALL_LANGS) {
      const copy = findHelpTranslations[lang];
      const near = copy.nearPlace("București");
      expect(near).toContain("București");
      expect(copy.allPlaces.trim().length).toBeGreaterThan(0);
      expect(copy.change.trim().length).toBeGreaterThan(0);
      expect(copy.filtersTitle.trim().length).toBeGreaterThan(0);
      for (const n of [0, 1, 3, 25]) {
        const showLabel = copy.showPlaces(n);
        expect(showLabel).toContain(String(n));
        expect(showLabel).not.toContain("&");
      }
      const centreText = copy.fromCentre("200 m", "București");
      expect(centreText).toContain("200 m");
      expect(centreText).toContain("București");
      expect(centreText).not.toContain("&");
      if (lang === "sq") {
        expect(`${near} ${copy.change} ${centreText}`).not.toMatch(/ndërmjetës/i);
      }

      const html = renderWithLang(
        lang,
        createElement(FindHelpExplorer, {
          initialCountry: "RO",
        }),
      );
      expect(html).toContain("lg:hidden");
      expect(html).toContain("hidden rounded-2xl");
      expect(html).toContain("lg:block");
      expect(html).toContain(copy.allPlaces);
      expect(html).toContain(copy.change);
      expect(html).not.toContain("\u00b7");
    }

    expect(
      formatHumanDistance(0.2, findHelpTranslations.en, "en", {
        allowOver80Km: true,
        centerCity: "Bucharest",
      }),
    ).toBe("about 200 m from Bucharest centre");

    expect(
      formatHumanDistance(2.4, findHelpTranslations.en, "en", {
        allowOver80Km: true,
        centerCity: "Bucharest",
      }),
    ).toBe("about 2.4 km from Bucharest centre");

    expect(
      formatHumanDistance(0.2, findHelpTranslations.ru, "ru", {
        allowOver80Km: true,
        centerCity: "Бухарест",
      }),
    ).toBe("примерно в 200 м от центра города Бухарест");

    expect(
      formatHumanDistance(0.2, findHelpTranslations.en, "en", {
        allowOver80Km: true,
      }),
    ).toBe("200 m away (~3 min walk)");

    expect(findHelpTranslations.ro.resultsCount(0)).toBe("0 locuri");
    expect(findHelpTranslations.ro.resultsCount(1)).toBe("1 loc");
    expect(findHelpTranslations.ro.resultsCount(5)).toBe("5 locuri");
    expect(findHelpTranslations.ro.resultsCount(20)).toBe("20 de locuri");
    expect(findHelpTranslations.ro.resultsCount(100)).toBe("100 de locuri");

    const explorerSrc = readSrc("src/components/find-help/FindHelpExplorer.tsx");
    expect(explorerSrc).toContain("useSheetDialog(filterSheetOpen");
    expect(explorerSrc).toContain("sheet-in");
    expect(explorerSrc).toContain(
      "2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,0.62fr)_auto_auto_auto]",
    );
    expect(readSrc("src/components/find-help/LocationFilterPopover.tsx")).toContain(
      "event.stopPropagation();",
    );
    expect(readSrc("src/components/ui/FilterDropdown.tsx")).toContain(
      "event.stopPropagation();",
    );
  });

  it("surfaces 1-tap category and Open now quick chips on mobile (< lg) synced across all 7 locales", () => {
    for (const lang of ALL_LANGS) {
      const copy = findHelpTranslations[lang];
      const html = renderWithLang(
        lang,
        createElement(FindHelpExplorer, {
          initialCountry: "RO",
          initialCategory: "pharmacy",
        }),
      );

      const groupPattern = new RegExp(
        `<div role="group" aria-label="${copy.filtersTitle}"[^>]*>([\\s\\S]*?)<\\/div>`,
      );
      const groupMatch = html.match(groupPattern);
      expect(groupMatch, `${lang}: missing mobile quick filter chip group`).not.toBeNull();
      const groupHtml = groupMatch![0];

      const chipButtons = assertCleanButtons(groupHtml, `${lang} mobile quick chips`);
      const labels = chipButtons.map((button) => button.text);
      expect(labels).toContain(copy.openNowFilter);
      expect(labels).toContain(copy.allCategories);
      expect(labels).toContain(copy.categories.pharmacy);
      expect(labels).toContain(copy.categories.hospital);
      expect(labels).toContain(copy.categories.gp);
      expect(labels).toContain(copy.categories.clinic);
      expect(labels).toContain(copy.categories.dentist);
      expect(labels).toContain(copy.clearFilters);

      const pharmacyBtn = chipButtons.find((button) => button.text === copy.categories.pharmacy);
      const allBtn = chipButtons.find((button) => button.text === copy.allCategories);
      const openNowBtn = chipButtons.find((button) => button.text === copy.openNowFilter);
      expect(pharmacyBtn?.attrs).toContain('aria-pressed="true"');
      expect(allBtn?.attrs).toContain('aria-pressed="false"');
      expect(openNowBtn?.attrs).toContain('aria-pressed="false"');

      expect(groupHtml).not.toContain("rounded-full");
      expect(groupHtml).not.toContain('role="switch"');
      expect(groupHtml).not.toContain("aria-checked=");
      const groupText = extractVisibleText(groupHtml);
      expect(groupText).not.toContain("&");
      expect(groupText).not.toContain("\u00b7");
      for (const attrValue of extractAttributeValues(groupHtml, ["aria-label", "title"])) {
        expect(attrValue).not.toContain("&");
        expect(attrValue).not.toContain("\u00b7");
      }
      if (lang === "sq") {
        expect(labels.join(" ")).not.toMatch(/ndërmjetës/i);
      }
    }
  });

  it("improves open/closed scanability without dots/pills and unifies bottom guidance cards across all 7 locales", () => {
    const explorerSrc = readSrc("src/components/find-help/FindHelpExplorer.tsx");
    expect(explorerSrc).toContain("border-t border-border/60 pt-2.5 text-body dark:border-ink-800");
    expect(explorerSrc).toContain('<span className="tabular-nums text-muted-foreground">{hours}</span>');
    expect(explorerSrc).toContain('<span className="tabular-nums text-muted-foreground">{previewHours}</span>');
    expect(explorerSrc).not.toContain("transition-all");
    expect(explorerSrc).not.toContain("rounded-full");

    const pageSrc = readSrc("src/components/find-help/FindHelpPageContent.tsx");
    expect(pageSrc).toContain("p-6 sm:p-7");
    expect(pageSrc).not.toContain("p-4 sm:p-7");
    expect(pageSrc).toContain('variant="action"');
    expect(pageSrc).toContain('variant="outline"');
    expect(pageSrc).not.toContain('variant="primary"');
    expect(pageSrc).not.toContain("rounded-full");
    expect(pageSrc).not.toContain("transition-all");

    for (const lang of ALL_LANGS) {
      const copy = findHelpTranslations[lang];
      const pageHtml = renderWithLang(
        lang,
        createElement(FindHelpPageContent, {
          initialCountry: "RO",
        }),
      );

      const guidanceMatch = pageHtml.match(/<section class="border-t border-border bg-muted\/40[\s\S]*<\/section>/);
      expect(guidanceMatch, `${lang}: missing bottom guidance section`).not.toBeNull();
      const guidanceHtml = guidanceMatch![0];
      const guidanceText = extractVisibleText(guidanceHtml);
      expect(guidanceHtml).toContain("p-6 sm:p-7");
      expect(guidanceHtml).toContain(`href="/${lang}/mediatori"`);
      expect(guidanceHtml).toContain(`href="/${lang}/get-help"`);
      expect(guidanceText).toContain(copy.page.mediatorTitle);
      expect(guidanceText).toContain(copy.page.mediatorButton);
      expect(guidanceText).toContain(translations[lang].findHelpPage.ctaTitle);
      expect(guidanceText).toContain(translations[lang].findHelpPage.ctaButton);
      expect(guidanceHtml).toContain("bg-sapphire text-white");
      expect(guidanceHtml).not.toContain("bg-primary");
      expect(guidanceHtml).not.toContain("p-4 sm:p-7");
      expect(guidanceHtml.match(/p-6 sm:p-7/g)?.length).toBe(2);
      expect(guidanceHtml).not.toContain("rounded-full");
      expect(guidanceText).not.toContain("&");
      expect(guidanceText).not.toContain("\u00b7");
      for (const attrValue of extractAttributeValues(guidanceHtml, ["aria-label", "title"])) {
        expect(attrValue).not.toContain("&");
        expect(attrValue).not.toContain("\u00b7");
      }
      if (lang === "sq") {
        expect(guidanceText).not.toMatch(/ndërmjetës/i);
      }
    }
  });
});
