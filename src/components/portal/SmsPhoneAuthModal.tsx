"use client";

import { useState, useRef, useEffect, type PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import {
  ArrowRightIcon,
  ChevronRightIcon,
  DownloadIcon,
  LockIcon,
  PhoneIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { useReadAloud } from "@/components/health-check/readingTools";
import { Button } from "@/components/ui/Button";
import { ListenButton } from "@/components/ui/ListenButton";
import { contulMeuCopy } from "@/components/portal/contul-meu-copy";
import { useLanguage } from "@/lib/i18n/language-context";
import { getPwaCopy } from "@/lib/i18n/pwa-copy";
import { withLangPrefix } from "@/lib/i18n/routing";
import { translations, type Lang } from "@/lib/i18n/translations";
import { useCalmReducedMotion } from "@/lib/motion/tokens";
import { openPwaInstall, usePwaSnapshot } from "@/lib/pwa/pwa-state";

export function normalizePortalPhone(raw: string): string {
  return raw.trim().replace(/[\s().-]+/g, "");
}

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
    incompleteCodeError: string;
    tooManyAttempts: string;
    noPatientRecord: string;
    sharedPhoneError: string;
    smsUnavailable: string;
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
    incompleteCodeError: "Введите 4 цифры из SMS.",
    tooManyAttempts: "Слишком много попыток. Подождите минуту и повторите попытку.",
    noPatientRecord:
      "Медицинская карта для этого номера телефона не найдена. Укажите номер с консультации или обратитесь к медиатору здоровья ниже.",
    sharedPhoneError:
      "Этот номер телефона привязан к нескольким пациентам. Откройте вашу личную ссылку или обратитесь к медиатору здоровья.",
    smsUnavailable:
      "Вход по SMS пока не активен. Используйте личную ссылку от вашей медицинской команды или обратитесь к медиатору здоровья.",
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
    incompleteCodeError: "Scrie cele 4 cifre din SMS.",
    tooManyAttempts: "Ai încercat de prea multe ori. Așteaptă un minut și încearcă din nou.",
    noPatientRecord:
      "Nu am găsit un dosar medical pentru acest număr de telefon. Folosește numărul de la consultație sau cere ajutor unui mediator sanitar mai jos.",
    sharedPhoneError:
      "Acest număr apare la mai mulți pacienți. Deschide linkul personal primit de la echipa medicală sau cere ajutor unui mediator sanitar.",
    smsUnavailable:
      "Autentificarea prin SMS nu este activă încă. Folosește linkul personal primit de la echipa medicală sau cere ajutor unui mediator sanitar.",
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
    incompleteCodeError: "Enter the 4 numbers from the SMS.",
    tooManyAttempts: "Too many tries. Wait a minute and try again.",
    noPatientRecord:
      "No medical record was found for this phone number. Use the number from your consultation or ask a health mediator below.",
    sharedPhoneError:
      "This phone number is linked to more than one patient. Open your personal portal link or ask a health mediator for help.",
    smsUnavailable:
      "SMS sign-in is not active yet. Use the personal link from your care team or ask a health mediator for help.",
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
    incompleteCodeError: "Shkruaj 4 shifrat nga SMS-ja.",
    tooManyAttempts: "Provove shumë herë. Prit një minutë dhe provo përsëri.",
    noPatientRecord:
      "Nuk u gjet asnjë dosje mjekësore për këtë numër telefoni. Përdor numrin nga takimi mjekësor ose kërko ndihmë nga një mediator shëndetësor më poshtë.",
    sharedPhoneError:
      "Ky numër telefoni është i lidhur me më shumë se një pacient. Hap lidhjen tënde personale ose kërko ndihmë nga një mediator shëndetësor.",
    smsUnavailable:
      "Hyrja me SMS nuk është aktive ende. Përdor lidhjen personale nga ekipi mjekësor ose kërko ndihmë nga një mediator shëndetësor.",
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
    incompleteCodeError: "Scrivi le 4 cifre dell'SMS.",
    tooManyAttempts: "Troppi tentativi. Aspetta un minuto e riprova.",
    noPatientRecord:
      "Nessun fascicolo sanitario trovato per questo numero di telefono. Usa il numero lasciato alla visita o chiedi aiuto a un mediatore sanitario qui sotto.",
    sharedPhoneError:
      "Questo numero di telefono è associato a più pazienti. Apri il tuo link personale o chiedi aiuto a un mediatore sanitario.",
    smsUnavailable:
      "L'accesso via SMS non è ancora attivo. Usa il link personale ricevuto dal team sanitario o chiedi aiuto a un mediatore sanitario.",
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
    incompleteCodeError: "Upiši 4 broja iz SMS-a.",
    tooManyAttempts: "Previše pokušaja. Pričekaj minutu pa pokušaj ponovno.",
    noPatientRecord:
      "Nije pronađen zdravstveni karton za ovaj broj telefona. Upotrijebi broj s pregleda ili zatraži pomoć zdravstvenog medijatora niže.",
    sharedPhoneError:
      "Ovaj broj telefona povezan je s više pacijenata. Otvori svoju osobnu poveznicu ili zatraži pomoć zdravstvenog medijatora.",
    smsUnavailable:
      "Prijava putem SMS poruke još nije aktivna. Upotrijebi osobnu poveznicu od medicinskog tima ili zatraži pomoć zdravstvenog medijatora.",
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
    incompleteCodeError: "Lekhav e 4 gina katar o SMS.",
    tooManyAttempts: "But zumavimata. Azhuker ekh minuta thaj zumav palem.",
    noPatientRecord:
      "Na arakhlam sastipnasko dosyaro vash kadava telefonesko gin. Labar o gin katar e konsultacia vay mang zhutipen katar o mediatori tele.",
    sharedPhoneError:
      "Kadava telefonesko gin si phandlo may but pacientenca. Putar cho personalo linko vay mang zhutipen katar o mediatori.",
    smsUnavailable:
      "O khuvipe katar SMS nane inke aktivo. Labar o personalo linko katar o timo vay mang zhutipen katar o mediatori.",
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
  "field-focus min-h-14 w-full rounded-xl border border-border-control bg-white text-title font-semibold tabular-nums text-foreground placeholder:font-normal placeholder:text-muted-foreground dark:border-white/15 dark:bg-ink-950 dark:text-paper dark:placeholder:text-mist/60";

const FIELD_LABEL = "text-body font-semibold text-foreground dark:text-paper";
const CALM_EASE: [number, number, number, number] = [0.25, 1, 0.5, 1];

/**
 * Patient medical record SMS sign-in card.
 * Uses a calm Apple-Health surface: spatial micro-float (disabled while typing or under
 * reduced motion), anticipation progress hairline, single-heading flow, and mediator fallback link.
 */
export function SmsPhoneAuthModal({
  initialLang = "ro",
  embedded = false,
}: {
  initialLang?: Lang;
  embedded?: boolean;
}) {
  const router = useRouter();
  const { lang: activeLang, t } = useSafeLanguage(initialLang);
  const lang = activeLang ?? initialLang;
  const copy = authModalCopy[lang] ?? authModalCopy.ro;
  const voice = useReadAloud(lang);
  const pwa = usePwaSnapshot();
  const showInstall = !pwa.isStandalone;
  const installLabel = getPwaCopy(lang).installButton;
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
  const verifyingRef = useRef(false);
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
    if (calmMotion || isEditing || embedded) {
      stopFloatLoop();
      pointerTarget.current = { x: 0, y: 0, sx: 50, sy: 28, active: false };
      pointerCurrent.current = { x: 0, y: 0, sx: 50, sy: 28 };
      if (cardRef.current) cardRef.current.style.transform = "translate3d(0px, 0px, 0)";
      if (sheenRef.current) sheenRef.current.style.opacity = "0";
    }
    return stopFloatLoop;
  }, [calmMotion, embedded, isEditing]);

  const startFloatLoop = () => {
    if (pointerRaf.current !== null || calmMotion || isEditing || embedded) return;
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
    if (calmMotion || isEditing || embedded) return;
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
    if (verifyingRef.current) return;
    if (!/^\d{4}$/.test(code.trim())) {
      setError(copy.incompleteCodeError);
      otpInputRef.current?.focus();
      return;
    }
    verifyingRef.current = true;
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/patient-portal/verify-phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone(), otp: code }),
      });
      if (!response.ok) {
        const failure = (await response.json().catch(() => null)) as { code?: unknown } | null;
        if (response.status === 429) {
          setError(copy.tooManyAttempts);
        } else if (response.status === 404 || failure?.code === "no_patient_record") {
          setDemoCode(null);
          setError(copy.noPatientRecord);
        } else if (response.status === 409 || failure?.code === "shared_phone") {
          setDemoCode(null);
          setError(copy.sharedPhoneError);
        } else if (response.status === 503 && failure?.code === "sms_unavailable") {
          setDemoCode(null);
          setError(copy.smsUnavailable);
        } else if (response.status === 400) {
          setError(page.invalidCode);
          // The real input is invisible and already full: empty it so the next digits go in.
          setOtpCode("");
          otpInputRef.current?.focus();
        } else {
          setError(copy.genericError);
        }
        setIsLoading(false);
        return;
      }
      const data = (await response.json()) as { redirectUrl?: string };
      if (data.redirectUrl) router.push(withLangPrefix(data.redirectUrl, lang));
      else setIsLoading(false);
    } catch {
      setError(copy.genericError);
      setIsLoading(false);
    } finally {
      verifyingRef.current = false;
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
        const failure = (await response.json().catch(() => null)) as { code?: unknown } | null;
        setError(
          response.status === 429
            ? copy.tooManyAttempts
            : response.status === 400
              ? copy.invalidPhoneError
              : response.status === 503 && failure?.code === "sms_unavailable"
                ? copy.smsUnavailable
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
      className={
        embedded
          ? "relative flex h-full flex-col justify-between overflow-hidden bg-card text-foreground dark:bg-ink-900 dark:text-paper"
          : "relative overflow-hidden rounded-2xl border border-border/90 bg-card text-foreground shadow-(--shadow-card-hover) dark:border-white/12 dark:bg-ink-900 dark:text-paper"
      }
    >
      {/* Subtle sapphire cursor sheen on standalone card hover (still when embedded, typing, or reduced motion). */}
      {!embedded ? (
        <div
          ref={sheenRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-(--dur-base) ease-(--ease-out-calm)"
          style={{
            background:
              "radial-gradient(380px circle at var(--sheen-x, 50%) var(--sheen-y, 28%), rgba(29, 53, 87, 0.06), transparent 70%)",
          }}
        />
      ) : null}

      {/* Hairline progress bar driven by live form readiness */}
      <div className="relative z-10 h-[2px] w-full bg-foreground/8 dark:bg-white/10" aria-hidden="true">
        <div
          className="h-full origin-left bg-sapphire transition-transform duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none dark:bg-sapphire-border"
          style={{ transform: `scaleX(${hairlineScale})` }}
        />
      </div>

      <div
        className={
          embedded
            ? "relative z-10 flex flex-1 flex-col justify-between p-6 sm:p-8 lg:p-10"
            : "relative z-10 p-6 sm:p-8"
        }
      >
        <div>
          {/* Install sits beside Listen: people who open their record are the ones who come back, so this is where it earns its place. */}
          {embedded || showInstall || voice.available ? (
            <div
              className={`mb-5 flex flex-wrap items-center gap-2 ${
                embedded ? "justify-between" : "justify-end"
              }`}
            >
              {embedded ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/60 px-2.5 py-1 text-sm font-medium text-muted-foreground dark:border-white/10 dark:bg-white/[0.06] dark:text-mist">
                  <LockIcon
                    aria-hidden="true"
                    className="h-3.5 w-3.5 shrink-0 text-sapphire dark:text-sapphire-border"
                  />
                  <span>{surfaceCopy.card.badge}</span>
                </span>
              ) : null}
              {showInstall || voice.available ? (
                <div className="flex flex-wrap items-center gap-2">
                  {showInstall ? (
                    <button
                      type="button"
                      onClick={() => void openPwaInstall()}
                      className="press-row inline-flex min-h-11 max-w-full items-center gap-1.5 whitespace-nowrap rounded-lg border border-border-control bg-card px-3 text-body font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <DownloadIcon className="h-4 w-4 shrink-0 text-sapphire" aria-hidden="true" />
                      <span>{installLabel}</span>
                    </button>
                  ) : null}
                  {voice.available ? (
                    <ListenButton
                      uiLang={lang}
                      isPlaying={voice.speaking}
                      onToggle={() =>
                        voice.speaking
                          ? voice.stop()
                          : voice.speak([
                              step === 1 ? page.title : surfaceCopy.card.step2Heading,
                              activeSubtitle,
                              copy.fallbackQuestion,
                              copy.fallbackLinkText,
                            ])
                      }
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        <p aria-live="polite" className="sr-only">
          {stepText}
        </p>

        <h1 className="text-balance text-page font-semibold leading-tight text-foreground dark:text-paper">
          {step === 1 ? page.title : surfaceCopy.card.step2Heading}
        </h1>

        <AnimatePresence mode="wait" initial={false}>
          <m.p
            key={activeSubtitleKey}
            initial={calmMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={calmMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: calmMotion ? 0 : 0.16, ease: CALM_EASE }}
            className="mt-2 text-body text-muted-foreground dark:text-mist"
          >
            {activeSubtitle}
          </m.p>
        </AnimatePresence>

        {error && (
          <p
            id="auth-phone-error"
            role="alert"
            key={error}
            className="swap-in mt-4 rounded-xl border border-primary/40 bg-primary-soft p-3 text-body font-semibold text-foreground dark:bg-primary/15 dark:text-paper"
          >
            {error}
          </p>
        )}

        {sent && step === 2 && !error && (
          <p role="status" className="swap-in mt-4 text-body text-muted-foreground dark:text-mist">
            {copy.smsSent}
          </p>
        )}

        {demoCode && step === 2 && (
          <p className="mt-2 rounded-xl bg-muted px-3 py-2 text-body text-muted-foreground dark:bg-white/[0.06] dark:text-mist">
            {copy.demoNotice} <strong className="tabular-nums text-foreground dark:text-paper">{demoCode}</strong>
          </p>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {step === 1 ? (
            <m.form
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
                    className={`pl-11 pr-4 ${FIELD}`}
                  />
                </div>
              </div>
              <Button type="submit" variant="action" size="lg" fullWidth disabled={isLoading} className="min-h-14 sm:px-5">
                <span>{isLoading ? copy.sending : page.sendCode}</span>
                {!isLoading && <ArrowRightIcon aria-hidden="true" className="arrow-travel h-5 w-5 shrink-0" />}
              </Button>
            </m.form>
          ) : (
            <m.div
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
                    aria-describedby={error ? "auth-phone-error auth-otp-switch-hint" : "auth-otp-switch-hint"}
                    className="peer absolute inset-0 z-10 h-full w-full cursor-text text-body opacity-0"
                  />
                  <div aria-hidden="true" className="grid grid-cols-4 gap-3">
                    {[0, 1, 2, 3].map((slot) => {
                      const digit = otpCode[slot] ?? "";
                      const isActiveSlot = otpFocused && slot === Math.min(otpCode.length, 3);
                      return (
                        <div
                          key={slot}
                          className={`flex h-16 items-center justify-center rounded-xl border-2 text-section font-bold tabular-nums transition-[border-color,box-shadow,background-color] duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none ${
                            isActiveSlot
                              ? "border-sapphire bg-sapphire-soft text-foreground shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-sapphire)_16%,transparent)] dark:border-sapphire-border dark:bg-sapphire/25 dark:text-paper"
                              : digit
                                ? "border-sapphire/50 bg-white text-foreground dark:border-sapphire-border/60 dark:bg-ink-950 dark:text-paper"
                                : "border-border-control bg-muted/60 text-muted-foreground dark:border-white/15 dark:bg-ink-950/60 dark:text-mist/60"
                          }`}
                        >
                          {/* A typed digit settles into its box; the empty active box shows the caret. */}
                          {digit ? (
                            <span key={`${slot}-${digit}`} className="swap-in">{digit}</span>
                          ) : isActiveSlot ? (
                            <span className="h-6 w-0.5 bg-sapphire dark:bg-sapphire-border" />
                          ) : (
                            "–"
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p id="auth-otp-switch-hint" className="mt-2.5 text-body text-muted-foreground dark:text-mist">
                  {copy.smsSwitchHint}
                </p>
              </div>

              <Button
                type="button"
                variant="action"
                size="lg"
                fullWidth
                disabled={isLoading}
                onClick={() => verifyOtp(otpCode)}
                className="min-h-14 sm:px-5"
              >
                <span>{isLoading ? copy.verifying : page.verifyCode}</span>
                {!isLoading && <ArrowRightIcon aria-hidden="true" className="arrow-travel h-5 w-5 shrink-0" />}
              </Button>

              <div className="btn-row -mx-2 flex flex-wrap items-center justify-between gap-3 text-body">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtpCode("");
                    setError("");
                    setDemoCode(null);
                    setSent(false);
                  }}
                  className={`press-row min-h-11 max-w-full whitespace-nowrap rounded-xl px-2 text-muted-foreground underline decoration-border underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:text-foreground hover:decoration-current dark:text-mist dark:decoration-white/25 dark:hover:text-paper ${FOCUS_RING}`}
                >
                  <span>{copy.changeNumber}</span>
                </button>
                <button
                  type="button"
                  onClick={() => void handleSendCode()}
                  disabled={isLoading}
                  className={`group press-row min-h-11 max-w-full whitespace-nowrap rounded-xl px-2 font-semibold text-sapphire disabled:cursor-not-allowed disabled:text-foreground/45 dark:text-sapphire-border dark:disabled:text-white/45 ${FOCUS_RING}`}
                >
                  <span>{copy.resendSms}</span>
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>
        </div>

        <div className="mt-6 border-t border-border/80 pt-4 dark:border-white/10">
          <Link
            href={withLangPrefix("/mediatori#solicita", lang)}
            className={`group press-row -mx-1 flex min-h-11 max-w-full items-center justify-between gap-3 whitespace-nowrap rounded-md px-1 text-body font-medium text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted/60 hover:text-foreground dark:text-mist dark:hover:bg-white/[0.06] dark:hover:text-paper ${FOCUS_RING}`}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <UsersIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-amber-care" />
              <span className="min-w-0 truncate">{copy.fallbackLinkText}</span>
            </span>
            <ChevronRightIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
          </Link>
          {embedded ? (
            <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground/90 dark:text-mist/80">
              <ShieldIcon
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border"
              />
              <span>{surfaceCopy.privacyNote}</span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
