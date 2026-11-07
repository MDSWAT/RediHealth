import type { Lang } from "@/lib/i18n/translations";
import { withLangPrefix } from "@/lib/i18n/routing";

/**
 * Keeps hero links in the visitor's language, matching the header's links.
 * `tel:` links and the staff panel (not a localized route) pass through.
 */
export function localHref(href: string, lang: Lang): string {
  if (!href.startsWith("/") || href.startsWith("/panel")) return href;
  return withLangPrefix(href, lang);
}

/**
 * All copy for the landing hero, in one place per locale.
 *
 * Rules this file follows (checked by Hero.test.ts):
 * - every locale defines every key, so no locale ever falls back to another language;
 * - sentence case throughout, no ampersands in prose;
 * - the Romanian 112 notice is the verbatim wording from the platform concept.
 */

export type HeroNeedId = "learn" | "risk" | "problem" | "prescription" | "navigate";

export type HeroNeedPoint = { label?: string; text: string };

export type HeroNeed = {
  /** Button label on step 1, phrased the way a person would say it. */
  label: string;
  title: string;
  body: string;
  points?: HeroNeedPoint[];
  action: { label: string; href: string };
};

export type HeroCopy = {
  emergency: {
    notice: string;
    signsLink: string;
    call: string;
    modalTitle: string;
    modalIntro: string;
    callAdvice: string;
    close: string;
    alarmSigns: string[];
  };
  title: string;
  lead: string;
  primaryCta: string;
  secondaryCta: string;
  facts: [string, string, string];
  panel: {
    label: string;
    listen: string;
    stopListening: string;
    question: string;
    back: string;
    step: (current: number, total: number) => string;
    doctorPrompt: string;
    doctorLink: string;
    /** Problem branch: alarm signs first, the doctor second. */
    problemDoctorLink: string;
    needs: Record<HeroNeedId, HeroNeed>;
  };
};

export const HERO_NEED_ORDER: HeroNeedId[] = ["learn", "risk", "problem", "prescription", "navigate"];

const en: HeroCopy = {
  emergency: {
    notice: "Alarm signs mean «call 112 yourself». The app does not call automatically.",
    signsLink: "See alarm signs",
    call: "Call 112",
    modalTitle: "Alarm signs",
    modalIntro: "Call 112 right away if you or someone near you has any of these:",
    callAdvice: "On the phone, say where you are and what happened. Stay on the line.",
    close: "Close",
    alarmSigns: [
      "Chest pain or pressure",
      "Struggling to breathe",
      "Weakness, a drooping face or slurred speech",
      "Fainting or sudden confusion",
      "Heavy bleeding or a serious injury",
    ],
  },
  title: "Health information you understand, and a clear path to the right care.",
  lead: "Plain-language health education for vulnerable communities, including Roma communities, with an online doctor when you need one.",
  primaryCta: "Tell us what worries you",
  secondaryCta: "Learn about your health",
  facts: ["Free and confidential", "No account needed", "Built with communities"],
  panel: {
    label: "REDI assistant",
    listen: "Read aloud",
    stopListening: "Stop reading",
    question: "What worries you today?",
    back: "Back",
    step: (current, total) => `Step ${current} of ${total}`,
    doctorPrompt: "Want to talk to a doctor?",
    doctorLink: "Book an online consultation",
    problemDoctorLink: "No alarm signs? Talk to a doctor online",
    needs: {
      learn: {
        label: "I want to learn about health",
        title: "Short lessons, checked by doctors",
        body: "Eight topics in plain words, from vaccines to blood pressure, and what is true and what is not.",
        points: [
          { label: "Myth", text: "The flu vaccine gives you the flu." },
          { label: "Fact", text: "It cannot. The vaccine has no live virus that makes you ill." },
        ],
        action: { label: "Start a lesson", href: "/health-information" },
      },
      risk: {
        label: "I want to check my risk",
        title: "A 2-minute risk check",
        body: "Answer a few yes or no questions. You get a clear result and what to do next.",
        points: [{ text: "Heart and blood pressure" }, { text: "Diabetes" }, { text: "Lungs and breathing" }],
        action: { label: "Start the check", href: "/health-check" },
      },
      problem: {
        label: "I have a health problem",
        title: "First, check the alarm signs",
        body: "If you have any of these, call 112 now.",
        action: { label: "Call 112", href: "tel:112" },
      },
      prescription: {
        label: "I want my prescription explained",
        title: "Your prescription, in plain words",
        body: "Type it or take a photo. We explain what each medicine is for, when to take it and what to avoid.",
        action: { label: "Explain my prescription", href: "/prescription-review" },
      },
      navigate: {
        label: "I don't know where to go",
        title: "Where to go, and what to bring",
        body: "Three steps that work for most people.",
        points: [
          { text: "Register with a family doctor near you. Without insurance you still get a basic package." },
          { text: "Bring your identity card. If you are insured, you need nothing else." },
          { text: "No insurance? Emergency care at the hospital is free." },
        ],
        action: { label: "Get help from a person", href: "/get-help?mode=mediator" },
      },
    },
  },
};

