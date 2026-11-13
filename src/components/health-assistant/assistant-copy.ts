/**
 * Patient-facing copy for the health assistant triage flow and the prescription result,
 * in all six site languages. `Record<Lang, AssistantCopy>` makes a missing key in any
 * language a type error, so no locale can silently fall back to Romanian.
 */
import type { PathwayId } from "@/lib/triage-state";
import type { Lang } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG } from "@/lib/i18n/routing";

export type RiskLevel = "low" | "moderate" | "high";
export type NavigationScenarioId = "family_doctor" | "no_insurance_id" | "hospital_documents";
export type MildCategoryId = "fever" | "headache" | "stomach" | "cough";
export type LearnTopicId = "vaccines" | "heart" | "child_fever" | "antibiotics";

interface Option {
  title: string;
  plainTitle: string;
  subtitle: string;
}

interface LearnTopic {
  title: string;
  subtitle: string;
  myth: string;
  doctor: string;
  plainDoctor: string;
  source: string;
}

interface RiskQuestion {
  title: string;
  text: string;
  plainText: string;
}

interface Step {
  title: string;
  body: string;
}

interface Scenario {
  title: string;
  desc: string;
  steps: [Step, Step, Step];
}

export interface AssistantCopy {
  machine: {
    back: string;
    intro: string;
    stepOf: (step: number, total?: number) => string;
    progressLabel: string;
    selectedTrailLabel: string;
  };
  tree: {
    heading: string;
    plainHeading: string;
    lead: string;
    bodyMapPrompt: string;
    bodyMapLink: string;
    mediatorTag: string;
    options: Record<PathwayId, Option>;
  };
  learn: {
    heading: string;
    lead: string;
    mythLabel: string;
    verdictFalse: string;
    doctorLabel: string;
    sourceLabel: string;
    readGuide: string;
    browseGuides: string;
    topics: Record<LearnTopicId, LearnTopic>;
    summary: (topic: string) => string;
  };
  risk: {
    heading: string;
    lead: string;
    quickTitle: string;
    quickBody: string;
    quickButton: string;
    questions: Record<"q1" | "q2" | "q3", RiskQuestion>;
    yes: string;
    no: string;
    submit: string;
    resultHeading: string;
    levelLabel: string;
    levels: Record<RiskLevel, string>;
    messages: Record<RiskLevel, string>;
    nextHeading: string;
    nextSteps: [string, string, string];
    summary: (level: string, count: number) => string;
  };
  gate: {
    heading: string;
    plainHeading: string;
    signs: string[];
    plainSigns: string[];
    callNow: string;
    yes: string;
    yesSeeTips: string;
    no: string;
    noNoneOfThese: string;
    note: string;
  };
  symptoms: {
    heading: string;
    lead: string;
    bodyMapHint: string;
    bodyMapCta: string;
    categories: Record<MildCategoryId, { title: string; desc: string }>;
    selectedLabel: string;
    body: string;
    plainBody: string;
    homeCareHeading: string;
    homeCareByCategory: Record<MildCategoryId, [string, string, string]>;
    whenToCallHeading: string;
    whenToCallTips: [string, string, string];
    safetyNet: string;
    summary: (category: string) => string;
    emergencyHeading: string;
    emergencyBody: string;
    callNow: string;
    callTipsTitle: string;
    callTips: [string, string, string];
    emergencyExitTitle: string;
    emergencyExitBody: string;
  };
  rx: {
    heading: string;
    lead: string;
    photoTitle: string;
    photoDesc: string;
    searchTitle: string;
    searchDesc: string;
    searchLabel: string;
    placeholder: string;
    suggestions: string;
    submit: string;
    resultHeading: (medicine: string) => string;
    fallbackMedicine: string;
    rulesHeading: string;
    rules: [string, string, string];
    plainRules: [string, string, string];
    exitTitle: string;
    exitBody: string;
    summary: (medicine: string) => string;
  };
  nav: {
    heading: string;
    lead: string;
    planHeading: string;
    scenarios: Record<NavigationScenarioId, Scenario>;
    mediatorTitle: string;
    mediatorBody: string;
    summary: (scenario: string) => string;
  };
  result: {
    heading: string;
    lead: string;
    pharmacistBannerTitle: string;
    pharmacistBannerBody: string;
    medicinesHeading: string;
    medicinesLead: string;
    scheduleSlots: {
      morning: string;
      midday: string;
      evening: string;
      bedtime: string;
    };
    noDoseAria: string;
    foodTiming: {
      before_meal: string;
      with_meal: string;
      after_meal: string;
    };
    durationLabel: (duration: string) => string;
    unclearBadge: string;
    listenMedicine: string;
    stopMedicine: string;
    listenMedicineAria: (medicineName: string) => string;
    assistantHeading: string;
    transcriptHeading: string;
    transcriptNote: string;
    rulesHeading: string;
    emergency: string;
    print: string;
    printAria: string;
    speech: (summary: string, rules: string) => string;
  };
}

const ro: AssistantCopy = {
  machine: {
    back: "Înapoi",
    intro: "Ghid pas cu pas",
    stepOf: (step, total = 3) => `Pasul ${step} din ${total}`,
    progressLabel: "Progresul prin ghid",
    selectedTrailLabel: "Răspunsurile alese până acum",
  },
  tree: {
    heading: "Ce te îngrijorează astăzi?",
    plainHeading: "Cu ce te putem ajuta astăzi?",
    lead: "Alege ce ți se potrivește.",
    bodyMapPrompt: "Vrei să arăți exact locul dureros pe corpul 3D?",
    bodyMapLink: "Deschide harta corpului 3D",
    mediatorTag: "Sprijin cu mediator sanitar",
    options: {
      learn: {
        title: "Vreau să aflu ceva",
        plainTitle: "Vreau sfaturi simple despre o boală",
        subtitle: "Răspunsuri simple despre vaccinuri, tensiune, febră și antibiotice",
      },
      risk: {
        title: "Vreau să-mi verific riscul",
        plainTitle: "Vreau să văd dacă am risc de diabet sau boli de inimă",
        subtitle: "3 întrebări scurte și ce poți face mai departe",
      },
      symptoms: {
        title: "Am o problemă de sănătate",
        plainTitle: "Nu mă simt bine chiar acum",
        subtitle: "Verificăm întâi semnele de alarmă, apoi te îndrumăm spre un medic",
      },
      prescription: {
        title: "Am o rețetă medicală",
        plainTitle: "Am o rețetă și nu înțeleg cum să iau pastilele",
        subtitle: "Fă o poză rețetei sau caută medicamentul",
      },
      navigation: {
        title: "Nu știu unde să merg",
        plainTitle: "Nu știu la ce doctor să merg sau nu am buletin",
        subtitle: "Unde mergi și ce acte îți trebuie, chiar fără asigurare",
      },
    },
  },
  learn: {
    heading: "Despre ce vrei să afli?",
    lead: "Explicații simple, cu sursa fiecărei informații.",
    mythLabel: "Mit răspândit",
    verdictFalse: "Fals",
    doctorLabel: "Ce este adevărat",
    sourceLabel: "Sursă",
    readGuide: "Citește ghidul complet",
    browseGuides: "Vezi toate ghidurile",
    topics: {
      vaccines: {
        title: "Vaccinuri și imunitate",
        subtitle: "Cât de sigure sunt vaccinurile și de ce ne protejează de bolile grave",
        myth: "Vaccinul gripal provoacă gripă sau slăbește corpul.",
        doctor:
          "Vaccinul gripal injectabil conține virus inactivat sau doar fragmente din el, care nu pot provoca gripa. El antrenează sistemul imunitar să recunoască virusul real.",
        plainDoctor:
          "Vaccinul este ca un exercițiu pentru corpul tău. Nu te îmbolnăvește, doar îl învață cum să se apere dacă întâlnește boala.",
        source: "Organizația Mondială a Sănătății și Ministerul Sănătății",
      },
      heart: {
        title: "Tensiune și inimă",
        subtitle: "Tensiunea mare „tăcută” și prevenția infarctului",
        myth: "Dacă nu mă doare capul, înseamnă că am tensiunea bună.",
        doctor:
          "Tensiunea mare de multe ori nu dă niciun semn până nu afectează inima sau vasele de sânge. De aceea trebuie măsurată des.",
        plainDoctor:
          "Tensiunea mare este ca un furtun prea umflat: nu te doare nimic până nu cedează. De aceea trebuie măsurată des cu aparatul, chiar dacă te simți foarte bine.",
        source: "Societatea Română de Cardiologie",
      },
      child_fever: {
        title: "Febra la copil",
        subtitle: "Cum scazi febra corect și când mergi la medic",
        myth: "Febra mare la copil trebuie scăzută imediat cu frecții cu alcool sau oțet.",
        doctor:
          "Alcoolul și oțetul se absorb prin pielea subțire a copilului și pot provoca intoxicații grave. Febra se scade cu antitermice în doza potrivită greutății și cu multe lichide.",
        plainDoctor:
          "Nu pune niciodată spirt sau oțet pe pielea copilului, pentru că se otrăvește prin piele. Dă-i apă sau ceai și siropul de febră recomandat de medic.",
        source: "Societatea Română de Pediatrie",
      },
      antibiotics: {
        title: "Răceală, gripă și antibiotice",
        subtitle: "De ce antibioticele nu vindecă virozele și ce înseamnă rezistența",
        myth: "Orice răceală puternică trece mai repede dacă iei antibiotic din prima zi.",
        doctor:
          "Răceala și gripa sunt cauzate de virusuri, iar antibioticele acționează doar asupra bacteriilor. Luate fără rost, afectează flora intestinală și favorizează rezistența la antibiotice.",
        plainDoctor:
          "Antibioticul omoară doar bacteriile, nu virusurile care dau răceala. Dacă îl iei când ești răcit, îți strici stomacul și nu te vindeci mai repede.",
        source: "Institutul Național de Boli Infecțioase „Prof. Dr. Matei Balș”",
      },
    },
    summary: (topic) => `Subiect de interes: ${topic}`,
  },
  risk: {
    heading: "Verificare rapidă a riscului",
    lead: "Răspunde cu Da sau Nu la 3 întrebări scurte. Rezultatul nu este un diagnostic.",
    quickTitle: "Nu ți se aplică nimic din listă?",
    quickBody: "Ai sub 45 de ani, nu ai diabet sau tensiune mare în familie și nu ai des aceste simptome.",
    quickButton: "Vezi risc scăzut",
    questions: {
      q1: {
        title: "Vârstă și familie",
        text: "Ai peste 45 de ani sau are cineva din familie (părinți, frați) diabet sau tensiune mare?",
        plainText: "Ai peste 45 de ani sau au avut părinții tăi diabet ori tensiune mare?",
      },
      q2: {
        title: "Cum te simți zilnic",
        text: "Simți des oboseală fără motiv, sete foarte mare sau dureri de cap frecvente?",
        plainText: "Te simți foarte obosit, bei multă apă fără să vrei sau te doare capul des?",
      },
      q3: {
        title: "Stil de viață",
        text: "Fumezi zilnic sau mănânci des mâncăruri sărate, prăjeli și dulciuri din comerț?",
        plainText: "Fumezi în fiecare zi sau mănânci des prăjeli, mezeluri sărate și dulciuri?",
      },
    },
    yes: "Da",
    no: "Nu",
    submit: "Vezi rezultatul",
    resultHeading: "Rezultatul verificării",
    levelLabel: "Nivelul estimat de risc",
    levels: { low: "Risc scăzut", moderate: "Risc moderat", high: "Risc crescut" },
    messages: {
      low: "Acum ai un risc scăzut pentru boli de inimă și diabet. Bea apă, mergi pe jos zilnic și fă un control o dată pe an.",
      moderate:
        "Ai câțiva factori de risc de urmărit. Cere medicului de familie să-ți măsoare tensiunea și zahărul din sânge (glicemia). Așa prinzi problemele din timp.",
      high: "Ai mai mulți factori de risc adunați. Vorbește cu un medic despre câteva analize de bază.",
    },
    nextHeading: "Ce poți face acum",
    nextSteps: [
      "Măsoară-ți tensiunea la farmacie sau la medicul de familie.",
      "Pune mai puțină sare în mâncare și bea cel puțin 6 pahare de apă pe zi.",
      "Fă o programare gratuită online ca să discuți rezultatul cu un medic.",
    ],
    summary: (level, count) => `Evaluare risc: ${level} (${count}/3 factori confirmați)`,
  },
  gate: {
    heading: "Ai acum vreunul dintre aceste semne de alarmă?",
    plainHeading: "Ai acum vreun semn foarte grav?",
    signs: [
      "Durere puternică în piept sau senzație de apăsare",
      "Respirație foarte grea",
      "Amorțeală sau slăbiciune bruscă pe o parte a feței sau a corpului",
      "Dificultate bruscă de a vorbi",
      "Sângerare abundentă",
    ],
    plainSigns: [
      "Te doare tare în piept, ca o apăsare mare",
      "Respiri foarte greu",
      "Ți-a amorțit sau a slăbit brusc fața, o mână sau un picior",
      "Nu mai poți vorbi limpede",
      "Sângerezi foarte tare",
    ],
    callNow: "Sună acum la 112",
    yes: "Da, am cel puțin un semn",
    yesSeeTips: "Da, vezi ce să spui la 112",
    no: "Nu, simptomele mele sunt mai ușoare",
    noNoneOfThese: "Nu, niciunul dintre acestea",
    note: "Dacă ești în pericol, sună tu la 112. Aplicația nu sună în locul tău.",
  },
  symptoms: {
    heading: "Ce te deranjează cel mai mult?",
    lead: "Alege categoria, apoi poți vorbi cu un medic online.",
    bodyMapHint: "Ai durere într-o zonă anume? Poți alege locul exact pe modelul 3D.",
    bodyMapCta: "Verifică pe corpul 3D",
    categories: {
      fever: {
        title: "Febră sau răceală",
        desc: "Temperatură, frisoane, dureri musculare, stare de moleșeală",
      },
      headache: {
        title: "Durere de cap sau de ceafă",
        desc: "Presiune la tâmple, ceafă încordată, ochi obosiți",
      },
      stomach: {
        title: "Dureri de burtă sau greață",
        desc: "Disconfort abdominal, crampe ușoare, arsuri sau greață fără vărsături repetate",
      },
      cough: {
        title: "Tuse sau durere în gât",
        desc: "Gât iritat, răgușeală, nas înfundat, tuse apărută recent",
      },
    },
    selectedLabel: "Ai ales",
    body: "Un medic te poate consulta repede. Îți spune ce tratament să iei și verifică să nu fie ceva grav.",
    plainBody:
      "Nu trebuie să suferi acasă sau să iei pastile la întâmplare. Poți vorbi gratuit cu un medic la telefon.",
    homeCareHeading: "Îngrijire sigură acasă",
    homeCareByCategory: {
      fever: [
        "Odihnește-te, aerisește camera și bea des apă sau ceai călduț.",
        "Măsoară temperatura cu termometrul și notează valorile.",
        "Nu lua antibiotice fără prescripția medicului.",
      ],
      headache: [
        "Ia o pauză de la ecrane într-o cameră liniștită și bea 1–2 pahare cu apă.",
        "Pune o compresă rece pe frunte sau masează ușor ceafa.",
        "Evită cafeaua în exces și lipsa de somn.",
      ],
      stomach: [
        "Bea apă cu înghițituri mici sau ceai neîndulcit de mușețel ori mentă.",
        "Alege mese mici și ușoare (orez fiert, supă clară, pâine prăjită).",
        "Evită prăjelile, alcoolul și antiinflamatoarele luate pe stomacul gol.",
      ],
      cough: [
        "Hidratează gâtul cu apă caldă sau ceai și aerisește camera.",
        "Dormi cu capul puțin mai ridicat pe pernă dacă tușești noaptea.",
        "Evită fumul de țigară și aerul foarte uscat.",
      ],
    },
    whenToCallHeading: "Când suni medicul sau la 112",
    whenToCallTips: [
      "Febra depășește 38,5 °C mai mult de 3 zile sau apare la un copil mic.",
      "Durerea devine brusc foarte puternică, burta se întărește sau nu poți reține lichidele.",
      "Apare lipsă de aer, durere în piept, confuzie sau slăbiciune bruscă — sună imediat la 112.",
    ],
    safetyNet: "Dacă te simți mult mai rău sau apare unul dintre semnele de alarmă, sună la 112.",
    summary: (category) => `Simptome ușoare: ${category}`,
    emergencyHeading: "Ai nevoie de ajutor medical acum",
    emergencyBody:
      "Pot fi semnele unei urgențe grave, cum ar fi un infarct, un accident vascular cerebral sau o hemoragie. Nu aștepta și nu căuta sfaturi online.",
    callNow: "Sună acum la 112",
    callTipsTitle: "Când vorbești cu dispecerul 112",
    callTips: [
      "Spune adresa exactă unde te afli.",
      "Spune ce simptome are persoana și dacă este conștientă.",
      "Rămâi la telefon și urmează indicațiile primite.",
    ],
    emergencyExitTitle: "Ai nevoie de sprijin până sosește ambulanța?",
    emergencyExitBody:
      "Sună întâi la 112. Dacă situația permite, un medic online te poate îndruma la telefon până sosește ajutorul.",
  },
  rx: {
    heading: "Cum vrei să verifici rețeta sau tratamentul?",
    lead: "Fă o poză rețetei sau caută direct un medicament.",
    photoTitle: "Încarcă o poză a rețetei",
    photoDesc: "Cu camera telefonului sau din galerie",
    searchTitle: "Scrie numele medicamentului",
    searchDesc: "Afli regulile de bază ca să-l iei în siguranță",
    searchLabel: "Numele medicamentului",
    placeholder: "De exemplu: Augmentin, Metformin",
    suggestions: "Sugestii de medicamente",
    submit: "Verifică medicamentul",
    resultHeading: (medicine) => `Reguli de siguranță pentru ${medicine}`,
    fallbackMedicine: "tratamentul tău",
    rulesHeading: "3 reguli ca să iei medicamentele în siguranță",
    rules: [
      "Ia medicamentul la aceleași ore în fiecare zi. Așa rămâne la un nivel constant în sânge.",
      "Evită alcoolul și verifică dacă medicamentul se ia înainte sau după masă.",
      "Nu întrerupe tratamentul mai devreme, mai ales în cazul antibioticelor, ca boala să nu revină.",
    ],
    plainRules: [
      "Ia pastilele la aceeași oră în fiecare zi, cu un pahar plin de apă.",
      "Nu bea alcool cât iei pastile și nu le lua pe stomacul gol decât dacă scrie clar pe cutie.",
      "Nu opri tratamentul când te simți mai bine. Termină toate zilele scrise de doctor.",
    ],
    exitTitle: "Nu știi sigur ce doză iei sau ce medicamente merg împreună?",
    exitBody: "Un medic online îți poate verifica rețeta și îți explică cum să iei fiecare medicament fără riscuri.",
    summary: (medicine) => `Întrebări despre rețetă sau medicament: ${medicine}`,
  },
  nav: {
    heading: "Alege situația în care te afli",
    lead: "Afli pașii și actele de care ai nevoie. Dacă te blochezi, te ajută un mediator.",
    planHeading: "Ce ai de făcut",
    scenarios: {
      family_doctor: {
        title: "Înscrierea la medicul de familie",
        desc: "Cum găsești un medic aproape de casă și ce acte îți trebuie, chiar dacă nu lucrezi",
        steps: [
          {
            title: "Unde mergi",
            body: "La cel mai apropiat cabinet de medicină de familie din localitatea ta. Poți alege orice medic care mai are locuri libere.",
          },
          {
            title: "Ce acte iei cu tine",
            body: "Buletinul (sau cartea de identitate provizorie), certificatele de naștere ale copiilor, dacă îi înscrii și pe ei, și dovada de asigurat, dacă o ai (cupon de pensie sau adeverință de salariat).",
          },
          {
            title: "Dacă nu ești asigurat",
            body: "Copiii sub 18 ani și femeile însărcinate sunt asigurați gratuit prin lege. Ca adult neasigurat, ai dreptul gratuit la pachetul minimal de servicii la medicul de familie.",
          },
        ],
      },
      no_insurance_id: {
        title: "Fără asigurare CNAS sau fără buletin",
        desc: "Ce drepturi ai la urgență și ce primești gratuit fără asigurare",
        steps: [
          {
            title: "La urgență (UPU)",
            body: "Dacă ai o problemă gravă, mergi direct la Unitatea de Primiri Urgențe a spitalului. Îngrijirea de urgență este gratuită prin lege pentru oricine.",
          },
          {
            title: "Pachetul minimal",
            body: "Și fără asigurare CNAS ai dreptul gratuit la îngrijire pentru boli infecțioase grave (TBC, hepatită), în sarcină și în urgențe.",
          },
          {
            title: "Fără acte de identitate",
            body: "Spitalul nu te poate refuza pentru că nu ai buletin. Personalul va nota datele pe care le declari tu.",
          },
        ],
      },
      hospital_documents: {
        title: "Acte pentru analize sau internare",
        desc: "Biletul de trimitere, cardul de sănătate, adeverința de asigurat și internarea",
        steps: [
          {
            title: "Biletul de trimitere",
            body: "Îl primești de la medicul de familie și este valabil 30 de zile (90 de zile pentru boli cronice).",
          },
          {
            title: "La internare",
            body: "Ia cu tine actul de identitate, biletul de trimitere și dosarul cu analizele sau rețetele anterioare.",
          },
          {
            title: "Cardul de sănătate",
            body: "Dacă nu ai primit cardul național de sănătate sau l-ai pierdut, poți cere de la Casa de Asigurări de Sănătate (CJAS) o adeverință de înlocuire valabilă 3 luni.",
          },
        ],
      },
    },
    mediatorTitle: "Ai probleme la ghișeu sau ești refuzat?",
    mediatorBody: "Un mediator sanitar te poate însoți și te ajută să-ți aperi drepturile.",
    summary: (scenario) => `Orientare în sistemul medical: ${scenario}`,
  },
  result: {
    heading: "Rețeta ta, pe înțeles",
    lead: "Asistentul poate greși la citire. Verifică mereu cu farmacistul sau cu medicul înainte să iei medicamentele.",
    pharmacistBannerTitle: "Arată farmacistului înainte să iei medicamentele",
    pharmacistBannerBody:
      "Unele cuvinte sau doze nu s-au putut citi clar în poză. Arată telefonul sau foaia tipărită farmacistului ca să îți confirme exact cum se ia tratamentul.",
    medicinesHeading: "Medicamentele citite de pe rețetă",
    medicinesLead: "Orele de mai jos apar doar dacă s-au putut citi clar pe rețetă.",
    scheduleSlots: {
      morning: "Dimineața",
      midday: "Prânz",
      evening: "Seara",
      bedtime: "Culcare",
    },
    noDoseAria: "Nicio doză trecută la această oră",
    foodTiming: {
      before_meal: "Înainte de masă",
      with_meal: "În timpul mesei",
      after_meal: "După masă",
    },
    durationLabel: (duration) => `Durată: ${duration}`,
    unclearBadge: "Scris neclar — verifică doza cu farmacistul",
    listenMedicine: "Ascultă",
    stopMedicine: "Oprește",
    listenMedicineAria: (medicineName) => `Ascultă instrucțiunile pentru ${medicineName}`,
    assistantHeading: "Explicația asistentului",
    transcriptHeading: "Textul citit de pe rețetă",
    transcriptNote: "Copiat cum apare pe rețetă. Unde scrie [unclear], textul nu s-a putut citi.",
    rulesHeading: "De reținut",
    emergency: "Asistentul a observat semne care pot fi urgente. Dacă te simți rău acum, sună la 112.",
    print: "Tipărește",
    printAria: "Tipărește explicația rețetei",
    speech: (summary, rules) => `${summary} De reținut: ${rules}`,
  },
};

