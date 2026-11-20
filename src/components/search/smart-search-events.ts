import type { Lang } from "@/lib/i18n/languages";

export const SMART_SEARCH_OPEN_EVENT = "redihealth:open-smart-search";
export const SMART_SEARCH_WARM_EVENT = "redihealth:warm-smart-search";

export interface SmartSearchOpenDetail {
  query?: string;
}

export function openSmartSearch(initialQuery?: string): void {
  if (typeof window === "undefined") return;
  const detail: SmartSearchOpenDetail = initialQuery !== undefined ? { query: initialQuery } : {};
  window.dispatchEvent(new CustomEvent<SmartSearchOpenDetail>(SMART_SEARCH_OPEN_EVENT, { detail }));
}

export function preloadSmartSearch(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SMART_SEARCH_WARM_EVENT));
}

/**
 * The few search strings that must be in the main bundle: the header trigger, and the two lines the
 * search sheet shows before its own (lazy) copy has arrived or when a request fails.
 */
export type SmartSearchTriggerCopy = {
  triggerLabel: string;
  triggerPlaceholder: string;
  /** Shown while results are on their way. */
  searching: string;
  /** Shown when the search request (or the search sheet itself) could not be loaded. */
  failed: string;
};

const TRIGGER_COPY: Record<Lang, SmartSearchTriggerCopy> = {
  ro: {
    triggerLabel: "Caută",
    triggerPlaceholder: "Caută simptome sau ghiduri",
    searching: "Se caută…",
    failed: "Căutarea nu merge acum. Verifică internetul și încearcă din nou.",
  },
  en: {
    triggerLabel: "Search",
    triggerPlaceholder: "Search symptoms or guides",
    searching: "Searching…",
    failed: "Search is not working right now. Check your internet and try again.",
  },
  sq: {
    triggerLabel: "Kërko",
    triggerPlaceholder: "Kërko simptoma ose udhëzues",
    searching: "Duke kërkuar…",
    failed: "Kërkimi nuk punon tani. Kontrollo internetin dhe provo përsëri.",
  },
  it: {
    triggerLabel: "Cerca",
    triggerPlaceholder: "Cerca sintomi o guide",
    searching: "Ricerca in corso…",
    failed: "La ricerca non funziona in questo momento. Controlla internet e riprova.",
  },
  hr: {
    triggerLabel: "Pretraži",
    triggerPlaceholder: "Pretraži simptome ili vodiče",
    searching: "Pretražujem…",
    failed: "Pretraga trenutno ne radi. Provjeri internet i pokušaj ponovno.",
  },
  rom: {
    triggerLabel: "Rod",
    triggerPlaceholder: "Rod simptome vaj sikavimata",
    searching: "Rodas…",
    failed: "O rodipe na kerel buchi akana. Dikh o interneto thaj zumav pale.",
  },
  ru: {
    triggerLabel: "Поиск",
    triggerPlaceholder: "Поиск симптомов и гидов",
    searching: "Идёт поиск…",
    failed: "Поиск сейчас не работает. Проверьте интернет и попробуйте ещё раз.",
  },
};

export function getSmartSearchTriggerCopy(lang: Lang): SmartSearchTriggerCopy {
  return TRIGGER_COPY[lang] ?? TRIGGER_COPY.ro;
}
