"use client";

import { useContext, useMemo, useState } from "react";
import { CheckIcon } from "@/components/ui/icons";
import { ROW_CLASS, ROW_LIST_CLASS, ROW_LIST_SINGLE_CLASS, radioDotClass, tickBoxClass } from "./choice-styles";
import { LanguageContext } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";

export interface DiabetesPlateMethodModuleProps {
  lang?: Lang;
}

export type PlateSectionId = "vegetables" | "protein" | "carbs";

interface FoodItemBase {
  id: string;
  category: PlateSectionId;
  caloriesApprox: number;
  fiberGrams: number;
}

interface FoodItemLocalization {
  name: string;
}

const FOOD_DATABASE_BASE: FoodItemBase[] = [
  // 50% Legume fără amidon
  { id: "v1", category: "vegetables", caloriesApprox: 20, fiberGrams: 2.5 },
  { id: "v2", category: "vegetables", caloriesApprox: 25, fiberGrams: 1.8 },
  { id: "v3", category: "vegetables", caloriesApprox: 35, fiberGrams: 3.2 },
  { id: "v4", category: "vegetables", caloriesApprox: 30, fiberGrams: 2.1 },
  { id: "v5", category: "vegetables", caloriesApprox: 32, fiberGrams: 3.4 },

  // 25% Proteine slabe
  { id: "p1", category: "protein", caloriesApprox: 180, fiberGrams: 0 },
  { id: "p2", category: "protein", caloriesApprox: 165, fiberGrams: 0 },
  { id: "p3", category: "protein", caloriesApprox: 140, fiberGrams: 0 },
  { id: "p4", category: "protein", caloriesApprox: 120, fiberGrams: 0 },
  { id: "p5", category: "protein", caloriesApprox: 130, fiberGrams: 4.0 },

  // 25% Carbohidrați complecși cu fibre
  { id: "c1", category: "carbs", caloriesApprox: 130, fiberGrams: 3.0 },
  { id: "c2", category: "carbs", caloriesApprox: 150, fiberGrams: 3.5 },
  { id: "c3", category: "carbs", caloriesApprox: 120, fiberGrams: 3.8 },
  { id: "c4", category: "carbs", caloriesApprox: 140, fiberGrams: 4.5 },
  { id: "c5", category: "carbs", caloriesApprox: 85, fiberGrams: 2.8 },
];

