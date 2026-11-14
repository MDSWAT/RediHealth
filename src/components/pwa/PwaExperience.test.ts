import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PwaExperience } from "@/components/pwa/PwaExperience";
import { LanguageContext } from "@/lib/i18n/language-context";
import { getPwaCopy } from "@/lib/i18n/pwa-copy";
import { translations, type Lang } from "@/lib/i18n/translations";
import type { InstallPlatform, PwaSnapshot } from "@/lib/pwa/pwa-state";

const state: {
  pathname: string;
  snapshot: PwaSnapshot;
} = {
  pathname: "/ro",
  snapshot: {
    hydrated: true,
    isStandalone: false,
    canInstallNatively: false,
    hasUpdate: false,
    isRefreshing: false,
    bannerVisible: false,
    installDialogOpen: false,
    platform: "desktop-manual",
  },
};

vi.mock("next/navigation", () => ({
  usePathname: () => state.pathname,
}));

vi.mock("next-auth/react", () => ({
  getSession: vi.fn(async () => null),
}));

vi.mock("@/lib/pwa/pwa-state", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/pwa/pwa-state")>();
  return {
    ...actual,
    usePwaSnapshot: () => state.snapshot,
  };
});

const ALL_LANGS: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];
const ALL_PLATFORMS: InstallPlatform[] = [
  "ios-safari",
  "ios-other",
  "in-app-browser",
  "android-manual",
  "macos-safari",
  "desktop-manual",
];

const readSrc = (relPath: string) => readFileSync(resolve(process.cwd(), relPath), "utf8");

function decodeHtml(html: string): string {
  return html
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
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

function assertInteractiveButtonsAccessible(html: string, contextLabel: string) {
  const buttonTags = Array.from(html.matchAll(/<button\b([^>]*)>/g));
  expect(buttonTags.length, `${contextLabel} should render at least one <button>`).toBeGreaterThan(0);

  for (const [fullTag, attrs] of buttonTags) {
    const classMatch = attrs.match(/\bclass="([^"]*)"/);
    expect(classMatch, `${contextLabel} <button> missing class: ${fullTag}`).not.toBeNull();
    const classes = classMatch?.[1] ?? "";
    expect(classes, `${contextLabel} <button> missing whitespace-nowrap: ${fullTag}`).toContain(
      "whitespace-nowrap",
    );
    expect(classes, `${contextLabel} <button> missing min-h-11/min-h-12: ${fullTag}`).toMatch(
      /\bmin-h-(11|12)\b/,
    );
    expect(classes, `${contextLabel} <button> uses forbidden rounded-full: ${fullTag}`).not.toContain(
      "rounded-full",
    );
  }
}

