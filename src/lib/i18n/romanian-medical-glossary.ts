import type { Lang } from "@/lib/i18n/translations";

export type MedicalGlossaryCategory =
  | "diabet"
  | "cardiologie"
  | "analize"
  | "preventie"
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
  relatedTopicSlugs?: string[];
}

export const ROMANIAN_MEDICAL_GLOSSARY: DualRegisterGlossaryEntry[] = [
  {
    id: "glicemie-a-jeun",
    plainTermRo: "Concentrația de glucoză din sânge pe nemâncate",
    formalTermRo: "Glicemie à jeun / Glicemie bazală",
    category: "diabet",
    layExplanationRo:
      "Se măsoară dimineața, după cel puțin 8 ore fără mâncare. Arată concentrația de glucoză (zahăr) din sânge atunci când corpul este în repaus.",
    clinicalSignificanceRo:
      "Normal: 70–99 mg/dL. Între 100 și 125 mg/dL înseamnă prediabet. 126 mg/dL sau mai mult, la 2 analize, poate însemna diabet.",
    speechTextRo:
      "Concentrația de glucoză din sânge pe nemâncate. Pe analize scrie glicemie à jeun. Se măsoară dimineața, pe stomacul gol, în miligrame pe decilitru.",
    relatedTopicSlug: "diabetes",
  },
  {
    id: "glicemie-postprandial",
    plainTermRo: "Concentrația de glucoză din sânge la 2 ore după masă",
    formalTermRo: "Glicemie postprandială",
    category: "diabet",
    layExplanationRo:
      "Se măsoară la 2 ore după ce ai început să mănânci. Arată cum reglează organismul concentrația de glucoză (zahăr) provenită din alimente.",
    clinicalSignificanceRo:
      "Normal: sub 140 mg/dL. Între 140 și 199 mg/dL indică toleranță alterată la glucoză. 200 mg/dL sau mai mult poate însemna diabet.",
    speechTextRo:
      "Concentrația de glucoză din sânge la 2 ore după masă. Pe analize scrie glicemie postprandială. Valoarea normală este sub 140 miligrame pe decilitru.",
    relatedTopicSlug: "diabetes",
  },
  {
    id: "hipertensiune",
    plainTermRo: "Tensiune mare",
    formalTermRo: "Hipertensiune arterială (HTA)",
    category: "cardiologie",
    layExplanationRo:
      "Sângele exercită continuu o presiune prea mare asupra pereților arterelor. Inima depune un efort suplimentar, iar pereții arterelor sunt afectați în timp.",
    clinicalSignificanceRo:
      "Medicul o diagnostichează la valori de 140/90 mmHg sau mai mari, măsurate repetat. Crește cel mai mult riscul de infarct și de accident vascular cerebral.",
    speechTextRo:
      "Tensiune mare. Medicul îi spune hipertensiune arterială. Peste 140 cu 90, sângele apasă prea tare pe pereții arterelor și inima muncește prea greu, chiar dacă nu te doare nimic.",
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
      "Un cheag blochează complet o arteră a inimii. O parte din mușchiul inimii suferă leziuni din lipsă de oxigen.",
    clinicalSignificanceRo:
      "Urgență. Sună la 112. Artera trebuie deschisă la spital (angioplastie) în primele ore.",
    speechTextRo:
      "Atac de cord. Medicul îi spune infarct miocardic acut. Dacă simți o apăsare puternică în piept care merge spre braț sau spre maxilar, sună imediat la 112.",
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
      "Simți că nu ai suficient aer sau respiri greu. Dacă apare la efort mic sau când stai întins în pat, poate fi semn că inima este suprasolicitată.",
    clinicalSignificanceRo:
      "Dacă rămâi fără aer la efort sau ai nevoie de mai multe perne ca să dormi (ortopnee), poate exista o acumulare de lichid în plămâni (congestie pulmonară). Mergi urgent la cardiolog.",
    speechTextRo:
      "Lipsă de aer. Medicul îi spune dispnee. Dacă respiri greu la efort mic sau când stai întins în pat, poate fi acumulare de lichid în plămâni și trebuie să mergi urgent la medic.",
    relatedTopicSlug: "heart-health",
  },
  {
    id: "edeme",
    plainTermRo: "Glezne și picioare umflate",
    formalTermRo: "Edeme periferice / retromaleolare",
    category: "cardiologie",
    layExplanationRo:
      "Apare retenție de lichid în țesuturile de la nivelul gleznelor și gambelor. Se întâmplă când inima sau venele nu mai împing eficient sângele înapoi în sus.",
    clinicalSignificanceRo:
      "Dacă apeși cu degetul și rămâne o adâncitură (semnul godeului), organismul prezintă retenție de lichid și sare. Este un semn frecvent în insuficiența cardiacă.",
    speechTextRo:
      "Glezne și picioare umflate. Medicul le spune edeme periferice. Retenția de lichid în țesuturile gleznelor arată adesea că inima are nevoie de consult medical.",
    relatedTopicSlug: "heart-health",
  },
  {
    id: "hemoglobina-glicata",
    plainTermRo: "Media concentrației de glucoză din ultimele 3 luni",
    formalTermRo: "Hemoglobină glicată (HbA1c)",
    category: "diabet",
    layExplanationRo:
      "O analiză de sânge care arată media concentrației de glucoză (zahăr) din sânge în ultimele 90 de zile. Indică cât de bine este echilibrat diabetul.",
    clinicalSignificanceRo:
      "La cei mai mulți adulți cu diabet, ținta este sub 7%. Peste 8%, medicul trebuie să ajusteze tratamentul.",
    speechTextRo:
      "Media concentrației de glucoză din ultimele 3 luni. Pe analize scrie hemoglobină glicată sau HbA1c. Pentru cei mai mulți adulți cu diabet, ținta este sub 7 la sută.",
    relatedTopicSlug: "diabetes",
  },
  {
    id: "fibrilatie-atriala",
    plainTermRo: "Inimă care bate neregulat și repede",
    formalTermRo: "Fibrilație atrială (FiA)",
    category: "cardiologie",
    layExplanationRo:
      "Inima bate repede și fără ritm regulat. Sângele nu se golește complet din camerele superioare ale inimii, ceea ce poate duce la formarea cheagurilor.",
    clinicalSignificanceRo:
      "Riscul de accident vascular cerebral crește de 5 ori. Sunt necesare medicamente anticoagulante care împiedică formarea cheagurilor de sânge, prescrise de cardiolog.",
    speechTextRo:
      "Inimă care bate neregulat și repede. Medicul îi spune fibrilație atrială. Cardiologul prescrie medicamente anticoagulante care împiedică formarea cheagurilor de sânge.",
    relatedTopicSlug: "heart-health",
  },
  {
    id: "insuficienta-cardiaca",
    plainTermRo: "Inimă slăbită, care pompează greu",
    formalTermRo: "Insuficiență cardiacă cronică",
    category: "cardiologie",
    layExplanationRo:
      "Inima își pierde treptat puterea de a pompa suficient sânge către organe. Obosești repede și apare retenție de lichid în țesuturi și plămâni.",
    clinicalSignificanceRo:
      "Afecțiune cronică ce necesită monitorizare constantă. Te cântărești zilnic, consumi sub 5 g de sare pe zi și iei medicamentele exact cum le-a prescris medicul.",
    speechTextRo:
      "Inimă slăbită. Medicul îi spune insuficiență cardiacă cronică. Cântărește-te zilnic pentru a observa din timp retenția de lichid, consumă puțină sare și ia tratamentul conform rețetei.",
    relatedTopicSlug: "heart-health",
  },
  {
    id: "neuropatie-diabetica",
    plainTermRo: "Amorțeli și furnicături în tălpi",
    formalTermRo: "Neuropatie diabetică periferică",
    category: "diabet",
    layExplanationRo:
      "Concentrația crescută de glucoză (zahăr) din sânge afectează treptat nervii din picioare. Sensibilitatea la durere scade, astfel încât pot apărea răni fără să le simți.",
    clinicalSignificanceRo:
      "Complicație frecventă în diabet. Verifică-ți tălpile în fiecare zi pentru a observa orice rană din timp.",
    speechTextRo:
      "Amorțeli și furnicături în tălpi. Medicul îi spune neuropatie diabetică. Nivelul crescut al glicemiei afectează treptat nervii, de aceea verifică-ți picioarele zilnic.",
    relatedTopicSlug: "diabetes",
  },
  {
    id: "retinopatie-diabetica",
    plainTermRo: "Vedere afectată de diabet",
    formalTermRo: "Retinopatie diabetică",
    category: "diabet",
    layExplanationRo:
      "Concentrația crescută de glucoză din sânge, menținută ani la rând, deteriorează vasele mici de sânge din spatele ochiului (retina).",
    clinicalSignificanceRo:
      "Este o cauză majoră de pierdere prevenibilă a vederii la adulți. O previi printr-un examen anual al fundului de ochi și menținerea HbA1c sub 7%.",
    speechTextRo:
      "Vedere afectată de diabet. Medicul îi spune retinopatie diabetică. Un examen anual al fundului de ochi și controlul glicemiei îți protejează vederea.",
    relatedTopicSlug: "diabetes",
  },
  {
    id: "cetoacidoza-diabetica",
    plainTermRo: "Complicație gravă a diabetului, cu sânge acid",
    formalTermRo: "Cetoacidoză diabetică (CAD)",
    category: "diabet",
    layExplanationRo:
      "Când lipsește sever insulina, organismul descompune grăsimile pentru energie și se acumulează acizi periculoși numiți corpi cetonici în sânge.",
    clinicalSignificanceRo:
      "Urgență care pune viața în pericol. Semne: respirație cu miros fructat, de acetonă, vărsături persistente, confuzie și deshidratare severă.",
    speechTextRo:
      "Complicație gravă a diabetului, cu acumulare de corpi cetonici în sânge. Medicul îi spune cetoacidoză diabetică. Dacă apar respirație cu miros de acetonă, vărsături sau confuzie, sună imediat la 112.",
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
    plainTermRo: "Aparat de măsurat glicemia (concentrația de glucoză)",
    formalTermRo: "Glucometru cu biosenzori",
    category: "analize",
    layExplanationRo:
      "Un aparat medical portabil. Pui pe bandeletă o picătură mică de sânge din marginea degetului, iar aparatul afișează în câteva secunde concentrația de glucoză (zahăr) din sânge, măsurată în mg/dL sau mmol/L.",
    clinicalSignificanceRo:
      "Te ajută să îți monitorizezi acasă nivelul glicemiei. Ai nevoie de bandelete compatibile cu aparatul și de ace sterile de unică folosință (lansete).",
    speechTextRo:
      "Aparat de măsurat glicemia, numit glucometru. Dintr-o picătură mică de sânge din deget, afișează în câteva secunde concentrația de glucoză din sânge, în miligrame pe decilitru sau milimoli pe litru.",
    relatedTopicSlug: "diabetes",
  },
  {
    id: "vaccin-imunizare",
    plainTermRo: "Vaccin (protecție imunitară)",
    formalTermRo: "Vaccinare / Imunizare activă",
    category: "preventie",
    layExplanationRo:
      "Preparat medical preventiv, administrat prin injecție sau picături orale, care antrenează sistemul imunitar să producă anticorpi și să recunoască din timp microbii, prevenind boli infecțioase grave la copii și adulți.",
    clinicalSignificanceRo:
      "Vaccinările din calendarul național și cele recomandate adulților scad masiv riscul de spitalizare și complicații severe.",
    speechTextRo:
      "Vaccin, adică protecție imunitară prin imunizare activă. Este un preparat medical preventiv care antrenează sistemul imunitar să producă anticorpi împotriva bolilor infecțioase grave la copii și adulți.",
    relatedTopicSlug: "preventive-screening",
    relatedTopicSlugs: ["preventive-care", "infectious-diseases"],
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
  "en" | "sq" | "it" | "hr" | "rom" | "ru",
  Record<string, LocalizedGlossaryText>
> = {
  ru: {
    "glicemie-a-jeun": {
      plainTerm: "Уровень сахара в крови натощак",
      formalTerm: "Глюкоза плазмы натощак (ГПН)",
      layExplanation:
        "Измеряется утром, после не менее 8 часов без еды. Он показывает, сколько сахара находится в вашей крови, пока ваше тело отдыхает.",
      clinicalSignificance:
        "Нормальный: 70–99 мг/дл. От 100 до 125 мг/дл означает преддиабет. Уровень 126 мг/дл или более в двух тестах может означать диабет.",
      speechText:
        "Уровень сахара в крови натощак. По результатам анализов это называется глюкозой плазмы натощак. Норма составляет от 70 до 99 миллиграммов на децилитр.",
    },
    "glicemie-postprandial": {
      plainTerm: "Уровень сахара в крови через 2 часа после еды",
      formalTerm: "Постпрандиальная глюкоза плазмы",
      layExplanation:
        "Измеряется через 2 часа после начала еды. Он показывает, насколько хорошо ваш организм усваивает сахар из пищи.",
      clinicalSignificance:
        "Нормальный: менее 140 мг/дл. От 140 до 199 мг/дл означает, что ваш организм борется с сахаром (нарушение толерантности к глюкозе). Уровень 200 мг/дл и более может означать диабет.",
      speechText:
        "Уровень сахара в крови через 2 часа после еды. Врачи называют это постпрандиальной глюкозой. Норма – менее 140 миллиграммов на децилитр.",
    },
    hipertensiune: {
      plainTerm: "Высокое кровяное давление",
      formalTerm: "Артериальная гипертензия",
      layExplanation:
        "Ваша кровь постоянно слишком сильно давит на стенки кровеносных сосудов. Сердце устает, сосуды повреждаются.",
      clinicalSignificance:
        "Диагноз ставится, когда показатели остаются на уровне 140/90 мм рт.ст. или выше. Это самый большой фактор риска сердечного приступа и инсульта.",
      speechText:
        "Высокое кровяное давление. Врачи называют это артериальной гипертензией. Выше 140 на 90 сердце работает слишком усердно, даже если ничего не болит.",
    },
    hipotensiune: {
      plainTerm: "Низкое кровяное давление",
      formalTerm: "Артериальная гипотония",
      layExplanation:
        "Ваше кровяное давление ниже нормы. Вы можете почувствовать головокружение, когда резко встаете, видите размытое изображение или теряете сознание.",
      clinicalSignificance:
        "Ниже 90/60 мм рт.ст. Если вы чувствуете себя хорошо, это может быть для вас нормально. Если вы почувствуете головокружение или слабость, врач проверит уровень жидкости и солей (электролитов).",
      speechText:
        "Низкое кровяное давление. Врачи называют это артериальной гипотонией. Если вы ниже 90 и выше 60, вы можете почувствовать головокружение или слабость, когда быстро встаете.",
    },
    "atac-de-cord": {
      plainTerm: "Сердечный приступ",
      formalTerm: "Острый инфаркт миокарда (ОИМ)",
      layExplanation:
        "Тромб полностью блокирует артерию сердца. Часть сердечной мышцы не получает кислорода и начинает повреждаться.",
      clinicalSignificance:
        "Чрезвычайная ситуация. Звоните 112. Артерию необходимо вскрыть в больнице (ангиопластика) в течение первых часов.",
      speechText:
        "Сердечный приступ. Врачи называют это острым инфарктом миокарда. Если вы чувствуете сокрушительную боль в груди, которая распространяется на руку или челюсть, позвоните по номеру 112 прямо сейчас.",
    },
    "atac-cerebral": {
      plainTerm: "Инсульт",
      formalTerm: "Цереброваскулярное нарушение (ЦВА)",
      layExplanation:
        "Кровь внезапно перестает достигать части мозга из-за тромба или кровотечения. Клетки мозга в этой части умирают.",
      clinicalSignificance:
        "Чрезвычайная ситуация. Звоните 112. Врачи проверяют признаки с помощью FAST-теста. Лекарство, растворяющее тромб (тромболизис), вводится в течение первых 4,5 часов.",
      speechText:
        "Инсульт. Врачи называют это нарушением мозгового кровообращения. Если лицо овисло, рука ослабла или речь стала невнятной, позвоните 112 прямо сейчас.",
    },
    dispnee: {
      plainTerm: "Одышка при активности или лежании",
      formalTerm: "Сердечная или респираторная одышка",
      layExplanation:
        "Вы чувствуете, что задыхаетесь или не можете нормально дышать. Если это происходит при легком усилии или при лежании в постели, возможно, у вас проблемы с сердцем.",
      clinicalSignificance:
        "Запахивание с усилием или необходимость спать на нескольких подушках (ортопноэ) может означать наличие жидкости в легких (застой в легких). Срочно обратитесь к кардиологу.",
      speechText:
        "Одышка. Врачи называют это одышкой. Если вам трудно дышать с легким усилием или в положении лежа, срочно обратитесь к врачу.",
    },
    edeme: {
      plainTerm: "Опухшие лодыжки и ноги",
      formalTerm: "Периферический отек/питтинговый отек",
      layExplanation:
        "Жидкость скапливается в лодыжках и голенях. Это происходит, когда ваше сердце или вены изо всех сил пытаются протолкнуть кровь обратно вверх.",
      clinicalSignificance:
        "Если при нажатии пальцем остается вмятина (ямка), ваше тело удерживает воду и соль. Это часто встречается при сердечной недостаточности.",
      speechText:
        "Опухшие лодыжки и ноги. Врачи называют это периферическими отеками. Скопление воды на лодыжках часто означает, что ваше сердце нуждается в помощи врача.",
    },
    "hemoglobina-glicata": {
      plainTerm: "Средний уровень сахара в крови за 3 месяца",
      formalTerm: "Гликированный гемоглобин (HbA1c)",
      layExplanation:
        "Анализ крови, показывающий средний уровень сахара в крови за последние 90 дней. Это показывает, насколько хорошо ваш диабет контролируется.",
      clinicalSignificance:
        "Для большинства взрослых с диабетом целевой показатель составляет менее 7%. При показателе выше 8% ваш врач должен пересмотреть ваше лечение.",
      speechText:
        "Средний уровень сахара в крови за 3 месяца. По результатам анализов он называется HbA1c. Для большинства людей с диабетом целевой показатель составляет менее 7 процентов.",
    },
    "fibrilatie-atriala": {
      plainTerm: "Быстрое, нерегулярное сердцебиение",
      formalTerm: "Мерцательная аритмия (ФП)",
      layExplanation:
        "Ваше сердце бьется быстро и не в ритме. Кровь не полностью покидает верхние камеры сердца, поэтому могут образовываться тромбы.",
      clinicalSignificance:
        "Это повышает вероятность инсульта в 5 раз. Вам нужны кроворазжижающие таблетки (антикоагулянты) у кардиолога.",
      speechText:
        "Быстрое, нерегулярное сердцебиение. Врачи называют это мерцательной аритмией. Посетите кардиолога, чтобы предотвратить образование тромбов и инсульт.",
    },
    "insuficienta-cardiaca": {
      plainTerm: "Слабое сердце, которое плохо качает кровь",
      formalTerm: "Хроническая сердечная недостаточность (ХСН)",
      layExplanation:
        "Ваше сердце постепенно теряет силу, чтобы перекачивать достаточное количество крови к органам. Вы быстро утомляетесь, и в вашем теле накапливается жидкость.",
      clinicalSignificance:
        "Длительное состояние, которое со временем ухудшается. Взвешивайтесь каждый день, ешьте менее 5 г соли в день и принимайте лекарства точно по назначению.",
      speechText:
        "Слабое сердце. Врачи называют это хронической сердечной недостаточностью. Взвешивайтесь каждый день, ешьте мало соли и принимайте лекарства точно по назначению.",
    },
    "neuropatie-diabetica": {
      plainTerm: "Онемение и покалывание в ногах",
      formalTerm: "Периферическая диабетическая нейропатия",
      layExplanation:
        "Высокий уровень сахара в крови повреждает нервы ног. Вы меньше чувствуете боль, поэтому раны могут остаться незамеченными.",
      clinicalSignificance:
        "Часто встречается у людей с диабетом. Каждый день осматривайте подошвы ног, чтобы вовремя обнаружить раны.",
      speechText:
        "Онемение и покалывание в ногах. Врачи называют это диабетической нейропатией. Проверяйте свои ноги каждый день, чтобы вовремя обнаружить раны.",
    },
    "retinopatie-diabetica": {
      plainTerm: "Повреждения глаз при диабете",
      formalTerm: "Диабетическая ретинопатия",
      layExplanation:
        "Годы высокого уровня сахара в крови повреждают мелкие кровеносные сосуды в задней части глаза (сетчатке).",
      clinicalSignificance:
        "Основная причина предотвратимой слепоты у взрослых. Предотвратите это, проверяя зрение каждый год, используя капли для расширения зрачков и уровень HbA1c ниже 7%.",
      speechText:
        "Повреждение глаз при диабете. Врачи называют это диабетической ретинопатией. Ежегодная проверка зрения защищает ваше зрение.",
    },
    "cetoacidoza-diabetica": {
      plainTerm: "Опасное накопление кислоты в крови.",
      formalTerm: "Диабетический кетоацидоз (ДКА)",
      layExplanation:
        "Когда вашему организму остро не хватает инсулина, он сжигает жир для получения энергии. Это приводит к накоплению ядовитых кислот (кетонов) в крови.",
      clinicalSignificance:
        "Опасная для жизни чрезвычайная ситуация. Признаки: дыхание с фруктовым запахом, непрекращающаяся рвота, спутанность сознания и обезвоживание.",
      speechText:
        "Опасное накопление кислоты в крови. Врачи называют это диабетическим кетоацидозом. Если у вас рвота, спутанность сознания или учащенное дыхание, позвоните 112.",
    },
    electrocardiograma: {
      plainTerm: "Тест сердечного ритма",
      formalTerm: "Электрокардиограмма (ЭКГ/ЭКГ)",
      layExplanation:
        "Быстрый тест, который не повредит. Маленькие датчики прикрепляются к вашей коже, а машина записывает на бумаге, как бьется ваше сердце.",
      clinicalSignificance:
        "Показывает нерегулярное сердцебиение, сердце, которое не получает достаточно крови (ишемия), а также признаки недавнего или старого сердечного приступа.",
      speechText:
        "Тест сердечного ритма. Врачи называют это электрокардиограммой или ЭКГ. Это быстро, не больно и показывает, как бьется ваше сердце.",
    },
    ecocardiografie: {
      plainTerm: "УЗИ сердца",
      formalTerm: "Трансторакальная эхокардиограмма (ТТЭ)",
      layExplanation:
        "УЗИ. На экране вы видите стенки сердца, как движутся клапаны и насколько сильно сердце качает кровь.",
      clinicalSignificance:
        "Измеряет, сколько крови сердце выбрасывает при каждом ударе (фракция выброса, ФВЛЖ). Он также обнаруживает проблемы с клапанами и утолщение сердечной мышцы.",
      speechText:
        "УЗИ сердца. Врачи называют это эхокардиограммой. Он показывает, как движутся клапаны и насколько сильно работает сердце.",
    },
    "tensiometru-digital": {
      plainTerm: "Автоматический тонометр",
      formalTerm: "Цифровой осциллометрический сфигмоманометр",
      layExplanation:
        "Устройство с манжетой, которое надевается на руку. Он надувается сам по себе и показывает ваше кровяное давление и пульс.",
      clinicalSignificance:
        "Хорошо для проверки дома. Выбирайте клинически протестированную модель с манжетой на плече, а не на запястье.",
      speechText:
        "Автоматический тонометр. Модели с манжетой на плече дают наиболее точные показания в домашних условиях.",
    },
    glucometru: {
      plainTerm: "Измеритель сахара в крови",
      formalTerm: "Капиллярный биосенсорный глюкометр",
      layExplanation:
        "Небольшое устройство. Капните каплю крови с кончика пальца на полоску, и через несколько секунд она покажет уровень сахара в крови.",
      clinicalSignificance:
        "Помогает вам самостоятельно следить за своим диабетом. Вам потребуются тест-полоски, подходящие к вашему глюкометру, и стерильные одноразовые иглы (ланцеты).",
      speechText:
        "Измеритель сахара в крови или глюкометр. Он показывает уровень сахара в крови по 1 капле крови за несколько секунд.",
    },
    "bilet-de-trimitere": {
      plainTerm: "Направление к специалисту",
      formalTerm: "Направление специалиста по национальному страхованию",
      layExplanation:
        "Форма, которую выдает вам семейный врач. Если вы застрахованы, посещение специалиста будет бесплатным или частично оплаченным национальным медицинским страхованием.",
      clinicalSignificance:
        "Действителен в течение 30 дней при внезапном заболевании и до 90 дней при хронических заболеваниях, сопровождаемых национальными программами здравоохранения.",
      speechText:
        "Направление к специалисту. При этом национальная медицинская страховка оплачивает все или часть ваших посещений специалиста и анализов.",
    },
    "prescriptie-compensata": {
      plainTerm: "Рецепт со скидкой или бесплатно.",
      formalTerm: "Компенсированный медицинский рецепт",
      layExplanation:
        "Электронный рецепт на лекарства, которые оплачены частично (50%, 90%) или полностью (100%) для лечения хронических заболеваний, таких как диабет.",
      clinicalSignificance:
        "Основные лекарства от диабета и других хронических заболеваний полностью покрываются государственным медицинским страхованием.",
      speechText:
        "Рецепт со скидкой или бесплатно. Лечение диабета и других хронических заболеваний оплачивается за счет государственного медицинского страхования.",
    },
    "centru-de-permanenta": {
      plainTerm: "Поликлиника в нерабочее время",
      formalTerm: "Учреждение первичной медико-санитарной помощи в нерабочее время",
      layExplanation:
        "Клиника, которая открыта, когда ваш семейный врач закрыт: по ночам, в выходные и праздничные дни. Туда обращаются при неотложных проблемах, не опасных для жизни.",
      clinicalSignificance:
        "Он лечит проблемы, которые не подвергают вашу жизнь риску, поэтому отделения неотложной помощи в больницах остаются бесплатными для серьезных случаев.",
      speechText:
        "Поликлиника в круглосуточном режиме. Он открыт ночью и в выходные дни, прийти можно без предварительной записи.",
    },
    "unitate-primiri-urgente": {
      plainTerm: "Отделение неотложной помощи больницы (ER)",
      formalTerm: "Отделение неотложной помощи (ED/UPU)",
      layExplanation:
        "Отделение больницы, работающее круглосуточно, 24 часа в сутки. Здесь лечат серьезные случаи.",
      clinicalSignificance:
        "При угрозе жизни: несчастные случаи, боли в груди, потеря сознания (кома). Вас не видно в порядке прибытия. В первую очередь идут самые серьезные дела.",
      speechText:
        "Больница, отделение неотложной помощи. Он открыт днем ​​и ночью для серьезных чрезвычайных ситуаций.",
    },
  },

  en: {
    "glicemie-a-jeun": {
      plainTerm: "Fasting blood glucose concentration",
      formalTerm: "Fasting plasma glucose (FPG)",
      layExplanation:
        "Measured in the morning, after at least 8 hours without food. It shows your blood glucose (sugar) concentration while your body is at rest.",
      clinicalSignificance:
        "Normal: 70–99 mg/dL. 100 to 125 mg/dL means prediabetes. 126 mg/dL or more on 2 tests can mean diabetes.",
      speechText:
        "Fasting blood glucose concentration. On test results it is called fasting plasma glucose. Normal is between 70 and 99 milligrams per deciliter.",
    },
    "glicemie-postprandial": {
      plainTerm: "Blood glucose concentration 2 hours after a meal",
      formalTerm: "Postprandial plasma glucose",
      layExplanation:
        "Measured 2 hours after you start eating. It shows how effectively your body regulates the blood glucose (sugar) concentration coming from food.",
      clinicalSignificance:
        "Normal: under 140 mg/dL. 140 to 199 mg/dL indicates impaired glucose tolerance. 200 mg/dL or more can mean diabetes.",
      speechText:
        "Blood glucose concentration 2 hours after a meal. Doctors call it postprandial plasma glucose. Normal is under 140 milligrams per deciliter.",
    },
    hipertensiune: {
      plainTerm: "High blood pressure",
      formalTerm: "Arterial hypertension",
      layExplanation:
        "Your blood pushes too hard against your artery walls all the time. Your heart works harder, and the artery walls suffer damage over time.",
      clinicalSignificance:
        "Diagnosed when repeated readings stay at 140/90 mmHg or higher. It is the leading risk factor for heart attack and stroke.",
      speechText:
        "High blood pressure. Doctors call it arterial hypertension. Above 140 over 90, blood presses too hard on your artery walls and your heart works too hard, even if nothing hurts.",
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
        "A blood clot completely blocks an artery of the heart. Part of the heart muscle suffers injury from lack of oxygen.",
      clinicalSignificance:
        "Emergency. Call 112. The artery must be opened in hospital (angioplasty) within the first hours.",
      speechText:
        "Heart attack. Doctors call it acute myocardial infarction. If you feel crushing pressure in your chest that spreads to your arm or jaw, call 112 immediately.",
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
      plainTerm: "Shortness of breath when active or lying down",
      formalTerm: "Cardiac or respiratory dyspnea",
      layExplanation:
        "You feel short of air or struggle to breathe. If it happens with light effort or while lying flat in bed, your heart may be under strain.",
      clinicalSignificance:
        "Getting out of breath with effort, or needing several pillows to sleep (orthopnea), can indicate fluid buildup in the lungs (pulmonary congestion). See a cardiologist urgently.",
      speechText:
        "Shortness of breath. Doctors call it dyspnea. If you struggle to breathe with light effort or when lying flat, it can signal fluid buildup in the lungs, so see a doctor urgently.",
    },
    edeme: {
      plainTerm: "Swollen ankles and legs",
      formalTerm: "Peripheral edema / Pitting edema",
      layExplanation:
        "Fluid retention develops in the tissues of your ankles and lower legs. It happens when your heart or veins struggle to pump blood back upward.",
      clinicalSignificance:
        "If pressing gently with a finger leaves an indentation (pitting), your body has fluid and salt retention in the tissues. This is common in heart failure.",
      speechText:
        "Swollen ankles and legs. Doctors call it peripheral edema. Fluid retention in the tissues around the ankles often means your heart needs medical evaluation.",
    },
    "hemoglobina-glicata": {
      plainTerm: "Average blood glucose concentration over 3 months",
      formalTerm: "Glycated hemoglobin (HbA1c)",
      layExplanation:
        "A blood test that shows your average blood glucose (sugar) concentration over the past 90 days. It reflects how well your diabetes is managed.",
      clinicalSignificance:
        "For most adults with diabetes, the target is under 7%. Above 8%, your doctor needs to adjust your treatment.",
      speechText:
        "Average blood glucose concentration over 3 months. On test results it is called HbA1c. For most adults with diabetes, the target is under 7 percent.",
    },
    "fibrilatie-atriala": {
      plainTerm: "Fast, irregular heartbeat",
      formalTerm: "Atrial fibrillation (AFib)",
      layExplanation:
        "Your heart beats fast and out of rhythm. Blood does not empty completely from the upper chambers of the heart, so blood clots can form.",
      clinicalSignificance:
        "It increases stroke risk 5-fold. You need anticoagulant medicines that prevent blood clots from forming, prescribed by a cardiologist.",
      speechText:
        "Fast, irregular heartbeat. Doctors call it atrial fibrillation. A cardiologist prescribes anticoagulant medicines that prevent blood clots and stroke.",
    },
    "insuficienta-cardiaca": {
      plainTerm: "Weakened heart that pumps less effectively",
      formalTerm: "Chronic heart failure (CHF)",
      layExplanation:
        "Your heart gradually loses strength to pump enough blood to your organs. You tire easily and develop fluid retention in the lungs and body tissues.",
      clinicalSignificance:
        "A chronic condition requiring close monitoring. Weigh yourself every day, eat less than 5 g of salt per day and take your medicines exactly as prescribed.",
      speechText:
        "Weakened heart. Doctors call it chronic heart failure. Weigh yourself daily to detect fluid retention early, limit salt and take your medicines as prescribed.",
    },
    "neuropatie-diabetica": {
      plainTerm: "Numbness and tingling in the feet",
      formalTerm: "Peripheral diabetic neuropathy",
      layExplanation:
        "Persistently high blood glucose (sugar) concentration gradually damages the nerves in your feet. Pain sensation decreases, so sores or wounds can go unnoticed.",
      clinicalSignificance:
        "Common in people with diabetes. Check the soles of your feet every day to detect any wounds early.",
      speechText:
        "Numbness and tingling in the feet. Doctors call it diabetic neuropathy. Check your feet every day so small wounds are caught early.",
    },
    "retinopatie-diabetica": {
      plainTerm: "Vision damage from diabetes",
      formalTerm: "Diabetic retinopathy",
      layExplanation:
        "Years of elevated blood glucose concentration gradually damage the tiny blood vessels in the light-sensitive tissue at the back of the eye (the retina).",
      clinicalSignificance:
        "A leading cause of preventable blindness in adults. Prevent it with an annual dilated eye exam and keeping HbA1c under 7%.",
      speechText:
        "Vision damage from diabetes. Doctors call it diabetic retinopathy. An annual eye exam and steady blood glucose control protect your sight.",
    },
    "cetoacidoza-diabetica": {
      plainTerm: "Dangerous ketone acid buildup in the blood",
      formalTerm: "Diabetic ketoacidosis (DKA)",
      layExplanation:
        "When the body severely lacks insulin, it breaks down fat for energy and dangerous acids called ketones build up in your blood.",
      clinicalSignificance:
        "Life-threatening emergency. Signs: fruity, acetone-like breath odor, persistent vomiting, confusion and severe dehydration.",
      speechText:
        "Dangerous acid buildup in the blood, called diabetic ketoacidosis. If you notice fruity acetone-like breath, vomiting, confusion or rapid breathing, call 112 immediately.",
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
      plainTerm: "Blood glucose concentration meter",
      formalTerm: "Capillary biosensor glucometer",
      layExplanation:
        "A portable medical device. From a tiny drop of fingertip capillary blood placed on a test strip, it measures and displays your blood glucose (sugar) concentration in mg/dL or mmol/L within seconds.",
      clinicalSignificance:
        "Helps you monitor your blood glucose levels at home. You need compatible test strips for your meter and sterile single-use lancets.",
      speechText:
        "Blood glucose concentration meter, or glucometer. From a tiny drop of fingertip blood on a test strip, it displays your blood glucose concentration in milligrams per deciliter or millimoles per liter within seconds.",
    },
    "vaccin-imunizare": {
      plainTerm: "Vaccine (immune protection)",
      formalTerm: "Vaccination / Active immunization",
      layExplanation:
        "A preventive medical preparation, given by injection or oral drops, that safely trains the immune system to make antibodies and recognize germs early, preventing serious infectious diseases in children and adults.",
      clinicalSignificance:
        "Routine childhood immunizations and recommended adult vaccines dramatically lower the risk of hospitalization and severe complications.",
      speechText:
        "Vaccine, or active immunization. It is a preventive medical preparation that safely trains your immune system to make antibodies against serious infectious diseases.",
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
      plainTerm: "Përqendrimi i glukozës në gjak esëll",
      formalTerm: "Glicemia esëll / Glicemia bazale",
      layExplanation:
        "Matet në mëngjes, pasi nuk ke ngrënë për të paktën 8 orë. Tregon përqendrimin e glukozës (sheqerit) në gjak kur trupi është në qetësi.",
      clinicalSignificance:
        "Normale: 70–99 mg/dL. Nga 100 deri në 125 mg/dL do të thotë paradiabet. 126 mg/dL ose më shumë, në 2 analiza, mund të jetë diabet.",
      speechText:
        "Përqendrimi i glukozës në gjak esëll. Në analiza shkruhet glicemia esëll. Matet në mëngjes, me stomak bosh, në miligramë për decilitër.",
    },
    "glicemie-postprandial": {
      plainTerm: "Përqendrimi i glukozës në gjak 2 orë pas ngrënies",
      formalTerm: "Glicemia postprandiale",
      layExplanation:
        "Matet 2 orë pasi ke filluar të hash. Tregon si e rregullon trupi përqendrimin e glukozës (sheqerit) në gjak pas ushqimit.",
      clinicalSignificance:
        "Normale: nën 140 mg/dL. Nga 140 deri në 199 mg/dL tregon tolerancë të dëmtuar ndaj glukozës. 200 mg/dL ose më shumë mund të jetë diabet.",
      speechText:
        "Përqendrimi i glukozës në gjak 2 orë pas ngrënies. Mjeku e quan glicemi postprandiale. Duhet të jetë nën 140 miligramë për decilitër.",
    },
    hipertensiune: {
      plainTerm: "Tensioni i lartë i gjakut",
      formalTerm: "Hipertensioni arterial",
      layExplanation:
        "Gjaku ushtron vazhdimisht presion tepër të lartë mbi muret e arterieve. Zemra sforcohet dhe muret e arterieve pësojnë dëmtime me kalimin e kohës.",
      clinicalSignificance:
        "Diagnostikohet kur vlerat e matura disa herë mbeten 140/90 mmHg ose më lart. Është faktori kryesor i rrezikut për infarkt dhe goditje në tru.",
      speechText:
        "Tensioni i lartë i gjakut. Mjeku e quan hipertension arterial. Mbi 140 me 90, gjaku shtyp fort muret e arterieve dhe zemra mbingarkohet, edhe kur nuk ke dhimbje.",
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
        "Një mpiksje gjaku bllokon plotësisht një arterie të zemrës. Një pjesë e muskulit të zemrës pëson dëmtime nga mungesa e oksigjenit.",
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
        "Ndien mungesë ajri ose merr frymë me vështirësi. Nëse ndodh me pak sforcim ose kur je shtrirë në shtrat, zemra mund të jetë e mbingarkuar.",
      clinicalSignificance:
        "Nëse të mungon ajri gjatë sforcimit ose të duhen disa jastëkë për të fjetur (ortopne), mund të ketë mbledhje lëngu në mushkëri (kongjestion pulmonar). Shko urgjent te kardiologu.",
      speechText:
        "Mungesë ajri. Mjeku e quan dispne. Nëse merr frymë me vështirësi me pak lodhje ose kur je shtrirë, mund të ketë mbledhje lëngu në mushkëri dhe duhet të shkosh urgjent te mjeku.",
    },
    edeme: {
      plainTerm: "Këmbë dhe kyçe të ënjtura",
      formalTerm: "Edema periferike",
      layExplanation:
        "Krijohet mbajtje lëngu në indet e kyçeve dhe pulpave të këmbëve. Ndodh kur zemra ose venat nuk e kthejnë mirë gjakun lart.",
      clinicalSignificance:
        "Nëse shtyp lehtë me gisht dhe mbetet një gropëz, trupi ka mbajtje lëngu dhe kripe në inde. Kjo ndodh shpesh në insuficiencën kardiake.",
      speechText:
        "Këmbë dhe kyçe të ënjtura. Mjeku e quan edemë periferike. Mbajtja e lëngut në indet e kyçeve shpesh tregon që zemra duhet kontrolluar nga mjeku.",
    },
    "hemoglobina-glicata": {
      plainTerm: "Përqendrimi mesatar i glukozës në 3 muajt e fundit",
      formalTerm: "Hemoglobina e glikuar (HbA1c)",
      layExplanation:
        "Analizë gjaku që tregon përqendrimin mesatar të glukozës (sheqerit) në gjak gjatë 90 ditëve të fundit. Tregon sa mirë mbahet nën kontroll diabeti.",
      clinicalSignificance:
        "Për shumicën e të rriturve me diabet, objektivi është nën 7%. Mbi 8%, mjeku duhet ta përshtatë mjekimin.",
      speechText:
        "Përqendrimi mesatar i glukozës në 3 muajt e fundit. Në analiza shkruhet HbA1c. Për shumicën e të rriturve me diabet, objektivi është nën 7 përqind.",
    },
    "fibrilatie-atriala": {
      plainTerm: "Zemër që rreh shpejt dhe pa ritëm",
      formalTerm: "Fibrilacioni atrial",
      layExplanation:
        "Zemra rreh shpejt dhe në mënyrë të çrregullt. Gjaku nuk zbrazet plotësisht nga dhomat e sipërme të zemrës, prandaj mund të formohen mpiksje gjaku.",
      clinicalSignificance:
        "Rrit 5 herë rrezikun e goditjes në tru. Nevojiten barna antikoagulante që pengojnë formimin e mpiksjeve të gjakut, të përshkruara nga kardiologu.",
      speechText:
        "Zemër që rreh shpejt dhe pa ritëm. Mjeku e quan fibrilacion atrial. Kardiologu jep barna antikoagulante që pengojnë formimin e mpiksjeve të gjakut.",
    },
    "insuficienta-cardiaca": {
      plainTerm: "Zemër e dobësuar që pompon me vështirësi",
      formalTerm: "Insuficienca kardiake kronike",
      layExplanation:
        "Zemra humb gradualisht forcën për të pompuar mjaftueshëm gjak drejt organeve. Lodhesh shpejt dhe krijohet mbajtje lëngu në inde dhe mushkëri.",
      clinicalSignificance:
        "Gjendje kronike që kërkon ndjekje të rregullt. Peshohu çdo ditë, konsumo më pak se 5 gramë kripë në ditë dhe merr barnat saktësisht sipas recetës së mjekut.",
      speechText:
        "Zemër e dobësuar. Mjeku e quan insuficiencë kardiake kronike. Peshohu çdo ditë për të vënë re mbajtjen e lëngut në trup, pakëso kripën dhe merr mjekimin sipas recetës.",
    },
    "neuropatie-diabetica": {
      plainTerm: "Mpirje dhe shpime te shputat e këmbëve",
      formalTerm: "Neuropatia diabetike periferike",
      layExplanation:
        "Përqendrimi i lartë i glukozës (sheqerit) në gjak prek dhe dëmton gradualisht nervat e këmbëve. Ndjeshmëria ndaj dhimbjes ulet, prandaj mund të shfaqen plagë pa i vënë re.",
      clinicalSignificance:
        "Ndërlikim i shpeshtë te personat me diabet. Kontrollo shputat e këmbëve çdo ditë për të zbuluar herët çdo plagë.",
      speechText:
        "Mpirje dhe shpime te shputat. Mjeku e quan neuropati diabetike. Kontrollo këmbët çdo ditë që plagët e vogla të kapen në kohë.",
    },
    "retinopatie-diabetica": {
      plainTerm: "Dëmtim i shikimit nga diabeti",
      formalTerm: "Retinopatia diabetike",
      layExplanation:
        "Përqendrimi i lartë i glukozës në gjak për vite me radhë dëmton gradualisht enët e vogla të gjakut në pjesën e pasme të syrit (retinën).",
      clinicalSignificance:
        "Shkak kryesor i humbjes së parandalueshme të shikimit te të rriturit. Parandalohet me kontroll të fundit të syrit çdo vit dhe me HbA1c nën 7%.",
      speechText:
        "Dëmtim i shikimit nga diabeti. Mjeku e quan retinopati diabetike. Kontrolli vjetor i syrit dhe mbajtja e glicemisë nën kontroll të mbrojnë shikimin.",
    },
    "cetoacidoza-diabetica": {
      plainTerm: "Mbledhje e rrezikshme e acideve ketonike në gjak",
      formalTerm: "Ketoacidoza diabetike (KAD)",
      layExplanation:
        "Kur mungon rëndë insulina, organizmi shpërbën yndyrnat për energji dhe në gjak grumbullohen acide të rrezikshme të quajtura trupa ketonikë.",
      clinicalSignificance:
        "Urgjencë që rrezikon jetën. Shenjat: frymë me erë frutash ose acetoni, të vjella të vazhdueshme, hutim dhe dehidrim i rëndë.",
      speechText:
        "Mbledhje e rrezikshme e acideve në gjak nga diabeti, e quajtur ketoacidozë diabetike. Nëse ke frymë me erë acetoni, të vjella, hutim ose frymëmarrje të shpejtë, telefono menjëherë 112.",
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
      plainTerm: "Aparat për matjen e përqendrimit të glukozës në gjak",
      formalTerm: "Glukometër me biosensorë",
      layExplanation:
        "Aparat mjekësor portativ. Vendos në shirit një pikë të vogël gjaku kapilar nga ana e gishtit dhe aparati shfaq brenda pak sekondash përqendrimin e glukozës (sheqerit) në gjak, të matur në mg/dL ose mmol/L.",
      clinicalSignificance:
        "Të ndihmon të monitorosh vetë nivelin e glicemisë në shtëpi. Duhen shirita të përshtatshëm për aparatin dhe lanseta sterile njëpërdorimëshe.",
      speechText:
        "Aparat për matjen e përqendrimit të glukozës në gjak, ose glukometër. Nga një pikë e vogël gjaku nga gishti, shfaq brenda pak sekondash përqendrimin e glukozës në miligramë për decilitër ose milimolë për litër.",
    },
    "vaccin-imunizare": {
      plainTerm: "Vaksinë (mbrojtje imunitare)",
      formalTerm: "Vaksinim / Imunizim aktiv",
      layExplanation:
        "Preparat mjekësor parandalues, që jepet me injeksion ose pika nga goja dhe stërvit në mënyrë të sigurt sistemin imunitar të prodhojë antitrupa e t'i njohë herët mikrobet, duke parandaluar sëmundje të rënda infektive te fëmijët dhe të rriturit.",
      clinicalSignificance:
        "Vaksinat e kalendarit kombëtar dhe ato të rekomanduara për të rriturit ulin ndjeshëm rrezikun e shtrimit në spital dhe ndërlikimeve të rënda.",
      speechText:
        "Vaksinë, ose imunizim aktiv. Është preparat mjekësor parandalues që stërvit sistemin imunitar të prodhojë antitrupa kundër sëmundjeve të rënda infektive.",
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
      plainTerm: "Concentrazione di glucosio nel sangue a digiuno",
      formalTerm: "Glicemia a digiuno / Glicemia basale",
      layExplanation:
        "Si misura al mattino, dopo almeno 8 ore senza mangiare. Indica la concentrazione di glucosio (zucchero) nel sangue quando il corpo è a riposo.",
      clinicalSignificance:
        "Normale: 70–99 mg/dL. Da 100 a 125 mg/dL indica prediabete. 126 mg/dL o più, in 2 esami, può indicare diabete.",
      speechText:
        "Concentrazione di glucosio nel sangue a digiuno. Sul referto si chiama glicemia a digiuno. Il valore normale è tra 70 e 99 milligrammi per decilitro.",
    },
    "glicemie-postprandial": {
      plainTerm: "Concentrazione di glucosio nel sangue 2 ore dopo il pasto",
      formalTerm: "Glicemia postprandiale",
      layExplanation:
        "Si misura 2 ore dopo l'inizio del pasto. Mostra come l'organismo regola la concentrazione di glucosio (zucchero) nel sangue derivante dal cibo.",
      clinicalSignificance:
        "Normale: sotto 140 mg/dL. Da 140 a 199 mg/dL indica ridotta tolleranza al glucosio. 200 mg/dL o più può indicare diabete.",
      speechText:
        "Concentrazione di glucosio nel sangue 2 ore dopo il pasto. Il medico la chiama glicemia postprandiale. Deve restare sotto 140 milligrammi per decilitro.",
    },
    hipertensiune: {
      plainTerm: "Pressione alta",
      formalTerm: "Ipertensione arteriosa",
      layExplanation:
        "Il sangue esercita costantemente una pressione eccessiva sulle pareti delle arterie. Il cuore si affatica e le pareti delle arterie subiscono danni nel tempo.",
      clinicalSignificance:
        "Si diagnostica quando valori ripetuti restano a 140/90 mmHg o più. È il principale fattore di rischio per infarto e ictus.",
      speechText:
        "Pressione alta. Il medico la chiama ipertensione arteriosa. Sopra 140 su 90 il sangue preme troppo sulle pareti delle arterie e il cuore lavora troppo, anche senza dolore.",
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
        "Un coagulo ostruisce completamente un'arteria del cuore. Una parte del muscolo cardiaco subisce lesioni per mancanza di ossigeno.",
      clinicalSignificance:
        "Emergenza. Chiama il 112. L'arteria va riaperta in ospedale (angioplastica) nelle prime ore.",
      speechText:
        "Attacco di cuore. Il medico lo chiama infarto miocardico acuto. Se senti una forte oppressione al petto che arriva al braccio o alla mandibola, chiama subito il 112.",
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
        "Senti mancanza d'aria o respiri con fatica. Se compare con piccoli sforzi o quando sei sdraiato a letto, il cuore può essere affaticato.",
      clinicalSignificance:
        "Se ti manca il fiato sotto sforzo o ti servono più cuscini per dormire (ortopnea), può esserci un accumulo di liquidi nei polmoni (congestione polmonare). Serve una visita urgente dal cardiologo.",
      speechText:
        "Fiato corto. Il medico la chiama dispnea. Se respiri a fatica con piccoli sforzi o da sdraiato, può indicare accumulo di liquidi nei polmoni: fatti visitare subito.",
    },
    edeme: {
      plainTerm: "Caviglie e gambe gonfie",
      formalTerm: "Edema periferico / Edema declive",
      layExplanation:
        "Si verifica ritenzione di liquidi nei tessuti di caviglie e polpacci. Succede quando il cuore o le vene faticano a riportare il sangue verso l'alto.",
      clinicalSignificance:
        "Se premi con un dito e resta un'impronta (segno della fovea), c'è ritenzione di liquidi e sali nei tessuti. È un segno frequente nello scompenso cardiaco.",
      speechText:
        "Caviglie e gambe gonfie. Il medico li chiama edemi periferici. La ritenzione di liquidi nei tessuti delle caviglie indica spesso che il cuore va controllato.",
    },
    "hemoglobina-glicata": {
      plainTerm: "Media della concentrazione di glucosio negli ultimi 3 mesi",
      formalTerm: "Emoglobina glicata (HbA1c)",
      layExplanation:
        "Un esame del sangue che indica la concentrazione media di glucosio (zucchero) nel sangue negli ultimi 90 giorni. Mostra quanto bene è compensato il diabete.",
      clinicalSignificance:
        "Per la maggior parte degli adulti con diabete, l'obiettivo è sotto il 7%. Sopra l'8%, il medico deve adeguare la terapia.",
      speechText:
        "Media della concentrazione di glucosio negli ultimi 3 mesi. Sul referto si chiama emoglobina glicata, o HbA1c. Per la maggior parte degli adulti con diabete, l'obiettivo è sotto il 7 per cento.",
    },
    "fibrilatie-atriala": {
      plainTerm: "Battito veloce e irregolare",
      formalTerm: "Fibrillazione atriale (FA)",
      layExplanation:
        "Il cuore batte veloce e senza ritmo regolare. Il sangue non si svuota del tutto dalle camere superiori del cuore, favorendo la formazione di coaguli.",
      clinicalSignificance:
        "Aumenta di 5 volte il rischio di ictus. Servono farmaci anticoagulanti che impediscono la formazione di coaguli di sangue, prescritti dal cardiologo.",
      speechText:
        "Battito veloce e irregolare. Il medico la chiama fibrillazione atriale. Il cardiologo prescrive farmaci anticoagulanti che impediscono la formazione di coaguli di sangue.",
    },
    "insuficienta-cardiaca": {
      plainTerm: "Cuore indebolito che pompa con difficoltà",
      formalTerm: "Scompenso cardiaco cronico / Insufficienza cardiaca",
      layExplanation:
        "Il cuore perde gradualmente la forza di pompare sangue sufficiente agli organi. Compare stanchezza precoce e ritenzione di liquidi nei tessuti e nei polmoni.",
      clinicalSignificance:
        "Condizione cronica che richiede controlli regolari. Pesati ogni giorno, consuma meno di 5 g di sale al giorno e assumi i farmaci esattamente come prescritto dal medico.",
      speechText:
        "Cuore indebolito. Il medico lo chiama scompenso cardiaco cronico. Pesati ogni giorno per riconoscere presto la ritenzione di liquidi, riduci il sale e segui la terapia prescritta.",
    },
    "neuropatie-diabetica": {
      plainTerm: "Formicolio e perdita di sensibilità ai piedi",
      formalTerm: "Neuropatia diabetica periferica",
      layExplanation:
        "La concentrazione elevata di glucosio (zucchero) nel sangue danneggia gradualmente i nervi dei piedi. La sensibilità al dolore si riduce, quindi possono comparire piccole ferite senza accorgersene.",
      clinicalSignificance:
        "Complicanza frequente nel diabete. Controlla la pianta dei piedi ogni giorno per individuare subito eventuali lesioni.",
      speechText:
        "Formicolio e perdita di sensibilità ai piedi. Il medico la chiama neuropatia diabetica. Controlla i piedi ogni giorno per individuare presto eventuali ferite.",
    },
    "retinopatie-diabetica": {
      plainTerm: "Danno alla vista causato dal diabete",
      formalTerm: "Retinopatia diabetica",
      layExplanation:
        "Anni di elevata concentrazione di glucosio nel sangue danneggiano gradualmente i piccoli vasi sanguigni sul fondo dell'occhio (la retina).",
      clinicalSignificance:
        "Principale causa di cecità prevenibile negli adulti. Si previene con un esame annuale del fondo oculare e mantenendo l'HbA1c sotto il 7%.",
      speechText:
        "Danno alla vista causato dal diabete. Il medico la chiama retinopatia diabetica. Un esame del fondo oculare ogni anno e il controllo della glicemia proteggono la vista.",
    },
    "cetoacidoza-diabetica": {
      plainTerm: "Accumulo pericoloso di acidi chetonici nel sangue",
      formalTerm: "Chetoacidosi diabetica (CAD)",
      layExplanation:
        "Quando manca gravemente l'insulina, l'organismo utilizza i grassi per produrre energia e si accumulano acidi pericolosi chiamati corpi chetonici nel sangue.",
      clinicalSignificance:
        "Emergenza che mette in pericolo la vita. Segni: alito con odore fruttato, simile all'acetone, vomito persistente, confusione e grave disidratazione.",
      speechText:
        "Accumulo pericoloso di acidi chetonici nel sangue, chiamato chetoacidosi diabetica. Se compaiono alito con odore di acetone, vomito, confusione o respiro rapido, chiama subito il 112.",
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
      plainTerm: "Misuratore della concentrazione di glucosio nel sangue",
      formalTerm: "Glucometro a biosensori capillari",
      layExplanation:
        "Un dispositivo medico portatile. Metti sulla striscia reattiva una piccola goccia di sangue capillare dal lato del polpastrello e in pochi secondi mostra la concentrazione di glucosio (zucchero) nel sangue (glicemia, in mg/dL o mmol/L).",
      clinicalSignificance:
        "Ti aiuta a monitorare autonomamente la glicemia a casa. Servono strisce reattive compatibili con il dispositivo e lancette pungidito sterili monouso.",
      speechText:
        "Misuratore della concentrazione di glucosio nel sangue, o glucometro. Da una piccola goccia di sangue del dito mostra in pochi secondi la concentrazione di glucosio in milligrammi per decilitro o millimoli per litro.",
    },
    "vaccin-imunizare": {
      plainTerm: "Vaccino (protezione immunitaria)",
      formalTerm: "Vaccinazione / Immunizzazione attiva",
      layExplanation:
        "Preparato medico preventivo, somministrato per iniezione o gocce orali, che allena in sicurezza il sistema immunitario a produrre anticorpi e riconoscere per tempo i microbi, prevenendo gravi malattie infettive in bambini e adulti.",
      clinicalSignificance:
        "Le vaccinazioni del calendario nazionale e quelle raccomandate negli adulti riducono drasticamente il rischio di ricovero ospedaliero e complicanze gravi.",
      speechText:
        "Vaccino, ossia immunizzazione attiva. È un preparato medico preventivo che allena il sistema immunitario a produrre anticorpi contro gravi malattie infettive.",
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

  hr: {
    "glicemie-a-jeun": {
      plainTerm: "Koncentracija glukoze u krvi natašte",
      formalTerm: "Glukoza u krvi natašte",
      layExplanation:
        "Mjeri se ujutro, nakon najmanje 8 sati bez hrane. Pokazuje koncentraciju glukoze (šećera) u krvi dok tijelo miruje.",
      clinicalSignificance:
        "Normalno: 70–99 mg/dL. Od 100 do 125 mg/dL znači predijabetes. 126 mg/dL ili više na 2 nalaza može značiti dijabetes.",
      speechText:
        "Koncentracija glukoze u krvi natašte. Na nalazu piše glukoza u krvi natašte. Mjeri se ujutro, na prazan želudac.",
    },
    "glicemie-postprandial": {
      plainTerm: "Koncentracija glukoze u krvi 2 sata nakon obroka",
      formalTerm: "Postprandijalna glukoza u plazmi",
      layExplanation:
        "Mjeri se 2 sata nakon početka obroka. Pokazuje kako tvoj organizam regulira koncentraciju glukoze (šećera) u krvi nakon hrane.",
      clinicalSignificance:
        "Normalno: ispod 140 mg/dL. Od 140 do 199 mg/dL označava oštećenu toleranciju glukoze. 200 mg/dL ili više može značiti dijabetes.",
      speechText:
        "Koncentracija glukoze u krvi 2 sata nakon obroka. Liječnik to zove postprandijalna glukoza. Normalno je ispod 140 miligrama po decilitru.",
    },
    hipertensiune: {
      plainTerm: "Visoki krvni tlak",
      formalTerm: "Arterijska hipertenzija",
      layExplanation:
        "Krv stalno prejako pritišće stijenke arterija. Srce radi pod većim opterećenjem, a stijenke arterija postupno trpe oštećenja s vremenom.",
      clinicalSignificance:
        "Dijagnosticira se kada vrijednosti ostaju na 140/90 mmHg ili više kroz više mjerenja. Najveći je čimbenik rizika za srčani i moždani udar.",
      speechText:
        "Visoki krvni tlak. Liječnik to zove arterijska hipertenzija. Iznad 140 sa 90 krv prejako pritišće stijenke arterija i srce radi preteško, čak i ako te ništa ne boli.",
    },
    hipotensiune: {
      plainTerm: "Niski krvni tlak",
      formalTerm: "Arterijska hipotenzija",
      layExplanation:
        "Krvni tlak niži je od uobičajenog. Može ti se zavrtjeti kada naglo ustaneš, zamutiti vid ili možeš izgubiti svijest.",
      clinicalSignificance:
        "Ispod 90/60 mmHg. Ako se osjećaš dobro, to može biti normalno za tebe. Ako imaš vrtoglavicu ili nesvjesticu, liječnik provjerava tekućinu i elektrolite.",
      speechText:
        "Niski krvni tlak. Liječnik to zove arterijska hipotenzija. Ispod 90 sa 60 možeš osjetiti vrtoglavicu ili slabost pri naglom ustajanju.",
    },
    "atac-de-cord": {
      plainTerm: "Srčani udar",
      formalTerm: "Akutni infarkt miokarda",
      layExplanation:
        "Krvni ugrušak potpuno začepi arteriju srca. Dio srčanog mišića trpi oštećenje zbog nedostatka kisika.",
      clinicalSignificance:
        "Hitno stanje. Nazovi 112. Arterija se mora otvoriti u bolnici (angioplastika) u prvim satima.",
      speechText:
        "Srčani udar. Liječnik to zove akutni infarkt miokarda. Ako osjetiš jak pritisak u prsima koji se širi u ruku ili čeljust, odmah nazovi 112.",
    },
    "atac-cerebral": {
      plainTerm: "Moždani udar",
      formalTerm: "Cerebrovaskularni inzult (moždani udar)",
      layExplanation:
        "Krv naglo prestane stizati u dio mozga zbog ugruška ili krvarenja. Stanice u tom dijelu mozga odumiru.",
      clinicalSignificance:
        "Hitno stanje. Nazovi 112. Liječnici provjeravaju znakove FAST testom. Lijek koji otapa ugrušak (tromboliza) daje se u prvih 4,5 sata.",
      speechText:
        "Moždani udar. Ako se lice objesi na jednu stranu, ruka oslabi ili govor postane nejasan, odmah nazovi 112.",
    },
    dispnee: {
      plainTerm: "Nedostatak zraka pri naporu ili ležanju",
      formalTerm: "Srčana ili respiratorna dispneja",
      layExplanation:
        "Osjećaš nedostatak zraka ili otežano dišeš. Ako se to javlja pri malom naporu ili dok ležiš ravno u krevetu, srce može biti preopterećeno.",
      clinicalSignificance:
        "Nedostatak zraka pri naporu ili potreba za više jastuka pri spavanju (ortopneja) može značiti nakupljanje tekućine u plućima (plućna kongestija). Hitno se javi kardiologu.",
      speechText:
        "Nedostatak zraka. Liječnik to zove dispneja. Ako teško dišeš pri malom naporu ili dok ležiš, to može značiti nakupljanje tekućine u plućima, pa se hitno javi liječniku.",
    },
    edeme: {
      plainTerm: "Otečeni gležnjevi i noge",
      formalTerm: "Periferni edemi",
      layExplanation:
        "Dolazi do zadržavanja tekućine u tkivima gležnjeva i potkoljenica. Događa se kada srce ili vene otežano vraćaju krv prema gore.",
      clinicalSignificance:
        "Ako pritisak prstom ostavi udubinu, u tkivima postoji zadržavanje tekućine i soli. To je čest znak srčanog zatajivanja.",
      speechText:
        "Otečene noge i gležnjevi. Liječnik ih zove periferni edemi. Zadržavanje tekućine u tkivima gležnjeva često znači da srce treba pregled liječnika.",
    },
    "hemoglobina-glicata": {
      plainTerm: "Prosječna koncentracija glukoze u zadnja 3 mjeseca",
      formalTerm: "Glikirani hemoglobin (HbA1c)",
      layExplanation:
        "Krvna pretraga koja pokazuje prosječnu koncentraciju glukoze (šećera) u krvi u zadnjih 90 dana. Pokazuje koliko je dijabetes dobro reguliran.",
      clinicalSignificance:
        "Za većinu odraslih s dijabetesom cilj je ispod 7%. Iznad 8% liječnik treba prilagoditi terapiju.",
      speechText:
        "Prosječna koncentracija glukoze u zadnja 3 mjeseca. Na nalazu piše glikirani hemoglobin ili HbA1c. Za većinu odraslih s dijabetesom cilj je ispod 7 posto.",
    },
    "fibrilatie-atriala": {
      plainTerm: "Brz i nepravilan rad srca",
      formalTerm: "Fibrilacija atrija",
      layExplanation:
        "Srce kuca brzo i bez pravilnog ritma. Krv se ne prazni potpuno iz gornjih srčanih šupljina pa se mogu stvoriti krvni ugrušci.",
      clinicalSignificance:
        "Povećava rizik od moždanog udara 5 puta. Potrebni su antikoagulantni lijekovi koji sprječavaju stvaranje krvnih ugrušaka, a propisuje ih kardiolog.",
      speechText:
        "Brz i nepravilan rad srca. Liječnik to zove fibrilacija atrija. Kardiolog propisuje antikoagulantne lijekove koji sprječavaju stvaranje krvnih ugrušaka.",
    },
    "insuficienta-cardiaca": {
      plainTerm: "Oslabljeno srce koje slabije pumpa",
      formalTerm: "Kronično zatajivanje srca",
      layExplanation:
        "Srce postupno gubi snagu da pumpa dovoljno krvi u organe. Brzo se umaraš i javlja se zadržavanje tekućine u tkivima i plućima.",
      clinicalSignificance:
        "Kronično stanje koje zahtijeva redovito praćenje. Važi se svaki dan, unosi manje od 5 g soli dnevno i uzimaj lijekove točno prema uputi liječnika.",
      speechText:
        "Oslabljeno srce. Liječnik to zove kronično zatajivanje srca. Važi se svakodnevno radi ranog prepoznavanja zadržavanja tekućine, smanji sol i redovito uzimaj propisane lijekove.",
    },
    "neuropatie-diabetica": {
      plainTerm: "Utrnulost i trnci u stopalima",
      formalTerm: "Periferna dijabetička neuropatija",
      layExplanation:
        "Povišena koncentracija glukoze (šećera) u krvi postupno oštećuje živce u stopalima. Osjet boli slabi pa male rane mogu proći neprimijećeno.",
      clinicalSignificance:
        "Česta komplikacija kod osoba s dijabetesom. Svaki dan pregledaj tabane kako bi na vrijeme uočio svaku ranicu.",
      speechText:
        "Utrnulost i trnci u stopalima. Liječnik to zove dijabetička neuropatija. Pregledaj stopala svaki dan kako bi rano uočio rane.",
    },
    "retinopatie-diabetica": {
      plainTerm: "Oštećenje vida zbog dijabetesa",
      formalTerm: "Dijabetička retinopatija",
      layExplanation:
        "Godine povišene koncentracije glukoze u krvi postupno oštećuju sitne krvne žile na očnoj pozadini (mrežnici).",
      clinicalSignificance:
        "Vodeći uzrok sljepoće koja se može spriječiti kod odraslih. Sprječava se pregledom očne pozadine jednom godišnje i održavanjem HbA1c ispod 7%.",
      speechText:
        "Oštećenje vida zbog dijabetesa. Liječnik to zove dijabetička retinopatija. Pregled očne pozadine jednom godišnje i regulacija glukoze čuvaju tvoj vid.",
    },
    "cetoacidoza-diabetica": {
      plainTerm: "Opasno nakupljanje ketonskih kiselina u krvi",
      formalTerm: "Dijabetička ketoacidoza (DKA)",
      layExplanation:
        "Kada tijelu izrazito nedostaje inzulina, ono razgrađuje masti za energiju pa se nakupljaju opasne kiseline zvane ketoni u krvi.",
      clinicalSignificance:
        "Hitno stanje opasno po život. Znakovi: zadah voćnog mirisa nalik acetonu, uporno povraćanje, zbunjenost i teška dehidracija.",
      speechText:
        "Opasno nakupljanje ketonskih kiselina u krvi, odnosno dijabetička ketoacidoza. Ako se jave zadah nalik acetonu, povraćanje, zbunjenost ili ubrzano disanje, odmah nazovi 112.",
    },
    electrocardiograma: {
      plainTerm: "Snimanje električnog rada srca",
      formalTerm: "Elektrokardiogram (EKG)",
      layExplanation:
        "Brza i bezbolna pretraga. Na kožu ti se stave male elektrode, a uređaj bilježi kako tvoje srce kuca.",
      clinicalSignificance:
        "Pokazuje nepravilan ritam srca, slabiju opskrbu srca krvlju (ishemiju) i znakove svježeg ili starog srčanog udara.",
      speechText:
        "Snimanje rada srca. Liječnik to zove elektrokardiogram ili EKG. Brzo je, ne boli i pokazuje srčani ritam.",
    },
    ecocardiografie: {
      plainTerm: "Ultrazvuk srca",
      formalTerm: "Transtorakalna ehokardiografija",
      layExplanation:
        "Pregled ultrazvukom. Na zaslonu se vide stijenke srca, kretanje zalistaka i snaga kojom srce pumpa krv.",
      clinicalSignificance:
        "Mjeri koliki udio krvi srce istisne svakim otkucajem (ejekcijska frakcija, LVEF). Otkriva i bolesti zalistaka te zadebljanje srčanog mišića.",
      speechText:
        "Ultrazvuk srca. Liječnik to zove ehokardiografija. Pokazuje kako rade zalisci i koliko snažno srce pumpa.",
    },
    "tensiometru-digital": {
      plainTerm: "Automatski tlakomjer",
      formalTerm: "Digitalni oscilometrijski tlakomjer",
      layExplanation:
        "Uređaj s manžetom koja se stavlja na nadlakticu. Sam se napuše i pokaže krvni tlak i puls.",
      clinicalSignificance:
        "Odličan za mjerenje kod kuće. Odaberi klinički provjeren model s manžetom za nadlakticu, a ne za zapešće.",
      speechText:
        "Automatski tlakomjer. Modeli s manžetom za nadlakticu daju najtočnije vrijednosti kod kuće.",
    },
    glucometru: {
      plainTerm: "Uređaj za mjerenje koncentracije glukoze u krvi",
      formalTerm: "Kapilarni glukometar s biosenzorima",
      layExplanation:
        "Prijenosni medicinski uređaj. Na testnu trakicu staviš malu kap kapilarne krvi sa strane jagodice prsta i uređaj za nekoliko sekundi prikazuje koncentraciju glukoze (šećera) u krvi (u mmol/L ili mg/dL).",
      clinicalSignificance:
        "Pomaže ti samostalno pratiti razinu glukoze kod kuće. Trebaju ti odgovarajuće testne trakice za tvoj uređaj i sterilne jednokratne lancete.",
      speechText:
        "Uređaj za mjerenje koncentracije glukoze u krvi, ili glukometar. Iz male kapi krvi iz prsta za nekoliko sekundi prikazuje koncentraciju glukoze u milimolima po litri ili miligramima po decilitru.",
    },
    "vaccin-imunizare": {
      plainTerm: "Cjepivo (imunološka zaštita)",
      formalTerm: "Cijepljenje / Aktivna imunizacija",
      layExplanation:
        "Preventivni medicinski pripravak koji se daje injekcijom ili kapima na usta te sigurno uči imunološki sustav stvarati protutijela i na vrijeme prepoznati uzročnike, sprječavajući teške zarazne bolesti kod djece i odraslih.",
      clinicalSignificance:
        "Cijepljenja iz nacionalnog kalendara i preporučena cjepiva za odrasle snažno smanjuju rizik od bolničkog liječenja i teških komplikacija.",
      speechText:
        "Cjepivo, odnosno aktivna imunizacija. To je preventivni medicinski pripravak koji uči imunološki sustav stvarati protutijela protiv teških zaraznih bolesti.",
    },
    "bilet-de-trimitere": {
      plainTerm: "Uputnica za specijalista",
      formalTerm: "HZZO uputnica (e-uputnica)",
      layExplanation:
        "Uputnica koju izdaje tvoj obiteljski liječnik. Ako imaš zdravstveno osiguranje, njome su specijalistički pregledi i pretrage pokriveni preko HZZO-a.",
      clinicalSignificance:
        "Uputnica za pojedini pregled obično vrijedi 30 do 90 dana, ovisno o vrsti uputnice i praćenju kronične bolesti.",
      speechText:
        "Uputnica za specijalista. Izdaje je obiteljski liječnik, a troškove pregleda i pretraga pokriva HZZO.",
    },
    "prescriptie-compensata": {
      plainTerm: "Besplatan recept ili recept uz doplatu",
      formalTerm: "Kompenzirani recept (HZZO e-recept)",
      layExplanation:
        "Elektronički recept kojim obiteljski liječnik propisuje lijekove s osnovne (besplatne) ili dopunske liste lijekova HZZO-a.",
      clinicalSignificance:
        "Ključni lijekovi za dijabetes, inzulin i kronične srčane bolesti nalaze se na osnovnoj listi lijekova HZZO-a.",
      speechText:
        "Recept preko osiguranja, odnosno e-recept. Lijekovi za dijabetes i druge kronične bolesti pokriveni su zdravstvenim osiguranjem.",
    },
    "centru-de-permanenta": {
      plainTerm: "Dežurna ambulanta",
      formalTerm: "Posebno dežurstvo primarne zdravstvene zaštite",
      layExplanation:
        "Ambulanta otvorena kada tvoj obiteljski liječnik ne radi: vikendom, blagdanom i navečer. Tamo ideš za hitne tegobe koje nisu opasne po život.",
      clinicalSignificance:
        "Zbrinjava akutne tegobe koje ne ugrožavaju život kako bi bolnički hitni prijem ostao slobodan za najteže slučajeve.",
      speechText:
        "Dežurna ambulanta. Otvorena je vikendom i blagdanom kada obiteljski liječnik ne radi, bez prethodnog naručivanja.",
    },
    "unitate-primiri-urgente": {
      plainTerm: "Hitni bolnički prijem",
      formalTerm: "Objedinjeni hitni bolnički prijem (OHBP)",
      layExplanation:
        "Odjel bolnice otvoren danju i noću, 24 sata dnevno. Ovdje se zbrinjavaju teška i po život opasna stanja.",
      clinicalSignificance:
        "Za stanja opasna po život: teške nesreće, bol u prsima, gubitak svijesti. Ne ulazi se po redu dolaska, nego prema hitnosti (trijaža).",
      speechText:
        "Hitni bolnički prijem, odnosno OHBP. Otvoren je danju i noću za teška hitna stanja.",
    },
  },

  rom: {
    "glicemie-a-jeun": {
      plainTerm: "Nivelo e glukozako ando rat pe bokhalo por",
      formalTerm: "Glukoza ando rat pe bokhalo por",
      layExplanation:
        "Merisarel pes sabale, pala najxanci 8 ore bi xabenasko. Sikavel i koncentracija (o nivelo) e glukozako (zaharesko) ando rat kana o trupo hodinisarel.",
      clinicalSignificance:
        "Normalno: 70–99 mg/dL. Mashkar 100 thaj 125 mg/dL znachil predijabeto. 126 mg/dL vaj maj but, pe 2 rengre dikhibena, shaj te avel dijabeto.",
      speechText:
        "Nivelo e glukozako ando rat pe bokhalo por. Pe lila e analizenge pishil glukoza pe bokhalo por. Normalno si mashkar 70 thaj 99 miligrama pe decilitro.",
    },
    "glicemie-postprandial": {
      plainTerm: "Nivelo e glukozako ando rat 2 ore pala o xaben",
      formalTerm: "Postprandijalno glukoza",
      layExplanation:
        "Merisarel pes 2 ore pala so astardjan te xas. Sikavel sar tiro trupo inkerel i koncentracija (o nivelo) e glukozako (zaharesko) ando rat katar o xaben.",
      clinicalSignificance:
        "Normalno: tela 140 mg/dL. Mashkar 140 thaj 199 mg/dL sikavel phari tolerancija ki glukoza. 200 mg/dL vaj maj but shaj te avel dijabeto.",
      speechText:
        "Nivelo e glukozako ando rat 2 ore pala o xaben. O doktori akharel les postprandijalno glukoza. Normalno si tela 140 miligrama pe decilitro.",
    },
    hipertensiune: {
      plainTerm: "O rat phurdel zurales (uchi tensija)",
      formalTerm: "Arterijaki hipertenzija",
      layExplanation:
        "O rat tasavel but zurales pe zidouria e arterijenge, sako vrjama. O ilo khinjol thaj e zidouria e arterijenge lokhes dukhavdjon vash vrjama.",
      clinicalSignificance:
        "O doktori čhivel la kana e numere ačhen pe 140/90 mmHg vaj maj opre. Barjarel najbut o riziko vash infarkto thaj dab ki godi.",
      speechText:
        "Uchi tensija, o rat tasavel zurales pe zidouria e arterijenge. O doktori akharel la arterijaki hipertenzija. Opral 140 pe 90, tiro ilo kerel but phari buchi, vi te na dukhal tut niso.",
    },
    hipotensiune: {
      plainTerm: "Cikni tensija e rateski",
      formalTerm: "Arterijaki hipotenzija",
      layExplanation:
        "Tiri tensija si maj cikni katar normalno. Shaj te phirel tiro shero kana ushtes sigo opre, te dikhes kalo vaj te peres.",
      clinicalSignificance:
        "Tela 90/60 mmHg. Te hatjares tut mishto, shaj te avel normalno vash tute. Te phirel tiro shero vaj peres, o doktori dikhel e likidura thaj e lona ando trupo.",
      speechText:
        "Cikni tensija. O doktori akharel la arterijaki hipotenzija. Tela 90 pe 60 shaj te phirel tiro shero kana ushtes sigo opre.",
    },
    "atac-de-cord": {
      plainTerm: "Atako ko ilo",
      formalTerm: "Akutno infarkto e miokardesko",
      layExplanation:
        "Jekh phandlo rat astavel sasto jekh arterija e ileski. Jekh kotor katar o ilesko muskulo lel dukhavimos (lezija) soske falil oksigeno.",
      clinicalSignificance:
        "Sigardiari. Akhar 112. I arterija musaj te putardjol ki bolnitsa ande anglune ore.",
      speechText:
        "Atako ko ilo. O doktori akharel les akutno infarkto. Te hatjares bari dukh ko kolin so dzhal ko vast vaj ki pashni, akhar sigo 112.",
    },
    "atac-cerebral": {
      plainTerm: "Dab ki godi",
      formalTerm: "Cerebrovaskularno aksidento (atako ki godi)",
      layExplanation:
        "O rat ačhel sigo te na resel ko jekh kotor e godjako, katar phandlo rat vaj ratjarimos. E celije ande kodo kotor meren.",
      clinicalSignificance:
        "Sigardiari. Akhar 112. E doktorura dikhen e semnja e FAST testosa. I drab so bilavel o phandlo rat del pes ande anglune 4,5 ore.",
      speechText:
        "Dab ki godi. Te bangjol o muj, slabjol o vast vaj phagjol i duma, akhar sigo 112.",
    },
    dispnee: {
      plainTerm: "Phari phurdinimos kana phires vaj pashljos",
      formalTerm: "Kardijalno vaj respiratorno dispneja",
      layExplanation:
        "Hatjares kaj falil tut balval vaj phares phurdines. Te avel ko cikno phirimos vaj kana pashljos vorta ko than, tiro ilo shaj te avel pharjardo.",
      clinicalSignificance:
        "Te ačhes bi balvaljako vaj trubul tut maj but sherandja te soves, shaj te avel kidimos likidosko (pajnjesko) ko phuka. Dzha sigo ko kardiologo.",
      speechText:
        "Phari phurdinimos. O doktori akharel la dispneja. Te les phares balval ko cikno phirimos vaj kana pashljos, shaj te avel kidimos likidosko ko phuka, dzha sigo ko doktori.",
    },
    edeme: {
      plainTerm: "Shuvljarde punre thaj globura",
      formalTerm: "Periferikane edemura",
      layExplanation:
        "Kerel pes kidimos likidosko (pajnjesko) ando mas e globurengo thaj e punrengo. Kerel pes kana o ilo vaj e vene nashti te ispidin mishto o rat opre.",
      clinicalSignificance:
        "Te tasaves e najesa thaj ačhel xaning, tiro trupo inkerel likido thaj lon ando mas. Akava kerel pes butivar kana o ilo si slabo.",
      speechText:
        "Shuvljarde punre. O doktori akharel len periferikane edemura. O kidimos likidosko ko globura butivar sikavel kaj o ilo trubul te dikhel les o doktori.",
    },
    "hemoglobina-glicata": {
      plainTerm: "Mashkarutni koncentracija e glukozaki ande palutne 3 chona",
      formalTerm: "Glikirime hemoglobina (HbA1c)",
      layExplanation:
        "Rengro dikhiben savo sikavel i mashkarutni koncentracija (nivelo) e glukozako (zaharesko) ando rat ande palutne 90 dive. Sikavel kozom mishto si inkerdo o dijabeto.",
      clinicalSignificance:
        "Vash e maj but bare manusha dijabetosa, o ciljo si tela 7%. Opral 8%, o doktori musaj te dikhel pale o sastjarimos.",
      speechText:
        "Mashkarutni koncentracija e glukozaki ande palutne 3 chona. Pe lila pishil HbA1c. Vash e maj but bare manusha dijabetosa, o ciljo si tela 7 procentura.",
    },
    "fibrilatie-atriala": {
      plainTerm: "Ilo so marel sigo thaj bi ritmosko",
      formalTerm: "Atrijalno fibrilacija",
      layExplanation:
        "Tiro ilo marel sigo thaj bi ritmosko. O rat na ikljol sasto katar e oprune kotora e ileske, kadja shaj te keren pes phandle kotora rateske.",
      clinicalSignificance:
        "Barjarel 5 droma o riziko vash dab ki godi. Trubul tut antikoagulantne draba save ačhaven te na keren pes phandle kotora rateske, dende katar o kardiologo.",
      speechText:
        "Ilo so marel sigo thaj bi ritmosko. O doktori akharel la atrijalno fibrilacija. O kardiologo del antikoagulantne draba save ačhaven e phandle kotora rateske thaj dab ki godi.",
    },
    "insuficienta-cardiaca": {
      plainTerm: "Slabo ilo so pumpil phares",
      formalTerm: "Kronikani insuficijencija e ileski",
      layExplanation:
        "Tiro ilo xasarel lokhes i zor te bičhalel dosta rat ko organura. Khinjos sigo thaj kerel pes kidimos likidosko (pajnjesko) ando trupo thaj ko phuka.",
      clinicalSignificance:
        "Nasvalipen pe lungi vrjama. Merisar tiro pharipen sako dives, xa maj xanci katar 5 g lon ko dives thaj le e draba vorta sar phendja o doktori.",
      speechText:
        "Slabo ilo. O doktori akharel la kronikani insuficijencija e ileski. Merisar tiro pharipen sako dives te dikhes o kidimos likidosko, xa xanci lon thaj le e draba sar pishil pe recepta.",
    },
    "neuropatie-diabetica": {
      plainTerm: "Pamortimos thaj pusavimata ande talpe",
      formalTerm: "Periferikani dijabetikani neuropatija",
      layExplanation:
        "I uchi koncentracija (nivelo) e glukozako (zaharesko) ando rat lokhes dukhavel e nervura ande pindre. Hatjares maj xanci i dukh, kadja shaj te aven tut rane bi te dikhes len.",
      clinicalSignificance:
        "Kerel pes butivar ko manusha dijabetosa. Dikh tire talpe sako dives, te arakhes sigo sako rana.",
      speechText:
        "Pamortimos ande talpe. O doktori akharel la dijabetikani neuropatija. Dikh tire pindre sako dives te arakhes e rane rano.",
    },
    "retinopatie-diabetica": {
      plainTerm: "Dukhavdo dikhiben katar o dijabeto",
      formalTerm: "Dijabetikani retinopatija",
      layExplanation:
        "Bersha uche nivelosa e glukozako ando rat lokhes dukhaven e cikne rateske droma palpale andi jakh (i retina).",
      clinicalSignificance:
        "Baro uzroko vash koripen ko bare manusha. Arakhes tut jekhe dikhibenasa e jakhenge sako bersh thaj HbA1c tela 7%.",
      speechText:
        "Dukhavdo dikhiben katar o dijabeto. O doktori akharel la dijabetikani retinopatija. Dikhiben e jakhengo sako bersh thaj mishto inkerdi glukoza arakhen tiro dikhiben.",
    },
    "cetoacidoza-diabetica": {
      plainTerm: "Rizikane ketonikane kiseline ando rat katar o dijabeto",
      formalTerm: "Dijabetikani ketoacidoza (DKA)",
      layExplanation:
        "Kana falil but inzulino, o trupo phabarel khil te lel zor thaj kiden pes ando rat rizikane kiseline akharde ketonura.",
      clinicalSignificance:
        "Sigardiari so čhivel o trajo ando riziko. Semnja: phurdinimos frutaqo, sar acetono, čhadimos so na ačhel, konfuzija thaj bari dehidracija.",
      speechText:
        "Rizikane kiseline (ketonura) ando rat, akhardi dijabetikani ketoacidoza. Te si tut phurdinimos sar acetono, čhades, san konfuzno vaj phurdines sigo, akhar sigo 112.",
    },
    electrocardiograma: {
      plainTerm: "Elektrikano dikhiben e ilesko",
      formalTerm: "Elektrokardiogramo (EKG)",
      layExplanation:
        "Sigo dikhiben savo na dukhal. Čhiven pes cikne elektrode pe morti, thaj i mashina ramosarel pe lil sar marel o ilo.",
      clinicalSignificance:
        "Sikavel te marel o ilo bi ritmosko, te na lel dosta rat (ishemija), thaj semnja katar nevo vaj purano infarkto.",
      speechText:
        "Elektrikano dikhiben e ilesko. O doktori akharel les elektrokardiogramo vaj EKG. Si sigo, na dukhal thaj sikavel o ritmo e ilesko.",
    },
    ecocardiografie: {
      plainTerm: "Ultrazvuko e ilesko",
      formalTerm: "Transtorakalno ehokardiografija",
      layExplanation:
        "Dikhiben ultrazvukosa. Pe ekrano dikhen pes e zidura e ileske, sar phiren e valvule thaj kozom zurales pumpil o ilo.",
      clinicalSignificance:
        "Merisarel kozom rat ispidel o ilo ko sako marimos (LVEF). Arakhel vi nasvalipena e valvulenge thaj thuljardo ilo.",
      speechText:
        "Ultrazvuko e ilesko. O doktori akharel les ehokardiografija. Sikavel sar phiren e valvule thaj kozom zurales kerel buchi o ilo.",
    },
    "tensiometru-digital": {
      plainTerm: "Automatikano aparato vash i tensija",
      formalTerm: "Digitalno oscilometrikano tensiometro",
      layExplanation:
        "Aparato manshetasa savi čhives pe vast. Korkoro phpherel pes balvaljasa thaj sikavel tiri tensija thaj o pulso.",
      clinicalSignificance:
        "Lačho vash merimos khere. Alosar klinikano dikhlo modelo manshetasa pe opruno vast, na ko globi e vastesko.",
      speechText:
        "Automatikano aparato vash i tensija. E modelura manshetasa pe opruno vast merisaren najčačes khere.",
    },
    glucometru: {
      plainTerm: "Aparato te ginavel o nivelo e glukozako ando rat",
      formalTerm: "Kapilarno glukometro biosenzorenca",
      layExplanation:
        "Portativno sastipnasko aparato. Čhives pe lenta jekh cikni kapka rat katar i rig e najeski thaj o aparato ande xanci sekunde sikavel i koncentracija (o nivelo) e glukozako (zaharesko) ando rat, merime ande mg/dL vaj mmol/L.",
      clinicalSignificance:
        "Azhutil tut korkoro khere te dikhes o nivelo e glukozako. Trubun tut lente so pasinen ko aparato thaj sterilne suva vash jekh labyarimos (lancete).",
      speechText:
        "Aparato te ginavel o nivelo e glukozako ando rat, vaj glukometro. Katar jekh cikni kapka rat katar o naj sikavel ande xanci sekunde i koncentracija e glukozaki ande miligrama pe decilitro vaj milimolura pe litro.",
    },
    "vaccin-imunizare": {
      plainTerm: "I vakcina (arakhipnasko drab)",
      formalTerm: "Vakcinacija / Aktivno imunizacija",
      layExplanation:
        "Arakhipnasko sastipnasko drab, dendo injekcijasa vaj kapkenca ando muj, savo sigurno sikavel o imunitetno sistemo te kerel antitrupura thaj rano te prindzhanel e mikroburen, arakhindoj e čhaven thaj e bare manushen katar phare infektivne nasvalipena.",
      clinicalSignificance:
        "E vakcine katar o nacijonalno kalendaro thaj kodola rekomandirime vash bare manusha tele peraven but o riziko te pashljos ki bolnitsa thaj phare komplikacije.",
      speechText:
        "I vakcina, arakhipnasko drab vash aktivno imunizacija. Sikavel o imunitetno sistemo te kerel antitrupura thaj te arakhel e čhaven thaj e bare manushen katar phare infektivne nasvalipena.",
    },
    "bilet-de-trimitere": {
      plainTerm: "Lil bičhalimasko ko specijalisto",
      formalTerm: "Sastipnasko lil bičhalimasko (uputnica)",
      layExplanation:
        "O lil savo del tut tiro familijako doktori. Te si tut sastipnasko osiguranje, lesa o dikhiben ko specijalisto si bi lovesko vaj pokindo.",
      clinicalSignificance:
        "Vazhil 30 dive vash sigo nasvalipen thaj dzhi ko 90 dive vash lungi-vrjamake nasvalipena.",
      speechText:
        "Lil bičhalimasko ko specijalisto. Lesa o sastipnasko osiguranje pokinel o dikhiben thaj e analize ko specijalisto.",
    },
    "prescriptie-compensata": {
      plainTerm: "Recepta cikne cijenasa vaj bi lovesko",
      formalTerm: "Kompenzirime sastipnaski recepta",
      layExplanation:
        "Elektronikani recepta vash draba save si pokinde dopash (50%, 90%) vaj saste (100%, vash lungi-vrjamake nasvalipena sar o dijabeto).",
      clinicalSignificance:
        "E anglune draba vash o dijabeto, o inzulino thaj aver lungi-vrjamake nasvalipena si saste pokinde katar o sastipnasko osiguranje.",
      speechText:
        "Recepta cikne cijenasa vaj bi lovesko. E draba vash o dijabeto si pokinde katar o sastipnasko osiguranje.",
    },
    "centru-de-permanenta": {
      plainTerm: "Dezhurno ambulanta",
      formalTerm: "Ambulanta vash sigo azhutimos ratjate thaj vikendosa",
      layExplanation:
        "Ambulanta putardi kana tiro familijako doktori na kerel buchi: ratjate, ko vikendo thaj ko praznikura. Dzha kothe vash sigo problemo so na čhivel o trajo ando riziko.",
      clinicalSignificance:
        "Sastjarel problemura so na čhiven tiro trajo ando riziko, kaj i bolnitsaki sigardiari te ačhel slobodo vash phare sluchajura.",
      speechText:
        "Dezhurno ambulanta. Si putardi ratjate thaj ko vikendo, thaj shaj te dzhas bi terminosko.",
    },
    "unitate-primiri-urgente": {
      plainTerm: "Bolnitsaki sigardiari",
      formalTerm: "Bolnitsako kotor vash sigardiari (OHBP)",
      layExplanation:
        "O kotor e bolnitsako putardo dives thaj rat, 24 ore ko dives. Kate sastjaren pes e phare sluchajura.",
      clinicalSignificance:
        "Vash sluchajura so čhiven o trajo ando riziko: aksidentura, dukh ko kolin, xasarimos e godjako. Na del pes sar aviljan, anglal dzhan e maj phare sluchajura.",
      speechText:
        "Bolnitsaki sigardiari. Si putardi dives thaj rat vash phare sastipnaske sigardiarja.",
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
  ru: {
    title: "Медицинский словарь",
    subtitle: "Что означают слова на рецептах, результатах анализов и направлениях",
    searchPlaceholder: "Поиск слова",
    closeLabel: "Закрыть словарь",
    plainLabel: "Повседневное слово",
    formalLabel: "Что написано в рецепте или результатах анализа",
    clinicalSignificanceLabel: "На что обращает внимание врач:",
    pronounceLabel: "Слушай",
    emptyState: "Мы не смогли найти это слово. Попробуйте другой.",
    categoryTablistAria: "Категории словаря",
    categories: {
"preventie": "Профилактика",

      all: "Все (22)",
      diabet: "Диабет",
      cardiologie: "Сердце и кровяное давление",
      analize: "Тесты и устройства",
      cnas: "документы CNAS",
      urgente: "Чрезвычайные ситуации",
    },
  },

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
      all: "Toate (23)",
      diabet: "Diabet",
      cardiologie: "Inimă și tensiune",
      analize: "Analize și aparate",
      preventie: "Prevenție și vaccinuri",
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
      all: "All (23)",
      diabet: "Diabetes",
      cardiologie: "Heart and blood pressure",
      analize: "Tests and devices",
      preventie: "Prevention and vaccines",
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
      all: "Të gjitha (23)",
      diabet: "Diabeti",
      cardiologie: "Zemra dhe tensioni",
      analize: "Analiza dhe aparate",
      preventie: "Parandalimi dhe vaksinat",
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
      all: "Tutti (23)",
      diabet: "Diabete",
      cardiologie: "Cuore e pressione",
      analize: "Esami e apparecchi",
      preventie: "Prevenzione e vaccini",
      cnas: "Documenti CNAS",
      urgente: "Emergenze",
    },
  },
  hr: {
    title: "Medicinski rječnik",
    subtitle: "Što znače riječi na receptima, nalazima i uputnicama",
    searchPlaceholder: "Pretraži riječ",
    closeLabel: "Zatvori rječnik",
    plainLabel: "Svakodnevna riječ",
    formalLabel: "Kako piše na receptu ili nalazu",
    clinicalSignificanceLabel: "Što prati liječnik:",
    pronounceLabel: "Poslušaj",
    emptyState: "Nismo pronašli ovu riječ. Pokušaj drugu.",
    categoryTablistAria: "Kategorije rječnika",
    categories: {
      all: "Sve (23)",
      diabet: "Dijabetes",
      cardiologie: "Srce i tlak",
      analize: "Pretrage i uređaji",
      preventie: "Prevencija i cjepiva",
      cnas: "Dokumenti HZZO-a",
      urgente: "Hitna stanja",
    },
  },
  rom: {
    title: "Sastipnasko alavari",
    subtitle: "So znachinen e alava pe recepte, analize thaj lila",
    searchPlaceholder: "Rod jekh alav",
    closeLabel: "Phand o alavari",
    plainLabel: "Sako-divesko alav",
    formalLabel: "Sar pishil pe recepta vaj pe analize",
    clinicalSignificanceLabel: "So dikhel o doktori:",
    pronounceLabel: "Ashun",
    emptyState: "Na arakhljam akava alav. Probin aver.",
    categoryTablistAria: "Kategorije e alavareske",
    categories: {
      all: "Savore (23)",
      diabet: "Dijabeto",
      cardiologie: "O ilo thaj i tensija",
      analize: "Analize thaj aparatura",
      preventie: "Arakhimos thaj vakcine",
      cnas: "Sastipnaske lila",
      urgente: "Sigardiarja",
    },
  },
};

