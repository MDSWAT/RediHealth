"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { GoogleIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import { REQUEST_LANG_HEADER, withLangPrefix } from "@/lib/i18n/routing";
import { isValidEmail } from "@/lib/text";
import { captchaErrorMessage, useRecaptcha } from "@/components/security/RecaptchaProvider";

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

const inputClass =
  "mt-1.5 block h-12 w-full rounded-lg border border-border-control bg-card px-3.5 text-base text-foreground " +
  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "aria-[invalid=true]:border-amber-care";

export function SignInForm({
  googleConfigured,
  initialError = "",
}: {
  googleConfigured: boolean;
  initialError?: string;
}) {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const executeCaptcha = useRecaptcha();
  const form = t.signInPage.form;
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [portalEmail, setPortalEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState(initialError);
  const [portalRecoveryMessage, setPortalRecoveryMessage] = useState("");
  const [portalRecoveryError, setPortalRecoveryError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingPortal, setIsRequestingPortal] = useState(false);

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
        setPortalRecoveryError(
          response.status === 429 ? TOO_MANY[lang] : response.status === 400 ? form.emailInvalid : form.portalRecoveryError,
        );
        return;
      }
      setPortalRecoveryMessage(form.portalRecoverySent);
    } catch (error) {
      setPortalRecoveryError(captchaErrorMessage(error, form.portalRecoveryError));
    } finally {
      setIsRequestingPortal(false);
    }
  }

  async function requestCode() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      setError(form.emailInvalid);
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const captchaToken = await executeCaptcha("email_code");
      const response = await fetch("/api/auth/email-code/request", {
        method: "POST",
        headers: { "Content-Type": "application/json", [REQUEST_LANG_HEADER]: lang },
        body: JSON.stringify({ email: normalizedEmail, captchaToken }),
      });
      if (!response.ok) {
        setError(response.status === 429 ? TOO_MANY[lang] : response.status === 400 ? form.emailInvalid : form.genericSendError);
        return;
      }
      setStage("code");
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

      router.push(withLangPrefix("/panel", lang));
    } catch (error) {
      setError(captchaErrorMessage(error, form.genericVerifyError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 sm:p-10">
      {stage === "email" ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void requestCode();
          }}
          noValidate
        >
          <label htmlFor="email" className="text-sm font-semibold text-foreground">
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
            <p id="email-error" role="alert" className="mt-2 text-sm text-amber-care dark:text-amber-care-border">
              {error}
            </p>
          ) : (
            <p id="email-hint" className="mt-2 text-sm text-muted-foreground">
              {form.emailHint}
            </p>
          )}
          <div className="mt-7">
            <Button type="submit" variant="action" size="lg" disabled={isSubmitting}>
              <span className="min-w-0 truncate">{isSubmitting ? form.sendingCode : form.emailMeCode}</span>
            </Button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void verifyCode();
          }}
          noValidate
        >
          <h2 className="text-xl font-semibold text-foreground">{form.checkEmailTitle}</h2>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            {form.codeSentBody(email)}
          </p>
          <label htmlFor="code" className="mt-6 block text-sm font-semibold text-foreground">
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
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "code-error" : undefined}
            className={inputClass}
            placeholder="123456"
          />
          {error ? (
            <p id="code-error" role="alert" className="mt-2 text-sm text-amber-care dark:text-amber-care-border">
              {error}
            </p>
          ) : null}
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Button type="submit" variant="action" size="lg" disabled={isSubmitting}>
              <span className="min-w-0 truncate">{isSubmitting ? form.signingIn : form.continueLabel}</span>
            </Button>
            <button
              type="button"
              className="min-h-[44px] max-w-full whitespace-nowrap text-sm font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire-light dark:text-sapphire-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => {
                setCode("");
                setError("");
                setStage("email");
              }}
            >
              <span className="min-w-0 truncate">{form.useDifferentEmail}</span>
            </button>
          </div>
        </form>
      )}

      <form onSubmit={requestPortalLink} className="mt-8 border-t border-border pt-6">
        <h2 className="text-base font-semibold text-foreground">{form.portalRecoveryTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{form.portalRecoveryHint}</p>
        <label htmlFor="portal-recovery-email" className="mt-4 block text-sm font-semibold text-foreground">
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
          aria-describedby={portalRecoveryError ? "portal-recovery-error" : portalRecoveryMessage ? "portal-recovery-message" : undefined}
          className={inputClass}
          placeholder={form.portalRecoveryEmailPlaceholder}
        />
        {portalRecoveryError ? (
          <p id="portal-recovery-error" className="mt-2 text-sm text-amber-care dark:text-amber-care-border" role="alert">
            {portalRecoveryError}
          </p>
        ) : null}
        {portalRecoveryMessage ? (
          <p id="portal-recovery-message" className="mt-2 text-sm text-muted-foreground" role="status">
            {portalRecoveryMessage}
          </p>
        ) : null}
        <div className="mt-4">
          <Button type="submit" size="md" disabled={isRequestingPortal}>
            <span className="min-w-0 truncate">{isRequestingPortal ? form.portalRecoverySending : form.portalRecoveryButton}</span>
          </Button>
        </div>
      </form>

      {googleConfigured ? (
        <>
          <div className="my-8 flex items-center gap-4" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-foreground">{form.or}</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() =>
              void signIn("google", {
                callbackUrl: withLangPrefix("/panel", lang),
              })
            }
          >
            <GoogleIcon className="h-5 w-5 shrink-0" />
            <span className="min-w-0 truncate">{form.continueWithGoogle}</span>
          </Button>
        </>
      ) : null}
    </div>
  );
}
