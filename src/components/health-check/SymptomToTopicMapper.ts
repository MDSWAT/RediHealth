/**
 * SymptomToTopicMapper (Change 41)
 * Connects the Symptom Checker directly to the Health Literacy educational repository ("Află").
 * Supports localized topic recommendations across ro, en, sq, it, hr, rom with sentence casing and zero ampersands.
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
    "womens-health": {
      title: "Sănătatea femeii și controalele ginecologice",
      recommendation:
        "Cum înțelegi durerile menstruale sau pelvine, infecțiile urinare și când să mergi la ginecolog.",
    },
    "preventive-screening": {
      title: "Controale preventive și verificarea sânilor",
      recommendation:
        "Ce controale gratuite și ecografii te ajută să depistezi din timp schimbările din corp.",
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
    "womens-health": {
      title: "Women's health and pelvic care",
      recommendation:
        "What period pain, pelvic aches, urinary burning, and breast changes can mean and when to see a doctor.",
    },
    "preventive-screening": {
      title: "Preventive check-ups and breast screening",
      recommendation:
        "Which routine screenings and breast checks catch changes early and safely.",
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
    "womens-health": {
      title: "Shëndeti i gruas dhe kujdesi pelvik",
      recommendation:
        "Çfarë mund të tregojnë dhimbjet e ciklit, dhimbjet pelvike ose djegia gjatë urinimit dhe kur duhet të shkosh te mjeku.",
    },
    "preventive-screening": {
      title: "Kontrollet parandaluese dhe kontrolli i gjirit",
      recommendation:
        "Cilat kontrolle të rregullta dhe ekografi ndihmojnë për t'i kapur ndryshimet herët.",
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
    "womens-health": {
      title: "Salute della donna e benessere pelvico",
      recommendation:
        "Cosa possono indicare dolori mestruali, dolori pelvici o bruciore urinario e quando consultare il medico.",
    },
    "preventive-screening": {
      title: "Controlli preventivi ed esame del seno",
      recommendation:
        "Quali visite ed ecografie aiutano a individuare presto e in sicurezza eventuali cambiamenti.",
    },
  },
  hr: {
    "heart-health": {
      title: "Zdravlje srca i krvni tlak",
      recommendation:
        "Kako prepoznati znakove uzbune za srce i držati krvni tlak pod kontrolom.",
    },
    "healthy-eating": {
      title: "Zdrava prehrana i probava",
      recommendation:
        "Koje namirnice umiruju želudac i kako spriječiti žgaravicu.",
    },
    "antibiotics-awareness": {
      title: "Prehlada, gripa i pravilna primjena antibiotika",
      recommendation:
        "Zašto antibiotici ne liječe viruse i kako sigurno sniziti vrućicu.",
    },
    "mental-wellbeing": {
      title: "Upravljanje stresom i tenzijske glavobolje",
      recommendation:
        "Kako stres i manjak sna izazivaju glavobolje i kako ih spriječiti.",
    },
    "healthy-habits-back": {
      title: "Pravilno držanje, kralježnica i kretanje",
      recommendation:
        "Jednostavne petominutne vježbe za bolove u leđima i križima.",
    },
    "healthy-habits-joints": {
      title: "Svakodnevno kretanje i zdravlje zglobova",
      recommendation:
        "Kako zaštititi zglobove i potaknuti cirkulaciju u šakama i stopalima.",
    },
    "womens-health": {
      title: "Zdravlje žena i njega zdjelice",
      recommendation:
        "Što mogu značiti menstrualni grčevi, bol u zdjelici ili peckanje pri mokrenju i kada se javiti liječniku.",
    },
    "preventive-screening": {
      title: "Preventivni pregledi i pregled dojki",
      recommendation:
        "Koji redoviti pregledi i ultrazvuk pomažu rano i sigurno otkriti promjene.",
    },
  },
  rom: {
    "heart-health": {
      title: "Sastipen e ilesko thaj tensia e rateski",
      recommendation:
        "Sar te prindzares le znakoja vash dar ko ilo thaj te inkres i tensia telal kontrola.",
    },
    "healthy-eating": {
      title: "Sasto xabem thaj lokho ogi",
      recommendation:
        "Savo xabem kovljarel o ogi thaj sar te astarghos o phabarimos.",
    },
    "antibiotics-awareness": {
      title: "Shil, gripa thaj sar te les antibiotikura mishto",
      recommendation:
        "Soske le antibiotikura na sastjaren virusura thaj sar te huljaves o tatipen sigurime.",
    },
    "mental-wellbeing": {
      title: "Streso thaj dukh and-o shero",
      recommendation:
        "Sar o streso thaj o tikno soven anen dukh and-o shero thaj sar te arakhes tut.",
    },
    "healthy-habits-back": {
      title: "Lacho beshimos, o dumo thaj o phirimos",
      recommendation:
        "Lokhe 5-minutonge mishkimata vash dukh and-o dumo.",
    },
    "healthy-habits-joints": {
      title: "Divesko phirimos thaj sastipen le klichengo",
      recommendation:
        "Sar te arakhes chire klichura thaj te azhutines o rat te phirel and-e vast thaj punre.",
    },
    "womens-health": {
      title: "Sastipen le dzhuvljango thaj griza vash o pelviso",
      recommendation:
        "So shaj znachinen le chonutne dukha, dukh telal and-o por vaj phabarimos thaj kana te dzhas ko doktori.",
    },
    "preventive-screening": {
      title: "Anglune kontrole thaj kontrola e chuchangi",
      recommendation:
        "Save kontrole azhutinen te dikhes sigo thaj sigurime varesave paruvimata and-o trupo.",
    },
  },
};

export function getTopicForSymptom(
  partId: string,
  symptomId?: string,
  lang: Lang = "ro"
): TopicMapping {
  const loc = TOPIC_TRANSLATIONS[lang] ?? TOPIC_TRANSLATIONS.ro;

  if (symptomId === "chest_breast_lump") {
    const data = loc["preventive-screening"];
    return {
      slug: "preventive-screening",
      title: data.title,
      recommendation: data.recommendation,
    };
  }

  if (partId === "pelvis" || symptomId === "chest_breast_pain") {
    const data = loc["womens-health"];
    return {
      slug: "womens-health",
      title: data.title,
      recommendation: data.recommendation,
    };
  }

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
        slug: "preventive-screening",
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
      slug: "physical-activity",
      title: data.title,
      recommendation: data.recommendation,
    };
  }

  // arm or leg
  const data = loc["healthy-habits-joints"];
  return {
    slug: "physical-activity",
    title: data.title,
    recommendation: data.recommendation,
  };
}
