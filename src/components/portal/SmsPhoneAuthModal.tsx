"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconTile } from "@/components/ui/IconTile";
import { CheckCircleIcon, AlertCircleIcon, LockIcon } from "@/components/ui/icons";
import { NAV_LINK_ICONS } from "@/components/layout/nav-links";
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
  ru: {
    step2Subtitle: (p) => `Мы отправили 4-значный код на ${p}. Введите его ниже.`,
    invalidPhoneError: "Напишите номер телефона, например 0721 000 000.",
    tooManyAttempts: "Слишком много попыток. Подождите минуту и ​​повторите попытку.",
    smsSent: "Мы отправили вам код в текстовом сообщении.",
    genericError: "Что-то пошло не так. Попробуйте еще раз.",
    demoNotice: "Тестовый код (только демо):",
    digit: (n) => `цифра ${n} из 4`,
    sending: "Отправка…",
    verifying: "Проверка…",
    changeNumber: "Изменить номер",
    resendSms: "Отправьте код еще раз",
    fallbackQuestion: "У вас нет телефона или вам нужна помощь со входом в систему?",
    fallbackLinkText: "Обратитесь за помощью к медицинскому посреднику",
  },

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
  hr: {
    step2Subtitle: (p) => `Poslali smo četveroznamenkasti kod na broj ${p}. Upiši ga niže.`,
    invalidPhoneError: "Upiši broj telefona, na primjer 091 000 0000.",
    tooManyAttempts: "Previše pokušaja. Pričekaj minutu pa pokušaj ponovno.",
    smsSent: "Poslali smo ti kod SMS porukom.",
    genericError: "Nešto nije uspjelo. Pokušaj ponovno.",
    demoNotice: "Probni kod (samo za prikaz):",
    digit: (n) => `Znamenka ${n} od 4`,
    sending: "Slanje…",
    verifying: "Provjera…",
    changeNumber: "Promijeni broj",
    resendSms: "Pošalji kod ponovno",
    fallbackQuestion: "Nemaš telefon kod sebe ili ti treba pomoć pri prijavi?",
    fallbackLinkText: "Zatraži pomoć zdravstvenog medijatora",
  },
  rom: {
    step2Subtitle: (p) => `Bichhaldyam kodo katar 4 gina pe ${p}. Lekhav les tele.`,
    invalidPhoneError: "Lekhav telefonesko gin, misal 0721 000 000.",
    tooManyAttempts: "But zumavimata. Azhuker ekh minuta thaj zumav palem.",
    smsSent: "Bichhaldyam tuke o kodo katar SMS.",
    genericError: "Vareso na kerdili mishto. Zumav palem.",
    demoNotice: "Zumavipnasko kodo (numay sikavipnaske):",
    digit: (n) => `Gin ${n} katar 4`,
    sending: "Bichhalel pes…",
    verifying: "Dikhlyol pes…",
    changeNumber: "Paruv o gin",
    resendSms: "Bichhal o kodo palem",
    fallbackQuestion: "Nane cho telefono tusa vay trebul tuke zhutipen te khuves andre?",
    fallbackLinkText: "Mang zhutipen katar ekh sastipnasko mediatori",
  },
};

const EMPTY_CODE = ["", "", "", ""];

const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:focus-visible:ring-paper";

// The edge is border-control, 3:1 against the card, so an empty field can be found.
const FIELD = `rounded-(--radius-control) border border-border-control bg-card text-foreground dark:border-white/40 dark:bg-ink-900 dark:text-paper ${FOCUS_RING}`;

const SUBMIT_BUTTON = `press-solid inline-flex min-h-14 w-full items-center justify-center rounded-(--radius-control) bg-sapphire px-4 text-base font-semibold text-white transition-[background-color,filter] duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-sapphire-light focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground motion-reduce:transition-none dark:bg-paper dark:text-ink-950 dark:hover:bg-paper/90 dark:focus-visible:ring-offset-ink-800 dark:disabled:bg-white/10 dark:disabled:text-mist ${FOCUS_RING}`;

const FIELD_LABEL = "text-base font-semibold text-foreground dark:text-paper";

