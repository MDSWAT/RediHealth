"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { errorTranslations } from "@/lib/i18n/error-translations";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";

/**
 * The 404's route motif, told for a fault: the line sets out, breaks for a moment, and carries
 * on to where it was going. Drawn once (stroke-draw); simply drawn under reduced motion.
 * Replaces a generic alert icon, which read as an alarm on a page that should feel recoverable.
 */
function PausedRoute() {
  return (
    <svg
      viewBox="0 0 200 40"
      className="mx-auto h-10 w-[200px] text-muted-foreground/60"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="14" cy="20" r="4.5" className="fill-sapphire dark:fill-sapphire-border" />
      <path className="stroke-draw" pathLength={1} d="M14 20 H 84" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path
        className="stroke-draw"
        style={{ animationDelay: "520ms" }}
        pathLength={1}
        d="M116 20 H 180"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="186" cy="20" r="6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const { lang } = useLanguage();
  const copy = errorTranslations[lang];

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" className="flex flex-1 items-center py-20 sm:py-28">
      <Container>
        <section role="alert" className="fhs-enter mx-auto max-w-xl text-center">
          <PausedRoute />
          <h1 className="mt-8 text-balance text-page text-foreground">
            {copy.title}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">{copy.body}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => retry()}
              className="whitespace-nowrap press-solid motion-reduce:transition-none"
            >
              {copy.retry}
            </Button>
            <Button
              href={withLangPrefix("/", lang)}
              size="lg"
              variant="outline"
              className="whitespace-nowrap press-row motion-reduce:transition-none"
            >
              {copy.home}
            </Button>
          </div>
        </section>
      </Container>
    </main>
  );
}
