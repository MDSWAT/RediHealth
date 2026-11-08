import type { Lang } from "@/lib/i18n/translations";

export type MedicalGlossaryCategory =
  | "diabet"
  | "cardiologie"
  | "analize"
  | "cnas"
  | "urgente";

export interface DualRegisterGlossaryEntry {
  id: string;
  plainTermRo: string;
  formalTermRo: string;
  category: MedicalGlossaryCategory;
  layExplanationRo: string;
  clinicalSignificanceRo: string;
  speechTextRo: string;
  relatedTopicSlug?: string;
}

export const ROMANIAN_MEDICAL_GLOSSARY: DualRegisterGlossaryEntry[] = [
  {
    id: "glicemie-a-jeun",
    plainTermRo: "Zahăr în sânge pe nemâncate",
    formalTermRo: "Glicemie à jeun / Glicemie bazală",
    category: "diabet",
    layExplanationRo:
      "Se măsoară dimineața, după cel puțin 8 ore fără mâncare. Arată cât zahăr ai în sânge când corpul se odihnește.",
    clinicalSignificanceRo:
      "Normal: 70–99 mg/dL. Între 100 și 125 mg/dL înseamnă prediabet. 126 mg/dL sau mai mult, la 2 analize, poate însemna diabet.",
    speechTextRo:
      "Zahăr în sânge pe nemâncate. Pe analize scrie glicemie à jeun. Se măsoară dimineața, pe stomacul gol.",
    relatedTopicSlug: "diabetes",
  },
  {
    id: "glicemie-postprandial",
    plainTermRo: "Zahăr în sânge la 2 ore după masă",
    formalTermRo: "Glicemie postprandială",
    category: "diabet",
    layExplanationRo:
      "Se măsoară la 2 ore după ce ai început să mănânci. Arată cum se descurcă corpul cu zahărul din mâncare.",
    clinicalSignificanceRo:
      "Normal: sub 140 mg/dL. Între 140 și 199 mg/dL, corpul folosește greu zahărul (toleranță alterată la glucoză). 200 mg/dL sau mai mult poate însemna diabet.",
    speechTextRo:
      "Zahăr în sânge la 2 ore după masă. Pe analize scrie glicemie postprandială. Normal este sub 140 miligrame pe decilitru.",
    relatedTopicSlug: "diabetes",
  },
  {
    id: "hipertensiune",
    plainTermRo: "Tensiune mare",
    formalTermRo: "Hipertensiune arterială (HTA)",
    category: "cardiologie",
    layExplanationRo:
      "Sângele apasă prea tare pe pereții vaselor de sânge, tot timpul. Inima obosește, iar vasele se strică în timp.",
    clinicalSignificanceRo:
      "Medicul o pune la valori de 140/90 mmHg sau mai mari, măsurate de mai multe ori. Crește cel mai mult riscul de infarct și de accident vascular cerebral.",
    speechTextRo:
      "Tensiune mare. Medicul îi spune hipertensiune arterială. Peste 140 cu 90, inima muncește prea greu, chiar dacă nu te doare nimic.",
    relatedTopicSlug: "heart-health",
  },
  {
    id: "hipotensiune",
    plainTermRo: "Tensiune mică",
    formalTermRo: "Hipotensiune arterială",
    category: "cardiologie",
    layExplanationRo:
      "Tensiunea e mai mică decât normal. Poți avea amețeli când te ridici repede, vedere încețoșată sau poți leșina.",
    clinicalSignificanceRo:
      "Sub 90/60 mmHg. Dacă te simți bine, poate fi normal pentru tine. Dacă ai amețeli sau leșini, medicul verifică lichidele și sărurile din corp.",
    speechTextRo:
      "Tensiune mică. Medicul îi spune hipotensiune arterială. Sub 90 cu 60 poți avea amețeli sau slăbiciune când te ridici repede.",
    relatedTopicSlug: "heart-health",
  },
  {
    id: "atac-de-cord",
    plainTermRo: "Atac de cord",
    formalTermRo: "Infarct miocardic acut (IMA)",
    category: "urgente",
    layExplanationRo:
      "Un cheag astupă complet o arteră a inimii. O parte din mușchiul inimii rămâne fără oxigen și începe să se strice.",
    clinicalSignificanceRo:
      "Urgență. Sună la 112. Artera trebuie desfundată la spital (angioplastie) în primele ore.",
    speechTextRo:
      "Atac de cord. Medicul îi spune infarct miocardic acut. Dacă simți o gheară în piept care merge spre braț sau spre maxilar, sună imediat la 112.",
    relatedTopicSlug: "heart-health",
  },
  {
    id: "atac-cerebral",
    plainTermRo: "Atac cerebral",
    formalTermRo: "Accident vascular cerebral (AVC)",
    category: "urgente",
    layExplanationRo:
      "Sângele nu mai ajunge brusc la o parte din creier, din cauza unui cheag sau a unei sângerări. Celulele din acea parte mor.",
    clinicalSignificanceRo:
      "Urgență. Sună la 112. Medicii verifică semnele cu testul FAST. Medicamentul care topește cheagul (tromboliza) se dă în primele 4,5 ore.",
    speechTextRo:
      "Atac cerebral. Medicul îi spune accident vascular cerebral. Dacă fața se strâmbă, brațul slăbește sau vorbirea e încurcată, sună imediat la 112.",
    relatedTopicSlug: "heart-health",
  },
  {
    id: "dispnee",
    plainTermRo: "Lipsă de aer la efort sau când stai culcat",
    formalTermRo: "Dispnee cardiacă / respiratorie",
    category: "cardiologie",
    layExplanationRo:
      "Simți că te sufoci sau respiri greu. Dacă apare la efort mic sau când stai întins în pat, poate fi semn că inima e obosită.",
    clinicalSignificanceRo:
      "Dacă rămâi fără aer la efort sau ai nevoie de mai multe perne ca să dormi (ortopnee), poate fi apă pe plămâni (congestie pulmonară). Mergi urgent la cardiolog.",
    speechTextRo:
      "Lipsă de aer. Medicul îi spune dispnee. Dacă respiri greu la efort mic sau când stai întins în pat, mergi urgent la medic.",
    relatedTopicSlug: "heart-health",
  },
  {
    id: "edeme",
    plainTermRo: "Glezne și picioare umflate",
    formalTermRo: "Edeme periferice / retromaleolare",
    category: "cardiologie",
    layExplanationRo:
      "Se strânge apă în glezne și în gambe. Se întâmplă când inima sau venele nu mai împing bine sângele înapoi în sus.",
    clinicalSignificanceRo:
      "Dacă apeși cu degetul și rămâne o adâncitură (semnul godeului), corpul ține apă și sare. Se întâmplă des în insuficiența cardiacă.",
    speechTextRo:
      "Picioare umflate. Medicul le spune edeme periferice. Apa strânsă la glezne arată adesea că inima are nevoie de ajutorul medicului.",
    relatedTopicSlug: "heart-health",
  },
  {
    id: "hemoglobina-glicata",
    plainTermRo: "Zahărul mediu din ultimele 3 luni",
    formalTermRo: "Hemoglobină glicată (HbA1c)",
    category: "diabet",
    layExplanationRo:
      "O analiză de sânge care arată cât zahăr ai avut în sânge, în medie, în ultimele 90 de zile. Arată cât de bine e ținut sub control diabetul.",
    clinicalSignificanceRo:
      "La cei mai mulți adulți cu diabet, ținta este sub 7%. Peste 8%, medicul trebuie să revadă tratamentul.",
    speechTextRo:
      "Zahărul mediu din ultimele 3 luni. Pe analize scrie hemoglobină glicată sau HbA1c. Pentru cei mai mulți oameni cu diabet, ținta este sub 7 la sută.",
    relatedTopicSlug: "diabetes",
  },
  {
    id: "fibrilatie-atriala",
    plainTermRo: "Inimă care bate neregulat și repede",
    formalTermRo: "Fibrilație atrială (FiA)",
    category: "cardiologie",
    layExplanationRo:
      "Inima bate repede și fără ritm. Sângele nu iese tot din camerele de sus ale inimii, așa că se pot face cheaguri.",
    clinicalSignificanceRo:
      "Riscul de accident vascular cerebral crește de 5 ori. Ai nevoie de pastile care subțiază sângele (anticoagulante), date de cardiolog.",
    speechTextRo:
      "Inimă care bate neregulat și repede. Medicul îi spune fibrilație atrială. Mergi la cardiolog ca să previi cheagurile de sânge.",
    relatedTopicSlug: "heart-health",
  },
  {
    id: "insuficienta-cardiaca",
    plainTermRo: "Inimă slăbită, care pompează greu",
    formalTermRo: "Insuficiență cardiacă cronică",
    category: "cardiologie",
    layExplanationRo:
      "Inima pierde încet puterea de a pompa cât sânge le trebuie organelor. Obosești repede și se strânge apă în corp.",
    clinicalSignificanceRo:
      "Boală de lungă durată, care se agravează în timp. Te cântărești în fiecare zi, mănânci sub 5 g de sare pe zi și iei medicamentele exact cum ți-a spus medicul.",
    speechTextRo:
      "Inimă slăbită. Medicul îi spune insuficiență cardiacă cronică. Te cântărești zilnic, mănânci puțină sare și iei medicamentele exact cum scrie pe rețetă.",
    relatedTopicSlug: "heart-health",
  },
  {
    id: "neuropatie-diabetica",
    plainTermRo: "Amorțeli și furnicături în tălpi",
    formalTermRo: "Neuropatie diabetică periferică",
    category: "diabet",
    layExplanationRo:
      "Zahărul mare strică nervii din picioare. Nu mai simți bine durerea, așa că poți avea răni fără să le observi.",
    clinicalSignificanceRo:
      "Se întâmplă des la oamenii cu diabet. Uită-te la tălpi în fiecare zi, ca să vezi rănile din timp.",
    speechTextRo:
      "Amorțeli și furnicături în tălpi. Medicul îi spune neuropatie diabetică. Uită-te zilnic la picioare, ca să prinzi rănile din timp.",
    relatedTopicSlug: "diabetes",
  },
  {
    id: "retinopatie-diabetica",
    plainTermRo: "Vedere afectată de diabet",
    formalTermRo: "Retinopatie diabetică",
    category: "diabet",
    layExplanationRo:
      "Zahărul mare, ani la rând, strică vasele mici de sânge din spatele ochiului (retina).",
    clinicalSignificanceRo:
      "Este principala cauză de orbire la adulți. O previi cu un control la ochi în fiecare an (fund de ochi) și cu HbA1c sub 7%.",
    speechTextRo:
      "Vedere afectată de diabet. Medicul îi spune retinopatie diabetică. Un control la ochi în fiecare an, cu fund de ochi, îți protejează vederea.",
    relatedTopicSlug: "diabetes",
  },
  {
    id: "cetoacidoza-diabetica",
    plainTermRo: "Complicație gravă a diabetului, cu sânge acid",
    formalTermRo: "Cetoacidoză diabetică (CAD)",
    category: "diabet",
    layExplanationRo:
      "Când lipsește mult insulina, corpul arde grăsime ca să aibă energie. Așa apar în sânge acizi otrăvitori (corpi cetonici).",
    clinicalSignificanceRo:
      "Urgență care pune viața în pericol. Semne: respirația miroase a mere putrede, vărsături, confuzie și deshidratare.",
    speechTextRo:
      "Complicație gravă a diabetului, cu sânge acid. Medicul îi spune cetoacidoză diabetică. Dacă ai vărsături, ești confuz sau respiri repede, sună la 112.",
    relatedTopicSlug: "diabetes",
  },
  {
    id: "electrocardiograma",
    plainTermRo: "Înregistrarea electrică a inimii",
    formalTermRo: "Electrocardiogramă (ECG / EKG)",
    category: "analize",
    layExplanationRo:
      "Un test rapid, care nu doare. Ți se pun câțiva electrozi pe piele, iar aparatul desenează pe hârtie cum bate inima.",
    clinicalSignificanceRo:
      "Arată dacă inima bate neregulat, dacă nu primește destul sânge (ischemie) și dacă ai avut un infarct, recent sau mai demult.",
    speechTextRo:
      "Înregistrarea electrică a inimii. Medicul îi spune electrocardiogramă sau EKG. E un test rapid, fără durere, care arată ritmul inimii.",
    relatedTopicSlug: "heart-health",
  },
  {
    id: "ecocardiografie",
    plainTermRo: "Ecografia inimii",
    formalTermRo: "Ecocardiografie transtoracică",
    category: "analize",
    layExplanationRo:
      "Un examen cu ultrasunete. Pe ecran se văd pereții inimii, cum se mișcă valvele și cât de tare pompează inima.",
    clinicalSignificanceRo:
      "Măsoară cât sânge împinge inima la fiecare bătaie (fracția de ejecție, FEVS). Arată și bolile valvelor sau un mușchi al inimii îngroșat.",
    speechTextRo:
      "Ecografia inimii. Medicul îi spune ecocardiografie. Arată cum se mișcă valvele și cât de tare pompează inima.",
    relatedTopicSlug: "heart-health",
  },
  {
    id: "tensiometru-digital",
    plainTermRo: "Aparat de tensiune automat",
    formalTermRo: "Tensiometru digital oscilometric",
    category: "analize",
    layExplanationRo:
      "Aparat cu o manșetă pe care o pui pe braț. Se umflă singur și îți arată tensiunea și pulsul.",
    clinicalSignificanceRo:
      "Bun pentru măsurat acasă. Alege un model verificat medical, cu manșetă pe braț, nu pe încheietură.",
    speechTextRo:
      "Aparat de tensiune automat. Se mai numește tensiometru digital. Cele cu manșetă pe braț măsoară cel mai bine acasă.",
    relatedTopicSlug: "heart-health",
  },
  {
    id: "glucometru",
    plainTermRo: "Aparat de măsurat zahărul",
    formalTermRo: "Glucometru cu biosenzori",
    category: "analize",
    layExplanationRo:
      "Un aparat mic. Pui pe bandă o picătură de sânge din marginea degetului și vezi zahărul în câteva secunde.",
    clinicalSignificanceRo:
      "Te ajută să-ți urmărești singur diabetul. Ai nevoie de benzi potrivite pentru aparat și de ace sterile, folosite o singură dată (lansete).",
    speechTextRo:
      "Aparat de măsurat zahărul. Se mai numește glucometru. Îți arată zahărul din sânge dintr-o picătură luată din deget, în câteva secunde.",
    relatedTopicSlug: "diabetes",
  },
  {
    id: "bilet-de-trimitere",
    plainTermRo: "Trimitere la medicul specialist",
    formalTermRo: "Bilet de trimitere CNAS",
    category: "cnas",
    layExplanationRo:
      "Formularul verde pe care ți-l dă medicul de familie. Dacă ești asigurat, cu el consultația la specialist e gratuită sau plătită de CNAS.",
    clinicalSignificanceRo:
      "E valabil 30 de zile pentru o boală apărută brusc și până la 90 de zile pentru bolile de lungă durată urmărite în programele naționale de sănătate.",
    speechTextRo:
      "Trimitere la medicul specialist. Pe hârtie scrie bilet de trimitere. Cu el, consultațiile și analizele la specialist sunt plătite de CNAS.",
    relatedTopicSlug: "preventive-screening",
  },
  {
    id: "prescriptie-compensata",
    plainTermRo: "Rețetă cu preț redus sau gratuit",
    formalTermRo: "Prescripție medicală compensată",
    category: "cnas",
    layExplanationRo:
      "Rețeta electronică prin care medicul îți dă medicamente plătite parțial de CNAS (50%, 90%) sau complet (100%, sublista C pentru diabet).",
    clinicalSignificanceRo:
      "În România, medicamentele pentru diabet și insulina sunt plătite 100% prin Programul Național de Diabet Zaharat.",
    speechTextRo:
      "Rețetă cu preț redus sau gratuit. Pe hârtie scrie prescripție compensată. Tratamentul pentru diabet și alte boli de lungă durată e plătit din asigurare.",
    relatedTopicSlug: "diabetes",
  },
  {
    id: "centru-de-permanenta",
    plainTermRo: "Cabinet de gardă",
    formalTermRo: "Centru de permanență medicală",
    category: "cnas",
    layExplanationRo:
      "Cabinet deschis când medicul de familie nu lucrează: noaptea, în weekend și de sărbători. Mergi aici pentru probleme urgente, dar nu grave.",
    clinicalSignificanceRo:
      "Te ajută cu probleme care nu îți pun viața în pericol. Așa, urgențele spitalului rămân libere pentru cazurile grave.",
    speechTextRo:
      "Cabinet de gardă. Se mai numește centru de permanență. E deschis noaptea și în weekend, și poți merge fără programare.",
    relatedTopicSlug: "preventive-screening",
  },
  {
    id: "unitate-primiri-urgente",
    plainTermRo: "Urgențele spitalului",
    formalTermRo: "Unitate de Primiri Urgențe (UPU)",
    category: "urgente",
    layExplanationRo:
      "Secția spitalului deschisă zi și noapte, 24 de ore din 24. Aici se tratează cazurile grave.",
    clinicalSignificanceRo:
      "Pentru situații care pun viața în pericol: accidente, durere în piept, pierderea cunoștinței (comă). Nu intri în ordinea sosirii. Intră întâi cine e mai grav.",
    speechTextRo:
      "Urgențele spitalului. Se mai numesc UPU. Sunt deschise zi și noapte pentru cazurile grave.",
    relatedTopicSlug: "heart-health",
  },
];

