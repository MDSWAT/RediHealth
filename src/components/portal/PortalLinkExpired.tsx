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
    body: "To protect your details, portal links stop working after 90 days. Give us your email address and we send you a new link straight away.",
    action: "Get a new link",
  },
  ro: {
    title: "Linkul a expirat",
    body: "Ca să-ți protejăm datele, linkurile spre portal nu mai merg după 90 de zile. Scrie-ți adresa de email și îți trimitem imediat un link nou.",
    action: "Cere un link nou",
  },
  sq: {
    title: "Lidhja ka skaduar",
    body: "Për të mbrojtur të dhënat e tua, lidhjet e portalit nuk punojnë më pas 90 ditësh. Shkruaj adresën e emailit dhe të dërgojmë menjëherë një lidhje të re.",
    action: "Kërko lidhje të re",
  },
  it: {
    title: "Il link è scaduto",
    body: "Per proteggere i tuoi dati, i link del portale smettono di funzionare dopo 90 giorni. Scrivi la tua email e ti mandiamo subito un link nuovo.",
    action: "Chiedi un nuovo link",
  },
  hr: {
    title: "Ova poveznica je istekla",
    body: "Radi zaštite tvojih podataka poveznice za portal prestaju vrijediti nakon 90 dana. Upiši svoju adresu e-pošte i odmah ćemo ti poslati novu poveznicu.",
    action: "Zatraži novu poveznicu",
  },
  rom: {
    title: "Kadava linko nakhlo",
    body: "Te arakhas che date, e linkurya vash o portalo aven bi-zorale palo 90 divesa. Lekhav chi email adresa thaj sigo ka bichhalas tuke nevo linko.",
    action: "Mang nevo linko",
  },
};

export function PortalLinkExpired() {
  const { lang } = useLanguage();
  const text = copy[lang];

  return (
    <main id="main-content" className="flex flex-1 items-center py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <ClockIcon className="mx-auto h-8 w-8 text-muted-foreground" />
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
