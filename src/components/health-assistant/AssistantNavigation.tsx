"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActivityIcon, FileTextIcon, PinIcon } from "@/components/ui/icons";
import { findHelpLinks } from "@/lib/i18n/find-help-links";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG, stripLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";

// Dedicated conversational guidance icon (bx-conversation) to avoid duplicate medical crosses
function GuidanceChatIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable={false}
      {...props}
    >
      <path d="M12 2C6.486 2 2 5.589 2 10c0 2.908 1.897 5.516 5 6.934V22l5.34-4.004C19.713 17.532 22 14.075 22 10c0-4.411-4.486-8-10-8zm0 14h-.333L8 18.749V16.03l-.707-.293C4.854 14.729 4 12.518 4 10c0-3.309 3.589-6 8-6s8 2.691 8 6-3.589 6-8 6z" />
      <circle cx="8" cy="10" r="1.5" />
      <circle cx="12" cy="10" r="1.5" />
      <circle cx="16" cy="10" r="1.5" />
    </svg>
  );
}

export function AssistantNavigation() {
  const { lang } = useLanguage();
  const pathname = usePathname();
  const normalizedPathname = stripLangFromPathname(pathname);

  const dict = {
    en: {
      navLabel: "Health assistant sections",
      assistant: "Health assistant",
      symptoms: "Symptom check",
      prescription: "Prescription analysis",
    },
    ro: {
      navLabel: "Secțiunile asistentului",
      assistant: "Asistent medical",
      symptoms: "Verificare simptome",
      prescription: "Analiza rețetei",
    },
    sq: {
      navLabel: "Pjesët e asistentit",
      assistant: "Asistent mjekësor",
      symptoms: "Kontrolli i simptomave",
      prescription: "Analiza e recetës",
    },
    it: {
      navLabel: "Sezioni dell'assistente",
      assistant: "Assistente medico",
      symptoms: "Controllo sintomi",
      prescription: "Analisi della ricetta",
    },
  };
  const t = dict[lang as keyof typeof dict] || dict[DEFAULT_LANG];

  const items = [
    { href: "/health-assistant", label: t.assistant, Icon: GuidanceChatIcon },
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
            className={`inline-flex min-h-[44px] items-center justify-center gap-2 border-b-2 px-1 py-2 text-center text-[13px] font-semibold sm:text-sm leading-tight transition-colors rounded-none sm:flex-shrink-0 sm:justify-start sm:px-4 sm:text-left ${
              isActive
                ? "border-primary text-primary"
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