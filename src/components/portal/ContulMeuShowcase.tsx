"use client";

import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { contulMeuCopy, type PortalPreviewFeatureId } from "@/components/portal/contul-meu-copy";
import { SmsPhoneAuthModal } from "@/components/portal/SmsPhoneAuthModal";
import { Container } from "@/components/ui/Container";
import {
  ArrowLeftIcon,
  CalendarIcon,
  PrescriptionIcon,
  ShareIcon,
  ShieldIcon,
} from "@/components/ui/icons";
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

const FEATURE_ICONS: Record<PortalPreviewFeatureId, ComponentType<SVGProps<SVGSVGElement>>> = {
  plan: PrescriptionIcon,
  appointments: CalendarIcon,
  family: ShareIcon,
};

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
        <div className="mx-auto w-full max-w-[460px] py-6 sm:py-12">
          <Link
            href={withLangPrefix("/", lang)}
            className="press-row -ml-2 inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-(--radius-control) px-2 text-base font-semibold text-muted-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none dark:text-mist dark:hover:text-paper"
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

            <ul className="space-y-2.5 px-1 text-[15px] text-muted-foreground dark:text-mist">
              {copy.features.map((feature) => {
                const Icon = FEATURE_ICONS[feature.id];
                return (
                  <li key={feature.id} className="flex items-center gap-2.5">
                    <Icon
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border"
                    />
                    <span>{feature.title}</span>
                  </li>
                );
              })}
            </ul>

            <p className="mt-4 flex items-start gap-2 px-1 text-sm leading-relaxed text-muted-foreground/85 dark:text-mist/80">
              <ShieldIcon
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border"
              />
              <span>{copy.privacyNote}</span>
            </p>
          </section>
        </div>
      </Container>
    </main>
  );
}
