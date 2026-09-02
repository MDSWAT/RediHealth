"use client";

import { Container } from "@/components/ui/Container";
import { ShieldIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";

export function MythBuster() {
  const { t } = useLanguage();
  const messages = t.hero.phone.messages;

  return (
    <section className="border-b border-border bg-background py-16 sm:py-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="max-w-md">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <ShieldIcon className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t.landing.mythBuster.title}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {t.landing.mythBuster.subtitle}
            </p>
          </div>

          <div className="myth-buster-panel border border-border bg-card p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold text-primary">{t.landing.mythBuster.messageLabel}</p>
            <div className="mt-4 space-y-3">
              <p className="myth-buster-message ml-6 w-fit max-w-[calc(100%-1.5rem)] rounded-lg bg-muted px-4 py-3 text-base leading-relaxed text-foreground shadow-sm">
                {messages[0]}
              </p>
              <p className="myth-buster-message myth-buster-message-delay ml-auto w-fit max-w-[calc(100%-1.5rem)] rounded-lg bg-primary-soft px-4 py-3 text-base leading-relaxed text-foreground shadow-sm">
                {messages[1]}
              </p>
              <p
                className="myth-buster-message ml-auto w-fit max-w-[calc(100%-1.5rem)] rounded-lg bg-primary-soft px-4 py-3 text-base leading-relaxed text-foreground shadow-sm"
                style={{ animationDelay: "1s" }}
              >
                {messages[2]}
              </p>
              <p
                className="myth-buster-message ml-auto w-fit max-w-[calc(100%-1.5rem)] rounded-lg bg-primary-soft px-4 py-3 text-base leading-relaxed text-foreground shadow-sm"
                style={{ animationDelay: "1.5s" }}
              >
                {messages[3]}
              </p>
              <p
                className="myth-buster-message ml-auto w-fit max-w-[calc(100%-1.5rem)] rounded-lg bg-primary-soft px-4 py-3 text-base leading-relaxed text-foreground shadow-sm"
                style={{ animationDelay: "2s" }}
              >
                {messages[4]}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
