import type { Lang } from "@/lib/i18n/translations";
import { PLAIN_ALARM_SIGNS } from "@/lib/i18n/emergency-signs";
import { withLangPrefix } from "@/lib/i18n/routing";

/**
 * All copy for the landing hero, in one place per locale.
 *
 * Rules this file follows (checked by Hero.test.ts):
 * - every locale defines every key, so no locale ever falls back to another language;
 * - sentence case throughout, no ampersands in prose;
 * - the Romanian headline is the wording from the platform concept;
 * - every answer is short: a title, one line or a short list, one action.
 */

export type HeroNeedId = "problem" | "risk" | "doctor" | "nearby" | "prescription" | "navigate";

export type HeroNeedPoint = { label?: string; text: string };

export type HeroNeed = {
  /** Button label on step 1, phrased the way a person would say it. */
  label: string;
  /** Short behavioural preview shown in the panel subtitle on hover, focus, or selection. */
  hint: string;
  /** P29: When true, Step 1 links straight to `action.href` without opening a middle card. */
  direct?: boolean;
  title: string;
  body?: string;
  points?: HeroNeedPoint[];
  action: { label: string; href: string };
};

export type HeroCopy = {
  emergency: {
    /** Label of the bottom sheet's close button. */
    close: string;
    /** Shown on the "health problem" branch, above the 112 action. */
    alarmSigns: string[];
    /** The hero's one 112 line, under the lead: "In a medical emergency," then the tel: link text. */
    callLead: string;
    callLink: string;
  };
  title: string;
  lead: string;
  /** Short plain trust line shown directly under the headline on both desktop and mobile. */
  trustLine: string;
  /** Phones and tablets: the headline as two short sentences (the second uses a muted tone). */
  mobileTitle: [string, string];
  /** Phones and tablets: the two trust facts under the headline. */
  mobileLead: string;
  /** Desktop: the three facts under the lead, as plain words with a hairline between them. */
  trust: [string, string, string];
  /** The concept's three-step journey, shown on the care path. */
  journey: [string, string, string];
  /** Single primary entry CTA label on the hero (navigates to /health-check). */
  primaryCta: string;
  /** One line under the main button: the check covers the body and the mind. */
  checkNote: string;
  /** Heading above the three other entries (medicines, pharmacies and clinics, health mediator). */
  moreWays: string;
  /** One plain line: guides can be saved and read without internet. */
  offlineLine: string;
  panel: {
    label: string;
    listen: string;
    stopListening: string;
    /** Appended to the read-aloud tooltip when the browser has no voice for this language. */
    fallbackVoice: string;
    /** Footer link on step 1, to the health mediators' page. */
    mediators: string;
    question: string;
    /** Static footer subtitle plus live speaking indicator. */
    subtitles: {
      default: string;
      speaking: string;
    };
    back: string;
    step: (current: number, total: number) => string;
    doctorPrompt: string;
    doctorLink: string;
    /** Problem branch: 112 comes first, the doctor second. */
    problemDoctorPrompt: string;
    problemDoctorLink: string;
    needs: Record<HeroNeedId, HeroNeed>;
  };
};

export const HERO_NEED_ORDER: HeroNeedId[] = ["problem", "risk", "doctor", "nearby", "prescription", "navigate"];

/**
 * Keeps hero links in the visitor's language, matching the header's links.
 * `tel:` links and the staff panel (not a localized route) pass through.
 */
export function localHref(href: string, lang: Lang): string {
  if (!href.startsWith("/") || href.startsWith("/panel")) return href;
  return withLangPrefix(href, lang);
}

