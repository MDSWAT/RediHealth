import { Resend } from "resend";
import type { TreatmentPlan } from "@/lib/types/patient";
import { getTreatmentEntries, sortTreatments } from "@/lib/treatments";
import type { Lang } from "@/lib/i18n/translations";
import type { CountryCode } from "@/lib/countries";
import { portalPath } from "@/lib/security/portal-token";
import { escapeHtml } from "@/lib/text";
import { LEGAL_OPERATOR } from "@/lib/legal-config";
import { emailTranslations, helpReplyContent, type HelpReplyInput } from "@/lib/i18n/email-translations";
import { withLangPrefix } from "@/lib/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";

type PanelEmailCopy = {
  greeting: string;
  teamName: string;
  footerBrand: string;
  footerContactLead: string;
  footerContactLink: string;
  patientFallbackName: string;
  emergencyHeading: string;
  emergencyText: string;
  portal: {
    subject: string;
    preview: string;
    badge: string;
    heading: string;
    intro: string;
    textIntro: string;
    cta: string;
    linkDuration: string;
    conditionSummary: string;
    portalDetailsHeading: string;
    portalDetails: [string, string, string, string];
    fallbackName: string;
    treatmentPlan: string;
    datesNotRecorded: string;
    diagnosis: string;
    medications: string;
    careInstructions: string;
    footerReason: string;
  };
  meeting: {
    subject: string;
    preview: (title: string) => string;
    badge: string;
    heading: string;
    intro: string;
    textInvitation: (title: string) => string;
    cta: string;
    appointment: string;
    joinText: string;
    closing: string;
    footerReason: string;
  };
};

