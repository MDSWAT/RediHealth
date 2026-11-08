import type { Lang } from "@/lib/i18n/translations";

export type AgeBracketId = "18-39" | "40-49" | "50-69" | "70+";
export type SexFilterId = "all" | "female" | "male";
export type InvestigationGlyph = "stethoscope" | "blood" | "ribbon" | "sample" | "heart" | "eye";

export interface ScreeningInvestigation {
  id: string;
  glyph: InvestigationGlyph;
  ageBrackets: AgeBracketId[];
  applicableSex: SexFilterId;
  title: string;
  frequency: string;
  cnasBadge: string;
  preparation: string;
  earlyBenefit: string;
  doctorQuestion: string;
}

export interface EarlyDetectionStep {
  stepNumber: string;
  title: string;
  description: string;
}

export interface ScreeningSelectorCopy {
  sectionTitle: string;
  sectionSubtitle: string;
  filterAgeLabel: string;
  filterSexLabel: string;
  ageOptions: Record<AgeBracketId, string>;
  sexOptions: Record<SexFilterId, string>;
  tabRecommendations: string;
  tabTimeline: string;
  tabChecklist: string;
  noResultsMessage: string;
  frequencyLabel: string;
  cnasLabel: string;
  preparationLabel: string;
  earlyBenefitLabel: string;
  doctorQuestionLabel: string;
  checklistTitle: string;
  checklistSubtitle: string;
  checklistCounter: string;
  checklistEmpty: string;
  printChecklistButton: string;
  audioNarrationPrefix: string;
  listenInvestigationLabel: string;
  timelineTitle: string;
  timelineSubtitle: string;
  timelineSteps: EarlyDetectionStep[];
  /** DOM labels placed on the early-detection diagram. */
  sceneLabels: {
    symptoms: string;
    check: string;
    foundEarly: string;
    untreated: string;
    treated: string;
    time: string;
  };
  investigations: ScreeningInvestigation[];
}