const en: HeroCopy = {
  emergency: {
    close: "Close",
    alarmSigns: PLAIN_ALARM_SIGNS.en,
    callLead: "In a medical emergency,",
    callLink: "call 112",
  },
  title: "Clear health information and help finding the right care.",
  lead: "Open to everyone, with dedicated support for Roma communities. Free, private, and no account needed.",
  trustLine: "Free, private, and no account needed.",
  mobileTitle: ["Free health information.", "Help finding the right care."],
  mobileLead: "Private, with no account needed.",
  trust: ["Free", "Private", "No account needed"],
  journey: ["Say what worries you", "Get clear next steps", "Talk to a doctor"],
  primaryCta: "Check your symptoms",
  checkNote: "For body or mind: show where it hurts or say how you feel.",
  moreWays: "More ways we can help",
  offlineLine: "You can save guides and read them without internet.",
  panel: {
    label: "Health assistant",
    listen: "Listen",
    stopListening: "Stop",
    fallbackVoice: "backup voice",
    mediators: "Ask a mediator",
    question: "How can we help you today?",
    subtitles: {
      default: "Free and private, instant next step.",
      speaking: "Reading the options aloud.",
    },
    back: "Back",
    step: (current, total) => `Step ${current} of ${total}`,
    doctorPrompt: "Want to talk to a doctor?",
    doctorLink: "Talk to a doctor",
    problemDoctorPrompt: "None of these?",
    problemDoctorLink: "Talk to a doctor",
    needs: {
      doctor: {
        label: "Talk to a doctor online",
        hint: "Free phone call with a doctor.",
        title: "Talk to a doctor from home",
        points: [
          { text: "Free, no card or account needed." },
          { text: "The doctor calls you on the phone." },
          { text: "Every day, 08:00 to 20:00." },
        ],
        action: { label: "Talk to a doctor now", href: "/medic-online" },
      },
      risk: {
        label: "Check my symptoms",
        hint: "Point where it hurts in a few short steps.",
        direct: true,
        title: "Show us where it hurts",
        body: "Tap where it hurts, answer a few short questions and see what to do next.",
        action: { label: "Start the check", href: "/health-check" },
      },
      nearby: {
        label: "Find a pharmacy or doctor nearby",
        hint: "Pharmacies, doctors and clinics on a map.",
        title: "Pharmacies, doctors and hospitals near you",
        points: [
          { text: "A pharmacist can advise you for free, without an appointment." },
          { text: "See family doctors, clinics and hospitals on the map." },
          { text: "Choose your country or use your location." },
        ],
        action: { label: "See places near you", href: "/find-help" },
      },
      problem: {
        label: "I feel unwell right now",
        hint: "112 warning signs or talk to a doctor.",
        title: "First, check the alarm signs",
        body: "Call 112 now if you have any of these:",
        action: { label: "Call 112", href: "tel:112" },
      },
      prescription: {
        label: "Understand my prescription",
        hint: "Snap a photo to understand each pill.",
        direct: true,
        title: "Your prescription, explained",
        body: "Take a photo and we explain each medicine: what it is for and when to take it.",
        action: { label: "Explain my prescription", href: "/prescription-review" },
      },
      navigate: {
        label: "Not sure where to go",
        hint: "Where to go, even without insurance.",
        title: "Where to go, and what to bring",
        points: [
          { text: "Sign up with a family doctor, even without insurance." },
          { text: "Bring your identity card." },
          { text: "Emergency care at the hospital is free for everyone." },
        ],
        action: { label: "Ask a person", href: "/get-help?mode=mediator" },
      },
    },
  },
};