const panelEmailCopy: Record<Lang, PanelEmailCopy> = {
  ru: {
    greeting: "Здравствуйте",
    teamName: "Команда RediHealth",
    footerBrand: "RediHealth — Поддержка здравоохранения и портал пациентов",
    footerContactLead: "Вопросы или отзывы?",
    footerContactLink: "Обратиться в службу поддержки",
    patientFallbackName: "Пациент",
    emergencyHeading: "Экстренное уведомление:",
    emergencyText: "RediHealth не является службой экстренной помощи. При угрозе жизни немедленно звоните по номеру 112.",
    portal: {
      subject: "Ваш портал пациентов RediHealth и ссылка на план медицинского обслуживания",
      preview: "Ваш портал пациентов RediHealth готов.",
      badge: "Портал для пациентов",
      heading: "Ваш медицинский портал готов",
      intro: "Ваш личный портал пациента теперь активен. Получите доступ к своему профилю, чтобы просмотреть инструкции по уходу, сообщить о симптомах и связаться со своей командой по уходу.",
      textIntro: "Ваш профиль пациента RediHealth и доступ к порталу готовы! Вы можете просмотреть свой медицинский профиль, заметки о состоянии, инструкции по уходу, сообщить о новых симптомах, добавить фотографии и запросить дальнейшее наблюдение, используя личную ссылку:",
      cta: "Открыть портал пациента",
      linkDuration: "Эта безопасная ссылка на портал действительна в течение 90 дней. После этого (или если вы потеряете ее) запросите новую ссылку на странице входа в RediHealth.",
      conditionSummary: "Краткое описание состояния/симптомов",
      portalDetailsHeading: "На вашем портале для пациентов",
      portalDetails: [
        "Просмотр инструкций по диагностике и плану ухода",
        "Сообщайте о новых симптомах и отслеживайте уровень срочности",
        "Планируйте и посещайте последующие видеовизиты",
        "Загрузите медицинские фотографии или соответствующие медицинские документы.",
      ],
      fallbackName: "Ценный клиент",
      treatmentPlan: "План лечения",
      datesNotRecorded: "Даты не записаны",
      diagnosis: "Диагностика",
      medications: "Лекарства/терапия",
      careInstructions: "Рекомендации по уходу",
      footerReason: "Вы получили это письмо, поскольку для вас на RediHealth был создан профиль пациента.",
    },
    meeting: {
      subject: "Приглашение",
      preview: (title: string) => `Видео-приглашение на встречу: ${title}`,
      badge: "Видео встреча",
      heading: "Вас приглашают на видео-посещение",
      intro: "Запланирована видеоконсультация с вашей медицинской группой поддержки. Когда придет время встречи, нажмите кнопку ниже, чтобы присоединиться прямо в браузере.",
      textInvitation: (title) => `Вас пригласили на видео-встречу RediHealth: ${title}.`,
      cta: "Присоединяйтесь к видеопосещению",
      appointment: "Запланированная встреча",
      joinText: "Присоединяйтесь к встрече по адресу:",
      closing: "Если вам нужна помощь в подключении, обратитесь к своему медицинскому персоналу.",
      footerReason: "Вы получили это электронное письмо, поскольку на RediHealth для вас была назначена встреча.",
    },
  },

  en: {
    greeting: "Hello",
    teamName: "The RediHealth team",
    footerBrand: "RediHealth — Healthcare support and patient portal",
    footerContactLead: "Questions or feedback?",
    footerContactLink: "Contact support",
    patientFallbackName: "Patient",
    emergencyHeading: "Emergency notice:",
    emergencyText: "RediHealth is not an emergency response service. If you are experiencing a life-threatening medical emergency, please call 112 immediately.",
    portal: {
      subject: "Your RediHealth patient portal and care plan link",
      preview: "Your RediHealth patient portal is ready.",
      badge: "Patient portal",
      heading: "Your medical portal is ready",
      intro: "Your personal patient portal is now active. Access your profile to review your care instructions, report symptoms, and connect with your care team.",
      textIntro: "Your RediHealth patient profile and portal access are ready. You can view your medical profile, condition notes, care instructions, report new symptoms, add photos, and request follow-ups using your personal link:",
      cta: "Open patient portal",
      linkDuration: "This secure portal link is valid for 90 days. After that, or if you lose it, request a new link from the RediHealth sign-in page.",
      conditionSummary: "Condition and symptoms summary",
      portalDetailsHeading: "In your patient portal",
      portalDetails: [
        "View diagnosis and care plan directives",
        "Report new symptoms and monitor urgency level",
        "Schedule and attend follow-up video visits",
        "Upload medical photos or relevant health documents",
      ],
      fallbackName: "Valued patient",
      treatmentPlan: "Treatment plan",
      datesNotRecorded: "Dates not recorded",
      diagnosis: "Diagnosis",
      medications: "Medications / therapies",
      careInstructions: "Care directives",
      footerReason: "You received this email because a patient profile was created for you on RediHealth.",
    },
    meeting: {
      subject: "Invitation",
      preview: (title: string) => `Video appointment invitation: ${title}`,
      badge: "Video appointment",
      heading: "You're invited to a video visit",
      intro: "A video consultation has been scheduled with your healthcare support team. When it is time for your appointment, tap the button below to join directly in your browser.",
      textInvitation: (title) => `You have been invited to a RediHealth video appointment: ${title}.`,
      cta: "Join video visit",
      appointment: "Scheduled appointment",
      joinText: "Join the meeting at:",
      closing: "If you need help connecting, please contact your healthcare team.",
      footerReason: "You received this email because an appointment was scheduled for you on RediHealth.",
    },
  },
  ro: {
    greeting: "Bună",
    teamName: "Echipa RediHealth",
    footerBrand: "RediHealth — Asistență medicală și portalul pacientului",
    footerContactLead: "Întrebări sau sugestii?",
    footerContactLink: "Contactează echipa de asistență",
    patientFallbackName: "Pacient",
    emergencyHeading: "Notă privind urgențele:",
    emergencyText: "RediHealth nu este un serviciu de intervenție în caz de urgență. Dacă te confrunți cu o urgență medicală care îți pune viața în pericol, sună imediat la 112.",
    portal: {
      subject: "Linkul către portalul și planul tău de îngrijire RediHealth",
      preview: "Portalul tău RediHealth este pregătit.",
      badge: "Portalul pacientului",
      heading: "Portalul tău medical este pregătit",
      intro: "Portalul tău personal de pacient este activ. Accesează-ți profilul pentru a consulta recomandările de îngrijire, a raporta simptome și a lua legătura cu echipa medicală.",
      textIntro: "Profilul tău RediHealth și accesul la portal sunt pregătite! Îți poți consulta profilul medical, notele despre afecțiune, recomandările de îngrijire, poți raporta simptome noi, adăuga fotografii și solicita consultații de urmărire folosind linkul personal:",
      cta: "Deschide portalul pacientului",
      linkDuration: "Acest link securizat către portal este valabil 90 de zile. După aceea, sau dacă îl pierzi, poți solicita un link nou din pagina de autentificare RediHealth.",
      conditionSummary: "Rezumatul afecțiunii și simptomelor",
      portalDetailsHeading: "În portalul pacientului poți",
      portalDetails: [
        "Consulta diagnosticul și recomandările din planul de îngrijire",
        "Raporta simptome noi și urmări nivelul de urgență",
        "Programa și participa la consultații video de urmărire",
        "Încărca fotografii medicale sau documente relevante",
      ],
      fallbackName: "Stimată persoană",
      treatmentPlan: "Plan de tratament",
      datesNotRecorded: "Date neînregistrate",
      diagnosis: "Diagnostic",
      medications: "Medicamente / terapii",
      careInstructions: "Recomandări de îngrijire",
      footerReason: "Primești acest email deoarece a fost creat un profil de pacient RediHealth pentru tine.",
    },
    meeting: {
      subject: "Invitație",
      preview: (title: string) => `Invitație la consultația video: ${title}`,
      badge: "Consultație video",
      heading: "Ești invitat(ă) la o consultație video",
      intro: "Echipa medicală a programat o consultație video. La ora programării, apasă butonul de mai jos pentru a participa direct din browser.",
      textInvitation: (title) => `Ai fost invitat(ă) la o consultație video RediHealth: ${title}.`,
      cta: "Participă la consultația video",
      appointment: "Consultație programată",
      joinText: "Accesează întâlnirea aici:",
      closing: "Dacă ai nevoie de ajutor pentru conectare, contactează echipa medicală.",
      footerReason: "Primești acest email deoarece a fost programată o consultație RediHealth pentru tine.",
    },
  },
  sq: {
    greeting: "Përshëndetje",
    teamName: "Ekipi i RediHealth",
    footerBrand: "RediHealth — Mbështetje shëndetësore dhe portali i pacientit",
    footerContactLead: "Pyetje ose komente?",
    footerContactLink: "Kontakto mbështetjen",
    patientFallbackName: "Pacient",
    emergencyHeading: "Njoftim për urgjencat:",
    emergencyText: "RediHealth nuk është shërbim i urgjencës. Nëse po përjetoni një urgjencë mjekësore kërcënuese për jetën, telefononi menjëherë 112.",
    portal: {
      subject: "Lidhja për portalin dhe planin tuaj të kujdesit RediHealth",
      preview: "Portali juaj RediHealth është gati.",
      badge: "Portali i pacientit",
      heading: "Portali juaj mjekësor është gati",
      intro: "Portali juaj personal i pacientit është aktiv. Hyni në profilin tuaj për të parë udhëzimet e kujdesit, për të raportuar simptoma dhe për t'u lidhur me ekipin tuaj të kujdesit.",
      textIntro: "Profili juaj i pacientit dhe qasja në portalin RediHealth janë gati! Mund të shikoni profilin mjekësor, shënimet për gjendjen dhe udhëzimet e kujdesit, të raportoni simptoma të reja, të shtoni fotografi dhe të kërkoni vizita pasuese përmes lidhjes suaj personale:",
      cta: "Hap portalin e pacientit",
      linkDuration: "Kjo lidhje e sigurt e portalit është e vlefshme për 90 ditë. Pas kësaj, ose nëse e humb, mund të kërkosh një lidhje të re nga faqja e identifikimit në RediHealth.",
      conditionSummary: "Përmbledhje e gjendjes / simptomave",
      portalDetailsHeading: "Në portalin tuaj të pacientit",
      portalDetails: [
        "Shikoni diagnozën dhe udhëzimet e planit të kujdesit",
        "Raportoni simptoma të reja dhe ndiqni nivelin e urgjencës",
        "Planifikoni dhe merrni pjesë në vizita video pasuese",
        "Ngarkoni fotografi mjekësore ose dokumente përkatëse shëndetësore",
      ],
      fallbackName: "Klient i nderuar",
      treatmentPlan: "Plani i trajtimit",
      datesNotRecorded: "Datat nuk janë regjistruar",
      diagnosis: "Diagnoza",
      medications: "Medikamente / terapi",
      careInstructions: "Udhëzime për kujdesin",
      footerReason: "E morët këtë email sepse u krijua një profil pacienti RediHealth për ju.",
    },
    meeting: {
      subject: "Ftesë",
      preview: (title: string) => `Ftesë për takim me video: ${title}`,
      badge: "Takim me video",
      heading: "Jeni të ftuar në një vizitë me video",
      intro: "Është planifikuar një konsultë me video me ekipin tuaj shëndetësor. Kur të vijë koha e takimit, shtypni butonin më poshtë për t'u bashkuar drejtpërdrejt nga shfletuesi.",
      textInvitation: (title) => `Jeni të ftuar në një takim me video RediHealth: ${title}.`,
      cta: "Bashkohu në vizitën me video",
      appointment: "Takim i planifikuar",
      joinText: "Bashkohuni në takim këtu:",
      closing: "Nëse keni nevojë për ndihmë për t'u lidhur, kontaktoni ekipin tuaj shëndetësor.",
      footerReason: "E morët këtë email sepse u planifikua një takim RediHealth për ju.",
    },
  },
  it: {
    greeting: "Buongiorno",
    teamName: "Il team RediHealth",
    footerBrand: "RediHealth — Supporto sanitario e portale del paziente",
    footerContactLead: "Domande o suggerimenti?",
    footerContactLink: "Contatta l'assistenza",
    patientFallbackName: "Paziente",
    emergencyHeading: "Avviso di emergenza:",
    emergencyText: "RediHealth non è un servizio di emergenza. In caso di emergenza medica potenzialmente letale, chiama immediatamente il 112.",
    portal: {
      subject: "Il link al portale paziente e al piano di cura RediHealth",
      preview: "Il tuo portale paziente RediHealth è pronto.",
      badge: "Portale paziente",
      heading: "Il tuo portale medico è pronto",
      intro: "Il tuo portale personale è attivo. Accedi al tuo profilo per consultare le indicazioni di cura, segnalare sintomi e contattare il tuo team sanitario.",
      textIntro: "Il tuo profilo paziente RediHealth e l'accesso al portale sono pronti! Puoi consultare il profilo medico, le note sulla condizione e le indicazioni di cura, segnalare nuovi sintomi, aggiungere foto e richiedere visite di controllo tramite il tuo link personale:",
      cta: "Apri il portale paziente",
      linkDuration: "Questo link sicuro al portale è valido per 90 giorni. Dopo, o se lo perdi, puoi richiedere un nuovo link dalla pagina di accesso RediHealth.",
      conditionSummary: "Riepilogo della condizione / dei sintomi",
      portalDetailsHeading: "Nel tuo portale paziente",
      portalDetails: [
        "Consulta la diagnosi e le indicazioni del piano di cura",
        "Segnala nuovi sintomi e monitora il livello di urgenza",
        "Prenota e partecipa alle visite video di controllo",
        "Carica foto mediche o documenti sanitari pertinenti",
      ],
      fallbackName: "Gentile utente",
      treatmentPlan: "Piano di trattamento",
      datesNotRecorded: "Date non registrate",
      diagnosis: "Diagnosi",
      medications: "Farmaci / terapie",
      careInstructions: "Indicazioni per la cura",
      footerReason: "Hai ricevuto questa email perché è stato creato un profilo paziente RediHealth per te.",
    },
    meeting: {
      subject: "Invito",
      preview: (title: string) => `Invito a un appuntamento video: ${title}`,
      badge: "Appuntamento video",
      heading: "Sei invitato/a a una visita video",
      intro: "Il tuo team sanitario ha programmato una consulenza video. All'ora dell'appuntamento, premi il pulsante qui sotto per partecipare direttamente dal browser.",
      textInvitation: (title) => `Sei invitato/a a un appuntamento video RediHealth: ${title}.`,
      cta: "Partecipa alla visita video",
      appointment: "Appuntamento programmato",
      joinText: "Partecipa alla riunione qui:",
      closing: "Se hai bisogno di aiuto per collegarti, contatta il tuo team sanitario.",
      footerReason: "Hai ricevuto questa email perché è stato programmato un appuntamento RediHealth per te.",
    },
  },
  hr: {
    greeting: "Pozdrav",
    teamName: "RediHealth tim",
    footerBrand: "RediHealth — Zdravstvena podrška i portal za pacijente",
    footerContactLead: "Pitanja ili povratne informacije?",
    footerContactLink: "Obrati se podršci",
    patientFallbackName: "Pacijent",
    emergencyHeading: "Obavijest za hitne slučajeve:",
    emergencyText: "RediHealth nije hitna medicinska služba. Ako je život u opasnosti, odmah nazovi 112.",
    portal: {
      subject: "Poveznica za tvoj RediHealth portal za pacijente i plan liječenja",
      preview: "Tvoj RediHealth portal za pacijente je spreman.",
      badge: "Portal za pacijente",
      heading: "Tvoj medicinski portal je spreman",
      intro: "Tvoj osobni portal za pacijente sada je aktivan. Otvori svoj karton pacijenta za pregled uputa za njegu, prijavu simptoma i kontakt s timom skrbi.",
      textIntro: "Tvoj RediHealth karton pacijenta i pristup portalu su spremni. Možeš pregledati medicinski profil, bilješke o stanju i upute za njegu, prijaviti nove simptome, dodati fotografije i zatražiti kontrolni pregled putem osobne poveznice:",
      cta: "Otvori portal za pacijente",
      linkDuration: "Ova sigurna poveznica za portal vrijedi 90 dana. Nakon toga, ili ako je izgubiš, zatraži novu poveznicu na RediHealth stranici za prijavu.",
      conditionSummary: "Sažetak stanja i simptoma",
      portalDetailsHeading: "Na tvom portalu za pacijente",
      portalDetails: [
        "Pregledaj dijagnozu i upute iz plana liječenja",
        "Prijavi nove simptome i prati razinu hitnosti",
        "Zakaži kontrolne videokonzultacije i sudjeluj u njima",
        "Učitaj medicinske fotografije ili važne zdravstvene dokumente",
      ],
      fallbackName: "Poštovani",
      treatmentPlan: "Plan liječenja",
      datesNotRecorded: "Datumi nisu zabilježeni",
      diagnosis: "Dijagnoza",
      medications: "Lijekovi i terapije",
      careInstructions: "Upute za njegu",
      footerReason: "Ovu poruku primaš jer je za tebe izrađen karton pacijenta na sustavu RediHealth.",
    },
    meeting: {
      subject: "Pozivnica",
      preview: (title: string) => `Pozivnica za videokonzultaciju: ${title}`,
      badge: "Videokonzultacija",
      heading: "Pozvan si na videokonzultaciju",
      intro: "Tvoj zdravstveni tim zakazao je videokonzultaciju. U vrijeme termina pritisni gumb niže kako bi se izravno priključio iz preglednika.",
      textInvitation: (title) => `Pozvan si na RediHealth videokonzultaciju: ${title}.`,
      cta: "Priključi se videokonzultaciji",
      appointment: "Zakazani termin",
      joinText: "Priključi se sastanku ovdje:",
      closing: "Ako trebaš pomoć pri spajanju, obrati se svom zdravstvenom timu.",
      footerReason: "Ovu poruku primaš jer je za tebe zakazan termin na sustavu RediHealth.",
    },
  },
  rom: {
    greeting: "Mishto avilyan",
    teamName: "I ekipa RediHealth",
    footerBrand: "RediHealth — Sastipnasko zhutimos thaj portalo e pacientesko",
    footerContactLead: "Phuchimata vay gindurya?",
    footerContactLink: "Akhar i ekipa zhutipnaski",
    patientFallbackName: "Paciento",
    emergencyHeading: "Phenimos vash sigaki nevoia:",
    emergencyText: "RediHealth nay serviso vash sigaki nevoia. Te si o trajo and-o perikolo, akhar sigo ko 112.",
    portal: {
      subject: "O linko vash cho RediHealth portalo e pacientesko thaj plano tratamentesko",
      preview: "Cho RediHealth portalo e pacientesko si gata.",
      badge: "Portalo e pacientesko",
      heading: "Cho sastipnasko portalo si gata",
      intro: "Cho personalo portalo e pacientesko si putardo. Khuves and-o cho sastipnasko lil te dikhes le sikavimata, te phenes simptomurya thaj te des duma e sastipnaske ekipasa.",
      textIntro: "Cho RediHealth sastipnasko lil thaj o portalo si gata. Shaj te dikhes cho sastipnasko profilo, le noticye thaj le sikavimata, te phenes neve simptomurya, te thos tasvirya thaj te manges kontrole pe cho personalo linko:",
      cta: "Putar o portalo e pacientesko",
      linkDuration: "Kadava siguro linko vash o portalo zhal 90 dyesa. Pala kodya, vay te hasares les, mang ekh nevo linko katar i rig kaj khuves andre pe RediHealth.",
      conditionSummary: "Khetanipen e sastipnasko thaj e simptomurengo",
      portalDetailsHeading: "And-o cho portalo e pacientesko",
      portalDetails: [
        "Dikh i diagnoza thaj le sikavimata katar o plano tratamentesko",
        "Phen neve simptomurya thaj dikh sode sigako si",
        "Planisar thaj khuves and-e video-svaturya kontroleke",
        "Tho sastipnaske tasvirya vay trubutne sastipnaske lila",
      ],
      fallbackName: "Amala",
      treatmentPlan: "Plano tratamentesko",
      datesNotRecorded: "Le dyesa nay lekharde",
      diagnosis: "Diagnoza",
      medications: "Draba thaj terapiye",
      careInstructions: "Sikavimata sastipnaske",
      footerReason: "Liyan kadava email soske sas kerdo ekh sastipnasko lil vash tute pe RediHealth.",
    },
    meeting: {
      subject: "Akharimos",
      preview: (title: string) => `Akharimos ko video-svato: ${title}`,
      badge: "Video-svato",
      heading: "San akhardo ko ekh video-svato",
      intro: "Chi sastipnaski ekipa planisardyas ekh video-svato. Kana avel o chaso e vizitako, dab o butono tele te khuves andre drekto katar cho browsero.",
      textInvitation: (title) => `San akhardo ko ekh RediHealth video-svato: ${title}.`,
      cta: "Khuves and-o video-svato",
      appointment: "Planisardi vizita",
      joinText: "Khuves and-o maladimos kathe:",
      closing: "Te trubul tut zhutimos te phandes tut, de duma che sastipnaske ekipasa.",
      footerReason: "Liyan kadava email soske sas planisardi ekh vizita vash tute pe RediHealth.",
    },
  },
};

