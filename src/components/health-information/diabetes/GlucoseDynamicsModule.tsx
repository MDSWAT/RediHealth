"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { AlertCircleIcon } from "@/components/ui/icons";
import { DURATION, EASE_OUT } from "@/lib/motion/tokens";
import { LanguageContext } from "@/lib/i18n/language-context";
import { ROW_CLASS, ROW_LIST_CLASS, radioDotClass } from "./choice-styles";
import type { Lang } from "@/lib/i18n/translations";

export interface GlucoseDynamicsModuleProps {
  lang?: Lang;
}

export type ScenarioId = "fasting" | "high_carb" | "balanced_meal" | "exercise";

interface ScenarioLocalization {
  title: string;
  badge: string;
  description: string;
  clinicalNote: string;
}

interface GlucoseScenario {
  id: ScenarioId;
  /** Readings at 0, 1, 2, 3 and 4 h. The peak shown anywhere on screen is derived from these. */
  points: number[];
  /** Curve colour (a design token, so the chart follows the theme). */
  strokeColor: string;
}

const SCENARIOS_BASE: GlucoseScenario[] = [
  {
    id: "fasting",
    points: [85, 84, 86, 85, 84],
    strokeColor: "var(--color-sapphire)",
  },
  {
    id: "high_carb",
    points: [90, 195, 175, 130, 95],
    strokeColor: "var(--color-amber-care)",
  },
  {
    id: "balanced_meal",
    points: [88, 128, 122, 105, 90],
    strokeColor: "var(--color-live-sage)",
  },
  {
    id: "exercise",
    points: [90, 115, 102, 88, 85],
    strokeColor: "var(--color-sapphire-light)",
  },
];

const SCENARIO_TRANSLATIONS: Record<Lang, Record<ScenarioId, ScenarioLocalization>> = {
  ro: {
    fasting: {
      title: "Dimineața, pe nemâncate",
      badge: "Stabil",
      description:
        "Zahărul din sânge stă între 80 și 90 mg/dL. Ficatul dă încet zahăr în sânge, iar insulina de fond îl ține în echilibru.",
      clinicalNote:
        "Ficatul dă zahăr în sânge ca să hrănească creierul și celulele cât te odihnești.",
    },
    high_carb: {
      title: "Masă cu mult zahăr și făină albă",
      badge: "Urcă brusc, scade brusc",
      description:
        "Dulciurile, sucurile și pâinea albă urcă zahărul din sânge foarte repede. Apoi scade la fel de repede și te simți obosit și flămând.",
      clinicalNote:
        "Pancreasul trebuie să dea repede multă insulină, ca zahărul să revină la normal.",
    },
    balanced_meal: {
      title: "Masă cu legume, proteine și fibre",
      badge: "Urcă încet, energia ține mai mult",
      description:
        "Legumele, carnea slabă sau ouăle și cerealele integrale fac zahărul să intre mai încet în sânge. Valorile rămân bune.",
      clinicalNote:
        "Fibrele fac în intestin un fel de gel, care încetinește trecerea zahărului în sânge.",
    },
    exercise: {
      title: "Plimbare după masă",
      badge: "Mușchii folosesc zahărul",
      description:
        "O plimbare grăbită de 20–30 de minute după masă face mușchii să ia zahăr direct din sânge. Vârful scade mult.",
      clinicalNote:
        "Mușchii care lucrează iau zahăr din sânge chiar și cu puțină insulină. De aceea vârful de după masă e mai mic.",
    },
  },
  en: {
    fasting: {
      title: "In the morning, before eating",
      badge: "Steady",
      description:
        "Blood sugar stays between 80 and 90 mg/dL. The liver slowly releases sugar, and background insulin keeps it in balance.",
      clinicalNote:
        "The liver releases sugar into the blood to feed the brain and cells while you rest.",
    },
    high_carb: {
      title: "Meal with lots of sugar and white flour",
      badge: "Shoots up, drops fast",
      description:
        "Sweets, sugary drinks and white bread push blood sugar up very fast. Then it drops just as fast, and you feel tired and hungry.",
      clinicalNote:
        "The pancreas has to release a lot of insulin quickly to bring blood sugar back to normal.",
    },
    balanced_meal: {
      title: "Meal with vegetables, protein and fiber",
      badge: "Rises slowly, energy lasts",
      description:
        "Vegetables, lean meat or eggs, and whole grains make sugar enter the blood more slowly. Your numbers stay good.",
      clinicalNote:
        "Fiber forms a kind of gel in the gut that slows sugar going into the blood.",
    },
    exercise: {
      title: "A walk after eating",
      badge: "Muscles use the sugar",
      description:
        "A brisk 20–30 minute walk after a meal makes your muscles take sugar straight from the blood. The peak is much lower.",
      clinicalNote:
        "Working muscles take sugar from the blood even with little insulin. That is why the after-meal peak is lower.",
    },
  },
  sq: {
    fasting: {
      title: "Në mëngjes, pa ngrënë",
      badge: "I qëndrueshëm",
      description:
        "Sheqeri në gjak qëndron mes 80 dhe 90 mg/dL. Mëlçia lëshon ngadalë sheqer, dhe insulina bazë e mban në ekuilibër.",
      clinicalNote:
        "Mëlçia lëshon sheqer në gjak për të ushqyer trurin dhe qelizat kur pushon.",
    },
    high_carb: {
      title: "Vakt me shumë sheqer dhe miell të bardhë",
      badge: "Ngrihet shpejt, bie shpejt",
      description:
        "Ëmbëlsirat, pijet me sheqer dhe buka e bardhë e ngrenë sheqerin shumë shpejt. Pastaj bie po aq shpejt dhe ndihesh i lodhur dhe i uritur.",
      clinicalNote:
        "Pankreasi duhet të lëshojë shpejt shumë insulinë, që sheqeri të kthehet në normë.",
    },
    balanced_meal: {
      title: "Vakt me perime, proteina dhe fibra",
      badge: "Ngrihet ngadalë, energjia zgjat",
      description:
        "Perimet, mishi pa yndyrë ose vezët dhe drithërat integrale e bëjnë sheqerin të hyjë më ngadalë në gjak. Vlerat mbeten të mira.",
      clinicalNote:
        "Fibrat bëjnë në zorrë një lloj xheli që e ngadalëson kalimin e sheqerit në gjak.",
    },
    exercise: {
      title: "Shëtitje pas ngrënies",
      badge: "Muskujt e përdorin sheqerin",
      description:
        "Një ecje e shpejtë 20–30 minuta pas vaktit i bën muskujt të marrin sheqer drejt nga gjaku. Kulmi ulet shumë.",
      clinicalNote:
        "Muskujt që punojnë marrin sheqer nga gjaku edhe me pak insulinë. Prandaj kulmi pas vaktit është më i ulët.",
    },
  },
  it: {
    fasting: {
      title: "Al mattino, a digiuno",
      badge: "Stabile",
      description:
        "La glicemia resta tra 80 e 90 mg/dL. Il fegato rilascia piano lo zucchero e l'insulina di base lo tiene in equilibrio.",
      clinicalNote:
        "Il fegato manda zucchero nel sangue per nutrire il cervello e le cellule mentre riposi.",
    },
    high_carb: {
      title: "Pasto con molto zucchero e farina bianca",
      badge: "Sale di colpo, scende di colpo",
      description:
        "Dolci, bibite zuccherate e pane bianco fanno salire la glicemia molto in fretta. Poi scende altrettanto in fretta e ti senti stanco e affamato.",
      clinicalNote:
        "Il pancreas deve rilasciare in fretta molta insulina per riportare la glicemia alla normalità.",
    },
    balanced_meal: {
      title: "Pasto con verdure, proteine e fibre",
      badge: "Sale piano, l'energia dura di più",
      description:
        "Verdure, carne magra o uova e cereali integrali fanno entrare lo zucchero nel sangue più lentamente. I valori restano buoni.",
      clinicalNote:
        "Le fibre formano nell'intestino una specie di gel che rallenta il passaggio dello zucchero nel sangue.",
    },
    exercise: {
      title: "Una passeggiata dopo mangiato",
      badge: "I muscoli usano lo zucchero",
      description:
        "Una camminata veloce di 20–30 minuti dopo il pasto fa prendere ai muscoli lo zucchero direttamente dal sangue. Il picco scende molto.",
      clinicalNote:
        "I muscoli che lavorano prendono zucchero dal sangue anche con poca insulina. Per questo il picco dopo il pasto è più basso.",
    },
  },
  hr: {
    fasting: {
      title: "Ujutro, natašte",
      badge: "Stabilno",
      description:
        "Glukoza u krvi stoji između 80 i 90 mg/dL. Jetra polako otpušta glukozu, a bazalni inzulin drži ravnotežu.",
      clinicalNote:
        "Jetra otpušta glukozu u krv kako bi hranila mozak i stanice dok se odmaraš.",
    },
    high_carb: {
      title: "Obrok s puno šećera i bijelog brašna",
      badge: "Naglo raste, naglo pada",
      description:
        "Slatkiši, zaslađeni sokovi i bijeli kruh vrlo brzo podižu glukozu u krvi. Zatim ona jednako brzo padne pa osjećaš umor i glad.",
      clinicalNote:
        "Gušterača (pankreas) mora naglo izlučiti puno inzulina kako bi vratila glukozu u krvi u normalu.",
    },
    balanced_meal: {
      title: "Obrok s povrćem, bjelančevinama i vlaknima",
      badge: "Polako raste, energija traje dulje",
      description:
        "Povrće, nemasno meso ili jaja i cjelovite žitarice usporavaju ulazak šećera u krv. Vrijednosti ostaju uredne.",
      clinicalNote:
        "Vlakna u crijevima stvaraju gel koji usporava prijelaz glukoze u krv.",
    },
    exercise: {
      title: "Šetnja nakon obroka",
      badge: "Mišići troše glukozu",
      description:
        "Brza šetnja od 20–30 minuta nakon jela potiče mišiće da preuzmu glukozu izravno iz krvi. Vršna vrijednost znatno je niža.",
      clinicalNote:
        "Aktivni mišići preuzimaju glukozu u krvi čak i uz malo inzulina. Zato je porast nakon obroka puno manji.",
    },
  },
  rom: {
    fasting: {
      title: "Teharin, bi xabnasko",
      badge: "Lokho",
      description:
        "O zaharo and-o rat beshel mashkar 80 thaj 90 mg/dL. O buko mukhel lokhes zaharo thaj i insulina inkerel o balanso.",
      clinicalNote:
        "O buko del zaharo and-o rat te parvarel i godi thaj le tselule kana hodinisares.",
    },
    high_carb: {
      title: "Xaben but zaharesa thaj parne ardesa",
      badge: "Vazdel pe sigo, perel sigo",
      description:
        "Gudlimata, gudle paimata thaj parno manro vazden o zaharo and-o rat but sigo. Palal kodova perel sigo thaj hatyares tut khino thaj bokhalo.",
      clinicalNote:
        "O pankreaso musaj te del sigo but insulina te anel palpale o zaharo and-o rat.",
    },
    balanced_meal: {
      title: "Xaben zarzavatensa, proteinensa thaj fibrensa",
      badge: "Vazdel pe lokhes, i zor inkerel",
      description:
        "Zarzavaturya, mas bi khilesko vay anre thaj intregi giva keren o zaharo te zhal may lokhes and-o rat. Le numere achhen lachhe.",
      clinicalNote:
        "Le fibre lokhyaren sar nakhel o zaharo andar o per and-o rat.",
    },
    exercise: {
      title: "Phirimos palal o xaben",
      badge: "Le muskulurya labyaren o zaharo",
      description:
        "Ekh sigo phirimos 20–30 minuturya palal o xaben kerel le muskulurya te len o zaharo vorta andar o rat. O ucho punkto hulyol but.",
      clinicalNote:
        "Le muskulurya so keren buchi len zaharo andar o rat vi tsera insulinasa.",
    },
  },
};

