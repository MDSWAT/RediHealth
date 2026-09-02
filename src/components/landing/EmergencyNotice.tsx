"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { PhoneIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";

export function EmergencyNotice() {
  const { t } = useLanguage();

  return (
    <section className="bg-primary-soft py-8">
      <Container>
        <Reveal className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="flex h-11 w-11 flex-none animate-pulse items-center justify-center rounded-full bg-primary text-white">
            <PhoneIcon className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {t.landing.emergencyNotice.title}
            </h2>
            <p className="mt-1 text-base leading-relaxed text-foreground/80">
              {t.landing.emergencyNotice.description}
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
