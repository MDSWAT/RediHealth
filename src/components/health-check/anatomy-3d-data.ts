import { DEFAULT_LANG } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import type { BodyPartId } from "@/lib/i18n/health-check-translations";

export type TissueKind = "Muscle" | "Tendon" | "Organ" | "Bone" | "Surface";

export type AnatomicalSystemId =
  | "muscular"
  | "skeletal"
  | "nervous"
  | "cardiac"
  | "respiratory"
  | "digestive"
  | "urinary"
  | "integumentary";

export type LayerModeId = "hybrid" | "muscular" | "organs" | "surface";

export type SubRegionId =
  // Head and neck
  | "brain"
  | "skull"
  | "head_face"
  | "cranium_occipital"
  | "neck"
  | "cervical_spine"
  // Chest and breathing
  | "pectoral"
  | "heart"
  | "lungs"
  // Stomach and abdomen
  | "stomach_organ"
  | "liver"
  | "colon"
  | "abdominals"
  | "obliques"
  // Back and spine
  | "trapezius"
  | "upper_back"
  | "thoracic_spine"
  | "lower_back"
  | "lumbar_spine"
  | "kidneys"
  | "gluteal"
  // Arms and hands
  | "deltoid"
  | "rotator_cuff"
  | "biceps"
  | "triceps"
  | "elbow_tendon"
  | "forearm_flexor"
  | "forearm_extensor"
  | "wrist_tendon"
  // Legs and feet
  | "hip_flexor"
  | "quadriceps"
  | "hamstrings"
  | "patellar_tendon"
  | "calves"
  | "achilles";

export type ExerciseFamilyId =
  | "neck"
  | "shoulder"
  | "elbow"
  | "forearm"
  | "upperArm"
  | "chest"
  | "back"
  | "core"
  | "hip"
  | "knee"
  | "lowerLeg";

export interface LocalizedSubRegionData {
  label: string;
  tissueLabel: string;
  systemLabel: string;
  summary: string;
  functionDescription: string;
  clinicalNotes: string;
  commonConditions: string[];
  recommendedSpecialty: string;
  searchKeywords: string[];
}

export interface SubRegionInfo {
  id: SubRegionId;
  macroPart: BodyPartId;
  label: string;
  latinName: string;
  fmaId: string;
  tissue: TissueKind;
  tissueLabel: string;
  system: AnatomicalSystemId;
  systemLabel: string;
  bilateral: boolean;
  defaultView: "front" | "back" | "three-quarter" | "side";
  exerciseFamily: ExerciseFamilyId;
  summary: string;
  functionDescription: string;
  clinicalNotes: string;
  commonConditions: string[];
  recommendedSpecialty: string;
  searchKeywords?: string[];
  localized?: Record<Lang, LocalizedSubRegionData>;
}

export interface DifferentialPossibility {
  id: string;
  name: string;
  category: string;
  urgency: "self_care" | "gp_visit" | "specialist" | "emergency";
  urgencyLabel: string;
  description: string;
  typicalSigns: string[];
  doctorWorkup: string;
}

export interface DetailedSymptomOption {
  id: string;
  label: string;
  subRegions: SubRegionId[];
  isRedFlag: boolean;
  selfCareTip: string;
  clinicalMechanism: string;
  whenToSeeDoctor: string;
  differentials: DifferentialPossibility[];
}

export interface TherapeuticExercise {
  name: string;
  dose: string;
  effort: string;
  steps: string;
  note: string;
  targetStructure: string;
}

export const ANATOMICAL_SYSTEMS: Record<
  AnatomicalSystemId,
  { id: AnatomicalSystemId; label: string; color: string; description: string }
> = {
  muscular: {
    id: "muscular",
    label: "Sistemul muscular și tendinos",
    color: "#b94a37",
    description:
      "Mușchii scheletici și tendoanele generează mișcarea prin tracțiune pe inserțiile osoase, stabilizează postura și protejează articulațiile.",
  },
  skeletal: {
    id: "skeletal",
    label: "Sistemul osos și coloana vertebrală",
    color: "#d9ceb0",
    description:
      "Oasele craniului și coloana vertebrală formează structura de rezistență a corpului și protejează măduva spinării și creierul.",
  },
  nervous: {
    id: "nervous",
    label: "Sistemul nervos central",
    color: "#d8b565",
    description:
      "Creierul, trunchiul cerebral și măduva spinării coordonează percepția durerii, mișcarea, echilibrul și funcțiile vitale.",
  },
  cardiac: {
    id: "cardiac",
    label: "Sistemul cardiovascular",
    color: "#c0392b",
    description:
      "Inima pompează sângele oxigenat prin circulația sistemică și pulmonară, adaptându-și ritmul la efort și stres.",
  },
  respiratory: {
    id: "respiratory",
    label: "Sistemul respirator",
    color: "#c28791",
    description:
      "Plămânii și arborele bronșic asigură schimbul de oxigen și dioxid de carbon în timpul fiecărui ciclu respirator.",
  },
  digestive: {
    id: "digestive",
    label: "Sistemul digestiv și hepatic",
    color: "#bf8b5e",
    description:
      "Stomacul, ficatul și colonul procesează alimentele, absorb nutrienții și mențin echilibrul metabolic al organismului.",
  },
  urinary: {
    id: "urinary",
    label: "Sistemul reno-urinar",
    color: "#a86454",
    description:
      "Rinichii filtrează sângele, reglează tensiunea arterială și controlează echilibrul apei și al sărurilor minerale.",
  },
  integumentary: {
    id: "integumentary",
    label: "Suprafața corporală și repere externe",
    color: "#94a3b8",
    description:
      "Învelișul anatomic extern oferă reperele topografice clinice pentru localizarea rapidă a durerii superficiale și profunde.",
  },
};