interface ModuleUiStrings {
  moduleAriaLabel: string;
  title: string;
  description: string;
  chartSectionTitle: string;
  chartSectionSubtitle: string;
  scenarioSelectAria: string;
  /** Use {scenario}. */
  chartAria: string;
  peakLabel: string;
  optimalRangeLabel: string;
  attentionThresholdLabel: string;
  peakEstimated: string;
  atTime: string;
  physioExplanation: string;
  timeLabels: [string, string, string, string, string];
  simulatorTitle: string;
  simulatorSubtitle: string;
  stepMinusAria: string;
  stepNormalAria: string;
  stepNormalLabel: string;
  stepPlusAria: string;
  selectedValueLabel: string;
  /** Use {value} and {label}. */
  valueText: string;
  /** Names of the zones on the strip under the slider. */
  zoneNames: [string, string, string, string, string];
  physioReactionTitle: string;
  symptomsHeading: string;
  guidanceHeading: string;
  emergencyActionHeading: string;
  scrubberHeading: string;
  scrubberSubtitle: string;
  scrubberLabel: string;
  scrubberPhaseLabel: string;
  phases: {
    ingestion: string;
    influx: string;
    peak: string;
    uptake: string;
    homeostasis: string;
  };
}

const UI_STRINGS: Record<Lang, ModuleUiStrings> = {
  ro: {
    moduleAriaLabel: "Zahărul din sânge",
    title: "Cum se schimbă zahărul din sânge",
    description: "Glicemia înseamnă cât zahăr ai în sânge. Vezi cum o schimbă mâncarea și mișcarea și ce înseamnă fiecare valoare.",
    chartSectionTitle: "Zahărul după masă și după mișcare",
    chartSectionSubtitle: "Alege un exemplu și vezi ce se întâmplă în 4 ore.",
    scenarioSelectAria: "Alege un exemplu de masă sau de mișcare",
    chartAria: "Zahărul din sânge în 4 ore: {scenario}",
    peakLabel: "Vârf:",
    optimalRangeLabel: "Bine după masă (sub 140 mg/dL)",
    attentionThresholdLabel: "Atenție (180 mg/dL)",
    peakEstimated: "Cel mai sus",
    atTime: "după",
    physioExplanation: "De ce",
    timeLabels: ["0h (masă)", "1h", "2h", "3h", "4h"],
    simulatorTitle: "Ce înseamnă valoarea ta",
    simulatorSubtitle: "Mută bara între 50 și 300 mg/dL. Vezi ce se întâmplă în corp și ce să faci.",
    stepMinusAria: "Scade cu 10",
    stepNormalAria: "Pune valoarea normală pe nemâncate, 85 mg/dL",
    stepNormalLabel: "Normal (85)",
    stepPlusAria: "Crește cu 10",
    selectedValueLabel: "Valoarea ta:",
    valueText: "{value} miligrame pe decilitru: {label}",
    zoneNames: ["Prea mic", "Normal", "Prediabet", "Diabet", "Foarte mare"],
    physioReactionTitle: "Ce se întâmplă la",
    symptomsHeading: "Ce poți simți:",
    guidanceHeading: "Ce înseamnă:",
    emergencyActionHeading: "Ce faci acum",
    scrubberHeading: "Minut cu minut după masă (0–240 de minute)",
    scrubberSubtitle: "Mută bara ca să vezi zahărul din sânge la fiecare minut după masă.",
    scrubberLabel: "După masă:",
    scrubberPhaseLabel: "Ce se întâmplă:",
    phases: {
      ingestion: "Mâncarea se digeră. Zahărul începe să intre în sânge.",
      influx: "Zahărul din masă trece în sânge. Valoarea urcă.",
      peak: "Pancreasul dă insulină. Zahărul ajunge la vârf.",
      uptake: "Mușchii și ficatul iau zahărul. Valoarea scade.",
      homeostasis: "Zahărul revine la cât era înainte de masă.",
    },
  },
  en: {
    moduleAriaLabel: "Blood sugar",
    title: "How blood sugar changes",
    description: "Blood sugar (glucose) is how much sugar is in your blood. See how food and movement change it, and what each number means.",
    chartSectionTitle: "Blood sugar after meals and activity",
    chartSectionSubtitle: "Choose an example to see what happens over 4 hours.",
    scenarioSelectAria: "Choose a meal or activity example",
    chartAria: "Blood sugar over 4 hours: {scenario}",
    peakLabel: "Peak:",
    optimalRangeLabel: "Good after a meal (under 140 mg/dL)",
    attentionThresholdLabel: "Warning (180 mg/dL)",
    peakEstimated: "Highest",
    atTime: "after",
    physioExplanation: "Why",
    timeLabels: ["0h (meal)", "1h", "2h", "3h", "4h"],
    simulatorTitle: "What your number means",
    simulatorSubtitle: "Move the slider between 50 and 300 mg/dL. See what happens in your body and what to do.",
    stepMinusAria: "Lower by 10",
    stepNormalAria: "Set the normal fasting value, 85 mg/dL",
    stepNormalLabel: "Normal (85)",
    stepPlusAria: "Raise by 10",
    selectedValueLabel: "Your number:",
    valueText: "{value} milligrams per decilitre: {label}",
    zoneNames: ["Too low", "Normal", "Prediabetes", "Diabetes", "Very high"],
    physioReactionTitle: "What happens at",
    symptomsHeading: "What you may feel:",
    guidanceHeading: "What it means:",
    emergencyActionHeading: "What to do now",
    scrubberHeading: "Minute by minute after a meal (0–240 minutes)",
    scrubberSubtitle: "Move the slider to see blood sugar at each minute after the meal.",
    scrubberLabel: "After the meal:",
    scrubberPhaseLabel: "What is happening:",
    phases: {
      ingestion: "Food is being digested. Sugar starts to enter the blood.",
      influx: "Sugar from the meal goes into the blood. The number rises.",
      peak: "The pancreas releases insulin. Blood sugar peaks.",
      uptake: "Muscles and liver take up the sugar. The number falls.",
      homeostasis: "Blood sugar is back to where it was before the meal.",
    },
  },
  sq: {
    moduleAriaLabel: "Sheqeri në gjak",
    title: "Si ndryshon sheqeri në gjak",
    description: "Glicemia tregon sa sheqer ke në gjak. Shiko si e ndryshojnë ushqimi dhe lëvizja, dhe çfarë do të thotë çdo vlerë.",
    chartSectionTitle: "Sheqeri pas ngrënies dhe pas lëvizjes",
    chartSectionSubtitle: "Zgjidh një shembull dhe shiko çfarë ndodh për 4 orë.",
    scenarioSelectAria: "Zgjidh një shembull vakti ose lëvizjeje",
    chartAria: "Sheqeri në gjak për 4 orë: {scenario}",
    peakLabel: "Kulmi:",
    optimalRangeLabel: "Mirë pas ngrënies (nën 140 mg/dL)",
    attentionThresholdLabel: "Kujdes (180 mg/dL)",
    peakEstimated: "Më i larti",
    atTime: "pas",
    physioExplanation: "Pse",
    timeLabels: ["0h (vakti)", "1h", "2h", "3h", "4h"],
    simulatorTitle: "Çfarë do të thotë vlera jote",
    simulatorSubtitle: "Lëviz shiritin mes 50 dhe 300 mg/dL. Shiko çfarë ndodh në trup dhe çfarë të bësh.",
    stepMinusAria: "Ul me 10",
    stepNormalAria: "Vendos vlerën normale pa ngrënë, 85 mg/dL",
    stepNormalLabel: "Normale (85)",
    stepPlusAria: "Rrit me 10",
    selectedValueLabel: "Vlera jote:",
    valueText: "{value} miligramë për decilitër: {label}",
    zoneNames: ["Shumë i ulët", "Normal", "Prediabet", "Diabet", "Shumë i lartë"],
    physioReactionTitle: "Çfarë ndodh në",
    symptomsHeading: "Çfarë mund të ndiesh:",
    guidanceHeading: "Çfarë do të thotë:",
    emergencyActionHeading: "Çfarë të bësh tani",
    scrubberHeading: "Minutë pas minute pas ngrënies (0–240 minuta)",
    scrubberSubtitle: "Lëviz shiritin për të parë sheqerin në çdo minutë pas vaktit.",
    scrubberLabel: "Pas vaktit:",
    scrubberPhaseLabel: "Çfarë ndodh:",
    phases: {
      ingestion: "Ushqimi po tretet. Sheqeri fillon të hyjë në gjak.",
      influx: "Sheqeri nga vakti kalon në gjak. Vlera rritet.",
      peak: "Pankreasi lëshon insulinë. Sheqeri arrin kulmin.",
      uptake: "Muskujt dhe mëlçia marrin sheqerin. Vlera ulet.",
      homeostasis: "Sheqeri kthehet aty ku ishte para vaktit.",
    },
  },
  it: {
    moduleAriaLabel: "Lo zucchero nel sangue",
    title: "Come cambia la glicemia",
    description: "La glicemia dice quanto zucchero hai nel sangue. Guarda come la cambiano cibo e movimento, e cosa vuol dire ogni valore.",
    chartSectionTitle: "La glicemia dopo i pasti e il movimento",
    chartSectionSubtitle: "Scegli un esempio e guarda cosa succede in 4 ore.",
    scenarioSelectAria: "Scegli un esempio di pasto o di movimento",
    chartAria: "Glicemia in 4 ore: {scenario}",
    peakLabel: "Picco:",
    optimalRangeLabel: "Buona dopo il pasto (sotto 140 mg/dL)",
    attentionThresholdLabel: "Attenzione (180 mg/dL)",
    peakEstimated: "Il punto più alto",
    atTime: "dopo",
    physioExplanation: "Perché",
    timeLabels: ["0h (pasto)", "1h", "2h", "3h", "4h"],
    simulatorTitle: "Cosa vuol dire il tuo valore",
    simulatorSubtitle: "Sposta la barra tra 50 e 300 mg/dL. Guarda cosa succede nel corpo e cosa fare.",
    stepMinusAria: "Abbassa di 10",
    stepNormalAria: "Imposta il valore normale a digiuno, 85 mg/dL",
    stepNormalLabel: "Normale (85)",
    stepPlusAria: "Alza di 10",
    selectedValueLabel: "Il tuo valore:",
    valueText: "{value} milligrammi per decilitro: {label}",
    zoneNames: ["Troppo bassa", "Normale", "Prediabete", "Diabete", "Molto alta"],
    physioReactionTitle: "Cosa succede a",
    symptomsHeading: "Cosa puoi sentire:",
    guidanceHeading: "Cosa vuol dire:",
    emergencyActionHeading: "Cosa fare subito",
    scrubberHeading: "Minuto per minuto dopo il pasto (0–240 minuti)",
    scrubberSubtitle: "Sposta la barra per vedere la glicemia a ogni minuto dopo il pasto.",
    scrubberLabel: "Dopo il pasto:",
    scrubberPhaseLabel: "Cosa succede:",
    phases: {
      ingestion: "Il cibo viene digerito. Lo zucchero inizia a entrare nel sangue.",
      influx: "Lo zucchero del pasto passa nel sangue. Il valore sale.",
      peak: "Il pancreas rilascia insulina. La glicemia arriva al picco.",
      uptake: "Muscoli e fegato prendono lo zucchero. Il valore scende.",
      homeostasis: "La glicemia torna com'era prima del pasto.",
    },
  },
  hr: {
    moduleAriaLabel: "Glukoza u krvi",
    title: "Kako se mijenja glukoza u krvi",
    description: "Glukoza u krvi pokazuje koliko šećera imaš u krvotoku. Pogledaj kako je mijenjaju hrana i kretanje te što znači svaka vrijednost.",
    chartSectionTitle: "Glukoza u krvi nakon obroka i kretanja",
    chartSectionSubtitle: "Odaberi primjer i pogledaj što se događa tijekom 4 sata.",
    scenarioSelectAria: "Odaberi primjer obroka ili kretanja",
    chartAria: "Glukoza u krvi tijekom 4 sata: {scenario}",
    peakLabel: "Vrhunac:",
    optimalRangeLabel: "Uredno nakon obroka (ispod 140 mg/dL)",
    attentionThresholdLabel: "Oprez (180 mg/dL)",
    peakEstimated: "Najviša razina",
    atTime: "nakon",
    physioExplanation: "Zašto",
    timeLabels: ["0h (obrok)", "1h", "2h", "3h", "4h"],
    simulatorTitle: "Što znači tvoja vrijednost",
    simulatorSubtitle: "Pomakni klizač između 50 i 300 mg/dL. Pogledaj što se događa u tijelu i što poduzeti.",
    stepMinusAria: "Smanji za 10",
    stepNormalAria: "Postavi urednu vrijednost natašte, 85 mg/dL",
    stepNormalLabel: "Uredno (85)",
    stepPlusAria: "Povećaj za 10",
    selectedValueLabel: "Tvoja vrijednost:",
    valueText: "{value} miligrama po decilitru: {label}",
    zoneNames: ["Prenisko", "Uredno", "Predijabetes", "Dijabetes", "Jako visoko"],
    physioReactionTitle: "Što se događa pri",
    symptomsHeading: "Što možeš osjećati:",
    guidanceHeading: "Što to znači:",
    emergencyActionHeading: "Što učiniti odmah",
    scrubberHeading: "Iz minute u minutu nakon obroka (0–240 minuta)",
    scrubberSubtitle: "Pomakni klizač za prikaz glukoze u krvi u svakoj minuti nakon obroka.",
    scrubberLabel: "Nakon obroka:",
    scrubberPhaseLabel: "Što se događa:",
    phases: {
      ingestion: "Hrana se probavlja. Glukoza počinje ulaziti u krv.",
      influx: "Šećer iz obroka prelazi u krvotok. Vrijednost raste.",
      peak: "Gušterača (pankreas) izlučuje inzulin. Glukoza u krvi doseže vrhunac.",
      uptake: "Mišići i jetra preuzimaju glukozu. Vrijednost pada.",
      homeostasis: "Glukoza u krvi vraća se na razinu prije obroka.",
    },
  },
  rom: {
    moduleAriaLabel: "Zaharo and-o rat",
    title: "Sar paruvel pe o zaharo and-o rat",
    description: "O zaharo and-o rat sikavel kobor gudlimos si and-o cho rat. Dikh sar paruven les o xaben thaj o phirimos, thaj so phenel svako numero.",
    chartSectionTitle: "O zaharo palal o xaben thaj o phirimos",
    chartSectionSubtitle: "Alosar ekh misal thaj dikh so kerel pe and-e 4 chasurya.",
    scenarioSelectAria: "Alosar ekh misal vash xaben vay phirimos",
    chartAria: "Zaharo and-o rat and-e 4 chasurya: {scenario}",
    peakLabel: "Ucho punkto:",
    optimalRangeLabel: "Lachho palal o xaben (telal 140 mg/dL)",
    attentionThresholdLabel: "Arakh tut (180 mg/dL)",
    peakEstimated: "O may ucho",
    atTime: "palal",
    physioExplanation: "Sostar",
    timeLabels: ["0h (xaben)", "1h", "2h", "3h", "4h"],
    simulatorTitle: "So phenel cho numero",
    simulatorSubtitle: "Mishtisar i bara mashkar 50 thaj 300 mg/dL. Dikh so kerel pe and-o trupo thaj so te keres.",
    stepMinusAria: "Hulyar 10",
    stepNormalAria: "Thov normalno numero bi xabnasko, 85 mg/dL",
    stepNormalLabel: "Normalno (85)",
    stepPlusAria: "Vazde 10",
    selectedValueLabel: "Cho numero:",
    valueText: "{value} miligramurya po detsilitro: {label}",
    zoneNames: ["But tikno", "Normalno", "Anglal gudlo rat", "Gudlo rat", "But baro"],
    physioReactionTitle: "So kerel pe ko",
    symptomsHeading: "So shaj hatyares:",
    guidanceHeading: "So znachil:",
    emergencyActionHeading: "So te keres akana",
    scrubberHeading: "Minuto po minuto palal o xaben (0–240 minuturya)",
    scrubberSubtitle: "Mishtisar i bara te dikhes o zaharo and-o rat pe svako minuto palal o xaben.",
    scrubberLabel: "Palal o xaben:",
    scrubberPhaseLabel: "So kerel pe:",
    phases: {
      ingestion: "O xaben mistil pe. O zaharo astarel te zhal and-o rat.",
      influx: "O zaharo katar o xaben nakhel and-o rat. O numero vazdel pe.",
      peak: "O pankreaso mukhel insulina. O zaharo aresel ko ucho punkto.",
      uptake: "Le muskulurya thaj o buko len o zaharo. O numero perel.",
      homeostasis: "O zaharo and-o rat avel palpale sar sas anglal o xaben.",
    },
  },
};