const en: AssistantCopy = {
  machine: {
    back: "Back",
    intro: "Step-by-step guide",
    stepOf: (step, total = 3) => `Step ${step} of ${total}`,
    progressLabel: "Guide progress",
    selectedTrailLabel: "Selected answers so far",
  },
  tree: {
    heading: "What's worrying you today?",
    plainHeading: "How can we help you today?",
    lead: "Choose what fits you best.",
    bodyMapPrompt: "Want to point to the exact area on the 3D body?",
    bodyMapLink: "Open 3D body map",
    mediatorTag: "Community mediator support",
    options: {
      learn: {
        title: "I want to learn about something",
        plainTitle: "I want clear advice about an illness",
        subtitle: "Clear answers about vaccines, blood pressure, fever and antibiotics",
      },
      risk: {
        title: "I want to check my risk",
        plainTitle: "I want to see if I'm at risk of diabetes or heart disease",
        subtitle: "3 short questions and what you can do next",
      },
      symptoms: {
        title: "I have a health problem",
        plainTitle: "I don't feel well right now",
        subtitle: "We check for warning signs first, then point you to a doctor",
      },
      prescription: {
        title: "I have a prescription",
        plainTitle: "I have a prescription and don't understand how to take the pills",
        subtitle: "Take a photo of the prescription or look up the medicine",
      },
      navigation: {
        title: "I don't know where to go",
        plainTitle: "I don't know which doctor to see, or I have no ID card",
        subtitle: "Where to go and which papers you need, even without insurance",
      },
    },
  },
  learn: {
    heading: "What would you like to learn about?",
    lead: "Clear, trustworthy explanations, with the source of each piece of information.",
    mythLabel: "Common myth",
    verdictFalse: "False",
    doctorLabel: "What is true",
    sourceLabel: "Source",
    readGuide: "Read the full guide",
    browseGuides: "See all health guides",
    topics: {
      vaccines: {
        title: "Vaccines and immunity",
        subtitle: "How safe vaccines are and why they protect us from serious illness",
        myth: "The flu jab gives you the flu or weakens your body.",
        doctor:
          "The injected flu vaccine contains inactivated virus or only fragments of it, which cannot cause flu. It trains the immune system to recognise the real virus.",
        plainDoctor:
          "A vaccine is like a practice drill for your body. It does not make you ill; it teaches your body how to defend itself if it meets the disease.",
        source: "World Health Organization and the Romanian Ministry of Health",
      },
      heart: {
        title: "Blood pressure and the heart",
        subtitle: "“Silent” high blood pressure and preventing heart attacks",
        myth: "If I don't have a headache, my blood pressure must be fine.",
        doctor:
          "High blood pressure often gives no sign until it harms the heart or blood vessels. That is why it needs measuring regularly.",
        plainDoctor:
          "High blood pressure is like an over-inflated hose: nothing hurts until it bursts. That is why it needs measuring often, even when you feel perfectly well.",
        source: "Romanian Society of Cardiology",
      },
      child_fever: {
        title: "Fever in children",
        subtitle: "How to bring a fever down safely and when to see a doctor",
        myth: "A child's high fever must be brought down straight away by rubbing on alcohol or vinegar.",
        doctor:
          "Alcohol and vinegar are absorbed through a child's thin skin and can cause serious poisoning. Fever is treated with fever medicine dosed for the child's weight, and plenty of fluids.",
        plainDoctor:
          "Never put surgical spirit or vinegar on a child's skin: it poisons them through the skin. Give water or tea and the fever syrup your doctor recommends.",
        source: "Romanian Society of Paediatrics",
      },
      antibiotics: {
        title: "Colds, flu and antibiotics",
        subtitle: "Why antibiotics don't cure viral infections, and what resistance means",
        myth: "Any bad cold clears up faster if you take an antibiotic from day one.",
        doctor:
          "Colds and flu are caused by viruses, and antibiotics only act on bacteria. Taken needlessly, they upset the gut flora and encourage antibiotic resistance.",
        plainDoctor:
          "Antibiotics only kill bacteria, not the viruses that cause colds. If you take them for a cold, you upset your stomach and don't get better any faster.",
        source: "“Prof. Dr. Matei Balș” National Institute for Infectious Diseases",
      },
    },
    summary: (topic) => `Topic of interest: ${topic}`,
  },
  risk: {
    heading: "Quick risk check",
    lead: "Answer Yes or No to 3 short questions. The result is not a diagnosis.",
    quickTitle: "None of these apply to you?",
    quickBody: "You are under 45, nobody in your family has diabetes or high blood pressure, and you rarely have these symptoms.",
    quickButton: "See low risk",
    questions: {
      q1: {
        title: "Age and family",
        text: "Are you over 45, or does anyone in your close family (parents, brothers, sisters) have diabetes or high blood pressure?",
        plainText: "Are you over 45, or did your parents have diabetes or high blood pressure?",
      },
      q2: {
        title: "How you feel day to day",
        text: "Do you often feel tired for no reason, very thirsty, or get frequent headaches?",
        plainText: "Do you feel very tired, drink a lot of water without meaning to, or often have headaches?",
      },
      q3: {
        title: "Lifestyle",
        text: "Do you smoke every day, or often eat salty food, fried food and shop-bought sweets?",
        plainText: "Do you smoke every day, or often eat fried food, salty cured meats and sweets?",
      },
    },
    yes: "Yes",
    no: "No",
    submit: "See the result",
    resultHeading: "Your result",
    levelLabel: "Estimated risk level",
    levels: { low: "Low risk", moderate: "Moderate risk", high: "Raised risk" },
    messages: {
      low: "Right now your risk of heart disease and diabetes is low. Keep drinking water, walk every day and have a check-up once a year.",
      moderate:
        "You have some risk factors worth watching. Ask your family doctor to check your blood pressure and blood sugar. This catches problems early.",
      high: "You have several risk factors together. Talk to a doctor about some basic tests.",
    },
    nextHeading: "What you can do now",
    nextSteps: [
      "Have your blood pressure measured at a pharmacy or by your family doctor.",
      "Use less salt in your food and drink at least 6 glasses of water a day.",
      "Book a free online appointment to go through the result with a doctor.",
    ],
    summary: (level, count) => `Risk check: ${level} (${count}/3 factors confirmed)`,
  },
  gate: {
    heading: "Do you have any of these warning signs right now?",
    plainHeading: "Do you have any very serious sign right now?",
    signs: [
      "Severe chest pain or a feeling of pressure",
      "Great difficulty breathing",
      "Sudden numbness or weakness on one side of the face or body",
      "Sudden difficulty speaking",
      "Heavy bleeding",
    ],
    plainSigns: [
      "Your chest hurts badly, like a heavy weight pressing on it",
      "You find it very hard to breathe",
      "Your face, an arm or a leg has suddenly gone numb or weak",
      "You can't speak clearly any more",
      "You are bleeding a lot",
    ],
    callNow: "Call 112 now",
    yes: "Yes, I have at least one",
    yesSeeTips: "Yes, see what to tell 112",
    no: "No, my symptoms are milder",
    noNoneOfThese: "No, none of these",
    note: "If you are in danger, call 112 yourself. The app does not call for you.",
  },
  symptoms: {
    heading: "What is bothering you most?",
    lead: "Choose a category, then you can talk to a doctor online.",
    bodyMapHint: "Have pain in a specific spot? Point to the exact area on the 3D body.",
    bodyMapCta: "Check on 3D body",
    categories: {
      fever: {
        title: "Fever or a cold",
        desc: "High temperature, chills, aching muscles, feeling run down",
      },
      headache: {
        title: "Headache or neck pain",
        desc: "Pressure at the temples, a stiff, tense neck, tired eyes",
      },
      stomach: {
        title: "Stomach ache or nausea",
        desc: "Tummy discomfort, mild cramps, heartburn or nausea without repeated vomiting",
      },
      cough: {
        title: "Cough or sore throat",
        desc: "Scratchy throat, hoarse voice, blocked nose, a recent cough",
      },
    },
    selectedLabel: "You chose",
    body: "A doctor can see you quickly. They tell you what treatment to take and check it is nothing serious.",
    plainBody: "You don't have to suffer at home or take pills at random. You can talk to a doctor by phone, for free.",
    homeCareHeading: "Safe home care",
    homeCareByCategory: {
      fever: [
        "Rest in a ventilated room and sip water or warm herbal tea often.",
        "Check your temperature with a thermometer and note any changes.",
        "Do not start leftover antibiotics without a doctor's prescription.",
      ],
      headache: [
        "Step away from screens in a quiet room and drink 1–2 glasses of water.",
        "Place a cool damp cloth on your forehead or gently relax your shoulders.",
        "Avoid skipping meals, excess caffeine and late nights.",
      ],
      stomach: [
        "Take small sips of water or plain chamomile or peppermint tea.",
        "Stick to small, light meals such as plain rice, clear broth or toast.",
        "Avoid fried food, alcohol and painkillers on an empty stomach.",
      ],
      cough: [
        "Soothe your throat with warm fluids and keep the room air fresh.",
        "Prop your head up slightly on an extra pillow if coughing at night.",
        "Avoid cigarette smoke and dry indoor air.",
      ],
    },
    whenToCallHeading: "When to call a doctor or 112",
    whenToCallTips: [
      "Fever stays above 38.5 °C for more than 3 days, or affects a young child.",
      "Pain suddenly becomes severe, your abdomen feels rigid, or you cannot keep fluids down.",
      "Shortness of breath, chest pressure, confusion or sudden weakness appears — call 112 right away.",
    ],
    safetyNet: "If you feel much worse or any of the warning signs appear, call 112.",
    summary: (category) => `Mild symptoms: ${category}`,
    emergencyHeading: "You need medical help now",
    emergencyBody:
      "They may be signs of a serious emergency such as a heart attack, a stroke or a haemorrhage. Do not wait, and do not look for advice online.",
    callNow: "Call 112 now",
    callTipsTitle: "When you speak to the 112 operator",
    callTips: [
      "Give the exact address where you are.",
      "Say what symptoms the person has and whether they are conscious.",
      "Stay on the line and follow the instructions you are given.",
    ],
    emergencyExitTitle: "Need support until the ambulance arrives?",
    emergencyExitBody:
      "Call 112 first. If the situation allows, an online doctor can guide you by phone until help arrives.",
  },
  rx: {
    heading: "How would you like to check your prescription?",
    lead: "Take a photo of the prescription, or look up a medicine by name.",
    photoTitle: "Upload a photo of the prescription",
    photoDesc: "With your phone camera or from your gallery",
    searchTitle: "Type the name of the medicine",
    searchDesc: "The basic rules for taking it safely",
    searchLabel: "Medicine name",
    placeholder: "For example: Augmentin, Metformin",
    suggestions: "Medicine suggestions",
    submit: "Check the medicine",
    resultHeading: (medicine) => `Safety rules for ${medicine}`,
    fallbackMedicine: "your treatment",
    rulesHeading: "3 rules for taking medicine safely",
    rules: [
      "Take it at the same times every day. This keeps a steady level in your blood.",
      "Avoid alcohol, and check whether the medicine is taken before or after food.",
      "Don't stop the course early, especially with antibiotics, so the illness does not come back.",
    ],
    plainRules: [
      "Take your pills at the same time every day, with a full glass of water.",
      "Don't drink alcohol while taking pills, and don't take them on an empty stomach unless the box clearly says so.",
      "Don't stop when you feel better. Finish all the days your doctor wrote down.",
    ],
    exitTitle: "Not sure about doses, or which medicines go together?",
    exitBody: "An online doctor can check your prescription and explain how to take each medicine safely.",
    summary: (medicine) => `Questions about a prescription or medicine: ${medicine}`,
  },
  nav: {
    heading: "Choose the situation you are in",
    lead: "See the steps and the papers you need. If you get stuck, a mediator can help.",
    planHeading: "What to do",
    scenarios: {
      family_doctor: {
        title: "Registering with a family doctor",
        desc: "How to find a doctor near home and which papers you need, even if you are not working",
        steps: [
          {
            title: "Where to go",
            body: "To the nearest family medicine practice in your town or village. You can choose any family doctor who still has free places.",
          },
          {
            title: "What to bring",
            body: "Your identity card (or temporary identity card), your children's birth certificates if you are registering them too, and proof of insurance if you have it (pension slip or employer's certificate).",
          },
          {
            title: "If you are not insured",
            body: "Children under 18 and pregnant women are insured free of charge by law. As an uninsured adult, you are entitled to a free basic package of services from the family doctor.",
          },
        ],
      },
      no_insurance_id: {
        title: "No CNAS health insurance or no ID card",
        desc: "Your rights in an emergency and what you get free without insurance",
        steps: [
          {
            title: "In an emergency (UPU)",
            body: "If you have a serious problem, go straight to the hospital's emergency department (UPU). Emergency care is free by law for everyone.",
          },
          {
            title: "The basic package",
            body: "Even without CNAS insurance (Romania's national health insurance), you have free care for serious infectious diseases (TB, hepatitis), in pregnancy and in emergencies.",
          },
          {
            title: "Without identity papers",
            body: "A hospital cannot turn you away because you have no ID card. Staff will record the details you give them.",
          },
        ],
      },
      hospital_documents: {
        title: "Papers for tests or a hospital stay",
        desc: "Referral letter, health card, proof of insurance and hospital admission",
        steps: [
          {
            title: "The referral letter",
            body: "Your family doctor issues it. It is valid for 30 days (90 days for chronic conditions).",
          },
          {
            title: "When you are admitted",
            body: "Bring your identity document, the referral letter and your file of previous test results or prescriptions.",
          },
          {
            title: "The health card",
            body: "If you never received your national health card or have lost it, you can ask the county health insurance office (CJAS) for a replacement certificate valid for 3 months.",
          },
        ],
      },
    },
    mediatorTitle: "Having trouble at the desk, or being turned away?",
    mediatorBody: "A health mediator can go with you and help you stand up for your rights.",
    summary: (scenario) => `Finding my way in the health system: ${scenario}`,
  },
  result: {
    heading: "Your prescription explained clearly",
    lead: "The assistant can misread a prescription. Always check with your pharmacist or doctor before you take the medicines.",
    pharmacistBannerTitle: "Show this to your pharmacist before taking the medicines",
    pharmacistBannerBody:
      "Some words or doses were not clear in the photo. Show your phone or printed sheet to the pharmacist so they can confirm the exact instructions.",
    medicinesHeading: "Medicines read from your prescription",
    medicinesLead: "Times of day appear below only when clearly written on the prescription.",
    scheduleSlots: {
      morning: "Morning",
      midday: "Midday",
      evening: "Evening",
      bedtime: "Bedtime",
    },
    noDoseAria: "No dose listed for this time",
    foodTiming: {
      before_meal: "Before food",
      with_meal: "With food",
      after_meal: "After food",
    },
    durationLabel: (duration) => `Duration: ${duration}`,
    unclearBadge: "Unclear writing — check the dose with your pharmacist",
    listenMedicine: "Listen",
    stopMedicine: "Stop",
    listenMedicineAria: (medicineName) => `Listen to instructions for ${medicineName}`,
    assistantHeading: "The assistant's explanation",
    transcriptHeading: "Text read from the prescription",
    transcriptNote: "Copied as written. Where it says [unclear], the text could not be read.",
    rulesHeading: "Keep in mind",
    emergency: "The assistant noticed signs that may be urgent. If you feel unwell now, call 112.",
    print: "Print",
    printAria: "Print the prescription explanation",
    speech: (summary, rules) => `${summary} Keep in mind: ${rules}`,
  },
};