const FOOD_TRANSLATIONS: Record<Lang, Record<string, FoodItemLocalization>> = {
  ro: {
    v1: { name: "Salată verde și spanac" },
    v2: { name: "Castraveți și roșii" },
    v3: { name: "Broccoli și conopidă la abur" },
    v4: { name: "Ardei gras" },
    v5: { name: "Fasole verde la cuptor" },
    p1: { name: "Păstrăv sau somon la grătar" },
    p2: { name: "Piept de pui fără piele" },
    p3: { name: "Ouă fierte" },
    p4: { name: "Urdă sau brânză de vaci slabă" },
    p5: { name: "Tofu sau linte fiartă" },
    c1: { name: "Mămăligă din mălai integral" },
    c2: { name: "Orez brun sau basmati integral" },
    c3: { name: "Cartof dulce copt în coajă" },
    c4: { name: "Quinoa sau hrișcă fiartă" },
    c5: { name: "Pâine integrală de secară (1 felie)" },
  },
  en: {
    v1: { name: "Green salad and spinach" },
    v2: { name: "Cucumbers and tomatoes" },
    v3: { name: "Steamed broccoli and cauliflower" },
    v4: { name: "Bell peppers" },
    v5: { name: "Baked green beans" },
    p1: { name: "Grilled trout or salmon" },
    p2: { name: "Skinless chicken breast" },
    p3: { name: "Boiled eggs" },
    p4: { name: "Curd cheese or low-fat cottage cheese" },
    p5: { name: "Tofu or boiled lentils" },
    c1: { name: "Wholegrain polenta" },
    c2: { name: "Brown or wholegrain basmati rice" },
    c3: { name: "Sweet potato baked in its skin" },
    c4: { name: "Boiled quinoa or buckwheat" },
    c5: { name: "Wholegrain rye bread (1 slice)" },
  },
  sq: {
    v1: { name: "Sallatë jeshile dhe spinaq" },
    v2: { name: "Kastravecë dhe domate" },
    v3: { name: "Brokoli dhe lulelakër në avull" },
    v4: { name: "Speca" },
    v5: { name: "Bishtaja në furrë" },
    p1: { name: "Troftë ose salmon në skarë" },
    p2: { name: "Gjoks pule pa lëkurë" },
    p3: { name: "Vezë të ziera" },
    p4: { name: "Gjizë ose djathë i bardhë me pak yndyrë" },
    p5: { name: "Tofu ose thjerrëza të ziera" },
    c1: { name: "Kaçamak me miell misri integral" },
    c2: { name: "Oriz kaf ose basmati integral" },
    c3: { name: "Patate e ëmbël e pjekur me lëkurë" },
    c4: { name: "Kuinoa ose hikërror i zier" },
    c5: { name: "Bukë thekre integrale (1 fetë)" },
  },
  it: {
    v1: { name: "Insalata verde e spinaci" },
    v2: { name: "Cetrioli e pomodori" },
    v3: { name: "Broccoli e cavolfiore al vapore" },
    v4: { name: "Peperoni" },
    v5: { name: "Fagiolini al forno" },
    p1: { name: "Trota o salmone alla griglia" },
    p2: { name: "Petto di pollo senza pelle" },
    p3: { name: "Uova sode" },
    p4: { name: "Ricotta magra o fiocchi di latte" },
    p5: { name: "Tofu o lenticchie lesse" },
    c1: { name: "Polenta di mais integrale" },
    c2: { name: "Riso integrale o basmati integrale" },
    c3: { name: "Patata dolce al forno con la buccia" },
    c4: { name: "Quinoa o grano saraceno lessi" },
    c5: { name: "Pane integrale di segale (1 fetta)" },
  },
  hr: {
    v1: { name: "Zelena salata i špinat" },
    v2: { name: "Krastavci i rajčice" },
    v3: { name: "Brokula i cvjetača na pari" },
    v4: { name: "Svježa paprika" },
    v5: { name: "Mahune pečene u pećnici" },
    p1: { name: "Pastrva ili losos sa žara" },
    p2: { name: "Pileća prsa bez kožice" },
    p3: { name: "Kuhana jaja" },
    p4: { name: "Posni svježi kravlji sir ili skuta" },
    p5: { name: "Tofu ili kuhana leća" },
    c1: { name: "Palenta od cjelovitog kukuruznog brašna" },
    c2: { name: "Smeđa ili integralna basmati riža" },
    c3: { name: "Batat pečen u kori" },
    c4: { name: "Kuhana kvinoja ili heljda" },
    c5: { name: "Integralni raženi kruh (1 kriška)" },
  },
  rom: {
    v1: { name: "Zeleno salata thaj spanako" },
    v2: { name: "Krastavitsurya thaj paradikurya" },
    v3: { name: "Brokoli thaj konopida po aburo" },
    v4: { name: "Ardeya (piperke)" },
    v5: { name: "Zelene fusuj and-o bov" },
    p1: { name: "Pastravo vay somono po grataro" },
    p2: { name: "Kaxnyako kolin bi mortyako" },
    p3: { name: "Kirade anre" },
    p4: { name: "Kovlo parno kiral bi khilesko" },
    p5: { name: "Tofu vay kirade linte" },
    c1: { name: "Mamaliga katar intrego malayo" },
    c2: { name: "Kalo orizo vay intrego basmati" },
    c3: { name: "Gudlo kompiri peklo and-i morchi" },
    c4: { name: "Kiradi kinoa vay hrishka" },
    c5: { name: "Kalo intrego manro (1 kotor)" },
  },
};

interface SectionConfig {
  id: PlateSectionId;
  title: string;
  /** Short name drawn inside the plate. */
  shortName: string;
  percentageLabel: string;
  handRule: string;
  handDetail: string;
  clinicalPurpose: string;
}