export const SUB_REGION_INFO: Record<SubRegionId, SubRegionInfo> = {
  brain: {
    id: "brain",
    macroPart: "head",
    label: "Creierul",
    latinName: "Encephalon / Cerebrum",
    fmaId: "FMA55676",
    tissue: "Organ",
    tissueLabel: "Sistem nervos",
    system: "nervous",
    systemLabel: "Sistemul nervos central",
    bilateral: false,
    defaultView: "three-quarter",
    exerciseFamily: "neck",
    summary:
      "Centrul de comandă al sistemului nervos, situat în cutia craniană. Deși țesutul cerebral în sine nu are receptori de durere, vasele meningeale și nervii cranieni generează migrenele și cefaleea. (creier, encefal, brain, encephalon, truri, cervello, cap, head, koka, testa)",
    functionDescription:
      "Reglează vederea, vorbirea, memoria, coordonarea motorie, somnul și răspunsul la stres prin rețele neuronale și vasculare de mare precizie.",
    clinicalNotes:
      "Durerile de cap însoțite de tulburări de vedere, confuzie, febră sau asimetrie facială necesită evaluare neurologică de urgență.",
    commonConditions: [
      "Cefalee de tensiune",
      "Migrenă cu sau fără aură",
      "Cefalee hipertensivă",
      "Vertij central sau periferic",
    ],
    recommendedSpecialty: "Neurologie sau Medicină de familie",
    searchKeywords: ["creier","encefal","brain","encephalon","truri","cervello","cap","head","koka","testa"],
    localized: {
      ro: {
        label: "Creierul",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Centrul de comandă al sistemului nervos, situat în cutia craniană. Deși țesutul cerebral în sine nu are receptori de durere, vasele meningeale și nervii cranieni generează migrenele și cefaleea. (creier, encefal, brain, encephalon)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["creier","encefal","brain","encephalon","truri","cervello","cap","head","koka","testa"],
      },
      en: {
        label: "Brain",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Centrul de comandă al sistemului nervos, situat în cutia craniană. Deși țesutul cerebral în sine nu are receptori de durere, vasele meningeale și nervii cranieni generează migrenele și cefaleea. (creier, encefal, brain, encephalon)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["creier","encefal","brain","encephalon","truri","cervello","cap","head","koka","testa"],
      },
      sq: {
        label: "Truri",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Centrul de comandă al sistemului nervos, situat în cutia craniană. Deși țesutul cerebral în sine nu are receptori de durere, vasele meningeale și nervii cranieni generează migrenele și cefaleea. (creier, encefal, brain, encephalon)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["creier","encefal","brain","encephalon","truri","cervello","cap","head","koka","testa"],
      },
      it: {
        label: "Cervello",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Centrul de comandă al sistemului nervos, situat în cutia craniană. Deși țesutul cerebral în sine nu are receptori de durere, vasele meningeale și nervii cranieni generează migrenele și cefaleea. (creier, encefal, brain, encephalon)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["creier","encefal","brain","encephalon","truri","cervello","cap","head","koka","testa"],
      },
    },
  },
  skull: {
    id: "skull",
    macroPart: "head",
    label: "Craniul și sinusurile",
    latinName: "Cranium / Sinus paranasales",
    fmaId: "FMA46565",
    tissue: "Bone",
    tissueLabel: "Structură osoasă",
    system: "skeletal",
    systemLabel: "Sistemul osos",
    bilateral: false,
    defaultView: "front",
    exerciseFamily: "neck",
    summary:
      "Ansamblul oaselor frontale, parietale, temporale și maxilare care adăpostesc creierul și cavitățile sinusale ale feței. (craniu, skull, cranium, sinusuri, sinuses, kafka, kraniumi, cranio)",
    functionDescription:
      "Protejează encefalul și organele de simț, în timp ce sinusurile paranazale încălzesc aerul inspirat și reduc greutatea craniului.",
    clinicalNotes:
      "Presiunea la nivelul frunții sau pomeților care se agravează la aplecarea capului în față indică frecvent o inflamație sinusală (rinosinuzită).",
    commonConditions: [
      "Rinosinuzită acută sau cronică",
      "Cefalee frontală",
      "Nevralgie supraorbitală",
    ],
    recommendedSpecialty: "ORL sau Medicină de familie",
    searchKeywords: ["craniu","skull","cranium","sinusuri","sinuses","kafka","kraniumi","cranio"],
    localized: {
      ro: {
        label: "Craniul și sinusurile",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Ansamblul oaselor frontale, parietale, temporale și maxilare care adăpostesc creierul și cavitățile sinusale ale feței. (craniu, skull, cranium, sinusuri)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["craniu","skull","cranium","sinusuri","sinuses","kafka","kraniumi","cranio"],
      },
      en: {
        label: "Skull and sinuses",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Ansamblul oaselor frontale, parietale, temporale și maxilare care adăpostesc creierul și cavitățile sinusale ale feței. (craniu, skull, cranium, sinusuri)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["craniu","skull","cranium","sinusuri","sinuses","kafka","kraniumi","cranio"],
      },
      sq: {
        label: "Kafka dhe sinuset",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Ansamblul oaselor frontale, parietale, temporale și maxilare care adăpostesc creierul și cavitățile sinusale ale feței. (craniu, skull, cranium, sinusuri)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["craniu","skull","cranium","sinusuri","sinuses","kafka","kraniumi","cranio"],
      },
      it: {
        label: "Cranio e seni paranasali",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Ansamblul oaselor frontale, parietale, temporale și maxilare care adăpostesc creierul și cavitățile sinusale ale feței. (craniu, skull, cranium, sinusuri)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["craniu","skull","cranium","sinusuri","sinuses","kafka","kraniumi","cranio"],
      },
    },
  },
  head_face: {
    id: "head_face",
    macroPart: "head",
    label: "Față, tâmple și articulația mandibulară",
    latinName: "Regio facialis et temporalis",
    fmaId: "FMA24728",
    tissue: "Surface",
    tissueLabel: "Zonă cranio-facială",
    system: "integumentary",
    systemLabel: "Suprafața corporală",
    bilateral: true,
    defaultView: "front",
    exerciseFamily: "neck",
    summary:
      "Regiunea anterioară a capului care include fruntea, tâmplele, orbitele oculare, masivul facial și articulația temporo-mandibulară. (față, face, fytyra, viso, faccia, tâmple, temples, tëmthat, tempie, maxilar, jaw, nofulla, mandibola)",
    functionDescription:
      "Conține mușchii mimicii, mușchii masticatori (temporal și maseter) și ramurile nervului trigemen responsabile de sensibilitatea feței.",
    clinicalNotes:
      "Strângerea involuntară a dinților (bruxismul) sau stresul prelungit produc durere la nivelul tâmplelor și pocnituri la deschiderea gurii.",
    commonConditions: [
      "Cefalee bitemporală de tensiune",
      "Disfuncție temporo-mandibulară (ATM)",
      "Sinuzită maxilară",
      "Nevralgie de trigemen",
    ],
    recommendedSpecialty: "Medicină de familie, ORL sau Stomatologie",
    searchKeywords: ["față","face","fytyra","viso","faccia","tâmple","temples","tëmthat","tempie","maxilar","jaw","nofulla","mandibola"],
    localized: {
      ro: {
        label: "Fața, tâmplele și maxilarul",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Regiunea anterioară a capului care include fruntea, tâmplele, orbitele oculare, masivul facial și articulația temporo-mandibulară. (față, face, fytyra, viso)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["față","face","fytyra","viso","faccia","tâmple","temples","tëmthat","tempie","maxilar","jaw","nofulla","mandibola"],
      },
      en: {
        label: "Face, temples and jaw",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Regiunea anterioară a capului care include fruntea, tâmplele, orbitele oculare, masivul facial și articulația temporo-mandibulară. (față, face, fytyra, viso)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["față","face","fytyra","viso","faccia","tâmple","temples","tëmthat","tempie","maxilar","jaw","nofulla","mandibola"],
      },
      sq: {
        label: "Fytyra, tëmthat dhe nofulla",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Regiunea anterioară a capului care include fruntea, tâmplele, orbitele oculare, masivul facial și articulația temporo-mandibulară. (față, face, fytyra, viso)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["față","face","fytyra","viso","faccia","tâmple","temples","tëmthat","tempie","maxilar","jaw","nofulla","mandibola"],
      },
      it: {
        label: "Viso, tempie e mandibola",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Regiunea anterioară a capului care include fruntea, tâmplele, orbitele oculare, masivul facial și articulația temporo-mandibulară. (față, face, fytyra, viso)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["față","face","fytyra","viso","faccia","tâmple","temples","tëmthat","tempie","maxilar","jaw","nofulla","mandibola"],
      },
    },
  },
  cranium_occipital: {
    id: "cranium_occipital",
    macroPart: "head",
    label: "Zona occipitală și baza craniului",
    latinName: "Regio occipitalis",
    fmaId: "FMA3309",
    tissue: "Surface",
    tissueLabel: "Zonă craniană posterioară",
    system: "skeletal",
    systemLabel: "Sistemul osos și nervos",
    bilateral: false,
    defaultView: "back",
    exerciseFamily: "neck",
    summary:
      "Partea din spate a capului, unde mușchii profunzi ai cefei se inseră pe osul occipital și pe unde trec nervii occipitali. (occipital, ceafă, back of head, skull base, zverku, nuca, arnold)",
    functionDescription:
      "Menține echilibrul capului pe prima vertebră cervicală (atlas) și controlează mișcările fine de extensie și rotație a privirii.",
    clinicalNotes:
      "Durerea la baza craniului apare frecvent la persoanele care lucrează mult la birou sau privesc telefonul cu capul aplecat, dar poate însoți și creșterile de tensiune arterială.",
    commonConditions: [
      "Nevralgie occipitală",
      "Cefalee cervicogenă",
      "Puseu de hipertensiune arterială",
    ],
    recommendedSpecialty: "Neurologie sau Cardiologie",
    searchKeywords: ["occipital","ceafă","back of head","skull base","zverku","nuca","arnold"],
    localized: {
      ro: {
        label: "Spatele capului și baza craniului",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Partea din spate a capului, unde mușchii profunzi ai cefei se inseră pe osul occipital și pe unde trec nervii occipitali. (occipital, ceafă, back of head, skull base)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["occipital","ceafă","back of head","skull base","zverku","nuca","arnold"],
      },
      en: {
        label: "Back of the head and skull base",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Partea din spate a capului, unde mușchii profunzi ai cefei se inseră pe osul occipital și pe unde trec nervii occipitali. (occipital, ceafă, back of head, skull base)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["occipital","ceafă","back of head","skull base","zverku","nuca","arnold"],
      },
      sq: {
        label: "Pjesa e pasme e kokës dhe baza e kafkës",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Partea din spate a capului, unde mușchii profunzi ai cefei se inseră pe osul occipital și pe unde trec nervii occipitali. (occipital, ceafă, back of head, skull base)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["occipital","ceafă","back of head","skull base","zverku","nuca","arnold"],
      },
      it: {
        label: "Parte posteriore della testa e base del cranio",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Partea din spate a capului, unde mușchii profunzi ai cefei se inseră pe osul occipital și pe unde trec nervii occipitali. (occipital, ceafă, back of head, skull base)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["occipital","ceafă","back of head","skull base","zverku","nuca","arnold"],
      },
    },
  },
  neck: {
    id: "neck",
    macroPart: "head",
    label: "Gât anterior, faringe și mușchii cervicali",
    latinName: "Collum / Regio cervicalis anterior",
    fmaId: "FMA7155",
    tissue: "Muscle",
    tissueLabel: "Zonă cervicală",
    system: "muscular",
    systemLabel: "Sistemul muscular și respirator superior",
    bilateral: false,
    defaultView: "front",
    exerciseFamily: "neck",
    summary:
      "Regiunea anterioară și laterală a gâtului care cuprinde mușchii sternocleidomastoidieni, faringele, laringele, glanda tiroidă și ganglionii limfatici. (gât, neck, qafa, collo, cervical, torticolis)",
    functionDescription:
      "Susține mobilitatea capului și adăpostește căile aerodigestive superioare (înghițirea, vocea și respirația) precum și vasele carotide.",
    clinicalNotes:
      "Durerea în gât la înghițire însoțită de febră sugerează o faringită sau amigdalită, în timp ce rigiditatea laterală indică un torticolis muscular.",
    commonConditions: [
      "Faringo-amigdalită acută",
      "Torticolis și contractură cervicală",
      "Adenopatie cervicală reactivă",
      "Tiroidită",
    ],
    recommendedSpecialty: "Medicină de familie sau ORL",
    searchKeywords: ["gât","neck","qafa","collo","cervical","torticolis"],
    localized: {
      ro: {
        label: "Mușchii gâtului",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Regiunea anterioară și laterală a gâtului care cuprinde mușchii sternocleidomastoidieni, faringele, laringele, glanda tiroidă și ganglionii limfatici. (gât, neck, qafa, collo)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["gât","neck","qafa","collo","cervical","torticolis"],
      },
      en: {
        label: "Neck muscles",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Regiunea anterioară și laterală a gâtului care cuprinde mușchii sternocleidomastoidieni, faringele, laringele, glanda tiroidă și ganglionii limfatici. (gât, neck, qafa, collo)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["gât","neck","qafa","collo","cervical","torticolis"],
      },
      sq: {
        label: "Muskujt e qafës",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Regiunea anterioară și laterală a gâtului care cuprinde mușchii sternocleidomastoidieni, faringele, laringele, glanda tiroidă și ganglionii limfatici. (gât, neck, qafa, collo)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["gât","neck","qafa","collo","cervical","torticolis"],
      },
      it: {
        label: "Muscoli del collo",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Regiunea anterioară și laterală a gâtului care cuprinde mușchii sternocleidomastoidieni, faringele, laringele, glanda tiroidă și ganglionii limfatici. (gât, neck, qafa, collo)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["gât","neck","qafa","collo","cervical","torticolis"],
      },
    },
  },
  cervical_spine: {
    id: "cervical_spine",
    macroPart: "head",
    label: "Coloana cervicală (vertebrele C1–C7)",
    latinName: "Columna vertebralis cervicalis",
    fmaId: "FMA24138",
    tissue: "Bone",
    tissueLabel: "Coloană vertebrală",
    system: "skeletal",
    systemLabel: "Sistemul osos și articular",
    bilateral: false,
    defaultView: "back",
    exerciseFamily: "neck",
    summary:
      "Segmentul superior al coloanei vertebrale format din 7 vertebre și discurile intervertebrale care susțin greutatea capului (aproximativ 5 kg). (coloană cervicală, cervical spine, shtylla cervikale, colonna cervicale, vertebre gât, neck vertebrae, C1-C7)",
    functionDescription:
      "Permite rotația și înclinarea capului în toate direcțiile, protejând măduva cervicală și rădăcinile nervoase care merg spre umeri și brațe.",
    clinicalNotes:
      "Dacă durerea de ceafă coboară pe umăr și braț până în degete cu furnicături, poate indica o iritație radiculară cervicală.",
    commonConditions: [
      "Spondiloză cervicală",
      "Discopatie cervicală",
      "Sindrom postural cervical (text neck)",
    ],
    recommendedSpecialty: "Recuperare medicală sau Neurologie",
    searchKeywords: ["coloană cervicală","cervical spine","shtylla cervikale","colonna cervicale","vertebre gât","neck vertebrae","C1-C7"],
    localized: {
      ro: {
        label: "Coloana cervicală (vertebrele C1–C7)",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Segmentul superior al coloanei vertebrale format din 7 vertebre și discurile intervertebrale care susțin greutatea capului (aproximativ 5 kg). (coloană cervicală, cervical spine, shtylla cervikale, colonna cervicale)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["coloană cervicală","cervical spine","shtylla cervikale","colonna cervicale","vertebre gât","neck vertebrae","C1-C7"],
      },
      en: {
        label: "Cervical spine (C1–C7 vertebrae)",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Segmentul superior al coloanei vertebrale format din 7 vertebre și discurile intervertebrale care susțin greutatea capului (aproximativ 5 kg). (coloană cervicală, cervical spine, shtylla cervikale, colonna cervicale)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["coloană cervicală","cervical spine","shtylla cervikale","colonna cervicale","vertebre gât","neck vertebrae","C1-C7"],
      },
      sq: {
        label: "Shtylla cervikale (rruazat C1–C7)",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Segmentul superior al coloanei vertebrale format din 7 vertebre și discurile intervertebrale care susțin greutatea capului (aproximativ 5 kg). (coloană cervicală, cervical spine, shtylla cervikale, colonna cervicale)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["coloană cervicală","cervical spine","shtylla cervikale","colonna cervicale","vertebre gât","neck vertebrae","C1-C7"],
      },
      it: {
        label: "Colonna cervicale (vertebre C1–C7)",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Segmentul superior al coloanei vertebrale format din 7 vertebre și discurile intervertebrale care susțin greutatea capului (aproximativ 5 kg). (coloană cervicală, cervical spine, shtylla cervikale, colonna cervicale)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["coloană cervicală","cervical spine","shtylla cervikale","colonna cervicale","vertebre gât","neck vertebrae","C1-C7"],
      },
    },
  },
  pectoral: {
    id: "pectoral",
    macroPart: "chest",
    label: "Mușchii pectorali și peretele toracic",
    latinName: "Musculus pectoralis major et minor",
    fmaId: "FMA9627",
    tissue: "Muscle",
    tissueLabel: "Mușchi scheletic",
    system: "muscular",
    systemLabel: "Sistemul muscular",
    bilateral: true,
    defaultView: "front",
    exerciseFamily: "chest",
    summary:
      "Mușchii în formă de evantai situați în partea anterioară a toracelui, care leagă sternul și clavicula de umăr și braț. (pectoral, pecs, piept, chest, gjoksi, pettorale, torace)",
    functionDescription:
      "Aduc brațul spre trunchi, participă la împingere și ridicare, iar mușchiul pectoral mic ajută la ridicarea coastelor în inspirația profundă.",
    clinicalNotes:
      "Durerea musculară pectorală se reproduce la apăsarea directă pe piept sau la mișcarea brațului, spre deosebire de durerea cardiacă profundă.",
    commonConditions: [
      "Întindere musculară pectorală",
      "Costocondrită (inflamația cartilajelor costale)",
      "Nevralgie intercostală",
    ],
    recommendedSpecialty: "Medicină de familie sau Recuperare medicală",
    searchKeywords: ["pectoral","pecs","piept","chest","gjoksi","pettorale","torace"],
    localized: {
      ro: {
        label: "Mușchii pieptului (pectorali)",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Mușchii în formă de evantai situați în partea anterioară a toracelui, care leagă sternul și clavicula de umăr și braț. (pectoral, pecs, piept, chest)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["pectoral","pecs","piept","chest","gjoksi","pettorale","torace"],
      },
      en: {
        label: "Chest muscles (pectorals)",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Mușchii în formă de evantai situați în partea anterioară a toracelui, care leagă sternul și clavicula de umăr și braț. (pectoral, pecs, piept, chest)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["pectoral","pecs","piept","chest","gjoksi","pettorale","torace"],
      },
      sq: {
        label: "Muskujt e gjoksit (pektoralët)",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Mușchii în formă de evantai situați în partea anterioară a toracelui, care leagă sternul și clavicula de umăr și braț. (pectoral, pecs, piept, chest)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["pectoral","pecs","piept","chest","gjoksi","pettorale","torace"],
      },
      it: {
        label: "Muscoli del petto (pettorali)",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Mușchii în formă de evantai situați în partea anterioară a toracelui, care leagă sternul și clavicula de umăr și braț. (pectoral, pecs, piept, chest)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["pectoral","pecs","piept","chest","gjoksi","pettorale","torace"],
      },
    },
  },
  heart: {
    id: "heart",
    macroPart: "chest",
    label: "Inima",
    latinName: "Cor / Myocardium",
    fmaId: "FMA7088",
    tissue: "Organ",
    tissueLabel: "Organ vital",
    system: "cardiac",
    systemLabel: "Sistemul cardiovascular",
    bilateral: false,
    defaultView: "front",
    exerciseFamily: "chest",
    summary:
      "Organul muscular central al circulației, situat în mediastinul mijlociu, în spatele sternului și ușor spre stânga. (inimă, cord, heart, cardiac, zemra, cuore, miocard, chest, krahrori)",
    functionDescription:
      "Pompează aproximativ 5 litri de sânge pe minut în repaus, asigurând oxigenarea creierului, inimii (prin arterele coronare) și a tuturor organelor.",
    clinicalNotes:
      "Orice durere de tip gheară sau apăsare retrosternală care durează peste câteva minute și iradiază în brațul stâng, gât sau maxilar este o urgență medicală majoră (112).",
    commonConditions: [
      "Palpitații și aritmii supraventriculare",
      "Hipertensiune arterială",
      "Angină pectorală de efort",
      "Sindrom coronarian acut (urgență 112)",
    ],
    recommendedSpecialty: "Cardiologie sau Urgențe 112",
    searchKeywords: ["inimă","cord","heart","cardiac","zemra","cuore","miocard","chest","krahrori"],
    localized: {
      ro: {
        label: "Inima",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Organul muscular central al circulației, situat în mediastinul mijlociu, în spatele sternului și ușor spre stânga. (inimă, cord, heart, cardiac)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["inimă","cord","heart","cardiac","zemra","cuore","miocard","chest","krahrori"],
      },
      en: {
        label: "Heart",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Organul muscular central al circulației, situat în mediastinul mijlociu, în spatele sternului și ușor spre stânga. (inimă, cord, heart, cardiac)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["inimă","cord","heart","cardiac","zemra","cuore","miocard","chest","krahrori"],
      },
      sq: {
        label: "Zemra",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Organul muscular central al circulației, situat în mediastinul mijlociu, în spatele sternului și ușor spre stânga. (inimă, cord, heart, cardiac)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["inimă","cord","heart","cardiac","zemra","cuore","miocard","chest","krahrori"],
      },
      it: {
        label: "Cuore",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Organul muscular central al circulației, situat în mediastinul mijlociu, în spatele sternului și ușor spre stânga. (inimă, cord, heart, cardiac)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["inimă","cord","heart","cardiac","zemra","cuore","miocard","chest","krahrori"],
      },
    },
  },
  lungs: {
    id: "lungs",
    macroPart: "chest",
    label: "Plămânii și bronhiile",
    latinName: "Pulmones (dexter et sinister)",
    fmaId: "FMA7309",
    tissue: "Organ",
    tissueLabel: "Organ respirator",
    system: "respiratory",
    systemLabel: "Sistemul respirator",
    bilateral: true,
    defaultView: "front",
    exerciseFamily: "chest",
    summary:
      "Cele două organe respiratorii spongioase din cutia toracică, învelite de pleură și conectate la trahee prin arborele bronșic. (plămâni, lungs, pulmonary, mushkëritë, polmoni, bronhii, bronchi, respiratory)",
    functionDescription:
      "Realizează oxigenarea sângelui în alveolele pulmonare și eliminarea dioxidului de carbon, cu ajutorul diafragmului și al mușchilor intercostali.",
    clinicalNotes:
      "Junghiul toracic care se intensifică la inspirație adâncă sau tuse poate proveni din iritația pleurei sau a peretelui costal.",
    commonConditions: [
      "Traheobronșită acută",
      "Hiperreactivitate bronșică sau astm",
      "Pneumonie sau pleurezie",
      "Dispnee de efort",
    ],
    recommendedSpecialty: "Pneumologie sau Medicină de familie",
    searchKeywords: ["plămâni","lungs","pulmonary","mushkëritë","polmoni","bronhii","bronchi","respiratory"],
    localized: {
      ro: {
        label: "Plămânii și bronhiile",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Cele două organe respiratorii spongioase din cutia toracică, învelite de pleură și conectate la trahee prin arborele bronșic. (plămâni, lungs, pulmonary, mushkëritë)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["plămâni","lungs","pulmonary","mushkëritë","polmoni","bronhii","bronchi","respiratory"],
      },
      en: {
        label: "Lungs and airways",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Cele două organe respiratorii spongioase din cutia toracică, învelite de pleură și conectate la trahee prin arborele bronșic. (plămâni, lungs, pulmonary, mushkëritë)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["plămâni","lungs","pulmonary","mushkëritë","polmoni","bronhii","bronchi","respiratory"],
      },
      sq: {
        label: "Mushkëritë dhe bronket",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Cele două organe respiratorii spongioase din cutia toracică, învelite de pleură și conectate la trahee prin arborele bronșic. (plămâni, lungs, pulmonary, mushkëritë)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["plămâni","lungs","pulmonary","mushkëritë","polmoni","bronhii","bronchi","respiratory"],
      },
      it: {
        label: "Polmoni e bronchi",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Cele două organe respiratorii spongioase din cutia toracică, învelite de pleură și conectate la trahee prin arborele bronșic. (plămâni, lungs, pulmonary, mushkëritë)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["plămâni","lungs","pulmonary","mushkëritë","polmoni","bronhii","bronchi","respiratory"],
      },
    },
  },
  stomach_organ: {
    id: "stomach_organ",
    macroPart: "stomach",
    label: "Stomac, esofag inferior și epigastru",
    latinName: "Gaster / Ventriculus",
    fmaId: "FMA7148",
    tissue: "Organ",
    tissueLabel: "Organ digestiv",
    system: "digestive",
    systemLabel: "Sistemul digestiv",
    bilateral: false,
    defaultView: "front",
    exerciseFamily: "core",
    summary:
      "Rezervorul muscular digestiv situat în partea superioară a abdomenului (capul pieptului / epigastru), imediat sub diafragm. (stomac, stomach, gastric, stomaku, stomaco, burtă, belly, abdomen)",
    functionDescription:
      "Secretă acid clorhidric și enzime digestive pentru descompunerea alimentelor, fiind protejat de o barieră de mucus bicarbonatat.",
    clinicalNotes:
      "Arsurile care urcă în spatele sternului după mese copioase sau când te întinzi în pat sunt tipice pentru refluxul gastro-esofagian.",
    commonConditions: [
      "Boala de reflux gastro-esofagian (BRGE)",
      "Gastrită acută sau cronică",
      "Dispepsie funcțională",
      "Ulcer gastro-duodenal",
    ],
    recommendedSpecialty: "Gastroenterologie sau Medicină de familie",
    searchKeywords: ["stomac","stomach","gastric","stomaku","stomaco","burtă","belly","abdomen"],
    localized: {
      ro: {
        label: "Stomacul",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Rezervorul muscular digestiv situat în partea superioară a abdomenului (capul pieptului / epigastru), imediat sub diafragm. (stomac, stomach, gastric, stomaku)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["stomac","stomach","gastric","stomaku","stomaco","burtă","belly","abdomen"],
      },
      en: {
        label: "Stomach",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Rezervorul muscular digestiv situat în partea superioară a abdomenului (capul pieptului / epigastru), imediat sub diafragm. (stomac, stomach, gastric, stomaku)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["stomac","stomach","gastric","stomaku","stomaco","burtă","belly","abdomen"],
      },
      sq: {
        label: "Stomaku",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Rezervorul muscular digestiv situat în partea superioară a abdomenului (capul pieptului / epigastru), imediat sub diafragm. (stomac, stomach, gastric, stomaku)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["stomac","stomach","gastric","stomaku","stomaco","burtă","belly","abdomen"],
      },
      it: {
        label: "Stomaco",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Rezervorul muscular digestiv situat în partea superioară a abdomenului (capul pieptului / epigastru), imediat sub diafragm. (stomac, stomach, gastric, stomaku)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["stomac","stomach","gastric","stomaku","stomaco","burtă","belly","abdomen"],
      },
    },
  },
  liver: {
    id: "liver",
    macroPart: "stomach",
    label: "Ficat și vezică biliară (colecist)",
    latinName: "Hepar et Vesica biliaris",
    fmaId: "FMA7197",
    tissue: "Organ",
    tissueLabel: "Organ hepato-biliar",
    system: "digestive",
    systemLabel: "Sistemul digestiv și hepatic",
    bilateral: false,
    defaultView: "front",
    exerciseFamily: "core",
    summary:
      "Cel mai mare organ intern, situat sub coastele din partea dreaptă (hipocondrul drept), împreună cu vezica biliară (fierea). (ficat, liver, hepatic, mëlçia, fegato, colecist, gallbladder)",
    functionDescription:
      "Filtrează toxinele, sintetizează proteinele esențiale, reglează glicemia și colesterolul și produce bila necesară digestiei grăsimilor.",
    clinicalNotes:
      "Durerea sub coastele din dreapta însoțită de greață sau gust amar după alimente grase indică frecvent o dischinezie sau colică biliară.",
    commonConditions: [
      "Dischinezie biliară (fiere leneșă)",
      "Litiază biliară (pietre la fiere)",
      "Steatoză hepatică",
    ],
    recommendedSpecialty: "Gastroenterologie sau Medicină internă",
    searchKeywords: ["ficat","liver","hepatic","mëlçia","fegato","colecist","gallbladder"],
    localized: {
      ro: {
        label: "Ficatul (sub coastele din dreapta)",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Cel mai mare organ intern, situat sub coastele din partea dreaptă (hipocondrul drept), împreună cu vezica biliară (fierea). (ficat, liver, hepatic, mëlçia)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["ficat","liver","hepatic","mëlçia","fegato","colecist","gallbladder"],
      },
      en: {
        label: "Liver (under the right ribs)",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Cel mai mare organ intern, situat sub coastele din partea dreaptă (hipocondrul drept), împreună cu vezica biliară (fierea). (ficat, liver, hepatic, mëlçia)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["ficat","liver","hepatic","mëlçia","fegato","colecist","gallbladder"],
      },
      sq: {
        label: "Mëlçia (nën brinjët djathtas)",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Cel mai mare organ intern, situat sub coastele din partea dreaptă (hipocondrul drept), împreună cu vezica biliară (fierea). (ficat, liver, hepatic, mëlçia)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["ficat","liver","hepatic","mëlçia","fegato","colecist","gallbladder"],
      },
      it: {
        label: "Fegato (sotto le costole a destra)",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Cel mai mare organ intern, situat sub coastele din partea dreaptă (hipocondrul drept), împreună cu vezica biliară (fierea). (ficat, liver, hepatic, mëlçia)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["ficat","liver","hepatic","mëlçia","fegato","colecist","gallbladder"],
      },
    },
  },
  colon: {
    id: "colon",
    macroPart: "stomach",
    label: "Intestin și colon (ascendent, transvers, descendent)",
    latinName: "Intestinum crassum / Colon",
    fmaId: "FMA222905",
    tissue: "Organ",
    tissueLabel: "Organ digestiv",
    system: "digestive",
    systemLabel: "Sistemul digestiv",
    bilateral: false,
    defaultView: "front",
    exerciseFamily: "core",
    summary:
      "Cadrul colonic care înconjoară cavitatea abdominală, responsabil de absorbția apei, echilibrul florei intestinale și tranzitul digestiv. (colon, intestine, bowel, zorra, apendice, appendix, apendiksi, appendice)",
    functionDescription:
      "Mișcările peristaltice coordonate propulsează conținutul intestinal; sensibilitatea crescută a peretelui colonic provoacă crampe și balonare.",
    clinicalNotes:
      "Durerea abdominală care se ameliorează după scaun sau eliminarea gazelor este caracteristică tulburărilor funcționale de tranzit.",
    commonConditions: [
      "Sindromul de intestin iritabil",
      "Meteorism abdominal (balonare)",
      "Enterocolită acută",
      "Constipație funcțională",
    ],
    recommendedSpecialty: "Gastroenterologie sau Medicină de familie",
    searchKeywords: ["colon","intestine","bowel","zorra","apendice","appendix","apendiksi","appendice"],
    localized: {
      ro: {
        label: "Intestinul gros",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Cadrul colonic care înconjoară cavitatea abdominală, responsabil de absorbția apei, echilibrul florei intestinale și tranzitul digestiv. (colon, intestine, bowel, zorra)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["colon","intestine","bowel","zorra","apendice","appendix","apendiksi","appendice"],
      },
      en: {
        label: "Large bowel",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Cadrul colonic care înconjoară cavitatea abdominală, responsabil de absorbția apei, echilibrul florei intestinale și tranzitul digestiv. (colon, intestine, bowel, zorra)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["colon","intestine","bowel","zorra","apendice","appendix","apendiksi","appendice"],
      },
      sq: {
        label: "Zorra e trashë",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Cadrul colonic care înconjoară cavitatea abdominală, responsabil de absorbția apei, echilibrul florei intestinale și tranzitul digestiv. (colon, intestine, bowel, zorra)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["colon","intestine","bowel","zorra","apendice","appendix","apendiksi","appendice"],
      },
      it: {
        label: "Intestino crasso",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Cadrul colonic care înconjoară cavitatea abdominală, responsabil de absorbția apei, echilibrul florei intestinale și tranzitul digestiv. (colon, intestine, bowel, zorra)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["colon","intestine","bowel","zorra","apendice","appendix","apendiksi","appendice"],
      },
    },
  },
  abdominals: {
    id: "abdominals",
    macroPart: "stomach",
    label: "Peretele muscular abdominal (drept abdominal)",
    latinName: "Musculus rectus abdominis",
    fmaId: "FMA9628",
    tissue: "Muscle",
    tissueLabel: "Mușchi scheletic",
    system: "muscular",
    systemLabel: "Sistemul muscular",
    bilateral: false,
    defaultView: "front",
    exerciseFamily: "core",
    summary:
      "Banda musculară verticală a abdomenului anterior care susține organele interne și stabilizează trunchiul și bazinul. (abdominals, abs, abdomen, pătrățele, barku, addominali)",
    functionDescription:
      "Flectează trunchiul, menține presiunea intra-abdominală și asistă expirația forțată și tusea.",
    clinicalNotes:
      "Dacă durerea se accentuează când încordezi abdomenul sau ridici umerii de pe pernă, cauza este adesea parietală (musculară), nu viscerală.",
    commonConditions: [
      "Febră musculară sau întindere abdominală",
      "Hernie ombilicală sau epigastrică",
      "Crampe abdominale parietale",
    ],
    recommendedSpecialty: "Medicină de familie sau Chirurgie generală",
    searchKeywords: ["abdominals","abs","abdomen","pătrățele","barku","addominali"],
    localized: {
      ro: {
        label: "Mușchii burții",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Banda musculară verticală a abdomenului anterior care susține organele interne și stabilizează trunchiul și bazinul. (abdominals, abs, abdomen, pătrățele)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["abdominals","abs","abdomen","pătrățele","barku","addominali"],
      },
      en: {
        label: "Abdominal muscles",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Banda musculară verticală a abdomenului anterior care susține organele interne și stabilizează trunchiul și bazinul. (abdominals, abs, abdomen, pătrățele)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["abdominals","abs","abdomen","pătrățele","barku","addominali"],
      },
      sq: {
        label: "Muskujt e barkut",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Banda musculară verticală a abdomenului anterior care susține organele interne și stabilizează trunchiul și bazinul. (abdominals, abs, abdomen, pătrățele)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["abdominals","abs","abdomen","pătrățele","barku","addominali"],
      },
      it: {
        label: "Muscoli addominali",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Banda musculară verticală a abdomenului anterior care susține organele interne și stabilizează trunchiul și bazinul. (abdominals, abs, abdomen, pătrățele)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["abdominals","abs","abdomen","pătrățele","barku","addominali"],
      },
    },
  },
  obliques: {
    id: "obliques",
    macroPart: "stomach",
    label: "Flancuri abdominale și mușchii oblici",
    latinName: "Musculus obliquus externus et internus",
    fmaId: "FMA13335",
    tissue: "Muscle",
    tissueLabel: "Mușchi scheletic",
    system: "muscular",
    systemLabel: "Sistemul muscular",
    bilateral: true,
    defaultView: "three-quarter",
    exerciseFamily: "core",
    summary:
      "Straturile musculare laterale ale taliei și coastelor inferioare care permit rotația și înclinarea laterală a trunchiului. (oblici, obliques, flancuri, flanks, ijët, obliqui, fianchi, waist)",
    functionDescription:
      "Formează un corset muscular natural în jurul taliei, protejând organele laterale și descărcând coloana lombară.",
    clinicalNotes:
      "Durerea într-un singur flanc poate fi musculară după o răsucire bruscă, dar dacă este profundă și colicativă poate proveni de la rinichi sau colon.",
    commonConditions: [
      "Întindere a mușchilor oblici sau intercostali",
      "Durere abdominală laterală (în flanc)",
      "Colică reno-ureterală iradiată",
    ],
    recommendedSpecialty: "Medicină de familie sau Medicină internă",
    searchKeywords: ["oblici","obliques","flancuri","flanks","ijët","obliqui","fianchi","waist"],
    localized: {
      ro: {
        label: "Mușchii laterali ai burții (oblici)",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Straturile musculare laterale ale taliei și coastelor inferioare care permit rotația și înclinarea laterală a trunchiului. (oblici, obliques, flancuri, flanks)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["oblici","obliques","flancuri","flanks","ijët","obliqui","fianchi","waist"],
      },
      en: {
        label: "Side belly muscles (obliques)",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Straturile musculare laterale ale taliei și coastelor inferioare care permit rotația și înclinarea laterală a trunchiului. (oblici, obliques, flancuri, flanks)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["oblici","obliques","flancuri","flanks","ijët","obliqui","fianchi","waist"],
      },
      sq: {
        label: "Muskujt anësorë të barkut",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Straturile musculare laterale ale taliei și coastelor inferioare care permit rotația și înclinarea laterală a trunchiului. (oblici, obliques, flancuri, flanks)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["oblici","obliques","flancuri","flanks","ijët","obliqui","fianchi","waist"],
      },
      it: {
        label: "Muscoli laterali della pancia (obliqui)",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Straturile musculare laterale ale taliei și coastelor inferioare care permit rotația și înclinarea laterală a trunchiului. (oblici, obliques, flancuri, flanks)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["oblici","obliques","flancuri","flanks","ijët","obliqui","fianchi","waist"],
      },
    },
  },
  trapezius: {
    id: "trapezius",
    macroPart: "back",
    label: "Mușchiul trapez (ceafă și umeri superiori)",
    latinName: "Musculus trapezius",
    fmaId: "FMA32549",
    tissue: "Muscle",
    tissueLabel: "Mușchi scheletic",
    system: "muscular",
    systemLabel: "Sistemul muscular",
    bilateral: false,
    defaultView: "back",
    exerciseFamily: "back",
    summary:
      "Mușchiul larg în formă de diamant care pornește de la baza craniului, acoperă ceafa și umerii și coboară până la mijlocul spatelui. (trapez, trapezius, traps, trapezi, trapezio, umeri, shoulders)",
    functionDescription:
      "Ridică, retrage și rotește omoplații, susținând greutatea brațelor și poziția capului în timpul lucrului la birou sau al efortului.",
    clinicalNotes:
      "Este principalul mușchi în care se acumulează tensiunea provocată de stres, frig sau poziția cu umerii ridicați.",
    commonConditions: [
      "Sindrom miofascial cervical și de trapez",
      "Contractură musculară de stres sau curent",
      "Cefalee tensională cu punct de plecare cervical",
    ],
    recommendedSpecialty: "Recuperare medicală și Kinetoterapie",
    searchKeywords: ["trapez","trapezius","traps","trapezi","trapezio","umeri","shoulders"],
    localized: {
      ro: {
        label: "Mușchiul trapez (ceafă și umeri)",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Mușchiul larg în formă de diamant care pornește de la baza craniului, acoperă ceafa și umerii și coboară până la mijlocul spatelui. (trapez, trapezius, traps, trapezi)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["trapez","trapezius","traps","trapezi","trapezio","umeri","shoulders"],
      },
      en: {
        label: "Trapezius (neck and shoulders)",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Mușchiul larg în formă de diamant care pornește de la baza craniului, acoperă ceafa și umerii și coboară până la mijlocul spatelui. (trapez, trapezius, traps, trapezi)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["trapez","trapezius","traps","trapezi","trapezio","umeri","shoulders"],
      },
      sq: {
        label: "Muskuli trapez (qafa dhe shpatullat)",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Mușchiul larg în formă de diamant care pornește de la baza craniului, acoperă ceafa și umerii și coboară până la mijlocul spatelui. (trapez, trapezius, traps, trapezi)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["trapez","trapezius","traps","trapezi","trapezio","umeri","shoulders"],
      },
      it: {
        label: "Trapezio (collo e spalle)",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Mușchiul larg în formă de diamant care pornește de la baza craniului, acoperă ceafa și umerii și coboară până la mijlocul spatelui. (trapez, trapezius, traps, trapezi)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["trapez","trapezius","traps","trapezi","trapezio","umeri","shoulders"],
      },
    },
  },
  upper_back: {
    id: "upper_back",
    macroPart: "back",
    label: "Spate superior, romboizi și marele dorsal",
    latinName: "Musculi rhomboidei et latissimus dorsi",
    fmaId: "FMA13379",
    tissue: "Muscle",
    tissueLabel: "Mușchi scheletic",
    system: "muscular",
    systemLabel: "Sistemul muscular",
    bilateral: false,
    defaultView: "back",
    exerciseFamily: "back",
    summary:
      "Musculatura interscapulară (dintre omoplați) și dorsală largă care stabilizează centura scapulară și cutia toracică posterioară. (spate superior, upper back, omoplați, shoulder blades, kurrizi i sipërm, dorso superiore, scapole)",
    functionDescription:
      "Apropie omoplații de coloană pentru o postură dreaptă și transmite forța între brațe și trunchi la tras sau ridicat.",
    clinicalNotes:
      "Statul prelungit cu spatele cocoșat alungește și obosește mușchii romboizi, provocând o senzație de arsură sau nod între omoplați.",
    commonConditions: [
      "Dorsalgie posturală interscapulară",
      "Contractură a mușchilor romboizi",
      "Puncte trigger miofasciale dorsale",
    ],
    recommendedSpecialty: "Recuperare medicală și Fizioterapie",
    searchKeywords: ["spate superior","upper back","omoplați","shoulder blades","kurrizi i sipërm","dorso superiore","scapole"],
    localized: {
      ro: {
        label: "Spatele de sus (între omoplați)",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Musculatura interscapulară (dintre omoplați) și dorsală largă care stabilizează centura scapulară și cutia toracică posterioară. (spate superior, upper back, omoplați, shoulder blades)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["spate superior","upper back","omoplați","shoulder blades","kurrizi i sipërm","dorso superiore","scapole"],
      },
      en: {
        label: "Upper back (between the shoulder blades)",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Musculatura interscapulară (dintre omoplați) și dorsală largă care stabilizează centura scapulară și cutia toracică posterioară. (spate superior, upper back, omoplați, shoulder blades)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["spate superior","upper back","omoplați","shoulder blades","kurrizi i sipërm","dorso superiore","scapole"],
      },
      sq: {
        label: "Kurrizi i sipërm (mes shpatullave)",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Musculatura interscapulară (dintre omoplați) și dorsală largă care stabilizează centura scapulară și cutia toracică posterioară. (spate superior, upper back, omoplați, shoulder blades)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["spate superior","upper back","omoplați","shoulder blades","kurrizi i sipërm","dorso superiore","scapole"],
      },
      it: {
        label: "Parte alta della schiena (tra le scapole)",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Musculatura interscapulară (dintre omoplați) și dorsală largă care stabilizează centura scapulară și cutia toracică posterioară. (spate superior, upper back, omoplați, shoulder blades)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["spate superior","upper back","omoplați","shoulder blades","kurrizi i sipërm","dorso superiore","scapole"],
      },
    },
  },
  thoracic_spine: {
    id: "thoracic_spine",
    macroPart: "back",
    label: "Coloana toracală (vertebrele T1–T12)",
    latinName: "Columna vertebralis thoracica",
    fmaId: "FMA9140",
    tissue: "Bone",
    tissueLabel: "Coloană vertebrală",
    system: "skeletal",
    systemLabel: "Sistemul osos și articular",
    bilateral: false,
    defaultView: "back",
    exerciseFamily: "back",
    summary:
      "Segmentul mijlociu al coloanei vertebrale format din 12 vertebre articulate cu coastele cutiei toracice. (coloană dorsală, coloană toracală, thoracic spine, shtylla torakale, colonna toracica, colonna dorsale, T1-T12)",
    functionDescription:
      "Asigură rotația trunchiului și protecția măduvei spinării toracale și a organelor vitale din piept.",
    clinicalNotes:
      "Rigiditatea coloanei toracale dimineața se ameliorează excelent prin exerciții blânde de rotație și respirație costală.",
    commonConditions: [
      "Cifoză posturală și rigiditate toracală",
      "Spondiloză dorsală",
      "Nevralgie intercostală cu origine vertebrală",
    ],
    recommendedSpecialty: "Recuperare medicală sau Reumatologie",
    searchKeywords: ["coloană dorsală","coloană toracală","thoracic spine","shtylla torakale","colonna toracica","colonna dorsale","T1-T12"],
    localized: {
      ro: {
        label: "Coloana toracală (vertebrele T1–T12)",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Segmentul mijlociu al coloanei vertebrale format din 12 vertebre articulate cu coastele cutiei toracice. (coloană dorsală, coloană toracală, thoracic spine, shtylla torakale)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["coloană dorsală","coloană toracală","thoracic spine","shtylla torakale","colonna toracica","colonna dorsale","T1-T12"],
      },
      en: {
        label: "Thoracic spine (T1–T12 vertebrae)",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Segmentul mijlociu al coloanei vertebrale format din 12 vertebre articulate cu coastele cutiei toracice. (coloană dorsală, coloană toracală, thoracic spine, shtylla torakale)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["coloană dorsală","coloană toracală","thoracic spine","shtylla torakale","colonna toracica","colonna dorsale","T1-T12"],
      },
      sq: {
        label: "Shtylla torakale (rruazat T1–T12)",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Segmentul mijlociu al coloanei vertebrale format din 12 vertebre articulate cu coastele cutiei toracice. (coloană dorsală, coloană toracală, thoracic spine, shtylla torakale)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["coloană dorsală","coloană toracală","thoracic spine","shtylla torakale","colonna toracica","colonna dorsale","T1-T12"],
      },
      it: {
        label: "Colonna toracica (vertebre T1–T12)",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Segmentul mijlociu al coloanei vertebrale format din 12 vertebre articulate cu coastele cutiei toracice. (coloană dorsală, coloană toracală, thoracic spine, shtylla torakale)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["coloană dorsală","coloană toracală","thoracic spine","shtylla torakale","colonna toracica","colonna dorsale","T1-T12"],
      },
    },
  },
  lower_back: {
    id: "lower_back",
    macroPart: "back",
    label: "Spate inferior și mușchii erectori spinali (șale)",
    latinName: "Musculus erector spinae / Regio lumbalis",
    fmaId: "FMA71300",
    tissue: "Muscle",
    tissueLabel: "Mușchi paravertebral",
    system: "muscular",
    systemLabel: "Sistemul muscular",
    bilateral: false,
    defaultView: "back",
    exerciseFamily: "back",
    summary:
      "Coloanele musculare puternice situate de o parte și de alta a coloanei lombare, care mențin trunchiul drept. (spate inferior, șale, lower back, lumbago, shpina e poshtme, mesi, parte bassa della schiena, zona lombare)",
    functionDescription:
      "Controlează aplecarea și îndreptarea spatelui, preluând sarcini mari în timpul ridicării obiectelor sau al statului pe scaun.",
    clinicalNotes:
      "Majoritatea durerilor de șale (lumbago) sunt mecanice și musculare; mișcarea ușoară și plimbările scurte ajută vindecarea mai mult decât repausul total la pat.",
    commonConditions: [
      "Lumbago acut mecanic (contractură lombară)",
      "Suprasolicitare musculară paravertebrală",
      "Sindrom postural lombar",
    ],
    recommendedSpecialty: "Recuperare medicală sau Medicină de familie",
    searchKeywords: ["spate inferior","șale","lower back","lumbago","shpina e poshtme","mesi","parte bassa della schiena","zona lombare"],
    localized: {
      ro: {
        label: "Șalele (jos pe spate)",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Coloanele musculare puternice situate de o parte și de alta a coloanei lombare, care mențin trunchiul drept. (spate inferior, șale, lower back, lumbago)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["spate inferior","șale","lower back","lumbago","shpina e poshtme","mesi","parte bassa della schiena","zona lombare"],
      },
      en: {
        label: "Lower back",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Coloanele musculare puternice situate de o parte și de alta a coloanei lombare, care mențin trunchiul drept. (spate inferior, șale, lower back, lumbago)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["spate inferior","șale","lower back","lumbago","shpina e poshtme","mesi","parte bassa della schiena","zona lombare"],
      },
      sq: {
        label: "Mesi (fundi i shpinës)",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Coloanele musculare puternice situate de o parte și de alta a coloanei lombare, care mențin trunchiul drept. (spate inferior, șale, lower back, lumbago)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["spate inferior","șale","lower back","lumbago","shpina e poshtme","mesi","parte bassa della schiena","zona lombare"],
      },
      it: {
        label: "Zona lombare (parte bassa della schiena)",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Coloanele musculare puternice situate de o parte și de alta a coloanei lombare, care mențin trunchiul drept. (spate inferior, șale, lower back, lumbago)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["spate inferior","șale","lower back","lumbago","shpina e poshtme","mesi","parte bassa della schiena","zona lombare"],
      },
    },
  },
  lumbar_spine: {
    id: "lumbar_spine",
    macroPart: "back",
    label: "Coloana lombară și discurile L1–L5",
    latinName: "Columna vertebralis lumbalis",
    fmaId: "FMA16203",
    tissue: "Bone",
    tissueLabel: "Coloană și discuri",
    system: "skeletal",
    systemLabel: "Sistemul osos și articular",
    bilateral: false,
    defaultView: "back",
    exerciseFamily: "back",
    summary:
      "Cele 5 vertebre lombare masive și discurile lor intervertebrale care suportă întreaga greutate a părții superioare a corpului. (coloană lombară, lumbar spine, shtylla lumbare, colonna lombare, vertebre șale, discuri, L1-L5)",
    functionDescription:
      "Discurile intervertebrale acționează ca amortizoare hidraulice între vertebre, protejând rădăcinile nervului sciatic și femural.",
    clinicalNotes:
      "Durerea lombară care coboară pe fesă și picior (sciatică) indică iritația unei rădăcini nervoase; dacă apare amorțeală în șa sau pierderea controlului urinar, este urgență chirurgicală.",
    commonConditions: [
      "Discopatie lombară și protruzie discală",
      "Lombosciatică (radiculopatie L4–S1)",
      "Spondilartroză lombară",
    ],
    recommendedSpecialty: "Neurologie, Neurochirurgie sau Recuperare medicală",
    searchKeywords: ["coloană lombară","lumbar spine","shtylla lumbare","colonna lombare","vertebre șale","discuri","L1-L5"],
    localized: {
      ro: {
        label: "Coloana lombară (vertebrele L1–L5)",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Cele 5 vertebre lombare masive și discurile lor intervertebrale care suportă întreaga greutate a părții superioare a corpului. (coloană lombară, lumbar spine, shtylla lumbare, colonna lombare)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["coloană lombară","lumbar spine","shtylla lumbare","colonna lombare","vertebre șale","discuri","L1-L5"],
      },
      en: {
        label: "Lumbar spine (L1–L5 vertebrae)",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Cele 5 vertebre lombare masive și discurile lor intervertebrale care suportă întreaga greutate a părții superioare a corpului. (coloană lombară, lumbar spine, shtylla lumbare, colonna lombare)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["coloană lombară","lumbar spine","shtylla lumbare","colonna lombare","vertebre șale","discuri","L1-L5"],
      },
      sq: {
        label: "Shtylla lumbare (rruazat L1–L5)",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Cele 5 vertebre lombare masive și discurile lor intervertebrale care suportă întreaga greutate a părții superioare a corpului. (coloană lombară, lumbar spine, shtylla lumbare, colonna lombare)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["coloană lombară","lumbar spine","shtylla lumbare","colonna lombare","vertebre șale","discuri","L1-L5"],
      },
      it: {
        label: "Colonna lombare (vertebre L1–L5)",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Cele 5 vertebre lombare masive și discurile lor intervertebrale care suportă întreaga greutate a părții superioare a corpului. (coloană lombară, lumbar spine, shtylla lumbare, colonna lombare)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["coloană lombară","lumbar spine","shtylla lumbare","colonna lombare","vertebre șale","discuri","L1-L5"],
      },
    },
  },
  kidneys: {
    id: "kidneys",
    macroPart: "back",
    label: "Rinichii",
    latinName: "Renes (dexter et sinister)",
    fmaId: "FMA7203",
    tissue: "Organ",
    tissueLabel: "Organ reno-urinar",
    system: "urinary",
    systemLabel: "Sistemul reno-urinar",
    bilateral: true,
    defaultView: "back",
    exerciseFamily: "core",
    summary:
      "Cele două organe în formă de bob de fasole situate profund în spatele abdomenului, sub ultimele coaste, de o parte și de alta a coloanei. (rinichi, kidneys, renal, veshkat, reni, lojă renală)",
    functionDescription:
      "Filtrează permanent sângele, elimină produșii reziduali prin urină și mențin echilibrul hidric și tensiunea arterială.",
    clinicalNotes:
      "Spre deosebire de durerea musculară de spate, durerea renală este profundă, nu depinde de poziția corpului și poate fi însoțită de usturimi la urinare sau febră.",
    commonConditions: [
      "Colică renală (microlitiază sau calculi renali)",
      "Infecție de tract urinar / pielonefrită",
    ],
    recommendedSpecialty: "Urologie, Nefrologie sau Medicină de familie",
    searchKeywords: ["rinichi","kidneys","renal","veshkat","reni","lojă renală"],
    localized: {
      ro: {
        label: "Rinichii",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Cele două organe în formă de bob de fasole situate profund în spatele abdomenului, sub ultimele coaste, de o parte și de alta a coloanei. (rinichi, kidneys, renal, veshkat)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["rinichi","kidneys","renal","veshkat","reni","lojă renală"],
      },
      en: {
        label: "Kidneys",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Cele două organe în formă de bob de fasole situate profund în spatele abdomenului, sub ultimele coaste, de o parte și de alta a coloanei. (rinichi, kidneys, renal, veshkat)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["rinichi","kidneys","renal","veshkat","reni","lojă renală"],
      },
      sq: {
        label: "Veshkat",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Cele două organe în formă de bob de fasole situate profund în spatele abdomenului, sub ultimele coaste, de o parte și de alta a coloanei. (rinichi, kidneys, renal, veshkat)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["rinichi","kidneys","renal","veshkat","reni","lojă renală"],
      },
      it: {
        label: "Reni",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Cele două organe în formă de bob de fasole situate profund în spatele abdomenului, sub ultimele coaste, de o parte și de alta a coloanei. (rinichi, kidneys, renal, veshkat)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["rinichi","kidneys","renal","veshkat","reni","lojă renală"],
      },
    },
  },
  gluteal: {
    id: "gluteal",
    macroPart: "back",
    label: "Mușchii fesieri și bazinul posterior",
    latinName: "Musculi glutei (maximus, medius, minimus)",
    fmaId: "FMA22314",
    tissue: "Muscle",
    tissueLabel: "Mușchi scheletic",
    system: "muscular",
    systemLabel: "Sistemul muscular",
    bilateral: true,
    defaultView: "back",
    exerciseFamily: "hip",
    summary:
      "Cel mai puternic grup muscular al corpului, care stabilizează bazinul, articulația sacro-iliacă și șoldul în timpul mersului. (fesieri, gluteal, glutes, buttocks, vithet, glutei, natiche)",
    functionDescription:
      "Menține bazinul orizontal când pășești pe un picior și propulsează corpul la urcatul scărilor sau ridicarea de pe scaun.",
    clinicalNotes:
      "Contractura mușchiului piriform din profunzimea fesei poate comprima nervul sciatic, mimând o lombosciatică vertebrală.",
    commonConditions: [
      "Sindromul mușchiului piriform",
      "Disfuncție de articulație sacro-iliacă",
      "Tendinopatie fesieră (bursită trohanteriană)",
    ],
    recommendedSpecialty: "Recuperare medicală sau Ortopedie",
    searchKeywords: ["fesieri","gluteal","glutes","buttocks","vithet","glutei","natiche"],
    localized: {
      ro: {
        label: "Mușchii fesieri",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Cel mai puternic grup muscular al corpului, care stabilizează bazinul, articulația sacro-iliacă și șoldul în timpul mersului. (fesieri, gluteal, glutes, buttocks)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["fesieri","gluteal","glutes","buttocks","vithet","glutei","natiche"],
      },
      en: {
        label: "Buttock muscles (glutes)",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Cel mai puternic grup muscular al corpului, care stabilizează bazinul, articulația sacro-iliacă și șoldul în timpul mersului. (fesieri, gluteal, glutes, buttocks)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["fesieri","gluteal","glutes","buttocks","vithet","glutei","natiche"],
      },
      sq: {
        label: "Muskujt e vitheve",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Cel mai puternic grup muscular al corpului, care stabilizează bazinul, articulația sacro-iliacă și șoldul în timpul mersului. (fesieri, gluteal, glutes, buttocks)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["fesieri","gluteal","glutes","buttocks","vithet","glutei","natiche"],
      },
      it: {
        label: "Muscoli dei glutei",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Cel mai puternic grup muscular al corpului, care stabilizează bazinul, articulația sacro-iliacă și șoldul în timpul mersului. (fesieri, gluteal, glutes, buttocks)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["fesieri","gluteal","glutes","buttocks","vithet","glutei","natiche"],
      },
    },
  },
  deltoid: {
    id: "deltoid",
    macroPart: "arm",
    label: "Umăr și mușchiul deltoid",
    latinName: "Musculus deltoideus",
    fmaId: "FMA32521",
    tissue: "Muscle",
    tissueLabel: "Mușchi scheletic",
    system: "muscular",
    systemLabel: "Sistemul muscular",
    bilateral: true,
    defaultView: "front",
    exerciseFamily: "shoulder",
    summary:
      "Mușchiul rotunjit care învelește articulația umărului pe partea anterioară, laterală și posterioară. (deltoid, umăr, shoulder, shpatulla, spalla)",
    functionDescription:
      "Este motorul principal pentru ridicarea brațului în față, în lateral și în spate.",
    clinicalNotes:
      "Durerea la ridicarea brațului peste nivelul umărului apare frecvent în suprasolicitările subacromiale.",
    commonConditions: [
      "Suprasolicitare deltoidiană",
      "Bursită subacromială",
      "Capsulită adezivă (umăr înghețat)",
    ],
    recommendedSpecialty: "Ortopedie sau Recuperare medicală",
    searchKeywords: ["deltoid","umăr","shoulder","shpatulla","spalla"],
    localized: {
      ro: {
        label: "Mușchiul umărului (deltoid)",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Mușchiul rotunjit care învelește articulația umărului pe partea anterioară, laterală și posterioară. (deltoid, umăr, shoulder, shpatulla)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["deltoid","umăr","shoulder","shpatulla","spalla"],
      },
      en: {
        label: "Shoulder muscle (deltoid)",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Mușchiul rotunjit care învelește articulația umărului pe partea anterioară, laterală și posterioară. (deltoid, umăr, shoulder, shpatulla)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["deltoid","umăr","shoulder","shpatulla","spalla"],
      },
      sq: {
        label: "Muskuli i shpatullës (deltoid)",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Mușchiul rotunjit care învelește articulația umărului pe partea anterioară, laterală și posterioară. (deltoid, umăr, shoulder, shpatulla)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["deltoid","umăr","shoulder","shpatulla","spalla"],
      },
      it: {
        label: "Muscolo della spalla (deltoide)",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Mușchiul rotunjit care învelește articulația umărului pe partea anterioară, laterală și posterioară. (deltoid, umăr, shoulder, shpatulla)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["deltoid","umăr","shoulder","shpatulla","spalla"],
      },
    },
  },
  rotator_cuff: {
    id: "rotator_cuff",
    macroPart: "arm",
    label: "Coafa rotatorilor și tendoanele umărului",
    latinName: "Musculi rotatores humeri (infraspinatus, teres)",
    fmaId: "FMA32546",
    tissue: "Tendon",
    tissueLabel: "Complex tendinos",
    system: "muscular",
    systemLabel: "Sistemul muscular și tendinos",
    bilateral: true,
    defaultView: "back",
    exerciseFamily: "shoulder",
    summary:
      "Grupul de patru mușchi profunzi și tendoanele lor care centrează capul humeral în articulația umărului. (coafa rotatorilor, rotator cuff, mansheta rrotulluese, cuffia dei rotatori, supraspinos, supraspinatus)",
    functionDescription:
      "Asigură rotația fină și stabilitatea umărului în timpul oricărei mișcări a mâinii deasupra capului sau la spate.",
    clinicalNotes:
      "Durerea de coafă rotatorie se simte adesea pe partea exterioară a brațului și poate deranja somnul când stai culcat pe umărul afectat.",
    commonConditions: [
      "Tendinopatie a coafei rotatorilor",
      "Sindrom de impingement subacromial",
      "Tendinită calcificantă a umărului",
    ],
    recommendedSpecialty: "Ortopedie și Kinetoterapie",
    searchKeywords: ["coafa rotatorilor","rotator cuff","mansheta rrotulluese","cuffia dei rotatori","supraspinos","supraspinatus"],
    localized: {
      ro: {
        label: "Tendoanele umărului (coafa rotatorilor)",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Grupul de patru mușchi profunzi și tendoanele lor care centrează capul humeral în articulația umărului. (coafa rotatorilor, rotator cuff, mansheta rrotulluese, cuffia dei rotatori)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["coafa rotatorilor","rotator cuff","mansheta rrotulluese","cuffia dei rotatori","supraspinos","supraspinatus"],
      },
      en: {
        label: "Shoulder tendons (rotator cuff)",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Grupul de patru mușchi profunzi și tendoanele lor care centrează capul humeral în articulația umărului. (coafa rotatorilor, rotator cuff, mansheta rrotulluese, cuffia dei rotatori)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["coafa rotatorilor","rotator cuff","mansheta rrotulluese","cuffia dei rotatori","supraspinos","supraspinatus"],
      },
      sq: {
        label: "Tendinat e shpatullës (mansheta rrotulluese)",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Grupul de patru mușchi profunzi și tendoanele lor care centrează capul humeral în articulația umărului. (coafa rotatorilor, rotator cuff, mansheta rrotulluese, cuffia dei rotatori)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["coafa rotatorilor","rotator cuff","mansheta rrotulluese","cuffia dei rotatori","supraspinos","supraspinatus"],
      },
      it: {
        label: "Tendini della spalla (cuffia dei rotatori)",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Grupul de patru mușchi profunzi și tendoanele lor care centrează capul humeral în articulația umărului. (coafa rotatorilor, rotator cuff, mansheta rrotulluese, cuffia dei rotatori)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["coafa rotatorilor","rotator cuff","mansheta rrotulluese","cuffia dei rotatori","supraspinos","supraspinatus"],
      },
    },
  },
  biceps: {
    id: "biceps",
    macroPart: "arm",
    label: "Biceps brahial și braț anterior",
    latinName: "Musculus biceps brachii et brachialis",
    fmaId: "FMA37670",
    tissue: "Muscle",
    tissueLabel: "Mușchi scheletic",
    system: "muscular",
    systemLabel: "Sistemul muscular",
    bilateral: true,
    defaultView: "front",
    exerciseFamily: "upperArm",
    summary:
      "Mușchiul situat pe partea anterioară a brațului, între umăr și plica cotului. (biceps, braț, arm, bicep, bicipite, krahu, braccio)",
    functionDescription:
      "Îndoaie cotul (flexie), rotește palma în sus (supinație) și ajută la ridicarea brațului.",
    clinicalNotes:
      "Durerea în partea din față a umărului sau a cotului la căratul sacoșelor provine frecvent din tendonul lung al bicepsului.",
    commonConditions: [
      "Tendinită bicipitală",
      "Întindere musculară brahială",
    ],
    recommendedSpecialty: "Recuperare medicală sau Ortopedie",
    searchKeywords: ["biceps","braț","arm","bicep","bicipite","krahu","braccio"],
    localized: {
      ro: {
        label: "Bicepsul (fața brațului)",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Mușchiul situat pe partea anterioară a brațului, între umăr și plica cotului. (biceps, braț, arm, bicep)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["biceps","braț","arm","bicep","bicipite","krahu","braccio"],
      },
      en: {
        label: "Biceps (front of the upper arm)",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Mușchiul situat pe partea anterioară a brațului, între umăr și plica cotului. (biceps, braț, arm, bicep)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["biceps","braț","arm","bicep","bicipite","krahu","braccio"],
      },
      sq: {
        label: "Bicepsi (para krahut)",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Mușchiul situat pe partea anterioară a brațului, între umăr și plica cotului. (biceps, braț, arm, bicep)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["biceps","braț","arm","bicep","bicipite","krahu","braccio"],
      },
      it: {
        label: "Bicipite (davanti al braccio)",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Mușchiul situat pe partea anterioară a brațului, între umăr și plica cotului. (biceps, braț, arm, bicep)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["biceps","braț","arm","bicep","bicipite","krahu","braccio"],
      },
    },
  },
  triceps: {
    id: "triceps",
    macroPart: "arm",
    label: "Triceps brahial și braț posterior",
    latinName: "Musculus triceps brachii",
    fmaId: "FMA37688",
    tissue: "Muscle",
    tissueLabel: "Mușchi scheletic",
    system: "muscular",
    systemLabel: "Sistemul muscular",
    bilateral: true,
    defaultView: "back",
    exerciseFamily: "upperArm",
    summary:
      "Mușchiul cu trei capete situat pe partea posterioară a brațului, responsabil de îndreptarea cotului. (triceps, tricep, tricepsi, tricipite)",
    functionDescription:
      "Realizează extensia antebrațului și stabilizează cotul când te sprijini în mâini sau împingi un obiect.",
    clinicalNotes:
      "Disconfortul apare de obicei deasupra vârfului cotului (olecran) după eforturi repetitive de împingere.",
    commonConditions: [
      "Tendinopatie tricipitală",
      "Bursită olecraniană",
    ],
    recommendedSpecialty: "Ortopedie sau Recuperare medicală",
    searchKeywords: ["triceps","tricep","tricepsi","tricipite"],
    localized: {
      ro: {
        label: "Tricepsul (spatele brațului)",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Mușchiul cu trei capete situat pe partea posterioară a brațului, responsabil de îndreptarea cotului. (triceps, tricep, tricepsi, tricipite)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["triceps","tricep","tricepsi","tricipite"],
      },
      en: {
        label: "Triceps (back of the upper arm)",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Mușchiul cu trei capete situat pe partea posterioară a brațului, responsabil de îndreptarea cotului. (triceps, tricep, tricepsi, tricipite)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["triceps","tricep","tricepsi","tricipite"],
      },
      sq: {
        label: "Tricepsi (prapa krahut)",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Mușchiul cu trei capete situat pe partea posterioară a brațului, responsabil de îndreptarea cotului. (triceps, tricep, tricepsi, tricipite)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["triceps","tricep","tricepsi","tricipite"],
      },
      it: {
        label: "Tricipite (dietro al braccio)",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Mușchiul cu trei capete situat pe partea posterioară a brațului, responsabil de îndreptarea cotului. (triceps, tricep, tricepsi, tricipite)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["triceps","tricep","tricepsi","tricipite"],
      },
    },
  },
  elbow_tendon: {
    id: "elbow_tendon",
    macroPart: "arm",
    label: "Articulația și tendoanele cotului",
    latinName: "Articulatio cubiti / Epicondyli",
    fmaId: "FMA35291",
    tissue: "Tendon",
    tissueLabel: "Inserție tendinoasă",
    system: "muscular",
    systemLabel: "Sistemul muscular și tendinos",
    bilateral: true,
    defaultView: "front",
    exerciseFamily: "elbow",
    summary:
      "Tendoanele care ancorează mușchii antebrațului pe proeminențele osoase laterale și mediale ale cotului. (cot, elbow, tendon cot, elbow tendon, bërryli, gomito, epicondilită, epicondylitis)",
    functionDescription:
      "Transmit forța de prindere a mâinii și a degetelor către articulația cotului.",
    clinicalNotes:
      "Durerea pe partea exterioară a cotului când strângi pumnul sau ridici o cană este semnul clasic de epicondilită laterală.",
    commonConditions: [
      "Epicondilită laterală (cotul tenismenului)",
      "Epicondilită medială",
      "Artroză sau redoare de cot",
    ],
    recommendedSpecialty: "Ortopedie sau Recuperare medicală",
    searchKeywords: ["cot","elbow","tendon cot","elbow tendon","bërryli","gomito","epicondilită","epicondylitis"],
    localized: {
      ro: {
        label: "Tendoanele cotului",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Tendoanele care ancorează mușchii antebrațului pe proeminențele osoase laterale și mediale ale cotului. (cot, elbow, tendon cot, elbow tendon)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["cot","elbow","tendon cot","elbow tendon","bërryli","gomito","epicondilită","epicondylitis"],
      },
      en: {
        label: "Elbow tendons",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Tendoanele care ancorează mușchii antebrațului pe proeminențele osoase laterale și mediale ale cotului. (cot, elbow, tendon cot, elbow tendon)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["cot","elbow","tendon cot","elbow tendon","bërryli","gomito","epicondilită","epicondylitis"],
      },
      sq: {
        label: "Tendinat e bërrylit",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Tendoanele care ancorează mușchii antebrațului pe proeminențele osoase laterale și mediale ale cotului. (cot, elbow, tendon cot, elbow tendon)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["cot","elbow","tendon cot","elbow tendon","bërryli","gomito","epicondilită","epicondylitis"],
      },
      it: {
        label: "Tendini del gomito",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Tendoanele care ancorează mușchii antebrațului pe proeminențele osoase laterale și mediale ale cotului. (cot, elbow, tendon cot, elbow tendon)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["cot","elbow","tendon cot","elbow tendon","bërryli","gomito","epicondilită","epicondylitis"],
      },
    },
  },
  forearm_flexor: {
    id: "forearm_flexor",
    macroPart: "arm",
    label: "Flexorii antebrațului (partea interioară)",
    latinName: "Musculi flexores antebrachii",
    fmaId: "FMA38459",
    tissue: "Muscle",
    tissueLabel: "Mușchi scheletic",
    system: "muscular",
    systemLabel: "Sistemul muscular",
    bilateral: true,
    defaultView: "front",
    exerciseFamily: "forearm",
    summary:
      "Grupul muscular de pe fața anterioară (palmară) a antebrațului care controlează îndoirea încheieturii și strângerea pumnului. (flexori antebraț, forearm flexors, parakrah, avambraccio, inner forearm)",
    functionDescription:
      "Asigură forța de prindere (grip) și mișcările fine ale degetelor la scris, tastat sau muncă manuală.",
    clinicalNotes:
      "Suprasolicitarea repetitivă provoacă oboseală și tensiune de-a lungul feței interioare a antebrațului.",
    commonConditions: [
      "Suprasolicitare musculară a flexorilor",
      "Tenosinovită a flexorilor",
    ],
    recommendedSpecialty: "Recuperare medicală",
    searchKeywords: ["flexori antebraț","forearm flexors","parakrah","avambraccio","inner forearm"],
    localized: {
      ro: {
        label: "Mușchii antebrațului, partea palmei",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Grupul muscular de pe fața anterioară (palmară) a antebrațului care controlează îndoirea încheieturii și strângerea pumnului. (flexori antebraț, forearm flexors, parakrah, avambraccio)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["flexori antebraț","forearm flexors","parakrah","avambraccio","inner forearm"],
      },
      en: {
        label: "Forearm muscles, palm side",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Grupul muscular de pe fața anterioară (palmară) a antebrațului care controlează îndoirea încheieturii și strângerea pumnului. (flexori antebraț, forearm flexors, parakrah, avambraccio)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["flexori antebraț","forearm flexors","parakrah","avambraccio","inner forearm"],
      },
      sq: {
        label: "Muskujt e parakrahut, ana e pëllëmbës",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Grupul muscular de pe fața anterioară (palmară) a antebrațului care controlează îndoirea încheieturii și strângerea pumnului. (flexori antebraț, forearm flexors, parakrah, avambraccio)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["flexori antebraț","forearm flexors","parakrah","avambraccio","inner forearm"],
      },
      it: {
        label: "Muscoli dell'avambraccio, lato del palmo",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Grupul muscular de pe fața anterioară (palmară) a antebrațului care controlează îndoirea încheieturii și strângerea pumnului. (flexori antebraț, forearm flexors, parakrah, avambraccio)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["flexori antebraț","forearm flexors","parakrah","avambraccio","inner forearm"],
      },
    },
  },
  forearm_extensor: {
    id: "forearm_extensor",
    macroPart: "arm",
    label: "Extensorii antebrațului și brahioradial",
    latinName: "Musculi extensores antebrachii",
    fmaId: "FMA38477",
    tissue: "Muscle",
    tissueLabel: "Mușchi scheletic",
    system: "muscular",
    systemLabel: "Sistemul muscular",
    bilateral: true,
    defaultView: "back",
    exerciseFamily: "forearm",
    summary:
      "Mușchii de pe partea exterioară și posterioară a antebrațului care ridică încheietura mâinii și deschid degetele. (extensori antebraț, forearm extensors, outer forearm)",
    functionDescription:
      "Stabilizează încheietura mâinii în timpul folosirii mouse-ului, tastaturii sau uneltelor.",
    clinicalNotes:
      "Pauzele regulate și stretchingul blând al încheieturii reduc rapid tensiunea acumulată în extensori.",
    commonConditions: [
      "Sindrom de suprasolicitare la tastatură / muncă manuală",
      "Mialgie de brahioradial",
    ],
    recommendedSpecialty: "Recuperare medicală",
    searchKeywords: ["extensori antebraț","forearm extensors","outer forearm"],
    localized: {
      ro: {
        label: "Mușchii antebrațului, partea dosului palmei",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Mușchii de pe partea exterioară și posterioară a antebrațului care ridică încheietura mâinii și deschid degetele. (extensori antebraț, forearm extensors, outer forearm)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["extensori antebraț","forearm extensors","outer forearm"],
      },
      en: {
        label: "Forearm muscles, back of the hand side",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Mușchii de pe partea exterioară și posterioară a antebrațului care ridică încheietura mâinii și deschid degetele. (extensori antebraț, forearm extensors, outer forearm)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["extensori antebraț","forearm extensors","outer forearm"],
      },
      sq: {
        label: "Muskujt e parakrahut, ana e kurrizit të dorës",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Mușchii de pe partea exterioară și posterioară a antebrațului care ridică încheietura mâinii și deschid degetele. (extensori antebraț, forearm extensors, outer forearm)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["extensori antebraț","forearm extensors","outer forearm"],
      },
      it: {
        label: "Muscoli dell'avambraccio, lato del dorso della mano",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Mușchii de pe partea exterioară și posterioară a antebrațului care ridică încheietura mâinii și deschid degetele. (extensori antebraț, forearm extensors, outer forearm)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["extensori antebraț","forearm extensors","outer forearm"],
      },
    },
  },
  wrist_tendon: {
    id: "wrist_tendon",
    macroPart: "arm",
    label: "Încheietura mâinii, palmă și degete",
    latinName: "Carpus, Manus et Retinaculum flexorum",
    fmaId: "FMA9712",
    tissue: "Tendon",
    tissueLabel: "Articulație și tendoane",
    system: "muscular",
    systemLabel: "Sistemul muscular și articular",
    bilateral: true,
    defaultView: "front",
    exerciseFamily: "forearm",
    summary:
      "Complexul articular al încheieturii mâinii (carp), tunelul carpian, palma și articulațiile fine ale degetelor. (încheietură, wrist, tunel carpian, carpal tunnel, kyçi i dorës, polso)",
    functionDescription:
      "Permite dexteritatea fină, opoziția policelui și manipularea precisă a obiectelor.",
    clinicalNotes:
      "Amorțeala și furnicăturile în primele trei degete (mai ales noaptea) sugerează compresia nervului median în tunelul carpian.",
    commonConditions: [
      "Sindrom de tunel carpian",
      "Tendinită De Quervain",
      "Artroză sau artrită a articulațiilor mâinii",
    ],
    recommendedSpecialty: "Neurologie, Reumatologie sau Ortopedie",
    searchKeywords: ["încheietură","wrist","tunel carpian","carpal tunnel","kyçi i dorës","polso"],
    localized: {
      ro: {
        label: "Tendoanele încheieturii și tunelul carpian",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Complexul articular al încheieturii mâinii (carp), tunelul carpian, palma și articulațiile fine ale degetelor. (încheietură, wrist, tunel carpian, carpal tunnel)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["încheietură","wrist","tunel carpian","carpal tunnel","kyçi i dorës","polso"],
      },
      en: {
        label: "Wrist tendons and carpal tunnel",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Complexul articular al încheieturii mâinii (carp), tunelul carpian, palma și articulațiile fine ale degetelor. (încheietură, wrist, tunel carpian, carpal tunnel)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["încheietură","wrist","tunel carpian","carpal tunnel","kyçi i dorës","polso"],
      },
      sq: {
        label: "Tendinat e kyçit dhe kanali karpal",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Complexul articular al încheieturii mâinii (carp), tunelul carpian, palma și articulațiile fine ale degetelor. (încheietură, wrist, tunel carpian, carpal tunnel)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["încheietură","wrist","tunel carpian","carpal tunnel","kyçi i dorës","polso"],
      },
      it: {
        label: "Tendini del polso e tunnel carpale",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Complexul articular al încheieturii mâinii (carp), tunelul carpian, palma și articulațiile fine ale degetelor. (încheietură, wrist, tunel carpian, carpal tunnel)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["încheietură","wrist","tunel carpian","carpal tunnel","kyçi i dorës","polso"],
      },
    },
  },
  hip_flexor: {
    id: "hip_flexor",
    macroPart: "leg",
    label: "Șold, zona inghinală și adductori",
    latinName: "Musculus iliopsoas et adductores femoris",
    fmaId: "FMA22440",
    tissue: "Muscle",
    tissueLabel: "Mușchi și articulație",
    system: "muscular",
    systemLabel: "Sistemul muscular și articular",
    bilateral: true,
    defaultView: "front",
    exerciseFamily: "hip",
    summary:
      "Grupul muscular al șoldului anterior (iliopsoas) și al coapsei interioare (adductori) care stabilizează articulația coxo-femurală. (flexori șold, hip flexors, psoas, iliopsoas, kofshë, anca, groin)",
    functionDescription:
      "Ridică coapsa la mers și urcatul scărilor și apropie membrul inferior spre linia mediană.",
    clinicalNotes:
      "Statul prelungit pe scaun scurtează flexorii șoldului, provocând disconfort inghinal sau lombar la ridicarea în picioare.",
    commonConditions: [
      "Tendinopatie de iliopsoas sau adductori",
      "Coxartroză (artroza șoldului)",
      "Contractură a flexorilor șoldului",
    ],
    recommendedSpecialty: "Ortopedie sau Recuperare medicală",
    searchKeywords: ["flexori șold","hip flexors","psoas","iliopsoas","kofshë","anca","groin"],
    localized: {
      ro: {
        label: "Mușchii din fața șoldului (flexori)",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Grupul muscular al șoldului anterior (iliopsoas) și al coapsei interioare (adductori) care stabilizează articulația coxo-femurală. (flexori șold, hip flexors, psoas, iliopsoas)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["flexori șold","hip flexors","psoas","iliopsoas","kofshë","anca","groin"],
      },
      en: {
        label: "Front hip muscles (hip flexors)",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Grupul muscular al șoldului anterior (iliopsoas) și al coapsei interioare (adductori) care stabilizează articulația coxo-femurală. (flexori șold, hip flexors, psoas, iliopsoas)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["flexori șold","hip flexors","psoas","iliopsoas","kofshë","anca","groin"],
      },
      sq: {
        label: "Muskujt e përparmë të ijës (fleksorët)",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Grupul muscular al șoldului anterior (iliopsoas) și al coapsei interioare (adductori) care stabilizează articulația coxo-femurală. (flexori șold, hip flexors, psoas, iliopsoas)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["flexori șold","hip flexors","psoas","iliopsoas","kofshë","anca","groin"],
      },
      it: {
        label: "Muscoli anteriori dell'anca (flessori)",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Grupul muscular al șoldului anterior (iliopsoas) și al coapsei interioare (adductori) care stabilizează articulația coxo-femurală. (flexori șold, hip flexors, psoas, iliopsoas)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["flexori șold","hip flexors","psoas","iliopsoas","kofshë","anca","groin"],
      },
    },
  },
  quadriceps: {
    id: "quadriceps",
    macroPart: "leg",
    label: "Cvadriceps femural (coapsa anterioară)",
    latinName: "Musculus quadriceps femoris",
    fmaId: "FMA22428",
    tissue: "Muscle",
    tissueLabel: "Mușchi scheletic",
    system: "muscular",
    systemLabel: "Sistemul muscular",
    bilateral: true,
    defaultView: "front",
    exerciseFamily: "knee",
    summary:
      "Cei patru mușchi puternici de pe fața anterioară a coapsei (drept femural, vast lateral, medial și intermediar). (cvadriceps, quadriceps, quads, coapsă, thigh, kuadricepsi, quadricipite)",
    functionDescription:
      "Îndreaptă genunchiul, amortizează șocurile la mers și coborâtul scărilor și mențin rotula centrată.",
    clinicalNotes:
      "Tonifierea blândă a cvadricepsului este cea mai eficientă metodă de protecție și descărcare a articulației genunchiului.",
    commonConditions: [
      "Oboseală sau întindere de cvadriceps",
      "Sindrom femuro-patelar",
    ],
    recommendedSpecialty: "Recuperare medicală sau Ortopedie",
    searchKeywords: ["cvadriceps","quadriceps","quads","coapsă","thigh","kuadricepsi","quadricipite"],
    localized: {
      ro: {
        label: "Mușchiul din fața coapsei (cvadriceps)",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Cei patru mușchi puternici de pe fața anterioară a coapsei (drept femural, vast lateral, medial și intermediar). (cvadriceps, quadriceps, quads, coapsă)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["cvadriceps","quadriceps","quads","coapsă","thigh","kuadricepsi","quadricipite"],
      },
      en: {
        label: "Front thigh muscle (quadriceps)",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Cei patru mușchi puternici de pe fața anterioară a coapsei (drept femural, vast lateral, medial și intermediar). (cvadriceps, quadriceps, quads, coapsă)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["cvadriceps","quadriceps","quads","coapsă","thigh","kuadricepsi","quadricipite"],
      },
      sq: {
        label: "Muskuli i përparmë i kofshës (kuadriceps)",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Cei patru mușchi puternici de pe fața anterioară a coapsei (drept femural, vast lateral, medial și intermediar). (cvadriceps, quadriceps, quads, coapsă)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["cvadriceps","quadriceps","quads","coapsă","thigh","kuadricepsi","quadricipite"],
      },
      it: {
        label: "Muscolo anteriore della coscia (quadricipite)",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Cei patru mușchi puternici de pe fața anterioară a coapsei (drept femural, vast lateral, medial și intermediar). (cvadriceps, quadriceps, quads, coapsă)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["cvadriceps","quadriceps","quads","coapsă","thigh","kuadricepsi","quadricipite"],
      },
    },
  },
  hamstrings: {
    id: "hamstrings",
    macroPart: "leg",
    label: "Ischiogambieri (coapsa posterioară)",
    latinName: "Musculus biceps femoris, semitendinosus, semimembranosus",
    fmaId: "FMA22353",
    tissue: "Muscle",
    tissueLabel: "Mușchi scheletic",
    system: "muscular",
    systemLabel: "Sistemul muscular",
    bilateral: true,
    defaultView: "back",
    exerciseFamily: "knee",
    summary:
      "Grupul muscular de pe spatele coapsei care leagă bazinul de oasele gambei, în spatele genunchiului. (ischiogambieri, hamstrings, hamstring, biceps femural, ischiocrurali)",
    functionDescription:
      "Îndoaie genunchiul și extinde șoldul în faza de propulsie a mersului și alergării.",
    clinicalNotes:
      "Rigiditatea ischiogambierilor trage de bazin și poate amplifica durerile lombare la aplecarea în față.",
    commonConditions: [
      "Întindere sau contractură de ischiogambieri",
      "Iradiere pe traiectul nervului sciatic",
    ],
    recommendedSpecialty: "Recuperare medicală",
    searchKeywords: ["ischiogambieri","hamstrings","hamstring","biceps femural","ischiocrurali"],
    localized: {
      ro: {
        label: "Mușchii din spatele coapsei",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Grupul muscular de pe spatele coapsei care leagă bazinul de oasele gambei, în spatele genunchiului. (ischiogambieri, hamstrings, hamstring, biceps femural)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["ischiogambieri","hamstrings","hamstring","biceps femural","ischiocrurali"],
      },
      en: {
        label: "Back thigh muscles (hamstrings)",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Grupul muscular de pe spatele coapsei care leagă bazinul de oasele gambei, în spatele genunchiului. (ischiogambieri, hamstrings, hamstring, biceps femural)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["ischiogambieri","hamstrings","hamstring","biceps femural","ischiocrurali"],
      },
      sq: {
        label: "Muskujt e pasmë të kofshës",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Grupul muscular de pe spatele coapsei care leagă bazinul de oasele gambei, în spatele genunchiului. (ischiogambieri, hamstrings, hamstring, biceps femural)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["ischiogambieri","hamstrings","hamstring","biceps femural","ischiocrurali"],
      },
      it: {
        label: "Muscoli posteriori della coscia",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Grupul muscular de pe spatele coapsei care leagă bazinul de oasele gambei, în spatele genunchiului. (ischiogambieri, hamstrings, hamstring, biceps femural)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["ischiogambieri","hamstrings","hamstring","biceps femural","ischiocrurali"],
      },
    },
  },
  patellar_tendon: {
    id: "patellar_tendon",
    macroPart: "leg",
    label: "Articulația genunchiului și tendonul rotulian",
    latinName: "Articulatio genus / Ligamentum patellae",
    fmaId: "FMA35175",
    tissue: "Tendon",
    tissueLabel: "Articulație și tendon",
    system: "muscular",
    systemLabel: "Sistemul osteo-articular",
    bilateral: true,
    defaultView: "front",
    exerciseFamily: "knee",
    summary:
      "Articulația complexă a genunchiului, rotula, meniscurile și tendonul rotulian care transmite forța coapsei către tibie. (genunchi, rotulă, tendon rotulian, knee, patella, patellar tendon, gjuri, ginocchio, menisc, meniscus)",
    functionDescription:
      "Suportă de 3–4 ori greutatea corpului la urcatul și coborâtul scărilor, asigurând stabilitatea și flexia membrului inferior.",
    clinicalNotes:
      "Durerea în partea din față a genunchiului la scări sau genuflexiuni răspunde foarte bine la exerciții izometrice fără impact.",
    commonConditions: [
      "Tendinopatie rotuliană",
      "Gonartroză (uzura cartilajului genunchiului)",
      "Suprasolicitare meniscală sau ligamentară",
    ],
    recommendedSpecialty: "Ortopedie sau Reumatologie",
    searchKeywords: ["genunchi","rotulă","tendon rotulian","knee","patella","patellar tendon","gjuri","ginocchio","menisc","meniscus"],
    localized: {
      ro: {
        label: "Genunchiul și tendonul rotulian",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Articulația complexă a genunchiului, rotula, meniscurile și tendonul rotulian care transmite forța coapsei către tibie. (genunchi, rotulă, tendon rotulian, knee)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["genunchi","rotulă","tendon rotulian","knee","patella","patellar tendon","gjuri","ginocchio","menisc","meniscus"],
      },
      en: {
        label: "Knee and kneecap tendon",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Articulația complexă a genunchiului, rotula, meniscurile și tendonul rotulian care transmite forța coapsei către tibie. (genunchi, rotulă, tendon rotulian, knee)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["genunchi","rotulă","tendon rotulian","knee","patella","patellar tendon","gjuri","ginocchio","menisc","meniscus"],
      },
      sq: {
        label: "Gjuri dhe tendina e kupës së gjurit",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Articulația complexă a genunchiului, rotula, meniscurile și tendonul rotulian care transmite forța coapsei către tibie. (genunchi, rotulă, tendon rotulian, knee)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["genunchi","rotulă","tendon rotulian","knee","patella","patellar tendon","gjuri","ginocchio","menisc","meniscus"],
      },
      it: {
        label: "Ginocchio e tendine rotuleo",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Articulația complexă a genunchiului, rotula, meniscurile și tendonul rotulian care transmite forța coapsei către tibie. (genunchi, rotulă, tendon rotulian, knee)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["genunchi","rotulă","tendon rotulian","knee","patella","patellar tendon","gjuri","ginocchio","menisc","meniscus"],
      },
    },
  },
  calves: {
    id: "calves",
    macroPart: "leg",
    label: "Gambă, mușchii gemeni și solear",
    latinName: "Musculus gastrocnemius, soleus et tibialis anterior",
    fmaId: "FMA22532",
    tissue: "Muscle",
    tissueLabel: "Mușchi și circulație venoasă",
    system: "muscular",
    systemLabel: "Sistemul muscular și vascular periferic",
    bilateral: true,
    defaultView: "back",
    exerciseFamily: "lowerLeg",
    summary:
      "Musculatura gambei posterioare și anterioare, supranumită și «a doua inimă periferică» datorită rolului său în pomparea sângelui venos înapoi spre inimă. (gambe, pulpe, calves, calf, gastrocnemian, gastrocnemius, pulpat, polpacci)",
    functionDescription:
      "Ridică călcâiul la fiecare pas și comprimă venele profunde ale gambei pentru a preveni stagnarea sângelui și umflarea gleznelor.",
    clinicalNotes:
      "ATENȚIE: O singură gambă umflată brusc, roșie, caldă și dureroasă în repaus este un semn de alarmă pentru tromboza venoasă profundă și necesită evaluare medicală de urgență!",
    commonConditions: [
      "Crampe musculare nocturne (cârcei în gambă)",
      "Insuficiență venoasă cronică (picioare grele seara)",
      "Periostită tibială",
      "Tromboză venoasă profundă (urgență medicală)",
    ],
    recommendedSpecialty: "Chirurgie vasculară, Medicină internă sau Ortopedie",
    searchKeywords: ["gambe","pulpe","calves","calf","gastrocnemian","gastrocnemius","pulpat","polpacci"],
    localized: {
      ro: {
        label: "Mușchii gambei (pulpa)",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Musculatura gambei posterioare și anterioare, supranumită și «a doua inimă periferică» datorită rolului său în pomparea sângelui venos înapoi spre inimă. (gambe, pulpe, calves, calf)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["gambe","pulpe","calves","calf","gastrocnemian","gastrocnemius","pulpat","polpacci"],
      },
      en: {
        label: "Calf muscles",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Musculatura gambei posterioare și anterioare, supranumită și «a doua inimă periferică» datorită rolului său în pomparea sângelui venos înapoi spre inimă. (gambe, pulpe, calves, calf)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["gambe","pulpe","calves","calf","gastrocnemian","gastrocnemius","pulpat","polpacci"],
      },
      sq: {
        label: "Muskujt e pulpës",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Musculatura gambei posterioare și anterioare, supranumită și «a doua inimă periferică» datorită rolului său în pomparea sângelui venos înapoi spre inimă. (gambe, pulpe, calves, calf)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["gambe","pulpe","calves","calf","gastrocnemian","gastrocnemius","pulpat","polpacci"],
      },
      it: {
        label: "Muscoli del polpaccio",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Musculatura gambei posterioare și anterioare, supranumită și «a doua inimă periferică» datorită rolului său în pomparea sângelui venos înapoi spre inimă. (gambe, pulpe, calves, calf)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["gambe","pulpe","calves","calf","gastrocnemian","gastrocnemius","pulpat","polpacci"],
      },
    },
  },
  achilles: {
    id: "achilles",
    macroPart: "leg",
    label: "Tendonul lui Ahile, gleznă și talpă",
    latinName: "Tendo calcaneus, Talus et Planta pedis",
    fmaId: "FMA51061",
    tissue: "Tendon",
    tissueLabel: "Tendon și articulație",
    system: "muscular",
    systemLabel: "Sistemul osteo-articular",
    bilateral: true,
    defaultView: "back",
    exerciseFamily: "lowerLeg",
    summary:
      "Cel mai gros și rezistent tendon al corpului uman, împreună cu articulația gleznei, călcâiul și fascia plantară a tălpii. (tendon ahilian, achilles, achilles tendon, călcâi, heel, tendina e akilit, tendine d'achille, tallone)",
    functionDescription:
      "Înmagazinează și eliberează energie elastică la fiecare pas, susținând bolta plantară și echilibrul întregului corp.",
    clinicalNotes:
      "Durerea în călcâi la primii pași dimineața la coborârea din pat este specifică fasciitei plantare sau tendinopatiei ahiliene.",
    commonConditions: [
      "Tendinopatie ahiliană",
      "Fasciită plantară (dureri în călcâi)",
      "Entorsă sau edem de gleznă",
    ],
    recommendedSpecialty: "Ortopedie sau Recuperare medicală",
    searchKeywords: ["tendon ahilian","achilles","achilles tendon","călcâi","heel","tendina e akilit","tendine d'achille","tallone"],
    localized: {
      ro: {
        label: "Tendonul lui Ahile",
        tissueLabel: "Țesut anatomic",
        systemLabel: "Sistem anatomic",
        summary: "Cel mai gros și rezistent tendon al corpului uman, împreună cu articulația gleznei, călcâiul și fascia plantară a tălpii. (tendon ahilian, achilles, achilles tendon, călcâi)",
        functionDescription: "Funcție anatomică și fiziologică.",
        clinicalNotes: "Evaluare medicală orientativă.",
        commonConditions: ["Sensibilitate localizată", "Disconfort funcțional"],
        recommendedSpecialty: "Medicină de familie",
        searchKeywords: ["tendon ahilian","achilles","achilles tendon","călcâi","heel","tendina e akilit","tendine d'achille","tallone"],
      },
      en: {
        label: "Achilles tendon",
        tissueLabel: "Anatomical tissue",
        systemLabel: "Anatomical system",
        summary: "Cel mai gros și rezistent tendon al corpului uman, împreună cu articulația gleznei, călcâiul și fascia plantară a tălpii. (tendon ahilian, achilles, achilles tendon, călcâi)",
        functionDescription: "Anatomical and physiological function.",
        clinicalNotes: "General health assessment.",
        commonConditions: ["Localized tenderness", "Functional discomfort"],
        recommendedSpecialty: "Family medicine",
        searchKeywords: ["tendon ahilian","achilles","achilles tendon","călcâi","heel","tendina e akilit","tendine d'achille","tallone"],
      },
      sq: {
        label: "Tendina e Akilit",
        tissueLabel: "Ind anatomik",
        systemLabel: "Sistem anatomik",
        summary: "Cel mai gros și rezistent tendon al corpului uman, împreună cu articulația gleznei, călcâiul și fascia plantară a tălpii. (tendon ahilian, achilles, achilles tendon, călcâi)",
        functionDescription: "Funksioni anatomik dhe fiziologjik.",
        clinicalNotes: "Vlerësim i përgjithshëm mjekësor.",
        commonConditions: ["Ndjeshmëri e lokalizuar", "Shqetësim funksional"],
        recommendedSpecialty: "Mjekësi familjare",
        searchKeywords: ["tendon ahilian","achilles","achilles tendon","călcâi","heel","tendina e akilit","tendine d'achille","tallone"],
      },
      it: {
        label: "Tendine d'Achille",
        tissueLabel: "Tessuto anatomico",
        systemLabel: "Sistema anatomico",
        summary: "Cel mai gros și rezistent tendon al corpului uman, împreună cu articulația gleznei, călcâiul și fascia plantară a tălpii. (tendon ahilian, achilles, achilles tendon, călcâi)",
        functionDescription: "Funzione anatomica e fisiologica.",
        clinicalNotes: "Valutazione medica generale.",
        commonConditions: ["Sensibilità localizzata", "Disagio funzionale"],
        recommendedSpecialty: "Medicina di famiglia",
        searchKeywords: ["tendon ahilian","achilles","achilles tendon","călcâi","heel","tendina e akilit","tendine d'achille","tallone"],
      },
    },
  },
};

