import type { Lang } from "./translations";
import type { HealthContentLang } from "./health-content-language";
import type { AreaGroup } from "@/lib/data/informedhealth-directory";

type DirectoryCopy = {
  jump: string; title: string; intro: string; source: string; languageNote: string;
  search: string; group: string; all: string; groups: Record<AreaGroup, string>;
  results: (count: number) => string; showAll: string; showLess: string; empty: string; clear: string;
};

const translatedCopy: Record<HealthContentLang, DirectoryCopy> = {
  en: {
    jump: "Explore more health topics", title: "Health topics, explained simply",
    intro: "Read original RediHealth overviews about conditions, the human body, tests and treatment choices.",
    source: "RediHealth summaries · Further reading: InformedHealth.org / IQWiG",
    languageNote: "Read each summary here in your selected language. A link to the original source is at the bottom. Topics about health services in Germany are identified as such.",
    search: "Search these topics", group: "Topic group", all: "All topics",
    groups: { conditions: "Health and conditions", services: "Health services", body: "The human body", treatments: "Tests and treatments", evidence: "Research and decisions" },
    results: count => `Topics found: ${count}`, showAll: "Show all matching topics", showLess: "Show fewer topics",
    empty: "No topics found. Try another word or group.", clear: "Clear search and filters",
  },
  ro: {
    jump: "Explorează mai multe subiecte de sănătate", title: "Subiecte de sănătate, pe înțelesul tău",
    intro: "Citește rezumate originale RediHealth despre boli, corpul uman, analize și opțiuni de tratament.",
    source: "Rezumate RediHealth · Lecturi suplimentare: InformedHealth.org / IQWiG",
    languageNote: "Citești fiecare rezumat aici, în limba aleasă. La final găsești linkul către sursa originală. Subiectele despre servicii medicale din Germania sunt marcate ca atare.",
    search: "Caută în aceste subiecte", group: "Grup de subiecte", all: "Toate subiectele",
    groups: { conditions: "Sănătate și afecțiuni", services: "Servicii medicale", body: "Corpul uman", treatments: "Analize și tratamente", evidence: "Cercetare și decizii" },
    results: count => `Subiecte găsite: ${count}`, showAll: "Arată toate subiectele găsite", showLess: "Arată mai puține subiecte",
    empty: "Nu am găsit subiecte. Încearcă alt cuvânt sau alt grup.", clear: "Șterge căutarea și filtrele",
  },
  sq: {
    jump: "Eksploro më shumë tema shëndetësore", title: "Tema shëndetësore të shpjeguara thjesht",
    intro: "Lexo përmbledhje origjinale të RediHealth për sëmundjet, trupin e njeriut, analizat dhe mundësitë e trajtimit.",
    source: "Përmbledhje RediHealth · Lexime të mëtejshme: InformedHealth.org / IQWiG",
    languageNote: "Lexoje çdo përmbledhje këtu në gjuhën e zgjedhur. Në fund gjen lidhjen me burimin origjinal. Temat për shërbimet shëndetësore në Gjermani janë shënuar si të tilla.",
    search: "Kërko në këto tema", group: "Grupi i temave", all: "Të gjitha temat",
    groups: { conditions: "Shëndeti dhe sëmundjet", services: "Shërbimet shëndetësore", body: "Trupi i njeriut", treatments: "Analizat dhe trajtimet", evidence: "Kërkimi dhe vendimmarrja" },
    results: count => `Tema të gjetura: ${count}`, showAll: "Shfaq të gjitha temat e gjetura", showLess: "Shfaq më pak tema",
    empty: "Nuk u gjetën tema. Provo një fjalë ose grup tjetër.", clear: "Pastro kërkimin dhe filtrat",
  },
  it: {
    jump: "Esplora altri argomenti sulla salute", title: "Argomenti sulla salute spiegati con semplicità",
    intro: "Leggi le sintesi originali di RediHealth su malattie, corpo umano, esami e scelte terapeutiche.",
    source: "Sintesi RediHealth · Approfondimenti: InformedHealth.org / IQWiG",
    languageNote: "Leggi ogni sintesi qui nella lingua scelta. Il link alla fonte originale si trova in fondo. Gli argomenti sui servizi sanitari in Germania sono indicati come tali.",
    search: "Cerca in questi argomenti", group: "Gruppo di argomenti", all: "Tutti gli argomenti",
    groups: { conditions: "Salute e malattie", services: "Servizi sanitari", body: "Il corpo umano", treatments: "Esami e trattamenti", evidence: "Ricerca e decisioni" },
    results: count => `Argomenti trovati: ${count}`, showAll: "Mostra tutti gli argomenti trovati", showLess: "Mostra meno argomenti",
    empty: "Nessun argomento trovato. Prova un'altra parola o un altro gruppo.", clear: "Cancella ricerca e filtri",
  },
  ru: {
    jump: "Другие темы о здоровье", title: "О здоровье простыми словами",
    intro: "Читайте оригинальные обзоры RediHealth о заболеваниях, организме человека, обследованиях и вариантах лечения.",
    source: "Обзоры RediHealth · Дополнительные материалы: InformedHealth.org / IQWiG",
    languageNote: "Читайте каждый обзор здесь на выбранном языке. Ссылка на исходный материал находится внизу. Темы о медицинских услугах в Германии отмечены отдельно.",
    search: "Поиск по этим темам", group: "Группа тем", all: "Все темы",
    groups: { conditions: "Здоровье и заболевания", services: "Медицинские услуги", body: "Организм человека", treatments: "Обследования и лечение", evidence: "Исследования и решения" },
    results: count => `Найдено тем: ${count}`, showAll: "Показать все найденные темы", showLess: "Показать меньше тем",
    empty: "Темы не найдены. Попробуйте другое слово или группу.", clear: "Очистить поиск и фильтры",
  },
};

// New site languages use clearly identified English library content until translated.
export const informedHealthCopy: Record<Lang, DirectoryCopy> = {...translatedCopy, hr: translatedCopy.en, rom: translatedCopy.en};
