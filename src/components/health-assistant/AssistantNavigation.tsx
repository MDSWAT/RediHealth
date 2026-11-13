"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActivityIcon, FileTextIcon, MessageDotsIcon, PinIcon } from "@/components/ui/icons";
import { findHelpLinks } from "@/lib/i18n/find-help-links";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG, stripLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

export function AssistantNavigation() {
  const { lang } = useLanguage();
  const pathname = usePathname();
  const normalizedPathname = stripLangFromPathname(pathname);

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
    <nav
      aria-label={t.navLabel}
      className="mb-4 flex items-center gap-1 overflow-x-auto border-b border-stone-200/80 scrollbar-none sm:mb-5 sm:gap-1.5 dark:border-stone-800"
    >
      {items.map(({ href, label, Icon }) => {
        const isActive =
          normalizedPathname === href || normalizedPathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={withLangPrefix(href, lang)}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm leading-tight transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] sm:px-4 ${
              isActive
                ? "border-sapphire font-semibold text-foreground"
                : "border-transparent font-medium text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 ${isActive ? "text-sapphire" : "text-muted-foreground"}`}
              aria-hidden="true"
            />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}