const ro: HeroCopy = {
  emergency: {
    close: "Închide",
    alarmSigns: PLAIN_ALARM_SIGNS.ro,
    callLead: "Pentru o urgență medicală,",
    callLink: "sună la 112",
  },
  title: "Informații medicale clare și ajutor să ajungi la medic.",
  lead: "Deschis tuturor, cu sprijin dedicat comunităților rome. Gratuit, confidențial și fără cont.",
  trustLine: "Gratuit, confidențial și fără cont.",
  mobileTitle: ["Informații de sănătate gratuite.", "Ajutor să ajungi la medic."],
  mobileLead: "Confidențial și fără cont.",
  trust: ["Gratuit", "Confidențial", "Fără cont"],
  journey: ["Spui ce te îngrijorează", "Primești pașii de urmat", "Vorbești cu un medic"],
  primaryCta: "Verifică simptomele",
  checkNote: "Pentru corp sau minte: arată unde te doare sau spune cum te simți.",
  moreWays: "Alte moduri prin care te ajutăm",
  offlineLine: "Poți salva ghidurile și le poți citi fără internet.",
  panel: {
    label: "Asistent",
    listen: "Ascultă",
    stopListening: "Oprește",
    fallbackVoice: "voce de rezervă",
    mediators: "Cere un mediator",
    question: "Cu ce te putem ajuta astăzi?",
    subtitles: {
      default: "Gratuit și fără cont, răspuns imediat.",
      speaking: "Citim opțiunile cu voce tare.",
    },
    back: "Înapoi",
    step: (current, total) => `Pasul ${current} din ${total}`,
    doctorPrompt: "Vrei să vorbești cu un medic?",
    doctorLink: "Vorbește cu un medic",
    problemDoctorPrompt: "Niciunul dintre acestea?",
    problemDoctorLink: "Vorbește cu un medic",
    needs: {
      doctor: {
        label: "Vorbește cu un medic online",
        hint: "Apel gratuit la telefon cu un medic.",
        title: "Vorbește cu un medic de acasă",
        points: [
          { text: "Gratuit, fără card și fără cont." },
          { text: "Medicul te sună la telefon." },
          { text: "Zilnic, între 08:00 și 20:00." },
        ],
        action: { label: "Vorbește cu un medic", href: "/medic-online" },
      },
      risk: {
        label: "Verifică simptomele",
        hint: "Arăți unde te doare în câțiva pași scurți.",
        direct: true,
        title: "Arată unde te doare",
        body: "Atinge locul unde te doare, răspunde la câteva întrebări scurte și vezi ce faci mai departe.",
        action: { label: "Începe verificarea", href: "/health-check" },
      },
      nearby: {
        label: "Găsește o farmacie sau un medic aproape",
        hint: "Farmacii, clinici și spitale pe hartă.",
        title: "Farmacii, cabinete și spitale lângă tine",
        points: [
          { text: "Farmacistul te poate sfătui gratuit, fără programare." },
          { text: "Vezi pe hartă medici de familie, clinici și spitale." },
          { text: "Alege țara sau folosește locația ta." },
        ],
        action: { label: "Vezi locuri lângă tine", href: "/find-help" },
      },
      problem: {
        label: "Nu mă simt bine acum",
        hint: "Semne de urgență 112 sau medic online.",
        title: "Întâi, verifică semnele de alarmă",
        body: "Sună acum la 112 dacă ai oricare dintre acestea:",
        action: { label: "Sună la 112", href: "tel:112" },
      },
      prescription: {
        label: "Înțelege o rețetă medicală",
        hint: "Faci o poză rețetei și îți explicăm.",
        direct: true,
        title: "Rețeta ta, explicată",
        body: "Fă o poză rețetei și îți explicăm fiecare medicament: la ce folosește și când îl iei.",
        action: { label: "Explică-mi rețeta", href: "/prescription-review" },
      },
      navigate: {
        label: "Nu știu unde să merg",
        hint: "Unde mergi, chiar și fără asigurare.",
        title: "Unde mergi și ce acte iei",
        points: [
          { text: "Înscrie-te la un medic de familie, chiar și fără asigurare." },
          { text: "Ia buletinul cu tine." },
          { text: "Urgențele la spital sunt gratuite pentru toți." },
        ],
        action: { label: "Cere ajutor", href: "/get-help?mode=mediator" },
      },
    },
  },
};

