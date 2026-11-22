import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Bricolage_Grotesque, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { siteMetadata } from "@/lib/i18n/site-metadata";
import { getSiteUrl, publicOrigin as toPublicOrigin } from "@/lib/site-url";
import { EMERGENCY_DISMISS_COOKIE } from "@/lib/emergency-bar";
import { serializeTranslations } from "@/lib/i18n/languages";
import { translations } from "@/lib/i18n/translations";
import { cookies, headers } from "next/headers";
import { isRecaptchaEnabled } from "@/lib/security/recaptcha-config";
import { NextlyticsServer } from "@/nextlytics";

// latin-ext carries ă, ș, ț, č, ć, đ, š, ž across Romanian, Croatian, Albanian, and Romani.
// Using display: "swap" with preload: false avoids unused-preload console warnings on English/Italian
// routes and under Vercel deployment-skew query strings while keeping zero-CLS metric-matched fallbacks.
// Body: Atkinson Hyperlegible Next, drawn for low-vision readers (letters that are easy to tell apart).
// Next has no fallback metrics for this family, so the metric-matched fallback ("Body Fallback",
// Arial with this face's ascent and descent) is declared by hand in globals.css.
const bodyFont = Atkinson_Hyperlegible_Next({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: true,
  adjustFontFallback: false,
  fallback: ["Body Fallback", "Arial", "Helvetica", "sans-serif"],
});

// Headings (h1, h2): Bricolage Grotesque, with its optical-size axis so large titles tighten up.
// Bold headings (700) run ~2.5% wider than Next's weight-400 auto-fallback, so "Heading Fallback"
// is calibrated directly against the rendered 700 weight in globals.css.
const headingFont = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  display: "swap",
  preload: true,
  adjustFontFallback: false,
  fallback: ["Heading Fallback", "Arial", "Helvetica", "sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Browser bar matches the page ground; a red bar on every page read as an alarm.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfbf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1226" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const site = siteMetadata[await getRequestLang()];
  const alternateLocale = Object.values(siteMetadata)
    .map((entry) => entry.openGraphLocale)
    .filter((locale) => locale !== site.openGraphLocale);

  return {
    metadataBase: new URL(getSiteUrl()),
    title: site.title,
    description: site.description,
    applicationName: "RediHealth",
    appleWebApp: {
      capable: true,
      title: "RediHealth",
      statusBarStyle: "default",
    },
    formatDetection: {
      telephone: false,
    },
    // Next.js 16 emits mobile-web-app-capable from appleWebApp.capable; add apple-mobile-web-app-capable for iOS standalone mode.
    other: {
      "apple-mobile-web-app-capable": "yes",
    },
    openGraph: {
      type: "website",
      siteName: "RediHealth",
      title: site.title,
      description: site.description,
      locale: site.openGraphLocale,
      alternateLocale,
    },
    twitter: {
      card: "summary",
      title: site.title,
      description: site.description,
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getRequestLang();
  const nonce = (await headers()).get("x-nonce") || undefined;
  // Set when the reader closes the 112 bar (UniversalEmergencyBanner), so it is never sent at all.
  const emergencyDismissed = (await cookies()).get(EMERGENCY_DISMISS_COOKIE)?.value === "1";
  // Links that leave this device (QR codes, copied notes) use the configured public address,
  // never a loopback one. See components/health-check/public-origin.ts.
  const publicOrigin = toPublicOrigin(process.env.APP_URL);

  return (
    <html
      lang={lang}
      data-scroll-behavior="smooth"
      data-public-origin={publicOrigin}
      suppressHydrationWarning
      className={`${bodyFont.variable} ${headingFont.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Synchronous <head> icons so Safari/WebKit and Chromium never miss streamed metadata in <body> or fall back to stale domain caches. */}
        <link rel="icon" href="/icon.svg?v=3" type="image/svg+xml" sizes="any" />
        <link rel="icon" href="/favicon-48x48.png?v=3" type="image/png" sizes="48x48" />
        <link rel="icon" href="/favicon-32x32.png?v=3" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png?v=3" type="image/png" sizes="16x16" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/pwa/apple-touch-icon.png?v=3" sizes="180x180" type="image/png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg?v=3" color="#cc3746" />
      </head>
      <body
        suppressHydrationWarning
        className={`${bodyFont.className} min-h-full flex flex-col font-sans`}
      >
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:rounded-lg focus-visible:bg-foreground focus-visible:px-4 focus-visible:py-2 focus-visible:text-body focus-visible:font-semibold focus-visible:text-white"
        >
          {siteMetadata[lang].skipLink}
        </a>
        {/* Website statistics (src/nextlytics.ts): counts client-side navigations on tracked pages. */}
        <NextlyticsServer>
        <SiteChrome lang={lang} initialTranslations={serializeTranslations(translations[lang])} nonce={nonce} captchaEnabled={isRecaptchaEnabled()} emergencyDismissed={emergencyDismissed}>{children}</SiteChrome>
        </NextlyticsServer>
      </body>
    </html>
  );
}
