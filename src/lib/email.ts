import {
  AccountApi,
  Configuration,
  SendApi,
  type V1SendRequest,
} from "hostinger-mail-api-sdk";
import type { TreatmentPlan } from "@/lib/types/patient";
import { getTreatmentEntries, sortTreatments } from "@/lib/treatments";
import type { Lang } from "@/lib/i18n/translations";
import type { CountryCode } from "@/lib/countries";
import { portalPath } from "@/lib/security/portal-token";
import { escapeHtml } from "@/lib/text";
import { emailTranslations, helpReplyContent, type HelpReplyInput } from "@/lib/i18n/email-translations";
import { withLangPrefix } from "@/lib/i18n/routing";

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
    footerBrand: "RediHealth · Поддержка здравоохранения и портал пациентов",
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
    teamName: "The RediHealth Team",
    footerBrand: "RediHealth · Healthcare Support and Patient Portal",
    footerContactLead: "Questions or feedback?",
    footerContactLink: "Contact Support",
    patientFallbackName: "Patient",
    emergencyHeading: "Emergency Notice:",
    emergencyText: "RediHealth is not an emergency response service. If you are experiencing a life-threatening medical emergency, please call 112 immediately.",
    portal: {
      subject: "Your RediHealth Patient Portal and Care Plan Link",
      preview: "Your RediHealth patient portal is ready.",
      badge: "Patient Portal",
      heading: "Your medical portal is ready",
      intro: "Your personal patient portal is now active. Access your profile to review your care instructions, report symptoms, and connect with your care team.",
      textIntro: "Your RediHealth Patient Profile and Portal Access is ready! You can view your medical profile, condition notes, care instructions, report new symptoms, add photos, and request follow-ups using your personal link:",
      cta: "Open Patient Portal",
      linkDuration: "This secure portal link is valid for 90 days. After that, or if you lose it, request a new link from the RediHealth sign-in page.",
      conditionSummary: "Condition / Symptoms Summary",
      portalDetailsHeading: "In your patient portal",
      portalDetails: [
        "View diagnosis and care plan directives",
        "Report new symptoms and monitor urgency level",
        "Schedule and attend follow-up video visits",
        "Upload medical photos or relevant health documents",
      ],
      fallbackName: "Valued Customer",
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
      badge: "Video Appointment",
      heading: "You're invited to a video visit",
      intro: "A video consultation has been scheduled with your healthcare support team. When it is time for your appointment, tap the button below to join directly in your browser.",
      textInvitation: (title) => `You have been invited to a RediHealth video appointment: ${title}.`,
      cta: "Join Video Visit",
      appointment: "Scheduled Appointment",
      joinText: "Join the meeting at:",
      closing: "If you need help connecting, please contact your healthcare team.",
      footerReason: "You received this email because an appointment was scheduled for you on RediHealth.",
    },
  },
  ro: {
    greeting: "Bună",
    teamName: "Echipa RediHealth",
    footerBrand: "RediHealth · Asistență medicală și portalul pacientului",
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
    footerBrand: "RediHealth · Mbështetje shëndetësore dhe portali i pacientit",
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
    footerBrand: "RediHealth · Supporto sanitario e portale del paziente",
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
    footerBrand: "RediHealth · Zdravstvena podrška i portal za pacijente",
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
    footerBrand: "RediHealth · Sastipnasko zhutimos thaj portalo e pacientesko",
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
  to: string;
  subject: string;
  text: string;
  html?: string;
  displayName?: string;
};

let mailboxResourceId: string | undefined;

function getHostingerMailConfig() {
  const accessToken = process.env.HOSTINGER_MAIL_API_TOKEN;
  const fromAddress = process.env.HOSTINGER_MAIL_FROM;
  const displayName = process.env.HOSTINGER_MAIL_DISPLAY_NAME || "RediHealth";

  if (!accessToken || !fromAddress) {
    return null;
  }

  return { accessToken, fromAddress, displayName };
}