const ro: HeroCopy = {
  emergency: {
    notice: "Semnele de alarmă și «Sună tu la 112» — aplicația nu apelează automat",
    signsLink: "Vezi semnele de alarmă",
    call: "Sună la 112",
    modalTitle: "Semne de alarmă",
    modalIntro: "Sună imediat la 112 dacă tu sau cineva de lângă tine are oricare dintre acestea:",
    callAdvice: "La telefon, spune unde ești și ce s-a întâmplat. Rămâi pe fir.",
    close: "Închide",
    alarmSigns: [
      "Durere sau apăsare în piept",
      "Respiri foarte greu",
      "Slăbiciune, gura strâmbă sau vorbire greoaie",
      "Leșin sau confuzie bruscă",
      "Sângerare puternică sau o rănire gravă",
    ],
  },
  title: "Informații medicale pe înțelesul tău și îndrumare către îngrijirea potrivită.",
  lead: "Educație medicală pe înțelesul tuturor pentru comunitățile vulnerabile, inclusiv cele rome, și un medic online atunci când ai nevoie.",
  primaryCta: "Spune-ne ce te îngrijorează",
  secondaryCta: "Află despre sănătatea ta",
  facts: ["Gratuit și confidențial", "Fără cont", "Construit cu comunitățile"],
  panel: {
    label: "Asistentul REDI",
    listen: "Citește cu voce tare",
    stopListening: "Oprește citirea",
    question: "Ce te îngrijorează?",
    back: "Înapoi",
    step: (current, total) => `Pasul ${current} din ${total}`,
    doctorPrompt: "Vrei să vorbești cu un medic?",
    doctorLink: "Programează o consultație online",
    problemDoctorLink: "Nu ai semne de alarmă? Vorbește cu un medic online",
    needs: {
      learn: {
        label: "Vreau să aflu ceva despre sănătate",
        title: "Lecții scurte, verificate de medici",
        body: "Opt teme pe înțelesul tuturor, de la vaccinuri la tensiune, și ce e adevărat și ce nu.",
        points: [
          { label: "Mit", text: "Vaccinul gripal provoacă gripă." },
          { label: "Adevăr", text: "Fals. Vaccinul nu conține virus viu care să te îmbolnăvească." },
        ],
        action: { label: "Începe o lecție", href: "/health-information" },
      },
      risk: {
        label: "Vreau să-mi verific riscul",
        title: "Verificarea riscului în 2 minute",
        body: "Răspunzi la câteva întrebări cu da sau nu. Primești un rezultat clar și ce să faci mai departe.",
        points: [{ text: "Inimă și tensiune" }, { text: "Diabet" }, { text: "Plămâni și respirație" }],
        action: { label: "Începe verificarea", href: "/health-check" },
      },
      problem: {
        label: "Am o problemă de sănătate",
        title: "Întâi, verifică semnele de alarmă",
        body: "Dacă ai oricare dintre acestea, sună acum la 112.",
        action: { label: "Sună la 112", href: "tel:112" },
      },
      prescription: {
        label: "Vreau să-mi înțeleg rețeta",
        title: "Rețeta ta, pe înțelesul tău",
        body: "Scrie-o sau fă-i o poză. Îți explicăm pentru ce e fiecare medicament, când îl iei și ce să eviți.",
        action: { label: "Explică-mi rețeta", href: "/prescription-review" },
      },
      navigate: {
        label: "Nu știu unde să merg",
        title: "Unde mergi și ce acte iei",
        body: "Trei pași care funcționează pentru cei mai mulți oameni.",
        points: [
          { text: "Înscrie-te la un medic de familie aproape de tine. Și fără asigurare primești un pachet de bază." },
          { text: "Ia buletinul. Dacă ești asigurat, nu îți trebuie alte acte." },
          { text: "Nu ai asigurare? Urgențele la spital sunt gratuite." },
        ],
        action: { label: "Cere ajutor de la un om", href: "/get-help?mode=mediator" },
      },
    },
  },
};

