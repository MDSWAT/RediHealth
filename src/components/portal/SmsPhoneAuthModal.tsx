"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PhoneIcon, CheckCircleIcon, AlertCircleIcon, UsersIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { translations, type Lang } from "@/lib/i18n/translations";

function useSafeLanguage() {
  try {
    const ctx = useLanguage();
    return ctx;
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

const authModalCopy: Record<
  Lang,
  {
    step2Subtitle: (phone: string) => string;
    invalidPhoneError: string;
    tooManyAttempts: string;
    smsSent: string;
    genericError: string;
    demoNotice: string;
    digit: (n: number) => string;
    sending: string;
    verifying: string;
    changeNumber: string;
    resendSms: string;
    fallbackQuestion: string;
    fallbackLinkText: string;
  }
> = {
  ro: {
    step2Subtitle: (p) => `Am trimis un cod de 4 cifre la ${p}. Scrie-l mai jos.`,
    invalidPhoneError: "Scrie un număr de telefon, de exemplu 0721 000 000.",
    tooManyAttempts: "Ai încercat de prea multe ori. Așteaptă un minut și încearcă din nou.",
    smsSent: "Ți-am trimis codul prin SMS.",
    genericError: "Ceva nu a mers. Încearcă din nou.",
    demoNotice: "Cod de test (doar în demonstrație):",
    digit: (n) => `Cifra ${n} din 4`,
    sending: "Se trimite…",
    verifying: "Se verifică…",
    changeNumber: "Schimbă numărul",
    resendSms: "Trimite din nou codul",
    fallbackQuestion: "Nu ai telefonul la tine sau ai nevoie de ajutor?",
    fallbackLinkText: "Cere ajutor de la un mediator sanitar",
  },
  en: {
    step2Subtitle: (p) => `We sent a 4-digit code to ${p}. Type it below.`,
    invalidPhoneError: "Write a phone number, for example 0721 000 000.",
    tooManyAttempts: "Too many tries. Wait a minute and try again.",
    smsSent: "We sent you the code by text message.",
    genericError: "Something went wrong. Try again.",
    demoNotice: "Test code (demo only):",
    digit: (n) => `Digit ${n} of 4`,
    sending: "Sending…",
    verifying: "Checking…",
    changeNumber: "Change number",
    resendSms: "Send the code again",
    fallbackQuestion: "No phone with you, or need help signing in?",
    fallbackLinkText: "Ask a health mediator for help",
  },
  sq: {
    step2Subtitle: (p) => `Të dërguam një kod me 4 shifra në ${p}. Shkruaje më poshtë.`,
    invalidPhoneError: "Shkruaj një numër telefoni, për shembull 0721 000 000.",
    tooManyAttempts: "Provove shumë herë. Prit një minutë dhe provo përsëri.",
    smsSent: "Ta dërguam kodin me SMS.",
    genericError: "Diçka nuk shkoi. Provo përsëri.",
    demoNotice: "Kod prove (vetëm në demonstrim):",
    digit: (n) => `Shifra ${n} nga 4`,
    sending: "Po dërgohet…",
    verifying: "Po kontrollohet…",
    changeNumber: "Ndrysho numrin",
    resendSms: "Dërgo kodin përsëri",
    fallbackQuestion: "Nuk e ke telefonin me vete apo të duhet ndihmë?",
    fallbackLinkText: "Kërko ndihmë nga një mediator shëndetësor",
  },
  it: {
    step2Subtitle: (p) => `Ti abbiamo mandato un codice di 4 cifre al ${p}. Scrivilo qui sotto.`,
    invalidPhoneError: "Scrivi un numero di telefono, per esempio 0721 000 000.",
    tooManyAttempts: "Troppi tentativi. Aspetta un minuto e riprova.",
    smsSent: "Ti abbiamo mandato il codice via SMS.",
    genericError: "Qualcosa non ha funzionato. Riprova.",
    demoNotice: "Codice di prova (solo demo):",
    digit: (n) => `Cifra ${n} di 4`,
    sending: "Invio…",
    verifying: "Controllo…",
    changeNumber: "Cambia numero",
    resendSms: "Invia di nuovo il codice",
    fallbackQuestion: "Non hai il telefono con te o ti serve aiuto per accedere?",
    fallbackLinkText: "Chiedi aiuto a un mediatore sanitario",
  },
};

const EMPTY_CODE = ["", "", "", ""];

/**
 * Account sign-in by phone: number, then a 4-digit SMS code (typed, pasted or filled by the phone).
 * Server messages are Romanian only, so errors shown here come from this file's own copy.
 */
export function SmsPhoneAuthModal() {
  const router = useRouter();
  const { lang, t } = useSafeLanguage();
  const copy = authModalCopy[lang] ?? authModalCopy.ro;
  const page = t.accountAuthPage;

  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(EMPTY_CODE);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const digitRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (step === 2) digitRefs.current[0]?.focus();
  }, [step]);

  const cleanPhone = () => phone.trim().replace(/[\s-]+/g, "");

  const handleSendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (cleanPhone().length < 9) {
      setError(copy.invalidPhoneError);
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/patient-portal/request-phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone() }),
      });
      if (!response.ok) {
        setError(response.status === 429 ? copy.tooManyAttempts : response.status === 400 ? copy.invalidPhoneError : copy.genericError);
        return;
      }
      const data = (await response.json()) as { demoCode?: string };
      setDemoCode(data.demoCode ?? null);
      setOtpDigits(EMPTY_CODE);
      setSent(true);
      setStep(2);
    } catch {
      setError(copy.genericError);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (code: string) => {
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/patient-portal/verify-phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone(), otp: code }),
      });
      if (!response.ok) {
        setError(response.status === 400 ? page.invalidCode : copy.genericError);
        setIsLoading(false);
        return;
      }
      const data = (await response.json()) as { redirectUrl?: string };
      if (data.redirectUrl) router.push(withLangPrefix(data.redirectUrl, lang));
      else setIsLoading(false);
    } catch {
      setError(copy.genericError);
      setIsLoading(false);
    }
  };

  const fillDigits = (from: number, raw: string) => {
    const incoming = raw.replace(/\D/g, "").slice(0, 4 - from).split("");
    if (incoming.length === 0) return;
    const updated = [...otpDigits];
    incoming.forEach((d, i) => (updated[from + i] = d));
    setOtpDigits(updated);
    const next = Math.min(from + incoming.length, 3);
    digitRefs.current[next]?.focus();
    if (updated.every((d) => d.length === 1)) void verifyOtp(updated.join(""));
  };

  const handleDigitChange = (index: number, val: string) => {
    if (val === "") {
      const updated = [...otpDigits];
      updated[index] = "";
      setOtpDigits(updated);
      return;
    }
    fillDigits(index, val.length > 1 && otpDigits[index] ? val.replace(otpDigits[index], "") : val);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) digitRefs.current[index - 1]?.focus();
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-card p-6 sm:p-8">
      <PhoneIcon className="h-6 w-6 text-sapphire" />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{page.title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step === 1 ? page.subtitle : copy.step2Subtitle(phone)}</p>

      {error && (
        <p id="auth-phone-error" role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-amber-care-border bg-amber-care-soft/40 p-3 text-sm font-medium text-foreground dark:bg-amber-care/10">
          <AlertCircleIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-care dark:text-amber-care-border" />
          <span>{error}</span>
        </p>
      )}

      {sent && step === 2 && !error && (
        <p role="status" className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
          <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-sapphire" />
          <span>{copy.smsSent}</span>
        </p>
      )}

      {demoCode && step === 2 && (
        <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          {copy.demoNotice} <strong className="font-mono text-foreground">{demoCode}</strong>
        </p>
      )}

      {step === 1 && (
        <form onSubmit={handleSendCode} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="authPhone" className="mb-1.5 block text-sm font-semibold text-foreground">
              {page.phoneLabel}
            </label>
            <input
              id="authPhone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={page.phonePlaceholder}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "auth-phone-error" : undefined}
              className="min-h-[48px] w-full rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-lg bg-sapphire px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            {isLoading ? copy.sending : page.sendCode}
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="mt-6 space-y-6">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-foreground">{page.codeLabel}</legend>
            <div className="flex gap-3">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    digitRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={idx === 0 ? "one-time-code" : "off"}
                  pattern="[0-9]*"
                  maxLength={idx === 0 ? 4 : 1}
                  aria-label={copy.digit(idx + 1)}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onPaste={(e) => {
                    e.preventDefault();
                    fillDigits(idx, e.clipboardData.getData("text"));
                  }}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="h-14 w-12 rounded-lg border border-border bg-background text-center font-mono text-2xl font-semibold text-foreground tabular-nums focus-visible:border-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            disabled={isLoading || otpDigits.some((d) => !d)}
            onClick={() => verifyOtp(otpDigits.join(""))}
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-lg bg-sapphire px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            {isLoading ? copy.verifying : page.verifyCode}
          </button>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtpDigits(EMPTY_CODE);
                setError("");
              }}
              className="min-h-[44px] rounded-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copy.changeNumber}
            </button>
            <button
              type="button"
              onClick={() => void handleSendCode()}
              disabled={isLoading}
              className="min-h-[44px] rounded-sm font-semibold text-sapphire underline-offset-4 hover:underline dark:text-sapphire-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
            >
              {copy.resendSms}
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">{copy.fallbackQuestion}</p>
        <Link
          href={withLangPrefix("/mediatori#solicita", lang)}
          className="mt-1 inline-flex min-h-[44px] items-center gap-1.5 rounded-sm text-sm font-semibold text-sapphire hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border"
        >
          <UsersIcon className="h-4 w-4" />
          {copy.fallbackLinkText}
        </Link>
      </div>
    </div>
  );
}
