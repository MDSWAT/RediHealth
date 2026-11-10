"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { LazyMotion, domAnimation, m, useInView, useReducedMotion } from "motion/react";
import { DURATION, EASE_IN_OUT, EASE_OUT } from "@/lib/motion/tokens";
import { LanguageContext } from "@/lib/i18n/language-context";
import {
  BACK_BUTTON_CLASS,
  NEXT_BUTTON_CLASS,
  ROW_CLASS,
  ROW_LIST_CLASS,
  STEP_LIST_CLASS,
  radioDotClass,
  stepCellClass,
  stepNumberClass,
} from "./choice-styles";
import type { Lang } from "@/lib/i18n/translations";

export interface InsulinMechanicsModuleProps {
  lang?: Lang;
}

export type InsulinMode = "healthy" | "type1" | "type2";

interface StepDescription {
  stepNumber: number;
  stepTitle: string;
  pancreasState: string;
  bloodState: string;
  receptorState: string;
  glut4State: string;
  clinicalSummary: string;
}

interface ModeDetail {
  modeName: string;
  badge: string;
  overview: string;
  steps: StepDescription[];
}

interface InsulinUiStrings {
  moduleAriaLabel: string;
  title: string;
  description: string;
  modeSelectorPrompt: string;
  modeSelectAria: string;
  stageLabel: string;
  ofFour: string;
  prevStep: string;
  playAuto: string;
  playAutoAria: string;
  pause: string;
  pauseAria: string;
  nextStep: string;
  stepIndicator: string;
  organBloodBehavior: string;
  cellularBehavior: string;
  clinicalConclusion: string;
  pancreasLabel: string;
  bloodFlowLabel: string;
  receptorLabel: string;
  glut4Label: string;
  capillaryFlow: string;
  pancreasBetaCells: string;
  membraneBarrier: string;
  cellInterior: string;
  insulinReceptor: string;
  glut4Open: string;
  glut4Closed: string;
  /** Use {mode}. */
  visualizerAria: string;
  insulinKeyLabel: string;
  glucoseLabel: string;
  legendTitle: string;
  mitochondria: string;
  energyProduction: string;
  type1AbsenceKeys: string;
  pancreasStatusHealthy: string;
  pancreasStatusType1: string;
  pancreasStatusType2: string;
  restingText: string;
}

const UI_STRINGS: Record<Lang, InsulinUiStrings> = {
  ro: {
    moduleAriaLabel: "Cum lucrează insulina",
    title: "Cum lucrează insulina",
    description: "Insulina e ca o cheie. Deschide ușa celulei, ca zahărul să intre și să dea energie. Vezi ce se întâmplă într-un corp sănătos, în diabetul de tip 1 și în diabetul de tip 2.",
    modeSelectorPrompt: "Alege ce vrei să vezi:",
    modeSelectAria: "Alege corpul sănătos sau tipul de diabet",
    stageLabel: "Pasul",
    ofFour: "din 4",
    prevStep: "Înapoi",
    playAuto: "Pornește",
    playAutoAria: "Pornește derularea pașilor",
    pause: "Oprește",
    pauseAria: "Oprește derularea pașilor",
    nextStep: "Înainte",
    stepIndicator: "Pasul",
    organBloodBehavior: "În pancreas și în sânge:",
    cellularBehavior: "La celulă:",
    clinicalConclusion: "Pe scurt",
    pancreasLabel: "Pancreasul:",
    bloodFlowLabel: "Sângele:",
    receptorLabel: "Încuietoarea (receptorul):",
    glut4Label: "Ușa celulei (GLUT4):",
    capillaryFlow: "Vas de sânge",
    pancreasBetaCells: "Pancreasul (celulele beta)",
    membraneBarrier: "Peretele celulei",
    cellInterior: "Interiorul celulei (mușchi sau ficat)",
    insulinReceptor: "Încuietoarea (receptor)",
    glut4Open: "Ușa GLUT4 deschisă",
    glut4Closed: "Ușa GLUT4 închisă",
    visualizerAria: "Desen: cum lucrează insulina, {mode}",
    insulinKeyLabel: "Insulina (cheia)",
    glucoseLabel: "Zahăr (glucoză)",
    legendTitle: "Ce vezi în desen",
    mitochondria: "Mitocondria (fabrica de energie)",
    energyProduction: "Face energie",
    type1AbsenceKeys: "Lipsește insulina: pancreasul nu face nicio cheie",
    pancreasStatusHealthy: "Face insulină normal",
    pancreasStatusType1: "Celulele beta sunt distruse",
    pancreasStatusType2: "Face mai multă insulină",
    restingText: "În repaus",
  },
  en: {
    moduleAriaLabel: "How insulin works",
    title: "How insulin works",
    description: "Insulin works like a key. It opens the door of the cell so sugar can get in and give energy. See what happens in a healthy body, in type 1 diabetes and in type 2 diabetes.",
    modeSelectorPrompt: "Choose what you want to see:",
    modeSelectAria: "Choose a healthy body or a type of diabetes",
    stageLabel: "Step",
    ofFour: "of 4",
    prevStep: "Back",
    playAuto: "Play",
    playAutoAria: "Play the steps",
    pause: "Pause",
    pauseAria: "Pause the steps",
    nextStep: "Next",
    stepIndicator: "Step",
    organBloodBehavior: "In the pancreas and the blood:",
    cellularBehavior: "At the cell:",
    clinicalConclusion: "In short",
    pancreasLabel: "Pancreas:",
    bloodFlowLabel: "Blood:",
    receptorLabel: "Lock (receptor):",
    glut4Label: "Cell door (GLUT4):",
    capillaryFlow: "Blood vessel",
    pancreasBetaCells: "Pancreas (beta cells)",
    membraneBarrier: "Cell wall",
    cellInterior: "Inside the cell (muscle or liver)",
    insulinReceptor: "Lock (receptor)",
    glut4Open: "GLUT4 door open",
    glut4Closed: "GLUT4 door closed",
    visualizerAria: "Drawing of how insulin works: {mode}",
    insulinKeyLabel: "Insulin (the key)",
    glucoseLabel: "Sugar (glucose)",
    legendTitle: "What the drawing shows",
    mitochondria: "Mitochondria (energy factory)",
    energyProduction: "Making energy",
    type1AbsenceKeys: "Insulin missing: the pancreas makes no keys",
    pancreasStatusHealthy: "Makes insulin normally",
    pancreasStatusType1: "Beta cells are destroyed",
    pancreasStatusType2: "Makes extra insulin",
    restingText: "Resting",
  },
  sq: {
    moduleAriaLabel: "Si punon insulina",
    title: "Si punon insulina",
    description: "Insulina është si një çelës. Hap derën e qelizës, që sheqeri të hyjë dhe të japë energji. Shiko çfarë ndodh në një trup të shëndetshëm, te diabeti tip 1 dhe te diabeti tip 2.",
    modeSelectorPrompt: "Zgjidh çfarë do të shohësh:",
    modeSelectAria: "Zgjidh trupin e shëndetshëm ose një lloj diabeti",
    stageLabel: "Hapi",
    ofFour: "nga 4",
    prevStep: "Mbrapa",
    playAuto: "Nis",
    playAutoAria: "Nis hapat",
    pause: "Ndalo",
    pauseAria: "Ndalo hapat",
    nextStep: "Përpara",
    stepIndicator: "Hapi",
    organBloodBehavior: "Në pankreas dhe në gjak:",
    cellularBehavior: "Te qeliza:",
    clinicalConclusion: "Shkurt",
    pancreasLabel: "Pankreasi:",
    bloodFlowLabel: "Gjaku:",
    receptorLabel: "Brava (receptori):",
    glut4Label: "Dera e qelizës (GLUT4):",
    capillaryFlow: "Enë gjaku",
    pancreasBetaCells: "Pankreasi (qelizat beta)",
    membraneBarrier: "Muri i qelizës",
    cellInterior: "Brenda qelizës (muskul ose mëlçi)",
    insulinReceptor: "Brava (receptori)",
    glut4Open: "Dera GLUT4 e hapur",
    glut4Closed: "Dera GLUT4 e mbyllur",
    visualizerAria: "Vizatim: si punon insulina, {mode}",
    insulinKeyLabel: "Insulina (çelësi)",
    glucoseLabel: "Sheqeri (glukoza)",
    legendTitle: "Çfarë tregon vizatimi",
    mitochondria: "Mitokondria (fabrika e energjisë)",
    energyProduction: "Prodhon energji",
    type1AbsenceKeys: "Mungon insulina: pankreasi nuk bën asnjë çelës",
    pancreasStatusHealthy: "Prodhon insulinë normalisht",
    pancreasStatusType1: "Qelizat beta janë shkatërruar",
    pancreasStatusType2: "Prodhon më shumë insulinë",
    restingText: "Në pushim",
  },
  it: {
    moduleAriaLabel: "Come funziona l'insulina",
    title: "Come funziona l'insulina",
    description: "L'insulina è come una chiave. Apre la porta della cellula, così lo zucchero entra e dà energia. Guarda cosa succede in un corpo sano, nel diabete di tipo 1 e nel diabete di tipo 2.",
    modeSelectorPrompt: "Scegli cosa vuoi vedere:",
    modeSelectAria: "Scegli il corpo sano o un tipo di diabete",
    stageLabel: "Passo",
    ofFour: "di 4",
    prevStep: "Indietro",
    playAuto: "Avvia",
    playAutoAria: "Avvia i passi",
    pause: "Pausa",
    pauseAria: "Metti in pausa i passi",
    nextStep: "Avanti",
    stepIndicator: "Passo",
    organBloodBehavior: "Nel pancreas e nel sangue:",
    cellularBehavior: "Nella cellula:",
    clinicalConclusion: "In breve",
    pancreasLabel: "Pancreas:",
    bloodFlowLabel: "Sangue:",
    receptorLabel: "Serratura (recettore):",
    glut4Label: "Porta della cellula (GLUT4):",
    capillaryFlow: "Vaso sanguigno",
    pancreasBetaCells: "Pancreas (cellule beta)",
    membraneBarrier: "Parete della cellula",
    cellInterior: "Dentro la cellula (muscolo o fegato)",
    insulinReceptor: "Serratura (recettore)",
    glut4Open: "Porta GLUT4 aperta",
    glut4Closed: "Porta GLUT4 chiusa",
    visualizerAria: "Disegno di come funziona l'insulina: {mode}",
    insulinKeyLabel: "Insulina (la chiave)",
    glucoseLabel: "Zucchero (glucosio)",
    legendTitle: "Cosa mostra il disegno",
    mitochondria: "Mitocondrio (fabbrica di energia)",
    energyProduction: "Produce energia",
    type1AbsenceKeys: "Manca l'insulina: il pancreas non fa nessuna chiave",
    pancreasStatusHealthy: "Produce insulina normalmente",
    pancreasStatusType1: "Le cellule beta sono distrutte",
    pancreasStatusType2: "Produce più insulina",
    restingText: "A riposo",
  },
  hr: {
    moduleAriaLabel: "Kako djeluje inzulin",
    title: "Kako djeluje inzulin",
    description: "Inzulin djeluje poput ključa. Otvara vrata stanice kako bi glukoza ušla i stvorila energiju. Pogledaj što se događa u zdravom tijelu, kod dijabetesa tipa 1 i kod dijabetesa tipa 2.",
    modeSelectorPrompt: "Odaberi što želiš prikazati:",
    modeSelectAria: "Odaberi zdravo tijelo ili vrstu šećerne bolesti",
    stageLabel: "Korak",
    ofFour: "od 4",
    prevStep: "Natrag",
    playAuto: "Pokreni",
    playAutoAria: "Pokreni prikaz koraka",
    pause: "Pauza",
    pauseAria: "Zaustavi prikaz koraka",
    nextStep: "Dalje",
    stepIndicator: "Korak",
    organBloodBehavior: "U gušterači i krvotoku:",
    cellularBehavior: "Na razini stanice:",
    clinicalConclusion: "Ukratko",
    pancreasLabel: "Gušterača (pankreas):",
    bloodFlowLabel: "Krv:",
    receptorLabel: "Brava (receptor):",
    glut4Label: "Vrata stanice (GLUT4):",
    capillaryFlow: "Krvna žila",
    pancreasBetaCells: "Gušterača (beta-stanice)",
    membraneBarrier: "Stanična stijenka",
    cellInterior: "Unutrašnjost stanice (mišić ili jetra)",
    insulinReceptor: "Brava (receptor)",
    glut4Open: "GLUT4 vrata otvorena",
    glut4Closed: "GLUT4 vrata zatvorena",
    visualizerAria: "Prikaz djelovanja inzulina: {mode}",
    insulinKeyLabel: "Inzulin (ključ)",
    glucoseLabel: "Šećer (glukoza)",
    legendTitle: "Što prikazuje crtež",
    mitochondria: "Mitohondrij (tvornica energije)",
    energyProduction: "Stvara energiju",
    type1AbsenceKeys: "Nedostaje inzulin: gušterača ne stvara ključeve",
    pancreasStatusHealthy: "Uredno stvara inzulin",
    pancreasStatusType1: "Beta-stanice su uništene",
    pancreasStatusType2: "Stvara pojačano inzulin",
    restingText: "U mirovanju",
  },
  rom: {
    moduleAriaLabel: "Sar kerel buchi i insulina",
    title: "Sar kerel buchi i insulina",
    description: "I insulina si sar ekh klidi. Phuterel o vudar la tselulako te zhal andre o zaharo thaj te del zor. Dikh so kerel pe and-ekh sasto trupo, ko gudlo rat tip 1 thaj ko gudlo rat tip 2.",
    modeSelectorPrompt: "Alosar so kames te dikhes:",
    modeSelectAria: "Alosar sasto trupo vay tip katar o gudlo rat",
    stageLabel: "Paso",
    ofFour: "katar 4",
    prevStep: "Palpale",
    playAuto: "Astar",
    playAutoAria: "Astar le pasurya",
    pause: "Pauza",
    pauseAria: "Auka le pasurya",
    nextStep: "Anglal",
    stepIndicator: "Paso",
    organBloodBehavior: "And-o pankreaso thaj and-o rat:",
    cellularBehavior: "Ki tselula:",
    clinicalConclusion: "Skurto",
    pancreasLabel: "Pankreaso:",
    bloodFlowLabel: "O rat:",
    receptorLabel: "Brava (retseptoro):",
    glut4Label: "Vudar la tselulako (GLUT4):",
    capillaryFlow: "Rateski vena",
    pancreasBetaCells: "Pankreaso (beta tselule)",
    membraneBarrier: "Zido la tselulako",
    cellInterior: "Andral i tselula (muskulo vay buko)",
    insulinReceptor: "Brava (retseptoro)",
    glut4Open: "GLUT4 vudar phuterdo",
    glut4Closed: "GLUT4 vudar phandado",
    visualizerAria: "Chitro sar kerel buchi i insulina: {mode}",
    insulinKeyLabel: "Insulina (o klidi)",
    glucoseLabel: "Zaharo (glukoza)",
    legendTitle: "So sikavel o chitro",
    mitochondria: "Mitokondriya (fabrika vash i zor)",
    energyProduction: "Kerel zor",
    type1AbsenceKeys: "Naj insulina: o pankreaso na kerel klidya",
    pancreasStatusHealthy: "Kerel insulina normalno",
    pancreasStatusType1: "Le beta tselule si phagarde",
    pancreasStatusType2: "Kerel may but insulina",
    restingText: "Hodinisarel",
  },
};