const sq: HeroCopy = {
  emergency: {
    close: "Mbyll",
    alarmSigns: PLAIN_ALARM_SIGNS.sq,
    callLead: "Në rast urgjence mjekësore,",
    callLink: "telefono 112",
  },
  title: "Informacion i qartë shëndetësor dhe ndihmë për kujdesin e duhur.",
  lead: "E hapur për të gjithë, me mbështetje për komunitetet rome. Falas, konfidenciale dhe pa llogari.",
  trustLine: "Falas, konfidenciale dhe pa llogari.",
  mobileTitle: ["Informacion shëndetësor falas.", "Ndihmë për kujdesin e duhur."],
  mobileLead: "Konfidenciale dhe pa llogari.",
  trust: ["Falas", "Konfidenciale", "Pa llogari"],
  journey: ["Thua çfarë të shqetëson", "Merr hapat e radhës", "Flet me një mjek"],
  primaryCta: "Kontrollo simptomat",
  checkNote: "Për trupin ose mendjen: trego ku të dhemb ose thuaj si ndihesh.",
  moreWays: "Mënyra të tjera si të ndihmojmë",
  offlineLine: "Mund t'i ruash udhëzuesit dhe t'i lexosh pa internet.",
  panel: {
    label: "Asistent shëndetësor",
    listen: "Dëgjo",
    stopListening: "Ndalo",
    fallbackVoice: "zë rezervë",
    mediators: "Kërko një mediator",
    question: "Si mund të të ndihmojmë sot?",
    subtitles: {
      default: "Falas dhe pa llogari, hapi tjetër direkt.",
      speaking: "Po i lexojmë zgjedhjet me zë.",
    },
    back: "Kthehu",
    step: (current, total) => `Hapi ${current} nga ${total}`,
    doctorPrompt: "Do të flasësh me një mjek?",
    doctorLink: "Fol me një mjek",
    problemDoctorPrompt: "Asnjë nga këto?",
    problemDoctorLink: "Fol me një mjek",
    needs: {
      doctor: {
        label: "Fol me një mjek online",
        hint: "Telefonatë falas me një mjek.",
        title: "Fol me një mjek nga shtëpia",
        points: [
          { text: "Falas, pa kartë dhe pa llogari." },
          { text: "Mjeku të telefonon në telefon." },
          { text: "Çdo ditë, nga 08:00 në 20:00." },
        ],
        action: { label: "Fol me një mjek tani", href: "/medic-online" },
      },
      risk: {
        label: "Kontrollo simptomat",
        hint: "Trego ku të dhemb në disa hapa të shkurtër.",
        direct: true,
        title: "Trego ku të dhemb",
        body: "Prek ku të dhemb, përgjigju disa pyetjeve të shkurtra dhe shiko çfarë të bësh më pas.",
        action: { label: "Fillo kontrollin", href: "/health-check" },
      },
      nearby: {
        label: "Gjej një farmaci ose mjek afër",
        hint: "Farmaci, mjekë dhe spitale në hartë.",
        title: "Farmaci, ambulanca dhe spitale pranë teje",
        points: [
          { text: "Farmacisti mund të të këshillojë falas, pa takim." },
          { text: "Shiko në hartë mjekë familjeje, klinika dhe spitale." },
          { text: "Zgjidh vendin ose përdor vendndodhjen tënde." },
        ],
        action: { label: "Shiko vende pranë teje", href: "/find-help" },
      },
      problem: {
        label: "Nuk ndihem mirë tani",
        hint: "Shenjat e urgjencës 112 ose mjek online.",
        title: "Së pari, kontrollo shenjat e alarmit",
        body: "Telefono tani 112 nëse ke ndonjë nga këto:",
        action: { label: "Telefono 112", href: "tel:112" },
      },
      prescription: {
        label: "Kupto recetën mjekësore",
        hint: "Bëji foto recetës për çdo shpjegim.",
        direct: true,
        title: "Receta jote, e shpjeguar",
        body: "Bëji një foto recetës dhe të shpjegojmë çdo ilaç: për çfarë shërben dhe kur merret.",
        action: { label: "Shpjego recetën time", href: "/prescription-review" },
      },
      navigate: {
        label: "Nuk di ku të shkoj",
        hint: "Ku të shkosh, edhe pa sigurim.",
        title: "Ku të shkosh dhe çfarë të marrësh",
        points: [
          { text: "Regjistrohu te një mjek familjeje, edhe pa sigurim." },
          { text: "Merr kartën e identitetit me vete." },
          { text: "Urgjenca në spital është falas për të gjithë." },
        ],
        action: { label: "Kërko ndihmë", href: "/get-help?mode=mediator" },
      },
    },
  },
};

