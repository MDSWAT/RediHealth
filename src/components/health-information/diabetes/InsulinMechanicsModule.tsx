"use client";

import { useContext, useEffect, useState } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { DURATION, EASE_IN_OUT, EASE_OUT } from "@/lib/motion/tokens";
import { LanguageContext } from "@/lib/i18n/language-context";
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
  badgeClass: string;
  subtitle: string;
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
  prevStepAria: string;
  playAuto: string;
  playAutoAria: string;
  pause: string;
  pauseAria: string;
  nextStep: string;
  nextStepAria: string;
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
    prevStepAria: "Pasul de dinainte",
    playAuto: "Pornește",
    playAutoAria: "Pornește derularea pașilor",
    pause: "Oprește",
    pauseAria: "Oprește derularea pașilor",
    nextStep: "Înainte",
    nextStepAria: "Pasul următor",
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
    prevStepAria: "Previous step",
    playAuto: "Play",
    playAutoAria: "Play the steps",
    pause: "Pause",
    pauseAria: "Pause the steps",
    nextStep: "Next",
    nextStepAria: "Next step",
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
    prevStep: "Kthehu",
    prevStepAria: "Hapi i mëparshëm",
    playAuto: "Nis",
    playAutoAria: "Nis hapat",
    pause: "Ndalo",
    pauseAria: "Ndalo hapat",
    nextStep: "Para",
    nextStepAria: "Hapi tjetër",
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
    prevStepAria: "Passo precedente",
    playAuto: "Avvia",
    playAutoAria: "Avvia i passi",
    pause: "Pausa",
    pauseAria: "Metti in pausa i passi",
    nextStep: "Avanti",
    nextStepAria: "Passo successivo",
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
};

