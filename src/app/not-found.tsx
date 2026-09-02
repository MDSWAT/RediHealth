"use client";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SearchIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";

export default function NotFound() {
  const { t } = useLanguage();
  const page = t.notFoundPage;

  return (
    <main id="main-content" className="flex flex-1 items-center py-20 sm:py-28">
      <Container>
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <SearchIcon className="h-7 w-7" />
          </span>
          <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-primary">
            {page.eyebrow}
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {page.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {page.subtitle}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/" size="lg">
              {page.backHome}
            </Button>
            <Button href="/health-information" size="lg" variant="outline">
              {page.exploreHealth}
            </Button>
          </div>
        </Reveal>
      </Container>
    </main>
  );
}
