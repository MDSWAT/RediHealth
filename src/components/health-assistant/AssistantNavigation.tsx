"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActivityIcon, FileTextIcon, MessageDotsIcon, PinIcon } from "@/components/ui/icons";
import { findHelpLinks } from "@/lib/i18n/find-help-links";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG, stripLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";

export function AssistantNavigation() {
  const { lang } = useLanguage();
  const pathname = usePathname();
  const normalizedPathname = stripLangFromPathname(pathname);

  const dict = {
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
  };
  const t = dict[lang as keyof typeof dict] || dict[DEFAULT_LANG];

  const items = [
    { href: "/health-assistant", label: t.assistant, Icon: MessageDotsIcon },
    { href: "/health-check", label: t.symptoms, Icon: ActivityIcon },
    { href: "/prescription-review", label: t.prescription, Icon: FileTextIcon },
    // Opens the map of pharmacies, practices and hospitals: often the first stop before a doctor.
    { href: "/find-help", label: findHelpLinks(lang).nav, Icon: PinIcon },
  ];

  return (
    <nav aria-label={t.navLabel} className="mb-2 grid grid-cols-4 border-b border-border sm:mb-6 sm:flex sm:gap-1 sm:overflow-x-auto scrollbar-none">
      {items.map(({ href, label, Icon }) => {
        const isActive = normalizedPathname === href;
        return (
          <Link
            key={href}
            href={withLangPrefix(href, lang)}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex min-h-[44px] items-center justify-center gap-2 border-b-2 px-1 py-2 text-center text-[13px] font-semibold sm:text-sm leading-tight transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] rounded-none sm:flex-shrink-0 sm:justify-start sm:px-4 sm:text-left ${
              isActive
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            <Icon className="hidden h-4 w-4 shrink-0 sm:block" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}