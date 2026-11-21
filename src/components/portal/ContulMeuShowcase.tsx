"use client";

import Image from "next/image";
import Link from "next/link";
import { contulMeuCopy, type PortalPreviewFeatureId } from "@/components/portal/contul-meu-copy";
import { SmsPhoneAuthModal } from "@/components/portal/SmsPhoneAuthModal";
import { Container } from "@/components/ui/Container";
import {
  ArrowLeftIcon,
  CalendarIcon,
  FileTextIcon,
  PrescriptionIcon,
  ShieldIcon,
} from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { translations, type Lang } from "@/lib/i18n/translations";

const FEATURE_ICONS: Record<PortalPreviewFeatureId, typeof PrescriptionIcon> = {
  plan: PrescriptionIcon,
  appointments: CalendarIcon,
  family: FileTextIcon,
};

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
      className="relative isolate flex min-h-[calc(100svh-var(--site-header-h,4.5rem))] flex-1 flex-col justify-center overflow-hidden bg-background text-foreground dark:bg-ink-950 dark:text-paper"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(29,53,87,0.07),transparent_75%)] dark:bg-[radial-gradient(60%_100%_at_50%_0%,rgba(42,77,124,0.28),transparent_75%)]"
      />

      <Container className="relative z-10 flex flex-1 flex-col justify-center">
        <div className="fhs-enter mx-auto w-full max-w-[70rem] py-5 sm:py-8 lg:py-10">
          <Link
            href={withLangPrefix("/", lang)}
            className="press-row mb-4 -ml-2 inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-(--radius-control) px-2 text-body font-semibold text-muted-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none dark:text-mist dark:hover:text-paper"
          >
            <ArrowLeftIcon aria-hidden="true" className="h-5 w-5 shrink-0" />
            <span>{copy.backHome}</span>
          </Link>

          <div className="grid overflow-hidden rounded-3xl border border-border/85 bg-card shadow-(--shadow-card-hover) dark:border-white/12 dark:bg-ink-900 lg:grid-cols-12">
            <div className="flex flex-col lg:col-span-6">
              <SmsPhoneAuthModal initialLang={lang} embedded />
            </div>

            <div className="relative flex min-h-[21rem] flex-col justify-between overflow-hidden bg-ink-950 p-6 sm:p-8 lg:col-span-6 lg:min-h-[36rem] lg:p-10">
              <Image
                src="/images/health-topics/heart-health-care.jpg"
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-[50%_25%]"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/60 to-ink-950/25"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 lg:bg-gradient-to-r lg:from-ink-950/30 lg:via-transparent lg:to-transparent"
              />

              <div className="relative z-10 inline-flex w-fit items-center gap-2 rounded-xl border border-white/15 bg-ink-950/60 px-3.5 py-2 text-sm font-medium text-paper backdrop-blur-md">
                <ShieldIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-sapphire-border" />
                <span>{copy.eyebrow}</span>
              </div>

              <section
                aria-labelledby="portal-preview-heading"
                className="relative z-10 mt-auto pt-20 sm:pt-24 lg:pt-28"
              >
                <h2 id="portal-preview-heading" className="sr-only">
                  {copy.previewRegionLabel}
                </h2>

                {/* Who this page is for, and that nothing else on the site needs an account. */}
                <p className="text-balance text-[1.2rem] font-semibold leading-snug tracking-[-0.015em] text-paper sm:text-[1.35rem]">
                  {copy.whoFor}
                </p>

                <ul className="mt-4 space-y-2.5">
                  {copy.features.map((feature) => {
                    const FeatureIcon = FEATURE_ICONS[feature.id];
                    return (
                      <li
                        key={feature.id}
                        className="flex items-start gap-3 rounded-xl border border-white/12 bg-ink-950/55 px-3.5 py-2.5 backdrop-blur-md"
                      >
                        <FeatureIcon
                          aria-hidden="true"
                          className="mt-0.5 h-5 w-5 shrink-0 text-sapphire-border"
                        />
                        <div>
                          <p className="text-body font-semibold text-paper">{feature.title}</p>
                          <p className="mt-0.5 text-sm leading-snug text-paper/80">{feature.body}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