const sq: AssistantCopy = {
  machine: {
    back: "Kthehu",
    intro: "Udhëzues hap pas hapi",
    stepOf: (step, total = 3) => `Hapi ${step} nga ${total}`,
    progressLabel: "Përparimi në udhëzues",
    selectedTrailLabel: "Përgjigjet e zgjedhura deri tani",
  },
  tree: {
    heading: "Çfarë të shqetëson sot?",
    plainHeading: "Si mund të të ndihmojmë sot?",
    lead: "Zgjidh atë që të përshtatet.",
    bodyMapPrompt: "Do të tregosh vendin e saktë të dhimbjes në trupin 3D?",
    bodyMapLink: "Hap hartën e trupit 3D",
    mediatorTag: "Mbështetje me mediator shëndetësor",
    options: {
      learn: {
        title: "Dua të mësoj diçka",
        plainTitle: "Dua këshilla të thjeshta për një sëmundje",
        subtitle: "Përgjigje të thjeshta për vaksinat, presionin, temperaturën dhe antibiotikët",
      },
      risk: {
        title: "Dua të kontrolloj rrezikun tim",
        plainTitle: "Dua të shoh nëse rrezikoj diabet ose sëmundje të zemrës",
        subtitle: "3 pyetje të shkurtra dhe çfarë mund të bësh më pas",
      },
      symptoms: {
        title: "Kam një problem shëndetësor",
        plainTitle: "Nuk ndihem mirë tani",
        subtitle: "Së pari shohim shenjat e rrezikut, pastaj të drejtojmë te një mjek",
      },
      prescription: {
        title: "Kam një recetë mjekësore",
        plainTitle: "Kam një recetë dhe nuk e kuptoj si t'i marr ilaçet",
        subtitle: "Bëj një foto të recetës ose kërko ilaçin",
      },
      navigation: {
        title: "Nuk e di ku të shkoj",
        plainTitle: "Nuk e di te cili mjek të shkoj ose nuk kam letërnjoftim",
        subtitle: "Ku të shkosh dhe çfarë dokumentesh të duhen, edhe pa sigurim",
      },
    },
  },
  learn: {
    heading: "Për çfarë do të mësosh?",
    lead: "Shpjegime të thjeshta, me burimin e çdo informacioni.",
    mythLabel: "Mit i përhapur",
    verdictFalse: "E rreme",
    doctorLabel: "Çfarë është e vërtetë",
    sourceLabel: "Burimi",
    readGuide: "Lexo udhëzuesin e plotë",
    browseGuides: "Të gjithë udhëzuesit",
    topics: {
      vaccines: {
        title: "Vaksinat dhe imuniteti",
        subtitle: "Sa të sigurta janë vaksinat dhe pse na mbrojnë nga sëmundjet e rënda",
        myth: "Vaksina e gripit të shkakton grip ose të dobëson trupin.",
        doctor:
          "Vaksina e gripit me injeksion përmban virus të çaktivizuar ose vetëm pjesë të tij, që nuk mund të shkaktojnë grip. Ajo e stërvit sistemin imunitar të njohë virusin e vërtetë.",
        plainDoctor:
          "Vaksina është si një stërvitje për trupin tënd. Nuk të sëmur, vetëm i mëson trupit si të mbrohet nëse has sëmundjen.",
        source: "Organizata Botërore e Shëndetësisë dhe Ministria e Shëndetësisë e Rumanisë",
      },
      heart: {
        title: "Presioni i gjakut dhe zemra",
        subtitle: "Presioni i lartë “i heshtur” dhe parandalimi i infarktit",
        myth: "Nëse nuk më dhemb koka, presioni im është në rregull.",
        doctor:
          "Presioni i lartë i gjakut shpesh nuk jep asnjë shenjë derisa dëmton zemrën ose enët e gjakut. Prandaj duhet matur rregullisht.",
        plainDoctor:
          "Presioni i lartë është si një zorrë uji tepër e fryrë: nuk dhemb asgjë derisa të çahet. Prandaj duhet matur shpesh, edhe kur ndihesh shumë mirë.",
        source: "Shoqata Rumune e Kardiologjisë",
      },
      child_fever: {
        title: "Temperatura te fëmijët",
        subtitle: "Si ta ulësh temperaturën pa rrezik dhe kur të shkosh te mjeku",
        myth: "Temperatura e lartë e fëmijës duhet ulur menjëherë duke e fërkuar me alkool ose uthull.",
        doctor:
          "Alkooli dhe uthulla thithen nga lëkura e hollë e fëmijës dhe mund të shkaktojnë helmim të rëndë. Temperatura ulet me ilaçe kundër temperaturës në dozën sipas peshës dhe me shumë lëngje.",
        plainDoctor:
          "Mos i vër kurrë alkool ose uthull në lëkurën e fëmijës, sepse helmohet përmes lëkurës. Jepi ujë ose çaj dhe shurupin për temperaturën që rekomandon mjeku.",
        source: "Shoqata Rumune e Pediatrisë",
      },
      antibiotics: {
        title: "Ftohja, gripi dhe antibiotikët",
        subtitle: "Pse antibiotikët nuk shërojnë viruset dhe çfarë do të thotë rezistenca",
        myth: "Çdo ftohje e fortë kalon më shpejt nëse merr antibiotik që ditën e parë.",
        doctor:
          "Ftohja dhe gripi shkaktohen nga viruset, ndërsa antibiotikët veprojnë vetëm mbi bakteret. Të marrë pa nevojë, ata dëmtojnë florën e zorrëve dhe nxitin rezistencën ndaj antibiotikëve.",
        plainDoctor:
          "Antibiotiku vret vetëm bakteret, jo viruset që shkaktojnë ftohjen. Nëse e merr kur je ftohur, prish stomakun dhe nuk shërohesh më shpejt.",
        source: "Instituti Kombëtar i Sëmundjeve Infektive “Prof. Dr. Matei Balș”",
      },
    },
    summary: (topic) => `Tema me interes: ${topic}`,
  },
  risk: {
    heading: "Kontroll i shpejtë i rrezikut",
    lead: "Përgjigju me Po ose Jo 3 pyetjeve të shkurtra. Rezultati nuk është diagnozë.",
    quickTitle: "Nuk të përket asgjë nga lista?",
    quickBody: "Je nën 45 vjeç, askush në familje nuk ka diabet ose presion të lartë dhe nuk i ke shpesh këto shenja.",
    quickButton: "Shiko rrezik të ulët",
    questions: {
      q1: {
        title: "Mosha dhe familja",
        text: "Je mbi 45 vjeç, apo ka dikush në familjen e ngushtë (prindër, vëllezër, motra) diabet ose presion të lartë?",
        plainText: "Je mbi 45 vjeç, apo prindërit e tu kanë pasur diabet ose presion të lartë?",
      },
      q2: {
        title: "Si ndihesh çdo ditë",
        text: "Ndihesh shpesh i lodhur pa arsye, ke etje shumë të madhe apo dhimbje koke të shpeshta?",
        plainText: "Ndihesh shumë i lodhur, pi shumë ujë pa e kuptuar ose të dhemb shpesh koka?",
      },
      q3: {
        title: "Mënyra e jetesës",
        text: "Pi duhan çdo ditë, apo ha shpesh ushqime të kripura, të skuqura dhe ëmbëlsira të blera?",
        plainText: "Pi duhan çdo ditë, apo ha shpesh të skuqura, mish të kripur dhe ëmbëlsira?",
      },
    },
    yes: "Po",
    no: "Jo",
    submit: "Shiko rezultatin",
    resultHeading: "Rezultati yt",
    levelLabel: "Niveli i vlerësuar i rrezikut",
    levels: { low: "Rrezik i ulët", moderate: "Rrezik mesatar", high: "Rrezik i shtuar" },
    messages: {
      low: "Tani ke rrezik të ulët për sëmundje të zemrës dhe diabet. Pi ujë, ec çdo ditë dhe bëj një kontroll një herë në vit.",
      moderate:
        "Ke disa faktorë rreziku që duhen ndjekur. Kërkoji mjekut të familjes të të masë presionin dhe sheqerin në gjak. Kështu problemet kapen në kohë.",
      high: "Ke disa faktorë rreziku bashkë. Fol me një mjek për disa analiza bazë.",
    },
    nextHeading: "Çfarë mund të bësh tani",
    nextSteps: [
      "Mat presionin e gjakut në farmaci ose te mjeku i familjes.",
      "Përdor më pak kripë në ushqim dhe pi të paktën 6 gota ujë në ditë.",
      "Rezervo falas një takim online për ta diskutuar rezultatin me një mjek.",
    ],
    summary: (level, count) => `Kontrolli i rrezikut: ${level} (${count}/3 faktorë të konfirmuar)`,
  },
  gate: {
    heading: "Ke tani ndonjë nga këto shenja rreziku?",
    plainHeading: "Ke tani ndonjë shenjë shumë të rëndë?",
    signs: [
      "Dhimbje e fortë në gjoks ose ndjesi shtrëngimi",
      "Frymëmarrje shumë e vështirë",
      "Mpirje ose dobësi e papritur në njërën anë të fytyrës ose të trupit",
      "Vështirësi e papritur për të folur",
      "Gjakderdhje e madhe",
    ],
    plainSigns: [
      "Të dhemb fort gjoksi, si një peshë e rëndë që shtyp",
      "Ke shumë vështirësi të marrësh frymë",
      "Të është mpirë ose dobësuar papritur fytyra, një krah ose një këmbë",
      "Nuk mund të flasësh më qartë",
      "Po humbet shumë gjak",
    ],
    callNow: "Telefono tani 112",
    yes: "Po, kam të paktën një shenjë",
    yesSeeTips: "Po, çfarë t'i thuash 112",
    no: "Jo, simptomat e mia janë më të lehta",
    noNoneOfThese: "Jo, asnjërën nga këto",
    note: "Nëse je në rrezik, telefono vetë 112. Aplikacioni nuk telefonon për ty.",
  },
  symptoms: {
    heading: "Çfarë të shqetëson më shumë?",
    lead: "Zgjidh kategorinë, pastaj mund të flasësh me një mjek online.",
    bodyMapHint: "Ke dhimbje në një vend të caktuar? Zgjidh pikën e saktë në trupin 3D.",
    bodyMapCta: "Kontrollo në trupin 3D",
    categories: {
      fever: {
        title: "Temperaturë ose ftohje",
        desc: "Temperaturë e lartë, të dridhura, dhimbje muskujsh, këputje",
      },
      headache: {
        title: "Dhimbje koke ose qafe",
        desc: "Shtypje në tëmtha, qafë e tendosur, sy të lodhur",
      },
      stomach: {
        title: "Dhimbje barku ose të përzier",
        desc: "Shqetësim në bark, ngërçe të lehta, urth ose të përziera pa të vjella të përsëritura",
      },
      cough: {
        title: "Kollë ose dhimbje fyti",
        desc: "Fyt i acaruar, zë i ngjirur, hundë e zënë, kollë e kohëve të fundit",
      },
    },
    selectedLabel: "Zgjodhe",
    body: "Një mjek mund të të shohë shpejt. Të thotë çfarë trajtimi të marrësh dhe kontrollon që të mos jetë diçka e rëndë.",
    plainBody: "Nuk ke pse të vuash në shtëpi ose të marrësh ilaçe kuturu. Mund të flasësh falas me një mjek në telefon.",
    homeCareHeading: "Kujdes i sigurt në shtëpi",
    homeCareByCategory: {
      fever: [
        "Pusho në një dhomë të ajrosur dhe pi shpesh ujë ose çaj të ngrohtë.",
        "Mat temperaturën me termometër dhe shëno vlerat.",
        "Mos merr antibiotikë pa recetën e mjekut.",
      ],
      headache: [
        "Bëj pushim nga ekranet në një dhomë të qetë dhe pi 1–2 gota ujë.",
        "Vendos një leckë të freskët në ballë ose çliro butësisht shpatullat.",
        "Shmang kafenë e tepërt dhe pagjumësinë.",
      ],
      stomach: [
        "Pi ujë me gllënjka të vogla ose çaj kamomili a menteje pa sheqer.",
        "Ha vakte të vogla dhe të lehta si oriz i zier, supë e lehtë ose bukë e thekur.",
        "Shmang ushqimet e skuqura, alkoolin dhe qetësuesit me stomak bosh.",
      ],
      cough: [
        "Lagështo fytin me ujë të ngrohtë ose çaj dhe ajros dhomën.",
        "Fli me kokën pak më të ngritur në jastëk nëse kollitesh natën.",
        "Shmang tymin e duhanit dhe ajrin shumë të thatë.",
      ],
    },
    whenToCallHeading: "Kur të telefonosh mjekun ose 112",
    whenToCallTips: [
      "Temperatura kalon 38,5 °C për më shumë se 3 ditë ose shfaqet te një fëmijë i vogël.",
      "Dhimbja bëhet papritur shumë e fortë, barku forcohet ose nuk mban dot lëngjet.",
      "Shfaqet vështirësi në frymëmarrje, shtypje në gjoks, hutim ose dobësi e menjëhershme — telefono 112.",
    ],
    safetyNet: "Nëse ndihesh shumë më keq ose shfaqet ndonjë nga shenjat e rrezikut, telefono 112.",
    summary: (category) => `Simptoma të lehta: ${category}`,
    emergencyHeading: "Të duhet ndihmë mjekësore tani",
    emergencyBody:
      "Mund të jenë shenja të një urgjence të rëndë, si infarkt, goditje në tru ose hemorragji. Mos prit dhe mos kërko këshilla në internet.",
    callNow: "Telefono tani 112",
    callTipsTitle: "Kur flet me operatorin e 112",
    callTips: [
      "Thuaj adresën e saktë ku ndodhesh.",
      "Thuaj çfarë simptomash ka personi dhe nëse është i vetëdijshëm.",
      "Rri në telefon dhe ndiq udhëzimet që merr.",
    ],
    emergencyExitTitle: "Të duhet ndihmë derisa të vijë ambulanca?",
    emergencyExitBody:
      "Telefono së pari 112. Nëse situata e lejon, një mjek online mund të të udhëzojë në telefon derisa të vijë ndihma.",
  },
  rx: {
    heading: "Si do ta kontrollosh recetën ose trajtimin?",
    lead: "Bëj një foto të recetës ose kërko direkt një ilaç.",
    photoTitle: "Ngarko një foto të recetës",
    photoDesc: "Me kamerën e telefonit ose nga galeria",
    searchTitle: "Shkruaj emrin e ilaçit",
    searchDesc: "Rregullat bazë për ta marrë pa rrezik",
    searchLabel: "Emri i ilaçit",
    placeholder: "Për shembull: Augmentin, Metformin",
    suggestions: "Sugjerime ilaçesh",
    submit: "Kontrollo ilaçin",
    resultHeading: (medicine) => `Rregulla sigurie për ${medicine}`,
    fallbackMedicine: "trajtimin tënd",
    rulesHeading: "3 rregulla për t'i marrë ilaçet pa rrezik",
    rules: [
      "Merre ilaçin në të njëjtat orë çdo ditë. Kështu mbetet në një nivel të qëndrueshëm në gjak.",
      "Shmang alkoolin dhe shiko nëse ilaçi merret para apo pas ngrënies.",
      "Mos e ndërprit trajtimin para kohe, sidomos me antibiotikë, që sëmundja të mos rikthehet.",
    ],
    plainRules: [
      "Merri ilaçet në të njëjtën orë çdo ditë, me një gotë plot me ujë.",
      "Mos pi alkool kur merr ilaçe dhe mos i merr me stomak bosh, përveç kur shkruhet qartë në kuti.",
      "Mos e ndërprit kur ndihesh më mirë. Përfundo të gjitha ditët që ka shkruar mjeku.",
    ],
    exitTitle: "Nuk je i sigurt për dozat ose cilat ilaçe shkojnë bashkë?",
    exitBody: "Një mjek online mund ta kontrollojë recetën tënde dhe të të shpjegojë si ta marrësh çdo ilaç pa rrezik.",
    summary: (medicine) => `Pyetje për recetën ose ilaçin: ${medicine}`,
  },
  nav: {
    heading: "Zgjidh situatën ku ndodhesh",
    lead: "Shiko hapat dhe dokumentet që të duhen. Nëse ngec, të ndihmon një mediator shëndetësor.",
    planHeading: "Çfarë duhet të bësh",
    scenarios: {
      family_doctor: {
        title: "Regjistrimi te mjeku i familjes",
        desc: "Si të gjesh një mjek pranë shtëpisë dhe çfarë dokumentesh të duhen, edhe nëse nuk punon",
        steps: [
          {
            title: "Ku të shkosh",
            body: "Në ambulancën më të afërt të mjekësisë familjare në vendbanimin tënd. Mund të zgjedhësh çdo mjek familjeje që ka ende vende të lira.",
          },
          {
            title: "Çfarë të marrësh me vete",
            body: "Letërnjoftimin (ose letërnjoftimin e përkohshëm), certifikatat e lindjes së fëmijëve nëse i regjistron edhe ata, dhe dëshminë e sigurimit nëse e ke (talloni i pensionit ose vërtetimi nga punëdhënësi).",
          },
          {
            title: "Nëse nuk je i siguruar",
            body: "Fëmijët nën 18 vjeç dhe gratë shtatzëna janë të siguruar falas me ligj. Si i rritur pa sigurim, ke të drejtë falas për paketën minimale të shërbimeve te mjeku i familjes.",
          },
        ],
      },
      no_insurance_id: {
        title: "Pa sigurim CNAS ose pa letërnjoftim",
        desc: "Të drejtat e tua në urgjencë dhe çfarë merr falas pa sigurim",
        steps: [
          {
            title: "Në urgjencë (UPU)",
            body: "Nëse ke një problem të rëndë, shko direkt në urgjencën e spitalit (UPU). Kujdesi urgjent është falas me ligj për këdo.",
          },
          {
            title: "Paketa minimale",
            body: "Edhe pa sigurimin CNAS (sigurimi shëndetësor kombëtar i Rumanisë), ke kujdes falas për sëmundje të rënda infektive (TBC, hepatit), gjatë shtatzënisë dhe në urgjenca.",
          },
          {
            title: "Pa dokumente identiteti",
            body: "Spitali nuk mund të të refuzojë sepse nuk ke letërnjoftim. Stafi do të shënojë të dhënat që jep ti.",
          },
        ],
      },
      hospital_documents: {
        title: "Dokumente për analiza ose shtrim në spital",
        desc: "Fleta e dërgimit, karta shëndetësore, dëshmia e sigurimit dhe shtrimi në spital",
        steps: [
          {
            title: "Fleta e dërgimit",
            body: "E lëshon mjeku i familjes dhe vlen 30 ditë (90 ditë për sëmundjet kronike).",
          },
          {
            title: "Kur shtrohesh",
            body: "Merr me vete dokumentin e identitetit, fletën e dërgimit dhe dosjen me analizat ose recetat e mëparshme.",
          },
          {
            title: "Karta shëndetësore",
            body: "Nëse nuk e ke marrë kartën kombëtare të shëndetit ose e ke humbur, mund të kërkosh te zyra e sigurimeve shëndetësore të qarkut (CJAS) një vërtetim zëvendësues që vlen 3 muaj.",
          },
        ],
      },
    },
    mediatorTitle: "Ke vështirësi në sportel ose të refuzojnë?",
    mediatorBody: "Një mediator shëndetësor mund të të shoqërojë dhe të të ndihmojë të mbrosh të drejtat e tua.",
    summary: (scenario) => `Orientim në sistemin shëndetësor: ${scenario}`,
  },
  result: {
    heading: "Receta jote e shpjeguar qartë",
    lead: "Asistenti mund të gabojë kur lexon. Kontrollo gjithmonë me farmacistin ose mjekun para se t'i marrësh ilaçet.",
    pharmacistBannerTitle: "Tregoja farmacistit para se t'i marrësh ilaçet",
    pharmacistBannerBody:
      "Disa fjalë ose doza nuk u lexuan qartë në foto. Tregoji telefonin ose fletën e printuar farmacistit që të konfirmojë saktë si merren.",
    medicinesHeading: "Ilaçet e lexuara nga receta",
    medicinesLead: "Oraret më poshtë shfaqen vetëm kur shkruhen qartë në recetë.",
    scheduleSlots: {
      morning: "Mëngjes",
      midday: "Drekë",
      evening: "Mbrëmje",
      bedtime: "Para gjumit",
    },
    noDoseAria: "Nuk ka dozë të shënuar për këtë orar",
    foodTiming: {
      before_meal: "Para buke",
      with_meal: "Gjatë bukës",
      after_meal: "Pas buke",
    },
    durationLabel: (duration) => `Kohëzgjatja: ${duration}`,
    unclearBadge: "Shkrim i paqartë — kontrollo dozën me farmacistin",
    listenMedicine: "Dëgjo",
    stopMedicine: "Ndalo",
    listenMedicineAria: (medicineName) => `Dëgjo udhëzimet për ${medicineName}`,
    assistantHeading: "Shpjegimi i asistentit",
    transcriptHeading: "Teksti i lexuar nga receta",
    transcriptNote: "Kopjuar siç është shkruar. Aty ku shkruhet [unclear], teksti nuk u lexua dot.",
    rulesHeading: "Mbaj parasysh",
    emergency: "Asistenti vuri re shenja që mund të jenë urgjente. Nëse ndihesh keq tani, telefono 112.",
    print: "Printo",
    printAria: "Printo shpjegimin e recetës",
    speech: (summary, rules) => `${summary} Mbaj parasysh: ${rules}`,
  },
};