const SECTION_TRANSLATIONS: Record<Lang, Record<PlateSectionId, SectionConfig>> = {
  ro: {
    vegetables: {
      id: "vegetables",
      title: "Legume, fără cartofi",
      shortName: "Legume",
      percentageLabel: "Jumătate de farfurie (50%)",
      handRule: "Două mâini făcute căuș",
      handDetail: "Cât încape în ambele mâini lipite. Poți mânca din plin.",
      clinicalPurpose:
        "Au apă și fibre. Te satură fără să crească zahărul din sânge și încetinesc digestia.",
    },
    protein: {
      id: "protein",
      title: "Proteine slabe",
      shortName: "Proteine",
      percentageLabel: "Un sfert de farfurie (25%)",
      handRule: "O palmă",
      handDetail: "Cât palma ta, fără degete, și cam la fel de groasă. Adică 100–150 de grame.",
      clinicalPurpose:
        "Îți păstrează mușchii, te țin sătul mai mult și nu urcă repede zahărul din sânge.",
    },
    carbs: {
      id: "carbs",
      title: "Carbohidrați cu fibre",
      shortName: "Carbohidrați",
      percentageLabel: "Un sfert de farfurie (25%)",
      handRule: "Un pumn",
      handDetail: "Cât pumnul tău strâns. Cam o cană sau 150–200 de grame de mâncare gătită.",
      clinicalPurpose:
        "Dau energie creierului. Cerealele integrale ridică zahărul încet, fără salturi mari.",
    },
  },
  en: {
    vegetables: {
      id: "vegetables",
      title: "Vegetables, not potatoes",
      shortName: "Vegetables",
      percentageLabel: "Half the plate (50%)",
      handRule: "Two cupped hands",
      handDetail: "What fits in both hands held together. You can eat plenty.",
      clinicalPurpose:
        "They have water and fiber. They fill you up without raising your blood sugar, and slow down digestion.",
    },
    protein: {
      id: "protein",
      title: "Lean protein",
      shortName: "Protein",
      percentageLabel: "A quarter of the plate (25%)",
      handRule: "One palm",
      handDetail: "The size and thickness of your palm, without fingers. About 100–150 grams.",
      clinicalPurpose:
        "Keeps your muscles strong, keeps you full longer and does not raise blood sugar quickly.",
    },
    carbs: {
      id: "carbs",
      title: "Carbs with fiber",
      shortName: "Carbs",
      percentageLabel: "A quarter of the plate (25%)",
      handRule: "One fist",
      handDetail: "The size of your closed fist. About 1 cup, or 150–200 grams cooked.",
      clinicalPurpose:
        "They give your brain energy. Whole grains raise blood sugar slowly, without big jumps.",
    },
  },
  sq: {
    vegetables: {
      id: "vegetables",
      title: "Perime, jo patate",
      shortName: "Perime",
      percentageLabel: "Gjysma e pjatës (50%)",
      handRule: "Dy pëllëmbë plot",
      handDetail: "Sa nxë në të dyja duart e bashkuara. Mund të hash sa të duash.",
      clinicalPurpose:
        "Kanë ujë dhe fibra. Të ngopin pa e rritur sheqerin në gjak dhe e ngadalësojnë tretjen.",
    },
    protein: {
      id: "protein",
      title: "Proteina pa yndyrë",
      shortName: "Proteina",
      percentageLabel: "Një çerek i pjatës (25%)",
      handRule: "Një pëllëmbë",
      handDetail: "Sa pëllëmba jote pa gishta, edhe në trashësi. Rreth 100–150 gramë.",
      clinicalPurpose:
        "Ruajnë muskujt, të mbajnë më gjatë të ngopur dhe nuk e rritin shpejt sheqerin.",
    },
    carbs: {
      id: "carbs",
      title: "Karbohidrate me fibra",
      shortName: "Karbohidrate",
      percentageLabel: "Një çerek i pjatës (25%)",
      handRule: "Një grusht",
      handDetail: "Sa grushti yt i mbyllur. Rreth 1 filxhan, ose 150–200 gramë ushqim i gatuar.",
      clinicalPurpose:
        "I japin energji trurit. Drithërat integrale e rritin sheqerin ngadalë, pa kërcime të mëdha.",
    },
  },
  it: {
    vegetables: {
      id: "vegetables",
      title: "Verdure, non patate",
      shortName: "Verdure",
      percentageLabel: "Metà del piatto (50%)",
      handRule: "Due mani a coppa",
      handDetail: "Quanto sta nelle due mani unite. Puoi mangiarne in abbondanza.",
      clinicalPurpose:
        "Hanno acqua e fibre. Saziano senza alzare la glicemia e rallentano la digestione.",
    },
    protein: {
      id: "protein",
      title: "Proteine magre",
      shortName: "Proteine",
      percentageLabel: "Un quarto del piatto (25%)",
      handRule: "Un palmo",
      handDetail: "Grande e spesso come il palmo della tua mano, senza dita. Circa 100–150 grammi.",
      clinicalPurpose:
        "Mantengono i muscoli, saziano più a lungo e non alzano in fretta la glicemia.",
    },
    carbs: {
      id: "carbs",
      title: "Carboidrati con fibre",
      shortName: "Carboidrati",
      percentageLabel: "Un quarto del piatto (25%)",
      handRule: "Un pugno",
      handDetail: "Grande come il tuo pugno chiuso. Circa 1 tazza, o 150–200 grammi di cibo cotto.",
      clinicalPurpose:
        "Danno energia al cervello. I cereali integrali alzano la glicemia piano, senza picchi.",
    },
  },
  hr: {
    vegetables: {
      id: "vegetables",
      title: "Povrće, bez krumpira",
      shortName: "Povrće",
      percentageLabel: "Polovica tanjura (50%)",
      handRule: "Dvije spojene šake",
      handDetail: "Koliko stane u oba spojena dlana. Možeš jesti obilno.",
      clinicalPurpose:
        "Sadrži vodu i vlakna. Zasićuje te bez povišenja glukoze u krvi i usporava probavu.",
    },
    protein: {
      id: "protein",
      title: "Nemasne bjelančevine",
      shortName: "Bjelančevine",
      percentageLabel: "Četvrtina tanjura (25%)",
      handRule: "Jedan dlan",
      handDetail: "Veličine i debljine tvojega dlana bez prstiju. Otprilike 100–150 grama.",
      clinicalPurpose:
        "Čuva mišiće, drži te dulje sitim i ne podiže naglo glukozu u krvi.",
    },
    carbs: {
      id: "carbs",
      title: "Ugljikohidrati s vlaknima",
      shortName: "Ugljikohidrati",
      percentageLabel: "Četvrtina tanjura (25%)",
      handRule: "Jedna stisnuta šaka",
      handDetail: "Veličine tvoje stisnute šake. Oko 1 šalice ili 150–200 grama kuhane hrane.",
      clinicalPurpose:
        "Daju energiju mozgu. Cjelovite žitarice podižu glukozu u krvi polako, bez naglih skokova.",
    },
  },
  rom: {
    vegetables: {
      id: "vegetables",
      title: "Zarzavaturya, bi kompirengo",
      shortName: "Zarzavaturya",
      percentageLabel: "Dopash charo (50%)",
      handRule: "Duj vast khetane",
      handDetail: "Kobor beshel and-e solduj vast pherde. Shaj xas dosta.",
      clinicalPurpose:
        "Si len pay thaj fibre. Chalyaren tut bi te vazden o zaharo and-o rat thaj lokhyaren o mistimos.",
    },
    protein: {
      id: "protein",
      title: "Proteine bi khilesko",
      shortName: "Proteine",
      percentageLabel: "Ekh shtarto charo (25%)",
      handRule: "Ekh palma",
      handDetail: "Kobor chi palma bi nayengo, vi and-i thulimos. Pashe 100–150 gramurya.",
      clinicalPurpose:
        "Inkeren che muskulurya zurale, inkeren tut chalo may but vrama thaj na vazden sigo o zaharo and-o rat.",
    },
    carbs: {
      id: "carbs",
      title: "Karbohidraturya fibrensa",
      shortName: "Karbohidraturya",
      percentageLabel: "Ekh shtarto charo (25%)",
      handRule: "Ekh dumuk",
      handDetail: "Kobor cho phandado dumuk. Pashe 1 chasha vay 150–200 gramurya kirado xaben.",
      clinicalPurpose:
        "Den zor la godyake. Le intregi giva vazden o zaharo and-o rat lokhes.",
    },
  },
};