const it: HeroCopy = {
  emergency: {
    close: "Chiudi",
    alarmSigns: PLAIN_ALARM_SIGNS.it,
    callLead: "In caso di emergenza medica,",
    callLink: "chiama il 112",
  },
  title: "Informazioni chiare sulla salute e aiuto per trovare le cure giuste.",
  lead: "Aperto a tutti, con supporto dedicato alle comunità rom. Gratuito, riservato e senza registrazione.",
  trustLine: "Gratuito, riservato e senza registrazione.",
  mobileTitle: ["Informazioni sanitarie gratuite.", "Aiuto per trovare le cure giuste."],
  mobileLead: "Riservato e senza registrazione.",
  trust: ["Gratuito", "Riservato", "Senza registrazione"],
  journey: ["Dici cosa ti preoccupa", "Ricevi i passi da seguire", "Parli con un medico"],
  primaryCta: "Controlla i sintomi",
  checkNote: "Per il corpo o la mente: indica dove fa male o racconta come ti senti.",
  moreWays: "Altri modi in cui ti aiutiamo",
  offlineLine: "Puoi salvare le guide e leggerle senza internet.",
  panel: {
    label: "Assistente sanitario",
    listen: "Ascolta",
    stopListening: "Ferma",
    fallbackVoice: "voce di riserva",
    mediators: "Chiedi un mediatore",
    question: "Come possiamo aiutarti oggi?",
    subtitles: {
      default: "Gratuito e riservato, aiuto immediato.",
      speaking: "Leggiamo le opzioni ad alta voce.",
    },
    back: "Indietro",
    step: (current, total) => `Passo ${current} di ${total}`,
    doctorPrompt: "Vuoi parlare con un medico?",
    doctorLink: "Parla con un medico",
    problemDoctorPrompt: "Nessuno di questi?",
    problemDoctorLink: "Parla con un medico",
    needs: {
      doctor: {
        label: "Parla con un medico online",
        hint: "Chiamata gratuita con un medico.",
        title: "Parla con un medico da casa",
        points: [
          { text: "Gratis, senza tessera né account." },
          { text: "Il medico ti chiama al telefono." },
          { text: "Tutti i giorni, dalle 08:00 alle 20:00." },
        ],
        action: { label: "Parla ora con un medico", href: "/medic-online" },
      },
      risk: {
        label: "Controlla i sintomi",
        hint: "Indica dove fa male in pochi brevi passi.",
        direct: true,
        title: "Indica dove fa male",
        body: "Tocca dove fa male, rispondi ad alcune domande brevi e vedi cosa fare dopo.",
        action: { label: "Inizia il controllo", href: "/health-check" },
      },
      nearby: {
        label: "Trova una farmacia o un medico vicino",
        hint: "Farmacie, medici e ospedali su una mappa.",
        title: "Farmacie, ambulatori e ospedali vicino a te",
        points: [
          { text: "Il farmacista può consigliarti gratis, senza appuntamento." },
          { text: "Vedi sulla mappa medici di base, ambulatori e ospedali." },
          { text: "Scegli il paese o usa la tua posizione." },
        ],
        action: { label: "Vedi luoghi vicini a te", href: "/find-help" },
      },
      problem: {
        label: "Non mi sento bene adesso",
        hint: "Segnali urgenti 112 o medico online.",
        title: "Prima, controlla i segnali di allarme",
        body: "Chiama subito il 112 se hai uno di questi segnali:",
        action: { label: "Chiama il 112", href: "tel:112" },
      },
      prescription: {
        label: "Capisci la tua ricetta medica",
        hint: "Scatta una foto per capire la ricetta.",
        direct: true,
        title: "La tua ricetta, spiegata",
        body: "Fai una foto alla ricetta e ti spieghiamo ogni farmaco: a cosa serve e quando prenderlo.",
        action: { label: "Spiegami la ricetta", href: "/prescription-review" },
      },
      navigate: {
        label: "Non so dove andare",
        hint: "Dove andare, anche senza tessera.",
        title: "Dove andare e cosa portare",
        points: [
          { text: "Iscriviti da un medico di famiglia, anche senza assicurazione." },
          { text: "Porta la carta d'identità." },
          { text: "Il pronto soccorso in ospedale è gratuito per tutti." },
        ],
        action: { label: "Chiedi aiuto", href: "/get-help?mode=mediator" },
      },
    },
  },
};

