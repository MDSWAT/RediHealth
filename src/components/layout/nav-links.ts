import type { ComponentType, SVGProps } from "react";
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