interface BloodSugarInterpretation {
  category: "hypo" | "normal" | "prediabetes" | "diabetes" | "severe_hyper";
  label: string;
  toneClass: string;
  symptoms: string;
  guidance: string;
  emergencyRule?: string;
}

const TIER_TRANSLATIONS: Record<
  Lang,
  Record<
    "hypo" | "normal" | "prediabetes" | "diabetes" | "severe_hyper",
    { label: string; symptoms: string; guidance: string; emergencyRule?: string }
  >
> = {
  ro: {
    hypo: {
      label: "Zahăr prea mic (hipoglicemie)",
      symptoms:
        "Tremuri la mâini, transpirație rece, amețeală, inima bate tare, foame mare, te încurci la gândire sau vezi dublu.",
      guidance:
        "Creierul nu are destul zahăr ca să lucreze bine. Ia zahăr chiar acum.",
      emergencyRule:
        "Regula 15/15: mănâncă sau bea acum 15 grame de zahăr rapid. De exemplu, 3 cuburi de zahăr topite în puțină apă, 120 ml de suc de fructe sau o lingură de miere. Stai liniștit 15 minute, apoi măsoară din nou. Dacă e tot sub 70 mg/dL, mai fă o dată.",
    },
    normal: {
      label: "Normal pe nemâncate",
      symptoms:
        "Ai energie la fel toată ziua, te concentrezi bine, nu ești somnoros și nu ți-e sete prea des.",
      guidance:
        "Pe nemâncate, normal e între 70 și 99 mg/dL. După masă, normal e sub 140 mg/dL.",
    },
    prediabetes: {
      label: "Prediabet",
      symptoms:
        "De multe ori nu simți nimic. Poți fi puțin obosit după mese mari sau te poți îngrășa pe burtă.",
      guidance:
        "Pe nemâncate, între 100 și 125 mg/dL, corpul răspunde mai slab la insulină. Vestea bună: poți întoarce asta dacă mănânci echilibrat și te miști zilnic.",
    },
    diabetes: {
      label: "Valoare de diabet (zahăr mare)",
      symptoms:
        "Sete mare și gură uscată, urinezi des, ești mereu obosit, zgârieturile se vindecă greu.",
      guidance:
        "Mergi la medic și cere analiza HbA1c dacă ai 126 mg/dL sau mai mult pe nemâncate, la 2 măsurări diferite. La fel dacă după masă ai peste 140 mg/dL.",
    },
    severe_hyper: {
      label: "Zahăr foarte mare (urgență)",
      symptoms:
        "Gură foarte uscată, greață, vărsături, respirație rapidă cu miros dulce, ca de mere sau de acetonă, somnolență, nu mai gândești limpede.",
      guidance:
        "Valoarea e atât de mare încât rinichii nu mai fac față. E nevoie urgent de medic, ca să nu apară cetoacidoza sau coma diabetică.",
      emergencyRule:
        "Verifică dacă omul e treaz și răspunde. Dă-i să bea apă simplă, fără zahăr. Sună imediat la 112 dacă e confuz, foarte somnoros sau leșină.",
    },
  },
  en: {
    hypo: {
      label: "Blood sugar too low (hypoglycemia)",
      symptoms:
        "Shaky hands, cold sweat, dizziness, a pounding heart, strong hunger, confusion or double vision.",
      guidance:
        "Your brain does not have enough sugar to work well. Take sugar right now.",
      emergencyRule:
        "The 15/15 rule: eat or drink 15 grams of fast sugar now. For example, 3 sugar cubes dissolved in a little water, 120 ml of fruit juice or 1 tablespoon of honey. Rest for 15 minutes, then measure again. If it is still under 70 mg/dL, do it again.",
    },
    normal: {
      label: "Normal before eating",
      symptoms:
        "Steady energy all day, clear focus, no sleepiness and no unusual thirst.",
      guidance:
        "Before eating, normal is 70–99 mg/dL. After a meal, normal is under 140 mg/dL.",
    },
    prediabetes: {
      label: "Prediabetes",
      symptoms:
        "Often you feel nothing. You may feel a bit tired after big meals or put on weight around the belly.",
      guidance:
        "Before eating, 100 to 125 mg/dL means your body responds less to insulin. The good news: you can turn this around by eating well and moving every day.",
    },
    diabetes: {
      label: "Diabetes range (high blood sugar)",
      symptoms:
        "Strong thirst and dry mouth, peeing often, always tired, scratches that heal slowly.",
      guidance:
        "See a doctor and ask for an HbA1c test if you have 126 mg/dL or more before eating, on 2 different tests. Do the same if you are over 140 mg/dL after meals.",
    },
    severe_hyper: {
      label: "Very high blood sugar (emergency)",
      symptoms:
        "Very dry mouth, nausea, vomiting, fast breathing with a sweet, fruity or nail-polish smell, sleepiness and confusion.",
      guidance:
        "The level is so high that the kidneys cannot cope. You need a doctor urgently to prevent ketoacidosis or a diabetic coma.",
      emergencyRule:
        "Check that the person is awake and answers. Give plain water with no sugar. Call 112 at once if they are confused, very sleepy or pass out.",
    },
  },
  sq: {
    hypo: {
      label: "Sheqer shumë i ulët (hipoglicemi)",
      symptoms:
        "Dridhje në duar, djersë e ftohtë, marramendje, zemra rreh fort, uri e madhe, ngatërrim ose shikim i dyfishtë.",
      guidance:
        "Truri nuk ka sheqer të mjaftueshëm për të punuar mirë. Merr sheqer menjëherë.",
      emergencyRule:
        "Rregulli 15/15: ha ose pi tani 15 gramë sheqer të shpejtë. Për shembull, 3 kube sheqer të tretura në pak ujë, 120 ml lëng frutash ose 1 lugë mjaltë. Pusho 15 minuta, pastaj mate përsëri. Nëse është ende nën 70 mg/dL, përsërite.",
    },
    normal: {
      label: "Normal pa ngrënë",
      symptoms:
        "Energji e njëjtë gjithë ditën, përqendrim i mirë, pa përgjumje dhe pa etje të tepërt.",
      guidance:
        "Pa ngrënë, normale është 70–99 mg/dL. Pas ngrënies, normale është nën 140 mg/dL.",
    },
    prediabetes: {
      label: "Prediabet",
      symptoms:
        "Shpesh nuk ndien asgjë. Mund të lodhesh pak pas vakteve të mëdha ose të shtosh peshë rreth barkut.",
      guidance:
        "Pa ngrënë, 100 deri 125 mg/dL do të thotë që trupi reagon më pak ndaj insulinës. Lajmi i mirë: mund ta kthesh mbrapsht me ushqim të balancuar dhe lëvizje çdo ditë.",
    },
    diabetes: {
      label: "Vlerë diabeti (sheqer i lartë)",
      symptoms:
        "Etje e madhe dhe gojë e thatë, urinon shpesh, je gjithmonë i lodhur, gërvishtjet shërohen ngadalë.",
      guidance:
        "Shko te mjeku dhe kërko analizën HbA1c nëse ke 126 mg/dL ose më shumë pa ngrënë, në 2 matje të ndryshme. Po ashtu nëse pas ngrënies ke mbi 140 mg/dL.",
    },
    severe_hyper: {
      label: "Sheqer shumë i lartë (urgjencë)",
      symptoms:
        "Gojë shumë e thatë, të përziera, të vjella, frymëmarrje e shpejtë me erë të ëmbël si mollë ose aceton, përgjumje dhe ngatërrim.",
      guidance:
        "Vlera është aq e lartë sa veshkat nuk e përballojnë. Duhet mjek urgjentisht, që të mos vijë ketoacidoza ose koma diabetike.",
      emergencyRule:
        "Shiko nëse personi është zgjuar dhe përgjigjet. Jepi të pijë ujë të thjeshtë, pa sheqer. Telefono menjëherë 112 nëse ngatërrohet, është shumë i përgjumur ose humb ndjenjat.",
    },
  },
  it: {
    hypo: {
      label: "Glicemia troppo bassa (ipoglicemia)",
      symptoms:
        "Mani che tremano, sudore freddo, capogiri, cuore che batte forte, molta fame, confusione o vista doppia.",
      guidance:
        "Il cervello non ha abbastanza zucchero per funzionare bene. Prendi zucchero subito.",
      emergencyRule:
        "La regola 15/15: mangia o bevi subito 15 grammi di zucchero rapido. Per esempio 3 zollette sciolte in poca acqua, 120 ml di succo di frutta o 1 cucchiaio di miele. Riposa 15 minuti, poi misura di nuovo. Se è ancora sotto 70 mg/dL, ripeti.",
    },
    normal: {
      label: "Normale a digiuno",
      symptoms:
        "Energia costante tutto il giorno, buona concentrazione, niente sonnolenza e niente sete insolita.",
      guidance:
        "A digiuno, il normale è 70–99 mg/dL. Dopo i pasti, il normale è sotto 140 mg/dL.",
    },
    prediabetes: {
      label: "Prediabete",
      symptoms:
        "Spesso non senti niente. Puoi sentirti un po' stanco dopo pasti abbondanti o ingrassare sulla pancia.",
      guidance:
        "A digiuno, tra 100 e 125 mg/dL il corpo risponde meno all'insulina. La buona notizia: puoi tornare indietro mangiando in modo equilibrato e camminando ogni giorno.",
    },
    diabetes: {
      label: "Valore da diabete (glicemia alta)",
      symptoms:
        "Molta sete e bocca secca, urini spesso, sei sempre stanco, i graffi guariscono lentamente.",
      guidance:
        "Vai dal medico e chiedi l'esame HbA1c se hai 126 mg/dL o più a digiuno, in 2 misurazioni diverse. Fai lo stesso se dopo i pasti superi 140 mg/dL.",
    },
    severe_hyper: {
      label: "Glicemia molto alta (emergenza)",
      symptoms:
        "Bocca molto secca, nausea, vomito, respiro veloce con odore dolce di frutta o di acetone, sonnolenza e confusione.",
      guidance:
        "Il valore è così alto che i reni non ce la fanno. Serve subito un medico, per evitare la chetoacidosi o il coma diabetico.",
      emergencyRule:
        "Controlla che la persona sia sveglia e risponda. Dalle solo acqua naturale, senza zucchero. Chiama subito il 112 se è confusa, molto assonnata o perde i sensi.",
    },
  },
  hr: {
    hypo: {
      label: "Preniska glukoza u krvi (hipoglikemija)",
      symptoms:
        "Drhtanje ruku, hladan znoj, vrtoglavica, snažno lupanje srca, jaka glad, smetenost ili dvoslike.",
      guidance:
        "Mozak nema dovoljno glukoze za normalan rad. Odmah uzmi brzi šećer.",
      emergencyRule:
        "Pravilo 15/15: odmah pojedi ili popij 15 grama brzog šećera. Primjerice, 3 kocke šećera otopljene u malo vode, 120 ml voćnog soka ili 1 jušnu žlicu meda. Miruj 15 minuta pa ponovno izmjeri. Ako je i dalje ispod 70 mg/dL, ponovi postupak.",
    },
    normal: {
      label: "Uredna vrijednost natašte",
      symptoms:
        "Ravnomjerna energija tijekom dana, dobra koncentracija, bez pospanosti i neuobičajene žeđi.",
      guidance:
        "Natašte je uredna glukoza u krvi 70–99 mg/dL. Dva sata nakon obroka uredno je ispod 140 mg/dL.",
    },
    prediabetes: {
      label: "Predijabetes",
      symptoms:
        "Često ne osjećaš nikakve tegobe. Možeš biti blago umoran nakon obilnih obroka ili dobivati masno tkivo oko trbuha.",
      guidance:
        "Vrijednost natašte od 100 do 125 mg/dL znači da tijelo slabije reagira na inzulin. Dobra vijest je da to možeš preokrenuti uravnoteženom prehranom i svakodnevnim kretanjem.",
    },
    diabetes: {
      label: "Područje dijabetesa (povišena glukoza u krvi)",
      symptoms:
        "Izražena žeđ i suha usta, učestalo mokrenje, stalni umor i sporo cijeljenje ogrebotina.",
      guidance:
        "Javi se obiteljskom liječniku i zatraži pretragu HbA1c ako imaš 126 mg/dL ili više natašte u 2 odvojena mjerenja, ili iznad 140 mg/dL nakon obroka.",
    },
    severe_hyper: {
      label: "Izrazito visoka glukoza u krvi (hitno stanje)",
      symptoms:
        "Jako suha usta, mučnina, povraćanje, ubrzano disanje slatkastog mirisa po voću ili acetonu, pospanost i smetenost.",
      guidance:
        "Razina je toliko visoka da bubrezi to više ne mogu kompenzirati. Hitno je potreban liječnik kako bi se spriječila dijabetička ketoacidoza ili koma.",
      emergencyRule:
        "Provjeri je li osoba pri svijesti i odgovara li na pitanja. Daj joj piti običnu vodu bez šećera. Odmah nazovi 112 ako je smetena, jako pospana ili izgubi svijest.",
    },
  },
  rom: {
    hypo: {
      label: "Zaharo but tikno (hipoglikemiya)",
      symptoms:
        "Izdran che vast, shudro kamimos, phirel cho shero, o ilo marel zurales, bari bokh vay na dikhes vorta.",
      guidance:
        "La godyake nay dosta zaharo te kerel buchi. Le sigo zaharo akana.",
      emergencyRule:
        "O regulo 15/15: xa vay pi akana 15 gramurya sigo zaharo. Sar misal, 3 kuburya zaharo and-o tsera pay, 120 ml fruktengi zumi vay 1 bari chikni avgin. Besh lokhes 15 minuturya, palal kodova mare palpale. Te si inke telal 70 mg/dL, ker palpale.",
    },
    normal: {
      label: "Normalno bi xabnasko",
      symptoms:
        "Zor sa o dives, lachhi godyaki buchi, bi sovimasko thaj bi bare trushako.",
      guidance:
        "Bi xabnasko, normalno si 70–99 mg/dL. Palal o xaben, normalno si telal 140 mg/dL.",
    },
    prediabetes: {
      label: "Anglal o gudlo rat (prediabeto)",
      symptoms:
        "Butivar na hatyares kanch. Shaj aves tsera khino palal bare xabena.",
      guidance:
        "Bi xabnasko, 100 zhi ko 125 mg/dL znachil ke o trupo ashunel may tsera la insulinake. E lachhi vorba: shaj boldes kadava palpale lachhe xabnasa thaj phirimasa svako dives.",
    },
    diabetes: {
      label: "Gudlo rat (baro zaharo and-o rat)",
      symptoms:
        "Bari trush thaj shuko muy, zhas butivar avri, san sa o vrama khino, le tikne rane sastyon lokhes.",
      guidance:
        "Zha ko familiyako doktori thaj mang o rengro dikhiben HbA1c te si tut 126 mg/dL vay may but bi xabnasko pe 2 dikhimata.",
    },
    severe_hyper: {
      label: "But baro zaharo and-o rat (sigardiari)",
      symptoms:
        "But shuko muy, chhadimos, sigo phurdimos gudle sungesa, sovel thaj na gindisares limpede.",
      guidance:
        "O zaharo si katka baro ke trebul sigo o doktori, te na avel pharo nasvalimos.",
      emergencyRule:
        "Dikh te si o manush uchtardo thaj del atveto. De les te pel chisto pay bi zaharesko. Mare sigo ko sigardiari 112 te na zhanela kay si, te sovel but vay te perel tele.",
    },
  },
};

