"use client";

import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SignInForm } from "@/components/auth/SignInForm";
import { ArrowRightIcon, StethoscopeIcon } from "@/components/ui/icons";
import Link from "next/link";
import type { ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

// The words inside the terms sentence that open the Terms and the Privacy pages, per language.
const TERMS_LINKS: Record<Lang, { terms: string; privacy: string }> = {
  ru: { terms: "Условия", privacy: "Уведомление о конфиденциальности" },

  ro: { terms: "Termenii", privacy: "Politica de confidențialitate" },
  en: { terms: "Terms", privacy: "Privacy Notice" },
  sq: { terms: "Kushtet", privacy: "Njoftimin e Privatësisë" },
  it: { terms: "Termini", privacy: "Informativa sulla privacy" },
  hr: { terms: "uvjete korištenja", privacy: "pravila privatnosti" },
  rom: { terms: "labaripnaske pravila", privacy: "garavipnaske pravila" },
};

// Who this sign-in is for, and where patients go instead. The site itself needs no account.
const STAFF_NOTICE: Record<Lang, { staffOnly: string; patientPrompt: string; patientLink: string }> = {
  ro: {
    staffOnly:
      "Această pagină este pentru mediatori sanitari și personal medical. Nu ai nevoie de cont ca să folosești RediHealth.",
    patientPrompt: "Cauți pagina ta de sănătate?",
    patientLink: "Deschide contul meu",
  },
  en: {
    staffOnly:
      "This sign-in is for health mediators and medical staff. You do not need an account to use RediHealth.",
    patientPrompt: "Looking for your own health page?",
    patientLink: "Open my account",
  },
  sq: {
    staffOnly:
      "Kjo hyrje është për mediatorët shëndetësorë dhe stafin mjekësor. Nuk të duhet llogari për të përdorur RediHealth.",
    patientPrompt: "Po kërkon faqen tënde të shëndetit?",
    patientLink: "Hap llogarinë time",
  },
  it: {
    staffOnly:
      "Questo accesso è per i mediatori sanitari e il personale medico. Non ti serve un account per usare RediHealth.",
    patientPrompt: "Cerchi la tua pagina della salute?",
    patientLink: "Apri il mio account",
  },
  hr: {
    staffOnly:
      "Ova prijava je za zdravstvene medijatore i medicinsko osoblje. Ne treba ti račun za korištenje RediHealtha.",
    patientPrompt: "Tražiš svoju zdravstvenu stranicu?",
    patientLink: "Otvori moj račun",
  },
  rom: {
    staffOnly:
      "Kadava khuvipe si vash e sastipnaske mediatorya thaj o medicinako personalo. Na trebul tuke konto te labares RediHealth.",
    patientPrompt: "Rodes chi sastipnaski rig?",
    patientLink: "Puter miro konto",
  },
  ru: {
    staffOnly:
      "Этот вход предназначен для медиаторов здоровья и медицинского персонала. Чтобы пользоваться RediHealth, аккаунт не нужен.",
    patientPrompt: "Ищете свою страницу здоровья?",
    patientLink: "Открыть мой аккаунт",
  },
};

const inlineLink =
  "rounded-sm font-medium text-foreground underline underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire dark:hover:text-sapphire-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** The terms sentence with its two documents as real links; plain text if a phrase is not found. */
function termsWithLinks(sentence: string, lang: Lang): ReactNode {
  const words = TERMS_LINKS[lang] ?? TERMS_LINKS.ro;
  const parts: Array<{ phrase: string; href: string }> = [
    { phrase: words.terms, href: withLangPrefix("/terms", lang) },
    { phrase: words.privacy, href: withLangPrefix("/privacy", lang) },
  ];
  const out: ReactNode[] = [];
  let rest = sentence;
  for (const { phrase, href } of parts) {
    const at = rest.indexOf(phrase);
    if (at < 0) continue;
    out.push(rest.slice(0, at));
    out.push(
      <Link key={href} href={href} className={inlineLink}>
        {phrase}
      </Link>,
    );
    rest = rest.slice(at + phrase.length);
  }
  out.push(rest);
  return out;
}

export function SignInPageContent({
  googleConfigured,
  passwordConfigured = false,
  initialError,
}: {
  googleConfigured: boolean;
  passwordConfigured?: boolean;
  initialError?: "unauthorized" | "unavailable";
}) {
  const { t, lang } = useLanguage();
  const page = t.signInPage;
  const staffNotice = STAFF_NOTICE[lang];
  const initialErrorMessage =
    initialError === "unauthorized"
      ? page.unauthorizedGoogle
      : initialError === "unavailable"
        ? page.authUnavailable
        : undefined;

  return (
    <main id="main-content" className="relative flex flex-1 flex-col justify-center pb-12 sm:pb-16">
      <Container>
        <div className="mx-auto w-full max-w-[70rem] py-6 sm:py-10">
          <div className="grid overflow-hidden rounded-3xl border border-border/85 bg-card shadow-(--shadow-card-hover) dark:border-white/12 dark:bg-ink-900 lg:grid-cols-12">
            <div className="p-6 sm:p-8 lg:col-span-6 lg:p-10">
              <h1 className="text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground text-balance sm:text-[2rem]">
                {page.heroTitle}
              </h1>
              <p className="mt-2.5 text-body leading-relaxed text-muted-foreground text-pretty">
                {googleConfigured ? page.heroParagraphWithGoogle : page.heroParagraphNoGoogle}
              </p>

              <div className="mt-6">
                <SignInForm
                  googleConfigured={googleConfigured}
                  passwordConfigured={passwordConfigured}
                  initialError={initialErrorMessage}
                  embedded
                />
              </div>

              <p className="mt-6 px-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                {termsWithLinks(page.terms, lang)}
              </p>
            </div>

            <div className="relative flex min-h-[20rem] flex-col justify-between overflow-hidden bg-ink-950 p-6 sm:p-8 lg:col-span-6 lg:min-h-[34rem] lg:p-10">
              <Image
                src="/images/hero-consultation.jpg"
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-center"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/60 to-ink-950/25"
              />

              <div className="relative z-10 inline-flex w-fit items-center gap-2 rounded-xl border border-white/15 bg-ink-950/60 px-3.5 py-2 text-sm font-medium text-paper backdrop-blur-md">
                <StethoscopeIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-sapphire-border" />
                <span>RediHealth</span>
              </div>

              <div className="relative z-10 mt-auto pt-20 sm:pt-24">
                <p className="text-balance text-[1.2rem] font-semibold leading-snug text-paper sm:text-[1.35rem]">
                  {staffNotice.staffOnly}
                </p>

                <div className="mt-5 rounded-xl border border-white/15 bg-ink-950/60 p-4 backdrop-blur-md">
                  <p className="text-body text-paper/85 text-pretty">{staffNotice.patientPrompt}</p>
                  <Link
                    href={withLangPrefix("/contul-meu", lang)}
                    className="mt-1 inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-sm font-semibold text-paper underline underline-offset-4 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-sapphire-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                  >
                    <span>{staffNotice.patientLink}</span>
                    <ArrowRightIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
