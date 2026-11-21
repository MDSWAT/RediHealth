"use client";
import { trackEvent } from "@/lib/analytics-events";

import { useRecaptcha } from "@/components/security/RecaptchaProvider";
/* eslint-disable @next/next/no-img-element -- preview is an object URL from user file */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ListenButton } from "@/components/ui/ListenButton";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  CameraIcon,
  ChevronDownIcon,
  ImageIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { useAssistantCopy } from "@/components/health-assistant/assistant-copy";
import { AI_CHAT_COPY } from "@/components/health-assistant/ai-chat-copy";
import { PrescriptionStructuredResult } from "@/components/health-assistant/PrescriptionStructuredResult";
import { useReadAloud } from "@/components/health-check/readingTools";
import { prefersCalmOrReducedMotion, useReadingLevel } from "@/lib/comfort-preferences";
import { Container } from "@/components/ui/Container";
import type { DocumentSourceKind, PrescribedMedicineItem } from "@/lib/health-assistant";
import { prepareMedicalImageForUpload } from "@/lib/image";
import { findHelpLinks } from "@/lib/i18n/find-help-links";
import { getOrCreateClientDeviceId } from "@/lib/security/client-device-id";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG, withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import { useOnlineStatus } from "@/lib/pwa/use-online-status";

type InputMode = "name" | "photo";

type ReviewResponse = {
  message: string;
  prescriptionText?: string;
  medicines?: PrescribedMedicineItem[];
  sourceKind?: DocumentSourceKind;
  confidenceScore?: number;
  confidenceReason?: string;
  urgency?: "emergency" | "routine";
  careLevel?: "emergency" | "urgent" | "soon" | "routine";
  /** Typed-name lookups: false when the name could not be identified as a medicine. */
  recognized?: boolean;
};

/** How long the browser waits for an answer before saying the service is not working. */
const REQUEST_TIMEOUT_MS = 75_000;

/** Letters and digits only, lower case, without accents: "Sertralină 50" and "sertralina50" compare equal. */
function medicineNameKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

/** True when the medicine explained is not plainly the one the person typed (a corrected spelling, another name). */
function shownNameDiffers(typed: string, medicine: PrescribedMedicineItem): boolean {
  const typedKey = medicineNameKey(typed);
  if (!typedKey) return false;
  return ![medicine.name, medicine.activeIngredient].some((candidate) => {
    const key = candidate ? medicineNameKey(candidate) : "";
    return key.length > 0 && (key.includes(typedKey) || typedKey.includes(key));
  });
}

type ReasonChipKey =
  | "feverPain"
  | "coughCold"
  | "heartBp"
  | "stomach"
  | "moodSleep"
  | "contraception"
  | "child"
  | "notSure";

const REASON_ORDER: ReasonChipKey[] = [
  "feverPain",
  "coughCold",
  "heartBp",
  "stomach",
  "moodSleep",
  "contraception",
  "child",
  "notSure",
];

interface PrescriptionReviewCopy {
  listenPage: string;
  stopListening: string;
  largeTextLabel: string;
  modeLabel: string;
  modeName: string;
  modePhoto: string;
  nameTitle: string;
  nameHint: string;
  nameLabel: string;
  namePh: string;
  nameSubmit: string;
  nameReviewing: string;
  nameReqErr: string;
  nameServiceErr: string;
  nameReviewErr: string;
  offlineErr: string;
  photoPrivacy: string;
  checkAnother: string;
  notFoundTitle: string;
  notFoundBody: string;
  typedVsShown: (typed: string, shown: string) => string;
  stepOneBadge: string;
  dropTitle: string;
  cameraCapture: string;
  galleryUpload: string;
  removePhoto: string;
  photoReady: string;
  retakeLight: string;
  tipLine: string;
  dragOrBrowse: string;
  skeletonHeading: string;
  qualityWarning: string;
  stepTwoBadge: string;
  whyLabel: string;
  whyHint: string;
  reasons: Record<ReasonChipKey, string>;
  noteLabel: string;
  whyPh: string;
  reviewButton: string;
  reviewing: string;
  reviewingHint: string;
  uploadReqErr: string;
  fileErr: string;
  readErr: string;
  serviceErr: string;
  reviewErr: string;
  reviewErrLink: string;
  rateLimitErr: string;
  previewAlt: string;
}

class ReadError extends Error {}


function ReasonChipIcon({ reason }: { reason: ReasonChipKey }) {
  switch (reason) {
    case "feverPain":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0">
          <path
            d="M11.5 11.2V4.75a1.5 1.5 0 0 0-3 0v6.45a3.25 3.25 0 1 0 3 0Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="13.75" r="1.2" fill="currentColor" />
        </svg>
      );
    case "coughCold":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0">
          <path
            d="M10 3.5v6.2M10 7.5c-2.6 0-5 2-5 5.3 0 1.8 1.2 3.2 2.8 3.2 1.2 0 2.2-.8 2.2-2.1M10 7.5c2.6 0 5 2 5 5.3 0 1.8-1.2 3.2-2.8 3.2-1.2 0-2.2-.8-2.2-2.1"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "heartBp":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0">
          <path
            d="M10 16.4s-6-3.7-6-8.1a3.4 3.4 0 0 1 6-2.1 3.4 3.4 0 0 1 6 2.1c0 4.4-6 8.1-6 8.1Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "stomach":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0">
          <path
            d="M8.5 3.5v2.7c0 1.3-2.5 2.1-2.5 4.9 0 2.9 2.1 5.1 5 5.1 2.7 0 4.5-1.8 4.5-4.3 0-2.2-1.6-3.7-3.8-3.7-.9 0-1.7.3-2.2.8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "moodSleep":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0">
          <path
            d="M14.2 12.6A5.6 5.6 0 0 1 7.4 5.8a5.8 5.8 0 1 0 6.8 6.8Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "contraception":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0">
          <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "child":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0">
          <circle cx="10" cy="6.25" r="2.75" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M5.25 16.25a4.75 4.75 0 0 1 9.5 0"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "notSure":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0">
          <circle cx="10" cy="10" r="6.75" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M8.4 8a1.75 1.75 0 0 1 3.35.65c0 1.2-1.75 1.55-1.75 2.75"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="10" cy="13.9" r="0.85" fill="currentColor" />
        </svg>
      );
  }
}

