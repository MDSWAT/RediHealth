"use client";

import Link from "next/link";
import { contulMeuCopy } from "@/components/portal/contul-meu-copy";
import { SmsPhoneAuthModal } from "@/components/portal/SmsPhoneAuthModal";
import { Container } from "@/components/ui/Container";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { translations, type Lang } from "@/lib/i18n/translations";

function useSafeLanguage(initialLang: Lang) {
  try {
    return useLanguage();
  } catch {
    return {
      lang: initialLang,
      t: translations[initialLang] ?? translations.ro,
      setLang: () => {},
    };
  }
}

export function ContulMeuShowcase({ initialLang = "ro" }: { initialLang?: Lang }) {
  const { lang: activeLang } = useSafeLanguage(initialLang);
  const lang = activeLang ?? initialLang;
  const copy = contulMeuCopy[lang] ?? contulMeuCopy.ro;

  return (
    <main
      id="main-content"
      className="relative isolate flex min-h-[calc(100svh-var(--site-header-h,4.5rem))] flex-1 flex-col overflow-hidden bg-background text-foreground dark:bg-ink-950 dark:text-paper"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(29,53,87,0.07),transparent_75%)] dark:bg-[radial-gradient(60%_100%_at_50%_0%,rgba(42,77,124,0.28),transparent_75%)]"
      />

      <Container className="relative z-10 flex flex-1 flex-col justify-center">
        <div className="fhs-enter mx-auto w-full max-w-[460px] py-6 sm:py-12">
          <Link
            href={withLangPrefix("/", lang)}
            className="press-row -ml-2 inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-(--radius-control) px-2 text-body font-semibold text-muted-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none dark:text-mist dark:hover:text-paper"
          >
            <ArrowLeftIcon aria-hidden="true" className="h-5 w-5 shrink-0" />
            <span>{copy.backHome}</span>
          </Link>

          <div className="mt-3">
            <SmsPhoneAuthModal initialLang={lang} />
          </div>

          <section aria-labelledby="portal-preview-heading" className="mt-6">
            <h2 id="portal-preview-heading" className="sr-only">
              {copy.previewRegionLabel}
            </h2>

            {/* Who this page is for, and that nothing else on the site needs an account. */}
            <p className="px-1 text-body font-medium text-foreground dark:text-paper">{copy.whoFor}</p>

            <ul className="mt-4 list-disc space-y-2 pr-1 pl-6 text-body text-muted-foreground dark:text-mist">
              {copy.features.map((feature) => (
                <li key={feature.id}>{feature.title}</li>
              ))}
            </ul>

            <p className="mt-4 px-1 text-body text-muted-foreground/85 dark:text-mist/80">{copy.privacyNote}</p>
          </section>
        </div>
      </Container>
    </main>
  );
}
