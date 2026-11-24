"use client";

import Link from "next/link";
import { useContext, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import {
  ArrowRightIcon,
  ChevronDownIcon,
} from "@/components/ui/icons";
import { captchaErrorMessage, useRecaptcha } from "@/components/security/RecaptchaProvider";
import { COUNTRY_LABELS, SUPPORTED_COUNTRIES, type CountryCode } from "@/lib/countries";
import {
  COUNTRY_FIELD_LABELS,
  PHONE_PLACEHOLDERS,
  defaultCountryForLang,
  getAreaFieldCopy,
  getAreasForCountry,
  isValidAreaForCountry,
} from "@/lib/country-areas";
import { LanguageContext } from "@/lib/i18n/language-context";
import { getOfflineUiCopy } from "@/lib/i18n/offline-copy";
import { DEFAULT_LANG, REQUEST_LANG_HEADER, withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import type { CaptchaAction } from "@/lib/security/recaptcha";
import { isBrowserOffline } from "@/lib/pwa/use-online-status";

export type CallbackStarterCopy = {
  title: string;
  lead: string;
  /** What a mediator does not do, said before the form is sent. Only limits the page already states elsewhere. */
  limitsTitle: string;
  limitAdvice: string;
  limitAvailability: string;
  /** Optional one-tap answer, so the mediator knows what the call is about. */
  reasonLabel: string;
  reasonOptions: [string, string, string];
  reassurance: string;
  fullFormPrompt: string;
  fullFormLink: string;
  countyLabel: string;
  countyPlaceholder: string;
  countyError: string;
  phoneLabel: string;
  phonePlaceholder: string;
  phoneHint: string;
  phoneError: string;
  nameLabel: string;
  optionalTag: string;
  namePlaceholder: string;
  privacyConsent: string;
  privacyPolicyLabel: string;
  privacyConsentError: string;
  submit: string;
  submitting: string;
  genericError: string;
  rateLimitError: string;
  successTitle: string;
  successBody: (county: string, phone: string) => string;
  successNotice: string;
  sendAnother: string;
};

export const callbackStarterCopy: Record<Lang, CallbackStarterCopy> = {
  ro: {
    title: "Cere să fii sunat de un mediator",
    lead: "Alege țara, zona și lasă numărul tău de telefon. Un mediator sanitar te sună înapoi, de obicei în 24 de ore, fără plată și fără programare.",
    limitsTitle: "Ce nu poate face un mediator",
    limitAdvice: "Mediatorul nu dă sfaturi despre tratament sau rețete.",
    limitAvailability: "Mediatorul vorbește limba ta și te însoțește la programări doar acolo unde este posibil.",
    reasonLabel: "Cu ce ai nevoie de ajutor?",
    reasonOptions: ["Medic de familie", "Acte și asigurare", "Altceva"],
    reassurance: "Datele tale rămân confidențiale și sunt folosite doar ca să te contactăm.",
    fullFormPrompt: "Vrei să descrii mai pe larg situația ta?",
    fullFormLink: "Adaugă mai multe detalii",
    countyLabel: "Județ",
    countyPlaceholder: "Alege județul",
    countyError: "Alege județul în care te afli.",
    phoneLabel: "Număr de telefon",
    phonePlaceholder: "0721 000 000",
    phoneHint: "Scrie numărul la care te putem suna.",
    phoneError: "Scrie un număr de telefon valid, cu cel puțin 8 cifre.",
    nameLabel: "Numele sau inițialele tale",
    optionalTag: "(opțional)",
    namePlaceholder: "De exemplu: Maria I.",
    privacyConsent: "Am citit și sunt de acord cu",
    privacyPolicyLabel: "politica de confidențialitate",
    privacyConsentError: "Bifează acordul cu politica de confidențialitate.",
    submit: "Cere să fii sunat",
    submitting: "Se trimite…",
    genericError: "Cererea nu s-a putut trimite. Încearcă din nou.",
    rateLimitError: "Ai trimis prea multe cereri de pe acest dispozitiv. Încearcă din nou mai târziu.",
    successTitle: "Cererea ta de apel a fost trimisă",
    successBody: (county, phone) =>
      `Un mediator sanitar din ${county} va suna la numărul ${phone} cât mai curând, de obicei în 24 de ore.`,
    successNotice: "Acest serviciu nu este pentru urgențe. Dacă este o urgență medicală, sună imediat la 112.",
    sendAnother: "Trimite alt număr",
  },
  en: {
    title: "Request a mediator callback",
    lead: "Choose your country and area and leave your phone number. A community health mediator calls you back free of charge, usually within 24 hours.",
    limitsTitle: "What a mediator cannot do",
    limitAdvice: "A mediator does not give advice about treatment or prescriptions.",
    limitAvailability: "A mediator speaks your language and comes with you to appointments only where this is available.",
    reasonLabel: "What do you need help with?",
    reasonOptions: ["Family doctor", "Papers and insurance", "Something else"],
    reassurance: "Your details stay confidential and are used only to call you back.",
    fullFormPrompt: "Need to explain more details about what you need?",
    fullFormLink: "Add more details",
    countyLabel: "County",
    countyPlaceholder: "Choose your county",
    countyError: "Choose your county.",
    phoneLabel: "Phone number",
    phonePlaceholder: "0721 000 000",
    phoneHint: "Enter a number where we can reach you.",
    phoneError: "Enter a valid phone number with at least 8 digits.",
    nameLabel: "Your name or initials",
    optionalTag: "(optional)",
    namePlaceholder: "For example: Maria I.",
    privacyConsent: "I have read and agree to the",
    privacyPolicyLabel: "privacy policy",
    privacyConsentError: "Tick the box to agree to the privacy policy.",
    submit: "Request a callback",
    submitting: "Sending…",
    genericError: "Your request could not be sent. Try again.",
    rateLimitError: "Too many requests were sent from this device. Please try again later.",
    successTitle: "Your callback request was sent",
    successBody: (county, phone) =>
      `A community health mediator for ${county} will call ${phone} as soon as possible, usually within 24 hours.`,
    successNotice: "This service is not for emergencies. If it is a medical emergency, call 112 right away.",
    sendAnother: "Send another number",
  },
  sq: {
    title: "Kërko të të telefonojë një mediator",
    lead: "Zgjidh shtetin, zonën dhe lë numrin tënd të telefonit. Një mediator shëndetësor të merr në telefon falas, zakonisht brenda 24 orëve.",
    limitsTitle: "Çfarë nuk mund të bëjë një mediator",
    limitAdvice: "Mediatori nuk jep këshilla për trajtimin ose recetat.",
    limitAvailability: "Mediatori flet gjuhën tënde dhe të shoqëron në takime vetëm aty ku është e mundur.",
    reasonLabel: "Për çfarë të duhet ndihmë?",
    reasonOptions: ["Mjeku i familjes", "Dokumente dhe sigurim", "Diçka tjetër"],
    reassurance: "Të dhënat e tua mbeten konfidenciale dhe përdoren vetëm për të të telefonuar.",
    fullFormPrompt: "Do të shkruash më shumë hollësi për atë që të duhet?",
    fullFormLink: "Shto më shumë detaje",
    countyLabel: "Qarku",
    countyPlaceholder: "Zgjidh qarkun",
    countyError: "Zgjidh qarkun ku ndodhesh.",
    phoneLabel: "Numri i telefonit",
    phonePlaceholder: "0721 000 000",
    phoneHint: "Shkruaj numrin ku mund të të gjejmë.",
    phoneError: "Shkruaj një numër telefoni të vlefshëm me të paktën 8 shifra.",
    nameLabel: "Emri ose inicialet e tua",
    optionalTag: "(sipas dëshirës)",
    namePlaceholder: "Për shembull: Maria I.",
    privacyConsent: "E kam lexuar dhe pranoj",
    privacyPolicyLabel: "politikën e privatësisë",
    privacyConsentError: "Shëno kutinë që pranon politikën e privatësisë.",
    submit: "Kërko një telefonatë",
    submitting: "Po dërgohet…",
    genericError: "Kërkesa nuk u dërgua dot. Provo përsëri.",
    rateLimitError: "Janë dërguar shumë kërkesa nga kjo pajisje. Provo përsëri më vonë.",
    successTitle: "Kërkesa jote për telefonatë u dërgua",
    successBody: (county, phone) =>
      `Një mediator shëndetësor për ${county} do të telefonojë në ${phone} sa më shpejt, zakonisht brenda 24 orëve.`,
    successNotice: "Ky shërbim nuk është për urgjenca. Nëse është urgjencë mjekësore, telefono menjëherë 112.",
    sendAnother: "Dërgo numër tjetër",
  },
  it: {
    title: "Chiedi di essere richiamato da un mediatore",
    lead: "Scegli il paese, la zona e lascia il tuo numero di telefono. Un mediatore sanitario ti richiama gratuitamente, di solito entro 24 ore.",
    limitsTitle: "Cosa non può fare un mediatore",
    limitAdvice: "Il mediatore non dà consigli su cure o ricette.",
    limitAvailability: "Il mediatore parla la tua lingua e ti accompagna alle visite solo dove è possibile.",
    reasonLabel: "Per cosa ti serve aiuto?",
    reasonOptions: ["Medico di famiglia", "Documenti e tessera", "Altro"],
    reassurance: "I tuoi dati restano riservati e servono solo per richiamarti.",
    fullFormPrompt: "Vuoi aggiungere più dettagli su ciò di cui hai bisogno?",
    fullFormLink: "Aggiungi più dettagli",
    countyLabel: "Provincia",
    countyPlaceholder: "Scegli la provincia",
    countyError: "Scegli la provincia in cui ti trovi.",
    phoneLabel: "Numero di telefono",
    phonePlaceholder: "0721 000 000",
    phoneHint: "Scrivi il numero a cui possiamo trovarti.",
    phoneError: "Inserisci un numero di telefono valido con almeno 8 cifre.",
    nameLabel: "Nome o iniziali",
    optionalTag: "(facoltativo)",
    namePlaceholder: "Ad esempio: Maria I.",
    privacyConsent: "Ho letto e accetto",
    privacyPolicyLabel: "l'informativa sulla privacy",
    privacyConsentError: "Spunta la casella per accettare l'informativa sulla privacy.",
    submit: "Chiedi di richiamarti",
    submitting: "Invio in corso…",
    genericError: "La richiesta non è partita. Riprova.",
    rateLimitError: "Sono state inviate troppe richieste da questo dispositivo. Riprova più tardi.",
    successTitle: "La tua richiesta di chiamata è stata inviata",
    successBody: (county, phone) =>
      `Un mediatore sanitario per ${county} chiamerà il numero ${phone} il prima possibile, di solito entro 24 ore.`,
    successNotice: "Questo servizio non è per le emergenze. Se è un'emergenza medica, chiama subito il 112.",
    sendAnother: "Invia un altro numero",
  },
  hr: {
    title: "Zatraži povratni poziv medijatora",
    lead: "Odaberi državu, područje i ostavi svoj broj telefona. Zdravstveni medijator nazvat će te besplatno, obično u roku od 24 sata.",
    limitsTitle: "Što medijator ne može",
    limitAdvice: "Medijator ne daje savjete o liječenju ni o receptima.",
    limitAvailability: "Medijator govori tvoj jezik i ide s tobom na pregled samo ondje gdje je to dostupno.",
    reasonLabel: "S čime trebaš pomoć?",
    reasonOptions: ["Obiteljski liječnik", "Dokumenti i osiguranje", "Nešto drugo"],
    reassurance: "Tvoji podaci ostaju povjerljivi i koriste se samo za povratni poziv.",
    fullFormPrompt: "Želiš napisati više pojedinosti o tome što ti treba?",
    fullFormLink: "Dodaj više pojedinosti",
    countyLabel: "Okrug",
    countyPlaceholder: "Odaberi okrug",
    countyError: "Odaberi okrug u kojem se nalaziš.",
    phoneLabel: "Broj telefona",
    phonePlaceholder: "0721 000 000",
    phoneHint: "Upiši broj na koji te možemo nazvati.",
    phoneError: "Upiši valjani broj telefona s najmanje 8 znamenki.",
    nameLabel: "Tvoje ime ili inicijali",
    optionalTag: "(nije obavezno)",
    namePlaceholder: "Na primjer: Marija I.",
    privacyConsent: "Pročitao sam i prihvaćam",
    privacyPolicyLabel: "pravila privatnosti",
    privacyConsentError: "Označi kućicu da prihvaćaš pravila privatnosti.",
    submit: "Zatraži povratni poziv",
    submitting: "Slanje…",
    genericError: "Zahtjev nije poslan. Pokušaj ponovno.",
    rateLimitError: "S ovog je uređaja poslano previše zahtjeva. Pokušaj ponovno kasnije.",
    successTitle: "Tvoj zahtjev za poziv je poslan",
    successBody: (county, phone) =>
      `Zdravstveni medijator za ${county} nazvat će broj ${phone} što prije, obično u roku od 24 sata.`,
    successNotice: "Ova usluga nije za hitne slučajeve. Ako je hitan medicinski slučaj, odmah nazovi 112.",
    sendAnother: "Pošalji drugi broj",
  },
  rom: {
    title: "Mang te akharel tut ekh mediatori",
    lead: "Alosar o them, i rig thaj mukh cho telefonesko gin. Ekh sastipnasko mediatori ka akharel tut bi lovesko, may butivar ande 24 ore.",
    limitsTitle: "So nashti kerel o mediatori",
    limitAdvice: "O mediatori na del sfato vash o sastyaripe vay vash e recepte.",
    limitAvailability: "O mediatori vakerel chi chhib thaj zhal tusa ko doktori numay kana shaj.",
    reasonLabel: "Sostar trubul tut azhutipe?",
    reasonOptions: ["Familiyako doktori", "Lila thaj siguranciya", "Aver buchi"],
    reassurance: "Che date achhen garavde thaj labaren pes numay te akharas tut palpale.",
    fullFormPrompt: "Kames te lekhaves may but vash so trubul tut?",
    fullFormLink: "Thov may but detali",
    countyLabel: "Rig",
    countyPlaceholder: "Alosar chi rig",
    countyError: "Alosar chi rig kay san.",
    phoneLabel: "Telefonesko gin",
    phonePlaceholder: "0721 000 000",
    phoneHint: "Lekhav o gin kay shaj akharas tut.",
    phoneError: "Lekhav ekh chacho telefonesko gin, barem 8 cifrenca.",
    nameLabel: "Cho anav vay anglune litere",
    optionalTag: "(te kames)",
    namePlaceholder: "Misal: Maria I.",
    privacyConsent: "Gindem thaj kamav e",
    privacyPolicyLabel: "garavipnaske pravila",
    privacyConsentError: "Chiv semno ando kvadrato te kames e garavipnaske pravila.",
    submit: "Mang te akharel tut",
    submitting: "Bichhalel pes…",
    genericError: "O mangipe na bichhaldilo. Zumav palem.",
    rateLimitError: "But mangimata sas bichalde katar kadava aparati. Zumav palem may palal.",
    successTitle: "Cho mangipe vash akharipe bichhaldilo",
    successBody: (county, phone) =>
      `Ekh sastipnasko mediatori katar ${county} ka akharel o gin ${phone} sigo, may butivar ande 24 ore.`,
    successNotice: "Kadava servisi nane vash i sigardiari. Te si sastipnaski sigardiari, akhar sigo ko 112.",
    sendAnother: "Bichhal aver gin",
  },
  ru: {
    title: "Закажите обратный звонок медиатора",
    lead: "Выберите страну, регион и оставьте ваш номер телефона. Медицинский медиатор перезвонит вам бесплатно, обычно в течение 24 часов.",
    limitsTitle: "Чего медиатор не может",
    limitAdvice: "Медиатор не даёт советов о лечении и рецептах.",
    limitAvailability: "Медиатор говорит на вашем языке и сопровождает вас на приём только там, где это возможно.",
    reasonLabel: "С чем вам нужна помощь?",
    reasonOptions: ["Семейный врач", "Документы и страховка", "Другое"],
    reassurance: "Ваши данные остаются конфиденциальными и нужны только для обратного звонка.",
    fullFormPrompt: "Хотите подробнее описать свою ситуацию?",
    fullFormLink: "Добавить подробности",
    countyLabel: "Округ",
    countyPlaceholder: "Выберите округ",
    countyError: "Выберите ваш округ.",
    phoneLabel: "Номер телефона",
    phonePlaceholder: "0721 000 000",
    phoneHint: "Укажите номер, на который мы можем позвонить.",
    phoneError: "Введите корректный номер телефона (минимум 8 цифр).",
    nameLabel: "Ваше имя или инициалы",
    optionalTag: "(необязательно)",
    namePlaceholder: "Например: Мария И.",
    privacyConsent: "Я прочитал и согласен с",
    privacyPolicyLabel: "политикой конфиденциальности",
    privacyConsentError: "Отметьте согласие с политикой конфиденциальности.",
    submit: "Заказать обратный звонок",
    submitting: "Отправка…",
    genericError: "Не удалось отправить запрос. Попробуйте ещё раз.",
    rateLimitError: "С этого устройства отправлено слишком много запросов. Попробуйте позже.",
    successTitle: "Запрос на обратный звонок отправлен",
    successBody: (county, phone) =>
      `Медицинский медиатор для ${county} позвонит на номер ${phone} как можно скорее, обычно в течение 24 часов.`,
    successNotice: "Эта служба не для экстренных случаев. При неотложной ситуации немедленно звоните 112.",
    sendAnother: "Отправить другой номер",
  },
};

/** The chosen reason as staff read it in the request (requests are read in Romanian). */
const REASON_NOTES = ["medic de familie", "acte și asigurare", "altceva"] as const;

export type CallbackStarterErrors = {
  county?: string;
  phone?: string;
  privacyConsent?: string;
};

export type CallbackPayload = {
  name: string;
  phone: string;
  description: string;
  country: CountryCode;
  county: string;
  privacyConsent: true;
  captchaToken: string;
};

const inputClass =
  "field-focus mt-1.5 block w-full min-h-12 rounded-xl border border-border-control bg-background px-3.5 py-2.5 text-body text-foreground " +
  "transition-[border-color,background-color] duration-(--dur-fast) ease-(--ease-out-calm) hover:border-foreground/35 " +
  "placeholder:text-muted-foreground aria-[invalid=true]:border-primary motion-reduce:transition-none";

const selectClass =
  "field-focus min-h-12 w-full cursor-pointer appearance-none rounded-xl border border-border-control bg-background py-2.5 pl-3.5 pr-10 text-body text-foreground " +
  "transition-[border-color,background-color] duration-(--dur-fast) ease-(--ease-out-calm) hover:border-foreground/35 " +
  "aria-[invalid=true]:border-primary motion-reduce:transition-none";

const fieldErrorClass = "swap-in mt-1.5 text-body font-medium text-primary";

export function normalizeCallbackPhone(raw: string): string {
  return raw.trim().replace(/[\s().-]+/g, "");
}

export function isValidCallbackPhone(raw: string): boolean {
  const normalized = normalizeCallbackPhone(raw);
  if (!normalized || normalized.length > 50) return false;
  const digits = normalized.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 && /^\+?\d+$/.test(normalized);
}

export function validateCallbackStarter(
  values: {
    county: string;
    phone: string;
    privacyConsent: boolean;
    country: CountryCode;
  },
  copy: CallbackStarterCopy,
  lang?: Lang,
): CallbackStarterErrors {
  const errors: CallbackStarterErrors = {};
  if (!isValidAreaForCountry(values.country, values.county.trim())) {
    errors.county = lang ? getAreaFieldCopy(values.country, lang).error : copy.countyError;
  }
  if (!isValidCallbackPhone(values.phone)) {
    errors.phone = copy.phoneError;
  }
  if (!values.privacyConsent) {
    errors.privacyConsent = copy.privacyConsentError;
  }
  return errors;
}

export function buildCallbackPayload({
  name,
  phone,
  county,
  country,
  lang,
  captchaToken,
  reason = null,
}: {
  name: string;
  phone: string;
  county: string;
  country: CountryCode;
  lang: Lang;
  captchaToken: string;
  /** Index of the chosen `reasonOptions` entry, when the person picked one. */
  reason?: number | null;
}): CallbackPayload {
  const trimmedCounty = county.trim();
  const normalizedPhone = normalizeCallbackPhone(phone);
  const areaLabel = trimmedCounty ? `${trimmedCounty}, ${country}` : country;
  const reasonNote = reason != null && REASON_NOTES[reason] ? `, nevoie: ${REASON_NOTES[reason]}` : "";
  return {
    name: name.trim(),
    phone: normalizedPhone,
    description: `Solicitare apel mediator sanitar din /mediatori#solicita (Zona: ${areaLabel}, limba: ${lang}${reasonNote})`,
    country,
    county: trimmedCounty,
    privacyConsent: true,
    captchaToken,
  };
}

export async function submitCallbackStarter({
  name,
  phone,
  county,
  country,
  lang,
  reason = null,
  executeCaptcha,
  fetchImpl = fetch,
}: {
  name: string;
  phone: string;
  county: string;
  country: CountryCode;
  lang: Lang;
  reason?: number | null;
  executeCaptcha: (action: CaptchaAction) => Promise<string>;
  fetchImpl?: typeof fetch;
}): Promise<{ ok: true } | { ok: false; kind: "rate_limit" | "error"; error?: unknown }> {
  try {
    const captchaToken = await executeCaptcha("help_request");
    const payload = buildCallbackPayload({
      name,
      phone,
      county,
      country,
      lang,
      captchaToken,
      reason,
    });
    const response = await fetchImpl("/api/medical-help-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [REQUEST_LANG_HEADER]: lang,
      },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      return { ok: true };
    }
    if (response.status === 429) {
      return { ok: false, kind: "rate_limit" };
    }
    return { ok: false, kind: "error" };
  } catch (error) {
    return { ok: false, kind: "error", error };
  }
}

export function MediatorCallbackStarter({
  lang: langProp,
  country: countryProp,
  countries,
}: {
  lang?: Lang;
  country?: CountryCode;
  countries?: readonly CountryCode[];
}) {
  const languageContext = useContext(LanguageContext);
  const lang: Lang = langProp ?? languageContext?.lang ?? DEFAULT_LANG;
  const copy = callbackStarterCopy[lang] ?? callbackStarterCopy.ro;
  const availableCountries = countries && countries.length > 0 ? countries : SUPPORTED_COUNTRIES;
  const initialCountry: CountryCode =
    countryProp && availableCountries.includes(countryProp)
      ? countryProp
      : availableCountries.includes(defaultCountryForLang(lang))
        ? defaultCountryForLang(lang)
        : availableCountries[0];

  const executeCaptcha = useRecaptcha();
  const baseId = useId();

  const countryId = `${baseId}-country`;
  const countyId = `${baseId}-county`;
  const countyErrorId = `${baseId}-county-error`;
  const phoneId = `${baseId}-phone`;
  const phoneHintId = `${baseId}-phone-hint`;
  const phoneErrorId = `${baseId}-phone-error`;
  const nameId = `${baseId}-name`;
  const consentId = `${baseId}-consent`;
  const consentErrorId = `${baseId}-consent-error`;
  const reasonLabelId = `${baseId}-reason`;

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(initialCountry);
  const [county, setCounty] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [reason, setReason] = useState<number | null>(null);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [errors, setErrors] = useState<CallbackStarterErrors>({});
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedDetails, setSubmittedDetails] = useState<{ county: string; phone: string }>({
    county: "",
    phone: "",
  });

  const areaCopy = getAreaFieldCopy(selectedCountry, lang);
  const areaOptions = getAreasForCountry(selectedCountry);

  const formRef = useRef<HTMLFormElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const submissionErrorRef = useRef<HTMLParagraphElement>(null);

  // The message sits by the button the person just pressed; on a short screen bring it into view.
  useEffect(() => {
    if (submissionError) submissionErrorRef.current?.scrollIntoView({ block: "nearest" });
  }, [submissionError]);

  useEffect(() => {
    if (submitted) {
      successHeadingRef.current?.focus();
    }
  }, [submitted]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validateCallbackStarter(
      { county, phone, privacyConsent, country: selectedCountry },
      copy,
      lang,
    );
    setErrors(nextErrors);
    setSubmissionError("");

    if (Object.keys(nextErrors).length > 0) {
      const firstInvalid = (["county", "phone", "privacyConsent"] as const).find(
        (key) => Boolean(nextErrors[key]),
      );
      if (firstInvalid) {
        formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      }
      return;
    }

    if (isBrowserOffline()) {
      setSubmissionError(getOfflineUiCopy(lang).formOfflineError);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitCallbackStarter({
        name,
        phone,
        county,
        country: selectedCountry,
        lang,
        reason,
        executeCaptcha,
      });

      if (result.ok) {
        setSubmittedDetails({
          county: `${county.trim()}, ${COUNTRY_LABELS[selectedCountry][lang]}`,
          phone: normalizeCallbackPhone(phone),
        });
        setSubmitted(true);
        return;
      }

      if (result.kind === "rate_limit") {
        setSubmissionError(copy.rateLimitError);
        return;
      }

      setSubmissionError(captchaErrorMessage(result.error, copy.genericError));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setCounty("");
    setPhone("");
    setName("");
    setReason(null);
    setPrivacyConsent(false);
    setErrors({});
    setSubmissionError("");
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="swap-in overflow-hidden rounded-2xl border border-border bg-card"
      >
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="min-w-0">
            <h2
              ref={successHeadingRef}
              tabIndex={-1}
              id="solicita-heading"
              className="text-balance text-section font-semibold text-foreground focus:outline-none"
            >
              {copy.successTitle}
            </h2>
            <p className="mt-3 max-w-(--measure-reading) text-body text-foreground">
              {copy.successBody(submittedDetails.county, submittedDetails.phone)}
            </p>
            <p className="mt-4 max-w-(--measure-reading) border-t border-border pt-4 text-body text-muted-foreground">
              {copy.successNotice}
            </p>
            <div className="mt-6">
              <Button type="button" variant="outline" size="lg" onClick={handleReset}>
                {copy.sendAnother}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        {/* Left editorial ink panel: signature REDI obsidian visual identity */}
        <div className="flex min-w-0 flex-col justify-between bg-ink-950 p-6 text-paper sm:p-8 lg:p-10">
          <div>
            <h2
              id="solicita-heading"
              className="text-balance text-section font-semibold text-paper"
            >
              {copy.title}
            </h2>
            <p className="mt-3 max-w-(--measure-reading) text-pretty text-body leading-relaxed text-mist">
              {copy.lead}
            </p>

            <div className="mt-6 border-t border-paper/12 pt-5">
              <h3 className="text-body font-semibold text-paper">{copy.limitsTitle}</h3>
              <ul className="mt-3 divide-y divide-paper/10 text-body text-mist">
                <li className="pb-2.5">{copy.limitAdvice}</li>
                <li className="py-2.5">{copy.limitAvailability}</li>
                <li className="pt-2.5 font-medium text-paper/90">{copy.successNotice}</li>
              </ul>
            </div>
          </div>

          <div className="mt-7 space-y-4 border-t border-paper/12 pt-5">
            <p className="text-meta leading-relaxed text-mist">
              {copy.reassurance}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-meta text-mist">
              <p className="max-w-xs">{copy.fullFormPrompt}</p>
              <Link
                href={withLangPrefix("/get-help?mode=mediator", lang)}
                className="hero-focus press-on-dark group inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl border border-paper/18 bg-paper/[0.07] px-3.5 py-2 text-meta font-semibold text-paper transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:border-paper/35 hover:bg-paper/[0.14] motion-reduce:transition-none"
              >
                <span>{copy.fullFormLink}</span>
                <ArrowRightIcon className="arrow-travel h-4 w-4 shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right elevated paper form surface */}
        <form ref={formRef} noValidate onSubmit={handleSubmit} className="min-w-0 bg-card p-6 sm:p-8 lg:p-10">
          <div className="grid gap-5">
            <div className={availableCountries.length > 1 ? "grid gap-5 sm:grid-cols-2" : "grid gap-5"}>
              {availableCountries.length > 1 ? (
                <div className="min-w-0">
                  <label htmlFor={countryId} className="text-body font-semibold text-foreground">
                    {COUNTRY_FIELD_LABELS[lang]}
                  </label>
                  <div className="relative mt-1.5">
                    <select
                      id={countryId}
                      name="country"
                      value={selectedCountry}
                      onChange={(event) => {
                        const nextCountry = event.target.value as CountryCode;
                        setSelectedCountry(nextCountry);
                        setCounty("");
                        setSubmissionError("");
                        if (errors.county) {
                          setErrors((prev) => ({ ...prev, county: undefined }));
                        }
                      }}
                      className={selectClass}
                    >
                      {availableCountries.map((code) => (
                        <option key={code} value={code}>
                          {COUNTRY_LABELS[code][lang]}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon
                      className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              ) : null}

              <div className="min-w-0">
                <label htmlFor={countyId} className="text-body font-semibold text-foreground">
                  {areaCopy.label}
                </label>
                <div className="relative mt-1.5">
                  <select
                    id={countyId}
                    name="county"
                    required
                    value={county}
                    onChange={(event) => {
                      setCounty(event.target.value);
                      setSubmissionError("");
                      if (errors.county) {
                        setErrors((prev) => ({ ...prev, county: undefined }));
                      }
                    }}
                    aria-invalid={Boolean(errors.county)}
                    aria-describedby={errors.county ? countyErrorId : undefined}
                    className={selectClass}
                  >
                    <option value="">{areaCopy.placeholder}</option>
                    {areaOptions.map((areaName) => (
                      <option key={areaName} value={areaName}>
                        {areaName}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon
                    className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                {errors.county ? (
                  <p id={countyErrorId} role="alert" className={fieldErrorClass}>
                    {errors.county}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="min-w-0">
              <label htmlFor={phoneId} className="text-body font-semibold text-foreground">
                {copy.phoneLabel}
              </label>
              <input
                id={phoneId}
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={50}
                required
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setSubmissionError("");
                  if (errors.phone) {
                    setErrors((prev) => ({ ...prev, phone: undefined }));
                  }
                }}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? phoneErrorId : phoneHintId}
                placeholder={PHONE_PLACEHOLDERS[selectedCountry]}
                className={inputClass}
              />
              {errors.phone ? (
                <p id={phoneErrorId} role="alert" className={fieldErrorClass}>
                  {errors.phone}
                </p>
              ) : (
                <p id={phoneHintId} className="mt-1.5 text-meta text-muted-foreground">
                  {copy.phoneHint}
                </p>
              )}
            </div>

            <div role="group" aria-labelledby={reasonLabelId}>
              <p id={reasonLabelId} className="text-body font-semibold text-foreground">
                {copy.reasonLabel}{" "}
                <span className="font-normal text-muted-foreground">{copy.optionalTag}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {copy.reasonOptions.map((label, index) => {
                  const selected = reason === index;
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setReason(selected ? null : index);
                        setSubmissionError("");
                      }}
                      className={`press-row inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-xl border px-3.5 py-2.5 text-body font-semibold transition-[border-color,background-color,color] duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        selected
                          ? "border-sapphire bg-sapphire text-white"
                          : "border-border-control bg-background text-foreground hover:border-sapphire/60 hover:bg-muted/50"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor={nameId} className="text-body font-semibold text-foreground">
                {copy.nameLabel}{" "}
                <span className="font-normal text-muted-foreground">{copy.optionalTag}</span>
              </label>
              <input
                id={nameId}
                name="name"
                type="text"
                autoComplete="name"
                maxLength={200}
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setSubmissionError("");
                }}
                placeholder={copy.namePlaceholder}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor={consentId}
                className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-border/80 bg-surface-subtle/50 px-3.5 py-3 text-body text-foreground transition-colors duration-(--dur-fast) hover:border-border-control hover:bg-surface-subtle focus-within:ring-2 focus-within:ring-ring motion-reduce:transition-none"
              >
                <input
                  id={consentId}
                  type="checkbox"
                  name="privacyConsent"
                  required
                  checked={privacyConsent}
                  onChange={(event) => {
                    setPrivacyConsent(event.target.checked);
                    setSubmissionError("");
                    if (errors.privacyConsent) {
                      setErrors((prev) => ({ ...prev, privacyConsent: undefined }));
                    }
                  }}
                  aria-invalid={Boolean(errors.privacyConsent)}
                  aria-describedby={errors.privacyConsent ? consentErrorId : undefined}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-border-control accent-sapphire"
                />
                <span>
                  {copy.privacyConsent}{" "}
                  {/* A new tab: following the link must not throw away what was typed. */}
                  <a
                    href={withLangPrefix("/privacy", lang)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-sapphire underline decoration-sapphire/40 underline-offset-4 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border dark:decoration-sapphire-border/40"
                  >
                    {copy.privacyPolicyLabel}
                  </a>
                  .
                </span>
              </label>
              {errors.privacyConsent ? (
                <p id={consentErrorId} role="alert" className={fieldErrorClass}>
                  {errors.privacyConsent}
                </p>
              ) : null}
            </div>

            {submissionError ? (
              <p
                ref={submissionErrorRef}
                role="alert"
                className="swap-in scroll-mb-24 rounded-xl border border-primary/25 bg-primary-soft px-4 py-3 text-body font-medium text-foreground"
              >
                {submissionError}
              </p>
            ) : null}

            <div className="pt-1">
              <Button
                type="submit"
                variant="action"
                size="lg"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="min-h-12 w-full justify-center gap-2 sm:px-7"
              >
                <span>{isSubmitting ? copy.submitting : copy.submit}</span>
                {!isSubmitting ? <ArrowRightIcon className="arrow-travel h-4 w-4 shrink-0" aria-hidden="true" /> : null}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
