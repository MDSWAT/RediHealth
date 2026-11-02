import type { Metadata } from "next";
import { getRequestLang } from "@/lib/i18n/server-routing";
import type { Lang } from "@/lib/i18n/translations";

const romanianPageTitles = {
  about: "Despre RediHealth",
  accessibility: "Accesibilitate - RediHealth",
  contact: "Contact - RediHealth",
  demo: "Demonstrație - RediHealth",
  "health-check": "Evaluare de sănătate - RediHealth",
  "health-assistant": "Asistent medical - RediHealth",
  "find-help": "Găsește ajutor medical - RediHealth",
  "get-help": "Solicită ajutorul medicului - RediHealth",
  privacy: "Politica de confidențialitate - RediHealth",
  "prescription-review": "Verificarea rețetei - RediHealth",
  "report-issue": "Raportează o problemă - RediHealth",
  "sign-in": "Autentificare - RediHealth",
  "patient-portal": "Portalul pacientului - RediHealth",
  terms: "Termeni de utilizare - RediHealth",
  calendar: "Calendar - Panou RediHealth",
  institutes: "Instituții medicale - Panou RediHealth",
  logs: "Jurnal de activitate - Panou RediHealth",
  meet: "Întâlniri - Panou RediHealth",
  panel: "Panou de lucru - RediHealth",
  patients: "Pacienți - Panou RediHealth",
  "patient-profile": "Profilul pacientului - Panou RediHealth",
  "follow-up-meeting": "Întâlnire de urmărire - Panou RediHealth",
  settings: "Setări - Panou RediHealth",
  workers: "Personal - Panou RediHealth",
} as const;

export type PageMetadataKey = keyof typeof romanianPageTitles;

export function localizedPageTitle(lang: Lang, key: PageMetadataKey, fallback: string): string {
  return lang === "ro" ? romanianPageTitles[key] : fallback;
}

export function createPageMetadata(
  key: PageMetadataKey,
  title: string,
  description: string,
  extra: Metadata = {},
): () => Promise<Metadata> {
  return async () => ({
    ...extra,
    title: localizedPageTitle(await getRequestLang(), key, title),
    ...(description ? { description } : {}),
  });
}
