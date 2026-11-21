import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Footer } from "@/components/layout/Footer";
import { feedbackTriggerCopy } from "@/components/layout/chrome-widget-events";
import { cookieConsentCopy } from "@/components/security/cookie-consent-copy";
import { RecaptchaProvider } from "@/components/security/RecaptchaProvider";
import { LanguageContext } from "@/lib/i18n/language-context";
import { getPwaCopy } from "@/lib/i18n/pwa-copy";
import { translations, type Lang } from "@/lib/i18n/translations";

vi.mock("next/navigation", () => ({
  usePathname: () => "/ro",
}));

vi.mock("next/script", () => ({
  default: () => null,
}));

vi.mock("@/lib/pwa/pwa-state", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/pwa/pwa-state")>();
  return {
    ...actual,
    usePwaSnapshot: () => ({
      hydrated: true,
      isStandalone: false,
      canInstallNatively: false,
      hasUpdate: false,
      isRefreshing: false,
      bannerVisible: false,
      installDialogOpen: false,
      platform: "desktop-manual",
    }),
  };
});

function renderFooter(lang: Lang, recaptchaEnabled: boolean): string {
  const Provider = RecaptchaProvider as unknown as ComponentType<{ enabled: boolean }>;
  return renderToStaticMarkup(
    createElement(
      LanguageContext.Provider,
      { value: { lang, t: translations[lang], setLang: () => {} } },
      createElement(Provider, { enabled: recaptchaEnabled }, createElement(Footer)),
    ),
  );
}

describe("Footer colophon and reCAPTCHA placement", () => {
  it("integrates the dark-toned Google reCAPTCHA notice inside Footer when enabled", () => {
    for (const lang of ["ro", "en", "ru"] as const) {
      const html = renderFooter(lang, true);
      const tFooter = translations[lang].footer;

      expect(html).toContain(tFooter.copyrightLine);
      expect(html).toContain(tFooter.nonEmergencyWarning);
      expect(html).toContain("https://policies.google.com/privacy");
      expect(html).toContain("https://policies.google.com/terms");
      expect(html).toContain("text-mist/80");
      expect(html).toContain("hero-focus");
      expect(html).not.toContain("rounded-full");
      expect(html).not.toContain("transition-all");
      expect(html).not.toContain("focus-visible:ring-sapphire");
    }
  });

  it("omits Google policy links when reCAPTCHA is disabled while preserving utility and legal copy", () => {
    const html = renderFooter("ro", false);
    const tFooter = translations.ro.footer;
    const cookieCopy = cookieConsentCopy.ro;
    const pwaCopy = getPwaCopy("ro");

    expect(html).not.toContain("https://policies.google.com/privacy");
    expect(html).not.toContain("https://policies.google.com/terms");
    expect(html).toContain(tFooter.copyrightLine);
    expect(html).toContain(tFooter.nonEmergencyWarning);
    expect(html).toContain(cookieCopy.policyLinkLabel);
    expect(html).toContain(cookieCopy.footerSettingsLink);
    expect(html).toContain(pwaCopy.installButton);
    expect(html).toContain(feedbackTriggerCopy.ro.footerLink);
    expect(html).toContain(tFooter.reportIssueFallback);
  });

  it("gates standalone RecaptchaNotice in SiteChrome to footerless interactive workspaces", () => {
    const chromeSource = readFileSync(
      resolve(process.cwd(), "src/components/layout/SiteChrome.tsx"),
      "utf8",
    );

    expect(chromeSource).toContain(
      "const showStandaloneRecaptchaNotice = hideFooter && !isChromelessSurface && !isAiAssistant;",
    );
    expect(chromeSource).toContain("{showStandaloneRecaptchaNotice ? (");
  });

  it("guards lazy widget and motion chunks in SiteChrome against ChunkLoadError", () => {
    const chromeSource = readFileSync(
      resolve(process.cwd(), "src/components/layout/SiteChrome.tsx"),
      "utf8",
    );

    expect(chromeSource).toContain("loadOptionalWidget");
    expect(chromeSource).toContain("OptionalWidgetBoundary");
    expect(chromeSource).toContain("loadOptionalWidget(() => import(\"@/components/layout/FeedbackWidget\"), \"FeedbackWidget\")");
    expect(chromeSource).toContain("loadOptionalWidget(() => import(\"@/components/layout/ReportIssueWidget\"), \"ReportIssueWidget\")");
    expect(chromeSource).toMatch(/loadMotionFeatures[\s\S]*\.catch\(/);
  });
});
