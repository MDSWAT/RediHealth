import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FindHelpExplorer } from "@/components/find-help/FindHelpExplorer";
import {
  LocationFilterPopover,
  type LocationFilterPopoverProps,
} from "@/components/find-help/LocationFilterPopover";
import { FilterDropdown, FilterMenuGroup, FilterMenuOption } from "@/components/ui/FilterDropdown";
import { SUPPORTED_COUNTRIES, type CountryCode } from "@/lib/countries";
import { REGIONAL_CITY_PRESETS, findHelpTranslations } from "@/lib/i18n/find-help-translations";
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
      expect(closedButtons[0].attrs).toContain('aria-expanded="false"');
      expect(closedButtons[0].attrs).toContain(`aria-label="${copy.locationLabel}: ${cityDisplay}"`);
      expect(closedCityHtml).toContain(`${copy.locationLabel}:`);
      expect(closedCityHtml).toContain(cityDisplay);

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
      expect(html).toContain("border-border-control");
      expect(html).toContain("focus-visible:ring-ring");
      expect(html).toContain("whitespace-nowrap");
      expect(html).toContain("items-baseline");
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
});