function getBloodSugarInterpretation(value: number, lang: Lang = "ro"): BloodSugarInterpretation {
  const t = TIER_TRANSLATIONS[lang] || TIER_TRANSLATIONS.ro;

  if (value < 70) {
    return {
      category: "hypo",
      label: t.hypo.label,
      toneClass: "border-primary/40 bg-primary-soft",
      symptoms: t.hypo.symptoms,
      guidance: t.hypo.guidance,
      emergencyRule: t.hypo.emergencyRule,
    };
  }

  if (value <= 99) {
    return {
      category: "normal",
      label: t.normal.label,
      toneClass: "border-live-sage/40 bg-live-sage-soft/30",
      symptoms: t.normal.symptoms,
      guidance: t.normal.guidance,
    };
  }

  if (value <= 125) {
    return {
      category: "prediabetes",
      label: t.prediabetes.label,
      toneClass: "border-amber-care-border bg-amber-care-soft/40",
      symptoms: t.prediabetes.symptoms,
      guidance: t.prediabetes.guidance,
    };
  }

  if (value < 200) {
    return {
      category: "diabetes",
      label: t.diabetes.label,
      toneClass: "border-sapphire-border bg-sapphire-soft/50",
      symptoms: t.diabetes.symptoms,
      guidance: t.diabetes.guidance,
    };
  }

  return {
    category: "severe_hyper",
    label: t.severe_hyper.label,
    toneClass: "border-primary/50 bg-primary-soft",
    symptoms: t.severe_hyper.symptoms,
    guidance: t.severe_hyper.guidance,
    emergencyRule: t.severe_hyper.emergencyRule,
  };
}

