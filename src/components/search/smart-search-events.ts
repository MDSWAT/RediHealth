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

const TRIGGER_COPY: Record<Lang, { triggerLabel: string; triggerPlaceholder: string }> = {
  ro: {
    triggerLabel: "Caută",
    triggerPlaceholder: "Caută simptome sau ghiduri",
  },
  en: {
    triggerLabel: "Search",
    triggerPlaceholder: "Search symptoms or guides",
  },
  sq: {
    triggerLabel: "Kërko",
    triggerPlaceholder: "Kërko simptoma ose udhëzues",
  },
  it: {
    triggerLabel: "Cerca",
    triggerPlaceholder: "Cerca sintomi o guide",
  },
  hr: {
    triggerLabel: "Pretraži",
    triggerPlaceholder: "Pretraži simptome ili vodiče",
  },
  rom: {
    triggerLabel: "Rod",
    triggerPlaceholder: "Rod simptome vaj sikavimata",
  },
  ru: {
    triggerLabel: "Поиск",
    triggerPlaceholder: "Поиск симптомов и гидов",
  },
};

export function getSmartSearchTriggerCopy(lang: Lang): {
  triggerLabel: string;
  triggerPlaceholder: string;
} {
  return TRIGGER_COPY[lang] ?? TRIGGER_COPY.ro;
}