export function isEmailConfigured() {
  return getHostingerMailConfig() !== null;
}

export async function sendEmail({ to, subject, text, html, displayName }: EmailMessage) {
  const config = getHostingerMailConfig();
  if (!config) {
    throw new Error("Hostinger Mail API is not configured.");
  }

  const sdkConfig = new Configuration({ accessToken: config.accessToken });

  if (!mailboxResourceId) {
    const account = await new AccountApi(sdkConfig).getCurrentAccount();
    const mailbox = account.data.data.mailboxes.find(
      ({ address }) => address.toLowerCase() === config.fromAddress.toLowerCase(),
    );

    if (!mailbox) {
      throw new Error(
        `The Hostinger API token cannot manage ${config.fromAddress}.`,
      );
    }

    mailboxResourceId = mailbox.resourceId;
  }

  const message = {
    to: [to],
    displayName: displayName || config.displayName,
    subject,
    text,
    html: html || "",
  } as V1SendRequest;

  await new SendApi(sdkConfig).sendEmail(mailboxResourceId, message);
}

export type BrandEmailOptions = {
  lang?: Lang;
  previewText: string;
  badgeText?: string;
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
  heading,
  recipientName,
  intro,
  contentHtml = "",
  codeBlock,
  cta,
  emergencyNotice = false,
  closingText,
  footerReason,
  align = "center",
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

  const badgeHtml = badgeText
    ? `
      <tr>
        <td align="${textAlign}" style="padding: 0 0 12px 0;">
          <span class="email-badge" style="display: inline-block; font-size: 11px; line-height: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #cc3846; background-color: #fbeef0; padding: 4px 12px; border-radius: 9999px;">
            ${escapeHtml(badgeText)}
          </span>
        </td>
      </tr>`
    : "";

  const codeHtml = codeBlock
    ? `
      <tr>
        <td align="center" style="padding: 6px 0 20px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto; width: 100%; max-width: 360px;">
            <tr>
              <td class="email-box" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 22px 16px; text-align: center;">
                <div style="font-size: 11px; line-height: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; margin-bottom: 8px;">
                  ${escapeHtml(userCopy.code.label)}
                </div>
                <div class="email-code-digits" style="font-family: ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', monospace; font-size: 38px; line-height: 44px; font-weight: 800; letter-spacing: 8px; text-indent: 8px; color: #0f172a; margin: 4px 0 8px 0;">
                  ${escapeHtml(codeBlock.code)}
                </div>
                <div class="email-subtext" style="font-size: 12px; line-height: 16px; color: #94a3b8; font-weight: 500;">
                  ${escapeHtml(userCopy.code.expires)} ${escapeHtml(codeBlock.expiresInText || userCopy.code.duration)} · ${escapeHtml(userCopy.code.secret)}
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
        <td align="${textAlign}" style="padding: 10px 0 24px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${textAlign === "center" ? "center" : "left"}" style="${textAlign === "center" ? "margin: 0 auto;" : ""}">
            <tr>
              <td style="border-radius: 10px; background-color: #cc3846;">
                <a href="${escapeHtml(cta.url)}" class="button-link" style="display: inline-block; padding: 13px 30px; font-size: 15px; line-height: 20px; font-weight: 600; color: #ffffff !important; text-decoration: none; border-radius: 10px; background-color: #cc3846;">
                  ${escapeHtml(cta.label)}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  const emergencyHtml = emergencyNotice
    ? `
      <tr>
        <td style="padding: 8px 0 20px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border-spacing: 0; background-color: #fff9f9; border: 1px solid #fee2e2; border-left: 3px solid #cc3846; border-radius: 10px;">
            <tr>
              <td style="padding: 12px 16px; font-size: 13px; line-height: 20px; color: #991b1b; text-align: left;">
                <strong style="color: #991b1b;">${escapeHtml(copy.emergencyHeading)}</strong> ${escapeHtml(copy.emergencyText)}
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  const greetingHtml = safeRecipientName
    ? `<tr><td class="email-body-text" style="padding: 0 0 10px 0; font-size: 15px; line-height: 24px; color: #334155; text-align: ${textAlign};">${escapeHtml(copy.greeting)} <strong>${safeRecipientName}</strong>,</td></tr>`
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
      }
      a {
        color: #cc3846;
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
          background-color: #0b0f17 !important;
        }
        .email-card {
          background-color: #141c2b !important;
          border-color: #223048 !important;
        }
        .email-brand-name {
          color: #f8fafc !important;
        }
        .email-heading {
          color: #f8fafc !important;
        }
        .email-body-text {
          color: #cbd5e1 !important;
        }
        .email-subtext {
          color: #94a3b8 !important;
        }
        .email-box {
          background-color: #0d1420 !important;
          border-color: #223048 !important;
        }
        .email-code-digits {
          color: #ffffff !important;
        }
        .email-badge {
          background-color: #271d24 !important;
          color: #f87171 !important;
        }
        .email-footer-text {
          color: #64748b !important;
        }
        .email-border {
          border-color: #223048 !important;
        }
      }
      @media screen and (max-width: 600px) {
        .email-container {
          width: 100% !important;
        }
        .email-card {
          border-radius: 12px !important;
          padding: 28px 20px !important;
        }
        .email-heading {
          font-size: 21px !important;
          line-height: 28px !important;
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
        <td align="center" style="padding: 40px 14px 44px 14px;">
          <table role="presentation" class="email-container" width="540" cellpadding="0" cellspacing="0" border="0" align="center" style="width: 540px; max-width: 540px; margin: 0 auto;">
            <!-- Main White Card -->
            <tr>
              <td class="email-card" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 36px 32px 32px 32px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  ${badgeHtml}
                  <tr>
                    <td class="email-heading" style="padding: 0 0 14px 0; font-size: 23px; line-height: 30px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; text-align: ${textAlign};">
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
                    <td class="email-subtext" style="padding: 12px 0 0 0; font-size: 14px; line-height: 22px; color: #64748b; text-align: ${textAlign};">
                      ${safeClosingText}<br />
                      <strong class="email-brand-name" style="color: #0f172a;">${escapeHtml(copy.teamName)}</strong>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Minimal Modern Footer -->
            <tr>
              <td align="center" style="padding: 24px 16px 0 16px; text-align: center;">
                <p class="email-footer-text" style="margin: 0 0 6px 0; font-size: 12px; line-height: 18px; color: #64748b; font-weight: 500;">
                  ${escapeHtml(copy.footerBrand)}
                </p>
                <p class="email-footer-text" style="margin: 0 0 8px 0; font-size: 12px; line-height: 18px; color: #94a3b8;">
                  ${safeFooterReason}
                </p>
                <p class="email-footer-text" style="margin: 0; font-size: 12px; line-height: 18px; color: #94a3b8;">
                  ${escapeHtml(copy.footerContactLead)} <a href="mailto:support@redihealth.app" style="color: #cc3846; text-decoration: underline;">${escapeHtml(copy.footerContactLink)}</a>
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
    text: [`${copy.greeting},`, auth.intro, code, `${auth.expires} ${auth.duration}.`, auth.ignored, auth.secret, `${copy.closing}\n${copy.team}`].join("\n\n"),
    html: renderBrandEmail({
      lang, previewText: auth.subject, badgeText: auth.badge, heading: auth.heading, recipientName: email,
      intro: auth.intro, codeBlock: { code }, closingText: auth.secret, footerReason: auth.reason,
      contentHtml: `<tr><td style="padding: 0 0 20px; font-size: 14px; line-height: 22px;">${escapeHtml(auth.ignored)}</td></tr>`,
    }),
  };
}