const hr: HeroCopy = {
  emergency: {
    close: "Zatvori",
    alarmSigns: PLAIN_ALARM_SIGNS.hr,
    callLead: "U hitnom medicinskom slučaju,",
    callLink: "nazovi 112",
  },
  title: "Jasne informacije o zdravlju i pomoć do prave skrbi.",
  lead: "Otvoreno svima, uz podršku romskim zajednicama. Besplatno, povjerljivo i bez prijave.",
  trustLine: "Besplatno, povjerljivo i bez prijave.",
  mobileTitle: ["Besplatne informacije o zdravlju.", "Pomoć do prave skrbi."],
  mobileLead: "Povjerljivo i bez prijave.",
  trust: ["Besplatno", "Povjerljivo", "Bez prijave"],
  journey: ["Reci što te brine", "Dobij jasne sljedeće korake", "Razgovaraj s liječnikom"],
  primaryCta: "Provjeri simptome",
  checkNote: "Za tijelo ili um: pokaži gdje te boli ili reci kako se osjećaš.",
  moreWays: "Drugi načini na koje pomažemo",
  offlineLine: "Vodiče možeš spremiti i čitati bez interneta.",
  panel: {
    label: "Zdravstveni asistent",
    listen: "Poslušaj",
    stopListening: "Zaustavi",
    fallbackVoice: "rezervni glas",
    mediators: "Zatraži medijatora",
    question: "Kako ti danas možemo pomoći?",
    subtitles: {
      default: "Besplatno i povjerljivo, sljedeći korak.",
      speaking: "Čitamo opcije naglas.",
    },
    back: "Natrag",
    step: (current, total) => `Korak ${current} od ${total}`,
    doctorPrompt: "Želiš li razgovarati s liječnikom?",
    doctorLink: "Razgovaraj s liječnikom",
    problemDoctorPrompt: "Ništa od toga?",
    problemDoctorLink: "Razgovaraj s liječnikom",
    needs: {
      doctor: {
        label: "Razgovaraj s liječnikom online",
        hint: "Besplatan telefonski poziv s liječnikom.",
        title: "Razgovaraj s liječnikom od kuće",
        points: [
          { text: "Besplatno, bez kartice i računa." },
          { text: "Liječnik te zove na telefon." },
          { text: "Svaki dan, od 08:00 do 20:00." },
        ],
        action: { label: "Razgovaraj s liječnikom", href: "/medic-online" },
      },
      risk: {
        label: "Provjeri simptome",
        hint: "Pokaži gdje boli u nekoliko kratkih koraka.",
        direct: true,
        title: "Pokaži gdje te boli",
        body: "Dodirni gdje boli, odgovori na nekoliko kratkih pitanja i saznaj što dalje.",
        action: { label: "Pokreni provjeru", href: "/health-check" },
      },
      nearby: {
        label: "Pronađi ljekarnu ili liječnika blizu",
        hint: "Ljekarne, liječnici i bolnice na karti.",
        title: "Ljekarne, ambulante i bolnice blizu tebe",
        points: [
          { text: "Ljekarnik te može besplatno savjetovati, bez naručivanja." },
          { text: "Pogledaj na karti obiteljske liječnike, klinike i bolnice." },
          { text: "Odaberi državu ili koristi svoju lokaciju." },
        ],
        action: { label: "Vidi mjesta u blizini", href: "/find-help" },
      },
      problem: {
        label: "Ne osjećam se dobro sada",
        hint: "Hitni znakovi za 112 ili online liječnik.",
        title: "Prvo provjeri znakove uzbune",
        body: "Odmah nazovi 112 ako imaš bilo koji od ovih znakova:",
        action: { label: "Nazovi 112", href: "tel:112" },
      },
      prescription: {
        label: "Razumij svoj liječnički recept",
        hint: "Uslikaj recept za jasno objašnjenje.",
        direct: true,
        title: "Tvoj recept jednostavnim riječima",
        body: "Fotografiraj recept i objasnit ćemo svaki lijek: čemu služi i kada se uzima.",
        action: { label: "Objasni mi recept", href: "/prescription-review" },
      },
      navigate: {
        label: "Ne znam kamo ići",
        hint: "Kamo ići, čak i bez osiguranja.",
        title: "Kamo ići i što ponijeti",
        points: [
          { text: "Upiši se kod obiteljskog liječnika, čak i bez osiguranja." },
          { text: "Ponesi osobnu iskaznicu." },
          { text: "Hitna pomoć u bolnici besplatna je za sve." },
        ],
        action: { label: "Zatraži pomoć", href: "/get-help?mode=mediator" },
      },
    },
  },
};