interface PlateUiStrings {
  moduleAriaLabel: string;
  title: string;
  description: string;
  plateHint: string;
  plateAriaLabel: string;
  handRuleHeading: string;
  clinicalPurposeHeading: string;
  builderHeading: string;
  builderSubtitle: string;
  resetButton: string;
  /** Unit word after fibre grams on each food, e.g. "g fibre". */
  fiberShort: string;
  completeStatus: string;
  incompleteStatus: string;
  foodsCountSuffix: string;
  totalFiberPrefix: string;
  approxCaloriesPrefix: string;
  fiberGramsSuffix: string;
  completeMessage: string;
  incompleteMessage: string;
  presetsTitle: string;
  presetTraditional: string;
  presetMediterranean: string;
  presetQuickLunch: string;
}

const UI_STRINGS: Record<Lang, PlateUiStrings> = {
  ro: {
    moduleAriaLabel: "Farfuria pentru diabet",
    title: "Cum îți împarți farfuria",
    description: "Nu ai nevoie de cântar. Împarte farfuria în trei: jumătate legume, un sfert proteine, un sfert carbohidrați. Așa zahărul din sânge rămâne mai stabil și stai sătul mai mult.",
    plateHint: "Apasă pe o parte a farfuriei",
    plateAriaLabel: "Farfuria împărțită: jumătate legume, un sfert proteine, un sfert carbohidrați",
    handRuleHeading: "Cât pui, măsurat cu mâna",
    clinicalPurposeHeading: "De ce contează",
    builderHeading: "Fă-ți farfuria",
    builderSubtitle: "Alege mâncarea pentru o masă. Vezi dacă farfuria e completă și câte fibre are.",
    resetButton: "Înapoi la exemplu",
    fiberShort: "g fibre",
    completeStatus: "Farfuria e completă",
    incompleteStatus: "Lipsește o parte a farfuriei",
    foodsCountSuffix: "alimente alese",
    totalFiberPrefix: "Fibre:",
    approxCaloriesPrefix: "Calorii, cam:",
    fiberGramsSuffix: "grame",
    completeMessage: "Ai legume, proteine slabe și carbohidrați cu fibre. O masă așa ridică zahărul din sânge mai încet și te ține sătul mai mult.",
    incompleteMessage: "Adaugă cel puțin un aliment din fiecare parte: legume, proteine și carbohidrați integrali.",
    presetsTitle: "Exemple de mese",
    presetTraditional: "Tradițional",
    presetMediterranean: "Mediteranean",
    presetQuickLunch: "Prânz rapid",
  },
  en: {
    moduleAriaLabel: "The diabetes plate",
    title: "How to fill your plate",
    description: "You do not need scales. Split your plate in three: half vegetables, a quarter protein, a quarter carbs. This keeps your blood sugar steadier and keeps you full longer.",
    plateHint: "Tap a part of the plate",
    plateAriaLabel: "Plate split into half vegetables, a quarter protein and a quarter carbs",
    handRuleHeading: "How much, measured by hand",
    clinicalPurposeHeading: "Why it matters",
    builderHeading: "Make your plate",
    builderSubtitle: "Choose the food for one meal. See if the plate is complete and how much fiber it has.",
    resetButton: "Back to the example",
    fiberShort: "g fiber",
    completeStatus: "The plate is complete",
    incompleteStatus: "One part of the plate is missing",
    foodsCountSuffix: "foods chosen",
    totalFiberPrefix: "Fiber:",
    approxCaloriesPrefix: "Calories, about:",
    fiberGramsSuffix: "grams",
    completeMessage: "You have vegetables, lean protein and carbs with fiber. A meal like this raises blood sugar more slowly and keeps you full longer.",
    incompleteMessage: "Add at least one food from each part: vegetables, protein and whole-grain carbs.",
    presetsTitle: "Example meals",
    presetTraditional: "Traditional",
    presetMediterranean: "Mediterranean",
    presetQuickLunch: "Quick lunch",
  },
  sq: {
    moduleAriaLabel: "Pjata për diabetin",
    title: "Si ta mbushësh pjatën",
    description: "Nuk të duhet peshore. Ndaje pjatën në tri pjesë: gjysmën perime, një çerek proteina, një çerek karbohidrate. Kështu sheqeri në gjak qëndron më i qetë dhe ngopesh më gjatë.",
    plateHint: "Prek një pjesë të pjatës",
    plateAriaLabel: "Pjata e ndarë: gjysmë perime, një çerek proteina, një çerek karbohidrate",
    handRuleHeading: "Sa të vësh, me masën e dorës",
    clinicalPurposeHeading: "Pse ka rëndësi",
    builderHeading: "Bëje pjatën tënde",
    builderSubtitle: "Zgjidh ushqimin për një vakt. Shiko nëse pjata është e plotë dhe sa fibra ka.",
    resetButton: "Kthehu te shembulli",
    fiberShort: "g fibra",
    completeStatus: "Pjata është e plotë",
    incompleteStatus: "Mungon një pjesë e pjatës",
    foodsCountSuffix: "ushqime të zgjedhura",
    totalFiberPrefix: "Fibra:",
    approxCaloriesPrefix: "Kalori, rreth:",
    fiberGramsSuffix: "gramë",
    completeMessage: "Ke perime, proteina pa yndyrë dhe karbohidrate me fibra. Një vakt i tillë e rrit sheqerin më ngadalë dhe të mban më gjatë të ngopur.",
    incompleteMessage: "Shto të paktën një ushqim nga çdo pjesë: perime, proteina dhe drithëra integrale.",
    presetsTitle: "Shembuj vaktesh",
    presetTraditional: "Tradicionale",
    presetMediterranean: "Mesdhetare",
    presetQuickLunch: "Drekë e shpejtë",
  },
  it: {
    moduleAriaLabel: "Il piatto per il diabete",
    title: "Come riempire il piatto",
    description: "Non serve la bilancia. Dividi il piatto in tre: metà verdure, un quarto proteine, un quarto carboidrati. Così la glicemia resta più stabile e resti sazio più a lungo.",
    plateHint: "Tocca una parte del piatto",
    plateAriaLabel: "Piatto diviso: metà verdure, un quarto proteine, un quarto carboidrati",
    handRuleHeading: "Quanto metterne, misurato con la mano",
    clinicalPurposeHeading: "Perché conta",
    builderHeading: "Prepara il tuo piatto",
    builderSubtitle: "Scegli il cibo per un pasto. Vedi se il piatto è completo e quante fibre ha.",
    resetButton: "Torna all'esempio",
    fiberShort: "g di fibre",
    completeStatus: "Il piatto è completo",
    incompleteStatus: "Manca una parte del piatto",
    foodsCountSuffix: "cibi scelti",
    totalFiberPrefix: "Fibre:",
    approxCaloriesPrefix: "Calorie, circa:",
    fiberGramsSuffix: "grammi",
    completeMessage: "Hai verdure, proteine magre e carboidrati con fibre. Un pasto così alza la glicemia più piano e sazia più a lungo.",
    incompleteMessage: "Aggiungi almeno un cibo per ogni parte: verdure, proteine e carboidrati integrali.",
    presetsTitle: "Esempi di pasto",
    presetTraditional: "Tradizionale",
    presetMediterranean: "Mediterraneo",
    presetQuickLunch: "Pranzo veloce",
  },
  hr: {
    moduleAriaLabel: "Tanjur kod šećerne bolesti",
    title: "Kako složiti svoj tanjur",
    description: "Ne treba ti kuhinjska vaga. Podijeli tanjur na tri dijela: polovicu povrće, četvrtinu bjelančevine, četvrtinu ugljikohidrati. Tako glukoza u krvi ostaje stabilnija i dulje si sit.",
    plateHint: "Dodirni dio tanjura",
    plateAriaLabel: "Tanjur podijeljen na polovicu povrća, četvrtinu bjelančevina i četvrtinu ugljikohidrata",
    handRuleHeading: "Koliko staviti, mjereno dlanom",
    clinicalPurposeHeading: "Zašto je važno",
    builderHeading: "Složi svoj tanjur",
    builderSubtitle: "Odaberi hranu za jedan obrok. Provjeri je li tanjur potpun i koliko vlakana sadrži.",
    resetButton: "Vrati na primjer",
    fiberShort: "g vlakana",
    completeStatus: "Tanjur je potpun",
    incompleteStatus: "Nedostaje jedan dio tanjura",
    foodsCountSuffix: "odabrane namirnice",
    totalFiberPrefix: "Vlakna:",
    approxCaloriesPrefix: "Kalorije, otprilike:",
    fiberGramsSuffix: "grama",
    completeMessage: "Imaš povrće, nemasne bjelančevine i ugljikohidrate s vlaknima. Takav obrok sporije podiže glukozu u krvi i dulje drži sitost.",
    incompleteMessage: "Dodaj barem po jednu namirnicu iz svakog dijela: povrće, bjelančevine i cjelovite ugljikohidrate.",
    presetsTitle: "Primjeri obroka",
    presetTraditional: "Tradicionalni",
    presetMediterranean: "Mediteranski",
    presetQuickLunch: "Brzi ručak",
  },
  rom: {
    moduleAriaLabel: "O charo vash o gudlo rat",
    title: "Sar te pheres cho charo",
    description: "Na trebul tuke kantari. Hulav o charo pe trin kotora: dopash zarzavaturya, ekh shtarto proteine, ekh shtarto karbohidraturya. Kadya o zaharo and-o rat achhel may lokho thaj beshes chalo may but.",
    plateHint: "Azba ekh kotor katar o charo",
    plateAriaLabel: "O charo hulado: dopash zarzavaturya, ekh shtarto proteine thaj ekh shtarto karbohidraturya",
    handRuleHeading: "Kobor te thoves, mardo vastesa",
    clinicalPurposeHeading: "Sostar si importanto",
    builderHeading: "Ker cho charo",
    builderSubtitle: "Alosar o xaben vash ekh mesalya. Dikh te si o charo pherdo thaj kobor fibre si les.",
    resetButton: "Palpale ko misal",
    fiberShort: "g fibre",
    completeStatus: "O charo si intrego",
    incompleteStatus: "Naj ekh kotor katar o charo",
    foodsCountSuffix: "alosarde xabena",
    totalFiberPrefix: "Fibre:",
    approxCaloriesPrefix: "Kaloriye, pashe:",
    fiberGramsSuffix: "gramurya",
    completeMessage: "Si tut zarzavaturya, proteine bi khilesko thaj karbohidraturya fibrensa. Kasavo xaben vazdel o zaharo and-o rat may lokhes thaj inkerel tut chalo.",
    incompleteMessage: "Thov inke ekh xaben katar svako kotor: zarzavaturya, proteine thaj intregi karbohidraturya.",
    presetsTitle: "Misalya vash xaben",
    presetTraditional: "Kherutno",
    presetMediterranean: "Mediterano",
    presetQuickLunch: "Sigo xaben",
  },
};