export const SUB_REGIONS_BY_MACRO: Record<BodyPartId, SubRegionId[]> = {
  head: ["brain", "head_face", "skull", "cranium_occipital", "neck", "cervical_spine"],
  chest: ["heart", "lungs", "pectoral"],
  stomach: ["stomach_organ", "liver", "colon", "abdominals", "obliques"],
  back: ["lumbar_spine", "lower_back", "trapezius", "upper_back", "thoracic_spine", "kidneys", "gluteal"],
  arm: ["deltoid", "rotator_cuff", "biceps", "triceps", "elbow_tendon", "forearm_flexor", "forearm_extensor", "wrist_tendon"],
  leg: ["patellar_tendon", "quadriceps", "hamstrings", "hip_flexor", "calves", "achilles"],
};

export const DEFAULT_SUB_REGION_FOR_MACRO: Record<BodyPartId, SubRegionId> = {
  head: "head_face",
  chest: "heart",
  stomach: "stomach_organ",
  back: "lumbar_spine",
  arm: "deltoid",
  leg: "patellar_tendon",
};

export const EXERCISES_BY_FAMILY: Record<ExerciseFamilyId, TherapeuticExercise[]> = {
  neck: [
    {
      name: "Rotații cervicale controlate fără durere",
      dose: "5 repetări lente pe fiecare parte",
      effort: "Ușor",
      targetStructure: "Coloana cervicală și mușchii gâtului",
      steps:
        "Stai cu spatele drept și umerii coborâți. Întoarce încet bărbia spre umărul drept până simți o întindere blândă, menține 2 secunde, apoi revino la centru și repetă spre stânga.",
      note: "Nu forța mișcarea la capătul cursei și oprește-te dacă apare amețeală.",
    },
    {
      name: "Retracția bărbiei (aliniere posturală cervicală)",
      dose: "8 repetări · menținere 3 secunde",
      effort: "Ușor",
      targetStructure: "Flexorii cervicali profunzi și baza craniului",
      steps:
        "Privind drept înainte, trage ușor bărbia spre spate (ca și cum ai face bărbie dublă), alungind ceafa fără să apleci capul în jos.",
      note: "Păstrează privirea la orizontală și maxilarul relaxat.",
    },
    {
      name: "Coborârea și relaxarea omoplaților",
      dose: "8 repetări lente",
      effort: "Delicat",
      targetStructure: "Mușchiul trapez superior și centura scapulară",
      steps:
        "Adu ambii umeri ușor spre spate și în jos (departe de urechi), menține 4 secunde, apoi relaxează complet brațele pe lângă corp.",
      note: "Respiră lent pe parcursul exercițiului pentru a elibera tensiunea din ceafă.",
    },
  ],
  shoulder: [
    {
      name: "Pendularea relaxată a brațului (exercițiul Codman)",
      dose: "2 serii × 10 cercuri mici",
      effort: "Foarte ușor",
      targetStructure: "Articulația umărului și coafa rotatorilor",
      steps:
        "Sprijină mâna sănătoasă pe o masă și apleacă ușor trunchiul. Lasă brațul dureros să atârne complet relaxat și descrie cercuri mici din balansul trunchiului.",
      note: "Nu încorda mușchiul umărului; lasă gravitația să decomprime articulația.",
    },
    {
      name: "Activarea scapulară în poziție așezat",
      dose: "8–10 repetări · menținere 5 secunde",
      effort: "Ușor",
      targetStructure: "Stabilizatorii omoplatului și coafa rotatorilor",
      steps:
        "Stai drept și apropie ușor omoplații unul de celălalt și în jos, folosind doar 50% din forța maximă, fără a ridica umerii.",
      note: "Păstrează gâtul relaxat și pieptul deschis.",
    },
    {
      name: "Alunecarea palmelor pe perete",
      dose: "1–2 serii × 8 repetări lente",
      effort: "Moderat-blând",
      targetStructure: "Deltoid și mobilitatea scapulo-humerală",
      steps:
        "Așază antebrațele pe perete și glisează încet palmele în sus doar până la înălțimea care rămâne confortabilă, apoi coboară controlat.",
      note: "Oprește mișcarea înainte de unghiul care provoacă durere ascuțită.",
    },
  ],
  elbow: [
    {
      name: "Flexie și extensie asistată a cotului",
      dose: "10–12 repetări lente",
      effort: "Delicat",
      targetStructure: "Articulația cotului și biceps/triceps",
      steps:
        "Cu brațul sprijinit pe o pernă sau pe masă, îndoaie încet cotul și apoi îndreaptă-l până simți o întindere confortabilă.",
      note: "Mișcă brațul lin, fără smucituri la capătul cursei.",
    },
    {
      name: "Pronație și supinație cu cotul la 90°",
      dose: "10–15 repetări lente",
      effort: "Ușor",
      targetStructure: "Tendoanele cotului și antebrațul",
      steps:
        "Ține cotul lipit de trunchi la un unghi de 90 de grade. Întoarce încet palma în sus (spre tavan), apoi în jos (spre podea).",
      note: "Menține umărul relaxat pe tot parcursul rotației.",
    },
    {
      name: "Contracație izometrică nedureroasă a încheieturii",
      dose: "5 repetări × 10 secunde",
      effort: "Ușor",
      targetStructure: "Tendoanele epicondiliene (reabilitare tendinoasă)",
      steps:
        "Sprijină antebrațul pe masă cu palma în jos. Cu cealaltă mână opune o rezistență ușoară în timp ce încerci să ridici palma fără să produci mișcare.",
      note: "Contracațiile izometrice reduc durerea tendinoasă dacă sunt făcute la intensitate mică (20–30%).",
    },
  ],
  forearm: [
    {
      name: "Mobilitate activă a încheieturii mâinii",
      dose: "2 serii × 10 repetări în fiecare direcție",
      effort: "Delicat",
      targetStructure: "Tunelul carpian și tendoanele încheieturii",
      steps:
        "Sprijină antebrațul pe marginea mesei și mișcă încet palma în sus și în jos, păstrând degetele relaxate.",
      note: "Evită îndoirea extremă dacă simți furnicături în degete.",
    },
    {
      name: "Stretching blând pentru flexori și extensori",
      dose: "3 repetări × 15 secunde",
      effort: "Ușor",
      targetStructure: "Mușchii antebrațului",
      steps:
        "Întinde brațul în față fără a bloca cotul. Cu cealaltă mână ghidează ușor palma în jos, apoi în sus, până simți o întindere plăcută în antebraț.",
      note: "Nu trage brusc de degete.",
    },
    {
      name: "Închiderea și deschiderea palmei pe prosop rulat",
      dose: "10 repetări lente",
      effort: "Ușor",
      targetStructure: "Musculatura palmei și tendoanele degetelor",
      steps:
        "Strânge ușor un prosop moale rulat timp de 3 secunde la 25% din forță, apoi deschide larg degetele și relaxează complet.",
      note: "Ajută la pomparea lichidului sinovial și reducerea rigidității articulare.",
    },
  ],
  upperArm: [
    {
      name: "Mobilizare asistată a brațului",
      dose: "10 repetări lente",
      effort: "Delicat",
      targetStructure: "Biceps și triceps brahial",
      steps:
        "Sprijină brațul afectat cu mâna opusă și îndoaie/îndreaptă cotul lent, fără a purta greutăți.",
      note: "Lasă umărul coborât și relaxat.",
    },
    {
      name: "Izometrie ușoară pentru biceps",
      dose: "5 repetări × 8 secunde",
      effort: "Ușor",
      targetStructure: "Tendonul și mușchiul biceps",
      steps:
        "Cu cotul îndoit la 90°, apasă ușor palma în sus împotriva celeilalte mâini, fără a mișca brațul.",
      note: "Oprește exercițiul dacă reproduce o durere ascuțită în umăr sau cot.",
    },
  ],
  chest: [
    {
      name: "Respirație diafragmatică calmă în poziție semi-așezată",
      dose: "5–8 cicluri respiratorii lente",
      effort: "Foarte ușor",
      targetStructure: "Diafragm, cutie toracică și sistem nervos autonom",
      steps:
        "Așază-te confortabil cu spatele sprijinit. Inspiră lent pe nas timp de 4 secunde lăsând baza coastelor să se extindă, apoi expiră relaxat timp de 6 secunde.",
      note: "Oprește orice exercițiu și apelează 112 dacă ai durere de apăsare în piept sau lipsă de aer!",
    },
    {
      name: "Deschiderea toracelui în cadrul ușii (pentru dureri musculare)",
      dose: "3 repetări × 15 secunde",
      effort: "Ușor",
      targetStructure: "Mușchii pectorali și coastele anterioare",
      steps:
        "Dacă durerea este strict musculară/posturală, sprijină antebrațul pe tocul ușii la nivelul pieptului și rotește ușor trunchiul până simți o detensionare a pectoralului.",
      note: "Recomandat doar pentru tensiunea musculară posturală, niciodată în durerea cardiacă.",
    },
  ],
  back: [
    {
      name: "Rotații toracale blânde din poziția așezat",
      dose: "5 repetări pe fiecare parte",
      effort: "Delicat",
      targetStructure: "Coloana toracală și mușchii paravertebrali",
      steps:
        "Stai drept pe scaun cu palmele pe umeri. Rotește încet trunchiul spre dreapta și apoi spre stânga în limita confortului, păstrând bazinul fix.",
      note: "Inspiră la centru și expiră ușor pe rotație.",
    },
    {
      name: "Bascularea bazinului pe spate cu genunchii îndoiți",
      dose: "1–2 serii × 8 repetări lente",
      effort: "Ușor",
      targetStructure: "Coloana lombară și musculatura șalelor",
      steps:
        "Stai întins pe spate cu genunchii îndoiți și tălpile pe saltea. Lipește ușor zona lombară de saltea timp de 3 secunde, apoi relaxează revenind la curbura naturală.",
      note: "Folosește o amplitudine mică și confortabilă, fără durere.",
    },
    {
      name: "Plimbare lejeră de descărcare a coloanei",
      dose: "3–5 minute la pas relaxat",
      effort: "Ușor",
      targetStructure: "Discurile intervertebrale și musculatura posturală",
      steps:
        "Mergi pe teren plat într-un ritm calm, lăsând brațele să se balanseze natural pe lângă corp.",
      note: "Plimbările scurte și dese sunt mai benefice pentru spate decât repausul prelungit la pat.",
    },
  ],
  core: [
    {
      name: "Respirație abdominală de relaxare viscerală",
      dose: "6–8 respirații profunde",
      effort: "Foarte ușor",
      targetStructure: "Diafragm, perete abdominal și plexul solar",
      steps:
        "Stai culcat pe spate cu o pernă sub genunchi sau semi-așezat. Inspiră lent lăsând abdomenul să se ridice ușor, apoi expiră prelungit relaxând complet burta.",
      note: "Reduce tensiunea peretelui abdominal și spasmele digestive induse de stres.",
    },
    {
      name: "Postură de repaus antireflux / digestiv",
      dose: "15–20 minute după masă",
      effort: "Foarte ușor",
      targetStructure: "Stomac și esofag inferior",
      steps:
        "Rămâi în poziție verticală sau în plimbare foarte ușoară după masă; dacă te odihnești, ridică trunchiul pe două perne sau stai pe partea stângă.",
      note: "Evită aplecarea din talie și întinderea complet la orizontală imediat după mâncare.",
    },
  ],
  hip: [
    {
      name: "Activarea izometrică a fesierilor",
      dose: "10 repetări · menținere 5 secunde",
      effort: "Ușor",
      targetStructure: "Mușchii fesieri și bazin",
      steps:
        "Stând întins sau așezat confortabil, încordează ușor mușchii fesieri timp de 5 secunde, apoi relaxează complet.",
      note: "Stabilizează articulația sacro-iliacă și șoldul fără a uza cartilajul.",
    },
    {
      name: "Ridicarea alternantă a genunchiului cu sprijin",
      dose: "8 repetări pe fiecare parte",
      effort: "Delicat",
      targetStructure: "Flexorii șoldului și stabilizatorii bazinului",
      steps:
        "Ținându-te cu mâna de un spătar stabil, ridică încet un genunchi câțiva centimetri, coboară controlat și alternează.",
      note: "Păstrează trunchiul drept, fără a te înclina în lateral.",
    },
  ],
  knee: [
    {
      name: "Alunecarea călcâiului (flexie-extensie fără greutate)",
      dose: "10 repetări lente",
      effort: "Delicat",
      targetStructure: "Articulația genunchiului și cartilajul rotulian",
      steps:
        "Stând întins sau rezemat cu picioarele întinse, trage încet călcâiul spre tine îndoind genunchiul atât cât este confortabil, apoi întinde-l la loc.",
      note: "Hrănește cartilajul articular fără presiunea greutății corporale.",
    },
    {
      name: "Contracația izometrică a cvadricepsului (quad set)",
      dose: "10 repetări · menținere 5 secunde",
      effort: "Ușor",
      targetStructure: "Cvadriceps femural și tendonul rotulian",
      steps:
        "Cu piciorul întins pe pat și un prosop mic rulat sub genunchi, încordează coapsa apăsând ușor spatele genunchiului în prosop timp de 5 secunde.",
      note: "Respiră normal în timpul menținerii; este exercițiul de bază în gonartroză și dureri de genunchi.",
    },
    {
      name: "Extensia parțială a genunchiului din așezat",
      dose: "8 repetări lente",
      effort: "Delicat",
      targetStructure: "Stabilizatorii rotulei și cvadricepsul",
      steps:
        "Stând pe scaun, îndreaptă încet genunchiul pe jumătate sau trei sferturi din cursă, menține 2 secunde și coboară lent talpa pe podea.",
      note: "Nu folosi greutăți atașate de gleznă.",
    },
  ],
  lowerLeg: [
    {
      name: "Pompa venoasă a gleznei (flexie dorsală și plantară)",
      dose: "15–20 repetări lente",
      effort: "Foarte ușor",
      targetStructure: "Gambă, gleznă și întoarcerea venoasă",
      steps:
        "Stând așezat sau cu picioarele sprijinite pe o pernă, trage vârfurile degetelor spre tine, apoi întinde-le înainte într-un ritm lin.",
      note: "NOTĂ DE SIGURANȚĂ: Nu face exerciții și nu masa gamba dacă este umflată brusc, roșie și fierbinte (suspiciune de tromboză)!",
    },
    {
      name: "Stretching blând al gambei cu sprijin la perete",
      dose: "3 repetări × 20 secunde",
      effort: "Ușor",
      targetStructure: "Mușchii gemeni, solear și tendonul lui Ahile",
      steps:
        "Cu palmele sprijinite pe perete, du piciorul afectat cu un pas în spate, păstrează călcâiul pe podea și înclină ușor trunchiul în față.",
      note: "Întinderea trebuie să fie blândă, fără durere în tendonul lui Ahile.",
    },
    {
      name: "Ridicări bilaterale lente pe vârfuri cu sprijin",
      dose: "1 serie × 8 repetări lente",
      effort: "Moderat-ușor",
      targetStructure: "Tendonul lui Ahile și bolta plantară",
      steps:
        "Sprijinindu-te de o masă sau spătar, ridică-te încet pe ambele vârfuri și coboară călcâiele în 3 secunde.",
      note: "Omite acest exercițiu dacă sprijinul pe picior este dureros.",
    },
  ],
};