/**
 * Smooth curve through the hourly readings (0–240 min), drawn with monotone cubic
 * interpolation: it never overshoots a reading, so the highest point on the line is
 * the peak printed on the card. The chart line and the minute cursor both use it,
 * so the cursor always sits on the drawn curve.
 */
function splineValue(points: number[], minute: number): number {
  const segmentDuration = 60; // 4 segments of 60 min: 0-60, 60-120, 120-180, 180-240
  const last = points.length - 1;
  const position = Math.max(0, Math.min(last, minute / segmentDuration));
  const index = Math.min(last - 1, Math.floor(position));
  const t = position - index;

  const slope = (k: number) => points[k + 1] - points[k];
  // Flat at the ends; zero at a peak or dip; otherwise the harmonic mean of the two slopes.
  const tangent = (k: number) => {
    if (k === 0 || k === last) return 0;
    const before = slope(k - 1);
    const after = slope(k);
    return before * after <= 0 ? 0 : (2 * before * after) / (before + after);
  };

  const t2 = t * t;
  const t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * points[index] +
    (t3 - 2 * t2 + t) * tangent(index) +
    (-2 * t3 + 3 * t2) * points[index + 1] +
    (t3 - t2) * tangent(index + 1)
  );
}

/** Minutes between the samples that draw the chart line. */
const CURVE_STEP_MIN = 4;

