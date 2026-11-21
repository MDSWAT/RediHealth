"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { ChevronDownIcon, GoogleIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import { REQUEST_LANG_HEADER, withLangPrefix } from "@/lib/i18n/routing";
import { isValidEmail } from "@/lib/text";
import {
  captchaErrorMessage,
  captchaFailureMessage,
  useRecaptcha,
} from "@/components/security/RecaptchaProvider";

type Stage = "email" | "code";

// The sign-in APIs answer in English; a rate limit gets its own sentence, anything else the form's own message.
const TOO_MANY: Record<Lang, string> = {
  ru: "Слишком много попыток. Пожалуйста, подождите немного и повторите попытку.",

  ro: "Prea multe încercări. Așteaptă puțin și încearcă din nou.",
  en: "Too many attempts. Please wait a little and try again.",
  sq: "Shumë përpjekje. Prit pak dhe provo përsëri.",
  it: "Troppi tentativi. Attendi un momento e riprova.",
  hr: "Previše pokušaja. Pričekaj malo pa pokušaj ponovno.",
  rom: "But zumavimata. Azhuker zalag thaj zumav palem.",
};

// What to do when the code does not arrive. The button it names is the form's own "resend" label.
const CODE_HELP: Record<Lang, (resendLabel: string) => string> = {
  ro: (resend) => `Nu a venit emailul? Caută în folderul spam, apoi apasă pe „${resend}”.`,
  en: (resend) => `No email yet? Look in the spam folder, then tap "${resend}".`,
  sq: (resend) => `Nuk erdhi emaili? Shiko te dosja spam, pastaj shtyp „${resend}“.`,
  it: (resend) => `Nessuna email? Guarda nella cartella spam, poi tocca «${resend}».`,
  hr: (resend) => `Nema e-pošte? Pogledaj u mapu neželjene pošte, zatim dodirni „${resend}“.`,
  rom: (resend) => `Na avilo o emailo? Dikh and-o spam, pal kodo azba „${resend}”.`,
  ru: (resend) => `Письмо не пришло? Проверьте папку «Спам», затем нажмите «${resend}».`,
};

const SIGN_IN_LEGAL_NOTICE: Record<Lang, { before: string; terms: string; between: string; privacy: string; after: string }> = {
  ro: {
    before: "Folosim adresa ta de email doar pentru autentificare și serviciile cerute. Nu vindem datele tale. Continuând, accepți",
    terms: "Termenii și condițiile",
    between: "și iei cunoștință de",
    privacy: "Politica de confidențialitate",
    after: ".",
  },
  en: {
    before: "We use your email address only for sign-in and requested services. We never sell your data. By continuing, you accept the",
    terms: "Terms and conditions",
    between: "and acknowledge our",
    privacy: "Privacy policy",
    after: ".",
  },
  sq: {
    before: "Përdorim emailin tënd vetëm për hyrje dhe shërbimet e kërkuara. Nuk i shesim të dhënat e tua. Duke vazhduar, pranon",
    terms: "Kushtet dhe rregullat",
    between: "dhe njihesh me",
    privacy: "Politikën e privatësisë",
    after: ".",
  },
  it: {
    before: "Usiamo la tua email solo per l'accesso e i servizi richiesti. Non vendiamo i tuoi dati. Continuando, accetti i",
    terms: "Termini e condizioni",
    between: "e prendi visione dell'",
    privacy: "Informativa sulla privacy",
    after: ".",
  },
  hr: {
    before: "Tvoju e-poštu koristimo samo za prijavu i zatražene usluge. Ne prodajemo tvoje podatke. Nastavkom prihvaćaš",
    terms: "Uvjete korištenja",
    between: "i upoznaješ se s",
    privacy: "Pravilima privatnosti",
    after: ".",
  },
  rom: {
    before: "Labaras cho emailo numay vash dinipe andre thaj mangime sluzhbe. Na bikinas che podatke. Te zhas may dur, kames",
    terms: "Labaripnaske pravila",
    between: "thaj gines",
    privacy: "Garavipnaske pravila",
    after: ".",
  },
  ru: {
    before: "Мы используем вашу электронную почту только для входа и запрошенных услуг. Мы не продаём ваши данные. Продолжая, вы принимаете",
    terms: "Условия использования",
    between: "и ознакомились с",
    privacy: "Политикой конфиденциальности",
    after: ".",
  },
};