const it: AssistantCopy = {
  machine: {
    back: "Indietro",
    intro: "Guida passo dopo passo",
    stepOf: (step, total = 3) => `Passo ${step} di ${total}`,
    progressLabel: "Avanzamento della guida",
    selectedTrailLabel: "Risposte scelte finora",
  },
  tree: {
    heading: "Cosa ti preoccupa oggi?",
    plainHeading: "Come possiamo aiutarti oggi?",
    lead: "Scegli quella più vicina alla tua situazione.",
    bodyMapPrompt: "Vuoi indicare il punto esatto sul corpo 3D?",
    bodyMapLink: "Apri la mappa del corpo 3D",
    mediatorTag: "Supporto con mediatore sanitario",
    options: {
      learn: {
        title: "Voglio informarmi",
        plainTitle: "Voglio consigli semplici su una malattia",
        subtitle: "Risposte semplici su vaccini, pressione, febbre e antibiotici",
      },
      risk: {
        title: "Voglio controllare il mio rischio",
        plainTitle: "Voglio sapere se rischio il diabete o malattie del cuore",
        subtitle: "3 domande brevi e cosa puoi fare dopo",
      },
      symptoms: {
        title: "Ho un problema di salute",
        plainTitle: "Non mi sento bene in questo momento",
        subtitle: "Prima controlliamo i segnali d'allarme, poi ti indirizziamo a un medico",
      },
      prescription: {
        title: "Ho una ricetta medica",
        plainTitle: "Ho una ricetta e non capisco come prendere le pastiglie",
        subtitle: "Fai una foto alla ricetta o cerca il farmaco",
      },
      navigation: {
        title: "Non so dove andare",
        plainTitle: "Non so da quale medico andare o non ho la carta d'identità",
        subtitle: "Dove andare e quali documenti servono, anche senza assicurazione",
      },
    },
  },
  learn: {
    heading: "Di cosa vuoi saperne di più?",
    lead: "Spiegazioni semplici, con la fonte di ogni informazione.",
    mythLabel: "Mito diffuso",
    verdictFalse: "Falso",
    doctorLabel: "Come stanno le cose",
    sourceLabel: "Fonte",
    readGuide: "Leggi la guida completa",
    browseGuides: "Vedi tutte le guide",
    topics: {
      vaccines: {
        title: "Vaccini e immunità",
        subtitle: "Quanto sono sicuri i vaccini e perché ci proteggono dalle malattie gravi",
        myth: "Il vaccino antinfluenzale fa venire l'influenza o indebolisce il corpo.",
        doctor:
          "Il vaccino antinfluenzale iniettabile contiene virus inattivato o solo frammenti del virus, che non possono causare l'influenza. Allena il sistema immunitario a riconoscere il virus vero.",
        plainDoctor:
          "Il vaccino è come un allenamento per il tuo corpo. Non ti fa ammalare: gli insegna come difendersi se incontra la malattia.",
        source: "Organizzazione Mondiale della Sanità e Ministero della Salute romeno",
      },
      heart: {
        title: "Pressione e cuore",
        subtitle: "La pressione alta “silenziosa” e la prevenzione dell'infarto",
        myth: "Se non ho mal di testa, la mia pressione va bene.",
        doctor:
          "La pressione alta spesso non dà nessun segno finché non danneggia il cuore o i vasi sanguigni. Per questo va misurata con regolarità.",
        plainDoctor:
          "La pressione alta è come un tubo troppo gonfio: non fa male finché non si rompe. Per questo va misurata spesso, anche quando ti senti benissimo.",
        source: "Società Romena di Cardiologia",
      },
      child_fever: {
        title: "La febbre nei bambini",
        subtitle: "Come abbassare la febbre in sicurezza e quando andare dal medico",
        myth: "La febbre alta del bambino va abbassata subito con frizioni di alcol o aceto.",
        doctor:
          "Alcol e aceto vengono assorbiti dalla pelle sottile del bambino e possono causare intossicazioni gravi. La febbre si abbassa con antipiretici dosati in base al peso e con molti liquidi.",
        plainDoctor:
          "Non mettere mai alcol o aceto sulla pelle del bambino: si avvelena attraverso la pelle. Dagli acqua o tè e lo sciroppo per la febbre consigliato dal medico.",
        source: "Società Romena di Pediatria",
      },
      antibiotics: {
        title: "Raffreddore, influenza e antibiotici",
        subtitle: "Perché gli antibiotici non curano le infezioni virali e cosa significa resistenza",
        myth: "Un forte raffreddore passa prima se prendi l'antibiotico dal primo giorno.",
        doctor:
          "Raffreddore e influenza sono causati da virus, mentre gli antibiotici agiscono solo sui batteri. Presi senza motivo, alterano la flora intestinale e favoriscono la resistenza agli antibiotici.",
        plainDoctor:
          "L'antibiotico uccide solo i batteri, non i virus del raffreddore. Se lo prendi quando sei raffreddato, ti rovini lo stomaco e non guarisci prima.",
        source: "Istituto Nazionale di Malattie Infettive “Prof. Dr. Matei Balș”",
      },
    },
    summary: (topic) => `Argomento di interesse: ${topic}`,
  },
  risk: {
    heading: "Controllo rapido del rischio",
    lead: "Rispondi Sì o No a 3 domande brevi. Il risultato non è una diagnosi.",
    quickTitle: "Nessuna di queste cose ti riguarda?",
    quickBody: "Hai meno di 45 anni, nessuno in famiglia ha diabete o pressione alta e non hai spesso questi sintomi.",
    quickButton: "Vedi rischio basso",
    questions: {
      q1: {
        title: "Età e famiglia",
        text: "Hai più di 45 anni, oppure qualcuno della tua famiglia stretta (genitori, fratelli, sorelle) ha il diabete o la pressione alta?",
        plainText: "Hai più di 45 anni, oppure i tuoi genitori hanno avuto il diabete o la pressione alta?",
      },
      q2: {
        title: "Come ti senti ogni giorno",
        text: "Ti senti spesso stanco senza motivo, hai molta sete o mal di testa frequenti?",
        plainText: "Ti senti molto stanco, bevi tanta acqua senza volerlo o hai spesso mal di testa?",
      },
      q3: {
        title: "Stile di vita",
        text: "Fumi ogni giorno, oppure mangi spesso cibi salati, fritti e dolci confezionati?",
        plainText: "Fumi ogni giorno, oppure mangi spesso fritti, salumi salati e dolci?",
      },
    },
    yes: "Sì",
    no: "No",
    submit: "Vedi il risultato",
    resultHeading: "Il tuo risultato",
    levelLabel: "Livello di rischio stimato",
    levels: { low: "Rischio basso", moderate: "Rischio moderato", high: "Rischio elevato" },
    messages: {
      low: "In questo momento il tuo rischio di malattie del cuore e diabete è basso. Continua a bere acqua, cammina ogni giorno e fai un controllo una volta l'anno.",
      moderate:
        "Hai alcuni fattori di rischio da tenere d'occhio. Chiedi al medico di famiglia di controllarti la pressione e lo zucchero nel sangue. Così scopri i problemi per tempo.",
      high: "Hai più fattori di rischio insieme. Parla con un medico per fare alcuni esami di base.",
    },
    nextHeading: "Cosa puoi fare adesso",
    nextSteps: [
      "Misura la pressione in farmacia o dal medico di famiglia.",
      "Usa meno sale nei cibi e bevi almeno 6 bicchieri d'acqua al giorno.",
      "Prenota gratuitamente una visita online per parlare del risultato con un medico.",
    ],
    summary: (level, count) => `Controllo del rischio: ${level} (${count}/3 fattori confermati)`,
  },
  gate: {
    heading: "Hai adesso uno di questi segnali d'allarme?",
    plainHeading: "Hai adesso qualche segnale molto grave?",
    signs: [
      "Dolore forte al petto o sensazione di oppressione",
      "Grande difficoltà a respirare",
      "Intorpidimento o debolezza improvvisa su un lato del viso o del corpo",
      "Difficoltà improvvisa a parlare",
      "Sanguinamento abbondante",
    ],
    plainSigns: [
      "Ti fa molto male il petto, come un peso che schiaccia",
      "Fai molta fatica a respirare",
      "All'improvviso senti intorpiditi o deboli il viso, un braccio o una gamba",
      "Non riesci più a parlare chiaramente",
      "Stai perdendo molto sangue",
    ],
    callNow: "Chiama subito il 112",
    yes: "Sì, ho almeno un segnale",
    yesSeeTips: "Sì, vedi cosa dire al 112",
    no: "No, i miei sintomi sono più lievi",
    noNoneOfThese: "No, nessuno di questi",
    note: "Se sei in pericolo, chiama tu il 112. L'app non chiama al posto tuo.",
  },
  symptoms: {
    heading: "Cosa ti dà più fastidio?",
    lead: "Scegli la categoria, poi potrai parlare con un medico online.",
    bodyMapHint: "Hai dolore in un punto preciso? Puoi indicarlo sul modello 3D.",
    bodyMapCta: "Controlla sul corpo 3D",
    categories: {
      fever: {
        title: "Febbre o raffreddore",
        desc: "Temperatura alta, brividi, dolori muscolari, spossatezza",
      },
      headache: {
        title: "Mal di testa o dolore al collo",
        desc: "Pressione alle tempie, collo rigido e teso, occhi stanchi",
      },
      stomach: {
        title: "Mal di pancia o nausea",
        desc: "Fastidio addominale, crampi lievi, bruciore di stomaco o nausea senza vomito ripetuto",
      },
      cough: {
        title: "Tosse o mal di gola",
        desc: "Gola irritata, raucedine, naso chiuso, tosse comparsa da poco",
      },
    },
    selectedLabel: "Hai scelto",
    body: "Un medico può visitarti in fretta. Ti dice quale cura seguire e controlla che non sia niente di grave.",
    plainBody: "Non devi soffrire a casa o prendere pastiglie a caso. Puoi parlare gratis con un medico al telefono.",
    homeCareHeading: "Cura sicura a casa",
    homeCareByCategory: {
      fever: [
        "Riposa in una stanza arieggiata e bevi spesso acqua o tisane tiepide.",
        "Misura la temperatura con il termometro e annota i valori.",
        "Non iniziare antibiotici senza la prescrizione del medico.",
      ],
      headache: [
        "Fai una pausa dagli schermi in una stanza tranquilla e bevi 1–2 bicchieri d'acqua.",
        "Applica un panno fresco sulla fronte o rilassa delicatamente il collo.",
        "Evita l'eccesso di caffè e la mancanza di sonno.",
      ],
      stomach: [
        "Bevi acqua a piccoli sorsi oppure camomilla o menta non zuccherate.",
        "Scegli pasti piccoli e leggeri come riso in bianco, brodo chiaro o pane tostato.",
        "Evita fritti, alcol e antinfiammatori a stomaco vuoto.",
      ],
      cough: [
        "Idrata la gola con bevande tiepide e arieggia spesso la stanza.",
        "Dormi con la testa leggermente sollevata sul cuscino se tossisci di notte.",
        "Evita il fumo di sigaretta e l'aria troppo secca.",
      ],
    },
    whenToCallHeading: "Quando chiamare il medico o il 112",
    whenToCallTips: [
      "La febbre supera 38,5 °C per più di 3 giorni o riguarda un bambino piccolo.",
      "Il dolore diventa improvvisamente molto forte, l'addome è rigido o non trattieni i liquidi.",
      "Compare mancanza di respiro, peso al petto, confusione o debolezza improvvisa — chiama subito il 112.",
    ],
    safetyNet: "Se ti senti molto peggio o compare uno dei segnali d'allarme, chiama il 112.",
    summary: (category) => `Sintomi lievi: ${category}`,
    emergencyHeading: "Ti serve subito un aiuto medico",
    emergencyBody:
      "Possono essere i segni di un'emergenza grave, come un infarto, un ictus o un'emorragia. Non aspettare e non cercare consigli online.",
    callNow: "Chiama subito il 112",
    callTipsTitle: "Quando parli con l'operatore del 112",
    callTips: [
      "Indica l'indirizzo esatto in cui ti trovi.",
      "Spiega quali sintomi ha la persona e se è cosciente.",
      "Resta al telefono e segui le indicazioni che ricevi.",
    ],
    emergencyExitTitle: "Ti serve supporto finché arriva l'ambulanza?",
    emergencyExitBody:
      "Chiama prima il 112. Se la situazione lo permette, un medico online può guidarti al telefono finché arrivano i soccorsi.",
  },
  rx: {
    heading: "Come vuoi controllare la ricetta o la terapia?",
    lead: "Fai una foto alla ricetta o cerca direttamente un farmaco.",
    photoTitle: "Carica una foto della ricetta",
    photoDesc: "Con la fotocamera del telefono o dalla galleria",
    searchTitle: "Scrivi il nome del farmaco",
    searchDesc: "Le regole di base per prenderlo in sicurezza",
    searchLabel: "Nome del farmaco",
    placeholder: "Ad esempio: Augmentin, Metformina",
    suggestions: "Suggerimenti di farmaci",
    submit: "Controlla il farmaco",
    resultHeading: (medicine) => `Regole di sicurezza per ${medicine}`,
    fallbackMedicine: "la tua terapia",
    rulesHeading: "3 regole per prendere i farmaci in sicurezza",
    rules: [
      "Prendilo sempre alle stesse ore. Così resta a un livello costante nel sangue.",
      "Evita l'alcol e controlla se il farmaco va preso prima o dopo i pasti.",
      "Non interrompere la terapia prima del tempo, soprattutto con gli antibiotici, perché la malattia non ritorni.",
    ],
    plainRules: [
      "Prendi le pastiglie alla stessa ora ogni giorno, con un bicchiere pieno d'acqua.",
      "Non bere alcol mentre prendi le pastiglie e non prenderle a stomaco vuoto, a meno che sulla scatola non sia scritto chiaramente.",
      "Non smettere quando ti senti meglio. Finisci tutti i giorni indicati dal medico.",
    ],
    exitTitle: "Hai dubbi sulle dosi o su quali farmaci prendere insieme?",
    exitBody: "Un medico online può controllare la tua ricetta e spiegarti come prendere ogni farmaco senza rischi.",
    summary: (medicine) => `Domande su ricetta o farmaco: ${medicine}`,
  },
  nav: {
    heading: "Scegli la situazione in cui ti trovi",
    lead: "Vedi i passi e i documenti che servono. Se resti bloccato, ti aiuta un mediatore.",
    planHeading: "Cosa fare",
    scenarios: {
      family_doctor: {
        title: "Iscriversi dal medico di famiglia",
        desc: "Come trovare un medico vicino a casa e quali documenti servono, anche se non lavori",
        steps: [
          {
            title: "Dove andare",
            body: "Allo studio di medicina di famiglia più vicino nella tua località. Puoi scegliere qualsiasi medico di famiglia che abbia ancora posti liberi.",
          },
          {
            title: "Cosa portare",
            body: "La carta d'identità (o quella provvisoria), i certificati di nascita dei figli se iscrivi anche loro e la prova di assicurazione se ce l'hai (cedolino della pensione o certificato del datore di lavoro).",
          },
          {
            title: "Se non sei assicurato",
            body: "I minori di 18 anni e le donne in gravidanza sono assicurati gratuitamente per legge. Da adulto non assicurato hai diritto gratis al pacchetto minimo di servizi dal medico di famiglia.",
          },
        ],
      },
      no_insurance_id: {
        title: "Senza assicurazione CNAS o senza carta d'identità",
        desc: "I tuoi diritti in emergenza e cosa ricevi gratis senza assicurazione",
        steps: [
          {
            title: "In emergenza (UPU)",
            body: "Se hai un problema grave, vai direttamente al pronto soccorso dell'ospedale (UPU). Le cure d'emergenza sono gratuite per legge per chiunque.",
          },
          {
            title: "Il pacchetto minimo",
            body: "Anche senza assicurazione CNAS (l'assicurazione sanitaria nazionale romena) hai cure gratuite per malattie infettive gravi (TBC, epatite), in gravidanza e nelle emergenze.",
          },
          {
            title: "Senza documenti d'identità",
            body: "L'ospedale non può rifiutarti perché non hai la carta d'identità. Il personale registrerà i dati che dichiari.",
          },
        ],
      },
      hospital_documents: {
        title: "Documenti per esami o ricovero",
        desc: "Impegnativa, tessera sanitaria, prova di assicurazione e ricovero",
        steps: [
          {
            title: "L'impegnativa",
            body: "La rilascia il medico di famiglia ed è valida 30 giorni (90 giorni per le malattie croniche).",
          },
          {
            title: "Al ricovero",
            body: "Porta un documento d'identità, l'impegnativa e la cartella con gli esami o le ricette precedenti.",
          },
          {
            title: "La tessera sanitaria",
            body: "Se non hai mai ricevuto la tessera sanitaria nazionale o l'hai persa, puoi chiedere alla cassa di assicurazione sanitaria della provincia (CJAS) un certificato sostitutivo valido 3 mesi.",
          },
        ],
      },
    },
    mediatorTitle: "Hai difficoltà allo sportello o ti hanno rifiutato?",
    mediatorBody: "Un mediatore sanitario può accompagnarti e aiutarti a far valere i tuoi diritti.",
    summary: (scenario) => `Orientamento nel sistema sanitario: ${scenario}`,
  },
  result: {
    heading: "La tua ricetta spiegata con chiarezza",
    lead: "L'assistente può leggere male una ricetta. Verifica sempre con il farmacista o con il medico prima di prendere i farmaci.",
    pharmacistBannerTitle: "Mostralo al farmacista prima di prendere i farmaci",
    pharmacistBannerBody:
      "Alcune parole o dosi non si leggevano bene nella foto. Mostra il telefono o il foglio stampato al farmacista per confermare le dosi esatte.",
    medicinesHeading: "Farmaci letti dalla ricetta",
    medicinesLead: "Gli orari qui sotto compaiono solo se scritti chiaramente sulla ricetta.",
    scheduleSlots: {
      morning: "Mattina",
      midday: "Pranzo",
      evening: "Sera",
      bedtime: "Prima di dormire",
    },
    noDoseAria: "Nessuna dose indicata per questo orario",
    foodTiming: {
      before_meal: "Prima dei pasti",
      with_meal: "Durante i pasti",
      after_meal: "Dopo i pasti",
    },
    durationLabel: (duration) => `Durata: ${duration}`,
    unclearBadge: "Scrittura poco chiara — verifica la dose con il farmacista",
    listenMedicine: "Ascolta",
    stopMedicine: "Ferma",
    listenMedicineAria: (medicineName) => `Ascolta le indicazioni per ${medicineName}`,
    assistantHeading: "La spiegazione dell'assistente",
    transcriptHeading: "Testo letto dalla ricetta",
    transcriptNote: "Copiato così com'è scritto. Dove compare [unclear], il testo non era leggibile.",
    rulesHeading: "Da ricordare",
    emergency: "L'assistente ha notato segnali che potrebbero essere urgenti. Se ora ti senti male, chiama il 112.",
    print: "Stampa",
    printAria: "Stampa la spiegazione della ricetta",
    speech: (summary, rules) => `${summary} Da ricordare: ${rules}`,
  },
};

