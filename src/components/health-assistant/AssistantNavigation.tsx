"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { CAPSULE_TABS, capsuleTab } from "@/components/layout/chrome-capsule";
import { CapsuleGlidePlate, useCapsuleGlide } from "@/components/layout/CapsuleGlide";
import { ActivityIcon, FileTextIcon, MessageDotsIcon, PinIcon } from "@/components/ui/icons";
import { findHelpLinks } from "@/lib/i18n/find-help-links";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG, stripLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

export function AssistantNavigation() {
  const { lang } = useLanguage();
  const pathname = usePathname();
  const normalizedPathname = stripLangFromPathname(pathname);
  const { trackRef, plateRef } = useCapsuleGlide<HTMLDivElement>();

  // On narrow phones the menu scrolls sideways: bring the current tool into view without moving the page.
  useEffect(() => {
    const track = trackRef.current;
    const current = track?.querySelector<HTMLElement>("[aria-current]");
    if (!track || !current) return;
    const overflowRight = current.offsetLeft + current.offsetWidth - track.clientWidth + 4;
    if (overflowRight > 0) track.scrollLeft = overflowRight;
  }, [normalizedPathname, trackRef]);

  const dict: Record<Lang, { navLabel: string; assistant: string; symptoms: string; prescription: string }> = {
ru: {
      navLabel: "Разделы медицинских работников",
      assistant: "Помощник по здоровью",
      symptoms: "Проверка симптомов",
      prescription: "Обзор рецепта",
    },

    en: {
      navLabel: "Health assistant sections",
      assistant: "Health assistant",
      symptoms: "Symptom check",
      prescription: "Prescription review",
    },
    ro: {
      navLabel: "Secțiunile asistentului",
      assistant: "Asistent medical",
      symptoms: "Verificare simptome",
      prescription: "Verificarea rețetei",
    },
    sq: {
      navLabel: "Pjesët e asistentit",
      assistant: "Asistenti mjekësor",
      symptoms: "Kontrolli i simptomave",
      prescription: "Verifikimi i recetës",
    },
    it: {
      navLabel: "Sezioni dell'assistente",
      assistant: "Assistente medico",
      symptoms: "Controllo sintomi",
      prescription: "Revisione ricetta",
    },
    hr: {
      navLabel: "Odjeljci zdravstvenog asistenta",
      assistant: "Zdravstveni asistent",
      symptoms: "Provjera simptoma",
      prescription: "Provjera recepta",
    },
    rom: {
      navLabel: "Riga le sastipnaske azhutitoreske",
      assistant: "Sastipnasko azhutitori",
      symptoms: "Dikh chire simptome",
      prescription: "Dikh i receta",
    },
  };
  const t = dict[lang] || dict[DEFAULT_LANG];

  const items = [
    { href: "/health-assistant", label: t.assistant, Icon: MessageDotsIcon },
    { href: "/health-check", label: t.symptoms, Icon: ActivityIcon },
    { href: "/prescription-review", label: t.prescription, Icon: FileTextIcon },
    // Opens the map of pharmacies, practices and hospitals: often the first stop before a doctor.
    { href: "/find-help", label: findHelpLinks(lang).nav, Icon: PinIcon },
  ];

  return (
    // The wrapper keeps the capsule its own width and lets it scroll sideways on narrow phones.
    <nav aria-label={t.navLabel} className="mb-4 flex sm:mb-5">
      <div ref={trackRef} className={CAPSULE_TABS}>
        <CapsuleGlidePlate plateRef={plateRef} />
        {items.map(({ href, label, Icon }) => {
          const isActive = normalizedPathname === href || normalizedPathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={withLangPrefix(href, lang)}
              aria-current={isActive ? "page" : undefined}
              data-capsule-item=""
              className={capsuleTab(isActive)}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${isActive ? "text-sapphire dark:text-sapphire-border" : "opacity-70"}`}
                aria-hidden="true"
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