const sq: HeroCopy = {
  emergency: {
    notice: "Shenjat e alarmit do të thonë «telefono vetë 112». Aplikacioni nuk telefonon automatikisht.",
    signsLink: "Shiko shenjat e alarmit",
    call: "Telefono 112",
    modalTitle: "Shenjat e alarmit",
    modalIntro: "Telefono menjëherë 112 nëse ti ose dikush pranë teje ka ndonjë nga këto:",
    callAdvice: "Në telefon, thuaj ku je dhe çfarë ndodhi. Qëndro në linjë.",
    close: "Mbyll",
    alarmSigns: [
      "Dhimbje ose shtrëngim në gjoks",
      "Merr frymë me shumë vështirësi",
      "Dobësi, fytyrë e shtrembër ose të folur e paqartë",
      "Të fikët ose konfuzion i papritur",
      "Gjakderdhje e rëndë ose lëndim i rëndë",
    ],
  },
  title: "Informacion shëndetësor që e kupton dhe udhëzim drejt kujdesit të duhur.",
  lead: "Edukim shëndetësor në gjuhë të thjeshtë për komunitetet e cenueshme, përfshirë komunitetet rome, dhe një mjek online kur të duhet.",
  primaryCta: "Na trego çfarë të shqetëson",
  secondaryCta: "Mëso për shëndetin tënd",
  facts: ["Falas dhe konfidencial", "Pa llogari", "Ndërtuar me komunitetet"],
  panel: {
    label: "Asistenti REDI",
    listen: "Lexo me zë",
    stopListening: "Ndalo leximin",
    question: "Çfarë të shqetëson sot?",
    back: "Kthehu",
    step: (current, total) => `Hapi ${current} nga ${total}`,
    doctorPrompt: "Do të flasësh me një mjek?",
    doctorLink: "Rezervo një konsultë online",
    problemDoctorLink: "Nuk ke shenja alarmi? Fol me një mjek online",
    needs: {
      learn: {
        label: "Dua të mësoj për shëndetin",
        title: "Mësime të shkurtra, të verifikuara nga mjekët",
        body: "Tetë tema me fjalë të thjeshta, nga vaksinat te tensioni, dhe çfarë është e vërtetë e çfarë jo.",
        points: [
          { label: "Mit", text: "Vaksina e gripit të jep grip." },
          { label: "E vërteta", text: "Nuk mundet. Vaksina nuk ka virus të gjallë që të sëmur." },
        ],
        action: { label: "Fillo një mësim", href: "/health-information" },
      },
      risk: {
        label: "Dua të kontrolloj rrezikun",
        title: "Kontroll i rrezikut në 2 minuta",
        body: "Përgjigju me po ose jo disa pyetjeve. Merr një rezultat të qartë dhe hapin e radhës.",
        points: [{ text: "Zemra dhe tensioni" }, { text: "Diabeti" }, { text: "Mushkëritë dhe frymëmarrja" }],
        action: { label: "Fillo kontrollin", href: "/health-check" },
      },
      problem: {
        label: "Kam një problem shëndetësor",
        title: "Së pari, kontrollo shenjat e alarmit",
        body: "Nëse ke ndonjë nga këto, telefono tani 112.",
        action: { label: "Telefono 112", href: "tel:112" },
      },
      prescription: {
        label: "Dua të më shpjegohet receta",
        title: "Receta jote, me fjalë të thjeshta",
        body: "Shkruaje ose bëji një foto. Të shpjegojmë për çfarë shërben çdo ilaç, kur merret dhe çfarë të shmangësh.",
        action: { label: "Më shpjego recetën", href: "/prescription-review" },
      },
      navigate: {
        label: "Nuk di ku të shkoj",
        title: "Ku të shkosh dhe çfarë të marrësh me vete",
        body: "Tre hapa që funksionojnë për shumicën e njerëzve.",
        points: [
          { text: "Regjistrohu te një mjek familjeje pranë teje. Edhe pa sigurim merr një paketë bazë." },
          { text: "Merr kartën e identitetit. Nëse je i siguruar, nuk të duhet asgjë tjetër." },
          { text: "Pa sigurim? Urgjenca në spital është falas." },
        ],
        action: { label: "Kërko ndihmë nga një person", href: "/get-help?mode=mediator" },
      },
    },
  },
};