// field-focus: the edge darkens on hover and focus eases in a sapphire edge with a soft halo
// (aria-invalid aware). Static under reduced motion and Calm Motion.
const inputClass =
  "field-focus mt-1.5 block h-12 w-full rounded-lg border border-border-control bg-card px-3.5 text-body text-foreground " +
  "placeholder:text-muted-foreground";

export function SignInForm({
  googleConfigured,
  initialError = "",
  embedded = false,
}: {
  googleConfigured: boolean;
  initialError?: string;
  embedded?: boolean;
}) {
  const { t, lang } = useLanguage();
  const executeCaptcha = useRecaptcha();
  const form = t.signInPage.form;
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [portalEmail, setPortalEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeResent, setCodeResent] = useState(false);
  const [error, setError] = useState(initialError);
  const [portalRecoveryMessage, setPortalRecoveryMessage] = useState("");
  const [portalRecoveryError, setPortalRecoveryError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingPortal, setIsRequestingPortal] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);

  async function requestPortalLink(event: React.FormEvent) {
    event.preventDefault();
    const normalizedEmail = portalEmail.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      setPortalRecoveryError(form.emailInvalid);
      setPortalRecoveryMessage("");
      return;
    }

    setPortalRecoveryError("");
    setPortalRecoveryMessage("");
    setIsRequestingPortal(true);
    try {
      const captchaToken = await executeCaptcha("portal_link");
      const response = await fetch("/api/patient-portal/request-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [REQUEST_LANG_HEADER]: lang,
        },
        body: JSON.stringify({ email: normalizedEmail, captchaToken }),
      });
      if (!response.ok) {
        const failure = (await response.json().catch(() => null)) as { code?: unknown } | null;
        setPortalRecoveryError(
          response.status === 429
            ? TOO_MANY[lang]
            : (captchaFailureMessage(lang, failure?.code) ??
              (response.status === 400 ? form.emailInvalid : form.portalRecoveryError)),
        );
        return;
      }
      setPortalRecoveryMessage(form.portalRecoverySent);
    } catch (error) {
      setPortalRecoveryError(
        captchaErrorMessage(error, form.portalRecoveryError),
      );
    } finally {
      setIsRequestingPortal(false);
    }
  }

  async function requestCode(isResend = false) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      setError(form.emailInvalid);
      return;
    }

    setError("");
    if (isResend) {
      setCodeResent(false);
    }
    setIsSubmitting(true);
    try {
      const captchaToken = await executeCaptcha("email_code");
      const response = await fetch("/api/auth/email-code/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [REQUEST_LANG_HEADER]: lang,
        },
        body: JSON.stringify({ email: normalizedEmail, captchaToken }),
      });
      if (!response.ok) {
        const failure = (await response.json().catch(() => null)) as { code?: unknown } | null;
        setError(
          response.status === 429
            ? TOO_MANY[lang]
            : (captchaFailureMessage(lang, failure?.code) ??
              (response.status === 400 ? form.emailInvalid : form.genericSendError)),
        );
        return;
      }
      setStage("code");
      setCodeResent(isResend);
    } catch (error) {
      setError(captchaErrorMessage(error, form.genericSendError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyCode() {
    if (!/^\d{6}$/.test(code.trim())) {
      setError(form.codeInvalid);
      return;
    }

    setError("");
    setCodeResent(false);
    setIsSubmitting(true);
    try {
      const captchaToken = await executeCaptcha("verify_code");
      const res = await signIn("email-code", {
        code: code.trim(),
        captchaToken,
        redirect: false,
      });

      if (res?.error) {
        setError(form.genericVerifyError);
        return;
      }

      // Hard navigation: the new session cookie must reach the server on the very next request.
      // A client-side push can reuse a cached /panel result (a redirect back to sign-in), which looked like "enter your email again".
      window.location.assign(withLangPrefix("/panel", lang));
    } catch (error) {
      setError(captchaErrorMessage(error, form.genericVerifyError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div
        className={
          embedded
            ? "mt-1"
            : "rounded-(--radius-surface) border border-border bg-card p-5 shadow-(--shadow-card-rest) sm:p-8"
        }
      >
        <div key={stage} className="fhs-enter">
          {stage === "email" ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void requestCode();
              }}
              noValidate
            >
              <label
                htmlFor="email"
                className="text-body font-semibold text-foreground"
              >
                {form.emailLabel}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "email-error" : "email-hint"}
                className={inputClass}
                placeholder={form.emailPlaceholder}
              />
              {error ? (
                <p
                  id="email-error"
                  role="alert"
                  className="swap-in mt-2 text-body text-amber-care dark:text-amber-care-border"
                >
                  {error}
                </p>
              ) : (
                <p
                  id="email-hint"
                  className="mt-2 text-body text-muted-foreground"
                >
                  {form.emailHint}
                </p>
              )}
              <div className="mt-6">
                <Button
                  type="submit"
                  variant="action"
                  size="lg"
                  fullWidth
                  disabled={isSubmitting}
                >
                  {isSubmitting ? form.sendingCode : form.emailMeCode}
                </Button>
              </div>
              <p className="mt-4 text-meta leading-relaxed text-muted-foreground">
                {(SIGN_IN_LEGAL_NOTICE[lang] ?? SIGN_IN_LEGAL_NOTICE.en).before}{" "}
                <Link
                  href={withLangPrefix("/terms", lang)}
                  className="rounded-sm text-sapphire underline decoration-sapphire/40 underline-offset-4 hover:text-sapphire-light hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border"
                >
                  {(SIGN_IN_LEGAL_NOTICE[lang] ?? SIGN_IN_LEGAL_NOTICE.en).terms}
                </Link>{" "}
                {(SIGN_IN_LEGAL_NOTICE[lang] ?? SIGN_IN_LEGAL_NOTICE.en).between}{" "}
                <Link
                  href={withLangPrefix("/privacy", lang)}
                  className="rounded-sm text-sapphire underline decoration-sapphire/40 underline-offset-4 hover:text-sapphire-light hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border"
                >
                  {(SIGN_IN_LEGAL_NOTICE[lang] ?? SIGN_IN_LEGAL_NOTICE.en).privacy}
                </Link>
                {(SIGN_IN_LEGAL_NOTICE[lang] ?? SIGN_IN_LEGAL_NOTICE.en).after}
              </p>
            </form>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void verifyCode();
              }}
              noValidate
            >
              <h2 className="text-section font-semibold text-foreground">
                {form.checkEmailTitle}
              </h2>
              <p className="mt-2 text-body text-muted-foreground">
                {form.codeSentBody(email)}
              </p>
              <label
                htmlFor="code"
                className="mt-6 block text-body font-semibold text-foreground"
              >
                {form.codeLabel}
              </label>
              <input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, ""))
                }
                aria-invalid={Boolean(error)}
                aria-describedby={
                  error ? "code-error" : codeResent ? "code-resent" : undefined
                }
                className={`${inputClass} font-medium tracking-[0.18em] tabular-nums`}
                placeholder="123456"
              />
              {error ? (
                <p
                  id="code-error"
                  role="alert"
                  className="swap-in mt-2 text-body text-amber-care dark:text-amber-care-border"
                >
                  {error}
                </p>
              ) : codeResent ? (
                <p
                  id="code-resent"
                  role="status"
                  className="swap-in mt-2 text-body text-muted-foreground"
                >
                  {form.codeResent}
                </p>
              ) : null}
              <p className="mt-2 text-body text-muted-foreground">
                {CODE_HELP[lang](form.resendCode)}
              </p>
              <div className="mt-6">
                <Button
                  type="submit"
                  variant="action"
                  size="lg"
                  fullWidth
                  disabled={isSubmitting}
                >
                  {isSubmitting ? form.signingIn : form.continueLabel}
                </Button>
              </div>
              <div className="btn-row mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="press-row min-h-11 max-w-full whitespace-nowrap rounded-lg px-1.5 text-body font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted/60 hover:text-sapphire-light disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none dark:text-sapphire-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => void requestCode(true)}
                >
                  {form.resendCode}
                </button>
                <button
                  type="button"
                  className="press-row min-h-11 max-w-full whitespace-nowrap rounded-lg px-1.5 text-body font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted/60 hover:text-sapphire-light motion-reduce:transition-none dark:text-sapphire-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => {
                    setCode("");
                    setCodeResent(false);
                    setError("");
                    setStage("email");
                  }}
                >
                  {form.useDifferentEmail}
                </button>
              </div>
            </form>
          )}
        </div>
        {googleConfigured ? (
          <>
            <div className="my-6 flex items-center gap-4" aria-hidden="true">
              <span className="h-px flex-1 bg-border" />
              <span className="text-meta text-muted-foreground">{form.or}</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              fullWidth
              className="px-3 sm:px-4"
              onClick={() =>
                void signIn("google", {
                  callbackUrl: withLangPrefix("/panel", lang),
                })
              }
            >
              <GoogleIcon className="h-5 w-5 shrink-0" />
              {form.continueWithGoogle}
            </Button>
          </>
        ) : null}
      </div>

      {/* A second, rarer task: it stays one quiet line under the card until someone needs it. */}
      <section className="mt-5 border-t border-border pt-1.5">
        <h2>
          <button
            type="button"
            aria-expanded={recoveryOpen}
            aria-controls="portal-recovery-panel"
            onClick={() => setRecoveryOpen((open) => !open)}
            className="press-row flex min-h-12 w-full items-center justify-between gap-3 rounded-lg px-2 text-left text-body font-semibold text-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            <span className="min-w-0 flex-1">{form.portalRecoveryTitle}</span>
            <ChevronDownIcon
              className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none ${recoveryOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        </h2>
        <div
          id="portal-recovery-panel"
          className={`grid transition-[grid-template-rows,opacity] duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none ${
            recoveryOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden" inert={!recoveryOpen}>
            <form onSubmit={requestPortalLink} className="px-2 pt-1 pb-3">
              <p className="text-body text-muted-foreground text-pretty">
                {form.portalRecoveryHint}
              </p>
              <label
                htmlFor="portal-recovery-email"
                className="mt-3 block text-body font-semibold text-foreground"
              >
                {form.portalRecoveryEmailLabel}
              </label>
              <input
                id="portal-recovery-email"
                name="portal-recovery-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={portalEmail}
                onChange={(event) => setPortalEmail(event.target.value)}
                aria-invalid={Boolean(portalRecoveryError)}
                aria-describedby={
                  portalRecoveryError
                    ? "portal-recovery-error"
                    : portalRecoveryMessage
                      ? "portal-recovery-message"
                      : undefined
                }
                className={inputClass}
                placeholder={form.portalRecoveryEmailPlaceholder}
              />
              {portalRecoveryError ? (
                <p
                  id="portal-recovery-error"
                  className="swap-in mt-2 text-body text-amber-care dark:text-amber-care-border"
                  role="alert"
                >
                  {portalRecoveryError}
                </p>
              ) : null}
              {portalRecoveryMessage ? (
                <p
                  id="portal-recovery-message"
                  className="swap-in mt-2 text-body text-muted-foreground"
                  role="status"
                >
                  {portalRecoveryMessage}
                </p>
              ) : null}
              <div className="mt-4">
                <Button
                  type="submit"
                  variant="outline"
                  size="md"
                  disabled={isRequestingPortal}
                >
                  {isRequestingPortal
                    ? form.portalRecoverySending
                    : form.portalRecoveryButton}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