const hr: AssistantCopy = {
  machine: {
    back: "Natrag",
    intro: "Vodič korak po korak",
    stepOf: (step, total = 3) => `Korak ${step} od ${total}`,
    progressLabel: "Napredak kroz vodič",
    selectedTrailLabel: "Dosad odabrani odgovori",
  },
  tree: {
    heading: "Što te danas brine?",
    plainHeading: "Kako ti danas možemo pomoći?",
    lead: "Odaberi ono što ti najviše odgovara.",
    bodyMapPrompt: "Želiš li pokazati točno mjesto boli na 3D tijelu?",
    bodyMapLink: "Otvori 3D kartu tijela",
    mediatorTag: "Podrška zdravstvenog medijatora",
    options: {
      learn: {
        title: "Želim saznati više",
        plainTitle: "Želim jednostavne savjete o bolesti",
        subtitle: "Jednostavni odgovori o cjepivima, krvnom tlaku, vrućici i antibioticima",
      },
      risk: {
        title: "Želim provjeriti svoj rizik",
        plainTitle: "Želim vidjeti imam li rizik za dijabetes ili bolesti srca",
        subtitle: "3 kratka pitanja i što možeš učiniti dalje",
      },
      symptoms: {
        title: "Imam zdravstveni problem",
        plainTitle: "Trenutno se ne osjećam dobro",
        subtitle: "Prvo provjeravamo znakove uzbune, a zatim te usmjeravamo liječniku",
      },
      prescription: {
        title: "Imam liječnički recept",
        plainTitle: "Imam recept i ne razumijem kako uzimati tablete",
        subtitle: "Fotografiraj recept ili potraži lijek",
      },
      navigation: {
        title: "Ne znam kamo otići",
        plainTitle: "Ne znam kojem liječniku otići ili nemam osobnu iskaznicu",
        subtitle: "Kamo otići i koji ti dokumenti trebaju, čak i bez osiguranja",
      },
    },
  },
  learn: {
    heading: "O čemu želiš saznati više?",
    lead: "Jednostavna objašnjenja uz naveden izvor svake informacije.",
    mythLabel: "Rašireni mit",
    verdictFalse: "Netočno",
    doctorLabel: "Što je točno",
    sourceLabel: "Izvor",
    readGuide: "Pročitaj cijeli vodič",
    browseGuides: "Svi zdravstveni vodiči",
    topics: {
      vaccines: {
        title: "Cjepiva i imunitet",
        subtitle: "Koliko su cjepiva sigurna i zašto nas štite od teških bolesti",
        myth: "Cjepivo protiv gripe izaziva gripu ili oslabljuje tijelo.",
        doctor:
          "Injekcijsko cjepivo protiv gripe sadrži inaktivirani virus ili samo njegove dijelove koji ne mogu izazvati gripu. Ono uči imunološki sustav prepoznati pravi virus.",
        plainDoctor:
          "Cjepivo je poput vježbe za tvoje tijelo. Ne uzrokuje bolest, nego uči tijelo kako se obraniti ako sretne virus.",
        source: "Svjetska zdravstvena organizacija i Hrvatski zavod za javno zdravstvo",
      },
      heart: {
        title: "Krvni tlak i srce",
        subtitle: "„Tihi” povišeni krvni tlak i prevencija srčanog udara",
        myth: "Ako me ne boli glava, moj je krvni tlak sigurno uredan.",
        doctor:
          "Povišeni krvni tlak često ne daje nikakve simptome dok ne ošteti srce ili krvne žile. Zato ga treba redovito mjeriti.",
        plainDoctor:
          "Visoki krvni tlak je poput prenapuhanog crijeva za vodu jer ništa ne boli dok ne popusti. Zato tlak treba redovito mjeriti tlakomjerom čak i kad se osjećaš sasvim dobro.",
        source: "Europsko kardiološko društvo i Hrvatsko kardiološko društvo",
      },
      child_fever: {
        title: "Vrućica kod djeteta",
        subtitle: "Kako sigurno sniziti vrućicu i kada otići liječniku",
        myth: "Visoku vrućicu kod djeteta treba odmah skidati trljanjem alkoholom ili octom.",
        doctor:
          "Alkohol i ocat upijaju se kroz tanku dječju kožu i mogu izazvati teško trovanje. Vrućica se snižava lijekovima prilagođenima tjelesnoj masi djeteta i obilnim unosom tekućine.",
        plainDoctor:
          "Nikada ne stavljaj alkohol ili ocat na djetetovu kožu jer mogu otrovati dijete kroz kožu. Daj djetetu vode ili čaja i sirup za vrućicu koji je preporučio liječnik.",
        source: "Hrvatsko pedijatrijsko društvo i Svjetska zdravstvena organizacija",
      },
      antibiotics: {
        title: "Prehlada, gripa i antibiotici",
        subtitle: "Zašto antibiotici ne liječe virusne infekcije i što znači otpornost",
        myth: "Svaka jača prehlada brže prođe ako od prvog dana uzmeš antibiotik.",
        doctor:
          "Prehladu i gripu uzrokuju virusi, a antibiotici djeluju samo na bakterije. Uzeti bez potrebe, narušavaju crijevnu floru i potiču otpornost bakterija na antibiotike.",
        plainDoctor:
          "Antibiotik uništava samo bakterije, a ne viruse koji uzrokuju prehladu. Ako ga uzmeš zbog prehlade, iziritirat ćeš želudac i crijeva, a nećeš brže ozdraviti.",
        source: "Europski centar za prevenciju i kontrolu bolesti",
      },
    },
    summary: (topic) => `Tema interesa: ${topic}`,
  },
  risk: {
    heading: "Brza provjera rizika",
    lead: "Odgovori s Da ili Ne na 3 kratka pitanja. Rezultat nije medicinska dijagnoza.",
    quickTitle: "Ništa s popisa se ne odnosi na tebe?",
    quickBody: "Imaš manje od 45 godina, nitko u obitelji nema dijabetes ni povišeni krvni tlak i rijetko imaš ove simptome.",
    quickButton: "Vidi nizak rizik",
    questions: {
      q1: {
        title: "Dob i obitelj",
        text: "Imaš li više od 45 godina ili netko u tvojoj užoj obitelji (roditelji, braća, sestre) ima dijabetes ili povišeni krvni tlak?",
        plainText: "Imaš li više od 45 godina ili su tvoji roditelji imali dijabetes ili visoki krvni tlak?",
      },
      q2: {
        title: "Kako se osjećaš svaki dan",
        text: "Osjećaš li često umor bez razloga, jaku žeđ ili česte glavobolje?",
        plainText: "Osjećaš li se jako umorno, piješ li puno vode bez jasnog razloga ili te često boli glava?",
      },
      q3: {
        title: "Životne navike",
        text: "Pušiš li svakodnevno ili često jedeš slanu hranu, pržena jela i kupovne slatkiše?",
        plainText: "Pušiš li svaki dan ili često jedeš prženu hranu, slane suhomesnate proizvode i slatkiše?",
      },
    },
    yes: "Da",
    no: "Ne",
    submit: "Pogledaj rezultat",
    resultHeading: "Rezultat provjere",
    levelLabel: "Procijenjena razina rizika",
    levels: { low: "Nizak rizik", moderate: "Umjeren rizik", high: "Povišen rizik" },
    messages: {
      low: "Trenutno imaš nizak rizik za bolesti srca i dijabetes. Pij dovoljno vode, hodaj svaki dan i obavi preventivni pregled jednom godišnje.",
      moderate:
        "Imaš nekoliko čimbenika rizika na koje vrijedi pripaziti. Zamoli obiteljskog liječnika da ti izmjeri krvni tlak i šećer u krvi. Tako se tegobe otkriju na vrijeme.",
      high: "Imaš više udruženih čimbenika rizika. Razgovaraj s liječnikom o osnovnim laboratorijskim pretragama.",
    },
    nextHeading: "Što možeš učiniti sada",
    nextSteps: [
      "Izmjeri krvni tlak u ljekarni ili kod obiteljskog liječnika.",
      "Koristi manje soli u hrani i pij najmanje 6 čaša vode dnevno.",
      "Dogovori besplatan online razgovor kako bi s liječnikom prošao ili prošla kroz rezultat.",
    ],
    summary: (level, count) => `Procjena rizika: ${level} (${count}/3 potvrđena čimbenika)`,
  },
  gate: {
    heading: "Imaš li upravo sada neki od ovih znakova uzbune?",
    plainHeading: "Imaš li upravo sada neki vrlo ozbiljan znak?",
    signs: [
      "Jaka bol ili osjećaj pritiska u prsnom košu",
      "Jako otežano disanje ili zaduha",
      "Nagla utrnulost ili slabost jedne strane lica ili tijela",
      "Nagli poremećaj govora",
      "Jako krvarenje",
    ],
    plainSigns: [
      "Jako te boli u prsima, kao da ti težak teret pritišće prsni koš",
      "Vrlo teško dišeš i nedostaje ti zraka",
      "Odjednom ti je utrnulo ili oslabilo lice, ruka ili noga",
      "Više ne možeš razgovijetno govoriti",
      "Jako krvariš",
    ],
    callNow: "Nazovi 112 odmah",
    yes: "Da, imam barem jedan znak",
    yesSeeTips: "Da, što reći na 112",
    no: "Ne, moji su simptomi blaži",
    noNoneOfThese: "Ne, ništa od navedenog",
    note: "Ako si u opasnosti, sam ili sama nazovi 112. Aplikacija ne poziva umjesto tebe.",
  },
  symptoms: {
    heading: "Što ti najviše smeta?",
    lead: "Odaberi kategoriju, a zatim možeš razgovarati s liječnikom online.",
    bodyMapHint: "Imaš bol na određenom mjestu? Označi točno područje na 3D modelu.",
    bodyMapCta: "Provjeri na 3D tijelu",
    categories: {
      fever: {
        title: "Vrućica ili prehlada",
        desc: "Povišena temperatura, zimica, bolovi u mišićima i iscrpljenost",
      },
      headache: {
        title: "Glavobolja ili bol u vratu",
        desc: "Pritisak u sljepoočnicama, ukočen vrat i umorne oči",
      },
      stomach: {
        title: "Bol u trbuhu ili mučnina",
        desc: "Nelagoda u trbuhu, blagi grčevi, žgaravica ili mučnina bez ponavljanog povraćanja",
      },
      cough: {
        title: "Kašalj ili grlobolja",
        desc: "Nadraženo grlo, promuklost, začepljen nos i nedavno nastali kašalj",
      },
    },
    selectedLabel: "Odabrao ili odabrala si",
    body: "Liječnik te može brzo savjetovati. Objasnit će ti što uzeti i provjeriti postoji li razlog za brigu.",
    plainBody: "Ne moraš trpjeti kod kuće niti uzimati tablete nasumice. Možeš besplatno razgovarati s liječnikom telefonom.",
    homeCareHeading: "Sigurna njega kod kuće",
    homeCareByCategory: {
      fever: [
        "Odmaraj u prozračenoj prostoriji i često pij vodu ili mlaki čaj.",
        "Izmjeri temperaturu toplomjerom i zabilježi vrijednosti.",
        "Nemoj uzimati antibiotike bez liječničkog recepta.",
      ],
      headache: [
        "Odmori oči od ekrana u mirnoj sobi i popij 1–2 čaše vode.",
        "Stavi hladan oblog na čelo ili lagano opusti vrat i ramena.",
        "Izbjegavaj previše kave i manjak sna.",
      ],
      stomach: [
        "Pij vodu u malim gutljajima ili nezaslađeni čaj od kamilice ili mente.",
        "Jedi male i lagane obroke poput kuhane riže, bistre juhe ili dvopeka.",
        "Izbjegavaj prženu hranu, alkohol i lijekove protiv bolova na prazan želudac.",
      ],
      cough: [
        "Vlaži grlo toplim napitcima i redovito prozračuj prostoriju.",
        "Spavaj s blago povišenim uzglavljem ako te kašalj budi noću.",
        "Izbjegavaj duhanski dim i jako suh zrak.",
      ],
    },
    whenToCallHeading: "Kada nazvati liječnika ili 112",
    whenToCallTips: [
      "Vrućica prelazi 38,5 °C dulje od 3 dana ili se javlja kod malog djeteta.",
      "Bol naglo postane jako izražena, trbuh je tvrd ili ne možeš zadržati tekućinu.",
      "Pojavi se otežano disanje, pritisak u prsima, zbunjenost ili nagla slabost: odmah nazovi 112.",
    ],
    safetyNet: "Ako se osjećaš znatno lošije ili se pojavi bilo koji znak uzbune, nazovi 112.",
    summary: (category) => `Blagi simptomi: ${category}`,
    emergencyHeading: "Potrebna ti je hitna medicinska pomoć",
    emergencyBody:
      "To mogu biti znakovi teškog hitnog stanja poput srčanog udara, moždanog udara ili jakog krvarenja. Nemoj čekati i nemoj tražiti savjete na internetu.",
    callNow: "Nazovi 112 odmah",
    callTipsTitle: "Kada razgovaraš s operaterom na broju 112",
    callTips: [
      "Reci točnu adresu na kojoj se nalaziš.",
      "Opiši koje simptome osoba ima i je li pri svijesti.",
      "Ostani na liniji i slijedi upute operatera.",
    ],
    emergencyExitTitle: "Trebaš li podršku dok ne stigne hitna pomoć?",
    emergencyExitBody:
      "Prvo nazovi 112. Ako situacija dopušta, liječnik online može te telefonom voditi dok pomoć ne stigne.",
  },
  rx: {
    heading: "Kako želiš provjeriti recept ili terapiju?",
    lead: "Fotografiraj recept ili izravno potraži lijek.",
    photoTitle: "Učitaj fotografiju recepta",
    photoDesc: "Kamerom telefona ili iz galerije",
    searchTitle: "Upiši naziv lijeka",
    searchDesc: "Saznaj osnovna pravila za sigurno uzimanje",
    searchLabel: "Naziv lijeka",
    placeholder: "Na primjer: Augmentin, Metformin",
    suggestions: "Prijedlozi lijekova",
    submit: "Provjeri lijek",
    resultHeading: (medicine) => `Sigurnosna pravila za ${medicine}`,
    fallbackMedicine: "tvoju terapiju",
    rulesHeading: "3 pravila za sigurno uzimanje lijekova",
    rules: [
      "Uzimaj lijek svakog dana u isto vrijeme. Tako njegova razina u krvi ostaje ujednačena.",
      "Izbjegavaj alkohol i provjeri uzima li se lijek prije ili poslije jela.",
      "Nemoj prekidati terapiju ranije, osobito kod antibiotika, kako se bolest ne bi vratila.",
    ],
    plainRules: [
      "Uzimaj tablete svaki dan u isto vrijeme uz punu čašu vode.",
      "Nemoj piti alkohol dok uzimaš lijekove i nemoj ih piti na prazan želudac osim ako tako piše na kutiji.",
      "Nemoj prestati uzimati lijek čim ti bude bolje. Popij terapiju sve dane kako je liječnik odredio.",
    ],
    exitTitle: "Nisi siguran ili sigurna oko doze ili kombinacije lijekova?",
    exitBody: "Liječnik online može provjeriti tvoj recept i objasniti ti kako sigurno uzimati svaki lijek.",
    summary: (medicine) => `Pitanja o receptu ili lijeku: ${medicine}`,
  },
  nav: {
    heading: "Odaberi situaciju u kojoj se nalaziš",
    lead: "Saznaj korake i potrebne dokumente. Ako zapneš, može ti pomoći zdravstveni medijator.",
    planHeading: "Što trebaš učiniti",
    scenarios: {
      family_doctor: {
        title: "Upis kod obiteljskog liječnika",
        desc: "Kako pronaći liječnika blizu doma i koji ti dokumenti trebaju, čak i ako nisi zaposlen ili zaposlena",
        steps: [
          {
            title: "Kamo otići",
            body: "U najbližu ordinaciju obiteljske medicine u svom mjestu. Možeš odabrati bilo kojeg liječnika koji prima nove pacijente.",
          },
          {
            title: "Koje dokumente ponijeti",
            body: "Osobnu iskaznicu (ili privremenu potvrdu), rodne listove djece ako upisuješ i njih te dokaz o osiguranju HZZO-a ili CNAS-a ako ga imaš.",
          },
          {
            title: "Ako nemaš zdravstveno osiguranje",
            body: "Djeca mlađa od 18 godina i trudnice ostvaruju pravo na zdravstvenu zaštitu prema zakonu. Odrasle neosigurane osobe imaju pravo na hitnu skrb i osnovni paket pregleda.",
          },
        ],
      },
      no_insurance_id: {
        title: "Bez osiguranja HZZO-a ili bez osobne iskaznice",
        desc: "Koja prava imaš u hitnim stanjima i što dobivaš besplatno bez osiguranja",
        steps: [
          {
            title: "U hitnoj službi (112 i hitni bolnički prijem)",
            body: "Ako imaš ozbiljan zdravstveni problem, otiđi izravno na hitni bolnički prijem ili nazovi 112. Hitna medicinska pomoć zakonom je besplatna za svakoga.",
          },
          {
            title: "Osnovna zaštita",
            body: "I bez redovitog zdravstvenog osiguranja imaš pravo na skrb u hitnim stanjima, u trudnoći i kod teških zaraznih bolesti poput TBC-a ili hepatitisa.",
          },
          {
            title: "Bez osobnih dokumenata",
            body: "Bolnica te ne smije odbiti u hitnom stanju zato što nemaš osobnu iskaznicu. Osoblje će upisati podatke koje navedeš.",
          },
        ],
      },
      hospital_documents: {
        title: "Dokumenti za pretrage ili bolničko liječenje",
        desc: "Uputnica, zdravstvena iskaznica, potvrda o osiguranju i prijem u bolnicu",
        steps: [
          {
            title: "Uputnica",
            body: "Izdaje je obiteljski liječnik za laboratorijske pretrage, specijalistički pregled ili bolničko liječenje.",
          },
          {
            title: "Pri prijemu u bolnicu",
            body: "Ponesi osobni dokument, uputnicu te ranije nalaze i popis lijekova koje uzimaš.",
          },
          {
            title: "Zdravstvena iskaznica",
            body: "Ako nisi dobio ili dobila zdravstvenu iskaznicu ili si je izgubio ili izgubila, u područnom uredu HZZO-a ili nadležne osiguravateljske kuće možeš zatražiti zamjensku potvrdu.",
          },
        ],
      },
    },
    mediatorTitle: "Imaš poteškoća na šalteru ili su te odbili?",
    mediatorBody: "Zdravstveni medijator može ići s tobom i pomoći ti zaštititi tvoja prava.",
    summary: (scenario) => `Snalaženje u zdravstvenom sustavu: ${scenario}`,
  },
  result: {
    heading: "Tvoj recept jasno objašnjen",
    lead: "Asistent može pogriješiti pri čitanju recepta. Uvijek provjeri s ljekarnikom ili liječnikom prije uzimanja lijekova.",
    pharmacistBannerTitle: "Pokaži ljekarniku prije uzimanja lijekova",
    pharmacistBannerBody:
      "Neke riječi ili doze nisu bile sasvim čitljive na fotografiji. Pokaži telefon ili ispisani list ljekarniku kako bi potvrdio točan način uzimanja.",
    medicinesHeading: "Lijekovi pročitani s recepta",
    medicinesLead: "Raspored u nastavku prikazuje se samo ako je jasno napisan na receptu.",
    scheduleSlots: {
      morning: "Jutro",
      midday: "Podne",
      evening: "Večer",
      bedtime: "Prije spavanja",
    },
    noDoseAria: "Nema navedene doze u ovo vrijeme",
    foodTiming: {
      before_meal: "Prije jela",
      with_meal: "Uz jelo",
      after_meal: "Poslije jela",
    },
    durationLabel: (duration) => `Trajanje: ${duration}`,
    unclearBadge: "Nečitak rukopis — provjeri dozu s ljekarnikom",
    listenMedicine: "Poslušaj",
    stopMedicine: "Zaustavi",
    listenMedicineAria: (medicineName) => `Poslušaj upute za ${medicineName}`,
    assistantHeading: "Objašnjenje asistenta",
    transcriptHeading: "Tekst pročitan s recepta",
    transcriptNote: "Prepisano kako piše na receptu. Tamo gdje piše [unclear], tekst nije bio čitljiv.",
    rulesHeading: "Važno zapamtiti",
    emergency: "Asistent je primijetio znakove koji mogu biti hitni. Ako se sada osjećaš loše, nazovi 112.",
    print: "Ispiši",
    printAria: "Ispiši objašnjenje recepta",
    speech: (summary, rules) => `${summary} Važno zapamtiti: ${rules}`,
  },
};

