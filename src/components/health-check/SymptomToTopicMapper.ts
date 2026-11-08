/**
 * SymptomToTopicMapper (Change 41)
 * Connects the Symptom Checker directly to the Health Literacy educational repository ("Află").
 * Supports localized topic recommendations across ro, en, sq, it with sentence casing and zero ampersands.
 */

import type { Lang } from "@/lib/i18n/translations";

export interface TopicMapping {
  slug: string;
  title: string;
  recommendation: string;
}

const TOPIC_TRANSLATIONS: Record<
  Lang,
  Record<string, { title: string; recommendation: string }>
> = {
  ro: {
    "heart-health": {
      title: "Sănătatea inimii și tensiunea arterială",
      recommendation:
        "Cum recunoști semnele de alarmă ale inimii și cum ții tensiunea sub control.",
    },
    "healthy-eating": {
      title: "Alimentație sănătoasă și digestie",
      recommendation:
        "Ce alimente liniștesc stomacul și cum previi arsurile.",
    },
    "antibiotics-awareness": {
      title: "Răceală, gripă și utilizarea corectă a antibioticelor",
      recommendation:
        "De ce antibioticele nu vindecă virozele și cum scazi febra fără riscuri.",
    },
    "mental-wellbeing": {
      title: "Gestionarea stresului și durerile de cap de tensiune",
      recommendation:
        "Cum stresul și somnul puțin aduc dureri de cap și cum le previi.",
    },
    "healthy-habits-back": {
      title: "Postura corectă, coloana vertebrală și mișcarea",
      recommendation:
        "Exerciții simple de 5 minute pentru durerile de spate și de șale.",
    },
    "healthy-habits-joints": {
      title: "Mișcare zilnică și sănătatea articulațiilor",
      recommendation:
        "Cum îți aperi încheieturile și cum ajuți circulația în mâini și picioare.",
    },
  },
  en: {
    "heart-health": {
      title: "Heart health and blood pressure",
      recommendation:
        "How to spot heart warning signs and keep your blood pressure under control.",
    },
    "healthy-eating": {
      title: "Healthy eating and digestion",
      recommendation:
        "Which foods calm your stomach and how to prevent heartburn.",
    },
    "antibiotics-awareness": {
      title: "Cold, flu, and proper antibiotic use",
      recommendation:
        "Why antibiotics don't cure viruses, and how to bring a fever down safely.",
    },
    "mental-wellbeing": {
      title: "Stress management and tension headaches",
      recommendation:
        "How stress and poor sleep cause headaches, and how to prevent them.",
    },
    "healthy-habits-back": {
      title: "Healthy posture, spine care, and movement",
      recommendation:
        "Simple 5-minute exercises for lower back pain.",
    },
    "healthy-habits-joints": {
      title: "Daily movement and joint health",
      recommendation:
        "How to protect your joints and help blood flow in your hands and feet.",
    },
  },
  sq: {
    "heart-health": {
      title: "Shëndeti i zemrës dhe tensioni i gjakut",
      recommendation:
        "Si t'i dallosh shenjat e rrezikut të zemrës dhe si ta mbash tensionin nën kontroll.",
    },
    "healthy-eating": {
      title: "Ushqyerja e shëndetshme dhe tretja",
      recommendation:
        "Cilat ushqime e qetësojnë stomakun dhe si ta parandalosh djegien.",
    },
    "antibiotics-awareness": {
      title: "Ftohja, gripi dhe përdorimi i saktë i antibiotikëve",
      recommendation:
        "Pse antibiotikët nuk i shërojnë viruset dhe si ta ulësh temperaturën pa rrezik.",
    },
    "mental-wellbeing": {
      title: "Menaxhimi i stresit dhe dhimbjet e kokës nga tensioni",
      recommendation:
        "Si stresi dhe gjumi i pakët sjellin dhimbje koke dhe si t'i parandalosh.",
    },
    "healthy-habits-back": {
      title: "Qëndrimi i saktë, shtylla kurrizore dhe lëvizja",
      recommendation:
        "Ushtrime të thjeshta 5-minutëshe për dhimbjet e mesit dhe të shpinës.",
    },
    "healthy-habits-joints": {
      title: "Lëvizja e përditshme dhe shëndeti i kyçeve",
      recommendation:
        "Si t'i mbrosh kyçet dhe si ta ndihmosh qarkullimin e gjakut në duar dhe këmbë.",
    },
  },
  it: {
    "heart-health": {
      title: "Salute del cuore e pressione arteriosa",
      recommendation:
        "Come riconoscere i segnali di allarme del cuore e tenere sotto controllo la pressione.",
    },
    "healthy-eating": {
      title: "Alimentazione sana e digestione",
      recommendation:
        "Quali cibi calmano lo stomaco e come prevenire il bruciore.",
    },
    "antibiotics-awareness": {
      title: "Raffreddore, influenza e uso corretto degli antibiotici",
      recommendation:
        "Perché gli antibiotici non curano i virus e come abbassare la febbre in sicurezza.",
    },
    "mental-wellbeing": {
      title: "Gestione dello stress e mal di testa da tensione",
      recommendation:
        "Come lo stress e il poco sonno causano mal di testa e come prevenirli.",
    },
    "healthy-habits-back": {
      title: "Postura corretta, colonna vertebrale e movimento",
      recommendation:
        "Esercizi semplici di 5 minuti per il mal di schiena.",
    },
    "healthy-habits-joints": {
      title: "Movimento quotidiano e salute delle articolazioni",
      recommendation:
        "Come proteggere le articolazioni e aiutare la circolazione in mani e piedi.",
    },
  },
};

export function getTopicForSymptom(
  partId: string,
  symptomId?: string,
  lang: Lang = "ro"
): TopicMapping {
  const loc = TOPIC_TRANSLATIONS[lang] ?? TOPIC_TRANSLATIONS.ro;

  if (partId === "chest") {
    const data = loc["heart-health"];
    return {
      slug: "heart-health",
      title: data.title,
      recommendation: data.recommendation,
    };
  }

  if (partId === "stomach") {
    const data = loc["healthy-eating"];
    return {
      slug: "healthy-eating",
      title: data.title,
      recommendation: data.recommendation,
    };
  }

  if (partId === "head") {
    if (symptomId?.includes("fever") || symptomId?.includes("cold")) {
      const data = loc["antibiotics-awareness"];
      return {
        slug: "antibiotics-awareness",
        title: data.title,
        recommendation: data.recommendation,
      };
    }
    const data = loc["mental-wellbeing"];
    return {
      slug: "mental-wellbeing",
      title: data.title,
      recommendation: data.recommendation,
    };
  }

  if (partId === "back") {
    const data = loc["healthy-habits-back"];
    return {
      slug: "healthy-habits",
      title: data.title,
      recommendation: data.recommendation,
    };
  }

  // arm or leg
  const data = loc["healthy-habits-joints"];
  return {
    slug: "healthy-habits",
    title: data.title,
    recommendation: data.recommendation,
  };
}
