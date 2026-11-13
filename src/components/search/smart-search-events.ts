export const SMART_SEARCH_OPEN_EVENT = "redihealth:open-smart-search";

export interface SmartSearchOpenDetail {
  query?: string;
}

export function openSmartSearch(initialQuery?: string): void {
  if (typeof window === "undefined") return;
  const detail: SmartSearchOpenDetail = initialQuery !== undefined ? { query: initialQuery } : {};
  window.dispatchEvent(new CustomEvent<SmartSearchOpenDetail>(SMART_SEARCH_OPEN_EVENT, { detail }));
}
