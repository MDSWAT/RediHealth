export interface RomanesGlossaryTerm {
  id: string;
  romanianTerm: string;
  romanesTerm: string;
  category: "cardiologie" | "general" | "simptome" | "anatomie" | "tratamente";
  categoryLabel: string;
  explanation: string;
  /** Explanation for readers on the English, Albanian and Italian pages. */
  explanationByLang?: Partial<Record<"en" | "sq" | "it", string>>;
  phoneticPronunciation: string;
  audioPronunciationText: string;
}

export const ROMANES_GLOSSARY_TERMS: RomanesGlossaryTerm[] = [
  {
    id: "tensiune-arteriala",
    romanianTerm: "Tensiune arterială (hipertensiune)",
    romanesTerm: "O rat phurdel zurales",
    category: "cardiologie",
    categoryLabel: "Inimă și circulație",
    explanation:
      "Sângele apasă prea tare pe vasele de sânge. Inima trebuie să muncească mai greu.",
    explanationByLang: {
      en: "Your blood pushes too hard on your blood vessels. Your heart has to work harder.",
      sq: "Gjaku shtyp shumë fort mbi enët e gjakut. Zemra duhet të punojë më shumë.",
      it: "Il sangue spinge troppo forte sulle vene e sulle arterie. Il cuore deve lavorare di più.",
    },
    phoneticPronunciation: "O rat phur-del zu-ra-les",
    audioPronunciationText: "O rat phurdel zurales. Tensiune mare a sângelui.",
  },
  {
    id: "inima",
    romanianTerm: "Inimă",
    romanesTerm: "O ilo",
    category: "anatomie",
    categoryLabel: "Corpul",
    explanation:
      "Organul din piept care bate zi și noapte. Trimite sânge în tot corpul.",
    explanationByLang: {
      en: "The organ in your chest that beats day and night. It sends blood to your whole body.",
      sq: "Organi në gjoks që rreh ditë e natë. Dërgon gjak në gjithë trupin.",
      it: "L'organo nel petto che batte giorno e notte. Manda il sangue in tutto il corpo.",
    },
    phoneticPronunciation: "O i-lo",
    audioPronunciationText: "O ilo. Inima.",
  },
  {
    id: "sange",
    romanianTerm: "Sânge",
    romanesTerm: "O rat",
    category: "anatomie",
    categoryLabel: "Corpul",
    explanation:
      "Lichidul roșu din corp. Duce hrana și aerul la toate organele.",
    explanationByLang: {
      en: "The red liquid in your body. It carries food and air to all your organs.",
      sq: "Lëngu i kuq në trup. Çon ushqimin dhe ajrin te të gjitha organet.",
      it: "Il liquido rosso del corpo. Porta cibo e aria a tutti gli organi.",
    },
    phoneticPronunciation: "O rat",
    audioPronunciationText: "O rat. Sângele.",
  },
  {
    id: "diabet",
    romanianTerm: "Diabet (zahăr mare în sânge)",
    romanesTerm: "Gudlo rat (zahăr în sânge)",
    category: "general",
    categoryLabel: "Boli",
    explanation:
      "Corpul nu poate folosi zahărul din mâncare, așa că zahărul rămâne în sânge. Simți sete mare și oboseală.",
    explanationByLang: {
      en: "Your body cannot use the sugar from food, so the sugar stays in your blood. You feel very thirsty and tired.",
      sq: "Trupi nuk e përdor dot sheqerin nga ushqimi, ndaj sheqeri mbetet në gjak. Ke shumë etje dhe je i lodhur.",
      it: "Il corpo non riesce a usare lo zucchero del cibo, così lo zucchero resta nel sangue. Hai molta sete e ti senti stanco.",
    },
    phoneticPronunciation: "Gud-lo rat",
    audioPronunciationText: "Gudlo rat. Zahăr în sânge.",
  },
  {
    id: "durere",
    romanianTerm: "Durere",
    romanesTerm: "I dukh",
    category: "simptome",
    categoryLabel: "Simptome și semne",
    explanation:
      "Semnul prin care corpul îți arată că ceva e rănit sau nu merge bine.",
    explanationByLang: {
      en: "Your body's way of telling you that something is hurt or not working well.",
      sq: "Mënyra si trupi të tregon që diçka është lënduar ose nuk shkon mirë.",
      it: "Il modo in cui il corpo ti dice che qualcosa è ferito o non va bene.",
    },
    phoneticPronunciation: "I dukh",
    audioPronunciationText: "I dukh. Durerea.",
  },
  {
    id: "febra",
    romanianTerm: "Febră (temperatură)",
    romanesTerm: "O tato / Tatipen",
    category: "simptome",
    categoryLabel: "Simptome și semne",
    explanation:
      "Corpul se încălzește ca să lupte cu o răceală sau cu o infecție.",
    explanationByLang: {
      en: "Your body heats up to fight a cold or an infection.",
      sq: "Trupi nxehet që të luftojë një ftohje ose një infeksion.",
      it: "Il corpo si scalda per combattere un raffreddore o un'infezione.",
    },
    phoneticPronunciation: "Ta-ti-pen",
    audioPronunciationText: "Tatipen. Temperatura sau febra.",
  },
  {
    id: "medicament",
    romanianTerm: "Medicament (pastilă)",
    romanesTerm: "I drab",
    category: "tratamente",
    categoryLabel: "Tratament",
    explanation:
      "Ce îți dă medicul pe rețetă ca să tratezi boala sau să oprești durerea.",
    explanationByLang: {
      en: "What the doctor gives you on a prescription to treat an illness or stop pain.",
      sq: "Ajo që të jep mjeku me recetë për të shëruar sëmundjen ose për të ndalur dhimbjen.",
      it: "Quello che il medico ti dà con la ricetta per curare la malattia o fermare il dolore.",
    },
    phoneticPronunciation: "I drab",
    audioPronunciationText: "I drab. Medicamentul sau leacul.",
  },
  {
    id: "medic",
    romanianTerm: "Medic (doctor)",
    romanesTerm: "O doktori / O drabari",
    category: "general",
    categoryLabel: "Personal medical",
    explanation:
      "Omul care a învățat să afle ce boală ai. Îți spune ce tratament să urmezi.",
    explanationByLang: {
      en: "The person trained to find out what illness you have. They tell you which treatment to follow.",
      sq: "Personi që ka mësuar të gjejë se çfarë sëmundje ke. Të thotë çfarë mjekimi të ndjekësh.",
      it: "La persona che ha studiato per capire che malattia hai. Ti dice quale cura seguire.",
    },
    phoneticPronunciation: "O dok-to-ri",
    audioPronunciationText: "O doktori. Medicul.",
  },
  {
    id: "spital",
    romanianTerm: "Spital",
    romanesTerm: "I bolnitsa",
    category: "general",
    categoryLabel: "Unde mergi",
    explanation:
      "Locul unde mergi când boala e gravă sau când ai nevoie de ajutor urgent.",
    explanationByLang: {
      en: "Where you go when an illness is serious or you need help fast.",
      sq: "Vendi ku shkon kur sëmundja është e rëndë ose kur të duhet ndihmë urgjente.",
      it: "Il posto dove vai quando la malattia è grave o ti serve aiuto urgente.",
    },
    phoneticPronunciation: "I bol-nit-sa",
    audioPronunciationText: "I bolnitsa. Spitalul.",
  },
  {
    id: "respiratie-greoaie",
    romanianTerm: "Respirație greoaie (lipsă de aer)",
    romanesTerm: "Phari phurdinimos",
    category: "simptome",
    categoryLabel: "Simptome și semne",
    explanation:
      "Simți că nu intră destul aer în piept, mai ales când faci efort sau stai întins.",
    explanationByLang: {
      en: "You feel that not enough air gets into your chest, especially when you move or lie down.",
      sq: "Ndien që nuk të hyn mjaft ajër në gjoks, sidomos kur lodhesh ose kur rri shtrirë.",
      it: "Senti che non entra abbastanza aria nel petto, soprattutto quando fai fatica o sei sdraiato.",
    },
    phoneticPronunciation: "Pha-ri phur-di-ni-mos",
    audioPronunciationText: "Phari phurdinimos. Respirație grea.",
  },
  {
    id: "ametela",
    romanianTerm: "Amețeală",
    romanesTerm: "O shero phirel (capul se învârte)",
    category: "simptome",
    categoryLabel: "Simptome și semne",
    explanation:
      "Simți că totul se învârte în jurul tău sau că îți pierzi echilibrul când te ridici.",
    explanationByLang: {
      en: "You feel everything is spinning around you, or you lose your balance when you stand up.",
      sq: "Ndien sikur gjithçka rrotullohet rreth teje, ose humbet ekuilibrin kur ngrihesh.",
      it: "Senti che tutto gira intorno a te o perdi l'equilibrio quando ti alzi.",
    },
    phoneticPronunciation: "O she-ro phi-rel",
    audioPronunciationText: "O shero phirel. Amețeală.",
  },
  {
    id: "analize-sange",
    romanianTerm: "Analize de sânge",
    romanesTerm: "Rengro dikhiben",
    category: "tratamente",
    categoryLabel: "Analize",
    explanation:
      "Ți se ia puțin sânge din deget sau din braț. Rezultatul îi arată medicului ce se întâmplă în corp.",
    explanationByLang: {
      en: "A little blood is taken from your finger or arm. The result shows the doctor what is happening in your body.",
      sq: "Të marrin pak gjak nga gishti ose nga krahu. Rezultati i tregon mjekut çfarë ndodh në trup.",
      it: "Ti prendono un po' di sangue dal dito o dal braccio. Il risultato mostra al medico cosa succede nel corpo.",
    },
    phoneticPronunciation: "Ren-gro di-khi-ben",
    audioPronunciationText: "Rengro dikhiben. Analiza sângelui.",
  },
  {
    id: "sarcina",
    romanianTerm: "Sarcină (femeie însărcinată)",
    romanesTerm: "I khabni romni",
    category: "general",
    categoryLabel: "Sănătatea mamei",
    explanation:
      "Cele 9 luni în care copilul crește în burta mamei, până la naștere.",
    explanationByLang: {
      en: "The 9 months when the baby grows in the mother's belly, until birth.",
      sq: "9 muajt kur fëmija rritet në barkun e nënës, deri në lindje.",
      it: "I 9 mesi in cui il bambino cresce nella pancia della mamma, fino alla nascita.",
    },
    phoneticPronunciation: "I khab-ni rom-ni",
    audioPronunciationText: "I khabni romni. Femeie însărcinată.",
  },
  {
    id: "vaccin",
    romanianTerm: "Vaccin (imunizare)",
    romanesTerm: "O chikat / I drab e cioranengo",
    category: "tratamente",
    categoryLabel: "Prevenție",
    explanation:
      "O înțepătură mică. Învață corpul, la copii și la adulți, să se apere de boli grele.",
    explanationByLang: {
      en: "A small injection. It teaches the body, in children and adults, to defend itself against serious illness.",
      sq: "Një shpim i vogël. I mëson trupit, te fëmijët dhe te të rriturit, të mbrohet nga sëmundje të rënda.",
      it: "Una piccola puntura. Insegna al corpo, nei bambini e negli adulti, a difendersi da malattie gravi.",
    },
    phoneticPronunciation: "O chi-kat",
    audioPronunciationText: "O chikat. Vaccinul de protecție.",
  },
  {
    id: "urgenta",
    romanianTerm: "Urgență medicală (112)",
    romanesTerm: "I barvali sigardiari (nevoie grabnică)",
    category: "simptome",
    categoryLabel: "Urgențe",
    explanation:
      "Viața cuiva e în pericol. Sună imediat la 112.",
    explanationByLang: {
      en: "Someone's life is in danger. Call 112 now.",
      sq: "Jeta e dikujt është në rrezik. Telefono menjëherë në 112.",
      it: "La vita di qualcuno è in pericolo. Chiama subito il 112.",
    },
    phoneticPronunciation: "Si-gar-di-a-ri",
    audioPronunciationText: "Sigardiari. Urgență medicală.",
  },
];