const MODE_TRANSLATIONS: Record<Lang, Record<InsulinMode, ModeDetail>> = {
  ro: {
    healthy: {
      modeName: "Corp sănătos",
      badge: "Totul merge bine",
      overview:
        "Într-un corp sănătos, pancreasul face exact câtă insulină trebuie. Cheia deschide ușa celulei și zahărul intră pentru energie.",
      steps: [
        {
          stepNumber: 1,
          stepTitle: "Pancreasul face insulina",
          pancreasState: "Celulele beta simt că urcă zahărul și fac insulină, adică cheia.",
          bloodState: "Zahărul e normal și insulina iese la timp.",
          receptorState: "Încuietorile de pe celulă așteaptă cheia.",
          glut4State: "Ușile GLUT4 stau pregătite în interiorul celulei.",
          clinicalSummary:
            "Pancreasul măsoară foarte bine. Dă atâta insulină cât zahăr trebuie mutat.",
        },
        {
          stepNumber: 2,
          stepTitle: "Insulina merge prin sânge",
          pancreasState: "Insulina intră direct în vasele mici de sânge.",
          bloodState: "Insulina și zahărul merg împreună prin sânge spre mușchi și ficat.",
          receptorState: "Încuietorile de pe celule sunt gata să primească cheia.",
          glut4State: "Ușile se pregătesc să urce spre peretele celulei.",
          clinicalSummary:
            "Sângele duce insulina la toate părțile corpului care au nevoie de energie.",
        },
        {
          stepNumber: 3,
          stepTitle: "Cheia intră în încuietoare",
          pancreasState: "Pancreasul face mai puțină insulină pe măsură ce zahărul scade.",
          bloodState: "Insulina ajunge la peretele celulei.",
          receptorState: "Cheia se potrivește exact în încuietoare (receptor).",
          glut4State: "Celula primește semnalul să deschidă ușile.",
          clinicalSummary:
            "Când cheia intră, celula primește imediat semnalul.",
        },
        {
          stepNumber: 4,
          stepTitle: "Ușa se deschide, zahărul intră",
          pancreasState: "Pancreasul revine la ritmul obișnuit.",
          bloodState: "Zahărul din sânge coboară încet la normal (70–99 mg/dL).",
          receptorState: "Încuietoarea își termină treaba și dă drumul cheii.",
          glut4State: "Ușile GLUT4 se deschid larg. Zahărul intră în celulă și dă energie.",
          clinicalSummary:
            "Celula primește energie, iar vasele de sânge sunt ferite de zahărul prea mare.",
        },
      ],
    },
    type1: {
      modeName: "Diabet de tip 1",
      badge: "Nu se face insulină",
      overview:
        "În diabetul de tip 1, corpul își atacă singur celulele beta din pancreas. Nu se mai face insulină. Fără cheie, zahărul rămâne în sânge.",
      steps: [
        {
          stepNumber: 1,
          stepTitle: "Celulele beta sunt distruse",
          pancreasState: "Apărarea corpului a distrus celulele beta. Nu se mai face deloc insulină.",
          bloodState: "Zahărul din mâncare se strânge repede în sânge.",
          receptorState: "Încuietorile de pe celule sunt întregi și funcționează.",
          glut4State: "Fără semnal, ușile GLUT4 rămân în interiorul celulei.",
          clinicalSummary:
            "Fără celule beta, corpul nu are chei ca să folosească zahărul.",
        },
        {
          stepNumber: 2,
          stepTitle: "Sângele e plin de zahăr",
          pancreasState: "Pancreasul nu dă deloc insulină.",
          bloodState: "Sângele e plin de zahăr, dar nu are chei.",
          receptorState: "Încuietorile stau nefolosite.",
          glut4State: "Ușile celulei nu primesc semnalul să se deschidă.",
          clinicalSummary:
            "Zahărul din sânge crește periculos. Apar sete mare, urinat des și deshidratare.",
        },
        {
          stepNumber: 3,
          stepTitle: "Încuietoarea rămâne goală",
          pancreasState: "Pancreasul nu poate răspunde la zahărul mare.",
          bloodState: "Zahărul rămâne în sânge și trage apa din corp.",
          receptorState: "Încuietoarea e goală. Nu există nicio cheie.",
          glut4State: "Fără semnal, ușile rămân bine închise.",
          clinicalSummary:
            "Încuietoarea e bună, dar fără cheie ușa nu se poate deschide.",
        },
        {
          stepNumber: 4,
          stepTitle: "Celula flămânzește, sângele are prea mult zahăr",
          pancreasState: "Insulina lipsește în continuare.",
          bloodState: "Zahărul e foarte mare. Fără tratament, apare riscul de cetoacidoză.",
          receptorState: "Încuietoarea rămâne nefolosită.",
          glut4State: "Ușile GLUT4 rămân închise. Zahărul nu poate intra în celulă.",
          clinicalSummary:
            "Sângele e plin de energie, dar celula flămânzește. De aceea, omul cu diabet de tip 1 are nevoie de insulină în fiecare zi.",
        },
      ],
    },
    type2: {
      modeName: "Diabet de tip 2",
      badge: "Celulele nu mai ascultă de insulină",
      overview:
        "În diabetul de tip 2, pancreasul face insulină, dar celulele nu mai răspund bine la ea. Încuietorile merg greu, adesea din cauza grăsimii de pe burtă, iar ușile se deschid puțin.",
      steps: [
        {
          stepNumber: 1,
          stepTitle: "Pancreasul muncește prea mult",
          pancreasState: "Celulele beta fac multă insulină, ca să învingă rezistența.",
          bloodState: "În sânge sunt și mult zahăr, și multă insulină.",
          receptorState: "Încuietorile răspund tot mai slab.",
          glut4State: "Ușile GLUT4 nu primesc un semnal clar.",
          clinicalSummary:
            "La început, pancreasul face de 2 sau 3 ori mai multă insulină ca să țină pasul.",
        },
        {
          stepNumber: 2,
          stepTitle: "Cheile ajung la celule care nu răspund",
          pancreasState: "Pancreasul lucrează la maximum.",
          bloodState: "Sângele e plin de zahăr și de insulină.",
          receptorState: "Încuietoarea e schimbată sau acoperită de grăsimea din mușchi.",
          glut4State: "Cele mai multe uși GLUT4 rămân în interiorul celulei.",
          clinicalSummary:
            "Corpul face cheile, dar celulele nu le recunosc bine.",
        },
        {
          stepNumber: 3,
          stepTitle: "Cheia nu mai deschide bine",
          pancreasState: "Cu timpul, celulele beta obosesc și cedează.",
          bloodState: "Zahărul din sânge crește, pentru că nu intră destul în celule.",
          receptorState: "Cheia intră, dar semnalul nu trece cum trebuie.",
          glut4State: "Semnalul e slab, iar ușile se deschid greu.",
          clinicalSummary:
            "Problema nu e lipsa insulinei. Problema e că celula nu mai răspunde la ea.",
        },
        {
          stepNumber: 4,
          stepTitle: "Zahărul rămâne în sânge",
          pancreasState: "Fără schimbări în viața de zi cu zi, pancreasul se poate epuiza.",
          bloodState: "Zahărul din sânge rămâne mare tot timpul.",
          receptorState: "Încuietorile pot răspunde din nou mai bine dacă faci mișcare și slăbești.",
          glut4State: "Se deschid doar puține uși, iar zahărul intră greu.",
          clinicalSummary:
            "Tratamentul ajută celulele să răspundă iar la insulină: slăbit, mișcare și medicamente, de exemplu metformin.",
        },
      ],
    },
  },
  en: {
    healthy: {
      modeName: "Healthy body",
      badge: "Everything works",
      overview:
        "In a healthy body, the pancreas makes just the right amount of insulin. The key opens the cell door and sugar goes in for energy.",
      steps: [
        {
          stepNumber: 1,
          stepTitle: "The pancreas makes insulin",
          pancreasState: "Beta cells notice sugar rising and make insulin, the key.",
          bloodState: "Sugar is normal and insulin comes out on time.",
          receptorState: "The locks on the cell wait for the key.",
          glut4State: "The GLUT4 doors wait, ready, inside the cell.",
          clinicalSummary:
            "The pancreas measures very well. It sends as much insulin as there is sugar to move.",
        },
        {
          stepNumber: 2,
          stepTitle: "Insulin travels in the blood",
          pancreasState: "Insulin goes straight into the small blood vessels.",
          bloodState: "Insulin and sugar travel together in the blood to the muscles and liver.",
          receptorState: "The locks on the cells are ready for the key.",
          glut4State: "The doors get ready to move up to the cell wall.",
          clinicalSummary:
            "The blood carries insulin to every part of the body that needs energy.",
        },
        {
          stepNumber: 3,
          stepTitle: "The key goes into the lock",
          pancreasState: "The pancreas makes less insulin as sugar starts to fall.",
          bloodState: "Insulin reaches the cell wall.",
          receptorState: "The key fits the lock (receptor) exactly.",
          glut4State: "The cell gets the signal to open its doors.",
          clinicalSummary:
            "When the key goes in, the cell gets the signal straight away.",
        },
        {
          stepNumber: 4,
          stepTitle: "The door opens, sugar goes in",
          pancreasState: "The pancreas goes back to its normal pace.",
          bloodState: "Blood sugar slowly comes down to normal (70–99 mg/dL).",
          receptorState: "The lock finishes its job and lets go of the key.",
          glut4State: "The GLUT4 doors open wide. Sugar enters the cell and gives energy.",
          clinicalSummary:
            "The cell gets energy, and the blood vessels are protected from too much sugar.",
        },
      ],
    },
    type1: {
      modeName: "Type 1 diabetes",
      badge: "No insulin is made",
      overview:
        "In type 1 diabetes, the body attacks its own beta cells in the pancreas. No more insulin is made. Without the key, sugar stays in the blood.",
      steps: [
        {
          stepNumber: 1,
          stepTitle: "Beta cells are destroyed",
          pancreasState: "The body's defence system has destroyed the beta cells. No insulin is made at all.",
          bloodState: "Sugar from food builds up fast in the blood.",
          receptorState: "The locks on the cells are whole and work fine.",
          glut4State: "Without a signal, the GLUT4 doors stay inside the cell.",
          clinicalSummary:
            "Without beta cells, the body has no keys to use sugar.",
        },
        {
          stepNumber: 2,
          stepTitle: "The blood is full of sugar",
          pancreasState: "The pancreas releases no insulin.",
          bloodState: "The blood is full of sugar but has no keys.",
          receptorState: "The locks sit unused.",
          glut4State: "The cell doors never get the signal to open.",
          clinicalSummary:
            "Blood sugar rises dangerously. You get very thirsty, pee often and lose water.",
        },
        {
          stepNumber: 3,
          stepTitle: "The lock stays empty",
          pancreasState: "The pancreas cannot respond to high sugar.",
          bloodState: "Sugar stays in the blood and pulls water out of the body.",
          receptorState: "The lock is empty. There is no key.",
          glut4State: "With no signal, the doors stay shut tight.",
          clinicalSummary:
            "The lock works, but without a key the door cannot open.",
        },
        {
          stepNumber: 4,
          stepTitle: "The cell starves, the blood has too much sugar",
          pancreasState: "Insulin is still missing.",
          bloodState: "Sugar is very high. Without treatment, there is a risk of ketoacidosis.",
          receptorState: "The lock stays unused.",
          glut4State: "The GLUT4 doors stay shut. Sugar cannot get into the cell.",
          clinicalSummary:
            "The blood is full of energy, but the cell starves. This is why people with type 1 diabetes need insulin every day.",
        },
      ],
    },
    type2: {
      modeName: "Type 2 diabetes",
      badge: "Cells stop listening to insulin",
      overview:
        "In type 2 diabetes, the pancreas makes insulin, but the cells do not respond well. The locks work badly, often because of belly fat, and the doors open only a little.",
      steps: [
        {
          stepNumber: 1,
          stepTitle: "The pancreas works too hard",
          pancreasState: "Beta cells make lots of insulin to push past the resistance.",
          bloodState: "The blood has a lot of sugar and a lot of insulin.",
          receptorState: "The locks respond more and more weakly.",
          glut4State: "The GLUT4 doors do not get a clear signal.",
          clinicalSummary:
            "At first, the pancreas makes 2 or 3 times more insulin to keep up.",
        },
        {
          stepNumber: 2,
          stepTitle: "The keys reach cells that do not respond",
          pancreasState: "The pancreas works at full stretch.",
          bloodState: "The blood is full of sugar and insulin.",
          receptorState: "The lock is changed or covered by fat inside the muscle.",
          glut4State: "Most GLUT4 doors stay inside the cell.",
          clinicalSummary:
            "The body makes the keys, but the cells do not recognise them well.",
        },
        {
          stepNumber: 3,
          stepTitle: "The key no longer opens well",
          pancreasState: "Over time, the beta cells get tired and start to fail.",
          bloodState: "Blood sugar rises because not enough gets into the cells.",
          receptorState: "The key goes in, but the signal does not get through properly.",
          glut4State: "The signal is weak, and the doors open slowly.",
          clinicalSummary:
            "The problem is not a lack of insulin. The problem is that the cell no longer responds to it.",
        },
        {
          stepNumber: 4,
          stepTitle: "Sugar stays in the blood",
          pancreasState: "Without changes in daily life, the pancreas can wear out.",
          bloodState: "Blood sugar stays high all the time.",
          receptorState: "The locks can respond better again if you move more and lose weight.",
          glut4State: "Only a few doors open, and sugar gets in slowly.",
          clinicalSummary:
            "Treatment helps the cells respond to insulin again: weight loss, exercise and medicine such as metformin.",
        },
      ],
    },
  },
  sq: {
    healthy: {
      modeName: "Trup i shëndetshëm",
      badge: "Gjithçka punon mirë",
      overview:
        "Në një trup të shëndetshëm, pankreasi bën aq insulinë sa duhet. Çelësi hap derën e qelizës dhe sheqeri hyn për energji.",
      steps: [
        {
          stepNumber: 1,
          stepTitle: "Pankreasi bën insulinën",
          pancreasState: "Qelizat beta ndiejnë që sheqeri rritet dhe bëjnë insulinë, pra çelësin.",
          bloodState: "Sheqeri është normal dhe insulina del në kohë.",
          receptorState: "Bravat e qelizës presin çelësin.",
          glut4State: "Dyert GLUT4 presin gati brenda qelizës.",
          clinicalSummary:
            "Pankreasi mat shumë mirë. Jep aq insulinë sa sheqer duhet lëvizur.",
        },
        {
          stepNumber: 2,
          stepTitle: "Insulina udhëton në gjak",
          pancreasState: "Insulina hyn drejt në enët e vogla të gjakut.",
          bloodState: "Insulina dhe sheqeri udhëtojnë bashkë në gjak drejt muskujve dhe mëlçisë.",
          receptorState: "Bravat e qelizave janë gati për çelësin.",
          glut4State: "Dyert përgatiten të ngjiten te muri i qelizës.",
          clinicalSummary:
            "Gjaku e çon insulinën në çdo pjesë të trupit që ka nevojë për energji.",
        },
        {
          stepNumber: 3,
          stepTitle: "Çelësi hyn në bravë",
          pancreasState: "Pankreasi bën më pak insulinë kur sheqeri fillon të bjerë.",
          bloodState: "Insulina arrin te muri i qelizës.",
          receptorState: "Çelësi përshtatet saktë në bravë (receptor).",
          glut4State: "Qeliza merr sinjalin për të hapur dyert.",
          clinicalSummary:
            "Kur çelësi hyn, qeliza e merr sinjalin menjëherë.",
        },
        {
          stepNumber: 4,
          stepTitle: "Dera hapet, sheqeri hyn",
          pancreasState: "Pankreasi kthehet në ritmin e zakonshëm.",
          bloodState: "Sheqeri në gjak ulet ngadalë te normalja (70–99 mg/dL).",
          receptorState: "Brava e mbaron punën dhe e lëshon çelësin.",
          glut4State: "Dyert GLUT4 hapen plotësisht. Sheqeri hyn në qelizë dhe jep energji.",
          clinicalSummary:
            "Qeliza merr energji dhe enët e gjakut mbrohen nga sheqeri i tepërt.",
        },
      ],
    },
    type1: {
      modeName: "Diabeti tip 1",
      badge: "Nuk bëhet insulinë",
      overview:
        "Te diabeti tip 1, trupi sulmon vetë qelizat beta të pankreasit. Nuk bëhet më insulinë. Pa çelës, sheqeri mbetet në gjak.",
      steps: [
        {
          stepNumber: 1,
          stepTitle: "Qelizat beta shkatërrohen",
          pancreasState: "Mbrojtja e trupit i ka shkatërruar qelizat beta. Nuk bëhet fare insulinë.",
          bloodState: "Sheqeri nga ushqimi mblidhet shpejt në gjak.",
          receptorState: "Bravat e qelizave janë të plota dhe punojnë.",
          glut4State: "Pa sinjal, dyert GLUT4 mbeten brenda qelizës.",
          clinicalSummary:
            "Pa qeliza beta, trupi nuk ka çelësa për ta përdorur sheqerin.",
        },
        {
          stepNumber: 2,
          stepTitle: "Gjaku është plot sheqer",
          pancreasState: "Pankreasi nuk lëshon fare insulinë.",
          bloodState: "Gjaku është plot sheqer, por nuk ka çelësa.",
          receptorState: "Bravat mbeten të papërdorura.",
          glut4State: "Dyert e qelizës nuk e marrin sinjalin për t'u hapur.",
          clinicalSummary:
            "Sheqeri në gjak rritet rrezikshëm. Ke shumë etje, urinon shpesh dhe humbet ujë.",
        },
        {
          stepNumber: 3,
          stepTitle: "Brava mbetet bosh",
          pancreasState: "Pankreasi nuk mund t'i përgjigjet sheqerit të lartë.",
          bloodState: "Sheqeri mbetet në gjak dhe tërheq ujin nga trupi.",
          receptorState: "Brava është bosh. Nuk ka asnjë çelës.",
          glut4State: "Pa sinjal, dyert mbeten të mbyllura fort.",
          clinicalSummary:
            "Brava punon, por pa çelës dera nuk hapet.",
        },
        {
          stepNumber: 4,
          stepTitle: "Qeliza vuan nga uria, gjaku ka shumë sheqer",
          pancreasState: "Insulina vazhdon të mungojë.",
          bloodState: "Sheqeri është shumë i lartë. Pa trajtim, ka rrezik ketoacidoze.",
          receptorState: "Brava mbetet e papërdorur.",
          glut4State: "Dyert GLUT4 mbeten të mbyllura. Sheqeri nuk hyn dot në qelizë.",
          clinicalSummary:
            "Gjaku është plot energji, por qeliza vuan nga uria. Prandaj njerëzit me diabet tip 1 kanë nevojë për insulinë çdo ditë.",
        },
      ],
    },
    type2: {
      modeName: "Diabeti tip 2",
      badge: "Qelizat nuk i binden më insulinës",
      overview:
        "Te diabeti tip 2, pankreasi bën insulinë, por qelizat nuk reagojnë mirë. Bravat punojnë keq, shpesh për shkak të yndyrës në bark, dhe dyert hapen pak.",
      steps: [
        {
          stepNumber: 1,
          stepTitle: "Pankreasi punon tepër",
          pancreasState: "Qelizat beta bëjnë shumë insulinë për ta kapërcyer rezistencën.",
          bloodState: "Në gjak ka shumë sheqer dhe shumë insulinë.",
          receptorState: "Bravat reagojnë gjithnjë e më dobët.",
          glut4State: "Dyert GLUT4 nuk marrin sinjal të qartë.",
          clinicalSummary:
            "Në fillim, pankreasi bën 2 ose 3 herë më shumë insulinë që t'ia dalë.",
        },
        {
          stepNumber: 2,
          stepTitle: "Çelësat arrijnë te qelizat që nuk reagojnë",
          pancreasState: "Pankreasi punon me të gjitha forcat.",
          bloodState: "Gjaku është plot sheqer dhe insulinë.",
          receptorState: "Brava është ndryshuar ose e mbuluar nga yndyra brenda muskulit.",
          glut4State: "Shumica e dyerve GLUT4 mbeten brenda qelizës.",
          clinicalSummary:
            "Trupi i bën çelësat, por qelizat nuk i njohin mirë.",
        },
        {
          stepNumber: 3,
          stepTitle: "Çelësi nuk hap më si duhet",
          pancreasState: "Me kohën, qelizat beta lodhen dhe dobësohen.",
          bloodState: "Sheqeri në gjak rritet, sepse nuk hyn mjaftueshëm në qeliza.",
          receptorState: "Çelësi hyn, por sinjali nuk kalon si duhet.",
          glut4State: "Sinjali është i dobët dhe dyert hapen me vështirësi.",
          clinicalSummary:
            "Problemi nuk është mungesa e insulinës. Problemi është se qeliza nuk i përgjigjet më.",
        },
        {
          stepNumber: 4,
          stepTitle: "Sheqeri mbetet në gjak",
          pancreasState: "Pa ndryshime në jetën e përditshme, pankreasi mund të shterojë.",
          bloodState: "Sheqeri në gjak mbetet i lartë gjatë gjithë kohës.",
          receptorState: "Bravat mund të reagojnë sërish më mirë nëse lëviz më shumë dhe bie në peshë.",
          glut4State: "Hapen vetëm pak dyer dhe sheqeri hyn me vështirësi.",
          clinicalSummary:
            "Trajtimi i ndihmon qelizat t'i përgjigjen sërish insulinës: rënie në peshë, lëvizje dhe ilaçe si metformina.",
        },
      ],
    },
  },
  it: {
    healthy: {
      modeName: "Corpo sano",
      badge: "Tutto funziona",
      overview:
        "In un corpo sano, il pancreas fa la giusta quantità di insulina. La chiave apre la porta della cellula e lo zucchero entra per dare energia.",
      steps: [
        {
          stepNumber: 1,
          stepTitle: "Il pancreas fa l'insulina",
          pancreasState: "Le cellule beta sentono che lo zucchero sale e fanno insulina, cioè la chiave.",
          bloodState: "Lo zucchero è normale e l'insulina esce al momento giusto.",
          receptorState: "Le serrature della cellula aspettano la chiave.",
          glut4State: "Le porte GLUT4 aspettano pronte dentro la cellula.",
          clinicalSummary:
            "Il pancreas misura molto bene. Manda tanta insulina quanto zucchero c'è da spostare.",
        },
        {
          stepNumber: 2,
          stepTitle: "L'insulina viaggia nel sangue",
          pancreasState: "L'insulina entra subito nei piccoli vasi sanguigni.",
          bloodState: "Insulina e zucchero viaggiano insieme nel sangue verso muscoli e fegato.",
          receptorState: "Le serrature delle cellule sono pronte per la chiave.",
          glut4State: "Le porte si preparano a salire verso la parete della cellula.",
          clinicalSummary:
            "Il sangue porta l'insulina a tutte le parti del corpo che hanno bisogno di energia.",
        },
        {
          stepNumber: 3,
          stepTitle: "La chiave entra nella serratura",
          pancreasState: "Il pancreas fa meno insulina mentre lo zucchero inizia a scendere.",
          bloodState: "L'insulina arriva alla parete della cellula.",
          receptorState: "La chiave entra perfettamente nella serratura (recettore).",
          glut4State: "La cellula riceve il segnale di aprire le porte.",
          clinicalSummary:
            "Quando la chiave entra, la cellula riceve subito il segnale.",
        },
        {
          stepNumber: 4,
          stepTitle: "La porta si apre, lo zucchero entra",
          pancreasState: "Il pancreas torna al ritmo normale.",
          bloodState: "La glicemia scende piano fino al normale (70–99 mg/dL).",
          receptorState: "La serratura finisce il suo lavoro e lascia la chiave.",
          glut4State: "Le porte GLUT4 si aprono del tutto. Lo zucchero entra nella cellula e dà energia.",
          clinicalSummary:
            "La cellula riceve energia e i vasi sanguigni sono protetti dallo zucchero in eccesso.",
        },
      ],
    },
    type1: {
      modeName: "Diabete di tipo 1",
      badge: "Non si produce insulina",
      overview:
        "Nel diabete di tipo 1, il corpo attacca da solo le cellule beta del pancreas. L'insulina non viene più prodotta. Senza chiave, lo zucchero resta nel sangue.",
      steps: [
        {
          stepNumber: 1,
          stepTitle: "Le cellule beta vengono distrutte",
          pancreasState: "Le difese del corpo hanno distrutto le cellule beta. Non si fa più insulina.",
          bloodState: "Lo zucchero del cibo si accumula in fretta nel sangue.",
          receptorState: "Le serrature delle cellule sono intatte e funzionano.",
          glut4State: "Senza segnale, le porte GLUT4 restano dentro la cellula.",
          clinicalSummary:
            "Senza cellule beta, il corpo non ha chiavi per usare lo zucchero.",
        },
        {
          stepNumber: 2,
          stepTitle: "Il sangue è pieno di zucchero",
          pancreasState: "Il pancreas non rilascia insulina.",
          bloodState: "Il sangue è pieno di zucchero, ma non ci sono chiavi.",
          receptorState: "Le serrature restano inutilizzate.",
          glut4State: "Le porte della cellula non ricevono il segnale di aprirsi.",
          clinicalSummary:
            "La glicemia sale in modo pericoloso. Hai molta sete, urini spesso e perdi liquidi.",
        },
        {
          stepNumber: 3,
          stepTitle: "La serratura resta vuota",
          pancreasState: "Il pancreas non riesce a rispondere allo zucchero alto.",
          bloodState: "Lo zucchero resta nel sangue e richiama acqua dal corpo.",
          receptorState: "La serratura è vuota. Non c'è nessuna chiave.",
          glut4State: "Senza segnale, le porte restano ben chiuse.",
          clinicalSummary:
            "La serratura funziona, ma senza chiave la porta non si apre.",
        },
        {
          stepNumber: 4,
          stepTitle: "La cellula ha fame, il sangue ha troppo zucchero",
          pancreasState: "L'insulina continua a mancare.",
          bloodState: "La glicemia è molto alta. Senza cure, c'è il rischio di chetoacidosi.",
          receptorState: "La serratura resta inutilizzata.",
          glut4State: "Le porte GLUT4 restano chiuse. Lo zucchero non entra nella cellula.",
          clinicalSummary:
            "Il sangue è pieno di energia, ma la cellula ha fame. Per questo chi ha il diabete di tipo 1 ha bisogno di insulina ogni giorno.",
        },
      ],
    },
    type2: {
      modeName: "Diabete di tipo 2",
      badge: "Le cellule non ascoltano più l'insulina",
      overview:
        "Nel diabete di tipo 2, il pancreas fa insulina, ma le cellule non rispondono bene. Le serrature funzionano male, spesso per il grasso sulla pancia, e le porte si aprono poco.",
      steps: [
        {
          stepNumber: 1,
          stepTitle: "Il pancreas lavora troppo",
          pancreasState: "Le cellule beta fanno molta insulina per superare la resistenza.",
          bloodState: "Nel sangue ci sono molto zucchero e molta insulina.",
          receptorState: "Le serrature rispondono sempre più debolmente.",
          glut4State: "Le porte GLUT4 non ricevono un segnale chiaro.",
          clinicalSummary:
            "All'inizio il pancreas fa 2 o 3 volte più insulina per stare al passo.",
        },
        {
          stepNumber: 2,
          stepTitle: "Le chiavi arrivano a cellule che non rispondono",
          pancreasState: "Il pancreas lavora al massimo.",
          bloodState: "Il sangue è pieno di zucchero e di insulina.",
          receptorState: "La serratura è alterata o coperta dal grasso dentro il muscolo.",
          glut4State: "La maggior parte delle porte GLUT4 resta dentro la cellula.",
          clinicalSummary:
            "Il corpo fa le chiavi, ma le cellule non le riconoscono bene.",
        },
        {
          stepNumber: 3,
          stepTitle: "La chiave non apre più bene",
          pancreasState: "Col tempo le cellule beta si stancano e cedono.",
          bloodState: "La glicemia sale perché nelle cellule entra poco zucchero.",
          receptorState: "La chiave entra, ma il segnale non passa bene.",
          glut4State: "Il segnale è debole e le porte si aprono a fatica.",
          clinicalSummary:
            "Il problema non è la mancanza di insulina. Il problema è che la cellula non le risponde più.",
        },
        {
          stepNumber: 4,
          stepTitle: "Lo zucchero resta nel sangue",
          pancreasState: "Senza cambiare le abitudini, il pancreas può esaurirsi.",
          bloodState: "La glicemia resta sempre alta.",
          receptorState: "Le serrature possono tornare a rispondere meglio se ti muovi di più e perdi peso.",
          glut4State: "Si aprono solo poche porte e lo zucchero entra a fatica.",
          clinicalSummary:
            "La cura aiuta le cellule a rispondere di nuovo all'insulina: perdere peso, fare movimento e prendere farmaci come la metformina.",
        },
      ],
    },
  },
  hr: {
    healthy: {
      modeName: "Zdravo tijelo",
      badge: "Sve radi uredno",
      overview:
        "U zdravom tijelu gušterača (pankreas) stvara točno onoliko inzulina koliko je potrebno. Ključ otvara vrata stanice i glukoza ulazi za stvaranje energije.",
      steps: [
        {
          stepNumber: 1,
          stepTitle: "Gušterača stvara inzulin",
          pancreasState: "Beta-stanice prepoznaju porast glukoze u krvi i stvaraju inzulin, odnosno ključ.",
          bloodState: "Glukoza u krvi je uredna i inzulin izlazi na vrijeme.",
          receptorState: "Brave na stanici spremno čekaju ključ.",
          glut4State: "GLUT4 vrata čekaju spremna u unutrašnjosti stanice.",
          clinicalSummary:
            "Gušterača precizno mjeri razinu šećera i šalje točno onoliko inzulina koliko treba.",
        },
        {
          stepNumber: 2,
          stepTitle: "Inzulin putuje krvotokom",
          pancreasState: "Inzulin ulazi izravno u sitne krvne žile.",
          bloodState: "Inzulin i glukoza zajedno putuju krvlju prema mišićima i jetri.",
          receptorState: "Brave na stanicama spremne su prihvatiti ključ.",
          glut4State: "Vrata se pripremaju za izlazak na staničnu stijenku.",
          clinicalSummary:
            "Krv prenosi inzulin do svih dijelova tijela kojima je potrebna energija.",
        },
        {
          stepNumber: 3,
          stepTitle: "Ključ ulazi u bravu",
          pancreasState: "Gušterača smanjuje lučenje inzulina čim glukoza u krvi počne padati.",
          bloodState: "Inzulin stiže do stanične stijenke.",
          receptorState: "Ključ savršeno pristaje u bravu (receptor).",
          glut4State: "Stanica prima jasan signal da otvori svoja vrata.",
          clinicalSummary:
            "Čim ključ uđe u receptor, stanica istog trenutka prima poruku.",
        },
        {
          stepNumber: 4,
          stepTitle: "Vrata se otvaraju i glukoza ulazi",
          pancreasState: "Gušterača se vraća u miran ritam rada.",
          bloodState: "Glukoza u krvi polako se spušta na urednu razinu (70–99 mg/dL).",
          receptorState: "Brava završava zadatak i otpušta ključ.",
          glut4State: "GLUT4 vrata širom se otvaraju. Glukoza ulazi u stanicu i daje energiju.",
          clinicalSummary:
            "Stanica dobiva gorivo, a krvne žile zaštićene su od prevelike količine šećera.",
        },
      ],
    },
    type1: {
      modeName: "Dijabetes tipa 1",
      badge: "Inzulin se ne stvara",
      overview:
        "Kod dijabetesa tipa 1 imunološki sustav napada vlastite beta-stanice u gušterači. Inzulin se više ne proizvodi pa glukoza bez ključa ostaje u krvi.",
      steps: [
        {
          stepNumber: 1,
          stepTitle: "Beta-stanice su uništene",
          pancreasState: "Obrambeni sustav tijela uništio je beta-stanice pa nema stvaranja inzulina.",
          bloodState: "Šećer iz hrane brzo se nakuplja u krvi.",
          receptorState: "Brave na stanicama potpuno su ispravne.",
          glut4State: "Bez signala, GLUT4 vrata ostaju zatvorena unutar stanice.",
          clinicalSummary:
            "Bez beta-stanica tijelo nema ključeve kojima bi iskoristilo glukozu.",
        },
        {
          stepNumber: 2,
          stepTitle: "Krv je puna šećera",
          pancreasState: "Gušterača ne izlučuje nimalo inzulina.",
          bloodState: "U krvotoku je mnogo glukoze, ali nema ključeva.",
          receptorState: "Brave stoje neiskorištene.",
          glut4State: "Vrata stanice ne dobivaju signal za otvaranje.",
          clinicalSummary:
            "Glukoza u krvi opasno raste. Javljaju se jaka žeđ, učestalo mokrenje i dehidracija.",
        },
        {
          stepNumber: 3,
          stepTitle: "Brava ostaje prazna",
          pancreasState: "Gušterača ne može odgovoriti na visoku glukozu u krvi.",
          bloodState: "Glukoza se zadržava u krvi i povlači vodu iz tkiva.",
          receptorState: "Brava je prazna jer ključ ne postoji.",
          glut4State: "Bez signala vrata ostaju čvrsto zatvorena.",
          clinicalSummary:
            "Brava je ispravna, no bez ključa vrata se ne mogu otvoriti.",
        },
        {
          stepNumber: 4,
          stepTitle: "Stanica gladuje, a u krvi je previše šećera",
          pancreasState: "Inzulina i dalje nema.",
          bloodState: "Glukoza u krvi vrlo je visoka. Bez liječenja prijeti ketoacidoza.",
          receptorState: "Brava ostaje prazna.",
          glut4State: "GLUT4 vrata ostaju zatvorena i glukoza ne može ući u stanicu.",
          clinicalSummary:
            "Krv obiluje energijom, ali stanice gladuju. Zato osobe s dijabetesom tipa 1 trebaju inzulin svaki dan.",
        },
      ],
    },
    type2: {
      modeName: "Dijabetes tipa 2",
      badge: "Inzulinska rezistencija stanica",
      overview:
        "Kod dijabetesa tipa 2 gušterača stvara inzulin, ali stanice na njega slabo reagiraju (inzulinska rezistencija). Brave zapinju, često zbog masnog tkiva u trbuhu, pa se vrata slabo otvaraju.",
      steps: [
        {
          stepNumber: 1,
          stepTitle: "Gušterača radi prekovremeno",
          pancreasState: "Beta-stanice luče mnogo inzulina kako bi svladale inzulinsku rezistenciju.",
          bloodState: "U krvi je istodobno mnogo glukoze i mnogo inzulina.",
          receptorState: "Brave reagiraju sve slabije.",
          glut4State: "GLUT4 vrata ne dobivaju jasan signal.",
          clinicalSummary:
            "U početku gušterača proizvodi 2 do 3 puta više inzulina kako bi održala ravnotežu.",
        },
        {
          stepNumber: 2,
          stepTitle: "Ključevi stižu do stanica koje slabo odgovaraju",
          pancreasState: "Gušterača radi punim opterećenjem.",
          bloodState: "Krv je puna glukoze i inzulina.",
          receptorState: "Brava je promijenjena ili ometena masnoćom u mišićnim stanicama.",
          glut4State: "Većina GLUT4 vrata ostaje unutar stanice.",
          clinicalSummary:
            "Tijelo stvara ključeve, ali ih stanice više ne prepoznaju dobro.",
        },
        {
          stepNumber: 3,
          stepTitle: "Ključ više ne otvara uredno",
          pancreasState: "S vremenom se beta-stanice iscrpljuju i slabe.",
          bloodState: "Glukoza u krvi raste jer premalo šećera ulazi u stanice.",
          receptorState: "Ključ uđe u bravu, ali signal ne prolazi kako treba.",
          glut4State: "Signal je slab pa se vrata teško otvaraju.",
          clinicalSummary:
            "Glavni uzrok je inzulinska rezistencija, odnosno slab odgovor stanice na inzulin.",
        },
        {
          stepNumber: 4,
          stepTitle: "Glukoza se zadržava u krvi",
          pancreasState: "Bez promjene životnih navika gušterača se može iscrpiti.",
          bloodState: "Glukoza u krvi ostaje trajno povišena.",
          receptorState: "Brave ponovno bolje reagiraju uz redovito kretanje i smanjenje težine.",
          glut4State: "Otvara se tek mali broj vrata pa šećer sporo ulazi.",
          clinicalSummary:
            "Liječenje vraća osjetljivost stanica na inzulin uz kretanje, smanjenje tjelesne težine i lijekove poput metformina.",
        },
      ],
    },
  },
  rom: {
    healthy: {
      modeName: "Sasto trupo",
      badge: "Sa kerel buchi mishto",
      overview:
        "And-ekh sasto trupo, o pankreaso kerel vorta kobor insulina trebul. O klidi phuterel o vudar la tselulako thaj o zaharo zhal andre vash i zor.",
      steps: [
        {
          stepNumber: 1,
          stepTitle: "O pankreaso kerel insulina",
          pancreasState: "Le beta tselule hatyaren ke o zaharo vazdel pe thaj keren insulina, o klidi.",
          bloodState: "O zaharo and-o rat si normalno thaj i insulina inklyol po vrama.",
          receptorState: "Le brave pe tselula azhukeren o klidi.",
          glut4State: "Le GLUT4 vudara azhukeren gata andral i tselula.",
          clinicalSummary:
            "O pankreaso dichhel mishto thaj bichhalel kobor insulina trebul.",
        },
        {
          stepNumber: 2,
          stepTitle: "I insulina phirel and-o rat",
          pancreasState: "I insulina zhal vorta and-e tikne rateske vene.",
          bloodState: "I insulina thaj o zaharo phiren khetane and-o rat karing le muskulurya thaj o buko.",
          receptorState: "Le brave pe tselule si gata vash o klidi.",
          glut4State: "Le vudara gatisaren pe te vazden pe ko zido la tselulako.",
          clinicalSummary:
            "O rat ingrel i insulina ko svako kotor le trupesko so mangel zor.",
        },
        {
          stepNumber: 3,
          stepTitle: "O klidi zhal and-i brava",
          pancreasState: "O pankreaso kerel may tsera insulina kana o zaharo astarel te hulyol.",
          bloodState: "I insulina aresel ko zido la tselulako.",
          receptorState: "O klidi beshel vorta and-i brava (retseptoro).",
          glut4State: "I tselula lel o semno te phuterel peske vudara.",
          clinicalSummary:
            "Kana o klidi zhal andre, i tselula lel o semno sigo.",
        },
        {
          stepNumber: 4,
          stepTitle: "O vudar phuterel pe thaj o zaharo zhal andre",
          pancreasState: "O pankreaso avel palpale ko lokho marimos.",
          bloodState: "O zaharo and-o rat hulyol lokhes ko normalno (70–99 mg/dL).",
          receptorState: "I brava gatisarel i buchi thaj mukhel o klidi.",
          glut4State: "Le GLUT4 vudara phuterdyon buhles. O zaharo zhal and-i tselula thaj del zor.",
          clinicalSummary:
            "I tselula lel zor thaj le rateske vene si arakhle katar o baro zaharo.",
        },
      ],
    },
    type1: {
      modeName: "Gudlo rat tip 1",
      badge: "Na kerel pe insulina",
      overview:
        "Ko gudlo rat tip 1, o trupo marel peske beta tselule and-o pankreaso. Na kerel pe may but insulina. Bi klidesko, o zaharo achhel and-o rat.",
      steps: [
        {
          stepNumber: 1,
          stepTitle: "Le beta tselule si phagarde",
          pancreasState: "Le beta tselule si phagarde thaj na kerel pe khanchi insulina.",
          bloodState: "O zaharo katar o xaben kidel pe sigo and-o rat.",
          receptorState: "Le brave pe tselule si intregi thaj lachhe.",
          glut4State: "Bi semnosko, le GLUT4 vudara achhen andral i tselula.",
          clinicalSummary:
            "Bi beta tselulengo, le trupeske naj klidya te labyarel o zaharo.",
        },
        {
          stepNumber: 2,
          stepTitle: "O rat si pherdo zaharesa",
          pancreasState: "O pankreaso na mukhel insulina.",
          bloodState: "O rat si pherdo zaharesa, numa naj klidya.",
          receptorState: "Le brave beshen bi labyarde.",
          glut4State: "Le vudara la tselulake na len semno te phuterdyon.",
          clinicalSummary:
            "O zaharo and-o rat vazdel pe zurales. Avel bari trush thaj xasares pay.",
        },
        {
          stepNumber: 3,
          stepTitle: "I brava achhel chuchi",
          pancreasState: "O pankreaso na shaj del atveto ko baro zaharo.",
          bloodState: "O zaharo achhel and-o rat thaj tsirdel o pay andar o trupo.",
          receptorState: "I brava si chuchi. Naj klidi.",
          glut4State: "Bi semnosko, le vudara achhen phandade.",
          clinicalSummary:
            "I brava kerel buchi, numa bi klidesko o vudar na shaj phuterel pe.",
        },
        {
          stepNumber: 4,
          stepTitle: "I tselula si bokhali, and-o rat si but zaharo",
          pancreasState: "I insulina inke naj.",
          bloodState: "O zaharo and-o rat si but baro. Bi sastyarimasko avel baro riziko.",
          receptorState: "I brava achhel bi labyardi.",
          glut4State: "Le GLUT4 vudara achhen phandade. O zaharo na shaj zhal and-i tselula.",
          clinicalSummary:
            "O rat si pherdo zoryasa, numa i tselula si bokhali. Kadaleske le manusha gudle ratesa tip 1 trebun insulina svako dives.",
        },
      ],
    },
    type2: {
      modeName: "Gudlo rat tip 2",
      badge: "Le tselule na ashunen mishto la insulinake",
      overview:
        "Ko gudlo rat tip 2, o pankreaso kerel insulina, numa le tselule na ashunen mishto. Le brave phuterdyon phares, butivar katar o khil po per.",
      steps: [
        {
          stepNumber: 1,
          stepTitle: "O pankreaso kerel but buchi",
          pancreasState: "Le beta tselule keren but insulina te nakhen opral o pharimos.",
          bloodState: "And-o rat si but zaharo thaj but insulina.",
          receptorState: "Le brave ashunen sa may tsera.",
          glut4State: "Le GLUT4 vudara na len limpede semno.",
          clinicalSummary:
            "Ko astarimos, o pankreaso kerel 2 vay 3 droma may but insulina.",
        },
        {
          stepNumber: 2,
          stepTitle: "Le klidya aresen ko tselule so na ashunen",
          pancreasState: "O pankreaso kerel buchi sa peske zoryasa.",
          bloodState: "O rat si pherdo zaharesa thaj insulinasa.",
          receptorState: "I brava si parudi katar o khil and-o muskulo.",
          glut4State: "May but GLUT4 vudara achhen andral i tselula.",
          clinicalSummary:
            "O trupo kerel le klidya, numa le tselule na prinzharen len mishto.",
        },
        {
          stepNumber: 3,
          stepTitle: "O klidi na phuterel mishto",
          pancreasState: "Vramasa, le beta tselule khinyon.",
          bloodState: "O zaharo and-o rat vazdel pe ke na zhal dosta and-e tselule.",
          receptorState: "O klidi zhal andre, numa o semno si slabo.",
          glut4State: "O semno si slabo thaj le vudara phuterdyon phares.",
          clinicalSummary:
            "O bajo naj ke naj insulina, numa ke i tselula na ashunel la.",
        },
        {
          stepNumber: 4,
          stepTitle: "O zaharo achhel and-o rat",
          pancreasState: "Bi paruvimasko and-o trajo, o pankreaso khinyol.",
          bloodState: "O zaharo and-o rat achhel baro sa o vrama.",
          receptorState: "Le brave shaj ashunen palpale may mishto kana phires may but thaj hulyol cho pharimos.",
          glut4State: "Phuterdyon numa uni vudara thaj o zaharo zhal andre lokhes.",
          clinicalSummary:
            "O sastyarimos azhutil le tselule te ashunen palpale la insulinake: phirimos, may tikno pharimos thaj i drab sar metformina.",
        },
      ],
    },
  },
};

