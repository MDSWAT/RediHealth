"use client";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { translations, type Lang } from "@/lib/i18n/translations";

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
      <circle cx="14" cy="40" r="4.5" className="fill-primary" />
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

  return (
    <main id="main-content" className="flex flex-1 items-center py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <MissingRoute />
          <h1 className="mt-8 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {page.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {page.subtitle}
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <Button href={withLangPrefix("/", lang)} className="sm:whitespace-nowrap">
              {page.backHome}
            </Button>
            <Button
              href={withLangPrefix("/health-information", lang)}
              variant="outline"
              className="sm:whitespace-nowrap"
            >
              {page.exploreHealth}
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