export const DETAILED_SYMPTOMS_BY_PART: Record<
  BodyPartId,
  { areaTitle: string; areaDescription: string; symptoms: DetailedSymptomOption[] }
> = {
  head: {
    areaTitle: "Cap și gât",
    areaDescription:
      "Evaluare pentru dureri de cap, migrene, tensiune cervicală, amețeli, presiune sinusală și dureri în gât.",
    symptoms: [
      {
        id: "head_headache",
        label: "Durere de cap moderată (presiune la tâmple, frunte sau ceafă)",
        subRegions: ["head_face", "brain", "cranium_occipital", "trapezius"],
        isRedFlag: false,
        selfCareTip:
          "Odihnește-te într-o cameră întunecoasă, bea două pahare de apă și evită ecranele.",
        clinicalMechanism:
          "Cel mai frecvent este provocată de contracția susținută a mușchilor pericranieni și cervicali pe fond de oboseală, deshidratare, stres sau expunere prelungită la ecrane.",
        whenToSeeDoctor:
          "Programează un consult dacă durerile apar de peste 2 ori pe săptămână, nu cedează la hidratare și odihnă sau sunt însoțite de valori crescute ale tensiunii arteriale.",
        differentials: [
          {
            id: "tension_headache",
            name: "Cefalee de tensiune (stres și oboseală oculară/cervicală)",
            category: "Neurologie funcțională",
            urgency: "self_care",
            urgencyLabel: "Auto-îngrijire și monitorizare",
            description:
              "Durere bilaterală ca o bandă strânsă în jurul frunții, tâmplelor sau cefei, fără greață severă.",
            typicalSigns: [
              "Presiune continuă bilaterală (nu pulsatilă)",
              "Tensiune la nivelul cefei și umerilor",
              "Apare după stres, nesomn sau lucru la ecran",
            ],
            doctorWorkup:
              "Anamneză clinică, măsurarea tensiunii arteriale și evaluarea posturii cervicale.",
          },
          {
            id: "migraine",
            name: "Episod migrenos comun",
            category: "Neurologie",
            urgency: "gp_visit",
            urgencyLabel: "Consult medic de familie / neurolog",
            description:
              "Durere moderat-severă, adesea pe o singură parte a capului, cu caracter pulsatil și sensibilitate la lumină sau zgomot.",
            typicalSigns: [
              "Caracter pulsatil (zvâcnire la tâmplă)",
              "Deranj la lumină puternică sau sunete",
              "Ușoară greață sau agravare la efort fizic",
            ],
            doctorWorkup:
              "Jurnalul cefaleei, examen neurologic complet și stabilirea tratamentului țintit.",
          },
          {
            id: "hypertensive_headache",
            name: "Cefalee asociată creșterii tensiunii arteriale",
            category: "Cardiologie / Medicină internă",
            urgency: "gp_visit",
            urgencyLabel: "Verificare tensiune arterială",
            description:
              "Durere resimțită mai ales în zona occipitală (la ceafă), uneori cu țiuit în urechi sau amețeală.",
            typicalSigns: [
              "Durere surdă la baza craniului (ceafă)",
              "Țiuit în urechi (acufene) sau vedere încețoșată",
              "Tensiune arterială peste 140/90 mmHg",
            ],
            doctorWorkup:
              "Măsurarea tensiunii arteriale la ambele brațe, EKG și ajustarea tratamentului antihipertensiv.",
          },
        ],
      },
      {
        id: "head_neck_fever",
        label: "Ceafă înțepenită cu stare de febră, frisoane sau durere în gât",
        subRegions: ["neck", "cervical_spine", "cranium_occipital"],
        isRedFlag: false,
        selfCareTip:
          "Monitorizează temperatura cu termometrul și hidratează-te corespunzător.",
        clinicalMechanism:
          "Poate reflecta o infecție respiratorie superioară (viroză, gripă, faringo-amigdalită) cu mialgii cervicale reactive; dacă bărbia nu poate atinge pieptul din cauza unei rigidități extreme cu febră mare, necesită excluderea iritației meningeale.",
        whenToSeeDoctor:
          "Mergi la medic în aceeași zi dacă febra depășește 38.5 °C, durează peste 48 de ore sau dacă înghițirea devine foarte dificilă.",
        differentials: [
          {
            id: "viral_uri",
            name: "Infecție virală respiratorie / stare gripală cu mialgii",
            category: "Boli infecțioase / Medicină de familie",
            urgency: "gp_visit",
            urgencyLabel: "Evaluare medic de familie",
            description:
              "Virozele respiratorii și gripa produc frecvent febră, frisoane și dureri musculare difuze în ceafă și spate.",
            typicalSigns: [
              "Febră moderată, frisoane și durere în gât",
              "Dureri musculare generalizate și oboseală",
              "Congestie nazală sau tuse seacă",
            ],
            doctorWorkup:
              "Examen clinic al gâtului (orofaringoscopie), test rapid gripă/streptococ; antibioticele nu sunt eficiente în viroze.",
          },
          {
            id: "cervical_torticolis",
            name: "Contractură musculară cervicală acută",
            category: "Recuperare medicală",
            urgency: "self_care",
            urgencyLabel: "Căldură locală și repaus",
            description:
              "Spasm al mușchiului trapez sau sternocleidomastoidian după expunere la curent sau poziție incomodă în somn.",
            typicalSigns: [
              "Durere la rotirea capului într-o parte",
              "Mușchiul lateral al gâtului este tare la palpare",
            ],
            doctorWorkup:
              "Palpare musculară și testarea mobilității active a coloanei cervicale.",
          },
        ],
      },
      {
        id: "head_sinus_pressure",
        label: "Presiune facială la frunte și pomeți, nas înfundat sau durere la aplecare",
        subRegions: ["skull", "head_face"],
        isRedFlag: false,
        selfCareTip:
          "Fă spălături nazale cu ser fiziologic călduț, hidratează-te bine și evită aerul foarte uscat sau fumul de țigară.",
        clinicalMechanism:
          "Inflamația mucoasei sinusurilor frontale și maxilare blochează drenajul natural, creând presiune dureroasă în oasele feței.",
        whenToSeeDoctor:
          "Consultă medicul dacă simptomele durează peste 7–10 zile, se agravează după o perioadă de ameliorare sau apare umflarea pleoapelor.",
        differentials: [
          {
            id: "acute_sinusitis",
            name: "Rinosinuzită acută frontală sau maxilară",
            category: "ORL / Medicină de familie",
            urgency: "gp_visit",
            urgencyLabel: "Consult medic de familie / ORL",
            description:
              "Inflamație a cavităților sinusale, cel mai adesea după o răceală comună.",
            typicalSigns: [
              "Presiune care crește când apleci capul în față",
              "Secreții nazale groase și nas înfundat",
              "Sensibilitate la apăsarea pomeților sau a sprâncenelor",
            ],
            doctorWorkup:
              "Examen ORL (rinoscopie) și recomandare de decongestionante locale pe termen scurt.",
          },
        ],
      },
      {
        id: "head_vertigo_dizziness",
        label: "Amețeală la schimbarea poziției, senzație de învârtire (vertij) sau țiuit în urechi",
        subRegions: ["brain", "cranium_occipital", "cervical_spine"],
        isRedFlag: false,
        selfCareTip:
          "Așază-te imediat pe scaun sau pat cu privirea fixată pe un obiect nemișcat și ridică-te întotdeauna în doi timpi.",
        clinicalMechanism:
          "Poate proveni din urechea internă (sistemul vestibular), din variații de tensiune arterială și glicemie sau din spondiloza cervicală.",
        whenToSeeDoctor:
          "Solicită consult medical dacă vertijul împiedică mersul în linie dreaptă sau se repetă în mai multe zile.",
        differentials: [
          {
            id: "bppv_vertigo",
            name: "Vertij pozițional paroxistic benign (urechea internă)",
            category: "ORL / Neurologie",
            urgency: "gp_visit",
            urgencyLabel: "Consult ORL / Neurologie",
            description:
              "Senzație scurtă de rotire a camerei declanșată de întoarcerea capului în pat sau privitul în sus.",
            typicalSigns: [
              "Episoade scurte (sub 1 minut) la schimbarea poziției capului",
              "Fără pierderea cunoștinței sau slăbiciune în membre",
            ],
            doctorWorkup:
              "Manevra diagnostică și terapeutică Dix-Hallpike / Epley în cabinet.",
          },
          {
            id: "orthostatic_hypotension",
            name: "Hipotensiune ortostatică sau deshidratare",
            category: "Medicină internă",
            urgency: "self_care",
            urgencyLabel: "Hidratare și verificare tensiune",
            description:
              "Amețeală scurtă și negru în fața ochilor la ridicarea bruscă din pat sau de pe scaun.",
            typicalSigns: [
              "Apare în primele secunde după ridicarea în picioare",
              "Se ameliorează rapid dacă te așezi",
            ],
            doctorWorkup:
              "Măsurarea tensiunii arteriale culcat și în picioare, hemoleucogramă și glicemie.",
          },
        ],
      },
      {
        id: "head_stroke_vision",
        label: "Pierdere bruscă de vedere, vorbire îngreunată sau amorțeală a feței",
        subRegions: ["brain", "head_face"],
        isRedFlag: true,
        selfCareTip:
          "Semn critic de accident vascular cerebral! Necesită 112 imediat.",
        clinicalMechanism:
          "Întreruperea bruscă a fluxului de sânge către o zonă a creierului (ischemie sau hemoragie cerebrală) — fiecare minut contează pentru salvarea țesutului neuronal (protocolul FAST).",
        whenToSeeDoctor:
          "URGENȚĂ 112 IMEDIATĂ! Nu aștepta acasă și nu administra medicamente pe gură.",
        differentials: [
          {
            id: "acute_stroke",
            name: "Suspiciune de accident vascular cerebral (AVC) sau atac ischemic tranzitor",
            category: "Urgență neurologică majoră",
            urgency: "emergency",
            urgencyLabel: "Apel imediat 112",
            description:
              "Deficit neurologic instalat brusc (asimetrie a feței, slăbiciune a unui braț, tulburare de vorbire sau vedere).",
            typicalSigns: [
              "Colțul gurii căzut pe o parte",
              "Dificultate în rostirea sau înțelegerea cuvintelor",
              "Pierderea bruscă a vederii sau a echilibrului",
            ],
            doctorWorkup:
              "Transport de urgență cu ambulanța la UPU pentru tomografie computerizată (CT) craniană și tratament în fereastra terapeutică.",
          },
        ],
      },
    ],
  },
  chest: {
    areaTitle: "Piept și respirație",
    areaDescription:
      "Evaluare pentru dureri toracice, înțepături intercostale, palpitații, tuse și dificultăți de respirație.",
    symptoms: [
      {
        id: "chest_stitch",
        label: "Înțepături ascuțite la respirație adâncă, mișcarea trunchiului sau efort",
        subRegions: ["pectoral", "lungs"],
        isRedFlag: false,
        selfCareTip:
          "Oprește efortul fizic, așază-te confortabil și respiră lent și calm.",
        clinicalMechanism:
          "O durere bine localizată (pe care o poți indica cu un singur deget) care se modifică la apăsarea coastelor sau la rotirea trunchiului provine de regulă din mușchii intercostali, pectorali sau articulațiile condro-costale.",
        whenToSeeDoctor:
          "Mergi la medic dacă înțepătura este însoțită de febră, tuse persistentă sau lipsă de aer în repaus.",
        differentials: [
          {
            id: "costochondritis",
            name: "Costocondrită sau nevralgie intercostală parietală",
            category: "Musculo-scheletal / Medicină de familie",
            urgency: "self_care",
            urgencyLabel: "Repaus și monitorizare",
            description:
              "Inflamație benignă a cartilajelor care leagă coastele de stern sau contractură a mușchilor intercostali.",
            typicalSigns: [
              "Durere reproductibilă la apăsarea pe piept",
              "Se modifică la schimbarea poziției sau întinderea brațului",
              "Fără lipsă de aer sau transpirații reci",
            ],
            doctorWorkup:
              "Examen clinic toracic și EKG de repaus pentru excluderea unei cauze cardiace.",
          },
          {
            id: "pleuritic_irritation",
            name: "Traheobronșită sau iritație pleurală respiratorie",
            category: "Pneumologie",
            urgency: "gp_visit",
            urgencyLabel: "Consult medic de familie",
            description:
              "Disconfort toracic declanșat de tuse repetată sau de o infecție respiratorie recentă.",
            typicalSigns: [
              "Se asociază cu tuse seacă sau productivă",
              "Sensibilitate a mușchilor pieptului după accesele de tuse",
            ],
            doctorWorkup:
              "Auscultație pulmonară cu stetoscopul, pulsoximetrie și eventual radiografie pulmonară.",
          },
        ],
      },
      {
        id: "chest_palpitations",
        label: "Palpitații sau bătăi rapide și neregulate de inimă în repaus",
        subRegions: ["heart"],
        isRedFlag: false,
        selfCareTip:
          "Evită cafeaua, energizantele și fumatul. Așază-te, respiră rar și măsoară pulsul și tensiunea dacă ai aparat.",
        clinicalMechanism:
          "Percepția bătăilor inimii (tahicardie sau extrasistole) poate fi declanșată de stres, oboseală, cofeină, deshidratare, anemie, afecțiuni tiroidiene sau tulburări de ritm cardiac.",
        whenToSeeDoctor:
          "Solicită consult cardiologic pentru efectuarea unei electrocardiograme (EKG), sau sună la 112 dacă palpitațiile sunt însoțite de amețeală puternică ori durere în piept.",
        differentials: [
          {
            id: "sinus_tachycardia_extrasystoles",
            name: "Tahicardie sinusală sau extrasistole benigne (stres, cofeină, oboseală)",
            category: "Cardiologie / Medicină de familie",
            urgency: "gp_visit",
            urgencyLabel: "Consult și EKG",
            description:
              "Creșterea frecvenței cardiace sau senzația de «bătaie sărită» pe fond de anxietate, lipsă de somn sau deficit de magneziu/fier.",
            typicalSigns: [
              "Apare după cafea, emoții sau oboseală",
              "Se liniștește treptat în repaus și respirație lentă",
            ],
            doctorWorkup:
              "Electrocardiogramă (EKG), analize de sânge (ionogramă, hemoleucogramă, TSH tiroidian).",
          },
          {
            id: "arrhythmia_eval",
            name: "Tulburare de ritm supraventriculară (necesită documentare EKG)",
            category: "Cardiologie",
            urgency: "specialist",
            urgencyLabel: "Evaluare cardiologică",
            description:
              "Bătăi rapide sau complet neregulate care pornesc brusc și necesită monitorizare.",
            typicalSigns: [
              "Puls peste 100–110 bătăi/minut în repaus complet",
              "Senzație de fâlfâire în piept sau oboseală la efort mic",
            ],
            doctorWorkup:
              "EKG cu 12 derivații, monitorizare Holter EKG 24h și ecocardiografie.",
          },
        ],
      },
      {
        id: "chest_cough_wheeze",
        label: "Tuse persistentă, respirație șuierătoare sau oboseală la urcatul scărilor",
        subRegions: ["lungs"],
        isRedFlag: false,
        selfCareTip:
          "Aerisește camera, bea lichide calde pentru fluidizarea secrețiilor și evită complet fumul și praful.",
        clinicalMechanism:
          "Inflamația bronhiilor îngustează căile aeriene și stimulează receptorii de tuse din arborele respirator.",
        whenToSeeDoctor:
          "Programează un consult medical dacă tusea durează peste 2–3 săptămâni, este însoțită de febră sau de respirație grea.",
        differentials: [
          {
            id: "acute_bronchitis",
            name: "Bronșită acută sau hiperreactivitate bronșică",
            category: "Pneumologie / Medicină de familie",
            urgency: "gp_visit",
            urgencyLabel: "Consult medic de familie",
            description:
              "Inflamație a căilor bronșice cu tuse inițial seacă, apoi productivă.",
            typicalSigns: [
              "Tuse accentuată noaptea sau la aer rece",
              "Senzație de încărcare bronșică",
            ],
            doctorWorkup:
              "Auscultație pulmonară, spirometrie sau radiografie toracică dacă persistă.",
          },
        ],
      },
      {
        id: "chest_crushing_pain",
        label: "Dureri puternice de strângere în piept, iradiate în braț sau respirație imposibilă",
        subRegions: ["heart", "lungs"],
        isRedFlag: true,
        selfCareTip:
          "Semn critic de infarct miocardic! Necesită intervenție 112 fără întârziere.",
        clinicalMechanism:
          "Blocarea acută a unei artere coronare (infarct miocardic) sau o urgență cardio-pulmonară majoră care privează mușchiul inimii de oxigen.",
        whenToSeeDoctor:
          "URGENȚĂ 112 IMEDIATĂ! Rămâi așezat în repaus complet, descheie hainele strâmte la gât și așteaptă echipajul medical.",
        differentials: [
          {
            id: "acute_coronary_syndrome",
            name: "Suspiciune de sindrom coronarian acut / infarct miocardic",
            category: "Urgență cardiologică 112",
            urgency: "emergency",
            urgencyLabel: "Apel imediat 112",
            description:
              "Durere retrosternală intensă (apăsare, gheară, arsură) cu iradiere în umărul/brațul stâng, gât, spate sau maxilar.",
            typicalSigns: [
              "Senzație de greutate sau strângere în mijlocul pieptului",
              "Transpirații reci, greață, anxietate sau lipsă de aer",
              "Nu se modifică la apăsarea pe coaste",
            ],
            doctorWorkup:
              "Preluare de urgență 112, EKG în primele 10 minute, enzime cardiace (troponină) și coronarografie.",
          },
        ],
      },
    ],
  },
  stomach: {
    areaTitle: "Stomac și burtă",
    areaDescription:
      "Evaluare pentru arsuri gastrice, reflux, dureri epigastrice, disconfort biliar în dreapta, balonare și crampe intestinale.",
    symptoms: [
      {
        id: "stomach_heartburn",
        label: "Arsuri în capul pieptului sau reflux acid după mâncare",
        subRegions: ["stomach_organ"],
        isRedFlag: false,
        selfCareTip:
          "Evită mâncărurile grase și prăjelile. Nu te întinde la orizontală imediat după masă.",
        clinicalMechanism:
          "Relaxarea tranzitorie a sfincterului esofagian inferior permite acidului gastric să urce spre esofag, iritând mucoasa sensibilă.",
        whenToSeeDoctor:
          "Consultă medicul dacă arsurile apar de mai multe ori pe săptămână, îți tulbură somnul sau sunt însoțite de dificultăți la înghițire.",
        differentials: [
          {
            id: "gerd_gastritis",
            name: "Reflux gastro-esofagian sau gastrită hiperacidă",
            category: "Gastroenterologie",
            urgency: "self_care",
            urgencyLabel: "Regim igieno-dietetic și consult",
            description:
              "Senzație de arsură retrosternală sau durere în epigastru (capul pieptului) legată de alimentație.",
            typicalSigns: [
              "Arsură după prăjeli, dulciuri concentrate, cafea sau băuturi carbogazoase",
              "Se accentuează când te întinzi în pat sau te apleci",
            ],
            doctorWorkup:
              "Evaluare clinică, testare pentru Helicobacter pylori și tratament antisecretor la recomandarea medicului.",
          },
        ],
      },
      {
        id: "stomach_cramps",
        label: "Crampe abdominale ușoare, balonare și tranzit neregulat",
        subRegions: ["colon", "abdominals"],
        isRedFlag: false,
        selfCareTip:
          "Bea ceai călduț de mentă sau mușețel neîndulcit și consumă alimente ușoare.",
        clinicalMechanism:
          "Fermentația excesivă și contracțiile spastice ale musculaturii netede intestinale produc distensie gazoasă (meteorism) și colici abdominale.",
        whenToSeeDoctor:
          "Mergi la medic dacă simptomele persistă peste câteva zile, sunt însoțite de febră sau de scădere involuntară în greutate.",
        differentials: [
          {
            id: "ibs_bloating",
            name: "Disconfort colonic funcțional și meteorism abdominal",
            category: "Gastroenterologie / Medicină de familie",
            urgency: "self_care",
            urgencyLabel: "Dietă blândă și hidratare",
            description:
              "Balonare și crampe difuze care se ameliorează după eliminarea gazelor sau după scaun.",
            typicalSigns: [
              "Abdomen destins mai ales după-amiaza și seara",
              "Crampe colicative intermitente",
            ],
            doctorWorkup:
              "Palpare abdominală, ecografie abdominală de control și analize uzuale de scaun/sânge.",
          },
        ],
      },
      {
        id: "stomach_right_rib_biliary",
        label: "Disconfort sau durere sub coastele din dreapta, greață sau gust amar după masă",
        subRegions: ["liver", "stomach_organ", "obliques"],
        isRedFlag: false,
        selfCareTip:
          "Oprește consumul de grăsimi, sosuri, ouă prăjite și alcool; hidratează-te cu apă plată cu înghițituri mici.",
        clinicalMechanism:
          "Contracția vezicii biliare (colecistului) după o masă bogată în lipide poate provoca durere în hipocondrul drept, uneori iradiată spre umărul drept.",
        whenToSeeDoctor:
          "Solicită o ecografie abdominală la medicul de familie sau gastroenterolog; dacă durerea devine intensă și se asociază cu febră sau îngălbenirea ochilor (icter), mergi de urgență la spital.",
        differentials: [
          {
            id: "biliary_dyskinesia",
            name: "Dischinezie biliară (fiere leneșă) sau colică biliară",
            category: "Gastroenterologie",
            urgency: "gp_visit",
            urgencyLabel: "Ecografie abdominală recomandată",
            description:
              "Evacuare dificilă a bilei sau prezența nămolului/calculilor biliari în colecist.",
            typicalSigns: [
              "Durere sau jenă sub rebordul costal drept",
              "Greață, balonare și gust amar matinal",
              "Uneori durere de cap asociată episoadelor biliare",
            ],
            doctorWorkup:
              "Ecografie abdominală (metoda de elecție neinvazivă) și analize hepatice (transaminaze, bilirubină).",
          },
        ],
      },
      {
        id: "stomach_bleeding",
        label: "Vărsături cu sânge, scaun negru ca smoala sau durere abdominală extremă",
        subRegions: ["stomach_organ", "colon", "liver"],
        isRedFlag: true,
        selfCareTip:
          "Semn de hemoragie digestivă internă gravă! Necesită transport la Urgență.",
        clinicalMechanism:
          "Prezența sângelui în vărsătură, scaunul negru lucios (melenă) sau abdomenul întărit ca lemnul indică o hemoragie digestivă ori o urgență chirurgicală acută (ulcer perforat, apendicită acută, pancreatită).",
        whenToSeeDoctor:
          "URGENȚĂ 112 IMEDIATĂ! Nu mânca, nu bea lichide și nu lua calmante înainte de evaluarea la Urgențe (UPU).",
        differentials: [
          {
            id: "acute_abdomen_gi_bleed",
            name: "Hemoragie digestivă superioară sau abdomen acut chirurgical",
            category: "Urgență medico-chirurgicală 112",
            urgency: "emergency",
            urgencyLabel: "Apel imediat 112 / UPU",
            description:
              "Sângerare activă în tractul digestiv sau inflamație peritoneală acută care necesită tratament spitalicesc imediat.",
            typicalSigns: [
              "Vărsături cu sânge sau cu aspect de zaț de cafea",
              "Scaun negru ca păcura (melenă) sau amețeală severă",
              "Durere abdominală violentă cu perete abdominal rigid",
            ],
            doctorWorkup:
              "Evaluare de urgență în UPU, reechilibrare volemică, analize de urgență, ecografie/CT și endoscopie.",
          },
        ],
      },
    ],
  },
  back: {
    areaTitle: "Spate și șale",
    areaDescription:
      "Evaluare pentru dureri lombare (șale), contracturi musculare, rigiditate între omoplați, sciatică și dureri în lojele renale.",
    symptoms: [
      {
        id: "back_muscle_strain",
        label: "Durere de șale sau mușchi încordați după ridicare de greutăți ori stat prelungit",
        subRegions: ["lower_back", "lumbar_spine", "gluteal"],
        isRedFlag: false,
        selfCareTip:
          "Evită ridicarea greutăților. Aplică căldură locală și menține o postură dreaptă.",
        clinicalMechanism:
          "Suprasolicitarea mecanică a mușchilor paravertebrali lombari și a ligamentelor produce un spasm muscular protector (lumbago mecanic).",
        whenToSeeDoctor:
          "Consultă un medic dacă durerea nu începe să se amelioreze după 5–7 zile sau dacă coboară pe picior sub genunchi.",
        differentials: [
          {
            id: "mechanical_low_back_pain",
            name: "Lumbago mecanic acut (contractură musculară paravertebrală)",
            category: "Recuperare medicală / Ortopedie",
            urgency: "self_care",
            urgencyLabel: "Mișcare blândă și căldură locală",
            description:
              "Durere localizată în partea de jos a spatelui, agravată de aplecare și ameliorată de mers lejer sau întindere pe spate cu genunchii îndoiți.",
            typicalSigns: [
              "Mușchii șalelor se simt încordați și tari",
              "Durerea rămâne în zona lombară/fesieră fără amorțeală în picior",
            ],
            doctorWorkup:
              "Examen clinic musculo-scheletal și program de kinetoterapie; imagistica nu este necesară în primele zile fără semne neurologice.",
          },
          {
            id: "lumbar_disc_sciatica",
            name: "Discopatie lombară cu iradiere sciatică",
            category: "Neurologie / Recuperare medicală",
            urgency: "gp_visit",
            urgencyLabel: "Consult medical dacă iradiază în picior",
            description:
              "Iritația unei rădăcini nervoase lombare care trimite durere sau furnicături pe fesă și pe spatele coapsei.",
            typicalSigns: [
              "Durere care coboară pe un picior la tuse sau aplecare",
              "Senzație de curent sau amorțeală pe gambă",
            ],
            doctorWorkup:
              "Testarea reflexelor și a forței musculare (manevra Lasègue) și eventual RMN lombar.",
          },
        ],
      },
      {
        id: "back_stiffness",
        label: "Rigiditate dimineața între omoplați sau în ceafă și umeri",
        subRegions: ["upper_back", "trapezius", "thoracic_spine"],
        isRedFlag: false,
        selfCareTip:
          "Fă mișcări ușoare de rotație a umerilor și plimbări lejere.",
        clinicalMechanism:
          "Postura prelungită cu umerii aduși în față suprasolicită mușchiul trapez și romboizii, creând puncte dureroase interscapulare.",
        whenToSeeDoctor:
          "Programează un consult dacă rigiditatea matinală durează peste o oră în fiecare zi sau se asociază cu dureri în alte articulații.",
        differentials: [
          {
            id: "postural_dorsalgia",
            name: "Sindrom miofascial dorsal și postural (trapez și romboizi)",
            category: "Recuperare medicală",
            urgency: "self_care",
            urgencyLabel: "Exerciții posturale și ergonomie",
            description:
              "Tensiune musculară între omoplați și la baza gâtului care se dezmorțește după mișcare și duș cald.",
            typicalSigns: [
              "Senzație de nod sau arsură între omoplați",
              "Se ameliorează la rotațiile de umeri și întindere",
            ],
            doctorWorkup:
              "Evaluare posturală a coloanei cervico-toracale și kinetoterapie profilactică.",
          },
        ],
      },
      {
        id: "back_flank_renal",
        label: "Durere profundă într-o singură parte a șalelor, cu usturimi sau urinări frecvente",
        subRegions: ["kidneys", "lower_back"],
        isRedFlag: false,
        selfCareTip:
          "Hidratează-te constant cu apă plată, păstrează zona lombară caldă și măsoară-ți temperatura corporală.",
        clinicalMechanism:
          "Durerea din loja renală provine din distensia capsulei rinichiului sau din trecerea nisipului/calculilor urinari pe ureter.",
        whenToSeeDoctor:
          "Mergi la medic în 24 de ore pentru sumar de urină și ecografie; dacă apare febră cu frisoane sau vărsături, prezintă-te de urgență la spital.",
        differentials: [
          {
            id: "renal_colic_uti",
            name: "Colică renală (microlitiază) sau infecție urinară înaltă",
            category: "Urologie / Nefrologie",
            urgency: "gp_visit",
            urgencyLabel: "Consult medical și ecografie",
            description:
              "Durere unilaterală profundă sub ultimele coaste care nu se modifică la mișcarea coloanei și poate coborî spre zona inghinală.",
            typicalSigns: [
              "Durere pe o singură parte (dreapta sau stânga)",
              "Urinări frecvente, tulburi sau cu usturime",
            ],
            doctorWorkup:
              "Sumar de urină, urocultură, creatinină serică și ecografie reno-vezicală.",
          },
        ],
      },
      {
        id: "back_paralysis",
        label: "Durere violentă bruscă cu amorțeală totală în picioare sau pierderea controlului urinar",
        subRegions: ["lumbar_spine", "thoracic_spine"],
        isRedFlag: true,
        selfCareTip:
          "Semn de compresie neurologică severă! Necesită spitalizare de urgență.",
        clinicalMechanism:
          "Compresia acută a cozii de cal (rădăcinile nervoase sacrale și lombare) sau a măduvei spinării reprezintă o urgență neurochirurgicală absolută.",
        whenToSeeDoctor:
          "URGENȚĂ 112 IMEDIATĂ! Necesită evaluare neurochirurgicală și RMN de urgență pentru prevenirea sechelelor motorii.",
        differentials: [
          {
            id: "cauda_equina_syndrome",
            name: "Sindrom de coadă de cal / compresie medulară acută",
            category: "Urgență neurochirurgicală 112",
            urgency: "emergency",
            urgencyLabel: "Apel imediat 112 / UPU",
            description:
              "Compresie masivă a nervilor spinali care afectează forța picioarelor și controlul sfincterian.",
            typicalSigns: [
              "Amorțeală în zona perineală («în șa») sau în ambele picioare",
              "Imposibilitatea de a merge pe vârfuri sau pe călcâie",
              "Retenție sau incontinență urinară brusc instalată",
            ],
            doctorWorkup:
              "Transport de urgență la UPU, RMN de coloană în regim de urgență și decompresie neurochirurgicală.",
          },
        ],
      },
    ],
  },
  arm: {
    areaTitle: "Brațe și mâini",
    areaDescription:
      "Evaluare pentru dureri de umăr (coafa rotatorilor), cot, antebraț, încheietură și amorțeli în degete.",
    symptoms: [
      {
        id: "arm_joint_pain",
        label: "Dureri articulare la umăr, cot sau încheietură la mișcare și ridicare",
        subRegions: ["deltoid", "rotator_cuff", "elbow_tendon", "wrist_tendon"],
        isRedFlag: false,
        selfCareTip:
          "Lasă articulația în repaus și evită solicitarea repetitivă.",
        clinicalMechanism:
          "Suprasolicitarea tendoanelor (coafa rotatorilor la umăr, epicondilii la cot sau tendoanele carpului) provoacă micro-inflamație locală la mișcările de prindere sau ridicare.",
        whenToSeeDoctor:
          "Consultă un medic de recuperare sau ortoped dacă durerea persistă peste 2 săptămâni sau limitează îmbrăcatul și activitățile zilnice.",
        differentials: [
          {
            id: "rotator_cuff_epicondylitis",
            name: "Tendinopatie de umăr (coafa rotatorilor) sau epicondilită de cot",
            category: "Ortopedie / Recuperare medicală",
            urgency: "self_care",
            urgencyLabel: "Repaus activ și kinetoterapie",
            description:
              "Durere mecanică declanșată de ridicarea brațului în lateral sau de strângerea obiectelor în mână.",
            typicalSigns: [
              "Durere localizată la mișcare, calmă în repaus",
              "Fără umflătură majoră sau modificări de culoare a pielii",
            ],
            doctorWorkup:
              "Teste clinice funcționale ale tendoanelor, ecografie musculo-scheletală și program de exerciții progresive.",
          },
        ],
      },
      {
        id: "arm_swelling_mild",
        label: "Ușoară umflătură sau întindere după efort ori lovitură minoră",
        subRegions: ["biceps", "triceps", "forearm_flexor", "forearm_extensor", "wrist_tendon"],
        isRedFlag: false,
        selfCareTip:
          "Aplică o compresă rece și ține brațul ușor ridicat.",
        clinicalMechanism:
          "Reacția inflamatorie locală după un traumatism minor sau un efort neobișnuit acumulează o cantitate mică de lichid în țesuturile moi.",
        whenToSeeDoctor:
          "Mergi la ortopedie dacă nu poți sprijini sau roti membrul, ori dacă umflătura și vânătăile se extind.",
        differentials: [
          {
            id: "mild_sprain_contusion",
            name: "Contuzie ușoară sau întindere musculo-ligamentară grad I",
            category: "Ortopedie",
            urgency: "self_care",
            urgencyLabel: "Gheață locală și protecție",
            description:
              "Leziune ușoară fără întreruperea continuității osoase sau ligamentare.",
            typicalSigns: [
              "Sensibilitate locală moderată",
              "Mobilitatea degetelor și a articulației este păstrată",
            ],
            doctorWorkup:
              "Examen clinic și radiografie doar dacă există durere în punct fix pe os.",
          },
        ],
      },
      {
        id: "arm_tingling_carpal",
        label: "Furnicături sau amorțeală în palmă și degete (mai ales noaptea sau la lucru)",
        subRegions: ["wrist_tendon", "forearm_flexor"],
        isRedFlag: false,
        selfCareTip:
          "Evită îndoirea prelungită a încheieturii mâinii, fă pauze de dezmorțire și poartă o orteză ușoară de repaus noaptea dacă simptomele reapar.",
        clinicalMechanism:
          "Compresia nervului median în tunelul carpian al încheieturii sau iritația nervilor cervicali produce parestezii (furnicături) pe traiectul nervos.",
        whenToSeeDoctor:
          "Programează un consult neurologic dacă amorțeala devine permanentă sau dacă scapi obiecte mici din mână.",
        differentials: [
          {
            id: "carpal_tunnel_syndrome",
            name: "Sindrom de tunel carpian sau radiculopatie cervicală",
            category: "Neurologie",
            urgency: "gp_visit",
            urgencyLabel: "Consult neurologic recomandat",
            description:
              "Compresie nervoasă periferică la nivelul încheieturii mâinii sau al coloanei cervicale.",
            typicalSigns: [
              "Furnicături în degetul mare, arătător și mijlociu",
              "Nevoia de a scutura mâna noaptea pentru a calma amorțeala",
            ],
            doctorWorkup:
              "Examen neurologic (semnul Tinel/Phalen) și electromiografie (EMG) de conducere nervoasă.",
          },
        ],
      },
      {
        id: "arm_sudden_paralysis",
        label: "Braț brusc inert, scăpat din mână sau incapacitate completă de mișcare",
        subRegions: ["deltoid", "biceps", "wrist_tendon"],
        isRedFlag: true,
        selfCareTip:
          "Semn critic neurologic sau vascular! Sună la 112.",
        clinicalMechanism:
          "Pierderea bruscă a forței într-un braț (monopareză/hemipareză) sau răcirea și paloarea bruscă a membrului indică un accident vascular cerebral ori o ischemie arterială acută.",
        whenToSeeDoctor:
          "URGENȚĂ 112 IMEDIATĂ! Nu aștepta remiterea simptomelor.",
        differentials: [
          {
            id: "acute_neurovascular_arm",
            name: "Deficit motor acut (suspiciune AVC) sau ischemie acută de membru",
            category: "Urgență neurologică / vasculară 112",
            urgency: "emergency",
            urgencyLabel: "Apel imediat 112",
            description:
              "Scădere bruscă de forță musculară sau întreruperea circulației arteriale într-un membru superior.",
            typicalSigns: [
              "Brațul cade inert când încerci să îl ridici",
              "Amorțeală bruscă pe o jumătate de corp sau tulburare de vorbire",
            ],
            doctorWorkup:
              "Evaluare de urgență 112 în UPU, CT cerebral și examen Doppler vascular.",
          },
        ],
      },
    ],
  },
  leg: {
    areaTitle: "Picioare și tălpi",
    areaDescription:
      "Evaluare pentru dureri de șold, coapsă, genunchi, gambă, tendonul lui Ahile, glezne umflate și semne vasculare.",
    symptoms: [
      {
        id: "leg_knee_ache",
        label: "Durere surdă de genunchi, șold sau gleznă la urcatul scărilor și mers",
        subRegions: ["patellar_tendon", "quadriceps", "hip_flexor", "achilles"],
        isRedFlag: false,
        selfCareTip:
          "Odihnește piciorul și evită statul prelungit în picioare.",
        clinicalMechanism:
          "Uzura treptată a cartilajului articular sau suprasolicitarea tendonului rotulian și ahilian provoacă durere mecanică la preluarea greutății corpului.",
        whenToSeeDoctor:
          "Consultă un ortoped sau reumatolog dacă genunchiul se blochează, trosnește dureros sau se umflă.",
        differentials: [
          {
            id: "knee_oa_patellar",
            name: "Suprasolicitare femuro-patelară sau gonartroză incipientă",
            category: "Ortopedie / Reumatologie",
            urgency: "gp_visit",
            urgencyLabel: "Evaluare ortopedică și kinetoterapie",
            description:
              "Sensibilitate articulară la urcatul/coborâtul scărilor și la ridicarea de pe scaun după repaus (redoare de start).",
            typicalSigns: [
              "Durere mecanică la efort care se calmează în repaus",
              "Rigiditate scurtă (sub 15–30 minute) dimineața",
            ],
            doctorWorkup:
              "Examen ortopedic, radiografie de genunchi în picioare sau ecografie articulară.",
          },
        ],
      },
      {
        id: "leg_evening_swelling",
        label: "Glezne umflate bilateral și picioare grele sau obosite seara",
        subRegions: ["calves", "achilles"],
        isRedFlag: false,
        selfCareTip:
          "Ridică picioarele pe o pernă în timpul repausului și redu sarea din alimentație.",
        clinicalMechanism:
          "Întoarcerea venoasă încetinită după statul prelungit în picioare sau pe scaun determină acumularea de lichid (edem decliv) în jurul gleznelor.",
        whenToSeeDoctor:
          "Programează un consult medical dacă umflarea gleznelor persistă și dimineața la trezire sau se asociază cu oboseală la respirație.",
        differentials: [
          {
            id: "chronic_venous_insufficiency",
            name: "Insuficiență venoasă periferică (picioare grele)",
            category: "Medicină internă / Flebologie",
            urgency: "gp_visit",
            urgencyLabel: "Consult medic de familie",
            description:
              "Stagnarea sângelui venos în membrele inferioare, accentuată de căldură și ortostatism prelungit.",
            typicalSigns: [
              "Glezne umflate simetric seara, care se dezumflă peste noapte",
              "Senzație de tensiune sau cârcei nocturni în gambe",
            ],
            doctorWorkup:
              "Examen clinic vascular, ecografie Doppler venoasă și evaluarea funcției cardiace/renale.",
          },
        ],
      },
      {
        id: "leg_heel_plantar",
        label: "Durere în călcâi, talpă sau tendonul lui Ahile la primii pași dimineața",
        subRegions: ["achilles", "calves"],
        isRedFlag: false,
        selfCareTip:
          "Poartă încălțăminte cu talpă ortopedică moale, nu merge desculț pe gresie dură și întinde blând gamba înainte de a coborî din pat.",
        clinicalMechanism:
          "Micro-tensiunea acumulată în fascia plantară a tălpii sau în tendonul lui Ahile devine dureroasă la întinderea bruscă de dimineață.",
        whenToSeeDoctor:
          "Consultă medicul de recuperare dacă durerea din călcâi nu se reduce după 2–3 săptămâni de încălțăminte adecvată și stretching.",
        differentials: [
          {
            id: "plantar_fasciitis_achilles",
            name: "Fasciită plantară sau tendinopatie ahiliană",
            category: "Ortopedie / Recuperare medicală",
            urgency: "self_care",
            urgencyLabel: "Stretching și susținători plantari",
            description:
              "Inflamație mecanică a fasciei tălpii sau a inserției tendonului lui Ahile pe osul calcaneu.",
            typicalSigns: [
              "Durere ascuțită în călcâi la primii pași după repaus",
              "Se ameliorează parțial după câteva minute de mers ușor",
            ],
            doctorWorkup:
              "Palpare clinică, analiză plantaroscopică și recomandare de talonete și fizioterapie.",
          },
        ],
      },
      {
        id: "leg_hot_clot",
        label: "Gambă umflată brusc, roșie, fierbinte și dureroasă chiar și în repaus",
        subRegions: ["calves"],
        isRedFlag: true,
        selfCareTip:
          "Semn posibil de tromboză venoasă profundă! Necesită evaluare medicală imediată.",
        clinicalMechanism:
          "Formarea unui cheag de sânge (tromb) într-o venă profundă a gambei sau coapsei blochează întoarcerea sângelui și prezintă risc de mobilizare spre plămâni (embolie pulmonară).",
        whenToSeeDoctor:
          "URGENȚĂ MEDICALĂ IMEDIATĂ (112 / UPU)! Nu masa gamba și nu forța mersul până la efectuarea unei ecografii Doppler de urgență.",
        differentials: [
          {
            id: "deep_vein_thrombosis",
            name: "Suspiciune de tromboză venoasă profundă (TVP)",
            category: "Urgență vasculară 112",
            urgency: "emergency",
            urgencyLabel: "Evaluare de urgență în UPU / 112",
            description:
              "Obstrucție venoasă acută la nivelul unui singur membru inferior.",
            typicalSigns: [
              "Umflare asimetrică (doar o gambă este mărită în volum)",
              "Piele întinsă, caldă, roșiatică și durere continuă în molet",
            ],
            doctorWorkup:
              "Ecografie Doppler venoasă de urgență, dozare D-dimeri și inițierea tratamentului anticoagulant.",
          },
        ],
      },
    ],
  },
};

