"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { AlertCircleIcon } from "@/components/ui/icons";
import { errorTranslations } from "@/lib/i18n/error-translations";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";

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
          <AlertCircleIcon className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-6 text-balance text-page text-foreground">
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
