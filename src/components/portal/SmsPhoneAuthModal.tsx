"use client";

import { useState, useRef, useEffect, type PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  VolumeIcon,
  PhoneIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { useReadAloud } from "@/components/health-check/readingTools";
import { contulMeuCopy } from "@/components/portal/contul-meu-copy";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { translations, type Lang } from "@/lib/i18n/translations";
import { useCalmReducedMotion } from "@/lib/motion/tokens";

export function normalizePortalPhone(raw: string): string {
  return raw.trim().replace(/[\s().-]+/g, "");
}

const listenCopy: Record<Lang, { listen: string; stop: string }> = {
  ro: { listen: "Ascultă", stop: "Oprește" },
  en: { listen: "Listen", stop: "Stop" },
  sq: { listen: "Dëgjo", stop: "Ndalo" },
  it: { listen: "Ascolta", stop: "Ferma" },
  hr: { listen: "Slušaj", stop: "Zaustavi" },
  rom: { listen: "Ashun", stop: "Ačhav" },
  ru: { listen: "Слушать", stop: "Остановить" },
};

function useSafeLanguage(initialLang: Lang) {
  try {
    return useLanguage();
  } catch {
    return {
      lang: initialLang,
      t: translations[initialLang] ?? translations.ro,
      setLang: () => {},
    };
  }
}

const authModalCopy: Record<
  Lang,
  {
    step2Subtitle: (phone: string) => string;
    invalidPhoneError: string;
    tooManyAttempts: string;
    smsSent: string;
    smsSwitchHint: string;
    genericError: string;
    demoNotice: string;
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
    tooManyAttempts: "Слишком много попыток. Подождите минуту и повторите попытку.",
    smsSent: "Мы отправили вам код в текстовом сообщении.",
    smsSwitchHint: "Можете открыть SMS на телефоне, чтобы посмотреть код. Эта страница останется открытой.",
    genericError: "Что-то пошло не так. Попробуйте еще раз.",
    demoNotice: "Тестовый код (только демо):",
    sending: "Отправка…",
    verifying: "Проверка…",
    changeNumber: "Изменить номер",
    resendSms: "Отправить код еще раз",
    fallbackQuestion: "У вас нет телефона или вам нужна помощь со входом?",
    fallbackLinkText: "Обратитесь за помощью к медицинскому посреднику",
  },
  ro: {
    step2Subtitle: (p) => `Am trimis un cod de 4 cifre la ${p}. Scrie-l mai jos.`,
    invalidPhoneError: "Scrie un număr de telefon, de exemplu 0721 000 000.",
    tooManyAttempts: "Ai încercat de prea multe ori. Așteaptă un minut și încearcă din nou.",
    smsSent: "Ți-am trimis codul prin SMS.",
    smsSwitchHint: "Poți deschide mesajele SMS pe telefon ca să vezi codul. Această pagină rămâne deschisă și te așteaptă.",
    genericError: "Ceva nu a mers. Încearcă din nou.",
    demoNotice: "Cod de test (doar în demonstrație):",
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
    smsSwitchHint: "You can open your SMS messages to check the code. This page stays open waiting for you.",
    genericError: "Something went wrong. Try again.",
    demoNotice: "Test code (demo only):",
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
    smsSwitchHint: "Mund t'i hapësh mesazhet SMS në telefon për të parë kodin. Kjo faqe mbetet e hapur.",
    genericError: "Diçka nuk shkoi. Provo përsëri.",
    demoNotice: "Kod prove (vetëm në demonstrim):",
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
    smsSwitchHint: "Puoi aprire i messaggi SMS sul telefono per leggere il codice. Questa pagina resta aperta.",
    genericError: "Qualcosa non ha funzionato. Riprova.",
    demoNotice: "Codice di prova (solo demo):",
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
    smsSwitchHint: "Možeš otvoriti SMS poruke na telefonu kako bi vidio kod. Ova stranica ostaje otvorena.",
    genericError: "Nešto nije uspjelo. Pokušaj ponovno.",
    demoNotice: "Probni kod (samo za prikaz):",
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
    smsSwitchHint: "Shaj putres e SMS mesažurya te dikhes o kodo. Kadi rig achhol putardi tuke.",
    genericError: "Vareso na kerdili mishto. Zumav palem.",
    demoNotice: "Zumavipnasko kodo (numay sikavipnaske):",
    sending: "Bichhalel pes…",
    verifying: "Dikhlyol pes…",
    changeNumber: "Paruv o gin",
    resendSms: "Bichhal o kodo palem",
    fallbackQuestion: "Nane cho telefono tusa vay trebul tuke zhutipen te khuves andre?",
    fallbackLinkText: "Mang zhutipen katar ekh sastipnasko mediatori",
  },
};

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card dark:focus-visible:ring-offset-ink-900";