const it: HeroCopy = {
  emergency: {
    notice: "I segnali di allarme significano «chiama tu il 112». L'app non chiama in automatico.",
    signsLink: "Vedi i segnali di allarme",
    call: "Chiama il 112",
    modalTitle: "Segnali di allarme",
    modalIntro: "Chiama subito il 112 se tu o qualcuno vicino a te ha uno di questi segnali:",
    callAdvice: "Al telefono, di' dove sei e cosa è successo. Resta in linea.",
    close: "Chiudi",
    alarmSigns: [
      "Dolore o oppressione al petto",
      "Grande fatica a respirare",
      "Debolezza, bocca storta o parola confusa",
      "Svenimento o confusione improvvisa",
      "Forte sanguinamento o una ferita grave",
    ],
  },
  title: "Informazioni sanitarie comprensibili e una guida verso le cure giuste.",
  lead: "Educazione sanitaria in parole semplici per le comunità vulnerabili, comprese quelle rom, e un medico online quando serve.",
  primaryCta: "Dicci cosa ti preoccupa",
  secondaryCta: "Scopri di più sulla tua salute",
  facts: ["Gratuito e riservato", "Nessun account", "Costruito con le comunità"],
  panel: {
    label: "Assistente REDI",
    listen: "Leggi ad alta voce",
    stopListening: "Interrompi la lettura",
    question: "Cosa ti preoccupa oggi?",
    back: "Indietro",
    step: (current, total) => `Passo ${current} di ${total}`,
    doctorPrompt: "Vuoi parlare con un medico?",
    doctorLink: "Prenota una consulenza online",
    problemDoctorLink: "Nessun segnale di allarme? Parla con un medico online",
    needs: {
      learn: {
        label: "Voglio imparare qualcosa sulla salute",
        title: "Brevi lezioni, verificate da medici",
        body: "Otto temi in parole semplici, dai vaccini alla pressione, e cosa è vero e cosa no.",
        points: [
          { label: "Mito", text: "Il vaccino antinfluenzale fa venire l'influenza." },
          { label: "Realtà", text: "Non può. Il vaccino non contiene virus vivi che fanno ammalare." },
        ],
        action: { label: "Inizia una lezione", href: "/health-information" },
      },
      risk: {
        label: "Voglio controllare il mio rischio",
        title: "Controllo del rischio in 2 minuti",
        body: "Rispondi sì o no ad alcune domande. Ricevi un risultato chiaro e il passo successivo.",
        points: [{ text: "Cuore e pressione" }, { text: "Diabete" }, { text: "Polmoni e respiro" }],
        action: { label: "Inizia il controllo", href: "/health-check" },
      },
      problem: {
        label: "Ho un problema di salute",
        title: "Prima, controlla i segnali di allarme",
        body: "Se hai uno di questi segnali, chiama subito il 112.",
        action: { label: "Chiama il 112", href: "tel:112" },
      },
      prescription: {
        label: "Voglio capire la mia ricetta",
        title: "La tua ricetta, in parole semplici",
        body: "Scrivila o scatta una foto. Ti spieghiamo a cosa serve ogni farmaco, quando prenderlo e cosa evitare.",
        action: { label: "Spiegami la ricetta", href: "/prescription-review" },
      },
      navigate: {
        label: "Non so dove andare",
        title: "Dove andare e cosa portare",
        body: "Tre passi che funzionano per la maggior parte delle persone.",
        points: [
          { text: "Iscriviti da un medico di famiglia vicino a te. Anche senza assicurazione ricevi un pacchetto di base." },
          { text: "Porta la carta d'identità. Se sei assicurato, non serve altro." },
          { text: "Senza assicurazione? Il pronto soccorso in ospedale è gratuito." },
        ],
        action: { label: "Chiedi aiuto a una persona", href: "/get-help?mode=mediator" },
      },
    },
  },
};

export const heroCopy: Record<Lang, HeroCopy> = { en, ro, sq, it };