const rom: AssistantCopy = {
  machine: {
    back: "Palpale",
    intro: "Sikavimos pasho pala pasho",
    stepOf: (step, total = 3) => `Pasho ${step} katar ${total}`,
    progressLabel: "Drom prekal o sikavimos",
    selectedTrailLabel: "Alosarde anglalipnata dji akana",
  },
  tree: {
    heading: "So daravel tut adjes?",
    plainHeading: "Sar shaj azhutinas tut adjes?",
    lead: "Alosar so maladjol tuke maj mishto.",
    bodyMapPrompt: "Manges te sikaves o chacho than pe 3D trupo?",
    bodyMapLink: "Phuter o 3D trupo",
    mediatorTag: "Azhutimos sastipnaske mediatoresa",
    options: {
      learn: {
        title: "Mangav te sikljovav vareso",
        plainTitle: "Mangav lokhe svatura vash jekh nasvalipen",
        subtitle: "Lokhe anglalipnata vash vakcine, tensia e rateski, tatipen thaj antibiotikura",
      },
      risk: {
        title: "Mangav te dikhav muro riziko",
        plainTitle: "Mangav te dikhav te si man riziko vash diabeto vaj nasvalipen e ilesko",
        subtitle: "3 skurte phuchimata thaj so shaj keres maj dur",
      },
      symptoms: {
        title: "Si man jekh sastipnaski problema",
        plainTitle: "Na hatjarav man mishto akana",
        subtitle: "Anglunivar dikhas le znakoja vash dar, pala kodoja ingaras tut ko doktori",
      },
      prescription: {
        title: "Si man jekh receta",
        plainTitle: "Si man jekh receta thaj na haljarav sar te lav i drab",
        subtitle: "Ker poza e recetake vaj rode o anav e drabako",
      },
      navigation: {
        title: "Na dzanav kaj te djav",
        plainTitle: "Na dzanav kaste doktori te djav vaj na-i man buletino",
        subtitle: "Kaj te djas thaj save lila trebun tuke, vi bi asigurimasko",
      },
    },
  },
  learn: {
    heading: "Vash soste manges te sikljoves?",
    lead: "Lokhe shpjegimata, katar avel svako informacia.",
    mythLabel: "Phiravdi xoxamni vorba",
    verdictFalse: "Na-i chacho",
    doctorLabel: "So si chacho",
    sourceLabel: "Katar avel",
    readGuide: "Ginav o sasto sikavimos",
    browseGuides: "Sa le sikavimata",
    topics: {
      vaccines: {
        title: "Vakcine thaj arakhimos e truposko",
        subtitle: "Sode si sigurime le vakcine thaj soske arakhen amen katar phare nasvalimata",
        myth: "I vakcina vash gripa anel gripa vaj kerel o trupo kovlo.",
        doctor:
          "I vakcina vash gripa na-i la dzuvdo viruso so shaj kerel gripa. Voj sikavel o trupo te prindzarel o chacho viruso thaj te arakhel pe.",
        plainDoctor:
          "I vakcina si sar jekh sikavimos vash chiro trupo. Na kerel tut nasvalo, numa sikavel e trupos sar te marl pe le nasvalimasa.",
        source: "Lumjaki organizacia vash o sastipen (WHO)",
      },
      heart: {
        title: "Tensia e rateski thaj o ilo",
        subtitle: "Bari tensia e rateski bi znakongo thaj sar te arakhes o ilo",
        myth: "Te na dukhal man o shero, muri tensia e rateski si lachi.",
        doctor:
          "Bari tensia e rateski butivar na sikavel nijekh znako dji kaj na dukhavel o ilo vaj le rateske droma. Vash kodoja trebul mazerime butivar.",
        plainDoctor:
          "Bari tensia si sar jekh ceava pherdi zurales pajesa: khanchi na dukhal dji kaj na phadjol. Vash kodoja mazerisar la ko doktori vaj ki farmacia, vi kana hatjares tut mishto.",
        source: "Europako kardiologijako khetanipen",
      },
      child_fever: {
        title: "Tatipen ko chavoro",
        subtitle: "Sar te huljaves o tatipen mishto thaj kana te djas ko doktori",
        myth: "Baro tatipen ko chavoro trebul huljavdo sigo alkoholesa vaj shutesa pe morti.",
        doctor:
          "O alkoholo thaj o shuto djan andre prekal i sani morti e chavoreski thaj shaj keren pharo otrovimos. O tatipen huljavel pe drabasa dindi pala o pharipen e chavoresko thaj bute pajesa.",
        plainDoctor:
          "Shoha ma thov spirto vaj shuto pe morti e chavoreski, soske otrovinel les prekal i morti. De les paj vaj chajo thaj i drab vash tatipen so phendjas o doktori.",
        source: "Lumjaki organizacia vash o sastipen (WHO)",
      },
      antibiotics: {
        title: "Shil, gripa thaj antibiotikura",
        subtitle: "Soske le antibiotikura na sastjaren virusura thaj so znachinel rezistenca",
        myth: "Svako zurale shil nakhel maj sigo te les antibiotiko katar o angluno dives.",
        doctor:
          "O shil thaj i gripa aven katar virusura, a le antibiotikura mudaren numa le bakterije. Te les len bi trubujimasko, ruminen o por thaj keren rezistenca.",
        plainDoctor:
          "O antibiotiko mudarel numa bakterije, na le virusura so anen o shil. Te les les vash o shil, dukhaves chiro ogi thaj na sastjos maj sigo.",
        source: "Lumjaki organizacia vash o sastipen (WHO)",
      },
    },
    summary: (topic) => `Tema alosardi: ${topic}`,
  },
  risk: {
    heading: "Sigo dikhimos e rizikosko",
    lead: "De anglalipe Va vaj Na pe 3 skurte phuchimata. O rezultato na-i doktorikani diagnoza.",
    quickTitle: "Khanchi katar i lista na maladjol tuke?",
    quickBody: "Si tut telal 45 bersha, khonik and-i familija na-i les diabeto vaj bari tensia, thaj na-i tut butivar kadala simptome.",
    quickButton: "Dikh tikno riziko",
    questions: {
      q1: {
        title: "Bersha thaj familija",
        text: "Si tut opral 45 bersha, vaj si varekaste and-i pashutni familija (dada, phrala, phenja) diabeto vaj bari tensia e rateski?",
        plainText: "Si tut opral 45 bersha, vaj sas chire daden diabeto vaj bari tensia?",
      },
      q2: {
        title: "Sar hatjares tut svako dives",
        text: "Hatjares tut butivar khino bi soske, si tut bari trush vaj dukhal tut o shero butivar?",
        plainText: "San but khino, pjes but paj vaj dukhal tut o shero butivar?",
      },
      q3: {
        title: "Trajosko stilo",
        text: "Pjes cigare svako dives, vaj xas butivar londo xabem, keralo xabem thaj guglimata?",
        plainText: "Pjes thuv svako dives, vaj xas butivar londo thaj guglo xabem?",
      },
    },
    yes: "Va",
    no: "Na",
    submit: "Dikh o rezultato",
    resultHeading: "Chiro rezultato",
    levelLabel: "Nivelo e rizikosko",
    levels: { low: "Tikno riziko", moderate: "Mashkarutno riziko", high: "Baro riziko" },
    messages: {
      low: "Akana chiro riziko vash nasvalipen e ilesko thaj diabeto si tikno. Pij paj, phir svako dives thaj ker kontrola jekhvar and-o bersh.",
      moderate:
        "Si tut nesave faktorura so trebun dikhle. Mang katar o familijako doktori te mazerinel tuke i tensia thaj o zahari and-o rat.",
      high: "Si tut maj but faktorura khetane. Vorbin jekhe doktoresa vash anglune analize e rateske.",
    },
    nextHeading: "So shaj keres akana",
    nextSteps: [
      "Mazerisar chiri tensia e rateski ki farmacia vaj ko familijako doktori.",
      "Thov maj xantsi lon and-o xabem thaj pij barem 6 taxtaja paj ko dives.",
      "Ker bi lovengi online programacia te vorbis vash o rezultato jekhe doktoresa.",
    ],
    summary: (level, count) => `Dikhimos e rizikosko: ${level} (${count}/3 faktorura)`,
  },
  gate: {
    heading: "Si tut akana varesavo katar kadala znakoja vash dar?",
    plainHeading: "Si tut akana varesavo but pharo znako?",
    signs: [
      "Bari dukh and-o kolin vaj pharipen pe kolin",
      "But phari phurdinimos",
      "Sigo pamortimos vaj kovlipen pe jekh rig e mujeski vaj e truposki",
      "Sigo pharipen te vorbis",
      "Baro rat so thabdel",
    ],
    plainSigns: [
      "Dukhal tut zurales and-o kolin, sar baro pharipen",
      "Phurdes but phares",
      "Chiro muj, jekh vast vaj jekh punro kerdilo kovlo sigo",
      "Nashti maj vorbis uzo",
      "Thabdel tuke but rat",
    ],
    callNow: "Akhar 112 akana",
    yes: "Va, si man barem jekh znako",
    yesSeeTips: "Va, so te phenes ko 112",
    no: "Na, mure simptome si maj lokhe",
    noNoneOfThese: "Na, nijekh katar kadala",
    note: "Te san and-i dar, akhar tu ko 112. I aplikacia na akharel vash tute.",
  },
  symptoms: {
    heading: "So dukhavel tut maj but?",
    lead: "Alosar i kategorija, pala kodoja shaj vorbis jekhe doktoresa online.",
    bodyMapHint: "Si tut dukh pe jekh than? Alosar o chacho than pe 3D trupo.",
    bodyMapCta: "Dikh pe 3D trupo",
    categories: {
      fever: {
        title: "Tatipen vaj shil",
        desc: "Baro tatipen, izdraimos, dukh and-e muskulura, khinipen",
      },
      headache: {
        title: "Dukh and-o shero vaj and-o korr",
        desc: "Pharipen ko shero, zuralo korr, khine jakha",
      },
      stomach: {
        title: "Dukh and-o por vaj chadikimos",
        desc: "Dukh and-o ogi, lokhe krampura, phabarimos bi bute chadikimasko",
      },
      cough: {
        title: "Khas vaj dukh and-o korr",
        desc: "Phabardo korr, phandado nakh, nevo khas",
      },
    },
    selectedLabel: "Alosardjan",
    body: "Jekh doktori shaj dikhel tut sigo. Phenel tuke savi drab te les thaj dikhel te na avel vareso pharo.",
    plainBody: "Na trebul te trais dukhasa khere vaj te les xapura bi dzanimasko. Shaj vorbis bi lovengo jekhe doktoresa pe telefono.",
    homeCareHeading: "Sigurime arakhimos khere",
    homeCareByCategory: {
      fever: [
        "Xodinisar ande jekh puterdi soba thaj pij butivar paj vaj tato chajo.",
        "Mazerisar o tatipen termometrosa thaj dikh sar parudjol.",
        "Ma le antibiotikura bi recetako katar o doktori.",
      ],
      headache: [
        "Astav o telefono ande jekh chiti soba thaj pij 1–2 taxtaja paj.",
        "Thov shudro dikhlo pe chikat thaj xodinisar o korr.",
        "Ma pij but kafeava thaj sovel dosta.",
      ],
      stomach: [
        "Pij paj xantsi po xantsi vaj chajo bi zaharesko.",
        "Xa tikno thaj lokho xabem sar kirado rizo vaj uzi zumi.",
        "Ma xa keralo xabem, ma pij alkoholo thaj ma le xapura pe chucho ogi.",
      ],
      cough: [
        "Pij tato paj vaj chajo thaj phuter i fereastra te avel nevo bavlal.",
        "Sov le sheresa xantsi maj opre pe perina te khases ratjate.",
        "Durjar tut katar o thuv e cigarengo.",
      ],
    },
    whenToCallHeading: "Kana te akhares e doktores vaj ko 112",
    whenToCallTips: [
      "O tatipen nakhel opral 38,5 °C maj but de 3 divesa vaj si ko tikno chavoro.",
      "I dukh barjol sigo, o por kerdjol zuralo vaj nashti aches o paj.",
      "Avel phari phurdinimos, pharipen and-o kolin vaj sigo kovlipen: akhar sigo ko 112.",
    ],
    safetyNet: "Te hatjares tut but maj nasul vaj avel jekh znako vash dar, akhar ko 112.",
    summary: (category) => `Lokhe simptome: ${category}`,
    emergencyHeading: "Trebul tuke sigardiari doktorikano azhutimos akana",
    emergencyBody:
      "Shaj aven znakoja katar jekh bari sigardiari situacia sar dab e ilesko, dab and-i godji vaj baro rat. Ma azhuker thaj ma rode svatura online.",
    callNow: "Akhar 112 akana",
    callTipsTitle: "Kana vorbis ko 112",
    callTips: [
      "Phen i chachi adresa kaj san.",
      "Phen save simptome si le manushes thaj te si dzuvdo godjasa.",
      "Ach pe telefono thaj ker sar phenen tuke.",
    ],
    emergencyExitTitle: "Trebul tuke azhutimos dji kaj avel i salvarea?",
    emergencyExitBody:
      "Anglunivar akhar ko 112. Te shaj, jekh doktori online shaj ingarel tut pe telefono dji kaj avel o azhutimos.",
  },
  rx: {
    heading: "Sar manges te dikhes i receta vaj i drab?",
    lead: "Ker poza e recetake vaj rode o anav e drabako.",
    photoTitle: "Thov poza katar i receta",
    photoDesc: "Le telefoneske kamerasa vaj katar i galerija",
    searchTitle: "Ramov o anav e drabako",
    searchDesc: "Sikljov le anglune regule te les la sigurime",
    searchLabel: "Anav e drabako",
    placeholder: "Misal: Augmentin, Metformin",
    suggestions: "Drabura",
    submit: "Dikh i drab",
    resultHeading: (medicine) => `Regule vash arakhimos vash ${medicine}`,
    fallbackMedicine: "chiri drab",
    rulesHeading: "3 regule te les i drab sigurime",
    rules: [
      "Le i drab ko sasto chaso svako dives. Kadja achel pe jekh nivelo and-o rat.",
      "Ma pij alkoholo thaj dikh te lel pe i drab angla vaj pala o xabem.",
      "Ma astav i drab maj anglal, maj but le antibiotikura, kaste na avel palpale o nasvalipen.",
    ],
    plainRules: [
      "Le le xapura ko sasto chaso svako dives, jekhe pherde taxtajesa paj.",
      "Ma pij alkoholo kana les drab thaj ma le len pe chucho ogi te na ramol kadja pe kutija.",
      "Ma astav i drab kana hatjares tut maj mishto. Ker sa le divesa sar ramodjas o doktori.",
    ],
    exitTitle: "Na dzanes sode drab te les vaj save drabura djan khetane?",
    exitBody: "Jekh doktori online shaj dikhel chiri receta thaj shpjeginel tuke sar te les svako drab bi rizikosko.",
    summary: (medicine) => `Phuchimata vash receta vaj drab: ${medicine}`,
  },
  nav: {
    heading: "Alosar i situacia kaj san",
    lead: "Dikh le pashura thaj le lila so trebun tuke. Te astarghos, azhutinel tut jekh sastipnasko mediatori.",
    planHeading: "So trebul te keres",
    scenarios: {
      family_doctor: {
        title: "Ramovimos ko familijako doktori",
        desc: "Sar arakhes jekh doktori pasha o kher thaj save lila trebun tuke, vi te na keres buchi",
        steps: [
          {
            title: "Kaj te djas",
            body: "Ki maj pashutni ordinacia e familijake doktoreski ande chiro gav vaj foro. Shaj alosares svako doktori so si les puterde thana.",
          },
          {
            title: "Save lila te ingares",
            body: "O buletino, le bijandimaske lila e chavorenge te ramos vi len, thaj o lil vash asigurimos te si tut.",
          },
          {
            title: "Te na san asigurime",
            body: "Le chavore telal 18 bersha thaj le khamne dzuvlja si asigurime bi lovengo pala o zakono. Vi bi asigurimasko si tut chachipen pe bazutni kontrola thaj sigardiari azhutimos.",
          },
        ],
      },
      no_insurance_id: {
        title: "Bi asigurimasko vaj bi buletinesko",
        desc: "Save chachimata si tut ko sigardiari 112 thaj so les bi lovengo bi asigurimasko",
        steps: [
          {
            title: "Ko sigardiari (112 thaj UPU)",
            body: "Te si tut bari sastipnaski problema, dja sigo ki sigardiari rig ki bolnitsa vaj akhar 112. O sigardiari azhutimos si bi lovengo pala o zakono vash sako manush.",
          },
          {
            title: "Bazutno paketo",
            body: "Vi bi asigurimasko CNAS vaj HZZO si tut chachipen pe bi lovengo azhutimos vash phare nasvalimata (TBC, hepatita), khamnipen thaj sigardiari situacie.",
          },
          {
            title: "Bi buletinesko vaj lilengo",
            body: "I bolnitsa nashti phenel tuke na ko sigardiari soske na-i tut buletino. Le bucarne ka ramon le date so phenes tu.",
          },
        ],
      },
      hospital_documents: {
        title: "Lila vash analize vaj bolnitsa",
        desc: "Bichalimos katar o doktori, sastipnaski karta thaj drom ki bolnitsa",
        steps: [
          {
            title: "O lil bichalimasko",
            body: "Les les katar o familijako doktori vash analize vaj specialistikani kontrola.",
          },
          {
            title: "Kana djas ki bolnitsa",
            body: "Ingar tusa o buletino, o lil katar o familijako doktori thaj le purane analize vaj recete.",
          },
          {
            title: "I sastipnaski karta",
            body: "Te xasardjan vaj na ljan i sastipnaski karta, shaj manges jekh lil so zameninel la katar o ofiso vash sastipnasko asigurimos.",
          },
        ],
      },
    },
    mediatorTitle: "Si tut pharipen ko ghisevo vaj phende tuke na?",
    mediatorBody: "Jekh sastipnasko mediatori shaj djal tusa thaj azhutinel tut te arakhes chire chachimata.",
    summary: (scenario) => `Drom and-o sastipnasko sistemo: ${scenario}`,
  },
  result: {
    heading: "Chiri receta ashkardi chaches",
    lead: "O azhutitori shaj dosharel ko ginavimos. Dikh svako data le farmacistosa vaj le doktoresa angla te les i drab.",
    pharmacistBannerTitle: "Sikav le farmacistoske angla te les i drab",
    pharmacistBannerBody:
      "Nesave vorbe vaj doze na dikhljile uzo and-i poza. Sikav o telefono vaj o printime lil le farmacistoske te phenel tuke chaches sar te les len.",
    medicinesHeading: "Drabura ginade katar i receta",
    medicinesLead: "Le chasura telal dikhljon numa kana si ramome uzo pe receta.",
    scheduleSlots: {
      morning: "Teharin",
      midday: "Mashkar divese",
      evening: "Biaveli",
      bedtime: "Angla sovimos",
    },
    noDoseAria: "Na-i ramomi doza ko kadava chaso",
    foodTiming: {
      before_meal: "Angla xabem",
      with_meal: "Le xabemasa",
      after_meal: "Pala xabem",
    },
    durationLabel: (duration) => `Vrama: ${duration}`,
    unclearBadge: "Na uzo ramovimos — dikh i doza le farmacistosa",
    listenMedicine: "Ashun",
    stopMedicine: "Astav",
    listenMedicineAria: (medicineName) => `Ashun sar te les ${medicineName}`,
    assistantHeading: "O shpjegimos e azhutitoresko",
    transcriptHeading: "O teksto ginado katar i receta",
    transcriptNote: "Kopijime sar ramol pe receta. Kaj ramol [unclear], o teksto nashti ginadilo.",
    rulesHeading: "Te na bistres",
    emergency: "O azhutitori dikhljas znakoja so shaj aven sigardiari. Te hatjares tut nasul akana, akhar ko 112.",
    print: "Printisar",
    printAria: "Printisar o shpjegimos e recetako",
    speech: (summary, rules) => `${summary} Te na bistres: ${rules}`,
  },
};