const MODE_TRANSLATIONS: Record<Lang, Record<InsulinMode, ModeDetail>> = {
  ro: {
    healthy: {
      modeName: "Corp sănătos",
      badge: "Totul merge bine",
      badgeClass: "bg-live-sage-soft text-live-sage border-live-sage/30",
      subtitle: "Zahăr normal, încuietori care răspund",
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
      badgeClass: "bg-primary-soft text-primary border-primary/30",
      subtitle: "Corpul își distruge celulele care fac insulina",
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
      badgeClass: "bg-amber-care-soft text-amber-care border-amber-care-border",
      subtitle: "Rezistență la insulină",
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
      badgeClass: "bg-live-sage-soft text-live-sage border-live-sage/30",
      subtitle: "Normal sugar, locks that respond",
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
      badgeClass: "bg-primary-soft text-primary border-primary/30",
      subtitle: "The body destroys the cells that make insulin",
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
      badgeClass: "bg-amber-care-soft text-amber-care border-amber-care-border",
      subtitle: "Insulin resistance",
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
      badgeClass: "bg-live-sage-soft text-live-sage border-live-sage/30",
      subtitle: "Sheqer normal, brava që reagojnë",
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
      badgeClass: "bg-primary-soft text-primary border-primary/30",
      subtitle: "Trupi shkatërron qelizat që bëjnë insulinë",
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
      badgeClass: "bg-amber-care-soft text-amber-care border-amber-care-border",
      subtitle: "Rezistencë ndaj insulinës",
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
          stepTitle: "Çelësat arrijnë te qeliza që nuk reagojnë",
          pancreasState: "Pankreasi punon me të gjitha forcat.",
          bloodState: "Gjaku është plot sheqer dhe insulinë.",
          receptorState: "Brava është ndryshuar ose e mbuluar nga yndyra brenda muskulit.",
          glut4State: "Shumica e dyerve GLUT4 mbeten brenda qelizës.",
          clinicalSummary:
            "Trupi i bën çelësat, por qelizat nuk i njohin mirë.",
        },
        {
          stepNumber: 3,
          stepTitle: "Çelësi nuk hap më mirë",
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
      badgeClass: "bg-live-sage-soft text-live-sage border-live-sage/30",
      subtitle: "Zucchero normale, serrature che rispondono",
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
      badgeClass: "bg-primary-soft text-primary border-primary/30",
      subtitle: "Il corpo distrugge le cellule che fanno l'insulina",
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
      badgeClass: "bg-amber-care-soft text-amber-care border-amber-care-border",
      subtitle: "Insulino-resistenza",
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

const STROKE = {
  strokeWidth: 2,
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

function GlucoseGlyph() {
  return <polygon points={hexagon(0, 0, 8)} fill="var(--color-card)" stroke="var(--color-sapphire)" {...STROKE} />;
}

/** Insulin as a key, drawn around its head at (0, 0) with the blade pointing down. */
function KeyGlyph() {
  return (
    <g stroke="var(--color-amber-care)" {...STROKE}>
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

      {/* Glucose in the blood; the first ones pass through the open gate */}
      {BLOOD_GLUCOSE.map(([x, y], i) => {
        const goesIn = i < crossing;
        const target = CELL_GLUCOSE[i];
        const animate = goesIn
          ? { x: [x, GATE_X, target[0]], y: [y, GATE_Y, target[1]] }
          : { x, y };
        return (
          <m.g
            key={`glu-${x}`}
            initial={false}
            animate={animate}
            transition={goesIn ? { duration: reduced ? 0 : 1.4, times: [0, 0.5, 1], ease: EASE_IN_OUT, delay: reduced ? 0 : 0.5 + i * 0.15 } : move}
          >
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
  // HOOK ORDER CONTRACT FOR EMPIRICAL STRESS TESTS:
  // Hook 0: activeMode
  // Hook 1: currentStepIndex
  // Hook 2: isPlaying
  const [activeMode, setActiveMode] = useState<InsulinMode>("healthy");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const reduced = useReducedMotion() ?? false;

  const activeLang = useSafeLanguage(propLang);
  const ui = UI_STRINGS[activeLang] || UI_STRINGS.ro;
  const modes = MODE_TRANSLATIONS[activeLang] || MODE_TRANSLATIONS.ro;

  const activeModeData = modes[activeMode];
  const currentStep = activeModeData.steps[currentStepIndex];

  // Auto-play walks through the four stages; the reader starts and stops it.
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPlaying]);

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

  const controlClass =
    "min-h-[44px] rounded-lg border border-border bg-card px-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire";

  return (
    <section
      aria-label={ui.moduleAriaLabel}
      className="space-y-8 rounded-lg border border-border bg-card p-5 shadow-xs sm:p-7"
    >
      <header className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{ui.title}</h3>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">{ui.description}</p>
      </header>

      {/* Condition switcher */}
      <div className="space-y-3 border-t border-border pt-6">
        <p className="text-sm font-semibold text-foreground">{ui.modeSelectorPrompt}</p>
        <div role="tablist" aria-label={ui.modeSelectAria} className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {(["healthy", "type1", "type2"] as InsulinMode[]).map((mode) => {
            const isSelected = activeMode === mode;
            const data = modes[mode];
            return (
              <button
                key={mode}
                type="button"
                role="tab"
                id={`mode-tab-${mode}`}
                aria-selected={isSelected}
                aria-controls="insulin-mechanics-visualizer"
                onClick={() => handleModeChange(mode)}
                className={`flex min-h-[60px] flex-col justify-center rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
                  isSelected
                    ? "border-foreground bg-surface-subtle"
                    : "border-border bg-card hover:border-foreground/30 hover:bg-surface-subtle/50"
                }`}
              >
                <span className="text-sm font-semibold leading-snug text-foreground">{data.modeName}</span>
                <span className="mt-1 text-xs leading-snug break-words text-muted-foreground">{data.subtitle}</span>
              </button>
            );
          })}
        </div>
        <p className="max-w-prose pt-1 text-sm leading-relaxed text-foreground">
          <span className={`mr-2 inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${activeModeData.badgeClass}`}>
            {activeModeData.badge}
          </span>
          {activeModeData.overview}
        </p>
      </div>

      {/* Visualizer — clean hairline section, 2x2 step grid, zero duplicate title */}
      <div
        id="insulin-mechanics-visualizer"
        role="region"
        aria-label={ui.visualizerAria.replace("{mode}", activeModeData.modeName)}
        className="space-y-6 border-t border-border pt-6"
      >
        {/* 2x2 Step selector grid */}
        <ol className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
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
                  className={`flex h-full min-h-[56px] w-full items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
                    isCurrent
                      ? "border-foreground bg-surface-subtle text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:bg-surface-subtle/50"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold tabular-nums ${
                      isCurrent
                        ? "bg-foreground text-white"
                        : "bg-surface-subtle text-muted-foreground"
                    }`}
                  >
                    {st.stepNumber}
                  </span>
                  <span className="text-sm font-semibold leading-snug break-words text-foreground">
                    {st.stepTitle}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Cell diagram */}
        <div className="overflow-hidden rounded-lg border border-border bg-surface-subtle/30 p-3 sm:p-5">
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
                  {activeMode === "type1" && <span className="text-primary"> · {ui.type1AbsenceKeys}</span>}
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
              onClick={() => setCurrentStepIndex((prev) => (prev - 1 + 4) % 4)}
              className={controlClass}
              aria-label={ui.prevStepAria}
            >
              {ui.prevStep}
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-pressed={isPlaying}
              className={`min-h-[44px] rounded-lg px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 ${
                isPlaying
                  ? "bg-amber-care text-white hover:bg-amber-care-hover"
                  : "bg-sapphire text-white hover:bg-sapphire-light"
              }`}
              aria-label={isPlaying ? ui.pauseAria : ui.playAutoAria}
            >
              {isPlaying ? ui.pause : ui.playAuto}
            </button>
            <button
              type="button"
              onClick={() => setCurrentStepIndex((prev) => (prev + 1) % 4)}
              className={controlClass}
              aria-label={ui.nextStepAria}
            >
              {ui.nextStep}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