describe("PwaExperience and layout PWA triggers", () => {
  beforeEach(() => {
    state.pathname = "/ro";
    state.snapshot = {
      hydrated: true,
      isStandalone: false,
      canInstallNatively: false,
      hasUpdate: false,
      isRefreshing: false,
      bannerVisible: false,
      installDialogOpen: false,
      platform: "desktop-manual",
    };
  });

  it("enforces design-system invariants across PwaExperience, SiteChrome, Header, and Footer sources", () => {
    const pwaSource = readSrc("src/components/pwa/PwaExperience.tsx");
    const chromeSource = readSrc("src/components/layout/SiteChrome.tsx");
    const headerSource = readSrc("src/components/layout/Header.tsx");
    const footerSource = readSrc("src/components/layout/Footer.tsx");

    for (const [name, src] of [
      ["PwaExperience.tsx", pwaSource],
      ["SiteChrome.tsx", chromeSource],
      ["Header.tsx", headerSource],
      ["Footer.tsx", footerSource],
    ] as const) {
      expect(src, `${name} must not contain rounded-full`).not.toContain("rounded-full");
      expect(src, `${name} must not contain transition-all`).not.toContain("transition-all");
      expect(src, `${name} must not contain focus-visible:ring-sapphire`).not.toContain(
        "focus-visible:ring-sapphire",
      );
    }

    expect(pwaSource).not.toContain("bg-primary");
    expect(pwaSource).not.toMatch(/h-1\.5 w-1\.5/);
    expect(pwaSource).toContain("styles.backdropFade");
    expect(pwaSource).toContain("useCalmReducedMotion");
    expect(pwaSource).toContain("motion-reduce:transition-none");
    expect(pwaSource).toContain("print:hidden");

    expect(chromeSource).toContain("initPwaRuntime()");
    expect(chromeSource).toContain("<PwaExperience />");
  });

  it("renders browser install banner across all 7 locales with single-line 44px+ buttons", () => {
    state.snapshot.bannerVisible = true;

    for (const lang of ALL_LANGS) {
      const copy = getPwaCopy(lang);
      const html = renderWithLang(lang, createElement(PwaExperience));
      const textHtml = decodeHtml(html);

      expect(html).toContain('role="region"');
      expect(textHtml).toContain(copy.bannerTitle);
      expect(textHtml).toContain(copy.bannerBody);
      expect(textHtml).toContain(copy.installButton);
      expect(textHtml).toContain(copy.notNow);
      expect(html).toContain("/pwa/pwa-192x192.png");
      expect(html).toContain("bg-sapphire");
      expect(html).toContain("print:hidden");
      expect(html).not.toContain("rounded-full");
      assertInteractiveButtonsAccessible(html, `PwaExperience banner (${lang})`);
    }
  });

  it("renders update ready toast in both idle and refreshing states across all 7 locales", () => {
    for (const lang of ALL_LANGS) {
      const copy = getPwaCopy(lang);

      state.snapshot.hasUpdate = true;
      state.snapshot.isRefreshing = false;
      const idleHtml = renderWithLang(lang, createElement(PwaExperience));
      const idleTextHtml = decodeHtml(idleHtml);
      expect(idleHtml).toContain('role="status"');
      expect(idleHtml).toContain('aria-live="polite"');
      expect(idleTextHtml).toContain(copy.updateReadyTitle);
      expect(idleTextHtml).toContain(copy.updateReadyBody);
      expect(idleTextHtml).toContain(copy.updateNow);
      expect(idleHtml).not.toContain("rounded-full");
      assertInteractiveButtonsAccessible(idleHtml, `PwaExperience update idle (${lang})`);

      state.snapshot.isRefreshing = true;
      const refreshingHtml = renderWithLang(lang, createElement(PwaExperience));
      expect(decodeHtml(refreshingHtml)).toContain(copy.refreshingApp);
      assertInteractiveButtonsAccessible(refreshingHtml, `PwaExperience update refreshing (${lang})`);
    }
  });

  it("hides floating install and update banners on /health-check/note", () => {
    state.pathname = "/ro/health-check/note";
    state.snapshot.bannerVisible = true;
    state.snapshot.hasUpdate = true;

    const copy = getPwaCopy("ro");
    const html = renderWithLang("ro", createElement(PwaExperience));
    const textHtml = decodeHtml(html);

    expect(html).not.toContain('role="region"');
    expect(html).not.toContain('role="status"');
    expect(textHtml).not.toContain(copy.bannerBody);
    expect(textHtml).not.toContain(copy.updateReadyBody);
  });

  it("renders tailored install guide dialog steps for every platform without rounded-full", () => {
    state.snapshot.installDialogOpen = true;
    const copy = getPwaCopy("en");

    const expectedSteps: Record<InstallPlatform, readonly string[]> = {
      "ios-safari": copy.iosSafariSteps,
      "ios-other": copy.iosOtherSteps,
      "in-app-browser": copy.inAppSteps,
      "android-manual": copy.androidManualSteps,
      "macos-safari": copy.macosSafariSteps,
      "desktop-manual": copy.desktopManualSteps,
      "chromium-prompt": copy.desktopManualSteps,
    };

    for (const platform of ALL_PLATFORMS) {
      state.snapshot.platform = platform;
      const html = renderWithLang("en", createElement(PwaExperience));
      const textHtml = decodeHtml(html);

      expect(html).toContain("<dialog");
      expect(textHtml).toContain(copy.dialogTitle);
      expect(textHtml).toContain(copy.dialogSubtitle);
      expect(textHtml).toContain(copy.doneButton);
      expect(html).toContain("tabular-nums");
      expect(html).toContain("bg-sapphire-soft");
      expect(html).not.toContain("rounded-full");

      for (const step of expectedSteps[platform]) {
        expect(textHtml).toContain(step);
      }

      if (platform === "in-app-browser") {
        expect(textHtml).toContain(copy.copyLink);
      } else {
        expect(textHtml).not.toContain(copy.copyLink);
      }

      assertInteractiveButtonsAccessible(html, `PwaExperience dialog (${platform})`);
    }
  });

  it("renders install, update, and refresh triggers in Header and Footer across all 7 locales", () => {
    for (const lang of ALL_LANGS) {
      const copy = getPwaCopy(lang);

      state.snapshot.isStandalone = false;
      state.snapshot.hasUpdate = false;
      const headerInstallHtml = renderWithLang(lang, createElement(Header));
      const footerInstallHtml = renderWithLang(lang, createElement(Footer));

      expect(decodeHtml(headerInstallHtml)).toContain(copy.installButton);
      expect(decodeHtml(footerInstallHtml)).toContain(copy.installButton);
      // The header utilities sit in one rounded capsule (chrome-capsule.ts): a control, not a status pill.
      expect(headerInstallHtml).toContain("rounded-full");
      expect(footerInstallHtml).not.toContain("rounded-full");

      state.snapshot.hasUpdate = true;
      const headerUpdateHtml = renderWithLang(lang, createElement(Header));
      const footerUpdateHtml = renderWithLang(lang, createElement(Footer));

      expect(decodeHtml(headerUpdateHtml)).toContain(copy.updateNow);
      expect(decodeHtml(footerUpdateHtml)).toContain(copy.updateNow);

      state.snapshot.hasUpdate = false;
      state.snapshot.isStandalone = true;
      const headerStandaloneHtml = renderWithLang(lang, createElement(Header));
      const footerStandaloneHtml = renderWithLang(lang, createElement(Footer));

      expect(decodeHtml(headerStandaloneHtml)).toContain(copy.refreshApp);
      expect(decodeHtml(footerStandaloneHtml)).toContain(copy.refreshApp);
    }
  });
});