function useSafeLanguage(propLang?: Lang): Lang {
  const ctx = useContext(LanguageContext);
  if (propLang && UI_STRINGS[propLang]) return propLang;
  if (ctx?.lang && UI_STRINGS[ctx.lang]) return ctx.lang;
  return "ro";
}

/* ------------------------------------------------------------------------- */
/* Cell diagram geometry (viewBox 600 x 280).                                 */
/* ------------------------------------------------------------------------- */

/** Same fine line as the other explainer diagrams. */
const STROKE = {
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
};

const MEMBRANE_TOP = 128;
const MEMBRANE_BOTTOM = 142;
const RECEPTOR_X = 260;
const GATE_X = 440;
const GATE_Y = 135;

type Pt = readonly [number, number];

/** Glucose in the bloodstream. The first three cross into the cell when the gate opens. */
const BLOOD_GLUCOSE: Pt[] = [
  [312, 52],
  [404, 82],
  [486, 50],
  [358, 88],
  [540, 78],
  [452, 40],
];
/** Where crossing glucose settles inside the cell. */
const CELL_GLUCOSE: Pt[] = [
  [392, 200],
  [436, 236],
  [482, 196],
];
/** Extra glucose that builds up in the blood when insulin does not work (type 1 / type 2). */
const EXTRA_GLUCOSE: Pt[] = [
  [286, 86],
  [380, 44],
  [516, 50],
  [560, 40],
];

