import type { ComponentType, SVGProps } from "react";
import type { Lang } from "@/lib/i18n/translations";
import {
  BellIcon,
  BookIcon,
  ClipboardCheckIcon,
  PinIcon,
  StethoscopeIcon,
  UsersIcon,
} from "@/components/ui/icons";

export type NavIcon = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * The one glyph for each destination, keyed by its unprefixed path. The header, the phone menu
 * and the home page read this map, so a destination looks the same wherever it is offered.
 */
export const NAV_LINK_ICONS = {
  "/health-information": BookIcon,
  "/health-assistant": ClipboardCheckIcon,
  "/find-help": PinIcon,
  "/medic-online": StethoscopeIcon,
  "/stiri": BellIcon,
  "/mediatori": UsersIcon,
} as const satisfies Record<string, NavIcon>;

export type NavLinkHref = keyof typeof NAV_LINK_ICONS;

/**
 * One-word names for the desktop bar, where six destinations share a row with the utilities.
 * The phone menu, footer and page titles keep the full names; the bar's links carry the full
 * name as their tooltip and their description for screen readers.
 */
export const NAV_SHORT_LABELS: Record<Lang, Record<NavLinkHref, string>> = {
  ro: {
    "/health-information": "Ghiduri",
    "/health-assistant": "Asistent",
    "/find-help": "Farmacii",
    "/medic-online": "Medic",
    "/stiri": "Știri",
    "/mediatori": "Mediatori",
  },
  en: {
    "/health-information": "Guides",
    "/health-assistant": "Assistant",
    "/find-help": "Pharmacies",
    "/medic-online": "Doctor",
    "/stiri": "News",
    "/mediatori": "Mediators",
  },
  sq: {
    "/health-information": "Udhëzues",
    "/health-assistant": "Asistent",
    "/find-help": "Farmaci",
    "/medic-online": "Mjek",
    "/stiri": "Lajme",
    "/mediatori": "Mediatorë",
  },
  it: {
    "/health-information": "Guide",
    "/health-assistant": "Assistente",
    "/find-help": "Farmacie",
    "/medic-online": "Medico",
    "/stiri": "Notizie",
    "/mediatori": "Mediatori",
  },
  hr: {
    "/health-information": "Vodiči",
    "/health-assistant": "Asistent",
    "/find-help": "Ljekarne",
    "/medic-online": "Liječnik",
    "/stiri": "Vijesti",
    "/mediatori": "Medijatori",
  },
  rom: {
    "/health-information": "Sikavimata",
    "/health-assistant": "Azhutitori",
    "/find-help": "Farmaciye",
    "/medic-online": "Doktori",
    "/stiri": "Nevimata",
    "/mediatori": "Mediatorya",
  },
  ru: {
    "/health-information": "Справочник",
    "/health-assistant": "Помощник",
    "/find-help": "Аптеки",
    "/medic-online": "Врач",
    "/stiri": "Новости",
    "/mediatori": "Медиаторы",
  },
};

/**
 * On wide screens (2xl and up) the bar has room to say more, so the four names that are unclear
 * as a single word get a second one. The assistant, pharmacies and mediators use their full
 * names; the doctor link says it is online, which its full name ("Talk to a doctor") does not.
 * Guides and news stay one word: they are already clear.
 */
export const NAV_FULL_NAME_ON_WIDE: readonly NavLinkHref[] = ["/health-assistant", "/find-help", "/mediatori"];

export const NAV_ONLINE_DOCTOR_LABEL: Record<Lang, string> = {
  ro: "Medic online",
  en: "Online doctor",
  sq: "Mjek online",
  it: "Medico online",
  hr: "Liječnik online",
  rom: "Doktori online",
  ru: "Врач онлайн",
};
