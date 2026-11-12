"use client";

import { useRecaptcha } from "@/components/security/RecaptchaProvider";
/* eslint-disable @next/next/no-img-element -- preview is an object URL from user file */

import { useEffect, useRef, useState } from "react";
import { AlertCircleIcon, CameraIcon, CheckCircleIcon, ImageIcon, TrashIcon } from "@/components/ui/icons";
import { AssistantNavigation } from "@/components/health-assistant/AssistantNavigation";
import { PrescriptionStructuredResult } from "@/components/health-assistant/PrescriptionStructuredResult";
import { useLargeText, useReadAloud } from "@/components/health-check/readingTools";
import { Container } from "@/components/ui/Container";
import type { PrescribedMedicineItem } from "@/lib/health-assistant";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

type ReviewResponse = {
  message: string;
  prescriptionText?: string;
  medicines?: PrescribedMedicineItem[];
  urgency?: "emergency" | "routine";
  careLevel?: "emergency" | "urgent" | "soon" | "routine";
};

type ReasonChipKey = "feverPain" | "coughCold" | "heartBp" | "stomach" | "child" | "notSure";

const REASON_ORDER: ReasonChipKey[] = ["feverPain", "coughCold", "heartBp", "stomach", "child", "notSure"];

interface PrescriptionReviewCopy {
  title: string;
  subtitle: string;
  listenPage: string;
  stopListening: string;
  largeTextLabel: string;
  stepOneBadge: string;
  dropTitle: string;
  cameraCapture: string;
  galleryUpload: string;
  removePhoto: string;
  photoReady: string;
  retakeLight: string;
  guidanceHeading: string;
  dragOrBrowse: string;
  tipFlat: string;
  tipLight: string;
  tipFull: string;
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
  reviewErr: string;
  rateLimitErr: string;
  previewAlt: string;
}

class ReadError extends Error {}

/* Tip icons share one grid (24px), one stroke weight and one color so the row reads as a set. */
const tipIconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  className: "h-5 w-5 shrink-0",
};

function TipFlatIcon() {
  return (
    <svg {...tipIconProps}>
      <path d="M6 8h12l2.5 9h-17L6 8Z" />
      <path d="M8.5 11.5h5M8 14h8" />
      <path d="M2 20h20" />
    </svg>
  );
}

function TipLightIcon() {
  return (
    <svg {...tipIconProps}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
    </svg>
  );
}

function TipFullIcon() {
  return (
    <svg {...tipIconProps}>
      <path d="M3 7.5V5a2 2 0 0 1 2-2h2.5M16.5 3H19a2 2 0 0 1 2 2v2.5M21 16.5V19a2 2 0 0 1-2 2h-2.5M7.5 21H5a2 2 0 0 1-2-2v-2.5" />
      <path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4" />
    </svg>
  );
}

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