/**
 * Account sign-in by phone, as one card: number, then a 4-digit SMS code (typed, pasted or filled
 * by the phone), with the way to a health mediator in an amber block under the action.
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
    <div className="mx-auto w-full max-w-md rounded-(--radius-surface) border border-border bg-card p-6 sm:p-8 dark:border-white/10 dark:bg-ink-800">
      <IconTile size={48} tone="sapphire-solid" icon={LockIcon} />
      <h1 className="mt-4 text-page text-foreground dark:text-paper">{page.title}</h1>
      <p className="mt-2 text-body text-muted-foreground dark:text-mist">{step === 1 ? page.subtitle : copy.step2Subtitle(phone)}</p>

      {error && (
        <p id="auth-phone-error" role="alert" className="mt-4 flex items-start gap-2 rounded-(--radius-control) border border-primary/30 bg-primary-soft p-3 text-body text-foreground dark:border-ruby-300/40 dark:bg-primary-soft/10 dark:text-paper">
          <AlertCircleIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary dark:text-ruby-300" />
          <span>{error}</span>
        </p>
      )}

      {sent && step === 2 && !error && (
        <p role="status" className="mt-4 flex items-start gap-2 text-body text-muted-foreground dark:text-mist">
          <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-sapphire dark:text-sapphire-border" />
          <span>{copy.smsSent}</span>
        </p>
      )}

      {demoCode && step === 2 && (
        <p className="mt-2 rounded-(--radius-control) bg-muted px-3 py-2 text-body text-muted-foreground dark:bg-white/10 dark:text-mist">
          {copy.demoNotice} <strong className="tabular-nums text-foreground dark:text-paper">{demoCode}</strong>
        </p>
      )}

      {step === 1 && (
        <form onSubmit={handleSendCode} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="authPhone" className={`mb-1.5 block ${FIELD_LABEL}`}>
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
              className={`min-h-14 w-full px-4 text-lg placeholder:text-muted-foreground dark:placeholder:text-mist ${FIELD}`}
            />
          </div>
          <button type="submit" disabled={isLoading} className={SUBMIT_BUTTON}>
            {isLoading ? copy.sending : page.sendCode}
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="mt-6 space-y-6">
          <fieldset>
            <legend className={`mb-2 ${FIELD_LABEL}`}>{page.codeLabel}</legend>
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
                  className={`h-14 w-12 text-center text-2xl font-semibold tabular-nums focus-visible:border-sapphire ${FIELD}`}
                />
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            disabled={isLoading || otpDigits.some((d) => !d)}
            onClick={() => verifyOtp(otpDigits.join(""))}
            className={SUBMIT_BUTTON}
          >
            {isLoading ? copy.verifying : page.verifyCode}
          </button>

          <div className="-mx-2 flex flex-wrap items-center justify-between gap-2 text-base">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtpDigits(EMPTY_CODE);
                setError("");
              }}
              className={`press-row min-h-11 rounded-(--radius-control) px-2 text-muted-foreground underline underline-offset-4 hover:text-foreground dark:text-mist dark:hover:text-paper ${FOCUS_RING}`}
            >
              {copy.changeNumber}
            </button>
            <button
              type="button"
              onClick={() => void handleSendCode()}
              disabled={isLoading}
              className={`press-row min-h-11 rounded-(--radius-control) px-2 font-semibold text-sapphire underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline dark:text-sapphire-border dark:disabled:text-mist ${FOCUS_RING}`}
            >
              {copy.resendSms}
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-start gap-3 rounded-(--radius-control) border border-amber-care-border bg-amber-care-soft p-4 dark:border-amber-care/40 dark:bg-amber-care/10">
        <IconTile size={40} tone="amber" icon={NAV_LINK_ICONS["/mediatori"]} />
        <div className="min-w-0">
          <p className="text-body text-foreground dark:text-paper">{copy.fallbackQuestion}</p>
          <Link
            href={withLangPrefix("/mediatori#solicita", lang)}
            className={`press-row -mx-2 mt-1 inline-flex min-h-11 items-center rounded-(--radius-control) px-2 text-base font-semibold text-sapphire underline-offset-4 hover:underline dark:text-sapphire-border ${FOCUS_RING}`}
          >
            {copy.fallbackLinkText}
          </Link>
        </div>
      </div>
    </div>
  );
}
