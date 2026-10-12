"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { GoogleIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { REQUEST_LANG_HEADER, withLangPrefix } from "@/lib/i18n/routing";

type Stage = "email" | "code";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "mt-1.5 block h-12 w-full rounded-lg border border-border bg-card px-3.5 text-base text-foreground " +
  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "aria-[invalid=true]:border-primary";

export function SignInForm({
  googleConfigured,
  initialError = "",
}: {
  googleConfigured: boolean;
  initialError?: string;
}) {
  const router = useRouter();
  const { t, lang } = useLanguage();
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
    if (!emailPattern.test(normalizedEmail)) {
      setPortalRecoveryError(form.emailInvalid);
      setPortalRecoveryMessage("");
      return;
    }

    setPortalRecoveryError("");
    setPortalRecoveryMessage("");
    setIsRequestingPortal(true);
    try {
      const response = await fetch("/api/patient-portal/request-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [REQUEST_LANG_HEADER]: lang,
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setPortalRecoveryError(result.error || form.portalRecoveryError);
        return;
      }
      setPortalRecoveryMessage(form.portalRecoverySent);
    } catch {
      setPortalRecoveryError(form.portalRecoveryError);
    } finally {
      setIsRequestingPortal(false);
    }
  }

  async function requestCode() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      setError(form.emailInvalid);
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/email-code/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error || form.genericSendError);
        return;
      }
      setStage("code");
    } catch {
      setError(form.genericSendError);
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
      const res = await signIn("email-code", {
        code: code.trim(),
        redirect: false,
      });

      if (res?.error) {
        const response = await fetch("/api/auth/email-code/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: code.trim() }),
        });
        const result = (await response.json()) as {
          error?: string;
          redirectTo?: string;
        };
        if (!response.ok) {
          setError(result.error || form.genericVerifyError);
          return;
        }
        router.push(result.redirectTo || withLangPrefix("/panel", lang));
        return;
      }

      router.push(withLangPrefix("/panel", lang));
    } catch {
      setError(form.genericVerifyError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 sm:p-10">
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
            <p id="email-error" className="mt-2 text-sm text-primary">
              {error}
            </p>
          ) : (
            <p id="email-hint" className="mt-2 text-sm text-muted-foreground">
              {form.emailHint}
            </p>
          )}
          <div className="mt-7">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? form.sendingCode : form.emailMeCode}
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
            <p id="code-error" className="mt-2 text-sm text-primary">
              {error}
            </p>
          ) : null}
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? form.signingIn : form.continueLabel}
            </Button>
            <button
              type="button"
              className="text-sm font-semibold text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => {
                setCode("");
                setError("");
                setStage("email");
              }}
            >
              {form.useDifferentEmail}
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
          <p id="portal-recovery-error" className="mt-2 text-sm text-primary" role="alert">
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
            {isRequestingPortal ? form.portalRecoverySending : form.portalRecoveryButton}
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
            <GoogleIcon className="h-5 w-5" />
            {form.continueWithGoogle}
          </Button>
        </>
      ) : null}
    </div>
  );
}