const rom: HeroCopy = {
  emergency: {
    close: "Phandav",
    alarmSigns: PLAIN_ALARM_SIGNS.rom,
    callLead: "Ki sastipnaski sigardiari,",
    callLink: "akhar ko 112",
  },
  title: "Klare informaciye vash o sastipen thaj zhutimos te reses ko doktori.",
  lead: "Putardo savorenge, zhutipnasa vash e romane komunitetya. Bi lovesko, garavdo thaj bi kontosko.",
  trustLine: "Bi lovesko, garavdo thaj bi kontosko.",
  mobileTitle: ["Informaciye vash o sastipen.", "Zhutimos te reses ko doktori."],
  mobileLead: "Garavdo thaj bi kontosko.",
  trust: ["Bi lovesko", "Garavdo", "Bi kontosko"],
  journey: ["Phen so daravel tut", "Le chache pasha", "Vaker ekhe doktoreya"],
  primaryCta: "Dikh e simptome",
  checkNote: "Vash o trupo vaj e godi: sikav kay dukhal tut vaj phen sar hatyares tut.",
  moreWays: "Aver droma sar shaj azhutis tut",
  offlineLine: "Shay garaves e gidurya thaj drabares len bi internetesko.",
  panel: {
    label: "Sastipnasko azhutitori",
    listen: "Ashun",
    stopListening: "Achav",
    fallbackVoice: "rezervno glaso",
    mediators: "Mang ekhe mediatore",
    question: "So shay te zhutisaras tut adyes?",
    subtitles: {
      default: "Bi lovesko thaj garavdo, sigo pash.",
      speaking: "Ginas e opciye glasosa.",
    },
    back: "Palpale",
    step: (current, total) => `Pash ${current} katar ${total}`,
    doctorPrompt: "Kames te vakeres ekhe doktoreya?",
    doctorLink: "Vaker ekhe doktoreya",
    problemDoctorPrompt: "Nijekh katar kadala?",
    problemDoctorLink: "Vaker ekhe doktoreya",
    needs: {
      doctor: {
        label: "Vaker ekhe doktoreya online",
        hint: "Bi lovesko akharipe po telefono.",
        title: "Vaker ekhe doktoreya kheral",
        points: [
          { text: "Bi lovesko, bi kartako thaj bi kontosko." },
          { text: "O doktori akharel tut po telefono." },
          { text: "Sako dives, katar 08:00 zhi 20:00." },
        ],
        action: { label: "Vaker ekhe doktoreya", href: "/medic-online" },
      },
      risk: {
        label: "Dikh e simptome",
        hint: "Sikav kay dukhal ande nekobor skurte pasha.",
        direct: true,
        title: "Sikav kay dukhal tut",
        body: "Azba kay dukhal, de palpale pe nekobor skurte phuchimata thaj dikh so te keres may dur.",
        action: { label: "Shird o dikhiben", href: "/health-check" },
      },
      nearby: {
        label: "Arakh farmaciya vay doktori pashal",
        hint: "Farmaciye, doktorya thaj bolnitse pi mapa.",
        title: "Farmaciye, kabinetya thaj bolnitse pashal tute",
        points: [
          { text: "O farmacisto shay te del tut godi bi lovesko, bi programiripnasko." },
          { text: "Dikh pi mapa familiyake doktorya, klinike thaj bolnitse." },
          { text: "Alosar o them vay labar cho than." },
        ],
        action: { label: "Dikh thana pashal tute", href: "/find-help" },
      },
      problem: {
        label: "Na xatyarav man mishto akana",
        hint: "Daravne semnya 112 vay doktori online.",
        title: "Anglunes, dikh e daravne semnya",
        body: "Akhar akana ko 112 te si tut varesavo katar kadala:",
        action: { label: "Akhar ko 112", href: "tel:112" },
      },
      prescription: {
        label: "Xatyar chi doktoreski receta",
        hint: "Ker chitro te xatyares sako drab.",
        direct: true,
        title: "Chi receta, ashkardi",
        body: "Ker ekh chitro e recetake thaj ashkaras sako drab: soske si thaj kana te les la.",
        action: { label: "Xatyar mange i receta", href: "/prescription-review" },
      },
      navigate: {
        label: "Na zhanav kay te zhav",
        hint: "Kay te zhas, vi bi siguraciyako.",
        title: "Kay te zhas thaj so te ingares",
        points: [
          { text: "Lekhav tut ko familiyako doktori, vi bi siguraciyako." },
          { text: "Ingar tusa chi buletina." },
          { text: "I sigardiari ki bolnitsa si bi lovesko savorenge." },
        ],
        action: { label: "Mang zhutimos", href: "/get-help?mode=mediator" },
      },
    },
  },
};

