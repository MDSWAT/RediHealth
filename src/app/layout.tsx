import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { siteMetadata } from "@/lib/i18n/site-metadata";
import { getSiteUrl } from "@/lib/site-url";
import { headers } from "next/headers";

// latin-ext carries ă, ș, ț (Romanian, the default locale): preload it with latin so diacritics never flash in the fallback face.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:rounded-lg focus-visible:bg-foreground focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-semibold focus-visible:text-white"
        >
          {siteMetadata[lang].skipLink}
        </a>
        <SiteChrome nonce={nonce} captchaEnabled={process.env.RECAPTCHA_ENABLED === "true"}>{children}</SiteChrome>
      </body>
    </html>
  );
}
