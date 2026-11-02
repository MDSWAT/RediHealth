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
        <div role="alert" className="mx-auto max-w-xl text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <AlertCircleIcon className="h-7 w-7" />
          </span>
          <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {copy.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{copy.body}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={() => retry()}>
              {copy.retry}
            </Button>
            <Button href={withLangPrefix("/", lang)} size="lg" variant="outline">
              {copy.home}
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