export interface LocalizedGlossaryText {
  plainTerm: string;
  formalTerm: string;
  layExplanation: string;
  clinicalSignificance: string;
  speechText: string;
}

export const GLOSSARY_TRANSLATIONS: Record<
  "en" | "sq" | "it",
  Record<string, LocalizedGlossaryText>
> = {
  en: {
    "glicemie-a-jeun": {
      plainTerm: "Fasting blood sugar",
      formalTerm: "Fasting plasma glucose (FPG)",
      layExplanation:
        "Measured in the morning, after at least 8 hours without food. It shows how much sugar is in your blood while your body rests.",
      clinicalSignificance:
        "Normal: 70–99 mg/dL. 100 to 125 mg/dL means prediabetes. 126 mg/dL or more on 2 tests can mean diabetes.",
      speechText:
        "Fasting blood sugar. On test results it is called fasting plasma glucose. Normal is between 70 and 99 milligrams per deciliter.",
    },
    "glicemie-postprandial": {
      plainTerm: "Blood sugar 2 hours after a meal",
      formalTerm: "Postprandial plasma glucose",
      layExplanation:
        "Measured 2 hours after you start eating. It shows how well your body handles the sugar from food.",
      clinicalSignificance:
        "Normal: under 140 mg/dL. 140 to 199 mg/dL means your body struggles with sugar (impaired glucose tolerance). 200 mg/dL or more can mean diabetes.",
      speechText:
        "Blood sugar 2 hours after a meal. Doctors call it postprandial glucose. Normal is under 140 milligrams per deciliter.",
    },
    hipertensiune: {
      plainTerm: "High blood pressure",
      formalTerm: "Arterial hypertension",
      layExplanation:
        "Your blood pushes too hard against the walls of your blood vessels, all the time. Your heart gets tired and the vessels get damaged.",
      clinicalSignificance:
        "Diagnosed when readings stay at 140/90 mmHg or higher. It is the biggest risk factor for heart attack and stroke.",
      speechText:
        "High blood pressure. Doctors call it arterial hypertension. Above 140 over 90, your heart works too hard, even if nothing hurts.",
    },
    hipotensiune: {
      plainTerm: "Low blood pressure",
      formalTerm: "Arterial hypotension",
      layExplanation:
        "Your blood pressure is lower than normal. You may feel dizzy when you stand up fast, see blurry, or faint.",
      clinicalSignificance:
        "Below 90/60 mmHg. If you feel fine, it can be normal for you. If you feel dizzy or faint, your doctor checks your fluids and salts (electrolytes).",
      speechText:
        "Low blood pressure. Doctors call it arterial hypotension. Below 90 over 60, you may feel dizzy or weak when you stand up fast.",
    },
    "atac-de-cord": {
      plainTerm: "Heart attack",
      formalTerm: "Acute myocardial infarction (AMI)",
      layExplanation:
        "A clot fully blocks an artery of the heart. Part of the heart muscle gets no oxygen and starts to get damaged.",
      clinicalSignificance:
        "Emergency. Call 112. The artery must be opened in hospital (angioplasty) within the first hours.",
      speechText:
        "Heart attack. Doctors call it acute myocardial infarction. If you feel crushing pain in your chest that spreads to your arm or jaw, call 112 now.",
    },
    "atac-cerebral": {
      plainTerm: "Stroke",
      formalTerm: "Cerebrovascular accident (CVA)",
      layExplanation:
        "Blood suddenly stops reaching part of the brain, because of a clot or bleeding. Brain cells in that part die.",
      clinicalSignificance:
        "Emergency. Call 112. Doctors check the signs with the FAST test. The medicine that dissolves the clot (thrombolysis) is given within the first 4.5 hours.",
      speechText:
        "Stroke. Doctors call it a cerebrovascular accident. If the face droops, an arm goes weak or speech is slurred, call 112 now.",
    },
    dispnee: {
      plainTerm: "Short of breath when active or lying down",
      formalTerm: "Cardiac or respiratory dyspnea",
      layExplanation:
        "You feel like you are choking or cannot breathe well. If it happens with light effort or lying flat in bed, your heart may be struggling.",
      clinicalSignificance:
        "Getting out of breath with effort, or needing several pillows to sleep (orthopnea), can mean fluid in the lungs (pulmonary congestion). See a cardiologist urgently.",
      speechText:
        "Shortness of breath. Doctors call it dyspnea. If you struggle to breathe with light effort or when lying flat, see a doctor urgently.",
    },
    edeme: {
      plainTerm: "Swollen ankles and legs",
      formalTerm: "Peripheral edema / Pitting edema",
      layExplanation:
        "Fluid collects in your ankles and lower legs. It happens when your heart or veins struggle to push blood back up.",
      clinicalSignificance:
        "If pressing with a finger leaves a dent (pitting), your body is holding on to water and salt. This is common in heart failure.",
      speechText:
        "Swollen ankles and legs. Doctors call it peripheral edema. Water building up at the ankles often means your heart needs a doctor's care.",
    },
    "hemoglobina-glicata": {
      plainTerm: "Average blood sugar over 3 months",
      formalTerm: "Glycated hemoglobin (HbA1c)",
      layExplanation:
        "A blood test that shows your average blood sugar over the last 90 days. It shows how well your diabetes is controlled.",
      clinicalSignificance:
        "For most adults with diabetes, the target is under 7%. Above 8%, your doctor needs to review your treatment.",
      speechText:
        "Average blood sugar over 3 months. On test results it is called HbA1c. For most people with diabetes, the target is under 7 percent.",
    },
    "fibrilatie-atriala": {
      plainTerm: "Fast, irregular heartbeat",
      formalTerm: "Atrial fibrillation (AFib)",
      layExplanation:
        "Your heart beats fast and out of rhythm. Blood does not fully leave the upper chambers of the heart, so clots can form.",
      clinicalSignificance:
        "It makes a stroke 5 times more likely. You need blood-thinning tablets (anticoagulants) from a cardiologist.",
      speechText:
        "Fast, irregular heartbeat. Doctors call it atrial fibrillation. See a cardiologist to prevent blood clots and stroke.",
    },
    "insuficienta-cardiaca": {
      plainTerm: "Weak heart that pumps poorly",
      formalTerm: "Chronic heart failure (CHF)",
      layExplanation:
        "Your heart slowly loses the strength to pump enough blood to your organs. You tire quickly and fluid builds up in your body.",
      clinicalSignificance:
        "A long-term condition that gets worse over time. Weigh yourself every day, eat less than 5 g of salt a day and take your medicines exactly as prescribed.",
      speechText:
        "Weak heart. Doctors call it chronic heart failure. Weigh yourself every day, eat little salt and take your medicines exactly as prescribed.",
    },
    "neuropatie-diabetica": {
      plainTerm: "Numbness and tingling in the feet",
      formalTerm: "Peripheral diabetic neuropathy",
      layExplanation:
        "High blood sugar damages the nerves in your feet. You feel pain less, so wounds can go unnoticed.",
      clinicalSignificance:
        "Common in people with diabetes. Look at the soles of your feet every day to spot wounds early.",
      speechText:
        "Numbness and tingling in the feet. Doctors call it diabetic neuropathy. Check your feet every day to catch wounds early.",
    },
    "retinopatie-diabetica": {
      plainTerm: "Eye damage from diabetes",
      formalTerm: "Diabetic retinopathy",
      layExplanation:
        "Years of high blood sugar damage the small blood vessels at the back of your eye (the retina).",
      clinicalSignificance:
        "A leading cause of preventable blindness in adults. Prevent it with an eye exam every year, with drops to widen your pupils, and an HbA1c under 7%.",
      speechText:
        "Eye damage from diabetes. Doctors call it diabetic retinopathy. An eye exam every year protects your sight.",
    },
    "cetoacidoza-diabetica": {
      plainTerm: "Dangerous acid build-up in the blood",
      formalTerm: "Diabetic ketoacidosis (DKA)",
      layExplanation:
        "When your body is badly short of insulin, it burns fat for energy. This makes poisonous acids (ketones) build up in your blood.",
      clinicalSignificance:
        "Life-threatening emergency. Signs: breath that smells fruity, vomiting that does not stop, confusion and dehydration.",
      speechText:
        "Dangerous acid build-up in the blood. Doctors call it diabetic ketoacidosis. If you are vomiting, confused or breathing fast, call 112.",
    },
    electrocardiograma: {
      plainTerm: "Heart rhythm test",
      formalTerm: "Electrocardiogram (ECG / EKG)",
      layExplanation:
        "A quick test that does not hurt. Small sensors go on your skin, and a machine records on paper how your heart beats.",
      clinicalSignificance:
        "Shows an irregular heartbeat, a heart that does not get enough blood (ischemia), and signs of a recent or old heart attack.",
      speechText:
        "Heart rhythm test. Doctors call it an electrocardiogram, or ECG. It is quick, does not hurt and shows how your heart beats.",
    },
    ecocardiografie: {
      plainTerm: "Ultrasound of the heart",
      formalTerm: "Transthoracic echocardiogram (TTE)",
      layExplanation:
        "An ultrasound scan. On the screen you see the heart walls, how the valves move and how strongly the heart pumps.",
      clinicalSignificance:
        "Measures how much blood the heart pushes out with each beat (ejection fraction, LVEF). It also finds valve problems and a thickened heart muscle.",
      speechText:
        "Ultrasound of the heart. Doctors call it an echocardiogram. It shows how the valves move and how strongly the heart pumps.",
    },
    "tensiometru-digital": {
      plainTerm: "Automatic blood pressure monitor",
      formalTerm: "Digital oscillometric sphygmomanometer",
      layExplanation:
        "A device with a cuff that goes on your arm. It inflates by itself and shows your blood pressure and pulse.",
      clinicalSignificance:
        "Good for checking at home. Choose a clinically tested model with an upper-arm cuff, not a wrist one.",
      speechText:
        "Automatic blood pressure monitor. Models with an upper-arm cuff give the most accurate readings at home.",
    },
    glucometru: {
      plainTerm: "Blood sugar meter",
      formalTerm: "Capillary biosensor glucometer",
      layExplanation:
        "A small device. Put a drop of blood from the side of your fingertip on a strip, and it shows your blood sugar in a few seconds.",
      clinicalSignificance:
        "Helps you keep track of your diabetes yourself. You need test strips that fit your meter and sterile single-use needles (lancets).",
      speechText:
        "Blood sugar meter, or glucometer. It shows your blood sugar from 1 drop of blood in a few seconds.",
    },
    "bilet-de-trimitere": {
      plainTerm: "Referral to a specialist",
      formalTerm: "National insurance specialist referral",
      layExplanation:
        "The form your family doctor gives you. If you are insured, it makes your specialist visit free or partly paid by national health insurance.",
      clinicalSignificance:
        "Valid for 30 days for a sudden illness, and up to 90 days for long-term illnesses followed in national health programmes.",
      speechText:
        "Referral to a specialist. With it, national health insurance pays all or part of your specialist visits and tests.",
    },
    "prescriptie-compensata": {
      plainTerm: "Discounted or free prescription",
      formalTerm: "Compensated medical prescription",
      layExplanation:
        "An electronic prescription for medicines that are partly paid for (50%, 90%) or fully paid for (100%, for long-term illnesses like diabetes).",
      clinicalSignificance:
        "Essential medicines for diabetes and other long-term illnesses are fully covered by public health insurance.",
      speechText:
        "Discounted or free prescription. Treatment for diabetes and other long-term illnesses is paid for by public health insurance.",
    },
    "centru-de-permanenta": {
      plainTerm: "Out-of-hours clinic",
      formalTerm: "Out-of-hours primary care facility",
      layExplanation:
        "A clinic that is open when your family doctor is closed: nights, weekends and public holidays. Go there for urgent problems that are not life-threatening.",
      clinicalSignificance:
        "It treats problems that do not put your life at risk, so hospital emergency rooms stay free for serious cases.",
      speechText:
        "Out-of-hours clinic. It is open at night and at weekends, and you can go without an appointment.",
    },
    "unitate-primiri-urgente": {
      plainTerm: "Hospital emergency room (ER)",
      formalTerm: "Emergency Department (ED / UPU)",
      layExplanation:
        "The hospital department that is open day and night, 24 hours a day. Serious cases are treated here.",
      clinicalSignificance:
        "For life-threatening situations: accidents, chest pain, loss of consciousness (coma). You are not seen in order of arrival. The most serious cases go first.",
      speechText:
        "Hospital emergency room. It is open day and night for serious emergencies.",
    },
  },

  sq: {
    "glicemie-a-jeun": {
      plainTerm: "Sheqeri në gjak esëll",
      formalTerm: "Glicemia esëll / Glicemia bazale",
      layExplanation:
        "Matet në mëngjes, pasi nuk ke ngrënë për të paktën 8 orë. Tregon sa sheqer ke në gjak kur trupi pushon.",
      clinicalSignificance:
        "Normale: 70–99 mg/dL. Nga 100 deri në 125 mg/dL do të thotë paradiabet. 126 mg/dL ose më shumë, në 2 analiza, mund të jetë diabet.",
      speechText:
        "Sheqeri në gjak esëll. Në analiza shkruhet glicemia esëll. Matet në mëngjes, me stomak bosh.",
    },
    "glicemie-postprandial": {
      plainTerm: "Sheqeri në gjak 2 orë pas ngrënies",
      formalTerm: "Glicemia postprandiale",
      layExplanation:
        "Matet 2 orë pasi ke filluar të hash. Tregon si e përballon trupi sheqerin nga ushqimi.",
      clinicalSignificance:
        "Normale: nën 140 mg/dL. Nga 140 deri në 199 mg/dL trupi e përpunon me vështirësi sheqerin (tolerancë e dëmtuar ndaj glukozës). 200 mg/dL ose më shumë mund të jetë diabet.",
      speechText:
        "Sheqeri në gjak 2 orë pas ngrënies. Mjeku e quan glicemi postprandiale. Duhet të jetë nën 140 miligramë për decilitër.",
    },
    hipertensiune: {
      plainTerm: "Tensioni i lartë i gjakut",
      formalTerm: "Hipertensioni arterial",
      layExplanation:
        "Gjaku shtyp shumë fort mbi muret e enëve të gjakut, gjatë gjithë kohës. Zemra lodhet dhe enët dëmtohen me kohë.",
      clinicalSignificance:
        "Diagnostikohet kur vlerat mbeten 140/90 mmHg ose më lart. Është rreziku më i madh për infarkt dhe goditje në tru.",
      speechText:
        "Tensioni i lartë i gjakut. Mjeku e quan hipertension arterial. Mbi 140 me 90, zemra punon tepër, edhe kur nuk të dhemb asgjë.",
    },
    hipotensiune: {
      plainTerm: "Tensioni i ulët i gjakut",
      formalTerm: "Hipotensioni arterial",
      layExplanation:
        "Tensioni është më i ulët se normalisht. Mund të të marrë mendja kur ngrihesh shpejt, të të errësohen sytë ose të të bjerë të fikët.",
      clinicalSignificance:
        "Nën 90/60 mmHg. Nëse ndihesh mirë, mund të jetë normale për ty. Nëse të merren mendtë ose të bie të fikët, mjeku kontrollon lëngjet dhe kripërat në trup.",
      speechText:
        "Tensioni i ulët i gjakut. Mjeku e quan hipotension arterial. Nën 90 me 60 mund të të marrë mendja ose të ndihesh i dobët kur ngrihesh shpejt.",
    },
    "atac-de-cord": {
      plainTerm: "Sulm në zemër",
      formalTerm: "Infarkt akut i miokardit",
      layExplanation:
        "Një mpiksje gjaku bllokon plotësisht një arterie të zemrës. Një pjesë e muskulit të zemrës mbetet pa oksigjen dhe fillon të dëmtohet.",
      clinicalSignificance:
        "Urgjencë. Telefono 112. Arteria duhet hapur në spital (angioplastikë) brenda orëve të para.",
      speechText:
        "Sulm në zemër. Mjeku e quan infarkt akut të miokardit. Nëse ndien shtrëngim në gjoks që shkon drejt krahut ose nofullës, telefono menjëherë 112.",
    },
    "atac-cerebral": {
      plainTerm: "Goditje në tru",
      formalTerm: "Aksident vaskular cerebral (AVC)",
      layExplanation:
        "Gjaku papritur nuk arrin më në një pjesë të trurit, nga një mpiksje ose nga një gjakderdhje. Qelizat e asaj pjese vdesin.",
      clinicalSignificance:
        "Urgjencë. Telefono 112. Mjekët i kontrollojnë shenjat me testin FAST. Ilaçi që shkrin mpiksjen (tromboliza) jepet brenda 4,5 orëve të para.",
      speechText:
        "Goditje në tru. Mjeku e quan aksident vaskular cerebral. Nëse fytyra shtrembërohet, krahu dobësohet ose e folura ngatërrohet, telefono menjëherë 112.",
    },
    dispnee: {
      plainTerm: "Mungesë ajri kur lodhesh ose kur je shtrirë",
      formalTerm: "Dispne kardiake ose respiratore",
      layExplanation:
        "Ndien sikur po mbytesh ose merr frymë me vështirësi. Nëse ndodh me pak lodhje ose kur je shtrirë në shtrat, zemra mund të jetë e lodhur.",
      clinicalSignificance:
        "Nëse të mungon ajri kur lodhesh ose të duhen disa jastëkë për të fjetur (ortopne), mund të ketë ujë në mushkëri (kongjestion pulmonar). Shko urgjent te kardiologu.",
      speechText:
        "Mungesë ajri. Mjeku e quan dispne. Nëse merr frymë me vështirësi me pak lodhje ose kur je shtrirë, shko urgjent te mjeku.",
    },
    edeme: {
      plainTerm: "Këmbë dhe kyçe të ënjtura",
      formalTerm: "Edema periferike",
      layExplanation:
        "Mblidhet lëng te kyçet dhe pulpat e këmbëve. Ndodh kur zemra ose venat nuk e shtyjnë mirë gjakun lart.",
      clinicalSignificance:
        "Nëse shtyp me gisht dhe mbetet një gropëz, trupi po mban ujë dhe kripë. Kjo ndodh shpesh kur zemra është e dobët (insuficiencë kardiake).",
      speechText:
        "Këmbë të ënjtura. Mjeku e quan edemë periferike. Uji i mbledhur te kyçet shpesh tregon që zemra duhet kontrolluar nga mjeku.",
    },
    "hemoglobina-glicata": {
      plainTerm: "Sheqeri mesatar i 3 muajve të fundit",
      formalTerm: "Hemoglobina e glikuar (HbA1c)",
      layExplanation:
        "Analizë gjaku që tregon sa sheqer ke pasur mesatarisht në 90 ditët e fundit. Tregon sa mirë kontrollohet diabeti.",
      clinicalSignificance:
        "Për shumicën e të rriturve me diabet, objektivi është nën 7%. Mbi 8%, mjeku duhet ta rishikojë mjekimin.",
      speechText:
        "Sheqeri mesatar i 3 muajve të fundit. Në analiza shkruhet HbA1c. Për shumicën e njerëzve me diabet, objektivi është nën 7 përqind.",
    },
    "fibrilatie-atriala": {
      plainTerm: "Zemër që rreh shpejt dhe pa ritëm",
      formalTerm: "Fibrilacioni atrial",
      layExplanation:
        "Zemra rreh shpejt dhe pa ritëm. Gjaku nuk del i gjithi nga dhomat e sipërme të zemrës, prandaj mund të formohen mpiksje.",
      clinicalSignificance:
        "Rrit 5 herë rrezikun e goditjes në tru. Të duhen ilaçe që hollojnë gjakun (antikoagulantë), të dhëna nga kardiologu.",
      speechText:
        "Zemër që rreh shpejt dhe pa ritëm. Mjeku e quan fibrilacion atrial. Shko te kardiologu për të parandaluar mpiksjet e gjakut.",
    },
    "insuficienta-cardiaca": {
      plainTerm: "Zemër e dobët që pompon keq",
      formalTerm: "Insuficienca kardiake kronike",
      layExplanation:
        "Zemra humb ngadalë forcën për të pompuar aq gjak sa u duhet organeve. Lodhesh shpejt dhe mblidhet ujë në trup.",
      clinicalSignificance:
        "Sëmundje afatgjatë që përkeqësohet me kohë. Peshohu çdo ditë, ha më pak se 5 gramë kripë në ditë dhe merr ilaçet saktësisht si t'i ka shkruar mjeku.",
      speechText:
        "Zemër e dobët. Mjeku e quan insuficiencë kardiake kronike. Peshohu çdo ditë, ha pak kripë dhe merr ilaçet saktësisht si në recetë.",
    },
    "neuropatie-diabetica": {
      plainTerm: "Mpirje dhe shpime te shputat e këmbëve",
      formalTerm: "Neuropatia diabetike periferike",
      layExplanation:
        "Sheqeri i lartë dëmton nervat e këmbëve. Nuk e ndien mirë dhimbjen, prandaj mund të kesh plagë pa i vënë re.",
      clinicalSignificance:
        "Ndodh shpesh te njerëzit me diabet. Shiko shputat çdo ditë, që t'i gjesh plagët herët.",
      speechText:
        "Mpirje dhe shpime te shputat. Mjeku e quan neuropati diabetike. Kontrollo këmbët çdo ditë, që t'i gjesh plagët herët.",
    },
    "retinopatie-diabetica": {
      plainTerm: "Dëmtim i shikimit nga diabeti",
      formalTerm: "Retinopatia diabetike",
      layExplanation:
        "Sheqeri i lartë për vite me radhë dëmton enët e vogla të gjakut në pjesën e pasme të syrit (retina).",
      clinicalSignificance:
        "Shkaku kryesor i humbjes së shikimit te të rriturit. E parandalon me një kontroll syri çdo vit, me bebëza të zgjeruara, dhe me HbA1c nën 7%.",
      speechText:
        "Dëmtim i shikimit nga diabeti. Mjeku e quan retinopati diabetike. Një kontroll syri çdo vit të mbron shikimin.",
    },
    "cetoacidoza-diabetica": {
      plainTerm: "Acid i rrezikshëm në gjak nga diabeti",
      formalTerm: "Ketoacidoza diabetike (KAD)",
      layExplanation:
        "Kur mungon shumë insulina, trupi djeg yndyrë për energji. Kështu në gjak mblidhen acide helmuese (trupa ketonikë).",
      clinicalSignificance:
        "Urgjencë që rrezikon jetën. Shenjat: fryma me erë molle të thartë, të vjella, hutim dhe dehidrim.",
      speechText:
        "Acid i rrezikshëm në gjak nga diabeti. Mjeku e quan ketoacidozë diabetike. Nëse vjell, je i hutuar ose merr frymë shpejt, telefono 112.",
    },
    electrocardiograma: {
      plainTerm: "Regjistrimi elektrik i zemrës",
      formalTerm: "Elektrokardiograma (EKG)",
      layExplanation:
        "Një test i shpejtë që nuk dhemb. Të vendosen disa elektroda në lëkurë dhe aparati regjistron si rreh zemra.",
      clinicalSignificance:
        "Tregon nëse zemra rreh pa ritëm, nëse nuk merr gjak të mjaftueshëm (ishemi) dhe nëse ke pasur infarkt, të ri ose të vjetër.",
      speechText:
        "Regjistrimi elektrik i zemrës. Mjeku e quan elektrokardiogramë ose EKG. Është i shpejtë, nuk dhemb dhe tregon ritmin e zemrës.",
    },
    ecocardiografie: {
      plainTerm: "Ekografia e zemrës",
      formalTerm: "Ekokardiografia transtorakale",
      layExplanation:
        "Një ekzaminim me ultratinguj. Në ekran duken muret e zemrës, si lëvizin valvulat dhe sa fort pompon zemra.",
      clinicalSignificance:
        "Mat sa gjak nxjerr zemra me çdo rrahje (fraksioni i nxjerrjes). Zbulon edhe sëmundjet e valvulave dhe muskulin e trashur të zemrës.",
      speechText:
        "Ekografia e zemrës. Mjeku e quan ekokardiografi. Tregon si lëvizin valvulat dhe sa fort pompon zemra.",
    },
    "tensiometru-digital": {
      plainTerm: "Aparat automatik i tensionit",
      formalTerm: "Tensiometër dixhital oshilometrik",
      layExplanation:
        "Aparat me manshetë që e vendos në krah. Fryhet vetë dhe të tregon tensionin dhe pulsin.",
      clinicalSignificance:
        "I mirë për matje në shtëpi. Zgjidh një model të verifikuar mjekësisht, me manshetë krahu, jo kyçi dore.",
      speechText:
        "Aparat automatik i tensionit. Modelet me manshetë në krah masin më saktë në shtëpi.",
    },
    glucometru: {
      plainTerm: "Aparat për matjen e sheqerit",
      formalTerm: "Glukometër me biosensorë",
      layExplanation:
        "Një aparat i vogël. Vendos në shirit një pikë gjaku nga ana e gishtit dhe pas pak sekondash sheh sheqerin.",
      clinicalSignificance:
        "Të ndihmon ta ndjekësh vetë diabetin. Të duhen shirita që i përshtaten aparatit dhe gjilpëra sterile njëpërdorimëshe (lancetë).",
      speechText:
        "Aparat për matjen e sheqerit, ose glukometër. Të tregon sheqerin nga një pikë gjaku nga gishti, pas pak sekondash.",
    },
    "bilet-de-trimitere": {
      plainTerm: "Fletë referimi te specialisti",
      formalTerm: "Fletë referimi e sigurimeve shëndetësore",
      layExplanation:
        "Formulari që ta jep mjeku i familjes. Nëse je i siguruar, me të vizita te specialisti është falas ose e rimbursuar.",
      clinicalSignificance:
        "Vlen 30 ditë për një sëmundje të papritur dhe deri në 90 ditë për sëmundjet afatgjata që ndiqen në programet kombëtare.",
      speechText:
        "Fletë referimi te specialisti. Me të, vizitat dhe analizat te specialisti paguhen plotësisht ose pjesërisht nga sigurimi.",
    },
    "prescriptie-compensata": {
      plainTerm: "Recetë me çmim të ulët ose falas",
      formalTerm: "Recetë mjekësore e rimbursuar",
      layExplanation:
        "Recetë elektronike me ilaçe që paguhen pjesërisht (50%, 90%) ose plotësisht (100%, për sëmundje afatgjata dhe diabet).",
      clinicalSignificance:
        "Ilaçet kryesore për diabetin dhe sëmundjet afatgjata paguhen plotësisht nga sigurimi publik.",
      speechText:
        "Recetë me çmim të ulët ose falas. Mjekimi për diabetin paguhet nga sigurimi shëndetësor.",
    },
    "centru-de-permanenta": {
      plainTerm: "Qendër shëndetësore kujdestare",
      formalTerm: "Qendër e kujdesit mjekësor të vazhduar",
      layExplanation:
        "Qendër e hapur kur mjeku i familjes nuk punon: natën, në fundjavë dhe në festa. Shko aty për probleme urgjente që nuk rrezikojnë jetën.",
      clinicalSignificance:
        "Trajton problemet që nuk të rrezikojnë jetën, që urgjenca e spitalit të mbetet e lirë për rastet e rënda.",
      speechText:
        "Qendër shëndetësore kujdestare. Është e hapur natën dhe në fundjavë, dhe mund të shkosh pa takim.",
    },
    "unitate-primiri-urgente": {
      plainTerm: "Urgjenca e spitalit",
      formalTerm: "Departamenti i Pranimit të Urgjencës (UPU)",
      layExplanation:
        "Reparti i spitalit që punon ditë e natë, 24 orë në 24. Këtu trajtohen rastet e rënda.",
      clinicalSignificance:
        "Për raste që rrezikojnë jetën: aksidente, dhimbje gjoksi, humbje vetëdije (komë). Nuk hyn sipas radhës. Hyjnë më parë rastet më të rënda.",
      speechText:
        "Urgjenca e spitalit. Është e hapur ditë e natë për urgjenca të rënda.",
    },
  },

  it: {
    "glicemie-a-jeun": {
      plainTerm: "Zucchero nel sangue a digiuno",
      formalTerm: "Glicemia a digiuno / Glicemia basale",
      layExplanation:
        "Si misura al mattino, dopo almeno 8 ore senza mangiare. Mostra quanto zucchero hai nel sangue quando il corpo è a riposo.",
      clinicalSignificance:
        "Normale: 70–99 mg/dL. Da 100 a 125 mg/dL è prediabete. 126 mg/dL o più, in 2 esami, può indicare diabete.",
      speechText:
        "Zucchero nel sangue a digiuno. Sul referto si chiama glicemia a digiuno. Il valore normale è tra 70 e 99 milligrammi per decilitro.",
    },
    "glicemie-postprandial": {
      plainTerm: "Zucchero nel sangue 2 ore dopo il pasto",
      formalTerm: "Glicemia postprandiale",
      layExplanation:
        "Si misura 2 ore dopo che hai iniziato a mangiare. Mostra come il corpo gestisce lo zucchero del cibo.",
      clinicalSignificance:
        "Normale: sotto 140 mg/dL. Da 140 a 199 mg/dL il corpo gestisce male lo zucchero (ridotta tolleranza al glucosio). 200 mg/dL o più può indicare diabete.",
      speechText:
        "Zucchero nel sangue 2 ore dopo il pasto. Il medico la chiama glicemia postprandiale. Deve restare sotto 140 milligrammi per decilitro.",
    },
    hipertensiune: {
      plainTerm: "Pressione alta",
      formalTerm: "Ipertensione arteriosa",
      layExplanation:
        "Il sangue spinge troppo forte sulle pareti dei vasi sanguigni, sempre. Il cuore si stanca e i vasi si rovinano col tempo.",
      clinicalSignificance:
        "Si diagnostica quando i valori restano a 140/90 mmHg o più. È il fattore di rischio principale per infarto e ictus.",
      speechText:
        "Pressione alta. Il medico la chiama ipertensione arteriosa. Sopra 140 su 90 il cuore lavora troppo, anche se non senti dolore.",
    },
    hipotensiune: {
      plainTerm: "Pressione bassa",
      formalTerm: "Ipotensione arteriosa",
      layExplanation:
        "La pressione è più bassa del normale. Puoi avere capogiri quando ti alzi in fretta, vedere sfocato o svenire.",
      clinicalSignificance:
        "Sotto 90/60 mmHg. Se stai bene, può essere normale per te. Se hai capogiri o svieni, il medico controlla i liquidi e i sali minerali.",
      speechText:
        "Pressione bassa. Il medico la chiama ipotensione arteriosa. Sotto 90 su 60 puoi sentirti debole o avere capogiri quando ti alzi in fretta.",
    },
    "atac-de-cord": {
      plainTerm: "Attacco di cuore",
      formalTerm: "Infarto miocardico acuto (IMA)",
      layExplanation:
        "Un coagulo chiude del tutto un'arteria del cuore. Una parte del muscolo del cuore resta senza ossigeno e inizia a danneggiarsi.",
      clinicalSignificance:
        "Emergenza. Chiama il 112. L'arteria va riaperta in ospedale (angioplastica) nelle prime ore.",
      speechText:
        "Attacco di cuore. Il medico lo chiama infarto miocardico acuto. Se senti una morsa al petto che arriva al braccio o alla mandibola, chiama subito il 112.",
    },
    "atac-cerebral": {
      plainTerm: "Ictus cerebrale",
      formalTerm: "Accidente cerebrovascolare (ACV)",
      layExplanation:
        "Il sangue smette all'improvviso di arrivare a una parte del cervello, per un coagulo o un'emorragia. Le cellule di quella parte muoiono.",
      clinicalSignificance:
        "Emergenza. Chiama il 112. I medici controllano i segni con il test FAST. Il farmaco che scioglie il coagulo (trombolisi) si dà entro le prime 4,5 ore.",
      speechText:
        "Ictus. Il medico lo chiama accidente cerebrovascolare. Se il viso è storto, un braccio è debole o le parole escono confuse, chiama subito il 112.",
    },
    dispnee: {
      plainTerm: "Fiato corto sotto sforzo o da sdraiato",
      formalTerm: "Dispnea cardiaca o respiratoria",
      layExplanation:
        "Ti senti soffocare o respiri a fatica. Se succede con piccoli sforzi o quando sei sdraiato a letto, il cuore può essere affaticato.",
      clinicalSignificance:
        "Se ti manca il fiato sotto sforzo o ti servono più cuscini per dormire (ortopnea), può esserci acqua nei polmoni (congestione polmonare). Serve una visita urgente dal cardiologo.",
      speechText:
        "Fiato corto. Il medico la chiama dispnea. Se respiri a fatica con piccoli sforzi o da sdraiato, fatti vedere subito da un medico.",
    },
    edeme: {
      plainTerm: "Caviglie e gambe gonfie",
      formalTerm: "Edema periferico / Edema declive",
      layExplanation:
        "Si accumula liquido nelle caviglie e nei polpacci. Succede quando il cuore o le vene fanno fatica a spingere il sangue verso l'alto.",
      clinicalSignificance:
        "Se premi con un dito e resta un'impronta (segno della fovea), il corpo trattiene acqua e sale. Succede spesso nello scompenso cardiaco.",
      speechText:
        "Caviglie gonfie. Il medico li chiama edemi periferici. Il liquido che si accumula alle gambe spesso indica che il cuore va controllato.",
    },
    "hemoglobina-glicata": {
      plainTerm: "Media dello zucchero negli ultimi 3 mesi",
      formalTerm: "Emoglobina glicata (HbA1c)",
      layExplanation:
        "Un esame del sangue che mostra quanto zucchero hai avuto in media negli ultimi 90 giorni. Mostra quanto è controllato il diabete.",
      clinicalSignificance:
        "Per la maggior parte degli adulti con diabete, l'obiettivo è sotto il 7%. Sopra l'8%, il medico deve rivedere la terapia.",
      speechText:
        "Media dello zucchero negli ultimi 3 mesi. Sul referto si chiama emoglobina glicata, o HbA1c. Per la maggior parte delle persone con diabete, l'obiettivo è sotto il 7 per cento.",
    },
    "fibrilatie-atriala": {
      plainTerm: "Battito veloce e irregolare",
      formalTerm: "Fibrillazione atriale (FA)",
      layExplanation:
        "Il cuore batte veloce e senza ritmo. Il sangue non esce del tutto dalle camere superiori del cuore, così si possono formare coaguli.",
      clinicalSignificance:
        "Aumenta di 5 volte il rischio di ictus. Servono farmaci che rendono il sangue più fluido (anticoagulanti), prescritti dal cardiologo.",
      speechText:
        "Battito veloce e irregolare. Il medico la chiama fibrillazione atriale. Vai dal cardiologo per prevenire coaguli e ictus.",
    },
    "insuficienta-cardiaca": {
      plainTerm: "Cuore debole che pompa poco",
      formalTerm: "Scompenso cardiaco cronico / Insufficienza cardiaca",
      layExplanation:
        "Il cuore perde piano piano la forza di pompare il sangue che serve agli organi. Ti stanchi presto e si accumula acqua nel corpo.",
      clinicalSignificance:
        "Malattia di lunga durata che peggiora col tempo. Pesati ogni giorno, mangia meno di 5 g di sale al giorno e prendi i farmaci esattamente come ti ha detto il medico.",
      speechText:
        "Cuore debole. Il medico lo chiama scompenso cardiaco. Pesati ogni giorno, mangia poco sale e prendi i farmaci esattamente come prescritto.",
    },
    "neuropatie-diabetica": {
      plainTerm: "Formicolio e perdita di sensibilità ai piedi",
      formalTerm: "Neuropatia diabetica periferica",
      layExplanation:
        "Lo zucchero alto rovina i nervi dei piedi. Senti meno il dolore, così puoi avere ferite senza accorgertene.",
      clinicalSignificance:
        "Succede spesso a chi ha il diabete. Guardati la pianta dei piedi ogni giorno, per trovare presto le ferite.",
      speechText:
        "Formicolio ai piedi. Il medico la chiama neuropatia diabetica. Controlla i piedi ogni giorno, per trovare presto le ferite.",
    },
    "retinopatie-diabetica": {
      plainTerm: "Danno alla vista causato dal diabete",
      formalTerm: "Retinopatia diabetica",
      layExplanation:
        "Anni di zucchero alto rovinano i piccoli vasi sanguigni in fondo all'occhio (la retina).",
      clinicalSignificance:
        "Principale causa di cecità prevenibile negli adulti. La previeni con un controllo del fondo dell'occhio ogni anno e con HbA1c sotto il 7%.",
      speechText:
        "Danno alla vista causato dal diabete. Il medico la chiama retinopatia diabetica. Un controllo del fondo dell'occhio ogni anno protegge la vista.",
    },
    "cetoacidoza-diabetica": {
      plainTerm: "Acidi pericolosi nel sangue per il diabete",
      formalTerm: "Chetoacidosi diabetica (CAD)",
      layExplanation:
        "Quando manca molta insulina, il corpo brucia grassi per avere energia. Così nel sangue si accumulano acidi tossici (corpi chetonici).",
      clinicalSignificance:
        "Emergenza che mette in pericolo la vita. Segni: alito che sa di frutta, vomito che non passa, confusione e forte disidratazione.",
      speechText:
        "Acidi pericolosi nel sangue per il diabete. Il medico la chiama chetoacidosi diabetica. Se vomiti, sei confuso o respiri veloce, chiama subito il 112.",
    },
    electrocardiograma: {
      plainTerm: "Tracciato elettrico del cuore",
      formalTerm: "Elettrocardiogramma (ECG)",
      layExplanation:
        "Un esame veloce che non fa male. Ti mettono degli elettrodi sulla pelle e la macchina registra su carta come batte il cuore.",
      clinicalSignificance:
        "Mostra se il cuore batte in modo irregolare, se riceve poco sangue (ischemia) e se hai avuto un infarto, recente o vecchio.",
      speechText:
        "Tracciato elettrico del cuore. Il medico lo chiama elettrocardiogramma, o ECG. È veloce, non fa male e mostra il ritmo del cuore.",
    },
    ecocardiografie: {
      plainTerm: "Ecografia del cuore",
      formalTerm: "Ecocardiogramma transtoracico",
      layExplanation:
        "Un esame con gli ultrasuoni. Sullo schermo si vedono le pareti del cuore, come si muovono le valvole e quanto forte pompa il cuore.",
      clinicalSignificance:
        "Misura quanto sangue il cuore spinge fuori a ogni battito (frazione di eiezione). Trova anche malattie delle valvole e un muscolo del cuore ispessito.",
      speechText:
        "Ecografia del cuore. Il medico la chiama ecocardiogramma. Mostra come si muovono le valvole e quanto forte pompa il cuore.",
    },
    "tensiometru-digital": {
      plainTerm: "Misuratore automatico di pressione",
      formalTerm: "Sfigmomanometro digitale oscillometrico",
      layExplanation:
        "Un apparecchio con un bracciale da mettere sul braccio. Si gonfia da solo e ti mostra pressione e battiti.",
      clinicalSignificance:
        "Utile per misurare la pressione a casa. Scegli un modello validato, con bracciale per il braccio e non per il polso.",
      speechText:
        "Misuratore automatico di pressione. I modelli con bracciale sul braccio sono i più precisi per misurare a casa.",
    },
    glucometru: {
      plainTerm: "Misuratore della glicemia",
      formalTerm: "Glucometro a biosensori capillari",
      layExplanation:
        "Un piccolo apparecchio. Metti sulla striscia una goccia di sangue presa dal lato del dito e in pochi secondi vedi lo zucchero.",
      clinicalSignificance:
        "Ti aiuta a controllare da solo il diabete. Servono strisce adatte al tuo apparecchio e aghi sterili usa e getta (lancette pungidito).",
      speechText:
        "Misuratore della glicemia, o glucometro. Ti mostra lo zucchero da una goccia di sangue del dito, in pochi secondi.",
    },
    "bilet-de-trimitere": {
      plainTerm: "Impegnativa per visita specialistica",
      formalTerm: "Prescrizione ed impegnativa del servizio sanitario",
      layExplanation:
        "Il foglio che ti dà il medico di famiglia. Con questo fai visite ed esami dallo specialista gratis o pagando solo il ticket.",
      clinicalSignificance:
        "Vale 30 giorni per un problema improvviso e fino a 90 giorni per le malattie di lunga durata seguite nei piani di cura.",
      speechText:
        "Impegnativa per visita specialistica. Con questa fai visite ed esami dallo specialista a costo ridotto o gratis.",
    },
    "prescriptie-compensata": {
      plainTerm: "Ricetta con esenzione o a prezzo ridotto",
      formalTerm: "Prescrizione medica rimborsabile / Esenzione",
      layExplanation:
        "La ricetta con cui il medico ti prescrive farmaci pagati in parte (paghi solo il ticket) o del tutto (con l'esenzione per malattie croniche).",
      clinicalSignificance:
        "I farmaci essenziali per il diabete e le malattie croniche sono coperti al 100% dal servizio sanitario pubblico.",
      speechText:
        "Ricetta con esenzione o a prezzo ridotto. Le cure per il diabete e le malattie croniche sono pagate dal servizio sanitario.",
    },
    "centru-de-permanenta": {
      plainTerm: "Guardia medica",
      formalTerm: "Continuità assistenziale / Presidio di cure primarie",
      layExplanation:
        "Ambulatorio aperto quando il tuo medico di famiglia è chiuso: di notte, nel weekend e nei festivi. Ci vai per problemi urgenti ma non gravi.",
      clinicalSignificance:
        "Cura i problemi che non mettono in pericolo la vita, così il pronto soccorso resta libero per i casi gravi.",
      speechText:
        "Guardia medica. È aperta di notte e nel weekend, e ci vai senza appuntamento.",
    },
    "unitate-primiri-urgente": {
      plainTerm: "Pronto soccorso",
      formalTerm: "Dipartimento d'Emergenza e Accettazione (DEA / PS)",
      layExplanation:
        "Il reparto dell'ospedale aperto giorno e notte, 24 ore su 24. Qui si curano i casi gravi.",
      clinicalSignificance:
        "Per situazioni che mettono in pericolo la vita: incidenti, dolore al petto, perdita di coscienza (coma). Non entri in ordine di arrivo. Passano prima i casi più gravi.",
      speechText:
        "Pronto soccorso. È aperto giorno e notte per le emergenze gravi.",
    },
  },
};