const FIELD =
  "min-h-14 w-full rounded-xl border border-border-control bg-white text-xl font-semibold tabular-nums text-foreground placeholder:font-normal placeholder:text-muted-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:border-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none dark:border-white/15 dark:bg-ink-950 dark:text-paper dark:placeholder:text-mist/60";

const SUBMIT_BUTTON =
  `press-solid inline-flex min-h-14 w-full max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-sapphire px-4 text-sm font-semibold text-white transition-[background-color,filter] duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-sapphire-light disabled:cursor-not-allowed disabled:bg-foreground/15 disabled:text-foreground/45 dark:disabled:bg-white/15 dark:disabled:text-white/45 motion-reduce:transition-none sm:px-5 sm:text-[0.9375rem] ${FOCUS_RING}`;

const FIELD_LABEL = "text-base font-semibold text-foreground dark:text-paper";
const CALM_EASE: [number, number, number, number] = [0.25, 1, 0.5, 1];

/**
 * Patient medical record SMS sign-in card.
 * Uses a calm Apple-Health surface: spatial micro-float (disabled while typing or under
 * reduced motion), anticipation progress hairline, single-heading flow, and mediator fallback link.
 */
export function SmsPhoneAuthModal({ initialLang = "ro" }: { initialLang?: Lang }) {
  const router = useRouter();
  const { lang: activeLang, t } = useSafeLanguage(initialLang);
  const lang = activeLang ?? initialLang;
  const copy = authModalCopy[lang] ?? authModalCopy.ro;
  const voice = useReadAloud(lang);
  const listenText = listenCopy[lang] ?? listenCopy.ro;
  const surfaceCopy = contulMeuCopy[lang] ?? contulMeuCopy.ro;
  const page = t.accountAuthPage ?? translations[lang].accountAuthPage;
  const calmMotion = useCalmReducedMotion();

  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const otpInputRef = useRef<HTMLInputElement | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const pointerTarget = useRef({ x: 0, y: 0, sx: 50, sy: 28, active: false });
  const pointerCurrent = useRef({ x: 0, y: 0, sx: 50, sy: 28 });
  const pointerRaf = useRef<number | null>(null);

  const cleanPhone = () => normalizePortalPhone(phone);
  const cleanDigits = cleanPhone();
  const phoneReady = cleanDigits.length >= 9;
  const isEditing = phoneFocused || otpFocused;

  const stopFloatLoop = () => {
    if (pointerRaf.current !== null) {
      cancelAnimationFrame(pointerRaf.current);
      pointerRaf.current = null;
    }
  };

  useEffect(() => {
    if (calmMotion || isEditing) {
      stopFloatLoop();
      pointerTarget.current = { x: 0, y: 0, sx: 50, sy: 28, active: false };
      pointerCurrent.current = { x: 0, y: 0, sx: 50, sy: 28 };
      if (cardRef.current) cardRef.current.style.transform = "translate3d(0px, 0px, 0)";
      if (sheenRef.current) sheenRef.current.style.opacity = "0";
    }
    return stopFloatLoop;
  }, [calmMotion, isEditing]);

  const startFloatLoop = () => {
    if (pointerRaf.current !== null || calmMotion || isEditing) return;
    const stepFrame = () => {
      const target = pointerTarget.current;
      const cur = pointerCurrent.current;
      const lerp = 0.14;
      cur.x += (target.x - cur.x) * lerp;
      cur.y += (target.y - cur.y) * lerp;
      cur.sx += (target.sx - cur.sx) * lerp;
      cur.sy += (target.sy - cur.sy) * lerp;

      if (cardRef.current) {
        cardRef.current.style.transform = `translate3d(${cur.x.toFixed(2)}px, ${cur.y.toFixed(2)}px, 0)`;
      }
      if (sheenRef.current) {
        sheenRef.current.style.setProperty("--sheen-x", `${cur.sx.toFixed(1)}%`);
        sheenRef.current.style.setProperty("--sheen-y", `${cur.sy.toFixed(1)}%`);
        sheenRef.current.style.opacity = target.active ? "1" : "0";
      }

      const settled =
        Math.abs(target.x - cur.x) < 0.04 &&
        Math.abs(target.y - cur.y) < 0.04 &&
        !target.active;

      if (settled) {
        if (cardRef.current) cardRef.current.style.transform = "translate3d(0px, 0px, 0)";
        pointerRaf.current = null;
        return;
      }
      pointerRaf.current = requestAnimationFrame(stepFrame);
    };
    pointerRaf.current = requestAnimationFrame(stepFrame);
  };

  const handleCardPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (calmMotion || isEditing) return;
    if (event.pointerType !== "mouse") return;
    if (typeof window !== "undefined" && !window.matchMedia("(pointer: fine)").matches) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;

    const nx = (event.clientX - rect.left) / rect.width;
    const ny = (event.clientY - rect.top) / rect.height;
    pointerTarget.current = {
      x: (nx - 0.5) * 9,
      y: (ny - 0.5) * 7,
      sx: nx * 100,
      sy: ny * 100,
      active: true,
    };
    startFloatLoop();
  };

  const handleCardPointerLeave = () => {
    pointerTarget.current = { ...pointerTarget.current, x: 0, y: 0, active: false };
    startFloatLoop();
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

  const verifyOtpRef = useRef(verifyOtp);
  useEffect(() => {
    verifyOtpRef.current = verifyOtp;
  });

  useEffect(() => {
    if (step !== 2) return;
    otpInputRef.current?.focus();

    if (typeof window === "undefined" || !("OTPCredential" in window) || !navigator.credentials?.get) {
      return;
    }
    const controller = new AbortController();
    (navigator.credentials.get as (options?: unknown) => Promise<{ code?: string } | null>)({
      otp: { transport: ["sms"] },
      signal: controller.signal,
    })
      .then((credential) => {
        const cleaned = credential?.code?.replace(/\D/g, "").slice(0, 4) ?? "";
        if (cleaned.length === 4) {
          setOtpCode(cleaned);
          void verifyOtpRef.current(cleaned);
        }
      })
      .catch(() => {
        // Ignored cleanly when browser cancels, times out, or WebOTP is unsupported.
      });

    return () => controller.abort();
  }, [step]);

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
        setError(
          response.status === 429
            ? copy.tooManyAttempts
            : response.status === 400
              ? copy.invalidPhoneError
              : copy.genericError,
        );
        return;
      }
      const data = (await response.json()) as { demoCode?: string };
      setDemoCode(data.demoCode ?? null);
      setOtpCode("");
      setSent(true);
      setStep(2);
    } catch {
      setError(copy.genericError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    setOtpCode(digits);
    if (digits.length === 4) {
      void verifyOtp(digits);
    }
  };

  // Dynamic anticipation hairline progress + behavioural subtitle state
  const hairlineScale = step === 2 ? 1 : phoneReady ? 0.78 : phoneFocused || cleanDigits.length > 0 ? 0.56 : 0.36;
  const activeSubtitleKey = step === 2 ? "step2" : phoneReady ? "ready" : "default";
  const activeSubtitle =
    step === 2 ? copy.step2Subtitle(phone) : phoneReady ? surfaceCopy.card.phoneReadyHint : page.subtitle;
  const stepText = surfaceCopy.card.step(step, 2);

  return (
    <div
      ref={cardRef}
      onPointerMove={handleCardPointerMove}
      onPointerLeave={handleCardPointerLeave}
      className="relative overflow-hidden rounded-2xl border border-border/90 bg-card text-foreground shadow-(--shadow-card-hover) dark:border-white/12 dark:bg-ink-900 dark:text-paper"
    >
      {/* Subtle sapphire cursor sheen on desktop hover (still when typing or reduced motion). */}
      <div
        ref={sheenRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-(--dur-base) ease-(--ease-out-calm)"
        style={{
          background:
            "radial-gradient(380px circle at var(--sheen-x, 50%) var(--sheen-y, 28%), rgba(29, 53, 87, 0.06), transparent 70%)",
        }}
      />

      {/* Hairline progress bar driven by live form readiness */}
      <div className="relative z-10 h-[2px] w-full bg-foreground/8 dark:bg-white/10" aria-hidden="true">
        <div
          className="h-full origin-left bg-sapphire transition-transform duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none dark:bg-sapphire-border"
          style={{ transform: `scaleX(${hairlineScale})` }}
        />
      </div>

      <div className="relative z-10 p-6 sm:p-8">
        {voice.available ? (
          <div className="mb-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                voice.speaking
                  ? voice.stop()
                  : voice.speak([
                      step === 1 ? page.title : surfaceCopy.card.step2Heading,
                      activeSubtitle,
                      copy.fallbackQuestion,
                      copy.fallbackLinkText,
                    ])
              }
              className="inline-flex min-h-11 max-w-full items-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-card px-3 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <VolumeIcon className="h-4 w-4 shrink-0 text-sapphire" aria-hidden="true" />
              <span className="min-w-0 truncate">{voice.speaking ? listenText.stop : listenText.listen}</span>
            </button>
          </div>
        ) : null}
        <p aria-live="polite" className="sr-only">
          {stepText}
        </p>

        <h1 className="text-balance text-xl font-semibold leading-tight tracking-[-0.02em] text-foreground sm:text-2xl dark:text-paper">
          {step === 1 ? page.title : surfaceCopy.card.step2Heading}
        </h1>

        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={activeSubtitleKey}
            initial={calmMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={calmMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: calmMotion ? 0 : 0.16, ease: CALM_EASE }}
            className="mt-2 text-base leading-relaxed text-muted-foreground dark:text-mist"
          >
            {activeSubtitle}
          </motion.p>
        </AnimatePresence>

        {error && (
          <p
            id="auth-phone-error"
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl border border-primary/35 bg-primary-soft p-3 text-body text-foreground dark:bg-primary/15 dark:text-paper"
          >
            <AlertCircleIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span>{error}</span>
          </p>
        )}

        {sent && step === 2 && !error && (
          <p role="status" className="mt-4 flex items-start gap-2 text-body text-muted-foreground dark:text-mist">
            <CheckCircleIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-sapphire dark:text-sapphire-border" />
            <span>{copy.smsSent}</span>
          </p>
        )}

        {demoCode && step === 2 && (
          <p className="mt-2 rounded-xl bg-muted px-3 py-2 text-body text-muted-foreground dark:bg-white/[0.06] dark:text-mist">
            {copy.demoNotice} <strong className="tabular-nums text-foreground dark:text-paper">{demoCode}</strong>
          </p>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {step === 1 ? (
            <motion.form
              key="step-phone"
              initial={calmMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={calmMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: calmMotion ? 0 : 0.18, ease: CALM_EASE }}
              onSubmit={handleSendCode}
              className="mt-5 space-y-4"
              noValidate
            >
              <div>
                <label htmlFor="authPhone" className={`mb-1.5 block ${FIELD_LABEL}`}>
                  {page.phoneLabel}
                </label>
                <div className="relative">
                  <PhoneIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground dark:text-mist"
                  />
                  <input
                    id="authPhone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onFocus={() => setPhoneFocused(true)}
                    onBlur={() => setPhoneFocused(false)}
                    placeholder={page.phonePlaceholder}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "auth-phone-error" : undefined}
                    className={`pl-11 pr-11 ${FIELD}`}
                  />
                  {phoneReady && (
                    <CheckCircleIcon
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-sapphire dark:text-sapphire-border"
                    />
                  )}
                </div>
              </div>
              <button type="submit" disabled={isLoading} className={SUBMIT_BUTTON}>
                <span className="min-w-0 truncate">{isLoading ? copy.sending : page.sendCode}</span>
                {!isLoading && <ArrowRightIcon aria-hidden="true" className="h-5 w-5 shrink-0" />}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="step-otp"
              initial={calmMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={calmMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: calmMotion ? 0 : 0.18, ease: CALM_EASE }}
              className="mt-5 space-y-5"
            >
              <div>
                <label htmlFor="authOtpCode" className={`mb-2 block ${FIELD_LABEL}`}>
                  {page.codeLabel}
                </label>
                <div className="relative">
                  <input
                    id="authOtpCode"
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => handleOtpChange(e.target.value)}
                    onFocus={() => setOtpFocused(true)}
                    onBlur={() => setOtpFocused(false)}
                    aria-invalid={Boolean(error)}
                    aria-describedby="auth-otp-switch-hint"
                    className="peer absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
                  />
                  <div aria-hidden="true" className="grid grid-cols-4 gap-3">
                    {[0, 1, 2, 3].map((slot) => {
                      const digit = otpCode[slot] ?? "";
                      const isActiveSlot = otpFocused && slot === Math.min(otpCode.length, 3);
                      return (
                        <div
                          key={slot}
                          className={`flex h-16 items-center justify-center rounded-xl border-2 text-2xl font-bold tabular-nums transition-colors duration-(--dur-fast) ease-(--ease-out-calm) ${
                            isActiveSlot
                              ? "border-sapphire bg-sapphire-soft text-foreground ring-2 ring-sapphire/25 dark:border-sapphire-border dark:bg-sapphire/25 dark:text-paper"
                              : digit
                                ? "border-sapphire/50 bg-white text-foreground dark:border-sapphire-border/60 dark:bg-ink-950 dark:text-paper"
                                : "border-border-control bg-muted/60 text-muted-foreground dark:border-white/15 dark:bg-ink-950/60 dark:text-mist/60"
                          }`}
                        >
                          {digit || (isActiveSlot ? <span className="h-6 w-0.5 bg-sapphire dark:bg-sapphire-border" /> : "–")}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p id="auth-otp-switch-hint" className="mt-2.5 text-sm leading-relaxed text-muted-foreground dark:text-mist">
                  {copy.smsSwitchHint}
                </p>
              </div>

              <button
                type="button"
                disabled={isLoading || otpCode.length < 4}
                onClick={() => verifyOtp(otpCode)}
                className={SUBMIT_BUTTON}
              >
                <span className="min-w-0 truncate">{isLoading ? copy.verifying : page.verifyCode}</span>
                {!isLoading && <ArrowRightIcon aria-hidden="true" className="h-5 w-5 shrink-0" />}
              </button>

              <div className="-mx-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtpCode("");
                    setError("");
                  }}
                  className={`press-row min-h-11 max-w-full whitespace-nowrap rounded-xl px-2 text-muted-foreground underline underline-offset-4 hover:text-foreground dark:text-mist dark:hover:text-paper ${FOCUS_RING}`}
                >
                  <span className="min-w-0 truncate">{copy.changeNumber}</span>
                </button>
                <button
                  type="button"
                  onClick={() => void handleSendCode()}
                  disabled={isLoading}
                  className={`press-row min-h-11 max-w-full whitespace-nowrap rounded-xl px-2 font-semibold text-sapphire underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-foreground/45 disabled:no-underline dark:text-sapphire-border dark:disabled:text-white/45 ${FOCUS_RING}`}
                >
                  <span className="min-w-0 truncate">{copy.resendSms}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 border-t border-border/80 pt-4 dark:border-white/10">
          <Link
            href={withLangPrefix("/mediatori#solicita", lang)}
            className={`press-row -mx-2 flex min-h-11 max-w-full items-center justify-between gap-3 whitespace-nowrap rounded-xl px-2 text-sm font-medium text-muted-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-muted/60 hover:text-foreground dark:text-mist dark:hover:bg-white/[0.06] dark:hover:text-paper sm:text-[0.9375rem] ${FOCUS_RING}`}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <UsersIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-amber-care" />
              <span className="min-w-0 truncate">{copy.fallbackLinkText}</span>
            </span>
            <ChevronRightIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