/** Insulin keys per step: [x, y] of the key head. Key 0 is the one that docks. */
const KEY_PATHS: Record<"healthy" | "type2", Pt[][]> = {
  healthy: [
    [[172, 52], [196, 76], [220, 52]],
    [[236, 70], [330, 56], [430, 60]],
    [[RECEPTOR_X, 92], [338, 44], [430, 52]],
    [[RECEPTOR_X, 92], [338, 44], [430, 52]],
  ],
  // Type 2: more insulin than usual; the first key hovers above a receptor it cannot fit.
  type2: [
    [[172, 52], [196, 76], [220, 52], [244, 72], [266, 44]],
    [[236, 70], [330, 56], [430, 60], [262, 40], [470, 70]],
    [[RECEPTOR_X, 80], [338, 44], [430, 52], [282, 44], [500, 74]],
    [[RECEPTOR_X, 80], [338, 44], [430, 52], [282, 44], [500, 74]],
  ],
};

function hexagon(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

/*
 * On phones the 600-unit drawing is shown at about half size, so the moving parts are
 * drawn larger there (CSS scale; strokes do not scale). Glucose grows around its centre,
 * a key around the tip of its blade, so a docked key still sits in the receptor and a
 * key that does not fit still hovers above it.
 */
function GlucoseGlyph() {
  return (
    <polygon
      points={hexagon(0, 0, 8)}
      fill="var(--color-card)"
      stroke="var(--color-sapphire)"
      {...STROKE}
      className="max-sm:scale-[1.4]"
    />
  );
}

/** Insulin as a key, drawn around its head at (0, 0) with the blade pointing down. */
function KeyGlyph() {
  return (
    <g stroke="var(--color-amber-care)" {...STROKE} className="origin-[0px_24px] max-sm:scale-[1.45]">
      <circle cx="0" cy="0" r="7" fill="var(--color-amber-care-soft)" />
      <path d="M0 7 V24 M0 16 H5 M0 21 H5" />
    </g>
  );
}

interface CellDiagramProps {
  mode: InsulinMode;
  step: number;
  reduced: boolean;
}

/**
 * Refined cell diagram: pancreas and bloodstream above, the two-layer cell
 * membrane with the insulin receptor and the GLUT4 gate, the cell interior
 * below. Each step moves the parts with one calm transition (transform,
 * opacity and a line draw only); nothing loops.
 */
function CellDiagram({ mode, step, reduced }: CellDiagramProps) {
  const move = { duration: reduced ? 0 : 0.9, ease: EASE_OUT };
  const fade = { duration: reduced ? 0 : DURATION.slow, ease: EASE_OUT };

  const healthy = mode === "healthy";
  const keys = mode === "type1" ? null : KEY_PATHS[mode][step];
  const gateOpen = step === 3 && mode !== "type1" ? (healthy ? 9 : 3) : 0;
  const crossing = step === 3 ? (healthy ? 3 : mode === "type2" ? 1 : 0) : 0;
  const glucoseBuildsUp = !healthy && step >= 1;
  const signal = step >= 2 && mode !== "type1" ? (healthy ? 1 : 0.4) : 0;
  const energised = healthy && step === 3;

  return (
    <svg viewBox="0 0 600 280" className="h-auto w-full select-none" fill="none" aria-hidden="true">
      {/* Pancreas with its islet (beta) cells */}
      <rect x="20" y="22" width="112" height="84" rx="26" fill="var(--color-surface-subtle)" stroke="var(--color-muted-foreground)" {...STROKE} />
      {[
        [52, 52],
        [76, 46],
        [100, 56],
        [62, 76],
        [90, 80],
      ].map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="7"
          fill={mode === "type1" ? "var(--color-card)" : "var(--color-amber-care-soft)"}
          stroke={mode === "type1" ? "var(--color-border)" : "var(--color-amber-care)"}
          strokeDasharray={mode === "type1" ? "2 3" : undefined}
          {...STROKE}
        />
      ))}
      <path d="M132 64 H150" stroke="var(--color-muted-foreground)" {...STROKE} />

      {/* Bloodstream */}
      <rect x="150" y="20" width="430" height="88" rx="16" fill="var(--color-primary-soft)" stroke="var(--color-ruby-300)" {...STROKE} />
      <path d="M552 58 l8 6 l-8 6" stroke="var(--color-ruby-300)" {...STROKE} />

      {/* Cell interior and its two-layer membrane */}
      <rect x="20" y={MEMBRANE_BOTTOM} width="560" height="118" rx="16" fill="var(--color-sapphire-soft)" stroke="var(--color-sapphire-border)" {...STROKE} />
      <path d={`M20 ${MEMBRANE_TOP} H580 M20 ${MEMBRANE_BOTTOM} H580`} stroke="var(--color-sapphire-light)" {...STROKE} />

      {/* Insulin receptor: a cup on the membrane; amber when it has become resistant */}
      <path
        d={`M${RECEPTOR_X - 10} 108 V120 Q${RECEPTOR_X - 10} 126 ${RECEPTOR_X - 4} 126 H${RECEPTOR_X + 4} Q${RECEPTOR_X + 10} 126 ${RECEPTOR_X + 10} 120 V108 M${RECEPTOR_X} 126 V156`}
        stroke={mode === "type2" ? "var(--color-amber-care)" : "var(--color-sapphire)"}
        {...STROKE}
      />
      <circle cx={RECEPTOR_X} cy="160" r="4" fill="var(--color-card)" stroke={mode === "type2" ? "var(--color-amber-care)" : "var(--color-sapphire)"} {...STROKE} />

      {/* Signal from the receptor to the gate */}
      <m.path
        d={`M${RECEPTOR_X + 8} 164 C 320 206, 380 206, ${GATE_X - 10} 158`}
        stroke="var(--color-sapphire-light)"
        {...STROKE}
        initial={false}
        animate={{ pathLength: signal, opacity: signal > 0 ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.8, ease: EASE_IN_OUT }}
      />

      {/* GLUT4 gate: two halves in the membrane */}
      <m.rect
        x={GATE_X - 15}
        y="120"
        width="13"
        height="30"
        rx="4"
        fill="var(--color-live-sage-soft)"
        stroke="var(--color-live-sage)"
        {...STROKE}
        initial={false}
        animate={{ x: -gateOpen }}
        transition={move}
      />
      <m.rect
        x={GATE_X + 2}
        y="120"
        width="13"
        height="30"
        rx="4"
        fill="var(--color-live-sage-soft)"
        stroke="var(--color-live-sage)"
        {...STROKE}
        initial={false}
        animate={{ x: gateOpen }}
        transition={move}
      />

      {/* Mitochondrion: turns green when the cell gets its fuel */}
      <g>
        <rect
          x="500"
          y="206"
          width="64"
          height="32"
          rx="16"
          fill={energised ? "var(--color-live-sage-soft)" : "var(--color-card)"}
          stroke={energised ? "var(--color-live-sage)" : "var(--color-sapphire-border)"}
          {...STROKE}
          style={{ transition: "fill var(--dur-slow) var(--ease-out-calm), stroke var(--dur-slow) var(--ease-out-calm)" }}
        />
        <path
          d="M510 222 Q515 213 520 222 T530 222 T540 222 T550 222"
          stroke={energised ? "var(--color-live-sage)" : "var(--color-sapphire-border)"}
          {...STROKE}
          style={{ transition: "stroke var(--dur-slow) var(--ease-out-calm)" }}
        />
      </g>

      {/* Glucose that piles up in the blood when insulin is missing or not working */}
      {EXTRA_GLUCOSE.map(([x, y]) => (
        <m.g key={`extra-${x}`} initial={false} animate={{ opacity: glucoseBuildsUp ? 1 : 0 }} transition={fade}>
          <g transform={`translate(${x} ${y})`}>
            <GlucoseGlyph />
          </g>
        </m.g>
      ))}

      {/* Glucose in the blood; the first ones pass through the open gate. Glucose
          never flows back out: when the reader steps back, it fades in again in the blood. */}
      {BLOOD_GLUCOSE.map(([x, y], i) => {
        const goesIn = i < crossing;
        const target = CELL_GLUCOSE[i];
        return goesIn ? (
          <m.g
            key={`glu-in-${x}`}
            initial={{ x, y, opacity: 1 }}
            animate={{ x: [x, GATE_X, target[0]], y: [y, GATE_Y, target[1]] }}
            transition={{ duration: reduced ? 0 : 1.4, times: [0, 0.5, 1], ease: EASE_IN_OUT, delay: reduced ? 0 : 0.5 + i * 0.15 }}
          >
            <GlucoseGlyph />
          </m.g>
        ) : (
          <m.g key={`glu-${x}`} initial={reduced ? false : { x, y, opacity: 0 }} animate={{ x, y, opacity: 1 }} transition={fade}>
            <GlucoseGlyph />
          </m.g>
        );
      })}

      {/* Insulin keys (none in type 1: the pancreas makes no insulin) */}
      {keys?.map(([x, y], i) => (
        <m.g key={`key-${i}`} data-insulin-key initial={false} animate={{ x, y }} transition={move}>
          <KeyGlyph />
        </m.g>
      ))}
    </svg>
  );
}