function SpeakerHeaderSvg() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0">
      <path
        d="M4 7.75h2.8L10.75 4.5v11L6.8 12.25H4a1 1 0 0 1-1-1v-2.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 7.5a3.4 3.4 0 0 1 0 5M15.6 5.5a6.2 6.2 0 0 1 0 9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowRightSvg() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0">
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
  const { lang } = useLanguage();
  const [largeText, toggleLargeText] = useLargeText();
  const voice = useReadAloud(lang);

  const dict: Record<Lang, PrescriptionReviewCopy> = {
  ru: {
"listenPage": "Слушать",
"stopListening": "Стоп",
"largeTextLabel": "Крупнее",
"stepOneBadge": "Шаг 1 из 2",
"photoReady": "Фото готово",
"retakeLight": "Переснять при хорошем освещении",
"guidanceHeading": "Как сделать чёткое фото",
"dragOrBrowse": "или перетащите фото сюда (JPEG, PNG или WebP)",
"stepTwoBadge": "Шаг 2 из 2",
"reasons": {"feverPain":"Температура или боль","coughCold":"Кашель или простуда","heartBp":"Сердце или давление","stomach":"Желудок или пищеварение","child":"Для ребёнка","notSure":"Не знаю"},
"noteLabel": "Или кратко опишите своими словами (необязательно)",













"removePhoto": "Удалить фото",
"tipFlat": "Положите лист ровно на стол",
"tipLight": "Используйте дневной свет без бликов вспышки",
"tipFull": "Сфотографируйте всю страницу и названия лекарств",
"skeletonHeading": "Подготовка понятного объяснения…",

      title: "Обзор рецепта",
      subtitle: "Сфотографируйте свой рецепт. Ассистент читает текст и объясняет его простыми словами. Всегда уточняйте это у своего фармацевта или врача.",
      dropTitle: "Сфотографируйте свой рецепт.",
      cameraCapture: "Сфотографироваться",
      galleryUpload: "Выбрать из галереи",

      qualityWarning:
        "Фотография выглядит немного темной или размытой. Попробуйте еще раз при дневном свете, чтобы текст легко читался.",
      whyLabel: "Почему это было предписано? (необязательно)",
      whyHint: "Это помогает ассистенту понять рецепт. Вам не обязательно знать диагноз.",
      whyPh: "Например: у меня это появилось после визита к врачу по поводу боли в горле и температуры…",
      reviewButton: "Прочтите рецепт",
      reviewing: "Читая ваш рецепт…",
      reviewingHint: "Это может занять до минуты. Держите эту страницу открытой.",
      uploadReqErr: "Чтобы продолжить, сделайте или загрузите фотографию вашего рецепта.",
      fileErr: "Выберите изображение в формате JPEG, PNG или WebP размером менее 8 МБ.",
      readErr: "Нам не удалось прочитать этот файл изображения. Попробуйте другое фото.",
      reviewErr: "Мы не смогли прочитать этот рецепт. Пожалуйста, повторите попытку через несколько минут.",
      rateLimitErr: "Слишком много запросов за короткое время. Пожалуйста, подождите немного и повторите попытку.",
      previewAlt: "Фотография выбранного вами рецепта",
    },

    en: {
      title: "Prescription review",
      subtitle:
        "Photograph your prescription and we explain it clearly. Always check with your pharmacist or doctor.",
      listenPage: "Listen",
      stopListening: "Stop",
      largeTextLabel: "Larger text",
      stepOneBadge: "Step 1 of 2",
      dropTitle: "Add your prescription",
      cameraCapture: "Take a photo",
      galleryUpload: "Choose a photo",
      removePhoto: "Remove photo",
      photoReady: "Photo is ready",
      retakeLight: "Take another photo in good light",
      guidanceHeading: "Tips for a clear photo",
      dragOrBrowse: "or drag your photo here (JPEG, PNG or WebP)",
      tipFlat: "Lay it flat",
      tipLight: "Use daylight",
      tipFull: "Show the whole page",
      skeletonHeading: "Preparing clear explanation…",
      qualityWarning:
        "The photo looks a little dark or blurry. Try again in daylight so the text is easy to read.",
      stepTwoBadge: "Step 2 of 2",
      whyLabel: "Why was this prescribed? (optional)",
      whyHint: "Tap what fits, or go straight to reading the prescription. No typing needed.",
      reasons: {
        feverPain: "Fever or pain",
        coughCold: "Cough or cold",
        heartBp: "Heart or blood pressure",
        stomach: "Stomach or digestion",
        child: "For a child",
        notSure: "Not sure",
      },
      noteLabel: "Or write briefly in your own words (optional)",
      whyPh: "For example: I got it after a doctor's visit for a sore throat and fever…",
      reviewButton: "Read and explain prescription",
      reviewing: "Reading your prescription…",
      reviewingHint: "This can take up to a minute. Keep this page open.",
      uploadReqErr: "Take or upload a photo of your prescription to continue.",
      fileErr: "Choose a JPEG, PNG or WebP image smaller than 8 MB.",
      readErr: "We could not read that image file. Try another photo.",
      reviewErr: "We could not read this prescription. Please try again in a few minutes.",
      rateLimitErr: "Too many requests in a short time. Please wait a little and try again.",
      previewAlt: "Photo of the prescription you selected",
    },
    ro: {
      title: "Verificarea rețetei",
      subtitle:
        "Fă o poză rețetei și ți-o explicăm pe înțeles. Verifică mereu cu farmacistul sau medicul.",
      listenPage: "Ascultă",
      stopListening: "Oprește",
      largeTextLabel: "Scris mai mare",
      stepOneBadge: "Pasul 1 din 2",
      dropTitle: "Adaugă rețeta",
      cameraCapture: "Fă o poză",
      galleryUpload: "Alege o poză",
      removePhoto: "Șterge poza",
      photoReady: "Poza este pregătită",
      retakeLight: "Fă altă poză la lumină",
      guidanceHeading: "Recomandări pentru o poză ușor de citit",
      dragOrBrowse: "sau trage poza aici (JPEG, PNG sau WebP)",
      tipFlat: "Pune foaia pe masă",
      tipLight: "Folosește lumina zilei",
      tipFull: "Prinde toată pagina",
      skeletonHeading: "Pregătim explicația pe înțeles…",
      qualityWarning:
        "Poza pare întunecată sau neclară. Încearcă din nou la lumina zilei, ca textul să se vadă bine.",
      stepTwoBadge: "Pasul 2 din 2",
      whyLabel: "De ce ai primit rețeta? (opțional)",
      whyHint: "Atinge un motiv dacă îl știi sau apasă direct pe butonul de mai jos. Nu trebuie să scrii.",
      reasons: {
        feverPain: "Durere sau febră",
        coughCold: "Tuse sau răceală",
        heartBp: "Inimă sau tensiune",
        stomach: "Stomac sau digestie",
        child: "Pentru un copil",
        notSure: "Nu știu exact",
      },
      noteLabel: "Sau scrie pe scurt cu cuvintele tale (opțional)",
      whyPh: "De exemplu: am primit rețeta după o vizită la medic pentru durere în gât și febră…",
      reviewButton: "Citește și explică rețeta",
      reviewing: "Se citește rețeta…",
      reviewingHint: "Poate dura până la un minut. Lasă pagina deschisă.",
      uploadReqErr: "Fă sau încarcă o poză a rețetei ca să continui.",
      fileErr: "Alege o imagine JPEG, PNG sau WebP mai mică de 8 MB.",
      readErr: "Nu am putut deschide poza. Încearcă altă poză.",
      reviewErr: "Nu am putut citi această rețetă. Încearcă din nou peste câteva minute.",
      rateLimitErr: "Prea multe cereri într-un timp scurt. Așteaptă puțin și încearcă din nou.",
      previewAlt: "Poza rețetei alese",
    },
    sq: {
      title: "Verifikimi i recetës",
      subtitle:
        "Fotografo recetën dhe ta shpjegojmë qartë. Kontrolloje gjithmonë me farmacistin ose mjekun.",
      listenPage: "Dëgjo",
      stopListening: "Ndalo",
      largeTextLabel: "Shkrim më i madh",
      stepOneBadge: "Hapi 1 nga 2",
      dropTitle: "Shto recetën",
      cameraCapture: "Bëj një foto",
      galleryUpload: "Zgjidh një foto",
      removePhoto: "Hiq foton",
      photoReady: "Fotoja është gati",
      retakeLight: "Bëj një foto tjetër në dritë",
      guidanceHeading: "Këshilla për një foto të qartë",
      dragOrBrowse: "ose tërhiq foton këtu (JPEG, PNG ose WebP)",
      tipFlat: "Shtrije mbi tavolinë",
      tipLight: "Përdor dritën e ditës",
      tipFull: "Përfshi gjithë faqen",
      skeletonHeading: "Po përgatitet shpjegimi i qartë…",
      qualityWarning:
        "Fotoja duket pak e errët ose e paqartë. Provo përsëri në dritë natyrale, që teksti të lexohet mirë.",
      stepTwoBadge: "Hapi 2 nga 2",
      whyLabel: "Pse të është dhënë kjo recetë? (sipas dëshirës)",
      whyHint: "Prek arsyen nëse e di, ose vazhdo direkt te leximi i recetës. Nuk ka nevojë të shkruash.",
      reasons: {
        feverPain: "Dhimbje ose temperaturë",
        coughCold: "Kollë ose ftohje",
        heartBp: "Zemër ose presion",
        stomach: "Stomak ose tretje",
        child: "Për një fëmijë",
        notSure: "Nuk jam i sigurt",
      },
      noteLabel: "Ose shkruaj shkurt me fjalët e tua (sipas dëshirës)",
      whyPh: "Për shembull: e mora pas një vizite te mjeku për dhimbje fyti dhe temperaturë…",
      reviewButton: "Lexo dhe shpjego recetën",
      reviewing: "Po lexohet receta…",
      reviewingHint: "Mund të zgjasë deri në një minutë. Mbaje faqen të hapur.",
      uploadReqErr: "Bëj ose ngarko një foto të recetës për të vazhduar.",
      fileErr: "Zgjidh një imazh JPEG, PNG ose WebP më të vogël se 8 MB.",
      readErr: "Nuk mundëm ta hapim këtë foto. Provo një foto tjetër.",
      reviewErr: "Nuk mundëm ta lexojmë këtë recetë. Provo përsëri pas pak minutash.",
      rateLimitErr: "Shumë kërkesa në pak kohë. Prit pak dhe provo përsëri.",
      previewAlt: "Foto e recetës që zgjodhe",
    },
    it: {
      title: "Revisione della ricetta",
      subtitle:
        "Fotografa la ricetta e te la spieghiamo con chiarezza. Verifica sempre con il farmacista o il medico.",
      listenPage: "Ascolta",
      stopListening: "Ferma",
      largeTextLabel: "Testo più grande",
      stepOneBadge: "Passo 1 di 2",
      dropTitle: "Aggiungi la ricetta",
      cameraCapture: "Scatta una foto",
      galleryUpload: "Scegli una foto",
      removePhoto: "Rimuovi foto",
      photoReady: "La foto è pronta",
      retakeLight: "Scatta un'altra foto alla luce",
      guidanceHeading: "Consigli per una foto chiara",
      dragOrBrowse: "oppure trascina la foto qui (JPEG, PNG o WebP)",
      tipFlat: "Stendila sul tavolo",
      tipLight: "Usa la luce del giorno",
      tipFull: "Inquadra tutta la pagina",
      skeletonHeading: "Preparazione della spiegazione chiara…",
      qualityWarning:
        "La foto sembra un po' scura o sfocata. Riprova con la luce naturale, così il testo si legge correttamente.",
      stepTwoBadge: "Passo 2 di 2",
      whyLabel: "Perché ti è stata prescritta? (facoltativo)",
      whyHint: "Tocca un motivo se lo conosci, oppure vai direttamente alla lettura. Non serve scrivere.",
      reasons: {
        feverPain: "Febbre o dolore",
        coughCold: "Tosse o raffreddore",
        heartBp: "Cuore o pressione",
        stomach: "Stomaco o digestione",
        child: "Per un bambino",
        notSure: "Non lo so di preciso",
      },
      noteLabel: "Oppure scrivi in breve con parole tue (facoltativo)",
      whyPh: "Ad esempio: l'ho ricevuta dopo una visita per mal di gola e febbre…",
      reviewButton: "Leggi e spiega la ricetta",
      reviewing: "Lettura della ricetta in corso…",
      reviewingHint: "Può richiedere fino a un minuto. Tieni aperta questa pagina.",
      uploadReqErr: "Scatta o carica una foto della ricetta per continuare.",
      fileErr: "Scegli un'immagine JPEG, PNG o WebP più piccola di 8 MB.",
      readErr: "Non siamo riusciti a leggere il file dell'immagine. Prova con un'altra foto.",
      reviewErr: "Non siamo riusciti a leggere questa ricetta. Riprova tra qualche minuto.",
      rateLimitErr: "Troppe richieste in poco tempo. Attendi un po' e riprova.",
      previewAlt: "Foto della ricetta selezionata",
    },
    hr: {
      title: "Provjera recepta",
      subtitle:
        "Fotografiraj recept i objasnit ćemo ti ga jasno. Uvijek provjeri s ljekarnikom ili liječnikom.",
      listenPage: "Poslušaj",
      stopListening: "Zaustavi",
      largeTextLabel: "Veća slova",
      stepOneBadge: "Korak 1 od 2",
      dropTitle: "Dodaj recept",
      cameraCapture: "Snimi fotografiju",
      galleryUpload: "Odaberi fotografiju",
      removePhoto: "Ukloni fotografiju",
      photoReady: "Fotografija je spremna",
      retakeLight: "Snimi drugu fotografiju na svjetlu",
      guidanceHeading: "Savjeti za jasnu fotografiju",
      dragOrBrowse: "ili povuci fotografiju ovdje (JPEG, PNG ili WebP)",
      tipFlat: "Položi ga ravno",
      tipLight: "Koristi dnevno svjetlo",
      tipFull: "Snimi cijelu stranicu",
      skeletonHeading: "Pripremamo jasno objašnjenje…",
      qualityWarning:
        "Fotografija izgleda pomalo tamno ili mutno. Pokušaj ponovno na dnevnom svjetlu kako bi tekst bio čitljiv.",
      stepTwoBadge: "Korak 2 od 2",
      whyLabel: "Zašto si dobio ili dobila ovaj recept? (nije obavezno)",
      whyHint: "Dodirni razlog ako ga znaš ili odmah kreni na čitanje recepta. Ne moraš pisati.",
      reasons: {
        feverPain: "Bol ili vrućica",
        coughCold: "Kašalj ili prehlada",
        heartBp: "Srce ili tlak",
        stomach: "Želudac ili probava",
        child: "Za dijete",
        notSure: "Nisam siguran",
      },
      noteLabel: "Ili kratko napiši svojim riječima (nije obavezno)",
      whyPh: "Na primjer: dobio sam ga nakon pregleda kod liječnika zbog grlobolje i vrućice…",
      reviewButton: "Pročitaj i objasni recept",
      reviewing: "Čitanje recepta u tijeku…",
      reviewingHint: "Ovo može potrajati do jedne minute. Ostavi ovu stranicu otvorenom.",
      uploadReqErr: "Snimi ili učitaj fotografiju recepta za nastavak.",
      fileErr: "Odaberi JPEG, PNG ili WebP sliku manju od 8 MB.",
      readErr: "Nismo uspjeli otvoriti tu slikovnu datoteku. Pokušaj s drugom fotografijom.",
      reviewErr: "Nismo uspjeli pročitati ovaj recept. Pokušaj ponovno za nekoliko minuta.",
      rateLimitErr: "Previše zahtjeva u kratkom vremenu. Pričekaj malo pa pokušaj ponovno.",
      previewAlt: "Fotografija odabranog recepta",
    },
    rom: {
      title: "Dikh i receta",
      subtitle:
        "Ker poza chire recetake thaj shpjeginas la tuke chaches. Dikh la svako data le farmacistosa vaj le doktoresa.",
      listenPage: "Ashun",
      stopListening: "Astav",
      largeTextLabel: "Maj baro ramovimos",
      stepOneBadge: "Pasho 1 katar 2",
      dropTitle: "Thov i receta",
      cameraCapture: "Ker poza",
      galleryUpload: "Alosar jekh poza",
      removePhoto: "Khos i poza",
      photoReady: "I poza si gata",
      retakeLight: "Ker aver poza ko vudud",
      guidanceHeading: "Sfaturya te avel i poza lachi",
      dragOrBrowse: "vaj thov i poza kathe (JPEG, PNG vaj WebP)",
      tipFlat: "Thov o lil pe skafidi",
      tipLight: "Hasnisar divesko vudud",
      tipFull: "Le sasti rig",
      skeletonHeading: "Pregatisaras o chacho shpjegimos…",
      qualityWarning:
        "I poza dikljol xantsi kali vaj na uzi. Zumav pale ko divesko vudud kaste ginavel pe o teksto mishto.",
      stepTwoBadge: "Pasho 2 katar 2",
      whyLabel: "Soske ljan kadaja receta? (te manges)",
      whyHint: "Azba jekh motivo te dzanes les, vaj dja sigo ko ginavimos e recetako. Na trebul te ramos.",
      reasons: {
        feverPain: "Dukh vaj tatipen",
        coughCold: "Khas vaj shil",
        heartBp: "Ilo vaj tensia",
        stomach: "Ogi vaj xabem",
        child: "Vash jekh chavoro",
        notSure: "Na dzanav chaches",
      },
      noteLabel: "Vaj ramov skurto chire vorbenca (te manges)",
      whyPh: "Misal: ljem la pala jekh drom ko doktori vash dukh and-o korr thaj tatipen…",
      reviewButton: "Ginav thaj shpjegin i receta",
      reviewing: "Ginavel pe i receta…",
      reviewingHint: "Shaj djal dji ko jekh minuto. Mekh kadaja rig puterdi.",
      uploadReqErr: "Ker vaj thov jekh poza e recetaki te djas maj dur.",
      fileErr: "Alosar jekh poza JPEG, PNG vaj WebP maj tikni katar 8 MB.",
      readErr: "Nashti phuterdas kadaja poza. Zumav aver poza.",
      reviewErr: "Nashti ginadas kadaja receta. Zumav pale pala nesave minutia.",
      rateLimitErr: "But mangimata and-o skurto vrama. Azhuker xantsi thaj zumav pale.",
      previewAlt: "Poza katar i alosardi receta",
    },
  };
  const t = dict[lang] || dict[DEFAULT_LANG];

  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const stepTwoRef = useRef<HTMLDivElement>(null);
  const resultSectionRef = useRef<HTMLElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<ReasonChipKey[]>([]);
  const [context, setContext] = useState("");
  const [result, setResult] = useState<ReviewResponse | null>(null);
  const [qualityState, setQualityState] = useState<"idle" | "checking" | "good" | "warn">("idle");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  function getScrollBehavior(): ScrollBehavior {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
    voice.speak([t.title, t.subtitle, t.tipFlat, t.tipLight, t.tipFull]);
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
    setError("");
    setResult(null);
    if (cameraInput.current) cameraInput.current.value = "";
    if (galleryInput.current) galleryInput.current.value = "";
  }

  function handleFileSelected(selected: File | null) {
    setError("");
    setResult(null);
    if (!selected) return;

    if (!selected.type.startsWith("image/") || selected.size > 8 * 1024 * 1024) {
      if (preview) URL.revokeObjectURL(preview);
      setFile(null);
      setPreview(null);
      setQualityState("idle");
      setError(t.fileErr);
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    const objectUrl = URL.createObjectURL(selected);
    setFile(selected);
    setPreview(objectUrl);
    checkImageQuality(objectUrl);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError(t.uploadReqErr);
      return;
    }

    setError("");
    setResult(null);
    setIsSubmitting(true);

    const selectedChipLabels = REASON_ORDER.filter((key) => selectedReasons.includes(key)).map(
      (key) => t.reasons[key]
    );
    const combinedPrescriptionContext = [selectedChipLabels.join(", "), context.trim()]
      .filter(Boolean)
      .join(". ");

    try {
      const prescription = await new Promise<{ mimeType: string; data: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = typeof reader.result === "string" ? reader.result : "";
          const data = dataUrl.split(",")[1];
          if (data) resolve({ mimeType: file.type, data });
          else reject(new ReadError());
        };
        reader.onerror = () => reject(new ReadError());
        reader.readAsDataURL(file);
      });

      const captchaToken = await executeCaptcha("health_assistant");
      const response = await fetch("/api/health-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prescriptionContext: combinedPrescriptionContext,
          prescription,
          lang,
          captchaToken,
        }),
      });

      // Server errors are written in English; the person always sees a message in their language.
      if (!response.ok) {
        setError(response.status === 429 ? t.rateLimitErr : t.reviewErr);
        return;
      }
      setResult((await response.json()) as ReviewResponse);
    } catch (caughtError) {
      setError(caughtError instanceof ReadError ? t.readErr : t.reviewErr);
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentStep = preview ? 2 : 1;
  const currentStepLabel = preview ? t.stepTwoBadge : t.stepOneBadge;

  return (
    <main
      id="main-content"
      className={`flex-1 pt-0.5 pb-10 sm:pt-2 sm:pb-14 ${largeText ? "hc-large-text" : ""}`}
    >
      <Container>
        <AssistantNavigation />

        <header className="max-w-3xl print:hidden">
          <h1 className="text-3xl font-semibold tracking-[-0.025em] text-foreground text-balance sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-2.5 max-w-[62ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.subtitle}
          </p>
        </header>

        <section className="mt-6 max-w-3xl rounded-2xl border border-border bg-card shadow-xs print:hidden sm:mt-8">
          <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-8" aria-busy={isSubmitting}>
            <div>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5">
                <p className="text-sm font-medium text-muted-foreground tabular-nums">
                  {currentStepLabel}
                </p>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {voice.available ? (
                    <button
                      type="button"
                      onClick={handleHeaderListen}
                      aria-pressed={voice.speaking}
                      className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
                        voice.speaking
                          ? "border-sapphire bg-sapphire-soft text-sapphire dark:border-sapphire/60 dark:bg-sapphire/20 dark:text-sapphire-border"
                          : "border-border bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      <SpeakerHeaderSvg />
                      <span>{voice.speaking ? t.stopListening : t.listenPage}</span>
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={toggleLargeText}
                    aria-pressed={largeText}
                    className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
                      largeText
                        ? "border-sapphire bg-sapphire-soft text-sapphire dark:border-sapphire/60 dark:bg-sapphire/20 dark:text-sapphire-border"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    <span aria-hidden="true" className="font-bold text-sapphire dark:text-sapphire-border">
                      A+
                    </span>
                    <span>{t.largeTextLabel}</span>
                  </button>
                </div>
              </div>

              <div
                className="mt-3 flex h-1 w-full gap-1.5"
                role="progressbar"
                aria-label={t.title}
                aria-valuenow={currentStep}
                aria-valuemin={1}
                aria-valuemax={2}
                aria-valuetext={currentStepLabel}
              >
                {[1, 2].map((segment) => (
                  <div
                    key={segment}
                    className={`h-1 flex-1 rounded-full transition-colors duration-[var(--dur-base)] ease-[var(--ease-out-calm)] ${
                      currentStep >= segment ? "bg-sapphire dark:bg-sapphire-border" : "bg-border"
                    }`}
                  />
                ))}
              </div>
            </div>

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
              accept="image/jpeg,image/png,image/webp"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
              className="sr-only"
            />

            {/* Step 1: Visual capture dropzone */}
            {preview ? (
              <div className="rounded-2xl border border-border bg-surface-subtle/30 p-5 text-center sm:p-7">
                <p className="text-sm font-semibold text-foreground">{t.photoReady}</p>

                <figure className="mt-4 flex flex-col items-center">
                  <img
                    src={preview}
                    alt={t.previewAlt}
                    className="max-h-80 w-auto rounded-xl border border-border bg-card object-contain shadow-xs"
                  />
                  {file?.name ? (
                    <figcaption className="mt-2 max-w-full truncate text-xs text-muted-foreground">
                      {file.name}
                    </figcaption>
                  ) : null}
                </figure>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => cameraInput.current?.click()}
                    className="press-row inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border-control bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire dark:bg-ink-900"
                  >
                    <CameraIcon className="h-4 w-4 shrink-0" />
                    <span>{t.retakeLight}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInput.current?.click()}
                    className="press-row inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border-control bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire dark:bg-ink-900"
                  >
                    <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{t.galleryUpload}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={isSubmitting}
                    className="press-row inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/60 px-4 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/60"
                  >
                    <TrashIcon className="h-4 w-4 shrink-0" />
                    <span>{t.removePhoto}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  handleFileSelected(event.dataTransfer.files?.[0] ?? null);
                }}
                className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors duration-[var(--dur-fast)] sm:p-8 ${
                  isDragging
                    ? "border-sapphire bg-sapphire-soft/50 dark:border-sapphire-light dark:bg-sapphire/15"
                    : "border-border-control bg-surface-subtle/30 dark:bg-muted/10"
                }`}
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sapphire-soft text-sapphire shadow-xs dark:bg-sapphire/20 dark:text-sapphire-light">
                  <CameraIcon className="h-7 w-7" />
                </div>

                <h2
                  className={`mt-3.5 font-semibold text-foreground text-balance ${
                    largeText ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
                  }`}
                >
                  {t.dropTitle}
                </h2>

                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {t.dragOrBrowse}
                </p>

                {/* Primary interactive action buttons: clearly identifiable as buttons */}
                <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => cameraInput.current?.click()}
                    className="press-row inline-flex min-h-13 w-full items-center justify-center gap-2.5 rounded-xl bg-sapphire px-6 py-3.5 text-base font-semibold text-white shadow-xs transition-colors duration-[var(--dur-fast)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire active:scale-[0.98] motion-reduce:active:scale-100 sm:w-auto"
                  >
                    <CameraIcon className="h-5 w-5 shrink-0" />
                    <span>{t.cameraCapture}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInput.current?.click()}
                    className="press-row inline-flex min-h-13 w-full items-center justify-center gap-2.5 rounded-xl border border-border-control bg-card px-6 py-3.5 text-base font-semibold text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire active:scale-[0.98] motion-reduce:active:scale-100 dark:bg-ink-900 sm:w-auto"
                  >
                    <ImageIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <span>{t.galleryUpload}</span>
                  </button>
                </div>

                {/* Informational Guidance Box: clearly labeled and non-interactive */}
                <div className="mt-6 rounded-xl border border-sapphire-border/40 bg-card/85 p-4 text-left shadow-2xs dark:border-white/10 dark:bg-ink-900/60 sm:p-4.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sapphire-soft text-sapphire dark:bg-sapphire/20 dark:text-sapphire-light">
                      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3" aria-hidden="true">
                        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 3.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm1.25 7.25h-2.5a.75.75 0 0 1 0-1.5h.5V7.75h-.5a.75.75 0 0 1 0-1.5h1.75a.75.75 0 0 1 .75.75v3.25h.5a.75.75 0 0 1 0 1.5Z" />
                      </svg>
                    </span>
                    <p className="text-xs font-semibold text-foreground sm:text-sm">
                      {t.guidanceHeading}
                    </p>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-sapphire dark:bg-white/10 dark:text-sapphire-light">
                        <TipFlatIcon />
                      </span>
                      <span className="text-xs leading-snug text-muted-foreground sm:text-sm">
                        {t.tipFlat}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-sapphire dark:bg-white/10 dark:text-sapphire-light">
                        <TipLightIcon />
                      </span>
                      <span className="text-xs leading-snug text-muted-foreground sm:text-sm">
                        {t.tipLight}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-sapphire dark:bg-white/10 dark:text-sapphire-light">
                        <TipFullIcon />
                      </span>
                      <span className="text-xs leading-snug text-muted-foreground sm:text-sm">
                        {t.tipFull}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && !preview ? (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-amber-care-border bg-amber-care-soft/60 p-3.5 text-sm font-medium leading-relaxed text-foreground dark:border-amber-care/40 dark:bg-amber-care/15"
              >
                <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-care dark:text-amber-care-border" />
                <span>{error}</span>
              </div>
            ) : null}

            {/* Step 2: Revealed smoothly ONLY after a photo is selected */}
            {preview ? (
              <div
                ref={stepTwoRef}
                className="assistant-step-in space-y-6 border-t border-border pt-6"
              >
                {/* Photo quality status banner */}
                {qualityState === "warn" ? (
                  <div
                    role="status"
                    className="flex flex-col gap-3 rounded-xl border border-amber-care-border bg-amber-care-soft/60 p-4 text-left dark:border-amber-care/40 dark:bg-amber-care/15 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <p className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground">
                      <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-care dark:text-amber-care-border" />
                      <span>{t.qualityWarning}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => cameraInput.current?.click()}
                      className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-amber-care-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire dark:border-amber-care/50"
                    >
                      <CameraIcon className="h-4 w-4 text-amber-care dark:text-amber-care-border" />
                      <span>{t.retakeLight}</span>
                    </button>
                  </div>
                ) : qualityState === "good" ? (
                  <div
                    role="status"
                    className="inline-flex items-center gap-2 rounded-full border border-live-sage/35 bg-live-sage/12 px-3.5 py-1.5 text-sm font-semibold text-foreground"
                  >
                    <CheckCircleIcon className="h-4 w-4 shrink-0 text-live-sage" />
                    <span>{t.photoReady}</span>
                  </div>
                ) : null}

                {/* 1-tap visual reason chips + optional note */}
                <div>
                  <h3
                    className={`font-semibold text-foreground ${
                      largeText ? "text-lg sm:text-xl" : "text-base sm:text-lg"
                    }`}
                  >
                    {t.whyLabel}
                  </h3>
                  <p
                    id="prescription-context-hint"
                    className={`mt-1 text-muted-foreground ${largeText ? "text-base" : "text-sm"}`}
                  >
                    {t.whyHint}
                  </p>

                  <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {REASON_ORDER.map((reasonKey) => {
                      const active = selectedReasons.includes(reasonKey);
                      return (
                        <button
                          key={reasonKey}
                          type="button"
                          onClick={() => toggleReasonChip(reasonKey)}
                          aria-pressed={active}
                          className={`flex min-h-11 items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left font-medium transition-colors duration-[var(--dur-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
                            largeText ? "text-base" : "text-sm"
                          } ${
                            active
                              ? "border-sapphire bg-sapphire-soft font-semibold text-foreground dark:border-sapphire/65 dark:bg-sapphire/20 dark:text-foreground"
                              : "border-border bg-background text-foreground hover:bg-muted"
                          }`}
                        >
                          <span
                            className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                              active
                                ? "bg-sapphire text-white"
                                : "bg-surface-subtle text-sapphire dark:bg-muted dark:text-sapphire-border"
                            }`}
                          >
                            <ReasonChipIcon reason={reasonKey} />
                          </span>
                          <span className="flex-1 leading-snug">{t.reasons[reasonKey]}</span>
                          {active ? (
                            <CheckCircleIcon className="h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <label
                      className={`block font-medium text-muted-foreground ${
                        largeText ? "text-sm" : "text-xs sm:text-sm"
                      }`}
                      htmlFor="prescription-context"
                    >
                      {t.noteLabel}
                    </label>
                    <textarea
                      id="prescription-context"
                      aria-describedby="prescription-context-hint"
                      rows={2}
                      maxLength={4000}
                      value={context}
                      onChange={(event) => setContext(event.target.value)}
                      placeholder={t.whyPh}
                      className={`mt-1.5 w-full resize-none rounded-lg border border-border bg-background p-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
                        largeText ? "text-base" : "text-sm"
                      }`}
                    />
                  </div>
                </div>

                {error ? (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-lg border border-amber-care-border bg-amber-care-soft/60 p-3.5 text-sm font-medium leading-relaxed text-foreground dark:border-amber-care/40 dark:bg-amber-care/15"
                  >
                    <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-care dark:text-amber-care-border" />
                    <span>{error}</span>
                  </div>
                ) : null}

                <div className="sticky bottom-0 z-10 -mx-5 border-t border-border bg-card/95 px-5 py-3.5 backdrop-blur-xs sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
                  <button
                    type="submit"
                    disabled={isSubmitting || !file}
                    className="inline-flex min-h-13 w-full items-center justify-center gap-2.5 rounded-xl bg-sapphire px-7 py-3 text-base font-semibold text-white shadow-xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground sm:w-auto"
                  >
                    <span>{isSubmitting ? t.reviewing : t.reviewButton}</span>
                    {!isSubmitting ? <ArrowRightSvg /> : null}
                  </button>

                  {/* Honest progress: a calm indeterminate line, no fake percentages or scanning effects. */}
                  <div role="status" aria-live="polite" className={isSubmitting ? "mt-3" : ""}>
                    {isSubmitting ? (
                      <>
                        <div className="h-1.5 w-full overflow-hidden rounded-md bg-muted sm:max-w-xs" aria-hidden="true">
                          <div className="assistant-reading-bar h-full w-2/5 rounded-md bg-sapphire dark:bg-sapphire-border" />
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{t.reviewingHint}</p>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </form>
        </section>

        {isSubmitting && !result ? (
          <section
            aria-label={t.skeletonHeading}
            className="mt-6 max-w-3xl rounded-2xl border border-border bg-card p-5 shadow-xs print:hidden sm:p-8"
          >
            <p className="text-sm font-semibold text-foreground">{t.skeletonHeading}</p>
            <div className="mt-4 space-y-3" aria-hidden="true">
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  className="animate-pulse rounded-lg border border-border bg-background p-4 motion-reduce:animate-none"
                >
                  <div className="h-4 w-2/5 rounded-md bg-muted" />
                  <div className="mt-2.5 h-3.5 w-full rounded-md bg-muted/80" />
                  <div className="mt-2 h-3.5 w-4/5 rounded-md bg-muted/70" />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {result && (
          <section
            ref={resultSectionRef}
            className="assistant-step-in mt-6 max-w-3xl rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-8"
          >
            <PrescriptionStructuredResult
              aiMessage={result.message}
              prescriptionText={result.prescriptionText}
              medicines={result.medicines}
              emergency={result.urgency === "emergency" || result.careLevel === "emergency"}
            />
          </section>
        )}
      </Container>
    </main>
  );
}