export const ASSISTANT_COPY: Record<Lang, AssistantCopy> = {
ru: {
  machine: {
"selectedTrailLabel": "Выбранные ответы",

    back: "Назад",
    intro: "Руководство из 3 шагов",
    stepOf: (step, total = 3) => `Шаг ${step} из ${total}`,
    progressLabel: "Путеводитель по прогрессу",
  },
  tree: {
"bodyMapPrompt": "Хотите указать точное место боли на 3D-модели?",
"bodyMapLink": "Открыть 3D-карту тела",
"mediatorTag": "Поддержка медицинского посредника",

    heading: "Что тебя беспокоит сегодня?",
    plainHeading: "Чем мы можем помочь вам сегодня?",
    lead: "Выбирайте то, что подходит вам лучше всего.",
    options: {
      learn: {
        title: "Я хочу узнать кое-что",
        plainTitle: "Я хочу простой совет о болезни",
        subtitle: "Простые ответы о вакцинах, кровяном давлении, лихорадке и антибиотиках",
      },
      risk: {
        title: "Я хочу проверить свой риск",
        plainTitle: "Я хочу узнать, подвержен ли я риску диабета или сердечно-сосудистых заболеваний",
        subtitle: "3 коротких вопроса и ваши следующие шаги",
      },
      symptoms: {
        title: "У меня проблемы со здоровьем",
        plainTitle: "Я сейчас нехорошо себя чувствую",
        subtitle: "Сначала мы проверяем наличие настораживающих признаков, а затем направляем вас к врачу.",
      },
      prescription: {
        title: "У меня есть рецепт",
        plainTitle: "У меня есть рецепт, и я не понимаю, как принимать таблетки.",
        subtitle: "Сфотографируйте рецепт или найдите лекарство.",
      },
      navigation: {
        title: "Я не знаю, куда идти",
        plainTitle: "Я не знаю, к какому врачу обратиться, или у меня нет удостоверения личности.",
        subtitle: "Куда идти и какие документы нужны, даже без страховки",
      },
    },
  },
  learn: {
    heading: "О чем бы вы хотели узнать?",
    lead: "Объяснения доступным языком, с указанием источника каждой информации.",
    mythLabel: "Распространенный миф",
    verdictFalse: "Ложь",
    doctorLabel: "Что правда",
    sourceLabel: "Источник",
    readGuide: "Открыть руководство",
    browseGuides: "Все руководства",
    topics: {
      vaccines: {
        title: "Вакцины и иммунитет",
        subtitle: "Насколько безопасны вакцины и почему они защищают нас от серьезных заболеваний",
        myth: "Прививка от гриппа вызывает у вас грипп или ослабляет ваше тело.",
        doctor:
          "Введенная вакцина против гриппа содержит инактивированный вирус или только его фрагменты, которые не могут вызвать грипп. Он тренирует иммунную систему распознавать настоящий вирус.",
        plainDoctor:
          "Вакцина — это тренировочная тренировка для вашего организма. Это не делает вас больным; он учит ваше тело, как защитить себя, если оно столкнется с болезнью.",
        source: "Всемирная организация здравоохранения и Министерство здравоохранения Румынии",
      },
      heart: {
        title: "Кровяное давление и сердце",
        subtitle: "«Тихое» высокое кровяное давление и профилактика сердечных приступов",
        myth: "Если у меня нет головной боли, значит, давление у меня в порядке.",
        doctor:
          "Высокое кровяное давление часто не дает никаких признаков, пока не нанесет вред сердцу или кровеносным сосудам. Вот почему его необходимо регулярно измерять.",
        plainDoctor:
          "Высокое давление похоже на перекачанный шланг: ничего не болит, пока не лопнет. Именно поэтому его необходимо часто измерять, даже если вы чувствуете себя прекрасно.",
        source: "Румынское общество кардиологов",
      },
      child_fever: {
        title: "Лихорадка у детей",
        subtitle: "Как безопасно сбить температуру и когда обратиться к врачу",
        myth: "Высокая температура у ребенка должна быть немедленно сбита протиранием спиртом или уксусом.",
        doctor:
          "Алкоголь и уксус впитываются через тонкую кожу ребенка и могут вызвать серьезное отравление. Лихорадку лечат жаропонижающими препаратами в дозах, соответствующих весу ребенка, и обильным питьем.",
        plainDoctor:
          "Никогда не наносите хирургический спирт или уксус на кожу ребенка: он отравляется через кожу. Дайте воду или чай и сироп от жара, который рекомендует врач.",
        source: "Румынское общество педиатров",
      },
      antibiotics: {
        title: "Простуда, грипп и антибиотики",
        subtitle: "Почему антибиотики не лечат вирусные инфекции и что означает устойчивость",
        myth: "Любая сильная простуда проходит быстрее, если с первого дня принимать антибиотик.",
        doctor:
          "Простуду и грипп вызывают вирусы, а антибиотики действуют только на бактерии. Принятые без необходимости, они нарушают кишечную флору и способствуют развитию устойчивости к антибиотикам.",
        plainDoctor:
          "Антибиотики убивают только бактерии, а не вирусы, вызывающие простуду. Если вы примете их от простуды, вы расстроите желудок и быстрее не поправитесь.",
        source: "Национальный институт инфекционных болезней имени профессора доктора Матей Балша",
      },
    },
    summary: (topic) => `Интересующая тема: ${topic}`,
  },
  risk: {
    heading: "Быстрая проверка рисков",
    lead: "Ответьте «Да» или «Нет» на 3 коротких вопроса. Результат не является диагнозом.",
    quickTitle: "Ничего из этого к вам не относится?",
    quickBody: "Вам меньше 45 лет, никто в вашей семье не страдает диабетом или повышенным кровяным давлением, и эти симптомы наблюдаются у вас редко.",
    quickButton: "Показать низкий риск",
    questions: {
      q1: {
        title: "Возраст и семья",
        text: "Вам больше 45 лет, или кто-либо из ваших близких родственников (родители, братья, сестры) страдает диабетом или повышенным кровяным давлением?",
        plainText: "Вам больше 45 лет, или у ваших родителей был диабет или высокое кровяное давление?",
      },
      q2: {
        title: "Как вы себя чувствуете изо дня в день",
        text: "Часто ли вы чувствуете усталость без причины, сильную жажду или частые головные боли?",
        plainText: "Вы чувствуете сильную усталость, пьете много воды сами того не желая или часто испытываете головные боли?",
      },
      q3: {
        title: "Образ жизни",
        text: "Вы курите каждый день или часто едите соленую, жареную пищу и магазинные сладости?",
        plainText: "Вы курите каждый день или часто едите жареное, соленые колбасы и сладости?",
      },
    },
    yes: "Да",
    no: "Нет",
    submit: "Посмотреть результат",
    resultHeading: "Ваш результат",
    levelLabel: "Предполагаемый уровень риска",
    levels: { low: "Низкий риск", moderate: "Умеренный риск", high: "Повышенный риск" },
    messages: {
      low: "В настоящее время риск сердечно-сосудистых заболеваний и диабета у вас низкий. Продолжайте пить воду, гуляйте каждый день и проходите осмотр раз в год.",
      moderate:
        "У вас есть некоторые факторы риска, на которые стоит обратить внимание. Попросите своего семейного врача проверить ваше кровяное давление и уровень сахара в крови. Это позволяет выявить проблемы на ранней стадии.",
      high: "У вас есть несколько факторов риска вместе. Поговорите с врачом о некоторых основных тестах.",
    },
    nextHeading: "Что вы можете сделать сейчас",
    nextSteps: [
      "Измерьте артериальное давление в аптеке или у семейного врача.",
      "Используйте меньше соли в пище и пейте не менее 6 стаканов воды в день.",
      "Запишитесь на бесплатный онлайн-прием, чтобы обсудить результат с врачом.",
    ],
    summary: (level, count) => `Проверка рисков: ${level} (${count}/3 factors confirmed)`,
  },
  gate: {
"callNow": "Позвоните 112 сейчас",
"yesSeeTips": "Да, что сказать в 112",
"noNoneOfThese": "Нет, ничего из этого",

    heading: "Есть ли у вас сейчас какие-либо из этих предупреждающих знаков?",
    plainHeading: "Есть ли у вас сейчас какие-то очень серьезные признаки?",
    signs: [
      "Сильная боль в груди или чувство давления",
      "Сильное затруднение дыхания",
      "Внезапное онемение или слабость на одной стороне лица или тела.",
      "Внезапное затруднение речи",
      "Сильное кровотечение",
    ],
    plainSigns: [
      "Грудь сильно болит, как будто на нее давит тяжелая тяжесть.",
      "Вам очень трудно дышать",
      "Ваше лицо, рука или нога внезапно онемели или ослабли.",
      "Ты больше не можешь ясно говорить",
      "У тебя сильное кровотечение",
    ],
    yes: "Да, у меня есть хотя бы один",
    no: "Нет, у меня симптомы мягче",
    note: "Если вам угрожает опасность, позвоните по номеру 112 самостоятельно. Приложение не звонит вам.",
  },
  symptoms: {
"bodyMapHint": "Болит в определенном месте? Укажите его на 3D-модели.",
"bodyMapCta": "Показать на 3D-модели",
"homeCareHeading": "Безопасная помощь дома",
"homeCareByCategory": {"fever":["Отдыхайте в проветриваемой комнате и часто пейте воду или теплый травяной чай небольшими глотками.","Измеряйте температуру термометром и записывайте изменения.","Не начинайте оставшиеся антибиотики без назначения врача."],"headache":["Отдохните от экранов в тихой комнате и выпейте 1–2 стакана воды.","Приложите прохладную влажную ткань ко лбу или мягко расслабьте плечи.","Избегайте пропуска еды, избытка кофеина и позднего отхода ко сну."],"stomach":["Пейте воду или простой ромашковый либо мятный чай маленькими глотками.","Ешьте небольшие легкие порции, например рис, прозрачный бульон или тост.","Избегайте жареного, алкоголя и обезболивающих натощак."],"cough":["Смягчайте горло теплыми напитками и проветривайте комнату.","При ночном кашле слегка приподнимите голову дополнительной подушкой.","Избегайте табачного дыма и сухого воздуха."]},
"whenToCallHeading": "Когда обращаться к врачу или звонить 112",
"whenToCallTips": ["Температура выше 38,5 °C держится более 3 дней или болен маленький ребенок.","Боль внезапно усилилась, живот стал твердым или не удается удержать жидкость.","При одышке, давлении в груди, спутанности или внезапной слабости сразу звоните 112."],

    heading: "Что вас беспокоит больше всего?",
    lead: "Выберите категорию, после чего вы сможете поговорить с врачом онлайн.",
    categories: {
      fever: {
        title: "Лихорадка или простуда",
        desc: "Высокая температура, озноб, боли в мышцах, ощущение утомления.",
      },
      headache: {
        title: "Головная боль или боль в шее",
        desc: "Давление в висках, напряженная шея, усталые глаза.",
      },
      stomach: {
        title: "Боль в животе или тошнота",
        desc: "Дискомфорт в животе, легкие спазмы, изжога или тошнота без повторной рвоты.",
      },
      cough: {
        title: "Кашель или боль в горле",
        desc: "Першение в горле, хриплый голос, заложенность носа, недавний кашель.",
      },
    },
    selectedLabel: "Вы выбрали",
    body: "Врач может принять вас быстро. Они расскажут вам, какое лечение следует принять, и проверят, нет ли в этом ничего серьезного.",
    plainBody: "Не обязательно мучиться дома или принимать таблетки наугад. Вы можете бесплатно поговорить с врачом по телефону.",
    safetyNet: "Если вы чувствуете себя намного хуже или появились какие-либо предупреждающие знаки, позвоните 112.",
    summary: (category) => `Легкие симптомы: ${category}`,
    emergencyHeading: "Вам нужна медицинская помощь сейчас",
    emergencyBody:
      "Они могут быть признаками серьезной чрезвычайной ситуации, такой как сердечный приступ, инсульт или кровотечение. Не ждите и не ищите советов в Интернете.",
    callNow: "Позвоните 112 сейчас",
    callTipsTitle: "Когда вы разговариваете с оператором 112",
    callTips: [
      "Укажите точный адрес, где вы находитесь.",
      "Скажите, какие симптомы есть у человека и находится ли он в сознании.",
      "Оставайтесь на линии и следуйте инструкциям, которые вам дают.",
    ],
    emergencyExitTitle: "Нужна поддержка до приезда скорой помощи?",
    emergencyExitBody:
      "Сначала позвоните по номеру 112. Если позволяет ситуация, онлайн-врач может сопровождать вас по телефону до прибытия помощи.",
  },
  rx: {
    heading: "Как бы вы хотели проверить свой рецепт?",
    lead: "Сфотографируйте рецепт или найдите лекарство по названию.",
    photoTitle: "Загрузите фотографию рецепта.",
    photoDesc: "С помощью камеры телефона или из галереи.",
    searchTitle: "Введите название лекарства",
    searchDesc: "Основные правила безопасного приема",
    searchLabel: "Название лекарства",
    placeholder: "Например: Аугментин, Метформин.",
    suggestions: "Рекомендации по лечению",
    submit: "Проверьте лекарство",
    resultHeading: (medicine) => `Правила безопасности для ${medicine}`,
    fallbackMedicine: "ваше лечение",
    rulesHeading: "3 правила безопасного приёма лекарств",
    rules: [
      "Принимайте его в одно и то же время каждый день. Это поддерживает постоянный уровень в крови.",
      "Избегайте употребления алкоголя и проверьте, принимается ли лекарство до или после еды.",
      "Не прекращайте курс раньше времени, особенно антибиотиков, чтобы болезнь не вернулась.",
    ],
    plainRules: [
      "Принимайте таблетки каждый день в одно и то же время, запивая полным стаканом воды.",
      "Не употребляйте алкоголь во время приема таблеток и не принимайте их натощак, если на упаковке явно не указано иное.",
      "Не останавливайтесь, когда почувствуете себя лучше. Закончите все дни, записанные врачом.",
    ],
    exitTitle: "Не уверены в дозах или о том, какие лекарства следует сочетать?",
    exitBody: "Онлайн-врач может проверить ваш рецепт и объяснить, как безопасно принимать каждое лекарство.",
    summary: (medicine) => `Вопросы о рецепте или лекарстве: ${medicine}`,
  },
  nav: {
    heading: "Выберите ситуацию, в которой вы находитесь",
    lead: "Ознакомьтесь с этапами и необходимыми документами. Если вы застряли, посредник может помочь.",
    planHeading: "Что делать?",
    scenarios: {
      family_doctor: {
        title: "Запись к семейному врачу",
        desc: "Как найти врача рядом с домом и какие бумаги нужны, даже если вы не работаете",
        steps: [
          {
            title: "Куда пойти",
            body: "В ближайшую клинику семейной медицины в вашем городе или селе. Вы можете выбрать любого семейного врача, у которого еще есть свободные места.",
          },
          {
            title: "Что взять с собой",
            body: "Ваше удостоверение личности (или временное удостоверение личности), свидетельства о рождении ваших детей, если вы их тоже регистрируете, и подтверждение страховки, если оно у вас есть (пенсионное удостоверение или справка с места работы).",
          },
          {
            title: "Если вы не застрахованы",
            body: "Дети до 18 лет и беременные женщины по закону застрахованы бесплатно. Будучи незастрахованным взрослым, вы имеете право на бесплатный базовый пакет услуг семейного врача.",
          },
        ],
      },
      no_insurance_id: {
        title: "Нет медицинской страховки CNAS или удостоверения личности.",
        desc: "Ваши права в чрезвычайной ситуации и что вы получаете бесплатно без страховки",
        steps: [
          {
            title: "В чрезвычайной ситуации (ВПС)",
            body: "Если у вас серьезная проблема, обратитесь прямо в отделение неотложной помощи больницы (UPU). По закону неотложная помощь бесплатна для всех.",
          },
          {
            title: "Базовый пакет",
            body: "Даже без страховки CNAS (национальное медицинское страхование Румынии) вы получаете бесплатную помощь при серьезных инфекционных заболеваниях (туберкулез, гепатит), во время беременности и в неотложных ситуациях.",
          },
          {
            title: "Без документов, удостоверяющих личность",
            body: "Больница не может вам отказать, потому что у вас нет удостоверения личности. Сотрудники запишут данные, которые вы им предоставите.",
          },
        ],
      },
      hospital_documents: {
        title: "Документы на анализы или пребывание в больнице",
        desc: "Направительное письмо, медицинская карта, подтверждение страховки и госпитализация.",
        steps: [
          {
            title: "Рекомендательное письмо",
            body: "Его выдает ваш семейный врач. Он действителен в течение 30 дней (90 дней для хронических заболеваний).",
          },
          {
            title: "Когда тебя примут",
            body: "Возьмите с собой документ, удостоверяющий личность, направление и файл с результатами предыдущих анализов или рецептами.",
          },
          {
            title: "Карта здоровья",
            body: "Если вы так и не получили свою национальную медицинскую карту или потеряли ее, вы можете попросить в окружном офисе медицинского страхования (CJAS) новый сертификат, действительный в течение 3 месяцев.",
          },
        ],
      },
    },
    mediatorTitle: "Возникли проблемы за столом или вам отказали?",
    mediatorBody: "Медиатор по вопросам здоровья может пойти с вами и помочь вам отстоять свои права.",
    summary: (scenario) => `Ищу свой путь в системе здравоохранения: ${scenario}`,
  },
  result: {
"pharmacistBannerTitle": "Покажите фармацевту перед приёмом лекарств",
"pharmacistBannerBody": "Ассистент может ошибиться. Уточните название, дозу и время приёма у фармацевта или врача.",
"medicinesHeading": "Лекарства, прочитанные из рецепта",
"medicinesLead": "Проверьте каждое лекарство по оригиналу рецепта.",
"scheduleSlots": {"morning":"Утро","midday":"День","evening":"Вечер","bedtime":"Перед сном"},
"noDoseAria": "Доза не указана",
"foodTiming": {"before_meal":"До еды","with_meal":"Во время еды","after_meal":"После еды"},
"durationLabel": (duration) => `Длительность: ${duration}`,
"unclearBadge": "Нужно уточнить",
"listenMedicine": "Слушать",
"stopMedicine": "Стоп",
"listenMedicineAria": (medicineName) => `Прослушать: ${medicineName}`,

    heading: "Ваш рецепт простыми словами",
    lead: "Ассистент может неправильно прочитать рецепт. Всегда консультируйтесь со своим фармацевтом или врачом, прежде чем принимать лекарства.",
    assistantHeading: "Объяснение ассистента",
    transcriptHeading: "Текст, прочитанный из рецепта",
    transcriptNote: "Скопировал как написано. Там, где написано [неразборчиво], текст прочитать невозможно.",
    rulesHeading: "Имейте в виду",
    emergency: "Ассистент заметил признаки, которые могут быть неотложными. Если вы чувствуете себя плохо сейчас, позвоните 112.",
    print: "Распечатать",
    printAria: "Распечатать пояснение к рецепту",
    speech: (summary, rules) => `${summary} Имейте в виду: ${rules}`,
  },
},
 ro, en, sq, it, hr, rom };

export function getAssistantCopy(lang: string): AssistantCopy {
  return ASSISTANT_COPY[lang as Lang] ?? ASSISTANT_COPY[DEFAULT_LANG];
}

export function useAssistantCopy(): AssistantCopy {
  const { lang } = useLanguage();
  return getAssistantCopy(lang);
}
