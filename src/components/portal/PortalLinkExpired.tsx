"use client";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ClockIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

const copy: Record<Lang, { title: string; body: string; action: string }> = {
  en: {
    title: "This link has expired",
    body: "For your privacy, patient portal links stop working after 90 days. Request a new link with your email address and we will send it right away.",
    action: "Get a new link",
  },
  ro: {
    title: "Acest link a expirat",
    body: "Pentru confidentialitatea ta, linkurile portalului pacientului nu mai functioneaza dupa 90 de zile. Cere un link nou cu adresa ta de email si ti-l trimitem imediat.",
    action: "Primeste un link nou",
  },
  sq: {
    title: "Ky link ka skaduar",
    body: "Per privatesine tuaj, lidhjet e portalit te pacientit pushojne se funksionuari pas 90 diteve. Kerkoni nje lidhje te re me adresen tuaj te emailit dhe do jua dergojme menjehere.",
    action: "Merr nje lidhje te re",
  },
  it: {
    title: "Questo link e scaduto",
    body: "Per la tua privacy, i link del portale paziente smettono di funzionare dopo 90 giorni. Richiedi un nuovo link con il tuo indirizzo email e te lo invieremo subito.",
    action: "Ottieni un nuovo link",
  },
};

export function PortalLinkExpired() {
  const { lang } = useLanguage();
  const text = copy[lang];

  return (
    <main id="main-content" className="flex flex-1 items-center py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <ClockIcon className="h-7 w-7" />
          </span>
          <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {text.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{text.body}</p>
          <div className="mt-8 flex justify-center">
            <Button href={withLangPrefix("/sign-in", lang)} size="lg">
              {text.action}
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