/**
 * Highest point of the drawn curve and the minute it is reached. Read from the same
 * spline as the line, so the numbers in the list and under the chart always match
 * the curve on screen (the monotone spline peaks at one of the hourly readings).
 */
function curvePeak(points: number[]): { value: number; minute: number } {
  let best = { value: -Infinity, minute: 0 };
  for (let minute = 0; minute <= 240; minute++) {
    const value = splineValue(points, minute);
    if (value > best.value + 1e-9) best = { value, minute };
  }
  return { value: Math.round(best.value), minute: best.minute };
}

function useSafeLanguage(propLang?: Lang): Lang {
  const ctx = useContext(LanguageContext);
  if (propLang && UI_STRINGS[propLang]) return propLang;
  if (ctx?.lang && UI_STRINGS[ctx.lang]) return ctx.lang;
  return "ro";
}

/** Zone strip under the slider: [from, to) in mg/dL and its colour. */
const SLIDER_MIN = 50;
const SLIDER_MAX = 300;
const ZONE_TICKS = [70, 100, 126, 200];
const pct = (v: number) => ((v - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;
/** The five ranges on the strip, in the order of `zoneNames`, as [from, to) in mg/dL. */
const ZONE_RANGES: [number, number][] = [
  [SLIDER_MIN, 70],
  [70, 100],
  [100, 126],
  [126, 200],
  [200, SLIDER_MAX],
];
const zoneIndexOf = (v: number) => {
  const i = ZONE_RANGES.findIndex(([, to]) => v < to);
  return i === -1 ? ZONE_RANGES.length - 1 : i;
};

export function GlucoseDynamicsModule({ lang: propLang }: GlucoseDynamicsModuleProps) {
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>("balanced_meal");
  const [sliderValue, setSliderValue] = useState<number>(105);
  const [scrubbedMinute, setScrubbedMinute] = useState<number>(60);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [svgWidth, setSvgWidth] = useState<number>(620);
  const reduced = useReducedMotion() ?? false;
  // The first render (server and hydration) shows the finished curve; only a curve the
  // reader asks for by picking another example draws itself.
  const [hasPickedScenario, setHasPickedScenario] = useState(false);
  const drawIn = hasPickedScenario && !reduced;

  useEffect(() => {
    const el = chartContainerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.round(entry.contentRect.width);
      if (next > 0) setSvgWidth(next);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const activeLang = useSafeLanguage(propLang);
  const ui = UI_STRINGS[activeLang] || UI_STRINGS.ro;
  const scenarioLocales = SCENARIO_TRANSLATIONS[activeLang] || SCENARIO_TRANSLATIONS.ro;

  const activeScenarioBase =
    SCENARIOS_BASE.find((item) => item.id === activeScenarioId) ?? SCENARIOS_BASE[2];
  const activeScenarioLocale = scenarioLocales[activeScenarioId] || scenarioLocales.balanced_meal;
  const activeScenario = { ...activeScenarioBase, ...activeScenarioLocale };

  const interpretation = getBloodSugarInterpretation(sliderValue, activeLang);

  const scrubbedGlucose = Math.round(splineValue(activeScenarioBase.points, scrubbedMinute));
  const peak = curvePeak(activeScenarioBase.points);
  const activeZone = zoneIndexOf(sliderValue);
  const [zoneFrom, zoneTo] = ZONE_RANGES[activeZone];
  // The active range's name sits under its own stretch of the strip: left-aligned from the
  // range start on the left half, right-aligned to the range end on the right half.
  const zoneLabelStyle =
    pct((zoneFrom + zoneTo) / 2) <= 50
      ? { left: `${pct(zoneFrom)}%` }
      : { right: `${100 - pct(zoneTo)}%` };

  const currentPhase =
    scrubbedMinute <= 15
      ? ui.phases.ingestion
      : scrubbedMinute <= 45
      ? ui.phases.influx
      : scrubbedMinute <= 75
      ? ui.phases.peak
      : scrubbedMinute <= 120
      ? ui.phases.uptake
      : ui.phases.homeostasis;

  // Chart geometry (CSS px). Narrow screens get a little less side padding.
  const svgHeight = 260;
  const compact = svgWidth < 480;
  const paddingLeft = compact ? 40 : 56;
  const paddingRight = compact ? 16 : 24;
  const paddingTop = 28;
  const paddingBottom = 42;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Y-axis: 40 to 220 mg/dL
  const minY = 40;
  const maxY = 220;
  const scaleY = (val: number) => {
    const clamped = Math.max(minY, Math.min(maxY, val));
    return paddingTop + chartHeight - ((clamped - minY) / (maxY - minY)) * chartHeight;
  };

  // X-axis: 0 to 4 hours (5 points)
  const timeLabels = ui.timeLabels;
  const scaleX = (index: number) => paddingLeft + (index / (timeLabels.length - 1)) * chartWidth;

  const coords = activeScenario.points.map((val, idx) => ({ x: scaleX(idx), y: scaleY(val) }));
  const minuteToX = (minute: number) => paddingLeft + (minute / 240) * chartWidth;

  const curve = Array.from({ length: 240 / CURVE_STEP_MIN + 1 }, (_, i) => {
    const minute = i * CURVE_STEP_MIN;
    return `${minuteToX(minute).toFixed(1)} ${scaleY(splineValue(activeScenarioBase.points, minute)).toFixed(1)}`;
  });
  const linePath = `M ${curve.join(" L ")}`;

  const scrubX = minuteToX(scrubbedMinute);
  const scrubY = scaleY(splineValue(activeScenarioBase.points, scrubbedMinute));

  // When the reader picks another example, the new curve draws itself once, left to right.
  const draw = { duration: reduced ? 0 : 0.7, ease: EASE_OUT };
  const fadeIn = { duration: reduced ? 0 : DURATION.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.35 };
  const peakIndex = Math.round(peak.minute / 60);

  const stepButtonClass =
    "min-h-[44px] min-w-[44px] rounded-lg border border-border bg-card px-3 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire";

  return (
    <section
      aria-label={ui.moduleAriaLabel}
      className="space-y-8"
    >
      <header className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{ui.title}</h3>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">{ui.description}</p>
      </header>

      {/* Part 1: curves by scenario */}
      <div className="space-y-5 border-t border-border pt-6">
        <div>
          <h4 className="text-base font-semibold text-foreground sm:text-lg">{ui.chartSectionTitle}</h4>
          <p className="mt-0.5 text-sm text-muted-foreground">{ui.chartSectionSubtitle}</p>
        </div>

        <div role="radiogroup" aria-label={ui.scenarioSelectAria} className={ROW_LIST_CLASS}>
          {SCENARIOS_BASE.map((sc) => {
            const isSelected = sc.id === activeScenarioId;
            const loc = scenarioLocales[sc.id] || scenarioLocales.balanced_meal;
            return (
              <label key={sc.id} className={`${ROW_CLASS} cursor-pointer`}>
                <input
                  type="radio"
                  name="glucose-scenario"
                  value={sc.id}
                  checked={isSelected}
                  onChange={() => {
                    setHasPickedScenario(true);
                    setActiveScenarioId(sc.id);
                  }}
                  className="sr-only"
                />
                <span className={radioDotClass(isSelected)} aria-hidden="true" />
                <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground">{loc.title}</span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {ui.peakLabel} {curvePeak(sc.points).value} mg/dL
                </span>
              </label>
            );
          })}
        </div>

        <div
          id="glucose-curve-display"
          role="region"
          aria-label={ui.chartAria.replace("{scenario}", activeScenario.title)}
          className="space-y-5 pt-1"
        >
          <div ref={chartContainerRef} className="w-full">
            <LazyMotion features={domAnimation} strict>
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              width="100%"
              height={svgHeight}
              className="block select-none"
              aria-hidden="true"
            >
              {/* Healthy after-meal range: 70 to 140 mg/dL */}
              <rect
                x={paddingLeft}
                y={scaleY(140)}
                width={chartWidth}
                height={scaleY(70) - scaleY(140)}
                fill="var(--color-live-sage-soft)"
              />

              {[60, 100, 140, 180, 220].map((val) => {
                const y = scaleY(val);
                const isAlertLine = val === 180;
                return (
                  <g key={val}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={paddingLeft + chartWidth}
                      y2={y}
                      stroke={isAlertLine ? "var(--color-muted-foreground)" : "var(--color-border)"}
                      strokeDasharray={isAlertLine ? "4 4" : undefined}
                      strokeWidth={1}
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="11"
                      fill="var(--color-muted-foreground)"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {timeLabels.map((lbl, idx) => {
                const x = scaleX(idx);
                const anchor = idx === 0 ? "start" : idx === timeLabels.length - 1 ? "end" : "middle";
                return (
                  <g key={lbl}>
                    <line
                      x1={x}
                      y1={paddingTop + chartHeight}
                      x2={x}
                      y2={paddingTop + chartHeight + 5}
                      stroke="var(--color-muted-foreground)"
                      strokeWidth={1}
                    />
                    <text
                      x={idx === 0 ? x - 4 : idx === timeLabels.length - 1 ? x + 2 : x}
                      y={paddingTop + chartHeight + 20}
                      textAnchor={anchor}
                      fontSize="12"
                      fill="var(--color-foreground)"
                    >
                      {compact ? lbl.replace(/\s*\(.*\)$/, "") : lbl}
                    </text>
                  </g>
                );
              })}

              <m.path
                key={`line-${activeScenario.id}`}
                d={linePath}
                fill="none"
                stroke={activeScenario.strokeColor}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={drawIn ? { pathLength: 0 } : false}
                animate={{ pathLength: 1 }}
                transition={draw}
              />

              {/* A dot at each hourly reading; only the peak carries its number. */}
              {coords.map((pt, idx) => (
                <m.g
                  key={`${activeScenario.id}-${idx}`}
                  initial={drawIn ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  transition={fadeIn}
                >
                  <circle cx={pt.x} cy={pt.y} r={3.5} fill={activeScenario.strokeColor} stroke="var(--color-card)" strokeWidth={1.5} />
                  {idx === peakIndex && (
                    <text
                      x={pt.x}
                      y={pt.y - 12}
                      textAnchor={idx === 0 ? "start" : idx === coords.length - 1 ? "end" : "middle"}
                      fontSize="12"
                      fontWeight="600"
                      fill="var(--color-foreground)"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {peak.value}
                    </text>
                  )}
                </m.g>
              ))}

              {/* Time cursor, driven by the slider below */}
              <g className="pointer-events-none">
                <line
                  x1={scrubX}
                  y1={paddingTop}
                  x2={scrubX}
                  y2={paddingTop + chartHeight}
                  stroke={activeScenario.strokeColor}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle cx={scrubX} cy={scrubY} r="6" fill="var(--color-card)" stroke={activeScenario.strokeColor} strokeWidth="2.5" />
              </g>
            </svg>
            </LazyMotion>

            {/* Legend for the bands drawn on the chart */}
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-border/60 pt-2.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-3.5 rounded-xs bg-live-sage-soft ring-1 ring-live-sage/30" aria-hidden="true" />
                {ui.optimalRangeLabel}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-3.5 border-t border-dashed border-muted-foreground" aria-hidden="true" />
                {ui.attentionThresholdLabel}
              </li>
            </ul>
          </div>

          {/* Minute-by-minute cursor */}
          <div className="space-y-3 border-t border-border pt-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h5 className="text-sm font-semibold text-foreground">{ui.scrubberHeading}</h5>
                <p className="text-sm text-muted-foreground">{ui.scrubberSubtitle}</p>
              </div>
              <p className="shrink-0 text-sm text-muted-foreground" aria-live="polite">
                {ui.scrubberLabel}{" "}
                <strong className="font-semibold tabular-nums text-foreground">{scrubbedMinute} min</strong>
                {" · "}
                <strong className="font-semibold tabular-nums text-foreground">{scrubbedGlucose} mg/dL</strong>
              </p>
            </div>

            <input
              type="range"
              min={0}
              max={240}
              step={1}
              value={scrubbedMinute}
              onChange={(e) => setScrubbedMinute(Number(e.target.value))}
              aria-label={ui.scrubberHeading}
              aria-valuetext={`${scrubbedMinute} min, ${scrubbedGlucose} mg/dL`}
              className="h-2 w-full cursor-pointer accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
            />
            <div className="flex justify-between text-xs tabular-nums text-muted-foreground" aria-hidden="true">
              <span>0 min</span>
              <span>1 h</span>
              <span>2 h</span>
              <span>3 h</span>
              <span>4 h</span>
            </div>

            <p className="text-sm text-foreground">
              <span className="text-muted-foreground">{ui.scrubberPhaseLabel}</span>{" "}
              <span className="font-semibold">{currentPhase}</span>
            </p>
          </div>

          {/* What this scenario means */}
          <div className="space-y-3 border-t border-border pt-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">
                {activeScenario.badge}
              </span>
              <span className="text-sm text-muted-foreground">
                {ui.peakEstimated}: <strong className="font-semibold tabular-nums text-foreground">{peak.value} mg/dL</strong> {ui.atTime}{" "}
                <span className="tabular-nums">{peak.minute} min</span>
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <p className="text-sm leading-relaxed text-foreground">{activeScenario.description}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                <strong className="font-semibold text-foreground">{ui.physioExplanation}:</strong> {activeScenario.clinicalNote}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Part 2: what a single reading means */}
      <div className="space-y-6 border-t border-border pt-6">
        <div>
          <h4 className="text-base font-semibold text-foreground sm:text-lg">{ui.simulatorTitle}</h4>
          <p className="mt-0.5 text-sm text-muted-foreground">{ui.simulatorSubtitle}</p>
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <label htmlFor="glucose-level-slider" className="text-sm font-medium text-muted-foreground">
                {ui.selectedValueLabel}
              </label>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">{sliderValue}</span>
                <span className="text-sm font-medium text-muted-foreground">mg/dL</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSliderValue((prev) => Math.max(SLIDER_MIN, prev - 10))}
                className={stepButtonClass}
                aria-label={ui.stepMinusAria}
              >
                -10
              </button>
              <button type="button" onClick={() => setSliderValue(85)} className={stepButtonClass} aria-label={ui.stepNormalAria}>
                {ui.stepNormalLabel}
              </button>
              <button
                type="button"
                onClick={() => setSliderValue((prev) => Math.min(SLIDER_MAX, prev + 10))}
                className={stepButtonClass}
                aria-label={ui.stepPlusAria}
              >
                +10
              </button>
            </div>
          </div>

          <div>
            <input
              id="glucose-level-slider"
              type="range"
              min={SLIDER_MIN}
              max={SLIDER_MAX}
              step={1}
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              aria-valuemin={SLIDER_MIN}
              aria-valuemax={SLIDER_MAX}
              aria-valuenow={sliderValue}
              aria-valuetext={ui.valueText.replace("{value}", String(sliderValue)).replace("{label}", interpretation.label)}
              className="h-2 w-full cursor-pointer accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
            />
            <div className="relative mt-2 h-4 text-xs tabular-nums text-muted-foreground" aria-hidden="true">
              <span className="absolute left-0 hidden sm:inline">{SLIDER_MIN}</span>
              {ZONE_TICKS.map((v) => (
                <span key={v} className="absolute -translate-x-1/2" style={{ left: `${pct(v)}%` }}>
                  {v}
                </span>
              ))}
              <span className="absolute right-0">{SLIDER_MAX}</span>
            </div>
            {/* Zone strip: five ranges on the same scale as the slider; the active one is inked and named. */}
            <div className="relative mt-3 h-1 w-full" aria-hidden="true">
              {ZONE_RANGES.map(([from, to], i) => (
                <span
                  key={from}
                  className={`absolute inset-y-0 rounded-full transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] ${
                    i === activeZone ? "bg-foreground" : "bg-border"
                  }`}
                  style={{ left: `calc(${pct(from)}% + 1px)`, width: `calc(${pct(to) - pct(from)}% - 2px)` }}
                />
              ))}
            </div>
            <div className="relative mt-1.5 h-5 text-xs font-semibold text-foreground" aria-hidden="true">
              <span className="absolute whitespace-nowrap" style={zoneLabelStyle}>
                {ui.zoneNames[activeZone]}
              </span>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-5" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-base font-semibold text-foreground">
                {ui.physioReactionTitle} {sliderValue} mg/dL
              </span>
              <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold text-foreground ${interpretation.toneClass}`}>
                {interpretation.label}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <h5 className="text-sm font-semibold text-foreground">{ui.symptomsHeading}</h5>
                <p className="text-sm leading-relaxed text-muted-foreground">{interpretation.symptoms}</p>
              </div>

              <div className="space-y-1">
                <h5 className="text-sm font-semibold text-foreground">{ui.guidanceHeading}</h5>
                <p className="text-sm leading-relaxed text-muted-foreground">{interpretation.guidance}</p>
              </div>
            </div>

            {/* 15/15 rule for hypoglycaemia, 112 for severe hyperglycaemia */}
            {interpretation.emergencyRule && (
              <div className="space-y-1.5 border-t border-border pt-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <AlertCircleIcon className="h-4 w-4 shrink-0" />
                  {ui.emergencyActionHeading}
                </div>
                <p className="text-sm leading-relaxed text-foreground">{interpretation.emergencyRule}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
