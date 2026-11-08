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
  title: "Health information in plain words, and help finding the right care.",
  lead: "For vulnerable communities, including Roma communities. Free and confidential.",
  journey: ["Say what worries you", "Get clear next steps", "Talk to a doctor"],
  primaryCta: "Tell us what worries you",
  panel: {
    label: "Assistant",
    listen: "Read aloud",
    stopListening: "Stop reading",
    fallbackVoice: "backup voice",
    mediators: "For health mediators",
    question: "What worries you today?",
    back: "Back",
    step: (current, total) => `Step ${current} of ${total}`,
    doctorPrompt: "Want to talk to a doctor?",
    doctorLink: "Book a call",
    problemDoctorPrompt: "No alarm signs?",
    problemDoctorLink: "Talk to a doctor online",
    needs: {
      learn: {
        label: "I want to learn about health",
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
        label: "I want to check my symptoms",
        title: "Show us where it hurts",
        body: "Tap the spot on the body, answer 3 questions and see what to do next.",
        action: { label: "Start the check", href: "/health-check" },
      },
      nearby: {
        label: "I need a pharmacy or doctor nearby",
        title: "Pharmacies, practices and hospitals near you",
        points: [
          { text: "A pharmacist can advise you for free, without an appointment." },
          { text: "See family doctors, clinics and hospitals on the map." },
          { text: "Choose your country or use your location." },
        ],
        action: { label: "Open the map", href: "/find-help" },
      },
      problem: {
        label: "I have a health problem",
        title: "First, check the alarm signs",
        body: "Call 112 now if you have any of these:",
        action: { label: "Call 112", href: "tel:112" },
      },
      prescription: {
        label: "I want my prescription explained",
        title: "Your prescription, explained",
        body: "Take a photo. We explain each medicine: what it is for and when to take it.",
        action: { label: "Explain my prescription", href: "/prescription-review" },
      },
      navigate: {
        label: "I don't know where to go",
        title: "Where to go, and what to bring",
        points: [
          { text: "Register with a family doctor, even without insurance." },
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
  title: "Informații medicale pe înțelesul tău și îndrumare către îngrijirea potrivită.",
  lead: "Pentru comunitățile vulnerabile, inclusiv cele rome. Gratuit și confidențial.",
  journey: ["Spui ce te îngrijorează", "Primești pașii de urmat", "Vorbești cu un medic"],
  primaryCta: "Spune-ne ce te îngrijorează",
  panel: {
    label: "Asistent",
    listen: "Citește cu voce tare",
    stopListening: "Oprește citirea",
    fallbackVoice: "voce de rezervă",
    mediators: "Pentru mediatori sanitari",
    question: "Ce te îngrijorează?",
    back: "Înapoi",
    step: (current, total) => `Pasul ${current} din ${total}`,
    doctorPrompt: "Vrei să vorbești cu un medic?",
    doctorLink: "Programează un apel",
    problemDoctorPrompt: "Nu ai semne de alarmă?",
    problemDoctorLink: "Vorbește cu un medic online",
    needs: {
      learn: {
        label: "Vreau să aflu despre sănătate",
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
        label: "Vreau să-mi evaluez simptomele",
        title: "Arată unde te doare",
        body: "Atinge locul pe corp, răspunde la 3 întrebări și afli ce poți face mai departe.",
        action: { label: "Începe evaluarea", href: "/health-check" },
      },
      nearby: {
        label: "Caut o farmacie sau un medic aproape",
        title: "Farmacii, cabinete și spitale lângă tine",
        points: [
          { text: "Farmacistul te poate sfătui gratuit, fără programare." },
          { text: "Vezi pe hartă medici de familie, clinici și spitale." },
          { text: "Alege țara sau folosește locația ta." },
        ],
        action: { label: "Deschide harta", href: "/find-help" },
      },
      problem: {
        label: "Am o problemă de sănătate",
        title: "Întâi, verifică semnele de alarmă",
        body: "Sună acum la 112 dacă ai oricare dintre acestea:",
        action: { label: "Sună la 112", href: "tel:112" },
      },
      prescription: {
        label: "Vreau să-mi înțeleg rețeta",
        title: "Rețeta ta, explicată",
        body: "Fă o poză rețetei. Îți explicăm fiecare medicament: la ce folosește și când îl iei.",
        action: { label: "Explică-mi rețeta", href: "/prescription-review" },
      },
      navigate: {
        label: "Nu știu unde să merg",
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
  title: "Informacion për shëndetin me fjalë të thjeshta dhe ndihmë për të gjetur kujdesin e duhur.",
  lead: "Për komunitetet e cenueshme, përfshirë komunitetet rome. Falas dhe konfidencial.",
  journey: ["Thua çfarë të shqetëson", "Merr hapat e radhës", "Flet me një mjek"],
  primaryCta: "Na trego çfarë të shqetëson",
  panel: {
    label: "Asistent",
    listen: "Lexo me zë",
    stopListening: "Ndalo leximin",
    fallbackVoice: "zë rezervë",
    mediators: "Për mediatorët shëndetësorë",
    question: "Çfarë të shqetëson sot?",
    back: "Kthehu",
    step: (current, total) => `Hapi ${current} nga ${total}`,
    doctorPrompt: "Do të flasësh me një mjek?",
    doctorLink: "Rezervo një thirrje",
    problemDoctorPrompt: "Nuk ke shenja alarmi?",
    problemDoctorLink: "Fol me një mjek online",
    needs: {
      learn: {
        label: "Dua të mësoj për shëndetin",
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
        label: "Dua të vlerësoj simptomat e mia",
        title: "Trego ku të dhemb",
        body: "Prek vendin në trup, përgjigju 3 pyetjeve dhe shiko çfarë të bësh më pas.",
        action: { label: "Fillo vlerësimin", href: "/health-check" },
      },
      nearby: {
        label: "Kërkoj një farmaci ose mjek afër",
        title: "Farmaci, ambulanca dhe spitale pranë teje",
        points: [
          { text: "Farmacisti mund të të këshillojë falas, pa takim." },
          { text: "Shiko në hartë mjekë familjeje, klinika dhe spitale." },
          { text: "Zgjidh vendin ose përdor vendndodhjen tënde." },
        ],
        action: { label: "Hap hartën", href: "/find-help" },
      },
      problem: {
        label: "Kam një problem shëndetësor",
        title: "Së pari, kontrollo shenjat e alarmit",
        body: "Telefono tani 112 nëse ke ndonjë nga këto:",
        action: { label: "Telefono 112", href: "tel:112" },
      },
      prescription: {
        label: "Dua të më shpjegohet receta",
        title: "Receta jote, e shpjeguar",
        body: "Bëji një foto recetës. Të shpjegojmë çdo ilaç: për çfarë shërben dhe kur merret.",
        action: { label: "Më shpjego recetën", href: "/prescription-review" },
      },
      navigate: {
        label: "Nuk di ku të shkoj",
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
  title: "Informazioni sulla salute in parole semplici e aiuto per trovare le cure giuste.",
  lead: "Per le comunità vulnerabili, comprese quelle rom. Gratuito e riservato.",
  journey: ["Dici cosa ti preoccupa", "Ricevi i passi da seguire", "Parli con un medico"],
  primaryCta: "Dicci cosa ti preoccupa",
  panel: {
    label: "Assistente",
    listen: "Leggi ad alta voce",
    stopListening: "Interrompi la lettura",
    fallbackVoice: "voce di riserva",
    mediators: "Per i mediatori sanitari",
    question: "Cosa ti preoccupa oggi?",
    back: "Indietro",
    step: (current, total) => `Passo ${current} di ${total}`,
    doctorPrompt: "Vuoi parlare con un medico?",
    doctorLink: "Prenota una chiamata",
    problemDoctorPrompt: "Nessun segnale di allarme?",
    problemDoctorLink: "Parla con un medico online",
    needs: {
      learn: {
        label: "Voglio saperne di più sulla salute",
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
        label: "Voglio controllare i miei sintomi",
        title: "Indica dove fa male",
        body: "Tocca il punto sul corpo, rispondi a 3 domande e vedi cosa fare dopo.",
        action: { label: "Inizia il controllo", href: "/health-check" },
      },
      nearby: {
        label: "Cerco una farmacia o un medico vicino",
        title: "Farmacie, ambulatori e ospedali vicino a te",
        points: [
          { text: "Il farmacista può consigliarti gratis, senza appuntamento." },
          { text: "Vedi sulla mappa medici di base, ambulatori e ospedali." },
          { text: "Scegli il paese o usa la tua posizione." },
        ],
        action: { label: "Apri la mappa", href: "/find-help" },
      },
      problem: {
        label: "Ho un problema di salute",
        title: "Prima, controlla i segnali di allarme",
        body: "Chiama subito il 112 se hai uno di questi segnali:",
        action: { label: "Chiama il 112", href: "tel:112" },
      },
      prescription: {
        label: "Voglio capire la mia ricetta",
        title: "La tua ricetta, spiegata",
        body: "Fai una foto alla ricetta. Ti spieghiamo ogni farmaco: a cosa serve e quando prenderlo.",
        action: { label: "Spiegami la ricetta", href: "/prescription-review" },
      },
      navigate: {
        label: "Non so dove andare",
        title: "Dove andare e cosa portare",
        points: [
          { text: "Iscriviti presso un medico di famiglia, anche senza assicurazione." },
          { text: "Porta la carta d'identità." },
          { text: "Il pronto soccorso in ospedale è gratuito per tutti." },
        ],
        action: { label: "Chiedi aiuto a una persona", href: "/get-help?mode=mediator" },
      },
    },
  },
};

export const heroCopy: Record<Lang, HeroCopy> = { en, ro, sq, it };