function ArrowRightSvg() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="arrow-travel h-4 w-4 shrink-0">
      <path
        d="M4.25 10h11.5m0 0-4.25-4.25M15.75 10l-4.25 4.25"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PrescriptionReview() {
  const executeCaptcha = useRecaptcha();
  const { lang, t: siteCopy } = useLanguage();
  const isOnline = useOnlineStatus();
  // The page is named exactly as the menu names it: "Medicine check", typing first, photo second.
  const pageTitle = siteCopy.header.navMedicine;
  const pageLead = siteCopy.header.navMedicineSub;
  const pharmacyLinks = findHelpLinks(lang);
  const voice = useReadAloud(lang);
  const [readingLevel] = useReadingLevel();
  const assistantCopy = useAssistantCopy();
  const safetyRules = readingLevel === "simple" ? assistantCopy.rx.plainRules : assistantCopy.rx.rules;

  const dict: Record<Lang, PrescriptionReviewCopy> = {
    ru: {
      listenPage: "Слушать",
      stopListening: "Стоп",
      largeTextLabel: "Крупнее",
      modeLabel: "Способ проверки",
      modeName: "Написать",
      modePhoto: "Сделать фото",
      nameTitle: "Введите название лекарства",
      nameHint: "Укажите название с упаковки или рецепта — например, от боли, для сна, эмоционального равновесия или контрацепции.",
      nameLabel: "Название лекарства",
      namePh: "Например: Ибупрофен",
      nameSubmit: "Проверить лекарство",
      nameReviewing: "Ищем информацию о лекарстве…",
      nameReqErr: "Введите название лекарства, чтобы продолжить.",
      nameServiceErr: "Сервис проверки лекарств временно недоступен. Попробуйте позже или обратитесь к фармацевту.",
      nameReviewErr: "Не удалось найти достаточно данных об этом лекарстве. Спросите фармацевта или",
      offlineErr: "Нет подключения к интернету. Для проверки лекарств нужен интернет. Попробуйте снова позже или покажите упаковку фармацевту.",
      photoPrivacy: "Фотография анализируется онлайн. Для конфиденциальности закройте имя и личные данные или сфотографируйте только упаковку. Загрузка фото расходует больше мобильного трафика, чем поиск по названию.",
      checkAnother: "Проверить другое лекарство",
      notFoundTitle: "Лекарство не найдено",
      notFoundBody: "Проверьте написание на упаковке или введите действующее вещество (мелкое название под основным). Вы также можете показать упаковку фармацевту.",
      typedVsShown: (typed, shown) => `Вы искали «${typed}». Показаны сведения для ${shown}. Убедитесь, что это соответствует вашей упаковке.`,
      stepOneBadge: "Шаг 1 из 2",
      dropTitle: "Добавьте фото рецепта или упаковки",
      cameraCapture: "Сделать фото",
      galleryUpload: "Выбрать из галереи",
      removePhoto: "Удалить фото",
      photoReady: "Фото готово",
      retakeLight: "Сделать другое фото",
      tipLine: "Положите рецепт или упаковку ровно при дневном свете, чтобы название и текст хорошо читались.",
      dragOrBrowse: "или перетащите фото сюда",
      skeletonHeading: "Подготавливаем информацию о лечении…",
      qualityWarning:
        "Фотография выглядит немного тёмной или размытой. Попробуйте переснять при дневном свете, чтобы текст был чётким.",
      stepTwoBadge: "Шаг 2 из 2",
      whyLabel: "Для чего было назначено лечение? (необязательно)",
      whyHint: "Выберите подходящий вариант или сразу переходите к проверке.",
      reasons: {
        feverPain: "Температура или боль",
        coughCold: "Кашель или простуда",
        heartBp: "Сердце или давление",
        stomach: "Желудок или пищеварение",
        moodSleep: "Настроение, тревога или сон",
        contraception: "Контрацепция или женское здоровье",
        child: "Для ребёнка",
        notSure: "Не знаю",
      },
      noteLabel: "Или кратко напишите своими словами (необязательно)",
      whyPh: "Например: назначено после приёма у врача при боли в горле и температуре…",
      reviewButton: "Проверить рецепт",
      reviewing: "Анализируем рецепт…",
      reviewingHint: "Обработка может занять до минуты. Пожалуйста, не закрывайте эту страницу.",
      uploadReqErr: "Сделайте или загрузите фото рецепта либо упаковки, чтобы продолжить.",
      fileErr: "Этот формат файла не поддерживается. Попробуйте сделать новое фото.",
      readErr: "Не удалось загрузить это изображение. Попробуйте другое фото.",
      serviceErr:
        "Автоматический анализ фотографий временно недоступен. Попробуйте позже или покажите рецепт либо упаковку фармацевту.",
      reviewErr: "Не удалось чётко распознать информацию на этом фото. Покажите рецепт фармацевту или",
      reviewErrLink: "обратитесь к медицинскому медиатору",
      rateLimitErr: "Слишком много запросов подряд. Подождите минуту и попробуйте снова.",
      previewAlt: "Фотография выбранного рецепта",
    },

    en: {
      listenPage: "Listen",
      stopListening: "Stop",
      largeTextLabel: "Larger text",
      modeLabel: "Check method",
      modeName: "Write",
      modePhoto: "Take a photo",
      nameTitle: "Type the medicine name",
      nameHint: "Enter the name from the box or prescription — for pain, sleep, mental wellbeing, or contraception.",
      nameLabel: "Medicine name",
      namePh: "For example: Ibuprofen",
      nameSubmit: "Check medicine",
      nameReviewing: "Looking up medicine details…",
      nameReqErr: "Enter a medicine name to continue.",
      nameServiceErr: "Medicine lookup is temporarily unavailable. Try again later or ask your pharmacist.",
      nameReviewErr: "We could not find enough details for this medicine. Ask your pharmacist, or",
      offlineErr: "No internet connection. Checking a medicine requires internet access. Try again once you are back online, or show the box to a pharmacist.",
      photoPrivacy: "Your photo is analysed online. For privacy, cover your name and ID number if you can, or photograph only the medicine box. Uploading a photo uses more mobile data than searching by name.",
      checkAnother: "Check another medicine",
      notFoundTitle: "Medicine not found",
      notFoundBody: "Check the spelling on the box, or enter the active substance printed underneath the main name. You can also show the box to a pharmacist.",
      typedVsShown: (typed, shown) => `You searched for "${typed}". Showing details for ${shown}. Check that this matches your medicine box.`,
      stepOneBadge: "Step 1 of 2",
      dropTitle: "Add your prescription or medicine box",
      cameraCapture: "Take a photo",
      galleryUpload: "Choose a photo",
      removePhoto: "Remove photo",
      photoReady: "Photo is ready",
      retakeLight: "Retake photo",
      tipLine: "Place the prescription or box flat in natural daylight so the name and text are sharp.",
      dragOrBrowse: "or drag a photo here",
      skeletonHeading: "Preparing treatment details…",
      qualityWarning:
        "The photo looks a little dark or blurry. Try taking a new one in natural daylight so the text can be read accurately.",
      stepTwoBadge: "Step 2 of 2",
      whyLabel: "What was this treatment prescribed for? (optional)",
      whyHint: "Choose a reason if you know it, or continue directly below.",
      reasons: {
        feverPain: "Fever or pain",
        coughCold: "Cough or cold",
        heartBp: "Heart or blood pressure",
        stomach: "Stomach or digestion",
        moodSleep: "Mood, anxiety or sleep",
        contraception: "Contraception or women's health",
        child: "For a child",
        notSure: "Not sure",
      },
      noteLabel: "Or add a brief note in your own words (optional)",
      whyPh: "For example: prescribed after a doctor's visit for a sore throat and fever…",
      reviewButton: "Review prescription",
      reviewing: "Reviewing prescription…",
      reviewingHint: "This can take up to a minute. Please keep this page open.",
      uploadReqErr: "Take or upload a photo of your prescription or medicine box to continue.",
      fileErr: "This file format is not supported. Try taking a new photo.",
      readErr: "We could not load that image. Please try another photo.",
      serviceErr:
        "Automatic photo review is temporarily unavailable. Try again later or show the prescription or box to your pharmacist.",
      reviewErr: "We could not clearly read the details from this photo. Show it to your pharmacist, or",
      reviewErrLink: "contact a health mediator",
      rateLimitErr: "Too many requests in a short time. Please wait one minute and try again.",
      previewAlt: "Photo of the selected prescription",
    },
    ro: {
      listenPage: "Ascultă",
      stopListening: "Oprește",
      largeTextLabel: "Scris mai mare",
      modeLabel: "Cum vrei să verifici",
      modeName: "Scrie",
      modePhoto: "Fă o poză",
      nameTitle: "Scrie numele medicamentului",
      nameHint: "Scrie numele de pe cutie sau rețetă — de exemplu, pentru durere, somn, echilibru emoțional sau contracepție.",
      nameLabel: "Numele medicamentului",
      namePh: "De exemplu: Ibuprofen",
      nameSubmit: "Vezi informațiile",
      nameReviewing: "Căutăm informațiile despre medicament…",
      nameReqErr: "Scrie numele unui medicament pentru a continua.",
      nameServiceErr: "Serviciul de verificare este temporar indisponibil. Încearcă mai târziu sau întreabă farmacistul.",
      nameReviewErr: "Nu am găsit suficiente informații pentru acest medicament. Întreabă farmacistul sau",
      offlineErr: "Nu există conexiune la internet. Verificarea medicamentelor are nevoie de semnal. Încearcă din nou mai târziu sau arată cutia unui farmacist.",
      photoPrivacy: "Imaginea este analizată online. Pentru confidențialitate, poți acoperi numele și CNP-ul sau poți fotografia doar cutia medicamentului. O poză consumă mai multe date mobile decât căutarea după nume.",
      checkAnother: "Verifică alt medicament",
      notFoundTitle: "Nu am găsit acest medicament",
      notFoundBody: "Verifică scrierea de pe cutie sau încearcă cu substanța activă (denumirea scrisă mai mic sub numele principal). Poți arăta cutia și unui farmacist.",
      typedVsShown: (typed, shown) => `Ai căutat „${typed}”. Rezultatul afișat este pentru ${shown}. Verifică dacă corespunde cu medicamentul de pe cutie.`,
      stepOneBadge: "Pasul 1 din 2",
      dropTitle: "Adaugă rețeta sau cutia medicamentului",
      cameraCapture: "Fă o poză",
      galleryUpload: "Alege o poză",
      removePhoto: "Șterge poza",
      photoReady: "Poza este pregătită",
      retakeLight: "Fă altă poză",
      tipLine: "Așază rețeta sau cutia pe o suprafață dreaptă, la lumină naturală, cu textul bine încadrat.",
      dragOrBrowse: "sau trage o poză aici",
      skeletonHeading: "Se pregătesc informațiile despre tratament…",
      qualityWarning:
        "Imaginea pare ușor întunecată sau neclară. Încearcă o fotografie nouă la lumină naturală, pentru ca textul să poată fi citit corect.",
      stepTwoBadge: "Pasul 2 din 2",
      whyLabel: "Pentru ce a fost recomandat tratamentul? (opțional)",
      whyHint: "Alege un motiv dacă dorești, sau continuă direct mai jos.",
      reasons: {
        feverPain: "Durere sau febră",
        coughCold: "Tuse sau răceală",
        heartBp: "Inimă sau tensiune",
        stomach: "Stomac sau digestie",
        moodSleep: "Stare, anxietate sau somn",
        contraception: "Contracepție sau sănătatea femeii",
        child: "Pentru un copil",
        notSure: "Nu știu exact",
      },
      noteLabel: "Sau adaugă pe scurt câteva detalii (opțional)",
      whyPh: "De exemplu: recomandat după o consultație pentru durere în gât și febră…",
      reviewButton: "Analizează rețeta",
      reviewing: "Se analizează rețeta…",
      reviewingHint: "Procesarea poate dura până la un minut. Te rugăm să lași pagina deschisă.",
      uploadReqErr: "Fă sau încarcă o poză cu rețeta ori cutia medicamentului pentru a continua.",
      fileErr: "Formatul acestui fișier nu este acceptat. Încearcă o fotografie nouă.",
      readErr: "Nu am putut încărca imaginea. Încearcă o altă fotografie.",
      serviceErr:
        "Analiza automată a imaginilor este temporar indisponibilă. Încearcă mai târziu sau arată rețeta ori cutia unui farmacist.",
      reviewErr: "Nu am putut extrage clar informațiile din această imagine. Arată rețeta unui farmacist sau",
      reviewErrLink: "cere sprijinul unui mediator sanitar",
      rateLimitErr: "Ai trimis prea multe cereri într-un timp scurt. Așteaptă un minut și încearcă din nou.",
      previewAlt: "Poza rețetei alese",
    },
    sq: {
      listenPage: "Dëgjo",
      stopListening: "Ndalo",
      largeTextLabel: "Shkrim më i madh",
      modeLabel: "Mënyra e kontrollit",
      modeName: "Shkruaj",
      modePhoto: "Bëj një foto",
      nameTitle: "Shkruaj emrin e ilaçit",
      nameHint: "Shkruaj emrin nga kutia ose receta — për dhimbje, gjumë, mirëqenie emocionale ose kontracepsion.",
      nameLabel: "Emri i ilaçit",
      namePh: "Për shembull: Ibuprofen",
      nameSubmit: "Shiko informacionin",
      nameReviewing: "Po kërkojmë informacionin e ilaçit…",
      nameReqErr: "Shkruaj emrin e ilaçit për të vazhduar.",
      nameServiceErr: "Shërbimi i kontrollit është përkohësisht i padisponueshëm. Provo më vonë ose pyet farmacistin.",
      nameReviewErr: "Nuk gjetëm mjaftueshëm informacion për këtë ilaç. Pyet farmacistin ose",
      offlineErr: "Nuk ka lidhje interneti. Kontrolli i ilaçeve kërkon internet. Provo përsëri kur të kesh sinjal ose tregoja kutinë një farmacisti.",
      photoPrivacy: "Fotoja analizohet online. Për privatësi, mbulo emrin dhe numrin personal nëse mundesh, ose fotografo vetëm kutinë. Ngarkimi i një fotoje harxhon më shumë internet se kërkimi me emër.",
      checkAnother: "Kontrollo ilaç tjetër",
      notFoundTitle: "Ky ilaç nuk u gjet",
      notFoundBody: "Kontrollo shkronjat në kuti ose shkruaj substancën aktive (emri më i vogël poshtë emrit kryesor). Mund t'ia tregosh kutinë edhe një farmacisti.",
      typedVsShown: (typed, shown) => `Kërkove „${typed}“. Rezultati i shfaqur është për ${shown}. Kontrollo nëse përputhet me kutinë tënde.`,
      stepOneBadge: "Hapi 1 nga 2",
      dropTitle: "Shto recetën ose kutinë e ilaçit",
      cameraCapture: "Bëj një foto",
      galleryUpload: "Zgjidh një foto",
      removePhoto: "Hiq foton",
      photoReady: "Fotoja është gati",
      retakeLight: "Bëj foto tjetër",
      tipLine: "Vendose fletën ose kutinë drejt, në dritë natyrale, që emri dhe teksti të lexohen qartë.",
      dragOrBrowse: "ose tërhiq një foto këtu",
      skeletonHeading: "Po përgatiten detajet e trajtimit…",
      qualityWarning:
        "Fotoja duket pak e errët ose e paqartë. Provo përsëri në dritë natyrale, që teksti të lexohet saktë.",
      stepTwoBadge: "Hapi 2 nga 2",
      whyLabel: "Për çfarë është rekomanduar trajtimi? (sipas dëshirës)",
      whyHint: "Zgjidh një arsye nëse dëshiron, ose vazhdo direkt më poshtë.",
      reasons: {
        feverPain: "Dhimbje ose temperaturë",
        coughCold: "Kollë ose ftohje",
        heartBp: "Zemër ose presion",
        stomach: "Stomak ose tretje",
        moodSleep: "Gjendje shpirtërore, ankth ose gjumë",
        contraception: "Kontracepsion ose shëndeti i gruas",
        child: "Për një fëmijë",
        notSure: "Nuk jam i sigurt",
      },
      noteLabel: "Ose shto shkurt disa detaje (sipas dëshirës)",
      whyPh: "Për shembull: e mora pas një vizite te mjeku për dhimbje fyti dhe temperaturë…",
      reviewButton: "Analizo recetën",
      reviewing: "Po analizohet receta…",
      reviewingHint: "Procesimi mund të zgjasë deri në një minutë. Të lutem mbaje faqen të hapur.",
      uploadReqErr: "Bëj ose ngarko një foto të recetës apo kutisë për të vazhduar.",
      fileErr: "Ky format skedari nuk mbështetet. Provo me një foto të re.",
      readErr: "Nuk mundëm ta hapim këtë imazh. Provo një foto tjetër.",
      serviceErr:
        "Analiza automatike e fotove është përkohësisht e padisponueshme. Provo më vonë ose tregoja recetën apo kutinë farmacistit.",
      reviewErr: "Nuk mundëm ta lexojmë qartë këtë imazh. Tregoja recetën farmacistit ose",
      reviewErrLink: "kërko ndihmën e një mediatori shëndetësor",
      rateLimitErr: "Shumë kërkesa brenda një kohe të shkurtër. Prit një minutë dhe provo përsëri.",
      previewAlt: "Foto e recetës së zgjedhur",
    },
    it: {
      listenPage: "Ascolta",
      stopListening: "Ferma",
      largeTextLabel: "Testo più grande",
      modeLabel: "Metodo di verifica",
      modeName: "Scrivi",
      modePhoto: "Scatta una foto",
      nameTitle: "Scrivi il nome del farmaco",
      nameHint: "Inserisci il nome dalla scatola o dalla ricetta — per dolore, sonno, benessere emotivo o contraccezione.",
      nameLabel: "Nome del farmaco",
      namePh: "Ad esempio: Ibuprofene",
      nameSubmit: "Verifica il farmaco",
      nameReviewing: "Ricerca delle informazioni sul farmaco…",
      nameReqErr: "Inserisci il nome del farmaco per continuare.",
      nameServiceErr: "Il servizio di verifica è temporaneamente non disponibile. Riprova più tardi o chiedi al farmacista.",
      nameReviewErr: "Non abbiamo trovato abbastanza informazioni su questo farmaco. Chiedi al farmacista oppure",
      offlineErr: "Nessuna connessione internet. La verifica dei farmaci richiede internet. Riprova quando hai segnale o mostra la scatola a un farmacista.",
      photoPrivacy: "La foto viene analizzata online. Per la privacy, copri nome e codice fiscale se puoi, oppure fotografa solo la scatola. Caricare una foto consuma più dati mobili rispetto alla ricerca per nome.",
      checkAnother: "Verifica un altro farmaco",
      notFoundTitle: "Farmaco non trovato",
      notFoundBody: "Controlla la grafia sulla scatola oppure inserisci il principio attivo stampato sotto il nome principale. Puoi anche mostrare la scatola a un farmacista.",
      typedVsShown: (typed, shown) => `Hai cercato «${typed}». Mostriamo i dettagli per ${shown}. Verifica che corrisponda alla tua confezione.`,
      stepOneBadge: "Passo 1 di 2",
      dropTitle: "Aggiungi la ricetta o la scatola",
      cameraCapture: "Scatta una foto",
      galleryUpload: "Scegli una foto",
      removePhoto: "Rimuovi foto",
      photoReady: "La foto è pronta",
      retakeLight: "Rifai la foto",
      tipLine: "Appoggia il foglio o la scatola in piano alla luce naturale, con nome e testo ben visibili.",
      dragOrBrowse: "oppure trascina una foto qui",
      skeletonHeading: "Preparazione dei dettagli del trattamento…",
      qualityWarning:
        "La foto sembra un po' scura o sfocata. Prova a scattarne una nuova alla luce naturale così il testo sarà ben leggibile.",
      stepTwoBadge: "Passo 2 di 2",
      whyLabel: "Per cosa è stato prescritto il trattamento? (facoltativo)",
      whyHint: "Scegli un motivo se vuoi, oppure procedi direttamente qui sotto.",
      reasons: {
        feverPain: "Febbre o dolore",
        coughCold: "Tosse o raffreddore",
        heartBp: "Cuore o pressione",
        stomach: "Stomaco o digestione",
        moodSleep: "Umore, ansia o sonno",
        contraception: "Contraccezione o salute femminile",
        child: "Per un bambino",
        notSure: "Non lo so di preciso",
      },
      noteLabel: "Oppure aggiungi una breve nota (facoltativo)",
      whyPh: "Ad esempio: prescritta dopo una visita per mal di gola e febbre…",
      reviewButton: "Analizza la ricetta",
      reviewing: "Analisi della ricetta in corso…",
      reviewingHint: "L'elaborazione può richiedere fino a un minuto. Tieni aperta questa pagina.",
      uploadReqErr: "Scatta o carica una foto della ricetta o della scatola per continuare.",
      fileErr: "Questo formato di file non è supportato. Prova a scattare una nuova foto.",
      readErr: "Non siamo riusciti a caricare l'immagine. Prova con un'altra foto.",
      serviceErr:
        "L'analisi automatica delle foto è temporaneamente non disponibile. Riprova più tardi o mostra la ricetta o la scatola al farmacista.",
      reviewErr: "Non siamo riusciti a leggere chiaramente i dettagli da questa foto. Mostrala al farmacista oppure",
      reviewErrLink: "chiedi supporto a un mediatore sanitario",
      rateLimitErr: "Troppe richieste in poco tempo. Attendi un minuto e riprova.",
      previewAlt: "Foto della ricetta selezionata",
    },
    hr: {
      listenPage: "Poslušaj",
      stopListening: "Zaustavi",
      largeTextLabel: "Veća slova",
      modeLabel: "Način provjere",
      modeName: "Upiši",
      modePhoto: "Snimi fotografiju",
      nameTitle: "Upiši naziv lijeka",
      nameHint: "Upiši naziv s kutije ili recepta — za bol, san, mentalno zdravlje ili kontracepciju.",
      nameLabel: "Naziv lijeka",
      namePh: "Na primjer: Ibuprofen",
      nameSubmit: "Provjeri lijek",
      nameReviewing: "Tražimo informacije o lijeku…",
      nameReqErr: "Upiši naziv lijeka za nastavak.",
      nameServiceErr: "Usluga provjere lijekova trenutačno nije dostupna. Pokušaj kasnije ili pitaj ljekarnika.",
      nameReviewErr: "Nismo pronašli dovoljno informacija o ovom lijeku. Pitaj ljekarnika ili",
      offlineErr: "Nema internetske veze. Provjera lijekova zahtijeva internet. Pokušaj ponovno kad imaš signal ili pokaži kutiju ljekarniku.",
      photoPrivacy: "Fotografija se analizira putem interneta. Radi privatnosti pokrij ime i OIB ako možeš, ili fotografiraj samo kutiju lijeka. Slanje fotografije troši više mobilnih podataka od upisivanja naziva.",
      checkAnother: "Provjeri drugi lijek",
      notFoundTitle: "Lijek nije pronađen",
      notFoundBody: "Provjeri naziv na kutiji ili upiši djelatnu tvar otisnutu manjim slovima ispod glavnog naziva. Kutiju možeš pokazati i ljekarniku.",
      typedVsShown: (typed, shown) => `Traženo je „${typed}“. Prikazujemo podatke za ${shown}. Provjeri odgovara li to nazivu na tvojoj kutiji.`,
      stepOneBadge: "Korak 1 od 2",
      dropTitle: "Dodaj recept ili kutiju lijeka",
      cameraCapture: "Snimi fotografiju",
      galleryUpload: "Odaberi fotografiju",
      removePhoto: "Ukloni fotografiju",
      photoReady: "Fotografija je spremna",
      retakeLight: "Snimi ponovno",
      tipLine: "Položi recept ili kutiju ravno na dnevnom svjetlu tako da se naziv i tekst jasno vide.",
      dragOrBrowse: "ili povuci fotografiju ovdje",
      skeletonHeading: "Pripremamo detalje o terapiji…",
      qualityWarning:
        "Fotografija izgleda pomalo tamno ili mutno. Pokušaj ponovno na dnevnom svjetlu kako bi tekst bio čitljiv.",
      stepTwoBadge: "Korak 2 od 2",
      whyLabel: "Za što je propisana ova terapija? (nije obavezno)",
      whyHint: "Odaberi razlog ako želiš, ili nastavi izravno dolje.",
      reasons: {
        feverPain: "Bol ili vrućica",
        coughCold: "Kašalj ili prehlada",
        heartBp: "Srce ili tlak",
        stomach: "Želudac ili probava",
        moodSleep: "Raspoloženje, tjeskoba ili san",
        contraception: "Kontracepcija ili zdravlje žena",
        child: "Za dijete",
        notSure: "Nisam siguran",
      },
      noteLabel: "Ili kratko dodaj napomenu (nije obavezno)",
      whyPh: "Na primjer: propisano nakon pregleda kod liječnika zbog grlobolje i vrućice…",
      reviewButton: "Analiziraj recept",
      reviewing: "Analiziramo recept…",
      reviewingHint: "Obrada može potrajati do jedne minute. Molimo ostavi ovu stranicu otvorenom.",
      uploadReqErr: "Snimi ili učitaj fotografiju recepta ili kutije lijeka za nastavak.",
      fileErr: "Ovaj format datoteke nije podržan. Pokušaj snimiti novu fotografiju.",
      readErr: "Nismo uspjeli učitati tu sliku. Pokušaj s drugom fotografijom.",
      serviceErr:
        "Automatska analiza fotografija trenutačno nije dostupna. Pokušaj kasnije ili pokaži recept ili kutiju ljekarniku.",
      reviewErr: "Nismo uspjeli jasno pročitati podatke s ove fotografije. Pokaži recept ljekarniku ili",
      reviewErrLink: "zatraži podršku zdravstvenog medijatora",
      rateLimitErr: "Previše zahtjeva u kratkom vremenu. Pričekaj minutu pa pokušaj ponovno.",
      previewAlt: "Fotografija odabranog recepta",
    },
    rom: {
      listenPage: "Ashun",
      stopListening: "Achav",
      largeTextLabel: "Maj baro ramovimos",
      modeLabel: "Sar te dikhes o drab",
      modeName: "Ramov",
      modePhoto: "Ker jekh poza",
      nameTitle: "Ramov o anav e drabako",
      nameHint: "Thov o anav katar i kutija vaj i receta — vash dukh, sovimos, vilo vaj kontracepcia.",
      nameLabel: "Anav e drabako",
      namePh: "Misal: Ibuprofen",
      nameSubmit: "Dikh e informaciye",
      nameReviewing: "Rodas e informaciye vash o drab…",
      nameReqErr: "Ramov o anav e drabako te djas maj dur.",
      nameServiceErr: "O dikhimos e drabengo na kerel buki akana. Zumav maj palal vaj puch e farmacistos.",
      nameReviewErr: "Na arakhlam dosta informaciye vash kadava drab. Puch e farmacistos vaj",
      offlineErr: "Naj tut internet. O dikhimos e drabengo trebul internet. Zumav pale kana si tut signalo vaj sikav i kutija ke farmacisto.",
      photoPrivacy: "I poza analizir pe online. Vash garavimos, uchar chiro anav thaj personalno gin te shaj, vaj ker poza numaj e drabake kutijake. Jekh poza xal maj but internet sar o rodipe palal o anav.",
      checkAnother: "Dikh aver drab",
      notFoundTitle: "Na arakhlam kadava drab",
      notFoundBody: "Dikh e literi pe kutija vaj ramov o maj tikno anav tela leste (i aktivno substanca). Shaj sikaves i kutija vi ke farmacisto.",
      typedVsShown: (typed, shown) => `Tu rodan „${typed}”. Sikavas e detalya vash ${shown}. Dikh te si kadava o anav pe chiri kutija.`,
      stepOneBadge: "Pasho 1 katar 2",
      dropTitle: "Thov i receta vaj i drabaki kutija",
      cameraCapture: "Ker poza",
      galleryUpload: "Alosar jekh poza",
      removePhoto: "Khos i poza",
      photoReady: "I poza si gata",
      retakeLight: "Ker aver poza",
      tipLine: "Thov o lil vaj i kutija pre masi, and-o divesko vudud, te dikhljol o anav thaj o teksto mishto.",
      dragOrBrowse: "vaj thov jekh poza kathe",
      skeletonHeading: "Pregatisaras e detalya vash o tratament…",
      qualityWarning:
        "I poza dikljol xantsi kali vaj na uzi. Zumav pale ko divesko vudud kaste ginavel pe o teksto mishto.",
      stepTwoBadge: "Pasho 2 katar 2",
      whyLabel: "Vash so sas dino o tratament? (te manges)",
      whyHint: "Alosar jekh motivo te manges, vaj dja maj dur tela.",
      reasons: {
        feverPain: "Dukh vaj tatipen",
        coughCold: "Khas vaj shil",
        heartBp: "Ilo vaj tensia",
        stomach: "Ogi vaj xabem",
        moodSleep: "Vilo, dar vaj sovimos",
        contraception: "Kontracepcia vaj sastipen dzhuvljengo",
        child: "Vash jekh chavoro",
        notSure: "Na dzanav chaches",
      },
      noteLabel: "Vaj ramov skurto chire vorbenca (te manges)",
      whyPh: "Misal: dino pala jekh drom ko doktori vash dukh and-o korr thaj tatipen…",
      reviewButton: "Analizir i receta",
      reviewing: "Analizir pe i receta…",
      reviewingHint: "Shaj djal dji ko jekh minuto. Mekh kadaja rig puterdi.",
      uploadReqErr: "Ker vaj thov jekh poza e recetaki vaj e kutijaki te djas maj dur.",
      fileErr: "Kadava fajlo naj poza kaj shaj phuteras la. Ker jekh nevi poza.",
      readErr: "Nashti phuterdas kadaja poza. Zumav aver poza.",
      serviceErr:
        "O automatikano analizimos e pozengo na kamel akana. Zumav maj palal vaj sikav i receta ori i kutija ke farmacisto.",
      reviewErr: "Nashti ginadas uzo e detalya katar kadaja poza. Sikav i receta ke farmacisto vaj",
      reviewErrLink: "mang zhutimos katar ekh sastipnasko mediatori",
      rateLimitErr: "Azhuker jekh minuta, porme zumav pale.",
      previewAlt: "Poza katar i alosardi receta",
    },
  };
  const t = dict[lang] || dict[DEFAULT_LANG];

  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const stepTwoRef = useRef<HTMLDivElement>(null);
  const resultSectionRef = useRef<HTMLElement>(null);
  const formSectionRef = useRef<HTMLElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [inputMode, setInputMode] = useState<InputMode>("name");
  const [medicineName, setMedicineName] = useState("");
  const [submittedMode, setSubmittedMode] = useState<InputMode>("name");
  const [submittedName, setSubmittedName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<ReasonChipKey[]>([]);
  const [context, setContext] = useState("");
  const [result, setResult] = useState<ReviewResponse | null>(null);
  const [qualityState, setQualityState] = useState<"idle" | "checking" | "good" | "warn">("idle");
  const safetyCopy = (AI_CHAT_COPY[lang] ?? AI_CHAT_COPY.en).safety;
  const [errorKind, setErrorKind] = useState<
    | "nameReq"
    | "file"
    | "uploadReq"
    | "read"
    | "rateLimit"
    | "blocked"
    | "dailyLimit"
    | "abuseWarning"
    | "offline"
    | "service"
    | "review"
    | null
  >(null);
  // A typed name and a photo fail in different words: nothing was "read" when the person typed.
  const nameMode = inputMode === "name";
  const errorMessages = {
    nameReq: t.nameReqErr,
    file: t.fileErr,
    uploadReq: t.uploadReqErr,
    read: t.readErr,
    rateLimit: t.rateLimitErr,
    blocked: safetyCopy.blockedBody,
    dailyLimit: safetyCopy.dailyLimitBody,
    abuseWarning: safetyCopy.abuseWarning,
    offline: t.offlineErr,
    service: nameMode ? t.nameServiceErr : t.serviceErr,
    review: nameMode ? t.nameReviewErr : t.reviewErr,
  };
  const askPersonLink = (
    <>
      {" "}
      <Link
        href={withLangPrefix("/get-help?mode=mediator", lang)}
        className="rounded-xs font-semibold text-foreground underline decoration-amber-care decoration-2 underline-offset-4 transition-colors duration-[var(--dur-fast)] hover:text-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      >
        {t.reviewErrLink}
      </Link>
      .
    </>
  );
  const errorAlert = errorKind ? (
    <div
      role="alert"
      className="swap-in rounded-lg border border-border bg-card p-3.5 text-body font-medium text-foreground dark:border-ink-800 dark:bg-ink-900"
    >
      {errorMessages[errorKind]}
      {errorKind === "review" ? askPersonLink : null}
    </div>
  ) : null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  function getScrollBehavior(): ScrollBehavior {
    if (prefersCalmOrReducedMotion()) {
      return "auto";
    }
    return "smooth";
  }

  // Client-side lighting and blur pre-check (Change 44)
  function checkImageQuality(imageUrl: string) {
    setQualityState("checking");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setQualityState("good");
        return;
      }

      canvas.width = 160;
      canvas.height = 160;
      ctx.drawImage(img, 0, 0, 160, 160);

      try {
        const imageData = ctx.getImageData(0, 0, 160, 160);
        const data = imageData.data;
        const pixels = data.length / 4;
        let sum = 0;
        let sumSquares = 0;
        for (let i = 0; i < data.length; i += 4) {
          const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          sum += brightness;
          sumSquares += brightness * brightness;
        }
        const mean = sum / pixels;
        const stdDev = Math.sqrt(Math.max(0, sumSquares / pixels - mean * mean));

        // Warn when the photo is too dark, or so uniform that no writing stands out.
        setQualityState(mean < 60 || stdDev < 10 ? "warn" : "good");
      } catch {
        setQualityState("good");
      }
    };
    img.onerror = () => {
      setQualityState("good");
    };
    img.src = imageUrl;
  }

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (!preview) return;
    const timer = window.setTimeout(() => {
      stepTwoRef.current?.scrollIntoView({ behavior: getScrollBehavior(), block: "nearest" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [preview]);

  useEffect(() => {
    if (!result) return;
    const timer = window.setTimeout(() => {
      resultSectionRef.current?.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [result]);

  function handleHeaderListen() {
    if (voice.speaking) {
      voice.stop();
      return;
    }
    voice.speak(
      inputMode === "name"
        ? [pageTitle, pageLead, t.nameTitle, t.nameHint]
        : [pageTitle, pageLead, t.tipLine, t.photoPrivacy]
    );
  }

  function toggleReasonChip(reason: ReasonChipKey) {
    setSelectedReasons((prev) => {
      if (reason === "notSure") {
        return prev.includes("notSure") ? [] : ["notSure"];
      }
      const withoutNotSure = prev.filter((item) => item !== "notSure");
      if (withoutNotSure.includes(reason)) {
        return withoutNotSure.filter((item) => item !== reason);
      }
      return [...withoutNotSure, reason];
    });
  }

  function handleRemovePhoto() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setQualityState("idle");
    setErrorKind(null);
    setResult(null);
    if (cameraInput.current) cameraInput.current.value = "";
    if (galleryInput.current) galleryInput.current.value = "";
  }

  function handleFileSelected(selected: File | null) {
    setErrorKind(null);
    setResult(null);
    if (!selected) return;

    const looksLikeImage =
      selected.type.startsWith("image/") ||
      /\.(heic|heif|jpg|jpeg|png|webp|avif)$/i.test(selected.name);

    if (!looksLikeImage || selected.size > 15 * 1024 * 1024) {
      if (preview) URL.revokeObjectURL(preview);
      setFile(null);
      setPreview(null);
      setQualityState("idle");
      setErrorKind("file");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    const objectUrl = URL.createObjectURL(selected);
    setFile(selected);
    setPreview(objectUrl);
    checkImageQuality(objectUrl);
  }

  function handleModeSwitch(nextMode: InputMode) {
    if (nextMode === inputMode) return;
    setInputMode(nextMode);
    setErrorKind(null);
    setResult(null);
  }

  function showForm(focusNameField: boolean) {
    window.setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
      if (focusNameField) nameInputRef.current?.focus({ preventScroll: true });
    }, 80);
  }

  /** From a result that did not help: go to the other way in, with the form back in view. */
  function switchModeAndShowForm(nextMode: InputMode) {
    setInputMode(nextMode);
    setErrorKind(null);
    setResult(null);
    showForm(nextMode === "name");
  }

  function handleCheckAnother() {
    handleRemovePhoto();
    setMedicineName("");
    setSubmittedName("");
    showForm(inputMode === "name");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const isNameMode = inputMode === "name";
    const trimmedMedicineName = medicineName.trim();

    if (isNameMode && !trimmedMedicineName) {
      setErrorKind("nameReq");
      return;
    }
    if (!isNameMode && !file) {
      setErrorKind("uploadReq");
      return;
    }

    // Say so before the wait: the check cannot work without a connection.
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setErrorKind("offline");
      return;
    }

    setErrorKind(null);
    setResult(null);
    setSubmittedMode(inputMode);
    setSubmittedName(isNameMode ? trimmedMedicineName : "");
    setIsSubmitting(true);

    const selectedChipLabels = REASON_ORDER.filter((key) => selectedReasons.includes(key)).map(
      (key) => t.reasons[key]
    );
    const combinedPrescriptionContext = [selectedChipLabels.join(", "), context.trim()]
      .filter(Boolean)
      .join(". ");

    // AbortController and a timer, not AbortSignal.timeout: older phones do not have it.
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      let requestPayload: Record<string, unknown>;
      if (isNameMode) {
        const captchaToken = await executeCaptcha("health_assistant");
        requestPayload = {
          mode: "medicine_lookup",
          medicineName: trimmedMedicineName,
          prescriptionContext: combinedPrescriptionContext,
          lang,
          captchaToken,
        };
      } else {
        let prescription: { mimeType: string; data: string };
        try {
          prescription = await prepareMedicalImageForUpload(file!);
        } catch {
          throw new ReadError();
        }

        const captchaToken = await executeCaptcha("health_assistant");
        requestPayload = {
          prescriptionContext: combinedPrescriptionContext,
          prescription,
          lang,
          captchaToken,
        };
      }

      const response = await fetch("/api/health-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-id": getOrCreateClientDeviceId(),
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      });

      // Server errors are written in English; the person always sees a message in their language.
      // A fault on our side (5xx) is never blamed on the photo or on the name that was typed.
      if (!response.ok) {
        const errData = (await response.json().catch(() => null)) as { code?: string } | null;
        if (errData?.code === "device_blocked") setErrorKind("blocked");
        else if (errData?.code === "abuse_warning") setErrorKind("abuseWarning");
        else if (errData?.code === "daily_token_limit") setErrorKind("dailyLimit");
        else if (response.status === 429) setErrorKind("rateLimit");
        else if (response.status >= 500) setErrorKind("service");
        else setErrorKind("review");
        return;
      }
      trackEvent("prescription_review_requested");
      setResult((await response.json()) as ReviewResponse);
    } catch (caughtError) {
      // A dropped connection, a timeout or a failed bot check: the service did not answer.
      if (caughtError instanceof ReadError) setErrorKind("read");
      else if (typeof navigator !== "undefined" && navigator.onLine === false) setErrorKind("offline");
      else setErrorKind("service");
    } finally {
      window.clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  }

  // What came back, in the person's terms. An emergency answer is always shown as it is.
  const namedMedicines = result?.medicines?.filter((medicine) => Boolean(medicine.name?.trim())) ?? [];
  const resultIsEmergency = result?.urgency === "emergency" || result?.careLevel === "emergency";
  const resultState: "none" | "ok" | "notFound" | "unreadable" = !result
    ? "none"
    : resultIsEmergency
      ? "ok"
      : submittedMode === "name"
        ? // A missing flag counts as recognized only when a named medicine came back.
          result.recognized === false || namedMedicines.length === 0
          ? "notFound"
          : "ok"
        : result.sourceKind === "unreadable" ||
            (namedMedicines.length === 0 && !result.prescriptionText?.trim())
          ? "unreadable"
          : "ok";
  const typedNameNotice =
    resultState === "ok" &&
    submittedMode === "name" &&
    namedMedicines[0] &&
    shownNameDiffers(submittedName, namedMedicines[0])
      ? t.typedVsShown(submittedName, namedMedicines[0].name)
      : undefined;
  const resultCardClass =
    "assistant-step-in rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-8";

  const currentStep = preview ? 2 : 1;
  const currentStepLabel = preview ? t.stepTwoBadge : t.stepOneBadge;
  const showStepTwo = inputMode === "name" || Boolean(preview);

  const reasonFields = (
    <>
      <div className="flex flex-wrap gap-2.5">
        {REASON_ORDER.map((reasonKey, index) => {
          const active = selectedReasons.includes(reasonKey);
          return (
            <button
              key={reasonKey}
              type="button"
              onClick={() => toggleReasonChip(reasonKey)}
              aria-pressed={active}
              style={{ "--i": index } as CSSProperties}
              className={`list-in press-row inline-flex min-h-11 items-center gap-2.5 whitespace-nowrap rounded-xl border px-3.5 py-2.5 text-left text-body font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                active
                  ? "border-rose-border bg-rose-tint font-semibold text-rose-ink shadow-2xs"
                  : "border-border bg-background text-foreground hover:border-rose-border/75 hover:bg-muted"
              }`}
            >
              <span
                className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none ${
                  active
                    ? "bg-rose-ink text-white"
                    : "bg-surface-subtle text-sapphire dark:bg-muted dark:text-sapphire-border"
                }`}
              >
                <ReasonChipIcon reason={reasonKey} />
              </span>
              <span className="leading-snug">{t.reasons[reasonKey]}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <label
          className="block text-body font-medium text-muted-foreground"
          htmlFor="prescription-context"
        >
          {t.noteLabel}
        </label>
        <textarea
          id="prescription-context"
          aria-describedby={inputMode === "name" ? undefined : "prescription-context-hint"}
          rows={2}
          maxLength={4000}
          value={context}
          onChange={(event) => setContext(event.target.value)}
          placeholder={t.whyPh}
          className="field-focus mt-1.5 w-full resize-none rounded-lg border border-border-control bg-background p-3 text-body text-foreground placeholder:text-muted-foreground"
        />
      </div>
    </>
  );

  return (
    <main
      id="main-content"
      className="flex-1 pt-2 pb-10 sm:pt-3 sm:pb-14"
    >
      <Container>
        <PageHeader
          className="print:hidden"
          title={pageTitle}
          lead={pageLead}
          actions={
            voice.available ? (
              <ListenButton
                uiLang={lang}
                autoRead
                isPlaying={voice.speaking}
                onToggle={handleHeaderListen}
              />
            ) : undefined
          }
        />

        {!isOnline && (
          <div
            role="status"
            aria-live="polite"
            className="mt-5 rounded-2xl border border-border bg-card p-4 text-body text-foreground shadow-2xs print:hidden dark:border-ink-800 dark:bg-ink-900"
          >
            <p className="leading-relaxed">{t.offlineErr}</p>
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 items-start gap-6 sm:mt-6 lg:grid-cols-12 lg:gap-8 print:block">
          <div className="min-w-0 lg:sticky lg:top-[calc(var(--site-header-h)+1.5rem)] lg:col-span-5 print:hidden">
            <section
              ref={formSectionRef}
              className="scroll-mt-24 rounded-2xl border border-border bg-card shadow-xs print:hidden"
            >
              <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-7" aria-busy={isSubmitting}>
                <div
                  role="tablist"
                  aria-label={t.modeLabel}
                  className="grid w-full grid-cols-2 gap-1 rounded-xl border border-border bg-muted/65 p-1"
                >
                  <button
                    type="button"
                    role="tab"
                    data-segmented=""
                    aria-selected={inputMode === "name"}
                    onClick={() => handleModeSwitch("name")}
                    className={`inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-center text-meta font-semibold leading-tight transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      inputMode === "name"
                        ? "border-rose-border bg-rose-tint text-rose-ink shadow-2xs"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <SearchIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0">{t.modeName}</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    data-segmented=""
                    aria-selected={inputMode === "photo"}
                    onClick={() => handleModeSwitch("photo")}
                    className={`inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-center text-meta font-semibold leading-tight transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      inputMode === "photo"
                        ? "border-rose-border bg-rose-tint text-rose-ink shadow-2xs"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <CameraIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0">{t.modePhoto}</span>
                  </button>
                </div>

                {inputMode === "photo" ? (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5">
                      <p className="whitespace-nowrap text-meta font-medium text-muted-foreground tabular-nums">
                        {currentStepLabel}
                      </p>
                    </div>

                    <div
                      className="mt-3 flex h-1 w-full gap-1.5"
                      role="progressbar"
                      aria-label={pageTitle}
                      aria-valuenow={currentStep}
                      aria-valuemin={1}
                      aria-valuemax={2}
                      aria-valuetext={currentStepLabel}
                    >
                      {[1, 2].map((segment) => (
                        <div
                          key={segment}
                          className={`h-1 flex-1 rounded-sm transition-colors duration-[var(--dur-base)] ease-[var(--ease-out-calm)] ${
                            currentStep >= segment ? "bg-sapphire dark:bg-sapphire-border" : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

            {/* Separate inputs: one opens the camera directly on phones, the other the gallery. */}
            <input
              ref={cameraInput}
              type="file"
              accept="image/*"
              capture="environment"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
              className="sr-only"
            />
            <input
              ref={galleryInput}
              type="file"
              accept="image/*"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
              className="sr-only"
            />

            {/* Step 1: Type a medicine name OR capture photo */}
            {inputMode === "name" ? (
              <div className="swap-in space-y-3">
                <h2 className="text-title font-semibold text-foreground text-balance">{t.nameTitle}</h2>
                <p id="medicine-name-hint" className="text-body leading-relaxed text-muted-foreground">
                  {t.nameHint}
                </p>
                <div className="pt-1">
                  <label htmlFor="medicine-name-input" className="block text-body font-medium text-foreground">
                    {t.nameLabel}
                  </label>
                  <input
                    id="medicine-name-input"
                    ref={nameInputRef}
                    type="text"
                    inputMode="text"
                    maxLength={240}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="words"
                    spellCheck={false}
                    enterKeyHint="search"
                    value={medicineName}
                    aria-describedby="medicine-name-hint"
                    onChange={(event) => {
                      setMedicineName(event.target.value);
                      if (errorKind === "nameReq") setErrorKind(null);
                    }}
                    placeholder={t.namePh}
                    className="field-focus mt-2 min-h-12 w-full rounded-xl border border-border-control bg-background px-4 py-3 text-body text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            ) : preview ? (
              <div className="swap-in rounded-2xl border border-border bg-surface-subtle/30 p-5 text-center sm:p-7">
                <p className="text-body font-semibold text-foreground">{t.photoReady}</p>

                <figure className="mt-4 flex flex-col items-center">
                  <img
                    src={preview}
                    alt={t.previewAlt}
                    className="max-h-80 w-auto rounded-xl border border-border bg-card object-contain shadow-xs"
                  />
                  {file?.name ? (
                    <figcaption className="mt-2 max-w-full truncate text-meta text-muted-foreground">
                      {file.name}
                    </figcaption>
                  ) : null}
                </figure>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => cameraInput.current?.click()}
                    className="dark:bg-ink-900"
                  >
                    <CameraIcon className="h-4 w-4 shrink-0" />
                    <span>{t.retakeLight}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => galleryInput.current?.click()}
                    className="dark:bg-ink-900"
                  >
                    <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{t.galleryUpload}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handleRemovePhoto}
                    disabled={isSubmitting}
                  >
                    <TrashIcon className="h-4 w-4 shrink-0" />
                    <span>{t.removePhoto}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(event) => {
                  // Moving over the zone's own children fires dragleave too; only leave for real.
                  if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                  setIsDragging(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  handleFileSelected(event.dataTransfer.files?.[0] ?? null);
                }}
                className={`swap-in rounded-2xl border-2 p-6 text-center transition-[border-color,background-color,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none sm:p-8 ${
                  isDragging
                    ? "border-solid border-sapphire bg-sapphire-soft/50 shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-sapphire)_14%,transparent)] dark:border-sapphire-light dark:bg-sapphire/15"
                    : "border-dashed border-border-control bg-surface-subtle/30 dark:bg-muted/10"
                }`}
              >
                <div
                  className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl shadow-xs transition-colors duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none ${
                    isDragging
                      ? "bg-sapphire text-white dark:bg-sapphire-border dark:text-ink-950"
                      : "bg-sapphire-soft text-sapphire dark:bg-sapphire/20 dark:text-sapphire-light"
                  }`}
                >
                  <CameraIcon className="h-7 w-7" />
                </div>

                <h2 className="mt-3.5 text-title font-semibold text-foreground text-balance">
                  {t.dropTitle}
                </h2>

                <p className="mt-1.5 text-body leading-relaxed text-muted-foreground">
                  {t.tipLine}
                </p>

                {/* Said before the camera opens: where the photo goes, what to cover, what it costs in data. */}
                <p className="mx-auto mt-3 max-w-xl text-body leading-relaxed text-muted-foreground text-pretty">
                  {t.photoPrivacy}
                </p>

                {/* Primary interactive action buttons: clearly identifiable as buttons */}
                <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="action"
                    size="lg"
                    onClick={() => cameraInput.current?.click()}
                    className="min-h-13 w-full sm:w-auto sm:px-6"
                  >
                    <CameraIcon className="h-5 w-5 shrink-0" />
                    <span>{t.cameraCapture}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => galleryInput.current?.click()}
                    className="min-h-13 w-full dark:bg-ink-900 sm:w-auto sm:px-6"
                  >
                    <ImageIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <span>{t.galleryUpload}</span>
                  </Button>
                </div>

                <p className="mt-3 hidden text-meta text-muted-foreground lg:block">
                  {t.dragOrBrowse}
                </p>
              </div>
            )}

            {inputMode === "photo" && !preview ? errorAlert : null}

            {/* Step 2: Immediately shown in name mode, or revealed after a photo is selected */}
            {showStepTwo ? (
              <div
                ref={stepTwoRef}
                className="assistant-step-in space-y-6 border-t border-border pt-6"
              >
                {/* Photo quality status banner */}
                {inputMode === "photo" && qualityState === "warn" ? (
                  <div
                    role="status"
                    className="flex flex-col gap-3 rounded-xl border border-amber-care-border bg-amber-care-soft/60 p-4 text-left dark:border-amber-care/40 dark:bg-amber-care/15 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <p className="text-body text-foreground">{t.qualityWarning}</p>
                    <button
                      type="button"
                      onClick={() => cameraInput.current?.click()}
                      className="inline-flex min-h-11 max-w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-amber-care-border bg-card px-4 py-2 text-body font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-amber-care/50"
                    >
                      <CameraIcon className="h-4 w-4 shrink-0 text-amber-care dark:text-amber-care-border" />
                      <span>{t.retakeLight}</span>
                    </button>
                  </div>
                ) : null}

                {/* 1-tap visual reason chips + optional note. With a typed name they stay folded:
                    one field and one button are enough, the reason is an extra. */}
                {inputMode === "name" ? (
                  <details className="group">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-md text-body font-medium text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire motion-reduce:transition-none dark:hover:text-sapphire-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                      <span>{t.whyLabel}</span>
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-open:rotate-180 motion-reduce:transition-none"
                      />
                    </summary>
                    <div className="mt-3">{reasonFields}</div>
                  </details>
                ) : (
                  <div>
                    <h3 className="text-title font-semibold text-foreground">{t.whyLabel}</h3>
                    <p id="prescription-context-hint" className="mt-1 text-body text-muted-foreground">
                      {t.whyHint}
                    </p>
                    <div className="mt-3.5">{reasonFields}</div>
                  </div>
                )}

                {errorAlert}

                <div className="sticky bottom-0 z-10 -mx-5 border-t border-border bg-card/95 px-5 py-3.5 backdrop-blur-xs sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
                  <Button
                    type="submit"
                    variant="action"
                    size="lg"
                    disabled={isSubmitting || (inputMode === "name" ? !medicineName.trim() : !file)}
                    className="min-h-13 w-full sm:w-auto sm:px-7"
                  >
                    <span className="min-w-0 truncate">
                      {isSubmitting
                        ? inputMode === "name"
                          ? t.nameReviewing
                          : t.reviewing
                        : inputMode === "name"
                          ? t.nameSubmit
                          : t.reviewButton}
                    </span>
                    {!isSubmitting ? <ArrowRightSvg /> : null}
                  </Button>

                  {/* Honest progress: a calm indeterminate line, no fake percentages or scanning effects. */}
                  <div role="status" aria-live="polite" className={isSubmitting ? "mt-3" : ""}>
                    {isSubmitting ? (
                      <>
                        <div className="h-1.5 w-full overflow-hidden rounded-md bg-muted sm:max-w-xs" aria-hidden="true">
                          <div className="assistant-reading-bar h-full w-2/5 rounded-md bg-sapphire dark:bg-sapphire-border" />
                        </div>
                        <p className="mt-2 text-body text-muted-foreground">{t.reviewingHint}</p>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </form>
        </section>
          </div>

          <div className="min-w-0 space-y-6 lg:col-span-7">
        {isSubmitting && !result ? (
          <section
            aria-label={t.skeletonHeading}
            className="rounded-2xl border border-border bg-card p-5 shadow-xs print:hidden sm:p-8"
          >
            <p className="text-body font-semibold text-foreground">{t.skeletonHeading}</p>
            <div className="mt-4 space-y-3" aria-hidden="true">
              {[0, 1].map((row) => (
                <div
                  key={row}
                  style={{ "--i": row } as CSSProperties}
                  className="list-in rounded-xl border border-border bg-background p-4 sm:p-5"
                >
                  {/* Name and strength, purpose line, then the four times of day: the card that is coming. */}
                  <div className="flex items-baseline gap-2.5">
                    <div className="skeleton-sheen h-5 w-2/5" />
                    <div className="skeleton-sheen h-4 w-14" />
                  </div>
                  <div className="skeleton-sheen mt-2.5 h-3.5 w-4/5" />
                  <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {[0, 1, 2, 3].map((slot) => (
                      <div key={slot} className="skeleton-sheen h-16" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {result && resultState === "ok" ? (
          <>
            {/* On phones the result is not boxed: the medicine card inside keeps the full width. */}
            <section
              ref={resultSectionRef}
              className="assistant-step-in scroll-mt-24 sm:rounded-2xl sm:border sm:border-border sm:bg-card sm:p-8 sm:shadow-xs"
            >
              <PrescriptionStructuredResult
                mode={submittedMode}
                aiMessage={result.message}
                prescriptionText={result.prescriptionText}
                medicines={result.medicines}
                sourceKind={result.sourceKind}
                confidenceScore={result.confidenceScore}
                confidenceReason={result.confidenceReason}
                emergency={resultIsEmergency}
                nameNotice={typedNameNotice}
                rules={safetyRules}
              />
            </section>

            <div className="print:hidden">
              <Button type="button" variant="outline" size="lg" onClick={handleCheckAnother}>
                <span>{t.checkAnother}</span>
              </Button>
            </div>
          </>
        ) : null}

        {/* The typed name is not a medicine we can identify: say so, and never show a guess. */}
        {result && resultState === "notFound" ? (
          <section ref={resultSectionRef} role="status" className={`scroll-mt-24 print:hidden ${resultCardClass}`}>
            <h2 className="text-section text-foreground text-balance">{t.notFoundTitle}</h2>
            <p className="mt-2 max-w-xl text-body leading-relaxed text-muted-foreground">{t.notFoundBody}</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button type="button" variant="outline" size="lg" onClick={() => switchModeAndShowForm("photo")}>
                <CameraIcon className="h-5 w-5 shrink-0" />
                <span>{t.modePhoto}</span>
              </Button>
              <Button href={withLangPrefix("/find-help", lang)} variant="outline" size="lg">
                <span>{pharmacyLinks.nav}</span>
              </Button>
            </div>
          </section>
        ) : null}

        {/* A photo nothing could be read from: no result frame, two ways forward. */}
        {result && resultState === "unreadable" ? (
          <section ref={resultSectionRef} role="status" className={`scroll-mt-24 print:hidden ${resultCardClass}`}>
            <p className="max-w-xl text-body font-medium leading-relaxed text-foreground">
              {t.reviewErr}
              {askPersonLink}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button type="button" variant="outline" size="lg" onClick={() => cameraInput.current?.click()}>
                <CameraIcon className="h-5 w-5 shrink-0" />
                <span>{t.retakeLight}</span>
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => switchModeAndShowForm("name")}>
                <SearchIcon className="h-5 w-5 shrink-0" />
                <span>{t.modeName}</span>
              </Button>
            </div>
          </section>
        ) : null}
          {/* Shown until an answer arrives: the result repeats the same rules in its own place. */}
          {resultState !== "ok" ? (
            <section className="rounded-2xl border border-border bg-card p-5 shadow-xs print:hidden sm:p-6">
              <h2 className="text-balance text-body font-semibold text-foreground">
                {assistantCopy.rx.rulesHeading}
              </h2>
              <ol className="mt-4 list-decimal space-y-3 pl-5 text-body text-muted-foreground marker:font-medium marker:text-sapphire marker:tabular-nums dark:marker:text-sapphire-border">
                {safetyRules.map((rule) => (
                  <li key={rule} className="pl-1">
                    {rule}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
          </div>
        </div>
      </Container>
    </main>
  );
}