export function getExercisesForSelection(
  macroPart: BodyPartId,
  subRegion?: SubRegionId | null
): TherapeuticExercise[] {
  if (subRegion && SUB_REGION_INFO[subRegion]) {
    const family = SUB_REGION_INFO[subRegion].exerciseFamily;
    return EXERCISES_BY_FAMILY[family] || EXERCISES_BY_FAMILY.back;
  }
  const fallbackSub = DEFAULT_SUB_REGION_FOR_MACRO[macroPart];
  const family = SUB_REGION_INFO[fallbackSub].exerciseFamily;
  return EXERCISES_BY_FAMILY[family] || EXERCISES_BY_FAMILY.back;
}

/**
 * Returns localized anatomy data for the given sub-region across ro, en, sq, it.
 * Safely falls back to DEFAULT_LANG ("en") and base Romanian record.
 */
export function getLocalizedSubRegion(
  id: SubRegionId,
  lang: Lang = DEFAULT_LANG
): SubRegionInfo {
  const base = SUB_REGION_INFO[id];
  if (!base) return base;
  const loc = base.localized?.[lang];
  if (!loc) return base;
  return {
    ...base,
    label: loc.label,
    tissueLabel: loc.tissueLabel,
    systemLabel: loc.systemLabel,
    summary: loc.summary,
    functionDescription: loc.functionDescription,
    clinicalNotes: loc.clinicalNotes,
    commonConditions: loc.commonConditions,
    recommendedSpecialty: loc.recommendedSpecialty,
    searchKeywords: loc.searchKeywords,
  };
}
