import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Bricolage_Grotesque, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { siteMetadata } from "@/lib/i18n/site-metadata";
import { getSiteUrl } from "@/lib/site-url";
import { headers } from "next/headers";

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
  preload: false,
  adjustFontFallback: false,
  fallback: ["Body Fallback", "Arial", "Helvetica", "sans-serif"],
});

// Headings (h1, h2): Bricolage Grotesque, with its optical-size axis so large titles tighten up.
const headingFont = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  display: "swap",
  preload: false,
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
  themeColor: "#fcfbf9",
};

export async function generateMetadata(): Promise<Metadata> {
  const site = siteMetadata[await getRequestLang()];

  return {
    metadataBase: new URL(getSiteUrl()),
    title: site.title,
    description: site.description,
    applicationName: "RediHealth",
    openGraph: {
      type: "website",
      siteName: "RediHealth",
      title: site.title,
      description: site.description,
      locale: site.openGraphLocale,
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
  // Links that leave this device (QR codes, copied notes) use the configured public address,
  // never a loopback one. See components/health-check/public-origin.ts.
  const configuredOrigin = process.env.APP_URL?.trim().replace(/\/+$/, "");
  const publicOrigin =
    configuredOrigin && !/\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/.test(configuredOrigin)
      ? configuredOrigin
      : undefined;

  return (
    <html
      lang={lang}
      data-public-origin={publicOrigin}
      suppressHydrationWarning
      className={`${bodyFont.variable} ${headingFont.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className={`${bodyFont.className} min-h-full flex flex-col font-sans`}
      >
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:rounded-lg focus-visible:bg-foreground focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-semibold focus-visible:text-white"
        >
          {siteMetadata[lang].skipLink}
        </a>
        <SiteChrome lang={lang} nonce={nonce} captchaEnabled={process.env.RECAPTCHA_ENABLED === "true"}>{children}</SiteChrome>
      </body>
    </html>
  );
}
