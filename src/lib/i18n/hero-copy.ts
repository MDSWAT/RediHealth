import type { Lang } from "@/lib/i18n/translations";
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

export type HeroNeedId = "learn" | "risk" | "nearby" | "problem" | "prescription" | "navigate";

export type HeroNeedPoint = { label?: string; text: string };

/** A one-tap true or false check: the concept's "what is true and what is not". */
export type HeroQuiz = {
  prompt: string;
  statement: string;
  trueLabel: string;
  falseLabel: string;
  /** The correct answer to the statement. */
  answer: boolean;
  correct: string;
  incorrect: string;
  explanation: string;
};

export type HeroNeed = {
  /** Button label on step 1, phrased the way a person would say it. */
  label: string;
  /** Short behavioural preview shown in the panel subtitle on hover, focus, or selection. */
  hint: string;
  title: string;
  body?: string;
  points?: HeroNeedPoint[];
  quiz?: HeroQuiz;
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
  /** The concept's three-step journey, shown on the care path. */
  journey: [string, string, string];
  /** Shown on small screens only, where the panel sits below the fold. */
  primaryCta: string;
  panel: {
    label: string;
    listen: string;
    stopListening: string;
    /** Appended to the read-aloud tooltip when the browser has no voice for this language. */
    fallbackVoice: string;
    /** Footer link on step 1, to the health mediators' page. */
    mediators: string;
    question: string;
    /** Dynamic subtitle states driven by live user behaviour. */
    subtitles: {
      default: string;
      speaking: string;
      mediators: string;
      returned: string;
      idle: string;
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

export const HERO_NEED_ORDER: HeroNeedId[] = ["learn", "risk", "nearby", "problem", "prescription", "navigate"];

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
    alarmSigns: [
      "Chest pain or pressure",
      "Hard to breathe",
      "Face drooping, weakness or slurred speech",
      "Fainting or confusion",
      "Heavy bleeding",
    ],
    callLead: "In a medical emergency,",
    callLink: "call 112",
  },
  title: "Clear medical advice and help finding the right care.",
  lead: "Open to everyone, with dedicated support for Roma communities. Free, private, and no account needed.",
  journey: ["Say what worries you", "Get clear next steps", "Talk to a doctor"],
  primaryCta: "Tell us what worries you",
  panel: {
    label: "Assistant",
    listen: "Read aloud",
    stopListening: "Stop reading",
    fallbackVoice: "backup voice",
    mediators: "For health mediators",
    question: "How can we help you today?",
    subtitles: {
      default: "Free and private, instant next step.",
      speaking: "Reading the options aloud.",
      mediators: "Field tools for health mediators.",
      returned: "Pick another option anytime.",
      idle: "Not sure? Try the last option above.",
    },
    back: "Back",
    step: (current, total) => `Step ${current} of ${total}`,
    doctorPrompt: "Want to talk to a doctor?",
    doctorLink: "Book a call",
    problemDoctorPrompt: "No alarm signs?",
    problemDoctorLink: "Talk to a doctor online",
    needs: {
      learn: {
        label: "Read simple health guides",
        hint: "Short lessons on blood pressure and care.",
        title: "Short lessons about your health",
        quiz: {
          prompt: "True or false?",
          statement: "Once your blood pressure is back to normal, you can stop the pills.",
          trueLabel: "True",
          falseLabel: "False",
          answer: false,
          correct: "That's right.",
          incorrect: "Not quite.",
          explanation: "Your blood pressure is normal because of the pills. Do not stop them without talking to your doctor.",
        },
        action: { label: "Start a lesson", href: "/health-information" },
      },
      risk: {
        label: "Check my symptoms",
        hint: "Point where it hurts in 3 quick steps.",
        title: "Show us where it hurts",
        body: "Tap where it hurts, answer 3 questions and see what to do next.",
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
        action: { label: "Open the map", href: "/find-help" },
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
        title: "Your prescription, explained",
        body: "Take a photo. We explain each medicine: what it is for and when to take it.",
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
        action: { label: "Get help from a person", href: "/get-help?mode=mediator" },
      },
    },
  },
};

const ro: HeroCopy = {
  emergency: {
    close: "Închide",
    alarmSigns: [
      "Durere sau apăsare în piept",
      "Respiri foarte greu",
      "Gura strâmbă, slăbiciune sau vorbire greoaie",
      "Leșin sau confuzie",
      "Sângerare puternică",
    ],
    callLead: "Pentru o urgență medicală,",
    callLink: "sună la 112",
  },
  title: "Informații medicale clare și ajutor să ajungi la medic.",
  lead: "Deschis tuturor, cu sprijin dedicat comunităților rome. Gratuit, confidențial și fără cont.",
  journey: ["Spui ce te îngrijorează", "Primești pașii de urmat", "Vorbești cu un medic"],
  primaryCta: "Spune-ne ce te îngrijorează",
  panel: {
    label: "Asistent",
    listen: "Citește cu voce tare",
    stopListening: "Oprește citirea",
    fallbackVoice: "voce de rezervă",
    mediators: "Pentru mediatori sanitari",
    question: "Cu ce te putem ajuta astăzi?",
    subtitles: {
      default: "Gratuit și fără cont, răspuns imediat.",
      speaking: "Citim opțiunile cu voce tare.",
      mediators: "Instrumente pentru mediatorii din teren.",
      returned: "Poți alege oricând altă situație.",
      idle: "Nu știi ce să alegi? Începe cu ultima.",
    },
    back: "Înapoi",
    step: (current, total) => `Pasul ${current} din ${total}`,
    doctorPrompt: "Vrei să vorbești cu un medic?",
    doctorLink: "Programează un apel",
    problemDoctorPrompt: "Nu ai semne de alarmă?",
    problemDoctorLink: "Vorbește cu un medic online",
    needs: {
      learn: {
        label: "Citește ghiduri simple de sănătate",
        hint: "Lecții scurte despre tensiune și diabet.",
        title: "Lecții scurte despre sănătate",
        quiz: {
          prompt: "Adevărat sau fals?",
          statement: "Dacă tensiunea ți-a revenit la normal, poți opri pastilele.",
          trueLabel: "Adevărat",
          falseLabel: "Fals",
          answer: false,
          correct: "Corect.",
          incorrect: "Nu chiar.",
          explanation: "Tensiunea e normală tocmai datorită pastilelor. Nu le opri fără să vorbești cu medicul.",
        },
        action: { label: "Începe o lecție", href: "/health-information" },
      },
      risk: {
        label: "Verifică ce simptome ai",
        hint: "Arăți unde te doare în 3 pași scurți.",
        title: "Arată unde te doare",
        body: "Atinge locul unde te doare, răspunde la 3 întrebări și vezi ce faci mai departe.",
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
        action: { label: "Deschide harta", href: "/find-help" },
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
        title: "Rețeta ta, explicată",
        body: "Fă o poză rețetei. Îți explicăm fiecare medicament: la ce folosește și când îl iei.",
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
        action: { label: "Cere ajutor de la un om", href: "/get-help?mode=mediator" },
      },
    },
  },
};

const sq: HeroCopy = {
  emergency: {
    close: "Mbyll",
    alarmSigns: [
      "Dhimbje ose shtrëngim në gjoks",
      "Merr frymë me vështirësi",
      "Fytyrë e shtrembër, dobësi ose të folur e paqartë",
      "Të fikët ose konfuzion",
      "Gjakderdhje e rëndë",
    ],
    callLead: "Në rast urgjence mjekësore,",
    callLink: "telefono 112",
  },
  title: "Këshilla mjekësore të qarta dhe ndihmë për kujdesin e duhur.",
  lead: "E hapur për të gjithë, me mbështetje për komunitetet rome. Falas, konfidenciale dhe pa llogari.",
  journey: ["Thua çfarë të shqetëson", "Merr hapat e radhës", "Flet me një mjek"],
  primaryCta: "Na trego çfarë të shqetëson",
  panel: {
    label: "Asistent",
    listen: "Lexo me zë",
    stopListening: "Ndalo leximin",
    fallbackVoice: "zë rezervë",
    mediators: "Për mediatorët shëndetësorë",
    question: "Si mund të të ndihmojmë sot?",
    subtitles: {
      default: "Falas dhe pa llogari, hapi tjetër direkt.",
      speaking: "Po i lexojmë zgjedhjet me zë.",
      mediators: "Mjete pune për mediatorët në terren.",
      returned: "Zgjidh një situatë tjetër kur të duash.",
      idle: "Nuk je i sigurt? Provo zgjedhjen e fundit.",
    },
    back: "Kthehu",
    step: (current, total) => `Hapi ${current} nga ${total}`,
    doctorPrompt: "Do të flasësh me një mjek?",
    doctorLink: "Rezervo një thirrje",
    problemDoctorPrompt: "Nuk ke shenja alarmi?",
    problemDoctorLink: "Fol me një mjek online",
    needs: {
      learn: {
        label: "Lexo udhëzues të thjeshtë shëndeti",
        hint: "Mësime të shkurtra për tension dhe diabet.",
        title: "Mësime të shkurtra për shëndetin",
        quiz: {
          prompt: "E vërtetë apo e rreme?",
          statement: "Nëse presioni të është kthyer në normal, mund t'i lësh ilaçet.",
          trueLabel: "E vërtetë",
          falseLabel: "E rreme",
          answer: false,
          correct: "Saktë.",
          incorrect: "Jo tamam.",
          explanation: "Presioni është normal pikërisht falë ilaçeve. Mos i lër pa folur me mjekun.",
        },
        action: { label: "Fillo një mësim", href: "/health-information" },
      },
      risk: {
        label: "Kontrollo simptomat e tua",
        hint: "Trego ku të dhemb në 3 hapa të shkurtër.",
        title: "Trego ku të dhemb",
        body: "Prek ku të dhemb, përgjigju 3 pyetjeve dhe shiko çfarë të bësh më pas.",
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
        action: { label: "Hap hartën", href: "/find-help" },
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
        title: "Receta jote, e shpjeguar",
        body: "Bëji një foto recetës. Të shpjegojmë çdo ilaç: për çfarë shërben dhe kur merret.",
        action: { label: "Më shpjego recetën", href: "/prescription-review" },
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
        action: { label: "Kërko ndihmë nga një person", href: "/get-help?mode=mediator" },
      },
    },
  },
};

const it: HeroCopy = {
  emergency: {
    close: "Chiudi",
    alarmSigns: [
      "Dolore o oppressione al petto",
      "Fatica a respirare",
      "Bocca storta, debolezza o difficoltà a parlare",
      "Svenimento o confusione",
      "Forte sanguinamento",
    ],
    callLead: "In caso di emergenza medica,",
    callLink: "chiama il 112",
  },
  title: "Consigli medici chiari e aiuto per trovare le cure giuste.",
  lead: "Aperto a tutti, con supporto dedicato alle comunità rom. Gratuito, riservato e senza registrazione.",
  journey: ["Dici cosa ti preoccupa", "Ricevi i passi da seguire", "Parli con un medico"],
  primaryCta: "Dicci cosa ti preoccupa",
  panel: {
    label: "Assistente",
    listen: "Leggi ad alta voce",
    stopListening: "Interrompi la lettura",
    fallbackVoice: "voce di riserva",
    mediators: "Per i mediatori sanitari",
    question: "Come possiamo aiutarti oggi?",
    subtitles: {
      default: "Gratuito e riservato, aiuto immediato.",
      speaking: "Leggiamo le opzioni ad alta voce.",
      mediators: "Strumenti sul campo per i mediatori.",
      returned: "Scegli un'altra opzione quando vuoi.",
      idle: "In dubbio? Prova l'ultima opzione.",
    },
    back: "Indietro",
    step: (current, total) => `Passo ${current} di ${total}`,
    doctorPrompt: "Vuoi parlare con un medico?",
    doctorLink: "Prenota una chiamata",
    problemDoctorPrompt: "Nessun segnale di allarme?",
    problemDoctorLink: "Parla con un medico online",
    needs: {
      learn: {
        label: "Leggi guide semplici sulla salute",
        hint: "Guide brevi su pressione e diabete.",
        title: "Brevi lezioni sulla salute",
        quiz: {
          prompt: "Vero o falso?",
          statement: "Se la pressione è tornata normale, puoi smettere di prendere le pastiglie.",
          trueLabel: "Vero",
          falseLabel: "Falso",
          answer: false,
          correct: "Esatto.",
          incorrect: "Non proprio.",
          explanation: "La pressione è normale proprio grazie alle pastiglie. Non smettere senza parlarne con il medico.",
        },
        action: { label: "Inizia una lezione", href: "/health-information" },
      },
      risk: {
        label: "Controlla i tuoi sintomi",
        hint: "Indica dove fa male in 3 brevi passi.",
        title: "Indica dove fa male",
        body: "Tocca dove fa male, rispondi a 3 domande e vedi cosa fare dopo.",
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
        action: { label: "Apri la mappa", href: "/find-help" },
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
        title: "La tua ricetta, spiegata",
        body: "Fai una foto alla ricetta. Ti spieghiamo ogni farmaco: a cosa serve e quando prenderlo.",
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
        action: { label: "Chiedi aiuto a una persona", href: "/get-help?mode=mediator" },
      },
    },
  },
};

const hr: HeroCopy = {
  emergency: {
    close: "Zatvori",
    alarmSigns: [
      "Bol ili pritisak u prsima",
      "Teško disanje ili nedostatak zraka",
      "Iskrivljeno lice, slabost ili nerazgovijetan govor",
      "Nesvjestica ili zbunjenost",
      "Jako krvarenje",
    ],
    callLead: "U hitnom medicinskom slučaju,",
    callLink: "nazovi 112",
  },
  title: "Jasni medicinski savjeti i pomoć do prave skrbi.",
  lead: "Otvoreno svima, uz podršku romskim zajednicama. Besplatno, povjerljivo i bez prijave.",
  journey: ["Reci što te brine", "Dobij jasne sljedeće korake", "Razgovaraj s liječnikom"],
  primaryCta: "Reci nam što te brine",
  panel: {
    label: "Asistent",
    listen: "Čitaj naglas",
    stopListening: "Zaustavi čitanje",
    fallbackVoice: "rezervni glas",
    mediators: "Za zdravstvene medijatore",
    question: "Kako ti danas možemo pomoći?",
    subtitles: {
      default: "Besplatno i povjerljivo, sljedeći korak.",
      speaking: "Čitamo opcije naglas.",
      mediators: "Alati za zdravstvene medijatore.",
      returned: "Odaberi drugu opciju kad želiš.",
      idle: "Nisi siguran? Probaj zadnju opciju.",
    },
    back: "Natrag",
    step: (current, total) => `Korak ${current} od ${total}`,
    doctorPrompt: "Želiš li razgovarati s liječnikom?",
    doctorLink: "Dogovori poziv",
    problemDoctorPrompt: "Nemaš znakove uzbune?",
    problemDoctorLink: "Razgovaraj s liječnikom online",
    needs: {
      learn: {
        label: "Čitaj jednostavne vodiče o zdravlju",
        hint: "Kratke lekcije o tlaku i dijabetesu.",
        title: "Kratke lekcije o zdravlju",
        quiz: {
          prompt: "Točno ili netočno?",
          statement: "Kad se krvni tlak vrati u normalu, možeš prestati piti tablete.",
          trueLabel: "Točno",
          falseLabel: "Netočno",
          answer: false,
          correct: "Tako je.",
          incorrect: "Nije baš tako.",
          explanation: "Krvni tlak je normalan upravo zbog tableta. Nemoj ih prestati uzimati bez razgovora s liječnikom.",
        },
        action: { label: "Započni lekciju", href: "/health-information" },
      },
      risk: {
        label: "Provjeri svoje simptome",
        hint: "Pokaži gdje boli u 3 kratka koraka.",
        title: "Pokaži gdje te boli",
        body: "Dodirni gdje boli, odgovori na 3 pitanja i saznaj što dalje.",
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
        action: { label: "Otvori kartu", href: "/find-help" },
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
        title: "Tvoj recept jednostavnim riječima",
        body: "Fotografiraj recept. Objašnjavamo svaki lijek: čemu služi i kada se uzima.",
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
        action: { label: "Zatraži pomoć osobe", href: "/get-help?mode=mediator" },
      },
    },
  },
};

const rom: HeroCopy = {
  emergency: {
    close: "Phandav",
    alarmSigns: [
      "Dukh vay tasavipe ando kolin",
      "Phari phurdinimos",
      "Bango muy, kovlipe vay pharo vakeripe",
      "Peripe vay bisterdipe",
      "Zuralo ratvalo thavdipe",
    ],
    callLead: "Ki sastipnaski sigardiari,",
    callLink: "akhar ko 112",
  },
  title: "Chache doktoreske vorbi thaj zhutimos te reses ko doktori.",
  lead: "Putardo savorenge, zhutipnasa vash e romane komunitetya. Bi lovesko, garavdo thaj bi kontosko.",
  journey: ["Phen so daravel tut", "Le chache pasha", "Vaker ekhe doktoreya"],
  primaryCta: "Phen amenge so daravel tut",
  panel: {
    label: "Asistento",
    listen: "Gin glasosa",
    stopListening: "Astav o ginipe",
    fallbackVoice: "rezervno glaso",
    mediators: "Vash e sastipnaske mediatorya",
    question: "So shay te zhutisaras tut adyes?",
    subtitles: {
      default: "Bi lovesko thaj garavdo, sigo pash.",
      speaking: "Ginas e opciye glasosa.",
      mediators: "Instrumentya mediatoryenge po than.",
      returned: "Alosar aver opciya kana kames.",
      idle: "Na zhanes? Alosar i palutni opciya.",
    },
    back: "Palpale",
    step: (current, total) => `Pash ${current} katar ${total}`,
    doctorPrompt: "Kames te vakeres ekhe doktoreya?",
    doctorLink: "Programisar ekh akharipe",
    problemDoctorPrompt: "Nane tut daravne semnya?",
    problemDoctorLink: "Vaker ekhe doktoreya online",
    needs: {
      learn: {
        label: "Gin loke sastipnaske lekciye",
        hint: "Khurdeline lekciye vash rat thaj zahari.",
        title: "Khurdeline lekciye vash cho sastipen",
        quiz: {
          prompt: "Chacho vay xoxamno?",
          statement: "Kana o rat phurdel normalno palem, shay te mukhes e draba.",
          trueLabel: "Chacho",
          falseLabel: "Xoxamno",
          answer: false,
          correct: "Chaches si.",
          incorrect: "Na chaches.",
          explanation: "O rat phurdel normalno numay katar e draba. Ma mukh len bi te vakeres che doktoreya.",
        },
        action: { label: "Shird ekh lekciya", href: "/health-information" },
      },
      risk: {
        label: "Dikh che simptome",
        hint: "Sikav kay dukhal ande 3 pasha.",
        title: "Sikav kay dukhal tut",
        body: "Azba kay dukhal, de palpale pe 3 phuchimata thaj dikh so te keres may dur.",
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
        action: { label: "Putar i mapa", href: "/find-help" },
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
        title: "Chi receta, ashkardi",
        body: "Ker ekh chitro e recetake. Ashkaras sako drab: soske si thaj kana te les la.",
        action: { label: "Ashkar miri receta", href: "/prescription-review" },
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
        action: { label: "Mang zhutimos katar ekh manush", href: "/get-help?mode=mediator" },
      },
    },
  },
};

export const heroCopy: Record<Lang, HeroCopy> = {
ru: {
  emergency: {
    close: "Закрыть",
    alarmSigns: [
      "Боль или давление в груди",
      "Трудно дышать",
      "Перекос лица, слабость или невнятная речь",
      "Обморок или спутанность сознания",
      "Сильное кровотечение",
    ],
    callLead: "В экстренном случае",
    callLink: "звоните 112",
  },
  title: "Понятные медицинские советы и помощь в поиске врача.",
  lead: "Открыто для всех, с поддержкой ромских общин. Бесплатно, конфиденциально и без регистрации.",
  journey: ["Расскажите, что вас беспокоит", "Узнайте, что делать дальше", "Поговорите с врачом"],
  primaryCta: "Расскажите, что вас беспокоит",
  panel: {
    label: "Ассистент",
    listen: "Читать вслух",
    stopListening: "Остановить чтение",
    fallbackVoice: "резервный голос",
    mediators: "Для медицинских медиаторов",
    question: "Чем мы можем помочь сегодня?",
    subtitles: {
      default: "Бесплатно и анонимно, быстрый ответ.",
      speaking: "Читаем варианты вслух.",
      mediators: "Инструменты для медицинских медиаторов.",
      returned: "Выберите другой пункт в любой момент.",
      idle: "Не уверены? Выберите последний пункт.",
    },
    back: "Назад",
    step: (current, total) => `Шаг ${current} из ${total}`,
    doctorPrompt: "Хотите поговорить с врачом?",
    doctorLink: "Записаться на звонок",
    problemDoctorPrompt: "Нет опасных симптомов?",
    problemDoctorLink: "Поговорите с врачом онлайн",
    needs: {
      learn: {
        label: "Читать простые гиды о здоровье",
        hint: "Короткие уроки о давлении и диабете.",
        title: "Короткие уроки о здоровье",
        quiz: {
          prompt: "Правда или ложь?",
          statement: "Если давление пришло в норму, можно бросить таблетки.",
          trueLabel: "Правда",
          falseLabel: "Ложь",
          answer: false,
          correct: "Верно.",
          incorrect: "Не совсем.",
          explanation: "Давление в норме именно благодаря таблеткам. Не бросайте их без совета врача.",
        },
        action: { label: "Начать урок", href: "/health-information" },
      },
      risk: {
        label: "Проверить свои симптомы",
        hint: "Покажите, где болит, за 3 шага.",
        title: "Покажите, где болит",
        body: "Нажмите, где болит, ответьте на 3 вопроса и узнайте, что делать дальше.",
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
        action: { label: "Открыть карту", href: "/find-help" },
      },
      problem: {
        label: "Мне сейчас нездоровится",
        hint: "Признаки для 112 или врач онлайн.",
        title: "Сначала проверьте опасные симптомы",
        body: "Сразу звоните 112, если есть хотя бы один из признаков:",
        action: { label: "Позвонить 112", href: "tel:112" },
      },
      prescription: {
        label: "Разобрать рецепт врача",
        hint: "Сфотографируйте рецепт для разбора.",
        title: "Ваш рецепт простыми словами",
        body: "Сфотографируйте рецепт. Мы объясним, зачем нужно каждое лекарство и когда его принимать.",
        action: { label: "Разобрать рецепт", href: "/prescription-review" },
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
        action: { label: "Попросить помощь человека", href: "/get-help?mode=mediator" },
      },
    },
  },
},
 en, ro, sq, it, hr, rom };