function useSafeLanguage(propLang?: Lang): Lang {
  const ctx = useContext(LanguageContext);
  if (propLang && UI_STRINGS[propLang]) return propLang;
  if (ctx?.lang && UI_STRINGS[ctx.lang]) return ctx.lang;
  return "ro";
}

const SECTION_ORDER: PlateSectionId[] = ["vegetables", "protein", "carbs"];

/** One palette for the plate drawing, the legend and the food list. */
const SECTION_STYLE: Record<
  PlateSectionId,
  { fill: string; stroke: string; swatch: string; d: string; lx: number; ly: number; pct: string }
> = {
  vegetables: {
    fill: "var(--color-live-sage-soft)",
    stroke: "var(--color-live-sage)",
    swatch: "bg-live-sage",
    d: "M 160 30 A 130 130 0 0 0 160 290 Z",
    lx: 96,
    ly: 160,
    pct: "50%",
  },
  protein: {
    fill: "var(--color-sapphire-soft)",
    stroke: "var(--color-sapphire)",
    swatch: "bg-sapphire",
    d: "M 160 30 A 130 130 0 0 1 290 160 L 160 160 Z",
    lx: 218,
    ly: 104,
    pct: "25%",
  },
  carbs: {
    fill: "var(--color-amber-care-soft)",
    stroke: "var(--color-amber-care)",
    swatch: "bg-amber-care",
    d: "M 290 160 A 130 130 0 0 1 160 290 L 160 160 Z",
    lx: 218,
    ly: 222,
    pct: "25%",
  },
};