export function InsulinMechanicsModule({ lang: propLang }: InsulinMechanicsModuleProps) {
  const [activeMode, setActiveMode] = useState<InsulinMode>("healthy");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const reduced = useReducedMotion() ?? false;
  const visualizerRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(visualizerRef, { amount: 0.3 });

  const activeLang = useSafeLanguage(propLang);
  const ui = UI_STRINGS[activeLang] || UI_STRINGS.ro;
  const modes = MODE_TRANSLATIONS[activeLang] || MODE_TRANSLATIONS.ro;

  const activeModeData = modes[activeMode];
  const currentStep = activeModeData.steps[currentStepIndex];

  // Auto-play walks through the four stages; the reader starts and stops it.
  // It waits while the diagram is scrolled out of view.
  useEffect(() => {
    if (!isPlaying || !inView) return;
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPlaying, inView]);

  const handleModeChange = (mode: InsulinMode) => {
    setActiveMode(mode);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const pancreasStatusText =
    activeMode === "type1"
      ? ui.pancreasStatusType1
      : activeMode === "type2"
      ? ui.pancreasStatusType2
      : ui.pancreasStatusHealthy;

  const gateIsOpen = currentStepIndex === 3 && activeMode !== "type1";
  const energised = activeMode === "healthy" && currentStepIndex === 3;

  const playClass =
    "min-h-[44px] rounded-lg border border-border bg-card px-3.5 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2";

  return (
    <section
      aria-label={ui.moduleAriaLabel}
      className="space-y-8"
    >
      <header className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{ui.title}</h3>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">{ui.description}</p>
      </header>

      {/* Condition switcher */}
      <div className="space-y-3 border-t border-border pt-6">
        <p className="text-sm font-semibold text-foreground">{ui.modeSelectorPrompt}</p>
        <div role="radiogroup" aria-label={ui.modeSelectAria} className={`${ROW_LIST_CLASS} sm:grid-cols-3 sm:gap-x-6`}>
          {(["healthy", "type1", "type2"] as InsulinMode[]).map((mode) => {
            const isSelected = activeMode === mode;
            return (
              <label key={mode} className={`${ROW_CLASS} cursor-pointer items-start`}>
                <input
                  type="radio"
                  name="insulin-mode"
                  value={mode}
                  checked={isSelected}
                  onChange={() => handleModeChange(mode)}
                  className="sr-only"
                />
                <span className={`mt-0.5 ${radioDotClass(isSelected)}`} aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-snug text-foreground">{modes[mode].modeName}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{modes[mode].badge}</span>
                </span>
              </label>
            );
          })}
        </div>
        <p className="max-w-prose pt-1 text-sm leading-relaxed text-foreground">{activeModeData.overview}</p>
      </div>

      {/* Steps and cell diagram */}
      <div
        ref={visualizerRef}
        id="insulin-mechanics-visualizer"
        role="region"
        aria-label={ui.visualizerAria.replace("{mode}", activeModeData.modeName)}
        className="space-y-6 border-t border-border pt-6"
      >
        {/* Step selector */}
        <ol className={`${STEP_LIST_CLASS} sm:grid-cols-2`}>
          {activeModeData.steps.map((st, idx) => {
            const isCurrent = idx === currentStepIndex;
            return (
              <li key={st.stepNumber}>
                <button
                  type="button"
                  aria-current={isCurrent ? "step" : undefined}
                  onClick={() => {
                    setCurrentStepIndex(idx);
                    setIsPlaying(false);
                  }}
                  className={stepCellClass(isCurrent)}
                >
                  <span className={stepNumberClass(isCurrent)}>{st.stepNumber}</span>
                  <span
                    className={`min-w-0 text-sm leading-snug break-words ${
                      isCurrent ? "font-semibold text-foreground" : "font-medium text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {st.stepTitle}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Cell diagram */}
        <div>
          <LazyMotion features={domAnimation} strict>
            <CellDiagram mode={activeMode} step={currentStepIndex} reduced={reduced} />
          </LazyMotion>

          <div className="mt-4 border-t border-border pt-3.5">
            <p className="text-xs font-semibold text-muted-foreground">{ui.legendTitle}</p>
            <ul className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 text-xs leading-snug text-foreground sm:grid-cols-2">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-3 w-3 shrink-0 rounded-sm border border-muted-foreground bg-surface-subtle" aria-hidden="true" />
                <span>
                  {ui.pancreasBetaCells}: <span className="text-muted-foreground">{pancreasStatusText}</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-3 w-3 shrink-0 rounded-sm border border-ruby-300 bg-primary-soft" aria-hidden="true" />
                <span>{ui.capillaryFlow}</span>
              </li>
              <li className="flex items-start gap-2">
                <svg viewBox="0 0 12 16" className="mt-0.5 h-3.5 w-3 shrink-0" aria-hidden="true">
                  <circle cx="6" cy="4" r="3" fill="var(--color-amber-care-soft)" stroke="var(--color-amber-care)" strokeWidth="1.5" />
                  <path d="M6 7 V15 M6 11 H9 M6 14 H9" stroke="var(--color-amber-care)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>
                  {ui.insulinKeyLabel}
                  {activeMode === "type1" && <span className="text-amber-care-hover"> · {ui.type1AbsenceKeys}</span>}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <svg viewBox="0 0 14 14" className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true">
                  <polygon points={hexagon(7, 7, 5.5)} fill="var(--color-card)" stroke="var(--color-sapphire)" strokeWidth="1.5" />
                </svg>
                <span>{ui.glucoseLabel}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-0.5 w-3 shrink-0 bg-sapphire-light" aria-hidden="true" />
                <span>{ui.membraneBarrier}</span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className={`mt-0.5 h-3 w-3 shrink-0 rounded-sm border ${activeMode === "type2" ? "border-amber-care" : "border-sapphire"}`}
                  aria-hidden="true"
                />
                <span>{ui.insulinReceptor}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-3 w-3 shrink-0 rounded-sm border border-live-sage bg-live-sage-soft" aria-hidden="true" />
                <span>{gateIsOpen ? ui.glut4Open : ui.glut4Closed}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-3 w-3 shrink-0 rounded-sm border border-sapphire-border bg-sapphire-soft" aria-hidden="true" />
                <span>{ui.cellInterior}</span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className={`mt-0.5 h-3 w-4 shrink-0 rounded-full border ${energised ? "border-live-sage bg-live-sage-soft" : "border-sapphire-border bg-card"}`}
                  aria-hidden="true"
                />
                <span>
                  {ui.mitochondria}:{" "}
                  <span className="text-muted-foreground">{energised ? ui.energyProduction : ui.restingText}</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Stage explanation */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2" aria-live="polite">
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-foreground">{ui.organBloodBehavior}</h5>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <strong className="font-semibold text-foreground">{ui.pancreasLabel}</strong> {currentStep.pancreasState}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <strong className="font-semibold text-foreground">{ui.bloodFlowLabel}</strong> {currentStep.bloodState}
            </p>
          </div>
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-foreground">{ui.cellularBehavior}</h5>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <strong className="font-semibold text-foreground">{ui.receptorLabel}</strong> {currentStep.receptorState}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <strong className="font-semibold text-foreground">{ui.glut4Label}</strong> {currentStep.glut4State}
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-sm leading-relaxed text-foreground">
            <strong className="font-semibold text-foreground">{ui.clinicalConclusion}:</strong>{" "}
            <span className="text-muted-foreground">{currentStep.clinicalSummary}</span>
          </p>
        </div>

        {/* Footer step transport bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {ui.stageLabel} {currentStep.stepNumber} {ui.ofFour}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-pressed={isPlaying}
              className={playClass}
              aria-label={isPlaying ? ui.pauseAria : ui.playAutoAria}
            >
              {isPlaying ? ui.pause : ui.playAuto}
            </button>
            <button
              type="button"
              onClick={() => setCurrentStepIndex((prev) => (prev - 1 + 4) % 4)}
              className={BACK_BUTTON_CLASS}
            >
              {ui.prevStep}
            </button>
            <button
              type="button"
              onClick={() => setCurrentStepIndex((prev) => (prev + 1) % 4)}
              className={NEXT_BUTTON_CLASS}
            >
              {ui.nextStep}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
