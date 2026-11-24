"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { findHelpLinks } from "@/lib/i18n/find-help-links";
import { openSmartSearch } from "@/components/search/smart-search-events";
import { translations, type Lang } from "@/lib/i18n/translations";

const rescueCopy: Record<Lang, { searchLabel: string }> = {
  ro: { searchLabel: "Caută pe site" },
  en: { searchLabel: "Search the site" },
  sq: { searchLabel: "Kërko në faqe" },
  it: { searchLabel: "Cerca nel sito" },
  hr: { searchLabel: "Pretraži stranicu" },
  rom: { searchLabel: "Rod pe sajt" },
  ru: { searchLabel: "Искать на сайте" },
};

function useSafeLanguage() {
  try {
    const ctx = useLanguage();
    return ctx;
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

/**
 * A route that sets out from a known point and stops short of a destination that is not there.
 * The line draws once (stroke-dashoffset); under reduced motion it is simply drawn.
 */
function MissingRoute() {
  return (
    <svg
      viewBox="0 0 200 56"
      className="h-14 w-[200px] text-muted-foreground/60"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="14" cy="40" r="4.5" className="fill-sapphire" />
      <path
        className="fhs-route"
        pathLength={1}
        d="M14 40 C 46 40 58 16 92 16 S 136 34 158 27"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="184" cy="22" r="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.5 3.5" />
    </svg>
  );
}

export default function NotFound() {
  const { lang, t } = useSafeLanguage();
  const page = t.notFoundPage;
  const rescue = rescueCopy[lang];
  // The same six destinations as the header and the phone menu, under the same names.
  const destinations = [
    { href: "/health-information", label: t.header.navAfla },
    { href: "/health-check", label: t.header.navSymptoms },
    { href: "/prescription-review", label: t.header.navMedicine },
    { href: "/find-help", label: findHelpLinks(lang).nav },
    { href: "/mediatori", label: t.header.forMediators },
  ];

  return (
    <main id="main-content" className="flex flex-1 items-center pb-16 sm:pb-24">
      <Container className="max-sm:px-2.5">
        <section className="fhs-enter max-w-2xl">
          <PageHeader
            align="start"
            above={<MissingRoute />}
            title={page.title}
            lead={page.subtitle}
            actions={
              <>
                <Button
                  type="button"
                  variant="action"
                  size="lg"
                  onClick={() => openSmartSearch()}
                >
                  {rescue.searchLabel}
                </Button>
                <Button href={withLangPrefix("/", lang)} variant="outline" size="lg">
                  {page.backHome}
                </Button>
              </>
            }
          />
          <nav
            aria-label={page.title}
            className="relative mt-8 grid grid-cols-1 gap-2.5 pt-6 sm:grid-cols-2"
          >
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-border" />
            {destinations.map((item) => (
              <Link
                key={item.href}
                href={withLangPrefix(item.href, lang)}
                className="card-interactive group press-row inline-flex min-h-12 items-center justify-between gap-2 whitespace-nowrap rounded-lg border border-border-control bg-card px-2.5 py-3 text-left text-body font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-3 sm:px-4"
              >
                <span className="transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-sapphire motion-reduce:transition-none">{item.label}</span>
                <ArrowRightIcon
                  className="hidden h-4 w-4 shrink-0 text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-sapphire motion-reduce:transition-none sm:inline-block"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </nav>
        </section>
      </Container>
    </main>
  );
}