export function renderHelpRequestReplyEmail(input: HelpReplyInput) {
  const copy = emailTranslations[input.lang];
  const content = helpReplyContent(input);
  return {
    subject: content.subject, text: content.text,
    html: renderBrandEmail({
      lang: input.lang, previewText: content.heading, heading: content.heading, recipientName: input.name,
      intro: content.intro, footerReason: copy.reply.reason,
      contentHtml: content.details.length
        ? `<tr><td style="padding: 0 0 20px; font-size: 14px; line-height: 22px;">${content.details.map(line => `<p>${escapeHtml(line)}</p>`).join("")}</td></tr>` : undefined,
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
    console.warn("Hostinger Mail API is not configured. Skipping confirmation email.");
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
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border-spacing: 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
            <tr>
              <td style="padding: 14px 18px; font-size: 13px; line-height: 18px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.05em;">
                ${escapeHtml(requestCopy.summary)}
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 18px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 22px; color: #475569;"><strong style="color: #0f172a;">${escapeHtml(requestCopy.name)}:</strong> ${escapeHtml(name.trim() || requestCopy.missing)}</p>
                <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 22px; color: #475569;"><strong style="color: #0f172a;">${escapeHtml(requestCopy.phone)}:</strong> ${escapeHtml(phone.trim())}</p>
                <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 22px; color: #475569;"><strong style="color: #0f172a;">${escapeHtml(requestCopy.email)}:</strong> ${escapeHtml(email.trim())}</p>
                <p style="margin: 0 0 6px 0; font-size: 14px; line-height: 22px; color: #475569;"><strong style="color: #0f172a;">${escapeHtml(requestCopy.description)}:</strong></p>
                <div style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; font-size: 14px; line-height: 22px; color: #334155; white-space: pre-wrap;">${escapeHtml(description.trim())}</div>
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
  /** Origin of the incoming request (e.g. https://example.com). Used as a fallback when APP_URL is not set. */
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
  baseUrl: requestBaseUrl,
}: PatientPortalEmailParams) {
  if (!isEmailConfigured()) {
    console.warn("Hostinger Mail API is not configured. Skipping patient portal email.");
    return false;
  }

  const copy = panelEmailCopy[lang];
  const portalCopy = copy.portal;
  const recipientName = name.trim() || portalCopy.fallbackName;
  const baseUrl =
    process.env.APP_URL ||
    requestBaseUrl ||
    process.env.AUTH_URL ||
    "http://localhost:3000";
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
        <td align="center" style="padding: 0 0 16px 0; font-size: 13px; line-height: 20px; color: #64748b;">
          ${escapeHtml(portalCopy.linkDuration)}
        </td>
      </tr>
      <tr>
        <td style="padding: 0 0 20px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border-spacing: 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
            <tr>
              <td style="padding: 14px 18px; font-size: 13px; line-height: 18px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.05em;">
                ${escapeHtml(portalCopy.portalDetailsHeading)}
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 18px; font-size: 14px; line-height: 22px; color: #475569;">
                <ul style="margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 6px;">${escapeHtml(portalCopy.portalDetails[0])}</li>
                  <li style="margin-bottom: 6px;">${escapeHtml(portalCopy.portalDetails[1])}</li>
                  <li style="margin-bottom: 6px;">${escapeHtml(portalCopy.portalDetails[2])}</li>
                  <li>${escapeHtml(portalCopy.portalDetails[3])}</li>
                </ul>
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
    console.warn("Hostinger Mail API is not configured. Skipping meeting invitation email.");
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
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border-spacing: 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
            <tr>
              <td style="padding: 16px 18px; font-size: 14px; line-height: 22px; color: #475569; text-align: center;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">${escapeHtml(meetingCopy.appointment)}</div>
                <div style="font-size: 16px; font-weight: 700; color: #0f172a;">${escapeHtml(title)}</div>
                ${appointment ? `<p>${escapeHtml(appointment)}</p>` : ""}
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
