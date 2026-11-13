"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ClockIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

export const expiredCopy: Record<Lang, { title: string; body: string; action: string; help: string }> = {
  ru: {
    title: "Срок действия ссылки из SMS истек",
    body: "Ничего страшного. Войдите сразу по номеру телефона: мы отправим код по SMS. Электронная почта и пароль не нужны.",
    action: "Войти по номеру телефона",
    help: "Нужна помощь? Позвать медиатора",
  },
  en: {
    title: "This SMS link has expired",
    body: "That is fine. Sign in right away with your phone number and we send you a code by SMS. No email or password needed.",
    action: "Sign in with my phone number",
    help: "Need help? Ask a mediator",
  },
  ro: {
    title: "Linkul din SMS a expirat",
    body: "Nu e nicio problemă. Intră chiar acum cu numărul tău de telefon și îți trimitem un cod prin SMS. Nu ai nevoie de email sau de parolă.",
    action: "Intră cu numărul de telefon",
    help: "Ai nevoie de ajutor? Cere un mediator",
  },
  sq: {
    title: "Lidhja nga SMS ka skaduar",
    body: "S'ka problem. Hyr menjëherë me numrin e telefonit dhe të dërgojmë një kod me SMS. Nuk të duhet email ose fjalëkalim.",
    action: "Hyr me numrin e telefonit",
    help: "Të duhet ndihmë? Kërko një mediator",
  },
  it: {
    title: "Il link dell'SMS è scaduto",
    body: "Non è un problema. Accedi subito con il tuo numero di telefono e ti mandiamo un codice per SMS. Non servono email o password.",
    action: "Accedi con il numero di telefono",
    help: "Serve aiuto? Chiedi un mediatore",
  },
  hr: {
    title: "Poveznica iz SMS poruke je istekla",
    body: "Nema problema. Prijavi se odmah svojim brojem telefona, a mi ti šaljemo kod SMS porukom. Ne trebaju ti e-pošta ni lozinka.",
    action: "Prijavi se brojem telefona",
    help: "Treba ti pomoć? Zatraži medijatora",
  },
  rom: {
    title: "O linko andar o SMS nakhlo",
    body: "Naj problema. Kher andre akana le nomerosa e telefonosko thaj bichhalas tuke kodo ko SMS. Na trebul tuke email vay parola.",
    action: "Kher andre telefonosa",
    help: "Trebul tuke zhutipen? Mang mediatores",
  },
};

export function PortalLinkExpired() {
  const { lang } = useLanguage();
  const text = expiredCopy[lang] ?? expiredCopy.ro;

  return (
    <main id="main-content" className="flex flex-1 items-center py-20 sm:py-28">
      <Container>
        {/* The note arrives in reading order (mark, title, reassurance, way forward), 48ms apart. */}
        <div className="mx-auto max-w-xl text-center">
          <ClockIcon aria-hidden="true" className="list-in mx-auto h-8 w-8 text-muted-foreground" style={{ "--i": 0 } as CSSProperties} />
          <h1 className="list-in mt-6 text-balance text-page text-foreground" style={{ "--i": 1 } as CSSProperties}>
            {text.title}
          </h1>
          <p className="list-in mx-auto mt-5 max-w-[52ch] text-lg leading-relaxed text-muted-foreground" style={{ "--i": 2 } as CSSProperties}>
            {text.body}
          </p>
          <div className="list-in mt-8 flex flex-col items-center gap-3" style={{ "--i": 3 } as CSSProperties}>
            <Link
              href={withLangPrefix("/contul-meu", lang)}
              className="press-solid inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-lg bg-sapphire px-6 text-base font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {text.action}
            </Link>
            <Link
              href={withLangPrefix("/mediatori#solicita", lang)}
              className="group press-row inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg px-4 text-sm font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border"
            >
              <span className="link-draw">{text.help}</span>
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