const emailSignOffByLang: Record<Lang, string> = {
"ru": "С уважением",

  en: "Best regards",
  ro: "Cu stimă",
  sq: "Me respekt",
  it: "Cordiali saluti",
  hr: "Srdačan pozdrav",
  rom: "Sastipnasa",
};

type EmailMessage = {
  /** One address, or several that all receive the same message. */
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  displayName?: string;
  replyTo?: string;
};

const DEFAULT_EMAIL_FROM = `no-reply@${LEGAL_OPERATOR.platformDomain}`;
const DEFAULT_DISPLAY_NAME = "RediHealth";

class ResendDeliveryError extends Error {
  readonly response?: { status?: number };

  constructor(message: string, status?: number | null) {
    super(message);
    this.name = "ResendDeliveryError";
    if (typeof status === "number" && Number.isInteger(status)) {
      this.response = { status };
    }
  }
}

let cachedResendClient: { apiKey: string; client: Resend } | null = null;

function sanitizeHeaderPart(value: string): string {
  return value.replace(/[\r\n<>"]/g, "").trim();
}

function getResendMailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  const fromAddress = (
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    DEFAULT_EMAIL_FROM
  ).trim();
  const displayName =
    sanitizeHeaderPart(process.env.EMAIL_DISPLAY_NAME || DEFAULT_DISPLAY_NAME) ||
    DEFAULT_DISPLAY_NAME;
  const replyTo = (process.env.EMAIL_REPLY_TO || LEGAL_OPERATOR.contactEmail).trim();

  if (!fromAddress) {
    return null;
  }

  return { apiKey, fromAddress, displayName, replyTo };
}

function getResendClient(apiKey: string): Resend {
  if (cachedResendClient && cachedResendClient.apiKey === apiKey) {
    return cachedResendClient.client;
  }
  const client = new Resend(apiKey);
  cachedResendClient = { apiKey, client };
  return client;
}

export function isEmailConfigured() {
  return getResendMailConfig() !== null;
}

export async function sendEmail({ to, subject, text, html, displayName, replyTo }: EmailMessage) {
  const config = getResendMailConfig();
  if (!config) {
    throw new Error("Resend email delivery is not configured.");
  }

  const resolvedName = sanitizeHeaderPart(displayName || config.displayName) || config.displayName;
  const from = config.fromAddress.includes("<")
    ? config.fromAddress
    : `${resolvedName} <${config.fromAddress}>`;
  const resolvedReplyTo = (replyTo ?? config.replyTo).trim();

  const client = getResendClient(config.apiKey);
  const { error } = await client.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    ...(resolvedReplyTo ? { replyTo: resolvedReplyTo } : {}),
    subject,
    text,
    ...(html ? { html } : {}),
  });

  if (error) {
    throw new ResendDeliveryError(
      error.message || "Resend email delivery failed.",
      error.statusCode,
    );
  }
}