const DEFAULT_SELECTION = ["v1", "v2", "p1", "c1"];
const PRESETS: { key: "presetTraditional" | "presetMediterranean" | "presetQuickLunch"; ids: string[] }[] = [
  { key: "presetTraditional", ids: ["p1", "c1", "v1", "v2"] },
  { key: "presetMediterranean", ids: ["p5", "c4", "v3", "v4"] },
  { key: "presetQuickLunch", ids: ["p2", "c2", "v1", "v2"] },
];

/** One decimal with the locale's decimal mark, formatted by hand so server and browser agree. */
function formatOneDecimal(value: number, lang: Lang): string {
  const text = value.toFixed(1);
  return lang === "en" ? text : text.replace(".", ",");
}

const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((id) => b.includes(id));

export function DiabetesPlateMethodModule({ lang: propLang }: DiabetesPlateMethodModuleProps) {
  const [activeSectionId, setActiveSectionId] = useState<PlateSectionId>("vegetables");
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>(DEFAULT_SELECTION);

  const activeLang = useSafeLanguage(propLang);
  const ui = UI_STRINGS[activeLang] || UI_STRINGS.ro;
  const sectionConfigs = SECTION_TRANSLATIONS[activeLang] || SECTION_TRANSLATIONS.ro;
  const foodLocales = FOOD_TRANSLATIONS[activeLang] || FOOD_TRANSLATIONS.ro;
  const oneDecimal = { format: (value: number) => formatOneDecimal(value, activeLang) };

  const activeSection = sectionConfigs[activeSectionId];

  const localizedFoods = useMemo(
    () => FOOD_DATABASE_BASE.map((f) => ({ ...f, name: foodLocales[f.id]?.name || f.id })),
    [foodLocales]
  );

  const toggleFoodItem = (id: string) => {
    setSelectedFoodIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const selectedFoods = localizedFoods.filter((f) => selectedFoodIds.includes(f.id));
  const totalFiber = selectedFoods.reduce((acc, curr) => acc + curr.fiberGrams, 0);
  const totalCalories = selectedFoods.reduce((acc, curr) => acc + curr.caloriesApprox, 0);
  const has = (cat: PlateSectionId) => selectedFoods.some((f) => f.category === cat);
  const isPlateComplete = has("vegetables") && has("protein") && has("carbs");

  return (
    <section
      aria-label={ui.moduleAriaLabel}
      className="space-y-8"
    >
      <header className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{ui.title}</h3>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">{ui.description}</p>
      </header>

      {/* Plate and the selected part */}
      <div className="grid grid-cols-1 items-start gap-6 border-t border-border pt-6 lg:grid-cols-[300px_1fr] lg:gap-10">
        <div className="space-y-4">
          <svg
            viewBox="0 0 320 320"
            className="mx-auto block h-auto w-full max-w-[280px] select-none"
            role="img"
            aria-label={ui.plateAriaLabel}
          >
            <circle cx="160" cy="160" r="152" fill="var(--color-card)" stroke="var(--color-border)" strokeWidth="2" />
            <circle cx="160" cy="160" r="140" fill="none" stroke="var(--color-border)" strokeWidth="1.5" />
            {SECTION_ORDER.map((id) => {
              const st = SECTION_STYLE[id];
              const isActive = id === activeSectionId;
              return (
                <g key={id} onClick={() => setActiveSectionId(id)} className="cursor-pointer">
                  <path
                    d={st.d}
                    fill={st.fill}
                    fillOpacity={isActive ? 1 : 0.55}
                    stroke={st.stroke}
                    strokeWidth={isActive ? 2 : 1.25}
                    strokeLinejoin="round"
                    style={{ transition: "fill-opacity var(--dur-base) var(--ease-out-calm)" }}
                  />
                  <text
                    x={st.lx}
                    y={st.ly - 4}
                    textAnchor="middle"
                    fontSize="20"
                    fontWeight="600"
                    fill="var(--color-foreground)"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {st.pct}
                  </text>
                  <text x={st.lx} y={st.ly + 16} textAnchor="middle" fontSize="13" fontWeight="500" fill="var(--color-foreground)">
                    {sectionConfigs[id].shortName}
                  </text>
                </g>
              );
            })}
          </svg>

          <div>
            <p className="text-xs text-muted-foreground">{ui.plateHint}</p>
            <div role="radiogroup" aria-label={ui.plateAriaLabel} className={`mt-2 ${ROW_LIST_SINGLE_CLASS}`}>
              {SECTION_ORDER.map((id) => {
                const isActive = id === activeSectionId;
                return (
                  <label key={id} className={`${ROW_CLASS} cursor-pointer`}>
                    <input
                      type="radio"
                      name="plate-section"
                      value={id}
                      checked={isActive}
                      onChange={() => setActiveSectionId(id)}
                      className="sr-only"
                    />
                    <span className={radioDotClass(isActive)} aria-hidden="true" />
                    <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground">
                      {sectionConfigs[id].title}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{SECTION_STYLE[id].pct}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div id="plate-section-detail" aria-live="polite" className="space-y-5">
          <div>
            <h4 className="text-lg font-semibold text-foreground">{activeSection.title}</h4>
            <p className="mt-0.5 text-sm font-medium text-muted-foreground">{activeSection.percentageLabel}</p>
          </div>

          <div className="grid grid-cols-1 gap-5 border-t border-border pt-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-1 lg:gap-5">
            <div>
              <h5 className="text-sm font-semibold text-foreground">{ui.handRuleHeading}</h5>
              <p className="mt-1 text-base font-semibold text-foreground">{activeSection.handRule}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{activeSection.handDetail}</p>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-foreground">{ui.clinicalPurposeHeading}</h5>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{activeSection.clinicalPurpose}</p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h5 className="text-sm font-semibold text-foreground">{ui.presetsTitle}</h5>
            <div role="radiogroup" aria-label={ui.presetsTitle} className={`mt-2 ${ROW_LIST_CLASS} sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-1`}>
              {PRESETS.map((p) => {
                const isSelected = sameSet(selectedFoodIds, p.ids);
                return (
                  <label key={p.key} className={`${ROW_CLASS} cursor-pointer`}>
                    <input
                      type="radio"
                      name="plate-preset"
                      value={p.key}
                      checked={isSelected}
                      onChange={() => setSelectedFoodIds(p.ids)}
                      className="sr-only"
                    />
                    <span className={radioDotClass(isSelected)} aria-hidden="true" />
                    <span className="text-sm font-semibold leading-snug text-foreground">{ui[p.key]}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Meal builder */}
      <div className="space-y-5 border-t border-border pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h4 className="text-base font-semibold text-foreground sm:text-lg">{ui.builderHeading}</h4>
            <p className="mt-0.5 max-w-prose text-sm text-muted-foreground">{ui.builderSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedFoodIds(DEFAULT_SELECTION)}
            className="min-h-[44px] shrink-0 self-start rounded-lg border border-border bg-card px-3.5 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          >
            {ui.resetButton}
          </button>
        </div>

        <div
          className="space-y-2 border-y border-border py-4"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <span
              className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
                isPlateComplete
                  ? "bg-live-sage-soft text-foreground border-live-sage/30"
                  : "bg-amber-care-soft text-amber-care-hover border-amber-care-border"
              }`}
            >
              {isPlateComplete ? ui.completeStatus : ui.incompleteStatus}
            </span>
            <span className="flex flex-wrap gap-x-4 gap-y-1 text-sm tabular-nums text-foreground">
              <span>
                {selectedFoods.length} {ui.foodsCountSuffix}
              </span>
              <span>
                <span className="text-muted-foreground">{ui.totalFiberPrefix}</span>{" "}
                <strong className="font-semibold">{oneDecimal.format(totalFiber)} {ui.fiberGramsSuffix}</strong>
              </span>
              <span>
                <span className="text-muted-foreground">{ui.approxCaloriesPrefix}</span>{" "}
                <strong className="font-semibold">{totalCalories} kcal</strong>
              </span>
            </span>
          </div>
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
            {isPlateComplete ? ui.completeMessage : ui.incompleteMessage}
          </p>
        </div>

        {/* Foods grouped by part of the plate */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {SECTION_ORDER.map((cat) => (
            <div key={cat}>
              <h5 className="text-sm font-semibold text-foreground">
                {sectionConfigs[cat].title}
              </h5>
              <ul className={`mt-2 ${ROW_LIST_SINGLE_CLASS}`}>
                {localizedFoods
                  .filter((food) => food.category === cat)
                  .map((food) => {
                    const isSelected = selectedFoodIds.includes(food.id);
                    return (
                      <li key={food.id}>
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => toggleFoodItem(food.id)}
                          className={`${ROW_CLASS} items-start`}
                        >
                          <span className={`mt-0.5 ${tickBoxClass(isSelected)}`} aria-hidden="true">
                            {isSelected && <CheckIcon className="h-3 w-3" />}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-medium leading-snug break-words text-foreground">{food.name}</span>
                            <span className="mt-0.5 block text-xs tabular-nums text-muted-foreground">
                              {food.caloriesApprox} kcal
                              {food.fiberGrams > 0 && ` · ${oneDecimal.format(food.fiberGrams)} ${ui.fiberShort}`}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
