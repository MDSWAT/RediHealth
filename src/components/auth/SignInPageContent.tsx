"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { SignInForm, type SignInStage } from "@/components/auth/SignInForm";
import { ArrowRightIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

// Subtitle copy for the Password tab so switching away from Email code never says "we'll send you a code".
const PASSWORD_SUBTITLE: Record<Lang, { withGoogle: string; noGoogle: string }> = {
  ro: {
    withGoogle: "Intră în cont cu adresa de email și parola de personal, sau cu contul Google.",
    noGoogle: "Intră în cont cu adresa de email și parola de personal.",
  },
  en: {
    withGoogle: "Sign in with your staff email and password, or with Google.",
    noGoogle: "Sign in with your staff email and password.",
  },
  sq: {
    withGoogle: "Hyr me emailin dhe fjalëkalimin e stafit, ose me Google.",
    noGoogle: "Hyr me emailin dhe fjalëkalimin e stafit.",
  },
  it: {
    withGoogle: "Accedi con l'email e la password del personale, o con Google.",
    noGoogle: "Accedi con l'email e la password del personale.",
  },
  hr: {
    withGoogle: "Prijavi se e-poštom i lozinkom osoblja ili putem Googlea.",
    noGoogle: "Prijavi se e-poštom i lozinkom osoblja.",
  },
  rom: {
    withGoogle: "Khuv andre e bukyarne emailosa thaj parolasa, vay Google kontosa.",
    noGoogle: "Khuv andre e bukyarne emailosa thaj parolasa.",
  },
  ru: {
    withGoogle: "Войдите с помощью электронной почты и пароля сотрудника или через Google.",
    noGoogle: "Войдите с помощью электронной почты и пароля сотрудника.",
  },
};

// Single sentence-cased legal notice shared across Email code and Password sign-in tabs.
const LEGAL_NOTICE: Record<
  Lang,
  { before: string; terms: string; between: string; privacy: string; after: string }
> = {
  ro: {
    before: "Folosim adresa ta de email doar pentru autentificare și serviciile cerute. Continuând, accepți",
    terms: "termenii și condițiile",
    between: "și",
    privacy: "politica de confidențialitate",
    after: ".",
  },
  en: {
    before: "We use your email only for sign-in and requested services. By continuing, you accept the",
    terms: "terms and conditions",
    between: "and",
    privacy: "privacy policy",
    after: ".",
  },
  sq: {
    before: "Emailin tënd e përdorim vetëm për hyrje dhe shërbimet e kërkuara. Duke vazhduar, pranon",
    terms: "kushtet dhe rregullat",
    between: "dhe",
    privacy: "politikën e privatësisë",
    after: ".",
  },
  it: {
    before: "Usiamo la tua email solo per l'accesso e i servizi richiesti. Continuando, accetti i",
    terms: "termini e condizioni",
    between: "e l'",
    privacy: "informativa sulla privacy",
    after: ".",
  },
  hr: {
    before: "Tvoju e-poštu koristimo samo za prijavu i zatražene usluge. Nastavkom prihvaćaš",
    terms: "uvjete korištenja",
    between: "i",
    privacy: "pravila privatnosti",
    after: ".",
  },
  rom: {
    before: "Labaras cho emailo numay vash dinipe andre thaj mangime sluzhbe. Te zhas may dur, kames",
    terms: "labaripnaske pravila",
    between: "thaj",
    privacy: "garavipnaske pravila",
    after: ".",
  },
  ru: {
    before: "Мы используем вашу электронную почту только для входа и запрошенных услуг. Продолжая, вы принимаете",
    terms: "условия использования",
    between: "и",
    privacy: "политику конфиденциальности",
    after: ".",
  },
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
  "rounded-sm font-medium text-foreground underline underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-paper dark:hover:text-[#bad7fa] dark:focus-visible:ring-[#93c5fd]";

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
  const [stage, setStage] = useState<SignInStage>("email");
  const page = t.signInPage;
  const staffNotice = STAFF_NOTICE[lang];
  const passwordSubtitle = PASSWORD_SUBTITLE[lang] ?? PASSWORD_SUBTITLE.en;
  const legal = LEGAL_NOTICE[lang] ?? LEGAL_NOTICE.en;
  const initialErrorMessage =
    initialError === "unauthorized"
      ? page.unauthorizedGoogle
      : initialError === "unavailable"
        ? page.authUnavailable
        : undefined;

  const subtitle =
    stage === "password"
      ? googleConfigured
        ? passwordSubtitle.withGoogle
        : passwordSubtitle.noGoogle
      : stage === "email"
        ? googleConfigured
          ? page.heroParagraphWithGoogle
          : page.heroParagraphNoGoogle
        : null;

  return (
    <main
      id="main-content"
      className="relative flex flex-1 flex-col justify-center bg-background pb-12 text-foreground dark:bg-ink-950 dark:text-paper dark:[color-scheme:dark] sm:pb-16"
    >
      <Container>
        <div className="mx-auto w-full max-w-[70rem] py-6 sm:py-10">
          <div className="grid overflow-hidden rounded-2xl border border-border bg-card dark:border-white/15 dark:bg-ink-900 lg:grid-cols-12">
            <div className="p-6 sm:p-8 lg:col-span-6 lg:p-10">
              <h1 className="text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground text-balance dark:text-paper sm:text-[2rem]">
                {page.heroTitle}
              </h1>
              {subtitle ? (
                <p className="mt-2.5 text-body leading-relaxed text-muted-foreground text-pretty dark:text-mist">
                  {subtitle}
                </p>
              ) : null}

              <div className="mt-6">
                <SignInForm
                  googleConfigured={googleConfigured}
                  passwordConfigured={passwordConfigured}
                  initialError={initialErrorMessage}
                  onStageChange={setStage}
                  embedded
                />
              </div>

              <p className="mt-6 text-sm leading-relaxed text-muted-foreground text-pretty dark:text-mist">
                {legal.before}{" "}
                <Link href={withLangPrefix("/terms", lang)} className={inlineLink}>
                  {legal.terms}
                </Link>{" "}
                {legal.between}{" "}
                <Link href={withLangPrefix("/privacy", lang)} className={inlineLink}>
                  {legal.privacy}
                </Link>
                {legal.after}
              </p>
            </div>

            <div className="relative flex min-h-[20rem] flex-col justify-end overflow-hidden bg-ink-950 p-6 sm:p-8 lg:col-span-6 lg:min-h-[34rem] lg:p-10">
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
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/65 to-ink-950/20"
              />

              <div className="relative z-10 mt-auto pt-24 sm:pt-32">
                <p className="max-w-[34ch] text-balance text-[1.2rem] font-semibold leading-snug text-paper sm:text-[1.35rem]">
                  {staffNotice.staffOnly}
                </p>

                <div className="mt-6 border-t border-white/20 pt-5">
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