export type BrandEmailOptions = {
  lang?: Lang;
  previewText: string;
  badgeText?: string;
  badgeTone?: "default" | "critical";
  heading: string;
  recipientName?: string;
  intro?: string;
  contentHtml?: string;
  codeBlock?: {
    code: string;
    expiresInText?: string;
  };
  cta?: {
    label: string;
    url: string;
  };
  emergencyNotice?: boolean;
  closingText?: string;
  footerReason?: string;
  align?: "center" | "left";
};

export function renderBrandEmail({
  lang = "en",
  previewText,
  badgeText,
  badgeTone,
  heading,
  recipientName,
  intro,
  contentHtml = "",
  codeBlock,
  cta,
  emergencyNotice = false,
  closingText,
  footerReason,
  align = "left",
}: BrandEmailOptions) {
  const copy = panelEmailCopy[lang];
  const userCopy = emailTranslations[lang];
  const safePreviewText = escapeHtml(previewText);
  const safeHeading = escapeHtml(heading);
  const safeRecipientName = recipientName ? escapeHtml(recipientName) : "";
  const safeIntro = intro ? escapeHtml(intro) : "";
  const safeClosingText = escapeHtml(closingText ?? userCopy.closing);
  const safeFooterReason = escapeHtml(footerReason ?? userCopy.defaultReason);
  const isCentered = align === "center";
  const textAlign = isCentered ? "center" : "left";
  const isCritical =
    badgeTone === "critical" || Boolean(badgeText && /critical|alert/i.test(badgeText));
  const topBarColor = isCritical ? "#c62f3c" : "#1d3557";
  const platformUrl = `https://${LEGAL_OPERATOR.platformDomain}`;
  const logoUrl = `${platformUrl}/pwa/pwa-192x192.png`;

  const headerBadgeHtml = badgeText
    ? `<td align="right" valign="middle" style="padding-left: 12px;">
        <span class="${isCritical ? "email-badge-critical" : "email-badge"}" style="display: inline-block; font-size: 12px; line-height: 16px; font-weight: 600; letter-spacing: 0.01em; color: ${isCritical ? "#a8242f" : "#475569"}; white-space: nowrap;">
          ${escapeHtml(badgeText)}
        </span>
      </td>`
    : "";

  const codeHtml = codeBlock
    ? `
      <tr>
        <td align="center" style="padding: 4px 0 22px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border-spacing: 0;">
            <tr>
              <td class="email-box" style="background-color: #f4f7fb; border: 1px solid #d7e2f0; border-radius: 14px; padding: 24px 20px; text-align: center;">
                <div class="email-subtext" style="font-size: 13px; line-height: 18px; font-weight: 600; color: #475569; margin: 0 0 10px 0;">
                  ${escapeHtml(userCopy.code.label)}
                </div>
                <div class="email-code-digits" style="font-family: ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', monospace; font-size: 38px; line-height: 44px; font-weight: 800; letter-spacing: 8px; text-indent: 8px; color: #0b132b; margin: 4px 0 12px 0;">
                  ${escapeHtml(codeBlock.code)}
                </div>
                <div class="email-subtext" style="font-size: 12px; line-height: 18px; color: #64748b; font-weight: 500;">
                  ${escapeHtml(userCopy.code.expires)} ${escapeHtml(codeBlock.expiresInText || userCopy.code.duration)}, ${escapeHtml(userCopy.code.secret)}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  const ctaHtml = cta
    ? `
      <tr>
        <td align="${textAlign}" style="padding: 6px 0 22px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${isCentered ? "center" : "left"}" style="${isCentered ? "margin: 0 auto;" : ""}">
            <tr>
              <td style="border-radius: 10px; background-color: #1d3557;">
                <a href="${escapeHtml(cta.url)}" class="button-link" style="display: inline-block; padding: 14px 28px; font-size: 15px; line-height: 20px; font-weight: 600; color: #ffffff !important; text-decoration: none; border-radius: 10px; background-color: #1d3557;">
                  ${escapeHtml(cta.label)}
                </a>
              </td>
            </tr>
          </table>
          <div class="email-subtext" style="clear: both; padding-top: 12px; font-size: 12px; line-height: 18px; color: #64748b; word-break: break-all; text-align: ${textAlign};">
            <a href="${escapeHtml(cta.url)}" class="email-link" style="color: #1d3557; text-decoration: underline;">${escapeHtml(cta.url)}</a>
          </div>
        </td>
      </tr>`
    : "";

  const emergencyHtml = emergencyNotice
    ? `
      <tr>
        <td style="padding: 4px 0 20px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-emergency-box" style="border-collapse: separate; border-spacing: 0; background-color: #fff6f7; border: 1px solid #f5c6cb; border-radius: 10px;">
            <tr>
              <td class="email-emergency" style="padding: 13px 16px; font-size: 13px; line-height: 20px; color: #8f1d27; text-align: left;">
                <strong style="color: #8f1d27;">${escapeHtml(copy.emergencyHeading)}</strong> ${escapeHtml(copy.emergencyText)}
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  const greetingHtml = safeRecipientName
    ? `<tr><td class="email-body-text" style="padding: 0 0 10px 0; font-size: 15px; line-height: 24px; color: #334155; text-align: ${textAlign};">${escapeHtml(copy.greeting)} <strong class="email-heading" style="color: #0b132b;">${safeRecipientName}</strong>,</td></tr>`
    : "";

  const introHtml = safeIntro
    ? `<tr><td class="email-body-text" style="padding: 0 0 20px 0; font-size: 15px; line-height: 24px; color: #475569; text-align: ${textAlign};">${safeIntro}</td></tr>`
    : "";

  const previewSpacingFiller = "&#847;&zwnj;&nbsp;".repeat(90);

  return `<!doctype html>
<html lang="${lang}" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>${safeHeading}</title>
    <style>
      :root {
        color-scheme: light dark;
        supported-color-schemes: light dark;
      }
      body, table, td, a {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      table, td {
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      img {
        -ms-interpolation-mode: bicubic;
        border: 0;
        display: block;
      }
      a {
        color: #1d3557;
      }
      a[x-apple-data-detectors],
      #MessageViewBody a,
      u + #body a {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
      }
      .button-link,
      .button-link:visited {
        color: #ffffff !important;
        text-decoration: none !important;
      }
      @media (prefers-color-scheme: dark) {
        body, #body, .email-bg {
          background-color: #0a1226 !important;
        }
        .email-card {
          background-color: #101a33 !important;
          border-color: #233252 !important;
        }
        .email-card-header,
        .email-border {
          border-color: #233252 !important;
        }
        .email-brand-name,
        .email-heading {
          color: #ffffff !important;
        }
        .email-body-text {
          color: #cbd5e1 !important;
        }
        .email-subtext {
          color: #94a3b8 !important;
        }
        .email-box {
          background-color: #0b132b !important;
          border-color: #233252 !important;
        }
        .email-inner-surface {
          background-color: #14203d !important;
          border-color: #233252 !important;
          color: #e2e8f0 !important;
        }
        .email-code-digits {
          color: #ffffff !important;
        }
        .email-badge {
          color: #94a3b8 !important;
        }
        .email-badge-critical {
          color: #fca5a5 !important;
        }
        .email-emergency-box {
          background-color: #2b141a !important;
          border-color: #5e222e !important;
        }
        .email-emergency,
        .email-emergency strong {
          color: #fecdd3 !important;
        }
        .email-link {
          color: #bfdbfe !important;
        }
        .email-footer-text {
          color: #94a3b8 !important;
        }
      }
      @media screen and (max-width: 600px) {
        .email-container {
          width: 100% !important;
        }
        .email-header-pad {
          padding: 20px 20px 16px 20px !important;
        }
        .email-body-pad {
          padding: 24px 20px 22px 20px !important;
        }
        .email-heading {
          font-size: 21px !important;
          line-height: 28px !important;
        }
        .email-code-digits {
          font-size: 32px !important;
          line-height: 38px !important;
          letter-spacing: 6px !important;
          text-indent: 6px !important;
        }
      }
    </style>
  </head>
  <body id="body" class="email-bg" style="margin: 0; padding: 0; width: 100% !important; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
      ${safePreviewText} ${previewSpacingFiller}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-bg" style="background-color: #f8fafc;">
      <tr>
        <td align="center" style="padding: 32px 14px 40px 14px;">
          <table role="presentation" class="email-container" width="560" cellpadding="0" cellspacing="0" border="0" align="center" style="width: 560px; max-width: 560px; margin: 0 auto;">
            <!-- Main Elevated Card -->
            <tr>
              <td class="email-card" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 18px rgba(11, 19, 43, 0.05);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <!-- Accent Hairline -->
                  <tr>
                    <td style="background-color: ${topBarColor}; height: 4px; line-height: 4px; font-size: 1px;">&nbsp;</td>
                  </tr>
                  <!-- Brand Header -->
                  <tr>
                    <td class="email-header-pad email-card-header" style="padding: 22px 32px 18px 32px; border-bottom: 1px solid #edf0f5;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="left" valign="middle">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td valign="middle" style="padding-right: 10px;">
                                  <img src="${logoUrl}" width="28" height="28" alt="RediHealth" style="width: 28px; height: 28px; border-radius: 7px;" />
                                </td>
                                <td valign="middle">
                                  <a href="${platformUrl}" class="email-brand-name" style="font-size: 17px; line-height: 22px; font-weight: 700; letter-spacing: -0.02em; color: #0b132b; text-decoration: none;">RediHealth</a>
                                </td>
                              </tr>
                            </table>
                          </td>
                          ${headerBadgeHtml}
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Content Body -->
                  <tr>
                    <td class="email-body-pad" style="padding: 28px 32px 28px 32px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td class="email-heading" style="padding: 0 0 12px 0; font-size: 24px; line-height: 31px; font-weight: 700; color: #0b132b; letter-spacing: -0.025em; text-align: ${textAlign};">
                            ${safeHeading}
                          </td>
                        </tr>
                        ${greetingHtml}
                        ${introHtml}
                        ${codeHtml}
                        ${ctaHtml}
                        ${contentHtml}
                        ${emergencyHtml}
                        <tr>
                          <td class="email-subtext email-border" style="padding: 18px 0 0 0; border-top: 1px solid #edf0f5; font-size: 14px; line-height: 22px; color: #64748b; text-align: ${textAlign};">
                            ${safeClosingText}<br />
                            <strong class="email-brand-name" style="color: #0b132b;">${escapeHtml(copy.teamName)}</strong>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Calm Trust Footer -->
            <tr>
              <td align="center" style="padding: 22px 16px 0 16px; text-align: center;">
                <p class="email-footer-text" style="margin: 0 0 6px 0; font-size: 12px; line-height: 18px; color: #475569; font-weight: 600;">
                  ${escapeHtml(copy.footerBrand)}
                </p>
                <p class="email-footer-text" style="margin: 0 0 8px 0; font-size: 12px; line-height: 18px; color: #64748b;">
                  ${safeFooterReason}
                </p>
                <p class="email-footer-text" style="margin: 0; font-size: 12px; line-height: 18px; color: #64748b;">
                  ${escapeHtml(copy.footerContactLead)} <a href="mailto:${escapeHtml(LEGAL_OPERATOR.contactEmail)}" class="email-link" style="color: #1d3557; font-weight: 600; text-decoration: underline;">${escapeHtml(copy.footerContactLink)}</a> — <a href="${platformUrl}" class="email-link" style="color: #1d3557; text-decoration: underline;">${escapeHtml(LEGAL_OPERATOR.platformDomain)}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function renderSignInCodeEmail({ email, code, lang }: { email: string; code: string; lang: Lang }) {
  const copy = emailTranslations[lang];
  const auth = copy.code;
  return {
    subject: auth.subject,
    text: [`${copy.greeting},`, auth.intro, `${auth.label}:\n${code}`, `${auth.expires} ${auth.duration}.`, auth.ignored, auth.secret, `${copy.closing}\n${copy.team}`].join("\n\n"),
    html: renderBrandEmail({
      lang,
      previewText: auth.subject,
      badgeText: auth.badge,
      heading: auth.heading,
      recipientName: email,
      intro: auth.intro,
      codeBlock: { code },
      closingText: auth.secret,
      footerReason: auth.reason,
      contentHtml: `<tr><td class="email-subtext" style="padding: 0 0 18px 0; font-size: 13px; line-height: 20px; color: #64748b;">${escapeHtml(auth.ignored)}</td></tr>`,
    }),
  };
}

export function renderHelpRequestReplyEmail(input: HelpReplyInput) {
  const copy = emailTranslations[input.lang];
  const content = helpReplyContent(input);
  return {
    subject: content.subject,
    text: content.text,
    html: renderBrandEmail({
      lang: input.lang,
      previewText: content.heading,
      heading: content.heading,
      recipientName: input.name,
      intro: content.intro,
      footerReason: copy.reply.reason,
      contentHtml: content.details.length
        ? `<tr><td style="padding: 0 0 20px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border-spacing: 0;"><tr><td class="email-box email-body-text" style="background-color: #f4f7fb; border: 1px solid #d7e2f0; border-radius: 12px; padding: 14px 18px; font-size: 14px; line-height: 22px; color: #334155;">${content.details.map((line) => `<p style="margin: 0 0 8px 0;">${escapeHtml(line)}</p>`).join("")}</td></tr></table></td></tr>`
        : undefined,
      cta: input.templateId === "referral" ? { label: copy.reply.map, url: content.mapUrl } : undefined,
    }),
  };
}

export type HelpRequestEmailParams = {
  name: string;
  phone: string;
  email: string;
  description: string;
  lang?: Lang;
};

export async function sendHelpRequestConfirmationEmail({
  name,
  phone,
  email,
  description,
  lang = "en",
}: HelpRequestEmailParams) {
  if (!isEmailConfigured()) {
    console.warn("Resend email delivery is not configured. Skipping confirmation email.");
    return false;
  }

  const copy = emailTranslations[lang];
  const requestCopy = copy.request;
  const recipientName = name.trim() || panelEmailCopy[lang].patientFallbackName;

  const textContent = `${copy.greeting} ${recipientName},

${requestCopy.intro}

${requestCopy.summary}:
- ${requestCopy.name}: ${name.trim() || requestCopy.missing}
- ${requestCopy.phone}: ${phone.trim()}
- ${requestCopy.email}: ${email.trim()}
- ${requestCopy.description}: ${description.trim()}

${panelEmailCopy[lang].emergencyHeading} ${panelEmailCopy[lang].emergencyText}

${copy.closing}
${copy.team}`;

  const summaryHtml = `
      <tr>
        <td style="padding: 0 0 20px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border-spacing: 0;">
            <tr>
              <td class="email-box" style="background-color: #f9fafb; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td class="email-heading email-border" style="padding: 13px 18px; font-size: 14px; line-height: 20px; font-weight: 700; color: #0b132b; border-bottom: 1px solid #e2e8f0;">
                      ${escapeHtml(requestCopy.summary)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 14px 18px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td class="email-subtext" style="padding: 0 0 8px 0; font-size: 13px; line-height: 20px; color: #64748b; width: 110px; vertical-align: top;">${escapeHtml(requestCopy.name)}</td>
                          <td class="email-heading" style="padding: 0 0 8px 0; font-size: 14px; line-height: 20px; font-weight: 600; color: #0b132b;">${escapeHtml(name.trim() || requestCopy.missing)}</td>
                        </tr>
                        <tr>
                          <td class="email-subtext" style="padding: 0 0 8px 0; font-size: 13px; line-height: 20px; color: #64748b; vertical-align: top;">${escapeHtml(requestCopy.phone)}</td>
                          <td class="email-body-text" style="padding: 0 0 8px 0; font-size: 14px; line-height: 20px; color: #334155;">${escapeHtml(phone.trim())}</td>
                        </tr>
                        <tr>
                          <td class="email-subtext" style="padding: 0 0 12px 0; font-size: 13px; line-height: 20px; color: #64748b; vertical-align: top;">${escapeHtml(requestCopy.email)}</td>
                          <td class="email-body-text" style="padding: 0 0 12px 0; font-size: 14px; line-height: 20px; color: #334155;">${escapeHtml(email.trim())}</td>
                        </tr>
                      </table>
                      <div class="email-subtext" style="margin: 0 0 6px 0; font-size: 13px; line-height: 18px; font-weight: 600; color: #475569;">${escapeHtml(requestCopy.description)}</div>
                      <div class="email-inner-surface" style="padding: 12px 14px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; font-size: 14px; line-height: 22px; color: #334155; white-space: pre-wrap;">${escapeHtml(description.trim())}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;

  const htmlContent = renderBrandEmail({
    lang,
    previewText: requestCopy.heading,
    badgeText: requestCopy.badge,
    heading: requestCopy.heading,
    recipientName,
    intro: requestCopy.intro,
    contentHtml: summaryHtml,
    emergencyNotice: true,
    footerReason: requestCopy.reason,
  });

  try {
    await sendEmail({
      to: email.trim(),
      subject: requestCopy.subject,
      text: textContent,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error("Failed to send medical help request confirmation email:", error);
    return false;
  }
}

export type PatientPortalEmailParams = {
  name: string;
  email: string;
  accessToken: string;
  /** Country the patient belongs to; the link carries it so the portal reads the right database. */
  country: CountryCode;
  lang?: Lang;
  treatmentPlan?: TreatmentPlan | null;
  conditionNotes?: string | null;
  /** @deprecated Ignored to prevent Host header poisoning; canonical origin is always derived from server-side config via getSiteUrl(). */
  baseUrl?: string;
};

export async function sendPatientPortalLinkEmail({
  name,
  email,
  accessToken,
  country,
  lang = "en",
  treatmentPlan,
  conditionNotes,
}: PatientPortalEmailParams) {
  if (!isEmailConfigured()) {
    console.warn("Resend email delivery is not configured. Skipping patient portal email.");
    return false;
  }

  const copy = panelEmailCopy[lang];
  const portalCopy = copy.portal;
  const recipientName = name.trim() || portalCopy.fallbackName;
  const baseUrl = getSiteUrl();
  const portalUrl = `${baseUrl.replace(/\/$/, "")}${withLangPrefix(portalPath(accessToken, country), lang)}`;

  const textContent = `${copy.greeting} ${recipientName},

${portalCopy.textIntro}

${portalUrl}

${portalCopy.linkDuration}

${conditionNotes ? `${portalCopy.conditionSummary}:\n${conditionNotes}\n` : ""}
${sortTreatments(getTreatmentEntries(treatmentPlan)).map((entry) => [
  entry.title || portalCopy.treatmentPlan,
  entry.start_date ? `${entry.start_date} - ${entry.end_date || portalCopy.datesNotRecorded}` : portalCopy.datesNotRecorded,
  entry.diagnosis ? `${portalCopy.diagnosis}:\n${entry.diagnosis}` : "",
  entry.medications ? `${portalCopy.medications}:\n${entry.medications}` : "",
  entry.care_instructions ? `${portalCopy.careInstructions}:\n${entry.care_instructions}` : "",
].filter(Boolean).join("\n")).join("\n\n")}

${copy.emergencyText}

${emailSignOffByLang[lang]},
${copy.teamName}`;

  const portalDetailsHtml = `
      <tr>
        <td class="email-subtext" style="padding: 0 0 18px 0; font-size: 13px; line-height: 20px; color: #64748b;">
          ${escapeHtml(portalCopy.linkDuration)}
        </td>
      </tr>
      <tr>
        <td style="padding: 0 0 20px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border-spacing: 0;">
            <tr>
              <td class="email-box" style="background-color: #f9fafb; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td class="email-heading email-border" style="padding: 13px 18px; font-size: 14px; line-height: 20px; font-weight: 700; color: #0b132b; border-bottom: 1px solid #e2e8f0;">
                      ${escapeHtml(portalCopy.portalDetailsHeading)}
                    </td>
                  </tr>
                  <tr>
                    <td class="email-body-text" style="padding: 14px 18px; font-size: 14px; line-height: 22px; color: #475569;">
                      <ul style="margin: 0; padding-left: 18px;">
                        <li style="margin-bottom: 6px;">${escapeHtml(portalCopy.portalDetails[0])}</li>
                        <li style="margin-bottom: 6px;">${escapeHtml(portalCopy.portalDetails[1])}</li>
                        <li style="margin-bottom: 6px;">${escapeHtml(portalCopy.portalDetails[2])}</li>
                        <li>${escapeHtml(portalCopy.portalDetails[3])}</li>
                      </ul>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;

  const htmlContent = renderBrandEmail({
    lang,
    previewText: portalCopy.preview,
    badgeText: portalCopy.badge,
    heading: portalCopy.heading,
    recipientName,
    intro: portalCopy.intro,
    cta: {
      label: portalCopy.cta,
      url: portalUrl,
    },
    contentHtml: portalDetailsHtml,
    emergencyNotice: true,
    closingText: `${emailSignOffByLang[lang]},`,
    footerReason: portalCopy.footerReason,
  });

  try {
    await sendEmail({
      to: email.trim(),
      subject: portalCopy.subject,
      text: textContent,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error("Failed to send patient portal link email:", error);
    return false;
  }
}

export async function sendMeetingInvitationEmail({
  name,
  email,
  title,
  meetingUrl,
  lang = "en",
  date, time, timezone,
}: {
  name: string;
  email: string;
  title: string;
  meetingUrl: string;
  lang?: Lang;
  date?: string; time?: string; timezone?: string;
}) {
  if (!isEmailConfigured()) {
    console.warn("Resend email delivery is not configured. Skipping meeting invitation email.");
    return false;
  }

  const copy = panelEmailCopy[lang];
  const meetingCopy = copy.meeting;
  const recipientName = name.trim() || copy.patientFallbackName;
  const appointment = date ? `${date}${time ? ` ${time} (${timezone || ""})` : ""}` : "";
  const textContent = `${copy.greeting} ${recipientName},

${meetingCopy.textInvitation(title)}
${appointment}

${meetingCopy.joinText}
${meetingUrl}

${meetingCopy.closing}

${emailSignOffByLang[lang]},
${copy.teamName}`;
  const meetingDetailsHtml = `
      <tr>
        <td style="padding: 0 0 20px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border-spacing: 0;">
            <tr>
              <td class="email-box" style="background-color: #f4f7fb; border: 1px solid #d7e2f0; border-radius: 12px; padding: 18px 20px; text-align: left;">
                <div class="email-subtext" style="font-size: 12px; line-height: 18px; font-weight: 600; color: #475569; margin-bottom: 4px;">${escapeHtml(meetingCopy.appointment)}</div>
                <div class="email-heading" style="font-size: 17px; line-height: 24px; font-weight: 700; color: #0b132b;">${escapeHtml(title)}</div>
                ${appointment ? `<p class="email-body-text" style="margin: 6px 0 0 0; font-size: 14px; line-height: 20px; color: #334155;">${escapeHtml(appointment)}</p>` : ""}
              </td>
            </tr>
          </table>
        </td>
      </tr>`;

  const htmlContent = renderBrandEmail({
    lang,
    previewText: meetingCopy.preview(title),
    badgeText: meetingCopy.badge,
    heading: meetingCopy.heading,
    recipientName,
    intro: meetingCopy.intro,
    cta: {
      label: meetingCopy.cta,
      url: meetingUrl,
    },
    contentHtml: meetingDetailsHtml,
    closingText: meetingCopy.closing,
    footerReason: meetingCopy.footerReason,
  });

  try {
    await sendEmail({
      to: email,
      subject: `${meetingCopy.subject}: ${title} - RediHealth`,
      text: textContent,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error("Failed to send meeting invitation email:", error);
    return false;
  }
}
