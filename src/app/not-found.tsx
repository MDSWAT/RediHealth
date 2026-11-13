"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { openSmartSearch } from "@/components/search/smart-search-events";
import { translations, type Lang } from "@/lib/i18n/translations";

const rescueCopy: Record<
  Lang,
  { searchLabel: string; assistantLabel: string; doctorLabel: string; findHelpLabel: string }
> = {
  ro: { searchLabel: "Caută pe site", assistantLabel: "Asistent de sănătate", doctorLabel: "Medic online", findHelpLabel: "Găsește ajutor" },
  en: { searchLabel: "Search the site", assistantLabel: "Health assistant", doctorLabel: "Online doctor", findHelpLabel: "Find help" },
  sq: { searchLabel: "Kërko në faqe", assistantLabel: "Asistent shëndetësor", doctorLabel: "Mjek online", findHelpLabel: "Gjej ndihmë" },
  it: { searchLabel: "Cerca nel sito", assistantLabel: "Assistente sanitario", doctorLabel: "Medico online", findHelpLabel: "Trova aiuto" },
  hr: { searchLabel: "Pretraži stranicu", assistantLabel: "Zdravstveni asistent", doctorLabel: "Liječnik online", findHelpLabel: "Pronađi pomoć" },
  rom: { searchLabel: "Rod pe sajt", assistantLabel: "Sastipnasko asistento", doctorLabel: "Doktori online", findHelpLabel: "Rod zhutimos" },
  ru: { searchLabel: "Искать на сайте", assistantLabel: "Помощник по здоровью", doctorLabel: "Врач онлайн", findHelpLabel: "Найти помощь" },
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
      className="mx-auto h-14 w-[200px] text-muted-foreground/60"
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

  return (
    <main id="main-content" className="flex flex-1 items-center py-16 sm:py-24">
      <Container>
        <section className="fhs-enter mx-auto max-w-2xl text-center">
          <MissingRoute />
          <h1 className="mt-8 text-balance text-page text-foreground">
            {page.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {page.subtitle}
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-nowrap sm:justify-center">
            <Button
              type="button"
              variant="action"
              onClick={() => openSmartSearch()}
              className="min-h-12 whitespace-nowrap"
            >
              {rescue.searchLabel}
            </Button>
            <Button href={withLangPrefix("/", lang)} variant="secondary" className="min-h-12 whitespace-nowrap">
              {page.backHome}
            </Button>
          </div>
          <nav
            aria-label={page.title}
            className="mt-6 grid grid-cols-1 gap-2.5 border-t border-border pt-6 sm:grid-cols-2"
          >
            {[
              { href: "/health-assistant", label: rescue.assistantLabel },
              { href: "/medic-online", label: rescue.doctorLabel },
              { href: "/find-help", label: rescue.findHelpLabel },
              { href: "/health-information", label: page.exploreHealth },
            ].map((item) => (
              <Link
                key={item.href}
                href={withLangPrefix(item.href, lang)}
                className="group press-row inline-flex min-h-12 items-center justify-between gap-3 whitespace-nowrap rounded-lg border border-border-control bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              >
                <span>{item.label}</span>
                <ArrowRightIcon
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:translate-x-0.5 group-hover:text-sapphire motion-reduce:transform-none motion-reduce:transition-none"
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