export const heroCopy: Record<Lang, HeroCopy> = {
ru: {
  emergency: {
    close: "Закрыть",
    alarmSigns: PLAIN_ALARM_SIGNS.ru,
    callLead: "В экстренном случае",
    callLink: "звоните 112",
  },
  title: "Понятная информация о здоровье и помощь в поиске врача.",
  lead: "Открыто для всех, с поддержкой ромских общин. Бесплатно, конфиденциально и без регистрации.",
  trustLine: "Бесплатно, конфиденциально и без регистрации.",
  mobileTitle: ["Бесплатная информация о здоровье.", "Помощь в поиске врача."],
  mobileLead: "Конфиденциально и без регистрации.",
  trust: ["Бесплатно", "Конфиденциально", "Без регистрации"],
  journey: ["Расскажите, что вас беспокоит", "Узнайте, что делать дальше", "Поговорите с врачом"],
  primaryCta: "Проверить симптомы",
  checkNote: "Для тела и души: покажите, где болит, или расскажите, как вы себя чувствуете.",
  moreWays: "Чем ещё мы можем помочь",
  offlineLine: "Памятки можно сохранить и читать без интернета.",
  panel: {
    label: "Помощник по здоровью",
    listen: "Слушать",
    stopListening: "Стоп",
    fallbackVoice: "резервный голос",
    mediators: "Обратиться к медиатору",
    question: "Чем мы можем помочь сегодня?",
    subtitles: {
      default: "Бесплатно и анонимно, быстрый ответ.",
      speaking: "Читаем варианты вслух.",
    },
    back: "Назад",
    step: (current, total) => `Шаг ${current} из ${total}`,
    doctorPrompt: "Хотите поговорить с врачом?",
    doctorLink: "Поговорите с врачом",
    problemDoctorPrompt: "Ничего из этого?",
    problemDoctorLink: "Поговорите с врачом",
    needs: {
      doctor: {
        label: "Поговорить с врачом онлайн",
        hint: "Бесплатный звонок врача по телефону.",
        title: "Поговорите с врачом из дома",
        points: [
          { text: "Бесплатно, без карты и аккаунта." },
          { text: "Врач сам позвонит вам по телефону." },
          { text: "Каждый день с 08:00 до 20:00." },
        ],
        action: { label: "Поговорить с врачом", href: "/medic-online" },
      },
      risk: {
        label: "Проверить симптомы",
        hint: "Покажите, где болит, за несколько шагов.",
        direct: true,
        title: "Покажите, где болит",
        body: "Нажмите, где болит, ответьте на несколько коротких вопросов и узнайте, что делать дальше.",
        action: { label: "Начать проверку", href: "/health-check" },
      },
      nearby: {
        label: "Найти аптеку или врача рядом",
        hint: "Аптеки, врачи и больницы на карте.",
        title: "Аптеки, клиники и больницы рядом с вами",
        points: [
          { text: "Фармацевт подскажет бесплатно и без записи." },
          { text: "Смотрите семейных врачей, клиники и больницы на карте." },
          { text: "Выберите страну или укажите, где вы находитесь." },
        ],
        action: { label: "Показать места рядом", href: "/find-help" },
      },
      problem: {
        label: "Мне сейчас плохо",
        hint: "Признаки для 112 или врач онлайн.",
        title: "Сначала проверьте опасные симптомы",
        body: "Сразу звоните 112, если есть хотя бы один из признаков:",
        action: { label: "Позвонить 112", href: "tel:112" },
      },
      prescription: {
        label: "Разобрать рецепт врача",
        hint: "Сфотографируйте рецепт для разбора.",
        direct: true,
        title: "Ваш рецепт простыми словами",
        body: "Сфотографируйте рецепт, и мы объясним, зачем нужно каждое лекарство и когда его принимать.",
        action: { label: "Объяснить рецепт", href: "/prescription-review" },
      },
      navigate: {
        label: "Не знаю, куда обратиться",
        hint: "Куда идти даже без страховки.",
        title: "Куда пойти и что взять с собой",
        points: [
          { text: "Запишитесь к семейному врачу даже без страховки." },
          { text: "Возьмите с собой удостоверение личности." },
          { text: "Скорая помощь в больнице бесплатна для всех." },
        ],
        action: { label: "Попросить помощь", href: "/get-help?mode=mediator" },
      },
    },
  },
},
 en, ro, sq, it, hr, rom };
