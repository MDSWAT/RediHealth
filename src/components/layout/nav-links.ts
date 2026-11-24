import type { ComponentType, SVGProps } from "react";
import type { Lang } from "@/lib/i18n/translations";
import {
  BellIcon,
  BookIcon,
  ClipboardCheckIcon,
  PinIcon,
  PrescriptionIcon,
  UsersIcon,
} from "@/components/ui/icons";

export type NavIcon = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * The one glyph for each top-level destination, keyed by its unprefixed path.
 * The header and the mobile drawer share this map.
 */
export const NAV_LINK_ICONS = {
  "/health-information": BookIcon,
  "/health-check": ClipboardCheckIcon,
  "/prescription-review": PrescriptionIcon,
  "/find-help": PinIcon,
  "/mediatori": UsersIcon,
  "/stiri": BellIcon,
} as const satisfies Record<string, NavIcon>;

export type NavLinkHref = keyof typeof NAV_LINK_ICONS;

/**
 * Compact names for the desktop bar between lg (1024px) and 2xl (1536px), where six
 * destinations share a row with the utility capsule. From 2xl up and inside the mobile
 * drawer, every link displays its full descriptive label and subtitle.
 */
export const NAV_SHORT_LABELS: Record<Lang, Record<NavLinkHref, string>> = {
  ro: {
    "/health-information": "Învață",
    "/health-check": "Simptome",
    "/prescription-review": "Medicamente",
    "/find-help": "Farmacii",
    "/mediatori": "Mediatori",
    "/stiri": "Știri",
  },
  en: {
    "/health-information": "Learn",
    "/health-check": "Symptoms",
    "/prescription-review": "Medicines",
    "/find-help": "Pharmacies",
    "/mediatori": "Mediators",
    "/stiri": "News",
  },
  sq: {
    "/health-information": "Mëso",
    "/health-check": "Simptomat",
    "/prescription-review": "Ilaçet",
    "/find-help": "Farmaci",
    "/mediatori": "Mediatorë",
    "/stiri": "Lajme",
  },
  it: {
    "/health-information": "Impara",
    "/health-check": "Sintomi",
    "/prescription-review": "Farmaci",
    "/find-help": "Farmacie",
    "/mediatori": "Mediatori",
    "/stiri": "Notizie",
  },
  hr: {
    "/health-information": "Uči",
    "/health-check": "Simptomi",
    "/prescription-review": "Lijekovi",
    "/find-help": "Ljekarne",
    "/mediatori": "Medijatori",
    "/stiri": "Vijesti",
  },
  rom: {
    "/health-information": "Sikljov",
    "/health-check": "Simptome",
    "/prescription-review": "Draba",
    "/find-help": "Farmaciye",
    "/mediatori": "Mediatorya",
    "/stiri": "Nevimata",
  },
  ru: {
    "/health-information": "Обучение",
    "/health-check": "Симптомы",
    "/prescription-review": "Лекарства",
    "/find-help": "Аптеки",
    "/mediatori": "Медиаторы",
    "/stiri": "Новости",
  },
};

/**
 * On wide screens (2xl and up) all six destinations display their full descriptive label.
 */
export const NAV_FULL_NAME_ON_WIDE: readonly NavLinkHref[] = [
  "/health-information",
  "/health-check",
  "/prescription-review",
  "/find-help",
  "/mediatori",
  "/stiri",
];
