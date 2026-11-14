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
  quizzes?: HeroQuiz[];
  nextQuizLabel?: string;
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
    alarmSigns: PLAIN_ALARM_SIGNS.en,
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
    },
    back: "Back",
    step: (current, total) => `Step ${current} of ${total}`,
    doctorPrompt: "Want to talk to a doctor?",
    doctorLink: "Talk to a doctor",
    problemDoctorPrompt: "None of these?",
    problemDoctorLink: "Talk to a doctor",
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
        quizzes: [
          {
            prompt: "True or false?",
            statement: "Once your blood pressure is back to normal, you can stop the pills.",
            trueLabel: "True",
            falseLabel: "False",
            answer: false,
            correct: "That's right.",
            incorrect: "Not quite.",
            explanation: "Your blood pressure is normal because of the pills. Do not stop them without talking to your doctor.",
          },
          {
            prompt: "True or false?",
            statement: "Putting butter, oil, or toothpaste on a fresh burn helps it heal faster.",
            trueLabel: "True",
            falseLabel: "False",
            answer: false,
            correct: "That's right.",
            incorrect: "Not quite.",
            explanation: "Greasy pastes trap heat on the skin. Cool a minor burn gently under clean running water instead.",
          },
          {
            prompt: "True or false?",
            statement: "When you have a high fever, wrapping up in heavy blankets helps you sweat it out safely.",
            trueLabel: "True",
            falseLabel: "False",
            answer: false,
            correct: "That's right.",
            incorrect: "Not quite.",
            explanation: "Heavy blankets trap heat and can push a fever higher. Wear a light layer and drink plenty of fluids.",
          },
          {
            prompt: "True or false?",
            statement: "Plain water hydrates your body better than sweet fizzy drinks.",
            trueLabel: "True",
            falseLabel: "False",
            answer: true,
            correct: "That's right.",
            incorrect: "Not quite.",
            explanation: "Plain water replaces lost fluids cleanly without extra sweeteners or caffeine.",
          },
          {
            prompt: "True or false?",
            statement: "If your pain feels similar, it is safe to take someone else's leftover medicine.",
            trueLabel: "True",
            falseLabel: "False",
            answer: false,
            correct: "That's right.",
            incorrect: "Not quite.",
            explanation: "A similar ache can have a different cause or need another dose. Ask a doctor or pharmacist first.",
          },
          {
            prompt: "True or false?",
            statement: "Washing your hands with soap and water for 20 seconds helps stop everyday germs from spreading.",
            trueLabel: "True",
            falseLabel: "False",
            answer: true,
            correct: "That's right.",
            incorrect: "Not quite.",
            explanation: "Scrubbing with soap and rinsing well lifts everyday germs off your skin before they pass to others.",
          },
        ],
        nextQuizLabel: "Try another question",
        action: { label: "Start a lesson", href: "/health-information" },
      },
      risk: {
        label: "Check my symptoms",
        hint: "Point where it hurts in a few short steps.",
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
    alarmSigns: PLAIN_ALARM_SIGNS.ro,
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
    },
    back: "Înapoi",
    step: (current, total) => `Pasul ${current} din ${total}`,
    doctorPrompt: "Vrei să vorbești cu un medic?",
    doctorLink: "Vorbește cu un medic",
    problemDoctorPrompt: "Niciunul dintre acestea?",
    problemDoctorLink: "Vorbește cu un medic",
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
        quizzes: [
          {
            prompt: "Adevărat sau fals?",
            statement: "Dacă tensiunea ți-a revenit la normal, poți opri pastilele.",
            trueLabel: "Adevărat",
            falseLabel: "Fals",
            answer: false,
            correct: "Corect.",
            incorrect: "Nu chiar.",
            explanation: "Tensiunea e normală tocmai datorită pastilelor. Nu le opri fără să vorbești cu medicul.",
          },
          {
            prompt: "Adevărat sau fals?",
            statement: "Dacă pui unt, ulei sau pastă de dinți pe o arsură proaspătă, se vindecă mai repede.",
            trueLabel: "Adevărat",
            falseLabel: "Fals",
            answer: false,
            correct: "Corect.",
            incorrect: "Nu chiar.",
            explanation: "Grăsimile și pastele păstrează căldura în piele. Răcește arsura ușoară sub apă curată de la robinet.",
          },
          {
            prompt: "Adevărat sau fals?",
            statement: "Când ai febră mare, e bine să te învelești cu pături groase ca să transpiri.",
            trueLabel: "Adevărat",
            falseLabel: "Fals",
            answer: false,
            correct: "Corect.",
            incorrect: "Nu chiar.",
            explanation: "Păturile groase țin căldura în corp și pot crește febra. Alege haine subțiri și bea lichide des.",
          },
          {
            prompt: "Adevărat sau fals?",
            statement: "Apa simplă hidratează corpul mai bine decât sucurile dulci carbogazoase.",
            trueLabel: "Adevărat",
            falseLabel: "Fals",
            answer: true,
            correct: "Corect.",
            incorrect: "Nu chiar.",
            explanation: "Apa simplă reface lichidele fără îndulcitori în plus și fără cofeină.",
          },
          {
            prompt: "Adevărat sau fals?",
            statement: "Dacă durerea seamănă, poți lua în siguranță medicamentul rămas de la altcineva.",
            trueLabel: "Adevărat",
            falseLabel: "Fals",
            answer: false,
            correct: "Corect.",
            incorrect: "Nu chiar.",
            explanation: "Aceeași durere poate avea o altă cauză sau alt dozaj potrivit. Întreabă mai întâi medicul sau farmacistul.",
          },
          {
            prompt: "Adevărat sau fals?",
            statement: "Spălatul pe mâini cu apă și săpun timp de 20 de secunde oprește răspândirea multor microbi.",
            trueLabel: "Adevărat",
            falseLabel: "Fals",
            answer: true,
            correct: "Corect.",
            incorrect: "Nu chiar.",
            explanation: "Frecarea cu săpun și clătirea îndepărtează microbii de pe piele înainte să ajungă la gură sau ochi.",
          },
        ],
        nextQuizLabel: "Altă întrebare",
        action: { label: "Începe o lecție", href: "/health-information" },
      },
      risk: {
        label: "Verifică ce simptome ai",
        hint: "Arăți unde te doare în câțiva pași scurți.",
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
    alarmSigns: PLAIN_ALARM_SIGNS.sq,
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
    },
    back: "Kthehu",
    step: (current, total) => `Hapi ${current} nga ${total}`,
    doctorPrompt: "Do të flasësh me një mjek?",
    doctorLink: "Fol me një mjek",
    problemDoctorPrompt: "Asnjë nga këto?",
    problemDoctorLink: "Fol me një mjek",
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
        quizzes: [
          {
            prompt: "E vërtetë apo e rreme?",
            statement: "Nëse presioni të është kthyer në normal, mund t'i lësh ilaçet.",
            trueLabel: "E vërtetë",
            falseLabel: "E rreme",
            answer: false,
            correct: "Saktë.",
            incorrect: "Jo tamam.",
            explanation: "Presioni është normal pikërisht falë ilaçeve. Mos i lër pa folur me mjekun.",
          },
          {
            prompt: "E vërtetë apo e rreme?",
            statement: "Vënia e gjalpit, vajit ose pastës së dhëmbëve mbi një djegie të re e shëron më shpejt.",
            trueLabel: "E vërtetë",
            falseLabel: "E rreme",
            answer: false,
            correct: "Saktë.",
            incorrect: "Jo tamam.",
            explanation: "Yndyra dhe pastat mbajnë nxehtësinë në lëkurë. Ftohe djegien e lehtë nën ujë të pastër të rrjedhshëm.",
          },
          {
            prompt: "E vërtetë apo e rreme?",
            statement: "Kur ke temperaturë të lartë, mbështjellja me batanije të trasha ta ul atë me djersë.",
            trueLabel: "E vërtetë",
            falseLabel: "E rreme",
            answer: false,
            correct: "Saktë.",
            incorrect: "Jo tamam.",
            explanation: "Batanijet e trasha bllokojnë nxehtësinë dhe e rrisin temperaturën. Vish rroba të lehta dhe pi lëngje.",
          },
          {
            prompt: "E vërtetë apo e rreme?",
            statement: "Uji i thjeshtë e hidraton trupin më mirë se pijet e ëmbla me gaz.",
            trueLabel: "E vërtetë",
            falseLabel: "E rreme",
            answer: true,
            correct: "Saktë.",
            incorrect: "Jo tamam.",
            explanation: "Uji i pastër zëvendëson lëngjet pa ëmbëlsues shtesë dhe pa kafeinë.",
          },
          {
            prompt: "E vërtetë apo e rreme?",
            statement: "Nëse dhimbja duket e ngjashme, është e sigurt të marrësh ilaçet e mbetura të dikujt tjetër.",
            trueLabel: "E vërtetë",
            falseLabel: "E rreme",
            answer: false,
            correct: "Saktë.",
            incorrect: "Jo tamam.",
            explanation: "E njëjta dhimbje mund të ketë shkak tjetër ose dozë tjetër. Pyet më parë mjekun ose farmacistin.",
          },
          {
            prompt: "E vërtetë apo e rreme?",
            statement: "Larja e duarve me ujë dhe sapun për 20 sekonda ndihmon të ndalojë përhapjen e mikrobeve.",
            trueLabel: "E vërtetë",
            falseLabel: "E rreme",
            answer: true,
            correct: "Saktë.",
            incorrect: "Jo tamam.",
            explanation: "Fërkimi me sapun dhe shpëlarja i largon mikrobet nga lëkura para se të kalojnë te të tjerët.",
          },
        ],
        nextQuizLabel: "Një pyetje tjetër",
        action: { label: "Fillo një mësim", href: "/health-information" },
      },
      risk: {
        label: "Kontrollo simptomat e tua",
        hint: "Trego ku të dhemb në disa hapa të shkurtër.",
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
    alarmSigns: PLAIN_ALARM_SIGNS.it,
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
    },
    back: "Indietro",
    step: (current, total) => `Passo ${current} di ${total}`,
    doctorPrompt: "Vuoi parlare con un medico?",
    doctorLink: "Parla con un medico",
    problemDoctorPrompt: "Nessuno di questi?",
    problemDoctorLink: "Parla con un medico",
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
        quizzes: [
          {
            prompt: "Vero o falso?",
            statement: "Se la pressione è tornata normale, puoi smettere di prendere le pastiglie.",
            trueLabel: "Vero",
            falseLabel: "Falso",
            answer: false,
            correct: "Esatto.",
            incorrect: "Non proprio.",
            explanation: "La pressione è normale proprio grazie alle pastiglie. Non smettere senza parlarne con il medico.",
          },
          {
            prompt: "Vero o falso?",
            statement: "Mettere burro, olio o dentifricio su una scottatura recente aiuta a guarire prima.",
            trueLabel: "Vero",
            falseLabel: "Falso",
            answer: false,
            correct: "Esatto.",
            incorrect: "Non proprio.",
            explanation: "Grassi e paste trattengono il calore sulla pelle. Raffredda la scottatura lieve sotto acqua fresca corrente.",
          },
          {
            prompt: "Vero o falso?",
            statement: "Quando hai la febbre alta, coprirti con coperte pesanti aiuta a sudarla via.",
            trueLabel: "Vero",
            falseLabel: "Falso",
            answer: false,
            correct: "Esatto.",
            incorrect: "Non proprio.",
            explanation: "Le coperte pesanti trattengono il calore e alzano la febbre. Indossa strati leggeri e bevi liquidi.",
          },
          {
            prompt: "Vero o falso?",
            statement: "L'acqua semplice idrata il corpo meglio delle bibite gassate dolci.",
            trueLabel: "Vero",
            falseLabel: "Falso",
            answer: true,
            correct: "Esatto.",
            incorrect: "Non proprio.",
            explanation: "L'acqua semplice reintegra i liquidi senza dolcificanti aggiunti e senza caffeina.",
          },
          {
            prompt: "Vero o falso?",
            statement: "Se il dolore sembra uguale, puoi prendere in sicurezza la medicina avanzata a un'altra persona.",
            trueLabel: "Vero",
            falseLabel: "Falso",
            answer: false,
            correct: "Esatto.",
            incorrect: "Non proprio.",
            explanation: "Un dolore simile può avere un'altra causa o dose adatta. Chiedi prima al medico o al farmacista.",
          },
          {
            prompt: "Vero o falso?",
            statement: "Lavare le mani con acqua e sapone per 20 secondi frena la diffusione di molti germi.",
            trueLabel: "Vero",
            falseLabel: "Falso",
            answer: true,
            correct: "Esatto.",
            incorrect: "Non proprio.",
            explanation: "Strofinare con il sapone e risciacquare toglie i germi dalla pelle prima che passino ad altri.",
          },
        ],
        nextQuizLabel: "Un'altra domanda",
        action: { label: "Inizia una lezione", href: "/health-information" },
      },
      risk: {
        label: "Controlla i tuoi sintomi",
        hint: "Indica dove fa male in pochi brevi passi.",
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
    alarmSigns: PLAIN_ALARM_SIGNS.hr,
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
    },
    back: "Natrag",
    step: (current, total) => `Korak ${current} od ${total}`,
    doctorPrompt: "Želiš li razgovarati s liječnikom?",
    doctorLink: "Razgovaraj s liječnikom",
    problemDoctorPrompt: "Ništa od toga?",
    problemDoctorLink: "Razgovaraj s liječnikom",
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
        quizzes: [
          {
            prompt: "Točno ili netočno?",
            statement: "Kad se krvni tlak vrati u normalu, možeš prestati piti tablete.",
            trueLabel: "Točno",
            falseLabel: "Netočno",
            answer: false,
            correct: "Tako je.",
            incorrect: "Nije baš tako.",
            explanation: "Krvni tlak je normalan upravo zbog tableta. Nemoj ih prestati uzimati bez razgovora s liječnikom.",
          },
          {
            prompt: "Točno ili netočno?",
            statement: "Stavljanje maslaca, ulja ili paste za zube na svježu opeklinu ubrzava zacjeljivanje.",
            trueLabel: "Točno",
            falseLabel: "Netočno",
            answer: false,
            correct: "Tako je.",
            incorrect: "Nije baš tako.",
            explanation: "Masnoće i paste zadržavaju toplinu u koži. Blagu opeklinu hladi pod čistom tekućom vodom.",
          },
          {
            prompt: "Točno ili netočno?",
            statement: "Kod visoke temperature dobro se pokriti teškim dekama da se znojenjem spusti.",
            trueLabel: "Točno",
            falseLabel: "Netočno",
            answer: false,
            correct: "Tako je.",
            incorrect: "Nije baš tako.",
            explanation: "Teške deke zadržavaju toplinu i mogu dodatno povisiti temperaturu. Odjeni laganu odjeću i pij tekućinu.",
          },
          {
            prompt: "Točno ili netočno?",
            statement: "Obična voda hidratizira tijelo bolje od slatkih gaziranih napitaka.",
            trueLabel: "Točno",
            falseLabel: "Netočno",
            answer: true,
            correct: "Tako je.",
            incorrect: "Nije baš tako.",
            explanation: "Obična voda nadoknađuje tekućinu bez dodatnih zaslađivača i kofeina.",
          },
          {
            prompt: "Točno ili netočno?",
            statement: "Ako je bol slična, sigurno je uzeti ostatak tuđeg lijeka.",
            trueLabel: "Točno",
            falseLabel: "Netočno",
            answer: false,
            correct: "Tako je.",
            incorrect: "Nije baš tako.",
            explanation: "Slična bol može imati drugi uzrok ili tražiti drugu dozu. Najprije pitaj liječnika ili ljekarnika.",
          },
          {
            prompt: "Točno ili netočno?",
            statement: "Pranje ruku sapunom i vodom tijekom 20 sekundi smanjuje širenje klica.",
            trueLabel: "Točno",
            falseLabel: "Netočno",
            answer: true,
            correct: "Tako je.",
            incorrect: "Nije baš tako.",
            explanation: "Trljanje sapunom i ispiranje uklanja klice s kože prije nego što prijeđu na druge.",
          },
        ],
        nextQuizLabel: "Drugo pitanje",
        action: { label: "Započni lekciju", href: "/health-information" },
      },
      risk: {
        label: "Provjeri svoje simptome",
        hint: "Pokaži gdje boli u nekoliko kratkih koraka.",
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
    alarmSigns: PLAIN_ALARM_SIGNS.rom,
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
    },
    back: "Palpale",
    step: (current, total) => `Pash ${current} katar ${total}`,
    doctorPrompt: "Kames te vakeres ekhe doktoreya?",
    doctorLink: "Vaker ekhe doktoreya",
    problemDoctorPrompt: "Nijekh katar kadala?",
    problemDoctorLink: "Vaker ekhe doktoreya",
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
        quizzes: [
          {
            prompt: "Chacho vay xoxamno?",
            statement: "Kana o rat phurdel normalno palem, shay te mukhes e draba.",
            trueLabel: "Chacho",
            falseLabel: "Xoxamno",
            answer: false,
            correct: "Chaches si.",
            incorrect: "Na chaches.",
            explanation: "O rat phurdel normalno numay katar e draba. Ma mukh len bi te vakeres che doktoreya.",
          },
          {
            prompt: "Chacho vay xoxamno?",
            statement: "Te thoves khil, zhetin vay pasta dandenge pe phabaripe, sigo sastovel.",
            trueLabel: "Chacho",
            falseLabel: "Xoxamno",
            answer: false,
            correct: "Chaches si.",
            incorrect: "Na chaches.",
            explanation: "O khil thaj e pasta inkeren o tatipen andre. Shudrar o than telal shudro thaj chisto pani.",
          },
          {
            prompt: "Chacho vay xoxamno?",
            statement: "Kana si tut baro tatipen, mishto si te garaves tut pharimata pokrivača te tradel avri.",
            trueLabel: "Chacho",
            falseLabel: "Xoxamno",
            answer: false,
            correct: "Chaches si.",
            incorrect: "Na chaches.",
            explanation: "Phare pokrivača inkeren o tatipen ando trupo. Urav lokhe tsalya thaj pi but pani.",
          },
          {
            prompt: "Chacho vay xoxamno?",
            statement: "O chisto pani del may mishto sastipen sar e gudle piyimata.",
            trueLabel: "Chacho",
            falseLabel: "Xoxamno",
            answer: true,
            correct: "Chaches si.",
            incorrect: "Na chaches.",
            explanation: "O chisto pani palem cherel o truposko pani bi gudle aditivurya.",
          },
          {
            prompt: "Chacho vay xoxamno?",
            statement: "Te miazol i dukh, shay te les aver manushesko drab.",
            trueLabel: "Chacho",
            falseLabel: "Xoxamno",
            answer: false,
            correct: "Chaches si.",
            incorrect: "Na chaches.",
            explanation: "Yekh dukh shay avel katar aver problema. Phuch may anglal che doktoresthar vay farmacheutostar.",
          },
          {
            prompt: "Chacho vay xoxamno?",
            statement: "Te thoves che vasta sapuneya thaj paneya 20 sekunde, na mukhes e bima te phiren.",
            trueLabel: "Chacho",
            falseLabel: "Xoxamno",
            answer: true,
            correct: "Chaches si.",
            incorrect: "Na chaches.",
            explanation: "O sapuni thaj o pani chinen e mikrobya katar i morti anglal te nashen karing aver.",
          },
        ],
        nextQuizLabel: "Aver phuchipen",
        action: { label: "Shird ekh lekciya", href: "/health-information" },
      },
      risk: {
        label: "Dikh che simptome",
        hint: "Sikav kay dukhal ande nekobor skurte pasha.",
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
    alarmSigns: PLAIN_ALARM_SIGNS.ru,
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
    },
    back: "Назад",
    step: (current, total) => `Шаг ${current} из ${total}`,
    doctorPrompt: "Хотите поговорить с врачом?",
    doctorLink: "Поговорите с врачом",
    problemDoctorPrompt: "Ничего из этого?",
    problemDoctorLink: "Поговорите с врачом",
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
        quizzes: [
          {
            prompt: "Правда или ложь?",
            statement: "Если давление пришло в норму, можно бросить таблетки.",
            trueLabel: "Правда",
            falseLabel: "Ложь",
            answer: false,
            correct: "Верно.",
            incorrect: "Не совсем.",
            explanation: "Давление в норме именно благодаря таблеткам. Не бросайте их без совета врача.",
          },
          {
            prompt: "Правда или ложь?",
            statement: "Масло, крем или зубная паста на свежем ожоге помогают коже зажить быстрее.",
            trueLabel: "Правда",
            falseLabel: "Ложь",
            answer: false,
            correct: "Верно.",
            incorrect: "Не совсем.",
            explanation: "Жир и паста удерживают тепло в коже. Охладите лёгкий ожог под чистой прохладной водой.",
          },
          {
            prompt: "Правда или ложь?",
            statement: "При высокой температуре нужно укутаться тёплыми одеялами, чтобы пропотеть.",
            trueLabel: "Правда",
            falseLabel: "Ложь",
            answer: false,
            correct: "Верно.",
            incorrect: "Не совсем.",
            explanation: "Тяжёлые одеяла задерживают тепло и повышают жар. Наденьте лёгкую одежду и пейте воду.",
          },
          {
            prompt: "Правда или ложь?",
            statement: "Обычная вода восполняет жидкость в организме лучше сладкой газировки.",
            trueLabel: "Правда",
            falseLabel: "Ложь",
            answer: true,
            correct: "Верно.",
            incorrect: "Не совсем.",
            explanation: "Чистая вода восполняет жидкость без лишних подсластителей и кофеина.",
          },
          {
            prompt: "Правда или ложь?",
            statement: "Если боль похожа, безопасно принять лекарство, оставшееся у другого человека.",
            trueLabel: "Правда",
            falseLabel: "Ложь",
            answer: false,
            correct: "Верно.",
            incorrect: "Не совсем.",
            explanation: "Похожая боль может иметь другую причину или дозировку. Сначала спросите врача или фармацевта.",
          },
          {
            prompt: "Правда или ложь?",
            statement: "Мытьё рук с мылом и водой 20 секунд помогает остановить передачу многих микробов.",
            trueLabel: "Правда",
            falseLabel: "Ложь",
            answer: true,
            correct: "Верно.",
            incorrect: "Не совсем.",
            explanation: "Мыло и вода смывают микробы с кожи до того, как они попадут на лицо или к другим.",
          },
        ],
        nextQuizLabel: "Другой вопрос",
        action: { label: "Начать урок", href: "/health-information" },
      },
      risk: {
        label: "Проверить свои симптомы",
        hint: "Покажите, где болит, за несколько шагов.",
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
        action: { label: "Открыть карту", href: "/find-help" },
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