export function getLocalizedGlossaryEntry(
  entry: DualRegisterGlossaryEntry,
  lang: Lang
): LocalizedGlossaryText {
  if (lang === "ro") {
    return {
      plainTerm: entry.plainTermRo,
      formalTerm: entry.formalTermRo,
      layExplanation: entry.layExplanationRo,
      clinicalSignificance: entry.clinicalSignificanceRo,
      speechText: entry.speechTextRo,
    };
  }
  const loc = GLOSSARY_TRANSLATIONS[lang]?.[entry.id];
  if (loc) return loc;
  return {
    plainTerm: entry.plainTermRo,
    formalTerm: entry.formalTermRo,
    layExplanation: entry.layExplanationRo,
    clinicalSignificance: entry.clinicalSignificanceRo,
    speechText: entry.speechTextRo,
  };
}

export interface DualRegisterGlossaryUiCopy {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  closeLabel: string;
  plainLabel: string;
  formalLabel: string;
  clinicalSignificanceLabel: string;
  pronounceLabel: string;
  emptyState: string;
  categoryTablistAria: string;
  categories: Record<"all" | MedicalGlossaryCategory, string>;
}

export const DUAL_REGISTER_GLOSSARY_UI_COPY: Record<Lang, DualRegisterGlossaryUiCopy> = {
  ro: {
    title: "Dicționar medical",
    subtitle: "Ce înseamnă cuvintele de pe rețete, analize și bilete",
    searchPlaceholder: "Caută un cuvânt",
    closeLabel: "Închide dicționarul",
    plainLabel: "Cuvântul de zi cu zi",
    formalLabel: "Cum scrie pe rețetă sau pe analize",
    clinicalSignificanceLabel: "Ce urmărește medicul:",
    pronounceLabel: "Ascultă",
    emptyState: "Nu am găsit acest cuvânt. Încearcă altul.",
    categoryTablistAria: "Categorii din dicționar",
    categories: {
      all: "Toate (22)",
      diabet: "Diabet",
      cardiologie: "Inimă și tensiune",
      analize: "Analize și aparate",
      cnas: "Acte CNAS",
      urgente: "Urgențe",
    },
  },
  en: {
    title: "Medical dictionary",
    subtitle: "What the words on prescriptions, test results and referrals mean",
    searchPlaceholder: "Search for a word",
    closeLabel: "Close dictionary",
    plainLabel: "Everyday word",
    formalLabel: "What the prescription or test result says",
    clinicalSignificanceLabel: "What the doctor looks for:",
    pronounceLabel: "Listen",
    emptyState: "We could not find this word. Try another one.",
    categoryTablistAria: "Dictionary categories",
    categories: {
      all: "All (22)",
      diabet: "Diabetes",
      cardiologie: "Heart and blood pressure",
      analize: "Tests and devices",
      cnas: "CNAS papers",
      urgente: "Emergencies",
    },
  },
  sq: {
    title: "Fjalor mjekësor",
    subtitle: "Çfarë duan të thonë fjalët në receta, analiza dhe fletë referimi",
    searchPlaceholder: "Kërko një fjalë",
    closeLabel: "Mbyll fjalorin",
    plainLabel: "Fjala e përditshme",
    formalLabel: "Si shkruhet në recetë ose në analiza",
    clinicalSignificanceLabel: "Çfarë shikon mjeku:",
    pronounceLabel: "Dëgjo",
    emptyState: "Nuk e gjetëm këtë fjalë. Provo një tjetër.",
    categoryTablistAria: "Kategoritë e fjalorit",
    categories: {
      all: "Të gjitha (22)",
      diabet: "Diabeti",
      cardiologie: "Zemra dhe tensioni",
      analize: "Analiza dhe aparate",
      cnas: "Dokumentet CNAS",
      urgente: "Urgjencat",
    },
  },
  it: {
    title: "Dizionario medico",
    subtitle: "Cosa vogliono dire le parole su ricette, referti e impegnative",
    searchPlaceholder: "Cerca una parola",
    closeLabel: "Chiudi il dizionario",
    plainLabel: "Parola di tutti i giorni",
    formalLabel: "Come è scritto su ricetta o referto",
    clinicalSignificanceLabel: "Cosa guarda il medico:",
    pronounceLabel: "Ascolta",
    emptyState: "Non abbiamo trovato questa parola. Provane un'altra.",
    categoryTablistAria: "Categorie del dizionario",
    categories: {
      all: "Tutti (22)",
      diabet: "Diabete",
      cardiologie: "Cuore e pressione",
      analize: "Esami e apparecchi",
      cnas: "Documenti CNAS",
      urgente: "Emergenze",
    },
  },
};