export const SCREENING_RECOMMENDATIONS: Record<Lang, ScreeningSelectorCopy> = {
  ro: {
    sectionTitle: "Ce controale ți se potrivesc",
    sectionSubtitle:
      "Alege vârsta și vezi ce controale poți face gratuit sau decontat de CNAS.",
    filterAgeLabel: "Vârsta",
    filterSexLabel: "Pentru cine",
    ageOptions: {
      "18-39": "18–39 ani",
      "40-49": "40–49 ani",
      "50-69": "50–69 ani",
      "70+": "70+ ani",
    },
    sexOptions: {
      all: "Toți adulții",
      female: "Femei",
      male: "Bărbați",
    },
    tabRecommendations: "Controale recomandate",
    tabTimeline: "De ce ajută",
    tabChecklist: "Lista mea",
    noResultsMessage: "Nu am găsit controale pentru ce ai ales.",
    frequencyLabel: "Cât de des",
    cnasLabel: "Cât costă",
    preparationLabel: "Cum te pregătești",
    earlyBenefitLabel: "De ce ajută",
    doctorQuestionLabel: "Ce întrebi medicul",
    checklistTitle: "Lista mea pentru medic",
    checklistSubtitle:
      "Bifează controalele făcute sau pe cele despre care vrei să vorbești cu medicul.",
    checklistCounter: "{completed} din {total} bifate",
    checklistEmpty:
      "Nu ai bifat nimic încă. Alege vârsta și bifează controalele care te interesează.",
    printChecklistButton: "Tipărește lista",
    audioNarrationPrefix: "Controale preventive.",
    listenInvestigationLabel: "Ascultă detaliile",
    timelineTitle: "Cum ajută controalele făcute din timp",
    timelineSubtitle:
      "Un control simplu poate găsi o problemă înainte să devină gravă.",
    sceneLabels: {
      symptoms: "Apar simptomele",
      check: "Control",
      foundEarly: "Depistare timpurie",
      untreated: "Fără control",
      treated: "Tratament la timp",
      time: "Timp",
    },
    timelineSteps: [
      {
        stepNumber: "01",
        title: "Te simți bine",
        description:
          "Multe boli nu dor la început. Te simți bine și nu observi nimic.",
      },
      {
        stepNumber: "02",
        title: "Faci un control scurt",
        description:
          "O analiză de sânge, tensiunea sau un test Babeș-Papanicolau durează câteva minute la medicul de familie.",
      },
      {
        stepNumber: "03",
        title: "Se găsește o schimbare mică",
        description:
          "Testul găsește schimbări mici cu ani înainte să apară durerea sau boala gravă.",
      },
      {
        stepNumber: "04",
        title: "Tratamentul e mai ușor",
        description:
          "O problemă găsită devreme se tratează mai ușor și are cele mai mari șanse de vindecare.",
      },
    ],
    investigations: [
      {
        id: "checkup-annual-all",
        glyph: "stethoscope",
        ageBrackets: ["18-39", "40-49", "50-69", "70+"],
        applicableSex: "all",
        title: "Control anual la medicul de familie",
        frequency: "O dată pe an",
        cnasBadge: "Gratuit 100% prin CNAS, cu sau fără asigurare",
        preparation: "Nu trebuie să te pregătești. Fă-ți o programare la cabinet.",
        earlyBenefit:
          "Medicul îți verifică tensiunea, greutatea, inima și obiceiurile, înainte să apară o boală.",
        doctorQuestion: "Ce boli din familia mea trebuie să urmăresc?",
      },
      {
        id: "blood-panel-18-39",
        glyph: "blood",
        ageBrackets: ["18-39"],
        applicableSex: "all",
        title: "Analize de sânge de rutină (hemoleucogramă, glicemie, colesterol)",
        frequency: "O dată la 3 ani, sau mai des dacă ai risc",
        cnasBadge: "Decontat 100% de CNAS, cu bilet de trimitere",
        preparation: "Dimineața, pe nemâncate. Poți bea apă plată.",
        earlyBenefit:
          "Arată din timp anemia, zahărul crescut în sânge (prediabet) și colesterolul mare.",
        doctorQuestion: "Analizele mele sunt bune pentru vârsta mea?",
      },
      {
        id: "cervical-pap-hpv",
        glyph: "ribbon",
        ageBrackets: ["18-39", "40-49", "50-69"],
        applicableSex: "female",
        title: "Testul pentru colul uterin (Babeș-Papanicolau sau HPV)",
        frequency: "La 3 ani (Babeș-Papanicolau) sau la 5 ani (HPV)",
        cnasBadge: "Gratuit prin Programul Național de Screening",
        preparation: "Cu 48 de ore înainte, fără sex și fără ovule sau creme vaginale.",
        earlyBenefit:
          "Găsește celule schimbate cu mulți ani înainte să devină cancer.",
        doctorQuestion: "Ce test e mai bun pentru mine, Babeș-Papanicolau sau HPV?",
      },
      {
        id: "cardio-metabolic-40",
        glyph: "heart",
        ageBrackets: ["40-49", "50-69"],
        applicableSex: "all",
        title: "Controlul inimii și al zahărului (SCORE2, glicemie, colesterol)",
        frequency: "O dată pe an",
        cnasBadge: "Decontat de CNAS, prin medicul de familie",
        preparation:
          "Vii pe nemâncate la analize. Stai liniștit 10 minute înainte să ți se ia tensiunea.",
        earlyBenefit:
          "Ce faci din timp te ajută să previi infarctul și accidentul vascular cerebral (AVC).",
        doctorQuestion: "Cât de mare e riscul meu pentru inimă în următorii 10 ani?",
      },
      {
        id: "breast-ultrasound-mammography",
        glyph: "ribbon",
        ageBrackets: ["40-49"],
        applicableSex: "female",
        title: "Consult și ecografie la sâni",
        frequency: "O dată pe an",
        cnasBadge: "Decontat de CNAS, cu trimitere de la medic",
        preparation: "Cel mai bine în primele 10 zile după ce începe menstruația.",
        earlyBenefit: "Găsește noduli mici înainte să-i poți simți cu mâna.",
        doctorQuestion: "Când ar trebui să încep mamografia?",
      },
      {
        id: "mammography-screening-50-69",
        glyph: "ribbon",
        ageBrackets: ["50-69"],
        applicableSex: "female",
        title: "Mamografie de screening (ambii sâni)",
        frequency: "O dată la 2 ani",
        cnasBadge: "Gratuit prin Programul Național de Screening",
        preparation: "În ziua testului nu pune deodorant, cremă sau pudră la subraț.",
        earlyBenefit:
          "Găsește schimbări de câțiva milimetri, când șansele de vindecare sunt cele mai mari.",
        doctorQuestion: "Unde e cel mai apropiat centru care face mamografie de screening?",
      },
      {
        id: "colorectal-fit-test",
        glyph: "sample",
        ageBrackets: ["50-69"],
        applicableSex: "all",
        title: "Testul pentru cancerul de colon (FIT, din scaun)",
        frequency: "O dată la 1–2 ani",
        cnasBadge: "Gratuit prin medicul de familie și centrele ROCCAS",
        preparation:
          "Iei o probă de scaun acasă, cu un kit simplu. Nu ții regim.",
        earlyBenefit:
          "Găsește polipi mici sau sânge ascuns în scaun, cu mult înainte să apară cancerul.",
        doctorQuestion: "Cum folosesc corect kitul FIT de la cabinet?",
      },
      {
        id: "prostate-risk-men-50",
        glyph: "blood",
        ageBrackets: ["50-69", "70+"],
        applicableSex: "male",
        title: "Controlul prostatei (analiza PSA și consult, dacă e nevoie)",
        frequency: "Când îți recomandă medicul de familie",
        cnasBadge: "Decontat de CNAS, cu bilet de trimitere",
        preparation: "Cu 48 de ore înainte de analiză, nu merge pe bicicletă și evită ejacularea.",
        earlyBenefit:
          "Ajută medicul să deosebească din timp o prostată mărită benign de o problemă mai serioasă.",
        doctorQuestion: "Am nevoie de analiza PSA?",
      },
      {
        id: "senior-frailty-sensory-70",
        glyph: "eye",
        ageBrackets: ["70+"],
        applicableSex: "all",
        title: "Control pentru vârstnici (auz, vedere, mers, risc de cădere)",
        frequency: "O dată pe an",
        cnasBadge: "Gratuit 100% prin CNAS, la medicul de familie",
        preparation: "Ia cu tine ochelarii și lista cu toate medicamentele pe care le iei.",
        earlyBenefit: "Te ajută să rămâi independent și să eviți căderile și fracturile.",
        doctorQuestion: "Ce exerciții ușoare pot face acasă pentru echilibru?",
      },
    ],
  },
  en: {
    sectionTitle: "Which checkups are right for you",
    sectionSubtitle:
      "Pick your age and see which checkups you can get free or covered by CNAS.",
    filterAgeLabel: "Age",
    filterSexLabel: "Who is it for",
    ageOptions: {
      "18-39": "18–39 years",
      "40-49": "40–49 years",
      "50-69": "50–69 years",
      "70+": "70+ years",
    },
    sexOptions: {
      all: "All adults",
      female: "Women",
      male: "Men",
    },
    tabRecommendations: "Recommended checks",
    tabTimeline: "Why it helps",
    tabChecklist: "My list",
    noResultsMessage: "No checkups match what you picked.",
    frequencyLabel: "How often",
    cnasLabel: "Cost",
    preparationLabel: "How to prepare",
    earlyBenefitLabel: "Why it helps",
    doctorQuestionLabel: "What to ask your doctor",
    checklistTitle: "My list for the doctor",
    checklistSubtitle:
      "Tick the checkups you have had or want to talk about with your doctor.",
    checklistCounter: "{completed} of {total} ticked",
    checklistEmpty:
      "Nothing ticked yet. Pick your age and tick the checkups you want.",
    printChecklistButton: "Print the list",
    audioNarrationPrefix: "Preventive checkups.",
    listenInvestigationLabel: "Listen to the details",
    timelineTitle: "How early checkups help",
    timelineSubtitle:
      "A simple checkup can find a problem before it gets serious.",
    sceneLabels: {
      symptoms: "Symptoms appear",
      check: "Check-up",
      foundEarly: "Found early",
      untreated: "Without a check-up",
      treated: "Treated early",
      time: "Time",
    },
    timelineSteps: [
      {
        stepNumber: "01",
        title: "You feel fine",
        description:
          "Many illnesses do not hurt at first. You feel well and notice nothing.",
      },
      {
        stepNumber: "02",
        title: "You have a short checkup",
        description:
          "A blood test, a blood pressure check or a Pap test takes a few minutes at your family doctor.",
      },
      {
        stepNumber: "03",
        title: "A small change is found",
        description:
          "The test finds small changes years before they cause pain or serious illness.",
      },
      {
        stepNumber: "04",
        title: "Treatment is easier",
        description:
          "A problem found early is easier to treat and has the best chance of a cure.",
      },
    ],
    investigations: [
      {
        id: "checkup-annual-all",
        glyph: "stethoscope",
        ageBrackets: ["18-39", "40-49", "50-69", "70+"],
        applicableSex: "all",
        title: "Yearly checkup with your family doctor",
        frequency: "Once a year",
        cnasBadge: "100% free through CNAS, with or without insurance",
        preparation: "You don't need to prepare. Book an appointment at the clinic.",
        earlyBenefit:
          "The doctor checks your blood pressure, weight, heart and habits before an illness starts.",
        doctorQuestion: "Which illnesses in my family should I watch for?",
      },
      {
        id: "blood-panel-18-39",
        glyph: "blood",
        ageBrackets: ["18-39"],
        applicableSex: "all",
        title: "Routine blood tests (blood count, blood sugar, cholesterol)",
        frequency: "Every 3 years, or more often if you are at risk",
        cnasBadge: "100% covered by CNAS with a referral",
        preparation: "In the morning, before you eat. You can drink plain water.",
        earlyBenefit:
          "Shows anemia, high blood sugar (prediabetes) and high cholesterol early.",
        doctorQuestion: "Are my results normal for my age?",
      },
      {
        id: "cervical-pap-hpv",
        glyph: "ribbon",
        ageBrackets: ["18-39", "40-49", "50-69"],
        applicableSex: "female",
        title: "Cervical test (Pap or HPV)",
        frequency: "Every 3 years (Pap) or 5 years (HPV)",
        cnasBadge: "Free through the national screening program",
        preparation: "For 48 hours before, no sex and no vaginal creams or pessaries.",
        earlyBenefit: "Finds changed cells many years before they can turn into cancer.",
        doctorQuestion: "Which test is better for me, Pap or HPV?",
      },
      {
        id: "cardio-metabolic-40",
        glyph: "heart",
        ageBrackets: ["40-49", "50-69"],
        applicableSex: "all",
        title: "Heart and blood sugar check (SCORE2, blood sugar, cholesterol)",
        frequency: "Once a year",
        cnasBadge: "Covered by CNAS through your family doctor",
        preparation:
          "Don't eat before the blood tests. Sit quietly for 10 minutes before your blood pressure is taken.",
        earlyBenefit: "Acting early helps prevent heart attack and stroke.",
        doctorQuestion: "How high is my risk of heart disease in the next 10 years?",
      },
      {
        id: "breast-ultrasound-mammography",
        glyph: "ribbon",
        ageBrackets: ["40-49"],
        applicableSex: "female",
        title: "Breast exam and ultrasound",
        frequency: "Once a year",
        cnasBadge: "Covered by CNAS with a referral",
        preparation: "Best in the first 10 days after your period starts.",
        earlyBenefit: "Finds small lumps before you can feel them.",
        doctorQuestion: "When should I start having mammograms?",
      },
      {
        id: "mammography-screening-50-69",
        glyph: "ribbon",
        ageBrackets: ["50-69"],
        applicableSex: "female",
        title: "Screening mammogram (both breasts)",
        frequency: "Every 2 years",
        cnasBadge: "Free through the national screening program",
        preparation: "On the day, don't put deodorant, cream or powder under your arms.",
        earlyBenefit:
          "Finds changes a few millimeters wide, when the chance of a cure is highest.",
        doctorQuestion: "Where is the nearest center that does screening mammograms?",
      },
      {
        id: "colorectal-fit-test",
        glyph: "sample",
        ageBrackets: ["50-69"],
        applicableSex: "all",
        title: "Bowel cancer test (FIT, stool sample)",
        frequency: "Every 1–2 years",
        cnasBadge: "Free through your family doctor and ROCCAS centers",
        preparation: "You take a stool sample at home with a simple kit. No special diet.",
        earlyBenefit: "Finds small polyps or hidden blood in stool long before cancer develops.",
        doctorQuestion: "How do I use the FIT kit from the clinic correctly?",
      },
      {
        id: "prostate-risk-men-50",
        glyph: "blood",
        ageBrackets: ["50-69", "70+"],
        applicableSex: "male",
        title: "Prostate check (PSA blood test and exam if needed)",
        frequency: "When your family doctor advises it",
        cnasBadge: "Covered by CNAS with a referral",
        preparation: "For 48 hours before the blood test, no cycling and no ejaculation.",
        earlyBenefit: "Helps the doctor tell a harmless enlarged prostate from something more serious.",
        doctorQuestion: "Do I need a PSA test?",
      },
      {
        id: "senior-frailty-sensory-70",
        glyph: "eye",
        ageBrackets: ["70+"],
        applicableSex: "all",
        title: "Checkup for older people (hearing, sight, walking, falls)",
        frequency: "Once a year",
        cnasBadge: "100% free through CNAS at your family doctor",
        preparation: "Bring your glasses and a list of all the medicines you take.",
        earlyBenefit: "Helps you stay independent and avoid falls and broken bones.",
        doctorQuestion: "Which easy exercises can I do at home for balance?",
      },
    ],
  },
  sq: {
    sectionTitle: "Cilat kontrolle të përshtaten",
    sectionSubtitle:
      "Zgjidh moshën dhe shiko cilat kontrolle mund t'i bësh falas ose të mbuluara nga CNAS.",
    filterAgeLabel: "Mosha",
    filterSexLabel: "Për kë",
    ageOptions: {
      "18-39": "18–39 vjeç",
      "40-49": "40–49 vjeç",
      "50-69": "50–69 vjeç",
      "70+": "70+ vjeç",
    },
    sexOptions: {
      all: "Të gjithë të rriturit",
      female: "Gra",
      male: "Burra",
    },
    tabRecommendations: "Kontrollet e rekomanduara",
    tabTimeline: "Pse ndihmon",
    tabChecklist: "Lista ime",
    noResultsMessage: "Nuk gjetëm kontrolle për atë që zgjodhe.",
    frequencyLabel: "Sa shpesh",
    cnasLabel: "Sa kushton",
    preparationLabel: "Si të përgatitesh",
    earlyBenefitLabel: "Pse ndihmon",
    doctorQuestionLabel: "Çfarë të pyesësh mjekun",
    checklistTitle: "Lista ime për mjekun",
    checklistSubtitle:
      "Shëno kontrollet që ke bërë ose për të cilat do të flasësh me mjekun.",
    checklistCounter: "{completed} nga {total} të shënuara",
    checklistEmpty:
      "Nuk ke shënuar asgjë ende. Zgjidh moshën dhe shëno kontrollet që të interesojnë.",
    printChecklistButton: "Printo listën",
    audioNarrationPrefix: "Kontrollet parandaluese.",
    listenInvestigationLabel: "Dëgjo detajet",
    timelineTitle: "Si ndihmojnë kontrollet e bëra me kohë",
    timelineSubtitle:
      "Një kontroll i thjeshtë mund të gjejë një problem para se të rëndohet.",
    sceneLabels: {
      symptoms: "Shfaqen simptomat",
      check: "Kontroll",
      foundEarly: "Zbulohet herët",
      untreated: "Pa kontroll",
      treated: "Trajtohet në kohë",
      time: "Koha",
    },
    timelineSteps: [
      {
        stepNumber: "01",
        title: "Ndihesh mirë",
        description:
          "Shumë sëmundje nuk dhembin në fillim. Ndihesh mirë dhe nuk vëren asgjë.",
      },
      {
        stepNumber: "02",
        title: "Bën një kontroll të shkurtër",
        description:
          "Një analizë gjaku, matja e tensionit ose testi Pap zgjasin pak minuta te mjeku i familjes.",
      },
      {
        stepNumber: "03",
        title: "Gjendet një ndryshim i vogël",
        description:
          "Testi gjen ndryshime të vogla vite para se të sjellin dhimbje ose sëmundje të rëndë.",
      },
      {
        stepNumber: "04",
        title: "Trajtimi është më i lehtë",
        description:
          "Një problem i gjetur herët trajtohet më lehtë dhe ka shanset më të mira për shërim.",
      },
    ],
    investigations: [
      {
        id: "checkup-annual-all",
        glyph: "stethoscope",
        ageBrackets: ["18-39", "40-49", "50-69", "70+"],
        applicableSex: "all",
        title: "Kontroll vjetor te mjeku i familjes",
        frequency: "Një herë në vit",
        cnasBadge: "Falas 100% nga CNAS, me ose pa sigurim",
        preparation: "Nuk ke nevojë të përgatitesh. Lër një takim te mjeku.",
        earlyBenefit:
          "Mjeku të kontrollon tensionin, peshën, zemrën dhe zakonet, para se të vijë një sëmundje.",
        doctorQuestion: "Cilat sëmundje në familjen time duhet të ndjek?",
      },
      {
        id: "blood-panel-18-39",
        glyph: "blood",
        ageBrackets: ["18-39"],
        applicableSex: "all",
        title: "Analizat e zakonshme të gjakut (hemogramë, sheqeri, kolesteroli)",
        frequency: "Çdo 3 vjet, ose më shpesh nëse ke rrezik",
        cnasBadge: "E mbuluar 100% nga CNAS, me rekomandim nga mjeku",
        preparation: "Në mëngjes, pa ngrënë. Mund të pish ujë të thjeshtë.",
        earlyBenefit: "Zbulon herët aneminë, sheqerin e lartë në gjak (paradiabetin) dhe kolesterolin e lartë.",
        doctorQuestion: "A janë analizat e mia normale për moshën time?",
      },
      {
        id: "cervical-pap-hpv",
        glyph: "ribbon",
        ageBrackets: ["18-39", "40-49", "50-69"],
        applicableSex: "female",
        title: "Testi i qafës së mitrës (Pap ose HPV)",
        frequency: "Çdo 3 vjet (Pap) ose çdo 5 vjet (HPV)",
        cnasBadge: "Falas përmes programit kombëtar të depistimit",
        preparation: "48 orë para testit, pa marrëdhënie seksuale dhe pa kremra ose ovula vaginale.",
        earlyBenefit: "Gjen qeliza të ndryshuara shumë vite para se të bëhen kancer.",
        doctorQuestion: "Cili test është më i mirë për mua, Pap apo HPV?",
      },
      {
        id: "cardio-metabolic-40",
        glyph: "heart",
        ageBrackets: ["40-49", "50-69"],
        applicableSex: "all",
        title: "Kontrolli i zemrës dhe i sheqerit (SCORE2, sheqeri, kolesteroli)",
        frequency: "Një herë në vit",
        cnasBadge: "I mbuluar nga CNAS, përmes mjekut të familjes",
        preparation: "Mos ha para analizave. Rri ulur e qetë 10 minuta para se të të matin tensionin.",
        earlyBenefit: "Kur vepron herët, ndihmon të parandalosh infarktin dhe goditjen në tru.",
        doctorQuestion: "Sa i madh është rreziku im për zemrën në 10 vitet e ardhshme?",
      },
      {
        id: "breast-ultrasound-mammography",
        glyph: "ribbon",
        ageBrackets: ["40-49"],
        applicableSex: "female",
        title: "Vizitë dhe ekografi e gjirit",
        frequency: "Një herë në vit",
        cnasBadge: "E mbuluar nga CNAS, me rekomandim nga mjeku",
        preparation: "Më mirë në 10 ditët e para pasi fillojnë menstruacionet.",
        earlyBenefit:
          "Gjen gunga të vogla para se t'i ndjesh me dorë.",
        doctorQuestion: "Kur duhet të filloj mamografinë?",
      },
      {
        id: "mammography-screening-50-69",
        glyph: "ribbon",
        ageBrackets: ["50-69"],
        applicableSex: "female",
        title: "Mamografi kontrolli (të dy gjinjtë)",
        frequency: "Një herë në 2 vjet",
        cnasBadge: "Falas përmes programit kombëtar të depistimit",
        preparation: "Atë ditë mos vër deodorant, krem ose pudër nën sqetulla.",
        earlyBenefit: "Gjen ndryshime prej disa milimetrash, kur shanset për shërim janë më të mëdha.",
        doctorQuestion: "Ku është qendra më e afërt që bën mamografi kontrolli?",
      },
      {
        id: "colorectal-fit-test",
        glyph: "sample",
        ageBrackets: ["50-69"],
        applicableSex: "all",
        title: "Testi për kancerin e zorrës së trashë (FIT, nga feçet)",
        frequency: "Një herë në 1–2 vjet",
        cnasBadge: "Falas përmes mjekut të familjes dhe qendrave ROCCAS",
        preparation: "Mostrën e feçeve e merr në shtëpi me një kit të thjeshtë. Nuk mban dietë.",
        earlyBenefit:
          "Gjen polipe të vegjël ose gjak të fshehur në feçe, shumë kohë para kancerit.",
        doctorQuestion: "Si ta përdor saktë kitin FIT që më dhanë?",
      },
      {
        id: "prostate-risk-men-50",
        glyph: "blood",
        ageBrackets: ["50-69", "70+"],
        applicableSex: "male",
        title: "Kontrolli i prostatës (analiza PSA dhe vizitë nëse duhet)",
        frequency: "Kur ta këshillon mjeku i familjes",
        cnasBadge: "I mbuluar nga CNAS, me rekomandim nga mjeku",
        preparation: "48 orë para analizës, mos nget biçikletë dhe shmang ejakulimin.",
        earlyBenefit: "Ndihmon mjekun të dallojë një prostatë të zmadhuar beninje nga diçka më serioze.",
        doctorQuestion: "A më duhet analiza PSA?",
      },
      {
        id: "senior-frailty-sensory-70",
        glyph: "eye",
        ageBrackets: ["70+"],
        applicableSex: "all",
        title: "Kontroll për të moshuarit (dëgjimi, shikimi, ecja, rrëzimet)",
        frequency: "Një herë në vit",
        cnasBadge: "Falas 100% nga CNAS, te mjeku i familjes",
        preparation: "Merr me vete syzet dhe listën e të gjitha ilaçeve që pi.",
        earlyBenefit:
          "Të ndihmon të mbetesh i pavarur dhe të shmangësh rrëzimet dhe thyerjet.",
        doctorQuestion: "Çfarë ushtrimesh të lehta mund të bëj në shtëpi për ekuilibrin?",
      },
    ],
  },
  it: {
    sectionTitle: "Quali controlli fanno per te",
    sectionSubtitle:
      "Scegli la tua età e vedi quali controlli puoi fare gratis o coperti dalla CNAS.",
    filterAgeLabel: "Età",
    filterSexLabel: "Per chi",
    ageOptions: {
      "18-39": "18–39 anni",
      "40-49": "40–49 anni",
      "50-69": "50–69 anni",
      "70+": "70+ anni",
    },
    sexOptions: {
      all: "Tutti gli adulti",
      female: "Donne",
      male: "Uomini",
    },
    tabRecommendations: "Controlli consigliati",
    tabTimeline: "Perché aiuta",
    tabChecklist: "La mia lista",
    noResultsMessage: "Nessun controllo per quello che hai scelto.",
    frequencyLabel: "Ogni quanto",
    cnasLabel: "Quanto costa",
    preparationLabel: "Come prepararti",
    earlyBenefitLabel: "Perché aiuta",
    doctorQuestionLabel: "Cosa chiedere al medico",
    checklistTitle: "La mia lista per il medico",
    checklistSubtitle:
      "Spunta i controlli che hai fatto o di cui vuoi parlare con il medico.",
    checklistCounter: "{completed} di {total} spuntati",
    checklistEmpty:
      "Non hai spuntato niente. Scegli la tua età e spunta i controlli che ti interessano.",
    printChecklistButton: "Stampa la lista",
    audioNarrationPrefix: "Controlli di prevenzione.",
    listenInvestigationLabel: "Ascolta i dettagli",
    timelineTitle: "Come aiutano i controlli fatti per tempo",
    timelineSubtitle:
      "Un controllo semplice può trovare un problema prima che diventi grave.",
    sceneLabels: {
      symptoms: "Compaiono i sintomi",
      check: "Controllo",
      foundEarly: "Scoperta precoce",
      untreated: "Senza controllo",
      treated: "Cura tempestiva",
      time: "Tempo",
    },
    timelineSteps: [
      {
        stepNumber: "01",
        title: "Ti senti bene",
        description:
          "Molte malattie all'inizio non fanno male. Ti senti bene e non noti niente.",
      },
      {
        stepNumber: "02",
        title: "Fai un controllo breve",
        description:
          "Un esame del sangue, la pressione o un Pap test richiedono pochi minuti dal medico di famiglia.",
      },
      {
        stepNumber: "03",
        title: "Si trova un piccolo cambiamento",
        description:
          "Il test trova piccoli cambiamenti anni prima che causino dolore o una malattia grave.",
      },
      {
        stepNumber: "04",
        title: "Curarsi è più facile",
        description:
          "Un problema trovato presto si cura più facilmente e ha le migliori probabilità di guarigione.",
      },
    ],
    investigations: [
      {
        id: "checkup-annual-all",
        glyph: "stethoscope",
        ageBrackets: ["18-39", "40-49", "50-69", "70+"],
        applicableSex: "all",
        title: "Visita annuale dal medico di famiglia",
        frequency: "Una volta all'anno",
        cnasBadge: "Gratis al 100% con la CNAS, con o senza assicurazione",
        preparation: "Non serve prepararti. Prendi appuntamento in ambulatorio.",
        earlyBenefit:
          "Il medico controlla pressione, peso, cuore e abitudini prima che arrivi una malattia.",
        doctorQuestion: "Quali malattie della mia famiglia devo tenere d'occhio?",
      },
      {
        id: "blood-panel-18-39",
        glyph: "blood",
        ageBrackets: ["18-39"],
        applicableSex: "all",
        title: "Esami del sangue di routine (emocromo, glicemia, colesterolo)",
        frequency: "Ogni 3 anni, o più spesso se sei a rischio",
        cnasBadge: "Coperto al 100% dalla CNAS con l'impegnativa del medico",
        preparation: "Al mattino, a digiuno. Puoi bere acqua naturale.",
        earlyBenefit:
          "Trova presto anemia, zucchero alto nel sangue (prediabete) e colesterolo alto.",
        doctorQuestion: "I miei valori sono normali per la mia età?",
      },
      {
        id: "cervical-pap-hpv",
        glyph: "ribbon",
        ageBrackets: ["18-39", "40-49", "50-69"],
        applicableSex: "female",
        title: "Test per il collo dell'utero (Pap test o test HPV)",
        frequency: "Ogni 3 anni (Pap test) o ogni 5 anni (test HPV)",
        cnasBadge: "Gratis con il programma nazionale di screening",
        preparation: "Nelle 48 ore prima, niente rapporti e niente creme o ovuli vaginali.",
        earlyBenefit:
          "Trova cellule alterate molti anni prima che possano diventare un tumore.",
        doctorQuestion: "Quale test è meglio per me, Pap test o HPV?",
      },
      {
        id: "cardio-metabolic-40",
        glyph: "heart",
        ageBrackets: ["40-49", "50-69"],
        applicableSex: "all",
        title: "Controllo di cuore e glicemia (SCORE2, glicemia, colesterolo)",
        frequency: "Una volta all'anno",
        cnasBadge: "Coperto dalla CNAS tramite il medico di famiglia",
        preparation:
          "Vieni a digiuno per gli esami. Stai seduto tranquillo 10 minuti prima di misurare la pressione.",
        earlyBenefit:
          "Agire per tempo aiuta a prevenire infarto e ictus.",
        doctorQuestion: "Quanto è alto il mio rischio per il cuore nei prossimi 10 anni?",
      },
      {
        id: "breast-ultrasound-mammography",
        glyph: "ribbon",
        ageBrackets: ["40-49"],
        applicableSex: "female",
        title: "Visita ed ecografia al seno",
        frequency: "Una volta all'anno",
        cnasBadge: "Coperto dalla CNAS con l'impegnativa del medico",
        preparation: "Meglio nei primi 10 giorni dall'inizio del ciclo.",
        earlyBenefit:
          "Trova piccoli noduli prima che tu li possa sentire con la mano.",
        doctorQuestion: "Quando devo iniziare a fare la mammografia?",
      },
      {
        id: "mammography-screening-50-69",
        glyph: "ribbon",
        ageBrackets: ["50-69"],
        applicableSex: "female",
        title: "Mammografia di screening (entrambi i seni)",
        frequency: "Ogni 2 anni",
        cnasBadge: "Gratis con il programma nazionale di screening",
        preparation: "Il giorno dell'esame non mettere deodorante, crema o talco sotto le ascelle.",
        earlyBenefit:
          "Trova cambiamenti di pochi millimetri, quando le probabilità di guarire sono più alte.",
        doctorQuestion: "Dov'è il centro più vicino che fa la mammografia di screening?",
      },
      {
        id: "colorectal-fit-test",
        glyph: "sample",
        ageBrackets: ["50-69"],
        applicableSex: "all",
        title: "Test per il tumore del colon (FIT, campione di feci)",
        frequency: "Ogni 1–2 anni",
        cnasBadge: "Gratis tramite il medico di famiglia e i centri ROCCAS",
        preparation:
          "Raccogli un campione di feci a casa con un kit semplice. Nessuna dieta.",
        earlyBenefit:
          "Trova piccoli polipi o sangue nascosto nelle feci molto prima che si sviluppi un tumore.",
        doctorQuestion: "Come uso bene il kit FIT che mi hanno dato?",
      },
      {
        id: "prostate-risk-men-50",
        glyph: "blood",
        ageBrackets: ["50-69", "70+"],
        applicableSex: "male",
        title: "Controllo della prostata (esame PSA e visita se serve)",
        frequency: "Quando lo consiglia il medico di famiglia",
        cnasBadge: "Coperto dalla CNAS con l'impegnativa del medico",
        preparation:
          "Nelle 48 ore prima del prelievo, niente bicicletta e niente eiaculazione.",
        earlyBenefit: "Aiuta il medico a distinguere per tempo una prostata ingrossata benigna da un problema più serio.",
        doctorQuestion: "Mi serve l'esame del PSA?",
      },
      {
        id: "senior-frailty-sensory-70",
        glyph: "eye",
        ageBrackets: ["70+"],
        applicableSex: "all",
        title: "Controllo per anziani (udito, vista, cammino, cadute)",
        frequency: "Una volta all'anno",
        cnasBadge: "Gratis al 100% con la CNAS, dal medico di famiglia",
        preparation: "Porta gli occhiali e la lista di tutti i farmaci che prendi.",
        earlyBenefit:
          "Ti aiuta a restare autonomo e a evitare cadute e fratture.",
        doctorQuestion: "Quali esercizi facili posso fare a casa per l'equilibrio?",
      },
    ],
  },
};
